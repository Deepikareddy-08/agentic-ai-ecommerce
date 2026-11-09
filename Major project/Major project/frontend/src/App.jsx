import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductDetailsModal from './components/ProductDetailsModal';
import AIAdvisorChat from './components/AIAdvisorChat';
import ComparisonView from './components/ComparisonView';
import CartDrawer from './components/CartDrawer';
import UserProfileModal from './components/UserProfileModal';
import AdminPanel from './components/AdminPanel';
import PaymentModal from './components/PaymentModal';
import { productApi, wishlistApi, interactionApi } from './services/api';
import { Sparkles, Search, CheckCircle2, Layers, X, ArrowRight } from 'lucide-react';

// Verified Default Catalog (ensures storefront is never empty even while backend boots)
const FALLBACK_PRODUCTS = [
  {
    "id": 304,
    "name": "Anker Soundcore Life Q30",
    "brand": "Anker",
    "category": "Audio & Headphones",
    "price": 5490,
    "stock": 50,
    "rating": 4.4,
    "reviewCount": 29,
    "imageUrl": "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop",
    "description": "Outstanding value hybrid active noise cancelling headphones with custom 40mm silk-diaphragm drivers, 40 hours playtime with ANC enabled, and app EQ.",
    "specifications": "{\"anc\": \"Hybrid ANC (Transport, Outdoor, Indoor)\", \"battery\": \"40 hours ANC on / 60 hours off\", \"drivers\": \"40mm Silk Diaphragm\"}",
    "createdAt": "2026-10-24T05:00:52.564409Z",
    "updatedAt": "2026-10-24T05:00:52.564409Z",
    "stockQuantity": 50
  },
  {
    "id": 305,
    "name": "OnePlus Nord Buds 2r Wireless Earbuds",
    "brand": "OnePlus",
    "category": "Audio & Headphones",
    "price": 2199,
    "stock": 55,
    "rating": 4.6,
    "reviewCount": 44,
    "imageUrl": "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=600&auto=format&fit=crop",
    "description": "Deep bass sound with 12.4mm extra-large titanium coated dynamic drivers, Dual Mic AI Clear Call noise reduction algorithm, Sound Master Equalizer, up to 38 hours battery life.",
    "specifications": "{\"driver\": \"12.4mm Titanium Dynamic Driver\", \"mics\": \"Dual Mic AI Clear Call\", \"battery\": \"38 hours playback with case\", \"latency\": \"94ms gaming mode\", \"rating\": \"IP55 dust and water resistant\"}",
    "createdAt": "2026-10-27T06:28:20.895679Z",
    "updatedAt": "2026-10-27T06:28:20.895679Z",
    "stockQuantity": 55
  },
  {
    "id": 306,
    "name": "OnePlus Buds 3 Truly Wireless Earbuds",
    "brand": "OnePlus",
    "category": "Audio & Headphones",
    "price": 5499,
    "stock": 45,
    "rating": 4.7,
    "reviewCount": 37,
    "imageUrl": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop",
    "description": "Flagship-level 49dB Smart Adaptive Active Noise Cancellation, dual dynamic drivers with 10.4mm woofer + 6mm tweeter, LHDC 5.0 Hi-Res Audio, up to 44 hours playtime with fast charging.",
    "specifications": "{\"anc\": \"49dB Smart Adaptive Active Noise Cancellation\", \"drivers\": \"Dual Dynamic 10.4mm + 6mm\", \"codecs\": \"LHDC 5.0 Hi-Res Audio, AAC, SBC\", \"battery\": \"44 hours total playtime\", \"fast_charge\": \"10 min charge for 7 hours\"}",
    "createdAt": "2026-10-27T06:28:20.895679Z",
    "updatedAt": "2026-10-27T06:28:20.895679Z",
    "stockQuantity": 45
  },
  {
    "id": 307,
    "name": "Apple AirPods Pro 2nd Gen",
    "brand": "Apple",
    "category": "Audio & Headphones",
    "price": 24900,
    "stock": 25,
    "rating": 4.9,
    "reviewCount": 56,
    "imageUrl": "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop",
    "description": "Powered by Apple H2 chip with up to 2x more Active Noise Cancellation, Adaptive Audio, Personalized Spatial Audio with dynamic head tracking, and USB-C MagSafe case.",
    "specifications": "{\"chip\": \"Apple H2 Headphone chip\", \"anc\": \"Pro-level Active Noise Cancellation\", \"battery\": \"6 hours (30 hours with case)\", \"features\": \"Adaptive Transparency, Conversation Awareness\", \"case\": \"MagSafe USB-C with Precision Finding\"}",
    "createdAt": "2026-10-27T06:28:20.895679Z",
    "updatedAt": "2026-10-27T06:28:20.895679Z",
    "stockQuantity": 25
  },
  {
    "id": 308,
    "name": "boAt Nirvana Ion ANC True Wireless Earbuds",
    "brand": "boAt",
    "category": "Audio & Headphones",
    "price": 2799,
    "stock": 35,
    "rating": 4.5,
    "reviewCount": 33,
    "imageUrl": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop",
    "description": "Crystal bionic sound with 32dB active noise cancellation, quad mics with ENx technology, beast mode 60ms ultra-low latency, insane 120 hours total playtime.",
    "specifications": "{\"anc\": \"32dB Active Noise Cancellation\", \"battery\": \"120 hours total playtime (24h per charge)\", \"latency\": \"60ms Beast Mode\", \"mics\": \"Quad Mics with ENx Technology\"}",
    "createdAt": "2026-10-27T06:28:20.895679Z",
    "updatedAt": "2026-10-27T06:28:20.895679Z",
    "stockQuantity": 35
  },
  {
    "id": 501,
    "name": "Apple Watch Series 9 GPS",
    "brand": "Apple",
    "category": "Smartwatches",
    "price": 41900,
    "stock": 20,
    "rating": 4.9,
    "reviewCount": 41,
    "imageUrl": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop",
    "description": "Powered by S9 SiP with 2000 nits Always-On Retina display, revolutionary Double Tap gesture, Blood Oxygen and ECG apps, crash detection, and water resistance up to 50 meters.",
    "specifications": "{\"display\": \"Always-On Retina up to 2000 nits\", \"sensors\": \"ECG, Blood Oxygen, Heart Rate, Temperature Sensing\", \"battery\": \"18 hours all-day (36 hours Low Power)\", \"water_resistance\": \"50m swimproof\"}",
    "createdAt": "2026-10-27T06:28:20.895679Z",
    "updatedAt": "2026-10-27T06:28:20.895679Z",
    "stockQuantity": 20
  },
  {
    "id": 502,
    "name": "Samsung Galaxy Watch 6 LTE",
    "brand": "Samsung",
    "category": "Smartwatches",
    "price": 28999,
    "stock": 18,
    "rating": 4.7,
    "reviewCount": 30,
    "imageUrl": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop",
    "description": "Advanced sleep coaching, comprehensive body composition analysis with BIA sensor, Sapphire Crystal AMOLED display with 20% larger screen and LTE connectivity.",
    "specifications": "{\"display\": \"Super AMOLED Sapphire Crystal\", \"sensors\": \"BioActive Sensor (Optical Heart + ECG + BIA)\", \"connectivity\": \"4G LTE + Bluetooth 5.3 + NFC\", \"os\": \"Wear OS powered by Samsung\"}",
    "createdAt": "2026-10-27T06:28:20.895679Z",
    "updatedAt": "2026-10-27T06:28:20.895679Z",
    "stockQuantity": 18
  },
  {
    "id": 504,
    "name": "Noise ColorFit Pro 5 AMOLED Smartwatch",
    "brand": "Noise",
    "category": "Smartwatches",
    "price": 3999,
    "stock": 40,
    "rating": 4.4,
    "reviewCount": 27,
    "imageUrl": "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop",
    "description": "Vibrant 1.85-inch AMOLED display with functional rotating crown, TruSync Bluetooth calling, SOS technology, rapid health suite, and 7-day battery life.",
    "specifications": "{\"display\": \"1.85-inch AMOLED 600 nits\", \"calling\": \"TruSync Bluetooth Calling\", \"battery\": \"Up to 7 days battery life\", \"water_resistance\": \"IP68 water resistant\"}",
    "createdAt": "2026-10-27T06:28:20.895679Z",
    "updatedAt": "2026-10-27T06:28:20.895679Z",
    "stockQuantity": 40
  },
  {
    "id": 505,
    "name": "boAt Wave Call 2 Bluetooth Calling Smartwatch",
    "brand": "boAt",
    "category": "Smartwatches",
    "price": 1499,
    "stock": 60,
    "rating": 4.3,
    "reviewCount": 35,
    "imageUrl": "https://images.unsplash.com/photo-1510017803434-a899398421b3?w=600&auto=format&fit=crop",
    "description": "Entry-level powerhouse smartwatch with 1.83-inch HD display, clear Bluetooth calling with dial pad, 700+ active sports modes, and customizable watch faces.",
    "specifications": "{\"display\": \"1.83-inch HD Display\", \"calling\": \"Single Chip BT Calling\", \"sports_modes\": \"700+ Active Modes\", \"battery\": \"Up to 5 days\"}",
    "createdAt": "2026-10-27T06:28:20.895679Z",
    "updatedAt": "2026-10-27T06:28:20.895679Z",
    "stockQuantity": 60
  },
  {
    "id": 601,
    "name": "Apple iPad Air M2 11-inch",
    "brand": "Apple",
    "category": "Tablets",
    "price": 59900,
    "stock": 16,
    "rating": 4.9,
    "reviewCount": 29,
    "imageUrl": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop",
    "description": "Redesigned 11-inch iPad Air supercharged by the Apple M2 chip. Liquid Retina display, landscape 12MP front camera with Center Stage, Apple Pencil Pro support, and all-day battery.",
    "specifications": "{\"chip\": \"Apple M2 8-core CPU / 9-core GPU\", \"display\": \"11-inch Liquid Retina with True Tone\", \"storage\": \"128GB High-Speed\", \"connectivity\": \"Wi-Fi 6E, USB-C\", \"pencil\": \"Supports Apple Pencil Pro\"}",
    "createdAt": "2026-10-27T06:28:20.895679Z",
    "updatedAt": "2026-10-27T06:28:20.895679Z",
    "stockQuantity": 16
  },
  {
    "id": 602,
    "name": "Samsung Galaxy Tab S9 FE",
    "brand": "Samsung",
    "category": "Tablets",
    "price": 34999,
    "stock": 20,
    "rating": 4.7,
    "reviewCount": 24,
    "imageUrl": "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&auto=format&fit=crop",
    "description": "10.9-inch 90Hz display, bundled IP68 water-resistant S Pen included in box, Vision Booster for outdoor visibility, massive 8000mAh battery, and Samsung DeX desktop mode.",
    "specifications": "{\"display\": \"10.9-inch 90Hz WQXGA Display\", \"pen\": \"Included IP68 S Pen in box\", \"battery\": \"8000 mAh with 45W Fast Charging\", \"durability\": \"IP68 water and dust resistance\", \"os\": \"Android 14 with Samsung DeX\"}",
    "createdAt": "2026-10-27T06:28:20.895679Z",
    "updatedAt": "2026-10-27T06:28:20.895679Z",
    "stockQuantity": 20
  },
  {
    "id": 603,
    "name": "Xiaomi Pad 6 11-inch 144Hz",
    "brand": "Xiaomi",
    "category": "Tablets",
    "price": 26999,
    "stock": 25,
    "rating": 4.6,
    "reviewCount": 31,
    "imageUrl": "https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=600&auto=format&fit=crop",
    "description": "Productivity and gaming tablet powered by Snapdragon 870, stunning 11-inch 2.8K 144Hz 10-bit display with Dolby Vision, quad stereo speakers, and 8840mAh battery.",
    "specifications": "{\"processor\": \"Qualcomm Snapdragon 870\", \"display\": \"11-inch 2.8K (2880x1800) 144Hz 7-stage refresh rate\", \"audio\": \"Quad Speakers with Dolby Atmos\", \"battery\": \"8840 mAh + 33W Fast Charging\"}",
    "createdAt": "2026-10-27T06:28:20.895679Z",
    "updatedAt": "2026-10-27T06:28:20.895679Z",
    "stockQuantity": 25
  },
  {
    "id": 604,
    "name": "OnePlus Pad 2 Snapdragon 8 Gen 3",
    "brand": "OnePlus",
    "category": "Tablets",
    "price": 39999,
    "stock": 18,
    "rating": 4.8,
    "reviewCount": 22,
    "imageUrl": "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&auto=format&fit=crop",
    "description": "Industry-first tablet featuring Snapdragon 8 Gen 3 flagship silicon. 12.1-inch 3K 144Hz 7:5 ReadFit display, 6-speaker sound system, 9510mAh battery with 67W SUPERVOOC.",
    "specifications": "{\"processor\": \"Snapdragon 8 Gen 3 Flagship\", \"display\": \"12.1-inch 3K (3000x2120) 144Hz 7:5 Display\", \"speakers\": \"6-Speaker Spatial Audio\", \"battery\": \"9510 mAh with 67W SUPERVOOC charging\"}",
    "createdAt": "2026-10-27T06:28:20.895679Z",
    "updatedAt": "2026-10-27T06:28:20.895679Z",
    "stockQuantity": 18
  },
  {
    "id": 101,
    "name": "Lenovo ThinkPad E14 Gen 5",
    "brand": "Lenovo",
    "category": "Laptops",
    "price": 62990,
    "stock": 20,
    "rating": 4.7,
    "reviewCount": 28,
    "imageUrl": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop",
    "description": "Enterprise-grade professional laptop with military-spec durability and exceptional keyboard tactile feedback. Built specifically for developers, data analysts, and corporate power users.",
    "specifications": "{\"processor\": \"AMD Ryzen 7 7730U\", \"ram\": \"16GB DDR4\", \"storage\": \"512GB NVMe SSD\", \"display\": \"14-inch WUXGA IPS 300 nits\", \"battery\": \"11.5 hours\"}",
    "createdAt": "2026-10-24T05:00:52.564409Z",
    "updatedAt": "2026-11-03T12:11:21.113847Z",
    "stockQuantity": 20
  },
  {
    "id": 102,
    "name": "Apple MacBook Air M2",
    "brand": "Apple",
    "category": "Laptops",
    "price": 94990,
    "stock": 13,
    "rating": 4.9,
    "reviewCount": 45,
    "imageUrl": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop",
    "description": "Incredibly thin and fast MacBook powered by Apple M2 silicon. Silent fanless design with up to 18 hours battery life and stunning Liquid Retina display.",
    "specifications": "{\"processor\": \"Apple M2 8-core CPU\", \"ram\": \"16GB Unified\", \"storage\": \"256GB SSD\", \"display\": \"13.6-inch Liquid Retina\", \"battery\": \"18 hours\"}",
    "createdAt": "2026-10-24T05:00:52.564409Z",
    "updatedAt": "2026-11-02T09:39:20.408477Z",
    "stockQuantity": 13
  },
  {
    "id": 302,
    "name": "Bose QuietComfort 45",
    "brand": "Bose",
    "category": "Audio & Headphones",
    "price": 21990,
    "stock": 14,
    "rating": 4.7,
    "reviewCount": 34,
    "imageUrl": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop",
    "description": "Iconic comfort and acoustic noise cancelling technology, plush synthetic leather ear cushions, balanced TriPort acoustics, and 22 hours playback.",
    "specifications": "{\"anc\": \"Quiet & Aware Modes\", \"battery\": \"22 hours\", \"weight\": \"240g lightweight\", \"connectivity\": \"Bluetooth 5.1\"}",
    "createdAt": "2026-10-24T05:00:52.564409Z",
    "updatedAt": "2026-10-24T05:00:52.564409Z",
    "stockQuantity": 14
  },
  {
    "id": 503,
    "name": "OnePlus Watch 2 with Dual Engine Architecture",
    "brand": "OnePlus",
    "category": "Smartwatches",
    "price": 24999,
    "stock": 22,
    "rating": 4.8,
    "reviewCount": 25,
    "imageUrl": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop",
    "description": "Groundbreaking Dual-Engine Architecture pairing Snapdragon W5 + BES2700 chips. Delivers an astonishing 100-hour battery life in Smart Mode, 1.43-inch AMOLED, Wear OS 4.",
    "specifications": "{\"battery\": \"Up to 100 hours Smart Mode / 12 days Power Saver\", \"chips\": \"Snapdragon W5 Gen 1 + BES2700 Dual Engine\", \"display\": \"1.43-inch AMOLED 1000 nits\", \"gps\": \"Dual-frequency L1+L5 GPS\", \"os\": \"Wear OS 4 by Google\"}",
    "createdAt": "2026-10-27T06:28:20.895679Z",
    "updatedAt": "2026-10-27T06:28:20.895679Z",
    "stockQuantity": 22
  },
  {
    "id": 701,
    "name": "Sony Alpha a6700 Mirrorless Camera",
    "brand": "Sony",
    "category": "Cameras & Gaming",
    "price": 136990,
    "stock": 10,
    "rating": 4.9,
    "reviewCount": 18,
    "imageUrl": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop",
    "description": "Next-generation APS-C mirrorless camera featuring 26MP Exmor R BSI sensor, AI processing unit for real-time subject recognition autofocus, and 4K 120p video recording.",
    "specifications": "{\"sensor\": \"26.0MP APS-C format Exmor R CMOS\", \"video\": \"4K 120p / 4K 60p 6K oversampled\", \"af\": \"AI-powered real-time tracking (human, animal, bird, vehicle)\", \"stabilization\": \"5-axis in-body image stabilization\"}",
    "createdAt": "2026-10-27T06:28:20.895679Z",
    "updatedAt": "2026-10-27T06:28:20.895679Z",
    "stockQuantity": 10
  },
  {
    "id": 702,
    "name": "GoPro Hero 12 Black Action Camera",
    "brand": "GoPro",
    "category": "Cameras & Gaming",
    "price": 37990,
    "stock": 25,
    "rating": 4.7,
    "reviewCount": 33,
    "imageUrl": "https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=600&auto=format&fit=crop",
    "description": "Best-in-class 5.3K 60fps HDR video, HyperSmooth 6.0 stabilization with 360 Horizon Lock, rugged waterproof build up to 33ft, and Bluetooth audio support for AirPods/mics.",
    "specifications": "{\"video\": \"5.3K60 / 4K120 / 2.7K240\", \"stabilization\": \"HyperSmooth 6.0 with AutoBoost\", \"waterproof\": \"10m (33ft) without housing\", \"battery\": \"Enduro Battery with 2x longer runtime\"}",
    "createdAt": "2026-10-27T06:28:20.895679Z",
    "updatedAt": "2026-10-27T06:28:20.895679Z",
    "stockQuantity": 25
  },
  {
    "id": 703,
    "name": "Sony PlayStation 5 Slim Console",
    "brand": "Sony",
    "category": "Cameras & Gaming",
    "price": 49990,
    "stock": 20,
    "rating": 4.9,
    "reviewCount": 65,
    "imageUrl": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop",
    "description": "Next-gen gaming console with custom AMD Zen 2 CPU, RDNA 2 GPU, ultra-high speed 1TB SSD, Ray Tracing, 4K 120Hz output, Tempest 3D AudioTech, and DualSense haptic feedback.",
    "specifications": "{\"storage\": \"1TB Custom High-Speed NVMe SSD\", \"graphics\": \"AMD RDNA 2 with Ray Tracing up to 4K 120Hz\", \"controller\": \"DualSense with Haptic Feedback & Adaptive Triggers\", \"audio\": \"Tempest 3D AudioTech\"}",
    "createdAt": "2026-10-27T06:28:20.895679Z",
    "updatedAt": "2026-10-27T06:28:20.895679Z",
    "stockQuantity": 20
  },
  {
    "id": 704,
    "name": "ASUS ROG Ally Z1 Extreme Handheld Gaming",
    "brand": "ASUS",
    "category": "Cameras & Gaming",
    "price": 59990,
    "stock": 15,
    "rating": 4.6,
    "reviewCount": 27,
    "imageUrl": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop",
    "description": "Windows 11 portable PC gaming console driven by AMD Ryzen Z1 Extreme with RDNA 3 graphics. 7-inch FHD 120Hz FreeSync Premium display and ergonomic controls.",
    "specifications": "{\"processor\": \"AMD Ryzen Z1 Extreme (8 cores, 16 threads, up to 5.1 GHz)\", \"graphics\": \"AMD Radeon RDNA 3 with 12 CUs\", \"ram\": \"16GB LPDDR5\", \"storage\": \"512GB PCIe 4.0 NVMe SSD\", \"display\": \"7-inch FHD 120Hz 500 nits\"}",
    "createdAt": "2026-10-27T06:28:20.895679Z",
    "updatedAt": "2026-10-27T06:28:20.895679Z",
    "stockQuantity": 15
  },
  {
    "id": 801,
    "name": "LG C3 55-inch 4K OLED evo Smart TV",
    "brand": "LG",
    "category": "Smart TVs & Home Entertainment",
    "price": 119990,
    "stock": 14,
    "rating": 4.9,
    "reviewCount": 68,
    "imageUrl": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop",
    "description": "Benchmark OLED evo display powered by alpha9 AI Processor Gen6. Infinite contrast, 100% color fidelity, Dolby Vision IQ, and 4x HDMI 2.1 ports with 120Hz VRR for gaming.",
    "specifications": "{\"screen_size\": \"55-inch\", \"display_tech\": \"4K OLED evo\", \"refresh_rate\": \"120Hz\", \"processor\": \"alpha9 AI 4K Gen6\", \"hdr\": \"Dolby Vision, HDR10, HLG\", \"audio\": \"40W 2.2ch Dolby Atmos\", \"hdmi_ports\": \"4x HDMI 2.1\", \"os\": \"webOS 23\"}",
    "createdAt": "2026-10-30T15:54:01.058756Z",
    "updatedAt": "2026-10-30T15:54:01.058756Z",
    "stockQuantity": 14
  },
  {
    "id": 802,
    "name": "Sony Bravia XR 65-inch 4K HDR Google TV A80L",
    "brand": "Sony",
    "category": "Smart TVs & Home Entertainment",
    "price": 184990,
    "stock": 9,
    "rating": 4.9,
    "reviewCount": 52,
    "imageUrl": "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&auto=format&fit=crop",
    "description": "Cognitive Processor XR delivers pure OLED contrast and authentic Acoustic Surface Audio+ where sound comes directly from the screen. Perfect for PS5 and cinema enthusiasts.",
    "specifications": "{\"screen_size\": \"65-inch\", \"display_tech\": \"Cognitive OLED\", \"refresh_rate\": \"120Hz\", \"processor\": \"Cognitive Processor XR\", \"hdr\": \"Dolby Vision, HDR10\", \"audio\": \"Acoustic Surface Audio+ (50W)\", \"os\": \"Google TV\"}",
    "createdAt": "2026-10-30T15:54:01.058756Z",
    "updatedAt": "2026-10-30T15:54:01.058756Z",
    "stockQuantity": 9
  },
  {
    "id": 803,
    "name": "Samsung Neo QLED 65-inch 4K QN90C Smart TV",
    "brand": "Samsung",
    "category": "Smart TVs & Home Entertainment",
    "price": 159990,
    "stock": 11,
    "rating": 4.8,
    "reviewCount": 44,
    "imageUrl": "https://images.unsplash.com/photo-1558888401-3cc1de77652d?w=600&auto=format&fit=crop",
    "description": "Quantum Matrix Technology with ultra-precise Mini LED backlighting. Stunning 2000 nits peak brightness, anti-glare screen, Neural Quantum Processor 4K, and Dolby Atmos.",
    "specifications": "{\"screen_size\": \"65-inch\", \"display_tech\": \"Neo QLED Mini LED\", \"refresh_rate\": \"120Hz (Up to 144Hz)\", \"processor\": \"Neural Quantum Processor 4K\", \"audio\": \"60W 4.2.2ch OTS+\", \"os\": \"Tizen OS\"}",
    "createdAt": "2026-10-30T15:54:01.058756Z",
    "updatedAt": "2026-10-30T15:54:01.058756Z",
    "stockQuantity": 11
  },
  {
    "id": 403,
    "name": "Wireless Ergonomic Keyboard and Mouse Combo for Laptop",
    "brand": "Logitech",
    "category": "Accessories",
    "price": 2499,
    "stock": 30,
    "rating": 4.5,
    "reviewCount": 14,
    "imageUrl": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop",
    "description": "Full-size wireless quiet keyboard and precision optical mouse bundle compatible with Windows and Mac laptops via 2.4GHz USB receiver.",
    "specifications": "{\"connectivity\": \"2.4GHz Wireless USB\", \"battery_life\": \"Up to 24 months\", \"layout\": \"Full-size 104 keys\"}",
    "createdAt": "2026-10-27T06:06:59.288147Z",
    "updatedAt": "2026-10-27T06:06:59.288147Z",
    "stockQuantity": 30
  },
  {
    "id": 106,
    "name": "Acer Nitro V 15 Gaming",
    "brand": "Acer",
    "category": "Laptops",
    "price": 72990,
    "stock": 12,
    "rating": 4.4,
    "reviewCount": 21,
    "imageUrl": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop",
    "description": "High-octane gaming and deep learning machine equipped with dedicated NVIDIA GeForce RTX 4050 GPU, dual fan cooling, and fast 144Hz high refresh rate screen.",
    "specifications": "{\"processor\": \"Intel Core i5-13420H\", \"ram\": \"16GB DDR5\", \"graphics\": \"NVIDIA RTX 4050 6GB\", \"storage\": \"512GB SSD\", \"display\": \"15.6-inch 144Hz FHD\"}",
    "createdAt": "2026-10-24T05:00:52.564409Z",
    "updatedAt": "2026-10-24T05:00:52.564409Z",
    "stockQuantity": 12
  },
  {
    "id": 201,
    "name": "Google Pixel 8a",
    "brand": "Google",
    "category": "Smartphones",
    "price": 42990,
    "stock": 28,
    "rating": 4.8,
    "reviewCount": 35,
    "imageUrl": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop",
    "description": "Flagship-level photography powered by Google Tensor G3 and AI photo editing magic. Pure Android with 7 years of OS updates and vibrant 120Hz Actua OLED display.",
    "specifications": "{\"processor\": \"Google Tensor G3\", \"ram\": \"8GB LPDDR5X\", \"storage\": \"128GB\", \"camera\": \"64MP + 13MP Dual OIS\", \"display\": \"6.1-inch 120Hz Actua OLED\", \"battery\": \"4492 mAh\"}",
    "createdAt": "2026-10-24T05:00:52.564409Z",
    "updatedAt": "2026-10-24T05:00:52.564409Z",
    "stockQuantity": 28
  },
  {
    "id": 402,
    "name": "65W GaN Fast Laptop Charger Adapter",
    "brand": "Anker",
    "category": "Accessories",
    "price": 2199,
    "stock": 45,
    "rating": 4.6,
    "reviewCount": 22,
    "imageUrl": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop",
    "description": "Ultra-compact 65W GaN fast charger power adapter with foldable prongs and detachable USB-C cable for laptops, tablets, and smartphones.",
    "specifications": "{\"power\": \"65W\", \"technology\": \"GaN II\", \"ports\": \"1x USB-C\", \"cable_length\": \"1.8m\"}",
    "createdAt": "2026-10-27T06:06:59.288147Z",
    "updatedAt": "2026-10-27T06:06:59.288147Z",
    "stockQuantity": 45
  },
  {
    "id": 404,
    "name": "Adjustable Aluminum Laptop Stand with Cooling Vents",
    "brand": "Portronics",
    "category": "Accessories",
    "price": 999,
    "stock": 60,
    "rating": 4.3,
    "reviewCount": 11,
    "imageUrl": "https://images.unsplash.com/photo-1616353071588-708dcff912e2?w=600&auto=format&fit=crop",
    "description": "Ergonomic 6-level height adjustable riser laptop stand constructed with sandblasted anodized aluminum for improved posture and airflow cooling.",
    "specifications": "{\"material\": \"Anodized Aluminum\", \"levels\": \"6 angles (15 to 45 deg)\", \"weight_capacity\": \"Up to 5 kg\"}",
    "createdAt": "2026-10-27T06:06:59.288147Z",
    "updatedAt": "2026-10-27T06:06:59.288147Z",
    "stockQuantity": 60
  },
  {
    "id": 405,
    "name": "USB-C 7-in-1 Multiport Hub Adapter for Laptops",
    "brand": "TP-Link",
    "category": "Accessories",
    "price": 1899,
    "stock": 40,
    "rating": 4.5,
    "reviewCount": 16,
    "imageUrl": "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600&auto=format&fit=crop",
    "description": "Aluminum 7-in-1 USB Type-C hub adapter featuring 4K HDMI, 3x USB 3.0 ports, SD/microSD card slots, and 100W Power Delivery pass-through.",
    "specifications": "{\"ports\": \"1x HDMI 4K@30Hz, 3x USB 3.0, SD, microSD, 100W PD\", \"material\": \"Aluminum Alloy\"}",
    "createdAt": "2026-10-27T06:06:59.288147Z",
    "updatedAt": "2026-10-27T06:06:59.288147Z",
    "stockQuantity": 40
  },
  {
    "id": 107,
    "name": "Apple MacBook Pro 14 M3 Pro",
    "brand": "Apple",
    "category": "Laptops",
    "price": 199900,
    "stock": 12,
    "rating": 4.9,
    "reviewCount": 52,
    "imageUrl": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop",
    "description": "The ultimate pro workstation powered by Apple M3 Pro silicon. Liquid Retina XDR display with ProMotion 120Hz, 18-hour battery, and Space Black finish.",
    "specifications": "{\"processor\": \"Apple M3 Pro 11-core CPU 14-core GPU\", \"ram\": \"18GB Unified\", \"storage\": \"512GB NVMe SSD\", \"display\": \"14.2-inch Liquid Retina XDR 120Hz\", \"battery\": \"18 hours\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-27T16:12:02.62123Z",
    "stockQuantity": 12
  },
  {
    "id": 109,
    "name": "ASUS ROG Zephyrus G14 Gaming Laptop",
    "brand": "ASUS",
    "category": "Laptops",
    "price": 149990,
    "stock": 16,
    "rating": 4.7,
    "reviewCount": 44,
    "imageUrl": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop",
    "description": "Ultraportable high-performance gaming laptop with CNC aluminum chassis, ROG Nebula 3K OLED 120Hz display, and NVIDIA RTX 4060 graphics.",
    "specifications": "{\"processor\": \"AMD Ryzen 9 8945HS\", \"ram\": \"16GB LPDDR5X\", \"storage\": \"1TB M.2 NVMe SSD\", \"graphics\": \"NVIDIA GeForce RTX 4060 8GB\", \"display\": \"14-inch 3K OLED 120Hz\", \"battery\": \"10 hours\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-27T16:12:02.62123Z",
    "stockQuantity": 16
  },
  {
    "id": 804,
    "name": "Xiaomi Smart TV X Pro 55-inch 4K Google TV",
    "brand": "Xiaomi",
    "category": "Smart TVs & Home Entertainment",
    "price": 41999,
    "stock": 25,
    "rating": 4.5,
    "reviewCount": 89,
    "imageUrl": "https://images.unsplash.com/photo-1461151304267-38535e780c79?w=600&auto=format&fit=crop",
    "description": "Premium metallic bezel-less design with 4K HDR10+ and Dolby Vision IQ. Vivid Picture Engine 2, Google TV with hands-free Google Assistant, and 30W Dolby Atmos speakers.",
    "specifications": "{\"screen_size\": \"55-inch\", \"display_tech\": \"4K UHD LED\", \"refresh_rate\": \"60Hz MEMC\", \"hdr\": \"Dolby Vision IQ, HDR10+\", \"audio\": \"30W Dolby Atmos / DTS:X\", \"ram_storage\": \"2GB RAM, 16GB Storage\", \"os\": \"Google TV\"}",
    "createdAt": "2026-10-30T15:54:01.058756Z",
    "updatedAt": "2026-10-30T15:54:01.058756Z",
    "stockQuantity": 25
  },
  {
    "id": 805,
    "name": "TCL 55-inch 4K QLED Google TV T6G",
    "brand": "TCL",
    "category": "Smart TVs & Home Entertainment",
    "price": 37990,
    "stock": 20,
    "rating": 4.4,
    "reviewCount": 63,
    "imageUrl": "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&auto=format&fit=crop",
    "description": "Quantum Dot technology offering over 1 billion colors with 94% DCI-P3 color volume. AiPQ Engine 3.0, Dolby Atmos, and AMD FreeSync for smooth everyday viewing and gaming.",
    "specifications": "{\"screen_size\": \"55-inch\", \"display_tech\": \"Quantum Dot QLED\", \"refresh_rate\": \"60Hz\", \"processor\": \"AiPQ Engine 3.0\", \"audio\": \"56W with Dolby Atmos\", \"ports\": \"3x HDMI, 2x USB\", \"os\": \"Google TV\"}",
    "createdAt": "2026-10-30T15:54:01.058756Z",
    "updatedAt": "2026-10-30T15:54:01.058756Z",
    "stockQuantity": 20
  },
  {
    "id": 806,
    "name": "Apple TV 4K (3rd Gen) 128GB Wi-Fi + Ethernet",
    "brand": "Apple",
    "category": "Smart TVs & Home Entertainment",
    "price": 16900,
    "stock": 35,
    "rating": 4.9,
    "reviewCount": 78,
    "imageUrl": "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600&auto=format&fit=crop",
    "description": "Powered by the blazing-fast A15 Bionic chip. Supports 4K Dolby Vision, HDR10+, Dolby Atmos cinematic audio, Thread mesh networking, and Siri Remote with USB-C.",
    "specifications": "{\"processor\": \"Apple A15 Bionic\", \"storage\": \"128GB NVMe\", \"video_output\": \"4K Dolby Vision, HDR10+\", \"audio_support\": \"Dolby Atmos 5.1 / 7.1\", \"connectivity\": \"Wi-Fi 6, Gigabit Ethernet, Bluetooth 5.0, Thread\", \"os\": \"tvOS 17\"}",
    "createdAt": "2026-10-30T15:54:01.058756Z",
    "updatedAt": "2026-10-30T15:54:01.058756Z",
    "stockQuantity": 35
  },
  {
    "id": 105,
    "name": "HP Pavilion 14",
    "brand": "HP",
    "category": "Laptops",
    "price": 56990,
    "stock": 21,
    "rating": 4.5,
    "reviewCount": 26,
    "imageUrl": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop",
    "description": "Well-rounded, compact lightweight notebook engineered for students, web developers, and mobile professionals. Features AMD Ryzen 5 with Radeon graphics and crisp IPS display.",
    "specifications": "{\"processor\": \"AMD Ryzen 5 7530U\", \"ram\": \"16GB DDR4\", \"storage\": \"512GB PCIe SSD\", \"display\": \"14-inch FHD IPS\", \"battery\": \"9 hours\"}",
    "createdAt": "2026-10-24T05:00:52.564409Z",
    "updatedAt": "2026-10-31T04:52:02.484722Z",
    "stockQuantity": 21
  },
  {
    "id": 110,
    "name": "Dell XPS 13 9340 Ultrabook",
    "brand": "Dell",
    "category": "Laptops",
    "price": 139990,
    "stock": 18,
    "rating": 4.6,
    "reviewCount": 27,
    "imageUrl": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop",
    "description": "Iconic minimalist ultrabook crafted from machined aluminum and Gorilla Glass 3. Seamless glass touchpad, zero-lattice keyboard, and Intel Core Ultra 7.",
    "specifications": "{\"processor\": \"Intel Core Ultra 7 155H\", \"ram\": \"16GB LPDDR5X\", \"storage\": \"512GB PCIe SSD\", \"display\": \"13.4-inch FHD+ InfinityEdge 500 nits\", \"battery\": \"14 hours\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-27T16:12:02.62123Z",
    "stockQuantity": 18
  },
  {
    "id": 112,
    "name": "Acer Swift Go 14 AI OLED",
    "brand": "Acer",
    "category": "Laptops",
    "price": 69990,
    "stock": 25,
    "rating": 4.5,
    "reviewCount": 33,
    "imageUrl": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop",
    "description": "Affordable AI-ready ultrabook featuring vivid 2.8K 90Hz OLED display, Intel Core Ultra 5 with dedicated NPU, and light 1.32kg aluminum body.",
    "specifications": "{\"processor\": \"Intel Core Ultra 5 125H\", \"ram\": \"16GB LPDDR5X\", \"storage\": \"512GB Gen4 SSD\", \"display\": \"14-inch 2.8K OLED 90Hz\", \"battery\": \"11 hours\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-27T16:12:02.62123Z",
    "stockQuantity": 25
  },
  {
    "id": 113,
    "name": "Samsung Galaxy Book4 Pro 360",
    "brand": "Samsung",
    "category": "Laptops",
    "price": 163990,
    "stock": 10,
    "rating": 4.8,
    "reviewCount": 22,
    "imageUrl": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop",
    "description": "Flagship 2-in-1 laptop with 16-inch 3K Dynamic AMOLED 2X touchscreen, bundled S-Pen, and seamless Galaxy ecosystem integration.",
    "specifications": "{\"processor\": \"Intel Core Ultra 7 155H\", \"ram\": \"16GB LPDDR5X\", \"storage\": \"1TB SSD\", \"display\": \"16.0-inch 3K AMOLED 120Hz Touch\", \"battery\": \"15 hours\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-27T16:12:02.62123Z",
    "stockQuantity": 10
  },
  {
    "id": 114,
    "name": "ASUS TUF Gaming A15",
    "brand": "ASUS",
    "category": "Laptops",
    "price": 64990,
    "stock": 28,
    "rating": 4.4,
    "reviewCount": 48,
    "imageUrl": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop",
    "description": "Value-packed military-grade gaming laptop with AMD Ryzen 7, NVIDIA RTX 3050, high-refresh 144Hz display, and dual fans for long gaming sessions.",
    "specifications": "{\"processor\": \"AMD Ryzen 7 7435HS\", \"ram\": \"16GB DDR5\", \"storage\": \"512GB PCIe SSD\", \"graphics\": \"NVIDIA GeForce RTX 3050 4GB\", \"display\": \"15.6-inch FHD 144Hz IPS\", \"battery\": \"7 hours\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-27T16:12:02.62123Z",
    "stockQuantity": 28
  },
  {
    "id": 207,
    "name": "Samsung Galaxy S24 Ultra 5G",
    "brand": "Samsung",
    "category": "Smartphones",
    "price": 129999,
    "stock": 20,
    "rating": 4.9,
    "reviewCount": 65,
    "imageUrl": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop",
    "description": "The pinnacle of Android smartphones with Titanium frame, built-in S Pen, 200MP Quad Telephoto camera, and Galaxy AI live translation.",
    "specifications": "{\"processor\": \"Snapdragon 8 Gen 3 for Galaxy\", \"ram\": \"12GB\", \"storage\": \"256GB\", \"display\": \"6.8-inch Dynamic AMOLED 2X 120Hz 2600 nits\", \"camera\": \"200MP + 50MP + 12MP + 10MP\", \"battery\": \"5000 mAh 45W\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-27T16:12:02.62123Z",
    "stockQuantity": 20
  },
  {
    "id": 208,
    "name": "Apple iPhone 15 Pro Max",
    "brand": "Apple",
    "category": "Smartphones",
    "price": 148900,
    "stock": 18,
    "rating": 4.9,
    "reviewCount": 82,
    "imageUrl": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop",
    "description": "Forged in aerospace-grade titanium with the groundbreaking A17 Pro chip, customizable Action button, and 5x Telephoto optical zoom.",
    "specifications": "{\"processor\": \"Apple A17 Pro 3nm\", \"ram\": \"8GB\", \"storage\": \"256GB NVMe\", \"display\": \"6.7-inch Super Retina XDR OLED 120Hz\", \"camera\": \"48MP Main + 12MP Ultra Wide + 12MP 5x Telephoto\", \"battery\": \"29 hours video playback\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-27T16:12:02.62123Z",
    "stockQuantity": 18
  },
  {
    "id": 209,
    "name": "Google Pixel 8 Pro",
    "brand": "Google",
    "category": "Smartphones",
    "price": 89999,
    "stock": 15,
    "rating": 4.7,
    "reviewCount": 40,
    "imageUrl": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop",
    "description": "Google's premier AI flagship powered by Tensor G3 with Super Actua display, Pro camera controls, Magic Editor, and 7 years of OS updates.",
    "specifications": "{\"processor\": \"Google Tensor G3 Titan M2\", \"ram\": \"12GB LPDDR5X\", \"storage\": \"128GB UFS 3.1\", \"display\": \"6.7-inch LTPO OLED 120Hz 2400 nits\", \"camera\": \"50MP + 48MP Quad PD Telephoto + 48MP Ultrawide\", \"battery\": \"5050 mAh 30W\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-27T16:12:02.62123Z",
    "stockQuantity": 15
  },
  {
    "id": 210,
    "name": "OnePlus 12 5G Flagship",
    "brand": "OnePlus",
    "category": "Smartphones",
    "price": 64999,
    "stock": 25,
    "rating": 4.8,
    "reviewCount": 55,
    "imageUrl": "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop",
    "description": "Flagship speed redefined with 4th Gen Hasselblad camera, 2K 120Hz ProXDR display, Snapdragon 8 Gen 3, and 100W SUPERVOOC charging.",
    "specifications": "{\"processor\": \"Snapdragon 8 Gen 3\", \"ram\": \"16GB LPDDR5X\", \"storage\": \"512GB UFS 4.0\", \"display\": \"6.82-inch 2K 120Hz ProXDR 4500 nits\", \"camera\": \"50MP Sony LYT-808 + 64MP Periscope + 48MP Ultrawide\", \"battery\": \"5400 mAh 100W Fast Charge\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-27T16:12:02.62123Z",
    "stockQuantity": 25
  },
  {
    "id": 211,
    "name": "Nothing Phone (2)",
    "brand": "Nothing",
    "category": "Smartphones",
    "price": 36999,
    "stock": 30,
    "rating": 4.6,
    "reviewCount": 38,
    "imageUrl": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop",
    "description": "Unique transparent design with customizable Glyph Interface LED patterns, clean Nothing OS 2.5, flagship Snapdragon 8+ Gen 1, and dual 50MP Sony sensors.",
    "specifications": "{\"processor\": \"Snapdragon 8+ Gen 1\", \"ram\": \"12GB\", \"storage\": \"256GB\", \"display\": \"6.7-inch LTPO OLED 120Hz\", \"camera\": \"50MP Sony IMX890 + 50MP Samsung JN1\", \"battery\": \"4700 mAh 45W\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-27T16:12:02.62123Z",
    "stockQuantity": 30
  },
  {
    "id": 212,
    "name": "Xiaomi 14 Ultra Leica",
    "brand": "Xiaomi",
    "category": "Smartphones",
    "price": 99999,
    "stock": 14,
    "rating": 4.8,
    "reviewCount": 29,
    "imageUrl": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop",
    "description": "Professional mobile photography flagship equipped with 1-inch Sony LYT-900 sensor, stepless variable aperture, and quad Leica optical lenses.",
    "specifications": "{\"processor\": \"Snapdragon 8 Gen 3\", \"ram\": \"16GB LPDDR5X\", \"storage\": \"512GB UFS 4.0\", \"display\": \"6.73-inch WQHD+ AMOLED 120Hz 3000 nits\", \"camera\": \"50MP 1-inch LYT-900 + 3x 50MP Leica Lenses\", \"battery\": \"5000 mAh 90W HyperCharge\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-27T16:12:02.62123Z",
    "stockQuantity": 14
  },
  {
    "id": 213,
    "name": "Vivo X100 Pro Zeiss Camera",
    "brand": "Vivo",
    "category": "Smartphones",
    "price": 89999,
    "stock": 16,
    "rating": 4.7,
    "reviewCount": 34,
    "imageUrl": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop",
    "description": "Imaging powerhouse featuring Zeiss APO floating telephoto camera, Dimensity 9300 chipset, V3 imaging chip, and 100W Dual-Cell FlashCharge.",
    "specifications": "{\"processor\": \"MediaTek Dimensity 9300\", \"ram\": \"16GB\", \"storage\": \"512GB\", \"display\": \"6.78-inch LTPO AMOLED 120Hz 3000 nits\", \"camera\": \"50MP 1-inch IMX989 + 50MP Zeiss APO Telephoto\", \"battery\": \"5400 mAh 100W FlashCharge\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-27T16:12:02.62123Z",
    "stockQuantity": 16
  },
  {
    "id": 214,
    "name": "Motorola Edge 50 Ultra",
    "brand": "Motorola",
    "category": "Smartphones",
    "price": 54999,
    "stock": 22,
    "rating": 4.6,
    "reviewCount": 26,
    "imageUrl": "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=600&auto=format&fit=crop",
    "description": "Sensory craftsmanship with real natural wood back, Pantone-validated curved pOLED display, Snapdragon 8s Gen 3, and 125W TurboPower charging.",
    "specifications": "{\"processor\": \"Snapdragon 8s Gen 3\", \"ram\": \"12GB\", \"storage\": \"512GB\", \"display\": \"6.7-inch 144Hz Super HD pOLED 2500 nits\", \"camera\": \"50MP OIS + 50MP Ultrawide + 64MP 3x Periscope\", \"battery\": \"4500 mAh 125W TurboPower\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-27T16:12:02.62123Z",
    "stockQuantity": 22
  },
  {
    "id": 506,
    "name": "Apple Watch Ultra 2 GPS + Cellular",
    "brand": "Apple",
    "category": "Smartwatches",
    "price": 89900,
    "stock": 10,
    "rating": 4.9,
    "reviewCount": 48,
    "imageUrl": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop",
    "description": "Rugged 49mm titanium outdoor sports watch with 3000-nit always-on display, precision dual-frequency GPS, depth gauge, and 72-hour battery life.",
    "specifications": "{\"case\": \"49mm Aerospace Titanium\", \"display\": \"Sapphire Crystal 3000 nits\", \"sensors\": \"ECG, SpO2, Depth Gauge, Water Temp\", \"battery\": \"36 hours normal, 72 hours low power\", \"water_resistance\": \"100m Dive Certified\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-27T16:12:02.62123Z",
    "stockQuantity": 10
  },
  {
    "id": 507,
    "name": "Samsung Galaxy Watch Ultra",
    "brand": "Samsung",
    "category": "Smartwatches",
    "price": 59999,
    "stock": 15,
    "rating": 4.8,
    "reviewCount": 32,
    "imageUrl": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop",
    "description": "Extreme durability with cushion design Grade 4 titanium case, dual-frequency GPS, 100m water resistance, and personalized Galaxy AI fitness coaching.",
    "specifications": "{\"case\": \"47mm Grade 4 Titanium\", \"display\": \"Super AMOLED 3000 nits Sapphire\", \"sensors\": \"BioActive Sensor (ECG, BIA, HR), Dual GPS\", \"battery\": \"Up to 100 hours power saving\", \"water_resistance\": \"10ATM + IP68\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-27T16:12:02.62123Z",
    "stockQuantity": 15
  },
  {
    "id": 103,
    "name": "ASUS Vivobook 15",
    "brand": "ASUS",
    "category": "Laptops",
    "price": 49990,
    "stock": 28,
    "rating": 4.3,
    "reviewCount": 32,
    "imageUrl": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop",
    "description": "Sleek modern laptop offering top-tier productivity features at an accessible budget. Features a crisp FHD display and fast Intel Core i5 processor for coding and everyday computing.",
    "specifications": "{\"processor\": \"Intel Core i5-1335U 13th Gen\", \"ram\": \"16GB DDR4\", \"storage\": \"512GB PCIe SSD\", \"display\": \"15.6-inch FHD Anti-glare\", \"battery\": \"6.5 hours\"}",
    "createdAt": "2026-10-24T05:00:52.564409Z",
    "updatedAt": "2026-11-02T06:01:08.303318Z",
    "stockQuantity": 28
  },
  {
    "id": 104,
    "name": "Dell Inspiron 14 5430",
    "brand": "Dell",
    "category": "Laptops",
    "price": 73990,
    "stock": 18,
    "rating": 4.6,
    "reviewCount": 19,
    "imageUrl": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop",
    "description": "Premium 14-inch ultrabook featuring high-resolution 2.5K 16:10 display with ComfortView Plus and high-performance Intel Core i7 13th gen processor.",
    "specifications": "{\"processor\": \"Intel Core i7-1360P 13th Gen\", \"ram\": \"16GB LPDDR5\", \"storage\": \"1TB NVMe SSD\", \"display\": \"14.0-inch 2.5K WVA\", \"battery\": \"8.5 hours\"}",
    "createdAt": "2026-10-24T05:00:52.564409Z",
    "updatedAt": "2026-10-27T09:04:38.054464Z",
    "stockQuantity": 18
  },
  {
    "id": 202,
    "name": "Samsung Galaxy S23 FE",
    "brand": "Samsung",
    "category": "Smartphones",
    "price": 37990,
    "stock": 20,
    "rating": 4.5,
    "reviewCount": 29,
    "imageUrl": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop",
    "description": "Fan Edition flagship smartphone with pro-grade 50MP triple lens system, telephoto zoom, premium glass back, and stunning Dynamic AMOLED 2X display.",
    "specifications": "{\"processor\": \"Exynos 2200 4nm\", \"ram\": \"8GB\", \"storage\": \"128GB\", \"camera\": \"50MP + 12MP + 8MP 3x Zoom\", \"display\": \"6.4-inch 120Hz Dynamic AMOLED\", \"battery\": \"4500 mAh\"}",
    "createdAt": "2026-10-24T05:00:52.564409Z",
    "updatedAt": "2026-10-24T05:00:52.564409Z",
    "stockQuantity": 20
  },
  {
    "id": 508,
    "name": "Garmin Fenix 7 Pro Solar GPS Watch",
    "brand": "Garmin",
    "category": "Smartwatches",
    "price": 81990,
    "stock": 12,
    "rating": 4.9,
    "reviewCount": 36,
    "imageUrl": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop",
    "description": "Multisport GPS watch with Power Glass solar charging lens, built-in LED flashlight, preloaded TopoActive maps, and up to 22 days of battery life.",
    "specifications": "{\"display\": \"1.3-inch Sunlight-visible MIP Solar\", \"battery\": \"22 days in smartwatch mode with solar\", \"sensors\": \"Multi-band GNSS, Pulse Ox, Altimeter, Barometer\", \"features\": \"LED Flashlight, Topo Maps\", \"water_rating\": \"10 ATM\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-27T16:12:02.62123Z",
    "stockQuantity": 12
  },
  {
    "id": 509,
    "name": "Fitbit Charge 6 Advanced Fitness Tracker",
    "brand": "Fitbit",
    "category": "Smartwatches",
    "price": 14999,
    "stock": 25,
    "rating": 4.4,
    "reviewCount": 42,
    "imageUrl": "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&auto=format&fit=crop",
    "description": "Premium health tracker with Google Maps & Wallet integration, 40+ exercise modes, ECG heart rhythm app, and 7-day battery life.",
    "specifications": "{\"display\": \"Color AMOLED Touchscreen\", \"battery\": \"7 days\", \"sensors\": \"ECG, EDA Scan, SpO2, Optical HR, Built-in GPS\", \"water_resistance\": \"50m Water Resistant\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-27T16:12:02.62123Z",
    "stockQuantity": 25
  },
  {
    "id": 512,
    "name": "Fastrack Reflex Play BT Calling Smartwatch",
    "brand": "Fastrack",
    "category": "Smartwatches",
    "price": 2495,
    "stock": 45,
    "rating": 4.2,
    "reviewCount": 56,
    "imageUrl": "https://images.unsplash.com/photo-1510017803434-a899398421b3?w=600&auto=format&fit=crop",
    "description": "Youthful budget smartwatch with 1.3-inch AMOLED display, Bluetooth calling with dial pad, 100+ sports modes, and IP68 water resistance.",
    "specifications": "{\"display\": \"1.3-inch AMOLED Always On\", \"battery\": \"7 days battery backup\", \"features\": \"Bluetooth Calling, In-built Games, 100+ Sports\", \"protection\": \"IP68 Water & Dust Resistant\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-27T16:12:02.62123Z",
    "stockQuantity": 45
  },
  {
    "id": 309,
    "name": "Apple AirPods Max Wireless Over-Ear",
    "brand": "Apple",
    "category": "Audio & Headphones",
    "price": 59900,
    "stock": 14,
    "rating": 4.9,
    "reviewCount": 47,
    "imageUrl": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop",
    "description": "Computational audio masterpiece with custom 40mm dynamic drivers, industry-standard Active Noise Cancellation, and Spatial Audio with dynamic head tracking.",
    "specifications": "{\"driver\": \"40mm Apple Custom Dynamic\", \"anc\": \"Active Noise Cancellation + Transparency Mode\", \"battery\": \"20 hours with ANC enabled\", \"audio\": \"Personalized Spatial Audio with Head Tracking\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-27T16:12:02.62123Z",
    "stockQuantity": 14
  },
  {
    "id": 310,
    "name": "Sennheiser Momentum 4 Wireless",
    "brand": "Sennheiser",
    "category": "Audio & Headphones",
    "price": 27990,
    "stock": 18,
    "rating": 4.8,
    "reviewCount": 35,
    "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop",
    "description": "Audiophile-grade 42mm sound transducers, class-leading 60-hour battery life, Adaptive ANC, and crystal-clear calls with 4 beamforming microphones.",
    "specifications": "{\"driver\": \"42mm Audiophile Transducers\", \"battery\": \"60 hours on single charge\", \"codecs\": \"aptX Adaptive, AAC, SBC\", \"anc\": \"Hybrid Adaptive Noise Cancellation\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-27T16:12:02.62123Z",
    "stockQuantity": 18
  },
  {
    "id": 311,
    "name": "Sony WF-1000XM5 True Wireless Earbuds",
    "brand": "Sony",
    "category": "Audio & Headphones",
    "price": 21990,
    "stock": 21,
    "rating": 4.8,
    "reviewCount": 52,
    "imageUrl": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop",
    "description": "Precision noise cancellation earbuds powered by Integrated Processor V2 and HD Noise Cancelling Processor QN2e. Supports High-Resolution Audio Wireless via LDAC.",
    "specifications": "{\"driver\": \"Dynamic Driver X 8.4mm\", \"anc\": \"Dual Feedback Mics + Processor V2\", \"battery\": \"8 hours (24h with case)\", \"features\": \"Bone Conduction Sensor, Multipoint, LDAC\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-30T04:56:40.774565Z",
    "stockQuantity": 21
  },
  {
    "id": 807,
    "name": "Amazon Fire TV Stick 4K Max with Wi-Fi 6E",
    "brand": "Amazon",
    "category": "Smart TVs & Home Entertainment",
    "price": 6499,
    "stock": 45,
    "rating": 4.7,
    "reviewCount": 115,
    "imageUrl": "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600&auto=format&fit=crop",
    "description": "Amazon's most powerful streaming stick with 2.0 GHz quad-core processor and Wi-Fi 6E support. Fire TV Ambient Experience, Dolby Vision, Dolby Atmos, and 16GB storage.",
    "specifications": "{\"processor\": \"2.0 GHz Quad-core\", \"storage\": \"16GB\", \"connectivity\": \"Wi-Fi 6E Tri-band, Bluetooth 5.2\", \"resolution\": \"4K Ultra HD up to 60fps\", \"hdr\": \"Dolby Vision, HDR10+, HLG\", \"audio\": \"Dolby Atmos\"}",
    "createdAt": "2026-10-30T15:54:01.058756Z",
    "updatedAt": "2026-10-30T15:54:01.058756Z",
    "stockQuantity": 45
  },
  {
    "id": 312,
    "name": "JBL Live 660NC Wireless Over-Ear",
    "brand": "JBL",
    "category": "Audio & Headphones",
    "price": 7999,
    "stock": 35,
    "rating": 4.4,
    "reviewCount": 60,
    "imageUrl": "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&auto=format&fit=crop",
    "description": "Signature punchy JBL pure bass sound with 40mm drivers, Adaptive Noise Cancelling with Ambient Aware, and up to 50 hours of wireless playback.",
    "specifications": "{\"driver\": \"40mm Dynamic Driver\", \"battery\": \"50 hours (40h with ANC)\", \"anc\": \"Adaptive Noise Cancelling\", \"connectivity\": \"Bluetooth 5.0 + 3.5mm Aux\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-27T16:12:02.62123Z",
    "stockQuantity": 35
  },
  {
    "id": 313,
    "name": "Marshall Major IV Bluetooth Headphones",
    "brand": "Marshall",
    "category": "Audio & Headphones",
    "price": 11999,
    "stock": 20,
    "rating": 4.6,
    "reviewCount": 38,
    "imageUrl": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop",
    "description": "Iconic vintage rock-and-roll styling delivering explosive signature Marshall sound, wireless Qi charging, and over 80+ hours of continuous wireless playtime.",
    "specifications": "{\"driver\": \"40mm Custom Tuned Dynamic\", \"battery\": \"80+ hours wireless playtime\", \"charging\": \"Wireless Qi + Quick Charge (15m=15h)\", \"controls\": \"Multi-directional control knob\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-27T16:12:02.62123Z",
    "stockQuantity": 20
  },
  {
    "id": 314,
    "name": "Nothing Ear (a) Hi-Res Earbuds",
    "brand": "Nothing",
    "category": "Audio & Headphones",
    "price": 7999,
    "stock": 30,
    "rating": 4.5,
    "reviewCount": 41,
    "imageUrl": "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&auto=format&fit=crop",
    "description": "Playful design with transparent casing, 45dB Smart ANC with automatic leak detection, Bass Enhance algorithm, and Hi-Res Audio certification.",
    "specifications": "{\"driver\": \"11mm Custom Dynamic PMI+TPU\", \"anc\": \"Smart Active Noise Cancellation up to 45dB\", \"battery\": \"9.5 hours (42.5h with case)\", \"codecs\": \"LDAC, AAC, SBC\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-27T16:12:02.62123Z",
    "stockQuantity": 30
  },
  {
    "id": 605,
    "name": "Apple iPad Pro 11-inch M4 OLED",
    "brand": "Apple",
    "category": "Tablets",
    "price": 99900,
    "stock": 14,
    "rating": 4.9,
    "reviewCount": 37,
    "imageUrl": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop",
    "description": "Thinnovation redefined: Powered by Apple M4 chip with groundbreaking Ultra Retina Tandem OLED display and hardware-accelerated ray tracing.",
    "specifications": "{\"processor\": \"Apple M4 9-core CPU\", \"ram\": \"8GB Unified\", \"storage\": \"256GB SSD\", \"display\": \"11-inch Ultra Retina Tandem OLED 120Hz\", \"camera\": \"12MP Wide + LiDAR Scanner\", \"battery\": \"10 hours\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-27T16:12:02.62123Z",
    "stockQuantity": 14
  },
  {
    "id": 606,
    "name": "Samsung Galaxy Tab S9 Ultra",
    "brand": "Samsung",
    "category": "Tablets",
    "price": 108999,
    "stock": 10,
    "rating": 4.8,
    "reviewCount": 29,
    "imageUrl": "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&auto=format&fit=crop",
    "description": "Gigantic 14.6-inch Dynamic AMOLED 2X canvas with IP68 water resistance, ultra-low latency S Pen, and Snapdragon 8 Gen 2 for creator productivity.",
    "specifications": "{\"processor\": \"Snapdragon 8 Gen 2 for Galaxy\", \"ram\": \"12GB\", \"storage\": \"256GB Expandable\", \"display\": \"14.6-inch Dynamic AMOLED 2X 120Hz\", \"pen\": \"S Pen Included (IP68)\", \"battery\": \"11200 mAh 45W\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-27T16:12:02.62123Z",
    "stockQuantity": 10
  },
  {
    "id": 607,
    "name": "Lenovo Tab P12 Pro with Pen 3",
    "brand": "Lenovo",
    "category": "Tablets",
    "price": 39990,
    "stock": 20,
    "rating": 4.5,
    "reviewCount": 33,
    "imageUrl": "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=600&auto=format&fit=crop",
    "description": "Brilliant 12.6-inch 2K AMOLED tablet with Quad JBL speakers tuned by Dolby Atmos, Precision Pen 3 included, and secondary wireless PC monitor capability.",
    "specifications": "{\"processor\": \"Snapdragon 870 Octa-core\", \"ram\": \"8GB LPDDR5\", \"storage\": \"256GB UFS 3.1\", \"display\": \"12.6-inch 2K AMOLED 120Hz HDR10+\", \"battery\": \"10200 mAh 45W Quick Charge\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-27T16:12:02.62123Z",
    "stockQuantity": 20
  },
  {
    "id": 608,
    "name": "Microsoft Surface Pro 9 Copilot 2-in-1",
    "brand": "Microsoft",
    "category": "Tablets",
    "price": 98990,
    "stock": 12,
    "rating": 4.6,
    "reviewCount": 25,
    "imageUrl": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop",
    "description": "Laptop versatility meets tablet portability with 13-inch PixelSense Flow 120Hz touchscreen, Intel 12th Gen processor, and full Windows 11 desktop power.",
    "specifications": "{\"processor\": \"Intel Core i5-1235U 12th Gen\", \"ram\": \"8GB LPDDR5\", \"storage\": \"256GB Removable SSD\", \"display\": \"13.0-inch PixelSense 2880x1920 120Hz Touch\", \"battery\": \"15.5 hours\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-27T16:12:02.62123Z",
    "stockQuantity": 12
  },
  {
    "id": 707,
    "name": "DJI Mini 4 Pro 4K Drone Fly More Combo",
    "brand": "DJI",
    "category": "Cameras & Gaming",
    "price": 114990,
    "stock": 10,
    "rating": 4.9,
    "reviewCount": 31,
    "imageUrl": "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600&auto=format&fit=crop",
    "description": "Ultralight sub-249g drone with omnidirectional obstacle sensing, 4K/60fps HDR True Vertical Shooting, 20km FHD video transmission, and 34min flight time.",
    "specifications": "{\"weight\": \"< 249 g Regulation-friendly\", \"camera\": \"1/1.3-inch CMOS 48MP 4K/60fps HDR\", \"flight_time\": \"34 minutes (x3 Batteries Included)\", \"transmission\": \"DJI O4 20km FHD Video\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-27T16:12:02.62123Z",
    "stockQuantity": 10
  },
  {
    "id": 708,
    "name": "Insta360 X4 8K 360 Action Camera",
    "brand": "Insta360",
    "category": "Cameras & Gaming",
    "price": 49990,
    "stock": 18,
    "rating": 4.7,
    "reviewCount": 39,
    "imageUrl": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop",
    "description": "Unstoppable 8K 360-degree capture action camera with Invisible Selfie Stick effect, AI Gesture control, FlowState stabilization, and 10m waterproof body.",
    "specifications": "{\"resolution\": \"8K 30fps 360 Video + 4K 100fps Slow-mo\", \"stabilization\": \"FlowState + 360 Horizon Lock\", \"waterproof\": \"10m without housing\", \"screen\": \"2.5-inch Gorilla Glass Touchscreen\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-27T16:12:02.62123Z",
    "stockQuantity": 18
  },
  {
    "id": 407,
    "name": "Logitech MX Master 3S Wireless Mouse",
    "brand": "Logitech",
    "category": "Accessories",
    "price": 8995,
    "stock": 40,
    "rating": 4.9,
    "reviewCount": 72,
    "imageUrl": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop",
    "description": "Ergonomic master mouse with Quiet Clicks, 8000 DPI track-on-glass sensor, MagSpeed electromagnetic scroll wheel, and Flow cross-computer control.",
    "specifications": "{\"sensor\": \"8000 DPI Darkfield Any-surface\", \"scroll\": \"MagSpeed Electromagnetic 1000 lines/sec\", \"battery\": \"Up to 70 days rechargeable\", \"connectivity\": \"Bluetooth + Logi Bolt USB\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-27T16:12:02.62123Z",
    "stockQuantity": 40
  },
  {
    "id": 408,
    "name": "Apple Magic Keyboard with Touch ID",
    "brand": "Apple",
    "category": "Accessories",
    "price": 14900,
    "stock": 25,
    "rating": 4.7,
    "reviewCount": 36,
    "imageUrl": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop",
    "description": "Sleek wireless rechargeable keyboard providing remarkably comfortable and precise typing, paired with instant biometric Touch ID authentication.",
    "specifications": "{\"keys\": \"Scissor mechanism low-profile\", \"biometric\": \"Touch ID Sensor for Mac\", \"battery\": \"Rechargeable internal battery (1+ month)\", \"connectivity\": \"Bluetooth + Lightning/USB-C\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-27T16:12:02.62123Z",
    "stockQuantity": 25
  },
  {
    "id": 409,
    "name": "Belkin 3-in-1 Fast Wireless MagSafe Charger",
    "brand": "Belkin",
    "category": "Accessories",
    "price": 12999,
    "stock": 28,
    "rating": 4.8,
    "reviewCount": 29,
    "imageUrl": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop",
    "description": "Premium architecturally designed 15W MagSafe charging stand capable of fast charging iPhone, Apple Watch, and AirPods simultaneously.",
    "specifications": "{\"output\": \"15W Official MagSafe + 5W Watch + 5W AirPods\", \"orientation\": \"Portrait & Landscape view\", \"compatibility\": \"iPhone 12-15 series, Apple Watch Series 7-Ultra, AirPods Pro\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-27T16:12:02.62123Z",
    "stockQuantity": 28
  },
  {
    "id": 411,
    "name": "Keychron K2 Pro Wireless Mechanical Keyboard",
    "brand": "Keychron",
    "category": "Accessories",
    "price": 8499,
    "stock": 30,
    "rating": 4.7,
    "reviewCount": 45,
    "imageUrl": "https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&auto=format&fit=crop",
    "description": "75% compact wireless mechanical keyboard with QMK/VIA key remapping, hot-swappable Keychron K Pro switches, Mac/Windows layout, and RGB backlighting.",
    "specifications": "{\"layout\": \"75% Compact 84-keys\", \"switches\": \"Hot-swappable Keychron K Pro Red\", \"connectivity\": \"Bluetooth 5.1 + Type-C Wired\", \"battery\": \"4000 mAh Rechargeable (300h without RGB)\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-27T16:12:02.62123Z",
    "stockQuantity": 30
  },
  {
    "id": 412,
    "name": "Sony DualSense Edge PS5 Wireless Controller",
    "brand": "Sony",
    "category": "Accessories",
    "price": 18990,
    "stock": 22,
    "rating": 4.8,
    "reviewCount": 40,
    "imageUrl": "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=600&auto=format&fit=crop",
    "description": "Pro-grade ultra-customizable controller for PlayStation 5 and PC with swappable stick modules, mappable back buttons, adjustable triggers, and profile switching.",
    "specifications": "{\"features\": \"Changeable Stick Caps, Replaceable Stick Modules\", \"triggers\": \"Adjustable trigger stops and deadzones\", \"feedback\": \"Haptic feedback + Adaptive Triggers\", \"storage\": \"Protective Carrying Case Included\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-10-27T16:12:02.62123Z",
    "stockQuantity": 22
  },
  {
    "id": 901,
    "name": "Samsung Odyssey OLED G9 49-inch Curved Gaming Monitor",
    "brand": "Samsung",
    "category": "PC & Gaming Components",
    "price": 129990,
    "stock": 7,
    "rating": 4.9,
    "reviewCount": 27,
    "imageUrl": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop",
    "description": "Colossal 49-inch Dual QHD (5120x1440) 32:9 curved OLED monitor. Ultra-fast 240Hz refresh rate, 0.03ms response time, Neo Quantum Processor Pro, and DisplayHDR True Black 400.",
    "specifications": "{\"screen_size\": \"49-inch 1800R Curved\", \"resolution\": \"Dual QHD (5120x1440)\", \"panel\": \"OLED\", \"refresh_rate\": \"240Hz\", \"response_time\": \"0.03ms (GtG)\", \"hdr\": \"VESA DisplayHDR True Black 400\", \"ports\": \"HDMI 2.1, Micro HDMI, DisplayPort 1.4, USB Hub\"}",
    "createdAt": "2026-10-30T15:54:01.058756Z",
    "updatedAt": "2026-10-30T15:54:01.058756Z",
    "stockQuantity": 7
  },
  {
    "id": 902,
    "name": "LG UltraGear 27GR95QE 27-inch 240Hz QHD OLED Gaming Monitor",
    "brand": "LG",
    "category": "PC & Gaming Components",
    "price": 69990,
    "stock": 16,
    "rating": 4.8,
    "reviewCount": 48,
    "imageUrl": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop",
    "description": "World-class competitive esports monitor. 27-inch QHD (2560x1440) OLED display, blazing 240Hz refresh, 0.03ms response time, 98.5% DCI-P3 color gamut, NVIDIA G-Sync Compatible.",
    "specifications": "{\"screen_size\": \"27-inch Flat\", \"resolution\": \"QHD (2560x1440)\", \"panel\": \"OLED Anti-Glare\", \"refresh_rate\": \"240Hz\", \"response_time\": \"0.03ms\", \"sync\": \"NVIDIA G-Sync & AMD FreeSync Premium Pro\"}",
    "createdAt": "2026-10-30T15:54:01.058756Z",
    "updatedAt": "2026-10-30T15:54:01.058756Z",
    "stockQuantity": 16
  },
  {
    "id": 903,
    "name": "NVIDIA GeForce RTX 4080 Super 16GB Founders Edition",
    "brand": "NVIDIA",
    "category": "PC & Gaming Components",
    "price": 105000,
    "stock": 8,
    "rating": 4.9,
    "reviewCount": 39,
    "imageUrl": "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop",
    "description": "Ada Lovelace architecture powerhouse with 10,240 CUDA cores, 16GB GDDR6X VRAM on 256-bit bus, DLSS 3.5 Frame Generation, and unmatched 4K ray tracing performance.",
    "specifications": "{\"cuda_cores\": \"10,240\", \"vram\": \"16GB GDDR6X\", \"memory_bus\": \"256-bit\", \"boost_clock\": \"2550 MHz\", \"tdp\": \"320W\", \"interface\": \"PCIe 4.0 x16\", \"outputs\": \"1x HDMI 2.1a, 3x DisplayPort 1.4a\"}",
    "createdAt": "2026-10-30T15:54:01.058756Z",
    "updatedAt": "2026-10-30T15:54:01.058756Z",
    "stockQuantity": 8
  },
  {
    "id": 904,
    "name": "ASUS ROG Strix GeForce RTX 4070 Ti Super 16GB OC",
    "brand": "ASUS",
    "category": "PC & Gaming Components",
    "price": 89990,
    "stock": 12,
    "rating": 4.8,
    "reviewCount": 31,
    "imageUrl": "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop",
    "description": "Massive 3.15-slot cooling with Axial-tech fans, vented exoskeleton, and Dual BIOS. Features 16GB VRAM and 8,448 CUDA cores for 1440p and 4K ultra gaming.",
    "specifications": "{\"cuda_cores\": \"8,448\", \"vram\": \"16GB GDDR6X\", \"clock\": \"2670 MHz (OC Mode)\", \"cooling\": \"Triple Axial-Tech Fans\", \"power\": \"285W (1x 16-pin)\"}",
    "createdAt": "2026-10-30T15:54:01.058756Z",
    "updatedAt": "2026-10-30T15:54:01.058756Z",
    "stockQuantity": 12
  },
  {
    "id": 905,
    "name": "AMD Ryzen 7 7800X3D Desktop Processor (8-Core, 16-Thread)",
    "brand": "AMD",
    "category": "PC & Gaming Components",
    "price": 38990,
    "stock": 22,
    "rating": 4.9,
    "reviewCount": 76,
    "imageUrl": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&auto=format&fit=crop",
    "description": "The undisputed king of gaming processors with AMD 3D V-Cache technology. 8 cores, 16 threads, 104MB total cache, boost clock up to 5.0 GHz on socket AM5 platform.",
    "specifications": "{\"cores_threads\": \"8 Cores / 16 Threads\", \"base_boost_clock\": \"4.2 GHz / 5.0 GHz\", \"l3_cache\": \"96MB 3D V-Cache (104MB total)\", \"socket\": \"AM5\", \"tdp\": \"120W\", \"memory_support\": \"DDR5\"}",
    "createdAt": "2026-10-30T15:54:01.058756Z",
    "updatedAt": "2026-10-30T15:54:01.058756Z",
    "stockQuantity": 22
  },
  {
    "id": 906,
    "name": "Intel Core i7-14700K 14th Gen Desktop Processor",
    "brand": "Intel",
    "category": "PC & Gaming Components",
    "price": 39990,
    "stock": 18,
    "rating": 4.7,
    "reviewCount": 45,
    "imageUrl": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&auto=format&fit=crop",
    "description": "Hybrid architecture with 20 cores (8 Performance + 12 Efficient) and 28 threads. Max turbo boost frequency up to 5.6 GHz, unlocked multiplier, PCIe 5.0, and DDR5 support.",
    "specifications": "{\"cores_threads\": \"20 Cores (8P + 12E) / 28 Threads\", \"max_turbo\": \"Up to 5.6 GHz\", \"smart_cache\": \"33MB Intel Smart Cache\", \"socket\": \"LGA 1700\", \"base_power\": \"125W (253W Turbo)\"}",
    "createdAt": "2026-10-30T15:54:01.058756Z",
    "updatedAt": "2026-10-30T15:54:01.058756Z",
    "stockQuantity": 18
  },
  {
    "id": 907,
    "name": "Samsung 990 PRO 2TB PCIe Gen4 NVMe M.2 SSD with Heatsink",
    "brand": "Samsung",
    "category": "PC & Gaming Components",
    "price": 18490,
    "stock": 35,
    "rating": 4.9,
    "reviewCount": 82,
    "imageUrl": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop",
    "description": "Blistering read speeds up to 7,450 MB/s and write speeds up to 6,900 MB/s. Custom slim heatsink prevents thermal throttling, fully compatible with PlayStation 5 and high-end PCs.",
    "specifications": "{\"capacity\": \"2TB\", \"interface\": \"PCIe Gen 4.0 x4, NVMe 2.0\", \"sequential_read\": \"Up to 7,450 MB/s\", \"sequential_write\": \"Up to 6,900 MB/s\", \"form_factor\": \"M.2 2280 with Heatsink\", \"tbw\": \"1200 TBW\"}",
    "createdAt": "2026-10-30T15:54:01.058756Z",
    "updatedAt": "2026-10-30T15:54:01.058756Z",
    "stockQuantity": 35
  },
  {
    "id": 808,
    "name": "Sony HT-S40R 5.1ch Dolby Digital Home Theatre Soundbar",
    "brand": "Sony",
    "category": "Audio & Headphones",
    "price": 26990,
    "stock": 19,
    "rating": 4.6,
    "reviewCount": 92,
    "imageUrl": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop",
    "description": "600W total power output with authentic 5.1 channel surround sound. Features a 3-channel soundbar, wireless rear speakers, and a dedicated external subwoofer.",
    "specifications": "{\"power_output\": \"600 Watts\", \"channels\": \"5.1 Surround Sound\", \"speakers\": \"Soundbar + Wireless Rear + Subwoofer\", \"connectivity\": \"Bluetooth, HDMI ARC, Optical, USB\", \"audio_format\": \"Dolby Digital\"}",
    "createdAt": "2026-10-30T15:54:01.058756Z",
    "updatedAt": "2026-10-30T15:54:01.058756Z",
    "stockQuantity": 19
  },
  {
    "id": 809,
    "name": "JBL Bar 500 5.1 Channel Soundbar with Dolby Atmos",
    "brand": "JBL",
    "category": "Audio & Headphones",
    "price": 49999,
    "stock": 12,
    "rating": 4.8,
    "reviewCount": 41,
    "imageUrl": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop",
    "description": "590W total output with MultiBeam technology and 3D Dolby Atmos surround. Includes a booming 10-inch wireless subwoofer, AirPlay, Alexa Multi-Room, and Chromecast built-in.",
    "specifications": "{\"total_power\": \"590W\", \"subwoofer\": \"10-inch Wireless Bass\", \"sound_tech\": \"Dolby Atmos & MultiBeam\", \"connectivity\": \"Wi-Fi, AirPlay, Chromecast, HDMI eARC\", \"channels\": \"5.1\"}",
    "createdAt": "2026-10-30T15:54:01.058756Z",
    "updatedAt": "2026-10-30T15:54:01.058756Z",
    "stockQuantity": 12
  },
  {
    "id": 908,
    "name": "Corsair Dominator Titanium RGB 32GB (2x16GB) DDR5 6000MHz",
    "brand": "Corsair",
    "category": "PC & Gaming Components",
    "price": 19990,
    "stock": 19,
    "rating": 4.8,
    "reviewCount": 29,
    "imageUrl": "https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&auto=format&fit=crop",
    "description": "Precision forged aluminum heatspreader with swappable top bars and 11 vibrant CAPELLIX RGB LEDs per module. Intel XMP 3.0 certified with tight CL30 timings.",
    "specifications": "{\"capacity\": \"32GB (2 x 16GB)\", \"speed\": \"DDR5 6000 MT/s\", \"timings\": \"CL30-36-36-76\", \"voltage\": \"1.40V\", \"profiles\": \"Intel XMP 3.0 & AMD EXPO\"}",
    "createdAt": "2026-10-30T15:54:01.058756Z",
    "updatedAt": "2026-10-30T15:54:01.058756Z",
    "stockQuantity": 19
  },
  {
    "id": 909,
    "name": "Corsair RM850x 850W 80 PLUS Gold Fully Modular Power Supply",
    "brand": "Corsair",
    "category": "PC & Gaming Components",
    "price": 12490,
    "stock": 25,
    "rating": 4.9,
    "reviewCount": 71,
    "imageUrl": "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop",
    "description": "80 PLUS Gold efficiency certification delivering 90%+ efficiency. 100% all Japanese 105C capacitors, magnetic levitation fan with Zero RPM quiet mode, and 10-year warranty.",
    "specifications": "{\"wattage\": \"850 Watts\", \"efficiency\": \"80 PLUS Gold Certified\", \"modularity\": \"Fully Modular\", \"fan_size\": \"135mm Magnetic Levitation\", \"warranty\": \"10 Years\"}",
    "createdAt": "2026-10-30T15:54:01.058756Z",
    "updatedAt": "2026-10-30T15:54:01.058756Z",
    "stockQuantity": 25
  },
  {
    "id": 910,
    "name": "NZXT Kraken Elite 360 RGB Liquid CPU Cooler",
    "brand": "NZXT",
    "category": "PC & Gaming Components",
    "price": 24990,
    "stock": 14,
    "rating": 4.7,
    "reviewCount": 36,
    "imageUrl": "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop",
    "description": "High-performance AIO liquid cooler with a 2.36-inch wide-angle 640x640 LCD display for showing real-time system temperatures or custom animated GIFs. Asetek pump with 3x F120 RGB Core fans.",
    "specifications": "{\"radiator_size\": \"360mm\", \"fans\": \"3x F120 RGB Core Fans (500-1800 RPM)\", \"display\": \"2.36-inch TFT LCD (640x640 60Hz)\", \"sockets\": \"Intel LGA 1700/1200, AMD AM5/AM4\"}",
    "createdAt": "2026-10-30T15:54:01.058756Z",
    "updatedAt": "2026-10-30T15:54:01.058756Z",
    "stockQuantity": 14
  },
  {
    "id": 1003,
    "name": "Apple HomePod (2nd Gen) High-Fidelity Smart Speaker",
    "brand": "Apple",
    "category": "Smart Home & Automation",
    "price": 32900,
    "stock": 17,
    "rating": 4.8,
    "reviewCount": 55,
    "imageUrl": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop",
    "description": "Acoustic engineering powerhouse with high-excursion woofer and beamforming array of five horn-loaded tweeters. Spatial Audio with Dolby Atmos, room sensing, and built-in temperature/humidity sensors.",
    "specifications": "{\"audio_drivers\": \"4-inch High-excursion Woofer + 5 Tweeters\", \"sound\": \"Spatial Audio Dolby Atmos, Room Sensing\", \"processor\": \"Apple S7\", \"sensors\": \"Temperature & Humidity sensor, Sound Recognition\", \"connectivity\": \"Thread, Matter, Wi-Fi, AirPlay 2\"}",
    "createdAt": "2026-10-30T15:54:01.058756Z",
    "updatedAt": "2026-10-30T15:54:01.058756Z",
    "stockQuantity": 17
  },
  {
    "id": 1008,
    "name": "Dyson Purifier Cool Gen1 TP10 Smart Air Purifier & Fan",
    "brand": "Dyson",
    "category": "Smart Home & Automation",
    "price": 32900,
    "stock": 14,
    "rating": 4.7,
    "reviewCount": 49,
    "imageUrl": "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format&fit=crop",
    "description": "Sealed HEPA H13 filtration captures 99.95% of ultrafine particles as small as 0.1 microns. Air Multiplier technology projects 290 liters of purified air per second throughout the room.",
    "specifications": "{\"filtration\": \"360-degree HEPA H13 + Activated Carbon Filter\", \"airflow\": \"Air Multiplier Tech (up to 290 L/s)\", \"oscillation\": \"Adjustable up to 350 degrees\", \"sensors\": \"Real-time PM2.5, PM10 air quality display\", \"modes\": \"Auto Mode, Sleep Mode, 10 fan speeds\"}",
    "createdAt": "2026-10-30T15:54:01.058756Z",
    "updatedAt": "2026-10-30T15:54:01.058756Z",
    "stockQuantity": 14
  },
  {
    "id": 203,
    "name": "OnePlus Nord 4 5G",
    "brand": "OnePlus",
    "category": "Smartphones",
    "price": 29990,
    "stock": 35,
    "rating": 4.7,
    "reviewCount": 42,
    "imageUrl": "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop",
    "description": "All-metal unibody smartphone engineered with Snapdragon 7+ Gen 3 powerhouse chip, huge 5500mAh battery with blazing 100W SuperVOOC fast charging.",
    "specifications": "{\"processor\": \"Snapdragon 7+ Gen 3\", \"ram\": \"12GB LPDDR5X\", \"storage\": \"256GB UFS 4.0\", \"camera\": \"50MP Sony LYT-600 OIS\", \"display\": \"6.74-inch 1.5K 120Hz AMOLED\", \"battery\": \"5500 mAh + 100W\"}",
    "createdAt": "2026-10-24T05:00:52.564409Z",
    "updatedAt": "2026-10-24T05:00:52.564409Z",
    "stockQuantity": 35
  },
  {
    "id": 204,
    "name": "Redmi Note 13 Pro+ 5G",
    "brand": "Xiaomi",
    "category": "Smartphones",
    "price": 27990,
    "stock": 25,
    "rating": 4.4,
    "reviewCount": 31,
    "imageUrl": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop",
    "description": "Stunning curved 1.5K AMOLED phone boasting a massive 200MP Samsung ISOCELL sensor with lossless in-sensor zoom, IP68 water resistance, and 120W HyperCharge.",
    "specifications": "{\"processor\": \"MediaTek Dimensity 7200-Ultra\", \"ram\": \"12GB\", \"storage\": \"256GB\", \"camera\": \"200MP OIS Triple Camera\", \"display\": \"6.67-inch Curved 1.5K 120Hz AMOLED\", \"battery\": \"5000 mAh + 120W\"}",
    "createdAt": "2026-10-24T05:00:52.564409Z",
    "updatedAt": "2026-10-27T09:04:38.054464Z",
    "stockQuantity": 25
  },
  {
    "id": 205,
    "name": "OnePlus 12R",
    "brand": "OnePlus",
    "category": "Smartphones",
    "price": 39999,
    "stock": 22,
    "rating": 4.8,
    "reviewCount": 38,
    "imageUrl": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop",
    "description": "Performance flagship featuring Snapdragon 8 Gen 2, 4th Gen LTPO 120Hz ProXDR display, massive 5500mAh battery with 100W charging and Dual Cryo-velocity VC cooling.",
    "specifications": "{\"processor\": \"Snapdragon 8 Gen 2\", \"ram\": \"16GB LPDDR5X\", \"storage\": \"256GB\", \"camera\": \"50MP Sony IMX890 OIS\", \"display\": \"6.78-inch 1.5K 120Hz LTPO4 ProXDR\", \"battery\": \"5500 mAh + 100W\"}",
    "createdAt": "2026-10-27T06:28:20.895679Z",
    "updatedAt": "2026-10-27T06:28:20.895679Z",
    "stockQuantity": 22
  },
  {
    "id": 206,
    "name": "Apple iPhone 15",
    "brand": "Apple",
    "category": "Smartphones",
    "price": 69900,
    "stock": 16,
    "rating": 4.8,
    "reviewCount": 52,
    "imageUrl": "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop",
    "description": "Dynamic Island, 48MP Main camera with 2x Telephoto, durable color-infused glass and aluminum design with USB-C and A16 Bionic chip.",
    "specifications": "{\"processor\": \"Apple A16 Bionic\", \"ram\": \"6GB\", \"storage\": \"128GB\", \"camera\": \"48MP Main + 12MP Ultra-wide\", \"display\": \"6.1-inch Super Retina XDR OLED\", \"connector\": \"USB-C\"}",
    "createdAt": "2026-10-27T06:28:20.895679Z",
    "updatedAt": "2026-10-27T06:28:20.895679Z",
    "stockQuantity": 16
  },
  {
    "id": 303,
    "name": "OnePlus Buds Pro 2",
    "brand": "OnePlus",
    "category": "Audio & Headphones",
    "price": 8990,
    "stock": 40,
    "rating": 4.6,
    "reviewCount": 39,
    "imageUrl": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop",
    "description": "Audiophile grade true wireless earbuds co-created with Dynaudio. MelodyBoost dual drivers, smart adaptive noise cancellation up to 48dB, and spatial audio with head tracking.",
    "specifications": "{\"drivers\": \"11mm woofer + 6mm tweeter\", \"anc\": \"48dB Smart Adaptive ANC\", \"battery\": \"39 hours with case\", \"codecs\": \"LHDC 4.0 Lossless, AAC\", \"fast_charge\": \"10 mins gives 10 hours\"}",
    "createdAt": "2026-10-24T05:00:52.564409Z",
    "updatedAt": "2026-10-24T05:00:52.564409Z",
    "stockQuantity": 40
  },
  {
    "id": 301,
    "name": "Sony WH-1000XM5 Noise-Canceling Headphones",
    "brand": "Sony",
    "category": "Audio & Headphones",
    "price": 26990,
    "stock": 15,
    "rating": 4.8,
    "reviewCount": 48,
    "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop",
    "description": "Industry standard active noise cancellation powered by dual processors and 8 microphones. Auto NC optimizer, LDAC high resolution audio, and 30 hours battery life.",
    "specifications": "{\"anc\": \"Auto NC Optimizer with 8 mics\", \"battery\": \"30 hours ANC on\", \"codecs\": \"LDAC, AAC, SBC\", \"connectivity\": \"Bluetooth 5.2 Multipoint\"}",
    "createdAt": "2026-10-24T05:00:52.564409Z",
    "updatedAt": "2026-10-30T09:57:07.803323Z",
    "stockQuantity": 15
  },
  {
    "id": 1106,
    "name": "Dyson V15 Detect Extra Cordless Vacuum Cleaner",
    "brand": "Dyson",
    "category": "Kitchen & Home Appliances",
    "price": 62900,
    "stock": 9,
    "rating": 4.9,
    "reviewCount": 51,
    "imageUrl": "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&auto=format&fit=crop",
    "description": "Dyson's most powerful, intelligent cordless vacuum. Fluffy Optic cleaner head reveals invisible dust on hard floors, acoustic piezo sensor calculates particle sizes in real time, and 240AW fade-free suction.",
    "specifications": "{\"suction_power\": \"240 Air Watts\", \"filtration\": \"Whole-machine HEPA filtration (99.99% of 0.1um)\", \"run_time\": \"Up to 60 minutes\", \"dustbin\": \"0.77 Liters with point-and-shoot emptying\", \"laser_detect\": \"Fluffy Optic Illumination\"}",
    "createdAt": "2026-10-30T15:54:01.058756Z",
    "updatedAt": "2026-10-30T15:54:01.058756Z",
    "stockQuantity": 9
  },
  {
    "id": 115,
    "name": "ASUS Zenbook Duo OLED (2024) Dual 14-inch Screen Laptop",
    "brand": "ASUS",
    "category": "Laptops",
    "price": 159990,
    "stock": 10,
    "rating": 4.8,
    "reviewCount": 25,
    "imageUrl": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop",
    "description": "Revolutionary dual 14-inch 3K 120Hz OLED touchscreens with detachable full-size Bluetooth keyboard and kickstand. Powered by Intel Core Ultra 9 with AI Boost NPU.",
    "specifications": "{\"processor\": \"Intel Core Ultra 9 185H with Intel AI Boost\", \"ram\": \"32GB LPDDR5X\", \"storage\": \"1TB PCIe 4.0 NVMe SSD\", \"display\": \"Dual 14-inch 3K (2880x1800) OLED 120Hz Touch\", \"battery\": \"75Wh, up to 13.5 hours single screen\", \"weight\": \"1.35 kg without keyboard\"}",
    "createdAt": "2026-10-30T15:54:01.058756Z",
    "updatedAt": "2026-10-30T15:54:01.058756Z",
    "stockQuantity": 10
  },
  {
    "id": 116,
    "name": "Lenovo Legion Pro 7i 16-inch Gaming Laptop (i9-14900HX, RTX 4080)",
    "brand": "Lenovo",
    "category": "Laptops",
    "price": 234990,
    "stock": 6,
    "rating": 4.9,
    "reviewCount": 34,
    "imageUrl": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop",
    "description": "Unrivaled desktop-class gaming laptop. Intel Core i9-14900HX, NVIDIA GeForce RTX 4080 12GB (175W TGP), 16-inch WQXGA 240Hz 500 nits display, and Legion Coldfront vapor chamber cooling.",
    "specifications": "{\"processor\": \"Intel Core i9-14900HX (24 cores, up to 5.8 GHz)\", \"ram\": \"32GB DDR5 5600MHz\", \"storage\": \"1TB Gen4 SSD\", \"graphics\": \"NVIDIA GeForce RTX 4080 12GB GDDR6 (175W TGP)\", \"display\": \"16-inch WQXGA (2560x1600) IPS 240Hz 500nits\", \"battery\": \"99.99Wh with 330W Super Rapid Charge\"}",
    "createdAt": "2026-10-30T15:54:01.058756Z",
    "updatedAt": "2026-10-30T15:54:01.058756Z",
    "stockQuantity": 6
  },
  {
    "id": 117,
    "name": "Dell XPS 16 (9640) Intel Core Ultra 7 OLED Ultrabook",
    "brand": "Dell",
    "category": "Laptops",
    "price": 249990,
    "stock": 8,
    "rating": 4.7,
    "reviewCount": 21,
    "imageUrl": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop",
    "description": "Stunning CNC aluminum body with touch function row, invisible glass touchpad, and 16.3-inch 4K+ OLED InfinityEdge display. Powered by Intel Core Ultra 7 and NVIDIA RTX 4060.",
    "specifications": "{\"processor\": \"Intel Core Ultra 7 155H\", \"ram\": \"32GB LPDDR5X\", \"storage\": \"1TB PCIe NVMe SSD\", \"graphics\": \"NVIDIA GeForce RTX 4060 8GB GDDR6\", \"display\": \"16.3-inch 4K+ (3840x2400) OLED Touch 400 nits\", \"battery\": \"99.5Wh with ExpressCharge\"}",
    "createdAt": "2026-10-30T15:54:01.058756Z",
    "updatedAt": "2026-10-30T15:54:01.058756Z",
    "stockQuantity": 8
  },
  {
    "id": 118,
    "name": "Apple MacBook Pro 16-inch M3 Max (36GB Unified, 1TB SSD)",
    "brand": "Apple",
    "category": "Laptops",
    "price": 349900,
    "stock": 5,
    "rating": 5,
    "reviewCount": 41,
    "imageUrl": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop",
    "description": "Monster performance for machine learning, 3D rendering, and 8K video editing. 14-core CPU, 30-core GPU, Liquid Retina XDR with 1600 nits peak HDR brightness, and up to 22 hours battery life.",
    "specifications": "{\"processor\": \"Apple M3 Max (14-core CPU, 30-core GPU, 16-core Neural Engine)\", \"ram\": \"36GB Unified Memory (300 GB/s bandwidth)\", \"storage\": \"1TB NVMe SSD\", \"display\": \"16.2-inch Liquid Retina XDR (3456x2234) 120Hz ProMotion\", \"battery\": \"100Wh, up to 22 hours battery life\"}",
    "createdAt": "2026-10-30T15:54:01.058756Z",
    "updatedAt": "2026-10-30T15:54:01.058756Z",
    "stockQuantity": 5
  },
  {
    "id": 225,
    "name": "Samsung Galaxy Z Fold 5 5G (12GB RAM, 512GB)",
    "brand": "Samsung",
    "category": "Smartphones",
    "price": 164999,
    "stock": 7,
    "rating": 4.8,
    "reviewCount": 39,
    "imageUrl": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop",
    "description": "PC-like multitasking in your pocket. 7.6-inch Dynamic AMOLED 2X folding screen with S-Pen support, zero-gap Flex Hinge, Snapdragon 8 Gen 2 for Galaxy, and IPX8 water resistance.",
    "specifications": "{\"processor\": \"Qualcomm Snapdragon 8 Gen 2 for Galaxy\", \"ram\": \"12GB LPDDR5X\", \"storage\": \"512GB UFS 4.0\", \"display_main\": \"7.6-inch 120Hz QXGA+ Dynamic AMOLED 2X\", \"display_cover\": \"6.2-inch 120Hz Dynamic AMOLED 2X\", \"camera\": \"50MP Main OIS + 12MP Ultra-wide + 10MP 3x Telephoto\", \"battery\": \"4400 mAh with 25W Wired + 15W Wireless\"}",
    "createdAt": "2026-10-30T15:54:01.058756Z",
    "updatedAt": "2026-10-30T15:54:01.058756Z",
    "stockQuantity": 7
  },
  {
    "id": 226,
    "name": "OnePlus Open Foldable Flagship (16GB RAM, 512GB)",
    "brand": "OnePlus",
    "category": "Smartphones",
    "price": 139999,
    "stock": 9,
    "rating": 4.9,
    "reviewCount": 48,
    "imageUrl": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop",
    "description": "Ultra-lightweight foldable with near-invisible crease. Dual 2K 120Hz Fluid AMOLED screens, Hasselblad Camera for Mobile with 64MP periscope telephoto, and 67W SUPERVOOC charging.",
    "specifications": "{\"processor\": \"Snapdragon 8 Gen 2\", \"ram\": \"16GB LPDDR5X\", \"storage\": \"512GB UFS 4.0\", \"display\": \"7.82-inch 2K 120Hz LTPO 3.0 Flexi-fluid AMOLED\", \"camera\": \"48MP Sony LYT-T808 + 64MP 3x Periscope + 48MP Ultra-wide\", \"battery\": \"4805 mAh with 67W Fast Charging\"}",
    "createdAt": "2026-10-30T15:54:01.058756Z",
    "updatedAt": "2026-10-30T15:54:01.058756Z",
    "stockQuantity": 9
  },
  {
    "id": 227,
    "name": "Nothing Phone (2) 5G (12GB RAM, 256GB)",
    "brand": "Nothing",
    "category": "Smartphones",
    "price": 37999,
    "stock": 26,
    "rating": 4.6,
    "reviewCount": 87,
    "imageUrl": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop",
    "description": "Iconic transparent back with customizable Glyph Interface LED lighting. Snapdragon 8+ Gen 1 flagship chipset, 6.7-inch 120Hz LTPO OLED, and dual 50MP Sony IMX890 cameras.",
    "specifications": "{\"processor\": \"Qualcomm Snapdragon 8+ Gen 1\", \"ram\": \"12GB\", \"storage\": \"256GB\", \"display\": \"6.7-inch Flexible LTPO OLED (1-120Hz)\", \"camera\": \"Dual 50MP Rear (Sony IMX890 OIS + Samsung JN1) / 32MP Front\", \"battery\": \"4700 mAh with 45W Wired + 15W Wireless\"}",
    "createdAt": "2026-10-30T15:54:01.058756Z",
    "updatedAt": "2026-10-30T15:54:01.058756Z",
    "stockQuantity": 26
  },
  {
    "id": 228,
    "name": "Vivo X100 Pro 5G with ZEISS APO Telephoto (16GB, 512GB)",
    "brand": "Vivo",
    "category": "Smartphones",
    "price": 89999,
    "stock": 14,
    "rating": 4.9,
    "reviewCount": 36,
    "imageUrl": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop",
    "description": "Professional mobile photography titan. 1-inch Sony IMX989 main sensor with ZEISS Multifocal portrait, MediaTek Dimensity 9300 chipset, custom Vivo V3 imaging chip, and 100W FlashCharge.",
    "specifications": "{\"processor\": \"MediaTek Dimensity 9300 (All-Big-Core 4nm)\", \"camera\": \"50MP 1-inch Sony IMX989 + 50MP ZEISS APO Floating Telephoto (4.3x optical) + 50MP Ultra-wide\", \"ram_storage\": \"16GB LPDDR5T / 512GB UFS 4.0\", \"battery\": \"5400 mAh with 100W Dual-Cell FlashCharge\"}",
    "createdAt": "2026-10-30T15:54:01.058756Z",
    "updatedAt": "2026-10-30T15:54:01.058756Z",
    "stockQuantity": 14
  },
  {
    "id": 324,
    "name": "Marshall Stanmore III Wireless Bluetooth Home Speaker",
    "brand": "Marshall",
    "category": "Audio & Headphones",
    "price": 34999,
    "stock": 14,
    "rating": 4.8,
    "reviewCount": 42,
    "imageUrl": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop",
    "description": "Iconic vintage rock-and-roll aesthetic with room-shaking Marshall signature sound. Re-engineered wider soundstage with angled tweeters, Dynamic Loudness, and Bluetooth 5.2 LE Audio.",
    "specifications": "{\"amplifiers\": \"1x 50W Class D for Woofer + 2x 15W Class D for Tweeters (80W total)\", \"frequency\": \"45 Hz - 20,000 Hz\", \"controls\": \"Analog Brass Knobs for Bass, Treble, Volume\", \"inputs\": \"Bluetooth 5.2, 3.5mm Aux, RCA Input\"}",
    "createdAt": "2026-10-30T15:54:01.058756Z",
    "updatedAt": "2026-10-30T15:54:01.058756Z",
    "stockQuantity": 14
  },
  {
    "id": 709,
    "name": "Fujifilm X-T5 Mirrorless Camera Body 40.2MP",
    "brand": "Fujifilm",
    "category": "Cameras & Gaming",
    "price": 169999,
    "stock": 6,
    "rating": 4.9,
    "reviewCount": 28,
    "imageUrl": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop",
    "description": "High-resolution photographic perfection. 40.2MP X-Trans CMOS 5 HR back-illuminated sensor, 5-axis 7.0-stop in-body image stabilization (IBIS), 6.2K/30p video, and classic tactile dial controls.",
    "specifications": "{\"sensor\": \"40.2MP X-Trans CMOS 5 HR APS-C\", \"ibis\": \"5-axis 7.0 stops IBIS\", \"video\": \"6.2K at 30p, 4K at 60p 10-bit 4:2:2\", \"viewfinder\": \"3.69M-dot OLED EVF\", \"storage\": \"Dual UHS-II SD Card Slots\"}",
    "createdAt": "2026-10-30T15:54:01.058756Z",
    "updatedAt": "2026-10-30T15:54:01.058756Z",
    "stockQuantity": 6
  },
  {
    "id": 710,
    "name": "DJI Avata 2 FPV Drone Fly More Combo (Three Batteries)",
    "brand": "DJI",
    "category": "Cameras & Gaming",
    "price": 112990,
    "stock": 8,
    "rating": 4.8,
    "reviewCount": 33,
    "imageUrl": "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&auto=format&fit=crop",
    "description": "Adrenaline-pumping first-person view flying experience. 4K/60fps HDR ultra-wide 155-degree camera with 1/1.3-inch image sensor, integrated propeller guards, DJI Goggles 3, and RC Motion 3 controller.",
    "specifications": "{\"camera\": \"1/1.3-inch CMOS 4K/60fps HDR 155 deg FOV\", \"transmission\": \"DJI O4 Video Transmission up to 13 km\", \"flight_time\": \"Up to 23 minutes per battery (3 included)\", \"combo_includes\": \"DJI Goggles 3 + RC Motion 3 + Two-Way Charging Hub\"}",
    "createdAt": "2026-10-30T15:54:01.058756Z",
    "updatedAt": "2026-10-30T15:54:01.058756Z",
    "stockQuantity": 8
  },
  {
    "id": 711,
    "name": "ASUS ROG Ally X Handheld Gaming Console (AMD Z1 Extreme, 24GB RAM, 1TB)",
    "brand": "ASUS",
    "category": "Cameras & Gaming",
    "price": 89990,
    "stock": 15,
    "rating": 4.8,
    "reviewCount": 44,
    "imageUrl": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop",
    "description": "The ultimate Windows 11 handheld gaming PC. Upgraded massive 80Wh battery (2x capacity), 24GB high-speed LPDDR5X RAM, 1TB M.2 2280 NVMe SSD, and 7-inch FHD 120Hz FreeSync Premium display.",
    "specifications": "{\"processor\": \"AMD Ryzen Z1 Extreme (8 cores, 16 threads, 8.6 TFlops RDNA 3)\", \"ram\": \"24GB LPDDR5X 7500MHz\", \"storage\": \"1TB PCIe 4.0 NVMe M.2 2280 SSD\", \"display\": \"7-inch FHD (1920x1080) 120Hz IPS 500 nits FreeSync\", \"battery\": \"80Wh 4-cell Li-ion (Doubled Battery)\", \"os\": \"Windows 11 Home with Armoury Crate SE\"}",
    "createdAt": "2026-10-30T15:54:01.058756Z",
    "updatedAt": "2026-10-30T15:54:01.058756Z",
    "stockQuantity": 15
  },
  {
    "id": 2504,
    "name": "Apple MacBook Pro 16-inch M3 Max 36GB Unified RAM 1TB SSD",
    "brand": "Apple",
    "category": "Laptops",
    "price": 349900,
    "stock": 6,
    "rating": 5,
    "reviewCount": 45,
    "imageUrl": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop",
    "description": "Unprecedented workstation power in Space Black. Apple M3 Max with 14-core CPU and 30-core GPU. Liquid Retina XDR display with 1600 nits peak brightness, hardware-accelerated ray tracing, and 22-hour battery life.",
    "specifications": "{\"processor\": \"Apple M3 Max (14-core CPU, 30-core GPU, 16-core Neural Engine)\", \"memory\": \"36GB Unified Memory\", \"storage\": \"1TB Superfast NVMe SSD\", \"display\": \"16.2-inch Liquid Retina XDR (3456x2234, 120Hz ProMotion)\", \"ports\": \"3x Thunderbolt 4, HDMI 2.1, SDXC card slot, MagSafe 3\", \"battery\": \"Up to 22 hours\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 6
  },
  {
    "id": 2505,
    "name": "ASUS ROG Zephyrus G16 OLED Intel Core Ultra 9 RTX 4080 Gaming Laptop",
    "brand": "ASUS",
    "category": "Laptops",
    "price": 279990,
    "stock": 7,
    "rating": 4.9,
    "reviewCount": 39,
    "imageUrl": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop",
    "description": "Precision CNC-machined aluminum chassis only 1.49cm thin. 16-inch 2.5K 240Hz 0.2ms ROG Nebula OLED display, Intel Core Ultra 9 185H processor, NVIDIA GeForce RTX 4080 12GB GPU, and Slash Lighting on the lid.",
    "specifications": "{\"cpu\": \"Intel Core Ultra 9 185H (16 Cores, Intel AI Boost NPU)\", \"gpu\": \"NVIDIA GeForce RTX 4080 Laptop GPU 12GB GDDR6\", \"display\": \"16-inch 2.5K (2560x1600) 240Hz 0.2ms OLED G-SYNC\", \"ram_storage\": \"32GB LPDDR5X-7467 MHz, 2TB PCIe 4.0 SSD\", \"weight\": \"1.85 kg ultra-portable\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 7
  },
  {
    "id": 2506,
    "name": "Lenovo Legion Pro 7i Gen 9 Intel Core i9 RTX 4090 Gaming Laptop",
    "brand": "Lenovo",
    "category": "Laptops",
    "price": 319990,
    "stock": 5,
    "rating": 5,
    "reviewCount": 32,
    "imageUrl": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop",
    "description": "Unrivaled competitive esports titan. Intel Core i9-14900HX CPU paired with maximum 175W TGP NVIDIA GeForce RTX 4090 16GB GPU. Legion Coldfront vapor chamber cooling and 16-inch WQXGA 240Hz display.",
    "specifications": "{\"cpu\": \"Intel Core i9-14900HX (24 Cores / 32 Threads, up to 5.8 GHz)\", \"gpu\": \"NVIDIA GeForce RTX 4090 16GB GDDR6 (175W TGP)\", \"ram_storage\": \"32GB DDR5-5600 MHz, 2TB PCIe Gen 4 SSD\", \"display\": \"16-inch WQXGA (2560x1600) IPS 240Hz 500 nits 100% DCI-P3\", \"keyboard\": \"Per-key RGB Legion TrueStrike with 1.5mm key travel\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 5
  },
  {
    "id": 323,
    "name": "Bose QuietComfort Ultra Wireless Noise Cancelling Headphones",
    "brand": "Bose",
    "category": "Audio & Headphones",
    "price": 35900,
    "stock": 17,
    "rating": 4.9,
    "reviewCount": 65,
    "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop",
    "description": "World-class active noise cancellation with breakthrough Bose Immersive Audio spatial sound. CustomTune sound calibration tailored to your ear shape and up to 24 hours battery life.",
    "specifications": "{\"anc\": \"World-class Active Noise Cancellation with CustomTune\", \"audio\": \"Bose Immersive Audio Spatial Sound\", \"battery\": \"Up to 24 hours (18 hours with Immersive Audio)\", \"charging\": \"USB-C with 15-min quick charge for 2.5 hours\", \"connectivity\": \"Bluetooth 5.3 with Snapdragon Sound aptX Adaptive\"}",
    "createdAt": "2026-10-30T15:54:01.058756Z",
    "updatedAt": "2026-10-31T08:18:31.468228Z",
    "stockQuantity": 17
  },
  {
    "id": 1301,
    "name": "Samsung Odyssey OLED G9 49-inch Curved Dual QHD Gaming Monitor",
    "brand": "Samsung",
    "category": "Monitors & Displays",
    "price": 144999,
    "stock": 7,
    "rating": 4.9,
    "reviewCount": 42,
    "imageUrl": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop",
    "description": "Colossal 49-inch 1800R curved display with Neo Quantum Processor Pro. Dual QHD 5120x1440 resolution, 0.03ms response time, 240Hz refresh rate, DisplayHDR True Black 400, and Gaming Hub.",
    "specifications": "{\"screen_size\": \"49-inch (32:9)\", \"panel_type\": \"QD-OLED Curved 1800R\", \"resolution\": \"Dual QHD (5120x1440)\", \"refresh_rate\": \"240Hz\", \"response_time\": \"0.03ms (GtG)\", \"hdr\": \"DisplayHDR True Black 400\", \"ports\": \"HDMI 2.1, Micro HDMI 2.1, DP 1.4, USB Hub\", \"sync\": \"AMD FreeSync Premium Pro\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 7
  },
  {
    "id": 1302,
    "name": "LG UltraGear 27GR95QE 27-inch QHD OLED Gaming Monitor",
    "brand": "LG",
    "category": "Monitors & Displays",
    "price": 74990,
    "stock": 14,
    "rating": 4.8,
    "reviewCount": 65,
    "imageUrl": "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600&auto=format&fit=crop",
    "description": "World's first 240Hz OLED gaming monitor with 0.03ms response time. Anti-glare low reflection coating, 98.5% DCI-P3 color gamut, NVIDIA G-SYNC Compatible, and HDMI 2.1 support.",
    "specifications": "{\"screen_size\": \"27-inch\", \"panel_type\": \"OLED\", \"resolution\": \"QHD (2560x1440)\", \"refresh_rate\": \"240Hz\", \"response_time\": \"0.03ms\", \"color_gamut\": \"98.5% DCI-P3\", \"ports\": \"2x HDMI 2.1, 1x DP 1.4, 2x USB 3.0\", \"sync\": \"G-Sync Compatible, FreeSync Premium\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 14
  },
  {
    "id": 1303,
    "name": "Dell UltraSharp 32 4K USB-C Hub Monitor U3223QE",
    "brand": "Dell",
    "category": "Monitors & Displays",
    "price": 82490,
    "stock": 12,
    "rating": 4.9,
    "reviewCount": 39,
    "imageUrl": "https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?w=600&auto=format&fit=crop",
    "description": "Groundbreaking IPS Black technology delivers extraordinary 2000:1 contrast ratio. 4K UHD clarity, 98% DCI-P3, USB-C 90W power delivery hub, built-in RJ45 Ethernet, and KVM switch.",
    "specifications": "{\"screen_size\": \"31.5-inch\", \"panel_type\": \"IPS Black\", \"resolution\": \"4K UHD (3840x2160)\", \"refresh_rate\": \"60Hz\", \"contrast_ratio\": \"2000:1\", \"ports\": \"USB-C 90W PD, DisplayPort 1.4, HDMI, RJ45 Ethernet\", \"kvm\": \"Auto KVM built-in\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 12
  },
  {
    "id": 1305,
    "name": "ASUS ROG Swift PG32UQX 32-inch 4K Mini-LED HDR1400 Gaming Monitor",
    "brand": "ASUS",
    "category": "Monitors & Displays",
    "price": 199990,
    "stock": 4,
    "rating": 5,
    "reviewCount": 18,
    "imageUrl": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop",
    "description": "The zenith of gaming displays: 1152-zone Mini-LED backlighting with 1400 nits peak brightness. Full-array local dimming, 4K 144Hz G-SYNC Ultimate, Quantum Dot technology, and LiveDash OLED.",
    "specifications": "{\"screen_size\": \"32-inch\", \"panel_type\": \"Mini-LED IPS\", \"resolution\": \"4K UHD (3840x2160)\", \"refresh_rate\": \"144Hz\", \"dimming_zones\": \"1152 Zones Full Array\", \"peak_brightness\": \"1400 nits\", \"hdr\": \"VESA DisplayHDR 1400\", \"sync\": \"NVIDIA G-SYNC Ultimate\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 4
  },
  {
    "id": 1306,
    "name": "MSI Optix MAG342CQR 34-inch Curved Ultrawide UWQHD Gaming Monitor",
    "brand": "MSI",
    "category": "Monitors & Displays",
    "price": 38990,
    "stock": 21,
    "rating": 4.6,
    "reviewCount": 73,
    "imageUrl": "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=600&auto=format&fit=crop",
    "description": "Immersive 1500R curvature with UWQHD 3440x1440 resolution. 144Hz refresh rate, 1ms response time, Mystic Light RGB, and Adaptive Sync for seamless tear-free gameplay.",
    "specifications": "{\"screen_size\": \"34-inch Ultrawide 21:9\", \"curvature\": \"1500R\", \"resolution\": \"UWQHD (3440x1440)\", \"refresh_rate\": \"144Hz\", \"response_time\": \"1ms (MPRT)\", \"ports\": \"2x HDMI 2.0, 1x DP 1.4\", \"sync\": \"Adaptive Sync\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 21
  },
  {
    "id": 1401,
    "name": "HP Smart Tank 580 All-in-One WiFi Color Ink Tank Printer",
    "brand": "HP",
    "category": "Printers & Office Electronics",
    "price": 13999,
    "stock": 35,
    "rating": 4.6,
    "reviewCount": 142,
    "imageUrl": "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&auto=format&fit=crop",
    "description": "Ultra-low-cost high-capacity color printing up to 12,000 black or 6,000 color pages inbox. Self-healing dual-band Wi-Fi, HP Smart app mobile printing, flatbed scanner, and borderless photo print.",
    "specifications": "{\"functions\": \"Print, Copy, Scan\", \"print_speed\": \"Up to 12 ppm black / 5 ppm color\", \"connectivity\": \"Dual Band Wi-Fi, Hi-Speed USB 2.0, Bluetooth LE\", \"page_yield\": \"12,000 black / 6,000 color pages\", \"warranty\": \"1 Year or 30,000 pages\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 35
  },
  {
    "id": 1402,
    "name": "Canon PIXMA MegaTank G3020 All-in-One Wireless Ink Tank Printer",
    "brand": "Canon",
    "category": "Printers & Office Electronics",
    "price": 14499,
    "stock": 29,
    "rating": 4.7,
    "reviewCount": 115,
    "imageUrl": "https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=600&auto=format&fit=crop",
    "description": "High-volume ink tank system designed for home and small offices. Economy Mode prints up to 7,700 color or 7,600 black pages. User-replaceable maintenance cartridge and 2-line mono LCD screen.",
    "specifications": "{\"functions\": \"Print, Scan, Copy\", \"print_speed\": \"9.1 ipm black / 5.0 ipm color\", \"connectivity\": \"Wireless LAN, Direct Wireless, USB 2.0\", \"ink_type\": \"GI-71 Pigment Black / Dye Color\", \"display\": \"2-line LCD\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 29
  },
  {
    "id": 1405,
    "name": "Epson Perfection V39 II Color Flatbed Photo & Document Scanner",
    "brand": "Epson",
    "category": "Printers & Office Electronics",
    "price": 6999,
    "stock": 25,
    "rating": 4.6,
    "reviewCount": 51,
    "imageUrl": "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=600&auto=format&fit=crop",
    "description": "High-resolution 4800 dpi scanning in an ultra-slim compact form factor. USB powered with zero warmup time using ReadyScan LED technology. Built-in kickstand for upright scanning.",
    "specifications": "{\"scanner_type\": \"Flatbed Color Image Scanner\", \"optical_resolution\": \"4800 x 4800 dpi\", \"light_source\": \"Three-color RGB LED\", \"power\": \"USB Bus-Powered (No AC adapter needed)\", \"features\": \"Scan to PDF, Cloud & Email\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 25
  },
  {
    "id": 1501,
    "name": "DJI Mini 4 Pro Drone with DJI RC 2 Remote Controller",
    "brand": "DJI",
    "category": "Drones & Aerial Imaging",
    "price": 109990,
    "stock": 10,
    "rating": 4.9,
    "reviewCount": 58,
    "imageUrl": "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600&auto=format&fit=crop",
    "description": "Ultralight sub-249g drone with omnidirectional obstacle sensing. 4K/60fps HDR True Vertical shooting, 10-bit D-Log M color, 20km FHD video transmission with DJI O4, and 34-min flight time.",
    "specifications": "{\"weight\": \"< 249g (No registration needed in many regions)\", \"video\": \"4K/60fps HDR, 4K/100fps Slow Motion\", \"sensor\": \"1/1.3-inch CMOS f/1.7\", \"obstacle_sensing\": \"Omnidirectional Active Sensing\", \"range\": \"Up to 20km FHD (DJI O4)\", \"flight_time\": \"34 minutes\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 10
  },
  {
    "id": 1502,
    "name": "DJI Air 3 Drone with Dual Primary 4K Cameras & RC-N2",
    "brand": "DJI",
    "category": "Drones & Aerial Imaging",
    "price": 154990,
    "stock": 6,
    "rating": 4.9,
    "reviewCount": 36,
    "imageUrl": "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&auto=format&fit=crop",
    "description": "Pioneering dual-primary camera system with a 24mm wide-angle and a 70mm 3x medium telephoto camera. Up to 46 minutes of flight time, omnidirectional obstacle avoidance, and 48MP photos.",
    "specifications": "{\"cameras\": \"Dual 48MP 1/1.3-inch CMOS (24mm Wide + 70mm 3x Tele)\", \"video\": \"4K/60fps HDR, 4K/100fps max\", \"flight_time\": \"Up to 46 minutes\", \"obstacle_sensing\": \"Omnidirectional APAS 5.0\", \"transmission\": \"DJI O4 HD 20km\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 6
  },
  {
    "id": 1503,
    "name": "DJI Avata 2 Fly More Combo FPV Drone with Goggles 3",
    "brand": "DJI",
    "category": "Drones & Aerial Imaging",
    "price": 114990,
    "stock": 8,
    "rating": 4.8,
    "reviewCount": 41,
    "imageUrl": "https://images.unsplash.com/photo-1506947411487-a56738267384?w=600&auto=format&fit=crop",
    "description": "Adrenaline-pumping first-person view acrobatic flying. 1/1.3-inch sensor with 4K/60fps ultra-wide 155 FOV video, integrated propeller guards, Easy ACRO flips and rolls, and Goggles 3 with Real View PiP.",
    "specifications": "{\"flight_type\": \"FPV Acrobatic Drone\", \"fov\": \"155 Ultra-Wide Angle\", \"video\": \"4K/60fps HDR with RockSteady 3.0+\", \"safety\": \"Built-in Propeller Guard, Turtle Mode\", \"goggles\": \"DJI Goggles 3 Micro-OLED\", \"flight_time\": \"23 minutes\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 8
  },
  {
    "id": 1504,
    "name": "DJI Osmo Mobile 6 Smartphone 3-Axis Gimbal Stabilizer",
    "brand": "DJI",
    "category": "Drones & Aerial Imaging",
    "price": 12490,
    "stock": 28,
    "rating": 4.7,
    "reviewCount": 92,
    "imageUrl": "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop",
    "description": "Compact foldable smartphone gimbal with built-in extension rod. ActiveTrack 6.0 locks onto subjects flawlessly. Magnetic phone clamp, side wheel for zoom/focus, and Quick Launch for iPhone.",
    "specifications": "{\"stabilization\": \"3-Axis Motorized Gimbal\", \"tracking\": \"ActiveTrack 6.0\", \"built_in\": \"215mm Extension Rod & Tripod\", \"battery_life\": \"Approx 6.4 hours\", \"weight\": \"309g (Gimbal) + 31g (Clamp)\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 28
  },
  {
    "id": 1505,
    "name": "DJI RS 3 Mini 3-Axis Gimbal Stabilizer for Mirrorless Cameras",
    "brand": "DJI",
    "category": "Drones & Aerial Imaging",
    "price": 24990,
    "stock": 15,
    "rating": 4.8,
    "reviewCount": 47,
    "imageUrl": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop",
    "description": "Ultra-compact lightweight handheld gimbal supporting up to 2kg payload. Native vertical shooting without extra accessories, 3rd-Gen RS stabilization algorithm, and Bluetooth camera shutter control.",
    "specifications": "{\"payload_capacity\": \"Up to 2.0 kg\", \"weight\": \"795g (Vertical mode) / 850g (Horizontal)\", \"battery_life\": \"Up to 10 hours\", \"screen\": \"1.4-inch Full Color Touchscreen\", \"vertical\": \"Native Vertical Shooting Switch\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 15
  },
  {
    "id": 1601,
    "name": "TP-Link Deco XE75 Pro AXE5400 Tri-Band WiFi 6E Mesh System (2-Pack)",
    "brand": "TP-Link",
    "category": "Networking & Wireless",
    "price": 27999,
    "stock": 18,
    "rating": 4.8,
    "reviewCount": 64,
    "imageUrl": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop",
    "description": "Whole-home Wi-Fi 6E mesh system covering up to 5,500 sq ft. Breakthrough 6GHz band eliminates interference. 2.5 Gbps multi-gigabit WAN/LAN port, AI-Driven Mesh algorithm, and TP-Link HomeShield security.",
    "specifications": "{\"bands\": \"Tri-Band AXE5400 (6GHz: 2402Mbps + 5GHz: 2402Mbps + 2.4GHz: 574Mbps)\", \"coverage\": \"Up to 5,500 sq ft / 200+ Devices\", \"ethernet\": \"1x 2.5 Gbps Port + 2x Gigabit Ports per unit\", \"features\": \"AI-Mesh, HomeShield Pro, Parental Controls\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 18
  },
  {
    "id": 1602,
    "name": "ASUS RT-AX88U Pro Dual-Band WiFi 6 Extendable Gaming Router",
    "brand": "ASUS",
    "category": "Networking & Wireless",
    "price": 26990,
    "stock": 14,
    "rating": 4.9,
    "reviewCount": 51,
    "imageUrl": "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=600&auto=format&fit=crop",
    "description": "High-performance dual 2.5G ports router powered by a 2.0 GHz quad-core CPU. 6000 Mbps ultra-fast WiFi 6 speed, ASUS AiProtection Pro security, Mobile Game Mode, and AiMesh expandable coverage.",
    "specifications": "{\"speed\": \"AX6000 (1148Mbps on 2.4GHz + 4804Mbps on 5GHz)\", \"ports\": \"Dual 2.5G WAN/LAN Ports + 4x Gigabit LAN + USB 3.2\", \"cpu\": \"2.0 GHz Quad-Core 64-bit CPU\", \"features\": \"AiProtection Pro with Trend Micro, Adaptive QoS\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 14
  },
  {
    "id": 1604,
    "name": "TP-Link Archer AX73 AX5400 Dual-Band Gigabit WiFi 6 Router",
    "brand": "TP-Link",
    "category": "Networking & Wireless",
    "price": 8999,
    "stock": 42,
    "rating": 4.7,
    "reviewCount": 178,
    "imageUrl": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop",
    "description": "Full-speed 5400 Mbps WiFi 6 router designed for buffer-free 8K streaming and intensive multi-device homes. 6 high-gain antennas with Beamforming and 4T4R structure for maximum coverage.",
    "specifications": "{\"speed\": \"AX5400 (4804 Mbps on 5 GHz + 574 Mbps on 2.4 GHz)\", \"antennas\": \"6x High-Gain External Antennas\", \"ports\": \"1x Gigabit WAN + 4x Gigabit LAN + 1x USB 3.0\", \"capacity\": \"Connects 200+ Devices with MU-MIMO & OFDMA\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 42
  },
  {
    "id": 1605,
    "name": "Netgear Nighthawk M6 5G Mobile Hotspot Router",
    "brand": "Netgear",
    "category": "Networking & Wireless",
    "price": 49990,
    "stock": 9,
    "rating": 4.8,
    "reviewCount": 27,
    "imageUrl": "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=600&auto=format&fit=crop",
    "description": "Blazing fast 5G sub-6 internet on the go with WiFi 6 speeds up to 3.6 Gbps. 2.5G Ethernet port, 2.4-inch color LCD touch display, up to 32 connected devices, and 13-hour all-day removable battery.",
    "specifications": "{\"cellular\": \"5G Sub-6 GHz & 4G LTE Cat 19\", \"wifi\": \"WiFi 6 AX3600 (Up to 3.6 Gbps)\", \"ethernet\": \"1x 2.5 Gbps Multi-Gig Port\", \"display\": \"2.4-inch LCD Touchscreen\", \"battery\": \"5040mAh Lithium-ion (Up to 13 Hours)\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 9
  },
  {
    "id": 1606,
    "name": "TP-Link TL-SG108E 8-Port Gigabit Easy Smart Managed Switch",
    "brand": "TP-Link",
    "category": "Networking & Wireless",
    "price": 2999,
    "stock": 50,
    "rating": 4.8,
    "reviewCount": 210,
    "imageUrl": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop",
    "description": "Rugged steel casing 8-port gigabit switch providing traffic monitoring, VLAN prioritization, and QoS. Energy-efficient Green Ethernet technology cuts power usage by up to 58%.",
    "specifications": "{\"ports\": \"8x 10/100/1000 Mbps RJ45 Ports\", \"management\": \"Web UI & Easy Smart Configuration Utility\", \"features\": \"Port Mirroring, Loop Prevention, Cable Diagnostics, 802.1p QoS\", \"housing\": \"Durable Metal Desktop / Wall-Mounting\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 50
  },
  {
    "id": 1702,
    "name": "Sony PlayStation VR2 Headset for PlayStation 5",
    "brand": "Sony",
    "category": "AR, VR & Spatial Computing",
    "price": 54990,
    "stock": 15,
    "rating": 4.8,
    "reviewCount": 78,
    "imageUrl": "https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=600&auto=format&fit=crop",
    "description": "Cutting-edge VR for PS5 featuring 4K HDR OLED displays (2000x2040 per eye), intelligent eye tracking, headset feedback vibration, 3D Audio, and Sense controllers with adaptive triggers.",
    "specifications": "{\"display\": \"4K HDR OLED (2000 x 2040 per eye)\", \"refresh_rate\": \"90Hz, 120Hz\", \"fov\": \"Approx 110 degrees\", \"tracking\": \"Inside-out 4 cameras + Intelligent Eye Tracking\", \"feedback\": \"Headset haptic motor, Sense Controller adaptive triggers\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 15
  },
  {
    "id": 1703,
    "name": "XREAL Air 2 Pro AR Smart Glasses with Electrochromic Dimming",
    "brand": "XREAL",
    "category": "AR, VR & Spatial Computing",
    "price": 44990,
    "stock": 16,
    "rating": 4.7,
    "reviewCount": 39,
    "imageUrl": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop",
    "description": "Ultra-lightweight 75g augmented reality glasses projecting an expansive 330-inch virtual screen. Sony 0.55-inch Micro-OLED displays with 120Hz refresh rate, 3-level electrochromic light dimming, and cinematic directional speakers.",
    "specifications": "{\"display\": \"Sony Micro-OLED 1080p per eye (330-inch virtual display at 6m)\", \"weight\": \"75g\", \"refresh_rate\": \"120Hz\", \"dimming\": \"One-touch 3-level Electrochromic Dimming (0%, 35%, 100%)\", \"connectivity\": \"USB-C DisplayPort Alt Mode (iPhone 15/16, Steam Deck, PC)\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 16
  },
  {
    "id": 1802,
    "name": "WHOOP 4.0 Health, Strain & Sleep Performance Tracker",
    "brand": "WHOOP",
    "category": "Smart Wearables & Health Electronics",
    "price": 23990,
    "stock": 20,
    "rating": 4.8,
    "reviewCount": 59,
    "imageUrl": "https://images.unsplash.com/photo-1510017803434-a899398421b3?w=600&auto=format&fit=crop",
    "description": "Screen-free athletic biometric tracker monitoring cardiovascular strain, recovery, sleep performance, and respiratory rate 24/7. Includes waterproof wireless battery pack for charging on the wrist.",
    "specifications": "{\"tracking\": \"Heart Rate, HRV, Skin Temp, Blood Oxygen, Sleep Stages, Respiratory Rate\", \"design\": \"Screen-free minimalist fabric band with titanium clasp\", \"battery\": \"5 days continuous (Charge-on-the-go battery pack)\", \"waterproof\": \"IP68 water-resistant to 10 meters\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 20
  },
  {
    "id": 1803,
    "name": "Garmin Forerunner 965 GPS Premium Running Watch with AMOLED",
    "brand": "Garmin",
    "category": "Smart Wearables & Health Electronics",
    "price": 67490,
    "stock": 12,
    "rating": 4.9,
    "reviewCount": 48,
    "imageUrl": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop",
    "description": "The ultimate triathlete and marathoner smartwatch. Vivid 1.4-inch AMOLED touchscreen with lightweight titanium bezel. Full-color built-in topo maps, Multi-Band GPS with SatIQ, and up to 23-day battery.",
    "specifications": "{\"screen\": \"1.4-inch AMOLED Touchscreen (454 x 454)\", \"bezel\": \"Titanium Bezel with Corning Gorilla Glass DX\", \"gps\": \"Multi-Band GNSS with SatIQ Technology\", \"battery_life\": \"Up to 23 days in smartwatch mode / 31 hours GPS\", \"maps\": \"Built-in Full-Color TopoActive Maps\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 12
  },
  {
    "id": 1902,
    "name": "EcoFlow River 2 Pro 768Wh Portable Power Station with LiFePO4",
    "brand": "EcoFlow",
    "category": "Power Banks & Portable Power",
    "price": 54999,
    "stock": 9,
    "rating": 4.9,
    "reviewCount": 43,
    "imageUrl": "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&auto=format&fit=crop",
    "description": "Rugged LiFePO4 battery station with 3000+ life cycles (10 years daily use). 800W AC output (X-Boost up to 1600W). Charges from 0-100% via AC wall outlet in only 70 minutes. Supports 220W solar input.",
    "specifications": "{\"capacity\": \"768 Wh\", \"battery_chemistry\": \"LFP (LiFePO4) 3000+ cycles to 80%\", \"ac_output\": \"3x AC Outlets (800W total, X-Boost 1600W)\", \"recharge_time\": \"70 minutes (Wall AC) / 3.5 hrs (Solar 220W)\", \"weight\": \"7.8 kg\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 9
  },
  {
    "id": 1903,
    "name": "Baseus Blade 100W Ultra-Slim Laptop Power Bank 20000mAh",
    "brand": "Baseus",
    "category": "Power Banks & Portable Power",
    "price": 6999,
    "stock": 35,
    "rating": 4.7,
    "reviewCount": 126,
    "imageUrl": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop",
    "description": "Only 0.7-inch thin flat profile easily slides into any laptop backpack sleeve. 100W USB-C Power Delivery charges high-end laptops, MacBooks, and Steam Deck. Numerical LED status display.",
    "specifications": "{\"capacity\": \"20,000 mAh (74 Wh)\", \"thickness\": \"18mm (0.7-inch)\", \"ports\": \"2x USB-C (100W PD) + 2x USB-A (30W QC)\", \"protocols\": \"PD 3.0, QC 4+, SCP, FCP\", \"display\": \"LED Battery % and remaining time display\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 35
  },
  {
    "id": 1904,
    "name": "Belkin BoostCharge Pro 3-in-1 Wireless MagSafe Charger 15W",
    "brand": "Belkin",
    "category": "Power Banks & Portable Power",
    "price": 13990,
    "stock": 27,
    "rating": 4.8,
    "reviewCount": 68,
    "imageUrl": "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&auto=format&fit=crop",
    "description": "Architectural stainless steel tree design fast charges iPhone 12/13/14/15/16 at 15W with MagSafe, Apple Watch Ultra/Series fast charger, and dedicated Qi pad for AirPods Pro.",
    "specifications": "{\"charging\": \"15W Official MagSafe (iPhone) + Fast Apple Watch Puck + 5W AirPods Qi\", \"material\": \"Premium Stainless Steel & Soft-touch Silicone\", \"compatibility\": \"MagSafe iPhone models, Apple Watch, AirPods with Wireless Case\", \"power_supply\": \"40W AC power brick included\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 27
  },
  {
    "id": 1905,
    "name": "UGREEN Nexode 300W 5-Port GaN Desktop Fast Charger",
    "brand": "UGREEN",
    "category": "Power Banks & Portable Power",
    "price": 18990,
    "stock": 15,
    "rating": 4.9,
    "reviewCount": 38,
    "imageUrl": "https://images.unsplash.com/photo-1541689592655-f5f52825a3b8?w=600&auto=format&fit=crop",
    "description": "Industry leading 300W Gallium Nitride (GaNFast) desktop charger. Powers up to three laptops simultaneously with single-port 140W PD 3.1 output. Thermal Guard temperature safety monitoring.",
    "specifications": "{\"total_power\": \"300W GaN Desktop Charger\", \"ports\": \"4x USB-C + 1x USB-A\", \"max_single_port\": \"USB-C1: 140W (PD 3.1)\", \"safety\": \"Thermal Guard 2.0 temperature scanning 6,000 times/min\", \"form_factor\": \"Compact Vertical Desktop Design with 2m AC cable\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 15
  },
  {
    "id": 2001,
    "name": "EufyCam S330 (eufyCam 3) 4K Wireless Solar Security Camera 2-Cam Kit",
    "brand": "Eufy",
    "category": "Smart Security & Surveillance",
    "price": 49990,
    "stock": 14,
    "rating": 4.9,
    "reviewCount": 55,
    "imageUrl": "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop",
    "description": "Forever-power solar security system with integrated solar panel requiring only 2 hours of direct sunlight daily. 4K Ultra HD clarity, BionicMind AI facial recognition, and expandable local storage up to 16TB without monthly fees.",
    "specifications": "{\"resolution\": \"4K Ultra HD (3840 x 2160)\", \"power\": \"Integrated Solar Panel + 13,000mAh Battery\", \"ai\": \"BionicMind On-Device Facial & Vehicle Recognition\", \"storage\": \"HomeBase 3 with expandable 2.5-inch hard drive up to 16TB\", \"monthly_fees\": \"Zero Monthly Subscription Fees\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 14
  },
  {
    "id": 2002,
    "name": "Ring Video Doorbell Pro 2 with 1536p HD Head-to-Toe Video",
    "brand": "Ring",
    "category": "Smart Security & Surveillance",
    "price": 22990,
    "stock": 20,
    "rating": 4.7,
    "reviewCount": 89,
    "imageUrl": "https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop",
    "description": "Premium hardwired smart doorbell with expanded Head-to-Toe field of view and 3D Motion Detection using radar technology. Bird's Eye View map perspective of visitor approach path and two-way talk with Audio+.",
    "specifications": "{\"video\": \"1536p HD Head-to-Toe Video with HDR\", \"field_of_view\": \"150 Horizontal, 150 Vertical\", \"motion_detection\": \"3D Motion Detection with Bird's Eye View Radar\", \"audio\": \"Two-Way Talk with Audio+ and noise cancellation\", \"power\": \"Hardwired to existing doorbell wiring (16-24 VAC)\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 20
  },
  {
    "id": 2003,
    "name": "TP-Link Tapo C325WB 2K QHD ColorPro Outdoor Security Camera",
    "brand": "TP-Link",
    "category": "Smart Security & Surveillance",
    "price": 5499,
    "stock": 38,
    "rating": 4.8,
    "reviewCount": 132,
    "imageUrl": "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop",
    "description": "Revolutionary ColorPro night vision captures vivid daytime-like color video in pitch darkness without spotlights. 2K QHD resolution, IP66 weatherproof, smart AI person/animal/vehicle detection, and two-way audio.",
    "specifications": "{\"night_vision\": \"ColorPro Night Vision (F1.0 super-aperture lens)\", \"resolution\": \"2K QHD (2688 x 1520)\", \"weatherproof\": \"IP66 Water and Dust Resistant\", \"ai_features\": \"Smart AI Detection for People, Pets, and Vehicles\", \"storage\": \"MicroSD slot up to 512GB + Cloud Option\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 38
  },
  {
    "id": 2004,
    "name": "Yale Assure Lock 2 Smart Keyless Deadbolt with Wi-Fi & Biometric",
    "brand": "Yale",
    "category": "Smart Security & Surveillance",
    "price": 23990,
    "stock": 17,
    "rating": 4.8,
    "reviewCount": 49,
    "imageUrl": "https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop",
    "description": "Sleek compact smart lock with built-in Wi-Fi and fingerprint biometric scanner. Unlock via fingerprint, backlit keypad pin, Yale Access app, Apple HomeKit, Alexa, or auto-unlock as you approach.",
    "specifications": "{\"unlock_methods\": \"Fingerprint, Backlit Keypad, Phone App, Voice Assistant, Auto-Unlock\", \"connectivity\": \"Built-in Wi-Fi & Bluetooth (No bridge needed)\", \"integrations\": \"Apple HomeKit, Amazon Alexa, Google Home\", \"security\": \"Certified Commercial Grade 2 Deadbolt\", \"door_thickness\": \"1-3/8 inch to 2-1/4 inch\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 17
  },
  {
    "id": 2005,
    "name": "CP PLUS 4MP Intelligent Wi-Fi Pan-Tilt Security Dome Camera",
    "brand": "CP PLUS",
    "category": "Smart Security & Surveillance",
    "price": 2799,
    "stock": 60,
    "rating": 4.6,
    "reviewCount": 215,
    "imageUrl": "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop",
    "description": "360-degree pan and 85-degree tilt indoor surveillance camera with crisp 4MP resolution. Smart auto-tracking follows moving objects, motion alerts, full-duplex two-way audio, and privacy mode shutter.",
    "specifications": "{\"resolution\": \"4MP (2560 x 1440)\", \"pan_tilt\": \"360 Horizontal Pan, 85 Vertical Tilt\", \"night_vision\": \"IR Night Vision up to 10 meters\", \"audio\": \"Built-in Microphone and Speaker with Two-Way Audio\", \"storage\": \"Up to 256GB MicroSD card supported\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 60
  },
  {
    "id": 2202,
    "name": "Dyson V15 Detect Absolute Cordless Stick Vacuum Cleaner",
    "brand": "Dyson",
    "category": "Robot Vacuums & Smart Cleaning",
    "price": 62900,
    "stock": 18,
    "rating": 4.9,
    "reviewCount": 96,
    "imageUrl": "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&auto=format&fit=crop",
    "description": "Dyson's most powerful, intelligent cordless vacuum. Fluffy Optic cleaner head reveals invisible micro-dust on hard floors with a precisely angled green laser beam. Piezo acoustic sensor counts dust particles on LCD screen.",
    "specifications": "{\"suction_power\": \"240 Air Watts\", \"laser\": \"Illuminated Fluffy Cleaner Head (Laser dust revelation)\", \"sensor\": \"Piezo Acoustic Dust Particle Counter & Auto-suction booster\", \"filtration\": \"Whole-machine HEPA filtration traps 99.99% particles to 0.1 microns\", \"runtime\": \"Up to 60 minutes fade-free power\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 18
  },
  {
    "id": 2205,
    "name": "Eureka Forbes Robo iVac Robot Vacuum Cleaner with UV Sanitization",
    "brand": "Eureka Forbes",
    "category": "Robot Vacuums & Smart Cleaning",
    "price": 18999,
    "stock": 30,
    "rating": 4.5,
    "reviewCount": 118,
    "imageUrl": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop",
    "description": "Smart 2-in-1 sweeping and mopping robot tailored for Indian floor conditions with specialized UV-C germicidal disinfection. Gyroscope smart navigation, anti-fall sensors, and Forbes Smart app control.",
    "specifications": "{\"functions\": \"Dry Sweeping + Wet Mopping + UV Disinfection\", \"suction\": \"2,700 Pa\", \"filtration\": \"3-Stage HEPA Filter\", \"sensors\": \"Anti-Drop, Anti-Collision, Smart Gyro Navigation\", \"battery\": \"2600mAh (Up to 110 minutes runtime)\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 30
  },
  {
    "id": 315,
    "name": "Realme Buds Air 6 Pro ANC Earbuds",
    "brand": "Realme",
    "category": "Audio & Headphones",
    "price": 4499,
    "stock": 40,
    "rating": 4.7,
    "reviewCount": 58,
    "imageUrl": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop",
    "description": "Flagship acoustic setup under ₹5k featuring 50dB Smart Active Noise Cancellation, dual dynamic coaxial drivers (11mm bass + 6mm micro-planar tweeter), and LDAC Hi-Res Wireless.",
    "specifications": "{\"drivers\": \"11mm Bass + 6mm Micro-planar Tweeter\", \"anc\": \"50dB Smart Active Noise Cancellation\", \"codecs\": \"Hi-Res LDAC, AAC, SBC\", \"battery\": \"40 hours total playtime\"}",
    "createdAt": "2026-10-31T07:52:38.572713Z",
    "updatedAt": "2026-10-31T07:52:38.572713Z",
    "stockQuantity": 40
  },
  {
    "id": 2403,
    "name": "Pioneer DMH-WT8600NEX 10.1-inch Floating Screen Wireless CarPlay Receiver",
    "brand": "Pioneer",
    "category": "Car Electronics & Dash Cams",
    "price": 79990,
    "stock": 8,
    "rating": 4.8,
    "reviewCount": 31,
    "imageUrl": "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop",
    "description": "Massive 10.1-inch capacitive HD floating touchscreen head unit fitting single or double DIN dash slots. Wireless Apple CarPlay, Wireless Android Auto, Amazon Alexa built-in, and 24-bit True Color FLAC audio playback.",
    "specifications": "{\"display\": \"10.1-inch Capacitive HD Touchscreen (Floating Display)\", \"wireless\": \"Wireless Apple CarPlay, Wireless Android Auto, Bluetooth\", \"audio\": \"13-Band Graphic EQ, 3x 4V RCA Preouts, Hi-Res Audio FLAC\", \"camera_inputs\": \"Dual Camera Inputs with Parking Guidelines\", \"power\": \"50W x 4 Channels MOSFET\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 8
  },
  {
    "id": 2501,
    "name": "Apple iPhone 16 Pro Max 256GB Desert Titanium",
    "brand": "Apple",
    "category": "Smartphones",
    "price": 144900,
    "stock": 18,
    "rating": 4.9,
    "reviewCount": 180,
    "imageUrl": "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop",
    "description": "Stunning Grade 5 titanium design with larger 6.9-inch Super Retina XDR display. Powered by the groundbreaking A18 Pro chip, Camera Control button, 48MP Fusion camera with 4K 120fps Dolby Vision, and 5x optical telephoto.",
    "specifications": "{\"display\": \"6.9-inch Super Retina XDR OLED (120Hz ProMotion)\", \"processor\": \"A18 Pro chip with 6-core GPU\", \"camera\": \"48MP Fusion + 48MP Ultra Wide + 12MP 5x Telephoto\", \"video\": \"4K 120fps Dolby Vision, ProRes, Spatial Audio\", \"battery\": \"Up to 33 hours video playback, MagSafe 25W\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 18
  },
  {
    "id": 2502,
    "name": "Samsung Galaxy S24 Ultra 512GB Titanium Gray with S-Pen",
    "brand": "Samsung",
    "category": "Smartphones",
    "price": 139999,
    "stock": 22,
    "rating": 4.9,
    "reviewCount": 164,
    "imageUrl": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop",
    "description": "The pinnacle of Android innovation. Titanium frame with Corning Gorilla Armor anti-reflective display. Powered by Snapdragon 8 Gen 3 for Galaxy, Galaxy AI with Circle to Search, 200MP camera, and 5x optical 50MP telephoto.",
    "specifications": "{\"display\": \"6.8-inch Dynamic AMOLED 2X QHD+ 120Hz (2600 nits)\", \"processor\": \"Snapdragon 8 Gen 3 for Galaxy\", \"camera\": \"200MP Main + 50MP 5x Periscope + 10MP 3x + 12MP Ultra Wide\", \"ai\": \"Galaxy AI (Live Translate, Note Assist, Generative Edit)\", \"s_pen\": \"Built-in S-Pen stylus with Bluetooth gestures\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 22
  },
  {
    "id": 2503,
    "name": "Google Pixel 9 Pro XL 256GB Porcelain with Google Tensor G4",
    "brand": "Google",
    "category": "Smartphones",
    "price": 124999,
    "stock": 15,
    "rating": 4.8,
    "reviewCount": 92,
    "imageUrl": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop",
    "description": "Super Actua 6.8-inch display reaching 3000 nits peak brightness. Tensor G4 with 16GB RAM for Gemini AI. Triple pro camera system with Video Boost 8K, Super Res Zoom up to 30x, and 7 years of OS updates.",
    "specifications": "{\"display\": \"6.8-inch Super Actua OLED (1-120Hz LTPO, 3000 nits)\", \"processor\": \"Google Tensor G4 with Titan M2 security coprocessor\", \"ram_storage\": \"16GB RAM, 256GB Storage\", \"camera\": \"50MP Wide + 48MP Ultra Wide with Macro + 48MP 5x Telephoto\", \"support\": \"7 years of OS, security, and Pixel Feature Drops\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 15
  },
  {
    "id": 317,
    "name": "OnePlus Nord Buds 3 Pro",
    "brand": "OnePlus",
    "category": "Audio & Headphones",
    "price": 3299,
    "stock": 50,
    "rating": 4.6,
    "reviewCount": 64,
    "imageUrl": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop",
    "description": "Up to 49dB Smart Hybrid ANC, 12.4mm titanized dynamic driver, dual device connection, and 44 hours of total playback with ultra-fast charging.",
    "specifications": "{\"driver\": \"12.4mm Titanized Dynamic Driver\", \"anc\": \"49dB Smart Hybrid ANC\", \"battery\": \"44 hours with charging case\", \"connectivity\": \"Dual Connection Bluetooth 5.4\"}",
    "createdAt": "2026-10-31T07:52:38.572713Z",
    "updatedAt": "2026-10-31T07:52:38.572713Z",
    "stockQuantity": 50
  },
  {
    "id": 215,
    "name": "Realme 12 Pro 5G",
    "brand": "Realme",
    "category": "Smartphones",
    "price": 21999,
    "stock": 35,
    "rating": 4.6,
    "reviewCount": 42,
    "imageUrl": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop",
    "description": "Premium luxury watch design smartphone with 32MP Telephoto Portrait camera, Snapdragon 6 Gen 1 5G, 120Hz Curved Vision AMOLED display, and 67W SUPERVOOC charging.",
    "specifications": "{\"processor\": \"Snapdragon 6 Gen 1 5G\", \"ram\": \"8GB LPDDR4X\", \"storage\": \"128GB\", \"display\": \"6.7-inch 120Hz Curved AMOLED FHD+\", \"camera\": \"50MP Sony IMX882 + 32MP Telephoto + 8MP Ultrawide\", \"battery\": \"5000 mAh 67W Fast Charge\"}",
    "createdAt": "2026-10-27T16:22:59.757404Z",
    "updatedAt": "2026-10-27T16:22:59.757404Z",
    "stockQuantity": 35
  },
  {
    "id": 216,
    "name": "iQOO Z9 5G SuperSpeed",
    "brand": "iQOO",
    "category": "Smartphones",
    "price": 19999,
    "stock": 30,
    "rating": 4.7,
    "reviewCount": 55,
    "imageUrl": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop",
    "description": "Fastest phone in the segment powered by MediaTek Dimensity 7200 4nm processor with Sony IMX882 OIS camera, 120Hz AMOLED 1800 nits display, and dual stereo speakers.",
    "specifications": "{\"processor\": \"MediaTek Dimensity 7200 4nm\", \"ram\": \"8GB\", \"storage\": \"128GB UFS 2.2\", \"display\": \"6.67-inch 120Hz AMOLED 1800 nits\", \"camera\": \"50MP Sony IMX882 OIS + 2MP Bokeh\", \"battery\": \"5000 mAh 44W FlashCharge\"}",
    "createdAt": "2026-10-27T16:22:59.757404Z",
    "updatedAt": "2026-10-27T16:22:59.757404Z",
    "stockQuantity": 30
  },
  {
    "id": 217,
    "name": "POCO X6 5G Performance",
    "brand": "POCO",
    "category": "Smartphones",
    "price": 18999,
    "stock": 40,
    "rating": 4.5,
    "reviewCount": 48,
    "imageUrl": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop",
    "description": "Flagship-tier 1.5K 120Hz Flow AMOLED display with Snapdragon 7s Gen 2, 64MP OIS triple camera, 5100mAh battery, and 67W sonic turbo charging.",
    "specifications": "{\"processor\": \"Snapdragon 7s Gen 2 4nm\", \"ram\": \"8GB LPDDR4X\", \"storage\": \"256GB UFS 2.2\", \"display\": \"6.67-inch 1.5K CrystalRes 120Hz AMOLED\", \"camera\": \"64MP OIS + 8MP Ultra + 2MP Macro\", \"battery\": \"5100 mAh 67W Turbo Charge\"}",
    "createdAt": "2026-10-27T16:22:59.757404Z",
    "updatedAt": "2026-10-27T16:22:59.757404Z",
    "stockQuantity": 40
  },
  {
    "id": 218,
    "name": "Samsung Galaxy M34 5G Monster",
    "brand": "Samsung",
    "category": "Smartphones",
    "price": 16999,
    "stock": 35,
    "rating": 4.4,
    "reviewCount": 62,
    "imageUrl": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop",
    "description": "Monster 6000mAh battery smartphone featuring 120Hz Super AMOLED display, 50MP No Shake OIS camera, Exynos 1280 processor, and 4 years of OS upgrades.",
    "specifications": "{\"processor\": \"Exynos 1280 5nm\", \"ram\": \"8GB\", \"storage\": \"128GB Expandable to 1TB\", \"display\": \"6.5-inch 120Hz Super AMOLED Gorilla Glass 5\", \"camera\": \"50MP OIS No Shake + 8MP + 2MP\", \"battery\": \"6000 mAh 25W Fast Charge\"}",
    "createdAt": "2026-10-27T16:22:59.757404Z",
    "updatedAt": "2026-10-27T16:22:59.757404Z",
    "stockQuantity": 35
  },
  {
    "id": 219,
    "name": "Moto G84 5G Vegan Leather",
    "brand": "Motorola",
    "category": "Smartphones",
    "price": 17999,
    "stock": 28,
    "rating": 4.6,
    "reviewCount": 39,
    "imageUrl": "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop",
    "description": "Ultralight and stylish phone with Viva Magenta vegan leather finish, 12GB RAM standard, 10-bit 120Hz pOLED display, 50MP OIS camera, and Dolby Atmos audio.",
    "specifications": "{\"processor\": \"Snapdragon 695 5G\", \"ram\": \"12GB\", \"storage\": \"256GB\", \"display\": \"6.55-inch 120Hz 10-bit pOLED\", \"camera\": \"50MP OIS + 8MP Ultrawide Macro\", \"battery\": \"5000 mAh 33W TurboPower\"}",
    "createdAt": "2026-10-27T16:22:59.757404Z",
    "updatedAt": "2026-10-27T16:22:59.757404Z",
    "stockQuantity": 28
  },
  {
    "id": 220,
    "name": "Realme Narzo 70 Pro 5G",
    "brand": "Realme",
    "category": "Smartphones",
    "price": 18999,
    "stock": 32,
    "rating": 4.5,
    "reviewCount": 45,
    "imageUrl": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop",
    "description": "Segment-first flagship Sony IMX890 OIS camera, innovative Air Gesture controls, MediaTek Dimensity 7050 5G, and 67W flash charging.",
    "specifications": "{\"processor\": \"MediaTek Dimensity 7050 6nm\", \"ram\": \"8GB\", \"storage\": \"128GB\", \"display\": \"6.67-inch 120Hz AMOLED 2000 nits\", \"camera\": \"50MP Sony IMX890 OIS + 8MP + 2MP\", \"battery\": \"5000 mAh 67W Flash Charge\"}",
    "createdAt": "2026-10-27T16:22:59.757404Z",
    "updatedAt": "2026-10-27T16:22:59.757404Z",
    "stockQuantity": 32
  },
  {
    "id": 221,
    "name": "Redmi 13C 5G Fast & Sleek",
    "brand": "Xiaomi",
    "category": "Smartphones",
    "price": 9999,
    "stock": 50,
    "rating": 4.3,
    "reviewCount": 80,
    "imageUrl": "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=600&auto=format&fit=crop",
    "description": "Super affordable 5G smartphone under ₹10,000 powered by MediaTek Dimensity 6100+ 5G, 50MP AI dual camera, smooth 90Hz display, and 5000mAh battery.",
    "specifications": "{\"processor\": \"MediaTek Dimensity 6100+ 6nm 5G\", \"ram\": \"6GB (with Virtual RAM)\", \"storage\": \"128GB UFS 2.2\", \"display\": \"6.74-inch 90Hz HD+ Gorilla Glass\", \"camera\": \"50MP AI Dual Camera\", \"battery\": \"5000 mAh 18W Fast Charge\"}",
    "createdAt": "2026-10-27T16:22:59.757404Z",
    "updatedAt": "2026-10-27T16:22:59.757404Z",
    "stockQuantity": 50
  },
  {
    "id": 222,
    "name": "POCO M6 5G Budget King",
    "brand": "POCO",
    "category": "Smartphones",
    "price": 8999,
    "stock": 60,
    "rating": 4.3,
    "reviewCount": 75,
    "imageUrl": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop",
    "description": "The most accessible 5G phone under ₹10k with Dimensity 6100+ processor, dynamic 90Hz display, premium glass-like dual tone back, and 50MP camera.",
    "specifications": "{\"processor\": \"MediaTek Dimensity 6100+ 5G\", \"ram\": \"6GB\", \"storage\": \"128GB\", \"display\": \"6.74-inch 90Hz Display\", \"camera\": \"50MP AI Dual Rear Camera\", \"battery\": \"5000 mAh 18W Charging\"}",
    "createdAt": "2026-10-27T16:22:59.757404Z",
    "updatedAt": "2026-10-27T16:22:59.757404Z",
    "stockQuantity": 60
  },
  {
    "id": 223,
    "name": "Samsung Galaxy A05s",
    "brand": "Samsung",
    "category": "Smartphones",
    "price": 9499,
    "stock": 45,
    "rating": 4.2,
    "reviewCount": 52,
    "imageUrl": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop",
    "description": "Reliable Samsung smartphone with Qualcomm Snapdragon 680, sharp 6.7-inch FHD+ 90Hz display, 50MP triple rear cameras, and 5000mAh battery.",
    "specifications": "{\"processor\": \"Snapdragon 680 6nm\", \"ram\": \"6GB\", \"storage\": \"128GB Expandable to 1TB\", \"display\": \"6.7-inch FHD+ 90Hz PLS LCD\", \"camera\": \"50MP Main + 2MP Macro + 2MP Depth\", \"battery\": \"5000 mAh 25W Fast Charge\"}",
    "createdAt": "2026-10-27T16:22:59.757404Z",
    "updatedAt": "2026-10-27T16:22:59.757404Z",
    "stockQuantity": 45
  },
  {
    "id": 224,
    "name": "Moto G24 Power 6000mAh",
    "brand": "Motorola",
    "category": "Smartphones",
    "price": 7999,
    "stock": 55,
    "rating": 4.4,
    "reviewCount": 68,
    "imageUrl": "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop",
    "description": "Unbeatable budget battery champion with massive 6000mAh pack, 33W TurboPower charger in box, clean stock Android 14, and 50MP Quad Pixel camera.",
    "specifications": "{\"processor\": \"MediaTek Helio G85\", \"ram\": \"8GB (4GB + 4GB Boost)\", \"storage\": \"128GB\", \"display\": \"6.56-inch 90Hz HD+ IPS\", \"camera\": \"50MP Quad Pixel + 2MP Macro\", \"battery\": \"6000 mAh 33W TurboPower\"}",
    "createdAt": "2026-10-27T16:22:59.757404Z",
    "updatedAt": "2026-10-27T16:22:59.757404Z",
    "stockQuantity": 55
  },
  {
    "id": 316,
    "name": "boAt Airdopes 141 ANC Wireless Earbuds",
    "brand": "boAt",
    "category": "Audio & Headphones",
    "price": 1499,
    "stock": 80,
    "rating": 4.3,
    "reviewCount": 110,
    "imageUrl": "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&auto=format&fit=crop",
    "description": "India's bestselling budget earbuds under ₹2k with up to 32dB Active Noise Cancellation, 42 hours playback, ENx quad mics, and BEAST 50ms low latency gaming mode.",
    "specifications": "{\"anc\": \"Up to 32dB Active Noise Cancellation\", \"battery\": \"42 hours total (ASAP Charge 10m=120m)\", \"latency\": \"50ms Low Latency BEAST Mode\", \"protection\": \"IPX5 Sweat & Water Resistant\"}",
    "createdAt": "2026-10-27T16:22:59.757404Z",
    "updatedAt": "2026-10-27T16:22:59.757404Z",
    "stockQuantity": 80
  },
  {
    "id": 318,
    "name": "JBL Flip 6 Portable Bluetooth Speaker",
    "brand": "JBL",
    "category": "Audio & Headphones",
    "price": 9999,
    "stock": 25,
    "rating": 4.8,
    "reviewCount": 72,
    "imageUrl": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop",
    "description": "Big, bold, crystal-clear JBL Pro Sound with 2-way speaker system, racetrack-shaped woofer, separate tweeter, IP67 waterproof/dustproof rating, and 12-hour battery.",
    "specifications": "{\"output\": \"30W RMS (20W Woofer + 10W Tweeter)\", \"protection\": \"IP67 Waterproof and Dustproof\", \"battery\": \"12 hours playtime\", \"features\": \"PartyBoost Multi-speaker pairing\"}",
    "createdAt": "2026-10-27T16:22:59.757404Z",
    "updatedAt": "2026-10-27T16:22:59.757404Z",
    "stockQuantity": 25
  },
  {
    "id": 320,
    "name": "Sony SRS-XB100 Compact Bluetooth Speaker",
    "brand": "Sony",
    "category": "Audio & Headphones",
    "price": 4490,
    "stock": 30,
    "rating": 4.7,
    "reviewCount": 53,
    "imageUrl": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop",
    "description": "Ultra-compact wireless speaker delivering powerful, clear Extra Bass with Sound Diffusion Processor, 16 hours battery, and IP67 waterproof/dustproof body.",
    "specifications": "{\"features\": \"Sound Diffusion Processor + Extra Bass\", \"battery\": \"16 hours battery life\", \"protection\": \"IP67 Water & Dustproof with UV coating\", \"strap\": \"Versatile 2-way strap included\"}",
    "createdAt": "2026-10-27T16:22:59.757404Z",
    "updatedAt": "2026-10-27T16:22:59.757404Z",
    "stockQuantity": 30
  },
  {
    "id": 321,
    "name": "Tribit StormBox Micro 2 Rugged Speaker",
    "brand": "Tribit",
    "category": "Audio & Headphones",
    "price": 3999,
    "stock": 25,
    "rating": 4.6,
    "reviewCount": 37,
    "imageUrl": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop",
    "description": "Pocket-sized outdoor Bluetooth 5.3 speaker with 90dB loud sound, XBass technology, integrated power bank port to charge phones, and tear-resistant bike strap.",
    "specifications": "{\"output\": \"10W Full-range Driver with XBass\", \"battery\": \"12 hours playtime + Phone Charging Output\", \"protection\": \"IP67 Waterproof & Sandproof\", \"range\": \"120ft Bluetooth 5.3 range\"}",
    "createdAt": "2026-10-27T16:22:59.757404Z",
    "updatedAt": "2026-10-27T16:22:59.757404Z",
    "stockQuantity": 25
  },
  {
    "id": 513,
    "name": "Fire-Boltt Invincible Plus AMOLED",
    "brand": "Fire-Boltt",
    "category": "Smartwatches",
    "price": 3999,
    "stock": 50,
    "rating": 4.4,
    "reviewCount": 65,
    "imageUrl": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop",
    "description": "1.43-inch AMOLED Always-On display smartwatch with 4GB onboard storage to save 1000+ songs, Bluetooth calling, and direct TWS earbud pairing without a phone.",
    "specifications": "{\"display\": \"1.43-inch AMOLED 700 nits Always-On\", \"storage\": \"4GB Local Storage for MP3 Music\", \"features\": \"TWS Direct Pairing, BT Calling, 300 Sports\", \"battery\": \"5 days typical, 15 days standby\"}",
    "createdAt": "2026-10-27T16:22:59.757404Z",
    "updatedAt": "2026-10-27T16:22:59.757404Z",
    "stockQuantity": 50
  },
  {
    "id": 515,
    "name": "boAt Lunar Mirage Round AMOLED",
    "brand": "boAt",
    "category": "Smartwatches",
    "price": 1999,
    "stock": 75,
    "rating": 4.3,
    "reviewCount": 84,
    "imageUrl": "https://images.unsplash.com/photo-1510017803434-a899398421b3?w=600&auto=format&fit=crop",
    "description": "Affordable circular 1.52-inch HD screen smartwatch with crystal-clear Bluetooth calling, metallic round dial, crown navigation, and IP68 water resistance under ₹2,000.",
    "specifications": "{\"display\": \"1.52-inch Round HD Color Display\", \"calling\": \"Bluetooth Calling with Save Contacts\", \"health\": \"Heart Rate, SpO2, Sleep, Menstrual Cycle\", \"protection\": \"IP68 Dust and Splash Resistant\"}",
    "createdAt": "2026-10-27T16:22:59.757404Z",
    "updatedAt": "2026-10-27T16:22:59.757404Z",
    "stockQuantity": 75
  },
  {
    "id": 517,
    "name": "Amazfit Bip 5 Unity Smartwatch",
    "brand": "Amazfit",
    "category": "Smartwatches",
    "price": 5499,
    "stock": 30,
    "rating": 4.5,
    "reviewCount": 36,
    "imageUrl": "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&auto=format&fit=crop",
    "description": "Slim stainless steel frame smartwatch powered by Zepp OS 3.0, 1.91-inch ultra-large display, Bluetooth calling with microphone/speaker, and 11-day battery life.",
    "specifications": "{\"display\": \"1.91-inch High-resolution Touchscreen\", \"os\": \"Zepp OS 3.0 with mini-app ecosystem\", \"battery\": \"11 days typical use, 26 days battery saver\", \"sports\": \"120+ Sports Modes with Auto-detection\"}",
    "createdAt": "2026-10-27T16:22:59.757404Z",
    "updatedAt": "2026-10-27T16:22:59.757404Z",
    "stockQuantity": 30
  },
  {
    "id": 519,
    "name": "Fastrack Limitless FS1 Pro Curved AMOLED",
    "brand": "Fastrack",
    "category": "Smartwatches",
    "price": 2495,
    "stock": 60,
    "rating": 4.3,
    "reviewCount": 67,
    "imageUrl": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop",
    "description": "India's first 1.96-inch Super AMOLED curved display smartwatch under ₹2,500 with SingleSync BT calling, AI voice assistant, and 110+ sports modes.",
    "specifications": "{\"display\": \"1.96-inch Super AMOLED 410x502 Curved\", \"calling\": \"SingleSync Bluetooth Calling\", \"sports\": \"110+ Sports Modes & Activity Tracker\", \"battery\": \"Up to 7 days battery backup\"}",
    "createdAt": "2026-10-27T16:22:59.757404Z",
    "updatedAt": "2026-10-27T16:22:59.757404Z",
    "stockQuantity": 60
  },
  {
    "id": 520,
    "name": "Redmi Watch 3 Active Bluetooth Calling",
    "brand": "Xiaomi",
    "category": "Smartwatches",
    "price": 2999,
    "stock": 55,
    "rating": 4.4,
    "reviewCount": 70,
    "imageUrl": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop",
    "description": "1.83-inch large iridescent display, metallic finish casing, Bluetooth phone calls with noise-canceling mic, 5ATM water resistance, and 12-day battery life.",
    "specifications": "{\"display\": \"1.83-inch Ultra-large LCD 450 nits\", \"water_resistance\": \"5ATM Water Resistant up to 50m\", \"calling\": \"Bluetooth Phone Calls with Mic/Speaker\", \"battery\": \"12 days typical use\"}",
    "createdAt": "2026-10-27T16:25:33.537625Z",
    "updatedAt": "2026-10-27T16:25:33.537625Z",
    "stockQuantity": 55
  },
  {
    "id": 609,
    "name": "Realme Pad 2 11.5-inch 120Hz 2K",
    "brand": "Realme",
    "category": "Tablets",
    "price": 17999,
    "stock": 25,
    "rating": 4.6,
    "reviewCount": 44,
    "imageUrl": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop",
    "description": "Class-leading entertainment tablet under ₹20k with 11.5-inch 120Hz 2K Super Display, MediaTek Helio G99, Quad speakers with Dolby Atmos, and 8360mAh battery with 33W fast charging.",
    "specifications": "{\"processor\": \"MediaTek Helio G99 6nm\", \"ram\": \"8GB LPDDR4X\", \"storage\": \"256GB Expandable up to 2TB\", \"display\": \"11.5-inch 2K 120Hz Eye Comfort 450 nits\", \"audio\": \"Quad Speakers with Dolby Atmos\", \"battery\": \"8360 mAh 33W SUPERVOOC\"}",
    "createdAt": "2026-10-27T16:22:59.757404Z",
    "updatedAt": "2026-10-27T16:22:59.757404Z",
    "stockQuantity": 25
  },
  {
    "id": 610,
    "name": "Redmi Pad SE 11-inch FHD+ Tablet",
    "brand": "Xiaomi",
    "category": "Tablets",
    "price": 12999,
    "stock": 35,
    "rating": 4.5,
    "reviewCount": 58,
    "imageUrl": "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&auto=format&fit=crop",
    "description": "Perfect student tablet under ₹15k with Snapdragon 680 6nm processor, 11-inch 90Hz FHD+ eye-care display with TÜV Rheinland certification, and metal unibody design.",
    "specifications": "{\"processor\": \"Snapdragon 680 6nm Octa-Core\", \"ram\": \"8GB\", \"storage\": \"128GB Expandable to 1TB\", \"display\": \"11.0-inch FHD+ 90Hz AdaptiveSync\", \"audio\": \"Quad Stereo Speakers Dolby Atmos\", \"battery\": \"8000 mAh Long-lasting\"}",
    "createdAt": "2026-10-27T16:22:59.757404Z",
    "updatedAt": "2026-10-27T16:22:59.757404Z",
    "stockQuantity": 35
  },
  {
    "id": 611,
    "name": "Lenovo Tab M11 with Pen Included",
    "brand": "Lenovo",
    "category": "Tablets",
    "price": 14990,
    "stock": 30,
    "rating": 4.4,
    "reviewCount": 39,
    "imageUrl": "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=600&auto=format&fit=crop",
    "description": "Productivity learning tablet featuring 11-inch 90Hz WUXGA screen, bundled Lenovo Tab Pen for drawing and note-taking, split-screen multi-tasking, and quad speakers.",
    "specifications": "{\"processor\": \"MediaTek Helio G88\", \"ram\": \"8GB\", \"storage\": \"128GB\", \"display\": \"11.0-inch WUXGA 1920x1200 90Hz IPS\", \"pen\": \"Lenovo Tab Pen Included in Box\", \"battery\": \"7040 mAh Fast Charging\"}",
    "createdAt": "2026-10-27T16:22:59.757404Z",
    "updatedAt": "2026-10-27T16:22:59.757404Z",
    "stockQuantity": 30
  },
  {
    "id": 612,
    "name": "Samsung Galaxy Tab A9 Compact",
    "brand": "Samsung",
    "category": "Tablets",
    "price": 10999,
    "stock": 38,
    "rating": 4.3,
    "reviewCount": 48,
    "imageUrl": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop",
    "description": "Compact and portable 8.7-inch tablet with dual speakers powered by Dolby Atmos, slim metal body, MediaTek Helio G99 processor, and seamless Samsung ecosystem connectivity.",
    "specifications": "{\"processor\": \"MediaTek Helio G99\", \"ram\": \"4GB\", \"storage\": \"64GB Expandable up to 1TB\", \"display\": \"8.7-inch WXGA+ Compact Screen\", \"audio\": \"Dual Speakers Dolby Atmos\", \"battery\": \"5100 mAh Battery\"}",
    "createdAt": "2026-10-27T16:22:59.757404Z",
    "updatedAt": "2026-10-27T16:22:59.757404Z",
    "stockQuantity": 38
  },
  {
    "id": 415,
    "name": "Redragon K552 Kumara RGB Mechanical Keyboard",
    "brand": "Redragon",
    "category": "Accessories",
    "price": 2499,
    "stock": 45,
    "rating": 4.7,
    "reviewCount": 78,
    "imageUrl": "https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&auto=format&fit=crop",
    "description": "Tenkeyless 87-key compact mechanical gaming keyboard with dustproof tactile clicky blue switches, rainbow RGB backlighting with 18 lighting modes, and solid metal-ABS construction.",
    "specifications": "{\"layout\": \"Compact Tenkeyless 87 Keys\", \"switches\": \"Custom Mechanical Blue Clicky Equivalent\", \"backlight\": \"18 RGB Backlight Modes + 5 Brightness Levels\", \"features\": \"Full Anti-Ghosting N-Key Rollover\"}",
    "createdAt": "2026-10-27T16:22:59.757404Z",
    "updatedAt": "2026-10-27T16:22:59.757404Z",
    "stockQuantity": 45
  },
  {
    "id": 416,
    "name": "Razer DeathAdder Essential Ergonomic Gaming Mouse",
    "brand": "Razer",
    "category": "Accessories",
    "price": 1299,
    "stock": 65,
    "rating": 4.6,
    "reviewCount": 88,
    "imageUrl": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop",
    "description": "Legendary ergonomic esports gaming mouse featuring high-precision 6400 DPI optical sensor, 5 independently programmable Hyperesponse buttons, and durable mechanical switches rated for 10 million clicks.",
    "specifications": "{\"sensor\": \"6400 True DPI Optical Sensor\", \"buttons\": \"5 Hyperesponse Programmable Buttons\", \"durability\": \"10 Million Click Mechanical Switches\", \"form_factor\": \"Classic Ergonomic Right-Handed\"}",
    "createdAt": "2026-10-27T16:22:59.757404Z",
    "updatedAt": "2026-10-27T16:22:59.757404Z",
    "stockQuantity": 65
  },
  {
    "id": 417,
    "name": "Mi Smart Wi-Fi 360 Home Security Camera 2K",
    "brand": "Xiaomi",
    "category": "Accessories",
    "price": 2799,
    "stock": 50,
    "rating": 4.5,
    "reviewCount": 63,
    "imageUrl": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop",
    "description": "3-megapixel 2K ultra-clear smart security camera with 360-degree panoramic view, enhanced infrared night vision, AI human motion detection alerts, and two-way voice calling.",
    "specifications": "{\"resolution\": \"2K Ultra-clear (2304x1296p) 3MP\", \"pan_tilt\": \"360-degree horizontal + 108-degree vertical\", \"night_vision\": \"940nm Invisible Infrared LEDs\", \"connectivity\": \"Wi-Fi 2.4GHz + MicroSD / Cloud Storage\"}",
    "createdAt": "2026-10-27T16:22:59.757404Z",
    "updatedAt": "2026-10-27T16:22:59.757404Z",
    "stockQuantity": 50
  },
  {
    "id": 418,
    "name": "Wipro 16A Smart Wi-Fi Plug with Energy Monitoring",
    "brand": "Wipro",
    "category": "Accessories",
    "price": 999,
    "stock": 90,
    "rating": 4.4,
    "reviewCount": 105,
    "imageUrl": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop",
    "description": "Smart 16A plug suitable for heavy home appliances like air conditioners, geysers, and microwaves. Control devices remotely from anywhere using Wipro Smart App and monitor monthly electricity energy consumption.",
    "specifications": "{\"rating\": \"16 Amp (Suitable for AC, Geyser, Microwave)\", \"control\": \"Voice Control via Alexa & Google Assistant\", \"features\": \"Real-time & Historical Energy Consumption Monitor\", \"connectivity\": \"Direct Wi-Fi 2.4GHz (No Hub Required)\"}",
    "createdAt": "2026-10-27T16:22:59.757404Z",
    "updatedAt": "2026-10-27T16:22:59.757404Z",
    "stockQuantity": 90
  },
  {
    "id": 2507,
    "name": "Sony Alpha 7 IV Full-Frame Mirrorless Camera with 28-70mm Zoom Lens",
    "brand": "Sony",
    "category": "Cameras & Gaming",
    "price": 219990,
    "stock": 9,
    "rating": 4.9,
    "reviewCount": 74,
    "imageUrl": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop",
    "description": "The all-rounder standard for hybrid creators. 33MP full-frame Exmor R back-illuminated sensor, BIONZ XR engine, 4K 60p 10-bit 4:2:2 video, S-Cinetone color science, and real-time Eye AF for humans, animals, and birds.",
    "specifications": "{\"sensor\": \"33.0 MP 35mm Full-Frame Back-Illuminated Exmor R CMOS\", \"processor\": \"BIONZ XR image processing engine\", \"autofocus\": \"759 phase-detection AF points with Real-time Eye AF\", \"video\": \"4K 60p (Super 35), 4K 30p 7K oversampled 10-bit 4:2:2\", \"stabilization\": \"5-axis in-body optical image stabilization (5.5 steps)\"}",
    "createdAt": "2026-10-30T16:17:40.323523Z",
    "updatedAt": "2026-10-30T16:17:40.323523Z",
    "stockQuantity": 9
  },
  {
    "id": 111,
    "name": "Lenovo Legion Pro 5i Gaming",
    "brand": "Lenovo",
    "category": "Laptops",
    "price": 119990,
    "stock": 19,
    "rating": 4.8,
    "reviewCount": 39,
    "imageUrl": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop",
    "description": "Heavy-duty gaming powerhouse with AI-tuned Legion Coldfront 5.0 thermals, NVIDIA RTX 4070 GPU, and blistering 240Hz WQXGA display.",
    "specifications": "{\"processor\": \"Intel Core i7-14650HX 14th Gen\", \"ram\": \"16GB DDR5 5600MHz\", \"storage\": \"1TB NVMe SSD\", \"graphics\": \"NVIDIA GeForce RTX 4070 8GB\", \"display\": \"16-inch WQXGA 240Hz 500 nits\", \"battery\": \"6 hours\"}",
    "createdAt": "2026-10-27T16:12:02.62123Z",
    "updatedAt": "2026-11-03T15:24:10.456142Z",
    "stockQuantity": 19
  },
  {
    "id": 2512,
    "name": "Dell XPS 15 9530 OLED",
    "brand": "Dell",
    "category": "Laptops",
    "price": 184990,
    "stock": 15,
    "rating": 4.8,
    "reviewCount": 42,
    "imageUrl": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop",
    "description": "Flagship creator laptop featuring a stunning 3.5K OLED InfinityEdge touch display, 13th Gen Intel Core i9, and NVIDIA GeForce RTX 4060 graphics inside a precision CNC machined aluminum chassis.",
    "specifications": "{\"processor\":\"Intel Core i9-13900H (14-Core, up to 5.4 GHz)\",\"ram\":\"32GB Dual-Channel DDR5 4800MHz\",\"storage\":\"1TB M.2 PCIe NVMe SSD\",\"display\":\"15.6-inch 3.5K (3456x2160) OLED Touch 400-nit\",\"graphics\":\"NVIDIA GeForce RTX 4060 8GB GDDR6\",\"battery\":\"86Whr 6-Cell with 130W Type-C adapter\"}",
    "createdAt": "2026-11-03T17:43:19.16817Z",
    "updatedAt": "2026-11-03T17:43:19.16817Z",
    "stockQuantity": 15
  },
  {
    "id": 2513,
    "name": "ASUS ROG Zephyrus G16 OLED (2024)",
    "brand": "ASUS",
    "category": "Laptops",
    "price": 219990,
    "stock": 12,
    "rating": 4.9,
    "reviewCount": 38,
    "imageUrl": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop",
    "description": "Ultra-thin, precision-milled aluminum gaming powerhouse featuring an exquisite 2.5K 240Hz OLED ROG Nebula display, Intel Core Ultra 9 processor with dedicated NPU for local AI acceleration, and NVIDIA GeForce RTX 4080 graphics.",
    "specifications": "{\"processor\":\"Intel Core Ultra 9 185H (16-Core, up to 5.1 GHz)\",\"ram\":\"32GB LPDDR5X 7467MHz Dual Channel\",\"storage\":\"2TB PCIe 4.0 NVMe M.2 Performance SSD\",\"display\":\"16-inch 2.5K (2560 x 1600) OLED 240Hz 0.2ms 500-nit\",\"graphics\":\"NVIDIA GeForce RTX 4080 12GB GDDR6\",\"battery\":\"90Whr 4-cell with 240W fast charge and USB-C PD\"}",
    "createdAt": "2026-11-03T17:45:18.477737Z",
    "updatedAt": "2026-11-03T17:45:18.477737Z",
    "stockQuantity": 12
  },
  {
    "id": 2514,
    "name": "Apple MacBook Pro 16 M3 Max",
    "brand": "Apple",
    "category": "Laptops",
    "price": 349900,
    "stock": 10,
    "rating": 4.9,
    "reviewCount": 56,
    "imageUrl": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop",
    "description": "The ultimate pro laptop with the monstrous M3 Max silicon in Space Black finish. Handles extreme workloads like 8K video editing, complex 3D rendering, and LLM fine-tuning effortlessly with up to 22 hours of continuous battery life.",
    "specifications": "{\"processor\":\"Apple M3 Max 16-core CPU with 40-core GPU\",\"ram\":\"48GB Unified High-Bandwidth Memory\",\"storage\":\"1TB Ultra-Fast SSD (7.4 GB/s read speeds)\",\"display\":\"16.2-inch Liquid Retina XDR (3456 x 2234), 120Hz ProMotion, 1600 nits peak\",\"battery\":\"100Whr Li-Po with up to 22 hours Apple TV playback\",\"ports\":\"3x Thunderbolt 4, HDMI 2.1, SDXC slot, MagSafe 3\"}",
    "createdAt": "2026-11-03T17:45:18.493849Z",
    "updatedAt": "2026-11-03T17:45:18.493849Z",
    "stockQuantity": 10
  },
  {
    "id": 2515,
    "name": "HP Spectre x360 2-in-1 14 (2024)",
    "brand": "HP",
    "category": "Laptops",
    "price": 154999,
    "stock": 18,
    "rating": 4.7,
    "reviewCount": 31,
    "imageUrl": "https://images.unsplash.com/photo-1544731612-de7f96afe55f?w=800&auto=format&fit=crop",
    "description": "Iconic 360-degree convertible laptop featuring gem-cut aluminum styling, a vibrant 2.8K OLED touchscreen with stylus support, AI-enhanced 9MP webcam with automatic framing, and quad Poly Studio tuned speakers.",
    "specifications": "{\"processor\":\"Intel Core Ultra 7 155H (16-Core Intel AI Boost)\",\"ram\":\"16GB LPDDR5x 6400MHz\",\"storage\":\"1TB PCIe Gen4 NVMe TLC M.2 SSD\",\"display\":\"14-inch 2.8K (2880 x 1800) OLED 120Hz Touch 500 nits HDR\",\"graphics\":\"Intel Arc Graphics\",\"battery\":\"68Whr with 65W USB Type-C power adapter\"}",
    "createdAt": "2026-11-03T17:45:18.510083Z",
    "updatedAt": "2026-11-03T17:45:18.510083Z",
    "stockQuantity": 18
  },
  {
    "id": 2516,
    "name": "Lenovo Legion Pro 7i Gen 9",
    "brand": "Lenovo",
    "category": "Laptops",
    "price": 249990,
    "stock": 14,
    "rating": 4.8,
    "reviewCount": 29,
    "imageUrl": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop",
    "description": "Competitive esports and AI powerhouse with Legion Coldfront vapor chamber thermal cooling, Lenovo LA-2 AI tuning chip, and full-power NVIDIA RTX 4080 for buttery-smooth 240Hz competitive gameplay.",
    "specifications": "{\"processor\":\"Intel Core i9-14900HX (24-Core, 32-Thread, up to 5.8 GHz)\",\"ram\":\"32GB DDR5 5600MHz (2x 16GB)\",\"storage\":\"1TB M.2 2280 PCIe Gen4 TLC SSD\",\"display\":\"16-inch WQXGA (2560 x 1600) IPS 240Hz 500 nits 100% sRGB\",\"graphics\":\"NVIDIA GeForce RTX 4080 12GB GDDR6 (175W TGP)\",\"keyboard\":\"Legion TrueStrike per-key RGB backlit with 100% anti-ghosting\"}",
    "createdAt": "2026-11-03T17:45:18.521737Z",
    "updatedAt": "2026-11-03T17:45:18.521737Z",
    "stockQuantity": 14
  },
  {
    "id": 2517,
    "name": "Acer Swift Go 14 AI OLED",
    "brand": "Acer",
    "category": "Laptops",
    "price": 79990,
    "stock": 25,
    "rating": 4.6,
    "reviewCount": 44,
    "imageUrl": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop",
    "description": "Lightweight ultraportable daily workhorse built with sleek anodized aluminum, Intel Core Ultra 5 AI processor, stunning 2.8K 90Hz OLED display with certified 100% DCI-P3 color gamut, and all-day 14-hour battery.",
    "specifications": "{\"processor\":\"Intel Core Ultra 5 125H (14-Core, up to 4.5 GHz with Intel AI Boost)\",\"ram\":\"16GB LPDDR5X onboard\",\"storage\":\"512GB PCIe Gen4 NVMe SSD\",\"display\":\"14-inch 2.8K (2880 x 1800) OLED 90Hz 400 nits Calman Verified\",\"weight\":\"1.32 kg featherlight chassis\",\"ports\":\"2x USB Type-C Thunderbolt 4, 2x USB 3.2 Gen 1, HDMI 2.1\"}",
    "createdAt": "2026-11-03T17:45:18.53296Z",
    "updatedAt": "2026-11-03T17:45:18.53296Z",
    "stockQuantity": 25
  },
  {
    "id": 2518,
    "name": "Samsung Galaxy S24 Ultra 5G",
    "brand": "Samsung",
    "category": "Smartphones",
    "price": 129999,
    "stock": 22,
    "rating": 4.9,
    "reviewCount": 88,
    "imageUrl": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop",
    "description": "The pinnacle of smartphone innovation engineered in a durable Titanium frame with Corning Gorilla Armor glass. Features built-in S Pen, Circle to Search with Google, Live Translate AI, and a revolutionary 200MP Quad Telephoto optical camera system.",
    "specifications": "{\"processor\":\"Snapdragon 8 Gen 3 for Galaxy (4nm)\",\"ram\":\"12GB LPDDR5X\",\"storage\":\"512GB UFS 4.0\",\"display\":\"6.8-inch Dynamic AMOLED 2X Quad HD+ 1-120Hz 2600 nits\",\"camera\":\"200MP Wide + 50MP 5x Telephoto + 10MP 3x Telephoto + 12MP Ultra-wide\",\"battery\":\"5000mAh with 45W wired and 15W wireless charging\"}",
    "createdAt": "2026-11-03T17:45:18.543673Z",
    "updatedAt": "2026-11-03T17:45:18.543673Z",
    "stockQuantity": 22
  },
  {
    "id": 2519,
    "name": "Apple iPhone 16 Pro Max",
    "brand": "Apple",
    "category": "Smartphones",
    "price": 144900,
    "stock": 20,
    "rating": 4.9,
    "reviewCount": 95,
    "imageUrl": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop",
    "description": "Forged in Grade 5 Titanium with larger 6.9-inch Super Retina XDR display and thinner borders. Powered by the breakthrough A18 Pro chip with Apple Intelligence, dedicated Camera Control tactile touch key, and 4K 120 fps Dolby Vision recording.",
    "specifications": "{\"processor\":\"Apple A18 Pro 6-core CPU with 6-core GPU and 16-core Neural Engine\",\"ram\":\"8GB Unified\",\"storage\":\"256GB NVMe\",\"display\":\"6.9-inch Super Retina XDR OLED 120Hz ProMotion 2000 nits peak\",\"camera\":\"48MP Fusion + 48MP Ultra Wide + 12MP 5x Telephoto with tetraprism\",\"battery\":\"Up to 33 hours video playback with MagSafe wireless fast charging\"}",
    "createdAt": "2026-11-03T17:45:18.554663Z",
    "updatedAt": "2026-11-03T17:45:18.554663Z",
    "stockQuantity": 20
  },
  {
    "id": 2520,
    "name": "Google Pixel 9 Pro XL",
    "brand": "Google",
    "category": "Smartphones",
    "price": 124999,
    "stock": 16,
    "rating": 4.8,
    "reviewCount": 52,
    "imageUrl": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop",
    "description": "Google flagship smartphone custom-engineered for Gemini AI. Features modern sculpted satin glass back, dual-tone polished metal camera bar, Pixel Studio creative image generator, and class-leading Night Sight portrait photography.",
    "specifications": "{\"processor\":\"Google Tensor G4 with Titan M2 security coprocessor\",\"ram\":\"16GB LPDDR5X (engineered for on-device Gemini Nano)\",\"storage\":\"256GB UFS 3.1\",\"display\":\"6.8-inch Super Actua LTPO OLED 1-120Hz 3000 nits peak brightness\",\"camera\":\"50MP Octa PD Wide + 48MP Quad PD Ultra-wide + 48MP 5x Telephoto\",\"os\":\"Android 14 with 7 years of guaranteed OS, security, and Pixel Feature Drops\"}",
    "createdAt": "2026-11-03T17:45:18.56771Z",
    "updatedAt": "2026-11-03T17:45:18.56771Z",
    "stockQuantity": 16
  },
  {
    "id": 2521,
    "name": "OnePlus 12 5G",
    "brand": "OnePlus",
    "category": "Smartphones",
    "price": 64999,
    "stock": 30,
    "rating": 4.8,
    "reviewCount": 76,
    "imageUrl": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop",
    "description": "The definitive performance flagship boasting Snapdragon 8 Gen 3, Dual Cryo-velocity VC thermal system, 4th Gen Hasselblad Camera with 64MP periscope zoom, and blistering 100W SUPERVOOC charging that fills the battery in 26 minutes.",
    "specifications": "{\"processor\":\"Snapdragon 8 Gen 3 Mobile Platform\",\"ram\":\"16GB LPDDR5X\",\"storage\":\"512GB UFS 4.0\",\"display\":\"6.82-inch 2K ProXDR Display with LTPO 120Hz 4500 nits peak\",\"camera\":\"50MP Sony LYT-808 + 64MP Omnivision Periscope + 48MP Ultra-wide\",\"battery\":\"5400mAh dual-cell with 100W wired and 50W AIRVOOC wireless\"}",
    "createdAt": "2026-11-03T17:45:18.579241Z",
    "updatedAt": "2026-11-03T17:45:18.579241Z",
    "stockQuantity": 30
  },
  {
    "id": 2522,
    "name": "Xiaomi 14 Ultra 5G",
    "brand": "Xiaomi",
    "category": "Smartphones",
    "price": 99999,
    "stock": 14,
    "rating": 4.7,
    "reviewCount": 35,
    "imageUrl": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop",
    "description": "Pro-grade optical imaging masterwork created in partnership with Leica. Features a massive 1-inch Sony LYT-900 main sensor with stepless variable aperture (f/1.63 - f/4.0), quad 50MP Leica summilux lens array, and nano-tech vegan leather back.",
    "specifications": "{\"processor\":\"Snapdragon 8 Gen 3 (4nm TSMC)\",\"ram\":\"16GB LPDDR5X\",\"storage\":\"512GB UFS 4.0\",\"display\":\"6.73-inch WQHD+ AMOLED 120Hz 3000 nits peak Dolby Vision\",\"camera\":\"Quad 50MP Leica: 1-inch LYT-900 + 75mm Floating Telephoto + 120mm Periscope + 12mm Ultra-wide\",\"charging\":\"90W wired HyperCharge + 80W wireless HyperCharge\"}",
    "createdAt": "2026-11-03T17:45:18.588729Z",
    "updatedAt": "2026-11-03T17:45:18.588729Z",
    "stockQuantity": 14
  },
  {
    "id": 2523,
    "name": "Vivo X100 Pro 5G",
    "brand": "Vivo",
    "category": "Smartphones",
    "price": 89999,
    "stock": 18,
    "rating": 4.8,
    "reviewCount": 42,
    "imageUrl": "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop",
    "description": "Photography titan co-engineered with ZEISS featuring the worlds first smartphone camera certified with ZEISS APO telephoto lens standards. Powered by MediaTek Dimensity 9300 all-big-core architecture and Vivos proprietary V3 imaging chip.",
    "specifications": "{\"processor\":\"MediaTek Dimensity 9300 (4nm) with Vivo V3 Imaging NPU\",\"ram\":\"16GB LPDDR5X\",\"storage\":\"512GB UFS 4.0\",\"display\":\"6.78-inch 1.5K LTPO AMOLED 120Hz 3000 nits peak 2160Hz PWM dimming\",\"camera\":\"50MP 1-inch Sony IMX989 + 50MP ZEISS APO Telephoto (4.3x optical) + 50MP Ultra-wide\",\"battery\":\"5400mAh BlueVolt battery with 100W FlashCharge\"}",
    "createdAt": "2026-11-03T17:45:18.60131Z",
    "updatedAt": "2026-11-03T17:45:18.60131Z",
    "stockQuantity": 18
  },
  {
    "id": 2524,
    "name": "Anker Prime 100W GaN Fast Wall Charger",
    "brand": "Anker",
    "category": "Power Banks & Portable Power",
    "price": 6499,
    "stock": 45,
    "rating": 4.9,
    "reviewCount": 112,
    "imageUrl": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop",
    "description": "Ultra-compact multi-device GaNPrime fast charger with 2x USB-C and 1x USB-A ports. Powered by PowerIQ 4.0 and ActiveShield 2.0 temperature monitoring, providing up to 100W max output to fast charge a MacBook Pro, iPad, and iPhone simultaneously.",
    "specifications": "{\"totalOutput\":\"100W Max\",\"ports\":\"2x USB-C + 1x USB-A\",\"technology\":\"GaNPrime with PowerIQ 4.0 dynamic power distribution\",\"safety\":\"ActiveShield 2.0 real-time temperature monitoring 3,000,000 times/day\",\"compatibility\":\"MacBook Pro/Air, Dell XPS, iPhone 16/15, Galaxy S24, iPad Pro, Steam Deck\"}",
    "createdAt": "2026-11-03T17:45:18.610408Z",
    "updatedAt": "2026-11-03T17:45:18.610408Z",
    "stockQuantity": 45
  },
  {
    "id": 2527,
    "name": "Apple 70W USB-C Power Adapter",
    "brand": "Apple",
    "category": "Power Banks & Portable Power",
    "price": 5800,
    "stock": 35,
    "rating": 4.7,
    "reviewCount": 78,
    "imageUrl": "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800&auto=format&fit=crop",
    "description": "Genuine Apple fast charging power adapter designed for 13-inch, 14-inch, and 15-inch MacBook Air with M2/M3 chips and MacBook Pro. Delivers 50% battery charge in just 30 minutes with dynamic USB-PD compliance.",
    "specifications": "{\"power\":\"70W USB-PD compliant power delivery\",\"port\":\"Single USB-C output\",\"compatibility\":\"MacBook Air (M2/M3), MacBook Pro 14, iPhone 16/15, iPad Pro, Apple Watch Ultra fast charge\",\"design\":\"Compact white polycarbonate casing with modular interchangeable plug prongs\"}",
    "createdAt": "2026-11-03T17:45:18.6442Z",
    "updatedAt": "2026-11-03T17:45:18.6442Z",
    "stockQuantity": 35
  },
  {
    "id": 2528,
    "name": "Samsung 45W Power Adapter with 5A Type-C Cable",
    "brand": "Samsung",
    "category": "Power Banks & Portable Power",
    "price": 2999,
    "stock": 50,
    "rating": 4.8,
    "reviewCount": 145,
    "imageUrl": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop",
    "description": "Official Samsung Super Fast Charging 2.0 power brick with included 1.8-meter 5A braided E-marked USB-C to USB-C cable. Maxes out charging speeds on Galaxy S24 Ultra, Galaxy Tab S9, and Galaxy Book laptops.",
    "specifications": "{\"power\":\"45W Super Fast Charging 2.0 (PPS 3.3V-20V)\",\"cable\":\"Includes genuine 5A high-current 1.8m braided USB-C cable\",\"standbyPower\":\"Ultra-low standby power consumption under 5mW\",\"compatibility\":\"Galaxy S24/S23 Ultra, Galaxy Tab S9, Galaxy Z Fold, Galaxy Book\"}",
    "createdAt": "2026-11-03T17:45:18.655248Z",
    "updatedAt": "2026-11-03T17:45:18.655248Z",
    "stockQuantity": 50
  },
  {
    "id": 2530,
    "name": "LG OLED evo C4 65-Inch 4K Smart TV",
    "brand": "LG",
    "category": "Smart TVs & Home Entertainment",
    "price": 189990,
    "stock": 8,
    "rating": 4.9,
    "reviewCount": 47,
    "imageUrl": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop",
    "description": "Self-lit OLED pixels deliver perfect infinite contrast and 100% color fidelity. Powered by the α9 Gen7 AI Processor 4K with Brightness Booster, 144Hz native refresh rate with 0.1ms response time, 4x HDMI 2.1 ports with NVIDIA G-Sync and AMD FreeSync Premium.",
    "specifications": "{\"screenSize\":\"65-inch (164 cm) 4K OLED evo (3840 x 2160)\",\"refreshRate\":\"144Hz Native Variable Refresh Rate with 0.1ms response time\",\"processor\":\"α9 AI Processor 4K Gen7 with AI Picture Pro & AI Sound Pro 9.1.2\",\"hdr\":\"Dolby Vision, HDR10, HLG, Filmmaker Mode\",\"gaming\":\"4x HDMI 2.1 (48Gbps), G-Sync, FreeSync Premium, VRR, ALLM, HGIG\",\"smartOS\":\"webOS 24 with 5 years of guaranteed Re:New updates & Magic Remote\"}",
    "createdAt": "2026-11-03T17:45:18.674374Z",
    "updatedAt": "2026-11-03T17:45:18.674374Z",
    "stockQuantity": 8
  },
  {
    "id": 2531,
    "name": "Sony BRAVIA XR 65-Inch A80L OLED 4K Google TV",
    "brand": "Sony",
    "category": "Smart TVs & Home Entertainment",
    "price": 214990,
    "stock": 6,
    "rating": 4.9,
    "reviewCount": 53,
    "imageUrl": "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&auto=format&fit=crop",
    "description": "Cinematic OLED masterpiece powered by Sonys Cognitive Processor XR, which replicates how humans see and hear for unprecedented depth and lifelike texture. Features Acoustic Surface Audio+ where sound resonates directly from the screen.",
    "specifications": "{\"screenSize\":\"65-inch (164 cm) 4K OLED (3840 x 2160)\",\"processor\":\"Cognitive Processor XR with XR Triluminos Pro and XR Clear Image\",\"audio\":\"Acoustic Surface Audio+ with 3 actuators, 2 subwoofers (50W total) & Dolby Atmos\",\"gaming\":\"Perfect for PlayStation 5 (Auto HDR Tone Mapping & Auto Genre Picture Mode)\",\"os\":\"Google TV with hands-free Google Assistant and Apple AirPlay 2\"}",
    "createdAt": "2026-11-03T17:45:18.683892Z",
    "updatedAt": "2026-11-03T17:45:18.683892Z",
    "stockQuantity": 6
  },
  {
    "id": 2533,
    "name": "TCL 75-Inch QM8 QLED 4K Mini-LED TV",
    "brand": "TCL",
    "category": "Smart TVs & Home Entertainment",
    "price": 149990,
    "stock": 7,
    "rating": 4.7,
    "reviewCount": 32,
    "imageUrl": "https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800&auto=format&fit=crop",
    "description": "Giant-screen cinematic beast boasting over 2,000 local dimming zones and an eye-searing 2,500 nits peak brightness. Certified IMAX Enhanced with built-in Onkyo 2.1 channel audio system with integrated subwoofer.",
    "specifications": "{\"screenSize\":\"75-inch (190 cm) QLED Mini-LED 4K UHD\",\"brightness\":\"2500 nits peak brightness with Ultra-high contrast Mini-LED zones\",\"refreshRate\":\"Native 144Hz with Game Accelerator 240Hz mode and AMD FreeSync Premium Pro\",\"sound\":\"Onkyo 2.1 Channel sound system with dedicated rear subwoofer and Dolby Atmos\",\"os\":\"Google TV with Chromecast built-in and Apple HomeKit support\"}",
    "createdAt": "2026-11-03T17:45:18.70092Z",
    "updatedAt": "2026-11-03T17:45:18.70092Z",
    "stockQuantity": 7
  },
  {
    "id": 2534,
    "name": "Hisense U8N 55-Inch Mini-LED ULED 4K Google TV",
    "brand": "Hisense",
    "category": "Smart TVs & Home Entertainment",
    "price": 69990,
    "stock": 15,
    "rating": 4.6,
    "reviewCount": 28,
    "imageUrl": "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&auto=format&fit=crop",
    "description": "Incredible value Mini-LED display with Hi-View Engine PRO neural processor, 3,000 nits peak brightness, 144Hz native refresh rate, anti-reflective screen, and multi-channel 2.1.2 Dolby Atmos sound system.",
    "specifications": "{\"screenSize\":\"55-inch (139 cm) Mini-LED ULED 4K\",\"brightness\":\"Up to 3000 nits with Full Array Local Dimming\",\"gaming\":\"144Hz Game Mode Pro with dual HDMI 2.1, VRR, FreeSync Premium Pro\",\"audio\":\"2.1.2 multi-channel surround sound with up-firing speakers (50W)\",\"os\":\"Google TV with hands-free voice control\"}",
    "createdAt": "2026-11-03T17:45:18.709433Z",
    "updatedAt": "2026-11-03T17:45:18.709433Z",
    "stockQuantity": 15
  },
  {
    "id": 2535,
    "name": "Logitech MX Master 3S Wireless Performance Mouse",
    "brand": "Logitech",
    "category": "Accessories",
    "price": 9495,
    "stock": 55,
    "rating": 4.9,
    "reviewCount": 160,
    "imageUrl": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop",
    "description": "The industry benchmark ergonomic wireless mouse for software engineers, designers, and power creators. Features Quiet Click switches (90% noise reduction), 8K DPI Darkfield optical sensor that tracks on glass, and the legendary electromagnetic MagSpeed scroll wheel.",
    "specifications": "{\"sensor\":\"8000 DPI Darkfield High Precision (tracks on any surface including glass)\",\"scrollWheel\":\"MagSpeed Electromagnetic Scroll (up to 1,000 lines per second)\",\"clicks\":\"Quiet Click acoustic dampening switches with tactile click feel\",\"connectivity\":\"Bluetooth Low Energy + Logi Bolt USB Receiver (pairs with 3 devices)\",\"battery\":\"Rechargeable 500mAh Li-Po (up to 70 days per charge, 3 hours from 1-min charge)\"}",
    "createdAt": "2026-11-03T17:45:18.717067Z",
    "updatedAt": "2026-11-03T17:45:18.717067Z",
    "stockQuantity": 55
  },
  {
    "id": 2536,
    "name": "Razer DeathAdder V3 Pro Wireless Gaming Mouse",
    "brand": "Razer",
    "category": "Accessories",
    "price": 12999,
    "stock": 35,
    "rating": 4.9,
    "reviewCount": 92,
    "imageUrl": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop",
    "description": "Created with input from top esports professionals. Features a featherlight 63-gram ergonomic design, Razer Focus Pro 30K Optical Sensor with 99.8% resolution accuracy, Gen-3 optical switches with zero debounce delay, and up to 90 hours battery.",
    "specifications": "{\"weight\":\"63g ultra-lightweight ergonomic chassis\",\"sensor\":\"Focus Pro 30K Optical Sensor with Smart Tracking & Asymmetric Cut-off\",\"switches\":\"Razer Optical Mouse Switches Gen-3 (90 million click lifecycle, 0.2ms actuation)\",\"pollingRate\":\"1000Hz (upgradable to 8000Hz with HyperPolling Wireless Dongle)\",\"battery\":\"Up to 90 hours continuous gameplay via Razer HyperSpeed Wireless\"}",
    "createdAt": "2026-11-03T17:45:18.725578Z",
    "updatedAt": "2026-11-03T17:45:18.725578Z",
    "stockQuantity": 35
  },
  {
    "id": 2537,
    "name": "Logitech G502 X PLUS Wireless RGB Gaming Mouse",
    "brand": "Logitech",
    "category": "Accessories",
    "price": 13995,
    "stock": 28,
    "rating": 4.8,
    "reviewCount": 84,
    "imageUrl": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop",
    "description": "The newest iteration of the worlds most popular gaming mouse. Reinvented with LIGHTFORCE hybrid optical-mechanical switches, sub-micron HERO 25K gaming sensor, customizable 8-LED LIGHTSYNC RGB lighting, and dual-mode hyper-fast scroll wheel.",
    "specifications": "{\"switches\":\"LIGHTFORCE Hybrid Optical-Mechanical Switches for speed and crisp mechanical tactile feedback\",\"sensor\":\"HERO 25K gaming sensor (100 - 25,600 DPI with zero smoothing/acceleration)\",\"buttons\":\"13 programmable controls with reversible DPI-shift thumb button\",\"lighting\":\"8-LED active zone LIGHTSYNC RGB with play-detection power saving\",\"battery\":\"Up to 120 hours with lighting off (37 hours with full RGB)\"}",
    "createdAt": "2026-11-03T17:45:18.736317Z",
    "updatedAt": "2026-11-03T17:45:18.736317Z",
    "stockQuantity": 28
  },
  {
    "id": 2532,
    "name": "Samsung Neo QLED 65-Inch QN90D 4K Mini-LED TV",
    "brand": "Samsung",
    "category": "Smart TVs & Home Entertainment",
    "price": 174990,
    "stock": 10,
    "rating": 4.8,
    "reviewCount": 39,
    "imageUrl": "https://images.unsplash.com/photo-1577979749830-f1d742b96791?w=800&auto=format&fit=crop",
    "description": "Quantum Matrix Technology with ultra-dense Quantum Mini-LEDs gives dazzling brightness and deep blacks without any risk of OLED burn-in. NQ4 AI Gen2 Processor with 20 AI neural networks upscales standard content into breathtaking 4K.",
    "specifications": "{\"screenSize\":\"65-inch (164 cm) Neo QLED Mini-LED 4K\",\"refreshRate\":\"Motion Xcelerator 144Hz Gaming Display\",\"processor\":\"NQ4 AI Gen2 Processor with Real Depth Enhancer Pro\",\"antiGlare\":\"Anti-Glare coating with Ultra Viewing Angle filter\",\"audio\":\"Object Tracking Sound+ (OTS+) with Dolby Atmos 60W 4.2.2 Channel\",\"smartFeatures\":\"Tizen OS with Samsung Gaming Hub and SmartThings Hub built-in\"}",
    "createdAt": "2026-11-03T17:45:18.691914Z",
    "updatedAt": "2026-11-03T17:45:18.691914Z",
    "stockQuantity": 10
  },
  {
    "id": 2542,
    "name": "Razer Huntsman V3 Pro Tenkeyless Esports Keyboard",
    "brand": "Razer",
    "category": "Accessories",
    "price": 19999,
    "stock": 18,
    "rating": 4.8,
    "reviewCount": 54,
    "imageUrl": "https://images.unsplash.com/photo-1541140532154-b024d705b909?w=800&auto=format&fit=crop",
    "description": "Tournament-ready competitive keyboard equipped with Gen-2 Analog Optical Switches. Features Rapid Trigger technology with adjustable actuation from 0.1mm to 4.0mm, onboard LED array display for instant actuation tweaking, and magnetic leatherette wrist rest.",
    "specifications": "{\"switches\":\"Razer Gen-2 Analog Optical Switches with Rapid Trigger mode\",\"actuationRange\":\"Adjustable from 0.1mm to 4.0mm per-key sensitivity in 0.1mm increments\",\"keycaps\":\"Textured Doubleshot PBT keycaps with shine-through legends\",\"chassis\":\"Brushed 5052 aluminum alloy top plate with sound-dampening foam\",\"wristRest\":\"Magnetic plush leatherette ergonomic wrist rest included\"}",
    "createdAt": "2026-11-03T17:45:18.785136Z",
    "updatedAt": "2026-11-03T17:45:18.785136Z",
    "stockQuantity": 18
  },
  {
    "id": 2557,
    "name": "BenQ ZOWIE EC2-CW Wireless Esports Gaming Mouse",
    "brand": "BenQ ZOWIE",
    "category": "Accessories",
    "price": 13990,
    "stock": 20,
    "rating": 4.9,
    "reviewCount": 45,
    "imageUrl": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop",
    "description": "The golden standard ergonomic shape favored by professional Counter-Strike and Valorant esports players worldwide. Features a standalone anti-interference wireless receiver dock that doubles as an instant charging station for zero signal drops.",
    "specifications": "{\"shape\":\"Classic asymmetrical ergonomic right-hand design for palm/claw grip\",\"sensor\":\"3370 Optical Sensor with driverless plug-and-play 400/800/1600/3200 DPI\",\"dock\":\"Enhanced Wireless Receiver Dock eliminates radio signal interference on tournament stages\",\"battery\":\"Up to 70 hours continuous gaming battery life with rapid drop-in charging\"}",
    "createdAt": "2026-11-03T17:56:32.026446Z",
    "updatedAt": "2026-11-03T17:56:32.026446Z",
    "stockQuantity": 20
  },
  {
    "id": 2558,
    "name": "Pulsar X2V2 Wireless Ultra-Light Gaming Mouse",
    "brand": "Pulsar",
    "category": "Accessories",
    "price": 8999,
    "stock": 24,
    "rating": 4.8,
    "reviewCount": 52,
    "imageUrl": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop",
    "description": "Boutique lightweight gaming mouse weighing only 53 grams without any exterior holes. Equipped with PixArt PAW3395 flagship sensor, dustproof Pulsar Blue encoder, optical switches that eliminate double-clicking, and 4K wireless polling capability.",
    "specifications": "{\"weight\":\"53 grams hole-free unibody featherlight casing\",\"sensor\":\"PixArt PAW3395 (26,000 DPI, 650 IPS, 50G acceleration with Motion Sync)\",\"switches\":\"Light-speed optical switches with zero debounce delay\",\"encoder\":\"Pulsar Blue dustproof scroll wheel encoder\",\"pollingRate\":\"1000Hz (upgradable to 4000Hz with optional 4K dongle)\"}",
    "createdAt": "2026-11-03T17:56:32.034652Z",
    "updatedAt": "2026-11-03T17:56:32.034652Z",
    "stockQuantity": 24
  },
  {
    "id": 2567,
    "name": "Epomaker TH80 Pro 75% Hot-Swappable RGB Keyboard",
    "brand": "Epomaker",
    "category": "Accessories",
    "price": 8999,
    "stock": 35,
    "rating": 4.7,
    "reviewCount": 78,
    "imageUrl": "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop",
    "description": "Beloved 75% mechanical keyboard featuring a metallic multi-function rotary knob for media and volume control. Triple-mode connectivity (Bluetooth 5.0, 2.4GHz, and Type-C wired) with south-facing RGB backlighting and pre-lubed mechanical switches.",
    "specifications": "{\"layout\":\"75% layout with 80 keys and CNC metal rotary knob\",\"switches\":\"Hot-swappable 3/5-pin PCB with Epomaker Flamingo linear switches (factory lubed)\",\"battery\":\"4000mAh high-capacity rechargeable battery\",\"connectivity\":\"Triple-mode: Bluetooth 5.0 + 2.4GHz Wireless + USB-C Wired\",\"keycaps\":\"MDA profile PBT thermal sublimation keycaps\"}",
    "createdAt": "2026-11-03T17:56:32.111388Z",
    "updatedAt": "2026-11-03T17:56:32.111388Z",
    "stockQuantity": 35
  },
  {
    "id": 2568,
    "name": "Razer BlackWidow V4 Pro Mechanical Gaming Keyboard",
    "brand": "Razer",
    "category": "Accessories",
    "price": 22999,
    "stock": 14,
    "rating": 4.8,
    "reviewCount": 57,
    "imageUrl": "https://images.unsplash.com/photo-1541140532154-b024d705b909?w=800&auto=format&fit=crop",
    "description": "Battlestation centerpiece featuring Razer Command Dial and 8 dedicated macro keys. Equipped with Razer Green clicky mechanical switches, 8000Hz hyper-polling rate, 3-sided perimeter RGB underglow, and plush leatherette magnetic wrist rest with lighting.",
    "specifications": "{\"switches\":\"Razer Green Clicky Mechanical Switches (50g actuation, crisp tactile bump)\",\"controls\":\"Razer Command Dial + 4 dedicated media keys + roller + 8 macro keys\",\"pollingRate\":\"True 8000Hz HyperPolling rate for near-zero input lag\",\"lighting\":\"Per-key Chroma RGB + 3-side keyboard underglow + wrist rest underglow\",\"chassis\":\"5052 aluminum alloy top case with PCB dampening foam and lubricated stabilizers\"}",
    "createdAt": "2026-11-03T17:56:32.119804Z",
    "updatedAt": "2026-11-03T17:56:32.119804Z",
    "stockQuantity": 14
  },
  {
    "id": 2538,
    "name": "Apple Magic Mouse (USB-C Rechargeable)",
    "brand": "Apple",
    "category": "Accessories",
    "price": 7500,
    "stock": 40,
    "rating": 4.5,
    "reviewCount": 71,
    "imageUrl": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop",
    "description": "Wireless and rechargeable mouse with an optimized foot design that lets it glide smoothly across your desk. The Multi-Touch surface allows you to perform simple gestures like swiping between web pages and scrolling through documents on macOS.",
    "specifications": "{\"surface\":\"Seamless Multi-Touch capacitive gesture surface\",\"charging\":\"USB-C to Lightning / USB-C fast charging port with woven cable included\",\"connectivity\":\"Bluetooth wireless with automatic pairing to Mac\",\"compatibility\":\"Mac with macOS 10.11 or later, iPad with iPadOS 13.4 or later\"}",
    "createdAt": "2026-11-03T17:45:18.746842Z",
    "updatedAt": "2026-11-03T17:45:18.746842Z",
    "stockQuantity": 40
  },
  {
    "id": 2539,
    "name": "SteelSeries Aerox 5 Wireless Lightweight Gaming Mouse",
    "brand": "SteelSeries",
    "category": "Accessories",
    "price": 9999,
    "stock": 26,
    "rating": 4.7,
    "reviewCount": 38,
    "imageUrl": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop",
    "description": "Ultra-lightweight 74g multi-genre gaming mouse with 9 programmable buttons including a custom up/down flick switch. Engineered with AquaBarrier IP54 water-resistant and dustproof shielding for maximum durability.",
    "specifications": "{\"weight\":\"74 grams hole-punched honeycomb casing\",\"durability\":\"AquaBarrier IP54 rated water, dust, and grime resistance\",\"sensor\":\"TrueMove Air optical sensor with 18,000 CPI and 400 IPS tracking\",\"battery\":\"Up to 180 hours battery with Quantum 2.0 dual wireless (2.4GHz + Bluetooth 5.0)\",\"buttons\":\"9 programmable macro buttons with Golden Micro IP54 switches\"}",
    "createdAt": "2026-11-03T17:45:18.753839Z",
    "updatedAt": "2026-11-03T17:45:18.753839Z",
    "stockQuantity": 26
  },
  {
    "id": 2540,
    "name": "Logitech MX Mechanical Wireless Illuminated Keyboard",
    "brand": "Logitech",
    "category": "Accessories",
    "price": 15995,
    "stock": 35,
    "rating": 4.9,
    "reviewCount": 98,
    "imageUrl": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop",
    "description": "Low-profile mechanical master keyboard crafted with a bead-blasted aluminum top plate and Tactile Quiet switches. Features smart proximity ambient backlighting that automatically lights up when your hands approach.",
    "specifications": "{\"switches\":\"Low-profile Tactile Quiet mechanical switches (3.2mm travel)\",\"keycaps\":\"Dual-color PBT keycaps with laser-etched legends\",\"illumination\":\"Smart ambient backlighting with 6 automated lighting effects\",\"connectivity\":\"Bluetooth Low Energy + Logi Bolt USB Receiver (Easy-Switch for 3 devices)\",\"battery\":\"Rechargeable 1500mAh Li-Po (up to 15 days with backlight, 10 months without)\"}",
    "createdAt": "2026-11-03T17:45:18.763323Z",
    "updatedAt": "2026-11-03T17:45:18.763323Z",
    "stockQuantity": 35
  },
  {
    "id": 2541,
    "name": "Keychron Q1 Pro QMK/VIA Wireless Custom Mechanical Keyboard",
    "brand": "Keychron",
    "category": "Accessories",
    "price": 18999,
    "stock": 20,
    "rating": 4.9,
    "reviewCount": 65,
    "imageUrl": "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop",
    "description": "Audiophile-grade 75% mechanical keyboard constructed from full CNC machined 6063 aluminum. Features double-gasket acoustic mounting, hot-swappable PCB, south-facing RGB, screw-in PCB stabilizers, and full QMK/VIA open-source key remapping.",
    "specifications": "{\"chassis\":\"Full CNC anodized and polished 6063 aluminum body (weight: 1.73 kg)\",\"structure\":\"Double-Gasket acoustic mount design with silicone dampening pads\",\"switches\":\"Hot-swappable Gateron Jupiter Red linear switches pre-lubed\",\"customization\":\"100% QMK and VIA open-source firmware keymap programming\",\"connectivity\":\"Broadcom Bluetooth 5.1 + Type-C wired (Mac & Windows switchable)\"}",
    "createdAt": "2026-11-03T17:45:18.771084Z",
    "updatedAt": "2026-11-03T17:45:18.771084Z",
    "stockQuantity": 20
  },
  {
    "id": 2543,
    "name": "Corsair K100 RGB Flagship Mechanical Keyboard",
    "brand": "Corsair",
    "category": "Accessories",
    "price": 21499,
    "stock": 15,
    "rating": 4.8,
    "reviewCount": 43,
    "imageUrl": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop",
    "description": "The apex of mechanical gaming performance. Powered by CORSAIR AXON hyper-processing delivering true 4000Hz polling rate and key scanning, genuine CHERRY MX Speed Silver switches, customizable iCUE multi-function rotary control wheel, and 44-zone three-sided RGB LightEdge.",
    "specifications": "{\"switches\":\"CHERRY MX Speed Silver (1.2mm actuation distance with 45g actuation force)\",\"pollingRate\":\"CORSAIR AXON hyper-processing technology with native 4000Hz polling\",\"controls\":\"Multi-function iCUE Control Wheel with 6 dedicated macro keys with Elgato Stream Deck integration\",\"keycaps\":\"Precision-molded 1.5mm thick PBT double-shot keycap set\",\"lighting\":\"Per-key RGB backlighting with 44-zone LightEdge perimeter diffusion\"}",
    "createdAt": "2026-11-03T17:45:18.795555Z",
    "updatedAt": "2026-11-03T17:45:18.795555Z",
    "stockQuantity": 15
  },
  {
    "id": 2544,
    "name": "ASUS ROG Azoth 75% Wireless Custom Gaming Keyboard",
    "brand": "ASUS",
    "category": "Accessories",
    "price": 23999,
    "stock": 12,
    "rating": 4.9,
    "reviewCount": 36,
    "imageUrl": "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop",
    "description": "Enthusiast-level DIY mechanical keyboard with built-in 2-inch OLED status display and 3-way control knob. Features 3-layer sound dampening silicone foam, pre-lubed ROG NX mechanical switches, hot-swappable sockets, and complete switch lubing kit included in the box.",
    "specifications": "{\"display\":\"2-inch OLED panel displaying system stats, battery, keyboard profiles, and custom animations\",\"mounting\":\"Silicone gasket mount with 3 layers of dampening foam for thocky acoustics\",\"switches\":\"Hot-swappable pre-lubed ROG NX Snow linear mechanical switches\",\"battery\":\"Over 2,000 hours of continuous gameplay with OLED and RGB off (2.4GHz SpeedNova)\",\"accessories\":\"Includes Krytox GPL-205-GD0 switch lube, switch opener, keycap puller, and brush\"}",
    "createdAt": "2026-11-03T17:45:18.804014Z",
    "updatedAt": "2026-11-03T17:45:18.804014Z",
    "stockQuantity": 12
  },
  {
    "id": 2545,
    "name": "Sony WF-1000XM5 True Wireless Noise Canceling Earbuds",
    "brand": "Sony",
    "category": "Audio & Headphones",
    "price": 24990,
    "stock": 40,
    "rating": 4.9,
    "reviewCount": 135,
    "imageUrl": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop",
    "description": "The best noise canceling true wireless earbuds in the world. Equipped with dual proprietary processors (HD Noise Canceling Processor QN2e and Integrated Processor V2), custom Dynamic Driver X for rich vocals, Hi-Res Audio Wireless with LDAC, and AI-based bone conduction voice pickup microphones.",
    "specifications": "{\"driver\":\"Dynamic Driver X 8.4mm with multi-material dome architecture\",\"anc\":\"Dual-processor Active Noise Cancellation with dual feedback microphones per ear\",\"codecs\":\"LDAC, LC3, AAC, SBC with DSEE Extreme AI audio upscaling\",\"battery\":\"8 hours (buds) + 16 hours (case) with ANC on; 3-min quick charge gives 60 mins\",\"waterResistance\":\"IPX4 splash and sweat resistance\"}",
    "createdAt": "2026-11-03T17:45:18.811526Z",
    "updatedAt": "2026-11-03T17:45:18.811526Z",
    "stockQuantity": 40
  },
  {
    "id": 2546,
    "name": "Apple AirPods Pro (2nd Gen with USB-C Case)",
    "brand": "Apple",
    "category": "Audio & Headphones",
    "price": 23990,
    "stock": 50,
    "rating": 4.9,
    "reviewCount": 198,
    "imageUrl": "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop",
    "description": "Powered by the Apple H2 headphone chip delivering 2x more Active Noise Cancellation than before. Features Adaptive Audio that seamlessly blends ANC and Transparency mode depending on your surroundings, Personalized Spatial Audio with dynamic head tracking, and MagSafe charging case with Precision Finding speaker.",
    "specifications": "{\"chip\":\"Apple H2 headphone chip in earbuds; Apple U1 chip in charging case\",\"anc\":\"Up to 2x more Active Noise Cancellation + Adaptive Audio + Conversation Awareness\",\"audio\":\"Custom high-excursion Apple driver with custom high dynamic range amplifier\",\"battery\":\"Up to 6 hours listening time on a single charge; up to 30 hours total with case\",\"case\":\"MagSafe USB-C case with speaker for Find My, lanyard loop, and IP54 rating\"}",
    "createdAt": "2026-11-03T17:45:18.81963Z",
    "updatedAt": "2026-11-03T17:45:18.81963Z",
    "stockQuantity": 50
  },
  {
    "id": 2547,
    "name": "Bose QuietComfort Ultra Wireless Earbuds",
    "brand": "Bose",
    "category": "Audio & Headphones",
    "price": 25900,
    "stock": 30,
    "rating": 4.8,
    "reviewCount": 82,
    "imageUrl": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop",
    "description": "Groundbreaking spatialized audio meets legendary noise cancellation. Bose Immersive Audio pushes boundaries by placing what you hear right in front of you, while CustomTune technology auto-adjusts sound and active noise cancellation specifically to the shape of your ear canal.",
    "specifications": "{\"spatialAudio\":\"Bose Immersive Audio with Still and Motion spatial modes\",\"anc\":\"CustomTune personalized noise cancellation technology\",\"fit\":\"Bose Fit Kit with 9 combinations of ear tips and stability bands\",\"codecs\":\"Qualcomm aptX Adaptive, AAC, SBC (Snapdragon Sound certified)\",\"battery\":\"Up to 6 hours listening (up to 4 hours with Immersive Audio); 24 hours total with case\"}",
    "createdAt": "2026-11-03T17:45:18.829923Z",
    "updatedAt": "2026-11-03T17:45:18.829923Z",
    "stockQuantity": 30
  },
  {
    "id": 2548,
    "name": "Sennheiser Momentum True Wireless 4",
    "brand": "Sennheiser",
    "category": "Audio & Headphones",
    "price": 29990,
    "stock": 22,
    "rating": 4.9,
    "reviewCount": 49,
    "imageUrl": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop",
    "description": "The pinnacle of audiophile wireless listening. Equipped with TrueResponse 7mm transducer system handcrafted in Ireland, next-gen Bluetooth 5.4 with Auracast broadcast support, Qualcomm Snapdragon Sound lossless audio transmission, and premium fabric-wrapped Qi wireless charging case.",
    "specifications": "{\"transducer\":\"TrueResponse dynamic 7mm driver delivering 5 Hz to 21 kHz frequency response\",\"wireless\":\"Bluetooth 5.4 with LE Audio, Auracast, and Snapdragon Sound\",\"codecs\":\"aptX Lossless, aptX Adaptive, LC3, AAC, SBC\",\"battery\":\"7.5 hours per charge, 30 hours total with case with battery protection mode\",\"tuning\":\"Sound Personalization test co-developed with Fraunhofer IDMT\"}",
    "createdAt": "2026-11-03T17:45:18.838473Z",
    "updatedAt": "2026-11-03T17:45:18.838473Z",
    "stockQuantity": 22
  },
  {
    "id": 2549,
    "name": "Samsung Galaxy Buds3 Pro",
    "brand": "Samsung",
    "category": "Audio & Headphones",
    "price": 19999,
    "stock": 35,
    "rating": 4.7,
    "reviewCount": 63,
    "imageUrl": "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop",
    "description": "Redesigned blade design featuring interactive Blade Lights, 2-way dual amplifier drivers with planar tweeter for crystal-clear highs and deep bass, 24-bit/96kHz ultra high quality audio codec, and Galaxy AI real-time voice interpreter mode.",
    "specifications": "{\"speakers\":\"Enhanced 2-way speaker: 10.5mm dynamic woofer + 6.1mm planar tweeter with dual amps\",\"soundQuality\":\"Samsung Seamless Codec Ultra High Quality (up to 24-bit / 96kHz)\",\"aiFeatures\":\"Real-time Voice Interpreter, Adaptive Noise Control, and Siren/Voice Detect\",\"battery\":\"Up to 7 hours with ANC off (6 hours with ANC on); up to 30 hours total with case\",\"design\":\"Ergonomic blade stem with pinch/swipe controls and LED Blade Lights\"}",
    "createdAt": "2026-11-03T17:45:18.847231Z",
    "updatedAt": "2026-11-03T17:45:18.847231Z",
    "stockQuantity": 35
  },
  {
    "id": 2550,
    "name": "OnePlus Buds Pro 3",
    "brand": "OnePlus",
    "category": "Audio & Headphones",
    "price": 11999,
    "stock": 45,
    "rating": 4.8,
    "reviewCount": 78,
    "imageUrl": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop",
    "description": "Co-created with Dynaudio master acoustic engineers. Features dual drivers (11mm woofer + 6mm tweeter) with dual DACs, industry-leading 50dB Adaptive Noise Cancellation, LHDC 5.0 24-bit Hi-Res audio, and premium tactile faux-leather charging case.",
    "specifications": "{\"drivers\":\"Dual Drivers with Dual DACs: 11mm woofer with dual magnet + 6mm planar tweeter\",\"tuning\":\"Dynaudio Master Sound EQ profiles with personalized Golden Sound boost\",\"anc\":\"Up to 50dB Real-time Smart Adaptive Noise Cancellation with 2x voice cancellation\",\"codecs\":\"LHDC 5.0, AAC, SBC (Hi-Res Audio Wireless certified up to 1Mbps 192kHz/24bit)\",\"battery\":\"Up to 43 hours total playback with fast warp charge (10 mins gives 13 hours)\"}",
    "createdAt": "2026-11-03T17:45:18.856186Z",
    "updatedAt": "2026-11-03T17:45:18.856186Z",
    "stockQuantity": 45
  },
  {
    "id": 2551,
    "name": "Shure SE215 PRO Sound Isolating In-Ear Earphones",
    "brand": "Shure",
    "category": "Audio & Headphones",
    "price": 8999,
    "stock": 25,
    "rating": 4.7,
    "reviewCount": 94,
    "imageUrl": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop",
    "description": "Legendary professional stage monitoring in-ear earphones with detailed sound and enhanced bass. Sound Isolating design blocks up to 37 dB of outside noise with gold-plated MMCX detachable Kevlar-reinforced cable for years of reliable audiophile use.",
    "specifications": "{\"driver\":\"Single Dynamic MicroDriver for warm, detailed audio with deep bass resonance\",\"isolation\":\"Passive acoustic isolation blocks up to 37 dB of ambient noise without batteries\",\"cable\":\"Detachable Kevlar-reinforced 3.5mm cable with gold-plated MMCX lock-snap 360-degree rotation\",\"formFactor\":\"Ergonomic low-profile wireform over-the-ear secure stage fit\",\"sleeveFitKit\":\"Includes multiple sizes of Sound Isolating foam and soft flex silicone sleeves\"}",
    "createdAt": "2026-11-03T17:45:18.865504Z",
    "updatedAt": "2026-11-03T17:45:18.865504Z",
    "stockQuantity": 25
  },
  {
    "id": 2552,
    "name": "Logitech G PRO X Superlight 2 Lightspeed Wireless Mouse",
    "brand": "Logitech",
    "category": "Accessories",
    "price": 14995,
    "stock": 35,
    "rating": 4.9,
    "reviewCount": 142,
    "imageUrl": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop",
    "description": "The premier esports mouse trusted by the worlds top pro athletes. Weighing an astonishing 60 grams, it features the HERO 2 sensor with up to 32,000 DPI, LIGHTFORCE hybrid optical-mechanical switches, true 4000Hz polling rate, and zero-additive PTFE feet.",
    "specifications": "{\"weight\":\"60 grams featherlight tournament chassis\",\"sensor\":\"HERO 2 (100 - 32,000 DPI, >500 IPS, >40G acceleration)\",\"switches\":\"LIGHTFORCE Hybrid Optical-Mechanical Click Switches\",\"pollingRate\":\"Up to 4000Hz report rate via LIGHTSPEED wireless\",\"battery\":\"Up to 95 hours constant motion battery life (USB-C rechargeable)\",\"connectivity\":\"LIGHTSPEED Wireless + USB-C wired charging\"}",
    "createdAt": "2026-11-03T17:56:31.972023Z",
    "updatedAt": "2026-11-03T17:56:31.972023Z",
    "stockQuantity": 35
  },
  {
    "id": 2553,
    "name": "Razer Viper V3 Pro Ultra-Lightweight Wireless Esports Mouse",
    "brand": "Razer",
    "category": "Accessories",
    "price": 15999,
    "stock": 28,
    "rating": 4.9,
    "reviewCount": 96,
    "imageUrl": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop",
    "description": "Engineered in partnership with top FPS pros like Zekken. Weighs just 54 grams with a balanced symmetrical design, Razer Focus Pro 35K Gen-2 Optical Sensor, Gen-3 optical mouse switches, and true wireless 8000Hz HyperPolling dongle included in the box.",
    "specifications": "{\"weight\":\"54 grams ultra-lightweight solid shell\",\"sensor\":\"Focus Pro 35K Gen-2 Optical Sensor (1-DPI step adjustments)\",\"switches\":\"Razer Optical Mouse Switches Gen-3 (90M clicks, zero debounce delay)\",\"pollingRate\":\"True 8000Hz Wireless with included HyperPolling Wireless Dongle\",\"battery\":\"Up to 95 hours at 1000Hz (up to 17 hours at 8000Hz competitive mode)\"}",
    "createdAt": "2026-11-03T17:56:31.984542Z",
    "updatedAt": "2026-11-03T17:56:31.984542Z",
    "stockQuantity": 28
  },
  {
    "id": 2554,
    "name": "Logitech MX Anywhere 3S Compact Wireless Mouse",
    "brand": "Logitech",
    "category": "Accessories",
    "price": 7995,
    "stock": 45,
    "rating": 4.8,
    "reviewCount": 88,
    "imageUrl": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop",
    "description": "The ultimate on-the-go productivity mouse. Tracks on virtually any surface—even glass—with an 8K DPI sensor. Features whisper-quiet Quiet Clicks, electromagnetic MagSpeed precision scrolling, and multi-device Easy-Switch pairing.",
    "specifications": "{\"sensor\":\"8000 DPI Darkfield High Precision (tracks on 4mm glass surfaces)\",\"scrollWheel\":\"MagSpeed Electromagnetic Scroll with SmartShift mode\",\"clicks\":\"Quiet Click acoustic dampening technology\",\"connectivity\":\"Bluetooth Low Energy + Logi Bolt (pairs up to 3 devices)\",\"battery\":\"Rechargeable Li-Po 500mAh (up to 70 days per full charge; 3 hrs from 1-min quick charge)\"}",
    "createdAt": "2026-11-03T17:56:31.99616Z",
    "updatedAt": "2026-11-03T17:56:31.99616Z",
    "stockQuantity": 45
  },
  {
    "id": 2555,
    "name": "Glorious Model O 2 Wireless Gaming Mouse",
    "brand": "Glorious",
    "category": "Accessories",
    "price": 7999,
    "stock": 30,
    "rating": 4.7,
    "reviewCount": 64,
    "imageUrl": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop",
    "description": "Iconic lightweight gaming mouse upgraded with the next-gen BAMF 2.0 26K optical sensor and dual wireless modes (2.4GHz + Bluetooth 5.2). Features proprietary honeycomb shell weighing just 68g, 80-million click Glorious switches, and 16.8M RGB lighting.",
    "specifications": "{\"weight\":\"68 grams honeycomb ventilated design\",\"sensor\":\"BAMF 2.0 Optical Sensor (100 - 26,000 DPI, 650 IPS, 50G)\",\"switches\":\"Glorious mechanical switches rated for 80 million clicks\",\"battery\":\"Up to 210 hours on Bluetooth 5.2 (up to 110 hours on 2.4GHz wireless)\",\"lighting\":\"Customizable 3-zone 16.8 million color RGB underglow\"}",
    "createdAt": "2026-11-03T17:56:32.006513Z",
    "updatedAt": "2026-11-03T17:56:32.006513Z",
    "stockQuantity": 30
  },
  {
    "id": 2556,
    "name": "Logitech Lift Vertical Ergonomic Mouse",
    "brand": "Logitech",
    "category": "Accessories",
    "price": 6495,
    "stock": 40,
    "rating": 4.8,
    "reviewCount": 110,
    "imageUrl": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop",
    "description": "Ergonomist-certified vertical wireless mouse crafted with a 57-degree natural handshake angle that relieves forearm tension and places your wrist in an optimal posture. Ideal for small-to-medium hands with silent clicks and SmartWheel scrolling.",
    "specifications": "{\"design\":\"57-degree vertical ergonomic handshake angle with textured rubber thumb rest\",\"sensor\":\"High Precision Optical Tracking (400 - 4000 DPI adjustable)\",\"scroll\":\"SmartWheel with speed-adaptive line-by-line and fast scrolling\",\"connectivity\":\"Bluetooth Low Energy + Logi Bolt USB receiver\",\"battery\":\"Up to 24 months of battery life on a single AA battery included\"}",
    "createdAt": "2026-11-03T17:56:32.016751Z",
    "updatedAt": "2026-11-03T17:56:32.016751Z",
    "stockQuantity": 40
  },
  {
    "id": 2559,
    "name": "Turtle Beach Kone XP Air Wireless RGB Gaming Mouse",
    "brand": "Turtle Beach",
    "category": "Accessories",
    "price": 11999,
    "stock": 22,
    "rating": 4.7,
    "reviewCount": 41,
    "imageUrl": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop",
    "description": "Ergonomic gaming mouse featuring 29 programmable button assignments with Easy-Shift[+] duplicator technology, Krystal 4D scroll wheel with horizontal tilt, 3D RGB translucent shell illumination, and fast-charging desktop dock.",
    "specifications": "{\"sensor\":\"Owl-Eye 19K optical sensor with 50G acceleration\",\"buttons\":\"15 physical buttons with 29 assignable functions via Easy-Shift[+]\",\"switches\":\"Titan Switch Optical with instant actuation and 100M click lifecycle\",\"dock\":\"Rapid Charge Dock gives 5 hours playtime in just 10 minutes of charging\",\"lighting\":\"AIMO 3D RGB lighting with 5 independent lighting zones\"}",
    "createdAt": "2026-11-03T17:56:32.045779Z",
    "updatedAt": "2026-11-03T17:56:32.045779Z",
    "stockQuantity": 22
  },
  {
    "id": 2560,
    "name": "Logitech G305 LIGHTSPEED Wireless Gaming Mouse",
    "brand": "Logitech",
    "category": "Accessories",
    "price": 3495,
    "stock": 60,
    "rating": 4.8,
    "reviewCount": 220,
    "imageUrl": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop",
    "description": "The undisputed value king of wireless PC gaming. Powered by the groundbreaking HERO optical sensor delivering 12,000 DPI precision, 1ms LIGHTSPEED wireless latency, and an incredible 250 hours of continuous gaming on a single AA battery.",
    "specifications": "{\"sensor\":\"HERO Optical Sensor (200 - 12,000 DPI with zero smoothing/filtering)\",\"wireless\":\"LIGHTSPEED 1ms tournament-grade report rate\",\"weight\":\"99 grams balanced lightweight design\",\"battery\":\"250 continuous run hours in Performance mode; up to 9 months in Endurance mode\",\"durability\":\"Primary switches rated for 10 million clicks with mechanical spring button tensioning\"}",
    "createdAt": "2026-11-03T17:56:32.05524Z",
    "updatedAt": "2026-11-03T17:56:32.05524Z",
    "stockQuantity": 60
  },
  {
    "id": 2561,
    "name": "ASUS ROG Harpe Ace Aim Lab Edition Mouse",
    "brand": "ASUS",
    "category": "Accessories",
    "price": 10999,
    "stock": 18,
    "rating": 4.8,
    "reviewCount": 36,
    "imageUrl": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop",
    "description": "Pro-tested 54-gram ultra-lightweight symmetrical wireless mouse co-designed with Aim Lab FPS trainers. Features Aim Lab Settings Optimizer software that analyzes your gameplay and tailors mouse DPI, angle tuning, and lift-off distance to your unique playstyle.",
    "specifications": "{\"weight\":\"54 grams bio-based nylon outer shell\",\"sensor\":\"ROG AimPoint 36,000 DPI optical sensor (<1% CPI deviation)\",\"wireless\":\"ROG SpeedNova ultra-low latency wireless technology\",\"switches\":\"ROG 70M Micro Switches with consistent click force\",\"software\":\"Aim Lab Settings Optimizer built into Armoury Crate\"}",
    "createdAt": "2026-11-03T17:56:32.064754Z",
    "updatedAt": "2026-11-03T17:56:32.064754Z",
    "stockQuantity": 18
  },
  {
    "id": 2562,
    "name": "Wooting 60HE+ Analog Magnetic Gaming Keyboard",
    "brand": "Wooting",
    "category": "Accessories",
    "price": 21999,
    "stock": 20,
    "rating": 4.9,
    "reviewCount": 118,
    "imageUrl": "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop",
    "description": "The undisputed #1 competitive esports keyboard in the world. Powered by Gateron Lekker Hall Effect magnetic switches with true analog input, Rapid Trigger technology with 0.1mm reset points, customizable per-key actuation from 0.1mm to 4.0mm, and tachyon mode <1ms input latency.",
    "specifications": "{\"switches\":\"Lekker Hall Effect Magnetic Analog Switches (pre-lubed)\",\"rapidTrigger\":\"Continuous Rapid Trigger reset from 0.1mm to 4.0mm with 0.1mm sensitivity\",\"latency\":\"Tachyon Mode with <1ms true analog input response time\",\"firmware\":\"Wootility web-based driverless configuration with onboard memory\",\"chassis\":\"60% compact layout with screw-in stabilizers and multi-layer dampening foam\"}",
    "createdAt": "2026-11-03T17:56:32.072245Z",
    "updatedAt": "2026-11-03T17:56:32.072245Z",
    "stockQuantity": 20
  },
  {
    "id": 2563,
    "name": "SteelSeries Apex Pro TKL Wireless (2024)",
    "brand": "SteelSeries",
    "category": "Accessories",
    "price": 24999,
    "stock": 16,
    "rating": 4.9,
    "reviewCount": 74,
    "imageUrl": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop",
    "description": "The worlds fastest keyboard with OmniPoint 2.0 Adjustable HyperMagnetic Switches. Features 2-in-1 action keys where a half-press walks and a full-press sprints, an integrated OLED smart display for stats and Discord notifications, and aircraft-grade aluminum top plate.",
    "specifications": "{\"switches\":\"OmniPoint 2.0 Adjustable HyperMagnetic Switches (0.2mm - 3.8mm actuation)\",\"display\":\"OLED Smart Display with onboard profile switcher and volume roller\",\"chassis\":\"Series 5000 Aircraft-Grade Aluminum Alloy Frame\",\"wireless\":\"Quantum 2.0 Dual Wireless (Lag-free 2.4GHz + Bluetooth 5.0)\",\"keycaps\":\"Double Shot PBT keycaps with translucent RGB shine-through\"}",
    "createdAt": "2026-11-03T17:56:32.07972Z",
    "updatedAt": "2026-11-03T17:56:32.07972Z",
    "stockQuantity": 16
  },
  {
    "id": 2564,
    "name": "Logitech G915 LIGHTSPEED Wireless Mechanical Keyboard",
    "brand": "Logitech",
    "category": "Accessories",
    "price": 19995,
    "stock": 25,
    "rating": 4.8,
    "reviewCount": 130,
    "imageUrl": "https://images.unsplash.com/photo-1541140532154-b024d705b909?w=800&auto=format&fit=crop",
    "description": "Ultra-thin, impossibly slim low-profile mechanical keyboard crafted from brushed 5052 aluminum alloy. Features high-performance low-profile GL mechanical switches, pro-grade 1ms LIGHTSPEED wireless, LIGHTSYNC RGB lighting, and up to 30 hours of continuous battery life.",
    "specifications": "{\"thickness\":\"22mm ultra-slim low-profile silhouette with brushed aluminum top case\",\"switches\":\"High-performance low-profile GL Tactile / Clicky mechanical switches\",\"wireless\":\"LIGHTSPEED 1ms wireless + Bluetooth connectivity\",\"controls\":\"Dedicated media controls with precision engineered cast-metal volume wheel\",\"macros\":\"5 dedicated programmable G-keys for custom macros and in-game keybinds\"}",
    "createdAt": "2026-11-03T17:56:32.089235Z",
    "updatedAt": "2026-11-03T17:56:32.089235Z",
    "stockQuantity": 25
  },
  {
    "id": 2565,
    "name": "NuPhy Air75 V2 Ultra-Slim Wireless Mechanical Keyboard",
    "brand": "NuPhy",
    "category": "Accessories",
    "price": 13999,
    "stock": 32,
    "rating": 4.9,
    "reviewCount": 85,
    "imageUrl": "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop",
    "description": "Enthusiast favorite low-profile travel mechanical keyboard designed to sit directly on top of MacBook keyboards without pressing laptop keys. Features 1000Hz polling rate in 2.4GHz wireless mode, full QMK/VIA keymap programming, and pre-lubed Gateron low-profile switches.",
    "specifications": "{\"layout\":\"75% compact ultra-slim low-profile layout\",\"switches\":\"Hot-swappable Gateron Low-Profile Cowberry / Wisteria switches (pre-lubed)\",\"pollingRate\":\"1000Hz polling rate in both 2.4GHz wireless and wired modes\",\"customization\":\"Full open-source QMK/VIA support for infinite key mapping\",\"acoustics\":\"Four-layer interior sound-dampening acoustic silicone pad\"}",
    "createdAt": "2026-11-03T17:56:32.097242Z",
    "updatedAt": "2026-11-03T17:56:32.097242Z",
    "stockQuantity": 32
  },
  {
    "id": 2566,
    "name": "Ducky One 3 RGB TKL Hot-Swappable Mechanical Keyboard",
    "brand": "Ducky",
    "category": "Accessories",
    "price": 12999,
    "stock": 24,
    "rating": 4.8,
    "reviewCount": 62,
    "imageUrl": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop",
    "description": "Constructed under Duckys QUACK Mechanics philosophy delivering exceptional typing acoustics and tactile bliss. Features authentic German Cherry MX switches, hot-swappable Kailh sockets, true PBT double-shot seamless keycaps, and dual-layer high-density EVA sound dampener.",
    "specifications": "{\"switches\":\"Hot-swappable Kailh yellow sockets with German Cherry MX Brown/Red switches\",\"keycaps\":\"True PBT Double-Shot seamless keycaps with stain and shine resistance\",\"acoustics\":\"Dual-layer high-grade silicone sound dampeners with EVA foam base\",\"stabilizers\":\"Ducky V2 factory-lubricated stabilizers for wobble-free spacebar and enter keys\",\"cable\":\"Detachable braided USB Type-C with 3-level adjustable keyboard feet\"}",
    "createdAt": "2026-11-03T17:56:32.103761Z",
    "updatedAt": "2026-11-03T17:56:32.103761Z",
    "stockQuantity": 24
  },
  {
    "id": 2569,
    "name": "Keychron V1 Max Custom Wireless Mechanical Keyboard",
    "brand": "Keychron",
    "category": "Accessories",
    "price": 9999,
    "stock": 30,
    "rating": 4.8,
    "reviewCount": 70,
    "imageUrl": "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop",
    "description": "Budget-friendly custom mechanical keyboard with wireless 2.4GHz and Bluetooth 5.1 support. Features acoustic silicone pad, pre-lubed Gateron Jupiter Brown tactile switches, screw-in stabilizers, and full QMK/VIA key programming.",
    "specifications": "{\"layout\":\"75% compact 82-key layout with multi-function volume knob\",\"switches\":\"Hot-swappable Gateron Jupiter Brown tactile switches (55g actuation)\",\"customization\":\"100% QMK/VIA firmware keymap programming\",\"wireless\":\"2.4GHz wireless + Bluetooth 5.1 + Type-C wired\",\"keycaps\":\"OSA profile double-shot PBT keycaps with Mac & Windows replacement keycaps\"}",
    "createdAt": "2026-11-03T17:56:32.12811Z",
    "updatedAt": "2026-11-03T17:56:32.12811Z",
    "stockQuantity": 30
  },
  {
    "id": 2570,
    "name": "Logitech Wave Keys Wireless Ergonomic Keyboard",
    "brand": "Logitech",
    "category": "Accessories",
    "price": 6995,
    "stock": 45,
    "rating": 4.7,
    "reviewCount": 92,
    "imageUrl": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop",
    "description": "Ergonomist-certified wavy keyboard designed with a cushioned 3-layer memory foam palm rest. Places your hands, wrists, and forearms in a natural relaxed typing position for all-day comfort without requiring a learning curve.",
    "specifications": "{\"ergonomics\":\"Wave keyframe design with 3-layer memory foam cushioned palm rest\",\"keys\":\"Quiet, tactile dome keycaps shaped to cradle your fingertips\",\"connectivity\":\"Easy-Switch Bluetooth Low Energy + Logi Bolt USB receiver (up to 3 devices)\",\"battery\":\"Up to 3 years battery life on 2x AAA batteries included\",\"certification\":\"Certified by United States Ergonomics for posture and strain relief\"}",
    "createdAt": "2026-11-03T17:56:32.136396Z",
    "updatedAt": "2026-11-03T17:56:32.136396Z",
    "stockQuantity": 45
  },
  {
    "id": 2571,
    "name": "HyperX Alloy Origins Core Tenkeyless Mechanical Keyboard",
    "brand": "HyperX",
    "category": "Accessories",
    "price": 8490,
    "stock": 38,
    "rating": 4.8,
    "reviewCount": 165,
    "imageUrl": "https://images.unsplash.com/photo-1541140532154-b024d705b909?w=800&auto=format&fit=crop",
    "description": "Ultra-compact, robust tenkeyless keyboard featuring a full aircraft-grade aluminum unibody. Equipped with custom HyperX Red linear mechanical switches with exposed LEDs for radiant dynamic RGB backlighting and game mode customization.",
    "specifications": "{\"chassis\":\"Full aircraft-grade aluminum unibody construction\",\"switches\":\"HyperX Red Linear mechanical switches (45g force, 1.8mm actuation, 80M clicks)\",\"lighting\":\"Exposed switch LEDs with per-key dynamic RGB and 3 onboard profiles\",\"cable\":\"Detachable braided USB-C cable for easy portability\",\"pollingRate\":\"1000Hz polling rate with 100% anti-ghosting and full N-key rollover\"}",
    "createdAt": "2026-11-03T17:56:32.144834Z",
    "updatedAt": "2026-11-03T17:56:32.144834Z",
    "stockQuantity": 38
  }
];

