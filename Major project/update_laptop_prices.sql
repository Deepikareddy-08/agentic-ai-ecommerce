-- Reduce Laptop Prices to Realistic, Affordable Rates across all tiers

-- 1. Entry Budget & Student Tier (Under 45,000)
-- Differentiate duplicate MacBook IDs into genuine budget student laptops
UPDATE products SET 
    name = 'Lenovo IdeaPad Slim 3 15.6-inch Laptop (Intel Core i3 12th Gen, 8GB RAM, 512GB SSD)',
    brand = 'Lenovo',
    price = 29990.0,
    description = 'Affordable, reliable everyday laptop designed for students, online classes, and daily office productivity with rapid charging and anti-glare display.',
    specifications = '{"processor": "Intel Core i3-1215U 12th Gen", "ram": "8GB DDR4", "storage": "512GB NVMe SSD", "display": "15.6-inch FHD Anti-Glare", "battery": "7.5 hours"}'
WHERE id = 2504;

UPDATE products SET 
    name = 'HP 15s AMD Ryzen 3 5300U 15.6-inch Laptop (8GB RAM, 512GB SSD)',
    brand = 'HP',
    price = 32990.0,
    description = 'Fast AMD Ryzen-powered laptop with micro-edge full HD display, long battery endurance, and HP TrueVision HD camera for meetings and coursework.',
    specifications = '{"processor": "AMD Ryzen 3 5300U (up to 3.8 GHz)", "ram": "8GB DDR4", "storage": "512GB PCIe NVMe SSD", "display": "15.6-inch Micro-Edge FHD", "battery": "8 hours"}'
WHERE id = 2514;

UPDATE products SET price = 34990.0 WHERE id = 103; -- ASUS Vivobook 15 (was 49,990)
UPDATE products SET price = 39990.0 WHERE id = 105; -- HP Pavilion 14 (was 56,990)
UPDATE products SET price = 44990.0 WHERE id = 101; -- Lenovo ThinkPad E14 Gen 5 (was 62,990)
UPDATE products SET price = 48990.0 WHERE id = 104; -- Dell Inspiron 14 5430 (was 73,990)

-- 2. Affordable Mid-Range & Gaming (50,000 - 65,000)
UPDATE products SET price = 51990.0 WHERE id = 114; -- ASUS TUF Gaming A15 (was 64,990)
UPDATE products SET price = 53990.0 WHERE id = 106; -- Acer Nitro V 15 Gaming (was 72,990)
UPDATE products SET price = 52990.0 WHERE id = 112; -- Acer Swift Go 14 AI OLED (was 69,990)
UPDATE products SET price = 57990.0 WHERE id = 2517; -- Acer Swift Go 14 AI OLED (was 79,990)

-- 3. Popular Thin & Light / High Performance (65,000 - 85,000)
UPDATE products SET price = 69990.0 WHERE id = 102; -- Apple MacBook Air M2 (was 94,990)
UPDATE products SET price = 74990.0 WHERE id = 111; -- Lenovo Legion Pro 5i Gaming (was 1,19,990)
UPDATE products SET price = 78990.0 WHERE id = 110; -- Dell XPS 13 9340 Ultrabook (was 1,39,990)
UPDATE products SET price = 82990.0 WHERE id = 109; -- ASUS ROG Zephyrus G14 (was 1,49,990)
UPDATE products SET price = 84990.0 WHERE id = 113; -- Samsung Galaxy Book4 Pro 360 (was 1,63,990)
UPDATE products SET price = 85990.0 WHERE id = 2515; -- HP Spectre x360 2-in-1 (was 1,54,999)
UPDATE products SET price = 87990.0 WHERE id = 2512; -- Dell XPS 15 9530 OLED (was 1,84,990)
UPDATE products SET price = 89990.0 WHERE id = 115; -- ASUS Zenbook Duo OLED (was 1,59,990)

-- 4. Premium & High-End Flagships (Significantly reduced from 2.3L - 3.5L down to 99k - 1.4L)
UPDATE products SET price = 99900.0 WHERE id = 107; -- Apple MacBook Pro 14 M3 Pro (was 1,99,900)
UPDATE products SET price = 108990.0 WHERE id = 116; -- Lenovo Legion Pro 7i RTX 4080 (was 2,34,990)
UPDATE products SET price = 112990.0 WHERE id = 117; -- Dell XPS 16 OLED (was 2,49,990)
UPDATE products SET price = 114990.0 WHERE id = 2516; -- Lenovo Legion Pro 7i Gen 9 (was 2,49,990)
UPDATE products SET price = 119990.0 WHERE id = 2505; -- ASUS ROG Zephyrus G16 RTX 4080 (was 2,79,990)
UPDATE products SET price = 112990.0 WHERE id = 2513; -- ASUS ROG Zephyrus G16 (was 2,19,990)
UPDATE products SET price = 124990.0 WHERE id = 2506; -- Lenovo Legion Pro 7i RTX 4090 (was 3,19,990)
UPDATE products SET price = 139900.0 WHERE id = 118; -- Apple MacBook Pro 16 M3 Max (was 3,49,900)

