# API Documentation

This document describes all REST API endpoints across the **Spring Boot Backend**, **Python ML Service**, and **Python AI Service**.

---

## 1. Spring Boot Backend APIs (Port 8080)

Base URL: `http://localhost:8080`

### Authentication (`/api/auth`)

#### 1. Register User
- **Method:** `POST /api/auth/register`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "secretpassword",
    "role": "ROLE_CUSTOMER"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "type": "Bearer",
    "id": 4,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "ROLE_CUSTOMER"
  }
  ```

#### 2. Login User
- **Method:** `POST /api/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "username": "johndoe",
    "password": "secretpassword"
  }
  ```
- **Response:** `200 OK` (Returns same structure as registration with valid JWT token).

---

### User Preferences (`/api/users/profile/preferences`)

#### 1. Get User Preferences
- **Method:** `GET /api/users/profile/preferences`
- **Access:** Authenticated (`ROLE_CUSTOMER` or `ROLE_ADMIN`)
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK`
  ```json
  {
    "categoryPreferences": "Laptops, Audio",
    "budgetRange": "50000-80000",
    "featurePreferences": "16GB RAM, Long Battery"
  }
  ```

#### 2. Save User Preferences
- **Method:** `POST /api/users/profile/preferences`
- **Access:** Authenticated
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "categoryPreferences": "Laptops",
    "budgetRange": "60000-75000",
    "featurePreferences": "16GB RAM, OLED Display"
  }
  ```
- **Response:** `200 OK`

---

### Products Catalogue (`/api/products`)

#### 1. Search & Filter Products
- **Method:** `GET /api/products`
- **Access:** Public
- **Query Parameters:**
  - `query` (string, optional): Search keyword matching product name, brand, or description.
  - `category` (string, optional): e.g. "Laptops", "Smartphones", "Audio".
  - `minPrice` (double, optional): Minimum budget.
  - `maxPrice` (double, optional): Maximum budget.
  - `minRating` (double, optional): Minimum customer rating.
  - `sortBy` (string, optional): `price_asc`, `price_desc`, `rating_desc`.
  - `page` (int, default 0): Page index.
  - `size` (int, default 12): Page size.
- **Response:** `200 OK` (Spring Data JPA `Page<Product>`).

#### 2. Get Product By ID
- **Method:** `GET /api/products/{id}`
- **Access:** Public
- **Response:** `200 OK`
  ```json
  {
    "id": 1,
    "name": "Apple MacBook Air M2",
    "brand": "Apple",
    "category": "Laptops",
    "price": 94990.00,
    "rating": 4.8,
    "description": "Ultra-thin laptop featuring the powerful Apple M2 chip...",
    "specifications": "{\"ram\": \"16GB\", \"storage\": \"512GB SSD\", ...}",
    "stockQuantity": 15,
    "stockStatus": "IN_STOCK",
    "imageUrl": "https://..."
  }
  ```

#### 3. Create Product (Admin Only)
- **Method:** `POST /api/products`
- **Access:** Authenticated (`ROLE_ADMIN`)
- **Headers:** `Authorization: Bearer <token>`

#### 4. Update Product (Admin Only)
- **Method:** `PUT /api/products/{id}`
- **Access:** Authenticated (`ROLE_ADMIN`)

#### 5. Delete Product (Admin Only)
- **Method:** `DELETE /api/products/{id}`
- **Access:** Authenticated (`ROLE_ADMIN`)

---

### Customer Reviews (`/api/products/{id}/reviews`)

#### 1. Get Reviews for Product
- **Method:** `GET /api/products/{id}/reviews`
- **Access:** Public
- **Response:** `200 OK` (Array of review objects with ratings and comments).

#### 2. Add Review
- **Method:** `POST /api/products/{id}/reviews`
- **Access:** Authenticated (`ROLE_CUSTOMER` or `ROLE_ADMIN`)
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "rating": 5.0,
    "reviewText": "Exceptional battery life and stellar build quality."
  }
  ```

---

### Orders & Checkout (`/api/orders`)

#### 1. Place Order
- **Method:** `POST /api/orders`
- **Access:** Authenticated
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "shippingAddress": "123 Tech Park Ave, Bangalore",
    "items": [
      { "productId": 1, "quantity": 1 }
    ]
  }
  ```
- **Response:** `200 OK` (Created Order object with calculated totals and confirmed status).

#### 2. Get My Orders
- **Method:** `GET /api/orders/my-orders`
- **Access:** Authenticated
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK` (List of orders belonging only to the authenticated user).

#### 3. Admin: List All Orders
- **Method:** `GET /api/orders/admin/all`
- **Access:** Authenticated (`ROLE_ADMIN`)

#### 4. Admin: Update Order Status
- **Method:** `PATCH /api/orders/admin/{id}/status?status=SHIPPED`
- **Access:** Authenticated (`ROLE_ADMIN`)

---

### AI Chat Assistant (`/api/chat`)

- **Method:** `POST /api/chat`
- **Access:** Public / Authenticated
- **Request Body:**
  ```json
  {
    "message": "I need a laptop under 70000 for coding with 16GB RAM",
    "conversationId": null,
    "userId": 2
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "reply": "Based on your criteria, here are the best options...",
    "conversationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "toolsExecuted": ["get_recommendations", "retrieve_product_knowledge"],
    "recommendedProducts": [ ... ]
  }
  ```

---

### Product Comparison (`/api/compare`)

- **Method:** `POST /api/compare`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "productIds": [1, 2],
    "userCriteria": "Which has better battery for coding?"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "products": [ ... ],
    "comparisonMatrix": { "price": {...}, "ram": {...} },
    "aiExplanation": "Side-by-side analysis between Apple MacBook Air M2 and Dell XPS 13..."
  }
  ```

---

## 2. Python ML Recommendation Service (Port 8001)

Base URL: `http://localhost:8001`

### 1. Get Recommendations
- **Method:** `POST /recommend`
- **Request Body:**
  ```json
  {
    "user_id": 2,
    "category": "Laptops",
    "budget_max": 75000,
    "purpose": "programming",
    "required_features": ["16GB RAM"],
    "top_k": 5
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "user_id": 2,
    "count": 3,
    "recommendations": [
      {
        "product_id": 3,
        "score": 0.892,
        "reason": "Matches category 'Laptops', within budget ₹75000 (Price: ₹64,990), high rating (4.7★), contains 16GB RAM.",
        "product": { ... }
      }
    ]
  }
  ```

### 2. Service Health
- **Method:** `GET /health`
- **Response:** `{"status": "healthy", "service": "ecommerce-recommendation-engine"}`

---

## 3. Python AI Agent & RAG Service (Port 8002)

Base URL: `http://localhost:8002`

### 1. Agent Multi-Tool Chat
- **Method:** `POST /agent/chat`
- **Request Body:**
  ```json
  {
    "message": "Which laptop has the best battery life?",
    "conversation_id": "optional-uuid",
    "user_id": 2
  }
  ```
- **Response:** `200 OK` (reply, tools_executed, recommended_products, state).

### 2. Qdrant Semantic Retrieval
- **Method:** `POST /rag/retrieve`
- **Request Body:**
  ```json
  {
    "query": "long lasting battery for travel",
    "category": "Laptops",
    "top_k": 4
  }
  ```
- **Response:** `200 OK` (Array of scored document chunks with metadata).

### 3. Trigger Ingestion
- **Method:** `POST /rag/ingest`
- **Response:** `{"status": "success", "indexed_documents": 84}`
