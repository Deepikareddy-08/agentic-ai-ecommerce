package com.ecommerce.backend.service;

import com.ecommerce.backend.model.Product;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.model.Wishlist;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InteractionService interactionService;

    public List<Wishlist> getUserWishlist(Long userId) {
        return wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public Wishlist addToWishlist(User user, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + productId));

        if (wishlistRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            return wishlistRepository.findByUserIdAndProductId(user.getId(), productId).orElse(null);
        }

        Wishlist item = new Wishlist(user, product);
        Wishlist saved = wishlistRepository.save(item);

        interactionService.logInteraction(user.getId(), productId, "WISHLIST");
        return saved;
    }

    @Transactional
    public void removeFromWishlist(User user, Long productId) {
        wishlistRepository.deleteByUserIdAndProductId(user.getId(), productId);
    }
}
