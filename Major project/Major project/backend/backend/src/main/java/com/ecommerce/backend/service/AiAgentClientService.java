package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.ChatRequest;
import com.ecommerce.backend.dto.ChatResponse;
import com.ecommerce.backend.model.ChatMessage;
import com.ecommerce.backend.model.Conversation;
import com.ecommerce.backend.model.Product;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.repository.ChatMessageRepository;
import com.ecommerce.backend.repository.ConversationRepository;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AiAgentClientService {

    private static final Logger logger = LoggerFactory.getLogger(AiAgentClientService.class);

    @Value("${ai.service.url:http://localhost:8002}")
    private String aiServiceUrl;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public ChatResponse handleChat(ChatRequest request) {
        String convId = (request.getConversationId() != null && !request.getConversationId().trim().isEmpty())
                ? request.getConversationId()
                : UUID.randomUUID().toString();

        User user = (request.getUserId() != null)
                ? userRepository.findById(request.getUserId()).orElse(null)
                : null;

        Conversation conversation = conversationRepository.findById(convId)
                .orElseGet(() -> {
                    Conversation c = new Conversation(convId, user);
                    return conversationRepository.save(c);
                });

        // Record User Message
        ChatMessage userMsg = new ChatMessage(conversation, "user", request.getMessage(), null);
        chatMessageRepository.save(userMsg);

        // Guard: Check for non-electronics queries (groceries, fruits, vegetables, clothing, kitchenware, etc.)
        String nonElectronicsCategory = detectNonElectronics(request.getMessage());
        if (nonElectronicsCategory != null) {
            conversation.setActiveCategory(null);
            conversation.setBudgetMax(null);
            conversationRepository.save(conversation);

            String reply = "Sorry, that product is not available in our catalogue. AuraStore specializes exclusively in "
                    + "verified consumer electronics, computing devices, smart home appliances, audio gear, and gadgets. "
                    + "We do not carry " + nonElectronicsCategory + ". "
                    + "Please let us know if you need help finding laptops, smartphones, headphones, smart TVs, tablets, or smartwatches!";

            ChatMessage assistantMsg = new ChatMessage(conversation, "assistant", reply, null);
            chatMessageRepository.save(assistantMsg);

            ChatResponse chatResp = new ChatResponse(convId, reply, Collections.emptyList(), List.of("extract_requirements"), Collections.emptyMap());
            chatResp.setFollowUpSuggestions(List.of(
                    "Show top laptops under ₹70,000",
                    "Which flagship phone has the best camera and battery?",
                    "Show wireless noise-cancelling headphones"
            ));
            return chatResp;
        }

        // 1. Try forwarding to Python AI Agent microservice
        try {
            String url = aiServiceUrl + "/agent/chat";
            logger.info("Calling Python AI Agent microservice at: {}", url);

            Map<String, Object> payload = new HashMap<>();
            payload.put("conversation_id", convId);
            payload.put("message", request.getMessage());
            payload.put("user_id", request.getUserId());
            payload.put("active_category", conversation.getActiveCategory());
            payload.put("budget_max", conversation.getBudgetMax());

            ResponseEntity<Map> response = restTemplate.postForEntity(url, payload, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map body = response.getBody();
                String reply = (String) body.get("response");
                List<String> tools = (List<String>) body.getOrDefault("tools_used", new ArrayList<>());
                Map<String, Object> reqs = (Map<String, Object>) body.getOrDefault("extracted_requirements", new HashMap<>());

                List<Long> productIds = new ArrayList<>();
                Object rawPids = body.get("product_ids");
                if (rawPids instanceof List<?>) {
                    for (Object item : (List<?>) rawPids) {
                        if (item instanceof Number) {
                            productIds.add(((Number) item).longValue());
                        }
                    }
                }
                List<Product> products = (!productIds.isEmpty())
                        ? productRepository.findAllById(productIds)
                        : Collections.emptyList();

                String lowerReply = (reply != null) ? reply.toLowerCase() : "";
                boolean isUnavailable = lowerReply.contains("not available") ||
                                        lowerReply.contains("not in our catalogue") ||
                                        lowerReply.contains("not part of our catalogue") ||
                                        lowerReply.contains("does not contain any") ||
                                        lowerReply.contains("sorry, that product") ||
                                        lowerReply.contains("electronics only");
                if (isUnavailable) {
                    products = Collections.emptyList();
                }

                int targetLimit = (reqs != null && reqs.get("requested_count") != null)
                        ? ((Number) reqs.get("requested_count")).intValue()
                        : 3;
                if (!isUnavailable && targetLimit > 0 && products.size() > targetLimit) {
                    products = products.subList(0, targetLimit);
                }

                // Update conversation state
                if (reqs != null) {
                    if (reqs.containsKey("category")) conversation.setActiveCategory((String) reqs.get("category"));
                    if (reqs.containsKey("budget_max") && reqs.get("budget_max") != null) {
                        conversation.setBudgetMax(Double.valueOf(reqs.get("budget_max").toString()));
                    }
                    conversationRepository.save(conversation);
                }

                // Record Assistant Message
                String metaJson = objectMapper.writeValueAsString(Map.of("tools", tools, "reqs", reqs != null ? reqs : Map.of()));
                ChatMessage assistantMsg = new ChatMessage(conversation, "assistant", reply, metaJson);
                chatMessageRepository.save(assistantMsg);

                ChatResponse chatResp = new ChatResponse(convId, reply, products, tools, reqs);
                chatResp.setFollowUpSuggestions(List.of("Which one has better battery life?", "Compare these models side-by-side", "Show customer reviews for the first product"));
                return chatResp;
            }
        } catch (Exception ex) {
            logger.warn("Python AI Service unavailable at {}, executing intelligent local Agentic pipeline: {}",
                    aiServiceUrl, ex.getMessage());
        }

        // 2. Local Fallback Agentic Workflow
        return executeLocalAgentWorkflow(conversation, request.getMessage());
    }

    private ChatResponse executeLocalAgentWorkflow(Conversation conversation, String userMessage) {
        List<String> toolsUsed = new ArrayList<>();
        Map<String, Object> extractedReqs = extractRequirementsFromText(userMessage, conversation);

        toolsUsed.add("extract_requirements");

        String category = (String) extractedReqs.get("category");
        Double budgetMax = (Double) extractedReqs.get("budget_max");
        String purpose = (String) extractedReqs.get("purpose");
        List<String> priorities = (List<String>) extractedReqs.get("priorities");

        // Save active requirements to memory
        if (category != null) conversation.setActiveCategory(category);
        if (budgetMax != null) conversation.setBudgetMax(budgetMax);
        conversationRepository.save(conversation);

        // Tool: search_products
        toolsUsed.add("search_products");
        List<Product> candidates = productRepository.findAll();

        String lowerUserMsg = userMessage.toLowerCase();
        boolean isComparison = lowerUserMsg.contains("compare") || lowerUserMsg.contains(" vs ") || lowerUserMsg.contains("versus");
        if (isComparison) {
            List<Product> comparisonMatches = new ArrayList<>();
            for (Product prod : candidates) {
                String pLower = prod.getName().toLowerCase();
                if ((pLower.contains("macbook") && lowerUserMsg.contains("macbook")) ||
                    (pLower.contains("thinkpad") && lowerUserMsg.contains("thinkpad")) ||
                    (pLower.contains("iphone") && lowerUserMsg.contains("iphone")) ||
                    (pLower.contains("galaxy") && lowerUserMsg.contains("galaxy")) ||
                    (pLower.contains("pixel") && lowerUserMsg.contains("pixel")) ||
                    (pLower.contains("oneplus") && lowerUserMsg.contains("oneplus"))) {
                    comparisonMatches.add(prod);
                }
            }
            if (comparisonMatches.size() >= 2) {
                candidates = comparisonMatches;
            }
        }

        if (category != null && !category.isEmpty()) {
            candidates = candidates.stream()
                    .filter(p -> p.getCategory().toLowerCase().contains(category.toLowerCase()) ||
                                 category.toLowerCase().contains(p.getCategory().toLowerCase()))
                    .collect(Collectors.toList());
        } else {
            // When no explicit category detected, strictly filter by query search tokens to prevent dumping random electronics
            Set<String> stopWords = Set.of(
                "i", "me", "my", "we", "our", "you", "your", "he", "she", "it", "they",
                "want", "need", "show", "find", "get", "suggest", "recommend", "best", "good",
                "top", "looking", "please", "can", "give", "item", "items", "product", "products",
                "under", "below", "budget", "within", "price", "for", "with", "and", "or", "in",
                "the", "a", "an", "to", "of", "is", "at", "by", "on", "any", "some", "like", "would"
            );
            List<String> queryTokens = Arrays.stream(lowerUserMsg.split("[^a-zA-Z0-9]+"))
                    .filter(t -> t.length() > 2 && !stopWords.contains(t))
                    .collect(Collectors.toList());

            if (!queryTokens.isEmpty()) {
                candidates = candidates.stream()
                        .filter(p -> {
                            String pText = (p.getName() + " " + p.getCategory() + " " + p.getBrand() + " " + p.getDescription() + " " + (p.getSpecifications() != null ? p.getSpecifications() : "")).toLowerCase();
                            return queryTokens.stream().anyMatch(pText::contains);
                        })
                        .collect(Collectors.toList());
            } else {
                candidates = Collections.emptyList();
            }
        }

        if (budgetMax != null && budgetMax > 0) {
            candidates = candidates.stream()
                    .filter(p -> p.getPrice() <= budgetMax)
                    .collect(Collectors.toList());
        }

        // Tool: get_recommendations (Rank candidates)
        toolsUsed.add("get_recommendations");
        final String searchPurpose = purpose != null ? purpose.toLowerCase() : "";
        candidates.sort((p1, p2) -> {
            int score1 = 0;
            int score2 = 0;
            String text1 = (p1.getName() + " " + p1.getDescription() + " " + p1.getSpecifications()).toLowerCase();
            String text2 = (p2.getName() + " " + p2.getDescription() + " " + p2.getSpecifications()).toLowerCase();

            for (String prio : priorities) {
                if (text1.contains(prio.toLowerCase())) score1 += 2;
                if (text2.contains(prio.toLowerCase())) score2 += 2;
            }
            if (!searchPurpose.isEmpty()) {
                if (text1.contains(searchPurpose)) score1 += 3;
                if (text2.contains(searchPurpose)) score2 += 3;
            }
            if (p1.getRating() != null && p1.getRating() >= 4.5) score1 += 1;
            if (p2.getRating() != null && p2.getRating() >= 4.5) score2 += 1;

            return Integer.compare(score2, score1);
        });

        int targetLimit = (extractedReqs.get("requested_count") != null) ? (Integer) extractedReqs.get("requested_count") : 3;
        List<Product> topPicks = candidates.stream().limit(targetLimit).collect(Collectors.toList());

        // Tool: retrieve_product_knowledge
        toolsUsed.add("retrieve_product_knowledge");

        // Grounded Natural Language Response Generation
        StringBuilder reply = new StringBuilder();
        if (topPicks.isEmpty()) {
            reply.append("Sorry, that product is not available in our electronics catalogue. ");
            if (category != null) {
                reply.append("We couldn't find any ").append(category).append(" matching your criteria");
                if (budgetMax != null) reply.append(" under ₹").append(budgetMax.intValue());
                reply.append(". You might want to consider adjusting your budget or searching for other electronics.");
            } else {
                reply.append("AuraStore specializes exclusively in consumer electronics, computing devices, smart appliances, audio gear, and gadgets. How can I help you with our electronics catalogue?");
            }
        } else {
            reply.append("Based on your requirements (");
            if (category != null) reply.append("Category: ").append(category);
            if (budgetMax != null) reply.append(", Budget: Under ₹").append(budgetMax.intValue());
            if (purpose != null) reply.append(", Purpose: ").append(purpose);
            if (!priorities.isEmpty()) reply.append(", Priorities: ").append(String.join(", ", priorities));
            reply.append("), here are the best grounded matches from our verified catalogue:\n\n");

            int rank = 1;
            for (Product p : topPicks) {
                reply.append(rank++).append(". **").append(p.getName()).append("** (₹").append(p.getPrice()).append(")\n")
                     .append("   - Rating: ").append(p.getRating()).append("★ (").append(p.getReviewCount()).append(" reviews)\n")
                     .append("   - Highlight: ").append(p.getDescription().substring(0, Math.min(130, p.getDescription().length()))).append("...\n\n");
            }

            reply.append("Would you like me to compare these models side-by-side or dive into customer reviews?");
        }

        // Record message in history
        ChatMessage botMsg = new ChatMessage(conversation, "assistant", reply.toString(), null);
        chatMessageRepository.save(botMsg);

        ChatResponse response = new ChatResponse(conversation.getId(), reply.toString(), topPicks, toolsUsed, extractedReqs);
        response.setFollowUpSuggestions(List.of(
                "Which one has better battery life?",
                "Compare top 2 models",
                "What do customer reviews say?"
        ));
        return response;
    }

    private Map<String, Object> extractRequirementsFromText(String text, Conversation conversation) {
        Map<String, Object> reqs = new HashMap<>();
        String lower = text.toLowerCase();

        // 1. Category extraction (Evaluate Audio & Bluetooth FIRST to strictly prevent 'headphone' matching 'phone')
        String category = null;
        if (lower.contains("headphone") || lower.contains("earbud") || lower.contains("audio") ||
            lower.contains("earphone") || lower.contains("sound") || lower.contains("bluetooth") ||
            lower.contains("speaker") || lower.contains("tws") || lower.contains("airpod") ||
            lower.contains("neckband") || lower.contains("soundcore") || lower.contains("airdopes")) {
            category = "Audio & Headphones";
        } else if (lower.contains("laptop") || lower.contains("macbook") || lower.contains("thinkpad") ||
                   lower.contains("notebook") || lower.contains("computer") || lower.contains("ultrabook")) {
            category = "Laptops";
        } else if ((lower.matches(".*(?<!head|ear)\\bphones?\\b.*") && !lower.contains("headphone") && !lower.contains("earphone")) ||
                   lower.contains("smartphone") || lower.contains("mobile") || lower.contains("pixel") ||
                   lower.contains("galaxy") || lower.contains("iphone") || lower.contains("iqoo") ||
                   lower.contains("poco") || lower.contains("vivo") || lower.contains("oppo") ||
                   lower.contains("redmi") || lower.contains("realme") || lower.contains("oneplus")) {
            category = "Smartphones";
        } else if (lower.contains("watch") || lower.contains("smartwatch") || lower.contains("fitness")) {
            category = "Smartwatches";
        } else if (lower.contains("tv") || lower.contains("television")) {
            category = "Smart TVs & Home Entertainment";
        } else if (conversation != null && conversation.getActiveCategory() != null) {
            boolean isNewSearch = lower.contains("find") || lower.contains("show") || lower.contains("recommend") ||
                                  lower.contains("which") || lower.contains("compare") || lower.contains("vs") ||
                                  lower.contains("need") || lower.contains("want") || lower.contains("bluetooth");
            if (!isNewSearch) {
                category = conversation.getActiveCategory();
            }
        }
        reqs.put("category", category);

        // 2. Budget extraction (handles ₹70,000, 70000, 70k, under 70000, etc.)
        Double budget = null;
        Pattern p = Pattern.compile("(?:under|below|budget|within|upto|less than)?\\s*(?:₹|rs\\.?|inr)?\\s*([0-9]+(?:,[0-9]+)?)\\s*(?:k)?", Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(lower);
        if (m.find()) {
            String val = m.group(1).replace(",", "");
            try {
                double parsed = Double.parseDouble(val);
                if (lower.contains(val + "k") || lower.contains(val + " k")) {
                    parsed *= 1000;
                }
                if (parsed > 500) { // filter out small random numbers
                    budget = parsed;
                }
            } catch (NumberFormatException ignored) {}
        }
        if (budget == null && conversation != null && conversation.getBudgetMax() != null) {
            budget = conversation.getBudgetMax(); // Retain from memory!
        }
        reqs.put("budget_max", budget);

        // 3. Purpose extraction
        String purpose = null;
        if (lower.contains("programming") || lower.contains("coding") || lower.contains("developer") || lower.contains("software")) {
            purpose = "programming";
        } else if (lower.contains("gaming") || lower.contains("games")) {
            purpose = "gaming";
        } else if (lower.contains("photography") || lower.contains("camera") || lower.contains("photos")) {
            purpose = "photography";
        } else if (lower.contains("student") || lower.contains("study") || lower.contains("college")) {
            purpose = "studies";
        }
        reqs.put("purpose", purpose);

        // 4. Priorities / Features
        List<String> priorities = new ArrayList<>();
        if (lower.contains("battery") || lower.contains("battery life")) priorities.add("battery");
        if (lower.contains("16 gb") || lower.contains("16gb") || lower.contains("ram")) priorities.add("16GB RAM");
        if (lower.contains("camera")) priorities.add("camera");
        if (lower.contains("noise cancel") || lower.contains("anc")) priorities.add("ANC");
        if (lower.contains("display") || lower.contains("screen") || lower.contains("oled")) priorities.add("Display");
        if (lower.contains("fast charge") || lower.contains("charging")) priorities.add("Fast Charging");
        reqs.put("priorities", priorities);

        // 5. Quantity / Count Intent
        Integer requestedCount = null;
        if (lower.matches(".*\\b(one|1|single|a\\s+single|only\\s+one|just\\s+one|best\\s+one)\\b.*") || lower.matches(".*\\b(refer|suggest|give|show|recommend)\\s+(?:me\\s+)?a\\s+(phone|mobile|laptop|watch|headphone|product|gadget)\\b.*")) {
            requestedCount = 1;
        } else if (lower.matches(".*\\b(two|2|pair|couple|top\\s*2)\\b.*")) {
            requestedCount = 2;
        } else if (lower.matches(".*\\b(three|3|top\\s*3)\\b.*")) {
            requestedCount = 3;
        }
        reqs.put("requested_count", requestedCount);

        return reqs;
    }

    public List<ChatMessage> getConversationMessages(String conversationId) {
        return chatMessageRepository.findByConversationIdOrderByTimestampAsc(conversationId);
    }

    public String detectNonElectronics(String text) {
        if (text == null || text.trim().isEmpty()) return null;
        String t = text.toLowerCase();

        // Exceptions: Genuine electronics terms
        if (t.matches(".*\\b(electric\\s*(?:shaver|toothbrush|blanket|kettle|cooker)|hair\\s*(?:dryer|styler)|airwrap)\\b.*") ||
            t.matches(".*\\b(smart\\s*(?:watch|scale|ring|mirror|plug|tv|home))\\b.*") ||
            t.matches(".*\\b(laptop\\s*(?:bag|sleeve|case|stand)|phone\\s*(?:case|cover|holder))\\b.*") ||
            t.matches(".*\\b(air\\s*fryer|coffee\\s*(?:maker|machine)|espresso|blender|mixer|microwave|refrigerator|fridge|washing\\s*machine|vacuum|purifier)\\b.*")) {
            return null;
        }

        // Groceries, Food, Vegetables, Fruits, Kitchenware, Cookware
        if (t.matches(".*\\b(grocer(?:y|ies)|foods?|snacks?|fruits?|friuts?|vegetables?|vegetbale|vegtables|veggies?|vegies?|apples?|bananas?|mangos?|mangoes?|oranges?|potatoes?|potatos?|tomatoes?|tomatos?|onions?|garlic|ginger|carrots?|cabbages?|spinach|lemons?|rice|wheat|flour|atta|dal|pulses?|bread|milk|cheeses?|butter|yogurt|curd|eggs?|meats?|chickens?|fish|seafood|mutton|prawns?|cooking\\s*oil|mustard\\s*oil|sunflower\\s*oil|ghee|spices?|masala|sugar|salt|tea|chocolates?|cand(?:y|ies)|biscuits?|cookies?|beverages?|soft\\s*drinks?|juices?|sodas?|beers?|wines?|alcohol)\\b.*") ||
            t.matches(".*\\b(cutters?|choppers?|peelers?|knives|knife|scissors?|graters?|slicers?|cookware|pans?|pots?|utensils?|plates?|bowls?|spoons?|forks?|water\\s*bottles?|bottles?|flasks?|lunch\\s*box(?:es)?|tiffin(?:s)?|cooker(?:s)?|gas\\s*stove|gas\\s*cylinder)\\b.*")) {
            return "food, groceries & kitchenware";
        }

        // Clothing, Fashion, Apparel & Footwear
        if (t.matches(".*\\b(dresses?|dresss?|clothes?|clothing|cloths?|apparels?|garments?|shirts?|t-?shirts?|tees?|pants?|trousers?|jeans?|jackets?|hoodies?|sweaters?|coats?|suits?|blazers?|sarees?|saris?|kurtas?|kurtis?|lehengas?|skirts?|shorts?|underwears?|socks?|shoes?|sneakers?|boots?|sandals?|slippers?|footwear|heels?|crocs?|belts?|wallets?|handbags?|purses?|tote\\s*bags?|luggage|suitcases?|jewelr(?:y|ies)|necklaces?|rings?\\s*(?:gold|diamond|silver)?|earrings?|bracelets?|bangles?|fashion)\\b.*")) {
            return "clothing, fashion & footwear";
        }

        // Beauty, Skincare & Cosmetics
        if (t.matches(".*\\b(skin\\s*cares?|skincare|skin-care|cosmetics?|makeups?|make-up|face\\s*wash|cleansers?|toners?|serums?|moisturizers?|lotions?|sunscreens?|sunblocks?|lipsticks?|lip\\s*balms?|lip\\s*gloss|eyeliners?|mascaras?|foundations?|concealers?|creams?|night\\s*cream|day\\s*cream|cold\\s*cream|perfumes?|deodorants?|fragrances?|colognes?|shampoos?|conditioners?|hair\\s*oils?|hair\\s*care|body\\s*wash|soaps?|scrubs?|sheet\\s*masks?|beauty\\s*products?|kajal|blush|compact\\s*powder)\\b.*")) {
            return "beauty & personal care";
        }

        // Furniture, Home Decor & Bedding
        if (t.matches(".*\\b(furnitures?|sofas?|couches?|beds?|cots?|mattresses?|pillows?|blankets?|bedsheets?|curtains?|dining\\s*tables?|study\\s*tables?|coffee\\s*tables?|chairs?\\s*(?:wooden|dining|plastic)?|tables?\\s*(?:wooden|dining)?|wardrobes?|cupboards?|closets?|bookshelves?|carpets?|rugs?|mats?|cushions?)\\b.*")) {
            return "furniture & home decor";
        }

        // Medicines & Healthcare
        if (t.matches(".*\\b(medicines?|pharmacy|drugs?|pills?|syrups?|ointments?|antibiotics?|painkillers?|paracetamol|aspirin|vitamins?\\s*(?:tablets?|capsules?|supplements?)?|protein\\s*powders?|whey\\s*protein|bandages?|first\\s*aid|cough\\s*syrup)\\b.*")) {
            return "medicines & healthcare";
        }

        // Books, Stationery & Toys
        if (t.matches(".*\\b(novels?|fiction|non-fiction|textbooks?|story\\s*books?|physical\\s*books?|paperbacks?|hardcovers?|magazines?|comics?|mangas?|stationer(?:y|ies)|pens?|pencils?|erasers?|rulers?|diar(?:y|ies)|notebooks?|sticky\\s*notes?|crayons?|sketchbooks?|toys?|board\\s*games?|dolls?|action\\s*figures?|lego|puzzles?|baby\\s*wipes?|diapers?|pampers?|baby\\s*food|pet\\s*food|dog\\s*food|cat\\s*food)\\b.*")) {
            return "books, stationery & toys";
        }

        // Sports (Non-electronic)
        if (t.matches(".*\\b(cricket\\s*bats?|footballs?|basketballs?|badminton\\s*(?:rackets?|shuttles?)?|shuttlecocks?|tennis\\s*rackets?|dumbbells?|barbells?|weights?|gym\\s*gloves?|yoga\\s*mats?)\\b.*")) {
            return "sports & fitness gear";
        }

        // Real Estate & Vehicles
        if (t.matches(".*\\b(cars?\\s*(?:sale|buy|used|new)?|motorcycles?|bikes?\\s*(?:petrol|mountain|gear)?|bicycles?|scooters?\\s*(?:petrol)?|apartments?|flats?\\s*for\\s*(?:sale|rent)|houses?\\s*for\\s*(?:sale|rent)|plots?|lands?\\s*for\\s*sale|real\\s*estate)\\b.*")) {
            return "automobiles & real estate";
        }

        return null;
    }
}
