# Agentic AI Workflow & Tool Calling Architecture

## 1. Overview
The Agentic AI Shopping Assistant operates as an autonomous decision engine rather than a passive text generator. It decomposes user requests into actionable parameters, queries live application microservices via structured tools, and grounds its responses in factual catalog and review data.

---

## 2. The 6 Agent Tools

| Tool Name | Parameters | Purpose | Backend Service Called |
|---|---|---|---|
| `search_products` | `query` (str), `category` (str), `max_price` (float) | Retrieves eligible products matching keyword or category filters. | Spring Boot `/api/products` (JPA Specification) |
| `get_product_details` | `product_id` (int) | Fetches verified hardware specifications, pricing, stock, and descriptions. | Spring Boot `/api/products/{id}` |
| `get_reviews` | `product_id` (int), `query` (str) | Retrieves customer reviews, sentiment, and star ratings for a specific product. | Spring Boot `/api/products/{id}/reviews` |
| `get_recommendations` | `user_id` (int), `category` (str), `budget_max` (float), `purpose` (str) | Calls the scikit-learn recommendation engine to produce ranked candidates with match reasons. | Python ML Service `/recommend` |
| `compare_products` | `product_ids` (list[int]), `criteria` (str) | Fetches side-by-side attributes and computes comparative advantage matrix. | Spring Boot `/api/compare` |
| `retrieve_product_knowledge` | `query` (str), `category` (str), `top_k` (int) | Queries Qdrant vector database for semantic evidence from descriptions and customer reviews. | Qdrant Vector Collection `ecommerce_rag` |

---

## 3. Decision Workflow State Machine

```
User Message Received
         │
         ▼
[Step 1: Requirement Extraction]
Extract: category, budget_max, purpose, required_features, priorities
         │
         ▼
[Step 2: Tool Selection Routing]
  ├─ If query asks for comparison ("vs", "compare"):
  │    └── Call `compare_products`
  ├─ If query asks for advice / recommendation ("recommend", "under ₹...", "best"):
  │    └── Call `get_recommendations` + `retrieve_product_knowledge`
  ├─ If query asks for customer reviews / opinion ("reviews", "what people say"):
  │    └── Call `get_reviews` + `retrieve_product_knowledge`
  └─ If general product inquiry:
       └── Call `search_products`
         │
         ▼
[Step 3: Tool Execution Loop]
Execute selected tools in parallel / sequence against microservices
         │
         ▼
[Step 4: Grounded Response Synthesis]
  ├─ Enforce Guardrails: Never hallucinate unverified specs or prices
  ├─ Distinguish factual specs (RAM, display) from subjective review feedback
  └─ Format structured recommendation cards for frontend rendering
         │
         ▼
[Step 5: Memory Update]
Store active category, budget constraint, and discussed product IDs in Conversation State
```

---

## 4. Multi-Turn Conversational Memory

To prevent amnesia during shopping journeys, the agent maintains structured memory:

```json
{
  "conversation_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "active_category": "Laptops",
  "budget_max": 70000.0,
  "purpose": "programming",
  "priorities": ["16GB RAM", "battery life"],
  "discussed_products": [1, 3]
}
```

When a user asks a follow-up query like *"Which of those has better battery life?"*, the agent:
1. Detects that the pronoun *"those"* references the previously discussed products (`[1, 3]`).
2. Retrieves specs specifically for products `1` and `3`.
3. Calls `retrieve_product_knowledge` with query *"battery life"* filtered to those products.
4. Explains the comparison without asking the user to re-state their requirements.

---

## 5. Anti-Hallucination Guardrails
- **Prompt Isolation:** Customer reviews and product descriptions from the database are wrapped in `<untrusted_content>` tags to prevent prompt injection from tampering with system rules.
- **Factual Fallback:** If a requested specification is not present in the database, the agent explicitly replies *"Information not specified by manufacturer"* rather than fabricating a value.
