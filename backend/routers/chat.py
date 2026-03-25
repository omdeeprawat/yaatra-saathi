import json
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from core.dependencies import get_current_user
from rag.ingest import ingest
from rag.rag_service import stream_rag_response
from rag.vector_store import collection_exists_and_has_docs, get_collection_count
from models.user import User

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatMessage(BaseModel):
    role: str   
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []
    image_url: str | None = None


class ChatStatusResponse(BaseModel):
    ready: bool
    chunk_count: int
    message: str


class ChatIngestResponse(BaseModel):
    success: bool
    filename: str
    chunk_count: int
    message: str


ALLOWED_DOC_EXTENSIONS = {".txt", ".md", ".pdf"}
MAX_DOC_SIZE_MB = 10
MAX_DOC_SIZE_BYTES = MAX_DOC_SIZE_MB * 1024 * 1024
DOCUMENTS_DIR = Path(__file__).resolve().parent.parent / "rag" / "documents"


@router.get("/status", response_model=ChatStatusResponse)
def chat_status(_current_user: User = Depends(get_current_user)):
    """Check whether the RAG vector store is populated and ready."""
    ready = collection_exists_and_has_docs()
    count = get_collection_count()
    return ChatStatusResponse(
        ready=ready,
        chunk_count=count,
        message="Ready" if ready else "Vector store is empty. Run: python -m rag.ingest",
    )


@router.post("/stream")
async def chat_stream(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Streaming RAG chat endpoint.
    Returns a Server-Sent Events (SSE) stream.

    Frontend reads this with EventSource or fetch + ReadableStream.
    Each event is: data: <text_chunk>\n\n
    The stream ends with: data: [DONE]\n\n
    """
    history = [{"role": m.role, "content": m.content} for m in request.history]

    async def event_stream():
        try:
            async for chunk in stream_rag_response(
                user_message=request.message,
                chat_history=history,
                image_url=request.image_url,
            ):
                # SSE format: data: <payload>\n\n
                yield f"data: {json.dumps({'text': chunk})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        finally:
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  
        },
    )


@router.post("/")
async def chat_simple(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Non-streaming endpoint — returns the full response at once.
    Useful for testing in /docs without needing an SSE client.
    """
    history = [{"role": m.role, "content": m.content} for m in request.history]
    full_response = ""

    async for chunk in stream_rag_response(
        user_message=request.message,
        chat_history=history,
        image_url=request.image_url,
    ):
        full_response += chunk

    return {"response": full_response, "message": request.message}


@router.post("/ingest-document", response_model=ChatIngestResponse)
async def ingest_document(
    file: UploadFile = File(...),
    _current_user: User = Depends(get_current_user),
):
    """
    Upload a new knowledge document (.txt/.md/.pdf) and rebuild the vector index.
    """
    filename = file.filename or "document"
    suffix = Path(filename).suffix.lower()

    if suffix not in ALLOWED_DOC_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only .txt, .md, and .pdf files are supported",
        )

    contents = await file.read()
    if not contents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty",
        )

    if len(contents) > MAX_DOC_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds {MAX_DOC_SIZE_MB}MB limit",
        )

    DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)
    safe_name = Path(filename).name
    save_path = DOCUMENTS_DIR / safe_name
    save_path.write_bytes(contents)

    try:
        ingest(force=True)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ingestion failed: {str(e)}",
        )

    return ChatIngestResponse(
        success=True,
        filename=safe_name,
        chunk_count=get_collection_count(),
        message="Document uploaded and indexed successfully",
    )