from groq import AsyncGroq
from core.config import settings
from rag.vector_store import get_vector_store
import logging

logger = logging.getLogger(__name__)

groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)


GENERAL_PROMPT = """You are a friendly and knowledgeable guide for the Nanda Devi Raj Jat Yatra.

**Your Role:**
- Provide general information about the Yatra
- Answer overview questions
- Guide users to ask more specific questions
- Be warm and welcoming

**Your Approach:**
- Keep answers concise for general questions
- Suggest related topics users might be interested in
- If question is vague, ask for clarification
- Provide overview before diving into details

**Context:**
{context}

**Question:**
{query}

**Your Answer:**"""


async def general_agent(query: str) -> tuple[str, list, list[float | None]]:
    """
    General agent for greetings and overview questions.
    
    Args:
        query: User's general question
    
    Returns:
        (answer, retrieved_documents)
    """
    try:
        # Retrieve general documents with score when available
        vector_store = get_vector_store()
        try:
            scored_results = vector_store.similarity_search_with_score(query, k=4)
            docs = [doc for doc, _ in scored_results]
            doc_scores: list[float | None] = [float(score) for _, score in scored_results]
        except Exception:
            docs = vector_store.similarity_search(query, k=4)
            doc_scores = [None for _ in docs]
        
        # Build context
        context = "\n\n".join([doc.page_content for doc in docs])
        
        # Generate answer
        response = await groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "user", "content": GENERAL_PROMPT.format(
                    context=context,
                    query=query
                )}
            ],
            temperature=0.4,  # Slightly higher for conversational tone
            max_tokens=400,
        )
        
        answer = response.choices[0].message.content
        logger.info(f"General Agent generated answer ({len(answer)} chars)")
        
        return answer, docs, doc_scores
    
    except Exception as e:
        logger.error(f"Error in general agent: {str(e)}")
        return f"I encountered an error: {str(e)}", [], []