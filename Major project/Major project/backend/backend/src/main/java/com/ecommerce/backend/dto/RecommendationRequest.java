package com.ecommerce.backend.dto;

import java.util.List;

public class RecommendationRequest {
    private Long userId;
    private String category;
    private Double minBudget;
    private Double maxBudget;
    private String purpose;
    private List<String> requiredFeatures;
    private List<String> preferredFeatures;
    private Integer limit = 5;

    public RecommendationRequest() {}

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getMinBudget() { return minBudget; }
    public void setMinBudget(Double minBudget) { this.minBudget = minBudget; }

    public Double getMaxBudget() { return maxBudget; }
    public void setMaxBudget(Double maxBudget) { this.maxBudget = maxBudget; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public List<String> getRequiredFeatures() { return requiredFeatures; }
    public void setRequiredFeatures(List<String> requiredFeatures) { this.requiredFeatures = requiredFeatures; }

    public List<String> getPreferredFeatures() { return preferredFeatures; }
    public void setPreferredFeatures(List<String> preferredFeatures) { this.preferredFeatures = preferredFeatures; }

    public Integer getLimit() { return limit; }
    public void setLimit(Integer limit) { this.limit = limit; }
}
