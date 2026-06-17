from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from db.database import Base
import uuid


class ChatSession(Base):
    __tablename__ = "chat_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=True)
    topic = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    total_messages = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_accessed_at = Column(DateTime, default=datetime.utcnow)
    archived = Column(Boolean, default=False, index=True)
    
    user = relationship("User", backref="chat_sessions")
    messages = relationship("ChatMessage", backref="session", cascade="all, delete-orphan")


    # def __repr__(self):
    #   return f"<ChatSession {self.session_id} by User {self.user_id}>"
        
    # def get_message_count(self) -> int:
    #   """Get total number of messages in session"""
    #   return len(self.messages)
    
    # def is_recent(self, days: int = 7) -> bool:
    #   """Check if session was accessed in last N days"""
    #   from datetime import timedelta
    #   return self.last_accessed_at > (datetime.utcnow() - timedelta(days=days))