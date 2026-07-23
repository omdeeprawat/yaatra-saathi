from sqlalchemy.orm import Session
from models.chat_session import ChatSession
from models.chat_message import ChatMessage
from schemas.chat import ChatSessionCreate, ChatMessageCreate
from typing import Optional, List
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class ChatSessionService:
    
    @staticmethod
    def create_session(db: Session, user_id: int, title: Optional[str] = None) -> ChatSession:
        """Create a new chat session"""
        session = ChatSession(
            user_id=user_id,
            title=title or f"Chat {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}"
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        logger.info(f"Created chat session {session.session_id} for user {user_id}")
        return session
    
    @staticmethod
    def get_session(db: Session, session_id: str, user_id: int) -> Optional[ChatSession]:
        """Get session by ID (verify ownership)"""
        return db.query(ChatSession).filter(
            ChatSession.session_id == session_id,
            ChatSession.user_id == user_id
        ).first()
    
    @staticmethod
    def get_user_sessions(db: Session, user_id: int, limit: int = 20, offset: int = 0) -> List[ChatSession]:
        """Get all sessions for a user"""
        return db.query(ChatSession).filter(
            ChatSession.user_id == user_id,
            ChatSession.archived == False
        ).order_by(ChatSession.last_accessed_at.desc()).limit(limit).offset(offset).all()
    
    @staticmethod
    def update_session_access(db: Session, session_id: str) -> None:
        """Update last_accessed_at timestamp"""
        session = db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
        if session:
            session.last_accessed_at = datetime.utcnow()
            db.commit()
    
    @staticmethod
    def add_message(db: Session, session_id: str, role: str, content: str, 
                    agent_name: Optional[str] = None, verified: bool = False,
                    confidence_score: float = 0.0, sources: Optional[List] = None,
                    route: Optional[str] = None) -> ChatMessage:
        """Add a message to a session"""
        
        # Get current message count
        last_message = db.query(ChatMessage).filter(
            ChatMessage.session_id == session_id
        ).order_by(ChatMessage.message_order.desc()).first()
        
        message_order = (last_message.message_order + 1) if last_message else 0
        
        message = ChatMessage(
            session_id=session_id,
            role=role,
            content=content,
            message_order=message_order,
            agent_name=agent_name,
            verified=verified,
            confidence_score=confidence_score,
            sources=sources,
            route=route
        )
        
        db.add(message)
        
        # Update session metadata
        session = db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
        if session:
            session.total_messages += 1
            session.updated_at = datetime.utcnow()
            session.last_accessed_at = datetime.utcnow()
            
            # Infer topic from first message
            if session.total_messages == 1 and role == "user":
                session.topic = content[:30]  # First 30 chars
        
        db.commit()
        db.refresh(message)
        return message
    
    @staticmethod
    def get_session_history(db: Session, session_id: str, limit: int = 12, offset: int = 0) -> tuple[List[ChatMessage], int]:
        """Get message history for a session"""
        
        messages = db.query(ChatMessage).filter(
            ChatMessage.session_id == session_id
        ).order_by(ChatMessage.message_order.asc()).all()
        
        total_count = len(messages)
        
        # Paginate
        paginated = messages[offset:offset+limit]
        
        return paginated, total_count
    
    @staticmethod
    def delete_session(db: Session, session_id: str) -> bool:
        """Archive a session (soft delete)"""
        session = db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
        if session:
            session.archived = True
            session.is_active = False
            db.commit()
            return True
        return False
    
    @staticmethod
    def export_session(db: Session, session_id: str) -> Optional[dict]:
        """Export session as JSON for download"""
        session = db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
        if not session:
            return None
        
        return {
            "session_id": session.session_id,
            "title": session.title,
            "created_at": session.created_at.isoformat(),
            "messages": [
                {
                    "role": msg.role,
                    "content": msg.content,
                    "timestamp": msg.created_at.isoformat(),
                    "agent": msg.agent_name,
                    "verified": msg.verified,
                    "confidence": msg.confidence_score
                }
                for msg in session.messages
            ]
        }