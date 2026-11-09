package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.ComparisonRequest;
import com.ecommerce.backend.dto.ComparisonResponse;
import com.ecommerce.backend.service.ComparisonService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/compare")
public class ComparisonController {

    @Autowired
    private ComparisonService comparisonService;

    @PostMapping
    public ResponseEntity<?> compareProducts(@Valid @RequestBody ComparisonRequest request) {
        try {
            ComparisonResponse response = comparisonService.compareProducts(request.getProductIds(), request.getUserCriteria());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}
