from pydantic import BaseModel, field_validator
from datetime import datetime


class AuthorInfo(BaseModel):
  id: int
  full_name: str
  avatar_url: str | None

  class Config:
    from_attributes = True


class PostCreate(BaseModel):
  content: str
  image_url: str | None = None

  @field_validator("content")
  @classmethod
  def content_not_empty(cls, v: str) -> str:
    if not v.strip():
      raise ValueError("Post content cannot be empty")
    if len(v.strip()) > 2000:
      raise ValueError("Post content cannot exceed 2000 characters")
    return v.strip()


class PostResponse(BaseModel):
  id: int
  content: str
  image_url: str | None
  author: AuthorInfo
  created_at: datetime

  class Config:
    from_attributes = True


class PaginatedPosts(BaseModel):
  items: list[PostResponse]
  total: int
  page: int
  size: int
  pages: int