package com.ecommerce.backend.service;

import com.ecommerce.backend.config.JwtTokenProvider;
import com.ecommerce.backend.dto.AuthResponse;
import com.ecommerce.backend.dto.LoginRequest;
import com.ecommerce.backend.dto.RegisterRequest;
import com.ecommerce.backend.dto.UserPreferenceDto;
import com.ecommerce.backend.dto.UserSummaryDto;
import com.ecommerce.backend.model.Conversation;
import com.ecommerce.backend.model.Interaction;
import com.ecommerce.backend.model.Order;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.model.UserPreference;
import com.ecommerce.backend.model.Wishlist;
import com.ecommerce.backend.repository.ConversationRepository;
import com.ecommerce.backend.repository.InteractionRepository;
import com.ecommerce.backend.repository.OrderRepository;
import com.ecommerce.backend.repository.UserPreferenceRepository;
import com.ecommerce.backend.repository.UserRepository;
import com.ecommerce.backend.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserPreferenceRepository userPreferenceRepository;

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private InteractionRepository interactionRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (request.getUsername() == null || request.getUsername().trim().length() < 3) {
            throw new IllegalArgumentException("Username must be at least 3 characters long");
        }
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email address is required");
        }
        String cleanEmail = request.getEmail().trim();
        if (cleanEmail.contains(" ") || !cleanEmail.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            throw new IllegalArgumentException("Invalid email format. Email must include a domain extension like .com (e.g. user@gmail.com)");
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long");
        }

        if (userRepository.existsByUsername(request.getUsername().trim())) {
            throw new IllegalArgumentException("Username '" + request.getUsername().trim() + "' is already taken");
        }
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new IllegalArgumentException("Email '" + cleanEmail + "' is already registered");
        }

        String role = (request.getRole() != null && request.getRole().equalsIgnoreCase("ADMIN"))
                ? "ROLE_ADMIN" : "ROLE_CUSTOMER";

        User user = new User();
        user.setUsername(request.getUsername().trim());
        user.setEmail(cleanEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);

        User savedUser = userRepository.save(user);

        // Create initial default preference record
        UserPreference pref = new UserPreference();
        pref.setUser(savedUser);
        userPreferenceRepository.save(pref);

        String token = tokenProvider.generateTokenForUser(savedUser.getUsername(), savedUser.getId(), savedUser.getRole());
        return new AuthResponse(token, savedUser.getId(), savedUser.getUsername(), savedUser.getEmail(), savedUser.getRole());
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Invalid user credentials"));

        String token = tokenProvider.generateToken(authentication, user.getId(), user.getRole());
        return new AuthResponse(token, user.getId(), user.getUsername(), user.getEmail(), user.getRole());
    }

    @Transactional
    public AuthResponse resetPasswordAndLogin(String identifier, String newPassword) {
        if (identifier == null || identifier.trim().isEmpty()) {
            throw new IllegalArgumentException("Username or Email is required");
        }
        if (newPassword == null || newPassword.length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long");
        }

        String clean = identifier.trim();
        User user = userRepository.findByUsername(clean)
                .or(() -> userRepository.findByEmail(clean))
                .orElseThrow(() -> new IllegalArgumentException("No registered account found with username or email: '" + clean + "'"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        String token = tokenProvider.generateTokenForUser(user.getUsername(), user.getId(), user.getRole());
        return new AuthResponse(token, user.getId(), user.getUsername(), user.getEmail(), user.getRole());
    }

    public User getCurrentlyAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return null;
        }
        String username = auth.getName();
        return userRepository.findByUsername(username).orElse(null);
    }

    public UserPreference getUserPreferences(Long userId) {
        return userPreferenceRepository.findByUserId(userId).orElse(null);
    }

    @Transactional
    public UserPreference saveUserPreferences(Long userId, UserPreferenceDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        UserPreference pref = userPreferenceRepository.findByUserId(userId)
                .orElseGet(() -> {
                    UserPreference newPref = new UserPreference();
                    newPref.setUser(user);
                    return newPref;
                });

        pref.setPreferredCategories(dto.getPreferredCategories());
        pref.setMinBudget(dto.getMinBudget());
        pref.setMaxBudget(dto.getMaxBudget());
        pref.setPreferredFeatures(dto.getPreferredFeatures());

        return userPreferenceRepository.save(pref);
    }

    public List<UserSummaryDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> new UserSummaryDto(u.getId(), u.getUsername(), u.getEmail(), u.getRole(), u.getCreatedAt()))
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        if ("admin".equalsIgnoreCase(user.getUsername())) {
            throw new IllegalArgumentException("Primary system Administrator 'admin' cannot be deleted.");
        }

        // 1. Delete user preferences
        userPreferenceRepository.findByUserId(userId).ifPresent(userPreferenceRepository::delete);

        // 2. Delete wishlist items
        List<Wishlist> wishlists = wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (wishlists != null && !wishlists.isEmpty()) {
            wishlistRepository.deleteAll(wishlists);
        }

        // 3. Delete interactions
        List<Interaction> interactions = interactionRepository.findByUserIdOrderByTimestampDesc(userId);
        if (interactions != null && !interactions.isEmpty()) {
            interactionRepository.deleteAll(interactions);
        }

        // 4. Delete conversations
        List<Conversation> conversations = conversationRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        if (conversations != null && !conversations.isEmpty()) {
            conversationRepository.deleteAll(conversations);
        }

        // 5. Unlink orders (preserve orders for audit/invoicing)
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (orders != null && !orders.isEmpty()) {
            for (Order o : orders) {
                o.setUser(null);
                orderRepository.save(o);
            }
        }

        // 6. Delete user
        userRepository.delete(user);
    }

    @Transactional
    public void deleteUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username: " + username));
        deleteUser(user.getId());
    }
}
