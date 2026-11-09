import logging
import os
from typing import Any, Dict, List, Optional
from dotenv import load_dotenv  # type: ignore # pyrefly: ignore[missing-import]
from fastapi import FastAPI, HTTPException  # type: ignore # pyrefly: ignore[missing-import]
from fastapi.middleware.cors import CORSMiddleware  # type: ignore # pyrefly: ignore[missing-import]
from pydantic import BaseModel  # type: ignore # pyrefly: ignore[missing-import]

load_dotenv()

from agent_orchestrator import AgentOrchestrator
import agent_tools
from ingest_rag import ingest_catalogue_and_reviews
from qdrant_manager import QdrantManager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai_service")

app = FastAPI(
    title="Agentic AI Shopping Assistant Service",
    description="Agentic Tool-Calling Orchestrator, Qdrant Vector RAG, and Grounded Shopping Assistant",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = AgentOrchestrator()
qdrant_manager = QdrantManager()

class ChatRequestSchema(BaseModel):
    conversation_id: Optional[str] = None
    message: str
    user_id: Optional[int] = None
    active_category: Optional[str] = None
    budget_max: Optional[float] = None

class RAGRetrieveSchema(BaseModel):
    query: str
    category: Optional[str] = None
    top_k: Optional[int] = 4

@app.get("/health")
def health():
    return {
        "status": "UP",
        "service": "ai-agent-rag-service",
        "llm_provider": orchestrator.provider or "Local Deterministic Agent",
        "qdrant_chunks": qdrant_manager.count_indexed_chunks()
    }

@app.post("/agent/chat")
def chat_endpoint(req: ChatRequestSchema):
    try:
        conv_id = req.conversation_id or "default_session"
        result = orchestrator.process_chat(
            conversation_id=conv_id,
            user_message=req.message,
            user_id=req.user_id,
            active_category=req.active_category,
            budget_max=req.budget_max
        )
        return result
    except Exception as e:
        logger.error(f"Chat processing error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

class CompareRequestSchema(BaseModel):
    product_ids: List[int]
    criteria: Optional[str] = None

@app.post("/agent/compare")
def compare_endpoint(req: CompareRequestSchema):
    try:
        result = orchestrator.compare_products_with_criteria(
            product_ids=req.product_ids,
            criteria=req.criteria
        )
        return result
    except Exception as e:
        logger.error(f"Compare processing error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/rag/retrieve")
def retrieve_endpoint(req: RAGRetrieveSchema):
    try:
        matches = qdrant_manager.semantic_search(
            query=req.query,
            category=req.category,
            top_k=req.top_k or 4
        )
        return {"query": req.query, "matches": matches}
    except Exception as e:
        logger.error(f"RAG retrieval error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/rag/ingest")
def reingest_endpoint():
    try:
        count = ingest_catalogue_and_reviews()
        return {"status": "SUCCESS", "indexed_chunks": count}
    except Exception as e:
        logger.error(f"Ingestion error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn  # type: ignore # pyrefly: ignore[missing-import]
    uvicorn.run(app, host="0.0.0.0", port=8002)
