-- Seed Data for Agentic AI E-Commerce Platform
-- Passwords hashed using BCrypt:
-- admin / admin123 -> $2a$10$382pyVuk9zy0oXdzypfbbev6yt8zP2YlP1BtCETLG0HJBC1Bc8TWy
-- deepika / user123 -> $2a$10$laiIA7eA5y5Q.jm6mPYLleoISWvFuEbozEtt1ElWq3feIXHDDAeL.

INSERT INTO users (id, username, email, password_hash, role) VALUES
(1, 'admin', 'admin@ecommerce.local', '$2a$10$382pyVuk9zy0oXdzypfbbev6yt8zP2YlP1BtCETLG0HJBC1Bc8TWy', 'ROLE_ADMIN'),
(2, 'deepika', 'deepika@ecommerce.local', '$2a$10$laiIA7eA5y5Q.jm6mPYLleoISWvFuEbozEtt1ElWq3feIXHDDAeL.', 'ROLE_CUSTOMER')
ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash;

INSERT INTO user_preferences (user_id, preferred_categories, min_budget, max_budget, preferred_features) VALUES
(2, 'Laptops,Smartphones', 20000, 75000, 'Good battery life, 16 GB RAM, High resolution display')
ON CONFLICT (user_id) DO NOTHING;

-- Seed Products
INSERT INTO products (id, name, brand, category, price, stock, rating, review_count, image_url, description, specifications) VALUES
(101, 'Lenovo ThinkPad E14 Gen 5', 'Lenovo', 'Laptops', 62990.00, 24, 4.7, 5, 
'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop',
'Enterprise-grade professional laptop with military-spec durability and exceptional keyboard tactile feedback. Built specifically for developers, data analysts, and corporate power users requiring relentless reliability.',
'{"processor":"AMD Ryzen 7 7730U (8 cores, 16 threads, up to 4.5 GHz)","ram":"16GB DDR4 3200MHz (expandable to 40GB)","storage":"512GB PCIe Gen4 NVMe SSD","display":"14-inch WUXGA (1920x1200) IPS Anti-glare 300 nits 100% sRGB","battery":"57Wh with Rapid Charge (80% in 60 mins), up to 11.5 hours battery life","weight":"1.41 kg","os":"Windows 11 Home","ports":"1x USB-C 3.2, 1x USB-C (USB4), 2x USB-A, HDMI 2.1, RJ-45 Ethernet, Audio Jack"}'),

(102, 'Apple MacBook Air M2', 'Apple', 'Laptops', 94990.00, 15, 4.9, 6,
'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop',
'Incredibly thin and fast MacBook powered by next-generation M2 silicon. Silent fanless design with up to 18 hours of battery life and stunning Liquid Retina display, ideal for software engineering and creative workloads.',
'{"processor":"Apple M2 Chip (8-core CPU, 8-core GPU, 16-core Neural Engine)","ram":"16GB Unified Memory","storage":"256GB High-Speed SSD","display":"13.6-inch Liquid Retina with True Tone (2560x1664) 500 nits","battery":"52.6Wh Lithium-polymer, up to 18 hours battery life, MagSafe 3 charging","weight":"1.24 kg","os":"macOS Sequoia","ports":"MagSafe 3, 2x Thunderbolt / USB 4, 3.5mm Headphone Jack with high-impedance support"}'),

(103, 'ASUS Vivobook 15', 'ASUS', 'Laptops', 49990.00, 30, 4.3, 4,
'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop',
'Sleek modern laptop offering top-tier productivity features at an accessible budget. Features a crisp FHD display, fast Intel Core i5 processor, and ergonomic keyboard for long programming sessions.',
'{"processor":"Intel Core i5-1335U 13th Gen (10 cores, 12 threads, up to 4.6 GHz)","ram":"16GB DDR4 (8GB onboard + 8GB SO-DIMM)","storage":"512GB M.2 NVMe PCIe 3.0 SSD","display":"15.6-inch FHD (1920x1080) 16:9 Anti-glare 250 nits","battery":"42Wh 3-cell Li-ion, up to 6.5 hours battery life, 45W AC Adapter","weight":"1.70 kg","os":"Windows 11 Home","ports":"1x USB-C 3.2 Gen 1, 2x USB-A 3.2, 1x USB 2.0, HDMI 1.4, Combo Audio Jack"}'),

