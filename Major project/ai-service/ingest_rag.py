import json
import logging
import os
import psycopg2  # type: ignore # pyrefly: ignore[missing-import]
from qdrant_manager import QdrantManager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("rag_ingestion")

DB_URL = os.getenv("DATABASE_URL", "postgresql://postgres:deepika08@localhost:5432/ecommerce_db")

def ingest_catalogue_and_reviews():
    logger.info("Starting RAG ingestion pipeline from PostgreSQL to Qdrant...")
    manager = QdrantManager()

    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    chunks = []
    chunk_id = 1

    # 1. Ingest Product Overviews and Descriptions
    cur.execute("""
        SELECT id, name, brand, category, price, rating, review_count, description, specifications 
        FROM products
    """)
    products = cur.fetchall()

    for p in products:
        pid, name, brand, cat, price, rating, review_count, desc, specs = p

        # Chunk 1: Product Overview
        overview_text = (
            f"Product: {name} | Brand: {brand} | Category: {cat} | Price: ₹{price:,.0f} | "
            f"Rating: {rating}★ ({review_count} reviews). "
            f"Description: {desc}"
        )
        chunks.append({
            "id": chunk_id,
            "product_id": pid,
            "product_name": name,
            "category": cat,
            "document_type": "product_overview",
            "text": overview_text,
            "rating": rating
        })
        chunk_id += 1

        # Chunk 2: Product Specifications (Technical Grounding)
        if specs:
            spec_summary = ""
            try:
                specs_dict = json.loads(specs)
                spec_lines = [f"{k.replace('_', ' ').title()}: {v}" for k, v in specs_dict.items()]
                spec_summary = "; ".join(spec_lines)
            except Exception:
                spec_summary = specs

            spec_text = (
                f"Specifications for {name} ({brand} {cat}): {spec_summary}"
            )
            chunks.append({
                "id": chunk_id,
                "product_id": pid,
                "product_name": name,
                "category": cat,
                "document_type": "product_specifications",
                "text": spec_text,
                "rating": rating
            })
            chunk_id += 1

    # 2. Ingest Customer Reviews (Customer sentiment & real-world evidence grounding)
    cur.execute("""
        SELECT r.id, r.product_id, p.name, p.category, r.reviewer_name, r.rating, r.review_text 
        FROM reviews r
        JOIN products p ON r.product_id = p.id
    """)
    reviews = cur.fetchall()

    for r in reviews:
        rid, pid, pname, cat, reviewer, rating, rtext = r
        review_doc = (
            f"Customer Review for {pname} ({cat}) by {reviewer} ({rating}★): \"{rtext}\""
        )
        chunks.append({
            "id": chunk_id,
            "product_id": pid,
            "product_name": pname,
            "category": cat,
            "document_type": "customer_review",
            "text": review_doc,
            "rating": rating,
            "reviewer": reviewer
        })
        chunk_id += 1

    cur.close()
    from agent_tools import release_db_connection
    release_db_connection(conn)

    logger.info(f"Prepared {len(chunks)} text chunks across {len(products)} products and {len(reviews)} reviews.")
    manager.upsert_chunks(chunks)
    logger.info("RAG Ingestion into Qdrant vector database complete!")
    return len(chunks)

if __name__ == "__main__":
    count = ingest_catalogue_and_reviews()
    print(f"Successfully ingested {count} chunks into Qdrant collection 'ecommerce_rag'.")
