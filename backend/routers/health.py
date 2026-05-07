from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from sqlalchemy import text

from core.config import settings
from core.rate_limiter import get_redis_client
from db.database import engine
from rag.vector_store import get_collection_count

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
def health_liveness():
	"""Basic liveness probe."""
	return {"status": "ok", "service": settings.APP_NAME}


@router.get("/ready")
def health_readiness():
	"""Readiness probe for production deployments."""
	checks: dict[str, bool | int] = {
		"database": False,
		"redis": False,
		"vector_store": False,
		"groq_key_configured": bool(settings.GROQ_API_KEY),
		"vector_chunk_count": 0,
	}

	try:
		with engine.connect() as conn:
			conn.execute(text("SELECT 1"))
		checks["database"] = True
	except Exception:
		checks["database"] = False

	try:
		checks["redis"] = bool(get_redis_client().ping())
	except Exception:
		checks["redis"] = False

	try:
		count = get_collection_count()
		checks["vector_chunk_count"] = count
		checks["vector_store"] = count > 0
	except Exception:
		checks["vector_store"] = False

	ready = bool(
		checks["database"]
		and checks["redis"]
		and checks["groq_key_configured"]
		and checks["vector_store"]
	)

	payload = {
		"status": "ready" if ready else "not_ready",
		"checks": checks,
	}
	if ready:
		return payload

	return JSONResponse(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, content=payload)
