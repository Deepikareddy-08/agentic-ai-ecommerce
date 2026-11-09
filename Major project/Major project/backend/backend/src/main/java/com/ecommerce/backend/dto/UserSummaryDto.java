package com.ecommerce.backend.dto;

import java.time.ZonedDateTime;

public class UserSummaryDto {
    private Long id;
    private String username;
    private String email;
    private String role;
    private ZonedDateTime createdAt;

    public UserSummaryDto() {}

    public UserSummaryDto(Long id, String username, String email, String role, ZonedDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
}

