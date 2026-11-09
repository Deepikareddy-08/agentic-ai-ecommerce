package com.ecommerce.backend.config;

import com.ecommerce.backend.model.User;
import com.ecommerce.backend.model.UserPreference;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.repository.UserPreferenceRepository;
import com.ecommerce.backend.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.sql.PreparedStatement;
import java.sql.SQLException;
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

    @Autowired
    private JdbcTemplate jdbcTemplate;

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
            if (existingCount < 200) {
                logger.info("[DataInitializer] Database catalog count is {} (expected 220). Seeding from seed_products.json...", existingCount);
                ClassPathResource resource = new ClassPathResource("seed_products.json");
                if (resource.exists()) {
                    try (InputStream is = resource.getInputStream()) {
                        List<Map<String, Object>> list = objectMapper.readValue(is, new TypeReference<>() {});

                        String sql = """
                            INSERT INTO products (id, name, brand, category, price, stock, rating, review_count, image_url, description, specifications)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            ON CONFLICT (id) DO UPDATE SET
                                name = EXCLUDED.name,
                                brand = EXCLUDED.brand,
                                category = EXCLUDED.category,
                                price = EXCLUDED.price,
                                stock = EXCLUDED.stock,
                                rating = EXCLUDED.rating,
                                review_count = EXCLUDED.review_count,
                                image_url = EXCLUDED.image_url,
                                description = EXCLUDED.description,
                                specifications = EXCLUDED.specifications
                        """;

                        jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
                            @Override
                            public void setValues(PreparedStatement ps, int i) throws SQLException {
                                Map<String, Object> map = list.get(i);
                                long id = 101L;
                                try {
                                    id = Long.parseLong(map.getOrDefault("id", 101).toString());
                                } catch (Exception ignored) {}
                                ps.setLong(1, id);

                                ps.setString(2, (String) map.getOrDefault("name", ""));
                                ps.setString(3, (String) map.getOrDefault("brand", ""));
                                ps.setString(4, (String) map.getOrDefault("category", "General"));

                                Object priceObj = map.get("price");
                                double price = (priceObj instanceof Number) ? ((Number) priceObj).doubleValue() : 0.0;
                                ps.setDouble(5, price);

                                Object stockObj = map.get("stock");
                                int stock = (stockObj instanceof Number) ? ((Number) stockObj).intValue() : 20;
                                ps.setInt(6, stock);

                                Object ratingObj = map.get("rating");
                                double rating = (ratingObj instanceof Number) ? ((Number) ratingObj).doubleValue() : 4.5;
                                ps.setDouble(7, rating);

                                Object revObj = map.get("review_count");
                                int revCount = (revObj instanceof Number) ? ((Number) revObj).intValue() : 0;
                                ps.setInt(8, revCount);

                                ps.setString(9, (String) map.getOrDefault("image_url", ""));
                                ps.setString(10, (String) map.getOrDefault("description", ""));

                                Object specs = map.get("specifications");
                                String specsStr = "{}";
                                if (specs instanceof String) {
                                    specsStr = (String) specs;
                                } else if (specs != null) {
                                    try {
                                        specsStr = objectMapper.writeValueAsString(specs);
                                    } catch (Exception ignored) {}
                                }
                                ps.setString(11, specsStr);
                            }

                            @Override
                            public int getBatchSize() {
                                return list.size();
                            }
                        });

                        try {
                            jdbcTemplate.execute("SELECT setval(pg_get_serial_sequence('products', 'id'), COALESCE(MAX(id), 1)) FROM products;");
                        } catch (Exception ignored) {}

                        logger.info("[DataInitializer] Successfully auto-seeded {} catalog products into database!", list.size());
                    }
                } else {
                    logger.warn("[DataInitializer] seed_products.json not found in classpath.");
                }
            } else {
                logger.info("[DataInitializer] Database already fully populated with {} products.", existingCount);
            }
        } catch (Exception e) {
            logger.warn("[DataInitializer] Note during catalog auto-seeding: {}", e.getMessage());
        }
    }
}
