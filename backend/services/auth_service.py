from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from models.user import User, AuthProvider
from core.security import get_password_hash, verify_password
from schemas.auth import RegisterRequest

from core.config import settings
import redis
import secrets
from datetime import datetime, timedelta
from tasks.email_tasks import send_otp_email, send_welcome_email
from db.database import SessionLocal


redis_client = redis.from_url(settings.REDIS_URL)


def get_user_by_email(db:Session, email : str) -> User | None:
  return db.query(User).filter(User.email == email).first()


def get_user_by_id(db:Session, user_id : int) -> User | None :
  return db.query(User).filter(User.id == user_id).first()


def create_user(db : Session, data : RegisterRequest) -> User:
  existing = get_user_by_email(db, data.email)
  if existing:
    raise HTTPException(
      status_code = status.HTTP_400_BAD_REQUEST,
      detail = "an account with this email already exists"
    )

  user = User(
    email = data.email,
    full_name = data.full_name,
    hashed_password = get_password_hash(data.password),
    auth_provider = AuthProvider.email,
    is_active = True
  )

  db.add(user)
  db.commit()
  db.refresh(user)
  return user


def authenticate_user(db : Session, email : str, password : str) -> User:
  user = get_user_by_email(db, email)

  if not user:
    raise HTTPException(
      status_code = status.HTTP_401_UNAUTHORIZED,
      detail = "invalid email or password"
    )

  if user.auth_provider != AuthProvider.email:
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"This account uses {user.auth_provider} login. Please sign in with Google.",
      )

  if not verify_password(password, user.hashed_password):
    raise HTTPException(
      status_code = status.HTTP_401_UNAUTHORIZED,
      detail = "invalid email or password"
    )

  if not user.is_active:
    raise HTTPException(
      status_code = status.HTTP_403_FORBIDDEN,
      detail = "your account has been deactivated"
    )

  return user


def get_or_create_oauth_user(
  db : Session,
  email : str,
  full_name : str,
  avatar_url : str | None,
  provider : AuthProvider,
) -> User:
  
  """ used by google oauth - find existing user or create a new one """

  user = get_user_by_email(db, email)
  if user:
    if avatar_url and user.avatar_url != avatar_url:
      user.avatar_url = avatar_url
      db.commit()
      db.refresh(user)
    return user

  # create new oauth user
  user = User(
    email = email,
    full_name = full_name,
    avatar_url = avatar_url,
    hashed_password = None,
    auth_provider = provider,
    is_active = True
  )
  db.add(user)
  db.commit()
  db.refresh(user)

  return user


def generate_otp()->str:
  return ''.join([str(secrets.randbelow(10)) for _ in range(6)])


def register_user_with_verification(email: str, password: str, full_name: str):
  db = SessionLocal()
  try:
    existing = db.query(User).filter(User.email == email).first()
    if existing:
      if existing.is_verified:
        raise ValueError("Email already registered")
      else:
        # resend otp for not verified 
        otp = generate_otp()
        existing.verification_token = otp
        existing.verification_expires = datetime.utcnow() + timedelta(minutes=10)
        existing.verification_attempts = 0
        db.commit()
        
        send_otp_email.delay(email, existing.full_name, otp)
        return {"user_id": existing.id, "message": "OTP resent"}
      
    # new unverified user
    otp = generate_otp()
    new_user = User(
        email=email,
      full_name=full_name,
      hashed_password=get_password_hash(password),
        is_verified=False,
        verification_token=otp,
        verification_expires=datetime.utcnow() + timedelta(minutes=10),
        verification_attempts=0,
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Send OTP email asynchronously
    send_otp_email.delay(email, full_name, otp)
    
    return {
      "user_id": new_user.id,
      "message": "Registration successful. Please check your email for OTP."
    }
  
  finally:
    db.close()


def verify_otp(user_id: int, otp: str):
  """Verify OTP and activate user"""
  db = SessionLocal()
  try:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
      raise ValueError("User not found")
    
    if user.is_verified:
      raise ValueError("Email already verified")
    
    # Check if OTP expired
    if datetime.utcnow() > user.verification_expires:
      raise ValueError("OTP expired. Please request a new one.")
    
    # Check max attempts
    if user.verification_attempts >= 3:
      raise ValueError("Too many failed attempts. Please request a new OTP.")
    
    # Verify OTP
    if user.verification_token != otp:
      user.verification_attempts += 1
      db.commit()
      raise ValueError(f"Invalid OTP. {3 - user.verification_attempts} attempts remaining.")
    
    
    user.is_verified = True
    user.verified_at = datetime.utcnow()
    user.verification_token = None
    user.verification_expires = None
    db.commit()
    
    
    send_welcome_email.delay(user.email, user.full_name)
    
    return {"success": True, "message": "Email verified successfully!"}

  finally:
    db.close()


def resend_otp(user_id: int):
  """Resend OTP with rate limiting"""
  # rate limiting check using Redis
  rate_limit_key = f"otp_resend:{user_id}"
  if redis_client.exists(rate_limit_key):
    raise ValueError("Please wait 1 minute before requesting a new OTP")
  
  db = SessionLocal()
  try:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
      raise ValueError("User not found")
    
    if user.is_verified:
      raise ValueError("Email already verified")
    
    # Generate new OTP
    otp = generate_otp()
    user.verification_token = otp
    user.verification_expires = datetime.utcnow() + timedelta(minutes=10)
    user.verification_attempts = 0
    db.commit()
    
    
    send_otp_email.delay(user.email, user.full_name, otp)
    
    # rate limit (1 minute)
    redis_client.setex(rate_limit_key, 60, "1")
    
    return {"success": True, "message": "OTP resent successfully"}

  finally:
    db.close()