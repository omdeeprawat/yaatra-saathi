from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.database import get_db
from schemas.story import StoryFull, StoryTeaser
from models.story import Story
from models.user import User
from core.dependencies import get_current_user

router = APIRouter(prefix = "/stories", tags=["stories"])


@router.get('/', response_model=list[StoryTeaser])
def get_all_stories(
  featured_only : bool = True,
  db:Session = Depends(get_db)
):
  query = db.query(Story).order_by(Story.display_order, Story.created_at.desc())

  if featured_only:
    query = query.filter(Story.is_featured == True)

  stories = query.all()
  return stories


@router.get("/{slug}", response_model=StoryFull)
def get_story_by_slug(
  slug : str,
  db : Session = Depends(get_db),
  current_user :User = Depends(get_current_user)
):

  story = db.query(Story).filter(Story.slug == slug).first()

  if not story:
    raise HTTPException(
      status_code= status.HTTP_404_NOT_FOUND,
      detail = "story not found"
    )

  story.view_count +=1
  db.commit()
  db.refresh(story)

  return story


@router.get("/preview/{slug}", response_model=StoryTeaser)
def get_story_preview(
  slug:str,
  db:Session = Depends(get_db)
):
  story = db.query(Story).filter(Story.slug == slug).first()
    
  if not story:
      raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="story not found"
      )
  
  return story