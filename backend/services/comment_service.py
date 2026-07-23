from sqlalchemy.orm import Session
from sqlalchemy import and_
from models.post_comment import PostComment, CommentLike
from typing import Optional, List
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class CommentService:
    
    @staticmethod
    def create_comment(db: Session, post_id: int, user_id: int, content: str, 
                      parent_comment_id: Optional[int] = None) -> PostComment:
        """
        Create a new comment (top-level or reply to existing comment)
        Calculates depth automatically based on parent
        """
        depth = 0
        
        if parent_comment_id:
            parent = db.query(PostComment).filter(PostComment.id == parent_comment_id).first()
            if not parent:
                raise ValueError("Parent comment not found")
            depth = parent.depth + 1
            
            if depth > 8:  # Limit nesting to 8 levels
                raise ValueError("Comment nesting too deep (max 8 levels)")
        
        comment = PostComment(
            post_id=post_id,
            user_id=user_id,
            parent_comment_id=parent_comment_id,
            content=content,
            depth=depth
        )
        
        db.add(comment)
        db.commit()
        db.refresh(comment)
        
        logger.info(f"Created comment {comment.id} on post {post_id} by user {user_id}")
        return comment
    
    @staticmethod
    def get_comment_by_id(db: Session, comment_id: int) -> Optional[PostComment]:
        """Get single comment with all relationships"""
        return db.query(PostComment).filter(PostComment.id == comment_id).first()
    
    @staticmethod
    def get_post_comments(db: Session, post_id: int, max_depth: Optional[int] = None) -> List[PostComment]:
        """
        Get all comments for a post, structured as tree
        Returns top-level comments (depth=0) with nested replies
        """
        comments = db.query(PostComment).filter(
            PostComment.post_id == post_id,
            PostComment.parent_comment_id == None  # Top-level only
        ).order_by(PostComment.created_at.asc()).all()
        
        return comments
    
    @staticmethod
    def get_comment_thread(db: Session, comment_id: int) -> dict:
        """
        Get a comment and all its replies recursively
        Returns nested structure for thread view
        """
        comment = db.query(PostComment).filter(PostComment.id == comment_id).first()
        if not comment:
            return {}
        
        # Get all direct replies
        replies = db.query(PostComment).filter(
            PostComment.parent_comment_id == comment_id
        ).order_by(PostComment.created_at.asc()).all()
        
        return {
            "comment": comment,
            "replies": [CommentService.get_comment_thread(db, reply.id) for reply in replies]
        }
    
    @staticmethod
    def get_comment_replies(db: Session, comment_id: int) -> List[PostComment]:
        """Get direct replies to a comment"""
        return db.query(PostComment).filter(
            PostComment.parent_comment_id == comment_id
        ).order_by(PostComment.created_at.asc()).all()
    
    @staticmethod
    def update_comment(db: Session, comment_id: int, user_id: int, content: str) -> Optional[PostComment]:
        """Update comment content (only if user is owner)"""
        comment = db.query(PostComment).filter(
            and_(PostComment.id == comment_id, PostComment.user_id == user_id)
        ).first()
        
        if comment:
            comment.content = content
            comment.is_edited = True
            comment.edited_at = datetime.utcnow()
            db.commit()
            db.refresh(comment)
            logger.info(f"Updated comment {comment_id}")
            return comment
        
        return None
    
    @staticmethod
    def delete_comment(db: Session, comment_id: int, user_id: int) -> bool:
        """Delete comment (soft delete - mark as [deleted])"""
        comment = db.query(PostComment).filter(
            and_(PostComment.id == comment_id, PostComment.user_id == user_id)
        ).first()
        
        if comment:
            comment.content = "[deleted]"
            comment.is_edited = True
            comment.edited_at = datetime.utcnow()
            db.commit()
            logger.info(f"Deleted comment {comment_id} by user {user_id}")
            return True
        
        return False
    
    @staticmethod
    def like_comment(db: Session, comment_id: int, user_id: int) -> bool:
        """Add like to comment"""
        
        # Check if already liked
        existing = db.query(CommentLike).filter(
            and_(CommentLike.comment_id == comment_id, CommentLike.user_id == user_id)
        ).first()
        
        if existing:
            return False  # Already liked
        
        like = CommentLike(user_id=user_id, comment_id=comment_id)
        db.add(like)
        
        # Update comment like count
        comment = db.query(PostComment).filter(PostComment.id == comment_id).first()
        if comment:
            comment.like_count += 1
        
        db.commit()
        logger.info(f"User {user_id} liked comment {comment_id}")
        return True
    
    @staticmethod
    def unlike_comment(db: Session, comment_id: int, user_id: int) -> bool:
        """Remove like from comment"""
        
        like = db.query(CommentLike).filter(
            and_(CommentLike.comment_id == comment_id, CommentLike.user_id == user_id)
        ).first()
        
        if not like:
            return False  # Not liked
        
        db.delete(like)
        
        # Update comment like count
        comment = db.query(PostComment).filter(PostComment.id == comment_id).first()
        if comment:
            comment.like_count = max(0, comment.like_count - 1)
        
        db.commit()
        logger.info(f"User {user_id} unliked comment {comment_id}")
        return True
    
    @staticmethod
    def user_liked_comment(db: Session, comment_id: int, user_id: int) -> bool:
        """Check if user has liked a comment"""
        return db.query(CommentLike).filter(
            and_(CommentLike.comment_id == comment_id, CommentLike.user_id == user_id)
        ).first() is not None
    
    @staticmethod
    def get_top_comments(db: Session, post_id: int, limit: int = 10) -> List[PostComment]:
        """Get top comments by likes"""
        return db.query(PostComment).filter(
            PostComment.post_id == post_id,
            PostComment.parent_comment_id == None
        ).order_by(PostComment.like_count.desc()).limit(limit).all()
    
    @staticmethod
    def get_recent_comments(db: Session, post_id: int, limit: int = 10) -> List[PostComment]:
        """Get most recent comments"""
        return db.query(PostComment).filter(
            PostComment.post_id == post_id,
            PostComment.parent_comment_id == None
        ).order_by(PostComment.created_at.desc()).limit(limit).all()