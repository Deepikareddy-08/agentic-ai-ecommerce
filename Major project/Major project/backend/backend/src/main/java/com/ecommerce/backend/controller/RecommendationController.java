package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.RecommendationRequest;
import com.ecommerce.backend.dto.RecommendationResponse;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.service.RecommendationClientService;
import com.ecommerce.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    @Autowired
    private RecommendationClientService recommendationService;

    @Autowired
    private UserService userService;

    // GET /api/recommendations (Uses authenticated user ID or general recommendations)
    @GetMapping
    public ResponseEntity<RecommendationResponse> getRecommendations(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double maxBudget,
            @RequestParam(required = false) String purpose,
            @RequestParam(defaultValue = "6") Integer limit
    ) {
        RecommendationRequest request = new RecommendationRequest();
        User currentUser = userService.getCurrentlyAuthenticatedUser();
        if (currentUser != null) {
            request.setUserId(currentUser.getId());
        }
        request.setCategory(category);
        request.setMaxBudget(maxBudget);
        request.setPurpose(purpose);
        request.setLimit(limit);

        return ResponseEntity.ok(recommendationService.getRecommendations(request));
    }

    // POST /api/recommendations with structured requirements payload
    @PostMapping
    public ResponseEntity<RecommendationResponse> getRecommendationsPost(
            @RequestBody RecommendationRequest request
    ) {
        if (request.getUserId() == null) {
            User currentUser = userService.getCurrentlyAuthenticatedUser();
            if (currentUser != null) {
                request.setUserId(currentUser.getId());
            }
        }
        return ResponseEntity.ok(recommendationService.getRecommendations(request));
    }
}
