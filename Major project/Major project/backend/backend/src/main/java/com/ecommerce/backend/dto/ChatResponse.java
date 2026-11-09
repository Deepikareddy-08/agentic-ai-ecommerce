package com.ecommerce.backend.dto;

import com.ecommerce.backend.model.Product;
import java.util.List;
import java.util.Map;

public class ChatResponse {
    private String conversationId;
    private String response;
    private List<Product> recommendedProducts;
    private List<String> toolsUsed;
    private Map<String, Object> extractedRequirements;
    private List<String> followUpSuggestions;

    public ChatResponse() {}

    public ChatResponse(String conversationId, String response, List<Product> recommendedProducts, List<String> toolsUsed, Map<String, Object> extractedRequirements) {
        this.conversationId = conversationId;
        this.response = response;
        this.recommendedProducts = recommendedProducts;
        this.toolsUsed = toolsUsed;
        this.extractedRequirements = extractedRequirements;
    }

    public String getConversationId() { return conversationId; }
    public void setConversationId(String conversationId) { this.conversationId = conversationId; }

    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }

    public List<Product> getRecommendedProducts() { return recommendedProducts; }
    public void setRecommendedProducts(List<Product> recommendedProducts) { this.recommendedProducts = recommendedProducts; }

    public List<String> getToolsUsed() { return toolsUsed; }
    public void setToolsUsed(List<String> toolsUsed) { this.toolsUsed = toolsUsed; }

    public Map<String, Object> getExtractedRequirements() { return extractedRequirements; }
    public void setExtractedRequirements(Map<String, Object> extractedRequirements) { this.extractedRequirements = extractedRequirements; }

    public List<String> getFollowUpSuggestions() { return followUpSuggestions; }
    public void setFollowUpSuggestions(List<String> followUpSuggestions) { this.followUpSuggestions = followUpSuggestions; }
}
