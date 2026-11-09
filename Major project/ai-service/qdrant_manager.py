import logging
import os
from typing import Any, Dict, List, Optional
from qdrant_client import QdrantClient  # type: ignore # pyrefly: ignore[missing-import]
from qdrant_client.models import (  # type: ignore # pyrefly: ignore[missing-import]
    Distance,
    FieldCondition,
    Filter,
    MatchValue,
    PointStruct,
    VectorParams,
)
from sentence_transformers import SentenceTransformer  # type: ignore # pyrefly: ignore[missing-import]

logger = logging.getLogger("qdrant_manager")
logging.basicConfig(level=logging.INFO)

COLLECTION_NAME = "ecommerce_rag"
VECTOR_DIM = 384

class QdrantManager:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(QdrantManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        qdrant_url = os.getenv("QDRANT_URL", "").strip()
        qdrant_api_key = os.getenv("QDRANT_API_KEY", "").strip() or None

        if qdrant_url:
            logger.info(f"Connecting to remote Qdrant at {qdrant_url}")
            self.client = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)
        else:
            storage_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "qdrant_storage")
            os.makedirs(storage_path, exist_ok=True)
            logger.info(f"Using local on-disk Qdrant storage at {storage_path}")
            try:
                self.client = QdrantClient(path=storage_path)
            except Exception as e:
                logger.warning(f"Qdrant on-disk lock detected: {e}. Attempting automated lock clearing...")
                lock_file = os.path.join(storage_path, ".lock")
                if os.path.exists(lock_file):
                    try:
                        os.remove(lock_file)
                        import time
                        time.sleep(0.3)
                        self.client = QdrantClient(path=storage_path)
                        logger.info("Successfully recovered and acquired Qdrant on-disk storage lock.")
                    except Exception as err2:
                        logger.warning(f"Could not re-acquire on-disk lock ({err2}). Falling back to in-memory Qdrant instance.")
                        self.client = QdrantClient(":memory:")
                else:
                    logger.warning(f"Falling back to in-memory Qdrant instance due to error: {e}")
                    self.client = QdrantClient(":memory:")

        logger.info("Loading embedding model 'all-MiniLM-L6-v2'...")
        self.embedder = SentenceTransformer("all-MiniLM-L6-v2")
        self._ensure_collection()
        self._initialized = True

    def _ensure_collection(self):
        try:
            collections = self.client.get_collections().collections
            exists = any(c.name == COLLECTION_NAME for c in collections)
            if not exists:
                logger.info(f"Creating Qdrant collection '{COLLECTION_NAME}' with dim={VECTOR_DIM}...")
                self.client.create_collection(
                    collection_name=COLLECTION_NAME,
                    vectors_config=VectorParams(size=VECTOR_DIM, distance=Distance.COSINE)
                )
        except Exception as e:
            logger.warning(f"Error ensuring collection: {e}")

    def generate_embedding(self, text: str) -> List[float]:
        vector = self.embedder.encode(text, normalize_embeddings=True)
        return vector.tolist()

    def upsert_chunks(self, chunks: List[Dict[str, Any]]):
        points = []
        texts = [c["text"] for c in chunks]
        embeddings = self.embedder.encode(texts, normalize_embeddings=True)

        for i, c in enumerate(chunks):
            point = PointStruct(
                id=c["id"],
                vector=embeddings[i].tolist(),
                payload={
                    "product_id": c.get("product_id"),
                    "product_name": c.get("product_name"),
                    "category": c.get("category"),
                    "document_type": c.get("document_type"),
                    "text": c.get("text"),
                    "rating": c.get("rating"),
                    "reviewer": c.get("reviewer")
                }
            )
            points.append(point)

        self.client.upsert(collection_name=COLLECTION_NAME, points=points)
        logger.info(f"Successfully upserted {len(points)} points into Qdrant.")

    def semantic_search(
        self,
        query: str,
        top_k: int = 5,
        category: Optional[str] = None,
        product_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        query_vector = self.generate_embedding(query)
        must_conditions = []

        if category and category.lower() != "all":
            must_conditions.append(
                FieldCondition(key="category", match=MatchValue(value=category))
            )

        if product_id:
            must_conditions.append(
                FieldCondition(key="product_id", match=MatchValue(value=product_id))
            )

        q_filter = Filter(must=must_conditions) if must_conditions else None

        try:
            results = self.client.query_points(
                collection_name=COLLECTION_NAME,
                query=query_vector,
                query_filter=q_filter,
                limit=top_k
            )
            points = results.points
        except Exception:
            points = self.client.search(
                collection_name=COLLECTION_NAME,
                query_vector=query_vector,
                query_filter=q_filter,
                limit=top_k
            )

        matches = []
        for pt in points:
            matches.append({
                "score": round(float(pt.score), 4),
                "text": pt.payload.get("text"),
                "product_id": pt.payload.get("product_id"),
                "product_name": pt.payload.get("product_name"),
                "category": pt.payload.get("category"),
                "document_type": pt.payload.get("document_type"),
                "rating": pt.payload.get("rating"),
                "reviewer": pt.payload.get("reviewer")
            })

        return matches

    def count_indexed_chunks(self) -> int:
        try:
            info = self.client.get_collection(collection_name=COLLECTION_NAME)
            return info.points_count
        except Exception:
            return 0
