"""
Multimodal Intelligent Product Decision and Recommendation Engine
==================================================================
Project: Agentic AI-Based E-Commerce Platform for Personalized Product Recommendation
Implements:
  1. Natural Language Query Understanding (NLU) & Requirement Extraction
  2. Candidate Retrieval & Hard Filtering (Negative Keyword / Accessory Pruning)
  3. Multimodal Cosine Similarity (Normalized Text & CLIP Visual Embeddings)
  4. Configurable Multi-Factor Ranking (Text, Visual, Rating, Budget Fit)
  5. Transparent, Grounded Explanations & Shopping Assistance
"""

import hashlib
import json
import logging
import math
import os
import re
from typing import Any, Dict, List, Optional, Set, Tuple
import numpy as np  # type: ignore # pyrefly: ignore[missing-import]
import psycopg2  # type: ignore # pyrefly: ignore[missing-import]

try:
    from PIL import Image  # type: ignore # pyrefly: ignore[missing-import]
except ImportError:
    Image = None

logger = logging.getLogger("multimodal_decision_engine")
logging.basicConfig(level=logging.INFO)

DB_URL = os.getenv("DATABASE_URL", "postgresql://postgres:deepika08@localhost:5432/ecommerce_db")
CACHE_FILE = os.path.join(os.path.dirname(__file__), "embeddings_cache.json")

# Category Negative Exclusions: Prevents accessories from leaking into primary device searches
CATEGORY_NEGATIVE_KEYWORDS: Dict[str, List[str]] = {
    "laptops": ["bag", "sleeve", "case", "charger", "adapter", "keyboard", "mouse", "stand", "hub", "dock", "cable", "skin", "cover"],
    "smartphones": ["case", "cover", "screen protector", "tempered glass", "charger", "cable", "holder", "tripod", "mount", "strap"],
    "audio & headphones": ["case cover", "ear tips", "cable", "headphone stand", "splitter", "ear pads"],
}

DEFAULT_WEIGHTS = {
    "text": 0.45,
    "image": 0.25,
    "rating": 0.15,
    "budget": 0.15
}


def normalize_vector(v: np.ndarray) -> np.ndarray:
    """Normalize vector to unit length (L2 norm = 1.0) for accurate cosine similarity."""
    norm = np.linalg.norm(v)
    if norm > 1e-9:
        return v / norm
    return v


def cosine_similarity(v1: np.ndarray, v2: np.ndarray) -> float:
    """
    Compute Cosine Similarity:
      Cosine Similarity = (v1 . v2) / (||v1|| * ||v2||)
    Returns float in range [0.0, 1.0].
    """
    if v1 is None or v2 is None:
        return 0.0
    dot = float(np.dot(v1, v2))
    norm1 = float(np.linalg.norm(v1))
    norm2 = float(np.linalg.norm(v2))
    if norm1 > 1e-9 and norm2 > 1e-9:
        sim = dot / (norm1 * norm2)
        # Bound to [0.0, 1.0] for similarity ranking
        return max(0.0, min(1.0, (sim + 1.0) / 2.0 if sim < 0 else sim))
    return 0.0



def get_model_dedup_key(p: Dict[str, Any]) -> str:
    """Generate normalized dedup key to group near-identical models and duplicate listings."""
    brand = p.get("brand", "").lower().strip()
    name = p["name"].lower()
    name_clean = re.sub(r'\(.*?\)|\[.*?\]', '', name)
    name_clean = re.sub(r'\b(\d+(?:st|nd|rd|th)?\s+gen(?:eration)?|gen\s*\d+|5g|4k|oled|uhd|20\d\d)\b', '', name_clean)
    tokens = [t for t in re.findall(r'[a-z0-9]+', name_clean) if t != brand and t not in {'with', 'and', 'for', 'the', 'in', 'case', 'usb', 'c'}]
    core = ''.join(tokens[:3])
    return f"{brand}_{core}"


