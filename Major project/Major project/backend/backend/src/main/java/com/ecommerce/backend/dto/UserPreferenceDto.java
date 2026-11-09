package com.ecommerce.backend.dto;

public class UserPreferenceDto {
    private String preferredCategories;
    private Double minBudget;
    private Double maxBudget;
    private String preferredFeatures;

    public UserPreferenceDto() {}

    public String getPreferredCategories() { return preferredCategories; }
    public void setPreferredCategories(String preferredCategories) { this.preferredCategories = preferredCategories; }

    public Double getMinBudget() { return minBudget; }
    public void setMinBudget(Double minBudget) { this.minBudget = minBudget; }

    public Double getMaxBudget() { return maxBudget; }
    public void setMaxBudget(Double maxBudget) { this.maxBudget = maxBudget; }

    public String getPreferredFeatures() { return preferredFeatures; }
    public void setPreferredFeatures(String preferredFeatures) { this.preferredFeatures = preferredFeatures; }
}
