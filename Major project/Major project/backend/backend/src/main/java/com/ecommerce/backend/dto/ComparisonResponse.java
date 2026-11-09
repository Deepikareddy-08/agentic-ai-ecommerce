package com.ecommerce.backend.dto;

import com.ecommerce.backend.model.Product;
import java.util.List;
import java.util.Map;

public class ComparisonResponse {
    private List<Product> products;
    private Map<String, Map<String, String>> comparisonMatrix;
    private Map<Long, List<String>> highlights;
    private String aiSummary;
    private String aiExplanation;

    public ComparisonResponse() {}

    public List<Product> getProducts() { return products; }
    public void setProducts(List<Product> products) { this.products = products; }

    public Map<String, Map<String, String>> getComparisonMatrix() { return comparisonMatrix; }
    public void setComparisonMatrix(Map<String, Map<String, String>> comparisonMatrix) { this.comparisonMatrix = comparisonMatrix; }

    public Map<Long, List<String>> getHighlights() { return highlights; }
    public void setHighlights(Map<Long, List<String>> highlights) { this.highlights = highlights; }

    public String getAiSummary() { return aiSummary != null ? aiSummary : aiExplanation; }
    public void setAiSummary(String aiSummary) { 
        this.aiSummary = aiSummary; 
        if (this.aiExplanation == null) this.aiExplanation = aiSummary;
    }

    public String getAiExplanation() { return aiExplanation != null ? aiExplanation : aiSummary; }
    public void setAiExplanation(String aiExplanation) { 
        this.aiExplanation = aiExplanation; 
        if (this.aiSummary == null) this.aiSummary = aiExplanation;
    }
}
