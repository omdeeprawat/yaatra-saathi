import chromadb
from chromadb.config import Settings as ChromaSettings
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from core.config import settings

# singleton instances 
_chroma_client: chromadb.ClientAPI | None = None
_vector_store: Chroma | None = None


def get_embeddings() -> HuggingFaceEmbeddings:
    """
    Return HuggingFace embedding model.
    Uses sentence-transformers/all-MiniLM-L6-v2 (free, fast, good quality)
    """
    return HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={'device': 'cpu'},  # alternate use cuda if have gpu
        encode_kwargs={'normalize_embeddings': True}
    )


def get_chroma_client() -> chromadb.ClientAPI:
    """Return (or create) the persistent ChromaDB client."""
    global _chroma_client
    if _chroma_client is None:
        _chroma_client = chromadb.PersistentClient(
            path=settings.CHROMA_DB_PATH,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
    return _chroma_client


def get_vector_store() -> Chroma:
    """
    Return (or create) the LangChain Chroma wrapper.
    This is the object you call .similarity_search() on.
    """
    global _vector_store
    if _vector_store is None:
        client = get_chroma_client()
        _vector_store = Chroma(
            client=client,
            collection_name=settings.CHROMA_COLLECTION,
            embedding_function=get_embeddings(),
        )
    return _vector_store


def collection_exists_and_has_docs() -> bool:
    """Check whether the vector store has been populated."""
    try:
        client = get_chroma_client()
        collection = client.get_collection(settings.CHROMA_COLLECTION)
        return collection.count() > 0
    except Exception:
        return False


def get_collection_count() -> int:
    """Return total number of chunks stored in ChromaDB."""
    try:
        client = get_chroma_client()
        collection = client.get_collection(settings.CHROMA_COLLECTION)
        return collection.count()
    except Exception:
        return 0