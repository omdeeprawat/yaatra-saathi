from typing import TypedDict, Optional


class AgentState(TypedDict, total=False):
    """
    Shared state that flows through the agent graph.
    Each agent reads from and writes to this state.
    """
    
    # User Input =
    query: str                              # Original user question
    messages: list[dict[str, str]]          # Sanitized chat history
    image_url: Optional[str]                # Optional image attachment
    
    # Routing 
    route: str                              # Agent category: history, safety, ritual, route, general
    
    #  Retrieval 
    retrieved_docs: list                    # Documents from vector store
    doc_scores: list                        # Similarity scores for each doc
    
    # Agent Response 
    agent_response: str                     # Specialist agent's answer
    agent_name: str                         # Which agent responded (e.g., "History Agent")
    
    # Verification 
    verified: bool                          # Did answer pass fact-check?
    verification_issues: list               # List of problems found
    confidence_score: float                 # 0.0 to 1.0
    
    #Final Output 
    final_answer: str                       # Formatted answer with sources
    sources: list                           # Source citations with metadata