import json

import logging

import os

import re

from typing import Any, Dict, List, Optional

try:
    from dotenv import load_dotenv  # type: ignore # pyrefly: ignore[missing-import]
except (ImportError, ModuleNotFoundError):
    def load_dotenv(*args, **kwargs): pass

import agent_tools



# Graceful optional imports for LLM providers

try:

    from groq import Groq  # type: ignore # pyrefly: ignore[missing-import]

except (ImportError, ModuleNotFoundError):

    Groq = None



try:

    from openai import OpenAI  # type: ignore # pyrefly: ignore[missing-import]

except (ImportError, ModuleNotFoundError):

    OpenAI = None



load_dotenv()



logger = logging.getLogger("agent_orchestrator")

logging.basicConfig(level=logging.INFO)



# In-memory session context for conversation state

CONVERSATION_SESSIONS: Dict[str, Dict[str, Any]] = {}



class AgentOrchestrator:

    def __init__(self):

        self.groq_api_key = os.getenv("GROQ_API_KEY", "").strip()

        self.openai_api_key = os.getenv("OPENAI_API_KEY", "").strip()

        self.llm_model = os.getenv("LLM_MODEL", "openai/gpt-oss-20b" if self.groq_api_key else "gpt-4o-mini")



        self.client: Any = None

        self.provider: Optional[str] = None



        if self.groq_api_key and Groq is not None:

            try:

                self.client = Groq(api_key=self.groq_api_key, max_retries=1, timeout=4.0)

                self.provider = "Groq"

                logger.info(f"Initialized LLM provider: Groq with model: {self.llm_model}")

            except Exception as e:

                logger.warning(f"Failed to initialize Groq client: {e}")

        elif self.openai_api_key and OpenAI is not None:

            try:

                self.client = OpenAI(api_key=self.openai_api_key)

                self.provider = "OpenAI"

                logger.info(f"Initialized LLM provider: OpenAI with model: {self.llm_model}")

            except Exception as e:

                logger.warning(f"Failed to initialize OpenAI client: {e}")



    def detect_non_electronics(self, text: str) -> Optional[str]:
        """
        Detects if user message is asking for non-electronics (cosmetics, skin care, fashion, groceries, etc.)
        Returns the non-electronics category name, or None if it's an electronics query.
        """
        t = text.lower()

        # Guard: Exclude queries that explicitly mention genuine electronics terms
        electronics_exceptions = [
            r'\b(electric\s*(?:shaver|toothbrush|blanket)|hair\s*(?:dryer|styler)|airwrap)\b',
            r'\b(smart\s*(?:watch|scale|ring|mirror|plug|tv|home))\b',
            r'\b(laptop\s*(?:bag|sleeve|case|stand)|phone\s*(?:case|cover|holder))\b',
            r'\b(air\s*fryer|coffee\s*machine|espresso|blender|mixer|microwave)\b'
        ]
        for exc in electronics_exceptions:
            if re.search(exc, t):
                return None

        rules = [
            # Beauty, Skincare & Cosmetics
            (r'\b(skin\s*cares?|skincare|skin-care|cosmetics?|makeups?|make-up|face\s*wash|cleansers?|toners?|serums?|moisturizers?|lotions?|sunscreens?|sunblocks?|lipsticks?|lip\s*balms?|lip\s*gloss|eyeliners?|mascaras?|foundations?|concealers?|creams?|night\s*cream|day\s*cream|cold\s*cream|perfumes?|deodorants?|fragrances?|colognes?|shampoos?|conditioners?|hair\s*oils?|hair\s*care|body\s*wash|soaps?|scrubs?|sheet\s*masks?|beauty\s*products?|kajal|blush|compact\s*powder)\b', 'beauty & skin care'),

            # Fashion, Clothing & Footwear
            (r'\b(clothes?|clothing|apparels?|garments?|dresses?|shirts?|t-?shirts?|tees?|pants?|trousers?|jeans?|jackets?|hoodies?|sweaters?|coats?|suits?|blazers?|sarees?|kurtas?|kurtis?|lehengas?|skirts?|shorts?|underwears?|socks?|shoes?|sneakers?|boots?|sandals?|slippers?|footwear|heels?|crocs?|belts?|wallets?|handbags?|purses?|tote\s*bags?|luggage|suitcases?|jewelr(?:y|ies)|necklaces?|rings?\s*(?:gold|diamond|silver)?|earrings?|bracelets?|bangles?|fashion)\b', 'clothing & fashion'),

            # Food, Groceries & Daily Consumables
            (r'\b(grocer(?:y|ies)|foods?|snacks?|fruits?|vegetables?|veggies|apples?|bananas?|oranges?|potatoes?|tomatoes?|rice|wheat|flour|atta|dal|pulses?|bread|milk|cheeses?|butter|yogurt|curd|eggs?|meats?|chickens?|fish|seafood|mutton|prawns?|cooking\s*oil|mustard\s*oil|sunflower\s*oil|ghee|spices?|masala|sugar|salt|coffee\s*(?:beans?|powder)?|tea\s*(?:leaves?|powder|bags?)?|chocolates?|cand(?:y|ies)|biscuits?|cookies?|beverages?|soft\s*drinks?|juices?|sodas?|beers?|wines?|alcohol)\b', 'food & groceries'),

            # Furniture, Home Decor & Bedding
            (r'\b(furnitures?|sofas?|couches?|beds?|cots?|mattresses?|pillows?|blankets?|bedsheets?|curtains?|dining\s*tables?|study\s*tables?|coffee\s*tables?|chairs?\s*(?:wooden|dining|plastic)?|tables?\s*(?:wooden|dining)?|wardrobes?|cupboards?|closets?|bookshelves?|carpets?|rugs?|mats?|cushions?)\b', 'furniture & home decor'),

            # Medicines, Pharmacy & Health Consumables
            (r'\b(medicines?|pharmacy|drugs?|pills?|syrups?|ointments?|antibiotics?|painkillers?|paracetamol|aspirin|vitamins?\s*(?:tablets?|capsules?|supplements?)?|protein\s*powders?|whey\s*protein|bandages?|first\s*aid|cough\s*syrup)\b', 'medicines & healthcare'),

            # Books & Physical Stationery
            (r'\b(novels?|fiction|non-fiction|textbooks?|story\s*books?|physical\s*books?|paperbacks?|hardcovers?|magazines?|comics?|mangas?|stationer(?:y|ies)|pens?|pencils?|erasers?|rulers?|diar(?:y|ies)|sticky\s*notes?|crayons?|sketchbooks?)\b', 'books & stationery'),

            # Toys, Baby & Pet Supplies
            (r'\b(toys?|board\s*games?|dolls?|action\s*figures?|lego|puzzles?|baby\s*wipes?|diapers?|pampers?|baby\s*food|pet\s*food|dog\s*food|cat\s*food|pedigree|whiskas?)\b', 'toys & pet supplies'),

            # Vehicles & Real Estate
            (r'\b(cars?\s*(?:sale|buy|used|new)?|motorcycles?|bikes?\s*(?:petrol|mountain|gear)?|bicycles?|scooters?\s*(?:petrol)?|apartments?|flats?\s*for\s*(?:sale|rent)|houses?\s*for\s*(?:sale|rent)|plots?|lands?\s*for\s*sale|real\s*estate)\b', 'automobiles & real estate')
        ]

        for pattern, cat_name in rules:
            if re.search(pattern, t):
                return cat_name

        return None

    def extract_requirements(self, message: str, session: Dict[str, Any]) -> Dict[str, Any]:

        """

        Extract structured shopping requirements from natural language.

        Preserves active context from conversation memory.

        """

        text = message.lower()



        # 1. Primary Device Categories (High Priority - Always evaluate primary device before component specs)

        detected_category = None

        

        # Primary Devices & High Priority Audio/Wearables
        # Audio & Headphones evaluated FIRST to strictly avoid "headphones"/"earphones" matching "phone"
        if re.search(r'\b(audio|bluetooth(?:\s*(?:speakers?|audio|devices?|headphones?|earphones?|earbuds?))?|speakers?|soundbars?|earphones?|earbuds?|buds?|headphones?|headsets?|airpods?|ear\s*phones?|ear\s*buds?|head\s*phones?|tws|neckbands?|iems?|soundcore|airdopes)\b', text):

            detected_category = "Audio & Headphones"

        elif re.search(r'\b(laptops?|macbooks?|thinkpads?|notebooks?|ultrabooks?|chromebooks?)\b', text):

            detected_category = "Laptops"

        elif (re.search(r'\b(smart\s*phones?|cell\s*phones?|iphones?|pixels?|galaxy\s*s\d+|redmi|iqoo|poco|vivo|oppo|xiaomi|realme|smartphones?|mobiles?|handsets?|phns?)\b', text) or re.search(r'(?<!head)(?<!ear)\b(phones?|phns?)\b', text)) and not re.search(r'\b(audio|bluetooth|earphones?|earbuds?|headphones?|speakers?|soundbars?)\b', text):

            detected_category = "Smartphones"

        elif re.search(r'\b(tablets?|ipads?|tabs?)\b', text) and not re.search(r'\b(laptop|notebook)\b', text):

            detected_category = "Tablets"

        elif re.search(r'\b(monitors?|gaming\s*monitors?|curved\s*monitor|ultrawide|ips\s*black|4k\s*monitor)\b', text):

            detected_category = "Monitors & Displays"

        elif re.search(r'\b(smart\s*tvs?|tvs?|televisions?|oled\s*tv|qled\s*tv|4k\s*tv|projectors?)\b', text):

            detected_category = "Smart TVs & Home Entertainment"

        elif re.search(r'\b(smart\s*watch(?:es)?|apple\s*watch|galaxy\s*watch|garmin|fitbit|amazfit|fire-?boltt|fastrack|boat\s*wave)\b', text):

            detected_category = "Smartwatches"

        elif re.search(r'\b(drones?|quadcopters?|aerial|fpv|mavic|dji|gimbals?|stabilizers?|osmo)\b', text):

            detected_category = "Drones & Aerial Imaging"

        elif re.search(r'\b(gaming\s*consoles?|ps5|ps4|playstations?|xbox(?:es)?|nintendo|cameras?|dslrs?|mirrorless)\b', text):

            detected_category = "Cameras & Gaming"

        elif re.search(r'\b(robot\s*vacuums?|robotic\s*vacuums?|cordless\s*vacuums?|stick\s*vacuums?|roborock|dyson\s*v15|deebot)\b', text):

            detected_category = "Robot Vacuums & Smart Cleaning"

        elif re.search(r'\b(e-?readers?|kindles?|paperwhite|remarkable|kobo|digital\s*notebooks?|boox)\b', text):

            detected_category = "E-Readers & Digital Paper"

        elif re.search(r'\b(printers?|scanners?|label\s*makers?|laser\s*printers?|ink\s*tanks?|all-?in-?one\s*printer)\b', text):

            detected_category = "Printers & Office Electronics"

        elif re.search(r'\b(dash\s*cams?|car\s*cameras?|carplay|android\s*auto|floating\s*screen|pioneer\s*dmh)\b', text):

            detected_category = "Car Electronics & Dash Cams"

        elif re.search(r'\b(vr|ar|virtual\s*reality|augmented\s*reality|spatial\s*computing|meta\s*quest|ps\s*vr2|smart\s*glasses|xreal)\b', text):

            detected_category = "AR, VR & Spatial Computing"

        elif re.search(r'\b(smart\s*rings?|oura|whoop|blood\s*pressure|health\s*station|body\s*scan|ecg)\b', text):

            detected_category = "Smart Wearables & Health Electronics"

        elif re.search(r'\b(mesh\s*wi-?fi|routers?|access\s*points?|gigabit\s*switch|wi-?fi\s*6|wi-?fi\s*6e|wi-?fi\s*7|mobile\s*hotspots?)\b', text):

            detected_category = "Networking & Wireless"

        elif re.search(r'\b(air\s*fryers?|instant\s*pots?|pressure\s*cookers?|coffee\s*machines?|espresso|blenders?|mixers?|kitchen\s*appliances?)\b', text):

            detected_category = "Kitchen & Home Appliances"

        elif re.search(r'\b(hair\s*dryers?|hair\s*stylers?|airwrap|electric\s*toothbrushes?|toothbrushes?|shavers?|trimmers?|personal\s*care|grooming)\b', text):

            detected_category = "Personal Care Electronics"

        elif re.search(r'\b(smart\s*home|smart\s*displays?|smart\s*speakers?|echo\s*show|nest\s*hub|homepod|smart\s*lights?|smart\s*plugs?)\b', text):

            detected_category = "Smart Home & Automation"

        elif re.search(r'\b(audio\s*interfaces?|scarlett|studio\s*microphones?|condenser\s*mics?|midi\s*controllers?|mpk|rodecaster|studio\s*monitors?)\b', text):

            detected_category = "Audio Production & Studio Gear"

        elif re.search(r'\b(power\s*banks?|portable\s*power\s*stations?|power\s*stations?|magsafe\s*chargers?|gan\s*chargers?|desktop\s*charger)\b', text):

            detected_category = "Power Banks & Portable Power"

        elif re.search(r'\b(security\s*cameras?|solar\s*camera|cctv|video\s*doorbells?|smart\s*locks?|deadbolts?|surveillance)\b', text):

            detected_category = "Smart Security & Surveillance"



        # Secondary Components & Accessories (ONLY if no primary device mentioned)

        elif re.search(r'\b(gpus?|graphics\s*cards?|motherboards?|desktop\s*processors?|pc\s*components?|standalone\s*cpus?|rtx\s*40\d\d|rx\s*\d\d\d\d)\b', text):

            detected_category = "PC & Gaming Components"

        elif re.search(r'\b(accessories|accessory|mouse|mice|standalone\s*keyboards?|cables?|cases?|covers?)\b', text):

            detected_category = "Accessories"



        # Check if user query is for non-electronics (cosmetics, fashion, food, etc.)
        non_elec_type = self.detect_non_electronics(text)
        if non_elec_type and not detected_category:
            session["active_category"] = None
            session["budget_max"] = None
            session["purpose"] = None
            session["discussed_product_ids"] = []
            session["required_features"] = []
            session["preferred_features"] = []
            return {
                "is_non_electronics": True,
                "non_electronics_type": non_elec_type,
                "category": None,
                "budget_max": None,
                "purpose": None,
                "required_features": [],
                "preferred_features": [],
                "requested_count": None
            }

        is_context_referencing = any(w in text for w in [
            "in that", "out of these", "out of those", "between these", "between them",
            "among these", "among them", "of these", "of them", "of the two", "of the three",
            "first one", "second one", "third one", "from these", "from those"
        ])

        is_explicit_new_search = bool(
            re.search(
                r'\b(?:which\s+(?:flagship\s+|best\s+)?(?:phones?|mobiles?|smartphones?|laptops?|notebooks?|macbooks?|headphones?|earbuds?|earphones?|tvs?|televisions?|monitors?|smartwatch(?:es)?|tablets?|drones?|printers?)|show\s+me|find\s+me|recommend|suggest|i\s+need|i\s+want|best\s+(?:phones?|laptops?|earbuds?|headphones?|tvs?|monitors?|tablets?)|compare|difference\s+between|vs|bluetooth)\b',
                text
            )
            and not is_context_referencing
        )

        is_category_change = detected_category is not None and detected_category != session.get("active_category")

        # Check if this query is a genuine follow-up / refinement on the active category
        is_follow_up_on_category = False
        if session.get("active_category") and not is_explicit_new_search and not is_category_change:
            is_follow_up_on_category = (
                any(w in text for w in [
                    "which", "compare", "better", "best", "vs", "difference", "in that", "out of",
                    "battery", "camera", "ram", "storage", "display", "processor", "screen",
                    "charging", "warranty", "color", "black", "blue", "white", "silver", "5g",
                    "gaming", "review", "does it", "is it", "more", "other", "next"
                ])
                or re.search(r'\b(under|below|budget|within|upto|less than)\s*(?:₹|rs\.?|inr)?\s*[0-9]+', text)
            )

        if not detected_category and not is_follow_up_on_category:
            session["active_category"] = None
            session["budget_max"] = None
            session["discussed_product_ids"] = []

        reqs: Dict[str, Any] = {
            "category": detected_category if detected_category else session.get("active_category"),
            "budget_max": None if (is_category_change or is_explicit_new_search) else session.get("budget_max"),
            "purpose": None if (is_category_change or is_explicit_new_search) else session.get("purpose"),
            "required_features": [] if (is_category_change or is_explicit_new_search) else list(session.get("required_features", [])),
            "preferred_features": [] if (is_category_change or is_explicit_new_search) else list(session.get("preferred_features", []))
        }

        if is_category_change or is_explicit_new_search or (detected_category and not is_context_referencing):
            session["discussed_product_ids"] = []
            if is_category_change:
                session["budget_max"] = None
                session["purpose"] = None
                session["required_features"] = []
                session["preferred_features"] = []

        if detected_category:
            session["active_category"] = detected_category



        # 2. Budget (Robust extraction handling Lakhs, Lacs, L, K, and standard numbers)

        clean_text_for_budget = re.sub(r'\b[248]k\s*(?:tv|display|screen|resolution|video|oled|qled|monitor)?\b', '', text, flags=re.IGNORECASE)

        clean_text_for_budget = re.sub(r'\b[0-9]+\s*(?:hz|fps|gb|tb|mb|mah|w|watts?|cm|inch|inches|mp)\b', '', clean_text_for_budget, flags=re.IGNORECASE)



        budget_val = None

        norm_btext = clean_text_for_budget.lower()

        norm_btext = re.sub(r'\bone\s*(?:lakh|lac|l)\b', '100000', norm_btext)

        norm_btext = re.sub(r'\btwo\s*(?:lakh|lac|l|lakhs)\b', '200000', norm_btext)

        norm_btext = re.sub(r'\bthree\s*(?:lakh|lac|l|lakhs)\b', '300000', norm_btext)

        norm_btext = re.sub(r'\bhalf\s*(?:a\s*)?(?:lakh|lac)\b', '50000', norm_btext)



        # A. Lakh / Lac / L notation: e.g. "under 1l", "1.5l", "2 lakh", "1.2 lac", "under 1 l"

        lakh_match = re.search(r'(?:under|below|budget|within|upto|up to|less than|max|around|approx|for|in)?\s*(?:₹|rs\.?|inr)?\s*([0-9]+(?:\.[0-9]+)?)\s*(?:lakhs?|lacs?|l)\b', norm_btext)

        if lakh_match:

            try:

                val = float(lakh_match.group(1)) * 100000.0

                if val > 0:

                    budget_val = val

            except ValueError:

                pass



        # B. K notation: e.g. "under 50k", "80k", "15.5k"

        if budget_val is None:

            k_match = re.search(r'(?:under|below|budget|within|upto|up to|less than|max|around|approx|for|in)?\s*(?:₹|rs\.?|inr)?\s*([0-9]+(?:\.[0-9]+)?)\s*k\b', norm_btext)

            if k_match:

                try:

                    val = float(k_match.group(1)) * 1000.0

                    if val > 0:

                        budget_val = val

                except ValueError:

                    pass



        # C. Standard numeric notation: e.g. "under 50000", "₹75,000", "rs 100000"

        if budget_val is None:

            num_match = re.search(r'(?:under|below|budget|within|upto|up to|less than|max|around|approx|for|in)?\s*(?:₹|rs\.?|inr)\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)\b', norm_btext)

            if not num_match:

                num_match = re.search(r'(?:under|below|budget|within|upto|up to|less than|max|around|approx)\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)\b', norm_btext)

            if num_match:

                try:

                    val = float(num_match.group(1).replace(",", ""))

                    if val > 0:

                        budget_val = val

                except ValueError:

                    pass



        if budget_val is not None:

            reqs["budget_max"] = budget_val

            session["budget_max"] = budget_val



        # 3. Purpose (Extracted strictly when mentioned in current query)

        current_purpose = None

        if any(w in text for w in ["programming", "coding", "developer", "software", "development", "vs code", "intellij"]):

            current_purpose = "programming"

        elif any(w in text for w in ["gaming", "games", "gpu", "fps", "rtx"]):

            current_purpose = "gaming"

        elif any(w in text for w in ["camera", "photography", "photos", "video", "portrait"]):

            current_purpose = "photography"

        elif any(w in text for w in ["student", "study", "studying", "college", "school"]):

            current_purpose = "studies"

        elif any(w in text for w in ["fitness", "running", "sports", "workout", "swimming", "health", "gym"]):

            current_purpose = "fitness"



        if current_purpose:

            reqs["purpose"] = current_purpose

            session["purpose"] = current_purpose

        elif is_category_change or detected_category:

            reqs["purpose"] = None

            session["purpose"] = None



        # 4. Features

        if "battery" in text or "battery life" in text:

            if "battery life" not in reqs["preferred_features"]:

                reqs["preferred_features"].append("battery life")

        if "16 gb" in text or "16gb" in text or "ram" in text:

            if "16GB RAM" not in reqs["required_features"]:

                reqs["required_features"].append("16GB RAM")

        if "anc" in text or "noise cancel" in text:

            if "Active Noise Cancellation" not in reqs["preferred_features"]:

                reqs["preferred_features"].append("Active Noise Cancellation")

        if "oled" in text or "display" in text or "amoled" in text:

            if "High resolution display" not in reqs["preferred_features"]:

                reqs["preferred_features"].append("High resolution display")

        if "fast charge" in text or "charging" in text:

            if "Fast charging" not in reqs["preferred_features"]:

                reqs["preferred_features"].append("Fast charging")

        if "calling" in text or "bluetooth calling" in text:

            if "Bluetooth Calling" not in reqs["preferred_features"]:

                reqs["preferred_features"].append("Bluetooth Calling")

        if "water" in text or "waterproof" in text or "5atm" in text:

            if "Water Resistance" not in reqs["preferred_features"]:

                reqs["preferred_features"].append("Water Resistance")



        # 5. Quantity / Count Intent

        requested_count = None

        # Check if user is asking for the BEST / WINNER among choices ("which is best", "which one", "which should i buy")

        # This is ALWAYS an intent for 1 winner, regardless of numbers mentioned like "in that 3 mobiles"

        if re.search(r'\b(which\s*(?:one\s*)?is\s*best|which\s*is\s*better|which\s*(?:one\s*)?should\s*i\s*(?:buy|pick|choose)|best\s*(?:one|choice|pick|option)|winner|which\s*one)\b', text):

            requested_count = 1

        else:

            # Strip reference expressions like "in that 3", "out of those 3", "among these 3" so prior set size doesn't become requested count

            clean_text_for_count = re.sub(r'\b(?:in|of|out\s*of|among)\s+(?:that|those|these|the)?\s*\d+\s*(?:mobiles?|phones?|products?|laptops?|items?|options?)?\b', '', text)

            if re.search(r'\b(one|1|single|a\s+single|only\s+one|just\s+one|best\s+one)\b', clean_text_for_count) or re.search(r'\b(refer|suggest|give|show|recommend)\s+(?:me\s+)?a\s+(phone|mobile|laptop|watch|headphone|product|gadget)\b', clean_text_for_count):

                requested_count = 1

            elif re.search(r'\b(two|2|pair|couple|top\s*2)\b', clean_text_for_count):

                requested_count = 2

            elif re.search(r'\b(three|3|top\s*3)\b', clean_text_for_count):

                requested_count = 3

            elif re.search(r'\b(four|4|top\s*4)\b', clean_text_for_count):

                requested_count = 4

            elif re.search(r'\b(five|5|top\s*5)\b', clean_text_for_count):

                requested_count = 5



        reqs["requested_count"] = requested_count

        return reqs



    def process_chat(

        self,

        conversation_id: str,

        user_message: str,

        user_id: Optional[int] = None,

        active_category: Optional[str] = None,

        budget_max: Optional[float] = None

    ) -> Dict[str, Any]:

        """

        Complete Agentic Execution Workflow:

        1. Context retrieval & requirement extraction

        2. Tool execution (Search / ML Recommendation / RAG / Comparison)

        3. Factual grounded synthesis

        4. Memory update

        """

        # Load or initialize session state

        session = CONVERSATION_SESSIONS.setdefault(conversation_id, {

            "conversation_id": conversation_id,

            "user_id": user_id,

            "history": [],

            "discussed_product_ids": [],

            "active_category": active_category,

            "budget_max": budget_max,

            "purpose": None,

            "required_features": [],

            "preferred_features": []

        })



        if active_category: session["active_category"] = active_category

        if budget_max: session["budget_max"] = budget_max

        if user_id: session["user_id"] = user_id



        # Step 1: Extract requirements

        reqs = self.extract_requirements(user_message, session)

        if reqs.get("is_non_electronics"):
            reply = (
                "Sorry, this catalogue is for electronics only. We specialize in verified smart "
                "consumer electronics such as smartphones, laptops, audio & headphones, smart TVs, "
                "smartwatches, tablets, and smart accessories. "
                "How can I help you with our electronics catalogue?"
            )
            session["history"].append({"role": "user", "content": user_message})
            session["history"].append({"role": "assistant", "content": reply})
            session["discussed_product_ids"] = []
            return {
                "conversation_id": conversation_id,
                "response": reply,
                "product_ids": [],
                "recommended_products": [],
                "recommendedProducts": [],
                "tools_used": ["extract_requirements"],
                "extracted_requirements": reqs
            }

        session["active_category"] = reqs.get("category")

        session["budget_max"] = reqs.get("budget_max")

        session["purpose"] = reqs.get("purpose")

        session["required_features"] = reqs.get("required_features")

        session["preferred_features"] = reqs.get("preferred_features")



        session["history"].append({"role": "user", "content": user_message})



        tools_used = ["extract_requirements"]

        recommended_product_ids = []



        # If external LLM is configured with function calling, attempt live LLM tool calling

        if self.client and self.provider:

            try:

                return self._run_llm_agent(conversation_id, user_message, session, reqs)

            except Exception as e:

                logger.warning(f"External LLM invocation error: {e}, falling back to deterministic Agentic engine.")



        # Step 2: Deterministic Agentic Decision Engine (Zero-Hallucination Grounded Mode)

        lower_msg = user_message.lower()



        # Intent: Compare previously discussed or requested products

        if "compare" in lower_msg or "difference" in lower_msg or "vs" in lower_msg:

            tools_used.append("compare_products")

            pids = session.get("discussed_product_ids", [])

            # If explicit IDs or fewer than 2 discussed, find top candidates

            if len(pids) < 2:

                candidates = agent_tools.search_products(

                    category=session.get("active_category"),

                    max_price=session.get("budget_max"),

                    limit=2

                )

                pids = [c["product_id"] for c in candidates]



            comparison_result = agent_tools.compare_products(pids[:3])

            tools_used.append("retrieve_product_knowledge")

            rag_evidence = agent_tools.retrieve_product_knowledge(user_message, category=session.get("active_category"), top_k=2)



            # Grounded response synthesis

            reply = self._synthesize_comparison_response(comparison_result, rag_evidence)

            session["history"].append({"role": "assistant", "content": reply})

            return {

                "conversation_id": conversation_id,

                "response": reply,

                "product_ids": pids[:3],

                "tools_used": tools_used,

                "extracted_requirements": reqs

            }



        # Intent: Specific Review or Question about product (e.g. "Which has better battery?", "How is the camera?", "which is bet for gaming")
        is_context_referencing = any(w in lower_msg for w in [
            "in that", "out of these", "out of those", "between these", "between them",
            "among these", "among them", "of these", "of them", "of the two", "of the three",
            "first one", "second one", "third one", "from these", "from those"
        ])
        is_explicit_new_search = bool(
            re.search(
                r'\b(?:which\s+(?:flagship\s+|best\s+)?(?:phones?|mobiles?|smartphones?|laptops?|notebooks?|macbooks?|headphones?|earbuds?|earphones?|tvs?|televisions?|monitors?|smartwatch(?:es)?|tablets?|drones?|printers?)|show\s+me|find\s+me|recommend|suggest|i\s+need|i\s+want|best\s+(?:phones?|laptops?|earbuds?|headphones?|tvs?|monitors?|tablets?))\b',
                lower_msg
            )
            and not is_context_referencing
        )

        prior_pids = session.get("discussed_product_ids", [])
        is_different_category = False
        target_cat = reqs.get("category") or session.get("active_category")
        if prior_pids and target_cat:
            det0 = agent_tools.get_product_details(prior_pids[0])
            if det0 and det0.get("category"):
                norm_prior = agent_tools.normalize_category(det0["category"])
                norm_target = agent_tools.normalize_category(target_cat)
                if norm_prior and norm_target and norm_prior.lower() != norm_target.lower():
                    is_different_category = True
                    session["discussed_product_ids"] = []
                    prior_pids = []

        is_follow_up = (
            len(prior_pids) > 0
            and not is_different_category
            and not is_explicit_new_search
            and (
                is_context_referencing
                or (not reqs.get("category") and any(w in lower_msg for w in [
                    "which one", "which is", "which", "better", "best", "bet", "battery",
                    "camera", "review", "does it", "is it", "gaming", "performance"
                ]))
            )
        )

        if is_follow_up and session.get("discussed_product_ids"):

            tools_used.append("retrieve_product_knowledge")

            evidence = agent_tools.retrieve_product_knowledge(

                user_message,

                category=session.get("active_category"),

                top_k=3

            )

            tools_used.append("get_reviews")



            reply = self._synthesize_rag_grounded_response(user_message, evidence, session)

            session["history"].append({"role": "assistant", "content": reply})

            return {

                "conversation_id": conversation_id,

                "response": reply,

                "product_ids": session.get("discussed_product_ids", []),

                "tools_used": tools_used,

                "extracted_requirements": reqs

            }



        # Intent: Shopping Recommendation / Search

        tools_used.append("get_recommendations")

        rec_data = agent_tools.get_recommendations(

            user_id=session.get("user_id"),

            category=session.get("active_category"),

            max_budget=session.get("budget_max"),

            purpose=session.get("purpose"),

            required_features=session.get("required_features"),

            preferred_features=session.get("preferred_features"),

            limit=3

        )

        rec_items = rec_data.get("recommendations", [])
        requested_category = agent_tools.normalize_category(session.get("active_category"))
        if session.get("budget_max") is not None:
            rec_items = [
                item for item in rec_items
                if float(item.get("price", 0)) <= float(session["budget_max"])
            ]
        if requested_category:
            rec_items = [
                item for item in rec_items
                if requested_category.lower() in str(item.get("category", "")).lower()
            ]
        recommended_product_ids = [item["product_id"] for item in rec_items]

        session["discussed_product_ids"] = recommended_product_ids



        tools_used.append("retrieve_product_knowledge")

        rag_notes = agent_tools.retrieve_product_knowledge(

            user_message,

            category=session.get("active_category"),

            top_k=2

        )



        reply = self._synthesize_recommendation_response(rec_items, reqs, rag_notes, rec_data.get("pipeline_summary"))

        session["history"].append({"role": "assistant", "content": reply})



        rec_products_list = []

        for pid in recommended_product_ids:

            det = agent_tools.get_product_details(pid)

            if det:

                p_id = det.get("product_id") or det.get("id")

                rec_products_list.append({

                    "id": p_id,

                    "product_id": p_id,

                    "name": det.get("name", ""),

                    "brand": det.get("brand", ""),

                    "category": det.get("category", ""),

                    "price": det.get("price", 0.0),

                    "rating": det.get("rating", 0.0),

                    "reviewCount": det.get("review_count", 0),

                    "imageUrl": det.get("image_url", ""),

                    "image_url": det.get("image_url", ""),

                    "description": det.get("description", ""),

                    "specifications": det.get("specifications", "")

                })



        return {

            "conversation_id": conversation_id,

            "response": reply,

            "product_ids": recommended_product_ids,

            "recommended_products": rec_products_list,

            "recommendedProducts": rec_products_list,

            "tools_used": tools_used,

            "extracted_requirements": reqs

        }



    def _synthesize_recommendation_response(

        self,

        recommendations: List[Dict[str, Any]],

        reqs: Dict[str, Any],

        rag_notes: List[Dict[str, Any]],

        pipeline_summary: Optional[str] = None

    ) -> str:

        if not recommendations:
            cat_desc = reqs.get("category")
            if not cat_desc:
                return "Sorry, this catalogue is for electronics only. We specialize in verified smart consumer electronics such as smartphones, laptops, audio & headphones, smart TVs, smartwatches, tablets, and smart accessories. How can I help you with our electronics catalogue?"

            return (
                f"Sorry, there are no {cat_desc.lower()} available in our catalogue matching "
                f"that request. Please try increasing your budget or changing the filters."
            )



        cat_desc = reqs.get("category") or "items"

        budget_desc = f" within ₹{reqs['budget_max']:,.0f}" if reqs.get("budget_max") else ""

        purpose_desc = f" for {reqs['purpose']}" if reqs.get("purpose") else ""



        if reqs.get("requested_count") == 1:

            recommendations = recommendations[:1]

            lines = [

                f"Here is our top verified {cat_desc}{budget_desc}{purpose_desc} recommendation:\n"

            ]

        else:

            lines = [

                f"Here are the top personalized {cat_desc}{budget_desc}{purpose_desc} recommended by our Multimodal Decision Engine:\n"

            ]



        if pipeline_summary:

            lines.append(f"🔍 **Decision Filter Waterfall:** {pipeline_summary}\n")



        for i, item in enumerate(recommendations, start=1):

            details = agent_tools.get_product_details(item["product_id"])

            if not details: continue

            specs = details.get("specifications", {})

            specs_snippet = ""

            if isinstance(specs, dict):

                specs_snippet = ", ".join([f"{k}: {v}" for k, v in list(specs.items())[:3]])



            score_val = item.get("score", 0.95)

            # Display percentage if <= 1.0, else raw

            score_str = f"{score_val * 100:.1f}%" if score_val <= 1.0 else f"{score_val:.2f}"



            lines.append(

                f"{i}. **{details['name']}** — **₹{details['price']:,.0f}**\n"

                f"   - **Rating:** {details['rating']}★ ({details['review_count']} reviews)\n"

                f"   - **Multimodal Match Score:** {score_str}\n"

                f"   - **Match Reason:** {item.get('match_reason')}\n"

                f"   - **Key Specs:** {specs_snippet}\n"

            )



        # Grounding with Qdrant review evidence

        if rag_notes:

            top_evidence = rag_notes[0]

            if top_evidence.get("document_type") == "customer_review":

                lines.append(

                    f"💬 **Customer Insight ({top_evidence.get('product_name')}):** "

                    f"\"{top_evidence.get('text')}\"\n"

                )



        lines.append("Would you like me to compare these models or dive into battery life and performance details?")

        return "\n".join(lines)





    def _synthesize_comparison_response(

        self,

        comparison: Dict[str, Any],

        evidence: List[Dict[str, Any]]

    ) -> str:

        products = comparison.get("products", [])

        if len(products) < 2:

            return "Unable to compare products: please select at least two products."



        lines = [f"### Side-by-Side Comparison:\n"]

        for p in products:

            lines.append(f"• **{p['name']}**: ₹{p['price']:,.0f} | {p['rating']}★ | Stock: {p['stock']} units")



        lines.append("\n**Key Differences & Verdict:**")

        for diff in comparison.get("key_differences", []):

            lines.append(f"- {diff}")



        if evidence:

            lines.append("\n**Ground Truth Review Evidence from Qdrant:**")

            for ev in evidence[:2]:

                lines.append(f"- {ev['text']}")



        return "\n".join(lines)



    def _synthesize_rag_grounded_response(

        self,

        question: str,

        evidence: List[Dict[str, Any]],

        session: Dict[str, Any]

    ) -> str:

        if not evidence:

            return "Based on our verified product catalogue and customer reviews, there is no verified information available regarding this specific question."



        lines = [f"Here is the verified information retrieved from our product database and customer reviews:\n"]

        for ev in evidence:

            doc_type = ev.get("document_type", "knowledge")

            pname = ev.get("product_name", "Product")

            lines.append(f"• **{pname}** ({doc_type.replace('_', ' ').title()}): {ev.get('text')}\n")



        lines.append("Does this help with your decision, or would you like to explore other options?")

        return "\n".join(lines)



    def _run_llm_agent(self, conversation_id: str, message: str, session: Dict[str, Any], reqs: Dict[str, Any]) -> Dict[str, Any]:

        """

        Ultra-Fast & Context-Aware Agentic Execution (<1.5s):

        1. Contextual follow-up detection on previously discussed products

        2. Sub-millisecond SQL ground-truth pre-fetch

        3. Single-hop direct Groq synthesis (zero tool latency loops)

        4. Precise product card alignment

        """

        if reqs.get("is_non_electronics"):
            reply = (
                "Sorry, this catalogue is for electronics only. We specialize in verified smart "
                "consumer electronics such as smartphones, laptops, audio & headphones, smart TVs, "
                "smartwatches, tablets, and smart accessories. "
                "How can I help you with our electronics catalogue?"
            )
            session["history"].append({"role": "assistant", "content": reply})
            session["discussed_product_ids"] = []
            return {
                "conversation_id": conversation_id,
                "response": reply,
                "product_ids": [],
                "recommended_products": [],
                "recommendedProducts": [],
                "tools_used": ["extract_requirements"],
                "extracted_requirements": reqs
            }

        category = reqs.get("category") or session.get("active_category")

        budget = reqs.get("budget_max") or session.get("budget_max")

        lower_msg = message.lower()

        prior_pids = session.get("discussed_product_ids", [])

        # Check cross-category mismatch
        is_different_category = False
        target_cat = category or reqs.get("category")
        if prior_pids and target_cat:
            det0 = agent_tools.get_product_details(prior_pids[0])
            if det0 and det0.get("category"):
                norm_prior = agent_tools.normalize_category(det0["category"])
                norm_target = agent_tools.normalize_category(target_cat)
                if norm_prior and norm_target and norm_prior.lower() != norm_target.lower():
                    is_different_category = True
                    session["discussed_product_ids"] = []
                    prior_pids = []

        is_context_referencing = any(w in lower_msg for w in [
            "in that", "out of these", "out of those", "between these", "between them",
            "among these", "among them", "of these", "of them", "of the two", "of the three",
            "first one", "second one", "third one", "from these", "from those"
        ])

        # Check if query is an explicit comparison between named items or brands
        is_comparison_query = bool(
            re.search(r'\b(compare|difference(?:\s+between)?|vs\.?|versus)\b', lower_msg)
            or (" and " in lower_msg and any(b in lower_msg for b in [
                "macbook", "thinkpad", "iphone", "galaxy", "pixel", "oneplus", "dell", "hp", "lenovo", "asus", "sony", "bose"
            ]))
        )

        is_explicit_new_search = bool(
            re.search(
                r'\b(?:which\s+(?:flagship\s+|best\s+)?(?:phones?|mobiles?|smartphones?|laptops?|notebooks?|macbooks?|headphones?|earbuds?|earphones?|tvs?|televisions?|monitors?|smartwatch(?:es)?|tablets?|drones?|printers?)|show\s+me|find\s+me|recommend|suggest|i\s+need|i\s+want|best\s+(?:phones?|laptops?|earbuds?|headphones?|tvs?|monitors?|tablets?)|bluetooth)\b',
                lower_msg
            )
            and not is_context_referencing
        )

        if (is_explicit_new_search or is_comparison_query or bool(category)) and not is_context_referencing:
            session["discussed_product_ids"] = []
            prior_pids = []

        # Detect follow-up evaluation on already discussed products
        is_follow_up_eval = (
            len(prior_pids) > 0
            and not is_different_category
            and not is_explicit_new_search
            and not is_comparison_query
            and (
                is_context_referencing
                or (
                    not category and any(w in lower_msg for w in [
                        "which is best", "which is bet", "which is better", "which one", "which to",
                        "which should i", "better", "best", "bet", "first one", "second one", "third one",
                        "tell me about", "why", "which to buy", "recommend one", "choice", "pick one",
                        "suggest one", "battery", "camera", "performance", "gaming", "screen", "display"
                    ])
                )
                or (not category and len(message.split()) <= 6)
            )
        )

        candidates: List[Dict[str, Any]] = []
        candidate_pids: List[int] = []
        grounded_data_lines: List[str] = []
        budget_miss = False
        lowest_catalogue_item: Optional[Dict[str, Any]] = None

        # Case A: Follow-up question on already discussed products
        if is_follow_up_eval:
            discussed_prods = []
            for pid in prior_pids:
                det = agent_tools.get_product_details(pid)
                if det:
                    discussed_prods.append(det)

            if discussed_prods:
                candidates = discussed_prods
                grounded_data_lines.append("PRODUCTS CURRENTLY UNDER DISCUSSION & COMPARISON FROM PREVIOUS TURN:")
                for p in discussed_prods:
                    candidate_pids.append(p["product_id"])

                    specs_data = p.get("specifications")

                    if isinstance(specs_data, str):

                        try: specs_data = json.loads(specs_data)

                        except Exception: specs_data = {"raw": specs_data}

                    specs_snippet = ", ".join([f"{k}: {v}" for k, v in list(specs_data.items())]) if isinstance(specs_data, dict) else str(specs_data or "")

                    grounded_data_lines.append(

                        f"• ID {p['product_id']}: {p['name']} (Brand: {p['brand']}, Price: ₹{p['price']:,.0f}, Rating: {p['rating']}★, Stock: {p['stock']})\n"

                        f"  Key Specs: {specs_snippet}"

                    )



        # Case B: Standard / New Search Query

        if not candidate_pids:
            brands = [
                "apple", "samsung", "oneplus", "sony", "boat", "noise", "bose", "jbl", 
                "dell", "hp", "lenovo", "asus", "acer", "fastrack", "fire-boltt", "realme", 
                "xiaomi", "redmi", "iqoo", "google", "pixel", "logitech", "nothing", 
                "sennheiser", "anker", "garmin", "fitbit", "amazfit", "marshall", "tribit"
            ]

            matched_brands = [b for b in brands if re.search(r'\b' + re.escape(b) + r'\b', lower_msg)]

            # Check database for exact product models explicitly named in query
            matched_specific_prods = []
            try:
                conn_m = agent_tools.get_db_connection()
                cur_m = conn_m.cursor()
                cur_m.execute("SELECT id, name, brand, category, price, stock, rating, review_count, image_url, description FROM products")
                all_prods_db = cur_m.fetchall()
                cur_m.close()
                agent_tools.release_db_connection(conn_m)

                for r in all_prods_db:
                    p_id, p_name, p_brand, p_cat, p_price, p_stock, p_rat, p_rc, p_img, p_desc = r
                    clean_pname = re.sub(r'\(.*?\)', '', p_name).lower()
                    words = clean_pname.split()
                    found_m = False
                    if len(words) >= 3 and " ".join(words[:3]) in lower_msg:
                        found_m = True
                    elif len(words) >= 2 and " ".join(words[:2]) in lower_msg:
                        found_m = True
                    elif any(kw in lower_msg for kw in ["thinkpad", "macbook", "pixel 8", "pixel 9", "galaxy s24", "galaxy s23", "oneplus 12", "iphone 15", "iphone 16", "vivobook", "inspiron", "pavilion", "quietcomfort", "wh-1000xm5", "airpods pro"]) and any(kw in clean_pname for kw in ["thinkpad", "macbook", "pixel 8", "pixel 9", "galaxy s24", "galaxy s23", "oneplus 12", "iphone 15", "iphone 16", "vivobook", "inspiron", "pavilion", "quietcomfort", "wh-1000xm5", "airpods pro"]):
                        found_m = True

                    if found_m:
                        matched_specific_prods.append({
                            "product_id": p_id,
                            "name": p_name,
                            "brand": p_brand,
                            "category": p_cat,
                            "price": float(p_price),
                            "stock": p_stock,
                            "rating": float(p_rat),
                            "review_count": p_rc,
                            "image_url": p_img,
                            "description": p_desc
                        })
            except Exception as e:
                logger.debug(f"Error checking exact product models: {e}")

            candidates: List[Dict[str, Any]] = []

            # 1. User explicitly named 2 or more specific products (e.g. Compare MacBook Air and ThinkPad E14)
            if len(matched_specific_prods) >= 2:
                candidates = matched_specific_prods[:4]
            # 2. Multi-brand comparison query
            elif is_comparison_query and len(matched_brands) >= 2:
                for b in matched_brands:
                    b_cands = agent_tools.search_products(category=category, query=b, max_price=budget, limit=2)
                    for bc in b_cands:
                        if not any(c["product_id"] == bc["product_id"] for c in candidates):
                            candidates.append(bc)
            # 3. Flagship smartphone query
            elif ("flagship" in lower_msg or ("best" in lower_msg and "camera" in lower_msg)) and (category == "Smartphones" or not category):
                flagship_cands = agent_tools.search_products(category="Smartphones", min_price=60000, limit=5)
                if not flagship_cands:
                    flagship_cands = agent_tools.search_products(category="Smartphones", limit=5)
                candidates = flagship_cands
            # 4. Single specific product model
            elif len(matched_specific_prods) == 1:
                candidates = matched_specific_prods
            # 5. Standard Category search
            elif category:
                search_query_arg = matched_brands[0] if matched_brands else None
                if category == "Smart TVs & Home Entertainment" and not search_query_arg:
                    search_query_arg = "tv"
                if search_query_arg:
                    candidates = agent_tools.search_products(
                        category=category,
                        query=search_query_arg,
                        max_price=budget,
                        limit=8
                    )
                if not candidates:
                    candidates = agent_tools.search_products(
                        category=category,
                        max_price=budget,
                        limit=8
                    )

                if not candidates and budget:
                    # User specified a budget but NO products in catalogue meet this budget constraint!
                    # Do NOT fetch expensive items! Keep candidates empty.
                    min_item = None
                    try:
                        conn = agent_tools.get_db_connection()
                        cur = conn.cursor()
                        cur.execute("SELECT name, price, brand FROM products WHERE LOWER(category) LIKE %s ORDER BY price ASC LIMIT 1", (f"%{category.lower()}%",))
                        m_row = cur.fetchone()
                        if m_row:
                            min_item = {"name": m_row[0], "price": float(m_row[1]), "brand": m_row[2]}
                        cur.close()
                        agent_tools.release_db_connection(conn)
                    except Exception as e:
                        logger.debug(f"Error querying min price: {e}")

                    if min_item:
                        grounded_data_lines.append(
                            f"CRITICAL CATALOGUE STATUS: NO PRODUCTS AVAILABLE IN CATALOGUE UNDER ₹{budget:,.0f} FOR CATEGORY '{category}'.\n"
                            f"Lowest-priced available model in our catalogue for this category: '{min_item['name']}' at ₹{min_item['price']:,.0f}.\n"
                            f"INSTRUCTION: Politely state: 'Sorry, that product is not available in our catalogue under ₹{budget:,.0f}. In our catalogue, {category.lower()} start from ₹{min_item['price']:,.0f} (e.g. {min_item['name']}).'\n"
                            f"DO NOT suggest or recommend any expensive flagship models, and DO NOT return product cards!"
                        )
                    else:
                        grounded_data_lines.append(
                            f"CRITICAL CATALOGUE STATUS: NO PRODUCTS AVAILABLE IN CATALOGUE UNDER ₹{budget:,.0f}."
                        )

                    budget_miss = True
                    lowest_catalogue_item = min_item

            else:

                search_kw = re.sub(

                    r"\b(i|am|asking|for|the|show|me|find|a|an|best|some|good|suggest|want|recommend|recommendations|buy|purchase|browse|look|looking|need|what|which|products?|do|you|have|any)\b",

                    "",

                    message,

                    flags=re.IGNORECASE

                ).strip()

                if specific_kw:

                    candidates = agent_tools.search_products(query=specific_kw, max_price=budget, limit=5)

                elif search_kw:

                    candidates = agent_tools.search_products(query=search_kw, max_price=budget, limit=5)

                if not candidates and budget:
                    budget_miss = True
                    grounded_data_lines.append(
                        f"CRITICAL CATALOGUE STATUS: NO PRODUCTS AVAILABLE IN CATALOGUE UNDER ₹{budget:,.0f}."
                    )
                elif not candidates:
                    candidates = []



            if candidates:
                # Deduplicate candidates by base name to avoid duplicate cards
                seen_base = set()
                deduped_cands = []
                for c in candidates:
                    base = re.sub(r'\(.*?\)', '', c["name"]).split("M3")[0].split("Gen")[0].strip().lower()
                    base = re.sub(r'\s+', ' ', base)
                    if base not in seen_base:
                        seen_base.add(base)
                        deduped_cands.append(c)
                candidates = deduped_cands

                grounded_data_lines.append("AVAILABLE CANDIDATE PRODUCTS IN CATALOGUE:")

                for c in candidates:

                    candidate_pids.append(c["product_id"])

                    details = agent_tools.get_product_details(c["product_id"])

                    specs_snippet = ""

                    if details and details.get("specifications"):

                        specs_data = details["specifications"]

                        if isinstance(specs_data, str):

                            try: specs_data = json.loads(specs_data)

                            except Exception: specs_data = {"raw": specs_data}

                        if isinstance(specs_data, dict):

                            specs_snippet = ", ".join([f"{k}: {v}" for k, v in list(specs_data.items())])

                    grounded_data_lines.append(

                        f"• ID {c['product_id']}: {c['name']} (Brand: {c['brand']}, Price: ₹{c['price']:,.0f}, Rating: {c['rating']}★, Stock: {c['stock']})\n"

                        f"  Key Specs: {specs_snippet}"

                    )

            else:

                grounded_data_lines.append(

                    "CATALOGUE STATUS: NO MATCHING PRODUCTS FOUND IN OUR CATALOGUE FOR THIS SPECIFIC REQUEST."

                )



        # Fast direct review retrieval from PostgreSQL (<1ms)

        if candidate_pids:

            try:

                conn = agent_tools.get_db_connection()

                cur = conn.cursor()

                cur.execute(

                    "SELECT p.name, r.review_text FROM reviews r JOIN products p ON r.product_id = p.id WHERE r.product_id = ANY(%s) ORDER BY r.rating DESC LIMIT 2",

                    (candidate_pids[:3],)

                )

                rev_rows = cur.fetchall()

                cur.close()

                agent_tools.release_db_connection(conn)

                if rev_rows:

                    grounded_data_lines.append("\nAUTHENTIC CUSTOMER REVIEWS:")

                    for pname, rtext in rev_rows:

                        grounded_data_lines.append(f"• [{pname} Review]: \"{rtext}\"")

            except Exception as e:

                logger.debug(f"Fast review fetch error: {e}")



        grounded_context_str = "\n".join(grounded_data_lines)

        if budget_miss and not candidate_pids:
            category_label = category or "the requested product"
            if lowest_catalogue_item:
                reply = (
                    f"Sorry, there are no {category_label.lower()} available in our catalogue "
                    f"under ₹{budget:,.0f}. The lowest-priced {category_label.lower()} starts at "
                    f"₹{lowest_catalogue_item['price']:,.0f} "
                    f"(for example, {lowest_catalogue_item['name']})."
                )
            else:
                reply = (
                    f"Sorry, there are no products available in our catalogue under ₹{budget:,.0f}."
                )
            session["history"].append({"role": "assistant", "content": reply})
            session["discussed_product_ids"] = []
            return {
                "conversation_id": conversation_id,
                "response": reply,
                "product_ids": [],
                "recommended_products": [],
                "recommendedProducts": [],
                "tools_used": ["extract_requirements", "search_products"],
                "extracted_requirements": reqs
            }



        if not candidate_pids and not is_follow_up_eval:
            reply = (
                "Sorry, that product is not available in our catalogue. This catalogue is for "
                "electronics only (such as smartphones, laptops, audio & headphones, smart TVs, "
                "smartwatches, tablets, and accessories). How can I help you with our electronics catalogue?"
            )
            session["history"].append({"role": "assistant", "content": reply})
            session["discussed_product_ids"] = []
            return {
                "conversation_id": conversation_id,
                "response": reply,
                "product_ids": [],
                "recommended_products": [],
                "recommendedProducts": [],
                "tools_used": ["extract_requirements", "search_products"],
                "extracted_requirements": reqs
            }

        # Dynamic Instruction based on Intent

        count_instruction = ""

        if is_follow_up_eval:
            count_instruction = (
                "CRITICAL INSTRUCTION FOR FOLLOW-UP COMPARISON & EVALUATION:\n"
                "The customer is asking which product is best or best suited for a specific need (e.g. 'which is best for gaming', 'which is bet for gaming', 'in that which is best', 'which has best camera').\n"
                "1. DIRECTLY DECLARE THE OVERALL WINNER right at the start. If they asked for a specific use case like gaming, performance, camera, or battery, explicitly pick the single best product for that need from the products under discussion (e.g., 'Between the phones we discussed, the clear winner for gaming is **OnePlus 12 5G** because of its Snapdragon 8 Gen 3 chipset, Adreno 750 GPU, and Dual Cryo-velocity VC cooling system...').\n"
                "2. Provide a brief side-by-side spec comparison table or bullet breakdown comparing the discussed phones (e.g., Gaming Chipset, GPU, Refresh Rate, Battery & Thermal Performance).\n"
                "3. Conclude with a decisive verdict on why they should choose that winner for their specific need.\n"
                "4. Name the winning product FIRST so that the UI can highlight its product card."
            )

        elif reqs.get("requested_count") == 1:

            count_instruction = "CRITICAL REQUIREMENT: The user explicitly asked for ONE (1) product ('refer me one phone'). You MUST recommend ONLY THE SINGLE BEST MATCHING PRODUCT with full specs. Do NOT list multiple products."

        elif reqs.get("requested_count"):

            count_instruction = f"CRITICAL REQUIREMENT: Recommend exactly {reqs['requested_count']} products as requested."



        system_prompt = (

            "You are an expert, proactive AI Shopping Advisor for an e-commerce platform specializing in verified electronics and accessories.\n"

            "Our catalogue covers all 24 verified electronics categories: Smartphones, Laptops, Monitors & Displays, Audio & Headphones, Smart TVs & Home Entertainment, PC & Gaming Components, Drones & Aerial Imaging, Networking & Wireless, AR & VR Headsets, Smart Wearables & Health, Power Banks & Portable Power, Smart Security & Surveillance, Studio Audio Production, Robot Vacuums, Smartwatches, Tablets, E-Readers & Digital Paper, Printers & Office Electronics, Car Electronics & Dash Cams, Smart Home & Automation, Kitchen & Home Appliances, Personal Care Electronics, Cameras & Gaming, and Accessories.\n"

            "RULES:\n"

            "1. Be direct, concise, and structured. Mention product names, prices in ₹, key specs, and customer insights.\n"

            f"{count_instruction}\n"

            "2. If the catalogue context below contains relevant items matching the customer's request, recommend those matches directly.\n"

            "3. Never hallucinate specs or prices. Only use verified values.\n"

            "4. CRITICAL PRODUCT AVAILABILITY & BUDGET RULES:\n"
            "   - IF NO PRODUCTS MATCH THE CUSTOMER'S REQUESTED BUDGET (e.g. phone under ₹100, laptop under ₹5,000):\n"
            "     You MUST politely state that no product is available in that budget bracket, e.g.:\n"
            "     'Sorry, that product is not available in our catalogue under ₹[Budget]. In our catalogue, [Category] start from ₹[Lowest Price] (e.g., [Lowest Model Name]).'\n"
            "     DO NOT recommend or showcase expensive/flagship products that drastically exceed the customer's budget!\n"
            "   - WHEN PRODUCTS DO MATCH (e.g. phone under 1l / 1 lakh, laptop under 1l / 80k): enthusiastically recommend the matching verified products provided in the catalogue context below!\n"
            "   - NON-ELECTRONIC ITEMS (skin care, cosmetics, clothing, shoes, groceries, furniture, food, medicines, books): state 'Sorry, this catalogue is for electronics only. We specialize in verified smart consumer electronics such as smartphones, laptops, audio & headphones, smart TVs, and smart accessories.'\n"
            "5. CRITICAL PRODUCT MATCHING RULES:\n"

            "   - AUDIO & BLUETOOTH: When asked for audio, bluetooth, speakers, or headphones, recommend ONLY audio gear (earbuds, headphones, bluetooth speakers). NEVER recommend smartphones or mobile phones.\n"

            "   - TV / TELEVISIONS: When asked for TV, recommend ONLY real Smart TV television displays (e.g., LG OLED, Sony Bravia, Samsung Neo QLED, Xiaomi TV, TCL TV). Do NOT recommend soundbars or streaming sticks.\n"

            "   - COMPARISONS: When the customer asks to compare products (e.g. MacBook Air vs ThinkPad E14), use the verified models in the catalogue context below. Provide a clear side-by-side comparison of processor, RAM, storage, display, and battery life, and give an honest 'Best For' recommendation for each. Both products ARE in our catalogue—NEVER state that either is missing!\n"

            "   - FLAGSHIP PHONES: When asked for flagship phones with best camera and battery, recommend the top verified flagship models in our catalogue (such as Samsung Galaxy S24 Ultra, Apple iPhone 15/16 Pro Max, OnePlus 12 5G) provided in the catalogue context below, clearly comparing their camera sensors, zoom, and battery endurance.\n\n"

            f"{grounded_context_str}"

        )



        messages = [{"role": "system", "content": system_prompt}]

        for msg in session["history"][-4:]:

            messages.append({"role": msg["role"], "content": msg["content"]})



        tools_used = ["extract_requirements", "search_products"]



        if self.client is None:

            raise RuntimeError("LLM client is not initialized")



        # FAST SINGLE-HOP COMPLETION (<1.5s total time):

        # We pre-fetched verified facts into the prompt, so a direct completion avoids multi-hop round-trips

        first_resp = self.client.chat.completions.create(

            model=self.llm_model,

            messages=messages,

            temperature=0.2,

            max_tokens=int(os.getenv("LLM_MAX_TOKENS", "450"))

        )

        final_text = first_resp.choices[0].message.content or ""



        if not final_text:

            final_text = "I analyzed our catalogue based on your criteria. Here are our top recommended options displayed below."



        # Detect specific product names mentioned in final_text to align UI cards

        mentioned_pids = []

        try:

            conn = agent_tools.get_db_connection()

            cur = conn.cursor()

            cur.execute("SELECT id, name, category FROM products")

            all_prods = cur.fetchall()

            cur.close()

            agent_tools.release_db_connection(conn)



            clean_text = re.sub(r'[\s\u00a0\u202f\u2000-\u200b]+', ' ', final_text).lower()
            found_matches = []

            for pid, pname, pcat in all_prods:
                clean_pname = re.sub(r'[\s\u00a0\u202f\u2000-\u200b]+', ' ', pname).lower()
                idx = clean_text.find(clean_pname)
                if idx != -1:
                    found_matches.append((idx, pid))
                else:
                    words = clean_pname.split()
                    if len(words) >= 3:
                        prefix_3 = " ".join(words[:3])
                        idx = clean_text.find(prefix_3)
                        if idx != -1:
                            found_matches.append((idx, pid))
                    elif len(words) >= 2:
                        prefix_2 = " ".join(words[:2])
                        idx = clean_text.find(prefix_2)
                        if idx != -1:
                            found_matches.append((idx, pid))

            # Sort strictly by appearance in response so the declared WINNER is always first
            found_matches.sort(key=lambda x: x[0])
            for _, pid in found_matches:
                if pid not in mentioned_pids:
                    mentioned_pids.append(pid)

        except Exception as e:

            logger.debug(f"Error matching products in response text: {e}")



        # Prioritize products mentioned by name in response, then candidate products
        selected_pids: List[int] = []
        if budget_miss or (budget and not candidates):
            # Zero products fit the customer's requested budget - do NOT attach product cards!
            selected_pids = []
        else:
            seen_pids_temp = set()
            seen_base_names = set()

            def _get_base_model(name_str: str) -> str:
                clean = re.sub(r'\(.*?\)', '', name_str)
                clean = re.sub(r'\b(gen \d+|m\d|rtx \d+|gb|ram|ssd|inch|laptop|oled|5g)\b', '', clean, flags=re.IGNORECASE)
                words = clean.lower().split()
                return " ".join(words[:2]) if len(words) >= 2 else clean.lower()

            # First add mentioned products
            for p in mentioned_pids:
                if p not in seen_pids_temp:
                    det = agent_tools.get_product_details(p)
                    if det:
                        if budget and float(det.get("price", 0)) > float(budget):
                            continue
                        base = _get_base_model(det.get("name", ""))
                        if base not in seen_base_names:
                            seen_base_names.add(base)
                            seen_pids_temp.add(p)
                            selected_pids.append(p)

            # Then supplement with candidate products
            for p in candidate_pids:
                if p not in seen_pids_temp:
                    det = agent_tools.get_product_details(p)
                    if det:
                        if budget and float(det.get("price", 0)) > float(budget):
                            continue
                        base = _get_base_model(det.get("name", ""))
                        if base not in seen_base_names:
                            seen_base_names.add(base)
                            seen_pids_temp.add(p)
                            selected_pids.append(p)



        # If a category was requested, ensure returned products match that category

        if category:

            norm_cat = agent_tools.normalize_category(category)

            if norm_cat:

                filtered = []

                for p in selected_pids:

                    details = agent_tools.get_product_details(p)

                    if details:

                        p_cat = details.get("category", "").lower()

                        p_name = details.get("name", "").lower()

                        if norm_cat.lower() in p_cat:

                            # Audio queries must NEVER return phones

                            if "audio" in norm_cat.lower() and "smartphone" in p_cat:

                                continue

                            # TV queries must NEVER return soundbars or home theatre

                            if "tv" in norm_cat.lower() and ("soundbar" in p_name or "home theatre" in p_name):

                                continue

                            filtered.append(p)

                selected_pids = filtered



        # Check if the response states the product is not in catalogue or unavailable
        is_apology = any(p in final_text.lower() for p in [
            "not available in our catalogue", 
            "not in our catalogue", 
            "not part of our catalogue",
            "is not part of our catalogue",
            "not part of the catalogue",
            "not available in the catalogue",
            "sorry, that product",
            "sorry, the product",
            "sorry, we don't have",
            "sorry, we do not have",
            "sorry, we couldn't find",
            "sorry, we could not find",
            "does not contain any",
            "do not contain any",
            "no products found",
            "not currently available",
            "currently unavailable",
            "electronics only"
        ])

        if budget_miss or is_apology or (not candidate_pids and not mentioned_pids):
            valid_pids = []
            session["discussed_product_ids"] = []
        else:
            if not selected_pids and candidate_pids:
                if not category:
                    selected_pids = candidate_pids
                else:
                    norm_c = agent_tools.normalize_category(category)
                    norm_c_str = norm_c.lower() if norm_c else ""
                    matching_cands = []
                    for p in candidate_pids:
                        det = agent_tools.get_product_details(p)
                        if det and norm_c_str in det.get("category", "").lower():
                            matching_cands.append(p)
                    selected_pids = matching_cands

            

            seen_pids = set()

            ordered_pids = []

            for p in selected_pids:

                if p is not None and int(p) not in seen_pids:

                    seen_pids.add(int(p))

                    ordered_pids.append(int(p))



            target_limit = reqs.get("requested_count") or (1 if is_follow_up_eval else 3)

            valid_pids = ordered_pids[:target_limit]

            

            # If standard search, remember candidates for next follow-up

            if not is_follow_up_eval and ordered_pids:

                session["discussed_product_ids"] = ordered_pids[:4]



        rec_products_list = []

        for pid in valid_pids:

            det = agent_tools.get_product_details(pid)

            if det:

                p_id = det.get("product_id") or det.get("id")

                rec_products_list.append({

                    "id": p_id,

                    "product_id": p_id,

                    "name": det.get("name", ""),

                    "brand": det.get("brand", ""),

                    "category": det.get("category", ""),

                    "price": det.get("price", 0.0),

                    "rating": det.get("rating", 0.0),

                    "reviewCount": det.get("review_count", 0),

                    "imageUrl": det.get("image_url", ""),

                    "image_url": det.get("image_url", ""),

                    "description": det.get("description", ""),

                    "specifications": det.get("specifications", "")

                })



        session["history"].append({"role": "assistant", "content": final_text})

        return {

            "conversation_id": conversation_id,

            "response": final_text,

            "product_ids": valid_pids,

            "recommended_products": rec_products_list,

            "recommendedProducts": rec_products_list,

            "tools_used": tools_used,

            "extracted_requirements": reqs

        }



    def compare_products_with_criteria(self, product_ids: List[int], criteria: Optional[str] = None) -> Dict[str, Any]:

        """

        Synthesizes a deep, grounded comparative verdict for 2-5 products answering the user's specific focus criteria.

        """

        products = []

        for pid in product_ids:

            details = agent_tools.get_product_details(pid)

            if details:

                products.append(details)



        if len(products) < 2:

            return {

                "verdict": "Please select at least 2 valid products to compare.",

                "products": products

            }



        # Gather specifications and reviews

        product_summaries = []

        for p in products:

            specs = p.get("specifications", {})

            spec_str = "; ".join([f"{k}: {v}" for k, v in specs.items()]) if isinstance(specs, dict) else str(specs)

            product_summaries.append(

                f"• {p['name']} ({p['brand']} | ₹{p['price']:,.0f} | {p['rating']}★ | Stock: {p['stock']})\n"

                f"  Specs: {spec_str}"

            )



        prods_text = "\n".join(product_summaries)
        user_focus = criteria.strip() if criteria and criteria.strip() else ""
        general_terms = {"", "compare", "comparison", "all", "overall", "difference", "vs", "which is better", "overview"}
        has_specific_question = bool(user_focus and user_focus.lower() not in general_terms)

        # Semantic review evidence from Qdrant
        evidence_lines = []
        try:
            lookup_query = user_focus if has_specific_question else "overall customer review sentiment and pros cons"
            rag_docs = agent_tools.retrieve_product_knowledge(query=lookup_query, top_k=3)
            for doc in rag_docs:
                pname = doc.get("product_name", "Product")
                evidence_lines.append(f"- [{pname} Review]: \"{doc.get('text')}\"")
        except Exception as e:
            logger.debug(f"RAG review lookup in compare: {e}")

        evidence_text = "\n".join(evidence_lines) if evidence_lines else "No specific customer reviews available."

        # If LLM is configured, use live LLM for rich, intelligent verdict
        if self.client and self.provider:
            if has_specific_question:
                prompt = (
                    f"You are an expert technical product analyst for an e-commerce platform.\n"
                    f"The customer is comparing these products in our catalogue:\n\n"
                    f"{prods_text}\n\n"
                    f"CUSTOMER'S SPECIFIC QUESTION:\n\"{user_focus}\"\n\n"
                    f"CRITICAL RULES (FOLLOW STRICTLY):\n"
                    f"1. DIRECT AND EXACT ANSWER: Give the exact, direct answer to the customer's specific question immediately in the first sentence (e.g. 'The **Apple MacBook Air M2** has the best battery life.').\n"
                    f"2. SPECIFIC FEATURE BREAKDOWN ONLY: List the exact verified specifications for the compared products ONLY for the specific feature/attribute they asked about (e.g. if they asked about battery, state only battery life/capacity; if about camera, state only camera megapixels/sensors; if about price, state only the prices).\n"
                    f"3. CLEAR WINNER VERDICT: Conclude with a 1-sentence decisive verdict explaining why the winner is better for their question and what makes it superior.\n"
                    f"4. NO UNRELATED CONTENT: DO NOT include unrelated specifications (do not list CPU, RAM, storage, display, or weight unless explicitly asked).\n"
                    f"5. NO REDUNDANT TABLES: DO NOT generate a full side-by-side table of all specs (the user already has a full comparison matrix table directly below this card).\n"
                    f"6. NO GENERIC 'BEST FOR' SUMMARY: DO NOT add a generic 'Best For' list covering unrelated topics.\n"
                    f"7. Keep the response crisp, exact, and concise."
                )
            else:
                prompt = (
                    f"You are an expert technical product analyst for an e-commerce platform.\n"
                    f"A customer is comparing these products side-by-side in our catalogue:\n\n"
                    f"{prods_text}\n\n"
                    f"Customer Reviews & Ground Truth Evidence:\n"
                    f"{evidence_text}\n\n"
                    f"RULES:\n"
                    f"1. In 1-2 concise sentences, summarize the key difference and trade-offs between these models.\n"
                    f"2. For each product, provide a 1-sentence 'Best For' takeaway based on verified strengths.\n"
                    f"3. Conclude with a direct verdict on which product to choose based on user needs.\n"
                    f"4. Keep it grounded and concise (under 130 words). Do NOT generate redundant multi-column tables since the matrix is already displayed below."
                )

            try:
                resp = self.client.chat.completions.create(
                    model=self.llm_model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.2,
                    max_tokens=450
                )
                verdict_text = resp.choices[0].message.content or ""
                if verdict_text:
                    return {
                        "verdict": verdict_text,
                        "products": products,
                        "criteria": user_focus or "Overall Comparison"
                    }
            except Exception as e:
                logger.warning(f"LLM compare invocation error: {e}")



        # Deterministic criteria-aware fallback

        p1 = products[0]

        p2 = products[1]

        crit_lower = user_focus.lower()



        if "gaming" in crit_lower or "game" in crit_lower or "fps" in crit_lower:

            winner = p1 if p1.get("price", 0) > p2.get("price", 0) else p2

            runner = p2 if winner == p1 else p1

            verdict = (

                f"🎮 **Gaming Verdict:** For gaming performance, **{winner['name']}** offers stronger graphics compute, higher frame-rate throughput, and better sustained cooling.\n\n"

                f"• **{winner['name']}** (₹{winner['price']:,.0f}): Best for high-refresh gaming, dedicated thermal headroom, and responsive input latency.\n"

                f"• **{runner['name']}** (₹{runner['price']:,.0f}): Suitable for casual and lightweight gaming, offering great efficiency and lower power draw.\n\n"

                f"👉 **Recommendation:** If gaming and high-fidelity graphics are your primary focus, invest in the **{winner['name']}**."

            )

        elif "battery" in crit_lower or "battery life" in crit_lower or "endurance" in crit_lower:
            p1_bat = "Reliable full-day battery"
            p2_bat = "Reliable full-day battery"
            for p, var in [(p1, "p1"), (p2, "p2")]:
                specs = p.get("specifications", {})
                if isinstance(specs, str):
                    try: specs = json.loads(specs)
                    except: specs = {}
                if isinstance(specs, dict) and "battery" in specs:
                    if var == "p1": p1_bat = str(specs["battery"])
                    else: p2_bat = str(specs["battery"])

            verdict = (
                f"🔋 **Battery Life Comparison:**\n\n"
                f"• **{p1['name']}**: {p1_bat}\n"
                f"• **{p2['name']}**: {p2_bat}\n\n"
                f"👉 **Verdict:** For battery endurance, the model with longer rated hours offers the superior experience."
            )

        elif "coding" in crit_lower or "programming" in crit_lower or "developer" in crit_lower:

            verdict = (

                f"💻 **Developer & Programming Verdict:**\n\n"

                f"• **{p1['name']}**: Solid multi-threaded compilation speed, great keyboard ergonomics, and versatile terminal support.\n"

                f"• **{p2['name']}**: Silent, fanless efficiency with exceptional single-core compilation and UNIX compatibility.\n\n"

                f"👉 **Recommendation:** Both are capable development machines; choose **{p1['name']}** for hardware upgradeability or **{p2['name']}** for portable battery longevity."

            )

        else:

            cheapest = min(products, key=lambda x: x["price"])

            highest_rated = max(products, key=lambda x: x["rating"])

            verdict = (

                f"⚖️ **Comparison Verdict based on '{user_focus}':**\n\n"

                f"• **{highest_rated['name']}** (₹{highest_rated['price']:,.0f}): Leads in customer satisfaction ({highest_rated['rating']}★) and premium feature execution.\n"

                f"• **{cheapest['name']}** (₹{cheapest['price']:,.0f}): Outstanding value proposition with maximum specs per Rupee spent.\n\n"

                f"👉 **Takeaway:** Opt for **{highest_rated['name']}** for top-tier quality, or **{cheapest['name']}** if maximizing budget efficiency."

            )



        return {

            "verdict": verdict,

            "products": products,

            "criteria": user_focus

        }
