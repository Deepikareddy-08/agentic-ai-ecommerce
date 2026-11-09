package com.ecommerce.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class ChatRequest {
    private String conversationId;

    @NotBlank(message = "Message content is required")
    private String message;

    private Long userId;

    public ChatRequest() {}

    public ChatRequest(String conversationId, String message, Long userId) {
        this.conversationId = conversationId;
        this.message = message;
        this.userId = userId;
    }

    public String getConversationId() { return conversationId; }
    public void setConversationId(String conversationId) { this.conversationId = conversationId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}
