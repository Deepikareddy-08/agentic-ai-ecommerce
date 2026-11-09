package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.ReviewRequest;
import com.ecommerce.backend.model.Product;
import com.ecommerce.backend.model.Review;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<Review> getReviewsForProduct(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    @Transactional
    public Review addReview(Long productId, ReviewRequest request, User currentUser) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + productId));

        Review review = new Review();
        review.setProduct(product);
        review.setUser(currentUser);
        review.setRating(request.getRating());
        review.setReviewText(request.getReviewText());

        String reviewerName = (currentUser != null) ? currentUser.getUsername()
                : (request.getReviewerName() != null ? request.getReviewerName() : "Anonymous Shopper");
        review.setReviewerName(reviewerName);

        Review savedReview = reviewRepository.save(review);

        // Update Product average rating and review count
        Double avgRating = reviewRepository.calculateAverageRating(productId);
        Integer totalReviews = reviewRepository.countReviewsByProductId(productId);

        product.setRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
        product.setReviewCount(totalReviews != null ? totalReviews : 0);
        productRepository.save(product);

        return savedReview;
    }
}
