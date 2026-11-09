import json
import logging
import os
from typing import Dict, List, Set
import pandas as pd  # type: ignore # pyrefly: ignore[missing-import]
import psycopg2  # type: ignore # pyrefly: ignore[missing-import]
from recommendation_engine import RecommendationEngine, DB_URL

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("evaluate_ml")

def run_evaluation(k_values: List[int] = [1, 3, 5]) -> Dict:
    engine = RecommendationEngine(db_url=DB_URL)
    conn = psycopg2.connect(DB_URL)

    # 1. Fetch ground-truth interactions per user
    query = """
    SELECT user_id, product_id, interaction_type, timestamp 
    FROM interactions 
    WHERE user_id IS NOT NULL 
    ORDER BY timestamp ASC
    """
    df_interactions = pd.read_sql(query, conn)
    conn.close()

    if df_interactions.empty:
        logger.warning("No user interaction data available for evaluation.")
        return {"error": "Insufficient interaction ground truth"}

    # Group interacted products per user
    user_ground_truth: Dict[int, Set[int]] = {}
    for user_id, group in df_interactions.groupby("user_id"):
        user_ground_truth[int(user_id)] = set(group["product_id"].astype(int).tolist())

    logger.info(f"Evaluating on {len(user_ground_truth)} users with recorded interaction history.")

    # 2. Non-personalized baseline: Top products ranked strictly by rating and review count
    sorted_products = sorted(engine.products, key=lambda p: (p.get("rating", 0.0), p.get("review_count", 0)), reverse=True)
    baseline_top_ids = [p["id"] for p in sorted_products]

    report = {
        "dataset_statistics": {
            "total_products": len(engine.products),
            "total_interactions": len(df_interactions),
            "test_users": len(user_ground_truth)
        },
        "metrics_by_k": {},
        "per_user_results": []
    }

    for k in k_values:
        personalized_precisions = []
        personalized_recalls = []
        personalized_hits = []

        baseline_precisions = []
        baseline_recalls = []
        baseline_hits = []

        for user_id, true_items in user_ground_truth.items():
            # Get personalized recommendations for user
            rec_result = engine.recommend(user_id=user_id, limit=k)
            rec_ids = [item["product_id"] for item in rec_result["recommendations"]]

            # Personalized metrics
            rec_set = set(rec_ids[:k])
            hits_p = len(rec_set.intersection(true_items))

            precision_p = hits_p / k if k > 0 else 0.0
            recall_p = hits_p / len(true_items) if len(true_items) > 0 else 0.0
            hit_p = 1.0 if hits_p > 0 else 0.0

            personalized_precisions.append(precision_p)
            personalized_recalls.append(recall_p)
            personalized_hits.append(hit_p)

            # Baseline metrics
            base_set = set(baseline_top_ids[:k])
            hits_b = len(base_set.intersection(true_items))

            precision_b = hits_b / k if k > 0 else 0.0
            recall_b = hits_b / len(true_items) if len(true_items) > 0 else 0.0
            hit_b = 1.0 if hits_b > 0 else 0.0

            baseline_precisions.append(precision_b)
            baseline_recalls.append(recall_b)
            baseline_hits.append(hit_b)

            if k == 3:
                report["per_user_results"].append({
                    "user_id": user_id,
                    "ground_truth_count": len(true_items),
                    "personalized_recs_at_3": rec_ids[:3],
                    "personalized_hits": hits_p,
                    "baseline_hits": hits_b
                })

        mean_p_prec = round(float(sum(personalized_precisions) / len(personalized_precisions)), 4)
        mean_p_rec = round(float(sum(personalized_recalls) / len(personalized_recalls)), 4)
        mean_p_hit = round(float(sum(personalized_hits) / len(personalized_hits)), 4)

        mean_b_prec = round(float(sum(baseline_precisions) / len(baseline_precisions)), 4)
        mean_b_rec = round(float(sum(baseline_recalls) / len(baseline_recalls)), 4)
        mean_b_hit = round(float(sum(baseline_hits) / len(baseline_hits)), 4)

        report["metrics_by_k"][f"k={k}"] = {
            "personalized_model": {
                f"Precision@{k}": mean_p_prec,
                f"Recall@{k}": mean_p_rec,
                f"Hit_Rate@{k}": mean_p_hit
            },
            "non_personalized_baseline": {
                f"Precision@{k}": mean_b_prec,
                f"Recall@{k}": mean_b_rec,
                f"Hit_Rate@{k}": mean_b_hit
            },
            "relative_lift": {
                "precision_lift": f"{round(((mean_p_prec - mean_b_prec) / (mean_b_prec if mean_b_prec > 0 else 1.0)) * 100, 1)}%",
                "hit_rate_lift": f"{round(((mean_p_hit - mean_b_hit) / (mean_b_hit if mean_b_hit > 0 else 1.0)) * 100, 1)}%"
            }
        }

    # Save to report JSON file
    output_path = os.path.join(os.path.dirname(__file__), "evaluation_report.json")
    with open(output_path, "w") as f:
        json.dump(report, f, indent=2)

    logger.info(f"Evaluation report successfully saved to {output_path}")
    print("\n================== REPRODUCIBLE ML EVALUATION RESULTS ==================")
    print(json.dumps(report["metrics_by_k"], indent=2))
    print("========================================================================\n")
    return report

if __name__ == "__main__":
    run_evaluation()
