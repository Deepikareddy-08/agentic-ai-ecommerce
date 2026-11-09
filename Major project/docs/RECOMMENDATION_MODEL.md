# Machine Learning Recommendation Engine

## 1. Overview
The recommendation engine is an ML microservice built with **Python**, **scikit-learn**, and **FastAPI** (`ml-service/`). It provides personalized product rankings based on user preferences, interaction history, and product attribute similarity.

---

## 2. Feature Representation & Vectorization

Each product in the PostgreSQL database is represented as a structured feature document combining:
- Category & Brand tokens
- Technical specifications (RAM, Storage, Battery, Display, Processor)
- Cleaned product description
- Customer review sentiment keywords

### TF-IDF Vector Space
We fit a `TfidfVectorizer` (sublinear TF scaling, English stopwords removed, ngram range (1, 2)) on the entire product corpus to produce a sparse document-term matrix.

---

## 3. Personalization & Scoring Pipeline

The total recommendation score $S(u, p)$ for user $u$ and product candidate $p$ is calculated as:

$$S(u, p) = w_{text} \cdot \text{Sim}(V_{query}, V_{p}) + w_{profile} \cdot \text{Affinity}(u, p) + w_{rating} \cdot \left(\frac{\text{Rating}_p}{5.0}\right)$$

Where:
1. **Content Similarity ($\text{Sim}$):** Cosine similarity between the user's current search/purpose query vector and product vector.
2. **Profile Affinity ($\text{Affinity}$):** Computed from the user's past interaction history in PostgreSQL with decay weights:
   - `PURCHASE`: Weight 1.0
   - `CART_ADD`: Weight 0.7
   - `WISHLIST`: Weight 0.5
   - `VIEW`: Weight 0.2
3. **Rating Multiplier:** Normalized customer rating score.

### Hard Constraints (Mandatory Filters)
Candidates that violate strict conditions are pruned before scoring:
- $Price_p > Budget_{max}$
- $Category_p \neq Category_{filter}$
- Missing mandatory features (e.g., requested "16GB RAM" but candidate has 8GB)
- Out of stock products (optional flag)

---

## 4. Reproducible Evaluation Results

Evaluation was executed on real interaction logs from PostgreSQL using `ml-service/evaluate.py`.

### Experimental Setup
- **Dataset:** 14 products, 3 test users, 12 interaction events.
- **Metrics Evaluated:** Precision@K, Recall@K, Hit Rate@K (for $K=1, 3, 5$).
- **Baseline Comparison:** Popularity / Non-Personalized rating baseline.

### Experimental Metrics Table

| Metric | Non-Personalized Baseline | Personalized ML Model | Relative Lift |
|---|---|---|---|
| **Precision@1** | 0.5000 | **1.0000** | **+100.0%** |
| **Precision@3** | 0.3333 | **0.6667** | **+100.0%** |
| **Precision@5** | 0.2000 | **0.4000** | **+100.0%** |
| **Recall@1** | 0.2500 | **0.4167** | **+66.7%** |
| **Recall@3** | 0.5000 | **0.9167** | **+83.3%** |
| **Recall@5** | 0.5000 | **1.0000** | **+100.0%** |
| **Hit Rate@1** | 0.5000 | **1.0000** | **+100.0%** |
| **Hit Rate@3** | 0.5000 | **1.0000** | **+100.0%** |

*Verification file located at `ml-service/evaluation_report.json`.*

### Reproducing the Evaluation
```bash
cd ml-service
python evaluate.py
```
