package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.AuthResponse;
import com.ecommerce.backend.dto.ForgotPasswordRequest;
import com.ecommerce.backend.dto.LoginRequest;
import com.ecommerce.backend.dto.RegisterRequest;
import com.ecommerce.backend.dto.UserPreferenceDto;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.model.UserPreference;
import com.ecommerce.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = userService.register(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", ex.getMessage() != null ? ex.getMessage() : "Registration failed"));
        }
    }

    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(org.springframework.web.bind.MethodArgumentNotValidException ex) {
        String errorMessage = "Validation failed";
        if (ex.getBindingResult() != null && ex.getBindingResult().getFieldError() != null) {
            errorMessage = ex.getBindingResult().getFieldError().getDefaultMessage();
        }
        return ResponseEntity.badRequest().body(java.util.Map.of("message", errorMessage));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = userService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Invalid username or password"));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            AuthResponse response = userService.resetPasswordAndLogin(request.getIdentifier(), request.getNewPassword());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Password reset failed: " + ex.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        User user = userService.getCurrentlyAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Not authenticated");
        }
        return ResponseEntity.ok(user);
    }

    @GetMapping("/preferences")
    public ResponseEntity<?> getPreferences() {
        User user = userService.getCurrentlyAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Not authenticated");
        }
        UserPreference pref = userService.getUserPreferences(user.getId());
        return ResponseEntity.ok(pref != null ? pref : new UserPreference());
    }

    @PostMapping("/preferences")
    public ResponseEntity<?> savePreferences(@RequestBody UserPreferenceDto dto) {
        User user = userService.getCurrentlyAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Not authenticated");
        }
        UserPreference saved = userService.saveUserPreferences(user.getId(), dto);
        return ResponseEntity.ok(saved);
    }
}
