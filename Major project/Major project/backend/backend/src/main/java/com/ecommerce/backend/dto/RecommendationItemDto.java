package com.ecommerce.backend.dto;

import com.ecommerce.backend.model.Product;

public class RecommendationItemDto {
    private Long productId;
    private Product product;
    private Double score;
    private String matchReason;

    public RecommendationItemDto() {}

    public RecommendationItemDto(Long productId, Product product, Double score, String matchReason) {
        this.productId = productId;
        this.product = product;
        this.score = score;
        this.matchReason = matchReason;
    }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }

    public String getMatchReason() { return matchReason; }
    public void setMatchReason(String matchReason) { this.matchReason = matchReason; }
}
