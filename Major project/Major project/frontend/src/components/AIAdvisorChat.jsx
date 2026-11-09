import { useState, useEffect, useRef } from 'react';



import { Send, Bot, User, Sparkles, Cpu, RefreshCw, ShoppingBag } from 'lucide-react';



import { chatApi, interactionApi } from '../services/api';







const detectNonElectronicsClient = (text) => {
  if (!text) return null;
  const t = text.toLowerCase();

  // Electronics exceptions
  if (
    /electric\s*(?:shaver|toothbrush|blanket|kettle|cooker)|hair\s*(?:dryer|styler)|airwrap/i.test(t) ||
    /smart\s*(?:watch|scale|ring|mirror|plug|tv|home)/i.test(t) ||
    /laptop\s*(?:bag|sleeve|case|stand)|phone\s*(?:case|cover|holder)/i.test(t) ||
    /air\s*fryer|coffee\s*(?:maker|machine)|espresso|blender|mixer|microwave|refrigerator|fridge|washing\s*machine|vacuum|purifier/i.test(t)
  ) {
    return null;
  }

  if (
    /grocer(?:y|ies)|foods?|snacks?|fruits?|friuts?|vegetables?|vegetbale|vegtables|veggies?|vegies?|apples?|bananas?|mangos?|mangoes?|oranges?|potatoes?|potatos?|tomatoes?|tomatos?|onions?|garlic|ginger|carrots?|cabbages?|spinach|lemons?|rice|wheat|flour|atta|dal|pulses?|bread|milk|cheeses?|butter|yogurt|curd|eggs?|meats?|chickens?|fish|seafood|mutton|prawns?|cooking\s*oil|mustard\s*oil|sunflower\s*oil|ghee|spices?|masala|sugar|salt|tea|chocolates?|cand(?:y|ies)|biscuits?|cookies?|beverages?|soft\s*drinks?|juices?|sodas?|beers?|wines?|alcohol/i.test(t) ||
    /cutters?|choppers?|peelers?|knives|knife|scissors?|graters?|slicers?|cookware|pans?|pots?|utensils?|plates?|bowls?|spoons?|forks?|water\s*bottles?|bottles?|flasks?|lunch\s*box(?:es)?|tiffin(?:s)?|cooker(?:s)?|gas\s*stove|gas\s*cylinder/i.test(t)
  ) {
    return 'food, groceries & kitchenware';
  }

  if (/dresses?|dresss?|clothes?|clothing|cloths?|apparels?|garments?|shirts?|t-?shirts?|tees?|pants?|trousers?|jeans?|jackets?|hoodies?|sweaters?|coats?|suits?|blazers?|sarees?|saris?|kurtas?|kurtis?|lehengas?|skirts?|shorts?|underwears?|socks?|shoes?|sneakers?|boots?|sandals?|slippers?|footwear|heels?|crocs?|belts?|wallets?|handbags?|purses?|tote\s*bags?|luggage|suitcases?|jewelr(?:y|ies)|necklaces?|rings?\s*(?:gold|diamond|silver)?|earrings?|bracelets?|bangles?|fashion/i.test(t)) {
    return 'clothing, fashion & footwear';
  }

  if (/skin\s*cares?|skincare|skin-care|cosm[aeo]tics?|makeups?|make-up|face\s*wash|cleansers?|toners?|serums?|moisturizers?|lotions?|sun\s*screens?|sunscreens?|sun\s*blocks?|sunblocks?|lipsticks?|lip\s*balms?|lip\s*gloss|eyeliners?|mascaras?|foundations?|concealers?|creams?|night\s*cream|day\s*cream|cold\s*cream|perfumes?|deodorants?|fragrances?|colognes?|shampoos?|conditioners?|hair\s*oils?|hair\s*care|body\s*wash|soaps?|scrubs?|sheet\s*masks?|beauty\s*products?|kajal|blush|compact\s*powder/i.test(t)) {
    return 'beauty & personal care';
  }

  if (/furnitures?|sofas?|couches?|beds?|cots?|mattresses?|pillows?|blankets?|bedsheets?|curtains?|dining\s*tables?|study\s*tables?|coffee\s*tables?|chairs?\s*(?:wooden|dining|plastic)?|tables?\s*(?:wooden|dining)?|wardrobes?|cupboards?|closets?|bookshelves?|carpets?|rugs?|mats?|cushions?/i.test(t)) {
    return 'furniture & home decor';
  }

  if (/medicines?|pharmacy|drugs?|pills?|syrups?|ointments?|antibiotics?|painkillers?|paracetamol|aspirin|vitamins?\s*(?:tablets?|capsules?|supplements?)?|protein\s*powders?|whey\s*protein|bandages?|first\s*aid|cough\s*syrup/i.test(t)) {
    return 'medicines & healthcare';
  }

  if (/novels?|fiction|non-fiction|textbooks?|story\s*books?|physical\s*books?|paperbacks?|hardcovers?|magazines?|comics?|mangas?|stationer(?:y|ies)|pens?|pencils?|erasers?|rulers?|diar(?:y|ies)|notebooks?|sticky\s*notes?|crayons?|sketchbooks?|toys?|board\s*games?|dolls?|action\s*figures?|lego|puzzles?|baby\s*wipes?|diapers?|pampers?|baby\s*food|pet\s*food|dog\s*food|cat\s*food/i.test(t)) {
    return 'books, stationery & toys';
  }

  if (/cricket\s*bats?|footballs?|basketballs?|badminton\s*(?:rackets?|shuttles?)?|shuttlecocks?|tennis\s*rackets?|dumbbells?|barbells?|weights?|gym\s*gloves?|yoga\s*mats?/i.test(t)) {
    return 'sports & fitness gear';
  }

  return null;
};

