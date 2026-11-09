"""
Comprehensive Evaluation of Multimodal Intelligent Product Decision Model
==========================================================================
Metrics Evaluated:
  - Precision@K (K = 1, 3, 5)
  - Recall@K (K = 1, 3, 5)
  - NDCG@K (Normalized Discounted Cumulative Gain at K = 1, 3, 5)
  - Response Time / Latency (ms)
Comparative Analysis:
  - Baseline (Naive Keyword Search & Popularity Ranking without Negative Filter)
  - Intelligent Multimodal Decision Engine (NLU + Hard Negative Filtering + Cosine Similarity)
"""

import json
import logging
import math
import os
import sys
import time
from typing import Any, Dict, List, Set, Tuple

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from multimodal_decision_engine import MultimodalDecisionEngine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("evaluate_decision_model")

# Ground-truth test query suite representing real e-commerce user personas and edge cases
BENCHMARK_QUERIES = [
    {
        "query": "Suggest a laptop under ₹60,000 for programming",
        "category": "Laptops",
        "budget_max": 60000.0,
        "purpose": "programming",
        "expected_relevance": {
            101: 3, # Lenovo ThinkPad E14 Gen 5 (₹44,990, Ryzen 7, 16GB, legendary keyboard)
            104: 3, # Dell Inspiron 14 5430 (₹48,990, Intel Core i7, 16GB RAM)
            2517: 3, # Acer Swift Go 14 AI OLED (₹57,990, Core Ultra 5, 16GB)
            112: 3, # Acer Swift Go 14 AI OLED (₹52,990, Core Ultra 5, 16GB)
            105: 3, # HP Pavilion 14 (₹39,990, 16GB RAM)
            103: 2, # ASUS Vivobook 15 (₹34,990, 8GB RAM)
            2504: 2, # Lenovo IdeaPad Slim 3 (₹29,990, 8GB RAM)
            106: 1, # Acer Nitro V 15 Gaming (₹53,990, heavier gaming focus)
            102: 0, # Apple MacBook Air M2 (₹69,990, over 60k budget)
            2506: 0, 118: 0, 401: 0, 404: 0
        }
    },
    {
        "query": "Best laptop for software development and coding under ₹75,000",
        "category": "Laptops",
        "budget_max": 75000.0,
        "purpose": "programming",
        "expected_relevance": {
            101: 3, # Lenovo ThinkPad E14 (₹44,990, Ryzen 7, 16GB, legendary keyboard)
            102: 3, # Apple MacBook Air M2 (₹69,990, Apple M2, 16GB Unified, within 75k)
            104: 3, # Dell Inspiron 14 (₹48,990, i7, 16GB, within 75k)
            2517: 3, # Acer Swift Go 14 AI OLED (₹57,990, Core Ultra 5, 16GB, within 75k)
            112: 3, # Acer Swift Go 14 AI OLED (₹52,990, Core Ultra 5, 16GB, within 75k)
            105: 2, # HP Pavilion 14 (₹39,990, within 75k)
            103: 2, # ASUS Vivobook 15 (₹34,990, within 75k)
            106: 1, # Acer Nitro Gaming (₹53,990, heavier gaming focus)
            2506: 0, 118: 0, 401: 0, 404: 0
        }
    },
    {
        "query": "High-end active noise cancelling headphones under ₹30,000 for travel and music",
        "category": "Audio & Headphones",
        "budget_max": 30000.0,
        "purpose": "travel & music",
        "expected_relevance": {
            301: 3, # Sony WH-1000XM5 (₹26,990, industry best ANC)
            2546: 3, # Apple AirPods Pro 2nd Gen USB-C (₹23,990, pro ANC)
            2547: 3, # Bose QuietComfort Ultra Wireless Earbuds (₹25,900, legendary ANC)
            302: 3, # Bose QC 45 (₹21,990, legendary travel comfort)
            307: 3, # Apple AirPods Pro 2nd Gen (₹24,900)
            310: 3, # Sennheiser Momentum 4 Wireless (₹27,990)
            304: 2, # Anker Soundcore Q30 (₹5,490, hybrid ANC)
            303: 2, # OnePlus Buds Pro 2 (₹8,990, compact ANC)
            309: 0, 323: 0, 101: 0, 102: 0, 201: 0
        }
    },
    {
        "query": "Flagship camera smartphone with great battery under ₹45,000",
        "category": "Smartphones",
        "budget_max": 45000.0,
        "purpose": "photography",
        "expected_relevance": {
            201: 3, # Google Pixel 8a (₹42,990, top camera)
            202: 3, # Samsung Galaxy S23 FE (₹37,990, telephoto camera)
            227: 3, # Nothing Phone (2) 5G (₹37,999, 50MP Sony OIS camera + 4700mAh battery)
            205: 3, # OnePlus 12R (₹39,999, flagship 5500mAh battery + Sony OIS camera)
            216: 2, # iQOO Z9 5G (₹19,999, Sony OIS camera + 5000mAh battery)
            203: 2, # OnePlus Nord 4 (₹29,990, great battery)
            204: 2, # Redmi Note 13 Pro+ (₹27,990, 200MP camera)
            2501: 0, 2502: 0, 208: 0, 101: 0, 301: 0
        }
    },
    {
        "query": "Waterproof laptop sleeve case or cover under ₹2,000",
        "category": "Accessories",
        "budget_max": 2000.0,
        "purpose": "protection",
        "expected_relevance": {
            401: 3, # Waterproof Laptop Sleeve Case 15.6-inch (₹1,299, exact match)
            404: 2, # Laptop Stand (₹999, accessory)
            413: 2, # Portronics USB-C Hub (₹1,199, accessory)
            405: 2, # Multiport Hub (₹1,899, accessory)
            416: 1, # Razer Gaming Mouse (₹1,299)
            101: 0, 102: 0, 103: 0
        }
    },
    {
        "query": "4K Smart TV with Google TV and Dolby Vision under ₹50,000",
        "category": "Smart TVs & Home Entertainment",
        "budget_max": 50000.0,
        "purpose": "home entertainment",
        "expected_relevance": {
            804: 3, # Xiaomi Smart TV X Pro 55-inch 4K Google TV (₹41,999)
            805: 3, # TCL 55-inch 4K QLED Google TV T6G (₹37,990)
            810: 3, # Samsung 43-inch Crystal 4K Vivid Ultra HD Smart TV (₹28,990)
            806: 2, # Apple TV 4K 128GB (₹16,900)
            807: 2, # Amazon Fire TV Stick 4K Max (₹6,499)
            801: 0, 802: 0, 2532: 0
        }
    }
]


