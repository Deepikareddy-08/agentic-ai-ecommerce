package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.ChatRequest;
import com.ecommerce.backend.dto.ChatResponse;
import com.ecommerce.backend.model.ChatMessage;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.service.AiAgentClientService;
import com.ecommerce.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private AiAgentClientService aiAgentService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        if (request.getUserId() == null) {
            User currentUser = userService.getCurrentlyAuthenticatedUser();
            if (currentUser != null) {
                request.setUserId(currentUser.getId());
            }
        }
        return ResponseEntity.ok(aiAgentService.handleChat(request));
    }

    @GetMapping("/history/{conversationId}")
    public ResponseEntity<List<ChatMessage>> getConversationHistory(@PathVariable String conversationId) {
        return ResponseEntity.ok(aiAgentService.getConversationMessages(conversationId));
    }
}
