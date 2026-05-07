from fastapi import APIRouter, Depends, File, UploadFile
from pydantic import BaseModel
from core.dependencies import get_current_user
from core.rate_limiter import image_upload_limiter
from models.user import User
from services.upload_service import upload_image


router = APIRouter(prefix='/upload', tags=['upload'])

class UploadResponse(BaseModel):
  url: str
  public_id : str
  width : int | None
  heigth : int | None
  format : str | None


@router.post('/image', response_model=UploadResponse)
async def upload_image_endpoint(
  file : UploadFile = File(...),
  current_user: User = Depends(get_current_user)
):
  """
  Authenticated — upload an image to Cloudinary.
  Returns the secure URL to store with a post or chat message.

  Max size: 5MB. Allowed types: JPEG, PNG, WebP, GIF.
  """

  await image_upload_limiter.check_rate_limit(current_user.id)
  result = await upload_image(file, folder='yatra-saathi/posts')
  return UploadResponse(**result)