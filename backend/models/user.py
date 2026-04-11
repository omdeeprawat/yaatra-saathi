from sqlalchemy import Column, Integer, Boolean, DateTime, Enum, String
from db.database import Base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

class AuthProvider(str, enum.Enum):
  email = "email"
  google = "google"

class User(Base):
  __tablename__ = "users"

  id = Column(Integer, primary_key = True, index = True)
  email = Column(String, unique = True, index = True, nullable = False)
  full_name = Column(String, nullable = False)
  hashed_password = Column(String, nullable = True)
  avatar_url = Column(String, nullable = True)
  auth_provider = Column(Enum(AuthProvider), default = AuthProvider.email)
  is_active = Column(Boolean, default= True)
  created_at = Column(DateTime(timezone = True), server_default=func.now())
  updated_at = Column(DateTime(timezone = True), onupdate= func.now())
  is_verified = Column(Boolean, default= False, nullable=False)
  verification_token = Column(String(6), nullable=True)
  verification_expires =Column(DateTime, nullable=True) 
  verification_attempts = Column(Integer, default=0)
  verified_at = Column(DateTime, nullable=True)
  # relationships
  posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")