(104, 'Dell Inspiron 14 5430', 'Dell', 'Laptops', 73990.00, 18, 4.6, 4,
'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop',
'Premium 14-inch ultrabook featuring high-resolution 2.5K 16:10 display with ComfortView Plus and high-performance Intel Core i7 13th gen processor. Exceptional multitasker for development and media.',
'{"processor":"Intel Core i7-1360P 13th Gen (12 cores, 16 threads, up to 5.0 GHz)","ram":"16GB LPDDR5 4800MHz","storage":"1TB M.2 PCIe NVMe SSD","display":"14.0-inch 16:10 2.5K (2560x1600) Anti-Glare Non-Touch 300nits WVA Display","battery":"54Wh 4-cell with ExpressCharge, up to 8.5 hours battery life","weight":"1.53 kg","os":"Windows 11 Home","ports":"1x Thunderbolt 4 with Power Delivery & DisplayPort, 2x USB 3.2 Gen 1, HDMI 1.4, SD Card reader"}'),

(105, 'HP Pavilion 14', 'HP', 'Laptops', 56990.00, 22, 4.5, 4,
'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop',
'Well-rounded, compact lightweight notebook engineered for students, web developers, and mobile professionals. Features AMD Ryzen 5 with Radeon graphics and crisp IPS display.',
'{"processor":"AMD Ryzen 5 7530U (6 cores, 12 threads, up to 4.5 GHz)","ram":"16GB DDR4 3200MHz","storage":"512GB PCIe NVMe M.2 SSD","display":"14-inch FHD (1920x1080) IPS Micro-edge Anti-glare 300 nits","battery":"43Wh Li-ion polymer, up to 9 hours battery life with Fast Charge","weight":"1.41 kg","os":"Windows 11 Home","ports":"1x USB Type-C 10Gbps, 2x USB Type-A, HDMI 2.1, Headphone/Microphone combo"}'),

(106, 'Acer Nitro V 15 Gaming', 'Acer', 'Laptops', 72990.00, 12, 4.4, 3,
'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop',
'High-octane gaming and deep learning machine equipped with dedicated NVIDIA GeForce RTX 4050 GPU, dual fan cooling, and fast 144Hz high refresh rate screen.',
'{"processor":"Intel Core i5-13420H 13th Gen (8 cores, 12 threads, up to 4.6 GHz)","ram":"16GB DDR5 5200MHz","storage":"512GB PCIe Gen4 NVMe SSD","graphics":"NVIDIA GeForce RTX 4050 6GB GDDR6 VRAM","display":"15.6-inch FHD (1920x1080) IPS 144Hz 3ms high refresh rate","battery":"57Wh Li-ion battery, approx 4.5 hours gaming/normal battery life","weight":"2.10 kg","os":"Windows 11 Home","ports":"1x Thunderbolt 4, 3x USB 3.2 Gen 1, HDMI 2.1, Gigabit Ethernet RJ-45"}'),

(201, 'Google Pixel 8a', 'Google', 'Smartphones', 42990.00, 28, 4.8, 5,
'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop',
'Flagship-level photography powered by Google Tensor G3 and AI photo editing magic. Best-in-class low light camera, pure Android with 7 years of OS updates, and vibrant 120Hz Actua OLED display.',
'{"processor":"Google Tensor G3 with Titan M2 security coprocessor","ram":"8GB LPDDR5x","storage":"128GB UFS 3.1","camera":"Dual Rear: 64MP Quad PD Wide (f/1.89, OIS) + 13MP Ultra-wide (120 FOV); 13MP Front Camera","display":"6.1-inch Actua OLED (1080x2400) up to 120Hz, 2000 nits peak brightness","battery":"4492mAh with 18W Fast Charging and Qi Wireless Charging, up to 24+ hours battery life","os":"Android 14 (7 years OS & security updates)","connectivity":"5G Sub-6, Wi-Fi 6E, Bluetooth 5.3, NFC, IP67 dust/water resistance"}'),

