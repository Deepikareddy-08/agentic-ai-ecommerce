package com.ecommerce.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> home() {
        return ResponseEntity.ok(Map.of(
                "status", "ONLINE",
                "service", "AuraStore Backend API",
                "version", "1.0.0",
                "message", "AuraStore Spring Boot Backend is successfully deployed and running!",
                "products_api", "/api/products",
                "categories_api", "/api/products/categories"
        ));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }
}

