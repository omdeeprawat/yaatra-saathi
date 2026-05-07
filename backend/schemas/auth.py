from pydantic import BaseModel, EmailStr, field_validator
from models.user import AuthProvider, UserRole

class RegisterRequest(BaseModel):
  email: EmailStr
  full_name : str
  password : str

  @field_validator("password")
  @classmethod
  def password_strength(cls, v: str) -> str:
    if len(v) < 8:
      raise ValueError("Password must be at least 8 characters")
    return v


  @field_validator("full_name")
  @classmethod
  def name_not_empty(cls, v: str) -> str:
    if not v.strip():
      raise ValueError("Name cannot be empty")
    return v.strip()


class LoginRequest(BaseModel):
  email : EmailStr
  password : str

class UpdateProfileRequest(BaseModel):
  full_name: str | None = None
  avatar_url: str | None = None

  @field_validator("full_name")
  @classmethod
  def name_not_empty(cls, v: str | None) -> str | None:
    if v is not None and not v.strip():
      raise ValueError("Name cannot be empty")
    return v.strip() if v else v

class TokenResponse(BaseModel):
  access_token : str
  token_type : str = "bearer"
  user : "UserResponse"

class UserResponse(BaseModel):
  id : int
  email : str
  full_name : str
  avatar_url : str | None
  is_active : bool
  auth_provider : AuthProvider
  role: UserRole

  class Config:
    from_attributes = True


# Resolve forward reference
TokenResponse.model_rebuild()