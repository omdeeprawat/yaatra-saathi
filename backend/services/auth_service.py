from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from models.user import User, AuthProvider
from core.security import get_password_hash, verify_password
from schemas.auth import RegisterRequest


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
  user = get_user_by_email(d, email)

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
  db.refresh()

  return user
