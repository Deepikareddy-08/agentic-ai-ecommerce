import json
import os
import re

APP_JSX_PATH = os.path.join(
    os.path.dirname(__file__), "..", "Major project", "frontend", "src", "App.jsx"
)
SEED_JSON_PATH = os.path.join(
    os.path.dirname(__file__), "..", "data", "seed_products.json"
)

with open(SEED_JSON_PATH, "r", encoding="utf-8") as f:
    products = json.load(f)

# Convert products to JS objects matching ProductCard requirements
js_products = []
for p in products:
    js_products.append({
        "id": p["id"],
        "name": p["name"],
        "brand": p["brand"],
        "category": p["category"],
        "price": p["price"],
        "rating": p["rating"],
        "stockQuantity": p.get("stock", 20),
        "stockStatus": "IN_STOCK" if p.get("stock", 20) > 0 else "OUT_OF_STOCK",
        "imageUrl": p.get("image_url", ""),
        "description": p.get("description", ""),
        "specifications": p.get("specifications", "{}")
    })

js_array_str = "const FALLBACK_PRODUCTS = " + json.dumps(js_products, indent=2) + ";\n"

with open(APP_JSX_PATH, "r", encoding="utf-8") as f:
    content = f.read()

# Replace FALLBACK_PRODUCTS = [ ... ];
pattern = re.compile(r"const FALLBACK_PRODUCTS = \[.*?\];", re.DOTALL)
if pattern.search(content):
    new_content = pattern.sub(lambda m: js_array_str.strip(), content)
    with open(APP_JSX_PATH, "w", encoding="utf-8") as f:
        f.write(new_content)
    print(f"Successfully synced {len(js_products)} electronic gadgets into App.jsx FALLBACK_PRODUCTS!")
else:
    print("Could not find FALLBACK_PRODUCTS pattern in App.jsx.")
