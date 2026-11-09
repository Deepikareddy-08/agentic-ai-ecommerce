import json
import os
import psycopg2

DB_URL = os.getenv("DATABASE_URL", "postgresql://postgres:deepika08@localhost:5432/ecommerce_db")

NEW_PRODUCTS = [
    # =========================================================================
    # 1. SMART TVs & HOME ENTERTAINMENT (801 - 815)
    # =========================================================================
    {
        "id": 801,
        "name": "LG C3 55-inch 4K OLED evo Smart TV",
        "brand": "LG",
        "category": "Smart TVs & Home Entertainment",
        "price": 119990.0,
        "stock": 14,
        "rating": 4.9,
        "review_count": 68,
        "image_url": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop",
        "description": "Benchmark OLED evo display powered by alpha9 AI Processor Gen6. Infinite contrast, 100% color fidelity, Dolby Vision IQ, and 4x HDMI 2.1 ports with 120Hz VRR for gaming.",
        "specifications": json.dumps({"screen_size": "55-inch", "display_tech": "4K OLED evo", "refresh_rate": "120Hz", "processor": "alpha9 AI 4K Gen6", "hdr": "Dolby Vision, HDR10, HLG", "audio": "40W 2.2ch Dolby Atmos", "hdmi_ports": "4x HDMI 2.1", "os": "webOS 23"})
    },
    {
        "id": 802,
        "name": "Sony Bravia XR 65-inch 4K HDR Google TV A80L",
        "brand": "Sony",
        "category": "Smart TVs & Home Entertainment",
        "price": 184990.0,
        "stock": 9,
        "rating": 4.9,
        "review_count": 52,
        "image_url": "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&auto=format&fit=crop",
        "description": "Cognitive Processor XR delivers pure OLED contrast and authentic Acoustic Surface Audio+ where sound comes directly from the screen. Perfect for PS5 and cinema enthusiasts.",
        "specifications": json.dumps({"screen_size": "65-inch", "display_tech": "Cognitive OLED", "refresh_rate": "120Hz", "processor": "Cognitive Processor XR", "hdr": "Dolby Vision, HDR10", "audio": "Acoustic Surface Audio+ (50W)", "os": "Google TV"})
    },
    {
        "id": 803,
        "name": "Samsung Neo QLED 65-inch 4K QN90C Smart TV",
        "brand": "Samsung",
        "category": "Smart TVs & Home Entertainment",
        "price": 159990.0,
        "stock": 11,
        "rating": 4.8,
        "review_count": 44,
        "image_url": "https://images.unsplash.com/photo-1558888401-3cc1de77652d?w=600&auto=format&fit=crop",
        "description": "Quantum Matrix Technology with ultra-precise Mini LED backlighting. Stunning 2000 nits peak brightness, anti-glare screen, Neural Quantum Processor 4K, and Dolby Atmos.",
        "specifications": json.dumps({"screen_size": "65-inch", "display_tech": "Neo QLED Mini LED", "refresh_rate": "120Hz (Up to 144Hz)", "processor": "Neural Quantum Processor 4K", "audio": "60W 4.2.2ch OTS+", "os": "Tizen OS"})
    },
    {
        "id": 804,
        "name": "Xiaomi Smart TV X Pro 55-inch 4K Google TV",
        "brand": "Xiaomi",
        "category": "Smart TVs & Home Entertainment",
        "price": 41999.0,
        "stock": 25,
        "rating": 4.5,
        "review_count": 89,
        "image_url": "https://images.unsplash.com/photo-1461151304267-38535e780c79?w=600&auto=format&fit=crop",
        "description": "Premium metallic bezel-less design with 4K HDR10+ and Dolby Vision IQ. Vivid Picture Engine 2, Google TV with hands-free Google Assistant, and 30W Dolby Atmos speakers.",
        "specifications": json.dumps({"screen_size": "55-inch", "display_tech": "4K UHD LED", "refresh_rate": "60Hz MEMC", "hdr": "Dolby Vision IQ, HDR10+", "audio": "30W Dolby Atmos / DTS:X", "ram_storage": "2GB RAM, 16GB Storage", "os": "Google TV"})
    },
    {
        "id": 805,
        "name": "TCL 55-inch 4K QLED Google TV T6G",
        "brand": "TCL",
        "category": "Smart TVs & Home Entertainment",
        "price": 37990.0,
        "stock": 20,
        "rating": 4.4,
        "review_count": 63,
        "image_url": "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&auto=format&fit=crop",
        "description": "Quantum Dot technology offering over 1 billion colors with 94% DCI-P3 color volume. AiPQ Engine 3.0, Dolby Atmos, and AMD FreeSync for smooth everyday viewing and gaming.",
        "specifications": json.dumps({"screen_size": "55-inch", "display_tech": "Quantum Dot QLED", "refresh_rate": "60Hz", "processor": "AiPQ Engine 3.0", "audio": "56W with Dolby Atmos", "ports": "3x HDMI, 2x USB", "os": "Google TV"})
    },
    {
        "id": 806,
        "name": "Apple TV 4K (3rd Gen) 128GB Wi-Fi + Ethernet",
        "brand": "Apple",
        "category": "Smart TVs & Home Entertainment",
        "price": 16900.0,
        "stock": 35,
        "rating": 4.9,
        "review_count": 78,
        "image_url": "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600&auto=format&fit=crop",
        "description": "Powered by the blazing-fast A15 Bionic chip. Supports 4K Dolby Vision, HDR10+, Dolby Atmos cinematic audio, Thread mesh networking, and Siri Remote with USB-C.",
        "specifications": json.dumps({"processor": "Apple A15 Bionic", "storage": "128GB NVMe", "video_output": "4K Dolby Vision, HDR10+", "audio_support": "Dolby Atmos 5.1 / 7.1", "connectivity": "Wi-Fi 6, Gigabit Ethernet, Bluetooth 5.0, Thread", "os": "tvOS 17"})
    },
    {
        "id": 807,
        "name": "Amazon Fire TV Stick 4K Max with Wi-Fi 6E",
        "brand": "Amazon",
        "category": "Smart TVs & Home Entertainment",
        "price": 6499.0,
        "stock": 45,
        "rating": 4.7,
        "review_count": 115,
        "image_url": "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600&auto=format&fit=crop",
        "description": "Amazon's most powerful streaming stick with 2.0 GHz quad-core processor and Wi-Fi 6E support. Fire TV Ambient Experience, Dolby Vision, Dolby Atmos, and 16GB storage.",
        "specifications": json.dumps({"processor": "2.0 GHz Quad-core", "storage": "16GB", "connectivity": "Wi-Fi 6E Tri-band, Bluetooth 5.2", "resolution": "4K Ultra HD up to 60fps", "hdr": "Dolby Vision, HDR10+, HLG", "audio": "Dolby Atmos"})
    },
    {
        "id": 808,
        "name": "Sony HT-S40R 5.1ch Dolby Digital Home Theatre Soundbar",
        "brand": "Sony",
        "category": "Smart TVs & Home Entertainment",
        "price": 26990.0,
        "stock": 19,
        "rating": 4.6,
        "review_count": 92,
        "image_url": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop",
        "description": "600W total power output with authentic 5.1 channel surround sound. Features a 3-channel soundbar, wireless rear speakers, and a dedicated external subwoofer.",
        "specifications": json.dumps({"power_output": "600 Watts", "channels": "5.1 Surround Sound", "speakers": "Soundbar + Wireless Rear + Subwoofer", "connectivity": "Bluetooth, HDMI ARC, Optical, USB", "audio_format": "Dolby Digital"})
    },
    {
        "id": 809,
        "name": "JBL Bar 500 5.1 Channel Soundbar with Dolby Atmos",
        "brand": "JBL",
        "category": "Smart TVs & Home Entertainment",
        "price": 49999.0,
        "stock": 12,
        "rating": 4.8,
        "review_count": 41,
        "image_url": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop",
        "description": "590W total output with MultiBeam technology and 3D Dolby Atmos surround. Includes a booming 10-inch wireless subwoofer, AirPlay, Alexa Multi-Room, and Chromecast built-in.",
        "specifications": json.dumps({"total_power": "590W", "subwoofer": "10-inch Wireless Bass", "sound_tech": "Dolby Atmos & MultiBeam", "connectivity": "Wi-Fi, AirPlay, Chromecast, HDMI eARC", "channels": "5.1"})
    },
    {
        "id": 810,
        "name": "Samsung The Freestyle 2nd Gen Smart Portable Projector",
        "brand": "Samsung",
        "category": "Smart TVs & Home Entertainment",
        "price": 59990.0,
        "stock": 15,
        "rating": 4.6,
        "review_count": 33,
        "image_url": "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop",
        "description": "180-degree dynamic angle projector projecting up to 100 inches on any wall or ceiling. Instant auto-focus, auto-leveling keystone, 360-degree sound, and full Tizen Smart TV experience.",
        "specifications": json.dumps({"projection_size": "30 to 100 inches", "resolution": "Full HD 1080p HDR10", "brightness": "230 ANSI Lumens", "audio": "360-degree 5W Speaker", "smart_os": "Tizen Smart TV", "weight": "0.8 kg"})
    },

    # =========================================================================
    # 2. PC & GAMING COMPONENTS (901 - 915)
    # =========================================================================
    {
        "id": 901,
        "name": "Samsung Odyssey OLED G9 49-inch Curved Gaming Monitor",
        "brand": "Samsung",
        "category": "PC & Gaming Components",
        "price": 129990.0,
        "stock": 7,
        "rating": 4.9,
        "review_count": 27,
        "image_url": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop",
        "description": "Colossal 49-inch Dual QHD (5120x1440) 32:9 curved OLED monitor. Ultra-fast 240Hz refresh rate, 0.03ms response time, Neo Quantum Processor Pro, and DisplayHDR True Black 400.",
        "specifications": json.dumps({"screen_size": "49-inch 1800R Curved", "resolution": "Dual QHD (5120x1440)", "panel": "OLED", "refresh_rate": "240Hz", "response_time": "0.03ms (GtG)", "hdr": "VESA DisplayHDR True Black 400", "ports": "HDMI 2.1, Micro HDMI, DisplayPort 1.4, USB Hub"})
    },
    {
        "id": 902,
        "name": "LG UltraGear 27GR95QE 27-inch 240Hz QHD OLED Gaming Monitor",
        "brand": "LG",
        "category": "PC & Gaming Components",
        "price": 69990.0,
        "stock": 16,
        "rating": 4.8,
        "review_count": 48,
        "image_url": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop",
        "description": "World-class competitive esports monitor. 27-inch QHD (2560x1440) OLED display, blazing 240Hz refresh, 0.03ms response time, 98.5% DCI-P3 color gamut, NVIDIA G-Sync Compatible.",
        "specifications": json.dumps({"screen_size": "27-inch Flat", "resolution": "QHD (2560x1440)", "panel": "OLED Anti-Glare", "refresh_rate": "240Hz", "response_time": "0.03ms", "sync": "NVIDIA G-Sync & AMD FreeSync Premium Pro"})
    },
    {
        "id": 903,
        "name": "NVIDIA GeForce RTX 4080 Super 16GB Founders Edition",
        "brand": "NVIDIA",
        "category": "PC & Gaming Components",
        "price": 105000.0,
        "stock": 8,
        "rating": 4.9,
        "review_count": 39,
        "image_url": "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop",
        "description": "Ada Lovelace architecture powerhouse with 10,240 CUDA cores, 16GB GDDR6X VRAM on 256-bit bus, DLSS 3.5 Frame Generation, and unmatched 4K ray tracing performance.",
        "specifications": json.dumps({"cuda_cores": "10,240", "vram": "16GB GDDR6X", "memory_bus": "256-bit", "boost_clock": "2550 MHz", "tdp": "320W", "interface": "PCIe 4.0 x16", "outputs": "1x HDMI 2.1a, 3x DisplayPort 1.4a"})
    },
    {
        "id": 904,
        "name": "ASUS ROG Strix GeForce RTX 4070 Ti Super 16GB OC",
        "brand": "ASUS",
        "category": "PC & Gaming Components",
        "price": 89990.0,
        "stock": 12,
        "rating": 4.8,
        "review_count": 31,
        "image_url": "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop",
        "description": "Massive 3.15-slot cooling with Axial-tech fans, vented exoskeleton, and Dual BIOS. Features 16GB VRAM and 8,448 CUDA cores for 1440p and 4K ultra gaming.",
        "specifications": json.dumps({"cuda_cores": "8,448", "vram": "16GB GDDR6X", "clock": "2670 MHz (OC Mode)", "cooling": "Triple Axial-Tech Fans", "power": "285W (1x 16-pin)"})
    },
    {
        "id": 905,
        "name": "AMD Ryzen 7 7800X3D Desktop Processor (8-Core, 16-Thread)",
        "brand": "AMD",
        "category": "PC & Gaming Components",
        "price": 38990.0,
        "stock": 22,
        "rating": 4.9,
        "review_count": 76,
        "image_url": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&auto=format&fit=crop",
        "description": "The undisputed king of gaming processors with AMD 3D V-Cache technology. 8 cores, 16 threads, 104MB total cache, boost clock up to 5.0 GHz on socket AM5 platform.",
        "specifications": json.dumps({"cores_threads": "8 Cores / 16 Threads", "base_boost_clock": "4.2 GHz / 5.0 GHz", "l3_cache": "96MB 3D V-Cache (104MB total)", "socket": "AM5", "tdp": "120W", "memory_support": "DDR5"})
    },
    {
        "id": 906,
        "name": "Intel Core i7-14700K 14th Gen Desktop Processor",
        "brand": "Intel",
        "category": "PC & Gaming Components",
        "price": 39990.0,
        "stock": 18,
        "rating": 4.7,
        "review_count": 45,
        "image_url": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&auto=format&fit=crop",
        "description": "Hybrid architecture with 20 cores (8 Performance + 12 Efficient) and 28 threads. Max turbo boost frequency up to 5.6 GHz, unlocked multiplier, PCIe 5.0, and DDR5 support.",
        "specifications": json.dumps({"cores_threads": "20 Cores (8P + 12E) / 28 Threads", "max_turbo": "Up to 5.6 GHz", "smart_cache": "33MB Intel Smart Cache", "socket": "LGA 1700", "base_power": "125W (253W Turbo)"})
    },
    {
        "id": 907,
        "name": "Samsung 990 PRO 2TB PCIe Gen4 NVMe M.2 SSD with Heatsink",
        "brand": "Samsung",
        "category": "PC & Gaming Components",
        "price": 18490.0,
        "stock": 35,
        "rating": 4.9,
        "review_count": 82,
        "image_url": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop",
        "description": "Blistering read speeds up to 7,450 MB/s and write speeds up to 6,900 MB/s. Custom slim heatsink prevents thermal throttling, fully compatible with PlayStation 5 and high-end PCs.",
        "specifications": json.dumps({"capacity": "2TB", "interface": "PCIe Gen 4.0 x4, NVMe 2.0", "sequential_read": "Up to 7,450 MB/s", "sequential_write": "Up to 6,900 MB/s", "form_factor": "M.2 2280 with Heatsink", "tbw": "1200 TBW"})
    },
    {
        "id": 908,
        "name": "Corsair Dominator Titanium RGB 32GB (2x16GB) DDR5 6000MHz",
        "brand": "Corsair",
        "category": "PC & Gaming Components",
        "price": 19990.0,
        "stock": 19,
        "rating": 4.8,
        "review_count": 29,
        "image_url": "https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&auto=format&fit=crop",
        "description": "Precision forged aluminum heatspreader with swappable top bars and 11 vibrant CAPELLIX RGB LEDs per module. Intel XMP 3.0 certified with tight CL30 timings.",
        "specifications": json.dumps({"capacity": "32GB (2 x 16GB)", "speed": "DDR5 6000 MT/s", "timings": "CL30-36-36-76", "voltage": "1.40V", "profiles": "Intel XMP 3.0 & AMD EXPO"})
    },
    {
        "id": 909,
        "name": "Corsair RM850x 850W 80 PLUS Gold Fully Modular Power Supply",
        "brand": "Corsair",
        "category": "PC & Gaming Components",
        "price": 12490.0,
        "stock": 25,
        "rating": 4.9,
        "review_count": 71,
        "image_url": "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop",
        "description": "80 PLUS Gold efficiency certification delivering 90%+ efficiency. 100% all Japanese 105C capacitors, magnetic levitation fan with Zero RPM quiet mode, and 10-year warranty.",
        "specifications": json.dumps({"wattage": "850 Watts", "efficiency": "80 PLUS Gold Certified", "modularity": "Fully Modular", "fan_size": "135mm Magnetic Levitation", "warranty": "10 Years"})
    },
    {
        "id": 910,
        "name": "NZXT Kraken Elite 360 RGB Liquid CPU Cooler",
        "brand": "NZXT",
        "category": "PC & Gaming Components",
        "price": 24990.0,
        "stock": 14,
        "rating": 4.7,
        "review_count": 36,
        "image_url": "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop",
        "description": "High-performance AIO liquid cooler with a 2.36-inch wide-angle 640x640 LCD display for showing real-time system temperatures or custom animated GIFs. Asetek pump with 3x F120 RGB Core fans.",
        "specifications": json.dumps({"radiator_size": "360mm", "fans": "3x F120 RGB Core Fans (500-1800 RPM)", "display": "2.36-inch TFT LCD (640x640 60Hz)", "sockets": "Intel LGA 1700/1200, AMD AM5/AM4"})
    },

    # =========================================================================
    # 3. SMART HOME & AUTOMATION (1001 - 1012)
    # =========================================================================
    {
        "id": 1001,
        "name": "Amazon Echo Show 10 (3rd Gen) HD Smart Display with Motion",
        "brand": "Amazon",
        "category": "Smart Home & Automation",
        "price": 24999.0,
        "stock": 20,
        "rating": 4.7,
        "review_count": 84,
        "image_url": "https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&auto=format&fit=crop",
        "description": "10.1-inch HD smart display designed to move with you during video calls, recipe following, and streaming. Built-in Zigbee smart home hub, 13MP camera with auto-framing, and premium directional sound.",
        "specifications": json.dumps({"screen": "10.1-inch Touchscreen HD (1280x800)", "motion": "Brushless motor with 360-degree rotation", "camera": "13MP with auto-framing and shutter", "audio": "2.1 System (2x 1-inch tweeters + 3-inch woofer)", "hub": "Built-in Zigbee + Matter"})
    },
    {
        "id": 1002,
        "name": "Google Nest Hub (2nd Gen) Smart Home Display with Sleep Sensing",
        "brand": "Google",
        "category": "Smart Home & Automation",
        "price": 7999.0,
        "stock": 32,
        "rating": 4.6,
        "review_count": 96,
        "image_url": "https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&auto=format&fit=crop",
        "description": "The center of your helpful home. 7-inch edgeless glass display, 50% more bass speaker, Soli radar Sleep Sensing without cameras, and unified control of thousands of smart devices.",
        "specifications": json.dumps({"display": "7-inch Touchscreen (1024x600)", "speaker": "Full-range 1.7-inch driver", "mics": "3 Far-field microphones", "sensors": "Soli Radar, Ambient EQ Light Sensor", "connectivity": "Wi-Fi, Bluetooth 5.0, Matter"})
    },
    {
        "id": 1003,
        "name": "Apple HomePod (2nd Gen) High-Fidelity Smart Speaker",
        "brand": "Apple",
        "category": "Smart Home & Automation",
        "price": 32900.0,
        "stock": 17,
        "rating": 4.8,
        "review_count": 55,
        "image_url": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop",
        "description": "Acoustic engineering powerhouse with high-excursion woofer and beamforming array of five horn-loaded tweeters. Spatial Audio with Dolby Atmos, room sensing, and built-in temperature/humidity sensors.",
        "specifications": json.dumps({"audio_drivers": "4-inch High-excursion Woofer + 5 Tweeters", "sound": "Spatial Audio Dolby Atmos, Room Sensing", "processor": "Apple S7", "sensors": "Temperature & Humidity sensor, Sound Recognition", "connectivity": "Thread, Matter, Wi-Fi, AirPlay 2"})
    },
    {
        "id": 1004,
        "name": "Roborock S8 Pro Ultra Robot Vacuum and Sonic Mop",
        "brand": "Roborock",
        "category": "Smart Home & Automation",
        "price": 109990.0,
        "stock": 8,
        "rating": 4.9,
        "review_count": 42,
        "image_url": "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=600&auto=format&fit=crop",
        "description": "The ultimate hands-free cleaning dock. RockDock Ultra self-empties, self-washes, self-dries with warm air, and auto-refills water tank. 6000Pa extreme suction, VibraRise 2.0 mopping, and Reactive 3D obstacle avoidance.",
        "specifications": json.dumps({"suction_power": "6000 Pa Extreme Suction", "docking_station": "Self-washing, self-drying, self-emptying, self-refilling", "navigation": "PreciSense LiDAR + Reactive 3D Obstacle Avoidance", "mopping": "VibraRise 2.0 Sonic Mopping (3000 scrubs/min)", "battery": "5200 mAh (Up to 180 mins)"})
    },
    {
        "id": 1005,
        "name": "Ecovacs Deebot T20 Omni Robot Vacuum Cleaner",
        "brand": "Ecovacs",
        "category": "Smart Home & Automation",
        "price": 79990.0,
        "stock": 11,
        "rating": 4.7,
        "review_count": 35,
        "image_url": "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=600&auto=format&fit=crop",
        "description": "First robot vacuum with 55C hot water mop washing technology. 6000Pa suction power, auto-lift mop (9mm) on carpets, TrueMapping 2.0 navigation, and YIKO AI voice assistant.",
        "specifications": json.dumps({"suction": "6000 Pa", "mop_washing": "55 deg C Hot Water Wash + Hot Air Dry", "auto_lift": "9mm Auto Mop Lift on Carpets", "navigation": "TrueDetect 3D 3.0 + TrueMapping 2.0", "station": "All-in-One OMNI Station"})
    },
    {
        "id": 1006,
        "name": "TP-Link Tapo C320WS 2K QHD Outdoor Security Camera",
        "brand": "TP-Link",
        "category": "Smart Home & Automation",
        "price": 3899.0,
        "stock": 40,
        "rating": 4.6,
        "review_count": 128,
        "image_url": "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop",
        "description": "Crystal-clear 2K QHD (2560x1440) resolution with F1.6 large aperture and starlight sensor for full-color night vision even in pitch dark. IP66 weatherproof, two-way audio, and AI motion detection.",
        "specifications": json.dumps({"resolution": "2K QHD (2560x1440)", "night_vision": "Full-Color Starlight Night Vision with spotlights", "weatherproof": "IP66 Water & Dust Resistant", "audio": "Two-Way Audio with siren alarm", "storage": "MicroSD up to 512GB & Cloud"})
    },
    {
        "id": 1007,
        "name": "Philips Hue White & Color Ambiance Smart LED Starter Kit",
        "brand": "Philips",
        "category": "Smart Home & Automation",
        "price": 12999.0,
        "stock": 25,
        "rating": 4.8,
        "review_count": 73,
        "image_url": "https://images.unsplash.com/photo-1550524514-9b691097e3f8?w=600&auto=format&fit=crop",
        "description": "Transform your home lighting with 16 million colors and 50,000 shades of warm-to-cool white light. Includes 3 smart bulbs, Hue Bridge hub, and Smart Button. Syncs with music, movies, and games.",
        "specifications": json.dumps({"bulbs_included": "3x E27 Color Ambiance Bulbs (1100 lumens each)", "hub": "Hue Bridge Hub included", "controls": "Hue App, Alexa, Google Assistant, Apple HomeKit", "features": "Music & TV Screen Sync, Timers, Geofencing"})
    },
    {
        "id": 1008,
        "name": "Dyson Purifier Cool Gen1 TP10 Smart Air Purifier & Fan",
        "brand": "Dyson",
        "category": "Smart Home & Automation",
        "price": 32900.0,
        "stock": 14,
        "rating": 4.7,
        "review_count": 49,
        "image_url": "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format&fit=crop",
        "description": "Sealed HEPA H13 filtration captures 99.95% of ultrafine particles as small as 0.1 microns. Air Multiplier technology projects 290 liters of purified air per second throughout the room.",
        "specifications": json.dumps({"filtration": "360-degree HEPA H13 + Activated Carbon Filter", "airflow": "Air Multiplier Tech (up to 290 L/s)", "oscillation": "Adjustable up to 350 degrees", "sensors": "Real-time PM2.5, PM10 air quality display", "modes": "Auto Mode, Sleep Mode, 10 fan speeds"})
    },

    # =========================================================================
    # 4. KITCHEN & HOME APPLIANCES (1101 - 1108)
    # =========================================================================
    {
        "id": 1101,
        "name": "Philips Digital Airfryer HD9252 with Rapid Air Technology",
        "brand": "Philips",
        "category": "Kitchen & Home Appliances",
        "price": 8999.0,
        "stock": 35,
        "rating": 4.8,
        "review_count": 140,
        "image_url": "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop",
        "description": "Cook delicious crispy food with up to 90% less fat. Patented Starfish design Rapid Air technology, digital touch screen with 7 preset cooking programs, and 4.1L capacity.",
        "specifications": json.dumps({"capacity": "4.1 Liters (0.8 kg food)", "power": "1400 Watts", "tech": "Rapid Air Starfish Technology", "presets": "7 one-touch cooking presets", "temperature": "60C to 200C", "cleaning": "QuickClean dishwasher safe basket"})
    },
    {
        "id": 1102,
        "name": "Instant Pot Duo 7-in-1 Electric Pressure Cooker 6 Quart",
        "brand": "Instant Pot",
        "category": "Kitchen & Home Appliances",
        "price": 9999.0,
        "stock": 28,
        "rating": 4.9,
        "review_count": 185,
        "image_url": "https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?w=600&auto=format&fit=crop",
        "description": "Combines 7 kitchen appliances in one: Pressure Cooker, Slow Cooker, Rice Cooker, Steamer, Saute Pan, Yogurt Maker, and Food Warmer. Cooks up to 70% faster with 13 smart one-touch programs.",
        "specifications": json.dumps({"capacity": "6 Quarts (5.7 Liters)", "power": "1000 Watts", "functions": "7-in-1 Multi-Cooker", "inner_pot": "Food-grade 304 Stainless Steel (Tri-ply bottom)", "safety": "10+ proven safety mechanisms"})
    },
    {
        "id": 1103,
        "name": "Breville Barista Express Espresso Machine BES870XL",
        "brand": "Breville",
        "category": "Kitchen & Home Appliances",
        "price": 64990.0,
        "stock": 10,
        "rating": 4.9,
        "review_count": 62,
        "image_url": "https://images.unsplash.com/photo-1517668808822-9ebb02ae2a0e?w=600&auto=format&fit=crop",
        "description": "Create third-wave specialty espresso at home with integrated conical burr grinder delivering on-demand dose grinding. Digital PID temperature control and powerful microfoam milk steam wand.",
        "specifications": json.dumps({"pump_pressure": "15 Bar Italian Pump", "heating": "1600W Thermocoil Heating System with PID", "grinder": "Integrated Stainless Steel Conical Burr Grinder", "water_tank": "2.0 Liters (67 fl.oz)", "steam_wand": "Manual Microfoam Milk Texturing"})
    },
    {
        "id": 1104,
        "name": "De'Longhi Magnifica S Fully Automatic Coffee Machine",
        "brand": "De'Longhi",
        "category": "Kitchen & Home Appliances",
        "price": 49990.0,
        "stock": 12,
        "rating": 4.8,
        "review_count": 48,
        "image_url": "https://images.unsplash.com/photo-1517668808822-9ebb02ae2a0e?w=600&auto=format&fit=crop",
        "description": "Bean-to-cup convenience at the touch of a button. Silent integrated grinder with 13 grind settings, adjustable coffee strength and length, twin-shot brewing, and manual cappuccino system.",
        "specifications": json.dumps({"type": "Bean-to-Cup Automatic", "pressure": "15 Bar", "grind_levels": "13 Adjustable Settings", "water_tank": "1.8 Liters Removable", "milk_frother": "Advanced Cappuccino System"})
    },
    {
        "id": 1105,
        "name": "Nutribullet Pro 900W High-Speed Nutrient Extractor Blender",
        "brand": "Nutribullet",
        "category": "Kitchen & Home Appliances",
        "price": 6499.0,
        "stock": 38,
        "rating": 4.7,
        "review_count": 110,
        "image_url": "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&auto=format&fit=crop",
        "description": "Powerful 900-watt motor breaks down tough ingredients like seeds, kale, and whole fruits into silky smooth smoothies in under 60 seconds. Includes extractor blade and 2 colossal cups.",
        "specifications": json.dumps({"motor_power": "900 Watts", "blades": "Stainless Steel Extractor Blades", "capacity": "900ml & 700ml BPA-free Cups", "usage": "Smoothies, nut butters, dips, shakes"})
    },
    {
        "id": 1106,
        "name": "Dyson V15 Detect Extra Cordless Vacuum Cleaner",
        "brand": "Dyson",
        "category": "Kitchen & Home Appliances",
        "price": 62900.0,
        "stock": 9,
        "rating": 4.9,
        "review_count": 51,
        "image_url": "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&auto=format&fit=crop",
        "description": "Dyson's most powerful, intelligent cordless vacuum. Fluffy Optic cleaner head reveals invisible dust on hard floors, acoustic piezo sensor calculates particle sizes in real time, and 240AW fade-free suction.",
        "specifications": json.dumps({"suction_power": "240 Air Watts", "filtration": "Whole-machine HEPA filtration (99.99% of 0.1um)", "run_time": "Up to 60 minutes", "dustbin": "0.77 Liters with point-and-shoot emptying", "laser_detect": "Fluffy Optic Illumination"})
    },

    # =========================================================================
    # 5. PERSONAL CARE ELECTRONICS (1201 - 1206)
    # =========================================================================
    {
        "id": 1201,
        "name": "Dyson Supersonic Hair Dryer with Intelligent Heat Control",
        "brand": "Dyson",
        "category": "Personal Care Electronics",
        "price": 37900.0,
        "stock": 16,
        "rating": 4.9,
        "review_count": 79,
        "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop",
        "description": "Engineered for fast drying with no extreme heat damage. Powered by the Dyson V9 digital motor with Air Multiplier technology, smart microprocessor temperature regulation, and 5 magnetic styling attachments.",
        "specifications": json.dumps({"motor": "Dyson Digital Motor V9 (110,000 RPM)", "power": "1600 Watts", "heat_settings": "4 precise heat settings (28C to 100C)", "speed_settings": "3 speed settings", "attachments": "Flyaway, Styling Concentrator, Diffuser, Gentle Air, Wide-Tooth Comb"})
    },
    {
        "id": 1202,
        "name": "Philips Sonicare DiamondClean 9000 Smart Electric Toothbrush",
        "brand": "Philips",
        "category": "Personal Care Electronics",
        "price": 14999.0,
        "stock": 22,
        "rating": 4.8,
        "review_count": 64,
        "image_url": "https://images.unsplash.com/photo-1559591937-e1032c525f0c?w=600&auto=format&fit=crop",
        "description": "Removes up to 10x more plaque than a manual toothbrush. Sonic technology with 62,000 brush movements per minute, pressure sensor alerts, 4 brushing modes with 3 intensities, and glass wireless charging.",
        "specifications": json.dumps({"speed": "Up to 62,000 brush movements/min", "modes": "Clean, White+, Gum Health, Deep Clean+", "battery_life": "14 days per charge", "charging": "Wireless Glass Charger + USB Travel Case", "bluetooth": "Sonicare Connected App"})
    },
    {
        "id": 1203,
        "name": "Oral-B iO Series 9 Rechargeable Electric Toothbrush",
        "brand": "Oral-B",
        "category": "Personal Care Electronics",
        "price": 18999.0,
        "stock": 15,
        "rating": 4.8,
        "review_count": 47,
        "image_url": "https://images.unsplash.com/photo-1559591937-e1032c525f0c?w=600&auto=format&fit=crop",
        "description": "Revolutionary magnetic iO technology combines round brush head with micro-vibrations for professional clean feel. 3D Teeth Tracking with AI recognition, interactive color display, and smart pressure sensor.",
        "specifications": json.dumps({"technology": "Magnetic iO Micro-vibrations", "tracking": "3D Teeth Tracking with 16 zone AI mapping", "modes": "7 Smart Brushing Modes", "display": "Interactive Color Display", "charging": "Magnetic Fast Charger (3 hours)"})
    },
    {
        "id": 1204,
        "name": "Braun Series 9 Pro Electric Shaver with SmartCare Center",
        "brand": "Braun",
        "category": "Personal Care Electronics",
        "price": 27990.0,
        "stock": 11,
        "rating": 4.9,
        "review_count": 38,
        "image_url": "https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&auto=format&fit=crop",
        "description": "World's most efficient electric shaver redefined with innovative ProHead and unique ProLift trimmer to cut 1, 3, or 7-day beards gently. Sonic Technology delivers 10,000 micro-vibrations per minute.",
        "specifications": json.dumps({"cutting_elements": "5 Synchronized Shaving Elements", "sonic_vibrations": "40,000 cross-cutting actions/min", "waterproof": "100% Waterproof (Wet & Dry)", "station": "5-in-1 SmartCare Cleaning Center", "battery": "60 mins cordless runtime"})
    },
    {
        "id": 1205,
        "name": "Philips Norelco Multigroom 9000 All-in-One Trimmer",
        "brand": "Philips",
        "category": "Personal Care Electronics",
        "price": 4999.0,
        "stock": 45,
        "rating": 4.7,
        "review_count": 130,
        "image_url": "https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&auto=format&fit=crop",
        "description": "Ultimate precision grooming kit with 21 premium attachments for face, head, and body styling. Self-sharpening DualCut steel blades, BeardSense sensor, and up to 6 hours cordless runtime.",
        "specifications": json.dumps({"attachments": "21 pieces for Face, Head & Body", "blades": "Self-sharpening DualCut Steel", "runtime": "6 hours Lithium-ion battery", "body": "Stainless Steel Frame with rubber grip", "waterproof": "100% Showerproof"})
    },
    {
        "id": 1206,
        "name": "Dyson Airwrap Multi-Styler Complete Long",
        "brand": "Dyson",
        "category": "Personal Care Electronics",
        "price": 45900.0,
        "stock": 13,
        "rating": 4.9,
        "review_count": 86,
        "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop",
        "description": "Styles hair using the Coanda airflow effect without extreme heat. Re-engineered barrels curl in both directions, smoothing brushes provide shape, and multi-functional Coanda smoothing dryer hides flyaways.",
        "specifications": json.dumps({"airflow": "Enhanced Coanda Effect Styling", "motor": "Dyson Digital Motor V9 (110,000 RPM)", "temp_control": "Monitors heat 40 times per second under 150C", "attachments": "6 re-engineered styling barrels and brushes", "case": "Prussian Blue Storage Case"})
    },

    # =========================================================================
    # 6. EXPANDED LAPTOPS (115 - 118)
    # =========================================================================
    {
        "id": 115,
        "name": "ASUS Zenbook Duo OLED (2024) Dual 14-inch Screen Laptop",
        "brand": "ASUS",
        "category": "Laptops",
        "price": 159990.0,
        "stock": 10,
        "rating": 4.8,
        "review_count": 25,
        "image_url": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop",
        "description": "Revolutionary dual 14-inch 3K 120Hz OLED touchscreens with detachable full-size Bluetooth keyboard and kickstand. Powered by Intel Core Ultra 9 with AI Boost NPU.",
        "specifications": json.dumps({"processor": "Intel Core Ultra 9 185H with Intel AI Boost", "ram": "32GB LPDDR5X", "storage": "1TB PCIe 4.0 NVMe SSD", "display": "Dual 14-inch 3K (2880x1800) OLED 120Hz Touch", "battery": "75Wh, up to 13.5 hours single screen", "weight": "1.35 kg without keyboard"})
    },
    {
        "id": 116,
        "name": "Lenovo Legion Pro 7i 16-inch Gaming Laptop (i9-14900HX, RTX 4080)",
        "brand": "Lenovo",
        "category": "Laptops",
        "price": 234990.0,
        "stock": 6,
        "rating": 4.9,
        "review_count": 34,
        "image_url": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop",
        "description": "Unrivaled desktop-class gaming laptop. Intel Core i9-14900HX, NVIDIA GeForce RTX 4080 12GB (175W TGP), 16-inch WQXGA 240Hz 500 nits display, and Legion Coldfront vapor chamber cooling.",
        "specifications": json.dumps({"processor": "Intel Core i9-14900HX (24 cores, up to 5.8 GHz)", "ram": "32GB DDR5 5600MHz", "storage": "1TB Gen4 SSD", "graphics": "NVIDIA GeForce RTX 4080 12GB GDDR6 (175W TGP)", "display": "16-inch WQXGA (2560x1600) IPS 240Hz 500nits", "battery": "99.99Wh with 330W Super Rapid Charge"})
    },
    {
        "id": 117,
        "name": "Dell XPS 16 (9640) Intel Core Ultra 7 OLED Ultrabook",
        "brand": "Dell",
        "category": "Laptops",
        "price": 249990.0,
        "stock": 8,
        "rating": 4.7,
        "review_count": 21,
        "image_url": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop",
        "description": "Stunning CNC aluminum body with touch function row, invisible glass touchpad, and 16.3-inch 4K+ OLED InfinityEdge display. Powered by Intel Core Ultra 7 and NVIDIA RTX 4060.",
        "specifications": json.dumps({"processor": "Intel Core Ultra 7 155H", "ram": "32GB LPDDR5X", "storage": "1TB PCIe NVMe SSD", "graphics": "NVIDIA GeForce RTX 4060 8GB GDDR6", "display": "16.3-inch 4K+ (3840x2400) OLED Touch 400 nits", "battery": "99.5Wh with ExpressCharge"})
    },
    {
        "id": 118,
        "name": "Apple MacBook Pro 16-inch M3 Max (36GB Unified, 1TB SSD)",
        "brand": "Apple",
        "category": "Laptops",
        "price": 349900.0,
        "stock": 5,
        "rating": 5.0,
        "review_count": 41,
        "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop",
        "description": "Monster performance for machine learning, 3D rendering, and 8K video editing. 14-core CPU, 30-core GPU, Liquid Retina XDR with 1600 nits peak HDR brightness, and up to 22 hours battery life.",
        "specifications": json.dumps({"processor": "Apple M3 Max (14-core CPU, 30-core GPU, 16-core Neural Engine)", "ram": "36GB Unified Memory (300 GB/s bandwidth)", "storage": "1TB NVMe SSD", "display": "16.2-inch Liquid Retina XDR (3456x2234) 120Hz ProMotion", "battery": "100Wh, up to 22 hours battery life"})
    },

    # =========================================================================
    # 7. EXPANDED SMARTPHONES (225 - 228)
    # =========================================================================
    {
        "id": 225,
        "name": "Samsung Galaxy Z Fold 5 5G (12GB RAM, 512GB)",
        "brand": "Samsung",
        "category": "Smartphones",
        "price": 164999.0,
        "stock": 7,
        "rating": 4.8,
        "review_count": 39,
        "image_url": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop",
        "description": "PC-like multitasking in your pocket. 7.6-inch Dynamic AMOLED 2X folding screen with S-Pen support, zero-gap Flex Hinge, Snapdragon 8 Gen 2 for Galaxy, and IPX8 water resistance.",
        "specifications": json.dumps({"processor": "Qualcomm Snapdragon 8 Gen 2 for Galaxy", "ram": "12GB LPDDR5X", "storage": "512GB UFS 4.0", "display_main": "7.6-inch 120Hz QXGA+ Dynamic AMOLED 2X", "display_cover": "6.2-inch 120Hz Dynamic AMOLED 2X", "camera": "50MP Main OIS + 12MP Ultra-wide + 10MP 3x Telephoto", "battery": "4400 mAh with 25W Wired + 15W Wireless"})
    },
    {
        "id": 226,
        "name": "OnePlus Open Foldable Flagship (16GB RAM, 512GB)",
        "brand": "OnePlus",
        "category": "Smartphones",
        "price": 139999.0,
        "stock": 9,
        "rating": 4.9,
        "review_count": 48,
        "image_url": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop",
        "description": "Ultra-lightweight foldable with near-invisible crease. Dual 2K 120Hz Fluid AMOLED screens, Hasselblad Camera for Mobile with 64MP periscope telephoto, and 67W SUPERVOOC charging.",
        "specifications": json.dumps({"processor": "Snapdragon 8 Gen 2", "ram": "16GB LPDDR5X", "storage": "512GB UFS 4.0", "display": "7.82-inch 2K 120Hz LTPO 3.0 Flexi-fluid AMOLED", "camera": "48MP Sony LYT-T808 + 64MP 3x Periscope + 48MP Ultra-wide", "battery": "4805 mAh with 67W Fast Charging"})
    },
    {
        "id": 227,
        "name": "Nothing Phone (2) 5G (12GB RAM, 256GB)",
        "brand": "Nothing",
        "category": "Smartphones",
        "price": 37999.0,
        "stock": 26,
        "rating": 4.6,
        "review_count": 87,
        "image_url": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop",
        "description": "Iconic transparent back with customizable Glyph Interface LED lighting. Snapdragon 8+ Gen 1 flagship chipset, 6.7-inch 120Hz LTPO OLED, and dual 50MP Sony IMX890 cameras.",
        "specifications": json.dumps({"processor": "Qualcomm Snapdragon 8+ Gen 1", "ram": "12GB", "storage": "256GB", "display": "6.7-inch Flexible LTPO OLED (1-120Hz)", "camera": "Dual 50MP Rear (Sony IMX890 OIS + Samsung JN1) / 32MP Front", "battery": "4700 mAh with 45W Wired + 15W Wireless"})
    },
    {
        "id": 228,
        "name": "Vivo X100 Pro 5G with ZEISS APO Telephoto (16GB, 512GB)",
        "brand": "Vivo",
        "category": "Smartphones",
        "price": 89999.0,
        "stock": 14,
        "rating": 4.9,
        "review_count": 36,
        "image_url": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop",
        "description": "Professional mobile photography titan. 1-inch Sony IMX989 main sensor with ZEISS Multifocal portrait, MediaTek Dimensity 9300 chipset, custom Vivo V3 imaging chip, and 100W FlashCharge.",
        "specifications": json.dumps({"processor": "MediaTek Dimensity 9300 (All-Big-Core 4nm)", "camera": "50MP 1-inch Sony IMX989 + 50MP ZEISS APO Floating Telephoto (4.3x optical) + 50MP Ultra-wide", "ram_storage": "16GB LPDDR5T / 512GB UFS 4.0", "battery": "5400 mAh with 100W Dual-Cell FlashCharge"})
    },

    # =========================================================================
    # 8. EXPANDED AUDIO & ACCESSORIES (323 - 325, 709 - 711)
    # =========================================================================
    {
        "id": 323,
        "name": "Bose QuietComfort Ultra Wireless Noise Cancelling Headphones",
        "brand": "Bose",
        "category": "Audio & Headphones",
        "price": 35900.0,
        "stock": 18,
        "rating": 4.9,
        "review_count": 65,
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop",
        "description": "World-class active noise cancellation with breakthrough Bose Immersive Audio spatial sound. CustomTune sound calibration tailored to your ear shape and up to 24 hours battery life.",
        "specifications": json.dumps({"anc": "World-class Active Noise Cancellation with CustomTune", "audio": "Bose Immersive Audio Spatial Sound", "battery": "Up to 24 hours (18 hours with Immersive Audio)", "charging": "USB-C with 15-min quick charge for 2.5 hours", "connectivity": "Bluetooth 5.3 with Snapdragon Sound aptX Adaptive"})
    },
    {
        "id": 324,
        "name": "Marshall Stanmore III Wireless Bluetooth Home Speaker",
        "brand": "Marshall",
        "category": "Audio & Headphones",
        "price": 34999.0,
        "stock": 14,
        "rating": 4.8,
        "review_count": 42,
        "image_url": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop",
        "description": "Iconic vintage rock-and-roll aesthetic with room-shaking Marshall signature sound. Re-engineered wider soundstage with angled tweeters, Dynamic Loudness, and Bluetooth 5.2 LE Audio.",
        "specifications": json.dumps({"amplifiers": "1x 50W Class D for Woofer + 2x 15W Class D for Tweeters (80W total)", "frequency": "45 Hz - 20,000 Hz", "controls": "Analog Brass Knobs for Bass, Treble, Volume", "inputs": "Bluetooth 5.2, 3.5mm Aux, RCA Input"})
    },
    {
        "id": 325,
        "name": "Shure SM7B Cardioid Dynamic Vocal Studio Microphone",
        "brand": "Shure",
        "category": "Audio & Headphones",
        "price": 36990.0,
        "stock": 12,
        "rating": 4.9,
        "review_count": 58,
        "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop",
        "description": "The gold-standard vocal microphone for broadcast, podcasting, and studio music recording. Smooth flat wide-range frequency response, air suspension shock isolation, and electromagnetic shielding.",
        "specifications": json.dumps({"type": "Cardioid Dynamic", "polar_pattern": "Cardioid", "frequency_response": "50 Hz to 20,000 Hz", "output_impedance": "150 Ohms", "connector": "3-pin XLR Professional"})
    },
    {
        "id": 709,
        "name": "Fujifilm X-T5 Mirrorless Camera Body 40.2MP",
        "brand": "Fujifilm",
        "category": "Cameras & Gaming",
        "price": 169999.0,
        "stock": 6,
        "rating": 4.9,
        "review_count": 28,
        "image_url": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop",
        "description": "High-resolution photographic perfection. 40.2MP X-Trans CMOS 5 HR back-illuminated sensor, 5-axis 7.0-stop in-body image stabilization (IBIS), 6.2K/30p video, and classic tactile dial controls.",
        "specifications": json.dumps({"sensor": "40.2MP X-Trans CMOS 5 HR APS-C", "ibis": "5-axis 7.0 stops IBIS", "video": "6.2K at 30p, 4K at 60p 10-bit 4:2:2", "viewfinder": "3.69M-dot OLED EVF", "storage": "Dual UHS-II SD Card Slots"})
    },
    {
        "id": 710,
        "name": "DJI Avata 2 FPV Drone Fly More Combo (Three Batteries)",
        "brand": "DJI",
        "category": "Cameras & Gaming",
        "price": 112990.0,
        "stock": 8,
        "rating": 4.8,
        "review_count": 33,
        "image_url": "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&auto=format&fit=crop",
        "description": "Adrenaline-pumping first-person view flying experience. 4K/60fps HDR ultra-wide 155-degree camera with 1/1.3-inch image sensor, integrated propeller guards, DJI Goggles 3, and RC Motion 3 controller.",
        "specifications": json.dumps({"camera": "1/1.3-inch CMOS 4K/60fps HDR 155 deg FOV", "transmission": "DJI O4 Video Transmission up to 13 km", "flight_time": "Up to 23 minutes per battery (3 included)", "combo_includes": "DJI Goggles 3 + RC Motion 3 + Two-Way Charging Hub"})
    },
    {
        "id": 711,
        "name": "ASUS ROG Ally X Handheld Gaming Console (AMD Z1 Extreme, 24GB RAM, 1TB)",
        "brand": "ASUS",
        "category": "Cameras & Gaming",
        "price": 89990.0,
        "stock": 15,
        "rating": 4.8,
        "review_count": 44,
        "image_url": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop",
        "description": "The ultimate Windows 11 handheld gaming PC. Upgraded massive 80Wh battery (2x capacity), 24GB high-speed LPDDR5X RAM, 1TB M.2 2280 NVMe SSD, and 7-inch FHD 120Hz FreeSync Premium display.",
        "specifications": json.dumps({"processor": "AMD Ryzen Z1 Extreme (8 cores, 16 threads, 8.6 TFlops RDNA 3)", "ram": "24GB LPDDR5X 7500MHz", "storage": "1TB PCIe 4.0 NVMe M.2 2280 SSD", "display": "7-inch FHD (1920x1080) 120Hz IPS 500 nits FreeSync", "battery": "80Wh 4-cell Li-ion (Doubled Battery)", "os": "Windows 11 Home with Armoury Crate SE"})
    }
]