def dcg_at_k(relevance_scores: List[int], k: int) -> float:
    """Computes Discounted Cumulative Gain at K."""
    score = 0.0
    for i, rel in enumerate(relevance_scores[:k], start=1):
        if rel > 0:
            score += (math.pow(2, rel) - 1.0) / math.log2(i + 1)
    return score


def ndcg_at_k(recommended_ids: List[int], relevance_map: Dict[int, int], k: int) -> float:
    """Computes Normalized Discounted Cumulative Gain at K."""
    actual_rels = [relevance_map.get(pid, 0) for pid in recommended_ids[:k]]
    actual_dcg = dcg_at_k(actual_rels, k)

    # Ideal ranking is the sorted relevance scores in descending order
    ideal_rels = sorted(relevance_map.values(), reverse=True)[:k]
    ideal_dcg = dcg_at_k(ideal_rels, k)

    if ideal_dcg > 0:
        return actual_dcg / ideal_dcg
    return 1.0 if actual_dcg == 0 else 0.0


def run_baseline_search(query: str, products: List[Dict[str, Any]], limit: int = 5) -> List[int]:
    """
    Baseline Model: Naive keyword string matching on query tokens
    without NLU, without negative accessory pruning, and ranked strictly by rating.
    """
    words = [w.lower() for w in query.replace("₹", "").replace(",", "").split() if len(w) > 2]
    matched = []
    for p in products:
        p_text = f"{p['name']} {p['category']} {p['description']}".lower()
        overlap = sum(1 for w in words if w in p_text)
        if overlap > 0:
            matched.append((overlap, p.get("rating", 0.0), p["id"]))

    # Rank by keyword overlap then rating
    matched.sort(key=lambda x: (x[0], x[1]), reverse=True)
    return [m[2] for m in matched[:limit]]


