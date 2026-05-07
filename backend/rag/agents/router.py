
from groq import AsyncGroq
from core.config import settings
import logging

logger = logging.getLogger(__name__)

groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)


ROUTER_PROMPT = """You are a query classifier for the Nanda Devi Raj Jat Yatra knowledge base.

Classify the following query into ONE of these categories:

**Categories:**
1. **history** - Historical facts, dates, past Yatras (1987, 2000, 2014), dynasties, royal patronage, evolution of traditions
   Examples: "When was the first Raj Jat?", "What happened in 2014 Yatra?", "Who were the Katyuri kings?"

2. **safety** - Altitude sickness, medical advice, gear/equipment, weather, physical preparation, emergency protocols
   Examples: "What are AMS symptoms?", "What gear do I need?", "How to prepare physically?"

3. **ritual** - Religious ceremonies, Jagar tradition, mythology, cultural protocols, sacred objects, Nanda Devi worship
   Examples: "What is Jagar?", "What rituals are performed?", "Tell me about the Chausingha"

4. **route** - Geography, stages, distances, terrain, waypoints, campsites, elevation, navigation
   Examples: "How far is Wan to Bedni?", "What's the altitude at Homkund?", "Describe the route"

5. **general** - Greetings, general questions, unclear queries, anything not fitting above categories
   Examples: "Hello", "What is Raj Jat?", "Tell me about the Yatra"

**Query:** {query}

**Instructions:**
- Respond with ONLY the category name (one word: history, safety, ritual, route, or general)
- If query spans multiple categories, choose the PRIMARY category
- If unclear, choose "general"
- No explanation, just the category name

**Category:**"""


async def route_query(query: str) -> str:
    """
    Classify user query to determine which specialist agent should handle it.
    
    Args:
        query: User's question
    
    Returns:
        Category string: "history" | "safety" | "ritual" | "route" | "general"
    """
    try:
        response = await groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",  # Fast model for routing
            messages=[
                {"role": "user", "content": ROUTER_PROMPT.format(query=query)}
            ],
            temperature=0.0,  # Deterministic
            max_tokens=10,
        )
        
        category = response.choices[0].message.content.strip().lower()
        
        # Validate category
        valid_categories = ["history", "safety", "ritual", "route", "general"]
        if category not in valid_categories:
            logger.warning(f"Invalid category '{category}' returned by router. Defaulting to 'general'")
            return "general"
        
        logger.info(f"Router classified query as: {category}")
        return category
    
    except Exception as e:
        logger.error(f"Error in router agent: {str(e)}")
        return "general"  # Fallback to general agent