def main():
    print(f"Connecting to database to add {len(NEW_PRODUCTS)} new electronics products...")
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    for p in NEW_PRODUCTS:
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
                specifications = EXCLUDED.specifications;
        """, (
            p["id"], p["name"], p["brand"], p["category"], p["price"],
            p["stock"], p["rating"], p["review_count"], p["image_url"],
            p["description"], p["specifications"]
        ))
    
    conn.commit()
    cur.execute("SELECT COUNT(*) FROM products;")
    total_count = cur.fetchone()[0]
    print(f"[SUCCESS] Database updated! Total products now in PostgreSQL: {total_count}")

    # Also sync seed_products.json with all products from DB
    cur.execute("""
        SELECT id, name, brand, category, price, stock, rating, review_count, image_url, description, specifications
        FROM products ORDER BY id;
    """)
    all_rows = cur.fetchall()
    all_catalog = []
    for row in all_rows:
        all_catalog.append({
            "id": row[0],
            "name": row[1],
            "brand": row[2],
            "category": row[3],
            "price": row[4],
            "stock": row[5],
            "rating": row[6],
            "review_count": row[7],
            "image_url": row[8],
            "description": row[9],
            "specifications": row[10]
        })

    cur.close()
    conn.close()

    seed_path = os.path.join(os.path.dirname(__file__), "..", "data", "seed_products.json")
    with open(seed_path, "w", encoding="utf-8") as f:
        json.dump(all_catalog, f, indent=2)
    print(f"[SUCCESS] Updated {seed_path} with {len(all_catalog)} total products.")

if __name__ == "__main__":
    main()

