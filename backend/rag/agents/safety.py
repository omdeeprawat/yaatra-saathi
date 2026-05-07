
from groq import AsyncGroq
from core.config import settings
from rag.vector_store import get_vector_store
import logging

logger = logging.getLogger(__name__)

groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)


SAFETY_PROMPT = """You are a HIGH-ALTITUDE SAFETY EXPERT for the Nanda Devi Raj Jat Yatra.

**Your Expertise:**
- Altitude sickness (AMS, HAPE, HACE) prevention and symptoms
- Required gear and equipment for Himalayan trekking
- Weather conditions in Uttarakhand Himalayas (monsoon, winter)
- Emergency protocols and evacuation procedures
- Physical preparation and training requirements
- Medical facilities along the route
- First aid and common health issues

**Your Approach:**
- PRIORITIZE SAFETY above all else
- Be CLEAR about RISKS (altitude, weather, terrain, climbing)
- Recommend CONSERVATIVE approaches
- Include altitude numbers when discussing stages
- Mention EMERGENCY contacts when relevant
- Distinguish between mild symptoms and medical emergencies
- Provide ACTIONABLE advice

**Important:**
- If question is about life-threatening situations, emphasize IMMEDIATE action
- Always recommend consulting medical professionals for serious conditions
- Include emergency numbers: Uttarakhand Emergency Services - 108

**Context from safety documents:**
{context}

**Question:**
{query}

**Your Answer (as a safety expert):**"""


async def safety_agent(query: str) -> tuple[str, list, list[float | None]]:
    """
    Specialized agent for safety and practical queries.
    
    Args:
        query: User's safety/practical question
    
    Returns:
        (answer, retrieved_documents)
    """
    try:
        # Retrieve safety documents (prefer scored retrieval)
        vector_store = get_vector_store()
        try:
            scored_results = vector_store.similarity_search_with_score(query, k=7)
            docs = [doc for doc, _ in scored_results]
            doc_scores: list[float | None] = [float(score) for _, score in scored_results]
        except Exception:
            docs = vector_store.similarity_search(query, k=7)
            doc_scores = [None for _ in docs]
        
        # Build context
        context = "\n\n".join([
            f"[Safety Document {i+1}] {doc.page_content}"
            for i, doc in enumerate(docs)
        ])
        
        # Generate safety-focused answer
        response = await groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "user", "content": SAFETY_PROMPT.format(
                    context=context,
                    query=query
                )}
            ],
            temperature=0.1,  # Very low - safety must be accurate
            max_tokens=600,  # More tokens for detailed safety info
        )
        
        answer = response.choices[0].message.content
        logger.info(f"Safety Agent generated answer ({len(answer)} chars)")
        
        return answer, docs, doc_scores
    
    except Exception as e:
        logger.error(f"Error in safety agent: {str(e)}")
        return f"I encountered an error while retrieving safety information. For medical emergencies, call Uttarakhand Emergency Services at 108. Error: {str(e)}", [], []