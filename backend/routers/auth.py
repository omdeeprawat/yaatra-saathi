from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from authlib.integrations.starlette_client import OAuth
from starlette.requests import Request 

from core.config import settings
from schemas.auth import UserResponse, TokenResponse, RegisterRequest, LoginRequest
from db.database import get_db
from core.security import create_access_token, create_refresh_token, decode_refresh_token
from core.dependencies import get_current_user, get_user_by_id
from models.user import User, AuthProvider

from typing import Optional

from services.auth_service import (
  create_user,
  authenticate_user,
  get_or_create_oauth_user
)

router = APIRouter(prefix = "/auth" , tags=["auth"])

oauth = OAuth()
oauth.register(
  name = "google",
  client_id = settings.GOOGLE_CLIENT_ID,
  client_secret = settings.GOOGLE_CLIENT_SECRET,
  server_metadata_url = "https://accounts.google.com/.well-known/openid-configuration",
  client_kwargs = {"scope" : "openid email profile"}
)

def set_refresh_cookie(response: Response, token: str):
  response.set_cookie(
    key="refresh_token",
    value=token,
    httponly=True,
    secure=False,      # set True in production with HTTPS
    samesite="lax",
    max_age=30 * 24 * 60 * 60  # 30 days in seconds
    )


@router.post("/register", response_model = TokenResponse, status_code = status.HTTP_201_CREATED)
def register(data : RegisterRequest, response: Response, db : Session = Depends(get_db)):
  """ registering a new user with email and password"""
  user = create_user(db, data)
  access_token = create_access_token({"sub" : str(user.id)})
  refresh_token = create_refresh_token({"sub" : str(user.id)})
  set_refresh_cookie(response, refresh_token)
  return TokenResponse(access_token = access_token, user = UserResponse.model_validate(user))


@router.post("/login", response_model = TokenResponse)
def login(data : LoginRequest, response : Response, db : Session = Depends(get_db)):
  """ login with email and password. a jwt token is returned"""
  user = authenticate_user(db, data.email, data.password)
  access_token = create_access_token({"sub" : str(user.id)})
  refresh_token = create_refresh_token({"sub" : str(user.id)})
  set_refresh_cookie(response, refresh_token)
  return TokenResponse(access_token = access_token, user = UserResponse.model_validate(user))


@router.post("/refresh", response_model=TokenResponse)
def refresh(response: Response, db :Session = Depends(get_db), refresh_token: Optional[str] = Cookie(default=None)):
  if not refresh_token:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail = "no refresh token")
  payload = decode_refresh_token(refresh_token)
  if not payload:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail = "invalid or expired refresh token")
  user = get_user_by_id(db, int(payload["sub"]))
  if not user or not user.is_active:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail = "user not found")

  new_access_token = create_access_token({"sub" : str(user.id)})
  new_refresh_token = create_refresh_token({"sub" : str(user.id)})
  set_refresh_cookie(response, new_refresh_token)
  
  return TokenResponse(access_token=new_access_token, user= UserResponse.model_validate(user))


@router.post("/logout")
def logout(response : Response):
  response.delete_cookie("refresh_token")
  return {
    "message" : "logged out successful"
  }

  
@router.get("/me", response_model=UserResponse)
def get_me(current_user : User = Depends(get_current_user)):
  return current_user


## google OAuth

@router.get("/google")
async def google_login(request : Request):
  """ Redirecting to the google consent screen """
  print("GOOGLE_REDIRECT_URI:", settings.GOOGLE_REDIRECT_URI)
  if not settings.GOOGLE_CLIENT_ID:
    raise HTTPException(
      status_code = status.HTTP_501_NOT_IMPLEMENTED,
      detail = "google oauth is not configured"
    )
  try:
    response = await oauth.google.authorize_redirect(request, settings.GOOGLE_REDIRECT_URI)
    return response
    
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))


@router.get("/google/callback")
async def google_callback(request : Request, db : Session = Depends(get_db)):
  """
  google redirects here after user approves.
  exchange the code for user info, create/find the user,
  issue a JWT and redirect back to the frontend
  """
  try:
    token = await oauth.google.authorize_access_token(request)
  except Exception:
    raise HTTPException(
      status_code = status.HTTP_400_BAD_REQUEST,
      detail = "google oauth failed - invalid or expired code"
    )

  userinfo = token.get("userinfo")
  if not userinfo:
    raise HTTPException(
      status_code = status.HTTP_400_BAD_REQUEST,
      detail = "could not retrieve user info from the google"
    )

  user = get_or_create_oauth_user(
    db = db,
    email = userinfo["email"],
    full_name = userinfo.get("name", ""),
    avatar_url=userinfo.get("picture"),
    provider = AuthProvider.google
  )

  jwt_token = create_access_token({"sub" : str(user.id)})

  # Redirect to frontend with token in URL fragment
  # Frontend reads it from the URL and stores in localStorage
  frontend_url = f"http://localhost:5173/auth/callback?token={jwt_token}"
  return RedirectResponse(url=frontend_url)