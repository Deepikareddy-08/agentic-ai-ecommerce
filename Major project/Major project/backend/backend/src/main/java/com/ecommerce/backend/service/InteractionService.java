package com.ecommerce.backend.service;

import com.ecommerce.backend.model.Interaction;
import com.ecommerce.backend.model.Product;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.repository.InteractionRepository;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InteractionService {

    @Autowired
    private InteractionRepository interactionRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Interaction logInteraction(Long userId, Long productId, String interactionType) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + productId));

        User user = (userId != null) ? userRepository.findById(userId).orElse(null) : null;

        Interaction interaction = new Interaction(user, product, interactionType.toUpperCase());
        return interactionRepository.save(interaction);
    }

    public List<Interaction> getUserInteractions(Long userId) {
        return interactionRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    public List<Long> getInteractedProductIds(Long userId) {
        return interactionRepository.findInteractedProductIdsByUserId(userId);
    }
}
