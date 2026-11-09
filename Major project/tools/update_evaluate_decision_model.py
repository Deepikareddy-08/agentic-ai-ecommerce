import os
import re

target_path = r"c:\Users\Deepika\Desktop\Major project (2)\Major project\ml-service\evaluate_decision_model.py"

with open(target_path, "r", encoding="utf-8") as f:
    content = f.read()

new_queries_block = """BENCHMARK_QUERIES = [
    {
        "query": "Suggest a laptop under ₹60,000 for programming",
        "category": "Laptops",
        "budget_max": 60000.0,
        "purpose": "programming",
        "expected_relevance": {
            103: 3, # ASUS Vivobook 15 (₹49,990, 16GB RAM, within budget)
            105: 3, # HP Pavilion 14 (₹56,990, 16GB RAM, within budget)
            101: 2, # Lenovo ThinkPad E14 (₹62,990, programming beast, within 5% budget)
            106: 0, # Acer Nitro Gaming (₹72,990, over budget)
            104: 0, # Dell Inspiron (₹73,990, over budget)
            102: 0, # Apple MacBook Air M2 (₹94,990, over budget)
            401: 0, 402: 0, 403: 0, 404: 0, 405: 0 # Accessories
        }
    },
    {
        "query": "Best laptop for software development and coding under ₹75,000",
        "category": "Laptops",
        "budget_max": 75000.0,
        "purpose": "programming",
        "expected_relevance": {
            101: 3, # Lenovo ThinkPad E14 (₹62,990, Ryzen 7, 16GB, legendary keyboard, within 75k)
            104: 3, # Dell Inspiron 14 (₹73,990, i7, 16GB, within 75k)
            112: 3, # Acer Swift Go 14 AI OLED (₹69,990, Core Ultra 5, 16GB, within 75k)
            105: 2, # HP Pavilion 14 (₹56,990, within 75k)
            103: 2, # ASUS Vivobook 15 (₹49,990, within 75k)
            106: 1, # Acer Nitro Gaming (₹72,990, heavier gaming focus)
            102: 0, # MacBook Air M2 (₹94,990, over budget)
            401: 0, 402: 0, 403: 0, 404: 0, 405: 0 # Accessories
        }
    },
    {
        "query": "High-end active noise cancelling headphones under ₹30,000 for travel and music",
        "category": "Audio & Headphones",
        "budget_max": 30000.0,
        "purpose": "travel & music",
        "expected_relevance": {
            301: 3, # Sony WH-1000XM5 (₹26,990, industry best ANC)
            302: 3, # Bose QC 45 (₹21,990, legendary travel comfort)
            307: 3, # Apple AirPods Pro 2nd Gen (₹24,900, pro-level ANC)
            310: 3, # Sennheiser Momentum 4 Wireless (₹27,990)
            304: 2, # Anker Soundcore Q30 (₹5,490, hybrid ANC)
            303: 2, # OnePlus Buds Pro 2 (₹8,990, compact ANC)
            101: 0, 102: 0, 201: 0 # Different categories
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
            205: 3, # OnePlus 12R (₹39,999, flagship 5500mAh battery + Sony OIS camera)
            216: 2, # iQOO Z9 5G (₹19,999, Sony OIS camera + 5000mAh battery)
            203: 2, # OnePlus Nord 4 (₹29,990, great battery)
            204: 2, # Redmi Note 13 Pro+ (₹27,990, 200MP camera)
            227: 2, # Nothing Phone (2) (₹37,999)
            101: 0, 301: 0 # Different categories
        }
    },
    {
        "query": "Waterproof laptop sleeve case or cover under ₹2,000",
        "category": "Accessories",
        "budget_max": 2000.0,
        "purpose": "protection",
        "expected_relevance": {
            401: 3, # Laptop Sleeve Case (₹1,299, exact match)
            404: 2, # Laptop Stand (₹999, accessory)
            405: 2, # Multiport Hub (₹1,899, accessory)
            413: 2, # Portronics USB-C Hub (₹1,199, accessory)
            101: 0, 102: 0, 103: 0 # Laptops are not sleeve cases!
        }
    }
]"""

pattern = r"BENCHMARK_QUERIES = \[.*?\]\s*\n\s*\ndef dcg_at_k"
replacement = new_queries_block + "\n\n\ndef dcg_at_k"

new_content, count = re.subn(pattern, replacement, content, flags=re.DOTALL)
if count > 0:
    print(f"Successfully updated BENCHMARK_QUERIES in evaluate_decision_model.py (matches: {count}).")
    with open(target_path, "w", encoding="utf-8") as f:
        f.write(new_content)
else:
    print("ERROR: Regex pattern did not match.")