(202, 'Samsung Galaxy S23 FE', 'Samsung', 'Smartphones', 37990.00, 20, 4.5, 4,
'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop',
'Fan Edition flagship smartphone with pro-grade 50MP triple lens system, telephoto zoom, premium glass back, and stunning Dynamic AMOLED 2X display.',
'{"processor":"Samsung Exynos 2200 4nm Octa-Core","ram":"8GB RAM","storage":"128GB Internal","camera":"Triple Rear: 50MP Primary (OIS) + 12MP Ultra-wide + 8MP Telephoto (3x Optical Zoom, 30x Space Zoom); 10MP Selfie","display":"6.4-inch Dynamic AMOLED 2X FHD+ (1080x2340) 120Hz adaptive, 1450 nits","battery":"4500mAh with 25W Super Fast Charging, wireless charging support, all-day battery life","os":"One UI 6.1 on Android 14","connectivity":"5G Dual SIM, Wi-Fi 6E, Bluetooth 5.3, IP68 water resistance"}'),

(203, 'OnePlus Nord 4 5G', 'OnePlus', 'Smartphones', 29990.00, 35, 4.6, 5,
'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop',
'All-metal unibody smartphone engineered with Snapdragon 7+ Gen 3 powerhouse chip, huge 5500mAh battery with blazing 100W SuperVOOC fast charging that hits 100% in 28 minutes.',
'{"processor":"Qualcomm Snapdragon 7+ Gen 3 4nm (up to 2.8 GHz)","ram":"12GB LPDDR5X","storage":"256GB UFS 4.0","camera":"Dual Rear: 50MP Sony LYT-600 with OIS (f/1.8) + 8MP 112 Ultra-wide; 16MP Front","display":"6.74-inch 1.5K AMOLED (2772x1240) 120Hz Ultra HDR, 2150 nits peak","battery":"5500mAh Dual-cell battery with 100W SUPERVOOC charging (charger in box), 1.5-2 days battery life","os":"OxygenOS 14 based on Android 14 (4 years OS updates)","connectivity":"5G Dual SIM, Wi-Fi 6, Bluetooth 5.4, IR Blaster, IP65"}'),

(204, 'Redmi Note 13 Pro+ 5G', 'Xiaomi', 'Smartphones', 27990.00, 25, 4.4, 4,
'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop',
'Stunning curved 1.5K AMOLED phone boasting a massive 200MP Samsung ISOCELL sensor with lossless in-sensor zoom, IP68 water resistance, and 120W HyperCharge.',
'{"processor":"MediaTek Dimensity 7200-Ultra 4nm","ram":"12GB LPDDR5","storage":"256GB UFS 3.1","camera":"Triple Rear: 200MP Primary (Samsung HP3, OIS, f/1.65) + 8MP Ultra-wide + 2MP Macro; 16MP Selfie","display":"6.67-inch Curved 1.5K CrystalRes AMOLED (2712x1220) 120Hz Dolby Vision, 1800 nits","battery":"5000mAh with 120W HyperCharge (100% in 19 mins)","os":"Xiaomi HyperOS based on Android 14","connectivity":"5G, Wi-Fi 6, Bluetooth 5.3, IP68 rating"}'),

(301, 'Sony WH-1000XM5 Noise-Canceling Headphones', 'Sony', 'Audio & Headphones', 26990.00, 16, 4.8, 4,
'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop',
'Industry standard active noise cancellation powered by dual processors and 8 microphones. Auto NC optimizer, crystal clear hands-free calling with AI voice pickup, and 30 hours of continuous playback.',
'{"type":"Over-Ear Wireless ANC Headphones","drivers":"30mm carbon fiber composite dome drivers","noise_cancellation":"Dual Processors (Integrated Processor V1 + HD Noise Cancelling Processor QN1) with 8 microphones","battery":"Up to 30 hours with ANC on (40 hours with ANC off), 3 min quick charge gives 3 hours","codecs":"LDAC, AAC, SBC, Hi-Res Audio Wireless certified","connectivity":"Bluetooth 5.2, Multipoint connection (pair 2 devices simultaneously), 3.5mm AUX jack","weight":"250g lightweight ergonomic design"}'),

