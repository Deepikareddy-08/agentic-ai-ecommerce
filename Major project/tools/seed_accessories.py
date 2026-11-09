import psycopg2
import json
import os

DB_URL = os.getenv("DATABASE_URL", "postgresql://postgres:deepika08@localhost:5432/ecommerce_db")

accessories = [
    {
        "id": 401,
        "name": "Waterproof Laptop Sleeve Case 15.6-inch",
        "brand": "Lenovo",
        "category": "Accessories",
        "price": 1299.0,
        "stock": 50,
        "rating": 4.4,
        "review_count": 18,
        "image_url": "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600",
        "description": "Protective water-resistant neoprene sleeve case bag with shock-absorbing foam padding and front accessory zipper pocket for 14-inch and 15.6-inch laptops.",
        "specifications": json.dumps({"type": "Sleeve Case", "material": "Neoprene / Polyester", "compatibility": "14-15.6 inch Laptops", "waterproof": "Yes"})
    },
    {
        "id": 402,
        "name": "65W GaN Fast Laptop Charger Adapter",
        "brand": "Anker",
        "category": "Accessories",
        "price": 2199.0,
        "stock": 45,
        "rating": 4.6,
        "review_count": 22,
        "image_url": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600",
        "description": "Ultra-compact 65W GaN fast charger power adapter with foldable prongs and detachable USB-C cable for laptops, tablets, and smartphones.",
        "specifications": json.dumps({"power": "65W", "technology": "GaN II", "ports": "1x USB-C", "cable_length": "1.8m"})
    },
    {
        "id": 403,
        "name": "Wireless Ergonomic Keyboard and Mouse Combo for Laptop",
        "brand": "Logitech",
        "category": "Accessories",
        "price": 2499.0,
        "stock": 30,
        "rating": 4.5,
        "review_count": 14,
        "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600",
        "description": "Full-size wireless quiet keyboard and precision optical mouse bundle compatible with Windows and Mac laptops via 2.4GHz USB receiver.",
        "specifications": json.dumps({"connectivity": "2.4GHz Wireless USB", "battery_life": "Up to 24 months", "layout": "Full-size 104 keys"})
    },
    {
        "id": 404,
        "name": "Adjustable Aluminum Laptop Stand with Cooling Vents",
        "brand": "Portronics",
        "category": "Accessories",
        "price": 999.0,
        "stock": 60,
        "rating": 4.3,
        "review_count": 11,
        "image_url": "https://images.unsplash.com/photo-1616353071588-708dcff912e2?w=600",
        "description": "Ergonomic 6-level height adjustable riser laptop stand constructed with sandblasted anodized aluminum for improved posture and airflow cooling.",
        "specifications": json.dumps({"material": "Anodized Aluminum", "levels": "6 angles (15 to 45 deg)", "weight_capacity": "Up to 5 kg"})
    },
    {
        "id": 405,
        "name": "USB-C 7-in-1 Multiport Hub Adapter for Laptops",
        "brand": "TP-Link",
        "category": "Accessories",
        "price": 1899.0,
        "stock": 40,
        "rating": 4.5,
        "review_count": 16,
        "image_url": "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600",
        "description": "Aluminum 7-in-1 USB Type-C hub adapter featuring 4K HDMI, 3x USB 3.0 ports, SD/microSD card slots, and 100W Power Delivery pass-through.",
        "specifications": json.dumps({"ports": "1x HDMI 4K@30Hz, 3x USB 3.0, SD, microSD, 100W PD", "material": "Aluminum Alloy"})
    }
]

def seed():
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    for acc in accessories:
        cur.execute("""
            INSERT INTO products (id, name, brand, category, price, stock, rating, review_count, image_url, description, specifications)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                brand = EXCLUDED.brand,
                category = EXCLUDED.category,
                price = EXCLUDED.price,
                stock = EXCLUDED.stock,
                rating = EXCLUDED.rating,
                review_count = EXCLUDED.review_count,
                image_url = EXCLUDED.image_url,
                description = EXCLUDED.description,
                specifications = EXCLUDED.specifications
        """, (
            acc["id"], acc["name"], acc["brand"], acc["category"], acc["price"],
            acc["stock"], acc["rating"], acc["review_count"], acc["image_url"],
            acc["description"], acc["specifications"]
        ))
    conn.commit()
    cur.execute("SELECT COUNT(*) FROM products")
    count = cur.fetchone()[0]
    print(f"Successfully seeded accessory products. Total products in DB: {count}")
    cur.close()
    conn.close()

    # Also update seed_products.json
    seed_json_path = os.path.join(os.path.dirname(__file__), "..", "data", "seed_products.json")
    if os.path.exists(seed_json_path):
        with open(seed_json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        existing_ids = {p["id"] for p in data}
        for acc in accessories:
            if acc["id"] not in existing_ids:
                data.append(acc)
        with open(seed_json_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print(f"Updated {seed_json_path} with {len(accessories)} accessories.")

if __name__ == "__main__":
    seed()
