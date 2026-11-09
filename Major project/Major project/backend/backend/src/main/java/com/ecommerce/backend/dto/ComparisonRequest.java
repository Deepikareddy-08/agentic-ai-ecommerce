package com.ecommerce.backend.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

public class ComparisonRequest {
    @NotEmpty(message = "Please provide at least 2 product IDs to compare")
    @Size(min = 2, max = 5, message = "You can compare between 2 and 5 products at once")
    private List<Long> productIds;
    private String userCriteria;

    public ComparisonRequest() {}

    public ComparisonRequest(List<Long> productIds) {
        this.productIds = productIds;
    }

    public ComparisonRequest(List<Long> productIds, String userCriteria) {
        this.productIds = productIds;
        this.userCriteria = userCriteria;
    }

    public List<Long> getProductIds() { return productIds; }
    public void setProductIds(List<Long> productIds) { this.productIds = productIds; }

    public String getUserCriteria() { return userCriteria; }
    public void setUserCriteria(String userCriteria) { this.userCriteria = userCriteria; }
}
