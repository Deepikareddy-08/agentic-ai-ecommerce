import json
import os
import psycopg2

DB_URL = os.getenv("DATABASE_URL", "postgresql://postgres:deepika08@localhost:5432/ecommerce_db")

# Load existing 39 gadgets from seed_products.json
seed_json_path = os.path.join(os.path.dirname(__file__), "..", "data", "seed_products.json")
with open(seed_json_path, "r", encoding="utf-8") as f:
    ALL_EXISTING = json.load(f)

# 40 Brand New Gadgets across Laptops, Phones, Watches, Headphones, Tablets, Gaming, Accessories
NEW_GADGETS = [
    # --- LAPTOPS (107 - 114) ---
    {
        "id": 107,
        "name": "Apple MacBook Pro 14 M3 Pro",
        "brand": "Apple",
        "category": "Laptops",
        "price": 199900.0,
        "stock": 12,
        "rating": 4.9,
        "review_count": 52,
        "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop",
        "description": "The ultimate pro workstation powered by Apple M3 Pro silicon. Liquid Retina XDR display with ProMotion 120Hz, 18-hour battery, and Space Black finish.",
        "specifications": json.dumps({"processor": "Apple M3 Pro 11-core CPU 14-core GPU", "ram": "18GB Unified", "storage": "512GB NVMe SSD", "display": "14.2-inch Liquid Retina XDR 120Hz", "battery": "18 hours"})
    },
    {
        "id": 108,
        "name": "HP Spectre x360 14 2-in-1 OLED",
        "brand": "HP",
        "category": "Laptops",
        "price": 154990.0,
        "stock": 14,
        "rating": 4.8,
        "review_count": 31,
        "image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
        "description": "Luxury 2-in-1 convertible touchscreen laptop with Intel Core Ultra 7 AI processor, stunning 2.8K OLED display, and stylus pen included.",
        "specifications": json.dumps({"processor": "Intel Core Ultra 7 155H", "ram": "32GB LPDDR5X", "storage": "1TB PCIe Gen4 SSD", "display": "14-inch 2.8K OLED Touch 120Hz", "battery": "13 hours"})
    },
    {
        "id": 109,
        "name": "ASUS ROG Zephyrus G14 Gaming Laptop",
        "brand": "ASUS",
        "category": "Laptops",
        "price": 149990.0,
        "stock": 16,
        "rating": 4.7,
        "review_count": 44,
        "image_url": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop",
        "description": "Ultraportable high-performance gaming laptop with CNC aluminum chassis, ROG Nebula 3K OLED 120Hz display, and NVIDIA RTX 4060 graphics.",
        "specifications": json.dumps({"processor": "AMD Ryzen 9 8945HS", "ram": "16GB LPDDR5X", "storage": "1TB M.2 NVMe SSD", "graphics": "NVIDIA GeForce RTX 4060 8GB", "display": "14-inch 3K OLED 120Hz", "battery": "10 hours"})
    },
    {
        "id": 110,
        "name": "Dell XPS 13 9340 Ultrabook",
        "brand": "Dell",
        "category": "Laptops",
        "price": 139990.0,
        "stock": 18,
        "rating": 4.6,
        "review_count": 27,
        "image_url": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop",
        "description": "Iconic minimalist ultrabook crafted from machined aluminum and Gorilla Glass 3. Seamless glass touchpad, zero-lattice keyboard, and Intel Core Ultra 7.",
        "specifications": json.dumps({"processor": "Intel Core Ultra 7 155H", "ram": "16GB LPDDR5X", "storage": "512GB PCIe SSD", "display": "13.4-inch FHD+ InfinityEdge 500 nits", "battery": "14 hours"})
    },
    {
        "id": 111,
        "name": "Lenovo Legion Pro 5i Gaming",
        "brand": "Lenovo",
        "category": "Laptops",
        "price": 119990.0,
        "stock": 20,
        "rating": 4.8,
        "review_count": 39,
        "image_url": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop",
        "description": "Heavy-duty gaming powerhouse with AI-tuned Legion Coldfront 5.0 thermals, NVIDIA RTX 4070 GPU, and blistering 240Hz WQXGA display.",
        "specifications": json.dumps({"processor": "Intel Core i7-14650HX 14th Gen", "ram": "16GB DDR5 5600MHz", "storage": "1TB NVMe SSD", "graphics": "NVIDIA GeForce RTX 4070 8GB", "display": "16-inch WQXGA 240Hz 500 nits", "battery": "6 hours"})
    },
    {
        "id": 112,
        "name": "Acer Swift Go 14 AI OLED",
        "brand": "Acer",
        "category": "Laptops",
        "price": 69990.0,
        "stock": 25,
        "rating": 4.5,
        "review_count": 33,
        "image_url": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop",
        "description": "Affordable AI-ready ultrabook featuring vivid 2.8K 90Hz OLED display, Intel Core Ultra 5 with dedicated NPU, and light 1.32kg aluminum body.",
        "specifications": json.dumps({"processor": "Intel Core Ultra 5 125H", "ram": "16GB LPDDR5X", "storage": "512GB Gen4 SSD", "display": "14-inch 2.8K OLED 90Hz", "battery": "11 hours"})
    },
    {
        "id": 113,
        "name": "Samsung Galaxy Book4 Pro 360",
        "brand": "Samsung",
        "category": "Laptops",
        "price": 163990.0,
        "stock": 10,
        "rating": 4.8,
        "review_count": 22,
        "image_url": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop",
        "description": "Flagship 2-in-1 laptop with 16-inch 3K Dynamic AMOLED 2X touchscreen, bundled S-Pen, and seamless Galaxy ecosystem integration.",
        "specifications": json.dumps({"processor": "Intel Core Ultra 7 155H", "ram": "16GB LPDDR5X", "storage": "1TB SSD", "display": "16.0-inch 3K AMOLED 120Hz Touch", "battery": "15 hours"})
    },
    {
        "id": 114,
        "name": "ASUS TUF Gaming A15",
        "brand": "ASUS",
        "category": "Laptops",
        "price": 64990.0,
        "stock": 28,
        "rating": 4.4,
        "review_count": 48,
        "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop",
        "description": "Value-packed military-grade gaming laptop with AMD Ryzen 7, NVIDIA RTX 3050, high-refresh 144Hz display, and dual fans for long gaming sessions.",
        "specifications": json.dumps({"processor": "AMD Ryzen 7 7435HS", "ram": "16GB DDR5", "storage": "512GB PCIe SSD", "graphics": "NVIDIA GeForce RTX 3050 4GB", "display": "15.6-inch FHD 144Hz IPS", "battery": "7 hours"})
    },

    # --- SMARTPHONES (207 - 214) ---
    {
        "id": 207,
        "name": "Samsung Galaxy S24 Ultra 5G",
        "brand": "Samsung",
        "category": "Smartphones",
        "price": 129999.0,
        "stock": 20,
        "rating": 4.9,
        "review_count": 65,
        "image_url": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop",
        "description": "The pinnacle of Android smartphones with Titanium frame, built-in S Pen, 200MP Quad Telephoto camera, and Galaxy AI live translation.",
        "specifications": json.dumps({"processor": "Snapdragon 8 Gen 3 for Galaxy", "ram": "12GB", "storage": "256GB", "display": "6.8-inch Dynamic AMOLED 2X 120Hz 2600 nits", "camera": "200MP + 50MP + 12MP + 10MP", "battery": "5000 mAh 45W"})
    },
    {
        "id": 208,
        "name": "Apple iPhone 15 Pro Max",
        "brand": "Apple",
        "category": "Smartphones",
        "price": 148900.0,
        "stock": 18,
        "rating": 4.9,
        "review_count": 82,
        "image_url": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop",
        "description": "Forged in aerospace-grade titanium with the groundbreaking A17 Pro chip, customizable Action button, and 5x Telephoto optical zoom.",
        "specifications": json.dumps({"processor": "Apple A17 Pro 3nm", "ram": "8GB", "storage": "256GB NVMe", "display": "6.7-inch Super Retina XDR OLED 120Hz", "camera": "48MP Main + 12MP Ultra Wide + 12MP 5x Telephoto", "battery": "29 hours video playback"})
    },
    {
        "id": 209,
        "name": "Google Pixel 8 Pro",
        "brand": "Google",
        "category": "Smartphones",
        "price": 89999.0,
        "stock": 15,
        "rating": 4.7,
        "review_count": 40,
        "image_url": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop",
        "description": "Google's premier AI flagship powered by Tensor G3 with Super Actua display, Pro camera controls, Magic Editor, and 7 years of OS updates.",
        "specifications": json.dumps({"processor": "Google Tensor G3 Titan M2", "ram": "12GB LPDDR5X", "storage": "128GB UFS 3.1", "display": "6.7-inch LTPO OLED 120Hz 2400 nits", "camera": "50MP + 48MP Quad PD Telephoto + 48MP Ultrawide", "battery": "5050 mAh 30W"})
    },
    {
        "id": 210,
        "name": "OnePlus 12 5G Flagship",
        "brand": "OnePlus",
        "category": "Smartphones",
        "price": 64999.0,
        "stock": 25,
        "rating": 4.8,
        "review_count": 55,
        "image_url": "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop",
        "description": "Flagship speed redefined with 4th Gen Hasselblad camera, 2K 120Hz ProXDR display, Snapdragon 8 Gen 3, and 100W SUPERVOOC charging.",
        "specifications": json.dumps({"processor": "Snapdragon 8 Gen 3", "ram": "16GB LPDDR5X", "storage": "512GB UFS 4.0", "display": "6.82-inch 2K 120Hz ProXDR 4500 nits", "camera": "50MP Sony LYT-808 + 64MP Periscope + 48MP Ultrawide", "battery": "5400 mAh 100W Fast Charge"})
    },
    {
        "id": 211,
        "name": "Nothing Phone (2)",
        "brand": "Nothing",
        "category": "Smartphones",
        "price": 36999.0,
        "stock": 30,
        "rating": 4.6,
        "review_count": 38,
        "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop",
        "description": "Unique transparent design with customizable Glyph Interface LED patterns, clean Nothing OS 2.5, flagship Snapdragon 8+ Gen 1, and dual 50MP Sony sensors.",
        "specifications": json.dumps({"processor": "Snapdragon 8+ Gen 1", "ram": "12GB", "storage": "256GB", "display": "6.7-inch LTPO OLED 120Hz", "camera": "50MP Sony IMX890 + 50MP Samsung JN1", "battery": "4700 mAh 45W"})
    },
    {
        "id": 212,
        "name": "Xiaomi 14 Ultra Leica",
        "brand": "Xiaomi",
        "category": "Smartphones",
        "price": 99999.0,
        "stock": 14,
        "rating": 4.8,
        "review_count": 29,
        "image_url": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop",
        "description": "Professional mobile photography flagship equipped with 1-inch Sony LYT-900 sensor, stepless variable aperture, and quad Leica optical lenses.",
        "specifications": json.dumps({"processor": "Snapdragon 8 Gen 3", "ram": "16GB LPDDR5X", "storage": "512GB UFS 4.0", "display": "6.73-inch WQHD+ AMOLED 120Hz 3000 nits", "camera": "50MP 1-inch LYT-900 + 3x 50MP Leica Lenses", "battery": "5000 mAh 90W HyperCharge"})
    },
    {
        "id": 213,
        "name": "Vivo X100 Pro Zeiss Camera",
        "brand": "Vivo",
        "category": "Smartphones",
        "price": 89999.0,
        "stock": 16,
        "rating": 4.7,
        "review_count": 34,
        "image_url": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop",
        "description": "Imaging powerhouse featuring Zeiss APO floating telephoto camera, Dimensity 9300 chipset, V3 imaging chip, and 100W Dual-Cell FlashCharge.",
        "specifications": json.dumps({"processor": "MediaTek Dimensity 9300", "ram": "16GB", "storage": "512GB", "display": "6.78-inch LTPO AMOLED 120Hz 3000 nits", "camera": "50MP 1-inch IMX989 + 50MP Zeiss APO Telephoto", "battery": "5400 mAh 100W FlashCharge"})
    },
    {
        "id": 214,
        "name": "Motorola Edge 50 Ultra",
        "brand": "Motorola",
        "category": "Smartphones",
        "price": 54999.0,
        "stock": 22,
        "rating": 4.6,
        "review_count": 26,
        "image_url": "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=600&auto=format&fit=crop",
        "description": "Sensory craftsmanship with real natural wood back, Pantone-validated curved pOLED display, Snapdragon 8s Gen 3, and 125W TurboPower charging.",
        "specifications": json.dumps({"processor": "Snapdragon 8s Gen 3", "ram": "12GB", "storage": "512GB", "display": "6.7-inch 144Hz Super HD pOLED 2500 nits", "camera": "50MP OIS + 50MP Ultrawide + 64MP 3x Periscope", "battery": "4500 mAh 125W TurboPower"})
    },

    # --- SMARTWATCHES (506 - 512) ---
    {
        "id": 506,
        "name": "Apple Watch Ultra 2 GPS + Cellular",
        "brand": "Apple",
        "category": "Smartwatches",
        "price": 89900.0,
        "stock": 10,
        "rating": 4.9,
        "review_count": 48,
        "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop",
        "description": "Rugged 49mm titanium outdoor sports watch with 3000-nit always-on display, precision dual-frequency GPS, depth gauge, and 72-hour battery life.",
        "specifications": json.dumps({"case": "49mm Aerospace Titanium", "display": "Sapphire Crystal 3000 nits", "sensors": "ECG, SpO2, Depth Gauge, Water Temp", "battery": "36 hours normal, 72 hours low power", "water_resistance": "100m Dive Certified"})
    },
    {
        "id": 507,
        "name": "Samsung Galaxy Watch Ultra",
        "brand": "Samsung",
        "category": "Smartwatches",
        "price": 59999.0,
        "stock": 15,
        "rating": 4.8,
        "review_count": 32,
        "image_url": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop",
        "description": "Extreme durability with cushion design Grade 4 titanium case, dual-frequency GPS, 100m water resistance, and personalized Galaxy AI fitness coaching.",
        "specifications": json.dumps({"case": "47mm Grade 4 Titanium", "display": "Super AMOLED 3000 nits Sapphire", "sensors": "BioActive Sensor (ECG, BIA, HR), Dual GPS", "battery": "Up to 100 hours power saving", "water_resistance": "10ATM + IP68"})
    },
    {
        "id": 508,
        "name": "Garmin Fenix 7 Pro Solar GPS Watch",
        "brand": "Garmin",
        "category": "Smartwatches",
        "price": 81990.0,
        "stock": 12,
        "rating": 4.9,
        "review_count": 36,
        "image_url": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop",
        "description": "Multisport GPS watch with Power Glass solar charging lens, built-in LED flashlight, preloaded TopoActive maps, and up to 22 days of battery life.",
        "specifications": json.dumps({"display": "1.3-inch Sunlight-visible MIP Solar", "battery": "22 days in smartwatch mode with solar", "sensors": "Multi-band GNSS, Pulse Ox, Altimeter, Barometer", "features": "LED Flashlight, Topo Maps", "water_rating": "10 ATM"})
    },
    {
        "id": 509,
        "name": "Fitbit Charge 6 Advanced Fitness Tracker",
        "brand": "Fitbit",
        "category": "Smartwatches",
        "price": 14999.0,
        "stock": 25,
        "rating": 4.4,
        "review_count": 42,
        "image_url": "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&auto=format&fit=crop",
        "description": "Premium health tracker with Google Maps & Wallet integration, 40+ exercise modes, ECG heart rhythm app, and 7-day battery life.",
        "specifications": json.dumps({"display": "Color AMOLED Touchscreen", "battery": "7 days", "sensors": "ECG, EDA Scan, SpO2, Optical HR, Built-in GPS", "water_resistance": "50m Water Resistant"})
    },
    {
        "id": 510,
        "name": "Amazfit GTR 4 Classic Smartwatch",
        "brand": "Amazfit",
        "category": "Smartwatches",
        "price": 16999.0,
        "stock": 30,
        "rating": 4.5,
        "review_count": 39,
        "image_url": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop",
        "description": "Classic metallic round smartwatch with dual-band circularly polarized GPS antenna, 150+ sports modes, Bluetooth phone calls, and 14-day battery.",
        "specifications": json.dumps({"display": "1.43-inch HD AMOLED Anti-glare", "battery": "14 days typical use", "sensors": "BioTracker 4.0 PPG, 6 Satellite GPS", "connectivity": "Bluetooth Calling & Music Storage"})
    },
    {
        "id": 511,
        "name": "Titan Smart Pro AMOLED Watch",
        "brand": "Titan",
        "category": "Smartwatches",
        "price": 8995.0,
        "stock": 35,
        "rating": 4.3,
        "review_count": 28,
        "image_url": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop",
        "description": "Elegantly designed premium smartwatch featuring aircraft-grade aluminum body, 1.19-inch AMOLED display with Gorilla Glass 3, and built-in GPS.",
        "specifications": json.dumps({"display": "1.19-inch AMOLED Gorilla Glass 3", "battery": "14 days battery life", "sensors": "Built-in GPS, SpO2, Temperature Sensor", "water_resistance": "5 ATM Water Resistant"})
    },
    {
        "id": 512,
        "name": "Fastrack Reflex Play BT Calling Smartwatch",
        "brand": "Fastrack",
        "category": "Smartwatches",
        "price": 2495.0,
        "stock": 45,
        "rating": 4.2,
        "review_count": 56,
        "image_url": "https://images.unsplash.com/photo-1510017803434-a899398421b3?w=600&auto=format&fit=crop",
        "description": "Youthful budget smartwatch with 1.3-inch AMOLED display, Bluetooth calling with dial pad, 100+ sports modes, and IP68 water resistance.",
        "specifications": json.dumps({"display": "1.3-inch AMOLED Always On", "battery": "7 days battery backup", "features": "Bluetooth Calling, In-built Games, 100+ Sports", "protection": "IP68 Water & Dust Resistant"})
    },

    # --- AUDIO & HEADPHONES (309 - 314) ---
    {
        "id": 309,
        "name": "Apple AirPods Max Wireless Over-Ear",
        "brand": "Apple",
        "category": "Audio & Headphones",
        "price": 59900.0,
        "stock": 14,
        "rating": 4.9,
        "review_count": 47,
        "image_url": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop",
        "description": "Computational audio masterpiece with custom 40mm dynamic drivers, industry-standard Active Noise Cancellation, and Spatial Audio with dynamic head tracking.",
        "specifications": json.dumps({"driver": "40mm Apple Custom Dynamic", "anc": "Active Noise Cancellation + Transparency Mode", "battery": "20 hours with ANC enabled", "audio": "Personalized Spatial Audio with Head Tracking"})
    },
    {
        "id": 310,
        "name": "Sennheiser Momentum 4 Wireless",
        "brand": "Sennheiser",
        "category": "Audio & Headphones",
        "price": 27990.0,
        "stock": 18,
        "rating": 4.8,
        "review_count": 35,
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop",
        "description": "Audiophile-grade 42mm sound transducers, class-leading 60-hour battery life, Adaptive ANC, and crystal-clear calls with 4 beamforming microphones.",
        "specifications": json.dumps({"driver": "42mm Audiophile Transducers", "battery": "60 hours on single charge", "codecs": "aptX Adaptive, AAC, SBC", "anc": "Hybrid Adaptive Noise Cancellation"})
    },
    {
        "id": 311,
        "name": "Sony WF-1000XM5 True Wireless Earbuds",
        "brand": "Sony",
        "category": "Audio & Headphones",
        "price": 21990.0,
        "stock": 22,
        "rating": 4.8,
        "review_count": 52,
        "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop",
        "description": "Precision noise cancellation earbuds powered by Integrated Processor V2 and HD Noise Cancelling Processor QN2e. Supports High-Resolution Audio Wireless via LDAC.",
        "specifications": json.dumps({"driver": "Dynamic Driver X 8.4mm", "anc": "Dual Feedback Mics + Processor V2", "battery": "8 hours (24h with case)", "features": "Bone Conduction Sensor, Multipoint, LDAC"})
    },
    {
        "id": 312,
        "name": "JBL Live 660NC Wireless Over-Ear",
        "brand": "JBL",
        "category": "Audio & Headphones",
        "price": 7999.0,
        "stock": 35,
        "rating": 4.4,
        "review_count": 60,
        "image_url": "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&auto=format&fit=crop",
        "description": "Signature punchy JBL pure bass sound with 40mm drivers, Adaptive Noise Cancelling with Ambient Aware, and up to 50 hours of wireless playback.",
        "specifications": json.dumps({"driver": "40mm Dynamic Driver", "battery": "50 hours (40h with ANC)", "anc": "Adaptive Noise Cancelling", "connectivity": "Bluetooth 5.0 + 3.5mm Aux"})
    },
    {
        "id": 313,
        "name": "Marshall Major IV Bluetooth Headphones",
        "brand": "Marshall",
        "category": "Audio & Headphones",
        "price": 11999.0,
        "stock": 20,
        "rating": 4.6,
        "review_count": 38,
        "image_url": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop",
        "description": "Iconic vintage rock-and-roll styling delivering explosive signature Marshall sound, wireless Qi charging, and over 80+ hours of continuous wireless playtime.",
        "specifications": json.dumps({"driver": "40mm Custom Tuned Dynamic", "battery": "80+ hours wireless playtime", "charging": "Wireless Qi + Quick Charge (15m=15h)", "controls": "Multi-directional control knob"})
    },
    {
        "id": 314,
        "name": "Nothing Ear (a) Hi-Res Earbuds",
        "brand": "Nothing",
        "category": "Audio & Headphones",
        "price": 7999.0,
        "stock": 30,
        "rating": 4.5,
        "review_count": 41,
        "image_url": "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&auto=format&fit=crop",
        "description": "Playful design with transparent casing, 45dB Smart ANC with automatic leak detection, Bass Enhance algorithm, and Hi-Res Audio certification.",
        "specifications": json.dumps({"driver": "11mm Custom Dynamic PMI+TPU", "anc": "Smart Active Noise Cancellation up to 45dB", "battery": "9.5 hours (42.5h with case)", "codecs": "LDAC, AAC, SBC"})
    },

    # --- TABLETS (605 - 608) ---
    {
        "id": 605,
        "name": "Apple iPad Pro 11-inch M4 OLED",
        "brand": "Apple",
        "category": "Tablets",
        "price": 99900.0,
        "stock": 14,
        "rating": 4.9,
        "review_count": 37,
        "image_url": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop",
        "description": "Thinnovation redefined: Powered by Apple M4 chip with groundbreaking Ultra Retina Tandem OLED display and hardware-accelerated ray tracing.",
        "specifications": json.dumps({"processor": "Apple M4 9-core CPU", "ram": "8GB Unified", "storage": "256GB SSD", "display": "11-inch Ultra Retina Tandem OLED 120Hz", "camera": "12MP Wide + LiDAR Scanner", "battery": "10 hours"})
    },
    {
        "id": 606,
        "name": "Samsung Galaxy Tab S9 Ultra",
        "brand": "Samsung",
        "category": "Tablets",
        "price": 108999.0,
        "stock": 10,
        "rating": 4.8,
        "review_count": 29,
        "image_url": "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&auto=format&fit=crop",
        "description": "Gigantic 14.6-inch Dynamic AMOLED 2X canvas with IP68 water resistance, ultra-low latency S Pen, and Snapdragon 8 Gen 2 for creator productivity.",
        "specifications": json.dumps({"processor": "Snapdragon 8 Gen 2 for Galaxy", "ram": "12GB", "storage": "256GB Expandable", "display": "14.6-inch Dynamic AMOLED 2X 120Hz", "pen": "S Pen Included (IP68)", "battery": "11200 mAh 45W"})
    },
    {
        "id": 607,
        "name": "Lenovo Tab P12 Pro with Pen 3",
        "brand": "Lenovo",
        "category": "Tablets",
        "price": 39990.0,
        "stock": 20,
        "rating": 4.5,
        "review_count": 33,
        "image_url": "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=600&auto=format&fit=crop",
        "description": "Brilliant 12.6-inch 2K AMOLED tablet with Quad JBL speakers tuned by Dolby Atmos, Precision Pen 3 included, and secondary wireless PC monitor capability.",
        "specifications": json.dumps({"processor": "Snapdragon 870 Octa-core", "ram": "8GB LPDDR5", "storage": "256GB UFS 3.1", "display": "12.6-inch 2K AMOLED 120Hz HDR10+", "battery": "10200 mAh 45W Quick Charge"})
    },
    {
        "id": 608,
        "name": "Microsoft Surface Pro 9 Copilot 2-in-1",
        "brand": "Microsoft",
        "category": "Tablets",
        "price": 98990.0,
        "stock": 12,
        "rating": 4.6,
        "review_count": 25,
        "image_url": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop",
        "description": "Laptop versatility meets tablet portability with 13-inch PixelSense Flow 120Hz touchscreen, Intel 12th Gen processor, and full Windows 11 desktop power.",
        "specifications": json.dumps({"processor": "Intel Core i5-1235U 12th Gen", "ram": "8GB LPDDR5", "storage": "256GB Removable SSD", "display": "13.0-inch PixelSense 2880x1920 120Hz Touch", "battery": "15.5 hours"})
    },

    # --- CAMERAS & GAMING (705 - 708) ---
    {
        "id": 705,
        "name": "Nintendo Switch OLED Model",
        "brand": "Nintendo",
        "category": "Cameras & Gaming",
        "price": 29990.0,
        "stock": 25,
        "rating": 4.8,
        "review_count": 64,
        "image_url": "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&auto=format&fit=crop",
        "description": "Play at home on the TV or on-the-go with vibrant 7-inch OLED screen, wide adjustable stand, wired LAN dock, and detachable Joy-Con controllers.",
        "specifications": json.dumps({"display": "7.0-inch OLED Multi-touch", "storage": "64GB Internal Expandable via MicroSD", "audio": "Enhanced Onboard Audio", "battery": "4.5 to 9 hours", "modes": "TV Mode, Tabletop, Handheld"})
    },
    {
        "id": 706,
        "name": "Valve Steam Deck OLED 512GB",
        "brand": "Valve",
        "category": "Cameras & Gaming",
        "price": 54990.0,
        "stock": 15,
        "rating": 4.9,
        "review_count": 58,
        "image_url": "https://images.unsplash.com/photo-1612287233207-6f81b1d44fdc?w=600&auto=format&fit=crop",
        "description": "Portable PC gaming powerhouse with 7.4-inch 90Hz HDR OLED display, custom 6nm AMD APU, 50Wh battery, and direct access to your entire Steam library.",
        "specifications": json.dumps({"processor": "6nm AMD APU Zen 2 + RDNA 2", "ram": "16GB LPDDR5 6400 MT/s", "storage": "512GB NVMe SSD", "display": "7.4-inch 90Hz HDR OLED 1000 nits", "battery": "3 to 12 hours gameplay"})
    },
    {
        "id": 707,
        "name": "DJI Mini 4 Pro 4K Drone Fly More Combo",
        "brand": "DJI",
        "category": "Cameras & Gaming",
        "price": 114990.0,
        "stock": 10,
        "rating": 4.9,
        "review_count": 31,
        "image_url": "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600&auto=format&fit=crop",
        "description": "Ultralight sub-249g drone with omnidirectional obstacle sensing, 4K/60fps HDR True Vertical Shooting, 20km FHD video transmission, and 34min flight time.",
        "specifications": json.dumps({"weight": "< 249 g Regulation-friendly", "camera": "1/1.3-inch CMOS 48MP 4K/60fps HDR", "flight_time": "34 minutes (x3 Batteries Included)", "transmission": "DJI O4 20km FHD Video"})
    },
    {
        "id": 708,
        "name": "Insta360 X4 8K 360 Action Camera",
        "brand": "Insta360",
        "category": "Cameras & Gaming",
        "price": 49990.0,
        "stock": 18,
        "rating": 4.7,
        "review_count": 39,
        "image_url": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop",
        "description": "Unstoppable 8K 360-degree capture action camera with Invisible Selfie Stick effect, AI Gesture control, FlowState stabilization, and 10m waterproof body.",
        "specifications": json.dumps({"resolution": "8K 30fps 360 Video + 4K 100fps Slow-mo", "stabilization": "FlowState + 360 Horizon Lock", "waterproof": "10m without housing", "screen": "2.5-inch Gorilla Glass Touchscreen"})
    },

    # --- ACCESSORIES (407 - 412) ---
    {
        "id": 407,
        "name": "Logitech MX Master 3S Wireless Mouse",
        "brand": "Logitech",
        "category": "Accessories",
        "price": 8995.0,
        "stock": 40,
        "rating": 4.9,
        "review_count": 72,
        "image_url": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop",
        "description": "Ergonomic master mouse with Quiet Clicks, 8000 DPI track-on-glass sensor, MagSpeed electromagnetic scroll wheel, and Flow cross-computer control.",
        "specifications": json.dumps({"sensor": "8000 DPI Darkfield Any-surface", "scroll": "MagSpeed Electromagnetic 1000 lines/sec", "battery": "Up to 70 days rechargeable", "connectivity": "Bluetooth + Logi Bolt USB"})
    },
    {
        "id": 408,
        "name": "Apple Magic Keyboard with Touch ID",
        "brand": "Apple",
        "category": "Accessories",
        "price": 14900.0,
        "stock": 25,
        "rating": 4.7,
        "review_count": 36,
        "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop",
        "description": "Sleek wireless rechargeable keyboard providing remarkably comfortable and precise typing, paired with instant biometric Touch ID authentication.",
        "specifications": json.dumps({"keys": "Scissor mechanism low-profile", "biometric": "Touch ID Sensor for Mac", "battery": "Rechargeable internal battery (1+ month)", "connectivity": "Bluetooth + Lightning/USB-C"})
    },
    {
        "id": 409,
        "name": "Belkin 3-in-1 Fast Wireless MagSafe Charger",
        "brand": "Belkin",
        "category": "Accessories",
        "price": 12999.0,
        "stock": 28,
        "rating": 4.8,
        "review_count": 29,
        "image_url": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop",
        "description": "Premium architecturally designed 15W MagSafe charging stand capable of fast charging iPhone, Apple Watch, and AirPods simultaneously.",
        "specifications": json.dumps({"output": "15W Official MagSafe + 5W Watch + 5W AirPods", "orientation": "Portrait & Landscape view", "compatibility": "iPhone 12-15 series, Apple Watch Series 7-Ultra, AirPods Pro"})
    },
    {
        "id": 410,
        "name": "Samsung T7 Shield 2TB Rugged SSD",
        "brand": "Samsung",
        "category": "Accessories",
        "price": 15999.0,
        "stock": 35,
        "rating": 4.9,
        "review_count": 51,
        "image_url": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop",
        "description": "Tough, fast, and compact portable SSD with IP65 dust and water resistance, 3-meter drop durability, and blazing 1050 MB/s transfer speeds.",
        "specifications": json.dumps({"capacity": "2TB NVMe", "interface": "USB 3.2 Gen 2 (10 Gbps)", "speeds": "Up to 1050 MB/s Read / 1000 MB/s Write", "durability": "IP65 Water/Dust Resistant, 3m Drop Resistant"})
    },
    {
        "id": 411,
        "name": "Keychron K2 Pro Wireless Mechanical Keyboard",
        "brand": "Keychron",
        "category": "Accessories",
        "price": 8499.0,
        "stock": 30,
        "rating": 4.7,
        "review_count": 45,
        "image_url": "https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&auto=format&fit=crop",
        "description": "75% compact wireless mechanical keyboard with QMK/VIA key remapping, hot-swappable Keychron K Pro switches, Mac/Windows layout, and RGB backlighting.",
        "specifications": json.dumps({"layout": "75% Compact 84-keys", "switches": "Hot-swappable Keychron K Pro Red", "connectivity": "Bluetooth 5.1 + Type-C Wired", "battery": "4000 mAh Rechargeable (300h without RGB)"})
    },
    {
        "id": 412,
        "name": "Sony DualSense Edge PS5 Wireless Controller",
        "brand": "Sony",
        "category": "Accessories",
        "price": 18990.0,
        "stock": 22,
        "rating": 4.8,
        "review_count": 40,
        "image_url": "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=600&auto=format&fit=crop",
        "description": "Pro-grade ultra-customizable controller for PlayStation 5 and PC with swappable stick modules, mappable back buttons, adjustable triggers, and profile switching.",
        "specifications": json.dumps({"features": "Changeable Stick Caps, Replaceable Stick Modules", "triggers": "Adjustable trigger stops and deadzones", "feedback": "Haptic feedback + Adaptive Triggers", "storage": "Protective Carrying Case Included"})
    }
]

ALL_COMBINED = ALL_EXISTING + NEW_GADGETS

def seed_all_extended():
    print(f"Total products to seed: {len(ALL_COMBINED)} (Existing: {len(ALL_EXISTING)}, New: {len(NEW_GADGETS)})")
    
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    
    for g in ALL_COMBINED:
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
            g["id"], g["name"], g["brand"], g["category"], g["price"],
            g["stock"], g["rating"], g["review_count"], g["image_url"],
            g["description"], g["specifications"]
        ))
    conn.commit()
    cur.execute("SELECT COUNT(*) FROM products")
    count_db = cur.fetchone()[0]
    print(f"PostgreSQL updated! Total products now in database: {count_db}")
    cur.close()
    conn.close()

    # Save to seed_products.json
    with open(seed_json_path, "w", encoding="utf-8") as f:
        json.dump(ALL_COMBINED, f, indent=2)
    print(f"Updated {seed_json_path} with all {len(ALL_COMBINED)} products.")

if __name__ == "__main__":
    seed_all_extended()
