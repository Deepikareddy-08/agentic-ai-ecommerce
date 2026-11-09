import json
import logging
import math
import os
import re
from collections import Counter
from typing import Any, Dict, List, Optional, Set, Tuple
import psycopg2  # type: ignore # pyrefly: ignore[missing-import]

logger = logging.getLogger("recommendation_engine")
logging.basicConfig(level=logging.INFO)

DB_URL = os.getenv("DATABASE_URL", "postgresql://postgres:deepika08@localhost:5432/ecommerce_db")

STOPWORDS: Set[str] = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
    "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't",
    "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have",
    "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him",
    "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't",
    "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor",
    "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out",
    "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some",
    "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there",
    "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to",
    "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
    "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's",
    "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've",
    "your", "yours", "yourself", "yourselves"
}


class PurePythonTfidf:
    """Lightweight, optimal Pure-Python TF-IDF model eliminating scikit-learn dependency."""
    def __init__(self):
        self.doc_count = 0
        self.idf: Dict[str, float] = {}

    def tokenize(self, text: str) -> List[str]:
        tokens = re.findall(r"[a-zA-Z0-9_-]{2,}", text.lower())
        return [t for t in tokens if t not in STOPWORDS]

    def fit(self, documents: List[str]):
        self.doc_count = len(documents)
        df_counter: Counter = Counter()

        for doc in documents:
            unique_words = set(self.tokenize(doc))
            for word in unique_words:
                df_counter[word] += 1

        self.idf = {}
        for word, count in df_counter.items():
            self.idf[word] = math.log((1 + self.doc_count) / (1 + count)) + 1.0

    def transform(self, text: str) -> Dict[str, float]:
        tokens = self.tokenize(text)
        if not tokens:
            return {}
        tf = Counter(tokens)
        total = float(len(tokens))
        vec: Dict[str, float] = {}
        norm_sq = 0.0
        for word, count in tf.items():
            weight = (count / total) * self.idf.get(word, 1.0)
            vec[word] = weight
            norm_sq += weight * weight

        if norm_sq > 0:
            norm = math.sqrt(norm_sq)
            return {w: v / norm for w, v in vec.items()}
        return vec

    @staticmethod
    def cosine_similarity(vec1: Dict[str, float], vec2: Dict[str, float]) -> float:
        if not vec1 or not vec2:
            return 0.0
        # Compute dot product (vectors are L2-normalized)
        if len(vec1) > len(vec2):
            vec1, vec2 = vec2, vec1
        return sum(val * vec2.get(word, 0.0) for word, val in vec1.items())