const isGreetingClient = (text) => {
  if (!text) return false;
  return /^(hi|hello|hey|good\s+(morning|afternoon|evening)|greetings|howdy|sup)[!.]*$/i.test(text.trim());
};

const detectGeneralQueryClient = (text) => {
  if (!text) return null;
  const t = text.toLowerCase().trim();

  // Guard: electronics keywords
  if (
    /laptop|macbook|thinkpad|computer|notebook|pc|desktop|phone|smartphone|mobile|iphone|galaxy|pixel|oneplus|handset|audio|headphone|earphone|earbud|airpod|speaker|soundbar|tws|bluetooth|tv|television|oled|qled|monitor|display|projector|watch|smartwatch|band|ring|camera|drone|console|ps5|xbox|kindle|printer|vacuum/i.test(t)
  ) {
    return null;
  }

  // 1. Who is / Who was / Who created
  if (
    /\bwho\s+(is|was|are|were|created|made|built|owns)\b/i.test(t) ||
    /\bwho\s+are\s+you\b/i.test(t) ||
    /\bwhat\s+is\s+your\s+name\b/i.test(t) ||
    /\bwhat\s+can\s+you\s+do\b/i.test(t)
  ) {
    return 'personal or identity questions';
  }

  // 2. General knowledge
  if (
    /\bwhat\s+(is|was|are|were)\s+(the\s+)?(capital|weather|meaning|time|date|age|gravity|photosynthesis|population|distance|president|prime\s*minister)\b/i.test(t) ||
    /\bwhere\s+(is|are|was|were)\s+(the\s+)?(located|situated|hyderabad|india|delhi|mumbai|paris|london|usa|america)\b/i.test(t) ||
    /\bwhy\s+(is|are|do|does|did)\s+(the\s+)?(sky|ocean|earth|moon|sun|we|people|birds)\b/i.test(t) ||
    /\bhow\s+to\s+(cook|make\s+pasta|bake|drive|study|lose\s+weight|sleep)\b/i.test(t)
  ) {
    return 'general knowledge or trivia questions';
  }

  // 3. Creative / Tasks
  if (/\b(tell\s+me\s+a\s+(joke|story|riddle)|write\s+a\s+(poem|essay|song|code|script)|sing\s+a\s+song)\b/i.test(t)) {
    return 'creative or general task requests';
  }

  return null;
};

