from sqlalchemy import Column, Integer, Boolean, Text, String, DateTime
from datetime import datetime
from db.database import Base


class Story(Base):
  __tablename__ = 'stories'

  id = Column(Integer, primary_key=True, index=True)
  slug = Column(String(100), unique=True, nullable=False, index=True)
  title = Column(String(200), nullable=False)
  category = Column(String(50), nullable=False)
  teaser = Column(Text, nullable=False)
  full_content = Column(Text, nullable=False)
  cover_image_url = Column(String(500), nullable=True)
  read_time_minutes = Column(Integer, default=15)
  view_count = Column(Integer, default=0)
  is_featured = Column(Boolean, default=False)
  display_order = Column(Integer, default=0)
  created_at = Column(DateTime, default=datetime.utcnow)
  updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)