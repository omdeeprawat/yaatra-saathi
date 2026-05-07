
from groq import AsyncGroq
from core.config import settings
from rag.vector_store import get_vector_store
import logging

logger = logging.getLogger(__name__)

groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)


ROUTE_PROMPT = """You are an experienced MOUNTAIN GUIDE with 20+ years of experience on Raj Jat routes.

**Your Expertise:**
- All 11 sacred stops from Nauti to Homkund
- Stage-by-stage distances and walking times
- Elevation profiles and altitude gains
- Terrain difficulty (easy/moderate/difficult)
- Campsites, facilities, and water sources
- Alternative routes and shortcuts (if any)
- Seasonal conditions affecting the route
- GPS coordinates and navigation landmarks

**Your Approach:**
- ALWAYS include ALTITUDE and DISTANCE when discussing stops
- Rate terrain difficulty honestly (easy/moderate/difficult/extreme)
- Mention cumulative distance from start
- Include camp/facility information
- Warn about challenging sections
- Provide walking time estimates
- Reference specific waypoints and landmarks

**Important:**
- Use metric units (meters for altitude, kilometers for distance)
- Mention if route conditions vary by season
- Indicate if information is approximate
- Include practical logistics (camps, water, etc.)

**Context from route documents:**
{context}

**Question:**
{query}

**Your Answer (as a mountain guide):**"""


async def route_agent(query: str) -> tuple[str, list, list[float | None]]:
    """
    Specialized agent for route and geography queries.
    
    Args:
        query: User's route/geography question
    
    Returns:
        (answer, retrieved_documents)
    """
    try:
        # Retrieve route documents (prefer scored retrieval)
        vector_store = get_vector_store()
        try:
            scored_results = vector_store.similarity_search_with_score(query, k=6)
            docs = [doc for doc, _ in scored_results]
            doc_scores: list[float | None] = [float(score) for _, score in scored_results]
        except Exception:
            docs = vector_store.similarity_search(query, k=6)
            doc_scores = [None for _ in docs]
        
        # Build context
        context = "\n\n".join([
            f"[Route Document {i+1}] {doc.page_content}"
            for i, doc in enumerate(docs)
        ])
        
        # Generate route-specific answer
        response = await groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "user", "content": ROUTE_PROMPT.format(
                    context=context,
                    query=query
                )}
            ],
            temperature=0.2,  # Low for factual accuracy
            max_tokens=500,
        )
        
        answer = response.choices[0].message.content
        logger.info(f"Route Agent generated answer ({len(answer)} chars)")
        
        return answer, docs, doc_scores
    
    except Exception as e:
        logger.error(f"Error in route agent: {str(e)}")
        return f"I encountered an error while retrieving route information: {str(e)}", [], []