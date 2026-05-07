from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from pydantic import BaseModel
from pathlib import Path
import shutil
from models.user import User
from core.admin_dependencies import require_admin
from tasks.rag_tasks import ingest_documents_task
from rag.vector_store import get_collection_count
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["admin"])
DOCUMENTS_DIR = Path(__file__).resolve().parent.parent / "rag" / "documents"



class IngestionRequest(BaseModel):
  force: bool = False


class IngestionStatusResponse(BaseModel):
  status: str
  chunk_count: int
  message: str


class DocumentInfo(BaseModel):
  filename: str
  size: int
  extension: str


class DocumentListResponse(BaseModel):
  documents: list[DocumentInfo]
  total: int


# document upload
@router.post("/upload-document", status_code=status.HTTP_201_CREATED)
async def upload_document(
  file: UploadFile = File(...),
  admin: User = Depends(require_admin),
):
  
  # Validate file type
  allowed_extensions = {".txt", ".pdf", ".md"}
  file_ext = Path(file.filename).suffix.lower()
  
  if file_ext not in allowed_extensions:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail=f"File type '{file_ext}' not allowed. Allowed types: {', '.join(allowed_extensions)}"
    )
  
  # Check file size (max 10MB)
  max_size = 10 * 1024 * 1024  
  file.file.seek(0, 2) 
  file_size = file.file.tell()
  file.file.seek(0) 
  
  if file_size > max_size:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail=f"File too large. Maximum size: 10MB. Your file: {file_size / 1024 / 1024:.2f}MB"
    )
  
  # Save to documents folder
  docs_path = DOCUMENTS_DIR
  docs_path.mkdir(parents=True, exist_ok=True)
  
  file_path = docs_path / file.filename
  
  # Check if file already exists
  if file_path.exists():
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail=f"Document '{file.filename}' already exists. Delete it first or rename your file."
    )
  
  try:
    with file_path.open("wb") as buffer:
      shutil.copyfileobj(file.file, buffer)
    
    logger.info(f"Admin {admin.id} uploaded document: {file.filename}")
    
    return {
      "success": True,
      "filename": file.filename,
      "size": file_size,
      "message": "Document uploaded successfully. Run ingestion to update knowledge base."
    }
  
  except Exception as e:
    logger.error(f"Error uploading document: {str(e)}")
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail=f"Failed to upload document: {str(e)}"
    )


# ingestion
@router.post("/ingest", response_model=dict)
async def trigger_ingestion(
  data: IngestionRequest = IngestionRequest(),
  admin: User = Depends(require_admin),
):
  
  try:
    # Add ingestion task to background
    task = ingest_documents_task.delay(admin_id=admin.id, force=data.force)
    
    logger.info(f"Admin {admin.id} triggered ingestion (force={data.force})")
    
    return {
      "success": True,
      "message": "Ingestion task queued successfully.",
      "task_id": task.id,
      "force": data.force
    }

  except Exception as e:
      logger.error(f"Error triggering ingestion: {str(e)}")
      raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to trigger ingestion: {str(e)}"
      )


# ingestion Status
@router.get("/ingestion-status", response_model=IngestionStatusResponse)
async def get_ingestion_status(admin: User = Depends(require_admin)):
  """
  Get status of knowledge base ingestion.
  
  **Admin only**
  """
  try:
    chunk_count = get_collection_count()
    
    if chunk_count > 0:
      return IngestionStatusResponse(
        status="completed",
        chunk_count=chunk_count,
        message=f"Knowledge base ready with {chunk_count} chunks."
      )
    else:
      return IngestionStatusResponse(
        status="empty",
        chunk_count=0,
        message="No documents ingested yet. Upload documents and run ingestion."
      )

  except Exception as e:
    logger.error(f"Error checking ingestion status: {str(e)}")
    return IngestionStatusResponse(
      status="error",
      chunk_count=0,
      message=f"Error checking status: {str(e)}"
  )


# list Documents 
@router.get("/documents", response_model=DocumentListResponse)
async def list_documents(admin: User = Depends(require_admin)):
  """
  List all documents in knowledge base.
  
  **Admin only**
  """
  docs_path = DOCUMENTS_DIR
  
  if not docs_path.exists():
    return DocumentListResponse(documents=[], total=0)
  
  documents = []
  for file_path in docs_path.glob("*"):
    if file_path.is_file() and not file_path.name.startswith('.'):
      documents.append(DocumentInfo(
        filename=file_path.name,
        size=file_path.stat().st_size,
        extension=file_path.suffix
      ))

  # Sort by filename
  documents.sort(key=lambda d: d.filename)

  return DocumentListResponse(
    documents=documents,
    total=len(documents)
  )


# delete Document
@router.delete("/documents/{filename}")
async def delete_document(
  filename: str,
  admin: User = Depends(require_admin),
):
  """
  Delete a document from knowledge base.
  
  **Admin only**
  
  Note: You must re-run ingestion after deleting to update the vector store.
  """
  docs_path = DOCUMENTS_DIR
  file_path = docs_path / filename
  
  # Security: Prevent path traversal
  if not file_path.resolve().is_relative_to(docs_path.resolve()):
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="Invalid filename"
    )
  
  if not file_path.exists():
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail=f"Document '{filename}' not found"
    )
  
  try:
    file_path.unlink()
    logger.info(f"Admin {admin.id} deleted document: {filename}")
    
    return {
      "success": True,
      "filename": filename,
      "message": "Document deleted. Re-run ingestion to update knowledge base."
    }
  
  except Exception as e:
    logger.error(f"Error deleting document: {str(e)}")
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail=f"Failed to delete document: {str(e)}"
    )