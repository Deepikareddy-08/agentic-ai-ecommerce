import json
import logging
import os
import re
from typing import Any, Dict, List, Optional
import psycopg2  # type: ignore # pyrefly: ignore[missing-import]
from psycopg2.pool import ThreadedConnectionPool  # type: ignore # pyrefly: ignore[missing-import]
import httpx  # type: ignore # pyrefly: ignore[missing-import]
from qdrant_manager import QdrantManager

logger = logging.getLogger("agent_tools")
logging.basicConfig(level=logging.INFO)

DB_URL = os.getenv("DATABASE_URL", "postgresql://postgres:deepika08@localhost:5432/ecommerce_db")
ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://localhost:8001")

qdrant_manager = QdrantManager()
_db_pool: Optional[ThreadedConnectionPool] = None

def get_db_connection():
    global _db_pool
    if _db_pool is None:
        pool_size = max(2, int(os.getenv("DB_POOL_SIZE", "10")))
        _db_pool = ThreadedConnectionPool(1, pool_size, DB_URL)
    return _db_pool.getconn()


def release_db_connection(conn):
    if _db_pool is not None:
        _db_pool.putconn(conn)
    else:
        conn.close()

# Category synonym mappings
CATEGORY_MAPPINGS = {
    # 1. Primary Computing & Mobile
    "laptop": "Laptops",
    "laptops": "Laptops",
    "notebook": "Laptops",
    "notebooks": "Laptops",
    "macbook": "Laptops",
    "thinkpad": "Laptops",
    "ultrabook": "Laptops",
    "chromebook": "Laptops",
    "phone": "Smartphones",
    "phones": "Smartphones",
    "smartphone": "Smartphones",
    "smartphones": "Smartphones",
    "mobile": "Smartphones",
    "mobiles": "Smartphones",
    "iphone": "Smartphones",
    "pixel": "Smartphones",
    "tablet": "Tablets",
    "tablets": "Tablets",
    "ipad": "Tablets",
    "tab": "Tablets",

    # 2. Displays & Entertainment
    "monitor": "Monitors & Displays",
    "monitors": "Monitors & Displays",
    "display": "Monitors & Displays",
    "displays": "Monitors & Displays",
    "gaming monitor": "Monitors & Displays",
    "curved monitor": "Monitors & Displays",
    "tv": "Smart TVs & Home Entertainment",
    "tvs": "Smart TVs & Home Entertainment",
    "smart tv": "Smart TVs & Home Entertainment",
    "smart tvs": "Smart TVs & Home Entertainment",
    "television": "Smart TVs & Home Entertainment",
    "televisions": "Smart TVs & Home Entertainment",
    "oled tv": "Smart TVs & Home Entertainment",
    "qled tv": "Smart TVs & Home Entertainment",

    # 3. Audio & Wearables
    "audio": "Audio & Headphones",
    "bluetooth": "Audio & Headphones",
    "bluetooth speaker": "Audio & Headphones",
    "bluetooth speakers": "Audio & Headphones",
    "bluetooth headphone": "Audio & Headphones",
    "bluetooth headphones": "Audio & Headphones",
    "bluetooth earphone": "Audio & Headphones",
    "bluetooth earphones": "Audio & Headphones",
    "bluetooth earbuds": "Audio & Headphones",
    "bluetooth device": "Audio & Headphones",
    "bluetooth audio": "Audio & Headphones",
    "wireless headphone": "Audio & Headphones",
    "wireless headphones": "Audio & Headphones",
    "wireless earphones": "Audio & Headphones",
    "wireless earbuds": "Audio & Headphones",
    "speaker": "Audio & Headphones",
    "speakers": "Audio & Headphones",
    "soundbar": "Audio & Headphones",
    "soundbars": "Audio & Headphones",
    "headphone": "Audio & Headphones",
    "headphones": "Audio & Headphones",
    "earbud": "Audio & Headphones",
    "earbuds": "Audio & Headphones",
    "earphone": "Audio & Headphones",
    "earphones": "Audio & Headphones",
    "tws": "Audio & Headphones",
    "airpods": "Audio & Headphones",
    "smartwatch": "Smartwatches",
    "smartwatches": "Smartwatches",
    "watch": "Smartwatches",
    "watches": "Smartwatches",
    "apple watch": "Smartwatches",
    "galaxy watch": "Smartwatches",

    # 4. Cameras, Drones, Gaming & AR/VR
    "camera": "Cameras & Gaming",
    "cameras": "Cameras & Gaming",
    "dslr": "Cameras & Gaming",
    "mirrorless": "Cameras & Gaming",
    "gaming": "Cameras & Gaming",
    "console": "Cameras & Gaming",
    "consoles": "Cameras & Gaming",
    "ps5": "Cameras & Gaming",
    "playstation": "Cameras & Gaming",
    "nintendo": "Cameras & Gaming",
    "drone": "Drones & Aerial Imaging",
    "drones": "Drones & Aerial Imaging",
    "gimbal": "Drones & Aerial Imaging",
    "gimbals": "Drones & Aerial Imaging",
    "vr": "AR, VR & Spatial Computing",
    "ar": "AR, VR & Spatial Computing",
    "vr headset": "AR, VR & Spatial Computing",
    "meta quest": "AR, VR & Spatial Computing",
    "smart glasses": "AR, VR & Spatial Computing",

    # 5. Smart Living, Appliances & Care
    "robot vacuum": "Robot Vacuums & Smart Cleaning",
    "robot vacuums": "Robot Vacuums & Smart Cleaning",
    "cordless vacuum": "Robot Vacuums & Smart Cleaning",
    "smart home": "Smart Home & Automation",
    "smart speaker": "Smart Home & Automation",
    "smart display": "Smart Home & Automation",
    "echo show": "Smart Home & Automation",
    "nest hub": "Smart Home & Automation",
    "kitchen": "Kitchen & Home Appliances",
    "appliance": "Kitchen & Home Appliances",
    "appliances": "Kitchen & Home Appliances",
    "air fryer": "Kitchen & Home Appliances",
    "coffee machine": "Kitchen & Home Appliances",
    "personal care": "Personal Care Electronics",
    "hair dryer": "Personal Care Electronics",
    "electric toothbrush": "Personal Care Electronics",
    "shaver": "Personal Care Electronics",

    # 6. Connectivity, Health & Power
    "router": "Networking & Wireless",
    "routers": "Networking & Wireless",
    "mesh wifi": "Networking & Wireless",
    "wifi router": "Networking & Wireless",
    "smart ring": "Smart Wearables & Health Electronics",
    "oura ring": "Smart Wearables & Health Electronics",
    "whoop": "Smart Wearables & Health Electronics",
    "blood pressure": "Smart Wearables & Health Electronics",
    "power bank": "Power Banks & Portable Power",
    "power banks": "Power Banks & Portable Power",
    "portable power": "Power Banks & Portable Power",
    "power station": "Power Banks & Portable Power",
    "security camera": "Smart Security & Surveillance",
    "cctv": "Smart Security & Surveillance",
    "video doorbell": "Smart Security & Surveillance",
    "smart lock": "Smart Security & Surveillance",
    "audio interface": "Audio Production & Studio Gear",
    "studio mic": "Audio Production & Studio Gear",
    "midi controller": "Audio Production & Studio Gear",
    "kindle": "E-Readers & Digital Paper",
    "e-reader": "E-Readers & Digital Paper",
    "remarkable": "E-Readers & Digital Paper",
    "printer": "Printers & Office Electronics",
    "printers": "Printers & Office Electronics",
    "scanner": "Printers & Office Electronics",
    "dash cam": "Car Electronics & Dash Cams",
    "dash cams": "Car Electronics & Dash Cams",

    # 7. Components & Accessories (Only specific terms)
    "pc component": "PC & Gaming Components",
    "pc components": "PC & Gaming Components",
    "gpu": "PC & Gaming Components",
    "graphics card": "PC & Gaming Components",
    "motherboard": "PC & Gaming Components",
    "accessory": "Accessories",
    "accessories": "Accessories"
}

