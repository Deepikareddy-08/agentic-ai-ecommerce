package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.InteractionRequest;
import com.ecommerce.backend.model.Interaction;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.service.InteractionService;
import com.ecommerce.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interactions")
public class InteractionController {

    @Autowired
    private InteractionService interactionService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<?> logInteraction(@Valid @RequestBody InteractionRequest request) {
        User currentUser = userService.getCurrentlyAuthenticatedUser();
        Long userId = (currentUser != null) ? currentUser.getId() : null;

        try {
            Interaction interaction = interactionService.logInteraction(userId, request.getProductId(), request.getInteractionType());
            return ResponseEntity.ok(interaction);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Interaction>> getUserInteractions() {
        User currentUser = userService.getCurrentlyAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(interactionService.getUserInteractions(currentUser.getId()));
    }
}
