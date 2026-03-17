from pydantic import BaseModel
from datetime import datetime


class StoryTeaser(BaseModel):
  id : int
  slug : str
  title : str
  category : str
  teaser : str
  cover_image_url : str | None
  read_time_minutes : int
  view_count : int
  is_featured : bool

  class Config : 
    from_attributes = True


class StoryFull(BaseModel):
  id : int
  slug : str
  title : str
  category : str
  teaser : str
  full_content: str
  cover_image_url : str | None
  read_time_minutes : int
  view_count : int
  is_featured : bool
  created_at : datetime

  class Config:
    from_attributes = True