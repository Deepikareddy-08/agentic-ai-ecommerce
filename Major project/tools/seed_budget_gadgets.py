import json
import os
import psycopg2

DB_URL = os.getenv("DATABASE_URL", "postgresql://postgres:deepika08@localhost:5432/ecommerce_db")
seed_json_path = os.path.join(os.path.dirname(__file__), "..", "data", "seed_products.json")

with open(seed_json_path, "r", encoding="utf-8") as f:
    CURRENT_82 = json.load(f)

BUDGET_GADGETS = [
    # --- PHONES UNDER 25K & UNDER 10K (215 - 224) ---
    {
        "id": 215,
        "name": "Realme 12 Pro 5G",
        "brand": "Realme",
        "category": "Smartphones",
        "price": 21999.0,
        "stock": 35,
        "rating": 4.6,
        "review_count": 42,
        "image_url": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop",
        "description": "Premium luxury watch design smartphone with 32MP Telephoto Portrait camera, Snapdragon 6 Gen 1 5G, 120Hz Curved Vision AMOLED display, and 67W SUPERVOOC charging.",
        "specifications": json.dumps({"processor": "Snapdragon 6 Gen 1 5G", "ram": "8GB LPDDR4X", "storage": "128GB", "display": "6.7-inch 120Hz Curved AMOLED FHD+", "camera": "50MP Sony IMX882 + 32MP Telephoto + 8MP Ultrawide", "battery": "5000 mAh 67W Fast Charge"})
    },
    {
        "id": 216,
        "name": "iQOO Z9 5G SuperSpeed",
        "brand": "iQOO",
        "category": "Smartphones",
        "price": 19999.0,
        "stock": 30,
        "rating": 4.7,
        "review_count": 55,
        "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop",
        "description": "Fastest phone in the segment powered by MediaTek Dimensity 7200 4nm processor with Sony IMX882 OIS camera, 120Hz AMOLED 1800 nits display, and dual stereo speakers.",
        "specifications": json.dumps({"processor": "MediaTek Dimensity 7200 4nm", "ram": "8GB", "storage": "128GB UFS 2.2", "display": "6.67-inch 120Hz AMOLED 1800 nits", "camera": "50MP Sony IMX882 OIS + 2MP Bokeh", "battery": "5000 mAh 44W FlashCharge"})
    },
    {
        "id": 217,
        "name": "POCO X6 5G Performance",
        "brand": "POCO",
        "category": "Smartphones",
        "price": 18999.0,
        "stock": 40,
        "rating": 4.5,
        "review_count": 48,
        "image_url": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop",
        "description": "Flagship-tier 1.5K 120Hz Flow AMOLED display with Snapdragon 7s Gen 2, 64MP OIS triple camera, 5100mAh battery, and 67W sonic turbo charging.",
        "specifications": json.dumps({"processor": "Snapdragon 7s Gen 2 4nm", "ram": "8GB LPDDR4X", "storage": "256GB UFS 2.2", "display": "6.67-inch 1.5K CrystalRes 120Hz AMOLED", "camera": "64MP OIS + 8MP Ultra + 2MP Macro", "battery": "5100 mAh 67W Turbo Charge"})
    },
    {
        "id": 218,
        "name": "Samsung Galaxy M34 5G Monster",
        "brand": "Samsung",
        "category": "Smartphones",
        "price": 16999.0,
        "stock": 35,
        "rating": 4.4,
        "review_count": 62,
        "image_url": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop",
        "description": "Monster 6000mAh battery smartphone featuring 120Hz Super AMOLED display, 50MP No Shake OIS camera, Exynos 1280 processor, and 4 years of OS upgrades.",
        "specifications": json.dumps({"processor": "Exynos 1280 5nm", "ram": "8GB", "storage": "128GB Expandable to 1TB", "display": "6.5-inch 120Hz Super AMOLED Gorilla Glass 5", "camera": "50MP OIS No Shake + 8MP + 2MP", "battery": "6000 mAh 25W Fast Charge"})
    },
    {
        "id": 219,
        "name": "Moto G84 5G Vegan Leather",
        "brand": "Motorola",
        "category": "Smartphones",
        "price": 17999.0,
        "stock": 28,
        "rating": 4.6,
        "review_count": 39,
        "image_url": "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop",
        "description": "Ultralight and stylish phone with Viva Magenta vegan leather finish, 12GB RAM standard, 10-bit 120Hz pOLED display, 50MP OIS camera, and Dolby Atmos audio.",
        "specifications": json.dumps({"processor": "Snapdragon 695 5G", "ram": "12GB", "storage": "256GB", "display": "6.55-inch 120Hz 10-bit pOLED", "camera": "50MP OIS + 8MP Ultrawide Macro", "battery": "5000 mAh 33W TurboPower"})
    },
    {
        "id": 220,
        "name": "Realme Narzo 70 Pro 5G",
        "brand": "Realme",
        "category": "Smartphones",
        "price": 18999.0,
        "stock": 32,
        "rating": 4.5,
        "review_count": 45,
        "image_url": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop",
        "description": "Segment-first flagship Sony IMX890 OIS camera, innovative Air Gesture controls, MediaTek Dimensity 7050 5G, and 67W flash charging.",
        "specifications": json.dumps({"processor": "MediaTek Dimensity 7050 6nm", "ram": "8GB", "storage": "128GB", "display": "6.67-inch 120Hz AMOLED 2000 nits", "camera": "50MP Sony IMX890 OIS + 8MP + 2MP", "battery": "5000 mAh 67W Flash Charge"})
    },
    {
        "id": 221,
        "name": "Redmi 13C 5G Fast & Sleek",
        "brand": "Xiaomi",
        "category": "Smartphones",
        "price": 9999.0,
        "stock": 50,
        "rating": 4.3,
        "review_count": 80,
        "image_url": "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=600&auto=format&fit=crop",
        "description": "Super affordable 5G smartphone under ₹10,000 powered by MediaTek Dimensity 6100+ 5G, 50MP AI dual camera, smooth 90Hz display, and 5000mAh battery.",
        "specifications": json.dumps({"processor": "MediaTek Dimensity 6100+ 6nm 5G", "ram": "6GB (with Virtual RAM)", "storage": "128GB UFS 2.2", "display": "6.74-inch 90Hz HD+ Gorilla Glass", "camera": "50MP AI Dual Camera", "battery": "5000 mAh 18W Fast Charge"})
    },
    {
        "id": 222,
        "name": "POCO M6 5G Budget King",
        "brand": "POCO",
        "category": "Smartphones",
        "price": 8999.0,
        "stock": 60,
        "rating": 4.3,
        "review_count": 75,
        "image_url": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop",
        "description": "The most accessible 5G phone under ₹10k with Dimensity 6100+ processor, dynamic 90Hz display, premium glass-like dual tone back, and 50MP camera.",
        "specifications": json.dumps({"processor": "MediaTek Dimensity 6100+ 5G", "ram": "6GB", "storage": "128GB", "display": "6.74-inch 90Hz Display", "camera": "50MP AI Dual Rear Camera", "battery": "5000 mAh 18W Charging"})
    },
    {
        "id": 223,
        "name": "Samsung Galaxy A05s",
        "brand": "Samsung",
        "category": "Smartphones",
        "price": 9499.0,
        "stock": 45,
        "rating": 4.2,
        "review_count": 52,
        "image_url": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop",
        "description": "Reliable Samsung smartphone with Qualcomm Snapdragon 680, sharp 6.7-inch FHD+ 90Hz display, 50MP triple rear cameras, and 5000mAh battery.",
        "specifications": json.dumps({"processor": "Snapdragon 680 6nm", "ram": "6GB", "storage": "128GB Expandable to 1TB", "display": "6.7-inch FHD+ 90Hz PLS LCD", "camera": "50MP Main + 2MP Macro + 2MP Depth", "battery": "5000 mAh 25W Fast Charge"})
    },
    {
        "id": 224,
        "name": "Moto G24 Power 6000mAh",
        "brand": "Motorola",
        "category": "Smartphones",
        "price": 7999.0,
        "stock": 55,
        "rating": 4.4,
        "review_count": 68,
        "image_url": "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop",
        "description": "Unbeatable budget battery champion with massive 6000mAh pack, 33W TurboPower charger in box, clean stock Android 14, and 50MP Quad Pixel camera.",
        "specifications": json.dumps({"processor": "MediaTek Helio G85", "ram": "8GB (4GB + 4GB Boost)", "storage": "128GB", "display": "6.56-inch 90Hz HD+ IPS", "camera": "50MP Quad Pixel + 2MP Macro", "battery": "6000 mAh 33W TurboPower"})
    },

    # --- AUDIO & SPEAKERS UNDER 10K & UNDER 5K (315 - 322) ---
    {
        "id": 315,
        "name": "Realme Buds Air 6 Pro ANC Earbuds",
        "brand": "Realme",
        "category": "Audio & Headphones",
        "price": 4499.0,
        "stock": 40,
        "rating": 4.7,
        "review_count": 58,
        "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop",
        "description": "Flagship acoustic setup under ₹5k featuring 50dB Smart Active Noise Cancellation, dual dynamic coaxial drivers (11mm bass + 6mm micro-planar tweeter), and LDAC Hi-Res Wireless.",
        "specifications": json.dumps({"drivers": "11mm Bass + 6mm Micro-planar Tweeter", "anc": "50dB Smart Active Noise Cancellation", "codecs": "Hi-Res LDAC, AAC, SBC", "battery": "40 hours total playtime"})
    },
    {
        "id": 316,
        "name": "boAt Airdopes 141 ANC Wireless Earbuds",
        "brand": "boAt",
        "category": "Audio & Headphones",
        "price": 1499.0,
        "stock": 80,
        "rating": 4.3,
        "review_count": 110,
        "image_url": "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&auto=format&fit=crop",
        "description": "India's bestselling budget earbuds under ₹2k with up to 32dB Active Noise Cancellation, 42 hours playback, ENx quad mics, and BEAST 50ms low latency gaming mode.",
        "specifications": json.dumps({"anc": "Up to 32dB Active Noise Cancellation", "battery": "42 hours total (ASAP Charge 10m=120m)", "latency": "50ms Low Latency BEAST Mode", "protection": "IPX5 Sweat & Water Resistant"})
    },
    {
        "id": 317,
        "name": "OnePlus Nord Buds 3 Pro",
        "brand": "OnePlus",
        "category": "Audio & Headphones",
        "price": 3299.0,
        "stock": 50,
        "rating": 4.6,
        "review_count": 64,
        "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop",
        "description": "Up to 49dB Smart Hybrid ANC, 12.4mm titanized dynamic driver, dual device connection, and 44 hours of total playback with ultra-fast charging.",
        "specifications": json.dumps({"driver": "12.4mm Titanized Dynamic Driver", "anc": "49dB Smart Hybrid ANC", "battery": "44 hours with charging case", "connectivity": "Dual Connection Bluetooth 5.4"})
    },
    {
        "id": 318,
        "name": "JBL Flip 6 Portable Bluetooth Speaker",
        "brand": "JBL",
        "category": "Audio & Headphones",
        "price": 9999.0,
        "stock": 25,
        "rating": 4.8,
        "review_count": 72,
        "image_url": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop",
        "description": "Big, bold, crystal-clear JBL Pro Sound with 2-way speaker system, racetrack-shaped woofer, separate tweeter, IP67 waterproof/dustproof rating, and 12-hour battery.",
        "specifications": json.dumps({"output": "30W RMS (20W Woofer + 10W Tweeter)", "protection": "IP67 Waterproof and Dustproof", "battery": "12 hours playtime", "features": "PartyBoost Multi-speaker pairing"})
    },
    {
        "id": 319,
        "name": "boAt Aavante Bar 1150 120W Soundbar",
        "brand": "boAt",
        "category": "Audio & Headphones",
        "price": 4999.0,
        "stock": 35,
        "rating": 4.4,
        "review_count": 49,
        "image_url": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop",
        "description": "120W RMS 2.1 Channel home theater soundbar with wired subwoofer, EQ modes (Movie, Music, News), and multi-connectivity (Bluetooth v5.3, AUX, USB, Optical, HDMI ARC).",
        "specifications": json.dumps({"power": "120W RMS 2.1 Channel", "subwoofer": "60W Wired Subwoofer included", "connectivity": "Bluetooth 5.3, HDMI ARC, Optical, AUX, USB", "eq": "Multiple Entertainment EQ Modes"})
    },
    {
        "id": 320,
        "name": "Sony SRS-XB100 Compact Bluetooth Speaker",
        "brand": "Sony",
        "category": "Audio & Headphones",
        "price": 4490.0,
        "stock": 30,
        "rating": 4.7,
        "review_count": 53,
        "image_url": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop",
        "description": "Ultra-compact wireless speaker delivering powerful, clear Extra Bass with Sound Diffusion Processor, 16 hours battery, and IP67 waterproof/dustproof body.",
        "specifications": json.dumps({"features": "Sound Diffusion Processor + Extra Bass", "battery": "16 hours battery life", "protection": "IP67 Water & Dustproof with UV coating", "strap": "Versatile 2-way strap included"})
    },
    {
        "id": 321,
        "name": "Tribit StormBox Micro 2 Rugged Speaker",
        "brand": "Tribit",
        "category": "Audio & Headphones",
        "price": 3999.0,
        "stock": 25,
        "rating": 4.6,
        "review_count": 37,
        "image_url": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop",
        "description": "Pocket-sized outdoor Bluetooth 5.3 speaker with 90dB loud sound, XBass technology, integrated power bank port to charge phones, and tear-resistant bike strap.",
        "specifications": json.dumps({"output": "10W Full-range Driver with XBass", "battery": "12 hours playtime + Phone Charging Output", "protection": "IP67 Waterproof & Sandproof", "range": "120ft Bluetooth 5.3 range"})
    },
    {
        "id": 322,
        "name": "Amazon Echo Dot 5th Gen with Alexa",
        "brand": "Amazon",
        "category": "Audio & Headphones",
        "price": 4499.0,
        "stock": 45,
        "rating": 4.5,
        "review_count": 89,
        "image_url": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop",
        "description": "Smart speaker featuring best sounding Echo Dot audio with deeper bass and clearer vocals. Voice-control smart lights, stream music, and check weather with Alexa in English and Hindi.",
        "specifications": json.dumps({"audio": "1.73-inch Front-firing speaker", "connectivity": "Dual-band Wi-Fi + Bluetooth", "sensors": "Ultrasound Motion Detection + Temperature Sensor", "voice": "Alexa in English & Hindi"})
    },

    # --- SMARTWATCHES UNDER 10K & UNDER 3K (513 - 520) ---
    {
        "id": 513,
        "name": "Fire-Boltt Invincible Plus AMOLED",
        "brand": "Fire-Boltt",
        "category": "Smartwatches",
        "price": 3999.0,
        "stock": 50,
        "rating": 4.4,
        "review_count": 65,
        "image_url": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop",
        "description": "1.43-inch AMOLED Always-On display smartwatch with 4GB onboard storage to save 1000+ songs, Bluetooth calling, and direct TWS earbud pairing without a phone.",
        "specifications": json.dumps({"display": "1.43-inch AMOLED 700 nits Always-On", "storage": "4GB Local Storage for MP3 Music", "features": "TWS Direct Pairing, BT Calling, 300 Sports", "battery": "5 days typical, 15 days standby"})
    },
    {
        "id": 514,
        "name": "Noise ColorFit Ultra 3 Large AMOLED",
        "brand": "Noise",
        "category": "Smartwatches",
        "price": 2999.0,
        "stock": 65,
        "rating": 4.5,
        "review_count": 92,
        "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop",
        "description": "Huge 1.96-inch AMOLED display with functional metallic crown, Tru Sync Bluetooth calling, gesture control, and comprehensive 24/7 health tracking suite.",
        "specifications": json.dumps({"display": "1.96-inch AMOLED 500 nits Always On", "body": "Metallic build with functional crown", "calling": "Single-chip Tru Sync Bluetooth Calling", "battery": "7 days battery life"})
    },
    {
        "id": 515,
        "name": "boAt Lunar Mirage Round AMOLED",
        "brand": "boAt",
        "category": "Smartwatches",
        "price": 1999.0,
        "stock": 75,
        "rating": 4.3,
        "review_count": 84,
        "image_url": "https://images.unsplash.com/photo-1510017803434-a899398421b3?w=600&auto=format&fit=crop",
        "description": "Affordable circular 1.52-inch HD screen smartwatch with crystal-clear Bluetooth calling, metallic round dial, crown navigation, and IP68 water resistance under ₹2,000.",
        "specifications": json.dumps({"display": "1.52-inch Round HD Color Display", "calling": "Bluetooth Calling with Save Contacts", "health": "Heart Rate, SpO2, Sleep, Menstrual Cycle", "protection": "IP68 Dust and Splash Resistant"})
    },
    {
        "id": 516,
        "name": "CMF by Nothing Watch Pro 2",
        "brand": "CMF",
        "category": "Smartwatches",
        "price": 4999.0,
        "stock": 40,
        "rating": 4.6,
        "review_count": 47,
        "image_url": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop",
        "description": "Interchangeable bezel design with 1.32-inch 120Hz AMOLED display, auto-brightness, built-in multi-system GPS, AI noise-reduced calls, and gesture controls.",
        "specifications": json.dumps({"display": "1.32-inch AMOLED 120Hz 620 nits Auto-brightness", "design": "Interchangeable Bezel aluminum alloy case", "gps": "Built-in 5-satellite Multi-system GPS", "battery": "11 days typical use"})
    },
    {
        "id": 517,
        "name": "Amazfit Bip 5 Unity Smartwatch",
        "brand": "Amazfit",
        "category": "Smartwatches",
        "price": 5499.0,
        "stock": 30,
        "rating": 4.5,
        "review_count": 36,
        "image_url": "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&auto=format&fit=crop",
        "description": "Slim stainless steel frame smartwatch powered by Zepp OS 3.0, 1.91-inch ultra-large display, Bluetooth calling with microphone/speaker, and 11-day battery life.",
        "specifications": json.dumps({"display": "1.91-inch High-resolution Touchscreen", "os": "Zepp OS 3.0 with mini-app ecosystem", "battery": "11 days typical use, 26 days battery saver", "sports": "120+ Sports Modes with Auto-detection"})
    },
    {
        "id": 518,
        "name": "OnePlus Nord Watch AMOLED",
        "brand": "OnePlus",
        "category": "Smartwatches",
        "price": 3999.0,
        "stock": 45,
        "rating": 4.4,
        "review_count": 52,
        "image_url": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop",
        "description": "1.78-inch AMOLED 60Hz display with 500 nits peak brightness, fast one-tap measurement for heart rate and SpO2, and up to 30 days of standby time.",
        "specifications": json.dumps({"display": "1.78-inch AMOLED 60Hz Refresh Rate", "health": "One-tap 4-in-1 Health Measurement", "battery": "10 days active, 30 days standby", "waterproof": "IP68 Water Resistance"})
    },
    {
        "id": 519,
        "name": "Fastrack Limitless FS1 Pro Curved AMOLED",
        "brand": "Fastrack",
        "category": "Smartwatches",
        "price": 2495.0,
        "stock": 60,
        "rating": 4.3,
        "review_count": 67,
        "image_url": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop",
        "description": "India's first 1.96-inch Super AMOLED curved display smartwatch under ₹2,500 with SingleSync BT calling, AI voice assistant, and 110+ sports modes.",
        "specifications": json.dumps({"display": "1.96-inch Super AMOLED 410x502 Curved", "calling": "SingleSync Bluetooth Calling", "sports": "110+ Sports Modes & Activity Tracker", "battery": "Up to 7 days battery backup"})
    },
    {
        "id": 520,
        "name": "Redmi Watch 3 Active Bluetooth Calling",
        "brand": "Xiaomi",
        "category": "Smartwatches",
        "price": 2999.0,
        "stock": 55,
        "rating": 4.4,
        "review_count": 70,
        "image_url": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop",
        "description": "1.83-inch large iridescent display, metallic finish casing, Bluetooth phone calls with noise-canceling mic, 5ATM water resistance, and 12-day battery life.",
        "specifications": json.dumps({"display": "1.83-inch Ultra-large LCD 450 nits", "water_resistance": "5ATM Water Resistant up to 50m", "calling": "Bluetooth Phone Calls with Mic/Speaker", "battery": "12 days typical use"})
    },

    # --- TABLETS UNDER 25K & UNDER 15K (609 - 612) ---
    {
        "id": 609,
        "name": "Realme Pad 2 11.5-inch 120Hz 2K",
        "brand": "Realme",
        "category": "Tablets",
        "price": 17999.0,
        "stock": 25,
        "rating": 4.6,
        "review_count": 44,
        "image_url": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop",
        "description": "Class-leading entertainment tablet under ₹20k with 11.5-inch 120Hz 2K Super Display, MediaTek Helio G99, Quad speakers with Dolby Atmos, and 8360mAh battery with 33W fast charging.",
        "specifications": json.dumps({"processor": "MediaTek Helio G99 6nm", "ram": "8GB LPDDR4X", "storage": "256GB Expandable up to 2TB", "display": "11.5-inch 2K 120Hz Eye Comfort 450 nits", "audio": "Quad Speakers with Dolby Atmos", "battery": "8360 mAh 33W SUPERVOOC"})
    },
    {
        "id": 610,
        "name": "Redmi Pad SE 11-inch FHD+ Tablet",
        "brand": "Xiaomi",
        "category": "Tablets",
        "price": 12999.0,
        "stock": 35,
        "rating": 4.5,
        "review_count": 58,
        "image_url": "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&auto=format&fit=crop",
        "description": "Perfect student tablet under ₹15k with Snapdragon 680 6nm processor, 11-inch 90Hz FHD+ eye-care display with TÜV Rheinland certification, and metal unibody design.",
        "specifications": json.dumps({"processor": "Snapdragon 680 6nm Octa-Core", "ram": "8GB", "storage": "128GB Expandable to 1TB", "display": "11.0-inch FHD+ 90Hz AdaptiveSync", "audio": "Quad Stereo Speakers Dolby Atmos", "battery": "8000 mAh Long-lasting"})
    },
    {
        "id": 611,
        "name": "Lenovo Tab M11 with Pen Included",
        "brand": "Lenovo",
        "category": "Tablets",
        "price": 14990.0,
        "stock": 30,
        "rating": 4.4,
        "review_count": 39,
        "image_url": "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=600&auto=format&fit=crop",
        "description": "Productivity learning tablet featuring 11-inch 90Hz WUXGA screen, bundled Lenovo Tab Pen for drawing and note-taking, split-screen multi-tasking, and quad speakers.",
        "specifications": json.dumps({"processor": "MediaTek Helio G88", "ram": "8GB", "storage": "128GB", "display": "11.0-inch WUXGA 1920x1200 90Hz IPS", "pen": "Lenovo Tab Pen Included in Box", "battery": "7040 mAh Fast Charging"})
    },
    {
        "id": 612,
        "name": "Samsung Galaxy Tab A9 Compact",
        "brand": "Samsung",
        "category": "Tablets",
        "price": 10999.0,
        "stock": 38,
        "rating": 4.3,
        "review_count": 48,
        "image_url": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop",
        "description": "Compact and portable 8.7-inch tablet with dual speakers powered by Dolby Atmos, slim metal body, MediaTek Helio G99 processor, and seamless Samsung ecosystem connectivity.",
        "specifications": json.dumps({"processor": "MediaTek Helio G99", "ram": "4GB", "storage": "64GB Expandable up to 1TB", "display": "8.7-inch WXGA+ Compact Screen", "audio": "Dual Speakers Dolby Atmos", "battery": "5100 mAh Battery"})
    },

    # --- ACCESSORIES & SMART GADGETS UNDER 5K & UNDER 2K (413 - 418) ---
    {
        "id": 413,
        "name": "Portronics Konnect Pro 6-in-1 USB-C Hub",
        "brand": "Portronics",
        "category": "Accessories",
        "price": 1199.0,
        "stock": 60,
        "rating": 4.5,
        "review_count": 82,
        "image_url": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop",
        "description": "Essential laptop accessory under ₹1,500 featuring 4K HDMI 30Hz output, 100W USB-C Power Delivery pass-through, 3x USB 3.0 ports (5Gbps), and SD/TF card slots in aluminum body.",
        "specifications": json.dumps({"ports": "1x 4K HDMI, 1x 100W Type-C PD, 3x USB 3.0, 1x SD/TF", "build": "Space Gray Aluminum Heat-dissipating Shell", "compatibility": "MacBook, Windows Laptops, iPad Pro, Type-C Phones"})
    },
    {
        "id": 414,
        "name": "Ambrane 20000mAh Power Bank 22.5W Fast Charge",
        "brand": "Ambrane",
        "category": "Accessories",
        "price": 1499.0,
        "stock": 70,
        "rating": 4.6,
        "review_count": 95,
        "image_url": "https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=600&auto=format&fit=crop",
        "description": "High-capacity 20000mAh power bank supporting 22.5W Power Delivery and Quick Charge 3.0. Features triple output ports to charge 3 devices simultaneously with multi-layer circuit protection.",
        "specifications": json.dumps({"capacity": "20000 mAh Lithium Polymer", "output": "22.5W Max (2x USB-A + 1x Type-C PD)", "charging": "Power Delivery 3.0 + QC 3.0 Fast Charging", "body": "Durable Matte Finish with LED Indicator"})
    },
    {
        "id": 415,
        "name": "Redragon K552 Kumara RGB Mechanical Keyboard",
        "brand": "Redragon",
        "category": "Accessories",
        "price": 2499.0,
        "stock": 45,
        "rating": 4.7,
        "review_count": 78,
        "image_url": "https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&auto=format&fit=crop",
        "description": "Tenkeyless 87-key compact mechanical gaming keyboard with dustproof tactile clicky blue switches, rainbow RGB backlighting with 18 lighting modes, and solid metal-ABS construction.",
        "specifications": json.dumps({"layout": "Compact Tenkeyless 87 Keys", "switches": "Custom Mechanical Blue Clicky Equivalent", "backlight": "18 RGB Backlight Modes + 5 Brightness Levels", "features": "Full Anti-Ghosting N-Key Rollover"})
    },
    {
        "id": 416,
        "name": "Razer DeathAdder Essential Ergonomic Gaming Mouse",
        "brand": "Razer",
        "category": "Accessories",
        "price": 1299.0,
        "stock": 65,
        "rating": 4.6,
        "review_count": 88,
        "image_url": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop",
        "description": "Legendary ergonomic esports gaming mouse featuring high-precision 6400 DPI optical sensor, 5 independently programmable Hyperesponse buttons, and durable mechanical switches rated for 10 million clicks.",
        "specifications": json.dumps({"sensor": "6400 True DPI Optical Sensor", "buttons": "5 Hyperesponse Programmable Buttons", "durability": "10 Million Click Mechanical Switches", "form_factor": "Classic Ergonomic Right-Handed"})
    },
    {
        "id": 417,
        "name": "Mi Smart Wi-Fi 360 Home Security Camera 2K",
        "brand": "Xiaomi",
        "category": "Accessories",
        "price": 2799.0,
        "stock": 50,
        "rating": 4.5,
        "review_count": 63,
        "image_url": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop",
        "description": "3-megapixel 2K ultra-clear smart security camera with 360-degree panoramic view, enhanced infrared night vision, AI human motion detection alerts, and two-way voice calling.",
        "specifications": json.dumps({"resolution": "2K Ultra-clear (2304x1296p) 3MP", "pan_tilt": "360-degree horizontal + 108-degree vertical", "night_vision": "940nm Invisible Infrared LEDs", "connectivity": "Wi-Fi 2.4GHz + MicroSD / Cloud Storage"})
    },
    {
        "id": 418,
        "name": "Wipro 16A Smart Wi-Fi Plug with Energy Monitoring",
        "brand": "Wipro",
        "category": "Accessories",
        "price": 999.0,
        "stock": 90,
        "rating": 4.4,
        "review_count": 105,
        "image_url": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop",
        "description": "Smart 16A plug suitable for heavy home appliances like air conditioners, geysers, and microwaves. Control devices remotely from anywhere using Wipro Smart App and monitor monthly electricity energy consumption.",
        "specifications": json.dumps({"rating": "16 Amp (Suitable for AC, Geyser, Microwave)", "control": "Voice Control via Alexa & Google Assistant", "features": "Real-time & Historical Energy Consumption Monitor", "connectivity": "Direct Wi-Fi 2.4GHz (No Hub Required)"})
    }
]

ALL_FINAL = CURRENT_82 + BUDGET_GADGETS

def seed_budget():
    print(f"Adding {len(BUDGET_GADGETS)} new budget electronics under 25k, 10k, and 5k...")
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    for g in ALL_FINAL:
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
    total_db = cur.fetchone()[0]
    print(f"PostgreSQL updated! Total products now in database: {total_db}")
    cur.close()
    conn.close()

    # Save to seed_products.json
    with open(seed_json_path, "w", encoding="utf-8") as f:
        json.dump(ALL_FINAL, f, indent=2)
    print(f"Updated {seed_json_path} with all {len(ALL_FINAL)} products.")

if __name__ == "__main__":
    seed_budget()