(302, 'Bose QuietComfort 45', 'Bose', 'Audio & Headphones', 21990.00, 14, 4.7, 3,
'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop',
'Iconic comfort and quietude with Bose acoustic noise cancelling technology, plush synthetic leather ear cushions, balanced TriPort acoustic architecture, and simple physical controls.',
'{"type":"Over-Ear Wireless Active Noise Cancelling Headphones","battery":"Up to 22 hours per charge, 15-minute quick charge yields 3 hours","modes":"Quiet Mode (full ANC) and Aware Mode (hear surroundings)","weight":"240g ultra-comfortable lightweight build","connectivity":"Bluetooth 5.1 with range up to 30 feet, Bose Music App customizable EQ"}'),

(303, 'OnePlus Buds Pro 2', 'OnePlus', 'Audio & Headphones', 8990.00, 40, 4.5, 4,
'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop',
'Audiophile grade true wireless earbuds co-created with Dynaudio. MelodyBoost dual drivers, smart adaptive noise cancellation up to 48dB, spatial audio with head tracking, and low latency gaming mode.',
'{"type":"In-Ear True Wireless Earbuds","drivers":"MelodyBoost Dual Drivers (11mm woofer + 6mm tweeter)","noise_cancellation":"Smart Adaptive Noise Cancellation up to 48dB with personalized audio profile","battery":"Up to 39 hours total playtime with charging case (9 hours earbuds alone without ANC)","charging":"Warp Charge (10 mins gives 10 hours) + Qi Wireless Charging","connectivity":"Bluetooth 5.3, Google Fast Pair, Dual Connection, LHDC 4.0 Lossless"}'),

(304, 'Anker Soundcore Life Q30', 'Anker', 'Audio & Headphones', 5490.00, 50, 4.4, 4,
'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop',
'Outstanding value hybrid active noise cancelling headphones with custom 40mm silk-diaphragm drivers, 40 hours of playtime with ANC enabled, and customizable EQ via Soundcore app.',
'{"type":"Over-Ear Hybrid Active Noise Cancelling Headphones","drivers":"40mm Silk Diaphragm Drivers producing Hi-Res Audio","battery":"40 hours with ANC ON, 60 hours in Standard mode, 5 min charge gives 4 hours","noise_cancellation":"Hybrid Active Noise Cancellation with Transport, Outdoor, and Indoor modes","connectivity":"Bluetooth 5.0, NFC Fast Pairing, Multipoint 2-device switching"}')
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

