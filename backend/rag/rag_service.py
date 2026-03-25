from typing import AsyncGenerator
from langchain_core.documents import Document
from groq import AsyncGroq
from rag.vector_store import get_vector_store
from core.config import settings

# Async Groq client
_groq_client: AsyncGroq | None = None


def get_groq_client() -> AsyncGroq:
    global _groq_client
    if _groq_client is None:
        _groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)
    return _groq_client



SYSTEM_PROMPT = """You are Yatra Saathi, a knowledgeable and respectful AI guide \
for the Nanda Devi Raj Jat Yatra — a sacred Hindu pilgrimage held every twelve years \
in the Himalayas of Uttarakhand, India.

You answer questions about the Yatra's history, route, rituals, mythology, practical \
preparation, safety, culture, and the communities involved.

Guidelines:
- Always answer based on the provided context. If the context does not contain \
enough information to answer, say so honestly — do not fabricate details.
- Be warm, respectful, and culturally sensitive. This is a sacred tradition.
- Use simple, clear language. Many pilgrims may not be technical users.
- When giving route or safety information, be precise and include altitudes where known.
- If asked about something outside the Yatra, politely redirect to Yatra-related topics.
- Respond in the same language the user writes in (Hindi or English).
- Format your response clearly using paragraphs. Use bullet points only when listing \
multiple items like packing lists or safety tips.
"""


def retrieve_context(query: str, top_k: int | None = None) -> list[Document]:
    """Retrieve the most relevant document chunks for a given query."""
    k = top_k or settings.RAG_TOP_K
    vector_store = get_vector_store()
    docs = vector_store.similarity_search(query, k=k)
    return docs


def build_context_string(docs: list[Document]) -> str:
    """Format retrieved chunks into a single context block for the prompt."""
    if not docs:
        return "No relevant context found in the knowledge base."

    parts = []
    for i, doc in enumerate(docs, 1):
        source = doc.metadata.get("source", "unknown")
        parts.append(f"[Source {i}: {source}]\n{doc.page_content.strip()}")

    return "\n\n---\n\n".join(parts)


async def stream_rag_response(
    user_message: str,
    chat_history: list[dict] | None = None,
    image_url: str | None = None,
) -> AsyncGenerator[str, None]:
    """
    RAG pipeline with Groq streaming.
    
    Uses Groq's llama-3.3-70b-versatile for ultra-fast free inference.
    """
    if not settings.GROQ_API_KEY:
        yield "Groq API key is not configured. Please add GROQ_API_KEY to your .env file."
        return

    # step 1: retrieve relevant chunks 
    docs = retrieve_context(user_message)
    context = build_context_string(docs)

    # step 2: build message array 
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    # adding chat history (last 6 turns to stay within context window)
    if chat_history:
        messages.extend(chat_history[-6:])

    # building the user message
    # Groq doesn't support vision yet, so we ignore the image_url
    user_content = (
        f"Context from knowledge base:\n\n{context}\n\n"
        f"User question: {user_message}"
    )

    messages.append({"role": "user", "content": user_content})

    # step 3: stream from Groq 
    client = get_groq_client()
    try:
        stream = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",  
            messages=messages,
            stream=True,
            temperature=0.3,        
            max_tokens=1024,
        )

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    except Exception as e:
        yield f"\n\n[Error generating response: {str(e)}]"