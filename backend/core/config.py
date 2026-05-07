from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
  APP_NAME: str = "Yaatra Saathi"
  DEBUG : bool = True

  DATABASE_URL : str
  REDIS_URL : str

  # jwt
  SECRET_KEY : str
  ALGORITHM : str
  ACCESS_TOKEN_EXPIRE_MINUTES: int = 15

  # google oauth
  GOOGLE_CLIENT_ID : Optional[str] = None
  GOOGLE_CLIENT_SECRET : Optional[str] = None
  GOOGLE_REDIRECT_URI : str = 'http://127.0.0.1:8000/auth/google/callback' 

  FRONTEND_URL : str = 'http://localhost:5173'

  CLOUDINARY_CLOUD_NAME: Optional[str] = None
  CLOUDINARY_API_KEY: Optional[str] = None
  CLOUDINARY_API_SECRET: Optional[str] = None

  AI_PROVIDER : str = 'groq'


  OPENAI_API_KEY: Optional[str] = None
  GROQ_API_KEY: Optional[str] = None

  RESEND_API_KEY: Optional[str] = None
  RESEND_FROM_EMAIL: str = "onboarding@resend.dev"

  REFRESH_TOKEN_EXPIRE_DAYS: int = 30

  CHROMA_DB_PATH: str = "./chroma_db"
  CHROMA_COLLECTION: str = "yatra_knowledge"
  RAG_CHUNK_SIZE: int = 800
  RAG_CHUNK_OVERLAP: int = 150
  RAG_TOP_K: int = 5

  CHAT_MODEL: str = "llama-3.3-70b-versatile"
  EMBED_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"

  class Config:
    env_file = ".env"
    case_sensitive = True
    extra = "ignore"


settings = Settings()