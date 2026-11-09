# Retrieval-Augmented Generation (RAG) Pipeline

## 1. Overview
The RAG pipeline provides semantic grounding for user questions regarding subjective product characteristics (e.g. "battery endurance in real life", "camera low-light performance", "fan noise while coding").

---

## 2. Document Ingestion & Chunking

### Source Documents
1. **Product Overviews:** Product title, brand, category, price, and manufacturer summary.
2. **Hardware Specifications:** Normalized key-value pairs (Processor, RAM, Storage, Battery, Display, Camera).
3. **Verified Customer Reviews:** Individual review text, star rating, and user experience details.

### Chunk Structure
Each document chunk ingested into Qdrant contains:
- `text`: Cleaned textual representation formatted for semantic embedding.
- `metadata`:
  - `product_id` (int): Database foreign key.
  - `product_name` (str): Full product title.
  - `category` (str): e.g. "Laptops", "Smartphones", "Audio".
  - `doc_type` (str): `"specifications"`, `"overview"`, or `"review"`.
  - `rating` (float): Rating if applicable.

**Total Chunks Ingested in Catalog:** 84 chunks across 14 products.

---

## 3. Embedding Model & Vector Storage

- **Embedding Model:** `sentence-transformers/all-MiniLM-L6-v2`
- **Vector Dimensions:** 384
- **Distance Metric:** Cosine Similarity (`Distance.COSINE`)
- **Vector Database:** Qdrant
- **Collection Name:** `ecommerce_rag`
- **Storage Location:** Disk-backed in `data/qdrant_storage` (or remote cluster via `QDRANT_URL`).

---

## 4. Semantic Retrieval Pipeline

1. **Query Embedding:** Natural language query is vectorized into a 384-dimensional dense vector using the embedding model.
2. **Metadata Filtering:** If the user has an active category constraint (e.g., "Laptops"), a Qdrant filter constraint is applied:
   ```python
   filter = Filter(
       must=[
           FieldCondition(key="category", match=MatchValue(value="Laptops"))
       ]
   )
   ```
3. **Similarity Search:** Qdrant retrieves the Top-K most similar chunks above a relevance score threshold.
4. **Context Injection:** Retrieved chunks are injected into the LLM prompt with explicit citations:
   ```
   [Context Source: Review for Apple MacBook Air M2 (Rating: 5.0)]
   "Battery lasts an astonishing 15-18 hours of continuous web browsing and coding."
   ```

---

## 5. Re-indexing & Maintenance
To re-index or update vectors after adding new products or reviews in PostgreSQL:
```bash
python ai-service/ingest_rag.py
```
Or trigger via the REST endpoint:
```http
POST http://localhost:8002/rag/ingest
```
