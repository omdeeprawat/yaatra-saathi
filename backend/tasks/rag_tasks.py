from celery import Task
from celery_app import celery_app
import logging
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

logger = logging.getLogger(__name__)


class IngestionTask(Task):
    """Base task for ingestion with logging"""
    
    def on_success(self, retval, task_id, args, kwargs):
        admin_id = kwargs.get('admin_id') or (args[0] if args else None)
        logger.info(f"Ingestion completed successfully by admin {admin_id}. Task: {task_id}")
    
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        admin_id = kwargs.get('admin_id') or (args[0] if args else None)
        logger.error(f"Ingestion failed for admin {admin_id}. Task: {task_id}. Error: {exc}")


@celery_app.task(base=IngestionTask, name="tasks.ingest_documents", bind=True)
def ingest_documents_task(self, admin_id: int, force: bool = False):
    """
    Run document ingestion as background task.
    
    Args:
        admin_id: ID of admin who triggered ingestion
        force: Whether to force re-ingestion
    
    Returns:
        dict with success status and chunk count
    """
    try:
        # Import here to avoid circular imports
        from rag.ingest import ingest_documents
        
        logger.info(f"Starting ingestion task for admin {admin_id} (force={force})")
        
        # Run ingestion
        result = ingest_documents(force=force)
        
        chunk_count = result.get("chunk_count", 0)
        
        logger.info(f"Ingestion completed: {chunk_count} chunks")
        
        # TODO: Store ingestion log in database
        # IngestionLog.create(
        #     admin_id=admin_id,
        #     status="success",
        #     chunks_created=chunk_count,
        #     task_id=self.request.id
        # )
        
        return {
            "success": True,
            "admin_id": admin_id,
            "chunks": chunk_count,
            "task_id": self.request.id
        }
    
    except Exception as e:
        logger.error(f"Ingestion failed: {str(e)}", exc_info=True)
        
        # TODO: Store failure in database
        # IngestionLog.create(
        #     admin_id=admin_id,
        #     status="failed",
        #     error_message=str(e),
        #     task_id=self.request.id
        # )
        
        raise