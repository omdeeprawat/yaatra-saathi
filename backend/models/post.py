from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db.database import Base


class Post(Base):
  __tablename__ = "posts"

  id = Column(Integer, primary_key=True, index=True)
  content = Column(Text, nullable=False)
  image_url = Column(String, nullable=True)
  author_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
  created_at = Column(DateTime(timezone=True), server_default=func.now())

  # relationships
  author = relationship("User", back_populates="posts")
