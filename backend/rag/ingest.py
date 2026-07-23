
import os
import sys
import time
from typing import List
import logging

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pathlib import Path
from langchain_community.document_loaders import (
    TextLoader,
    PyPDFLoader,
    UnstructuredMarkdownLoader,
)
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from rag.vector_store import get_vector_store, get_chroma_client, get_collection_count,collection_exists_and_has_docs
from core.config import settings


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'   
)
logger = logging.getLogger(__name__)


DOCUMENTS_DIR = Path(__file__).parent / "documents"

# LOADER_MAP = {
#     ".txt": TextLoader,
#     ".md":  UnstructuredMarkdownLoader,
#     ".pdf": PyPDFLoader,
# }


def load_documents(docs_path:Path) -> List:
    """Load all supported documents from the documents/ directory."""
    logger.info(f"[1/3] Loading documents from {docs_path} ...")
    documents = []
    supported_extensions = {'.txt': TextLoader, '.pdf': PyPDFLoader, '.md': UnstructuredMarkdownLoader}

    if not docs_path.exists():
        raise FileNotFoundError(f'documents directory not found: {docs_path}')


    file_count = 0
    for file_path in docs_path.glob('*'):
        if file_path.suffix.lower() in supported_extensions:
            try:
                loader_class = supported_extensions[file_path.suffix.lower()]
                loader = loader_class(str(file_path))
                docs = loader.load()

                for doc in docs:
                    doc.metadata["source"] = file_path.name
                    doc.metadata["file_path"] = str(file_path)
                
                documents.extend(docs)
                file_count += 1
                logger.info(f"  ✓ Loaded {file_path.name} ({len(docs)} page(s))")

            except Exception as e:
                logger.error(f"  ✗ Failed to load {file_path.name}: {str(e)}")
    
    logger.info(f"Found {file_count} documents, total {len(documents)} pages")
    return documents


def split_documents(documents: List) -> List:
    """Split documents into overlapping chunks for embedding."""
    logger.info(f"[2/3] Splitting into chunks ...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.RAG_CHUNK_SIZE,
        chunk_overlap=settings.RAG_CHUNK_OVERLAP,
        length_function=len,
    )
    
    chunks = text_splitter.split_documents(documents)
    logger.info(f"Created {len(chunks)} chunks")
    
    return chunks


def store_in_vector_db(chunks: List, force: bool = False):
    """
    Store chunks in ChromaDB vector store.
    
    Args:
        chunks: Document chunks to store
        force: If True, delete existing collection and recreate
    """
    logger.info(f"[3/3] Generating embeddings and storing in ChromaDB ...")
    
    # Check if collection exists
    exists = collection_exists_and_has_docs()
    
    if exists and not force:
        logger.warning("Collection already exists with documents. Use --force to re-ingest.")
        return {"status": "skipped", "chunk_count": 0}
    
    if force and exists:
        logger.info("Force flag set. Deleting existing collection...")
        client = get_chroma_client()
        try:
            client.delete_collection(settings.CHROMA_COLLECTION)
            logger.info("  ✓ Existing collection deleted")
        except Exception as e:
            logger.warning(f"  ! Could not delete collection: {str(e)}")
    
    # Store chunks
    vector_store = get_vector_store()
    
    try:
        # Add documents in batches to avoid memory issues
        batch_size = 50
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i:i+batch_size]
            vector_store.add_documents(batch)
            logger.info(f"  ✓ Stored batch {i//batch_size + 1} ({len(batch)} chunks)")
        
        logger.info(f"✓ Ingestion complete")
        logger.info(f"✓ {len(chunks)} chunks stored in ChromaDB")
        
        return {"status": "success", "chunk_count": len(chunks)}
    
    except Exception as e:
        logger.error(f"✗ Failed to store in vector DB: {str(e)}")
        raise



def ingest_documents(force: bool = False) -> dict:
    """
    Main ingestion function.
    
    Args:
        force: If True, re-ingest even if collection exists
    
    Returns:
        dict with status and chunk count
    """
    try:
        docs_path = Path(__file__).parent / "documents"
        
        # Load documents
        documents = load_documents(docs_path)
        
        if not documents:
            logger.warning("No documents found to ingest!")
            return {"status": "no_documents", "chunk_count": 0}
        
        # Split into chunks
        chunks = split_documents(documents)
        
        # Store in vector DB
        result = store_in_vector_db(chunks, force=force)
        
        return result
    
    except Exception as e:
        logger.error(f"Ingestion failed: {str(e)}", exc_info=True)
        raise
 
 
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Ingest documents into vector store")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Force re-ingestion even if collection exists"
    )
    
    args = parser.parse_args()
    
    try:
        result = ingest_documents(force=args.force)
        
        if result["status"] == "success":
            logger.info(f"✓ Successfully ingested {result['chunk_count']} chunks")
            sys.exit(0)
        elif result["status"] == "skipped":
            logger.info("✓ Ingestion skipped (collection exists). Use --force to re-ingest.")
            sys.exit(0)
        else:
            logger.warning(f"⚠ Ingestion completed with status: {result['status']}")
            sys.exit(0)
    
    except Exception as e:
        logger.error(f"✗ Ingestion failed: {str(e)}")
        sys.exit(1)