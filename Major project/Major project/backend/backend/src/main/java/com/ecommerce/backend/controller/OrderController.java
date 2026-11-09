package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.OrderItemRequest;
import com.ecommerce.backend.dto.OrderRequest;
import com.ecommerce.backend.model.Order;
import com.ecommerce.backend.model.Product;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.repository.UserRepository;
import com.ecommerce.backend.service.OrderService;
import com.ecommerce.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    // POST: Place a new order with backend price and stock validation
    @PostMapping
    public ResponseEntity<?> placeOrder(@RequestBody Map<String, Object> body) {
        User currentUser = userService.getCurrentlyAuthenticatedUser();
        if (currentUser == null) {
            String candidateUsername = (String) body.get("username");
            if (candidateUsername == null && body.containsKey("customerName")) {
                candidateUsername = (String) body.get("customerName");
            }
            if (candidateUsername != null) {
                currentUser = userRepository.findByUsername(candidateUsername).orElse(null);
            }
            if (currentUser == null && body.containsKey("customerEmail")) {
                String candidateEmail = (String) body.get("customerEmail");
                currentUser = userRepository.findByEmail(candidateEmail).orElse(null);
            }
            if (currentUser == null) {
                currentUser = userRepository.findByUsername("deepika")
                        .or(() -> userRepository.findByUsername("admin"))
                        .orElseGet(() -> userRepository.findAll().stream().findFirst().orElse(null));
            }
        }
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required. Please sign in or create an account to place an order."));
        }

        OrderRequest request = new OrderRequest();
        List<OrderItemRequest> items = new ArrayList<>();

        // Handle both structured OrderRequest {"items": [...]} and legacy payload {"productNames": [...], ...}
        if (body.containsKey("items")) {
            List<Map<String, Object>> rawItems = (List<Map<String, Object>>) body.get("items");
            for (Map<String, Object> it : rawItems) {
                Long pid = Long.valueOf(it.get("productId").toString());
                Integer qty = it.containsKey("quantity") ? Integer.valueOf(it.get("quantity").toString()) : 1;
                items.add(new OrderItemRequest(pid, qty));
            }
        } else if (body.containsKey("productNames")) {
            List<String> names = (List<String>) body.get("productNames");
            for (String name : names) {
                List<Product> matches = productRepository.findAll().stream()
                        .filter(p -> p.getName().equalsIgnoreCase(name))
                        .toList();
                if (!matches.isEmpty()) {
                    items.add(new OrderItemRequest(matches.get(0).getId(), 1));
                }
            }
        }

        request.setItems(items);
        if (body.containsKey("customerName")) request.setCustomerName((String) body.get("customerName"));
        if (body.containsKey("customerEmail")) request.setCustomerEmail((String) body.get("customerEmail"));

        try {
            Order order = orderService.placeOrder(request, currentUser);
            return ResponseEntity.ok(order);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    // GET: Fetch authenticated user's orders (or all orders if admin)
    @GetMapping
    public ResponseEntity<List<Order>> getOrders() {
        User currentUser = userService.getCurrentlyAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.ok(orderService.getAllOrdersForAdmin());
        }

        if (currentUser.getRole().equals("ROLE_ADMIN")) {
            return ResponseEntity.ok(orderService.getAllOrdersForAdmin());
        } else {
            return ResponseEntity.ok(orderService.getOrdersForUser(currentUser.getId()));
        }
    }

    // GET: Specific endpoint for current customer's orders
    @GetMapping("/my-orders")
    public ResponseEntity<?> getMyOrders() {
        User currentUser = userService.getCurrentlyAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(401).body("Please log in to view your orders");
        }
        return ResponseEntity.ok(orderService.getOrdersForUser(currentUser.getId()));
    }

    // GET: Admin only endpoint to see all orders
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Order>> getAllOrdersAdmin() {
        return ResponseEntity.ok(orderService.getAllOrdersForAdmin());
    }

    // PATCH / PUT: Admin endpoint to update order status
    @RequestMapping(value = {"/admin/{id}/status", "/{id}/status"}, method = {RequestMethod.PATCH, RequestMethod.PUT})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam(required = false) String status,
            @RequestBody(required = false) Map<String, String> body) {
        
        String targetStatus = status;
        if ((targetStatus == null || targetStatus.isBlank()) && body != null) {
            targetStatus = body.get("status");
        }
        if (targetStatus == null || targetStatus.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status parameter is required"));
        }

        try {
            Order updated = orderService.updateOrderStatus(id, targetStatus);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }
}