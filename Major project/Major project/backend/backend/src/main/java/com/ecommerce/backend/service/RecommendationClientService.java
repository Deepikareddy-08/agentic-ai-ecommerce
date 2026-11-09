package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.RecommendationItemDto;
import com.ecommerce.backend.dto.RecommendationRequest;
import com.ecommerce.backend.dto.RecommendationResponse;
import com.ecommerce.backend.model.Product;
import com.ecommerce.backend.model.UserPreference;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.repository.UserPreferenceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationClientService {

    private static final Logger logger = LoggerFactory.getLogger(RecommendationClientService.class);

    @Value("${ml.service.url:http://localhost:8001}")
    private String mlServiceUrl;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserPreferenceRepository userPreferenceRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    public RecommendationResponse getRecommendations(RecommendationRequest request) {
        // 1. If user ID provided, enrich request with user preferences if not explicitly set
        if (request.getUserId() != null) {
            Optional<UserPreference> prefOpt = userPreferenceRepository.findByUserId(request.getUserId());
            if (prefOpt.isPresent()) {
                UserPreference pref = prefOpt.get();
                if (request.getCategory() == null && pref.getPreferredCategories() != null) {
                    request.setCategory(pref.getPreferredCategories().split(",")[0].trim());
                }
                if (request.getMaxBudget() == null && pref.getMaxBudget() != null) {
                    request.setMaxBudget(pref.getMaxBudget());
                }
            }
        }

        // 2. Try calling external Python ML recommendation microservice
        try {
            String url = mlServiceUrl + "/recommend";
            logger.info("Calling Python ML service at: {}", url);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map body = response.getBody();
                List<Map<String, Object>> recList = (List<Map<String, Object>>) body.get("recommendations");
                String explanation = (String) body.get("explanation");
                String strategy = (String) body.getOrDefault("strategy", "ML Content-Based Filtering");

                List<RecommendationItemDto> items = new ArrayList<>();
                if (recList != null) {
                    for (Map<String, Object> rec : recList) {
                        Long prodId = Long.valueOf(rec.get("product_id").toString());
                        Double score = Double.valueOf(rec.get("score").toString());
                        String reason = (String) rec.get("match_reason");

                        Product p = productRepository.findById(prodId).orElse(null);
                        if (p != null) {
                            items.add(new RecommendationItemDto(prodId, p, score, reason));
                        }
                    }
                }
                return new RecommendationResponse(items, explanation, strategy);
            }
        } catch (Exception ex) {
            logger.warn("Python ML Service unavailable at {}, applying local content-based recommendation baseline: {}",
                    mlServiceUrl, ex.getMessage());
        }

        // 3. Fallback: Local Content-Based Rule & Attribute Similarity Engine
        return computeLocalRecommendations(request);
    }

    private RecommendationResponse computeLocalRecommendations(RecommendationRequest request) {
        List<Product> allProducts = productRepository.findAll();
        List<RecommendationItemDto> scoredItems = new ArrayList<>();

        String targetCategory = request.getCategory();
        Double maxBudget = request.getMaxBudget();
        Double minBudget = request.getMinBudget();
        String purpose = request.getPurpose() != null ? request.getPurpose().toLowerCase() : "";
        List<String> requiredFeatures = request.getRequiredFeatures() != null ? request.getRequiredFeatures() : Collections.emptyList();
        List<String> preferredFeatures = request.getPreferredFeatures() != null ? request.getPreferredFeatures() : Collections.emptyList();

        for (Product product : allProducts) {
            // Mandatory Filter: Category match (if specified)
            if (targetCategory != null && !targetCategory.isEmpty() && !targetCategory.equalsIgnoreCase("All")) {
                if (!product.getCategory().equalsIgnoreCase(targetCategory)) {
                    continue; // Skip products not in requested category
                }
            }

            // Mandatory Filter: Budget upper constraint (if specified)
            if (maxBudget != null && maxBudget > 0) {
                if (product.getPrice() > maxBudget) {
                    continue; // Exceeds budget
                }
            }
            if (minBudget != null && minBudget > 0) {
                if (product.getPrice() < minBudget) {
                    continue;
                }
            }

            // Compute attribute matching score
            double score = 0.5; // Base candidate score
            List<String> reasons = new ArrayList<>();

            // Rating boost
            if (product.getRating() != null && product.getRating() >= 4.5) {
                score += 0.2;
                reasons.add("High customer rating (" + product.getRating() + "★)");
            }

            // Price/budget alignment
            if (maxBudget != null) {
                double budgetRatio = product.getPrice() / maxBudget;
                if (budgetRatio <= 1.0 && budgetRatio >= 0.7) {
                    score += 0.15;
                    reasons.add("Optimal price-to-feature value within ₹" + maxBudget.intValue() + " budget");
                }
            }

            // Specifications & purpose matching
            String specText = ((product.getDescription() != null ? product.getDescription() : "") + " " +
                               (product.getSpecifications() != null ? product.getSpecifications() : "")).toLowerCase();

            if (!purpose.isEmpty() && specText.contains(purpose)) {
                score += 0.25;
                reasons.add("Engineered for " + request.getPurpose());
            }

            for (String feat : requiredFeatures) {
                if (specText.contains(feat.toLowerCase())) {
                    score += 0.2;
                    reasons.add("Includes required feature: " + feat);
                }
            }

            for (String pref : preferredFeatures) {
                if (specText.contains(pref.toLowerCase())) {
                    score += 0.15;
                    reasons.add("Matches preferred feature: " + pref);
                }
            }

            String matchReason = reasons.isEmpty()
                    ? "Popular choice in " + product.getCategory()
                    : String.join("; ", reasons);

            scoredItems.add(new RecommendationItemDto(product.getId(), product, Math.min(1.0, Math.round(score * 100.0) / 100.0), matchReason));
        }

        // Sort descending by score
        scoredItems.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));

        int limit = request.getLimit() != null && request.getLimit() > 0 ? request.getLimit() : 5;
        List<RecommendationItemDto> topK = scoredItems.stream().limit(limit).collect(Collectors.toList());

        String explanation = "Personalized candidates matched based on category, specifications, and rating criteria.";
        return new RecommendationResponse(topK, explanation, "Local Content-Based Recommendation Baseline");
    }
}
