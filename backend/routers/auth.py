from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from authlib.integrations.starlette_client import OAuth
from starlette.requests import Request 
from starlette.config import Config

from core.config import settings
from schemas.auth import UserResponse, TokenResponse, RegisterRequest, LoginRequest
from db.database import get_db
from core.security import create_access_token
from core.dependencies import get_current_user
from models.user import User

from services.auth_service import (
  create_user,
  authenticate_user,
  get_or_create_oauth_user
)

router = APIRouter(prefix = "/auth" , tags=["auth"])


starlette_config = Config(environ={
  "GOOGLE_CLIENT_ID" : settings.GOOGLE_CLIENT_ID or "",
  "GOOGLE_CLIENT_SECRET" : settings.GOOGLE_CLIENT_SECRET or ""
}
)
oauth = OAuth(starlette_config)
oauth.register(
  name = "google",
  server_metadata_url = "https://accounts.google.com/.well-known/openid-configuration",
  client_kwargs = {"scope" : "openid email profile"}
)


@router.post("/register", response_model = TokenResponse, status_code = status.HTTP_201_CREATED)
def register(data : RegisterRequest, db : Session = Depends(get_db)):
  """ registering a new user with email and password"""
  user = create_user(db, data)
  token = create_access_token({"sub" : str(user.id)})
  return TokenResponse(access_token =   token, user = UserResponse.model_validate(user))


@router.post("/login", response_model = TokenResponse)
def login(data : LoginRequest, db : Session = Depends(get_db)):
  """ login with email and password. a jwt token is returned"""
  user = authenticate_user(db, data.email, data.password)
  token = create_access_token({"sub" : str(user.id)})
  return TokenResponse(access_token = token, user = UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
def get_me(current_user : User = Depends(get_current_user)):
  return current_user


## google OAuth

@router.get("/google")
async def google_login(request : Request):
  """ Redirecting to the google consent screen """
  if not settings.GOOGLE_CLIENT_ID:
    raise HTTPException(
      status_code = status.HTTP_501_NOT_IMPLEMENTED,
      detail = "google oauth is not configured"
    )
    redirect_uri = settings.GOOGLE_REDIRECT_URI
    return await oauth.google.authorize_redirect(request, redirect_uri)


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
    procider = AuthProvider.google
  )

  jwt_token = create_access_token({"sub" : str(user.id)})

  # Redirect to frontend with token in URL fragment
  # Frontend reads it from the URL and stores in localStorage
  frontend_url = f"{settings.FRONTEND_URL}/auth/callback?token={jwt_token}"
  return RedirectResponse(url=frontend_url)