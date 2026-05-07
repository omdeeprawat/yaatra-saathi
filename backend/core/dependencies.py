from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from db.database import get_db
from core.security import decode_access_token
from services.auth_service import get_user_by_id
from models.user import User

bearer_scheme = HTTPBearer()


def get_current_user(
  credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
  db: Session = Depends(get_db),
) -> User:
  """
  Reusable dependency — add to any route that requires authentication.
  Usage: current_user: User = Depends(get_current_user)
  """
  token = credentials.credentials
  payload = decode_access_token(token)

  if payload is None:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid or expired token",
      headers={"WWW-Authenticate": "Bearer"},
    )

  user_id: int | None = payload.get("sub")
  if user_id is None:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid token payload",
    )

  user = get_user_by_id(db, int(user_id))
  if user is None:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="User no longer exists",
    )

  if not user.is_active:
    raise HTTPException(
      status_code=status.HTTP_403_FORBIDDEN,
      detail="Account is deactivated",
    )

  return user


def get_optional_user(
  db: Session = Depends(get_db),
  credentials: HTTPAuthorizationCredentials | None = Depends(
    HTTPBearer(auto_error=False)
  ),
) -> User | None:
  """
  Optional auth — returns user if token present, None if not.
  Use for public routes that behave differently when logged in.
  Usage: current_user: User | None = Depends(get_optional_user)
  """
  if not credentials:
    return None
  try:
    return get_current_user(credentials, db)
  except HTTPException:
    return None