const isElectronicsQueryClient = (text, activeCategory) => {
  if (!text) return false;
  const t = text.toLowerCase().trim();

  if (activeCategory) {
    if (
      /\b(which\s*(one|is\s*(best|better))|compare|difference|vs|versus)\b/i.test(t) ||
      /\b(under|below|budget|within|upto|less than)\s*(?:₹|rs\.?|inr)?\s*[0-9]+/i.test(t) ||
      /\b(battery|camera|ram|storage|display|processor|screen|charging|warranty|color|black|white|blue|silver|5g)\b/i.test(t) ||
      /\b(show\s+more|next|other|reviews?|details?|specs?|price)\b/i.test(t) ||
      /\b(first\s*one|second\s*one|third\s*one|in\s*that|out\s*of)\b/i.test(t)
    ) {
      return true;
    }
  }

  const electronicsPatterns = [
    /\b(laptops?|macbooks?|thinkpads?|notebooks?|ultrabooks?|chromebooks?|computers?|desktops?|pcs?)\b/i,
    /\b(smart\s*phones?|cell\s*phones?|iphones?|pixels?|galaxy|redmi|iqoo|poco|vivo|oppo|xiaomi|realme|smartphones?|mobiles?|handsets?|phns?)\b/i,
    /(?<!head)(?<!ear)\b(phones?|phns?)\b/i,
    /\b(tablets?|ipads?|tabs?|kindles?|paperwhite|remarkable|kobo|digital\s*notebooks?|boox)\b/i,
    /\b(audio|bluetooth|speakers?|soundbars?|earphones?|earbuds?|buds?|headphones?|headsets?|airpods?|ear\s*phones?|ear\s*buds?|head\s*phones?|tws|neckbands?|iems?|soundcore|airdopes|subwoofers?|microphones?|mics?)\b/i,
    /\b(smart\s*tvs?|tvs?|televisions?|oled|qled|4k|8k|monitors?|gaming\s*monitors?|curved\s*monitor|ultrawide|projectors?)\b/i,
    /\b(smart\s*watch(?:es)?|apple\s*watch|galaxy\s*watch|garmin|fitbit|amazfit|smart\s*rings?|oura|whoop|fitness\s*trackers?|smart\s*bands?)\b/i,
    /\b(cameras?|dslrs?|mirrorless|gopro|drones?|quadcopters?|gimbals?|gaming\s*consoles?|ps5|ps4|playstations?|xbox(?:es)?|nintendo|gamepads?|controllers?|vr|meta\s*quest)\b/i,
    /\b(robot\s*vacuums?|cordless\s*vacuums?|stick\s*vacuums?|vacuum|purifiers?|air\s*fryers?|coffee\s*machines?|espresso|blenders?|mixers?|refrigerators?|fridges?|washing\s*machines?|microwaves?|dishwashers?)\b/i,
    /\b(routers?|mesh\s*wi-?fi|access\s*points?|keyboards?|mouse|mice|trackpads?|chargers?|adapters?|power\s*banks?|cables?|usb\s*hubs?|docks?|printers?|scanners?)\b/i,
    /\b(16gb|8gb|32gb|128gb|256gb|512gb|1tb|2tb|ram|ssd|gpu|cpu|processor|ryzen|snapdragon|intel\s*core|rtx|geforce|anc|noise\s*cancell?ation)\b/i,
    /\b(apple|samsung|sony|dell|hp|lenovo|asus|acer|logitech|anker|boat|noise|jbl|bose|marshall|dji|dyson|google|oneplus|canon|nikon|breville|de'?longhi|razer|tp-?link)\b/i,
    /\b(catalog(?:ue)?|products?|items?|electronics|gadgets?|appliances?|devices?)\b/i
  ];

  return electronicsPatterns.some(pat => pat.test(t));
};

const generateClientSideAgentResponse = (query, catalogProducts = []) => {
  if (isGreetingClient(query)) {
    return {
      conversationId: `client-session-${Date.now()}`,
      response: "Hello! I am your AuraStore AI Shopping Advisor. I can help you find, compare, and recommend smartphones, laptops, audio gear, smart TVs, smartwatches, and smart home appliances. What kind of electronics are you looking for today?",
      recommendedProducts: [],
      toolsUsed: ['extract_requirements']
    };
  }

  const generalType = detectGeneralQueryClient(query);
  if (generalType) {
    return {
      conversationId: `client-session-${Date.now()}`,
      response: `Sorry, that is outside my expertise. I am an AI Shopping Advisor designed exclusively to assist with exploring, comparing, and recommending consumer electronics, computing devices, smart appliances, audio gear, and gadgets at AuraStore. I cannot answer questions like "${query.trim()}". How can I help you with our electronics catalogue?`,
      recommendedProducts: [],
      toolsUsed: ['extract_requirements']
    };
  }

  const nonElec = detectNonElectronicsClient(query);
  if (nonElec) {
    return {
      conversationId: `client-session-${Date.now()}`,
      response: `Sorry, that product is not available in our catalogue. AuraStore specializes exclusively in verified consumer electronics, computing devices, smart appliances, audio gear, and gadgets. We do not carry ${nonElec}. Please let us know if you need help finding laptops, smartphones, headphones, smart TVs, tablets, or smartwatches!`,
      recommendedProducts: [],
      toolsUsed: ['extract_requirements']
    };
  }

  if (!isElectronicsQueryClient(query)) {
    return {
      conversationId: `client-session-${Date.now()}`,
      response: `Sorry, that product is not available in our catalogue. AuraStore specializes exclusively in verified consumer electronics, computing devices, smart appliances, audio gear, and gadgets. We only carry electronics. How can I help you with our electronics catalogue?`,
      recommendedProducts: [],
      toolsUsed: ['extract_requirements']
    };
  }

  const lower = query.toLowerCase();



  const toolsUsed = ['extract_requirements', 'search_products', 'retrieve_product_knowledge', 'client_agentic_ranker'];







  let category = null;

  // Audio & Bluetooth evaluated FIRST to prevent 'headphones' matching 'phone'
  if (
    lower.includes('headphone') || lower.includes('earbud') || lower.includes('audio') ||
    lower.includes('earphone') || lower.includes('speaker') || lower.includes('soundbar') ||
    lower.includes('bluetooth') || lower.includes('tws') || lower.includes('airpod') ||
    lower.includes('neckband') || lower.includes('soundcore') || lower.includes('airdopes')
  ) {
    category = 'Audio';
  } else if (
    lower.includes('laptop') || lower.includes('macbook') || lower.includes('thinkpad') ||
    lower.includes('computer') || lower.includes('notebook') || lower.includes('ultrabook')
  ) {
    category = 'Laptops';
  } else if (
    lower.includes('smartphone') || lower.includes('smart phone') || lower.includes('mobile') ||
    lower.includes('mobiles') || lower.includes('handset') || lower.includes('pixel') ||
    lower.includes('galaxy') || lower.includes('iphone') || /phns?/i.test(lower) ||
    (/(?<!head|ear)phones?/i.test(lower) && !lower.includes('headphone') && !lower.includes('earphone'))
  ) {
    category = 'Smartphones';
  } else if (lower.includes('smartwatch') || lower.includes('watch') || lower.includes('fitness')) {
    category = 'Smartwatches';
  } else if (lower.includes('tv') || lower.includes('television')) {
    category = 'Smart TVs & Home Entertainment';
  } else if (lower.includes('charger') || lower.includes('cable') || lower.includes('power bank') || lower.includes('power') || lower.includes('mouse') || lower.includes('keyboard')) {
    category = 'Accessories';
  }

  // Handle direct side-by-side product comparisons (e.g. MacBook Air vs ThinkPad E14)
  const isComparisonQuery = lower.includes('compare') || lower.includes(' vs ') || lower.includes('versus');
  if (isComparisonQuery) {
    const compMatches = (catalogProducts || []).filter(p => {
      const pName = (p.name || '').toLowerCase();
      return (pName.includes('macbook') && lower.includes('macbook')) ||
             (pName.includes('thinkpad') && lower.includes('thinkpad')) ||
             (pName.includes('iphone') && lower.includes('iphone')) ||
             (pName.includes('galaxy') && lower.includes('galaxy')) ||
             (pName.includes('pixel') && lower.includes('pixel')) ||
             (pName.includes('oneplus') && lower.includes('oneplus'));
    });
    if (compMatches.length >= 2) {
      const [p1, p2] = compMatches.slice(0, 2);
      const compText = `Here is our verified side-by-side comparison for **${p1.name}** vs **${p2.name}**:

` +
        `| Feature | ${p1.name} | ${p2.name} |
` +
        `|---|---|---|
` +
        `| **Price** | ₹${Number(p1.price || 0).toLocaleString()} | ₹${Number(p2.price || 0).toLocaleString()} |
` +
        `| **Rating** | ${p1.rating}★ | ${p2.rating}★ |
` +
        `| **Brand** | ${p1.brand || 'Verified'} | ${p2.brand || 'Verified'} |
` +
        `| **Category** | ${p1.category || 'Electronics'} | ${p2.category || 'Electronics'} |

` +
        `**Verdict & Best For:**
` +
        `- **${p1.name}**: Best choice for premium build, reliability, and smooth performance.
` +
        `- **${p2.name}**: Best choice for value-for-money, multitasking, and battery endurance.`;
      return {
        conversationId: `client-session-${Date.now()}`,
        response: compText,
        recommendedProducts: [p1, p2],
        toolsUsed: ['extract_requirements', 'search_products', 'compare_products', 'client_agentic_ranker']
      };
    }
  }







  let budgetMax = null;



  const lakhMatch = lower.match(/(?:under|below|budget|within|upto|less than)?\s*(?:₹|rs\.?|inr)?\s*([0-9]+(?:\.[0-9]+)?)\s*(?:lakhs?|lacs?|l)\b/i);



  if (lakhMatch) {



    const val = parseFloat(lakhMatch[1]) * 100000;



    if (val >= 500) budgetMax = val;



  } else {



    const kMatch = lower.match(/(?:under|below|budget|within|upto|less than)?\s*(?:₹|rs\.?|inr)?\s*([0-9]+(?:\.[0-9]+)?)\s*k\b/i);



    if (kMatch) {



      const val = parseFloat(kMatch[1]) * 1000;



      if (val >= 500) budgetMax = val;



    } else {



      const budgetMatch = lower.match(/(?:under|below|budget|within|upto|less than)\s*(?:₹|rs\.?|inr)?\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{3,7})\b/i);



      if (budgetMatch) {



        let num = parseFloat(budgetMatch[1].replace(/,/g, ''));



        if (num >= 500) budgetMax = num;



      }



    }



  }







  const priorities = [];



  if (lower.includes('16gb') || lower.includes('16 gb') || lower.includes('ram')) priorities.push('16GB RAM');



  if (lower.includes('battery')) priorities.push('Battery');



  if (lower.includes('camera')) priorities.push('Camera');



  if (lower.includes('anc') || lower.includes('noise cancel')) priorities.push('Noise Cancellation');



  if (lower.includes('programming') || lower.includes('coding')) priorities.push('Coding / Dev');







  let candidates = Array.isArray(catalogProducts) ? [...catalogProducts] : [];



  if (category) {
    const catLower = category.toLowerCase();
    const matchedCategory = candidates.filter(p => {
      const pCat = (p.category || '').toLowerCase();
      if (catLower === 'audio') {
        return (pCat.includes('audio') || pCat.includes('headphone') || pCat.includes('speaker')) &&
               !pCat.includes('smartphone') && !pCat.includes('laptop');
      }
      if (catLower === 'smartphones') {
        return pCat.includes('smartphone') && !pCat.includes('audio') && !pCat.includes('laptop');
      }
      if (catLower === 'laptops') {
        return pCat.includes('laptop') && !pCat.includes('smartphone') && !pCat.includes('audio');
      }
      return pCat.includes(catLower);
    });
    if (matchedCategory.length > 0) {
      candidates = matchedCategory;
    }
  } else {
    // When no category detected, strictly filter by significant search words to prevent dumping random products
    const stopWords = new Set(['i', 'want', 'need', 'show', 'find', 'get', 'suggest', 'recommend', 'best', 'good', 'top', 'looking', 'please', 'can', 'give', 'item', 'items', 'product', 'products', 'under', 'below', 'budget', 'within', 'price', 'for', 'with', 'and', 'or', 'in', 'the', 'a', 'an', 'to', 'of', 'is', 'at', 'by', 'on', 'like', 'would']);
    const tokens = lower.split(/[^a-z0-9]+/).filter(t => t.length > 2 && !stopWords.has(t));
    if (tokens.length > 0) {
      candidates = candidates.filter(p => {
        const pText = `${p.name || ''} ${p.category || ''} ${p.brand || ''} ${p.description || ''}`.toLowerCase();
        return tokens.some(tok => pText.includes(tok));
      });
    } else {
      candidates = [];
    }
  }







  if (budgetMax) {

    const withinBudget = candidates.filter(p => p.price <= budgetMax);

    candidates = withinBudget;

  }







  candidates.sort((a, b) => {



    let scoreA = 0;



    let scoreB = 0;



    const textA = `${a.name} ${a.description} ${typeof a.specifications === 'string' ? a.specifications : JSON.stringify(a.specifications || {})}`.toLowerCase();



    const textB = `${b.name} ${b.description} ${typeof b.specifications === 'string' ? b.specifications : JSON.stringify(b.specifications || {})}`.toLowerCase();







    for (const p of priorities) {



      if (textA.includes(p.toLowerCase())) scoreA += 3;



      if (textB.includes(p.toLowerCase())) scoreB += 3;



    }



    if ((a.rating || 0) >= 4.5) scoreA += 1;



    if ((b.rating || 0) >= 4.5) scoreB += 1;



    return scoreB - scoreA;



  });







  const topPicks = candidates.slice(0, 3);



  let reply = '';



  if (topPicks.length === 0) {
    reply = `Sorry, that product is not available in our electronics catalogue. AuraStore specializes exclusively in consumer electronics, computing devices, smart appliances, audio gear, and gadgets. How can I help you with our electronics catalogue?`;
  } else {



    reply = `Based on your request (${category ? `Category: ${category}` : ''}${budgetMax ? `, Budget: Under ₹${budgetMax.toLocaleString()}` : ''}${priorities.length ? `, Priorities: ${priorities.join(', ')}` : ''}), here are our top verified recommendations:\n\n`;



    topPicks.forEach((p, idx) => {



      reply += `${idx + 1}. **${p.name}** — ₹${Number(p.price).toLocaleString()} (${p.rating}★)\n   ${p.description ? p.description.slice(0, 140) + '...' : ''}\n\n`;



    });



    reply += `Would you like to compare these models side-by-side or view full specifications?`;



  }







  return {



    conversationId: `client-session-${Date.now()}`,



    response: reply,



    recommendedProducts: topPicks,



    toolsUsed



  };



};







