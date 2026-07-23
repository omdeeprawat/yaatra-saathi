from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from schemas.chat import (
    ChatSessionResponse, ChatMessageResponse, ChatHistoryRequest, 
    ChatHistoryResponse, StreamChatRequest, ChatSessionCreate, ChatSessionUpdate
)
from services.chat_service import ChatSessionService
from rag.rag_service_multiagent import stream_rag_response_multiagent, get_rag_response_multiagent
from core.dependencies import get_current_user
from db.database import get_db
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/session", response_model=ChatSessionResponse)
async def create_chat_session(
    request: ChatSessionCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new chat session"""
    try:
        session = ChatSessionService.create_session(
            db, 
            user_id=current_user.id, 
            title=request.title
        )
        return session
    except Exception as e:
        logger.error(f"Error creating chat session: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create chat session")


@router.get("/sessions", response_model=List[ChatSessionResponse])
async def list_chat_sessions(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all chat sessions for current user"""
    try:
        sessions = ChatSessionService.get_user_sessions(
            db, 
            user_id=current_user.id, 
            limit=limit, 
            offset=offset
        )
        return sessions
    except Exception as e:
        logger.error(f"Error fetching sessions: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch sessions")


@router.get("/session/{session_id}", response_model=ChatSessionResponse)
async def get_chat_session(
    session_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific chat session with all messages"""
    try:
        session = ChatSessionService.get_session(db, session_id, current_user.id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        ChatSessionService.update_session_access(db, session_id)
        return session
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching session: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch session")


@router.get("/history/{session_id}", response_model=ChatHistoryResponse)
async def get_chat_history(
    session_id: str,
    limit: int = Query(12, ge=1, le=50),
    offset: int = Query(0, ge=0),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get message history for a session (paginated)"""
    try:
        session = ChatSessionService.get_session(db, session_id, current_user.id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        messages, total_count = ChatSessionService.get_session_history(
            db, 
            session_id, 
            limit=limit, 
            offset=offset
        )
        
        return {
            "session_id": session_id,
            "messages": messages,
            "total_count": total_count,
            "has_more": (offset + limit) < total_count
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching history: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch history")


@router.post("/stream/{session_id}")
async def stream_chat(
    session_id: str,
    request: StreamChatRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Stream chat response with chat history"""
    try:
        # Verify session ownership
        session = ChatSessionService.get_session(db, session_id, current_user.id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Get message history
        history_messages, _ = ChatSessionService.get_session_history(db, session_id, limit=6)
        
        # Convert to chat format
        chat_history = [
            {"role": msg.role, "content": msg.content}
            for msg in history_messages
        ]
        
        # Store user message
        ChatSessionService.add_message(db, session_id, "user", request.message)
        
        # Generate and stream response
        async def generate():
            response_text = ""
            try:
                async for chunk in stream_rag_response_multiagent(
                    request.message,
                    chat_history=chat_history,
                    image_url=request.history[-1].get("image_url") if request.history else None
                ):
                    response_text += chunk
                    yield f"data: {chunk}\n\n"
                
                # Store AI response after streaming complete
                # You can call RAG service again or extract metadata
                ChatSessionService.add_message(
                    db, session_id, "assistant", response_text, 
                    agent_name="Multi-Agent RAG"
                )
            except Exception as e:
                logger.error(f"Streaming error: {str(e)}")
                yield f"data: [Error: {str(e)}]\n\n"
        
        return generate()
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in stream_chat: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process chat")


@router.delete("/session/{session_id}", status_code=204)
async def delete_chat_session(
    session_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Archive (soft delete) a chat session"""
    try:
        session = ChatSessionService.get_session(db, session_id, current_user.id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        ChatSessionService.delete_session(db, session_id)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting session: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete session")


@router.get("/export/{session_id}")
async def export_chat_session(
    session_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export chat session as JSON"""
    try:
        session = ChatSessionService.get_session(db, session_id, current_user.id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        export_data = ChatSessionService.export_session(db, session_id)
        return export_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting session: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to export session")