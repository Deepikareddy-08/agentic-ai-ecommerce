# Complete Local Setup & Run Guide

## 1. Prerequisites
- **Java:** JDK 17 or JDK 21+ (Tested on Java 22)
- **Maven:** 3.8+ (Provided in `tools/apache-maven-3.9.9`)
- **Node.js:** 18+ & npm
- **Python:** 3.10+
- **PostgreSQL:** 14+ (Tested on PostgreSQL 18 on `localhost:5432`)

---

## 2. Environment Configuration

Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```
Ensure your database credentials match your local PostgreSQL installation:
```properties
DB_URL=jdbc:postgresql://localhost:5432/ecommerce_db
DB_USERNAME=postgres
DB_PASSWORD=deepika08
JWT_SECRET=supersecretkeyformajorprojectaiagenticecommercesystem2026min32chars
ML_SERVICE_URL=http://localhost:8001
AI_SERVICE_URL=http://localhost:8002
GROQ_API_KEY=your_optional_groq_api_key_here
```

---

## 3. Database Initialization

1. Connect to PostgreSQL and create the database:
   ```sql
   CREATE DATABASE ecommerce_db;
   ```

2. Execute the schema and seed scripts using `psql`:
   ```bash
   psql -U postgres -d ecommerce_db -f data/schema.sql
   psql -U postgres -d ecommerce_db -f data/seed_data.sql
   ```
   *This seeds 14 products, 28 customer reviews, and test accounts.*

### Demo Credentials
| Role | Username | Password |
|---|---|---|
| **Administrator** | `admin` | `admin123` |
| **Customer** | `deepika` | `user123` |

---

## 4. Running the Services Locally

Open 4 separate terminal windows:

### Terminal 1: Python ML Recommendation Service (Port 8001)
```bash
cd ml-service
python -m pip install -r requirements.txt
python main.py
```
*Health check:* `curl http://localhost:8001/health`

### Terminal 2: Python AI Agent & Vector RAG Service (Port 8002)
```bash
cd ai-service
python -m pip install -r requirements.txt
# First-time: Ingest catalog and reviews into Qdrant vectors
python ingest_rag.py
# Start the AI Agent service
python main.py
```
*Health check:* `curl http://localhost:8002/health`

### Terminal 3: Spring Boot Backend (Port 8080)
```bash
cd "Major project/Major project/backend/backend"
# Run with Maven toolchain
../../../../tools/apache-maven-3.9.9/bin/mvn spring-boot:run
```
*Health check:* `curl http://localhost:8080/api/products`

### Terminal 4: React Frontend (Port 5173)
```bash
cd "Major project/Major project/frontend"
npm install
npm run dev
```
*Access the Web Application:* Open your browser at `http://localhost:5173`.

---

## 5. Running the Test Suites

### Backend Unit & Integration Tests:
```bash
cd "Major project/Major project/backend/backend"
../../../../tools/apache-maven-3.9.9/bin/mvn test
```

### Recommendation Evaluation & Benchmarks:
```bash
cd ml-service
python evaluate.py
```

### Vector RAG & Agent Multi-Tool Tests:
```bash
cd ai-service
python test_rag_and_agent.py
```

### Frontend Build Test:
```bash
cd "Major project/Major project/frontend"
npm run build
```
