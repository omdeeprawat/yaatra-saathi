from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, func
from fastapi import HTTPException, status
from models.post import Post
from models.user import User
from schemas.post import PostCreate


def get_posts_paginated(
  db: Session,
  page: int = 1,
  size: int = 10
) -> dict:
  """Return paginated posts newest-first, with author info joined."""
  if page < 1:
    page = 1
  if size < 1 or size > 50:
    size = 10

  offset = (page - 1) * size
  total = db.query(func.count(Post.id)).scalar()

  posts = (
    db.query(Post)
    .options(joinedload(Post.author))
    .order_by(desc(Post.created_at))
    .offset(offset)
    .limit(size)
    .all()
  )

  pages = (total + size - 1) // size  # ceiling division

  return {
    "items": posts,
    "total": total,
    "page": page,
    "size": size,
    "pages": pages,
  }


def create_post(db: Session, data: PostCreate, author_id: int) -> Post:
  post = Post(
    content=data.content,
    image_url=data.image_url,
    author_id=author_id
  )
  db.add(post)
  db.commit()
  db.refresh(post)

  # Reload with author relationship
  return (
    db.query(Post)
    .options(joinedload(Post.author))
    .filter(Post.id == post.id)
    .first()
  )


def delete_post(db: Session, post_id: int, requesting_user_id: int) -> None:
  post = db.query(Post).filter(Post.id == post_id).first()

  if not post:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Post not found",
    )

  if post.author_id != requesting_user_id:
    raise HTTPException(
      status_code=status.HTTP_403_FORBIDDEN,
      detail="You can only delete your own posts",
    )

  db.delete(post)
  db.commit()