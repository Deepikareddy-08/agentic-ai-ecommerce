package com.ecommerce.backend.service;

import com.ecommerce.backend.model.Product;
import com.ecommerce.backend.repository.ProductRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    private static final java.util.Set<String> STOP_WORDS = java.util.Set.of(
            "with", "under", "below", "above", "for", "in", "the", "a", "an", "and", "or", "of", "to", "best", "good", "top"
    );

    public Page<Product> getFilteredProducts(String query, String category, Double minPrice, Double maxPrice,
                                             Double minRating, int page, int size, String sortBy, String sortDir) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir.equalsIgnoreCase("desc") ? "DESC" : "ASC"),
                sortBy != null && !sortBy.isEmpty() ? sortBy : "id");
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Product> spec = (root, q, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (query != null && !query.trim().isEmpty()) {
                String cleanQuery = query.trim().toLowerCase();
                boolean isAudioTarget = isAudioQuery(cleanQuery);
                boolean isTvTarget = isTvQuery(cleanQuery);
                boolean isPhoneTarget = !isAudioTarget && isPhoneQuery(cleanQuery);
                boolean isLaptopTarget = isLaptopQuery(cleanQuery);
                boolean isWatchTarget = isWatchQuery(cleanQuery);

                if (isAudioTarget) {
                    predicates.add(cb.or(
                            cb.equal(cb.lower(root.get("category")), "audio & headphones"),
                            cb.like(cb.lower(root.get("name")), "%speaker%"),
                            cb.like(cb.lower(root.get("name")), "%headphone%"),
                            cb.like(cb.lower(root.get("name")), "%earbud%"),
                            cb.like(cb.lower(root.get("name")), "%soundbar%")
                    ));
                    predicates.add(cb.notEqual(cb.lower(root.get("category")), "smartphones"));
                } else if (isTvTarget) {
                    predicates.add(cb.and(
                            cb.or(
                                    cb.equal(cb.lower(root.get("category")), "smart tvs & home entertainment"),
                                    cb.like(cb.lower(root.get("name")), "%tv%"),
                                    cb.like(cb.lower(root.get("name")), "%television%")
                            ),
                            cb.notLike(cb.lower(root.get("name")), "%soundbar%"),
                            cb.notLike(cb.lower(root.get("name")), "%home theatre%")
                    ));
                } else if (isPhoneTarget) {
                    // Strictly limit phone/mobile queries to actual Smartphones
                    predicates.add(cb.equal(cb.lower(root.get("category")), "smartphones"));
                    String[] tokens = cleanQuery.split("\\s+");
                    List<Predicate> specificTokens = new ArrayList<>();
                    for (String token : tokens) {
                        String t = token.trim();
                        if (!t.isEmpty() && !t.equals("phone") && !t.equals("phones") && !t.equals("mobile") && !t.equals("mobiles") && !t.equals("smartphone") && !t.equals("smartphones")) {
                            String pattern = "%" + t + "%";
                            specificTokens.add(cb.or(
                                    cb.like(cb.lower(root.get("name")), pattern),
                                    cb.like(cb.lower(root.get("description")), pattern),
                                    cb.like(cb.lower(root.get("brand")), pattern),
                                    cb.like(cb.lower(root.get("specifications")), pattern)
                            ));
                        }
                    }
                    if (!specificTokens.isEmpty()) {
                        predicates.add(cb.and(specificTokens.toArray(new Predicate[0])));
                    }
                } else if (isLaptopTarget) {
                    predicates.add(cb.equal(cb.lower(root.get("category")), "laptops"));
                    String[] tokens = cleanQuery.split("\\s+");
                    List<Predicate> specificTokens = new ArrayList<>();
                    for (String token : tokens) {
                        String t = token.trim();
                        if (!t.isEmpty() && !t.equals("laptop") && !t.equals("laptops") && !t.equals("notebook") && !t.equals("notebooks") && !t.equals("macbook") && !t.equals("macbooks")) {
                            String pattern = "%" + t + "%";
                            specificTokens.add(cb.or(
                                    cb.like(cb.lower(root.get("name")), pattern),
                                    cb.like(cb.lower(root.get("description")), pattern),
                                    cb.like(cb.lower(root.get("brand")), pattern),
                                    cb.like(cb.lower(root.get("specifications")), pattern)
                            ));
                        }
                    }
                    if (!specificTokens.isEmpty()) {
                        predicates.add(cb.and(specificTokens.toArray(new Predicate[0])));
                    }
                } else if (isWatchTarget) {
                    predicates.add(cb.equal(cb.lower(root.get("category")), "smartwatches"));
                } else {
                    String[] tokens = cleanQuery.split("\\s+");
                    List<Predicate> tokenPredicates = new ArrayList<>();
                    for (String token : tokens) {
                        if (!token.isEmpty()) {
                            String pattern = "%" + token + "%";
                            Predicate nameLike = cb.like(cb.lower(root.get("name")), pattern);
                            Predicate descLike = cb.like(cb.lower(root.get("description")), pattern);
                            Predicate brandLike = cb.like(cb.lower(root.get("brand")), pattern);
                            Predicate catLike = cb.like(cb.lower(root.get("category")), pattern);
                            Predicate specLike = cb.like(cb.lower(root.get("specifications")), pattern);
                            tokenPredicates.add(cb.or(nameLike, descLike, brandLike, catLike, specLike));
                        }
                    }
                    if (!tokenPredicates.isEmpty()) {
                        predicates.add(cb.or(tokenPredicates.toArray(new Predicate[0])));
                    }
                }
            }

            if (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("All")) {
                String cleanCat = category.trim().toLowerCase();
                if (cleanCat.contains("audio") || cleanCat.contains("headphone") || cleanCat.contains("earphone") || cleanCat.contains("speaker") || cleanCat.contains("soundbar")) {
                    predicates.add(cb.or(
                            cb.equal(cb.lower(root.get("category")), "audio & headphones"),
                            cb.like(cb.lower(root.get("category")), "%audio%")
                    ));
                } else if (cleanCat.contains("tv") || cleanCat.contains("television")) {
                    predicates.add(cb.and(
                            cb.or(
                                    cb.equal(cb.lower(root.get("category")), "smart tvs & home entertainment"),
                                    cb.like(cb.lower(root.get("category")), "%tv%")
                            ),
                            cb.notLike(cb.lower(root.get("name")), "%soundbar%"),
                            cb.notLike(cb.lower(root.get("name")), "%home theatre%")
                    ));
                } else if (cleanCat.contains("charger") || cleanCat.contains("power")) {
                    predicates.add(cb.or(
                            cb.like(cb.lower(root.get("name")), "%charger%"),
                            cb.like(cb.lower(root.get("name")), "%power bank%"),
                            cb.like(cb.lower(root.get("name")), "%adapter%"),
                            cb.like(cb.lower(root.get("name")), "%power station%"),
                            cb.equal(cb.lower(root.get("category")), "power banks & portable power")
                    ));
                } else if (cleanCat.contains("phone") || cleanCat.contains("smartphone") || cleanCat.contains("mobile")) {
                    predicates.add(cb.or(
                            cb.equal(cb.lower(root.get("category")), "smartphones"),
                            cb.like(cb.lower(root.get("category")), "%smartphone%")
                    ));
                } else if (cleanCat.contains("watch")) {
                    predicates.add(cb.or(
                            cb.equal(cb.lower(root.get("category")), "smartwatches"),
                            cb.like(cb.lower(root.get("category")), "%smartwatch%")
                    ));
                } else {
                    predicates.add(cb.or(
                            cb.equal(cb.lower(root.get("category")), cleanCat),
                            cb.like(cb.lower(root.get("category")), "%" + cleanCat + "%")
                    ));
                }
            }

            if (minPrice != null && minPrice >= 0) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }

            if (maxPrice != null && maxPrice > 0) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            if (minRating != null && minRating > 0) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("rating"), minRating));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        // When a search query is provided, fetch all candidates, rank them globally by relevance, and paginate
        if (query != null && !query.trim().isEmpty()) {
            String cleanQuery = query.trim().toLowerCase();
            String[] tokens = cleanQuery.split("\\s+");
            List<String> significantTokens = java.util.Arrays.stream(tokens)
                    .filter(t -> !STOP_WORDS.contains(t) && t.length() > 1)
                    .collect(Collectors.toList());

            List<Product> allMatches = productRepository.findAll(spec);
            if (allMatches.isEmpty()) {
                return new PageImpl<>(new ArrayList<>(), pageable, 0);
            }

            // Score and sort candidates
            if (sortBy != null && !sortBy.isEmpty() && !sortBy.equalsIgnoreCase("id")) {
                if (sortBy.equalsIgnoreCase("price_asc") || (sortBy.equalsIgnoreCase("price") && sortDir.equalsIgnoreCase("asc"))) {
                    allMatches.sort(Comparator.comparing(Product::getPrice, Comparator.nullsLast(Comparator.naturalOrder())));
                } else if (sortBy.equalsIgnoreCase("price_desc") || (sortBy.equalsIgnoreCase("price") && sortDir.equalsIgnoreCase("desc"))) {
                    allMatches.sort(Comparator.comparing(Product::getPrice, Comparator.nullsLast(Comparator.reverseOrder())));
                } else if (sortBy.equalsIgnoreCase("rating_desc") || sortBy.equalsIgnoreCase("rating")) {
                    allMatches.sort(Comparator.comparing(Product::getRating, Comparator.nullsLast(Comparator.reverseOrder())));
                }
            } else {
                // Default search sorting: Highest relevance score first, then rating
                allMatches.sort((p1, p2) -> {
                    int s1 = computeRelevanceScore(p1, cleanQuery, tokens, significantTokens);
                    int s2 = computeRelevanceScore(p2, cleanQuery, tokens, significantTokens);
                    if (s2 != s1) {
                        return Integer.compare(s2, s1);
                    }
                    double r1 = p1.getRating() != null ? p1.getRating() : 0.0;
                    double r2 = p2.getRating() != null ? p2.getRating() : 0.0;
                    return Double.compare(r2, r1);
                });

                // Strict noise elimination:
                int maxScore = allMatches.stream()
                        .mapToInt(p -> computeRelevanceScore(p, cleanQuery, tokens, significantTokens))
                        .max()
                        .orElse(0);

                if (maxScore >= 80) {
                    final int cutoff = Math.max(45, (int)(maxScore * 0.35));
                    allMatches = allMatches.stream()
                            .filter(p -> computeRelevanceScore(p, cleanQuery, tokens, significantTokens) >= cutoff)
                            .collect(Collectors.toList());
                } else if (maxScore > 0) {
                    allMatches = allMatches.stream()
                            .filter(p -> computeRelevanceScore(p, cleanQuery, tokens, significantTokens) >= 15)
                            .collect(Collectors.toList());
                }
            }

            int total = allMatches.size();
            int fromIndex = Math.min(page * size, total);
            int toIndex = Math.min(fromIndex + size, total);
            List<Product> pageContent = allMatches.subList(fromIndex, toIndex);
            return new PageImpl<>(pageContent, pageable, total);
        }

        // Standard catalog browsing: database-level pagination
        return productRepository.findAll(spec, pageable);
    }

    private boolean isAudioQuery(String cleanQuery) {
        if (cleanQuery == null) return false;
        return cleanQuery.matches(".*\\b(audio|bluetooth|speakers?|soundbars?|headphones?|earphones?|earbuds?|airpods?|tws|headsets?)\\b.*");
    }

    private boolean isTvQuery(String cleanQuery) {
        if (cleanQuery == null) return false;
        return cleanQuery.matches(".*\\b(tvs?|televisions?|smart\\s*tv(?:s)?|oled\\s*tv|qled\\s*tv|4k\\s*tv)\\b.*");
    }

    private boolean isPhoneQuery(String cleanQuery) {
        if (cleanQuery == null) return false;
        if (cleanQuery.contains("headphone") || cleanQuery.contains("earphone")) {
            return false;
        }
        return cleanQuery.matches(".*\\b(phones?|mobiles?|smartphones?|cellphones?)\\b.*");
    }

    private boolean isLaptopQuery(String cleanQuery) {
        if (cleanQuery == null) return false;
        if (cleanQuery.contains("charger") || cleanQuery.contains("bag") || cleanQuery.contains("skin") || cleanQuery.contains("stand")) {
            return false;
        }
        return cleanQuery.matches(".*\\b(laptops?|macbooks?|notebooks?)\\b.*");
    }

    private boolean isWatchQuery(String cleanQuery) {
        if (cleanQuery == null) return false;
        if (cleanQuery.contains("strap") || cleanQuery.contains("charger")) {
            return false;
        }
        return cleanQuery.matches(".*\\b(smart\\s*watch(?:es)?|watches)\\b.*");
    }

    private int computeRelevanceScore(Product p, String cleanQuery, String[] tokens, List<String> significantTokens) {
        String name = (p.getName() != null ? p.getName() : "").toLowerCase();
        String brand = (p.getBrand() != null ? p.getBrand() : "").toLowerCase();
        String cat = (p.getCategory() != null ? p.getCategory() : "").toLowerCase();
        String desc = (p.getDescription() != null ? p.getDescription() : "").toLowerCase();
        String specs = (p.getSpecifications() != null ? p.getSpecifications() : "").toLowerCase();
        String combined = name + " " + brand + " " + cat + " " + desc + " " + specs;

        boolean isAudioTarget = isAudioQuery(cleanQuery);
        boolean isTvTarget = isTvQuery(cleanQuery);
        boolean isPhoneTarget = !isAudioTarget && isPhoneQuery(cleanQuery);
        if (isPhoneTarget) {
            // Strictly disqualify audio products (headphones, earphones, earbuds) from phone searches
            if (cat.contains("audio") || name.contains("headphone") || name.contains("earphone")) {
                return 0;
            }
        }
        if (isAudioTarget) {
            // Strictly disqualify smartphones from audio searches
            if (cat.contains("smartphone") || (isPhoneQuery(name) && !name.contains("headphone") && !name.contains("earphone"))) {
                return 0;
            }
        }
        if (isTvTarget) {
            // Strictly disqualify soundbars and non-tv items from TV searches
            if (name.contains("soundbar") || name.contains("home theatre") || cat.contains("smartphone") || cat.contains("audio")) {
                return 0;
            }
        }

        String searchName = name;
        String searchCat = cat;
        String searchDesc = desc;
        String searchCombined = combined;

        // If searching for phones, strip "headphones" and "earphones" so they never falsely match as "phones"
        if (cleanQuery.contains("phone")) {
            searchName = searchName.replaceAll("(?i)\\b(head|ear)phones?\\b", "");
            searchCat = searchCat.replaceAll("(?i)\\b(head|ear)phones?\\b", "");
            searchDesc = searchDesc.replaceAll("(?i)\\b(head|ear)phones?\\b", "");
            searchCombined = searchCombined.replaceAll("(?i)\\b(head|ear)phones?\\b", "");
        }

        int score = 0;

        // High-priority Category Intent Bonus
        if (isPhoneTarget && cat.contains("smartphone")) {
            score += 300;
        } else if (isLaptopQuery(cleanQuery) && cat.contains("laptop")) {
            score += 300;
        } else if (isWatchQuery(cleanQuery) && cat.contains("smartwatch")) {
            score += 300;
        } else if (isAudioTarget && cat.contains("audio")) {
            score += 300;
        } else if (isTvTarget && (cat.contains("tv") || name.contains("tv"))) {
            score += 300;
        }

        // 1. Exact match in name is highest priority
        if (searchName.equalsIgnoreCase(cleanQuery)) {
            score += 250;
        } else if (searchName.startsWith(cleanQuery)) {
            score += 180;
        } else if (searchName.contains(cleanQuery)) {
            score += 120;
        } else if (searchCombined.contains(cleanQuery)) {
            score += 60;
        }

        // 2. Exact brand match
        if (brand.equalsIgnoreCase(cleanQuery)) {
            score += 100;
        } else if (brand.contains(cleanQuery)) {
            score += 50;
        }

        // 3. Category match
        if (searchCat.equalsIgnoreCase(cleanQuery)) {
            score += 90;
        } else if (searchCat.contains(cleanQuery)) {
            score += 45;
        }

        // 4. Token match scoring (focused on significant non-stop tokens)
        List<String> targetTokens = !significantTokens.isEmpty() ? significantTokens : java.util.Arrays.asList(tokens);
        int primaryMatches = 0;
        int tokensMatched = 0;

        for (String t : targetTokens) {
            if (t.length() > 1) {
                String tokenName = name;
                String tokenCat = cat;
                String tokenDesc = desc;
                if (t.equals("phone") || t.equals("phones") || t.equals("mobile") || t.equals("mobiles")) {
                    tokenName = tokenName.replaceAll("(?i)\\b(head|ear)phones?\\b", "");
                    tokenCat = tokenCat.replaceAll("(?i)\\b(head|ear)phones?\\b", "");
                    tokenDesc = tokenDesc.replaceAll("(?i)\\b(head|ear)phones?\\b", "");
                }

                boolean matched = false;
                if (tokenName.contains(t)) {
                    score += 40;
                    primaryMatches++;
                    matched = true;
                }
                if (brand.contains(t)) {
                    score += 30;
                    primaryMatches++;
                    matched = true;
                }
                if (tokenCat.contains(t)) {
                    score += 25;
                    primaryMatches++;
                    matched = true;
                }
                if (specs.contains(t)) {
                    score += 10;
                    matched = true;
                }
                if (tokenDesc.contains(t)) {
                    score += 3;
                    matched = true;
                }
                if (matched) tokensMatched++;
            }
        }

        // 5. Multi-token completeness bonus (Conjunctive affinity):
        if (targetTokens.size() > 1 && tokensMatched == targetTokens.size()) {
            score += 140;
        } else if (targetTokens.size() > 1 && tokensMatched > 1) {
            score += 40;
        }

        // Penalty if product ONLY matched in secondary description body without name/brand/category match
        if (primaryMatches == 0) {
            score = Math.max(0, score - 30);
        }

        // 6. Category intent alignment bonuses
        if ((cleanQuery.contains("bud") || cleanQuery.contains("earbud") || cleanQuery.contains("headphone") || cleanQuery.contains("audio") || cleanQuery.contains("speaker")) && cat.contains("audio")) {
            score += 35;
        }
        if ((cleanQuery.contains("phone") || cleanQuery.contains("mobile") || cleanQuery.contains("galaxy") || cleanQuery.contains("iphone") || cleanQuery.contains("pixel")) && cat.contains("smartphone")) {
            score += 35;
        }
        if ((cleanQuery.contains("laptop") || cleanQuery.contains("macbook") || cleanQuery.contains("thinkpad") || cleanQuery.contains("notebook")) && cat.contains("laptop")) {
            score += 35;
        }
        if ((cleanQuery.contains("watch") || cleanQuery.contains("band")) && cat.contains("smartwatch")) {
            score += 35;
        }
        if ((cleanQuery.contains("tab") || cleanQuery.contains("tablet") || cleanQuery.contains("ipad")) && cat.contains("tablet")) {
            score += 35;
        }
        if ((cleanQuery.contains("tv") || cleanQuery.contains("television") || cleanQuery.contains("oled") || cleanQuery.contains("bravia")) && cat.contains("tv")) {
            score += 35;
        }
        if ((cleanQuery.contains("camera") || cleanQuery.contains("lens") || cleanQuery.contains("dslr")) && cat.contains("camera")) {
            score += 35;
        }
        if ((cleanQuery.contains("drone") || cleanQuery.contains("gimbal") || cleanQuery.contains("dji")) && cat.contains("drone")) {
            score += 35;
        }
        if ((cleanQuery.contains("charger") || cleanQuery.contains("power bank") || cleanQuery.contains("powerbank")) && (cat.contains("power") || name.contains("charger") || name.contains("power bank"))) {
            score += 35;
        }

        // 7. Rating boost
        if (p.getRating() != null) {
            score += (int) (p.getRating() * 2);
        }

        return score;
    }

    public List<Product> getAllProductsList() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));
    }

    public List<Product> getProductsByIds(List<Long> ids) {
        return productRepository.findAllById(ids);
    }

    @Transactional
    public Product createProduct(Product product) {
        if (product.getPrice() == null || product.getPrice() < 0) {
            throw new IllegalArgumentException("Price must be a non-negative number");
        }
        if (product.getStock() == null || product.getStock() < 0) {
            product.setStock(0);
        }
        if (product.getRating() == null || product.getRating() <= 0) {
            product.setRating(4.5);
        }
        if (product.getReviewCount() == null) {
            product.setReviewCount(0);
        }
        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long id, Product updatedProduct) {
        Product existing = getProductById(id);
        if (updatedProduct.getName() != null) existing.setName(updatedProduct.getName());
        if (updatedProduct.getBrand() != null) existing.setBrand(updatedProduct.getBrand());
        if (updatedProduct.getCategory() != null) existing.setCategory(updatedProduct.getCategory());
        if (updatedProduct.getPrice() != null) existing.setPrice(updatedProduct.getPrice());
        if (updatedProduct.getStock() != null) existing.setStock(updatedProduct.getStock());
        if (updatedProduct.getImageUrl() != null) existing.setImageUrl(updatedProduct.getImageUrl());
        if (updatedProduct.getDescription() != null) existing.setDescription(updatedProduct.getDescription());
        if (updatedProduct.getSpecifications() != null) existing.setSpecifications(updatedProduct.getSpecifications());
        if (updatedProduct.getRating() != null) existing.setRating(updatedProduct.getRating());
        return productRepository.save(existing);
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new IllegalArgumentException("Cannot delete: product not found with id: " + id);
        }
        jdbcTemplate.update("DELETE FROM wishlist WHERE product_id = ?", id);
        jdbcTemplate.update("DELETE FROM interactions WHERE product_id = ?", id);
        jdbcTemplate.update("DELETE FROM reviews WHERE product_id = ?", id);
        jdbcTemplate.update("DELETE FROM order_items WHERE product_id = ?", id);
        productRepository.deleteById(id);
    }

    public List<String> getCategories() {
        return productRepository.findDistinctCategories();
    }

    public List<String> getBrands() {
        return productRepository.findDistinctBrands();
    }
}
