from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from schemas.chat import CommentCreate, CommentUpdate, CommentResponse, CommentThreadResponse, CommentLikeResponse
from services.comment_service import CommentService
from core.dependencies import get_current_user, get_current_user_optional
from db.database import get_db
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/posts/{post_id}/comments", tags=["comments"])


def serialize_comment(comment, db: Session, current_user = None) -> dict:
    """Convert PostComment model to response dict with user info"""
    return {
        "id": comment.id,
        "post_id": comment.post_id,
        "user_id": comment.user_id,
        "parent_comment_id": comment.parent_comment_id,
        "content": comment.content,
        "depth": comment.depth,
        "like_count": comment.like_count,
        "created_at": comment.created_at,
        "updated_at": comment.updated_at,
        "is_edited": comment.is_edited,
        "edited_at": comment.edited_at,
        "user": {
            "id": comment.user.id,
            "name": comment.user.full_name,
            "avatar_url": comment.user.avatar_url
        },
        "user_liked": CommentService.user_liked_comment(db, comment.id, current_user.id) if current_user else False
    }


def build_comment_tree(comment, db: Session, current_user = None) -> dict:
    """Recursively build comment tree with replies"""
    replies = CommentService.get_comment_replies(db, comment.id)
    
    comment_data = serialize_comment(comment, db, current_user)
    comment_data["replies"] = [build_comment_tree(reply, db, current_user) for reply in replies]
    
    return comment_data


@router.post("", response_model=CommentResponse, status_code=201)
async def create_comment(
    post_id: int,
    request: CommentCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new comment on a post (top-level or reply)"""
    try:
        comment = CommentService.create_comment(
            db,
            post_id=post_id,
            user_id=current_user.id,
            content=request.content,
            parent_comment_id=request.parent_comment_id
        )
        
        return serialize_comment(comment, db, current_user)
    
    except ValueError as e:
        logger.warning(f"Invalid comment: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating comment: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create comment")


@router.get("", response_model=CommentThreadResponse)
async def get_comments(
    post_id: int,
    sort: str = Query("recent", regex="^(recent|top)$"),
    current_user: Optional[object] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Get all comments for a post, structured as threads"""
    try:
        if sort == "top":
            comments = CommentService.get_top_comments(db, post_id, limit=100)
        else:
            comments = CommentService.get_recent_comments(db, post_id, limit=100)
        
        # Build nested tree structure
        comment_trees = [build_comment_tree(comment, db, current_user) for comment in comments]
        
        return {
            "post_id": post_id,
            "comments": comment_trees,
            "total_count": len(comments)
        }
    
    except Exception as e:
        logger.error(f"Error fetching comments: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch comments")


@router.get("/{comment_id}", response_model=CommentResponse)
async def get_comment(
    post_id: int,
    comment_id: int,
    current_user: Optional[object] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Get specific comment with all its replies"""
    try:
        comment = CommentService.get_comment_by_id(db, comment_id)
        if not comment or comment.post_id != post_id:
            raise HTTPException(status_code=404, detail="Comment not found")
        
        return build_comment_tree(comment, db, current_user)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching comment: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch comment")


@router.put("/{comment_id}", response_model=CommentResponse)
async def update_comment(
    post_id: int,
    comment_id: int,
    request: CommentUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a comment (only if user is owner)"""
    try:
        # Verify comment belongs to post
        comment = CommentService.get_comment_by_id(db, comment_id)
        if not comment or comment.post_id != post_id:
            raise HTTPException(status_code=404, detail="Comment not found")
        
        # Update
        updated = CommentService.update_comment(db, comment_id, current_user.id, request.content)
        if not updated:
            raise HTTPException(status_code=403, detail="Not authorized to update this comment")
        
        return serialize_comment(updated, db, current_user)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating comment: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update comment")


@router.delete("/{comment_id}", status_code=204)
async def delete_comment(
    post_id: int,
    comment_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a comment (only if user is owner)"""
    try:
        # Verify comment belongs to post
        comment = CommentService.get_comment_by_id(db, comment_id)
        if not comment or comment.post_id != post_id:
            raise HTTPException(status_code=404, detail="Comment not found")
        
        # Delete
        success = CommentService.delete_comment(db, comment_id, current_user.id)
        if not success:
            raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting comment: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete comment")


@router.post("/{comment_id}/like", response_model=CommentLikeResponse)
async def like_comment(
    post_id: int,
    comment_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Like a comment"""
    try:
        comment = CommentService.get_comment_by_id(db, comment_id)
        if not comment or comment.post_id != post_id:
            raise HTTPException(status_code=404, detail="Comment not found")
        
        already_liked = CommentService.user_liked_comment(db, comment_id, current_user.id)
        
        if not already_liked:
            CommentService.like_comment(db, comment_id, current_user.id)
        
        comment = CommentService.get_comment_by_id(db, comment_id)
        return {
            "comment_id": comment_id,
            "liked": True,
            "like_count": comment.like_count
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error liking comment: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to like comment")


@router.delete("/{comment_id}/like", response_model=CommentLikeResponse)
async def unlike_comment(
    post_id: int,
    comment_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unlike a comment"""
    try:
        comment = CommentService.get_comment_by_id(db, comment_id)
        if not comment or comment.post_id != post_id:
            raise HTTPException(status_code=404, detail="Comment not found")
        
        already_liked = CommentService.user_liked_comment(db, comment_id, current_user.id)
        
        if already_liked:
            CommentService.unlike_comment(db, comment_id, current_user.id)
        
        comment = CommentService.get_comment_by_id(db, comment_id)
        return {
            "comment_id": comment_id,
            "liked": False,
            "like_count": comment.like_count
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error unliking comment: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to unlike comment")


@router.get("/replies/{comment_id}", response_model=List[CommentResponse])
async def get_comment_replies(
    post_id: int,
    comment_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get direct replies to a comment"""
    try:
        comment = CommentService.get_comment_by_id(db, comment_id)
        if not comment or comment.post_id != post_id:
            raise HTTPException(status_code=404, detail="Comment not found")
        
        replies = CommentService.get_comment_replies(db, comment_id)
        return [serialize_comment(reply, db, current_user) for reply in replies]
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching replies: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch replies")