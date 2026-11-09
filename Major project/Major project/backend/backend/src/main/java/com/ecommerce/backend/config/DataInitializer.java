package com.ecommerce.backend.config;

import com.ecommerce.backend.model.Product;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.model.UserPreference;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.repository.UserPreferenceRepository;
import com.ecommerce.backend.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserPreferenceRepository userPreferenceRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public void run(String... args) {
        seedAdminUser();
        seedCatalogProducts();
    }

    private void seedAdminUser() {
        try {
            if (!userRepository.existsByUsername("admin")) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail("admin@aurastore.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole("ROLE_ADMIN");
                User saved = userRepository.save(admin);

                UserPreference pref = new UserPreference();
                pref.setUser(saved);
                userPreferenceRepository.save(pref);

                logger.info("[DataInitializer] Default administrator 'admin' initialized successfully.");
            }
        } catch (Exception e) {
            logger.warn("[DataInitializer] Note during admin user verification: {}", e.getMessage());
        }
    }

    private void seedCatalogProducts() {
        try {
            long existingCount = productRepository.count();
            if (existingCount == 0) {
                logger.info("[DataInitializer] Empty database detected. Auto-seeding 220 products from seed_products.json...");
                ClassPathResource resource = new ClassPathResource("seed_products.json");
                if (resource.exists()) {
                    try (InputStream is = resource.getInputStream()) {
                        List<Map<String, Object>> list = objectMapper.readValue(is, new TypeReference<>() {});
                        List<Product> productsToSave = new ArrayList<>();

                        for (Map<String, Object> map : list) {
                            Product p = new Product();
                            if (map.get("id") != null) {
                                try {
                                    p.setId(Long.valueOf(map.get("id").toString()));
                                } catch (Exception ignored) {}
                            }
                            p.setName((String) map.getOrDefault("name", ""));
                            p.setBrand((String) map.getOrDefault("brand", ""));
                            p.setCategory((String) map.getOrDefault("category", "General"));
                            
                            Object priceObj = map.get("price");
                            double price = (priceObj instanceof Number) ? ((Number) priceObj).doubleValue() : 0.0;
                            p.setPrice(price);

                            Object stockObj = map.get("stock");
                            int stock = (stockObj instanceof Number) ? ((Number) stockObj).intValue() : 20;
                            p.setStock(stock);

                            Object ratingObj = map.get("rating");
                            double rating = (ratingObj instanceof Number) ? ((Number) ratingObj).doubleValue() : 4.5;
                            p.setRating(rating);

                            Object revObj = map.get("review_count");
                            int revCount = (revObj instanceof Number) ? ((Number) revObj).intValue() : 0;
                            p.setReviewCount(revCount);

                            p.setImageUrl((String) map.getOrDefault("image_url", ""));
                            p.setDescription((String) map.getOrDefault("description", ""));

                            Object specs = map.get("specifications");
                            if (specs instanceof String) {
                                p.setSpecifications((String) specs);
                            } else if (specs != null) {
                                p.setSpecifications(objectMapper.writeValueAsString(specs));
                            } else {
                                p.setSpecifications("{}");
                            }

                            productsToSave.add(p);
                        }

                        productRepository.saveAll(productsToSave);
                        logger.info("[DataInitializer] Successfully auto-seeded {} catalog products into database!", productsToSave.size());
                    }
                } else {
                    logger.warn("[DataInitializer] seed_products.json not found in classpath.");
                }
            } else {
                logger.info("[DataInitializer] Database already populated with {} products.", existingCount);
            }
        } catch (Exception e) {
            logger.warn("[DataInitializer] Note during catalog auto-seeding: {}", e.getMessage());
        }
    }
}
