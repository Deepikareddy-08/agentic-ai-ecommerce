# Quick Start Guide: How to Run on Another Laptop

Follow these simple steps to run this project on any other Windows laptop after unzipping the folder.

---

## 1. Prerequisites (Install Once)

Make sure the following 4 tools are installed on the laptop:

1. **Python 3.10+**: Download from [python.org](https://www.python.org/downloads/)
   > ⚠️ **Important**: Check the box **"Add python.exe to PATH"** during installation.
2. **Node.js (LTS v18 or v20+)**: Download from [nodejs.org](https://nodejs.org/)
3. **Java 17 or 21 (JDK)**: Download from [Adoptium Temurin](https://adoptium.net/) or Oracle JDK.
4. **PostgreSQL (v14 to v18)**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - Set password for `postgres` user as: `deepika08`

---

## 2. One-Time Setup

### Step A: Initialize the Database
Open **SQL Shell (psql)** or **pgAdmin Query Tool**, and run:

```sql
CREATE DATABASE ecommerce_db;
```

Then in Command Prompt / Terminal, navigate to the unzipped project folder and run:
```bash
psql -U postgres -d ecommerce_db -f data/schema.sql
psql -U postgres -d ecommerce_db -f data/seed_data.sql
```
*(When prompted for password, enter: `deepika08`)*

---

### Step B: Install Python Dependencies
Open Command Prompt in the project root:

```bash
cd ml-service
pip install -r requirements.txt
cd ..

cd ai-service
pip install -r requirements.txt
cd ..
```

---

### Step C: Install Frontend Dependencies
```bash
cd "Major project\frontend"
npm install
cd ..\..
```

---

## 3. How to Run the Entire Application

Simply double-click the batch file in the root folder:

👉 **`run_all.bat`**

This launches all 4 services in their own terminal windows:
1. **Python ML Service** (Port `8001`)
2. **Python AI Agent Service** (Port `8002` — powered by live Groq LLM & Vector RAG)
3. **Spring Boot Backend** (Port `8080` — connected to PostgreSQL 18)
4. **React Frontend** (Port `5173`)

Once the terminals show started, open your web browser and go to:
🌐 **`http://localhost:5173`**

---

## 4. Test Login Credentials

| Role | Username | Password | Access |
|---|---|---|---|
| **Customer** | `deepika` | `user123` | Browsing, Cart, Orders, AI Advisor, ML Recommendations |
| **Administrator** | `admin` | `admin123` | Analytics, Inventory Management, Real-time Platform Monitoring |

---

## 5. Notes & Troubleshooting

- **Groq API Key**: Already pre-configured inside `.env` and `ai-service/.env`.
- **Database Password**: Set to `deepika08`. If PostgreSQL was installed with a different password, simply update `DB_PASSWORD` in `.env` and `ai-service/.env`.
- **Individual Launchers**: You can also launch any individual service anytime using:
  - `run_backend.bat`
  - `run_frontend.bat`
  - `run_ml_service.bat`
  - `run_ai_service.bat`
