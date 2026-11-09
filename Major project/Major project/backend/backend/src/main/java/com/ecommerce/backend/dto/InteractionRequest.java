package com.ecommerce.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class InteractionRequest {
    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotBlank(message = "Interaction type is required (VIEW, CLICK, WISHLIST, CART, PURCHASE)")
    private String interactionType;

    public InteractionRequest() {}

    public InteractionRequest(Long productId, String interactionType) {
        this.productId = productId;
        this.interactionType = interactionType;
    }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getInteractionType() { return interactionType; }
    public void setInteractionType(String interactionType) { this.interactionType = interactionType; }
}