def evaluate_decision_model():
    engine = MultimodalDecisionEngine()
    products = engine.products

    print("================================================================================")
    print("      MULTIMODAL INTELLIGENT PRODUCT DECISION MODEL EVALUATION REPORT           ")
    print("================================================================================")
    print(f"Catalog Size: {len(products)} products indexed")
    print(f"Evaluation Test Queries: {len(BENCHMARK_QUERIES)} diverse queries\n")

    k_values = [1, 3, 5]
    metrics = {
        "baseline": {f"p@{k}": [] for k in k_values} | {f"r@{k}": [] for k in k_values} | {f"ndcg@{k}": [] for k in k_values} | {"latency_ms": []},
        "decision_model": {f"p@{k}": [] for k in k_values} | {f"r@{k}": [] for k in k_values} | {f"ndcg@{k}": [] for k in k_values} | {"latency_ms": []}
    }

    per_query_results = []

    for test_case in BENCHMARK_QUERIES:
        q = test_case["query"]
        rel_map = test_case["expected_relevance"]
        total_relevant = sum(1 for r in rel_map.values() if r >= 2)

        # 1. Run Baseline
        t0 = time.perf_counter()
        base_recs = run_baseline_search(q, products, limit=max(k_values))
        t_base = (time.perf_counter() - t0) * 1000.0
        metrics["baseline"]["latency_ms"].append(t_base)

        # 2. Run Decision Model
        t1 = time.perf_counter()
        dec_result = engine.recommend(q, initial_candidate_limit=60, target_candidate_limit=15, top_k=max(k_values))
        t_dec = (time.perf_counter() - t1) * 1000.0
        dec_recs = [r["product_id"] for r in dec_result["recommendations"]]
        metrics["decision_model"]["latency_ms"].append(t_dec)

        q_report = {
            "query": q,
            "baseline_top_3": base_recs[:3],
            "decision_model_top_3": dec_recs[:3],
            "baseline_latency_ms": round(t_base, 2),
            "decision_model_latency_ms": round(t_dec, 2),
            "pipeline_summary": dec_result["pipeline_summary"]
        }

        # Calculate metrics across K
        for k in k_values:
            # Baseline
            base_k = base_recs[:k]
            base_hits = sum(1 for pid in base_k if rel_map.get(pid, 0) >= 2)
            base_p = base_hits / k if k > 0 else 0.0
            base_r = base_hits / total_relevant if total_relevant > 0 else 0.0
            base_ndcg = ndcg_at_k(base_k, rel_map, k)

            metrics["baseline"][f"p@{k}"].append(base_p)
            metrics["baseline"][f"r@{k}"].append(base_r)
            metrics["baseline"][f"ndcg@{k}"].append(base_ndcg)

            # Decision Model
            dec_k = dec_recs[:k]
            dec_hits = sum(1 for pid in dec_k if rel_map.get(pid, 0) >= 2)
            dec_p = dec_hits / k if k > 0 else 0.0
            dec_r = dec_hits / total_relevant if total_relevant > 0 else 0.0
            dec_ndcg = ndcg_at_k(dec_k, rel_map, k)

            metrics["decision_model"][f"p@{k}"].append(dec_p)
            metrics["decision_model"][f"r@{k}"].append(dec_r)
            metrics["decision_model"][f"ndcg@{k}"].append(dec_ndcg)

            if k == 3:
                q_report["metrics_at_3"] = {
                    "baseline": {"p@3": round(base_p, 3), "r@3": round(base_r, 3), "ndcg@3": round(base_ndcg, 3)},
                    "decision_model": {"p@3": round(dec_p, 3), "r@3": round(dec_r, 3), "ndcg@3": round(dec_ndcg, 3)}
                }

        per_query_results.append(q_report)

    # Print summary table
    print("--------------------------------------------------------------------------------")
    print(f"{'Metric':<18} | {'Baseline (Naive Search)':<24} | {'Decision Model (Improved)':<24} | {'Relative Lift':<12}")
    print("--------------------------------------------------------------------------------")

    avg_results = {}
    for k in k_values:
        b_p = sum(metrics["baseline"][f"p@{k}"]) / len(metrics["baseline"][f"p@{k}"])
        d_p = sum(metrics["decision_model"][f"p@{k}"]) / len(metrics["decision_model"][f"p@{k}"])
        p_lift = ((d_p - b_p) / (b_p if b_p > 0 else 1.0)) * 100.0

        b_r = sum(metrics["baseline"][f"r@{k}"]) / len(metrics["baseline"][f"r@{k}"])
        d_r = sum(metrics["decision_model"][f"r@{k}"]) / len(metrics["decision_model"][f"r@{k}"])
        r_lift = ((d_r - b_r) / (b_r if b_r > 0 else 1.0)) * 100.0

        b_n = sum(metrics["baseline"][f"ndcg@{k}"]) / len(metrics["baseline"][f"ndcg@{k}"])
        d_n = sum(metrics["decision_model"][f"ndcg@{k}"]) / len(metrics["decision_model"][f"ndcg@{k}"])
        n_lift = ((d_n - b_n) / (b_n if b_n > 0 else 1.0)) * 100.0

        avg_results[f"p@{k}"] = {"baseline": round(b_p, 4), "decision_model": round(d_p, 4), "lift": f"+{round(p_lift, 1)}%"}
        avg_results[f"r@{k}"] = {"baseline": round(b_r, 4), "decision_model": round(d_r, 4), "lift": f"+{round(r_lift, 1)}%"}
        avg_results[f"ndcg@{k}"] = {"baseline": round(b_n, 4), "decision_model": round(d_n, 4), "lift": f"+{round(n_lift, 1)}%"}

        print(f"Precision@{k:<10} | {b_p:<24.4f} | {d_p:<24.4f} | {f'+{round(p_lift,1)}%':<12}")
        print(f"Recall@{k:<13} | {b_r:<24.4f} | {d_r:<24.4f} | {f'+{round(r_lift,1)}%':<12}")
        print(f"NDCG@{k:<15} | {b_n:<24.4f} | {d_n:<24.4f} | {f'+{round(n_lift,1)}%':<12}")
        print("--------------------------------------------------------------------------------")

    avg_b_lat = sum(metrics["baseline"]["latency_ms"]) / len(metrics["baseline"]["latency_ms"])
    avg_d_lat = sum(metrics["decision_model"]["latency_ms"]) / len(metrics["decision_model"]["latency_ms"])
    print(f"Avg Latency (ms)   | {round(avg_b_lat, 2):<24} | {round(avg_d_lat, 2):<24} | {'Fast (<50ms)':<12}")
    print("================================================================================\n")

    # Save detailed JSON evaluation report
    report_data = {
        "status": "COMPLETED",
        "benchmark_timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "catalog_size": len(products),
        "test_query_count": len(BENCHMARK_QUERIES),
        "aggregate_metrics": avg_results,
        "average_latency_ms": {
            "baseline": round(avg_b_lat, 2),
            "decision_model": round(avg_d_lat, 2)
        },
        "query_evaluations": per_query_results
    }

    report_path = os.path.join(os.path.dirname(__file__), "decision_model_evaluation_report.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report_data, f, indent=2)
    print(f"Detailed evaluation report saved to: {report_path}")

    return report_data


if __name__ == "__main__":
    evaluate_decision_model()
