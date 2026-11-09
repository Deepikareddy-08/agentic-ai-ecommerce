import json
import os
import psycopg2

DB_URL = os.getenv("DATABASE_URL", "postgresql://postgres:deepika08@localhost:5432/ecommerce_db")

ALL_GADGETS = [
    # --- LAPTOPS (101-106) ---
    {
        "id": 101,
        "name": "Lenovo ThinkPad E14 Gen 5",
        "brand": "Lenovo",
        "category": "Laptops",
        "price": 62990.0,
        "stock": 24,
        "rating": 4.7,
        "review_count": 28,
        "image_url": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop",
        "description": "Enterprise-grade professional laptop with military-spec durability and exceptional keyboard tactile feedback. Built specifically for developers, data analysts, and corporate power users.",
        "specifications": json.dumps({"processor": "AMD Ryzen 7 7730U", "ram": "16GB DDR4", "storage": "512GB NVMe SSD", "display": "14-inch WUXGA IPS 300 nits", "battery": "11.5 hours"})
    },
    {
        "id": 102,
        "name": "Apple MacBook Air M2",
        "brand": "Apple",
        "category": "Laptops",
        "price": 94990.0,
        "stock": 15,
        "rating": 4.9,
        "review_count": 45,
        "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop",
        "description": "Incredibly thin and fast MacBook powered by Apple M2 silicon. Silent fanless design with up to 18 hours battery life and stunning Liquid Retina display.",
        "specifications": json.dumps({"processor": "Apple M2 8-core CPU", "ram": "16GB Unified", "storage": "256GB SSD", "display": "13.6-inch Liquid Retina", "battery": "18 hours"})
    },
    {
        "id": 103,
        "name": "ASUS Vivobook 15",
        "brand": "ASUS",
        "category": "Laptops",
        "price": 49990.0,
        "stock": 30,
        "rating": 4.3,
        "review_count": 32,
        "image_url": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop",
        "description": "Sleek modern laptop offering top-tier productivity features at an accessible budget. Features a crisp FHD display and fast Intel Core i5 processor for coding and everyday computing.",
        "specifications": json.dumps({"processor": "Intel Core i5-1335U 13th Gen", "ram": "16GB DDR4", "storage": "512GB PCIe SSD", "display": "15.6-inch FHD Anti-glare", "battery": "6.5 hours"})
    },
    {
        "id": 104,
        "name": "Dell Inspiron 14 5430",
        "brand": "Dell",
        "category": "Laptops",
        "price": 73990.0,
        "stock": 18,
        "rating": 4.6,
        "review_count": 19,
        "image_url": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop",
        "description": "Premium 14-inch ultrabook featuring high-resolution 2.5K 16:10 display with ComfortView Plus and high-performance Intel Core i7 13th gen processor.",
        "specifications": json.dumps({"processor": "Intel Core i7-1360P 13th Gen", "ram": "16GB LPDDR5", "storage": "1TB NVMe SSD", "display": "14.0-inch 2.5K WVA", "battery": "8.5 hours"})
    },
    {
        "id": 105,
        "name": "HP Pavilion 14",
        "brand": "HP",
        "category": "Laptops",
        "price": 56990.0,
        "stock": 22,
        "rating": 4.5,
        "review_count": 26,
        "image_url": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop",
        "description": "Well-rounded, compact lightweight notebook engineered for students, web developers, and mobile professionals. Features AMD Ryzen 5 with Radeon graphics and crisp IPS display.",
        "specifications": json.dumps({"processor": "AMD Ryzen 5 7530U", "ram": "16GB DDR4", "storage": "512GB PCIe SSD", "display": "14-inch FHD IPS", "battery": "9 hours"})
    },
    {
        "id": 106,
        "name": "Acer Nitro V 15 Gaming",
        "brand": "Acer",
        "category": "Laptops",
        "price": 72990.0,
        "stock": 12,
        "rating": 4.4,
        "review_count": 21,
        "image_url": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop",
        "description": "High-octane gaming and deep learning machine equipped with dedicated NVIDIA GeForce RTX 4050 GPU, dual fan cooling, and fast 144Hz high refresh rate screen.",
        "specifications": json.dumps({"processor": "Intel Core i5-13420H", "ram": "16GB DDR5", "graphics": "NVIDIA RTX 4050 6GB", "storage": "512GB SSD", "display": "15.6-inch 144Hz FHD"})
    },

    # --- SMARTPHONES (201-206) ---
    {
        "id": 201,
        "name": "Google Pixel 8a",
        "brand": "Google",
        "category": "Smartphones",
        "price": 42990.0,
        "stock": 28,
        "rating": 4.8,
        "review_count": 35,
        "image_url": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop",
        "description": "Flagship-level photography powered by Google Tensor G3 and AI photo editing magic. Pure Android with 7 years of OS updates and vibrant 120Hz Actua OLED display.",
        "specifications": json.dumps({"processor": "Google Tensor G3", "ram": "8GB LPDDR5X", "storage": "128GB", "camera": "64MP + 13MP Dual OIS", "display": "6.1-inch 120Hz Actua OLED", "battery": "4492 mAh"})
    },
    {
        "id": 202,
        "name": "Samsung Galaxy S23 FE",
        "brand": "Samsung",
        "category": "Smartphones",
        "price": 37990.0,
        "stock": 20,
        "rating": 4.5,
        "review_count": 29,
        "image_url": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop",
        "description": "Fan Edition flagship smartphone with pro-grade 50MP triple lens system, telephoto zoom, premium glass back, and stunning Dynamic AMOLED 2X display.",
        "specifications": json.dumps({"processor": "Exynos 2200 4nm", "ram": "8GB", "storage": "128GB", "camera": "50MP + 12MP + 8MP 3x Zoom", "display": "6.4-inch 120Hz Dynamic AMOLED", "battery": "4500 mAh"})
    },
    {
        "id": 203,
        "name": "OnePlus Nord 4 5G",
        "brand": "OnePlus",
        "category": "Smartphones",
        "price": 29990.0,
        "stock": 35,
        "rating": 4.7,
        "review_count": 42,
        "image_url": "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop",
        "description": "All-metal unibody smartphone engineered with Snapdragon 7+ Gen 3 powerhouse chip, huge 5500mAh battery with blazing 100W SuperVOOC fast charging.",
        "specifications": json.dumps({"processor": "Snapdragon 7+ Gen 3", "ram": "12GB LPDDR5X", "storage": "256GB UFS 4.0", "camera": "50MP Sony LYT-600 OIS", "display": "6.74-inch 1.5K 120Hz AMOLED", "battery": "5500 mAh + 100W"})
    },
    {
        "id": 204,
        "name": "Redmi Note 13 Pro+ 5G",
        "brand": "Xiaomi",
        "category": "Smartphones",
        "price": 27990.0,
        "stock": 25,
        "rating": 4.4,
        "review_count": 31,
        "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop",
        "description": "Stunning curved 1.5K AMOLED phone boasting a massive 200MP Samsung ISOCELL sensor with lossless in-sensor zoom, IP68 water resistance, and 120W HyperCharge.",
        "specifications": json.dumps({"processor": "MediaTek Dimensity 7200-Ultra", "ram": "12GB", "storage": "256GB", "camera": "200MP OIS Triple Camera", "display": "6.67-inch Curved 1.5K 120Hz AMOLED", "battery": "5000 mAh + 120W"})
    },
    {
        "id": 205,
        "name": "OnePlus 12R",
        "brand": "OnePlus",
        "category": "Smartphones",
        "price": 39999.0,
        "stock": 22,
        "rating": 4.8,
        "review_count": 38,
        "image_url": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop",
        "description": "Performance flagship featuring Snapdragon 8 Gen 2, 4th Gen LTPO 120Hz ProXDR display, massive 5500mAh battery with 100W charging and Dual Cryo-velocity VC cooling.",
        "specifications": json.dumps({"processor": "Snapdragon 8 Gen 2", "ram": "16GB LPDDR5X", "storage": "256GB", "camera": "50MP Sony IMX890 OIS", "display": "6.78-inch 1.5K 120Hz LTPO4 ProXDR", "battery": "5500 mAh + 100W"})
    },
    {
        "id": 206,
        "name": "Apple iPhone 15",
        "brand": "Apple",
        "category": "Smartphones",
        "price": 69900.0,
        "stock": 16,
        "rating": 4.8,
        "review_count": 52,
        "image_url": "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop",
        "description": "Dynamic Island, 48MP Main camera with 2x Telephoto, durable color-infused glass and aluminum design with USB-C and A16 Bionic chip.",
        "specifications": json.dumps({"processor": "Apple A16 Bionic", "ram": "6GB", "storage": "128GB", "camera": "48MP Main + 12MP Ultra-wide", "display": "6.1-inch Super Retina XDR OLED", "connector": "USB-C"})
    },

    # --- AUDIO & TRUE WIRELESS BUDS (301-308) ---
    {
        "id": 301,
        "name": "Sony WH-1000XM5 Noise-Canceling Headphones",
        "brand": "Sony",
        "category": "Audio & Headphones",
        "price": 26990.0,
        "stock": 16,
        "rating": 4.8,
        "review_count": 48,
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop",
        "description": "Industry standard active noise cancellation powered by dual processors and 8 microphones. Auto NC optimizer, LDAC high resolution audio, and 30 hours battery life.",
        "specifications": json.dumps({"anc": "Auto NC Optimizer with 8 mics", "battery": "30 hours ANC on", "codecs": "LDAC, AAC, SBC", "connectivity": "Bluetooth 5.2 Multipoint"})
    },
    {
        "id": 302,
        "name": "Bose QuietComfort 45",
        "brand": "Bose",
        "category": "Audio & Headphones",
        "price": 21990.0,
        "stock": 14,
        "rating": 4.7,
        "review_count": 34,
        "image_url": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop",
        "description": "Iconic comfort and acoustic noise cancelling technology, plush synthetic leather ear cushions, balanced TriPort acoustics, and 22 hours playback.",
        "specifications": json.dumps({"anc": "Quiet & Aware Modes", "battery": "22 hours", "weight": "240g lightweight", "connectivity": "Bluetooth 5.1"})
    },
    {
        "id": 303,
        "name": "OnePlus Buds Pro 2",
        "brand": "OnePlus",
        "category": "Audio & Headphones",
        "price": 8990.0,
        "stock": 40,
        "rating": 4.6,
        "review_count": 39,
        "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop",
        "description": "Audiophile grade true wireless earbuds co-created with Dynaudio. MelodyBoost dual drivers, smart adaptive noise cancellation up to 48dB, and spatial audio with head tracking.",
        "specifications": json.dumps({"drivers": "11mm woofer + 6mm tweeter", "anc": "48dB Smart Adaptive ANC", "battery": "39 hours with case", "codecs": "LHDC 4.0 Lossless, AAC", "fast_charge": "10 mins gives 10 hours"})
    },
    {
        "id": 304,
        "name": "Anker Soundcore Life Q30",
        "brand": "Anker",
        "category": "Audio & Headphones",
        "price": 5490.0,
        "stock": 50,
        "rating": 4.4,
        "review_count": 29,
        "image_url": "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop",
        "description": "Outstanding value hybrid active noise cancelling headphones with custom 40mm silk-diaphragm drivers, 40 hours playtime with ANC enabled, and app EQ.",
        "specifications": json.dumps({"anc": "Hybrid ANC (Transport, Outdoor, Indoor)", "battery": "40 hours ANC on / 60 hours off", "drivers": "40mm Silk Diaphragm"})
    },
    {
        "id": 305,
        "name": "OnePlus Nord Buds 2r Wireless Earbuds",
        "brand": "OnePlus",
        "category": "Audio & Headphones",
        "price": 2199.0,
        "stock": 55,
        "rating": 4.6,
        "review_count": 44,
        "image_url": "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=600&auto=format&fit=crop",
        "description": "Deep bass sound with 12.4mm extra-large titanium coated dynamic drivers, Dual Mic AI Clear Call noise reduction algorithm, Sound Master Equalizer, up to 38 hours battery life.",
        "specifications": json.dumps({"driver": "12.4mm Titanium Dynamic Driver", "mics": "Dual Mic AI Clear Call", "battery": "38 hours playback with case", "latency": "94ms gaming mode", "rating": "IP55 dust and water resistant"})
    },
    {
        "id": 306,
        "name": "OnePlus Buds 3 Truly Wireless Earbuds",
        "brand": "OnePlus",
        "category": "Audio & Headphones",
        "price": 5499.0,
        "stock": 45,
        "rating": 4.7,
        "review_count": 37,
        "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop",
        "description": "Flagship-level 49dB Smart Adaptive Active Noise Cancellation, dual dynamic drivers with 10.4mm woofer + 6mm tweeter, LHDC 5.0 Hi-Res Audio, up to 44 hours playtime with fast charging.",
        "specifications": json.dumps({"anc": "49dB Smart Adaptive Active Noise Cancellation", "drivers": "Dual Dynamic 10.4mm + 6mm", "codecs": "LHDC 5.0 Hi-Res Audio, AAC, SBC", "battery": "44 hours total playtime", "fast_charge": "10 min charge for 7 hours"})
    },
    {
        "id": 307,
        "name": "Apple AirPods Pro 2nd Gen",
        "brand": "Apple",
        "category": "Audio & Headphones",
        "price": 24900.0,
        "stock": 25,
        "rating": 4.9,
        "review_count": 56,
        "image_url": "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop",
        "description": "Powered by Apple H2 chip with up to 2x more Active Noise Cancellation, Adaptive Audio, Personalized Spatial Audio with dynamic head tracking, and USB-C MagSafe case.",
        "specifications": json.dumps({"chip": "Apple H2 Headphone chip", "anc": "Pro-level Active Noise Cancellation", "battery": "6 hours (30 hours with case)", "features": "Adaptive Transparency, Conversation Awareness", "case": "MagSafe USB-C with Precision Finding"})
    },
    {
        "id": 308,
        "name": "boAt Nirvana Ion ANC True Wireless Earbuds",
        "brand": "boAt",
        "category": "Audio & Headphones",
        "price": 2799.0,
        "stock": 35,
        "rating": 4.5,
        "review_count": 33,
        "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop",
        "description": "Crystal bionic sound with 32dB active noise cancellation, quad mics with ENx technology, beast mode 60ms ultra-low latency, insane 120 hours total playtime.",
        "specifications": json.dumps({"anc": "32dB Active Noise Cancellation", "battery": "120 hours total playtime (24h per charge)", "latency": "60ms Beast Mode", "mics": "Quad Mics with ENx Technology"})
    },

    # --- SMARTWATCHES (501-505) ---
    {
        "id": 501,
        "name": "Apple Watch Series 9 GPS",
        "brand": "Apple",
        "category": "Smartwatches",
        "price": 41900.0,
        "stock": 20,
        "rating": 4.9,
        "review_count": 41,
        "image_url": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop",
        "description": "Powered by S9 SiP with 2000 nits Always-On Retina display, revolutionary Double Tap gesture, Blood Oxygen and ECG apps, crash detection, and water resistance up to 50 meters.",
        "specifications": json.dumps({"display": "Always-On Retina up to 2000 nits", "sensors": "ECG, Blood Oxygen, Heart Rate, Temperature Sensing", "battery": "18 hours all-day (36 hours Low Power)", "water_resistance": "50m swimproof"})
    },
    {
        "id": 502,
        "name": "Samsung Galaxy Watch 6 LTE",
        "brand": "Samsung",
        "category": "Smartwatches",
        "price": 28999.0,
        "stock": 18,
        "rating": 4.7,
        "review_count": 30,
        "image_url": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop",
        "description": "Advanced sleep coaching, comprehensive body composition analysis with BIA sensor, Sapphire Crystal AMOLED display with 20% larger screen and LTE connectivity.",
        "specifications": json.dumps({"display": "Super AMOLED Sapphire Crystal", "sensors": "BioActive Sensor (Optical Heart + ECG + BIA)", "connectivity": "4G LTE + Bluetooth 5.3 + NFC", "os": "Wear OS powered by Samsung"})
    },
    {
        "id": 503,
        "name": "OnePlus Watch 2 with Dual Engine Architecture",
        "brand": "OnePlus",
        "category": "Smartwatches",
        "price": 24999.0,
        "stock": 22,
        "rating": 4.8,
        "review_count": 25,
        "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop",
        "description": "Groundbreaking Dual-Engine Architecture pairing Snapdragon W5 + BES2700 chips. Delivers an astonishing 100-hour battery life in Smart Mode, 1.43-inch AMOLED, Wear OS 4.",
        "specifications": json.dumps({"battery": "Up to 100 hours Smart Mode / 12 days Power Saver", "chips": "Snapdragon W5 Gen 1 + BES2700 Dual Engine", "display": "1.43-inch AMOLED 1000 nits", "gps": "Dual-frequency L1+L5 GPS", "os": "Wear OS 4 by Google"})
    },
    {
        "id": 504,
        "name": "Noise ColorFit Pro 5 AMOLED Smartwatch",
        "brand": "Noise",
        "category": "Smartwatches",
        "price": 3999.0,
        "stock": 40,
        "rating": 4.4,
        "review_count": 27,
        "image_url": "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop",
        "description": "Vibrant 1.85-inch AMOLED display with functional rotating crown, TruSync Bluetooth calling, SOS technology, rapid health suite, and 7-day battery life.",
        "specifications": json.dumps({"display": "1.85-inch AMOLED 600 nits", "calling": "TruSync Bluetooth Calling", "battery": "Up to 7 days battery life", "water_resistance": "IP68 water resistant"})
    },
    {
        "id": 505,
        "name": "boAt Wave Call 2 Bluetooth Calling Smartwatch",
        "brand": "boAt",
        "category": "Smartwatches",
        "price": 1499.0,
        "stock": 60,
        "rating": 4.3,
        "review_count": 35,
        "image_url": "https://images.unsplash.com/photo-1510017803434-a899398421b3?w=600&auto=format&fit=crop",
        "description": "Entry-level powerhouse smartwatch with 1.83-inch HD display, clear Bluetooth calling with dial pad, 700+ active sports modes, and customizable watch faces.",
        "specifications": json.dumps({"display": "1.83-inch HD Display", "calling": "Single Chip BT Calling", "sports_modes": "700+ Active Modes", "battery": "Up to 5 days"})
    },

    # --- TABLETS & IPADS (601-604) ---
    {
        "id": 601,
        "name": "Apple iPad Air M2 11-inch",
        "brand": "Apple",
        "category": "Tablets",
        "price": 59900.0,
        "stock": 16,
        "rating": 4.9,
        "review_count": 29,
        "image_url": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop",
        "description": "Redesigned 11-inch iPad Air supercharged by the Apple M2 chip. Liquid Retina display, landscape 12MP front camera with Center Stage, Apple Pencil Pro support, and all-day battery.",
        "specifications": json.dumps({"chip": "Apple M2 8-core CPU / 9-core GPU", "display": "11-inch Liquid Retina with True Tone", "storage": "128GB High-Speed", "connectivity": "Wi-Fi 6E, USB-C", "pencil": "Supports Apple Pencil Pro"})
    },
    {
        "id": 602,
        "name": "Samsung Galaxy Tab S9 FE",
        "brand": "Samsung",
        "category": "Tablets",
        "price": 34999.0,
        "stock": 20,
        "rating": 4.7,
        "review_count": 24,
        "image_url": "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&auto=format&fit=crop",
        "description": "10.9-inch 90Hz display, bundled IP68 water-resistant S Pen included in box, Vision Booster for outdoor visibility, massive 8000mAh battery, and Samsung DeX desktop mode.",
        "specifications": json.dumps({"display": "10.9-inch 90Hz WQXGA Display", "pen": "Included IP68 S Pen in box", "battery": "8000 mAh with 45W Fast Charging", "durability": "IP68 water and dust resistance", "os": "Android 14 with Samsung DeX"})
    },
    {
        "id": 603,
        "name": "Xiaomi Pad 6 11-inch 144Hz",
        "brand": "Xiaomi",
        "category": "Tablets",
        "price": 26999.0,
        "stock": 25,
        "rating": 4.6,
        "review_count": 31,
        "image_url": "https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=600&auto=format&fit=crop",
        "description": "Productivity and gaming tablet powered by Snapdragon 870, stunning 11-inch 2.8K 144Hz 10-bit display with Dolby Vision, quad stereo speakers, and 8840mAh battery.",
        "specifications": json.dumps({"processor": "Qualcomm Snapdragon 870", "display": "11-inch 2.8K (2880x1800) 144Hz 7-stage refresh rate", "audio": "Quad Speakers with Dolby Atmos", "battery": "8840 mAh + 33W Fast Charging"})
    },
    {
        "id": 604,
        "name": "OnePlus Pad 2 Snapdragon 8 Gen 3",
        "brand": "OnePlus",
        "category": "Tablets",
        "price": 39999.0,
        "stock": 18,
        "rating": 4.8,
        "review_count": 22,
        "image_url": "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&auto=format&fit=crop",
        "description": "Industry-first tablet featuring Snapdragon 8 Gen 3 flagship silicon. 12.1-inch 3K 144Hz 7:5 ReadFit display, 6-speaker sound system, 9510mAh battery with 67W SUPERVOOC.",
        "specifications": json.dumps({"processor": "Snapdragon 8 Gen 3 Flagship", "display": "12.1-inch 3K (3000x2120) 144Hz 7:5 Display", "speakers": "6-Speaker Spatial Audio", "battery": "9510 mAh with 67W SUPERVOOC charging"})
    },

    # --- CAMERAS & GAMING (701-704) ---
    {
        "id": 701,
        "name": "Sony Alpha a6700 Mirrorless Camera",
        "brand": "Sony",
        "category": "Cameras & Gaming",
        "price": 136990.0,
        "stock": 10,
        "rating": 4.9,
        "review_count": 18,
        "image_url": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop",
        "description": "Next-generation APS-C mirrorless camera featuring 26MP Exmor R BSI sensor, AI processing unit for real-time subject recognition autofocus, and 4K 120p video recording.",
        "specifications": json.dumps({"sensor": "26.0MP APS-C format Exmor R CMOS", "video": "4K 120p / 4K 60p 6K oversampled", "af": "AI-powered real-time tracking (human, animal, bird, vehicle)", "stabilization": "5-axis in-body image stabilization"})
    },
    {
        "id": 702,
        "name": "GoPro Hero 12 Black Action Camera",
        "brand": "GoPro",
        "category": "Cameras & Gaming",
        "price": 37990.0,
        "stock": 25,
        "rating": 4.7,
        "review_count": 33,
        "image_url": "https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=600&auto=format&fit=crop",
        "description": "Best-in-class 5.3K 60fps HDR video, HyperSmooth 6.0 stabilization with 360 Horizon Lock, rugged waterproof build up to 33ft, and Bluetooth audio support for AirPods/mics.",
        "specifications": json.dumps({"video": "5.3K60 / 4K120 / 2.7K240", "stabilization": "HyperSmooth 6.0 with AutoBoost", "waterproof": "10m (33ft) without housing", "battery": "Enduro Battery with 2x longer runtime"})
    },
    {
        "id": 703,
        "name": "Sony PlayStation 5 Slim Console",
        "brand": "Sony",
        "category": "Cameras & Gaming",
        "price": 49990.0,
        "stock": 20,
        "rating": 4.9,
        "review_count": 65,
        "image_url": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop",
        "description": "Next-gen gaming console with custom AMD Zen 2 CPU, RDNA 2 GPU, ultra-high speed 1TB SSD, Ray Tracing, 4K 120Hz output, Tempest 3D AudioTech, and DualSense haptic feedback.",
        "specifications": json.dumps({"storage": "1TB Custom High-Speed NVMe SSD", "graphics": "AMD RDNA 2 with Ray Tracing up to 4K 120Hz", "controller": "DualSense with Haptic Feedback & Adaptive Triggers", "audio": "Tempest 3D AudioTech"})
    },
    {
        "id": 704,
        "name": "ASUS ROG Ally Z1 Extreme Handheld Gaming",
        "brand": "ASUS",
        "category": "Cameras & Gaming",
        "price": 59990.0,
        "stock": 15,
        "rating": 4.6,
        "review_count": 27,
        "image_url": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop",
        "description": "Windows 11 portable PC gaming console driven by AMD Ryzen Z1 Extreme with RDNA 3 graphics. 7-inch FHD 120Hz FreeSync Premium display and ergonomic controls.",
        "specifications": json.dumps({"processor": "AMD Ryzen Z1 Extreme (8 cores, 16 threads, up to 5.1 GHz)", "graphics": "AMD Radeon RDNA 3 with 12 CUs", "ram": "16GB LPDDR5", "storage": "512GB PCIe 4.0 NVMe SSD", "display": "7-inch FHD 120Hz 500 nits"})
    },

    # --- SMART GADGET ACCESSORIES (401-406) ---
    {
        "id": 401,
        "name": "Waterproof Laptop Sleeve Case 15.6-inch",
        "brand": "Lenovo",
        "category": "Accessories",
        "price": 1299.0,
        "stock": 50,
        "rating": 4.4,
        "review_count": 18,
        "image_url": "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop",
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
        "image_url": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop",
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
        "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop",
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
        "image_url": "https://images.unsplash.com/photo-1616353071588-708dcff912e2?w=600&auto=format&fit=crop",
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
        "image_url": "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600&auto=format&fit=crop",
        "description": "Aluminum 7-in-1 USB Type-C hub adapter featuring 4K HDMI, 3x USB 3.0 ports, SD/microSD card slots, and 100W Power Delivery pass-through.",
        "specifications": json.dumps({"ports": "1x HDMI 4K@30Hz, 3x USB 3.0, SD, microSD, 100W PD", "material": "Aluminum Alloy"})
    },
    {
        "id": 406,
        "name": "20000mAh 65W Fast Charging Power Bank",
        "brand": "Mi",
        "category": "Accessories",
        "price": 2999.0,
        "stock": 45,
        "rating": 4.7,
        "review_count": 38,
        "image_url": "https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=600&auto=format&fit=crop",
        "description": "High-capacity 20000mAh power bank delivering 65W Power Delivery output capable of charging laptops, tablets, and smartphones simultaneously.",
        "specifications": json.dumps({"capacity": "20000 mAh 74Wh", "output": "65W USB-C PD 3.0 + 18W USB-A", "ports": "1x Type-C, 2x Type-A", "pass_through": "Supported"})
    }
]

def seed_all():
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    print(f"Connecting to DB and upserting {len(ALL_GADGETS)} total electronic gadgets...")
    for g in ALL_GADGETS:
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
    print(f"PostgreSQL updated! Total electronic gadgets in DB: {total_db}")
    cur.close()
    conn.close()

    # Update seed_products.json
    seed_json_path = os.path.join(os.path.dirname(__file__), "..", "data", "seed_products.json")
    with open(seed_json_path, "w", encoding="utf-8") as f:
        json.dump(ALL_GADGETS, f, indent=2)
    print(f"Updated {seed_json_path} with all {len(ALL_GADGETS)} electronic gadgets.")

if __name__ == "__main__":
    seed_all()