class RecommendationEngine:
    def __init__(self, db_url: str = DB_URL):
        self.db_url = db_url
        self.tfidf = PurePythonTfidf()
        self.products: List[Dict[str, Any]] = []
        self.product_vectors: List[Dict[str, float]] = []
        self.reload_catalogue()

    def _get_connection(self):
        return psycopg2.connect(self.db_url)

    def reload_catalogue(self):
        """Fetch active catalogue from PostgreSQL and build pure-Python TF-IDF representation"""
        self.products = []
        self.product_vectors = []
        try:
            conn = self._get_connection()
            cur = conn.cursor()
            query = """
            SELECT id, name, brand, category, price, stock, rating, review_count, 
                   description, specifications, image_url
            FROM products
            """
            cur.execute(query)
            rows = cur.fetchall()
            cur.close()
            conn.close()

            for r in rows:
                p = {
                    "id": int(r[0]),
                    "name": str(r[1] or ""),
                    "brand": str(r[2] or ""),
                    "category": str(r[3] or ""),
                    "price": float(r[4] or 0.0),
                    "stock": int(r[5] or 0),
                    "rating": float(r[6] or 0.0),
                    "review_count": int(r[7] or 0),
                    "description": str(r[8] or ""),
                    "specifications": str(r[9] or ""),
                    "image_url": str(r[10] or "")
                }
                combined = f"{p['name']} {p['brand']} {p['category']} {p['description']} {p['specifications']}"
                p["combined_text"] = combined
                self.products.append(p)

            logger.info(f"Loaded {len(self.products)} products from PostgreSQL into recommendation engine.")
        except Exception as e:
            logger.warning(f"Database connection error ({e}). Using local fallback seed...")
            seed_path = os.path.join(os.path.dirname(__file__), "..", "data", "seed_products.json")
            if os.path.exists(seed_path):
                with open(seed_path, "r", encoding="utf-8") as f:
                    seeds = json.load(f)
                for s in seeds:
                    combined = f"{s.get('name','')} {s.get('brand','')} {s.get('category','')} {s.get('description','')} {s.get('specifications','')}"
                    s["combined_text"] = combined
                    self.products.append(s)

        if self.products:
            doc_texts = [p["combined_text"] for p in self.products]
            self.tfidf.fit(doc_texts)
            self.product_vectors = [self.tfidf.transform(t) for t in doc_texts]
            logger.info("Fitted Pure-Python TF-IDF index successfully without scikit-learn.")

    def get_user_profile(self, user_id: Optional[int]) -> Tuple[str, Optional[float], Optional[str]]:
        if not user_id:
            return "", None, None

        try:
            conn = self._get_connection()
            cur = conn.cursor()
            cur.execute(
                "SELECT preferred_categories, max_budget, preferred_features FROM user_preferences WHERE user_id = %s",
                (user_id,)
            )
            pref_row = cur.fetchone()

            pref_text = ""
            max_budget = None
            preferred_category = None

            if pref_row:
                cat, budget, feats = pref_row
                preferred_category = cat.split(",")[0].strip() if cat else None
                max_budget = budget
                if cat: pref_text += f" {cat}"
                if feats: pref_text += f" {feats}"

            cur.execute("""
                SELECT p.category, p.name, p.description, p.specifications
                FROM interactions i
                JOIN products p ON i.product_id = p.id
                WHERE i.user_id = %s
                ORDER BY i.timestamp DESC LIMIT 5
            """, (user_id,))
            interactions = cur.fetchall()
            for row in interactions:
                pref_text += f" {row[0]} {row[1]} {row[2]}"

            cur.close()
            conn.close()
            return pref_text.strip(), max_budget, preferred_category
        except Exception as e:
            logger.warning(f"User profile lookup error for user_id={user_id}: {e}")
            return "", None, None

    def recommend(
        self,
        user_id: Optional[int] = None,
        category: Optional[str] = None,
        min_budget: Optional[float] = None,
        max_budget: Optional[float] = None,
        purpose: Optional[str] = None,
        required_features: Optional[List[str]] = None,
        preferred_features: Optional[List[str]] = None,
        limit: int = 5
    ) -> Dict[str, Any]:
        """
        Rank products using Pure-Python TF-IDF Cosine Similarity, rating normalization,
        and budget-fit efficiency (scikit-learn free).
        """
        if not self.products:
            self.reload_catalogue()
            if not self.products:
                return {"recommendations": [], "explanation": "Catalogue is empty", "strategy": "None"}

        user_history_text, user_pref_budget, user_pref_category = self.get_user_profile(user_id)
        active_category = category or user_pref_category
        active_max_budget = max_budget or user_pref_budget

        # Apply hard constraints
        candidates = []
        for i, p in enumerate(self.products):
            if active_category and active_category.lower() != "all":
                if active_category.lower() not in p["category"].lower():
                    continue
            if active_max_budget and active_max_budget > 0:
                if p["price"] > active_max_budget:
                    continue
            if min_budget and min_budget > 0:
                if p["price"] < min_budget:
                    continue
            candidates.append((i, p))

        # Fallback if strict filter yields 0
        if not candidates:
            sorted_fallback = sorted(self.products, key=lambda x: (x["rating"], x["review_count"]), reverse=True)[:limit]
            recs = [
                {
                    "product_id": p["id"],
                    "name": p["name"],
                    "price": p["price"],
                    "category": p["category"],
                    "score": round(p["rating"] / 5.0, 2),
                    "match_reason": f"Top-rated {p['category']} choice ({p['rating']}★)"
                }
                for p in sorted_fallback
            ]
            return {
                "recommendations": recs,
                "explanation": "No products met strict price/category filters; showing top-rated alternatives.",
                "strategy": "Popularity Fallback"
            }

        # Build query profile
        query_parts = []
        if active_category: query_parts.append(active_category)
        if purpose: query_parts.append(purpose)
        if required_features: query_parts.extend(required_features)
        if preferred_features: query_parts.extend(preferred_features)
        if user_history_text: query_parts.append(user_history_text)

        query_text = " ".join(query_parts).strip() or "quality top rated reliable"
        query_vec = self.tfidf.transform(query_text)

        scored = []
        for idx, prod in candidates:
            prod_vec = self.product_vectors[idx] if idx < len(self.product_vectors) else {}
            content_sim = PurePythonTfidf.cosine_similarity(query_vec, prod_vec)

            # Rating normalized score
            rating_norm = (prod.get("rating") or 4.0) / 5.0

            # Budget efficiency score
            budget_score = 0.8
            if active_max_budget and active_max_budget > 0:
                ratio = prod["price"] / active_max_budget
                if 0.65 <= ratio <= 1.0:
                    budget_score = 1.0

            # Composite weighted score: 50% content sim + 30% rating + 20% budget fit
            final_score = (0.50 * content_sim) + (0.30 * rating_norm) + (0.20 * budget_score)

            # Match reasons
            reasons = []
            if rating_norm >= 0.9:
                reasons.append(f"Outstanding {prod['rating']}★ rating")
            if budget_score == 1.0:
                reasons.append(f"Fits budget perfectly (₹{prod['price']:,.0f})")
            if purpose and purpose.lower() in prod["combined_text"].lower():
                reasons.append(f"Optimized for {purpose}")
            if not reasons:
                reasons.append(f"High-quality {prod['category']} match")

            scored.append({
                "product_id": prod["id"],
                "name": prod["name"],
                "price": prod["price"],
                "category": prod["category"],
                "score": round(final_score, 4),
                "match_reason": "; ".join(reasons[:2])
            })

        # Rank candidates by composite score
        scored.sort(key=lambda x: x["score"], reverse=True)
        top_recs = scored[:limit]

        strategy = "Personalized Pure-Python TF-IDF Recommendation" if user_id else "Requirement-Based Similarity Ranking"
        explanation = f"Matched {len(top_recs)} products using {strategy} evaluating attributes, rating, and budget alignment."

        return {
            "recommendations": top_recs,
            "explanation": explanation,
            "strategy": strategy
        }