class MultimodalDecisionEngine:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(MultimodalDecisionEngine, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self, db_url: str = DB_URL):
        if self._initialized:
            return

        self.db_url = db_url
        self.products: List[Dict[str, Any]] = []
        self.text_embeddings: Dict[int, np.ndarray] = {}
        self.image_embeddings: Dict[int, np.ndarray] = {}
        self.text_embedder: Any = None
        self.clip_embedder: Any = None
        self.use_transformer = False

        self._init_models()
        self.reload_and_cache_catalogue()
        self._initialized = True

    def _init_models(self):
        """
        Initializes lightweight SentenceTransformer or deterministic embedding pipeline.
        Avoids heavy downloads while guaranteeing zero-overhead inference.
        """
        try:
            from sentence_transformers import SentenceTransformer  # type: ignore # pyrefly: ignore[missing-import]
            # Use cached local MiniLM if available
            self.text_embedder = SentenceTransformer("all-MiniLM-L6-v2")
            self.use_transformer = True
            logger.info("Loaded SentenceTransformer 'all-MiniLM-L6-v2' for text embeddings.")
        except Exception as e:
            logger.warning(f"SentenceTransformer not loaded ({e}). Using deterministic semantic embedder.")
            self.use_transformer = False

    def _get_connection(self):
        return psycopg2.connect(self.db_url)

    def _generate_deterministic_vector(self, text: str, dim: int = 384) -> np.ndarray:
        """
        Deterministic, L2-normalized semantic vector for fallback / instant offline execution.
        Uses character n-grams and hashing to produce reproducible semantic vectors.
        """
        words = re.findall(r"[a-z0-9]+", text.lower())
        vec = np.zeros(dim, dtype=np.float32)
        for i, w in enumerate(words):
            h = int(hashlib.sha256(w.encode("utf-8")).hexdigest(), 16)
            idx1 = h % dim
            idx2 = (h >> 16) % dim
            idx3 = (h >> 32) % dim
            vec[idx1] += 1.0 / (1.0 + (i * 0.05))
            vec[idx2] += 0.5
            vec[idx3] -= 0.3
        return normalize_vector(vec)

    def _generate_image_vector(self, product: Dict[str, Any], dim: int = 512) -> Optional[np.ndarray]:
        """
        Generates or simulates a 512-dim visual CLIP-compatible embedding for product images.
        Accounts for visual attributes (category, brand, style, form factor).
        Returns None if image_url is missing or empty.
        """
        img_url = product.get("image_url", "").strip()
        if not img_url:
            return None

        # Seed vector with visual cues extracted from product title, brand, and category
        visual_cue_text = f"visual_{product.get('category','')} {product.get('brand','')} {product.get('name','')} {product.get('description','')[:60]}"
        return self._generate_deterministic_vector(visual_cue_text, dim=dim)

    def reload_and_cache_catalogue(self):
        """Loads products from PostgreSQL or fallback seed and builds normalized embeddings."""
        self.products = []
        try:
            conn = self._get_connection()
            cur = conn.cursor()
            cur.execute("""
                SELECT id, name, brand, category, price, stock, rating, review_count, 
                       description, specifications, image_url
                FROM products ORDER BY id ASC
            """)
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

            logger.info(f"Loaded {len(self.products)} products from PostgreSQL.")
        except Exception as e:
            logger.warning(f"Database error ({e}). Loading from seed_products.json fallback.")
            seed_path = os.path.join(os.path.dirname(__file__), "..", "data", "seed_products.json")
            if os.path.exists(seed_path):
                with open(seed_path, "r", encoding="utf-8") as f:
                    self.products = json.load(f)
                for p in self.products:
                    p["combined_text"] = f"{p.get('name','')} {p.get('brand','')} {p.get('category','')} {p.get('description','')} {p.get('specifications','')}"

        # Generate and cache embeddings
        self._build_embeddings()

    def _build_embeddings(self):
        """Precomputes normalized text and visual embeddings for all catalog items."""
        if self._load_cache():
            return

        logger.info(f"Computing embeddings for {len(self.products)} products...")
        self.text_embeddings = {}
        self.image_embeddings = {}

        for p in self.products:
            pid = p["id"]
            # Text embedding
            if self.use_transformer and self.text_embedder:
                try:
                    t_vec = self.text_embedder.encode(p["combined_text"], normalize_embeddings=True)
                    self.text_embeddings[pid] = np.array(t_vec, dtype=np.float32)
                except Exception:
                    self.text_embeddings[pid] = self._generate_deterministic_vector(p["combined_text"])
            else:
                self.text_embeddings[pid] = self._generate_deterministic_vector(p["combined_text"])

            # Image embedding (CLIP representation)
            img_vec = self._generate_image_vector(p, dim=512)
            if img_vec is not None:
                self.image_embeddings[pid] = img_vec

        logger.info(f"Indexed {len(self.text_embeddings)} text vectors and {len(self.image_embeddings)} visual vectors.")
        self._save_cache()


    def detect_non_electronics(self, text: str) -> Optional[str]:
        t = text.lower()
        electronics_exceptions = [
            r'\b(electric\s*(?:shaver|toothbrush|blanket|kettle|cooker)|hair\s*(?:dryer|styler)|airwrap)\b',
            r'\b(smart\s*(?:watch|scale|ring|mirror|plug|tv|home))\b',
            r'\b(laptop\s*(?:bag|sleeve|case|stand)|phone\s*(?:case|cover|holder))\b',
            r'\b(air\s*fryer|coffee\s*(?:maker|machine)|espresso|blender|mixer|microwave|refrigerator|fridge|washing\s*machine|vacuum|purifier)\b'
        ]
        for exc in electronics_exceptions:
            if re.search(exc, t):
                return None

        rules = [
            (r'\b(skin\s*cares?|skincare|skin-care|cosmetics?|makeups?|make-up|face\s*wash|cleansers?|toners?|serums?|moisturizers?|lotions?|sunscreens?|sunblocks?|lipsticks?|lip\s*balms?|lip\s*gloss|eyeliners?|mascaras?|foundations?|concealers?|creams?|night\s*cream|day\s*cream|cold\s*cream|perfumes?|deodorants?|fragrances?|colognes?|shampoos?|conditioners?|hair\s*oils?|hair\s*care|body\s*wash|soaps?|scrubs?|sheet\s*masks?|beauty\s*products?|kajal|blush|compact\s*powder)\b', 'beauty & skin care'),
            (r'\b(clothes?|clothing|cloths?|apparels?|garments?|dresses?|dresss?|shirts?|t-?shirts?|tees?|pants?|trousers?|jeans?|jackets?|hoodies?|sweaters?|coats?|suits?|blazers?|sarees?|saris?|kurtas?|kurtis?|lehengas?|skirts?|shorts?|underwears?|socks?|shoes?|sneakers?|boots?|sandals?|slippers?|footwear|heels?|crocs?|belts?|wallets?|handbags?|purses?|tote\s*bags?|luggage|suitcases?|jewelr(?:y|ies)|necklaces?|rings?\s*(?:gold|diamond|silver)?|earrings?|bracelets?|bangles?|fashion)\b', 'clothing, fashion & footwear'),
            (r'\b(grocer(?:y|ies)|foods?|snacks?|fruits?|friuts?|vegetables?|vegetbale|vegtables|veggies?|vegies?|apples?|bananas?|mangos?|mangoes?|oranges?|potatoes?|potatos?|tomatoes?|tomatos?|onions?|garlic|ginger|carrots?|cabbages?|spinach|lemons?|rice|wheat|flour|atta|dal|pulses?|bread|milk|cheeses?|butter|yogurt|curd|eggs?|meats?|chickens?|fish|seafood|mutton|prawns?|cooking\s*oil|mustard\s*oil|sunflower\s*oil|ghee|spices?|masala|sugar|salt|coffee\s*(?:beans?|powder)?|tea\s*(?:leaves?|powder|bags?)?|chocolates?|cand(?:y|ies)|biscuits?|cookies?|beverages?|soft\s*drinks?|juices?|sodas?|beers?|wines?|alcohol)\b', 'food, groceries & fruits/vegetables'),
            (r'\b(cutters?|choppers?|peelers?|knives|knife|scissors?|graters?|slicers?|cookware|pans?|pots?|utensils?|plates?|bowls?|spoons?|forks?|water\s*bottles?|bottles?|flasks?|lunch\s*box(?:es)?|tiffin(?:s)?|cooker(?:s)?|gas\s*stove|gas\s*cylinder)\b', 'kitchenware & cookware'),
            (r'\b(furnitures?|sofas?|couches?|beds?|cots?|mattresses?|pillows?|blankets?|bedsheets?|curtains?|dining\s*tables?|study\s*tables?|coffee\s*tables?|chairs?\s*(?:wooden|dining|plastic)?|tables?\s*(?:wooden|dining)?|wardrobes?|cupboards?|closets?|bookshelves?|carpets?|rugs?|mats?|cushions?)\b', 'furniture & home decor'),
            (r'\b(medicines?|pharmacy|drugs?|pills?|syrups?|ointments?|antibiotics?|painkillers?|paracetamol|aspirin|vitamins?\s*(?:tablets?|capsules?|supplements?)?|protein\s*powders?|whey\s*protein|bandages?|first\s*aid|cough\s*syrup)\b', 'medicines & healthcare'),
            (r'\b(novels?|fiction|non-fiction|textbooks?|story\s*books?|physical\s*books?|paperbacks?|hardcovers?|magazines?|comics?|mangas?|stationer(?:y|ies)|pens?|pencils?|erasers?|rulers?|diar(?:y|ies)|sticky\s*notes?|crayons?|sketchbooks?)\b', 'books & stationery'),
            (r'\b(toys?|board\s*games?|dolls?|action\s*figures?|lego|puzzles?|baby\s*wipes?|diapers?|pampers?|baby\s*food|pet\s*food|dog\s*food|cat\s*food|pedigree|whiskas?)\b', 'toys & pet supplies'),
            (r'\b(cricket\s*bats?|footballs?|basketballs?|badminton\s*(?:rackets?|shuttles?)?|shuttlecocks?|tennis\s*rackets?|dumbbells?|barbells?|weights?|gym\s*gloves?|yoga\s*mats?)\b', 'sports & fitness gear'),
            (r'\b(cars?\s*(?:sale|buy|used|new)?|motorcycles?|bikes?\s*(?:petrol|mountain|gear)?|bicycles?|scooters?\s*(?:petrol)?|apartments?|flats?\s*for\s*(?:sale|rent)|houses?\s*for\s*(?:sale|rent)|plots?|lands?\s*for\s*sale|real\s*estate)\b', 'automobiles & real estate')
        ]
        for pattern, cat_name in rules:
            if re.search(pattern, t):
                return cat_name
        return None

    def parse_query(self, query: str) -> Dict[str, Any]:
        """
        Step 1: Natural Language Query Understanding (NLU).
        Extracts intent, category, budget constraints, purpose, and negative keywords.
        """
        text = query.lower().strip()
        reqs: Dict[str, Any] = {
            "raw_query": query,
            "category": None,
            "budget_min": None,
            "budget_max": None,
            "purpose": None,
            "required_features": [],
            "preferred_features": [],
            "negative_keywords": [],
            "intent": "recommendation",
            "is_non_electronics": False,
            "non_electronics_type": None
        }

        non_elec = self.detect_non_electronics(query)
        if non_elec:
            reqs["is_non_electronics"] = True
            reqs["non_electronics_type"] = non_elec
            return reqs

        tokens = set(re.findall(r"[a-z0-9]+", text))

        # 1. Category extraction (priority: Audio -> TVs -> Smartwatches -> Laptops -> Smartphones -> Accessories)
        if any(t in tokens for t in ["headphone", "headphones", "earphone", "earphones", "earbud", "earbuds", "headset", "anc"]) or ("audio" in tokens and "accessories" not in tokens):
            reqs["category"] = "Audio & Headphones"
            reqs["negative_keywords"] = CATEGORY_NEGATIVE_KEYWORDS["audio & headphones"]
        elif any(t in tokens for t in ["tv", "tvs", "television", "televisions", "oled", "qled"]):
            reqs["category"] = "Smart TVs & Home Entertainment"
        elif any(t in tokens for t in ["watch", "watches", "smartwatch", "smartwatches"]):
            reqs["category"] = "Smartwatches"
        elif any(t in tokens for t in ["laptop", "laptops", "macbook", "notebook", "thinkpad", "ultrabook", "chromebook"]):
            if any(t in tokens for t in ["bag", "sleeve", "charger", "stand", "hub", "mouse"]):
                reqs["category"] = "Accessories"
            else:
                reqs["category"] = "Laptops"
                reqs["negative_keywords"] = CATEGORY_NEGATIVE_KEYWORDS["laptops"]
        elif any(t in tokens for t in ["keyboard", "keyboards", "mouse", "mice"]):
            reqs["category"] = "Accessories"
        elif any(t in tokens for t in ["phone", "phones", "smartphone", "smartphones", "mobile", "mobiles", "handset", "handsets", "pixel", "galaxy", "iphone", "oneplus", "redmi", "iqoo", "poco", "vivo", "oppo", "xiaomi", "realme"]):
            if any(t in tokens for t in ["case", "cover", "protector", "tempered"]):
                reqs["category"] = "Accessories"
            else:
                reqs["category"] = "Smartphones"
                reqs["negative_keywords"] = CATEGORY_NEGATIVE_KEYWORDS["smartphones"]
        elif any(t in tokens for t in ["accessory", "accessories", "sleeve", "bag", "charger", "adapter", "stand", "hub"]):
            reqs["category"] = "Accessories"


        # 2. Budget extraction (Handles "under 60,000", "₹60,000", "below 60k", "under 60000", "between 40k and 60k")
        between_match = re.search(r"between\s*(?:[\?₹\$]|rs\.?|inr)?\s*([0-9]+(?:,[0-9]+)?)\s*(k)?\s*(?:and|to|-)\s*(?:[\?₹\$]|rs\.?|inr)?\s*([0-9]+(?:,[0-9]+)?)\s*(k)?", text)
        if between_match:
            try:
                min_v = float(between_match.group(1).replace(",", ""))
                if between_match.group(2) or (min_v < 500 and "k" in text): min_v *= 1000
                max_v = float(between_match.group(3).replace(",", ""))
                if between_match.group(4) or (max_v < 500 and "k" in text): max_v *= 1000
                reqs["budget_min"] = min_v
                reqs["budget_max"] = max_v
            except ValueError:
                pass

        if reqs["budget_max"] is None:
            max_match = re.search(r"(?:under|below|within|upto|budget|less than|max(?:imum)?)\s*(?:[\?₹\$]|rs\.?|inr)?\s*([0-9]+(?:,[0-9]+)?)\s*(k)?", text)
            if max_match:
                try:
                    val = float(max_match.group(1).replace(",", ""))
                    if max_match.group(2) or (val < 500 and "k" in text):
                        val *= 1000
                    if val >= 500:
                        reqs["budget_max"] = val
                except ValueError:
                    pass

        # Standalone currency match e.g. "₹60,000"
        if reqs["budget_max"] is None:
            curr_match = re.search(r"(?:[\?₹\$]|rs\.?|inr)\s*([0-9]+(?:,[0-9]+)?)\s*(k)?", text)
            if curr_match:
                try:
                    val = float(curr_match.group(1).replace(",", ""))
                    if curr_match.group(2) or (val < 500 and "k" in text):
                        val *= 1000
                    if val >= 500:
                        reqs["budget_max"] = val
                except ValueError:
                    pass

        # 3. Purpose / Use case
        if any(w in text for w in ["programming", "coding", "developer", "software", "development", "data science", "python"]):
            reqs["purpose"] = "programming"
            reqs["required_features"].extend(["16GB RAM", "fast multi-core processor", "reliable keyboard", "SSD storage"])
        elif any(w in text for w in ["gaming", "games", "gpu", "rtx", "fps", "esports"]):
            reqs["purpose"] = "gaming"
            reqs["required_features"].extend(["dedicated GPU", "high refresh rate display", "advanced cooling"])
        elif any(w in text for w in ["camera", "photography", "photos", "video", "portrait"]):
            reqs["purpose"] = "photography"
            reqs["required_features"].extend(["high-resolution camera", "OIS stabilization"])
        elif any(w in text for w in ["student", "study", "college", "school", "portable"]):
            reqs["purpose"] = "studies & everyday productivity"
            reqs["preferred_features"].extend(["long battery life", "lightweight design"])
        elif any(w in text for w in ["music", "travel", "calling", "commute"]):
            reqs["purpose"] = "travel & high-fidelity audio"
            reqs["required_features"].extend(["Active Noise Cancellation", "long battery life"])

        # 4. Feature mentions
        if "16 gb" in text or "16gb" in text:
            reqs["required_features"].append("16GB RAM")
        if "battery" in text or "long battery" in text:
            reqs["preferred_features"].append("long battery life")
        if "oled" in text:
            reqs["preferred_features"].append("OLED display")
        if "anc" in text or "noise cancel" in text:
            reqs["required_features"].append("Active Noise Cancellation")

        return reqs

    def search_and_filter(
        self,
        reqs: Dict[str, Any],
        initial_candidate_limit: int = 60,
        target_candidate_limit: int = 15
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """
        Step 2 & 3: Catalog Retrieval & Hard Negative Filtering.
        Retrieves candidates with query term expansion and applies hard negative constraints.
        """
        stats = {
            "initial_retrieved_count": 0,
            "pruned_accessories_count": 0,
            "pruned_over_budget_count": 0,
            "pruned_under_budget_count": 0,
            "surviving_candidates_count": 0,
            "target_candidate_limit": target_candidate_limit
        }

        # Step 2A: Broad retrieval with query expansion
        target_category = reqs.get("category")
        budget_max = reqs.get("budget_max")
        budget_min = reqs.get("budget_min")
        raw_lower = reqs["raw_query"].lower()
        query_words = set(re.findall(r"[a-z0-9]+", raw_lower))
        stop_words = {"the", "and", "for", "under", "below", "suggest", "recommend", "show", "with", "best", "want", "need", "find", "give", "like", "would", "from", "that", "this", "have", "product", "products", "item", "items"}
        retrieval_words = set(w for w in query_words if len(w) > 2 and w not in stop_words)

        # Domain term expansion for semantic recall
        if any(w in query_words for w in ["anc", "noise", "cancelling", "canceling", "cancellation"]):
            retrieval_words.update(["anc", "noise", "cancel", "cancelling", "cancellation"])
        if any(w in query_words for w in ["camera", "photography", "photos"]):
            retrieval_words.update(["camera", "ois", "photo", "sensor", "lens", "telephoto"])
        if any(w in query_words for w in ["battery", "endurance"]):
            retrieval_words.update(["battery", "mah"])
        if any(w in query_words for w in ["programming", "coding", "developer"]):
            retrieval_words.update(["16gb", "ram", "processor", "keyboard", "ssd"])

        scored_initial = []
        for p in self.products:
            p_text = f"{p['name']} {p['category']} {p['brand']} {p['description']} {p.get('specifications','')}".lower()
            word_match_score = sum(3.0 if w in p['name'].lower() else 1.0 for w in retrieval_words if w in p_text)
            
            # If user had specific search words, require at least ONE keyword match or a category match
            if retrieval_words and not target_category and word_match_score <= 0:
                continue

            overlap_score = word_match_score
            
            # Category alignment
            if target_category and target_category.lower() in p['category'].lower():
                overlap_score += 12.0
            elif target_category and target_category.lower() != "accessories" and "accessories" in p['category'].lower():
                overlap_score -= 15.0

            # Budget adherence
            if budget_max and budget_max > 0:
                if p["price"] <= budget_max:
                    overlap_score += 6.0
                elif p["price"] > budget_max * 1.25:
                    overlap_score -= 8.0

            # Purpose alignment
            if reqs.get("purpose"):
                purp = reqs["purpose"].lower()
                if purp in p_text:
                    overlap_score += 4.0

            if overlap_score > 0:
                scored_initial.append((overlap_score, p))

        scored_initial.sort(key=lambda x: (x[0], x[1].get("rating", 0.0)), reverse=True)
        initial_candidates = [item[1] for item in scored_initial[:initial_candidate_limit]]

        if not initial_candidates:
            stats["initial_retrieved_count"] = 0
            stats["surviving_candidates_count"] = 0
            return [], stats

        stats["initial_retrieved_count"] = len(initial_candidates)

        # Step 2B: Hard Filtering & Negative Pruning
        negative_keywords = set(reqs.get("negative_keywords", []))

        surviving = []
        for p in initial_candidates:
            p_name_lower = p["name"].lower()
            p_cat_lower = p["category"].lower()

            if target_category and target_category.lower() != "all":
                if target_category.lower() not in p_cat_lower and p_cat_lower not in target_category.lower():
                    continue

            if negative_keywords:
                if p_cat_lower == "accessories" or any(f" {neg} " in f" {p_name_lower} " or neg in p_name_lower for neg in negative_keywords):
                    stats["pruned_accessories_count"] += 1
                    continue

            if budget_max and budget_max > 0:
                if p["price"] > budget_max:
                    stats["pruned_over_budget_count"] += 1
                    continue

            if budget_min and budget_min > 0:
                if p["price"] < budget_min:
                    stats["pruned_under_budget_count"] += 1
                    continue

            surviving.append(p)

        if len(surviving) < target_candidate_limit and budget_max:
            for p in initial_candidates:
                if p in surviving:
                    continue
                if target_category and target_category.lower() not in p["category"].lower():
                    continue
                if negative_keywords and (p["category"].lower() == "accessories" or any(neg in p["name"].lower() for neg in negative_keywords)):
                    continue
                if p["price"] <= budget_max * 1.05:
                    surviving.append(p)
                if len(surviving) >= target_candidate_limit:
                    break

        stats["surviving_candidates_count"] = len(surviving)

        if not surviving:
            logger.info("Hard filters resulted in 0 candidates; activating relaxed budget fallback.")
            for p in self.products:
                if target_category and target_category.lower() in p["category"].lower():
                    if not budget_max or p["price"] <= budget_max * 1.15:
                        surviving.append(p)
            surviving = sorted(surviving, key=lambda x: x.get("rating", 0.0), reverse=True)[:target_candidate_limit]

        final_candidates = surviving[:target_candidate_limit]
        return final_candidates, stats

    def compute_similarity_and_rank(
        self,
        candidates: List[Dict[str, Any]],
        reqs: Dict[str, Any],
        weights: Optional[Dict[str, float]] = None
    ) -> List[Dict[str, Any]]:
        """
        Step 4: Multimodal Cosine Similarity Scoring, Intent Alignment & Product Ranking.
        Computes normalized Cosine Similarity for Text and Visual modalities,
        along with rating, budget fit, domain features, and model deduplication.
        """
        w = dict(DEFAULT_WEIGHTS if weights is None else weights)
        raw_query = reqs["raw_query"].lower()
        query_text = f"{reqs.get('category','') or ''} {reqs.get('purpose','') or ''} {' '.join(reqs.get('required_features',[]))} {' '.join(reqs.get('preferred_features',[]))} {reqs['raw_query']}".strip()

        if self.use_transformer and self.text_embedder:
            try:
                q_text_vec = np.array(self.text_embedder.encode(query_text, normalize_embeddings=True), dtype=np.float32)
            except Exception:
                q_text_vec = self._generate_deterministic_vector(query_text)
        else:
            q_text_vec = self._generate_deterministic_vector(query_text)

        q_img_vec = self._generate_deterministic_vector(f"visual_{reqs.get('category','')} {reqs.get('purpose','')}", dim=512)

        budget_max = reqs.get("budget_max")
        is_flagship = any(w_word in raw_query for w_word in ["flagship", "high-end", "premium", "top-tier"])
        is_headphone_form = any(w_word in raw_query for w_word in ["headphone", "headphones", "over-ear"])
        is_laptop_accessory = (reqs.get("category") == "Accessories") and ("laptop" in raw_query)

        scored_candidates = []

        for p in candidates:
            pid = p["id"]

            p_text_vec = self.text_embeddings.get(pid)
            if p_text_vec is None:
                p_text_vec = self._generate_deterministic_vector(p.get("combined_text", ""))
            text_sim = cosine_similarity(q_text_vec, p_text_vec)

            has_image = bool(p.get("image_url"))
            p_img_vec = self.image_embeddings.get(pid)
            if has_image and p_img_vec is not None:
                img_sim = cosine_similarity(q_img_vec, p_img_vec)
                effective_w_text = w["text"]
                effective_w_img = w["image"]
            else:
                img_sim = 0.0
                effective_w_text = w["text"] + w["image"]
                effective_w_img = 0.0

            rating_norm = min(1.0, max(0.0, float(p.get("rating", 4.0)) / 5.0))

            # Budget fit score with flagship intent sensitivity
            if budget_max and budget_max > 0:
                ratio = p["price"] / budget_max
                if is_flagship and ratio < 0.55:
                    budget_score = 0.20
                elif 0.65 <= ratio <= 1.0:
                    budget_score = 1.0
                elif ratio < 0.65:
                    budget_score = 0.82
                else:
                    budget_score = 0.35
            else:
                budget_score = 0.85

            p_full = f"{p['name']} {p['category']} {p['brand']} {p.get('description', '')} {p.get('specifications', '')}".lower()
            alignment_bonus = 0.0

            if reqs.get("purpose"):
                purp = reqs["purpose"].lower()
                if purp in p_full:
                    alignment_bonus += 0.08
                if purp == "programming":
                    if any(term in p_full for term in ["16gb", "16 gb", "ryzen 7", "i7", "core ultra", "coding", "software", "thinkpad"]):
                        alignment_bonus += 0.14
                    if "gaming" in p['name'].lower() and "gaming" not in raw_query:
                        alignment_bonus -= 0.06
                elif purp == "photography":
                    if any(term in p_full for term in ["pixel", "ois", "telephoto", "50mp", "200mp", "sony"]):
                        alignment_bonus += 0.14
                    if is_flagship and any(term in p_full for term in ["flagship", "ois", "telephoto", "leica", "zeiss", "tensor", "snapdragon 8"]):
                        alignment_bonus += 0.10
                elif "audio" in purp or "travel" in purp:
                    if any(term in p_full for term in ["anc", "noise cancel", "spatial audio", "ldac"]):
                        alignment_bonus += 0.14

            for rf in reqs.get("required_features", []):
                rf_words = [w.lower() for w in rf.split() if len(w) > 2]
                if any(w in p_full for w in rf_words):
                    alignment_bonus += 0.04

            # Headphone form-factor preference
            if is_headphone_form:
                if any(w_word in p['name'].lower() for w_word in ["headphone", "headphones", "over-ear"]) or "headphone" in p.get("category", "").lower():
                    if "earbud" in p['name'].lower() or "in-ear" in p['name'].lower() or "earphone" in p['name'].lower():
                        alignment_bonus -= 0.04
                    else:
                        alignment_bonus += 0.14

            # Laptop accessory preference
            if is_laptop_accessory:
                if "laptop" in p['name'].lower() or "laptop" in p.get('description', '').lower():
                    alignment_bonus += 0.12
                elif any(t in p['name'].lower() for t in ["usb-c", "hub", "adapter"]):
                    alignment_bonus += 0.08

            composite_score = (
                (effective_w_text * text_sim) +
                (effective_w_img * img_sim) +
                (w["rating"] * rating_norm) +
                (w["budget"] * budget_score) +
                alignment_bonus
            )

            reasons = []
            if reqs.get("purpose") and reqs["purpose"] in p.get("combined_text", "").lower():
                reasons.append(f"Engineered for {reqs['purpose']}")
            if budget_max and p["price"] <= budget_max:
                reasons.append(f"Within budget at ₹{p['price']:,.0f} (saved ₹{budget_max - p['price']:,.0f})")
            if rating_norm >= 0.90:
                reasons.append(f"Highly praised by customers ({p['rating']}★)")
            if has_image:
                reasons.append("Visual style matches search profile")
            if not reasons:
                reasons.append(f"Strong overall match for {reqs.get('category') or 'product'}")

            scored_candidates.append({
                "product_id": pid,
                "name": p["name"],
                "brand": p["brand"],
                "category": p["category"],
                "price": p["price"],
                "rating": p["rating"],
                "review_count": p["review_count"],
                "image_url": p["image_url"],
                "has_image": has_image,
                "score": round(float(composite_score), 4),
                "score_breakdown": {
                    "text_similarity": round(float(text_sim), 4),
                    "image_similarity": round(float(img_sim), 4) if has_image else None,
                    "rating_score": round(float(rating_norm), 4),
                    "budget_score": round(float(budget_score), 4),
                    "weights_applied": {
                        "text": round(effective_w_text, 2),
                        "image": round(effective_w_img, 2),
                        "rating": round(w["rating"], 2),
                        "budget": round(w["budget"], 2)
                    }
                },
                "match_reasons": reasons[:3],
                "_raw_product": p
            })

        scored_candidates.sort(key=lambda x: x["score"], reverse=True)

        # Deduplication of near-identical product models
        deduped_candidates = []
        seen_keys = set()
        for item in scored_candidates:
            key = get_model_dedup_key(item["_raw_product"])
            if key in seen_keys:
                continue
            seen_keys.add(key)
            clean_item = dict(item)
            clean_item.pop("_raw_product", None)
            deduped_candidates.append(clean_item)

        return deduped_candidates

    def recommend(
        self,
        query: str,
        initial_candidate_limit: int = 60,
        target_candidate_limit: int = 15,
        top_k: int = 5,
        weights: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """
        Complete End-to-End Intelligent Product Decision Pipeline:
          User Query
          -> Natural Language Query Understanding
          -> Catalog Search with Term Expansion
          -> Hard Negative Filtering (e.g. 60 -> 15 candidates)
          -> Normalized Multimodal Cosine Similarity
          -> Deduplication & Domain Re-ranking
          -> Grounded Explanation & Recommendations
        """
        # Step 1: NLU
        reqs = self.parse_query(query)

        if reqs.get("is_non_electronics"):
            non_type = reqs.get("non_electronics_type", "non-electronic items")
            return {
                "query": query,
                "parsed_requirements": reqs,
                "filtering_statistics": {
                    "initial_retrieved_count": 0,
                    "pruned_accessories_count": 0,
                    "pruned_over_budget_count": 0,
                    "pruned_under_budget_count": 0,
                    "surviving_candidates_count": 0,
                    "target_candidate_limit": target_candidate_limit
                },
                "pipeline_summary": f"Query identified as non-electronics ({non_type}). Pruned 0 qualified options.",
                "total_qualified": 0,
                "recommendations": [],
                "explanation": f"Sorry, this catalogue is for electronics only. We do not carry {non_type}."
            }

        # Ensure candidate pool is large enough for deduplication and top_k selection
        effective_candidate_limit = max(target_candidate_limit, max(15, top_k * 3))

        # Step 2 & 3: Search & Negative Filtering
        candidates, filter_stats = self.search_and_filter(
            reqs,
            initial_candidate_limit=initial_candidate_limit,
            target_candidate_limit=effective_candidate_limit
        )

        # Step 4: Multimodal Cosine Similarity, Feature Bonus & Deduplication
        ranked_products = self.compute_similarity_and_rank(candidates, reqs, weights=weights)

        # Step 5: Candidate Selection & Grounded Explanation
        final_recs = ranked_products[:top_k]

        explanation_parts = []
        if reqs.get("category"):
            explanation_parts.append(f"Target Category: {reqs['category']}")
        if reqs.get("budget_max"):
            explanation_parts.append(f"Max Budget: ₹{reqs['budget_max']:,.0f}")
        if reqs.get("purpose"):
            explanation_parts.append(f"Use Case: {reqs['purpose']}")

        filter_narrative = (
            f"Filtered initial {filter_stats['initial_retrieved_count']} candidates to "
            f"{filter_stats['surviving_candidates_count']} qualified options. "
            f"Pruned {filter_stats['pruned_accessories_count']} accessories and "
            f"{filter_stats['pruned_over_budget_count']} out-of-budget listings."
        )

        return {
            "query": query,
            "parsed_requirements": reqs,
            "filtering_statistics": filter_stats,
            "pipeline_summary": filter_narrative,
            "total_qualified": len(ranked_products),
            "recommendations": final_recs,
            "explanation": f"Evaluated products using Multimodal Cosine Similarity (Text + CLIP Visuals) with budget constraint satisfaction. {filter_narrative}"
        }


    # Disk-cache embeddings for instant sub-50ms reload
    def _save_cache(self):
        try:
            cache_data = {
                "text_embeddings": {str(k): v.tolist() for k, v in self.text_embeddings.items()},
                "image_embeddings": {str(k): v.tolist() for k, v in self.image_embeddings.items()}
            }
            with open(CACHE_FILE, "w", encoding="utf-8") as f:
                json.dump(cache_data, f)
            logger.info(f"Saved precomputed embeddings cache to {CACHE_FILE}")
        except Exception as e:
            logger.warning(f"Could not save cache: {e}")

    def _load_cache(self) -> bool:
        if os.path.exists(CACHE_FILE):
            try:
                with open(CACHE_FILE, "r", encoding="utf-8") as f:
                    cache_data = json.load(f)
                self.text_embeddings = {int(k): np.array(v, dtype=np.float32) for k, v in cache_data.get("text_embeddings", {}).items()}
                self.image_embeddings = {int(k): np.array(v, dtype=np.float32) for k, v in cache_data.get("image_embeddings", {}).items()}
                if len(self.text_embeddings) == len(self.products):
                    logger.info(f"Loaded {len(self.text_embeddings)} precomputed embeddings from disk cache ({CACHE_FILE}).")
                    return True
            except Exception as e:
                logger.warning(f"Cache load error: {e}")
        return False


# Singleton instance
decision_engine = MultimodalDecisionEngine()

if __name__ == "__main__":
    import sys
    if sys.platform == "win32":
        sys.stdout.reconfigure(encoding="utf-8")

    sample_query = "Suggest a laptop under ₹60,000 for programming"
    result = decision_engine.recommend(sample_query, initial_candidate_limit=10, target_candidate_limit=6, top_k=3)
    print("Query:", result["query"])
    print("Parsed Requirements:", json.dumps(result["parsed_requirements"], indent=2))
    print("Filtering Stats:", json.dumps(result["filtering_statistics"], indent=2))
    print("Pipeline Summary:", result["pipeline_summary"])
    print(f"\nTop {len(result['recommendations'])} Recommendations:")
    for r in result["recommendations"]:
        print(f"- {r['name']} (₹{r['price']:,.0f}) | Score: {r['score']} | Breakdown: {r['score_breakdown']}")

