
from groq import AsyncGroq
from core.config import settings
from rag.vector_store import get_vector_store
import logging

logger = logging.getLogger(__name__)

groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)


HISTORY_PROMPT = """You are a HISTORIAN specializing in the Nanda Devi Raj Jat Yatra.

**Your Expertise:**
- Historical records from 1000 AD onwards
- Royal dynasties (Katyuri, Chand, Parmar)
- Past Yatra accounts (1987, 2000, 2014)
- Evolution of traditions over centuries
- Documented pilgrimage history

**Your Approach:**
- Be PRECISE with dates (use exact years when known)
- Cite dynasties and rulers when relevant
- Distinguish between legend and historical record
- If unsure about dates, say "approximately" or "circa"
- Reference specific Yatras when discussing changes

**Important:**
- Answer ONLY historical questions
- Use the context provided below
- If information is not in context, say "I don't have that information"
- Do NOT make up dates or facts

**Context from historical documents:**
{context}

**Question:**
{query}

**Your Answer (as a historian):**"""


async def history_agent(query: str) -> tuple[str, list, list[float | None]]:
    """
    Specialized agent for historical queries.
    
    Args:
        query: User's historical question
    
    Returns:
        (answer, retrieved_documents)
    """
    try:
        # Retrieve historical documents with score when available
        vector_store = get_vector_store()
        try:
            scored_results = vector_store.similarity_search_with_score(query, k=5)
            docs = [doc for doc, _ in scored_results]
            doc_scores: list[float | None] = [float(score) for _, score in scored_results]
        except Exception:
            docs = vector_store.similarity_search(query, k=5)
            doc_scores = [None for _ in docs]
        
        # Build context from retrieved docs
        context = "\n\n".join([
            f"[Document {i+1}] {doc.page_content}"
            for i, doc in enumerate(docs)
        ])
        
        # Generate historical answer
        response = await groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "user", "content": HISTORY_PROMPT.format(
                    context=context,
                    query=query
                )}
            ],
            temperature=0.2,  # Low temperature for factual accuracy
            max_tokens=500,
        )
        
        answer = response.choices[0].message.content
        logger.info(f"History Agent generated answer ({len(answer)} chars)")
        
        return answer, docs, doc_scores
    
    except Exception as e:
        logger.error(f"Error in history agent: {str(e)}")
        return f"I encountered an error while retrieving historical information: {str(e)}", [], []