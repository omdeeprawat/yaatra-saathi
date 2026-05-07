import json
import logging
from pathlib import Path
import time
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from models.user import User
from core.dependencies import get_current_user
from core.rate_limiter import chat_rate_limiter
from rag.ingest import ingest_documents
from rag.vector_store import collection_exists_and_has_docs, get_collection_count
from rag.rag_service_multiagent import stream_rag_response_multiagent

router = APIRouter(prefix="/chat", tags=["chat"])
logger = logging.getLogger(__name__)


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = Field(default_factory=list)
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


def _sse(payload: dict[str, str] | str) -> str:
    if isinstance(payload, str):
        return f"data: {payload}\n\n"
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


@router.get("/status", response_model=ChatStatusResponse)
async def chat_status(_current_user: User = Depends(get_current_user)):
    """Check whether the RAG vector store is populated and ready."""
    ready = collection_exists_and_has_docs()
    count = get_collection_count()
    logger.info("[ChatStatus] ready=%s chunk_count=%s", ready, count)
    return ChatStatusResponse(
        ready=ready,
        chunk_count=count,
        message="Ready" if ready else "Vector store is empty. Run: python -m rag.ingest --force",
    )


@router.post("/stream")
async def stream_chat_multiagent(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Streaming multi-agent chat endpoint.
    Returns SSE events in the expected frontend format.
    """
    request_id = str(uuid4())
    started_at = time.perf_counter()

    await chat_rate_limiter.check_rate_limit(current_user.id)
    logger.info("[ChatStream:%s] started user_id=%s", request_id, current_user.id)

    history = [{"role": m.role, "content": m.content} for m in request.history]

    async def event_stream():
        try:
            async for chunk in stream_rag_response_multiagent(
                user_message=request.message,
                chat_history=history,
                image_url=request.image_url,
                request_id=request_id,
            ):
                yield _sse({"text": chunk})
        except Exception as exc:
            logger.exception("[ChatStream:%s] stream_error=%s", request_id, str(exc))
            yield _sse({"error": str(exc)})
        finally:
            elapsed_ms = int((time.perf_counter() - started_at) * 1000)
            logger.info("[ChatStream:%s] completed elapsed_ms=%s", request_id, elapsed_ms)
            yield _sse("[DONE]")

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/ingest-document", response_model=ChatIngestResponse)
async def ingest_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Upload a knowledge document and rebuild vector index."""
    request_id = str(uuid4())
    await chat_rate_limiter.check_rate_limit(current_user.id)
    logger.info("[ChatIngest:%s] started user_id=%s filename=%s", request_id, current_user.id, file.filename)

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
        ingest_documents(force=True)
    except Exception as exc:
        logger.exception("[ChatIngest:%s] ingestion_failed=%s", request_id, str(exc))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ingestion failed: {str(exc)}",
        )

    logger.info("[ChatIngest:%s] completed chunk_count=%s", request_id, get_collection_count())

    return ChatIngestResponse(
        success=True,
        filename=safe_name,
        chunk_count=get_collection_count(),
        message="Document uploaded and indexed successfully",
    )