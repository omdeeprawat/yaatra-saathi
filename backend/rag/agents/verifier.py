from groq import AsyncGroq
from core.config import settings
import json
import logging

logger = logging.getLogger(__name__)

groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)


VERIFIER_PROMPT = """You are a FACT-CHECKER. Your job is to verify if an AI's answer is supported by the source documents.

**Source Documents (Ground Truth):**
{context}

**AI's Answer to Verify:**
{answer}

**Your Task:**
Check each factual claim in the answer against the source documents:
1. Is each claim explicitly stated or clearly implied in the sources?
2. Are numbers, dates, and names accurate?
3. Are there any fabricated details not in the sources?
4. Is the answer faithful to the context?

**Respond ONLY with valid JSON (no markdown, no extra text):**
{{
  "verified": true or false,
  "issues": ["list of any unsupported claims, empty list if none"],
  "confidence": 0.0 to 1.0
}}

**Rules:**
- verified=true only if ALL claims are supported
- List specific issues if found
- confidence=1.0 if perfect match, 0.0 if completely unsupported
- Be strict but fair

**Your JSON response:**"""


def _extract_json_object(raw: str) -> str:
    text = raw.strip()
    if text.startswith("```"):
        text = text.strip("`")
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()

    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("No JSON object found in verifier output")
    return text[start:end + 1]


async def verifier_agent(answer: str, docs: list) -> dict:
    """
    Verify answer against retrieved documents.
    
    Args:
        answer: Agent's response to verify
        docs: Retrieved documents used to generate answer
    
    Returns:
        {
            "verified": bool,
            "issues": list[str],
            "confidence": float
        }
    """
    try:
        # Build context from documents
        context = "\n\n".join([
            f"[Source {i+1}] {doc.page_content}"
            for i, doc in enumerate(docs)
        ])
        
        # If no docs, can't verify
        if not docs:
            return {
                "verified": False,
                "issues": ["No source documents available for verification"],
                "confidence": 0.0
            }
        
        # Call verifier LLM
        response = await groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",  # Fast model for verification
            messages=[
                {"role": "user", "content": VERIFIER_PROMPT.format(
                    context=context[:3000],  # Limit context size
                    answer=answer[:1000]  # Limit answer size
                )}
            ],
            temperature=0.0,  # Deterministic
            max_tokens=200,
        )
        
        result_text = response.choices[0].message.content or ""
        parsed = json.loads(_extract_json_object(result_text))

        if not isinstance(parsed, dict):
            raise ValueError("Verifier response must be a JSON object")

        verified = bool(parsed.get("verified", False))
        issues = parsed.get("issues", [])
        confidence = parsed.get("confidence", 0.0)

        if not isinstance(issues, list):
            raise ValueError("Verifier field 'issues' must be a list")
        issues = [str(i) for i in issues if str(i).strip()]

        try:
            confidence = float(confidence)
        except (TypeError, ValueError):
            confidence = 0.0
        confidence = max(0.0, min(1.0, confidence))

        result = {
            "verified": verified,
            "issues": issues,
            "confidence": confidence,
        }
        
        logger.info(f"Verifier: verified={result['verified']}, confidence={result['confidence']:.2f}, issues={len(result['issues'])}")
        
        return result
    
    except (json.JSONDecodeError, ValueError) as e:
        logger.error(f"Verifier returned invalid output: {e}")
        return {
            "verified": False,
            "issues": ["Verification failed due to invalid verifier output"],
            "confidence": 0.0,
        }
    
    except Exception as e:
        logger.error(f"Error in verifier agent: {str(e)}")
        return {
            "verified": False,
            "issues": ["Verification service error"],
            "confidence": 0.0,
        }