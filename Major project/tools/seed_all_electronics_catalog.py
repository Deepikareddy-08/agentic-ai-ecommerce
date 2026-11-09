import json
import os
import psycopg2

DB_URL = os.getenv("DATABASE_URL", "postgresql://postgres:deepika08@localhost:5432/ecommerce_db")

EXPANDED_PRODUCTS = [
    # =========================================================================
    # 13. MONITORS & DISPLAYS (1301 - 1308)
    # =========================================================================
    {
        "id": 1301,
        "name": "Samsung Odyssey OLED G9 49-inch Curved Dual QHD Gaming Monitor",
        "brand": "Samsung",
        "category": "Monitors & Displays",
        "price": 144999.0,
        "stock": 7,
        "rating": 4.9,
        "review_count": 42,
        "image_url": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop",
        "description": "Colossal 49-inch 1800R curved display with Neo Quantum Processor Pro. Dual QHD 5120x1440 resolution, 0.03ms response time, 240Hz refresh rate, DisplayHDR True Black 400, and Gaming Hub.",
        "specifications": json.dumps({"screen_size": "49-inch (32:9)", "panel_type": "QD-OLED Curved 1800R", "resolution": "Dual QHD (5120x1440)", "refresh_rate": "240Hz", "response_time": "0.03ms (GtG)", "hdr": "DisplayHDR True Black 400", "ports": "HDMI 2.1, Micro HDMI 2.1, DP 1.4, USB Hub", "sync": "AMD FreeSync Premium Pro"})
    },
    {
        "id": 1302,
        "name": "LG UltraGear 27GR95QE 27-inch QHD OLED Gaming Monitor",
        "brand": "LG",
        "category": "Monitors & Displays",
        "price": 74990.0,
        "stock": 14,
        "rating": 4.8,
        "review_count": 65,
        "image_url": "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600&auto=format&fit=crop",
        "description": "World's first 240Hz OLED gaming monitor with 0.03ms response time. Anti-glare low reflection coating, 98.5% DCI-P3 color gamut, NVIDIA G-SYNC Compatible, and HDMI 2.1 support.",
        "specifications": json.dumps({"screen_size": "27-inch", "panel_type": "OLED", "resolution": "QHD (2560x1440)", "refresh_rate": "240Hz", "response_time": "0.03ms", "color_gamut": "98.5% DCI-P3", "ports": "2x HDMI 2.1, 1x DP 1.4, 2x USB 3.0", "sync": "G-Sync Compatible, FreeSync Premium"})
    },
    {
        "id": 1303,
        "name": "Dell UltraSharp 32 4K USB-C Hub Monitor U3223QE",
        "brand": "Dell",
        "category": "Monitors & Displays",
        "price": 82490.0,
        "stock": 12,
        "rating": 4.9,
        "review_count": 39,
        "image_url": "https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?w=600&auto=format&fit=crop",
        "description": "Groundbreaking IPS Black technology delivers extraordinary 2000:1 contrast ratio. 4K UHD clarity, 98% DCI-P3, USB-C 90W power delivery hub, built-in RJ45 Ethernet, and KVM switch.",
        "specifications": json.dumps({"screen_size": "31.5-inch", "panel_type": "IPS Black", "resolution": "4K UHD (3840x2160)", "refresh_rate": "60Hz", "contrast_ratio": "2000:1", "ports": "USB-C 90W PD, DisplayPort 1.4, HDMI, RJ45 Ethernet", "kvm": "Auto KVM built-in"})
    },
    {
        "id": 1304,
        "name": "BenQ PD3205U 32-inch 4K UHD Designer Color-Accurate Monitor",
        "brand": "BenQ",
        "category": "Monitors & Displays",
        "price": 59990.0,
        "stock": 16,
        "rating": 4.7,
        "review_count": 28,
        "image_url": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop",
        "description": "Factory calibrated AQCOLOR display engineered for creative professionals. 99% sRGB / Rec.709, HDR10, USB-C 90W single-cable connection, Hotkey Puck G2, and DualView CAD/CAM modes.",
        "specifications": json.dumps({"screen_size": "31.5-inch", "panel_type": "IPS Anti-Glare", "resolution": "4K UHD (3840x2160)", "color_accuracy": "Delta E <= 3, Calman / Pantone Validated", "ports": "USB-C 90W, DP 1.4, HDMI 2.0, USB Hub", "controller": "Hotkey Puck G2"})
    },
    {
        "id": 1305,
        "name": "ASUS ROG Swift PG32UQX 32-inch 4K Mini-LED HDR1400 Gaming Monitor",
        "brand": "ASUS",
        "category": "Monitors & Displays",
        "price": 199990.0,
        "stock": 4,
        "rating": 5.0,
        "review_count": 18,
        "image_url": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop",
        "description": "The zenith of gaming displays: 1152-zone Mini-LED backlighting with 1400 nits peak brightness. Full-array local dimming, 4K 144Hz G-SYNC Ultimate, Quantum Dot technology, and LiveDash OLED.",
        "specifications": json.dumps({"screen_size": "32-inch", "panel_type": "Mini-LED IPS", "resolution": "4K UHD (3840x2160)", "refresh_rate": "144Hz", "dimming_zones": "1152 Zones Full Array", "peak_brightness": "1400 nits", "hdr": "VESA DisplayHDR 1400", "sync": "NVIDIA G-SYNC Ultimate"})
    },
    {
        "id": 1306,
        "name": "MSI Optix MAG342CQR 34-inch Curved Ultrawide UWQHD Gaming Monitor",
        "brand": "MSI",
        "category": "Monitors & Displays",
        "price": 38990.0,
        "stock": 21,
        "rating": 4.6,
        "review_count": 73,
        "image_url": "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=600&auto=format&fit=crop",
        "description": "Immersive 1500R curvature with UWQHD 3440x1440 resolution. 144Hz refresh rate, 1ms response time, Mystic Light RGB, and Adaptive Sync for seamless tear-free gameplay.",
        "specifications": json.dumps({"screen_size": "34-inch Ultrawide 21:9", "curvature": "1500R", "resolution": "UWQHD (3440x1440)", "refresh_rate": "144Hz", "response_time": "1ms (MPRT)", "ports": "2x HDMI 2.0, 1x DP 1.4", "sync": "Adaptive Sync"})
    },

    # =========================================================================
    # 14. PRINTERS, SCANNERS & OFFICE ELECTRONICS (1401 - 1406)
    # =========================================================================
    {
        "id": 1401,
        "name": "HP Smart Tank 580 All-in-One WiFi Color Ink Tank Printer",
        "brand": "HP",
        "category": "Printers & Office Electronics",
        "price": 13999.0,
        "stock": 35,
        "rating": 4.6,
        "review_count": 142,
        "image_url": "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&auto=format&fit=crop",
        "description": "Ultra-low-cost high-capacity color printing up to 12,000 black or 6,000 color pages inbox. Self-healing dual-band Wi-Fi, HP Smart app mobile printing, flatbed scanner, and borderless photo print.",
        "specifications": json.dumps({"functions": "Print, Copy, Scan", "print_speed": "Up to 12 ppm black / 5 ppm color", "connectivity": "Dual Band Wi-Fi, Hi-Speed USB 2.0, Bluetooth LE", "page_yield": "12,000 black / 6,000 color pages", "warranty": "1 Year or 30,000 pages"})
    },
    {
        "id": 1402,
        "name": "Canon PIXMA MegaTank G3020 All-in-One Wireless Ink Tank Printer",
        "brand": "Canon",
        "category": "Printers & Office Electronics",
        "price": 14499.0,
        "stock": 29,
        "rating": 4.7,
        "review_count": 115,
        "image_url": "https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=600&auto=format&fit=crop",
        "description": "High-volume ink tank system designed for home and small offices. Economy Mode prints up to 7,700 color or 7,600 black pages. User-replaceable maintenance cartridge and 2-line mono LCD screen.",
        "specifications": json.dumps({"functions": "Print, Scan, Copy", "print_speed": "9.1 ipm black / 5.0 ipm color", "connectivity": "Wireless LAN, Direct Wireless, USB 2.0", "ink_type": "GI-71 Pigment Black / Dye Color", "display": "2-line LCD"})
    },
    {
        "id": 1403,
        "name": "Epson EcoTank L3250 Wi-Fi All-in-One Ink Tank Printer",
        "brand": "Epson",
        "category": "Printers & Office Electronics",
        "price": 15299.0,
        "stock": 32,
        "rating": 4.7,
        "review_count": 188,
        "image_url": "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop",
        "description": "Heat-Free Technology delivers speed, reduced power consumption, and reliable spill-free bottle refills. Ultra-high yield of 4,500 black and 7,500 color pages with Epson Smart Panel mobile setup.",
        "specifications": json.dumps({"functions": "Print, Scan, Copy", "print_technology": "Micro Piezo Heat-Free", "resolution": "5760 x 1440 dpi", "speed": "33 ppm black / 15 ppm color", "connectivity": "Wi-Fi, Wi-Fi Direct, USB 2.0"})
    },
    {
        "id": 1404,
        "name": "Brother HL-L2321D Automatic 2-Sided Monochromatic Laser Printer",
        "brand": "Brother",
        "category": "Printers & Office Electronics",
        "price": 11490.0,
        "stock": 20,
        "rating": 4.8,
        "review_count": 94,
        "image_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop",
        "description": "Fast and robust laser printing workhorse with speeds up to 30 pages per minute. Automatic duplex 2-sided printing saves paper. 250-sheet enclosed paper tray and 2600-page toner included.",
        "specifications": json.dumps({"technology": "Electrophotographic Laser", "speed": "Up to 30 ppm", "duplex": "Automatic 2-Sided Printing", "tray_capacity": "250 sheets", "toner": "TN-2365 High Yield (2600 pages)"})
    },
    {
        "id": 1405,
        "name": "Epson Perfection V39 II Color Flatbed Photo & Document Scanner",
        "brand": "Epson",
        "category": "Printers & Office Electronics",
        "price": 6999.0,
        "stock": 25,
        "rating": 4.6,
        "review_count": 51,
        "image_url": "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=600&auto=format&fit=crop",
        "description": "High-resolution 4800 dpi scanning in an ultra-slim compact form factor. USB powered with zero warmup time using ReadyScan LED technology. Built-in kickstand for upright scanning.",
        "specifications": json.dumps({"scanner_type": "Flatbed Color Image Scanner", "optical_resolution": "4800 x 4800 dpi", "light_source": "Three-color RGB LED", "power": "USB Bus-Powered (No AC adapter needed)", "features": "Scan to PDF, Cloud & Email"})
    },
    {
        "id": 1406,
        "name": "Brother P-touch PT-D210 Portable Electronic Label Maker",
        "brand": "Brother",
        "category": "Printers & Office Electronics",
        "price": 3499.0,
        "stock": 40,
        "rating": 4.7,
        "review_count": 87,
        "image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
        "description": "One-touch keys to quickly access 14 fonts, 97 frames, and more than 600 symbols. Prints durable water-resistant TZe laminated labels up to 12mm wide for home and office organization.",
        "specifications": json.dumps({"keyboard": "QWERTY with Quick Access Keys", "tape_widths": "3.5mm, 6mm, 9mm, 12mm TZe Tapes", "fonts": "14 Fonts, 10 Styles, 97 Frames", "display": "Graphical LCD with print preview", "battery": "6x AAA batteries or AC adapter"})
    },

    # =========================================================================
    # 15. DRONES & AERIAL IMAGING (1501 - 1505)
    # =========================================================================
    {
        "id": 1501,
        "name": "DJI Mini 4 Pro Drone with DJI RC 2 Remote Controller",
        "brand": "DJI",
        "category": "Drones & Aerial Imaging",
        "price": 109990.0,
        "stock": 10,
        "rating": 4.9,
        "review_count": 58,
        "image_url": "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600&auto=format&fit=crop",
        "description": "Ultralight sub-249g drone with omnidirectional obstacle sensing. 4K/60fps HDR True Vertical shooting, 10-bit D-Log M color, 20km FHD video transmission with DJI O4, and 34-min flight time.",
        "specifications": json.dumps({"weight": "< 249g (No registration needed in many regions)", "video": "4K/60fps HDR, 4K/100fps Slow Motion", "sensor": "1/1.3-inch CMOS f/1.7", "obstacle_sensing": "Omnidirectional Active Sensing", "range": "Up to 20km FHD (DJI O4)", "flight_time": "34 minutes"})
    },
    {
        "id": 1502,
        "name": "DJI Air 3 Drone with Dual Primary 4K Cameras & RC-N2",
        "brand": "DJI",
        "category": "Drones & Aerial Imaging",
        "price": 154990.0,
        "stock": 6,
        "rating": 4.9,
        "review_count": 36,
        "image_url": "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&auto=format&fit=crop",
        "description": "Pioneering dual-primary camera system with a 24mm wide-angle and a 70mm 3x medium telephoto camera. Up to 46 minutes of flight time, omnidirectional obstacle avoidance, and 48MP photos.",
        "specifications": json.dumps({"cameras": "Dual 48MP 1/1.3-inch CMOS (24mm Wide + 70mm 3x Tele)", "video": "4K/60fps HDR, 4K/100fps max", "flight_time": "Up to 46 minutes", "obstacle_sensing": "Omnidirectional APAS 5.0", "transmission": "DJI O4 HD 20km"})
    },
    {
        "id": 1503,
        "name": "DJI Avata 2 Fly More Combo FPV Drone with Goggles 3",
        "brand": "DJI",
        "category": "Drones & Aerial Imaging",
        "price": 114990.0,
        "stock": 8,
        "rating": 4.8,
        "review_count": 41,
        "image_url": "https://images.unsplash.com/photo-1506947411487-a56738267384?w=600&auto=format&fit=crop",
        "description": "Adrenaline-pumping first-person view acrobatic flying. 1/1.3-inch sensor with 4K/60fps ultra-wide 155 FOV video, integrated propeller guards, Easy ACRO flips and rolls, and Goggles 3 with Real View PiP.",
        "specifications": json.dumps({"flight_type": "FPV Acrobatic Drone", "fov": "155 Ultra-Wide Angle", "video": "4K/60fps HDR with RockSteady 3.0+", "safety": "Built-in Propeller Guard, Turtle Mode", "goggles": "DJI Goggles 3 Micro-OLED", "flight_time": "23 minutes"})
    },
    {
        "id": 1504,
        "name": "DJI Osmo Mobile 6 Smartphone 3-Axis Gimbal Stabilizer",
        "brand": "DJI",
        "category": "Drones & Aerial Imaging",
        "price": 12490.0,
        "stock": 28,
        "rating": 4.7,
        "review_count": 92,
        "image_url": "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop",
        "description": "Compact foldable smartphone gimbal with built-in extension rod. ActiveTrack 6.0 locks onto subjects flawlessly. Magnetic phone clamp, side wheel for zoom/focus, and Quick Launch for iPhone.",
        "specifications": json.dumps({"stabilization": "3-Axis Motorized Gimbal", "tracking": "ActiveTrack 6.0", "built_in": "215mm Extension Rod & Tripod", "battery_life": "Approx 6.4 hours", "weight": "309g (Gimbal) + 31g (Clamp)"})
    },
    {
        "id": 1505,
        "name": "DJI RS 3 Mini 3-Axis Gimbal Stabilizer for Mirrorless Cameras",
        "brand": "DJI",
        "category": "Drones & Aerial Imaging",
        "price": 24990.0,
        "stock": 15,
        "rating": 4.8,
        "review_count": 47,
        "image_url": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop",
        "description": "Ultra-compact lightweight handheld gimbal supporting up to 2kg payload. Native vertical shooting without extra accessories, 3rd-Gen RS stabilization algorithm, and Bluetooth camera shutter control.",
        "specifications": json.dumps({"payload_capacity": "Up to 2.0 kg", "weight": "795g (Vertical mode) / 850g (Horizontal)", "battery_life": "Up to 10 hours", "screen": "1.4-inch Full Color Touchscreen", "vertical": "Native Vertical Shooting Switch"})
    },

    # =========================================================================
    # 16. NETWORKING & SMART CONNECTIVITY (1601 - 1606)
    # =========================================================================
    {
        "id": 1601,
        "name": "TP-Link Deco XE75 Pro AXE5400 Tri-Band WiFi 6E Mesh System (2-Pack)",
        "brand": "TP-Link",
        "category": "Networking & Wireless",
        "price": 27999.0,
        "stock": 18,
        "rating": 4.8,
        "review_count": 64,
        "image_url": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop",
        "description": "Whole-home Wi-Fi 6E mesh system covering up to 5,500 sq ft. Breakthrough 6GHz band eliminates interference. 2.5 Gbps multi-gigabit WAN/LAN port, AI-Driven Mesh algorithm, and TP-Link HomeShield security.",
        "specifications": json.dumps({"bands": "Tri-Band AXE5400 (6GHz: 2402Mbps + 5GHz: 2402Mbps + 2.4GHz: 574Mbps)", "coverage": "Up to 5,500 sq ft / 200+ Devices", "ethernet": "1x 2.5 Gbps Port + 2x Gigabit Ports per unit", "features": "AI-Mesh, HomeShield Pro, Parental Controls"})
    },
    {
        "id": 1602,
        "name": "ASUS RT-AX88U Pro Dual-Band WiFi 6 Extendable Gaming Router",
        "brand": "ASUS",
        "category": "Networking & Wireless",
        "price": 26990.0,
        "stock": 14,
        "rating": 4.9,
        "review_count": 51,
        "image_url": "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=600&auto=format&fit=crop",
        "description": "High-performance dual 2.5G ports router powered by a 2.0 GHz quad-core CPU. 6000 Mbps ultra-fast WiFi 6 speed, ASUS AiProtection Pro security, Mobile Game Mode, and AiMesh expandable coverage.",
        "specifications": json.dumps({"speed": "AX6000 (1148Mbps on 2.4GHz + 4804Mbps on 5GHz)", "ports": "Dual 2.5G WAN/LAN Ports + 4x Gigabit LAN + USB 3.2", "cpu": "2.0 GHz Quad-Core 64-bit CPU", "features": "AiProtection Pro with Trend Micro, Adaptive QoS"})
    },
    {
        "id": 1603,
        "name": "Netgear Nighthawk RAXE500 Tri-Band WiFi 6E AXE11000 Router",
        "brand": "Netgear",
        "category": "Networking & Wireless",
        "price": 44999.0,
        "stock": 8,
        "rating": 4.8,
        "review_count": 33,
        "image_url": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop",
        "description": "Futuristic wing-design router delivering speeds up to 10.8 Gbps across 12 Wi-Fi streams. 1.8 GHz quad-core processor, dedicated 6GHz expressway, and 2.5G Multi-Gigabit Ethernet port.",
        "specifications": json.dumps({"speed": "AXE11000 (1.2 + 4.8 + 4.8 Gbps)", "wifi_technology": "WiFi 6E with 6GHz Dedicated Band", "streams": "12-Stream Tri-Band", "ports": "1x 2.5G Multi-Gig, 5x Gigabit LAN, 2x USB 3.0", "antennas": "8 High-Performance Internal Antennas"})
    },
    {
        "id": 1604,
        "name": "TP-Link Archer AX73 AX5400 Dual-Band Gigabit WiFi 6 Router",
        "brand": "TP-Link",
        "category": "Networking & Wireless",
        "price": 8999.0,
        "stock": 42,
        "rating": 4.7,
        "review_count": 178,
        "image_url": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop",
        "description": "Full-speed 5400 Mbps WiFi 6 router designed for buffer-free 8K streaming and intensive multi-device homes. 6 high-gain antennas with Beamforming and 4T4R structure for maximum coverage.",
        "specifications": json.dumps({"speed": "AX5400 (4804 Mbps on 5 GHz + 574 Mbps on 2.4 GHz)", "antennas": "6x High-Gain External Antennas", "ports": "1x Gigabit WAN + 4x Gigabit LAN + 1x USB 3.0", "capacity": "Connects 200+ Devices with MU-MIMO & OFDMA"})
    },
    {
        "id": 1605,
        "name": "Netgear Nighthawk M6 5G Mobile Hotspot Router",
        "brand": "Netgear",
        "category": "Networking & Wireless",
        "price": 49990.0,
        "stock": 9,
        "rating": 4.8,
        "review_count": 27,
        "image_url": "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=600&auto=format&fit=crop",
        "description": "Blazing fast 5G sub-6 internet on the go with WiFi 6 speeds up to 3.6 Gbps. 2.5G Ethernet port, 2.4-inch color LCD touch display, up to 32 connected devices, and 13-hour all-day removable battery.",
        "specifications": json.dumps({"cellular": "5G Sub-6 GHz & 4G LTE Cat 19", "wifi": "WiFi 6 AX3600 (Up to 3.6 Gbps)", "ethernet": "1x 2.5 Gbps Multi-Gig Port", "display": "2.4-inch LCD Touchscreen", "battery": "5040mAh Lithium-ion (Up to 13 Hours)"})
    },
    {
        "id": 1606,
        "name": "TP-Link TL-SG108E 8-Port Gigabit Easy Smart Managed Switch",
        "brand": "TP-Link",
        "category": "Networking & Wireless",
        "price": 2999.0,
        "stock": 50,
        "rating": 4.8,
        "review_count": 210,
        "image_url": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop",
        "description": "Rugged steel casing 8-port gigabit switch providing traffic monitoring, VLAN prioritization, and QoS. Energy-efficient Green Ethernet technology cuts power usage by up to 58%.",
        "specifications": json.dumps({"ports": "8x 10/100/1000 Mbps RJ45 Ports", "management": "Web UI & Easy Smart Configuration Utility", "features": "Port Mirroring, Loop Prevention, Cable Diagnostics, 802.1p QoS", "housing": "Durable Metal Desktop / Wall-Mounting"})
    },

    # =========================================================================
    # 17. AR, VR & SPATIAL COMPUTING (1701 - 1705)
    # =========================================================================
    {
        "id": 1701,
        "name": "Meta Quest 3 512GB Breakthrough Mixed Reality All-in-One Headset",
        "brand": "Meta",
        "category": "AR, VR & Spatial Computing",
        "price": 58990.0,
        "stock": 19,
        "rating": 4.9,
        "review_count": 110,
        "image_url": "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=600&auto=format&fit=crop",
        "description": "Next-gen spatial computing powered by Snapdragon XR2 Gen 2 with double the GPU performance of Quest 2. High-res Infinite Display 4K+ resolution, full-color passthrough MR, and Touch Plus controllers.",
        "specifications": json.dumps({"display": "4K+ Infinite Display (2064x2208 per eye)", "refresh_rate": "90Hz / 120Hz", "processor": "Snapdragon XR2 Gen 2", "storage": "512GB", "passthrough": "Dual RGB Color Passthrough Cameras + Depth Projector", "audio": "Integrated 3D Spatial Audio"})
    },
    {
        "id": 1702,
        "name": "Sony PlayStation VR2 Headset for PlayStation 5",
        "brand": "Sony",
        "category": "AR, VR & Spatial Computing",
        "price": 54990.0,
        "stock": 15,
        "rating": 4.8,
        "review_count": 78,
        "image_url": "https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=600&auto=format&fit=crop",
        "description": "Cutting-edge VR for PS5 featuring 4K HDR OLED displays (2000x2040 per eye), intelligent eye tracking, headset feedback vibration, 3D Audio, and Sense controllers with adaptive triggers.",
        "specifications": json.dumps({"display": "4K HDR OLED (2000 x 2040 per eye)", "refresh_rate": "90Hz, 120Hz", "fov": "Approx 110 degrees", "tracking": "Inside-out 4 cameras + Intelligent Eye Tracking", "feedback": "Headset haptic motor, Sense Controller adaptive triggers"})
    },
    {
        "id": 1703,
        "name": "XREAL Air 2 Pro AR Smart Glasses with Electrochromic Dimming",
        "brand": "XREAL",
        "category": "AR, VR & Spatial Computing",
        "price": 44990.0,
        "stock": 16,
        "rating": 4.7,
        "review_count": 39,
        "image_url": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop",
        "description": "Ultra-lightweight 75g augmented reality glasses projecting an expansive 330-inch virtual screen. Sony 0.55-inch Micro-OLED displays with 120Hz refresh rate, 3-level electrochromic light dimming, and cinematic directional speakers.",
        "specifications": json.dumps({"display": "Sony Micro-OLED 1080p per eye (330-inch virtual display at 6m)", "weight": "75g", "refresh_rate": "120Hz", "dimming": "One-touch 3-level Electrochromic Dimming (0%, 35%, 100%)", "connectivity": "USB-C DisplayPort Alt Mode (iPhone 15/16, Steam Deck, PC)"})
    },
    {
        "id": 1704,
        "name": "HTC Vive XR Elite Lightweight All-in-One Mixed Reality Headset",
        "brand": "HTC",
        "category": "AR, VR & Spatial Computing",
        "price": 118000.0,
        "stock": 5,
        "rating": 4.7,
        "review_count": 22,
        "image_url": "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=600&auto=format&fit=crop",
        "description": "Convertible modular MR headset transforming into lightweight glasses. Combined 3840x1920 resolution, stepless IPD with diopter dials for eyeglass wearers, color passthrough, and PC-VR streaming.",
        "specifications": json.dumps({"display": "3840 x 1920 (1920x1920 per eye)", "refresh_rate": "90Hz", "diopter": "Adjustable 0 to -6D (No glasses needed)", "form_factor": "Modular (Detachable battery cradle converts to glasses)", "tracking": "4x tracking cameras, color passthrough, hand tracking"})
    },
    {
        "id": 1705,
        "name": "Ray-Ban Meta Smart Glasses Wayfarer with Polarized Lenses",
        "brand": "Ray-Ban",
        "category": "AR, VR & Spatial Computing",
        "price": 36990.0,
        "stock": 22,
        "rating": 4.8,
        "review_count": 67,
        "image_url": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop",
        "description": "Iconic Ray-Ban silhouette fused with Meta AI assistant. Ultra-wide 12MP camera for hands-free 1080p video recording and live streaming to Instagram. Custom open-ear discrete speakers and 5-mic array.",
        "specifications": json.dumps({"camera": "12MP Ultra-Wide (1080p 60fps video)", "audio": "Custom open-ear speakers with 5-microphone array", "ai": "Meta AI Voice Assistant with Multimodal vision", "battery": "Up to 4 hours per charge + 36 hours in charging case", "storage": "32GB flash memory"})
    },

    # =========================================================================
    # 18. SMART WEARABLES & HEALTH ELECTRONICS (1801 - 1805)
    # =========================================================================
    {
        "id": 1801,
        "name": "Oura Ring Gen 3 Horizon Smart Titanium Health & Sleep Tracker",
        "brand": "Oura",
        "category": "Smart Wearables & Health Electronics",
        "price": 34990.0,
        "stock": 14,
        "rating": 4.9,
        "review_count": 83,
        "image_url": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop",
        "description": "Sleek circular titanium ring packed with research-grade sensors. Accurate tracking of sleep stages, Readiness Score, daytime heart rate, HRV, body temperature trends, and blood oxygen (SpO2).",
        "specifications": json.dumps({"material": "Lightweight Durable Titanium (PVD coated)", "weight": "4 to 6 grams", "sensors": "Optical Heart Rate, Blood Oxygen, Skin Temperature, 3D Accelerometer", "water_resistance": "100m (10 ATM)", "battery_life": "Up to 7 days on single charge"})
    },
    {
        "id": 1802,
        "name": "WHOOP 4.0 Health, Strain & Sleep Performance Tracker",
        "brand": "WHOOP",
        "category": "Smart Wearables & Health Electronics",
        "price": 23990.0,
        "stock": 20,
        "rating": 4.8,
        "review_count": 59,
        "image_url": "https://images.unsplash.com/photo-1510017803434-a899398421b3?w=600&auto=format&fit=crop",
        "description": "Screen-free athletic biometric tracker monitoring cardiovascular strain, recovery, sleep performance, and respiratory rate 24/7. Includes waterproof wireless battery pack for charging on the wrist.",
        "specifications": json.dumps({"tracking": "Heart Rate, HRV, Skin Temp, Blood Oxygen, Sleep Stages, Respiratory Rate", "design": "Screen-free minimalist fabric band with titanium clasp", "battery": "5 days continuous (Charge-on-the-go battery pack)", "waterproof": "IP68 water-resistant to 10 meters"})
    },
    {
        "id": 1803,
        "name": "Garmin Forerunner 965 GPS Premium Running Watch with AMOLED",
        "brand": "Garmin",
        "category": "Smart Wearables & Health Electronics",
        "price": 67490.0,
        "stock": 12,
        "rating": 4.9,
        "review_count": 48,
        "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop",
        "description": "The ultimate triathlete and marathoner smartwatch. Vivid 1.4-inch AMOLED touchscreen with lightweight titanium bezel. Full-color built-in topo maps, Multi-Band GPS with SatIQ, and up to 23-day battery.",
        "specifications": json.dumps({"screen": "1.4-inch AMOLED Touchscreen (454 x 454)", "bezel": "Titanium Bezel with Corning Gorilla Glass DX", "gps": "Multi-Band GNSS with SatIQ Technology", "battery_life": "Up to 23 days in smartwatch mode / 31 hours GPS", "maps": "Built-in Full-Color TopoActive Maps"})
    },
    {
        "id": 1804,
        "name": "Omron Complete 2-in-1 Blood Pressure Monitor + EKG with Bluetooth",
        "brand": "Omron",
        "category": "Smart Wearables & Health Electronics",
        "price": 14990.0,
        "stock": 26,
        "rating": 4.8,
        "review_count": 75,
        "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop",
        "description": "FDA-cleared medical device that measures blood pressure and single-lead EKG simultaneously in seconds. Detects atrial fibrillation (AFib), tachycardia, and bradycardia. Syncs to Omron Connect app.",
        "specifications": json.dumps({"measurement": "Upper Arm Blood Pressure + Single-Lead EKG", "detection": "AFib, Tachycardia, Bradycardia, Sinus Rhythm", "cuff_size": "Wide-Range D-Ring Cuff (9 to 17 inches)", "connectivity": "Bluetooth Low Energy to iOS/Android", "memory": "Unlimited cloud storage via app"})
    },
    {
        "id": 1805,
        "name": "Withings Body Scan Smart Connected Health Station & ECG",
        "brand": "Withings",
        "category": "Smart Wearables & Health Electronics",
        "price": 39990.0,
        "stock": 11,
        "rating": 4.9,
        "review_count": 34,
        "image_url": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop",
        "description": "Medical-grade home health scale with retractable handle. Evaluates segmental body composition (arms, legs, torso fat/muscle), 6-lead ECG for heart health, Vascular Age, and Nerve Health score.",
        "specifications": json.dumps({"sensors": "Segmental Bioelectrical Impedance (4 lead handle + 4 base electrodes)", "metrics": "Weight (50g precision), Fat %, Muscle %, Bone Mass, Visceral Fat", "cardio": "6-Lead ECG, Vascular Age, Pulse Wave Velocity", "nerve": "Electrodermal Activity Score", "battery": "Rechargeable 1-year battery life"})
    },

    # =========================================================================
    # 19. POWER BANKS & PORTABLE POWER STATIONS (1901 - 1905)
    # =========================================================================
    {
        "id": 1901,
        "name": "Anker Prime 27,650mAh Power Bank (250W Multi-Port Fast Charge)",
        "brand": "Anker",
        "category": "Power Banks & Portable Power",
        "price": 16999.0,
        "stock": 24,
        "rating": 4.9,
        "review_count": 91,
        "image_url": "https://images.unsplash.com/photo-1609592424161-9f939c368d44?w=600&auto=format&fit=crop",
        "description": "Airline-approved 99.54Wh powerhouse with two USB-C and one USB-A port outputting up to 250W. Smart digital display shows battery percentage, power flow, and recharge duration. Charges a 16-inch MacBook Pro at 140W.",
        "specifications": json.dumps({"capacity": "27,650 mAh (99.54 Wh - TSA Approved)", "max_output": "250W Total (Up to 140W on single USB-C)", "ports": "2x USB-C PD 3.1 + 1x USB-A", "recharge_speed": "170W fast recharge (Full in 37 mins)", "display": "Color Smart Digital Screen"})
    },
    {
        "id": 1902,
        "name": "EcoFlow River 2 Pro 768Wh Portable Power Station with LiFePO4",
        "brand": "EcoFlow",
        "category": "Power Banks & Portable Power",
        "price": 54999.0,
        "stock": 9,
        "rating": 4.9,
        "review_count": 43,
        "image_url": "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&auto=format&fit=crop",
        "description": "Rugged LiFePO4 battery station with 3000+ life cycles (10 years daily use). 800W AC output (X-Boost up to 1600W). Charges from 0-100% via AC wall outlet in only 70 minutes. Supports 220W solar input.",
        "specifications": json.dumps({"capacity": "768 Wh", "battery_chemistry": "LFP (LiFePO4) 3000+ cycles to 80%", "ac_output": "3x AC Outlets (800W total, X-Boost 1600W)", "recharge_time": "70 minutes (Wall AC) / 3.5 hrs (Solar 220W)", "weight": "7.8 kg"})
    },
    {
        "id": 1903,
        "name": "Baseus Blade 100W Ultra-Slim Laptop Power Bank 20000mAh",
        "brand": "Baseus",
        "category": "Power Banks & Portable Power",
        "price": 6999.0,
        "stock": 35,
        "rating": 4.7,
        "review_count": 126,
        "image_url": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop",
        "description": "Only 0.7-inch thin flat profile easily slides into any laptop backpack sleeve. 100W USB-C Power Delivery charges high-end laptops, MacBooks, and Steam Deck. Numerical LED status display.",
        "specifications": json.dumps({"capacity": "20,000 mAh (74 Wh)", "thickness": "18mm (0.7-inch)", "ports": "2x USB-C (100W PD) + 2x USB-A (30W QC)", "protocols": "PD 3.0, QC 4+, SCP, FCP", "display": "LED Battery % and remaining time display"})
    },
    {
        "id": 1904,
        "name": "Belkin BoostCharge Pro 3-in-1 Wireless MagSafe Charger 15W",
        "brand": "Belkin",
        "category": "Power Banks & Portable Power",
        "price": 13990.0,
        "stock": 27,
        "rating": 4.8,
        "review_count": 68,
        "image_url": "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&auto=format&fit=crop",
        "description": "Architectural stainless steel tree design fast charges iPhone 12/13/14/15/16 at 15W with MagSafe, Apple Watch Ultra/Series fast charger, and dedicated Qi pad for AirPods Pro.",
        "specifications": json.dumps({"charging": "15W Official MagSafe (iPhone) + Fast Apple Watch Puck + 5W AirPods Qi", "material": "Premium Stainless Steel & Soft-touch Silicone", "compatibility": "MagSafe iPhone models, Apple Watch, AirPods with Wireless Case", "power_supply": "40W AC power brick included"})
    },
    {
        "id": 1905,
        "name": "UGREEN Nexode 300W 5-Port GaN Desktop Fast Charger",
        "brand": "UGREEN",
        "category": "Power Banks & Portable Power",
        "price": 18990.0,
        "stock": 15,
        "rating": 4.9,
        "review_count": 38,
        "image_url": "https://images.unsplash.com/photo-1541689592655-f5f52825a3b8?w=600&auto=format&fit=crop",
        "description": "Industry leading 300W Gallium Nitride (GaNFast) desktop charger. Powers up to three laptops simultaneously with single-port 140W PD 3.1 output. Thermal Guard temperature safety monitoring.",
        "specifications": json.dumps({"total_power": "300W GaN Desktop Charger", "ports": "4x USB-C + 1x USB-A", "max_single_port": "USB-C1: 140W (PD 3.1)", "safety": "Thermal Guard 2.0 temperature scanning 6,000 times/min", "form_factor": "Compact Vertical Desktop Design with 2m AC cable"})
    },

    # =========================================================================
    # 20. SMART HOME SECURITY & SURVEILLANCE (2001 - 2005)
    # =========================================================================
    {
        "id": 2001,
        "name": "EufyCam S330 (eufyCam 3) 4K Wireless Solar Security Camera 2-Cam Kit",
        "brand": "Eufy",
        "category": "Smart Security & Surveillance",
        "price": 49990.0,
        "stock": 14,
        "rating": 4.9,
        "review_count": 55,
        "image_url": "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop",
        "description": "Forever-power solar security system with integrated solar panel requiring only 2 hours of direct sunlight daily. 4K Ultra HD clarity, BionicMind AI facial recognition, and expandable local storage up to 16TB without monthly fees.",
        "specifications": json.dumps({"resolution": "4K Ultra HD (3840 x 2160)", "power": "Integrated Solar Panel + 13,000mAh Battery", "ai": "BionicMind On-Device Facial & Vehicle Recognition", "storage": "HomeBase 3 with expandable 2.5-inch hard drive up to 16TB", "monthly_fees": "Zero Monthly Subscription Fees"})
    },
    {
        "id": 2002,
        "name": "Ring Video Doorbell Pro 2 with 1536p HD Head-to-Toe Video",
        "brand": "Ring",
        "category": "Smart Security & Surveillance",
        "price": 22990.0,
        "stock": 20,
        "rating": 4.7,
        "review_count": 89,
        "image_url": "https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop",
        "description": "Premium hardwired smart doorbell with expanded Head-to-Toe field of view and 3D Motion Detection using radar technology. Bird's Eye View map perspective of visitor approach path and two-way talk with Audio+.",
        "specifications": json.dumps({"video": "1536p HD Head-to-Toe Video with HDR", "field_of_view": "150 Horizontal, 150 Vertical", "motion_detection": "3D Motion Detection with Bird's Eye View Radar", "audio": "Two-Way Talk with Audio+ and noise cancellation", "power": "Hardwired to existing doorbell wiring (16-24 VAC)"})
    },
    {
        "id": 2003,
        "name": "TP-Link Tapo C325WB 2K QHD ColorPro Outdoor Security Camera",
        "brand": "TP-Link",
        "category": "Smart Security & Surveillance",
        "price": 5499.0,
        "stock": 38,
        "rating": 4.8,
        "review_count": 132,
        "image_url": "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop",
        "description": "Revolutionary ColorPro night vision captures vivid daytime-like color video in pitch darkness without spotlights. 2K QHD resolution, IP66 weatherproof, smart AI person/animal/vehicle detection, and two-way audio.",
        "specifications": json.dumps({"night_vision": "ColorPro Night Vision (F1.0 super-aperture lens)", "resolution": "2K QHD (2688 x 1520)", "weatherproof": "IP66 Water and Dust Resistant", "ai_features": "Smart AI Detection for People, Pets, and Vehicles", "storage": "MicroSD slot up to 512GB + Cloud Option"})
    },
    {
        "id": 2004,
        "name": "Yale Assure Lock 2 Smart Keyless Deadbolt with Wi-Fi & Biometric",
        "brand": "Yale",
        "category": "Smart Security & Surveillance",
        "price": 23990.0,
        "stock": 17,
        "rating": 4.8,
        "review_count": 49,
        "image_url": "https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop",
        "description": "Sleek compact smart lock with built-in Wi-Fi and fingerprint biometric scanner. Unlock via fingerprint, backlit keypad pin, Yale Access app, Apple HomeKit, Alexa, or auto-unlock as you approach.",
        "specifications": json.dumps({"unlock_methods": "Fingerprint, Backlit Keypad, Phone App, Voice Assistant, Auto-Unlock", "connectivity": "Built-in Wi-Fi & Bluetooth (No bridge needed)", "integrations": "Apple HomeKit, Amazon Alexa, Google Home", "security": "Certified Commercial Grade 2 Deadbolt", "door_thickness": "1-3/8 inch to 2-1/4 inch"})
    },
    {
        "id": 2005,
        "name": "CP PLUS 4MP Intelligent Wi-Fi Pan-Tilt Security Dome Camera",
        "brand": "CP PLUS",
        "category": "Smart Security & Surveillance",
        "price": 2799.0,
        "stock": 60,
        "rating": 4.6,
        "review_count": 215,
        "image_url": "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop",
        "description": "360-degree pan and 85-degree tilt indoor surveillance camera with crisp 4MP resolution. Smart auto-tracking follows moving objects, motion alerts, full-duplex two-way audio, and privacy mode shutter.",
        "specifications": json.dumps({"resolution": "4MP (2560 x 1440)", "pan_tilt": "360 Horizontal Pan, 85 Vertical Tilt", "night_vision": "IR Night Vision up to 10 meters", "audio": "Built-in Microphone and Speaker with Two-Way Audio", "storage": "Up to 256GB MicroSD card supported"})
    },

    # =========================================================================
    # 21. ELECTRONIC MUSICAL & STUDIO AUDIO PRODUCTION (2101 - 2105)
    # =========================================================================
    {
        "id": 2101,
        "name": "Focusrite Scarlett 2i2 4th Gen USB Audio Interface",
        "brand": "Focusrite",
        "category": "Audio Production & Studio Gear",
        "price": 19490.0,
        "stock": 22,
        "rating": 4.9,
        "review_count": 114,
        "image_url": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop",
        "description": "Industry-standard audio interface featuring 4th Generation mic preamps with 69dB gain range. Redesigned Air Mode with Harmonic Drive, Auto Gain, Clip Safe, and flagship RedNet converters with 120dB dynamic range.",
        "specifications": json.dumps({"channels": "2 In / 2 Out", "preamps": "2x Scarlett 4th Gen Mic Preamps (69dB gain)", "conversion": "24-bit / 192 kHz (120dB Dynamic Range)", "features": "Auto Gain, Clip Safe, Re-engineered Air Mode", "connectivity": "USB Type-C Bus Powered"})
    },
    {
        "id": 2102,
        "name": "Shure SM7B Cardioid Dynamic Vocal Studio Microphone",
        "brand": "Shure",
        "category": "Audio Production & Studio Gear",
        "price": 37990.0,
        "stock": 16,
        "rating": 5.0,
        "review_count": 140,
        "image_url": "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop",
        "description": "Legendary broadcast dynamic microphone delivering exceptionally smooth, warm, and natural vocal reproduction. Internal air suspension shock isolation and advanced electromagnetic hum shielding.",
        "specifications": json.dumps({"transducer": "Dynamic (Moving Coil)", "polar_pattern": "Cardioid", "frequency_response": "50 Hz to 20 kHz", "controls": "Bass Roll-Off and Mid-Range Emphasis (Presence Boost) switches", "output": "3-pin XLR connector"})
    },
    {
        "id": 2103,
        "name": "Rode Rodecaster Pro II All-in-One Audio Production Studio",
        "brand": "Rode",
        "category": "Audio Production & Studio Gear",
        "price": 62990.0,
        "stock": 8,
        "rating": 4.9,
        "review_count": 37,
        "image_url": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop",
        "description": "Integrated audio production studio for podcasters, streamers, and musicians. 4 Revolution Preamps with ultra-low noise (-131.5dBV), quad-core audio processing engine with APHEX effects, SMART pads, and dual USB-C audio.",
        "specifications": json.dumps({"inputs": "4x Neutrik Combo Inputs (Mic, Line, Instrument)", "preamps": "Revolution Preamps with 76dB Gain", "dsp": "Quad-Core APHEX Audio Processing (Aural Exciter, Big Bottom)", "screen": "5.5-inch Full Color Haptic Touchscreen", "pads": "8x Fully Programmable SMART Pads with Bank Switching"})
    },
    {
        "id": 2104,
        "name": "Akai Professional MPK Mini MK3 25-Key USB MIDI Controller",
        "brand": "Akai",
        "category": "Audio Production & Studio Gear",
        "price": 8999.0,
        "stock": 35,
        "rating": 4.8,
        "review_count": 156,
        "image_url": "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&auto=format&fit=crop",
        "description": "Best-selling portable MIDI keyboard controller. 25 velocity-sensitive mini keys with Gen 2 dynamic keybed, 8 backlit velocity-sensitive MPC pads with Note Repeat, 8 rotary knobs, and 4-way thumbstick.",
        "specifications": json.dumps({"keys": "25 Velocity-Sensitive Mini Keys (Gen 2 Keybed)", "pads": "8 Bankable MPC Pads (16 total via Bank A/B)", "knobs": "8 360-Degree Assignable Endless Knobs", "controls": "4-Way Pitch Bend & Modulation Joystick, Arpeggiator", "software": "Includes MPC Beats, AIR Hybrid 3, Mini Grand"})
    },
    {
        "id": 2105,
        "name": "Elgato Wave:3 Premium USB Condenser Microphone for Streaming",
        "brand": "Elgato",
        "category": "Audio Production & Studio Gear",
        "price": 13990.0,
        "stock": 25,
        "rating": 4.8,
        "review_count": 82,
        "image_url": "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop",
        "description": "Cardioid condenser capsule engineered by Lewitt Audio. Proprietary Clipguard technology eliminates audio distortion automatically. Includes Wave Link digital mixing software with up to 9 independent channels.",
        "specifications": json.dumps({"capsule": "17mm Electret Condenser", "polar_pattern": "Cardioid", "resolution": "24-bit / 96 kHz", "anti_distortion": "Proprietary Clipguard Technology", "monitoring": "Zero-Latency 3.5mm Headphone Jack"})
    },

    # =========================================================================
    # 22. SMART ROBOTIC CLEANING & VACUUMS (2201 - 2205)
    # =========================================================================
    {
        "id": 2201,
        "name": "Roborock S8 Pro Ultra Robot Vacuum and Mop with RockDock Ultra",
        "brand": "Roborock",
        "category": "Robot Vacuums & Smart Cleaning",
        "price": 129999.0,
        "stock": 7,
        "rating": 4.9,
        "review_count": 51,
        "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop",
        "description": "All-in-one hands-free cleaning masterpiece. RockDock Ultra auto-washes mop, auto-dries with warm air, auto-empties dust for 7 weeks, and auto-refills water tank. 6000Pa HyperForce suction, DuoRoller Riser brush, and VibraRise 2.0 mopping.",
        "specifications": json.dumps({"suction_power": "6,000 Pa HyperForce", "dock": "RockDock Ultra (Auto-Wash, Dry, Empty & Refill)", "mopping": "VibraRise 2.0 Sonic Mopping (3,000 vibrations/min)", "navigation": "PreciSense LiDAR + Reactive 3D Obstacle Avoidance", "brush": "Dual Rubber DuoRoller System"})
    },
    {
        "id": 2202,
        "name": "Dyson V15 Detect Absolute Cordless Stick Vacuum Cleaner",
        "brand": "Dyson",
        "category": "Robot Vacuums & Smart Cleaning",
        "price": 62900.0,
        "stock": 18,
        "rating": 4.9,
        "review_count": 96,
        "image_url": "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&auto=format&fit=crop",
        "description": "Dyson's most powerful, intelligent cordless vacuum. Fluffy Optic cleaner head reveals invisible micro-dust on hard floors with a precisely angled green laser beam. Piezo acoustic sensor counts dust particles on LCD screen.",
        "specifications": json.dumps({"suction_power": "240 Air Watts", "laser": "Illuminated Fluffy Cleaner Head (Laser dust revelation)", "sensor": "Piezo Acoustic Dust Particle Counter & Auto-suction booster", "filtration": "Whole-machine HEPA filtration traps 99.99% particles to 0.1 microns", "runtime": "Up to 60 minutes fade-free power"})
    },
    {
        "id": 2203,
        "name": "Ecovacs Deebot T20 Omni Robot Vacuum with Hot Water Mop Washing",
        "brand": "Ecovacs",
        "category": "Robot Vacuums & Smart Cleaning",
        "price": 79999.0,
        "stock": 12,
        "rating": 4.8,
        "review_count": 42,
        "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop",
        "description": "First robot vacuum with 55C Hot Water Mop Washing to dissolve oil and grease stains effortlessly. 6000Pa suction power, auto-lift mop plate over carpets, TrueDetect 3D 3.0 obstacle avoidance, and YIKO voice assistant.",
        "specifications": json.dumps({"suction_power": "6,000 Pa", "mop_washing": "55C Hot Water Washing & Hot Air Drying", "mop_lift": "Auto-Lift 9mm on Carpets", "navigation": "TrueMapping 2.0 LiDAR + TrueDetect 3D", "station": "All-in-One OMNI Station (3L Dust bag, 4L Water tanks)"})
    },
    {
        "id": 2204,
        "name": "Dreame L10s Ultra Robot Vacuum with AI Action Obstacle Avoidance",
        "brand": "Dreame",
        "category": "Robot Vacuums & Smart Cleaning",
        "price": 64990.0,
        "stock": 14,
        "rating": 4.8,
        "review_count": 38,
        "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop",
        "description": "Dual rotary mops spinning at 180 RPM with 1kg downforce pressure. 5300Pa suction, RGB AI Action camera identifies shoes, cords, and pets in real-time, auto-emptying, auto-mop cleaning, and hot air drying.",
        "specifications": json.dumps({"suction_power": "5,300 Pa", "mopping_mechanism": "Dual Rotary Pressure Mops (180 RPM)", "ai_navigation": "AI Action RGB Camera + 3D Structured Light", "station": "Self-Emptying & Self-Cleaning Dock with Hot Air Dry", "battery": "5200mAh (Up to 210 mins runtime)"})
    },
    {
        "id": 2205,
        "name": "Eureka Forbes Robo iVac Robot Vacuum Cleaner with UV Sanitization",
        "brand": "Eureka Forbes",
        "category": "Robot Vacuums & Smart Cleaning",
        "price": 18999.0,
        "stock": 30,
        "rating": 4.5,
        "review_count": 118,
        "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop",
        "description": "Smart 2-in-1 sweeping and mopping robot tailored for Indian floor conditions with specialized UV-C germicidal disinfection. Gyroscope smart navigation, anti-fall sensors, and Forbes Smart app control.",
        "specifications": json.dumps({"functions": "Dry Sweeping + Wet Mopping + UV Disinfection", "suction": "2,700 Pa", "filtration": "3-Stage HEPA Filter", "sensors": "Anti-Drop, Anti-Collision, Smart Gyro Navigation", "battery": "2600mAh (Up to 110 minutes runtime)"})
    },

    # =========================================================================
    # 23. E-READERS & DIGITAL NOTE-TAKING (2301 - 2305)
    # =========================================================================
    {
        "id": 2301,
        "name": "Amazon Kindle Paperwhite Signature Edition 32GB 6.8-inch",
        "brand": "Amazon",
        "category": "E-Readers & Digital Paper",
        "price": 17999.0,
        "stock": 25,
        "rating": 4.9,
        "review_count": 210,
        "image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
        "description": "Glare-free 300 ppi Paperwhite display with auto-adjusting warm front light and wireless Qi charging. IPX8 waterproof for reading by the pool or in the bath, and up to 10 weeks of battery life.",
        "specifications": json.dumps({"display": "6.8-inch Paperwhite 300 ppi glare-free display", "storage": "32 GB", "battery": "Up to 10 weeks on single charge", "charging": "USB-C + Qi Wireless Charging", "waterproof": "IPX8 (Immersion in 2m freshwater for 60 mins)", "lighting": "Auto-adjusting warm light (17 LEDs)"})
    },
    {
        "id": 2302,
        "name": "Amazon Kindle Scribe 10.2-inch Digital Notebook with Premium Pen",
        "brand": "Amazon",
        "category": "E-Readers & Digital Paper",
        "price": 39990.0,
        "stock": 14,
        "rating": 4.8,
        "review_count": 62,
        "image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
        "description": "World's first 10.2-inch 300 ppi glare-free front-lit e-reader and digital notebook. Read and write just like on real paper with the battery-free Premium Pen featuring a dedicated eraser and shortcut button.",
        "specifications": json.dumps({"display": "10.2-inch 300 ppi glare-free Paperwhite screen", "storage": "16 GB", "pen": "Battery-Free Premium Pen with Eraser and Shortcut button", "features": "Handwritten Sticky Notes in Books, Notebooks, PDF Markup", "battery": "Months for reading / Weeks for writing"})
    },
    {
        "id": 2303,
        "name": "reMarkable 2 Next-Generation Paper Tablet with Marker Plus",
        "brand": "reMarkable",
        "category": "E-Readers & Digital Paper",
        "price": 49999.0,
        "stock": 12,
        "rating": 4.9,
        "review_count": 48,
        "image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
        "description": "World's thinnest tablet at just 4.7mm. CANVAS display engineered to replicate the exact friction and tactile feeling of paper. Distraction-free digital note-taking, handwriting-to-text conversion, and cloud sync.",
        "specifications": json.dumps({"thickness": "4.7 mm (World's thinnest tablet)", "display": "10.3-inch monochrome digital paper (226 DPI)", "surface": "Textured Paper-feel surface friction", "pen": "Marker Plus with built-in eraser (4096 pressure levels)", "battery": "Up to 2 weeks on single charge"})
    },
    {
        "id": 2304,
        "name": "BOOX Note Air3 C 10.3-inch Color ePaper Android Tablet with Stylus",
        "brand": "BOOX",
        "category": "E-Readers & Digital Paper",
        "price": 54990.0,
        "stock": 10,
        "rating": 4.8,
        "review_count": 31,
        "image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
        "description": "Kaleido 3 color ePaper display showing 4,096 soothing pastel colors. Powered by an octa-core CPU with Android 12, giving full access to Google Play Store apps like Kindle, Notion, and OneNote.",
        "specifications": json.dumps({"display": "10.3-inch Kaleido 3 Color ePaper (300 ppi B/W, 150 ppi Color)", "os": "Android 12 with full Google Play Store support", "cpu": "2.4 GHz Octa-core + BSR (BOOX Super Refresh)", "memory": "4GB RAM + 64GB Storage + MicroSD slot", "stylus": "Pen Plus with 4096 pressure sensitivity"})
    },
    {
        "id": 2305,
        "name": "Kobo Clara 2E Eco-Conscious Waterproof 6-inch eReader",
        "brand": "Kobo",
        "category": "E-Readers & Digital Paper",
        "price": 13990.0,
        "stock": 22,
        "rating": 4.7,
        "review_count": 57,
        "image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
        "description": "Eco-friendly exterior made with over 85% ocean-bound recycled plastic. 6-inch HD E Ink Carta 1200 glare-free display with ComfortLight PRO blue-light reduction, 16GB storage, and Bluetooth for audiobooks.",
        "specifications": json.dumps({"display": "6-inch E Ink Carta 1200 touchscreen (300 ppi)", "storage": "16 GB (Up to 12,000 eBooks)", "waterproofing": "IPX8 (Up to 60 minutes in 2 meters of water)", "audio": "Bluetooth wireless technology for Kobo Audiobooks", "lighting": "ComfortLight PRO adjustable brightness and color temperature"})
    },

    # =========================================================================
    # 24. AUTOMOTIVE ELECTRONICS & DASH CAMS (2401 - 2405)
    # =========================================================================
    {
        "id": 2401,
        "name": "70mai A810 4K HDR Dual-Vision Front & Rear Dash Cam with Sony Starvis 2",
        "brand": "70mai",
        "category": "Car Electronics & Dash Cams",
        "price": 19999.0,
        "stock": 26,
        "rating": 4.9,
        "review_count": 88,
        "image_url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop",
        "description": "Flagship 4K UHD dash cam featuring Sony STARVIS 2 IMX678 sensor for cinema-grade low-light HDR recording. Built-in GPS logger, ADAS intelligent driver assistance, AI motion detection parking surveillance.",
        "specifications": json.dumps({"sensor": "Sony STARVIS 2 IMX678 (4K Front) + 1080p HDR (Rear)", "resolution": "3840 x 2160 @ 60fps / 4K HDR @ 30fps", "field_of_view": "150 Wide Angle", "adas": "Forward Collision, Lane Departure, Pedestrian Alert", "gps": "Built-in GPS & GLONASS route tracking"})
    },
    {
        "id": 2402,
        "name": "VIOFO A229 Pro 3-Channel 4K Dash Cam (Front 4K + Interior + Rear)",
        "brand": "VIOFO",
        "category": "Car Electronics & Dash Cams",
        "price": 34990.0,
        "stock": 14,
        "rating": 4.9,
        "review_count": 46,
        "image_url": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop",
        "description": "Ultimate 3-channel protection for rideshare and personal vehicles. Dual Sony STARVIS 2 sensors recording 4K Front, 2K Rear, and 1080p Cabin interior with infrared night vision LEDs. Voice control in English.",
        "specifications": json.dumps({"channels": "3 Channels (Front 4K + Rear 2K + Cabin 1080p)", "sensors": "Dual Sony STARVIS 2 IMX678 (Front) & IMX675 (Rear)", "cabin_lights": "4x Infrared LED lights for total darkness cabin recording", "gps": "Quad-mode GPS logger built into mount", "wifi": "5GHz High-Speed Wi-Fi download"})
    },
    {
        "id": 2403,
        "name": "Pioneer DMH-WT8600NEX 10.1-inch Floating Screen Wireless CarPlay Receiver",
        "brand": "Pioneer",
        "category": "Car Electronics & Dash Cams",
        "price": 79990.0,
        "stock": 8,
        "rating": 4.8,
        "review_count": 31,
        "image_url": "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop",
        "description": "Massive 10.1-inch capacitive HD floating touchscreen head unit fitting single or double DIN dash slots. Wireless Apple CarPlay, Wireless Android Auto, Amazon Alexa built-in, and 24-bit True Color FLAC audio playback.",
        "specifications": json.dumps({"display": "10.1-inch Capacitive HD Touchscreen (Floating Display)", "wireless": "Wireless Apple CarPlay, Wireless Android Auto, Bluetooth", "audio": "13-Band Graphic EQ, 3x 4V RCA Preouts, Hi-Res Audio FLAC", "camera_inputs": "Dual Camera Inputs with Parking Guidelines", "power": "50W x 4 Channels MOSFET"})
    },
    {
        "id": 2404,
        "name": "DDPAI Mini Pro 1296p HD Smart Car Dash Camera with Super Capacitor",
        "brand": "DDPAI",
        "category": "Car Electronics & Dash Cams",
        "price": 3499.0,
        "stock": 45,
        "rating": 4.7,
        "review_count": 140,
        "image_url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop",
        "description": "330-degree rotatable compact cylinder dash cam recording 1296p Super HD. Super capacitor withstands extreme Indian summer heat (-20C to 70C) safely without lithium battery swelling risks.",
        "specifications": json.dumps({"resolution": "2304 x 1296p (Super HD 3MP)", "power_source": "Super Capacitor (No lithium battery, heat safe)", "lens": "140 Wide Angle F2.0 with Night Vision", "wifi": "Built-in Wi-Fi & DDPAI App connection", "storage": "MicroSD up to 256GB with Loop Recording"})
    },
    {
        "id": 2405,
        "name": "Qubo Smart Dash Cam Pro 3X with AI Incident Detection by Hero Group",
        "brand": "Qubo",
        "category": "Car Electronics & Dash Cams",
        "price": 4290.0,
        "stock": 50,
        "rating": 4.6,
        "review_count": 165,
        "image_url": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop",
        "description": "Made-in-India smart dash cam with crisp 3MP resolution and WDR night vision. AI motion and emergency collision G-sensor automatically locks accident footage. Includes GPS tracking module support.",
        "specifications": json.dumps({"resolution": "3MP (2304 x 1296)", "view_angle": "140 Diagonal Wide Angle", "sensor": "G-Sensor for automatic collision locking", "app": "Qubo Pro App (Available in Hindi & English)", "temperature": "Tested for extreme Indian climates up to 65C"})
    },

    # =========================================================================
    # 25. FLAGSHIP SMARTPHONES & HIGH-END LAPTOPS ADDITIONS (2501 - 2508)
    # =========================================================================
    {
        "id": 2501,
        "name": "Apple iPhone 16 Pro Max 256GB Desert Titanium",
        "brand": "Apple",
        "category": "Smartphones",
        "price": 144900.0,
        "stock": 18,
        "rating": 4.9,
        "review_count": 180,
        "image_url": "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop",
        "description": "Stunning Grade 5 titanium design with larger 6.9-inch Super Retina XDR display. Powered by the groundbreaking A18 Pro chip, Camera Control button, 48MP Fusion camera with 4K 120fps Dolby Vision, and 5x optical telephoto.",
        "specifications": json.dumps({"display": "6.9-inch Super Retina XDR OLED (120Hz ProMotion)", "processor": "A18 Pro chip with 6-core GPU", "camera": "48MP Fusion + 48MP Ultra Wide + 12MP 5x Telephoto", "video": "4K 120fps Dolby Vision, ProRes, Spatial Audio", "battery": "Up to 33 hours video playback, MagSafe 25W"})
    },
    {
        "id": 2502,
        "name": "Samsung Galaxy S24 Ultra 512GB Titanium Gray with S-Pen",
        "brand": "Samsung",
        "category": "Smartphones",
        "price": 139999.0,
        "stock": 22,
        "rating": 4.9,
        "review_count": 164,
        "image_url": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop",
        "description": "The pinnacle of Android innovation. Titanium frame with Corning Gorilla Armor anti-reflective display. Powered by Snapdragon 8 Gen 3 for Galaxy, Galaxy AI with Circle to Search, 200MP camera, and 5x optical 50MP telephoto.",
        "specifications": json.dumps({"display": "6.8-inch Dynamic AMOLED 2X QHD+ 120Hz (2600 nits)", "processor": "Snapdragon 8 Gen 3 for Galaxy", "camera": "200MP Main + 50MP 5x Periscope + 10MP 3x + 12MP Ultra Wide", "ai": "Galaxy AI (Live Translate, Note Assist, Generative Edit)", "s_pen": "Built-in S-Pen stylus with Bluetooth gestures"})
    },
    {
        "id": 2503,
        "name": "Google Pixel 9 Pro XL 256GB Porcelain with Google Tensor G4",
        "brand": "Google",
        "category": "Smartphones",
        "price": 124999.0,
        "stock": 15,
        "rating": 4.8,
        "review_count": 92,
        "image_url": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop",
        "description": "Super Actua 6.8-inch display reaching 3000 nits peak brightness. Tensor G4 with 16GB RAM for Gemini AI. Triple pro camera system with Video Boost 8K, Super Res Zoom up to 30x, and 7 years of OS updates.",
        "specifications": json.dumps({"display": "6.8-inch Super Actua OLED (1-120Hz LTPO, 3000 nits)", "processor": "Google Tensor G4 with Titan M2 security coprocessor", "ram_storage": "16GB RAM, 256GB Storage", "camera": "50MP Wide + 48MP Ultra Wide with Macro + 48MP 5x Telephoto", "support": "7 years of OS, security, and Pixel Feature Drops"})
    },
    {
        "id": 2504,
        "name": "Apple MacBook Pro 16-inch M3 Max 36GB Unified RAM 1TB SSD",
        "brand": "Apple",
        "category": "Laptops",
        "price": 349900.0,
        "stock": 6,
        "rating": 5.0,
        "review_count": 45,
        "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop",
        "description": "Unprecedented workstation power in Space Black. Apple M3 Max with 14-core CPU and 30-core GPU. Liquid Retina XDR display with 1600 nits peak brightness, hardware-accelerated ray tracing, and 22-hour battery life.",
        "specifications": json.dumps({"processor": "Apple M3 Max (14-core CPU, 30-core GPU, 16-core Neural Engine)", "memory": "36GB Unified Memory", "storage": "1TB Superfast NVMe SSD", "display": "16.2-inch Liquid Retina XDR (3456x2234, 120Hz ProMotion)", "ports": "3x Thunderbolt 4, HDMI 2.1, SDXC card slot, MagSafe 3", "battery": "Up to 22 hours"})
    },
    {
        "id": 2505,
        "name": "ASUS ROG Zephyrus G16 OLED Intel Core Ultra 9 RTX 4080 Gaming Laptop",
        "brand": "ASUS",
        "category": "Laptops",
        "price": 279990.0,
        "stock": 7,
        "rating": 4.9,
        "review_count": 39,
        "image_url": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop",
        "description": "Precision CNC-machined aluminum chassis only 1.49cm thin. 16-inch 2.5K 240Hz 0.2ms ROG Nebula OLED display, Intel Core Ultra 9 185H processor, NVIDIA GeForce RTX 4080 12GB GPU, and Slash Lighting on the lid.",
        "specifications": json.dumps({"cpu": "Intel Core Ultra 9 185H (16 Cores, Intel AI Boost NPU)", "gpu": "NVIDIA GeForce RTX 4080 Laptop GPU 12GB GDDR6", "display": "16-inch 2.5K (2560x1600) 240Hz 0.2ms OLED G-SYNC", "ram_storage": "32GB LPDDR5X-7467 MHz, 2TB PCIe 4.0 SSD", "weight": "1.85 kg ultra-portable"})
    },
    {
        "id": 2506,
        "name": "Lenovo Legion Pro 7i Gen 9 Intel Core i9 RTX 4090 Gaming Laptop",
        "brand": "Lenovo",
        "category": "Laptops",
        "price": 319990.0,
        "stock": 5,
        "rating": 5.0,
        "review_count": 32,
        "image_url": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop",
        "description": "Unrivaled competitive esports titan. Intel Core i9-14900HX CPU paired with maximum 175W TGP NVIDIA GeForce RTX 4090 16GB GPU. Legion Coldfront vapor chamber cooling and 16-inch WQXGA 240Hz display.",
        "specifications": json.dumps({"cpu": "Intel Core i9-14900HX (24 Cores / 32 Threads, up to 5.8 GHz)", "gpu": "NVIDIA GeForce RTX 4090 16GB GDDR6 (175W TGP)", "ram_storage": "32GB DDR5-5600 MHz, 2TB PCIe Gen 4 SSD", "display": "16-inch WQXGA (2560x1600) IPS 240Hz 500 nits 100% DCI-P3", "keyboard": "Per-key RGB Legion TrueStrike with 1.5mm key travel"})
    },
    {
        "id": 2507,
        "name": "Sony Alpha 7 IV Full-Frame Mirrorless Camera with 28-70mm Zoom Lens",
        "brand": "Sony",
        "category": "Cameras & Gaming",
        "price": 219990.0,
        "stock": 9,
        "rating": 4.9,
        "review_count": 74,
        "image_url": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop",
        "description": "The all-rounder standard for hybrid creators. 33MP full-frame Exmor R back-illuminated sensor, BIONZ XR engine, 4K 60p 10-bit 4:2:2 video, S-Cinetone color science, and real-time Eye AF for humans, animals, and birds.",
        "specifications": json.dumps({"sensor": "33.0 MP 35mm Full-Frame Back-Illuminated Exmor R CMOS", "processor": "BIONZ XR image processing engine", "autofocus": "759 phase-detection AF points with Real-time Eye AF", "video": "4K 60p (Super 35), 4K 30p 7K oversampled 10-bit 4:2:2", "stabilization": "5-axis in-body optical image stabilization (5.5 steps)"})
    },
    {
        "id": 2508,
        "name": "Nintendo Switch OLED Model Mario Red Edition Console",
        "brand": "Nintendo",
        "category": "Cameras & Gaming",
        "price": 32990.0,
        "stock": 20,
        "rating": 4.8,
        "review_count": 115,
        "image_url": "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&auto=format&fit=crop",
        "description": "Signature Mario Red hue featuring subtle hidden silhouette coin motifs. Vibrant 7-inch OLED screen with vivid colors and crisp contrast, wide adjustable stand, enhanced audio, and dock with wired LAN port.",
        "specifications": json.dumps({"screen": "7.0-inch OLED multi-touch display (1280 x 720)", "storage": "64 GB internal storage (expandable with microSD up to 2TB)", "modes": "TV Mode, Tabletop Mode, Handheld Mode", "dock": "Includes dock with wired RJ45 LAN port and HDMI", "battery": "4.5 to 9 hours depending on game"})
    }
]

def main():
    print(f"Connecting to PostgreSQL database at {DB_URL}...")
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    print(f"Upserting {len(EXPANDED_PRODUCTS)} expanded electronics products...")
    for p in EXPANDED_PRODUCTS:
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

    # Synchronize seed_products.json with all products from DB
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

