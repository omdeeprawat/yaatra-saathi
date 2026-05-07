from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from db.database import get_db
from core.dependencies import get_current_user, get_optional_user
from core.rate_limiter import post_creation_limiter
from schemas.post import PostCreate, PostResponse, PaginatedPosts
from services.post_service import get_posts_paginated, create_post, delete_post
from models.user import User

router = APIRouter(prefix="/posts", tags=["posts"])


@router.get("/", response_model=PaginatedPosts)
def list_posts(
  page: int = Query(default=1, ge=1),
  size: int = Query(default=10, ge=1, le=50),
  db: Session = Depends(get_db),
  # Optional auth — public can read, but we know who's logged in
  _current_user: User | None = Depends(get_optional_user)
):
  """
  Public endpoint — anyone can read posts.
  Returns paginated posts, newest first.
  """
  return get_posts_paginated(db, page=page, size=size)


@router.post("/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_new_post(
  data: PostCreate,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user)
):
  """Authenticated — create a new post."""
  await post_creation_limiter.check_rate_limit(current_user.id)
  return create_post(db, data, author_id=current_user.id)


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_post(
  post_id: int,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user)
):
  """Authenticated — delete your own post."""
  delete_post(db, post_id=post_id, requesting_user_id=current_user.id)