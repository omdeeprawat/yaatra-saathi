
import os
import sys
import time


sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pathlib import Path
from langchain_community.document_loaders import (
    TextLoader,
    PyPDFLoader,
    UnstructuredMarkdownLoader,
)
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from rag.vector_store import get_vector_store, get_chroma_client, get_collection_count
from core.config import settings

DOCUMENTS_DIR = Path(__file__).parent / "documents"

LOADER_MAP = {
    ".txt": TextLoader,
    ".md":  UnstructuredMarkdownLoader,
    ".pdf": PyPDFLoader,
}


def load_documents() -> list[Document]:
    """Load all supported documents from the documents/ directory."""
    docs: list[Document] = []

    if not DOCUMENTS_DIR.exists():
        print(f"[ERROR] Documents directory not found: {DOCUMENTS_DIR}")
        sys.exit(1)

    files = list(DOCUMENTS_DIR.iterdir())
    if not files:
        print("[ERROR] No files found in rag/documents/")
        sys.exit(1)

    for file_path in sorted(files):
        suffix = file_path.suffix.lower()
        if suffix not in LOADER_MAP:
            print(f"  [SKIP] Unsupported format: {file_path.name}")
            continue

        try:
            loader_cls = LOADER_MAP[suffix]
            loader = loader_cls(str(file_path))
            file_docs = loader.load()

            # Tagging each chunk with its source filename
            for doc in file_docs:
                doc.metadata["source"] = file_path.name
                doc.metadata["file_type"] = suffix.lstrip(".")

            docs.extend(file_docs)
            print(f"  [OK]   Loaded {len(file_docs)} page(s) from {file_path.name}")
        except Exception as e:
            print(f"  [FAIL] Could not load {file_path.name}: {e}")

    return docs


def split_documents(docs: list[Document]) -> list[Document]:
    """Split documents into overlapping chunks for embedding."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.RAG_CHUNK_SIZE,
        chunk_overlap=settings.RAG_CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", "? ", "! ", " ", ""],
        length_function=len,
    )

    chunks = splitter.split_documents(docs)
    print(f"\n  Split into {len(chunks)} chunks "
          f"(size={settings.RAG_CHUNK_SIZE}, overlap={settings.RAG_CHUNK_OVERLAP})")
    return chunks


def ingest(force: bool = False) -> None:
    """
    Main ingestion pipeline.
    Set force=True to wipe the existing collection and re-ingest.
    """
    print("\n" + "=" * 60)
    print("  YATRA SAATHI — RAG INGESTION PIPELINE")
    print("=" * 60)

    
    if force:
        print("\n[FORCE] Deleting existing collection...")
        try:
            client = get_chroma_client()
            client.delete_collection(settings.CHROMA_COLLECTION)
            print("  [OK] Collection deleted.")
        except Exception:
            print("  [OK] No existing collection to delete.")

    # Check if already ingested 
    current_count = get_collection_count()
    if current_count > 0 and not force:
        print(f"\n[INFO] Vector store already has {current_count} chunks.")
        print("  Run with force=True to re-ingest: python -m rag.ingest --force")
        print("  Skipping ingestion.\n")
        return

    # Load 
    print(f"\n[1/3] Loading documents from {DOCUMENTS_DIR} ...")
    docs = load_documents()
    print(f"  Total pages loaded: {len(docs)}")

    # Split 
    print("\n[2/3] Splitting into chunks ...")
    chunks = split_documents(docs)

    # Embed and store
    print(f"\n[3/3] Generating embeddings and storing in ChromaDB ...")
    print(f"  Model: {settings.EMBED_MODEL}")
    print(f"  Target path: {settings.CHROMA_DB_PATH}")
    print(f"  Collection: {settings.CHROMA_COLLECTION}")
    print(f"  Chunks to embed: {len(chunks)}")
    print("  (This may take 30–60 seconds depending on document size)")

    start = time.time()
    vector_store = get_vector_store()

    # Add in batches of 50 to avoid rate limits
    batch_size = 50
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i : i + batch_size]
        vector_store.add_documents(batch)
        print(f"  Embedded {min(i + batch_size, len(chunks))}/{len(chunks)} chunks...")
        time.sleep(0.5)  

    elapsed = time.time() - start
    final_count = get_collection_count()

    print(f"\n{'=' * 60}")
    print(f"  ✓ Ingestion complete in {elapsed:.1f}s")
    print(f"  ✓ {final_count} chunks stored in ChromaDB")
    print(f"  ✓ Vector store ready at: {settings.CHROMA_DB_PATH}")
    print(f"{'=' * 60}\n")


if __name__ == "__main__":
    force_flag = "--force" in sys.argv
    ingest(force=force_flag)