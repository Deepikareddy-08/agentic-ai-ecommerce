package com.ecommerce.backend.dto;

import java.util.List;

public class RecommendationResponse {
    private List<RecommendationItemDto> recommendations;
    private String explanation;
    private String strategy;
    private Integer count;

    public RecommendationResponse() {}

    public RecommendationResponse(List<RecommendationItemDto> recommendations, String explanation, String strategy) {
        this.recommendations = recommendations;
        this.explanation = explanation;
        this.strategy = strategy;
        this.count = (recommendations != null) ? recommendations.size() : 0;
    }

    public List<RecommendationItemDto> getRecommendations() { return recommendations; }
    public void setRecommendations(List<RecommendationItemDto> recommendations) { 
        this.recommendations = recommendations; 
        this.count = (recommendations != null) ? recommendations.size() : 0;
    }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public String getStrategy() { return strategy; }
    public void setStrategy(String strategy) { this.strategy = strategy; }

    public Integer getCount() { return count; }
    public void setCount(Integer count) { this.count = count; }
}
