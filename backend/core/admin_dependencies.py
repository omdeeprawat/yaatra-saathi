from fastapi import Depends, HTTPException, status
from models.user import User, UserRole
from .dependencies import get_current_user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
  if current_user.role != UserRole.ADMIN:
    raise HTTPException(
      status_code=status.HTTP_403_FORBIDDEN,
      detail='admin access required'
    )
  return current_user


def get_user_with_optional_admin(
  current_user: User = Depends(get_current_user)
) -> tuple[User, bool]:

  is_admin = current_user.role == UserRole.ADMIN
  return current_user, is_admin