
from groq import AsyncGroq
from core.config import settings
from rag.vector_store import get_vector_store
import logging

logger = logging.getLogger(__name__)

groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)


RITUAL_PROMPT = """You are a CULTURAL ANTHROPOLOGIST specializing in Garhwali Hindu traditions and the Raj Jat Yatra.

**Your Expertise:**
- Religious ceremonies and rituals performed during the Yatra
- Jagar (जागर) singing tradition and its significance
- Mythology of Nanda Devi, Shiva, and related deities
- Sacred objects (Chausingha ram, ceremonial items)
- Cultural protocols and proper etiquette for pilgrims
- Local beliefs, folklore, and oral traditions
- Differences between Kumaoni and Garhwali practices

**Your Approach:**
- Be RESPECTFUL and culturally sensitive
- Explain religious significance without judgment
- Use Sanskrit/Hindi terms WITH English translations
- Acknowledge variations in practices between communities
- Provide cultural context for rituals
- Honor the sacred nature of the pilgrimage

**Important:**
- Use proper transliteration for Sanskrit/Hindi terms
- Explain symbolism and meaning, not just procedures
- Acknowledge when practices vary regionally
- Respect that some knowledge is sacred/restricted

**Context from cultural documents:**
{context}

**Question:**
{query}

**Your Answer (as a cultural expert):**"""


async def ritual_agent(query: str) -> tuple[str, list, list[float | None]]:
    """
    Specialized agent for ritual and cultural queries.
    
    Args:
        query: User's ritual/cultural question
    
    Returns:
        (answer, retrieved_documents)
    """
    try:
        # Retrieve ritual/cultural documents with score when available
        vector_store = get_vector_store()
        try:
            scored_results = vector_store.similarity_search_with_score(query, k=5)
            docs = [doc for doc, _ in scored_results]
            doc_scores: list[float | None] = [float(score) for _, score in scored_results]
        except Exception:
            docs = vector_store.similarity_search(query, k=5)
            doc_scores = [None for _ in docs]
        
        # Build context
        context = "\n\n".join([
            f"[Cultural Document {i+1}] {doc.page_content}"
            for i, doc in enumerate(docs)
        ])
        
        # Generate culturally-aware answer
        response = await groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "user", "content": RITUAL_PROMPT.format(
                    context=context,
                    query=query
                )}
            ],
            temperature=0.3,  # Slightly higher for nuanced cultural explanations
            max_tokens=500,
        )
        
        answer = response.choices[0].message.content
        logger.info(f"Ritual Agent generated answer ({len(answer)} chars)")
        
        return answer, docs, doc_scores
    
    except Exception as e:
        logger.error(f"Error in ritual agent: {str(e)}")
        return f"I encountered an error while retrieving cultural information: {str(e)}", [], []