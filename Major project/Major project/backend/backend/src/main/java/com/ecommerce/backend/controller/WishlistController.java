package com.ecommerce.backend.controller;

import com.ecommerce.backend.model.User;
import com.ecommerce.backend.model.Wishlist;
import com.ecommerce.backend.service.UserService;
import com.ecommerce.backend.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<?> getWishlist() {
        User user = userService.getCurrentlyAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Please log in to view wishlist");
        }
        List<Wishlist> list = wishlistService.getUserWishlist(user.getId());
        return ResponseEntity.ok(list);
    }

    @PostMapping("/{productId}")
    public ResponseEntity<?> addToWishlist(@PathVariable Long productId) {
        User user = userService.getCurrentlyAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Please log in to add to wishlist");
        }
        try {
            Wishlist item = wishlistService.addToWishlist(user, productId);
            return ResponseEntity.ok(item);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<?> removeFromWishlist(@PathVariable Long productId) {
        User user = userService.getCurrentlyAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Please log in to modify wishlist");
        }
        wishlistService.removeFromWishlist(user, productId);
        return ResponseEntity.ok("Item removed from wishlist");
    }
}
