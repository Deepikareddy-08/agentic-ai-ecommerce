# System Architecture Document

## Agentic AI-Based E-Commerce Platform for Personalized Product Recommendation

### 1. High-Level Architectural Overview

The platform uses a decoupled microservices architecture designed to separate transactional e-commerce business operations, mathematical machine-learning ranking, and generative AI orchestration.

```
+-------------------------------------------------------------------------------+
|                               React Frontend                                  |
|         Vite + Modern Responsive CSS + Lucide Icons + Axios Interceptors       |
+-------------------------------------------------------------------------------+
                                      |
                                  HTTPS / REST
                                      |
                                      v
+-------------------------------------------------------------------------------+
|                           Spring Boot Backend (8080)                          |
|   - Stateless JWT Authentication & Role-based Authorization (Spring Security) |
|   - Product Catalogue Specification Engine (Spring Data JPA)                  |
|   - Atomic Order Placement, Stock Deduction & Price Validation                |
|   - Customer Review & Interaction Logging Engine                              |
|   - Internal Gateway to ML & AI Services (RestTemplate)                       |
+-------------------------------------------------------------------------------+
       |                                   |                           |
       | JPA / JDBC                        | REST (Internal)           | REST (Internal)
       v                                   v                           v
+---------------+             +-----------------------+   +-----------------------+
|  PostgreSQL   |             |   Python ML Service   |   |   Python AI Service   |
|   Database    |             |        (8001)         |   |        (8002)         |
|   - Users     |             | - FastAPI             |   | - FastAPI             |
|   - Products  |             | - scikit-learn        |   | - Agent Orchestrator  |
|   - Orders    |             | - TF-IDF Vectors      |   | - 6 Grounded Tools    |
|   - Reviews   |             | - Cosine Similarity   |   | - Multi-turn Memory   |
| - Interactions|             | - Requirement Filters |   | - Groq / LLM Engine   |
|   - Sessions  |             +-----------------------+   +-----------------------+
+---------------+                                                      |
                                                                       | Vector Search
                                                                       v
                                                          +-----------------------+
                                                          |    Qdrant Vector DB   |
                                                          |  (Local / Disk: 8002) |
                                                          | - 384-dim Embeddings  |
                                                          |   (all-MiniLM-L6-v2)  |
                                                          | - Product Overviews   |
                                                          | - Hardware Specs      |
                                                          | - Verified Reviews    |
                                                          +-----------------------+
```

---

### 2. Service Responsibilities & Boundaries

#### A. React Frontend (`frontend/`)
- **Technology:** React 18+, Vite, Axios, Lucide React, Custom Responsive CSS Design System.
- **Port:** 5173 (dev) / 80 (nginx in Docker).
- **Responsibilities:**
  - Catalog browsing with dynamic search, category filtering, price/rating sorting, and pagination.
  - Interactive Agentic AI Shopping Advisor with prompt suggestions, real-time tool badges, and embedded recommendation cards.
  - Side-by-side product comparison matrix with technical specifications and AI comparative synthesis.
  - ML recommendation explorer with interactive budget and purpose adjusters.
  - Persistent shopping cart with line-item management and order checkout.
  - User authentication (JWT storage), profile management, preference editor, and order history.
  - Administrator dashboard for product catalogue CRUD and order fulfillment.

#### B. Spring Boot Backend (`backend/`)
- **Technology:** Spring Boot 3.4.2, Java 17/22, Spring Data JPA, Spring Security, Hibernate, PostgreSQL Driver.
- **Port:** 8080.
- **Responsibilities:**
  - System of record for all business entities (Users, Products, Reviews, Interactions, Orders, Wishlist, Chat Messages).
  - Secure authentication via BCrypt password hashing and HMAC-SHA256 JWT tokens.
  - Role-Based Access Control (`ROLE_CUSTOMER`, `ROLE_ADMIN`).
  - Dynamic product search using Spring Data JPA `Specification<Product>` avoiding SQL injection.
  - Robust checkout pipeline: atomic stock validation, live database price verification, and order generation.
  - Proxy orchestrator forwarding recommendation requests to the Python ML service and chat queries to the Python AI service.

#### C. Machine Learning Recommendation Service (`ml-service/`)
- **Technology:** Python 3.10+, FastAPI, Uvicorn, scikit-learn, NumPy, psycopg2.
- **Port:** 8001.
- **Responsibilities:**
  - Direct connection to PostgreSQL product and interaction tables.
  - Text feature engineering combining category, brand, specs, description, and review sentiment.
  - TF-IDF vectorization and cosine similarity matrix calculation.
  - Personalization scoring factoring in user preference vectors and interaction weights (`PURCHASE` > `CART_ADD` > `WISHLIST` > `VIEW`).
  - Hard constraint filtering (budget limits, category restrictions, required specifications).
  - Outputting interpretable explanations for match scores.

#### D. AI Agent & Vector RAG Service (`ai-service/`)
- **Technology:** Python 3.10+, FastAPI, Qdrant Client, Sentence-Transformers (`all-MiniLM-L6-v2`), Groq LLM API / Fallback Engine.
- **Port:** 8002.
- **Responsibilities:**
  - Semantic vector storage in Qdrant collection `ecommerce_rag`.
  - Ingestion pipeline parsing products, hardware specifications, and customer reviews into grounded chunks.
  - Natural-language intent extraction parsing user budget, category, purpose, and priorities.
  - Autonomous Agent Orchestrator managing a 6-tool execution loop:
    1. `search_products`
    2. `get_product_details`
    3. `get_reviews`
    4. `get_recommendations`
    5. `compare_products`
    6. `retrieve_product_knowledge`
  - Compact multi-turn conversational memory tracking active context across follow-up queries.
  - Grounding guardrails ensuring responses only cite verified catalog and review data.

---

### 3. Data Flow Architecture

#### Scenario: User Natural-Language Shopping Query
1. **User input:** User asks in React: *"I need a laptop under ₹70,000 for programming with 16GB RAM and good battery life."*
2. **Spring Boot Proxy:** `POST /api/chat` receives the message and forwards it to `POST http://localhost:8002/agent/chat` along with user context and conversation ID.
3. **Intent Extraction:** AI Service parses the query into structured JSON:
   ```json
   {
     "category": "Laptops",
     "budget_max": 70000,
     "purpose": "programming",
     "required_features": ["16GB RAM"],
     "priorities": ["battery life"]
   }
   ```
4. **Tool Selection & Execution:**
   - Agent invokes `get_recommendations` passing user ID, category `Laptops`, budget `70000`, purpose `programming`.
   - Tool queries the ML recommendation engine (`http://localhost:8001/recommend`) which computes TF-IDF similarity on catalog items.
   - Agent invokes `retrieve_product_knowledge` querying Qdrant for semantic chunks on battery endurance and programming performance.
5. **Grounded Synthesis:** The LLM receives the tool outputs as factual context and generates a response citing specific specs and user reviews.
6. **State Storage:** The conversation context (active category, budget, discussed product IDs) is persisted in the database.
7. **Frontend Display:** React renders the assistant's reply along with interactive product cards and badges indicating which tools were executed.
