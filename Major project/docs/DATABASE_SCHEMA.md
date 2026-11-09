# Database Schema Documentation

## PostgreSQL Relational Schema (`ecommerce_db`)

The database is built on PostgreSQL with foreign key constraints, default timestamps, and query performance indexes.

---

### Entity Relationship Diagram (Textual Representation)

```
  +------------------+         +----------------------+
  |      users       |<--------|   user_preferences   |
  +------------------+         +----------------------+
       |        |
       |        | 1:N
       |        v
       |   +------------------+
       |   |     reviews      |
       |   +------------------+
       |            |
       |            v
       |   +------------------+         +----------------------+
       |   |     products     |<--------|       wishlist       |
       |   +------------------+         +----------------------+
       |            |
       |            | 1:N
       v            v
  +------------------+         +----------------------+
  |   interactions   |         |      order_items     |
  +------------------+         +----------------------+
       ^                                    |
       |                                    | N:1
       |                                    v
       |                       +----------------------+
       +-----------------------|        orders        |
                               +----------------------+
                                            ^
                                            | (User relationship)
  +------------------+         +----------------------+
  |  conversations   |<--------|    chat_messages     |
  +------------------+         +----------------------+
```

---

### Table Definitions

#### 1. `users`
Stores registered user accounts and credentials.
- `id` (BIGSERIAL, PRIMARY KEY)
- `username` (VARCHAR(50), UNIQUE, NOT NULL)
- `email` (VARCHAR(100), UNIQUE, NOT NULL)
- `password_hash` (VARCHAR(255), NOT NULL) — BCrypt hashed password
- `role` (VARCHAR(20), NOT NULL, DEFAULT 'ROLE_CUSTOMER') — `ROLE_CUSTOMER` or `ROLE_ADMIN`
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT CURRENT_TIMESTAMP)

#### 2. `user_preferences`
Stores explicit shopping preferences for cold-start and personalized ML recommendations.
- `id` (BIGSERIAL, PRIMARY KEY)
- `user_id` (BIGINT, UNIQUE, FOREIGN KEY -> `users(id)` ON DELETE CASCADE)
- `category_preferences` (TEXT) — e.g. "Laptops, Audio"
- `budget_range` (VARCHAR(100)) — e.g. "50000-80000"
- `feature_preferences` (TEXT) — e.g. "16GB RAM, Long Battery"
- `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT CURRENT_TIMESTAMP)

#### 3. `products`
Stores product catalogue items and hardware specifications.
- `id` (BIGSERIAL, PRIMARY KEY)
- `name` (VARCHAR(255), NOT NULL)
- `brand` (VARCHAR(100), NOT NULL)
- `category` (VARCHAR(100), NOT NULL)
- `price` (DECIMAL(12, 2), NOT NULL)
- `description` (TEXT)
- `specifications` (TEXT) — JSON string of hardware specs (RAM, Storage, Battery, etc.)
- `rating` (DECIMAL(3, 2), DEFAULT 0.0)
- `stock_quantity` (INTEGER, NOT NULL, DEFAULT 0)
- `stock_status` (VARCHAR(50), DEFAULT 'IN_STOCK')
- `image_url` (TEXT)
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT CURRENT_TIMESTAMP)

#### 4. `reviews`
Stores customer ratings and text reviews for grounding and RAG.
- `id` (BIGSERIAL, PRIMARY KEY)
- `product_id` (BIGINT, NOT NULL, FOREIGN KEY -> `products(id)` ON DELETE CASCADE)
- `user_id` (BIGINT, FOREIGN KEY -> `users(id)` ON DELETE SET NULL)
- `rating` (DECIMAL(3, 2), NOT NULL)
- `review_text` (TEXT, NOT NULL)
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT CURRENT_TIMESTAMP)

#### 5. `interactions`
Logs user behavior for ML model training and personal affinity scoring.
- `id` (BIGSERIAL, PRIMARY KEY)
- `user_id` (BIGINT, FOREIGN KEY -> `users(id)` ON DELETE CASCADE)
- `product_id` (BIGINT, NOT NULL, FOREIGN KEY -> `products(id)` ON DELETE CASCADE)
- `interaction_type` (VARCHAR(50), NOT NULL) — `VIEW`, `CLICK`, `WISHLIST`, `CART_ADD`, `PURCHASE`
- `timestamp` (TIMESTAMP WITH TIME ZONE, DEFAULT CURRENT_TIMESTAMP)

#### 6. `wishlist`
- `id` (BIGSERIAL, PRIMARY KEY)
- `user_id` (BIGINT, NOT NULL, FOREIGN KEY -> `users(id)` ON DELETE CASCADE)
- `product_id` (BIGINT, NOT NULL, FOREIGN KEY -> `products(id)` ON DELETE CASCADE)
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT CURRENT_TIMESTAMP)
- UNIQUE (`user_id`, `product_id`)

#### 7. `orders`
- `id` (BIGSERIAL, PRIMARY KEY)
- `user_id` (BIGINT, NOT NULL, FOREIGN KEY -> `users(id)` ON DELETE CASCADE)
- `total_amount` (DECIMAL(12, 2), NOT NULL)
- `status` (VARCHAR(50), NOT NULL, DEFAULT 'CONFIRMED')
- `shipping_address` (TEXT)
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT CURRENT_TIMESTAMP)

#### 8. `order_items`
- `id` (BIGSERIAL, PRIMARY KEY)
- `order_id` (BIGINT, NOT NULL, FOREIGN KEY -> `orders(id)` ON DELETE CASCADE)
- `product_id` (BIGINT, NOT NULL, FOREIGN KEY -> `products(id)`)
- `quantity` (INTEGER, NOT NULL)
- `price` (DECIMAL(12, 2), NOT NULL)

#### 9. `conversations` & `chat_messages`
Stores multi-turn conversational context and history.
- `conversations`: `id` (VARCHAR(64), PK), `user_id` (FK), `active_category`, `budget_max`, `purpose`, `discussed_products`, `created_at`.
- `chat_messages`: `id` (BIGSERIAL, PK), `conversation_id` (FK), `role` (`user`, `assistant`), `content`, `timestamp`.

---

### Database Performance Indexes
```sql
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_rating ON products(rating);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_interactions_user_id ON interactions(user_id);
CREATE INDEX idx_interactions_product_id ON interactions(product_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
```
