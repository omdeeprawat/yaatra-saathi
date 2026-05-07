
import logging

logger = logging.getLogger(__name__)


def synthesizer_agent(
    agent_response: str,
    agent_name: str,
    docs: list,
    verified: bool,
    verification_issues: list,
    confidence_score: float
) -> str:
    """
    Synthesize final answer with proper formatting and attribution.
    
    Args:
        agent_response: Specialist agent's answer
        agent_name: Name of specialist (e.g., "History Agent")
        docs: Retrieved documents
        verified: Whether answer passed verification
        verification_issues: List of verification problems
        confidence_score: Confidence score (0.0 to 1.0)
    
    Returns:
        Formatted final answer with sources and verification badge
    """
    try:
        # Start with agent's answer
        output = agent_response
        
        # Add source attribution
        if docs:
            output += "\n\n---\n**Sources:**\n"
            
            # Deduplicate sources by filename
            seen_sources = set()
            source_num = 1
            
            for doc in docs:
                source = doc.metadata.get("source", "unknown")
                if source not in seen_sources:
                    seen_sources.add(source)
                    output += f"[{source_num}] {source}\n"
                    source_num += 1
        
        # Add verification badge
        output += "\n"
        if verified:
            output += "✓ **Verified** against source documents"
        else:
            output += "⚠️ **Partial verification** - some information could not be fully verified"
            if verification_issues:
                output += "\n   Issues: " + "; ".join(verification_issues[:2])  # Show first 2 issues
        
        # Add confidence score if low
        if confidence_score < 0.8:
            output += f"\n   Confidence: {confidence_score:.0%}"
        
        # Add agent attribution (subtle)
        output += f"\n\n*Answered by {agent_name}*"
        
        logger.info(f"Synthesizer created final answer ({len(output)} chars)")
        
        return output
    
    except Exception as e:
        logger.error(f"Error in synthesizer: {str(e)}")
        # Fallback: return original answer
        return agent_response