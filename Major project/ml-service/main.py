import logging
import os
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException  # type: ignore # pyrefly: ignore[missing-import]
from fastapi.middleware.cors import CORSMiddleware  # type: ignore # pyrefly: ignore[missing-import]
from pydantic import BaseModel  # type: ignore # pyrefly: ignore[missing-import]
from recommendation_engine import RecommendationEngine
from multimodal_decision_engine import decision_engine
import evaluate_decision_model

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ml_service")

app = FastAPI(
    title="E-Commerce ML Recommendation & Multimodal Decision Service",
    description="Intelligent Product Decision Engine with NLU, Hard Negative Filtering, and Multimodal Cosine Similarity",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = RecommendationEngine()

class RecommendationRequestSchema(BaseModel):
    user_id: Optional[int] = None
    category: Optional[str] = None
    min_budget: Optional[float] = None
    max_budget: Optional[float] = None
    purpose: Optional[str] = None
    required_features: Optional[List[str]] = None
    preferred_features: Optional[List[str]] = None
    limit: Optional[int] = 5

class DecisionRecommendationRequestSchema(BaseModel):
    query: str
    initial_candidate_limit: Optional[int] = 60
    target_candidate_limit: Optional[int] = 15
    top_k: Optional[int] = 5
    weights: Optional[Dict[str, float]] = None

@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "ml-multimodal-decision-service",
        "indexed_products": len(engine.products),
        "decision_engine_ready": len(decision_engine.products) > 0,
        "text_vectors_cached": len(decision_engine.text_embeddings),
        "visual_vectors_cached": len(decision_engine.image_embeddings)
    }

@app.post("/reload")
def reload_index():
    engine.reload_catalogue()
    decision_engine.reload_and_cache_catalogue()
    return {
        "message": "Catalogue & multimodal embeddings reloaded successfully",
        "product_count": len(engine.products)
    }

@app.post("/recommend")
def get_recommendations(req: RecommendationRequestSchema):
    try:
        results = engine.recommend(
            user_id=req.user_id,
            category=req.category,
            min_budget=req.min_budget,
            max_budget=req.max_budget,
            purpose=req.purpose,
            required_features=req.required_features,
            preferred_features=req.preferred_features,
            limit=req.limit or 5
        )
        return results
    except Exception as e:
        logger.error(f"Error computing recommendations: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/decision/recommend")
def decision_recommend(req: DecisionRecommendationRequestSchema):
    """
    Intelligent Multimodal Product Decision Endpoint:
      - NLU Requirement Extraction (Category, Budget, Purpose, Negative Keywords)
      - Broad Catalog Search
      - Hard Negative Filtering (Pruning accessories and budget violations)
      - Multimodal Cosine Similarity (Text + CLIP Visuals)
      - Ranking & Grounded Explanation
    """
    try:
        results = decision_engine.recommend(
            query=req.query,
            initial_candidate_limit=req.initial_candidate_limit or 60,
            target_candidate_limit=req.target_candidate_limit or 15,
            top_k=req.top_k or 5,
            weights=req.weights
        )
        return results
    except Exception as e:
        logger.error(f"Error in decision model recommendation: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/decision/evaluate")
def decision_evaluate():
    """Executes offline/online comparative evaluation between baseline and decision model."""
    try:
        results = evaluate_decision_model.evaluate_decision_model()
        return results
    except Exception as e:
        logger.error(f"Error in decision model evaluation: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn  # type: ignore # pyrefly: ignore[missing-import]
    uvicorn.run(app, host="0.0.0.0", port=8001)

