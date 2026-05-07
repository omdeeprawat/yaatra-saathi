"""
Multi-Agent RAG Service
Main interface for using the multi-agent system
"""
from rag.agents.graph import agent_graph
from typing import AsyncGenerator
import asyncio
import logging

logger = logging.getLogger(__name__)

MAX_HISTORY_MESSAGES = 12
ALLOWED_ROLES = {"user", "assistant", "system"}


def _sanitize_history(chat_history: list[dict] | None) -> list[dict[str, str]]:
    if not chat_history:
        return []

    sanitized: list[dict[str, str]] = []
    for item in chat_history[-MAX_HISTORY_MESSAGES:]:
        if not isinstance(item, dict):
            continue
        role = str(item.get("role", "")).strip().lower()
        content = str(item.get("content", "")).strip()
        if role in ALLOWED_ROLES and content:
            sanitized.append({"role": role, "content": content})
    return sanitized


async def stream_rag_response_multiagent(
    user_message: str,
    chat_history: list[dict] | None = None,
    image_url: str | None = None,
    request_id: str | None = None,
) -> AsyncGenerator[str, None]:
    """
    Stream RAG response using multi-agent system.
    
    This replaces the single-agent RAG system with a sophisticated
    multi-agent workflow that provides better accuracy and transparency.
    
    Args:
        user_message: User's question
        chat_history: Previous conversation (optional)
        image_url: Attached image URL (optional)
    
    Yields:
        Chunks of the response as they're generated
    
    Example:
        async for chunk in stream_rag_response_multiagent("What is Jagar?"):
            print(chunk, end="")
    """
    try:
        history = _sanitize_history(chat_history)

        initial_state = {
            "query": user_message,
            "messages": history,
            "image_url": image_url,
        }

        rid = request_id or "n/a"
        logger.info(f"[Multi-Agent:{rid}] Starting query: {user_message[:100]}...")

        if image_url:
            logger.info(f"[Multi-Agent:{rid}] image_url received but vision analysis is not enabled; proceeding with text-only reasoning")

        result = await agent_graph.ainvoke(initial_state)

        final_answer = result.get("final_answer", "I couldn't generate a response.")

        if not final_answer:
            final_answer = "I couldn't generate a response. Please try again."

        chunk_size = 180
        for i in range(0, len(final_answer), chunk_size):
            yield final_answer[i:i + chunk_size]

        logger.info(f"[Multi-Agent:{rid}] Completed. Route: {result.get('route')}, Verified: {result.get('verified')}, Confidence: {result.get('confidence_score')}")

    except asyncio.CancelledError:
        logger.info(f"[Multi-Agent:{request_id or 'n/a'}] Stream cancelled by client")
        raise
    except Exception as e:
        logger.error(f"[Multi-Agent:{request_id or 'n/a'}] Error: {str(e)}", exc_info=True)
        yield "I encountered an internal error while processing your request. Please try again."


async def get_rag_response_multiagent(
    user_message: str,
    chat_history: list[dict] | None = None,
    image_url: str | None = None,
) -> dict:
    """
    Get RAG response using multi-agent system (non-streaming).
    
    Useful for testing or when you need the complete response.
    
    Args:
        user_message: User's question
        chat_history: Previous conversation (optional)
        image_url: Attached image URL (optional)
    
    Returns:
        {
            "answer": str,
            "route": str,
            "agent_name": str,
            "verified": bool,
            "confidence": float,
            "sources": list,
        }
    """
    try:
        history = _sanitize_history(chat_history)

        initial_state = {
            "query": user_message,
            "messages": history,
            "image_url": image_url,
        }
        
        logger.info(f"[Multi-Agent] Processing query: {user_message[:100]}...")
        
        # Run the graph
        result = await agent_graph.ainvoke(initial_state)
        
        return {
            "answer": result.get("final_answer", ""),
            "route": result.get("route", "unknown"),
            "agent_name": result.get("agent_name", "Unknown Agent"),
            "verified": result.get("verified", False),
            "confidence": result.get("confidence_score", 0.0),
            "sources": result.get("sources", []),
            "issues": result.get("verification_issues", []),
        }
    
    except Exception as e:
        logger.error(f"[Multi-Agent] Error: {str(e)}", exc_info=True)
        return {
            "answer": f"I encountered an error: {str(e)}",
            "route": "error",
            "agent_name": "Error Handler",
            "verified": False,
            "confidence": 0.0,
            "sources": [],
            "issues": [str(e)],
        }