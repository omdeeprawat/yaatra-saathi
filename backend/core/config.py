from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
  APP_NAME: str = "Yaatra Saathi"
  DEBUG : bool = True

  DATABASE_URL : str

  # jwt
  SECRET_KEY : str
  ALGORITHM : str
  ACCESS_TOKEN_EXPIRE_MINUTES : int = 60

  # google oauth
  GOOGLE_CLIENT_ID : Optional[str] = None
  GOOGLE_CLIENT_SECRET : Optional[str] = None
  GOOGLE_REDIRECT_URI : str = 'http://localhost:8000/auth/google/callback' 

  FRONTEND_URL : str = 'http://localhost:5173'
  
  # cloudinary 
  CLOUDINARY_CLOUD_NAME: Optional[str] = None
  CLOUDINARY_API_KEY: Optional[str] = None
  CLOUDINARY_API_SECRET: Optional[str] = None

  OPENAI_API_KEY: Optional[str] = None

  class Config:
    env_file = ".env"
    case_sensitive = True


settings = Settings()