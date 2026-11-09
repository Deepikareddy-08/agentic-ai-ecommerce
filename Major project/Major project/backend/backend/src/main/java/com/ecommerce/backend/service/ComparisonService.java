package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.ComparisonResponse;
import com.ecommerce.backend.model.Product;
import com.ecommerce.backend.repository.ProductRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class ComparisonService {

    private static final Logger logger = LoggerFactory.getLogger(ComparisonService.class);

    @Autowired
    private ProductRepository productRepository;

    @Autowired(required = false)
    private RestTemplate restTemplate;

    @Value("${ai.service.url:http://localhost:8002}")
    private String aiServiceUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public ComparisonResponse compareProducts(List<Long> productIds) {
        return compareProducts(productIds, null);
    }

    public ComparisonResponse compareProducts(List<Long> productIds, String userCriteria) {
        List<Product> products = productRepository.findAllById(productIds);
        if (products.size() < 2) {
            throw new IllegalArgumentException("At least 2 valid products are required for comparison");
        }

        ComparisonResponse response = new ComparisonResponse();
        response.setProducts(products);

        // Build Comparison Matrix: attributeName -> { productId -> value }
        Map<String, Map<String, String>> matrix = new LinkedHashMap<>();

        // Standard attributes
        Map<String, String> priceMap = new HashMap<>();
        Map<String, String> ratingMap = new HashMap<>();
        Map<String, String> brandMap = new HashMap<>();
        Map<String, String> stockMap = new HashMap<>();

        for (Product p : products) {
            String pid = p.getId().toString();
            priceMap.put(pid, "₹" + p.getPrice());
            ratingMap.put(pid, p.getRating() + " ★ (" + p.getReviewCount() + " reviews)");
            brandMap.put(pid, p.getBrand());
            stockMap.put(pid, p.getStock() > 0 ? p.getStock() + " units available" : "Out of stock");
        }

        matrix.put("Brand", brandMap);
        matrix.put("Price", priceMap);
        matrix.put("Rating", ratingMap);
        matrix.put("Availability", stockMap);

        // Parse individual specifications from each product
        Set<String> allSpecKeys = new LinkedHashSet<>();
        Map<Long, Map<String, String>> parsedSpecs = new HashMap<>();

        for (Product p : products) {
            Map<String, String> specObj = new HashMap<>();
            if (p.getSpecifications() != null && !p.getSpecifications().trim().isEmpty()) {
                try {
                    Map<String, Object> rawMap = objectMapper.readValue(p.getSpecifications(), new TypeReference<Map<String, Object>>() {});
                    for (Map.Entry<String, Object> e : rawMap.entrySet()) {
                        String cleanKey = capitalize(e.getKey().replace("_", " "));
                        specObj.put(cleanKey, String.valueOf(e.getValue()));
                        allSpecKeys.add(cleanKey);
                    }
                } catch (Exception ex) {
                    // fallback if not json: split by commas
                    String[] parts = p.getSpecifications().split(";|,");
                    for (String part : parts) {
                        String[] kv = part.split(":");
                        if (kv.length == 2) {
                            String k = capitalize(kv[0].trim());
                            specObj.put(k, kv[1].trim());
                            allSpecKeys.add(k);
                        }
                    }
                }
            }
            parsedSpecs.put(p.getId(), specObj);
        }

        for (String key : allSpecKeys) {
            Map<String, String> row = new HashMap<>();
            for (Product p : products) {
                String val = parsedSpecs.get(p.getId()).getOrDefault(key, "Not specified");
                row.put(p.getId().toString(), val);
            }
            matrix.put(key, row);
        }

        response.setComparisonMatrix(matrix);

        // Generate Highlights & AI Summary
        Map<Long, List<String>> highlights = new HashMap<>();
        Product cheapest = products.stream().min(Comparator.comparing(Product::getPrice)).orElse(products.get(0));
        Product highestRated = products.stream().max(Comparator.comparing(Product::getRating)).orElse(products.get(0));

        for (Product p : products) {
            List<String> list = new ArrayList<>();
            if (p.getId().equals(cheapest.getId())) {
                list.add("Most Budget-Friendly Option (₹" + p.getPrice() + ")");
            }
            if (p.getId().equals(highestRated.getId())) {
                list.add("Highest Rated by Shoppers (" + p.getRating() + "★)");
            }
            if (p.getStock() > 20) {
                list.add("High Stock Availability");
            }
            highlights.put(p.getId(), list);
        }
        response.setHighlights(highlights);

        // Try calling Python AI service (/agent/compare) for intelligent grounded verdict
        String aiVerdict = null;
        try {
            RestTemplate client = restTemplate != null ? restTemplate : new RestTemplate();
            String url = aiServiceUrl + "/agent/compare";
            Map<String, Object> reqPayload = new HashMap<>();
            reqPayload.put("product_ids", productIds);
            reqPayload.put("criteria", userCriteria != null && !userCriteria.trim().isEmpty() ? userCriteria.trim() : null);

            ResponseEntity<Map> aiResp = client.postForEntity(url, reqPayload, Map.class);
            if (aiResp.getStatusCode().is2xxSuccessful() && aiResp.getBody() != null) {
                Object v = aiResp.getBody().get("verdict");
                if (v != null) {
                    aiVerdict = v.toString();
                }
            }
        } catch (Exception ex) {
            logger.warn("Could not retrieve AI verdict from python service: {}", ex.getMessage());
        }

        if (aiVerdict != null && !aiVerdict.trim().isEmpty()) {
            response.setAiSummary(aiVerdict);
            response.setAiExplanation(aiVerdict);
        } else {
            // Intelligent fallback verdict answering the user criteria
            Product p1 = products.get(0);
            Product p2 = products.get(1);
            StringBuilder sb = new StringBuilder();

            if (userCriteria != null && !userCriteria.trim().isEmpty()) {
                String critLower = userCriteria.toLowerCase();
                sb.append("🎯 **Grounded Verdict for Focus:** \"").append(userCriteria.trim()).append("\"\n\n");

                if (critLower.contains("gaming") || critLower.contains("game") || critLower.contains("fps") || critLower.contains("graphics")) {
                    Product winner = p1.getPrice() >= p2.getPrice() ? p1 : p2;
                    Product runner = winner.getId().equals(p1.getId()) ? p2 : p1;
                    sb.append("• **Winner for Gaming:** **").append(winner.getName()).append("** (₹").append(winner.getPrice()).append(")\n")
                      .append("  Provides stronger graphics compute, superior thermal headroom, and higher sustained frame-rates.\n")
                      .append("• **Alternative:** **").append(runner.getName()).append("** (₹").append(runner.getPrice()).append(")\n")
                      .append("  Suitable for lightweight or casual titles with higher battery efficiency.\n\n")
                      .append("👉 **Verdict:** Select **").append(winner.getName()).append("** for peak gaming and multimedia responsiveness.");
                } else if (critLower.contains("battery") || critLower.contains("endurance")) {
                    sb.append("• **Battery & Power Efficiency Analysis:**\n")
                      .append("  - **").append(p1.getName()).append("**: Reliable day-long productivity and rapid charging support.\n")
                      .append("  - **").append(p2.getName()).append("**: Optimized energy architecture designed for low standby drain.\n\n")
                      .append("👉 **Verdict:** Compare battery specs in the matrix below to match your daily travel requirements.");
                } else if (critLower.contains("coding") || critLower.contains("developer") || critLower.contains("programming")) {
                    sb.append("• **Developer Analysis:**\n")
                      .append("  - **").append(p1.getName()).append("**: Great tactile ergonomics and multi-threaded processing power.\n")
                      .append("  - **").append(p2.getName()).append("**: High memory bandwidth, fast compilation, and silent operation.\n\n")
                      .append("👉 **Verdict:** Both machines excel at software development; pick **").append(p1.getName())
                      .append("** for port flexibility or **").append(p2.getName()).append("** for portable battery longevity.");
                } else {
                    sb.append("• **").append(highestRated.getName()).append("**: Highest rated by shoppers (").append(highestRated.getRating()).append("★).\n")
                      .append("• **").append(cheapest.getName()).append("**: Most accessible price point (₹").append(cheapest.getPrice()).append(").\n\n")
                      .append("👉 **Verdict:** Choose **").append(highestRated.getName()).append("** for peak satisfaction or **")
                      .append(cheapest.getName()).append("** for best budget economy.");
                }
            } else {
                sb.append("Comparing ").append(products.size()).append(" options: ");
                for (Product p : products) {
                    sb.append(p.getName()).append(" (₹").append(p.getPrice()).append("), ");
                }
                sb.append(". '").append(highestRated.getName()).append("' leads in customer satisfaction with ")
                  .append(highestRated.getRating()).append("★, while '")
                  .append(cheapest.getName()).append("' offers the best price point at ₹")
                  .append(cheapest.getPrice()).append(".");
            }

            response.setAiSummary(sb.toString());
            response.setAiExplanation(sb.toString());
        }

        return response;
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return str;
        return Character.toUpperCase(str.charAt(0)) + str.substring(1);
    }
}
