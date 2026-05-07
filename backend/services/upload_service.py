import cloudinary
import cloudinary.uploader
from core.config import settings
from fastapi import HTTPException, UploadFile, status

cloudinary.config(
  cloud_name = settings.CLOUDINARY_CLOUD_NAME,
  api_key = settings.CLOUDINARY_API_KEY,
  api_secret = settings.CLOUDINARY_API_SECRET,
  secure = True
)

# allowed MIME types
ALLOWED_TYPES = {
  'image/jpeg' : 'jpg',
  'image/png' : 'png',
  'image/webp' : 'webp',
  'image/gif' : 'gif'
}

MAX_FILE_SIZE_MB = 5
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024


async def upload_image(
  file : UploadFile,
  folder : str = 'yatra-saathi/posts'
) -> dict:
  if file.content_type not in ALLOWED_TYPES:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail=f"File type '{file.content_type}' not allowed"
      f" use jpeg, png, webP, gif"
    )


  contents = await file.read()
  if len(contents) > MAX_FILE_SIZE_BYTES:
    raise HTTPException(
      status_code= status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
      detail=f" file too large. maximum size is {MAX_FILE_SIZE_MB}MB"
    )

  
  if not settings.CLOUDINARY_CLOUD_NAME:
    raise HTTPException(
      status_code=status.HTTP_501_NOT_IMPLEMENTED,
      detail= "image upload is not configured"
    )
  try:
    result = cloudinary.uploader.upload(
      contents,
      folder = folder,
      resource_type = 'image',
      # auto-optiimize format and quality
      transform = [
        {'quality' : 'auto', 'fetch_format' : 'auto'},
        {'width' : 1200, 'crop' : 'limit'}
      ],
    )

  except Exception as e:
    raise HTTPException(
      status_code=status.HTTP_502_BAD_GATEWAY,
      detail= f"image upload failed: {str(e)}"
    )

  return {
    'url' : result['secure_url'],
    'public_id' : result['public_id'],
    'width' : result['width'],
    'height' : result['height'],
    'format' : result['format'],
    
  }


async def delete_image(public_id : str) -> None:
  """ deleting image from cloudinary by its public_id"""
  try:
    cloudinary.uploader.destroy(public_id)
  except Exception:
    pass