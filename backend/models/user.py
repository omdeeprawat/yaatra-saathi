from sqlalchemy import Column, Integer, Boolean, DateTime, Enum as SQLEnum, String
from db.database import Base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from datetime import datetime


class AuthProvider(str, enum.Enum):
  email = "email"
  google = "google"


class UserRole(str, enum.Enum):
  USER = 'user'
  ADMIN = 'admin'


class User(Base):
  __tablename__ = "users"

  id = Column(Integer, primary_key = True, index = True)
  email = Column(String, unique = True, index = True, nullable = False)
  full_name = Column(String, nullable = False)
  hashed_password = Column(String, nullable = True)

  role = Column(SQLEnum(UserRole), default=UserRole.USER, nullable=False)
  avatar_url = Column(String, nullable = True)
  auth_provider = Column(SQLEnum(AuthProvider), default = AuthProvider.email)
  is_active = Column(Boolean, default= True)
  is_verified = Column(Boolean, default= False, nullable=False)
  verification_token = Column(String(6), nullable=True)
  verification_expires =Column(DateTime, nullable=True) 
  verification_attempts = Column(Integer, default=0)
  verified_at = Column(DateTime, nullable=True)

  created_at = Column(DateTime(timezone = True), server_default=func.now())
  updated_at = Column(DateTime(timezone = True), onupdate= func.now())
  # relationships
  posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")


  def is_admin(self)->bool:
    return self.role == UserRole.ADMIN


  def __repr__(self):
    return f'<User {self.email} ({self.role.value})>'

  