from sqlalchemy import Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from db.database import Base


class ChatMessage(Base):
  __tablename__ = "chat_messages"
  
  id = Column(Integer, primary_key=True, index=True)
  session_id = Column(String(36), ForeignKey("chat_sessions.session_id", ondelete="CASCADE"), nullable=False, index=True)
  role = Column(String(20), nullable=False)  # 'user' or 'assistant'
  content = Column(Text, nullable=False)
  message_order = Column(Integer, nullable=False)
  
  # AI metadata
  agent_name = Column(String(100), nullable=True)
  verified = Column(Boolean, default=False)
  confidence_score = Column(Float, default=0.0)
  sources = Column(JSON, nullable=True)  # [{source: str, score: float}]
  route = Column(String(50), nullable=True)
  message_metadata = Column("metadata", JSON, nullable=True)  # {tokens_used, latency_ms, model_used}
  
  created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
  updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
  
  # def __repr__(self):
  #   return f"<ChatMessage {self.id} ({self.role})>"