-- Seed Customer Reviews
INSERT INTO reviews (product_id, user_id, reviewer_name, rating, review_text, created_at) VALUES
-- Reviews for ThinkPad E14 (101)
(101, 2, 'Deepika R.', 5, 'Best laptop I have ever used for software engineering! The keyboard is legendary with deep key travel. I run IntelliJ IDEA, Docker containers, and several Chrome tabs simultaneously and the Ryzen 7 with 16GB RAM handles it effortlessly without thermal throttling. Battery easily lasts 10 to 11 hours on coding tasks.', CURRENT_TIMESTAMP - INTERVAL '12 days'),
(101, NULL, 'Kavya S.', 5, 'Bought this for coding and university projects. Battery life is fantastic—I leave the charger at home. The 16:10 aspect ratio gives extra vertical space for code editors. Build quality is solid metal and MIL-STD tested. Highly recommended under ₹70,000 budget.', CURRENT_TIMESTAMP - INTERVAL '8 days'),
(101, NULL, 'Aarav Sharma', 4, 'Very reliable developer workstation. Linux installed like a breeze with complete hardware support. Screen brightness is 300 nits which is good indoors. Trackpoint is super convenient.', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(101, NULL, 'Sneha Patel', 5, 'Compilation times for Java and React projects are blazing fast. The 57Wh battery charges to 80% in an hour. Exactly what I needed for remote programming work.', CURRENT_TIMESTAMP - INTERVAL '2 days'),

-- Reviews for MacBook Air M2 (102)
(102, 2, 'Deepika R.', 5, 'The battery life on this M2 Air is unbelievable! I get 16 to 18 hours easily. Build quality and Liquid Retina screen are unmatched. Docker and VS Code fly on Apple Silicon with 16GB unified memory.', CURRENT_TIMESTAMP - INTERVAL '15 days'),
(102, NULL, 'Kavya S.', 5, 'Completely silent because there are no fans, yet it never gets hot during heavy coding sessions. Weight is only 1.24 kg which makes it the ultimate portable developer laptop. Worth every rupee.', CURRENT_TIMESTAMP - INTERVAL '10 days'),
(102, NULL, 'Rohan Verma', 5, 'Speaker quality is astonishing for such a thin laptop. MagSafe is great to prevent accidental drops. Fast compile times and buttery smooth UI.', CURRENT_TIMESTAMP - INTERVAL '4 days'),

-- Reviews for ASUS Vivobook 15 (103)
(103, NULL, 'Kavya S.', 4, 'Great budget laptop for coding and daily office tasks. 16GB RAM at under ₹50,000 is great value. Keyboard has good spacing. Battery life is around 5.5 to 6 hours on moderate brightness.', CURRENT_TIMESTAMP - INTERVAL '20 days'),
(103, NULL, 'Vikram Singh', 4, 'Solid budget pick for programming students. Intel Core i5 13th Gen compiles code quickly. The display viewing angles could be slightly better, but unbeatable value for money.', CURRENT_TIMESTAMP - INTERVAL '14 days'),

-- Reviews for Dell Inspiron 14 (104)
(104, 2, 'Deepika R.', 5, 'The 2.5K 16:10 screen is gorgeous and easy on the eyes during long programming sessions. Intel Core i7 with 1TB SSD gives huge storage and snappy performance. Battery lasts around 8 hours.', CURRENT_TIMESTAMP - INTERVAL '7 days'),
(104, NULL, 'Pooja Nair', 4, 'Lightweight and premium metal finish. Thunderbolt 4 port connects to external 4K monitor and power with a single cable. Great coding machine.', CURRENT_TIMESTAMP - INTERVAL '3 days'),

-- Reviews for HP Pavilion 14 (105)
(105, NULL, 'Kavya S.', 4, 'Very balanced laptop under ₹60,000 for programming. AMD Ryzen 5 runs cool and battery lasts around 8 to 9 hours of web browsing and code editing. Crisp IPS display.', CURRENT_TIMESTAMP - INTERVAL '11 days'),
(105, NULL, 'Kunal Joshi', 5, 'Compact, lightweight, and responsive. 16GB RAM handles multitasking with PyCharm and browser without stutter. Bang & Olufsen audio is clear.', CURRENT_TIMESTAMP - INTERVAL '6 days'),

-- Reviews for Acer Nitro V 15 (106)
(106, NULL, 'Varun Rao', 5, 'Got this for ML model training and gaming. The RTX 4050 6GB handles CUDA tensor workloads and AAA gaming smoothly. 144Hz screen is buttery smooth. Fans get audible under load.', CURRENT_TIMESTAMP - INTERVAL '9 days'),
(106, NULL, 'Ankit Mehra', 4, 'Powerhouse performance under ₹75,000. Battery life is around 4 hours as expected for a high-performance gaming laptop, but raw CPU and GPU horsepower is incredible.', CURRENT_TIMESTAMP - INTERVAL '4 days'),

-- Reviews for Pixel 8a (201)
(201, 2, 'Deepika R.', 5, 'The camera is phenomenal! Natural skin tones, brilliant HDR, and night sight captures details even in almost complete darkness. AI features like Best Take and Magic Eraser work like magic.', CURRENT_TIMESTAMP - INTERVAL '14 days'),
(201, NULL, 'Kavya S.', 5, 'Hands down the best camera phone under ₹50,000. Compact 6.1-inch form factor fits easily in one hand. 120Hz OLED screen is super bright outdoors. Battery easily lasts full day.', CURRENT_TIMESTAMP - INTERVAL '8 days'),
(201, NULL, 'Manish Tiwari', 4, 'Clean stock Android experience with 7 years of promised updates. Fast performance with Google Tensor G3. Portrait mode edge detection is flawless.', CURRENT_TIMESTAMP - INTERVAL '3 days'),

-- Reviews for Samsung Galaxy S23 FE (202)
(202, 2, 'Deepika R.', 4, 'Great all-rounder phone. 3x optical zoom camera takes crisp photos of distant subjects. Dynamic AMOLED screen is rich and vibrant. Gets slightly warm during gaming, but day-to-day use is smooth.', CURRENT_TIMESTAMP - INTERVAL '12 days'),
(202, NULL, 'Divya Nair', 5, 'Premium glass build feels like the flagship S23. 50MP main camera produces punchy, vibrant photos. Samsung One UI has tons of customization.', CURRENT_TIMESTAMP - INTERVAL '5 days'),

-- Reviews for OnePlus Nord 4 (203)
(203, NULL, 'Kavya S.', 5, 'Monster battery life! The 5500mAh cell easily lasts 2 full days of moderate use, and the 100W charger juices it up to 100% in under half an hour. Premium all-metal back feels solid.', CURRENT_TIMESTAMP - INTERVAL '9 days'),
(203, NULL, 'Siddharth Roy', 5, 'Snapdragon 7+ Gen 3 delivers flagship-level speed. 50MP Sony camera takes clear, sharp photos with optical image stabilization. OxygenOS is snappy and clean.', CURRENT_TIMESTAMP - INTERVAL '4 days'),

-- Reviews for Redmi Note 13 Pro+ (204)
(204, NULL, 'Harsh Vardhan', 4, 'The 200MP camera captures insane amount of detail in daylight. 120W charging is crazy fast—charges from zero to full in less than 20 minutes while getting ready. Curved AMOLED screen looks ultra-modern.', CURRENT_TIMESTAMP - INTERVAL '16 days'),

-- Reviews for Sony WH-1000XM5 (301)
(301, 2, 'Deepika R.', 5, 'The noise cancellation is astonishing! It completely silences loud office chatter, AC hum, and cafe noise so I can enter deep focus while programming. Battery lasts an entire week of work.', CURRENT_TIMESTAMP - INTERVAL '18 days'),
(301, NULL, 'Kavya S.', 5, 'Unbelievable comfort and sound quality. LDAC codec delivers rich acoustic depth. Multipoint connection seamlessly switches between my laptop and smartphone.', CURRENT_TIMESTAMP - INTERVAL '6 days'),

-- Reviews for Bose QuietComfort 45 (302)
(302, NULL, 'Suresh Menon', 5, 'Most comfortable headphones I have ever worn for 8+ hour work sessions. No clamping fatigue whatsoever. Bose noise cancellation is top notch.', CURRENT_TIMESTAMP - INTERVAL '13 days'),

-- Reviews for OnePlus Buds Pro 2 (303)
(303, NULL, 'Kavya S.', 5, 'Dynaudio dual drivers deliver crisp highs and punchy bass. Spatial audio with head tracking is immersive for movies and music. 48dB noise cancellation is great on the metro.', CURRENT_TIMESTAMP - INTERVAL '10 days'),

-- Reviews for Soundcore Life Q30 (304)
(304, NULL, 'Aditya Goyal', 4, 'Best value budget ANC headphones on the market. 40 hours battery with noise cancelling turned on, and the companion app lets you customize sound EQ perfectly.', CURRENT_TIMESTAMP - INTERVAL '15 days');

INSERT INTO users (id, username, email, password_hash, role) VALUES
(1, 'admin', 'admin@ecommerce.local', '$2a$10$382pyVuk9zy0oXdzypfbbev6yt8zP2YlP1BtCETLG0HJBC1Bc8TWy', 'ROLE_ADMIN'),
(2, 'deepika', 'deepika@ecommerce.local', '$2a$10$laiIA7eA5y5Q.jm6mPYLleoISWvFuEbozEtt1ElWq3feIXHDDAeL.', 'ROLE_CUSTOMER'),
(3, 'rahul_coder', 'rahul@ecommerce.local', '$2a$10$laiIA7eA5y5Q.jm6mPYLleoISWvFuEbozEtt1ElWq3feIXHDDAeL.', 'ROLE_CUSTOMER'),
(4, 'ananya_photo', 'ananya@ecommerce.local', '$2a$10$laiIA7eA5y5Q.jm6mPYLleoISWvFuEbozEtt1ElWq3feIXHDDAeL.', 'ROLE_CUSTOMER'),
(5, 'vikram_audio', 'vikram@ecommerce.local', '$2a$10$laiIA7eA5y5Q.jm6mPYLleoISWvFuEbozEtt1ElWq3feIXHDDAeL.', 'ROLE_CUSTOMER')
ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash;

INSERT INTO user_preferences (user_id, preferred_categories, min_budget, max_budget, preferred_features) VALUES
(2, 'Laptops,Smartphones', 20000, 75000, 'Good battery life, 16 GB RAM, High resolution display'),
(3, 'Laptops', 50000, 80000, '16GB RAM, Fast processor, Coding, Linux support'),
(4, 'Smartphones', 25000, 50000, 'OLED display, Camera with OIS, Night photography'),
(5, 'Audio & Headphones', 10000, 35000, 'Active Noise Cancellation, Hi-Res Audio, Long battery life')
ON CONFLICT (user_id) DO UPDATE SET preferred_categories = EXCLUDED.preferred_categories, max_budget = EXCLUDED.max_budget, preferred_features = EXCLUDED.preferred_features;

-- Seed Sample Interactions
INSERT INTO interactions (user_id, product_id, interaction_type, timestamp) VALUES
(2, 101, 'VIEW', CURRENT_TIMESTAMP - INTERVAL '10 days'),
(2, 101, 'WISHLIST', CURRENT_TIMESTAMP - INTERVAL '9 days'),
(2, 102, 'VIEW', CURRENT_TIMESTAMP - INTERVAL '8 days'),
(2, 101, 'CART', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(2, 101, 'PURCHASE', CURRENT_TIMESTAMP - INTERVAL '5 days'),

-- User 3 (Rahul - Coding laptops)
(3, 101, 'VIEW', CURRENT_TIMESTAMP - INTERVAL '7 days'),
(3, 101, 'WISHLIST', CURRENT_TIMESTAMP - INTERVAL '6 days'),
(3, 104, 'VIEW', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(3, 104, 'CART', CURRENT_TIMESTAMP - INTERVAL '4 days'),
(3, 104, 'PURCHASE', CURRENT_TIMESTAMP - INTERVAL '4 days'),
(3, 102, 'VIEW', CURRENT_TIMESTAMP - INTERVAL '3 days'),

-- User 4 (Ananya - Mobile Photography)
(4, 201, 'VIEW', CURRENT_TIMESTAMP - INTERVAL '8 days'),
(4, 201, 'WISHLIST', CURRENT_TIMESTAMP - INTERVAL '7 days'),
(4, 201, 'PURCHASE', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(4, 202, 'VIEW', CURRENT_TIMESTAMP - INTERVAL '4 days'),
(4, 204, 'VIEW', CURRENT_TIMESTAMP - INTERVAL '2 days'),

-- User 5 (Vikram - High-End Audio & Noise Cancellation)
(5, 301, 'VIEW', CURRENT_TIMESTAMP - INTERVAL '9 days'),
(5, 301, 'WISHLIST', CURRENT_TIMESTAMP - INTERVAL '8 days'),
(5, 301, 'PURCHASE', CURRENT_TIMESTAMP - INTERVAL '6 days'),
(5, 302, 'VIEW', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(5, 303, 'VIEW', CURRENT_TIMESTAMP - INTERVAL '3 days');

-- Seed Sample Orders
INSERT INTO orders (id, user_id, customer_name, customer_email, total_price, status, created_at) VALUES
(1001, 2, 'deepika', 'deepika@ecommerce.local', 62990.00, 'DELIVERED', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(1002, 2, 'deepika', 'deepika@ecommerce.local', 29990.00, 'SHIPPED', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(1003, 3, 'rahul_coder', 'rahul@ecommerce.local', 73990.00, 'DELIVERED', CURRENT_TIMESTAMP - INTERVAL '4 days'),
(1004, 4, 'ananya_photo', 'ananya@ecommerce.local', 42990.00, 'DELIVERED', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(1005, 5, 'vikram_audio', 'vikram@ecommerce.local', 28990.00, 'DELIVERED', CURRENT_TIMESTAMP - INTERVAL '6 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity) VALUES
(1001, 101, 'Lenovo ThinkPad E14 Gen 5', 62990.00, 1),
(1002, 203, 'OnePlus Nord 4 5G', 29990.00, 1),
(1003, 104, 'Dell Inspiron 14 5430', 73990.00, 1),
(1004, 201, 'Google Pixel 8a', 42990.00, 1),
(1005, 301, 'Sony WH-1000XM5', 28990.00, 1);
