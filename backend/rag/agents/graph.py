from langgraph.graph import StateGraph, END
from rag.agents.state import AgentState
from rag.agents.router import route_query
from rag.agents.history import history_agent
from rag.agents.safety import safety_agent
from rag.agents.ritual import ritual_agent
from rag.agents.route import route_agent
from rag.agents.general import general_agent
from rag.agents.verifier import verifier_agent
from rag.agents.synthesizer import synthesizer_agent
import logging

logger = logging.getLogger(__name__)


# Node Functions 

def _build_contextual_query(query: str, messages: list[dict[str, str]] | None) -> str:
    if not messages:
        return query

    recent = messages[-6:]
    history_lines: list[str] = []
    for item in recent:
        role = str(item.get("role", "")).strip().lower()
        content = str(item.get("content", "")).strip()
        if role in {"user", "assistant"} and content:
            history_lines.append(f"{role}: {content}")

    if not history_lines:
        return query

    return f"Conversation history:\n" + "\n".join(history_lines) + f"\n\nCurrent user question:\n{query}"

async def router_node(state: AgentState) -> dict:
    """
    Node 1: Route query to appropriate specialist agent.
    """
    query = state["query"]
    contextual_query = _build_contextual_query(query, state.get("messages"))
    route = await route_query(contextual_query)
    
    logger.info(f"[Router] Query routed to: {route}")
    
    return {"route": route}


async def specialist_node(state: AgentState) -> dict:
    """
    Node 2: Run the appropriate specialist agent based on route.
    """
    route = state["route"]
    query = state["query"]
    contextual_query = _build_contextual_query(query, state.get("messages"))
    
    # Map route to agent
    agent_map = {
        "history": (history_agent, "History Agent"),
        "safety": (safety_agent, "Safety Agent"),
        "ritual": (ritual_agent, "Ritual Agent"),
        "route": (route_agent, "Route Agent"),
        "general": (general_agent, "General Agent"),
    }
    
    agent_func, agent_name = agent_map.get(route, (general_agent, "General Agent"))
    
    logger.info(f"[Specialist] Running {agent_name}")
    
    # Run specialist
    agent_result = await agent_func(contextual_query)

    if isinstance(agent_result, tuple) and len(agent_result) == 3:
        response, docs, doc_scores = agent_result
    else:
        response, docs = agent_result
        doc_scores = [None for _ in docs]
    
    return {
        "agent_response": response,
        "agent_name": agent_name,
        "retrieved_docs": docs,
        "doc_scores": doc_scores,
    }


async def verifier_node(state: AgentState) -> dict:
    """
    Node 3: Verify answer against retrieved documents.
    """
    answer = state["agent_response"]
    docs = state["retrieved_docs"]
    
    logger.info(f"[Verifier] Checking answer ({len(answer)} chars)")
    
    verification_result = await verifier_agent(answer, docs)
    
    return {
        "verified": verification_result["verified"],
        "verification_issues": verification_result["issues"],
        "confidence_score": verification_result["confidence"],
    }


def synthesizer_node(state: AgentState) -> dict:
    """
    Node 4: Format final answer with sources and verification.
    """
    logger.info("[Synthesizer] Creating final formatted answer")
    
    final_answer = synthesizer_agent(
        agent_response=state["agent_response"],
        agent_name=state["agent_name"],
        docs=state["retrieved_docs"],
        verified=state["verified"],
        verification_issues=state["verification_issues"],
        confidence_score=state["confidence_score"],
    )
    
    # Build sources list
    sources = []
    for i, doc in enumerate(state["retrieved_docs"]):
        sources.append({
            "index": i + 1,
            "source": doc.metadata.get("source", "unknown"),
            "score": state["doc_scores"][i] if i < len(state["doc_scores"]) else None,
        })
    
    return {
        "final_answer": final_answer,
        "sources": sources,
    }


#  Build the Graph 

def build_agent_graph():
    """
    Build and compile the multi-agent workflow graph.
    
    Workflow:
    START → Router → Specialist → Verifier → Synthesizer → END
    """
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("router", router_node)
    workflow.add_node("specialist", specialist_node)
    workflow.add_node("verifier", verifier_node)
    workflow.add_node("synthesizer", synthesizer_node)
    
    # Add edges (sequential flow)
    workflow.set_entry_point("router")
    workflow.add_edge("router", "specialist")
    workflow.add_edge("specialist", "verifier")
    workflow.add_edge("verifier", "synthesizer")
    workflow.add_edge("synthesizer", END)
    
    # Compile graph
    graph = workflow.compile()
    
    logger.info("Multi-agent graph compiled successfully")
    
    return graph


# Create the graph instance
agent_graph = build_agent_graph()