def normalize_category(cat: Optional[str]) -> Optional[str]:
    if not cat:
        return None
    c = cat.strip().lower()
    if c == "all":
        return None
    return CATEGORY_MAPPINGS.get(c, cat.strip())

# ----------------- Tool 1: search_products -----------------
def search_products(
    query: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_rating: Optional[float] = None,
    limit: int = 5
) -> List[Dict[str, Any]]:
    """
    Search product catalogue with structured filters in PostgreSQL.
    Supports intelligent tokenization across name, description, brand, and specifications.
    """
    STOP_WORDS = {
        "under", "below", "less", "than", "budget", "within", "around", "for", "with",
        "and", "or", "in", "the", "a", "an", "to", "of", "is", "it", "at", "by", "on",
        "i", "me", "my", "need", "want", "show", "find", "get", "suggest", "recommend",
        "best", "good", "top", "looking", "please", "can", "you", "give", "laptop", "laptops",
        "phone", "phones", "smartphone", "smartphones", "watch", "watches", "product", "products"
    }

    conn = get_db_connection()
    cur = conn.cursor()

    def build_query(use_tokens: bool):
        sql = "SELECT id, name, brand, category, price, stock, rating, review_count, image_url, description FROM products WHERE 1=1"
        params = []

        if use_tokens and query and query.strip():
            raw_tokens = re.findall(r'[a-zA-Z0-9]+', query.lower())
            sig_tokens = [t for t in raw_tokens if t not in STOP_WORDS and len(t) > 1]
            if sig_tokens:
                token_clauses = []
                for tok in sig_tokens[:4]:
                    token_clauses.append("(LOWER(name) LIKE %s OR LOWER(description) LIKE %s OR LOWER(brand) LIKE %s OR LOWER(COALESCE(specifications, '')) LIKE %s)")
                    pat = f"%{tok}%"
                    params.extend([pat, pat, pat, pat])
                sql += " AND (" + " OR ".join(token_clauses) + ")"

        norm_cat = normalize_category(category)
        if norm_cat:
            sql += " AND (LOWER(category) = LOWER(%s) OR LOWER(category) LIKE %s)"
            params.extend([norm_cat, f"%{norm_cat.lower()}%"])

        q_lower = (query or "").lower()
        if (norm_cat and "audio" in norm_cat.lower()) or any(w in q_lower for w in ["audio", "bluetooth", "speaker", "headphone", "earphone", "earbud", "soundbar"]):
            sql += " AND LOWER(category) NOT IN ('smartphones', 'laptops', 'smartwatches')"

        if norm_cat and "smartphone" in norm_cat.lower():
            sql += " AND LOWER(category) NOT IN ('audio & headphones', 'laptops', 'smartwatches')"

        if norm_cat and "laptop" in norm_cat.lower():
            sql += " AND LOWER(category) NOT IN ('smartphones', 'audio & headphones', 'smartwatches')"

        if (norm_cat and "tv" in norm_cat.lower()) or any(w in q_lower for w in ["tv", "television"]):
            sql += " AND LOWER(name) NOT LIKE '%soundbar%' AND LOWER(name) NOT LIKE '%home theatre%' AND LOWER(category) NOT IN ('smartphones', 'laptops')"

        if min_price is not None and min_price >= 0:
            sql += " AND price >= %s"
            params.append(min_price)

        if max_price is not None and max_price > 0:
            sql += " AND price <= %s"
            params.append(max_price)

        if min_rating is not None and min_rating > 0:
            sql += " AND rating >= %s"
            params.append(min_rating)

        sql += " ORDER BY rating DESC, review_count DESC, id ASC LIMIT %s"
        params.append(limit)
        return sql, params

    # Attempt with tokenized query first
    sql, params = build_query(use_tokens=True)
    cur.execute(sql, tuple(params))
    rows = cur.fetchall()

    # Fallback to category & price filter if specific token combination yielded no rows
    if not rows and query:
        sql_fallback, params_fallback = build_query(use_tokens=False)
        cur.execute(sql_fallback, tuple(params_fallback))
        rows = cur.fetchall()

    cur.close()
    release_db_connection(conn)

    results = []
    for r in rows:
        results.append({
            "product_id": r[0],
            "name": r[1],
            "brand": r[2],
            "category": r[3],
            "price": float(r[4]),
            "stock": r[5],
            "rating": float(r[6]),
            "review_count": r[7],
            "image_url": r[8],
            "description": r[9]
        })
    return results