const AIAdvisorChat = ({ currentUser, products = [], allProducts = [], onOpenProductDetails, onAddToCart, onBuyNow, initialQuery }) => {



  const catalogLookup = (Array.isArray(allProducts) && allProducts.length > 0) ? allProducts : products;







  const resolveFinalProducts = (rawList, productIds) => {



    let resolved = [];



    if (Array.isArray(rawList) && rawList.length > 0) {



      resolved = rawList.map(p => {



        if (typeof p === 'number' || typeof p === 'string') {



          const found = catalogLookup.find(cp => Number(cp.id) === Number(p));



          return found || null;



        }



        return {



          ...p,



          id: p.id || p.product_id,



          name: p.name || 'Electronic Gadget',



          brand: p.brand || '',



          category: p.category || '',



          imageUrl: p.imageUrl || p.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',



          image_url: p.imageUrl || p.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',



          price: Number(p.price || 0),



          rating: Number(p.rating || 4.5)



        };



      }).filter(Boolean);



    }



    if (resolved.length === 0 && Array.isArray(productIds) && productIds.length > 0) {



      resolved = productIds.map(pid => {



        const found = catalogLookup.find(cp => Number(cp.id) === Number(pid));



        if (found) {



          return {



            ...found,



            imageUrl: found.imageUrl || found.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',



            image_url: found.imageUrl || found.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',



            price: Number(found.price || 0),



            rating: Number(found.rating || 4.5)



          };



        }



        return null;



      }).filter(Boolean);



    }



    return resolved;



  };



  const [messages, setMessages] = useState([



    {



      role: 'assistant',



      content: "Hello! I am your AI Shopping Advisor. I can understand your requirements in natural language, search our catalog, analyze real customer reviews, and recommend the best products for your budget and needs. What are you looking for today?",



      toolsExecuted: [],



      products: []



    }



  ]);



  const [input, setInput] = useState(initialQuery || '');



  const [loading, setLoading] = useState(false);



  const [conversationId, setConversationId] = useState(null);



  const messagesEndRef = useRef(null);







  const samplePrompts = [



    "I need a laptop under ₹70,000 for coding with 16GB RAM and good battery life",



    "Which flagship phone has the best camera and battery?",



    "Show me wireless noise-cancelling headphones for travel",



    "Compare Apple MacBook Air M2 and Lenovo ThinkPad E14"



  ];







  const scrollToBottom = () => {



    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });



  };







  useEffect(() => {



    scrollToBottom();



  }, [messages, loading]);







  useEffect(() => {



    if (initialQuery && initialQuery.trim()) {



      handleSend(initialQuery);



    }



  }, [initialQuery]);







  // Reset conversation session and greeting when the logged-in user changes



  useEffect(() => {



    setConversationId(null);



    setMessages([



      {



        role: 'assistant',



        content: currentUser 



          ? `Hello ${currentUser.username}! I am your AI Shopping Advisor. What are you looking for today?`



          : "Hello! I am your AI Shopping Advisor. I can understand your requirements in natural language, search our catalog, analyze real customer reviews, and recommend the best products for your budget and needs. What are you looking for today?",



        toolsExecuted: [],



        products: []



      }



    ]);



  }, [currentUser?.id]);







  const handleSend = async (textToSend) => {



    const query = typeof textToSend === 'string' ? textToSend : input;



    if (!query || !query.trim() || loading) return;







    const userMessage = { role: 'user', content: query.trim() };



    setMessages(prev => [...prev, userMessage]);



    setInput('');



    setLoading(true);







    let chatData = null;







    // 1. Primary: Try Spring Boot Backend (/api/chat) -> Python AI Agent



    try {



      const response = await chatApi.sendMessage({



        message: query.trim(),



        conversationId: conversationId,



        userId: currentUser?.id



      });



      chatData = response.data;



      if (chatData) {



        chatData.recommendedProducts = resolveFinalProducts(



          chatData.recommendedProducts || chatData.recommended_products || chatData.products,



          chatData.product_ids || chatData.productIds



        );



      }

        if (chatData.response) {
          const respLower = chatData.response.toLowerCase();
          const isUnavailable = [
            'not available',
            'not in our catalogue',
            'not part of our catalogue',
            'is not part of our catalogue',
            'does not contain any',
            'do not contain any',
            'do not carry',
            'sorry, that product',
            'sorry, the product',
            'no products found',
            'electronics only',
            'only carry electronics',
            'outside my expertise',
            'cannot answer'
          ].some(ph => respLower.includes(ph));

          if (isUnavailable) {
            chatData.recommendedProducts = [];
          }
        }



    } catch (backendErr) {



      console.warn('Backend /api/chat unreachable, trying direct AI microservice on :8002...', backendErr);







      // 2. Secondary: Direct Python AI Service (http://localhost:8002/agent/chat)



      try {



        const directResp = await fetch('http://localhost:8002/agent/chat', {



          method: 'POST',



          headers: { 'Content-Type': 'application/json' },



          body: JSON.stringify({



            conversation_id: conversationId || undefined,



            message: query.trim(),



            user_id: currentUser?.id



          })



        });



        if (directResp.ok) {



          const directJson = await directResp.json();



          const matchedProducts = resolveFinalProducts(



            directJson.recommended_products || directJson.recommendedProducts,



            directJson.product_ids



          );



          const directRespLower = (directJson.response || '').toLowerCase();
          const isDirectUnavailable = [
            'not available',
            'not in our catalogue',
            'not part of our catalogue',
            'is not part of our catalogue',
            'does not contain any',
            'do not contain any',
            'do not carry',
            'sorry, that product',
            'sorry, the product',
            'no products found',
            'electronics only',
            'only carry electronics',
            'outside my expertise',
            'cannot answer'
          ].some(ph => directRespLower.includes(ph));

          chatData = {
            conversationId: directJson.conversation_id,
            response: directJson.response,
            recommendedProducts: isDirectUnavailable ? [] : matchedProducts,
            toolsUsed: directJson.tools_used || []
          };



        }



      } catch (directErr) {



        console.warn('Direct AI microservice unreachable as well, falling back to local agent:', directErr);



      }



    }







    // 3. Tertiary: Local Intelligent Agentic Fallback



    if (!chatData) {



      chatData = generateClientSideAgentResponse(query.trim(), catalogLookup);



    }







    if (chatData?.conversationId) {



      setConversationId(chatData.conversationId);



    }







    let finalProducts = chatData?.recommendedProducts || [];



    const lowerQuery = query.toLowerCase();



    if (/\b(one|1|single|a\s+single|only\s+one|just\s+one|best\s+one)\b/i.test(lowerQuery) || /\b(refer|suggest|give|show|recommend)\s+(?:me\s+)?a\s+(phone|mobile|laptop|watch|headphone|product|gadget)\b/i.test(lowerQuery)) {



      finalProducts = finalProducts.slice(0, 1);



    } else if (/\b(two|2|pair|couple|top\s*2)\b/i.test(lowerQuery)) {



      finalProducts = finalProducts.slice(0, 2);



    }







    const assistantMessage = {



      role: 'assistant',



      content: chatData?.response || chatData?.reply || "I processed your request, but could not produce a text summary.",



      toolsExecuted: chatData?.toolsUsed || chatData?.toolsExecuted || [],



      products: finalProducts



    };







    setMessages(prev => [...prev, assistantMessage]);







    if (currentUser?.id && chatData?.recommendedProducts?.length > 0) {



      interactionApi.log({



        userId: currentUser.id,



        productId: chatData.recommendedProducts[0].id,



        interactionType: 'AI_SEARCH_QUERY'



      }).catch(() => {});



    }







    setLoading(false);



  };







  const handleReset = () => {



    setConversationId(null);



    setMessages([



      {



        role: 'assistant',



        content: "Conversation context cleared. How else can I assist your shopping journey?",



        toolsExecuted: [],



        products: []



      }



    ]);



  };







  return (



    <div style={{



      display: 'flex',



      flexDirection: 'column',



      height: '100%',



      maxHeight: '100%',



      minHeight: 0,



      background: '#ffffff',



      borderRadius: '12px',



      border: '1px solid #e2e8f0',



      overflow: 'hidden',



      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)'



    }}>



      {/* Header */}



      <div style={{



        padding: '0.85rem 1.25rem',



        background: '#0a2046',



        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',



        display: 'flex',



        alignItems: 'center',



        justifyContent: 'space-between',



        flexShrink: 0



      }}>



        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>



          <div style={{



            width: '36px',



            height: '36px',



            borderRadius: '10px',



            background: 'linear-gradient(135deg, #ff9800 0%, #f59e0b 100%)',



            display: 'flex',



            alignItems: 'center',



            justifyContent: 'center',



            color: '#fff',



            boxShadow: '0 2px 8px rgba(255, 152, 0, 0.35)'



          }}>



            <Bot size={20} />



          </div>



          <div>



            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff' }}>



              AI Shopping Advisor



              <span className="badge badge-success" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>



                Multi-Tool RAG



              </span>



            </h3>



            <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: 0 }}>



              Grounded in live PostgreSQL specifications, customer reviews & pure Python recommendation engine



            </p>



          </div>



        </div>



        <button



          className="btn btn-secondary"



          onClick={handleReset}



          title="Reset Conversation"



          style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}



        >



          <RefreshCw size={13} /> New Chat



        </button>



      </div>







      {/* Message History Container */}



      <div style={{



        flex: 1,



        minHeight: 0,



        overflowY: 'auto',



        padding: '1.25rem',



        display: 'flex',



        flexDirection: 'column',



        gap: '1rem',



        background: '#f8fafc'



      }}>



        {messages.map((msg, idx) => (



          <div



            key={idx}



            style={{



              display: 'flex',



              gap: '0.75rem',



              maxWidth: msg.role === 'user' ? '80%' : '90%',



              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',



              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'



            }}



          >



            <div



              style={{



                width: '32px',



                height: '32px',



                borderRadius: '8px',



                flexShrink: 0,



                display: 'flex',



                alignItems: 'center',



                justifyContent: 'center',



                background: msg.role === 'user' ? '#ff9800' : '#0a2046',



                color: '#fff'



              }}



            >



              {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}



            </div>







            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>



              <div



                style={{



                  padding: '0.9rem 1.15rem',



                  borderRadius: msg.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',



                  background: msg.role === 'user' ? '#ff9800' : '#ffffff',



                  color: msg.role === 'user' ? '#ffffff' : '#0f172a',



                  border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0',



                  lineHeight: '1.55',



                  fontSize: '0.92rem',



                  whiteSpace: 'pre-wrap',



                  boxShadow: msg.role === 'user' ? '0 2px 8px rgba(255, 152, 0, 0.25)' : '0 1px 4px rgba(0, 0, 0, 0.05)'



                }}



              >



                {msg.content}



              </div>







              {/* Tools Executed Badges */}



              {msg.toolsExecuted && msg.toolsExecuted.length > 0 && (



                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>



                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>



                    <Cpu size={12} /> Agent Tools:



                  </span>



                  {msg.toolsExecuted.map((tool, tIdx) => (



                    <span key={tIdx} className="badge badge-info" style={{ fontSize: '0.68rem', fontFamily: 'monospace', padding: '2px 7px' }}>



                      {tool}



                    </span>



                  ))}



                </div>



              )}







              {/* Recommended Product Cards inside chat */}



              {msg.products && msg.products.length > 0 && (



                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>



                  {msg.products.map(prod => (



                    <div



                      key={prod.id}



                      style={{



                        background: '#ffffff',



                        border: '1px solid #e2e8f0',



                        borderRadius: '8px',



                        padding: '0.75rem',



                        display: 'flex',



                        flexDirection: 'column',



                        gap: '0.5rem',



                        transition: 'transform 0.2s, box-shadow 0.2s',



                        cursor: 'pointer',



                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)'



                      }}



                      onClick={() => onOpenProductDetails && onOpenProductDetails(prod.id)}



                    >



                      <div style={{ height: '110px', borderRadius: '6px', overflow: 'hidden', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>



                        <img 



                          src={prod.imageUrl || prod.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600'} 



                          alt={prod.name} 



                          onError={(e) => { 



                            e.target.onerror = null; 



                            e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600'; 



                          }}



                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 



                        />



                      </div>



                      <div>



                        <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>{prod.brand} • {prod.category}</span>



                        <h4 style={{ fontSize: '0.85rem', fontWeight: 600, margin: '2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1e293b' }}>



                          {prod.name}



                        </h4>



                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>



                          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>



                            ₹{prod.price?.toLocaleString('en-IN')}



                          </span>



                          <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>



                            ★ {prod.rating}



                          </span>



                        </div>



                      </div>



                      <div style={{ display: 'flex', gap: '0.35rem', marginTop: 'auto' }}>



                        <button



                          className="btn btn-secondary"



                          style={{ flex: 1, padding: '0.35rem', fontSize: '0.75rem', color: '#334155', background: '#f1f5f9', border: '1px solid #cbd5e1' }}



                          onClick={(e) => {



                            e.stopPropagation();



                            onOpenProductDetails && onOpenProductDetails(prod.id);



                          }}



                        >



                          Details



                        </button>



                        <button



                          className="btn btn-primary"



                          style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', background: '#ff9800', border: 'none' }}



                          title="Add to Cart"



                          onClick={(e) => {



                            e.stopPropagation();



                            onAddToCart && onAddToCart(prod);



                          }}



                        >



                          <ShoppingBag size={13} />



                        </button>



                        <button



                          className="btn"



                          style={{



                            padding: '0.35rem 0.6rem',



                            fontSize: '0.75rem',



                            fontWeight: 700,



                            background: '#0d2757',



                            color: '#ffffff',



                            border: 'none',



                            borderRadius: '4px',



                            cursor: 'pointer'



                          }}



                          title="Buy Now"



                          onClick={(e) => {



                            e.stopPropagation();



                            onBuyNow && onBuyNow(prod);



                          }}



                        >



                          Buy Now



                        </button>



                      </div>



                    </div>



                  ))}



                </div>



              )}



            </div>



          </div>



        ))}







        {loading && (



          <div style={{ display: 'flex', gap: '0.85rem', alignSelf: 'flex-start', alignItems: 'center' }}>



            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#0a2046', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>



              <Sparkles size={16} className="spin" />



            </div>



            <div style={{ padding: '0.75rem 1.25rem', borderRadius: '4px 14px 14px 14px', background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#64748b' }}>



              <span>Agent is reasoning, executing tools, and retrieving grounded facts...</span>



            </div>



          </div>



        )}



        <div ref={messagesEndRef} />



      </div>







      {/* Suggested Prompts Bar */}



      <div style={{



        padding: '0.5rem 1.25rem',



        background: '#ffffff',



        borderTop: '1px solid #e2e8f0',



        display: 'flex',



        gap: '0.5rem',



        overflowX: 'auto',



        flexShrink: 0



      }}>



        {samplePrompts.map((prompt, idx) => (



          <button



            key={idx}



            className="btn btn-secondary"



            style={{



              fontSize: '0.75rem',



              padding: '0.35rem 0.75rem',



              whiteSpace: 'nowrap',



              borderRadius: '20px',



              background: '#f8fafc',



              color: '#334155',



              border: '1px solid #cbd5e1'



            }}



            onClick={() => handleSend(prompt)}



            disabled={loading}



          >



            <Sparkles size={11} style={{ marginRight: '4px', color: '#ff9800' }} />



            {prompt}



          </button>



        ))}



      </div>







      {/* Chat Input Bar - Guaranteed Pinned & Visible */}



      <div style={{



        padding: '0.85rem 1.25rem',



        background: '#ffffff',



        borderTop: '1px solid #e2e8f0',



        flexShrink: 0,



        zIndex: 10



      }}>



        <form



          onSubmit={(e) => {



            e.preventDefault();



            handleSend();



          }}



          style={{ display: 'flex', gap: '0.75rem' }}



        >



          <input



            type="text"



            className="form-control"



            placeholder="Type your requirements (e.g., 'MacBook Air M2 vs ThinkPad E14 for coding under 70000')..."



            value={input}



            onChange={(e) => setInput(e.target.value)}



            disabled={loading}



            style={{



              borderRadius: '8px',



              padding: '10px 14px',



              fontSize: '0.9rem',



              borderColor: '#cbd5e1',



              color: '#0f172a',



              background: '#ffffff'



            }}



          />



          <button



            type="submit"



            className="btn btn-primary"



            disabled={loading || !input.trim()}



            style={{



              padding: '0.75rem 1.4rem',



              background: '#ff9800',



              border: 'none',



              color: '#ffffff',



              fontWeight: 700,



              borderRadius: '8px',



              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',



              display: 'flex',



              alignItems: 'center',



              gap: '6px',



              opacity: loading || !input.trim() ? 0.6 : 1



            }}



          >



            <Send size={15} /> Send



          </button>



        </form>



      </div>



    </div>



  );



};







export default AIAdvisorChat;