function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState('catalogue'); // 'catalogue', 'ai-advisor', 'compare', 'admin'
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // User & Auth State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState('login');
  const [authNotice, setAuthNotice] = useState('');
  const [pendingCheckoutItem, setPendingCheckoutItem] = useState(null);

  // Dedicated User-Scoped Cart Helpers
  const getCartStorageKey = (user) => {
    return user?.id ? `cart_user_${user.id}` : 'cart_guest';
  };

  const loadUserCart = (user) => {
    try {
      const key = getCartStorageKey(user);
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  // Cart State (stored in localStorage isolated per user)
  const [cart, setCart] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;
      return loadUserCart(parsedUser);
    } catch {
      return [];
    }
  });
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentItems, setPaymentItems] = useState([]);

  // Wishlist State (list of product IDs)
  const [wishlistIds, setWishlistIds] = useState([]);

  // Compare State (list of product IDs)
  const [compareList, setCompareList] = useState([]);

  // Products Catalogue State
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(FALLBACK_PRODUCTS.length);
  const [currency, setCurrency] = useState('INR'); // Default to INR (₹)

  // Notification Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Sync current cart to localStorage under active user's dedicated key
  useEffect(() => {
    try {
      const key = getCartStorageKey(currentUser);
      localStorage.setItem(key, JSON.stringify(cart));
    } catch (err) {
      console.error('Failed to sync cart:', err);
    }
  }, [cart, currentUser]);

  // Load dedicated cart & wishlist when active user changes (login, logout, account switch)
  useEffect(() => {
    // Clean up any legacy un-scoped 'cart' key
    localStorage.removeItem('cart');

    // 1. Load the active user's dedicated cart
    const userCart = loadUserCart(currentUser);
    setCart(userCart);

    // 2. Load the active user's wishlist from backend
    if (currentUser) {
      wishlistApi.getAll()
        .then(res => {
          const ids = (res.data || []).map(w => w.product?.id || w.productId);
          setWishlistIds(ids);
        })
        .catch(() => setWishlistIds([]));
    } else {
      setWishlistIds([]);
    }
  }, [currentUser?.id]);

  // Fetch products from backend with filters, with fallback
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: page,
        size: 12,
        query: searchQuery?.trim() || undefined,
        category: selectedCategory || undefined,
        sortBy: sortBy || undefined
      };
      const res = await productApi.getAll(params);
      if (res.data && Array.isArray(res.data.content)) {
        setProducts(res.data.content);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements !== undefined ? res.data.totalElements : res.data.content.length);
      } else if (Array.isArray(res.data)) {
        setProducts(res.data);
        setTotalPages(1);
        setTotalElements(res.data.length);
      } else {
        // Backend didn't return matches or is empty; use verified client-side fallback
        applyFallbackFilter();
      }
    } catch (err) {
      console.warn('Backend API not responding, using smart fallback catalog:', err.message);
      applyFallbackFilter();
    } finally {
      setLoading(false);
    }
  };

  const applyFallbackFilter = () => {
    let filtered = [...FALLBACK_PRODUCTS];
    if (selectedCategory) {
      const lowerCat = selectedCategory.toLowerCase();
      if (lowerCat.includes('speaker') || lowerCat.includes('audio') || lowerCat.includes('headphone')) {
        filtered = filtered.filter(p => 
          (p.category || '').toLowerCase().includes('audio') ||
          (p.name || '').toLowerCase().includes('speaker') ||
          (p.name || '').toLowerCase().includes('headphone') ||
          (p.name || '').toLowerCase().includes('earbud') ||
          (p.name || '').toLowerCase().includes('soundbar')
        );
      } else if (lowerCat.includes('charger') || lowerCat.includes('power')) {
        filtered = filtered.filter(p => 
          (p.name || '').toLowerCase().includes('charger') ||
          (p.name || '').toLowerCase().includes('power') ||
          (p.category || '').toLowerCase().includes('power') ||
          (p.category || '').toLowerCase().includes('accessories') ||
          (p.description || '').toLowerCase().includes('charger')
        );
      } else if (lowerCat.includes('phone')) {
        filtered = filtered.filter(p => (p.category || '').toLowerCase().includes('smartphones'));
      } else if (lowerCat.includes('laptop')) {
        filtered = filtered.filter(p => (p.category || '').toLowerCase().includes('laptops'));
      } else if (lowerCat.includes('watch')) {
        filtered = filtered.filter(p => (p.category || '').toLowerCase().includes('smartwatches') || (p.name || '').toLowerCase().includes('watch'));
      } else if (lowerCat.includes('tablet')) {
        filtered = filtered.filter(p => (p.category || '').toLowerCase().includes('tablets') || (p.name || '').toLowerCase().includes('pad'));
      } else if (lowerCat.includes('camera') || lowerCat.includes('gaming')) {
        filtered = filtered.filter(p => (p.category || '').toLowerCase().includes('camera') || (p.category || '').toLowerCase().includes('gaming'));
      } else if (lowerCat.includes('tv') || lowerCat.includes('television') || lowerCat.includes('theatre')) {
        filtered = filtered.filter(p => (p.category || '').toLowerCase().includes('tv') || (p.category || '').toLowerCase().includes('entertainment'));
      } else if (lowerCat.includes('accessories') || lowerCat.includes('accessory')) {
        filtered = filtered.filter(p => (p.category || '').toLowerCase().includes('accessories') || (p.category || '').toLowerCase().includes('power'));
      } else {
        filtered = filtered.filter(p => (p.category || '').toLowerCase().includes(lowerCat));
      }
    }
    if (searchQuery && searchQuery.trim()) {
      const cleanQ = searchQuery.toLowerCase().trim();
      const isPhoneTarget = (cleanQ.includes('phone') || cleanQ.includes('mobile') || cleanQ.includes('smartphone')) && !cleanQ.includes('headphone') && !cleanQ.includes('earphone');
      const isLaptopTarget = (cleanQ.includes('laptop') || cleanQ.includes('macbook') || cleanQ.includes('notebook')) && !cleanQ.includes('charger') && !cleanQ.includes('bag');
      const isWatchTarget = (cleanQ.includes('smartwatch') || cleanQ.includes('watches') || cleanQ.includes('watch')) && !cleanQ.includes('strap');

      if (isPhoneTarget) {
        filtered = filtered.filter(p => (p.category || '').toLowerCase().includes('smartphone'));
      } else if (isLaptopTarget) {
        filtered = filtered.filter(p => (p.category || '').toLowerCase().includes('laptop'));
      } else if (isWatchTarget) {
        filtered = filtered.filter(p => (p.category || '').toLowerCase().includes('smartwatch'));
      }

      const allTokens = cleanQ.split(/\s+/).filter(t => t.length > 0);
      const stopWords = new Set(["with", "under", "below", "above", "for", "in", "the", "a", "an", "and", "or", "of", "to", "best", "good", "top"]);
      const significantTokens = allTokens.filter(t => !stopWords.has(t) && t.length > 1);
      const targetTokens = significantTokens.length > 0 ? significantTokens : allTokens;

      // Score each product based on token density and category intent
      const scored = filtered.map(product => {
        const nameLower = (product.name || '').toLowerCase();
        const brandLower = (product.brand || '').toLowerCase();
        const catLower = (product.category || '').toLowerCase();
        const descLower = (product.description || '').toLowerCase();
        const specLower = (product.specifications || '').toLowerCase();
        const combined = `${nameLower} ${brandLower} ${catLower} ${descLower} ${specLower}`;

        if (isPhoneTarget && (catLower.includes('audio') || nameLower.includes('headphone') || nameLower.includes('earphone'))) {
          return { product, score: 0 };
        }

        let searchName = nameLower;
        let searchCat = catLower;
        let searchDesc = descLower;
        let searchCombined = combined;
        if (cleanQ.includes('phone')) {
          searchName = searchName.replace(/\b(head|ear)phones?\b/gi, '');
          searchCat = searchCat.replace(/\b(head|ear)phones?\b/gi, '');
          searchDesc = searchDesc.replace(/\b(head|ear)phones?\b/gi, '');
          searchCombined = searchCombined.replace(/\b(head|ear)phones?\b/gi, '');
        }

        let score = 0;

        if (isPhoneTarget && catLower.includes('smartphone')) {
          score += 300;
        } else if (isLaptopTarget && catLower.includes('laptop')) {
          score += 300;
        } else if (isWatchTarget && catLower.includes('smartwatch')) {
          score += 300;
        }

        // Exact match bonuses
        if (searchName === cleanQ) score += 250;
        else if (searchName.startsWith(cleanQ)) score += 180;
        else if (searchName.includes(cleanQ)) score += 120;
        else if (searchCombined.includes(cleanQ)) score += 60;

        // Brand match
        if (brandLower === cleanQ) score += 100;
        else if (brandLower.includes(cleanQ)) score += 50;

        // Category match
        if (searchCat === cleanQ) score += 90;
        else if (searchCat.includes(cleanQ)) score += 45;

        // Token occurrences
        let primaryMatches = 0;
        let tokensMatched = 0;
        targetTokens.forEach(tok => {
          if (tok.length > 1) {
            let tokenName = nameLower;
            let tokenCat = catLower;
            let tokenDesc = descLower;
            if (tok === 'phone' || tok === 'phones' || tok === 'mobile' || tok === 'mobiles') {
              tokenName = tokenName.replace(/\b(head|ear)phones?\b/gi, '');
              tokenCat = tokenCat.replace(/\b(head|ear)phones?\b/gi, '');
              tokenDesc = tokenDesc.replace(/\b(head|ear)phones?\b/gi, '');
            }

            let matched = false;
            if (tokenName.includes(tok)) { score += 40; primaryMatches++; matched = true; }
            if (brandLower.includes(tok)) { score += 30; primaryMatches++; matched = true; }
            if (tokenCat.includes(tok)) { score += 25; primaryMatches++; matched = true; }
            if (specLower.includes(tok)) { score += 10; matched = true; }
            if (tokenDesc.includes(tok)) { score += 3; matched = true; }
            if (matched) tokensMatched++;
          }
        });

        // Multi-token completeness bonus
        if (targetTokens.length > 1 && tokensMatched === targetTokens.length) {
          score += 140;
        } else if (targetTokens.length > 1 && tokensMatched > 1) {
          score += 40;
        }

        // Secondary description noise penalty
        if (primaryMatches === 0) {
          score = Math.max(0, score - 30);
        }

        if ((cleanQ.includes('bud') || cleanQ.includes('earbud') || cleanQ.includes('headphone') || cleanQ.includes('audio') || cleanQ.includes('speaker')) && catLower.includes('audio')) {
          score += 35;
        }
        if ((cleanQ.includes('phone') || cleanQ.includes('mobile') || cleanQ.includes('galaxy') || cleanQ.includes('iphone') || cleanQ.includes('pixel')) && catLower.includes('smartphone')) {
          score += 35;
        }
        if ((cleanQ.includes('laptop') || cleanQ.includes('macbook') || cleanQ.includes('thinkpad') || cleanQ.includes('notebook')) && catLower.includes('laptop')) {
          score += 35;
        }
        if ((cleanQ.includes('watch') || cleanQ.includes('band')) && catLower.includes('smartwatch')) {
          score += 35;
        }
        if ((cleanQ.includes('tab') || cleanQ.includes('tablet') || cleanQ.includes('ipad')) && catLower.includes('tablet')) {
          score += 35;
        }
        if ((cleanQ.includes('tv') || cleanQ.includes('television') || cleanQ.includes('oled') || cleanQ.includes('bravia')) && catLower.includes('tv')) {
          score += 35;
        }
        if ((cleanQ.includes('camera') || cleanQ.includes('lens') || cleanQ.includes('dslr')) && catLower.includes('camera')) {
          score += 35;
        }
        if ((cleanQ.includes('drone') || cleanQ.includes('gimbal') || cleanQ.includes('dji')) && catLower.includes('drone')) {
          score += 35;
        }
        if ((cleanQ.includes('charger') || cleanQ.includes('power bank') || cleanQ.includes('powerbank')) && (catLower.includes('power') || nameLower.includes('charger') || nameLower.includes('power bank'))) {
          score += 35;
        }

        if (product.rating) score += Math.round(product.rating * 2);

        return { product, score };
      });

      // Strict noise elimination
      const maxScore = Math.max(0, ...scored.map(s => s.score));
      let cutoff = 15;
      if (maxScore >= 80) {
        cutoff = Math.max(45, Math.round(maxScore * 0.35));
      }
      const matched = scored.filter(item => item.score >= cutoff);
      if (matched.length > 0) {
        matched.sort((a, b) => b.score - a.score);
        filtered = matched.map(item => item.product);
      } else {
        filtered = [];
      }
    }

    if (sortBy === 'price_asc') filtered.sort((a, b) => a.price - b.price);
    if (sortBy === 'price_desc') filtered.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating_desc') filtered.sort((a, b) => b.rating - a.rating);

    setProducts(filtered);
    setTotalPages(Math.max(1, Math.ceil(filtered.length / 12)));
    setTotalElements(filtered.length);
  };


  // Live debounced search & filter effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, sortBy, page, activeTab]);

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setPage(0);
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    setActiveTab('catalogue');
    setPage(0);
    if (selectedCategory) {
      setSelectedCategory('');
    }
  };

  // Cart operations
  const handleAddToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`Added successfully! "${product.name}" has been added to your cart.`, 'success');

    if (currentUser?.id) {
      interactionApi.log({
        userId: currentUser.id,
        productId: product.id,
        interactionType: 'CART_ADD'
      }).catch(() => {});
    }
  };

  const handleUpdateCartQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const handleRemoveCartItem = (productId) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Payment checkout & Buy Now handlers (Strictly requires Authentication)
  const handleBuyNow = (product) => {
    if (!currentUser) {
      setPendingCheckoutItem(product);
      setAuthNotice(`Please sign in or create an account to purchase "${product.name}".`);
      setAuthInitialMode('login');
      setAuthModalOpen(true);
      showToast('Authentication required: Please sign in or sign up to buy this product.', 'info');
      return;
    }
    setPaymentItems([{ product, quantity: 1 }]);
    setIsPaymentOpen(true);
  };

  const handleProceedToPaymentFromCart = () => {
    if (!currentUser) {
      setPendingCheckoutItem('cart');
      setCartDrawerOpen(false);
      setAuthNotice('Please sign in or create an account to complete your checkout.');
      setAuthInitialMode('login');
      setAuthModalOpen(true);
      showToast('Authentication required: Please sign in to proceed to checkout.', 'info');
      return;
    }
    if (cart.length === 0) return;
    setPaymentItems(cart);
    setCartDrawerOpen(false);
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = (orderData) => {
    setCart([]);
    showToast(`🎉 Payment authorized & order placed successfully! Order #${orderData?.id || 'ORD-9821'}`, 'success');
  };

  // Wishlist toggle
  const handleToggleWishlist = async (productId) => {
    if (!currentUser) {
      setAuthInitialMode('login');
      setAuthModalOpen(true);
      return;
    }
    try {
      const isWishlisted = wishlistIds.includes(productId);
      if (isWishlisted) {
        await wishlistApi.remove(productId);
        setWishlistIds(prev => prev.filter(id => id !== productId));
        showToast('Removed from wishlist');
      } else {
        await wishlistApi.add(productId);
        setWishlistIds(prev => [...prev, productId]);
        showToast('Added to your wishlist!');
      }
    } catch {
      showToast('Could not update wishlist', 'danger');
    }
  };

  // Compare toggle
  const handleToggleCompare = (productId) => {
    if (compareList.includes(productId)) {
      setCompareList(prev => prev.filter(id => id !== productId));
      showToast('Removed from comparison list');
    } else {
      if (compareList.length >= 4) {
        showToast('Maximum 4 products can be compared at once', 'danger');
        return;
      }
      setCompareList(prev => [...prev, productId]);
      showToast('Added to comparison list! Click Compare tab to view');
    }
  };

  const handleOpenProductDetails = (id) => {
    setSelectedProductId(id);
    setDetailsModalOpen(true);

    if (currentUser?.id) {
      interactionApi.log({
        userId: currentUser.id,
        productId: id,
        interactionType: 'VIEW'
      }).catch(() => {});
    }
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    const userCart = loadUserCart(user);
    setCart(userCart);
    setAuthModalOpen(false);
    setAuthNotice('');

    // Resume checkout automatically if user was attempting to purchase before signing in
    if (pendingCheckoutItem) {
      if (pendingCheckoutItem === 'cart') {
        const itemsToPay = userCart.length > 0 ? userCart : cart;
        if (itemsToPay.length > 0) {
          setPaymentItems(itemsToPay);
          setIsPaymentOpen(true);
          showToast(`Welcome back, ${user.username}! Resuming your secure checkout...`, 'success');
        } else {
          showToast(`Welcome back, ${user.username}!`, 'success');
        }
      } else {
        const targetProd = pendingCheckoutItem;
        setPaymentItems([{ product: targetProd, quantity: 1 }]);
        setIsPaymentOpen(true);
        showToast(`Welcome back, ${user.username}! Resuming your purchase of "${targetProd.name}"...`, 'success');
      }
      setPendingCheckoutItem(null);
    } else {
      showToast(`Welcome back, ${user.username}!`, 'success');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    setCurrentUser(null);
    const guestCart = loadUserCart(null);
    setCart(guestCart);
    setWishlistIds([]);
    setIsPaymentOpen(false);
    setPaymentItems([]);
    setPendingCheckoutItem(null);
    setAuthNotice('');
    if (activeTab === 'admin') {
      setActiveTab('catalogue');
    }
    showToast('Signed out successfully');
  };

  const categories = [
    { label: 'All Gadgets', value: '' },
    { label: 'Smartphones', value: 'Smartphones' },
    { label: 'Laptops', value: 'Laptops' },
    { label: 'Audio & Headphones', value: 'Audio & Headphones' },
    { label: 'Watches', value: 'Smartwatches' },
    { label: 'Tablets', value: 'Tablets' },
    { label: 'Cameras', value: 'Cameras & Gaming' },
    { label: 'TV', value: 'Smart TVs & Home Entertainment' },
    { label: 'Accessories', value: 'Accessories' }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 2000,
            background: toast.type === 'danger' ? '#ef4444' : '#0f172a',
            color: '#ffffff',
            padding: '0.85rem 1.4rem',
            borderRadius: '12px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.35)',
            border: toast.type === 'danger' ? '1px solid #f87171' : '1px solid #334155',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.92rem',
            fontWeight: 600,
            animation: 'fadeIn 0.25s ease'
          }}
        >
          <CheckCircle2 size={20} style={{ color: '#22c55e', flexShrink: 0 }} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cart.reduce((sum, it) => sum + it.quantity, 0)}
        cartTotal={cart.reduce((sum, it) => sum + ((it.product?.price || 0) * it.quantity), 0)}
        wishlistCount={wishlistIds.length}
        compareCount={compareList.length}
        currentUser={currentUser}
        onOpenCart={() => setCartDrawerOpen(true)}
        onOpenProfile={(mode = 'login') => {
          const sanitizedMode = (typeof mode === 'string' && (mode === 'register' || mode === 'login' || mode === 'profile')) ? mode : 'login';
          setAuthNotice('');
          setAuthInitialMode(sanitizedMode);
          setAuthModalOpen(true);
        }}
        searchQuery={searchQuery}
        setSearchQuery={handleSearchChange}
        onSearch={handleSearchSubmit}
      />

      {/* Main App Container */}
      <main style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
        {/* VIEW 1: CATALOGUE / HOME */}
        {activeTab === 'catalogue' && (
          <div>
            {/* Dynamic Header: Search Results vs Smart Electronics Showcase */}
            {searchQuery && searchQuery.trim() ? (
              <div style={{ textAlign: 'center', margin: '0.75rem 0 1.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.9rem', color: '#ff9800' }}>🔍</span>
                  <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#ffffff', letterSpacing: '1.2px', textTransform: 'uppercase', margin: 0, fontFamily: 'var(--font-display)' }}>
                    Search Results: &ldquo;{searchQuery}&rdquo;
                  </h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
                    Found <strong>{totalElements}</strong> matching electronic gadgets
                  </span>
                  <button
                    onClick={() => { setSearchQuery(''); setPage(0); }}
                    style={{
                      background: 'rgba(239, 68, 68, 0.18)',
                      color: '#f87171',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      padding: '3px 12px',
                      borderRadius: '14px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    ✕ Clear Search
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', margin: '0.75rem 0 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.9rem', color: '#ff9800' }}>⚡</span>
                <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#ffffff', letterSpacing: '1.5px', textTransform: 'uppercase', margin: 0, fontFamily: 'var(--font-display)' }}>
                  Smart Electronics Showcase
                </h2>
              </div>
            )}


            {/* Centered White Showcase Container matching the screenshot */}
            <div className="showcase-container">
              {/* Category Pills Header Section */}
              <div style={{ marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {categories.map(cat => {
                    const isSelected = selectedCategory === cat.value;
                    return (
                      <button
                        key={cat.value}
                        className="showcase-category-pill"
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: isSelected ? 600 : 500,
                          padding: '0.35rem 0.85rem',
                          borderRadius: '20px',
                          border: isSelected ? '1px solid #4338ca' : '1px solid #cbd5e1',
                          background: isSelected ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : '#f8fafc',
                          color: isSelected ? '#ffffff' : '#334155',
                          cursor: 'pointer',
                          boxShadow: isSelected ? '0 2px 8px rgba(79, 70, 229, 0.35)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                        onClick={() => { setSelectedCategory(cat.value); setPage(0); }}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toolbar: Currency Toggle, Showing Item Count & Sorting Dropdown */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
                paddingTop: '0.75rem',
                paddingBottom: '0.75rem',
                borderTop: '1px solid #f1f5f9',
                borderBottom: '1px solid #f1f5f9',
                marginBottom: '1.25rem'
              }}>
                {/* Left: Currency Toggle & Active Filter Indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                  {/* Currency Switcher */}
                  <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '16px', padding: '2px', border: '1px solid #cbd5e1' }}>
                    <button
                      onClick={() => setCurrency('USD')}
                      style={{
                        padding: '3px 10px',
                        borderRadius: '14px',
                        border: 'none',
                        background: currency === 'USD' ? '#ff9800' : 'transparent',
                        color: currency === 'USD' ? '#fff' : '#64748b',
                        fontWeight: 700,
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}
                    >
                      $ USD
                    </button>
                    <button
                      onClick={() => setCurrency('INR')}
                      style={{
                        padding: '3px 10px',
                        borderRadius: '14px',
                        border: 'none',
                        background: currency === 'INR' ? '#ff9800' : 'transparent',
                        color: currency === 'INR' ? '#fff' : '#64748b',
                        fontWeight: 700,
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}
                    >
                      ₹ INR
                    </button>
                  </div>

                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Showing <strong>{totalElements}</strong> items
                  </span>

                  {selectedCategory && (
                    <span
                      onClick={() => { setSelectedCategory(''); setPage(0); }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.75rem',
                        background: '#e0e7ff',
                        color: '#3730a3',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: 500
                      }}
                      title="Clear category filter"
                    >
                      Category: {categories.find(c => c.value === selectedCategory)?.label || selectedCategory} ✕
                    </span>
                  )}
                </div>

                {/* Right: Sort Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <select
                    className="form-control"
                    style={{
                      width: 'auto',
                      fontSize: '0.82rem',
                      padding: '0.35rem 0.85rem',
                      borderColor: '#cbd5e1',
                      color: '#1e293b',
                      borderRadius: '8px',
                      background: '#ffffff'
                    }}
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); setPage(0); }}
                  >
                    <option value="">Default Sorting</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating_desc">Highest Rated</option>
                  </select>
                </div>
              </div>

              {/* Product Grid (4 columns) */}
              {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                  <Sparkles size={36} className="spin text-primary" style={{ marginBottom: '1rem' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>Loading verified products...</h3>
                </div>
              ) : products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3.5rem 2rem', background: '#fafafa', borderRadius: 'var(--radius-lg)', border: '1px dashed #cbd5e1' }}>
                  <Search size={44} style={{ color: '#94a3b8', marginBottom: '1rem' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1e293b' }}>
                    {searchQuery
                      ? selectedCategory
                        ? `No gadgets found in "${categories.find(c => c.value === selectedCategory)?.label || selectedCategory}" matching "${searchQuery}"`
                        : `No electronic gadgets matched "${searchQuery}"`
                      : 'No products matched your criteria'}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '0.4rem', maxWidth: '480px', margin: '0.4rem auto 1.25rem' }}>
                    Try checking for spelling errors, using broader keywords, or searching across all categories.
                  </p>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {selectedCategory && (
                      <button
                        className="btn btn-secondary"
                        style={{
                          background: '#e0e7ff',
                          color: '#4338ca',
                          border: '1px solid #c7d2fe',
                          padding: '0.55rem 1.25rem',
                          fontWeight: 600,
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                        onClick={() => { setSelectedCategory(''); setPage(0); }}
                      >
                        Search across All Categories
                      </button>
                    )}
                    <button
                      className="btn btn-primary"
                      style={{
                        background: '#0d2757',
                        color: '#ffffff',
                        border: '1px solid #3b82f6',
                        padding: '0.55rem 1.4rem',
                        fontWeight: 600,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(13, 39, 87, 0.4)'
                      }}
                      onClick={() => { setSearchQuery(''); setSelectedCategory(''); setSortBy(''); setPage(0); }}
                    >
                      Reset All Filters
                    </button>
                  </div>
                </div>
              ) : (
                <div className="product-grid">
                  {products.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      currency={currency}
                      onOpenDetails={handleOpenProductDetails}
                      onAddToCart={handleAddToCart}
                      onBuyNow={handleBuyNow}
                      isWishlisted={wishlistIds.includes(product.id)}
                      onToggleWishlist={handleToggleWishlist}
                      isCompared={compareList.includes(product.id)}
                      onToggleCompare={handleToggleCompare}
                    />
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                  <button
                    className="btn btn-secondary"
                    disabled={page === 0}
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                  >
                    Previous
                  </button>
                  <span style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', fontSize: '0.85rem', color: '#64748b' }}>
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    className="btn btn-secondary"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* Compact AI Assistant Callout Banner */}
            <div style={{ maxWidth: '1200px', margin: '0 auto 2rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px', padding: '1.25rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a5b4fc' }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>Looking for expert personalized advice?</div>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Ask our Agentic Shopping Advisor to compare specs, find deals, and recommend the best products for your exact needs.</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-primary" onClick={() => setActiveTab('ai-advisor')} style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }}>
                  AI Advisor
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: AGENTIC AI SHOPPING ADVISOR */}
        {activeTab === 'ai-advisor' && (
          <div style={{ height: 'calc(100vh - 130px)', minHeight: '520px', maxHeight: 'calc(100vh - 130px)', display: 'flex', flexDirection: 'column' }}>
            <AIAdvisorChat
              currentUser={currentUser}
              products={products}
              allProducts={FALLBACK_PRODUCTS}
              onOpenProductDetails={handleOpenProductDetails}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />
          </div>
        )}

        {/* VIEW 4: SIDE-BY-SIDE PRODUCT COMPARISON */}
        {activeTab === 'compare' && (
          <ComparisonView
            compareList={compareList}
            onRemoveFromCompare={(id) => setCompareList(prev => prev.filter(x => x !== id))}
            onAddToCart={handleAddToCart}
            onOpenDetails={handleOpenProductDetails}
            onClearCompare={() => setCompareList([])}
          />
        )}

        {/* VIEW 5: ADMIN PANEL */}
        {activeTab === 'admin' && (
          <AdminPanel currentUser={currentUser} initialProducts={products} fallbackProducts={FALLBACK_PRODUCTS} />
        )}
      </main>

      {/* Floating Compare Dock Bar */}
      {compareList.length > 0 && (
        <aside
          aria-label="Product comparison dock"
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1100,
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            backdropFilter: 'blur(16px)',
            borderRadius: '16px',
            padding: '10px 18px',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            maxWidth: '92vw',
            animation: 'fadeIn 0.25s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Layers size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                Compare ({compareList.length}/4)
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {compareList.length < 2 ? 'Select 1 more to compare' : 'Ready for side-by-side specs'}
              </div>
            </div>
          </div>

          {/* Selected Product Badges / Thumbnails */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }}>
            {compareList.map(id => {
              const prod = products.find(p => p.id === id) || FALLBACK_PRODUCTS.find(p => p.id === id);
              return (
                <div
                  key={id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    padding: '4px 8px 4px 6px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    fontSize: '0.78rem'
                  }}
                >
                  {prod?.imageUrl && (
                    <img src={prod.imageUrl} alt="" style={{ width: '22px', height: '22px', objectFit: 'contain', borderRadius: '4px' }} />
                  )}
                  <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#e2e8f0' }}>
                    {prod?.name?.split(' ')[0] || `Product ${id}`}
                  </span>
                  <button
                    onClick={() => handleToggleCompare(id)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0 2px', display: 'flex' }}
                    title="Remove"
                  >
                    <X size={13} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('compare')}
              className="btn btn-primary"
              style={{ fontSize: '0.82rem', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
            >
              Compare Now <ArrowRight size={14} />
            </button>
            <button
              onClick={() => setCompareList([])}
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 10px', color: 'var(--text-muted)' }}
              title="Clear comparison list"
            >
              Clear
            </button>
          </div>
        </aside>
      )}


      {/* Product Details Modal */}
      <ProductDetailsModal
        productId={selectedProductId}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        currentUser={currentUser}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        isWishlisted={wishlistIds.includes(selectedProductId)}
        onToggleWishlist={handleToggleWishlist}
        isCompared={compareList.includes(selectedProductId)}
        onToggleCompare={handleToggleCompare}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        currentUser={currentUser}
        onProceedToPayment={handleProceedToPaymentFromCart}
        onOpenAuth={() => { 
          setAuthInitialMode('login');
          setCartDrawerOpen(false); 
          setAuthModalOpen(true); 
        }}
      />

      {/* User Profile / Auth Modal */}
      <UserProfileModal
        isOpen={authModalOpen}
        initialMode={authInitialMode}
        authNotice={authNotice}
        onClose={() => { setAuthModalOpen(false); setAuthNotice(''); }}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        onOpenProductDetails={handleOpenProductDetails}
      />

      {/* 256-Bit Encrypted Secure Payment & Checkout Gateway */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        items={paymentItems}
        currentUser={currentUser}
        currency={currency}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}

export default App;