# ----------------- Tool 2: get_product_details -----------------
def get_product_details(product_id: int) -> Optional[Dict[str, Any]]:
    """
    Get verified attributes and full specifications for a product.
    """
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT id, name, brand, category, price, stock, rating, review_count, 
               image_url, description, specifications 
        FROM products WHERE id = %s
    """, (product_id,))
    r = cur.fetchone()
    cur.close()
    release_db_connection(conn)

    if not r:
        return None

    specs_parsed = {}
    if r[10]:
        try:
            specs_parsed = json.loads(r[10])
        except Exception:
            specs_parsed = {"raw": r[10]}

    return {
        "id": r[0],
        "product_id": r[0],
        "name": r[1],
        "brand": r[2],
        "category": r[3],
        "price": float(r[4]),
        "stock": r[5],
        "rating": float(r[6]),
        "review_count": r[7],
        "image_url": r[8],
        "description": r[9],
        "specifications": specs_parsed
    }

# ----------------- Tool 3: get_reviews -----------------
def get_reviews(product_id: int, query: Optional[str] = None, limit: int = 4) -> List[Dict[str, Any]]:
    """
    Retrieve authentic customer reviews from PostgreSQL.
    """
    conn = get_db_connection()
    cur = conn.cursor()

    if query and query.strip():
        sql = """
            SELECT id, reviewer_name, rating, review_text, created_at 
            FROM reviews 
            WHERE product_id = %s AND LOWER(review_text) LIKE %s 
            ORDER BY rating DESC LIMIT %s
        """
        cur.execute(sql, (product_id, f"%{query.strip().lower()}%", limit))
    else:
        sql = """
            SELECT id, reviewer_name, rating, review_text, created_at 
            FROM reviews 
            WHERE product_id = %s 
            ORDER BY created_at DESC LIMIT %s
        """
        cur.execute(sql, (product_id, limit))

    rows = cur.fetchall()
    cur.close()
    release_db_connection(conn)

    reviews = []
    for r in rows:
        reviews.append({
            "review_id": r[0],
            "reviewer_name": r[1],
            "rating": r[2],
            "review_text": r[3],
            "created_at": str(r[4])
        })
    return reviews

# ----------------- Tool 4: get_recommendations & decision_recommend -----------------
def decision_recommend(
    query: str,
    initial_candidate_limit: int = 10,
    target_candidate_limit: int = 6,
    top_k: int = 3
) -> Dict[str, Any]:
    """
    Call ML Multimodal Decision Engine for NLU parsing, negative accessory filtering,
    and normalized Cosine Similarity scoring.
    """
    payload = {
        "query": query,
        "initial_candidate_limit": initial_candidate_limit,
        "target_candidate_limit": target_candidate_limit,
        "top_k": top_k
    }
    try:
        with httpx.Client(timeout=4.0) as client:
            resp = client.post(f"{ML_SERVICE_URL}/decision/recommend", json=payload)
            if resp.status_code == 200:
                return resp.json()
    except Exception as e:
        logger.warning(f"Decision endpoint unavailable ({e}); falling back to standard recommender.")
    return get_recommendations(purpose=query, limit=top_k)


def get_recommendations(
    user_id: Optional[int] = None,
    category: Optional[str] = None,
    max_budget: Optional[float] = None,
    min_budget: Optional[float] = None,
    purpose: Optional[str] = None,
    required_features: Optional[List[str]] = None,
    preferred_features: Optional[List[str]] = None,
    limit: int = 5
) -> Dict[str, Any]:
    """
    Call ML recommendation service for content-based candidate ranking.
    """
    # Attempt intelligent decision model first if natural language query exists
    synth_query = f"Suggest {category or 'product'}"
    if max_budget: synth_query += f" under ₹{max_budget:,.0f}"
    if purpose: synth_query += f" for {purpose}"
    if required_features: synth_query += f" with {', '.join(required_features)}"

    try:
        with httpx.Client(timeout=4.0) as client:
            dec_resp = client.post(
                f"{ML_SERVICE_URL}/decision/recommend",
                json={"query": synth_query, "top_k": limit, "target_candidate_limit": limit}
            )
            if dec_resp.status_code == 200:
                data = dec_resp.json()
                # Adapt decision engine recommendations to standard schema
                recs = []
                for item in data.get("recommendations", []):
                    recs.append({
                        "product_id": item["product_id"],
                        "name": item["name"],
                        "price": item["price"],
                        "category": item["category"],
                        "score": item["score"],
                        "match_reason": "; ".join(item.get("match_reasons", [])[:2]),
                        "score_breakdown": item.get("score_breakdown")
                    })
                return {
                    "recommendations": recs,
                    "explanation": data.get("explanation"),
                    "pipeline_summary": data.get("pipeline_summary"),
                    "strategy": "Multimodal Cosine Similarity Decision Model"
                }
    except Exception as e:
        logger.debug(f"Decision recommend bypass: {e}")

    payload = {
        "user_id": user_id,
        "category": category,
        "min_budget": min_budget,
        "max_budget": max_budget,
        "purpose": purpose,
        "required_features": required_features or [],
        "preferred_features": preferred_features or [],
        "limit": limit
    }

    try:
        with httpx.Client(timeout=4.0) as client:
            resp = client.post(f"{ML_SERVICE_URL}/recommend", json=payload)
            if resp.status_code == 200:
                return resp.json()
    except Exception as e:
        logger.warning(f"ML service unreachable, using direct SQL search fallback: {e}")

    # Direct fallback if ML service offline
    candidates = search_products(category=category, max_price=max_budget, min_price=min_budget, limit=limit)
    recs = []
    for c in candidates:
        recs.append({
            "product_id": c["product_id"],
            "name": c["name"],
            "price": c["price"],
            "category": c["category"],
            "score": round(c["rating"] / 5.0, 2),
            "match_reason": f"Top-rated {c['category']} ({c['rating']}★) fitting budget"
        })
    return {
        "recommendations": recs,
        "explanation": "Matched top candidates from database catalogue.",
        "strategy": "Database Fallback"
    }


# ----------------- Tool 5: compare_products -----------------
def compare_products(product_ids: List[int]) -> Dict[str, Any]:
    """
    Compare 2 or more products side-by-side using exact database attributes.
    """
    if len(product_ids) < 2:
        return {"error": "At least 2 product IDs required for comparison"}

    products = []
    for pid in product_ids:
        details = get_product_details(pid)
        if details:
            products.append(details)

    if len(products) < 2:
        return {"error": "Could not find at least 2 valid products to compare"}

    comparison = {
        "products": [
            {
                "id": p["product_id"],
                "name": p["name"],
                "brand": p["brand"],
                "category": p["category"],
                "price": p["price"],
                "rating": p["rating"],
                "stock": p["stock"],
                "specifications": p["specifications"]
            }
            for p in products
        ],
        "key_differences": []
    }

    # Identify price & rating leader
    sorted_by_price = sorted(products, key=lambda x: x["price"])
    sorted_by_rating = sorted(products, key=lambda x: x["rating"], reverse=True)

    comparison["key_differences"].append(
        f"Price Winner: '{sorted_by_price[0]['name']}' at ₹{sorted_by_price[0]['price']:,.0f} vs "
        f"'{sorted_by_price[-1]['name']}' at ₹{sorted_by_price[-1]['price']:,.0f}"
    )
    comparison["key_differences"].append(
        f"Rating Winner: '{sorted_by_rating[0]['name']}' with {sorted_by_rating[0]['rating']}★"
    )

    return comparison

# ----------------- Tool 6: retrieve_product_knowledge -----------------
def retrieve_product_knowledge(
    query: str,
    category: Optional[str] = None,
    top_k: int = 4
) -> List[Dict[str, Any]]:
    """
    Semantic RAG search over specifications and customer reviews in Qdrant.
    """
    return qdrant_manager.semantic_search(query=query, top_k=top_k, category=category)

# Tool Schemas for LLM Function Calling (OpenAI / Groq format)
TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "search_products",
            "description": "Search the verified product catalogue by keyword, category, price range, and minimum rating.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search keyword like 'ThinkPad', 'Apple Watch', 'Noise'"},
                    "category": {"type": "string", "description": "Category: Smartwatches, Laptops, Smartphones, Audio & Headphones, Cameras & Gaming, Tablets, Accessories"},
                    "min_price": {"type": "number", "description": "Minimum budget in INR"},
                    "max_price": {"type": "number", "description": "Maximum budget in INR"},
                    "min_rating": {"type": "number", "description": "Minimum rating from 1 to 5"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_product_details",
            "description": "Fetch complete verified technical specifications, stock, and live price for a specific product ID.",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_id": {"type": "integer", "description": "The unique product ID"}
                },
                "required": ["product_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_reviews",
            "description": "Fetch authentic customer reviews and sentiment for a product from the database.",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_id": {"type": "integer", "description": "Product ID"},
                    "query": {"type": "string", "description": "Filter topic, e.g. 'battery', 'compiler', 'noise'"}
                },
                "required": ["product_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_recommendations",
            "description": "Invoke the ML recommendation engine to get content-based candidate ranking matching requirements.",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "integer", "description": "Authenticated user ID if available"},
                    "category": {"type": "string", "description": "Category: Smartwatches, Laptops, Smartphones, Audio & Headphones, Cameras & Gaming, Tablets, Accessories"},
                    "max_budget": {"type": "number", "description": "Upper budget in INR"},
                    "purpose": {"type": "string", "description": "e.g. programming, gaming, photography, fitness"},
                    "required_features": {"type": "array", "items": {"type": "string"}, "description": "Mandatory features"},
                    "preferred_features": {"type": "array", "items": {"type": "string"}, "description": "Preferred features"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "compare_products",
            "description": "Perform factual side-by-side comparison of 2 to 5 products using exact specifications and prices.",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_ids": {"type": "array", "items": {"type": "integer"}, "description": "List of 2 to 5 product IDs to compare"}
                },
                "required": ["product_ids"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "retrieve_product_knowledge",
            "description": "Retrieve semantic text evidence from Qdrant vector database covering reviews and specifications.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Natural language question or search query"},
                    "category": {"type": "string", "description": "Optional category filter"}
                },
                "required": ["query"]
            }
        }
    }
]
