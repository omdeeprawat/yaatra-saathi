from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ChatMessageBase(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str = Field(..., min_length=1, max_length=5000)


class ChatMessageCreate(ChatMessageBase):
    pass


class ChatMessageResponse(ChatMessageBase):
    id: int
    session_id: str
    message_order: int
    agent_name: Optional[str] = None
    verified: bool = False
    confidence_score: float = 0.0
    sources: Optional[List[dict]] = None
    route: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class ChatSessionCreate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)


class ChatSessionUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    is_active: Optional[bool] = None
    archived: Optional[bool] = None


class ChatSessionResponse(BaseModel):
    id: int
    session_id: str
    user_id: int
    title: Optional[str]
    topic: Optional[str]
    is_active: bool
    total_messages: int
    created_at: datetime
    updated_at: datetime
    last_accessed_at: datetime
    archived: bool
    messages: Optional[List[ChatMessageResponse]] = None
    
    class Config:
        from_attributes = True


class ChatHistoryRequest(BaseModel):
    session_id: str
    limit: int = Field(default=12, ge=1, le=50)
    offset: int = Field(default=0, ge=0)


class ChatHistoryResponse(BaseModel):
    session_id: str
    messages: List[ChatMessageResponse]
    total_count: int
    has_more: bool


class StreamChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=5000)
    session_id: Optional[str] = None  # If None, create new session
    history: Optional[List[dict]] = None


# Comments
class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)
    parent_comment_id: Optional[int] = None


class CommentUpdate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)


class CommentResponse(BaseModel):
    id: int
    post_id: int
    user_id: int
    parent_comment_id: Optional[int] = None
    content: str
    depth: int
    like_count: int
    created_at: datetime
    updated_at: datetime
    is_edited: bool
    edited_at: Optional[datetime] = None
    user: Optional[dict] = None  # {id, name, avatar_url}
    replies: Optional[List['CommentResponse']] = None
    
    class Config:
        from_attributes = True


class CommentThreadResponse(BaseModel):
    post_id: int
    comments: List[CommentResponse]
    total_count: int


class CommentLikeResponse(BaseModel):
    comment_id: int
    liked: bool
    like_count: int