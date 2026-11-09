package com.ecommerce.backend.repository;

import com.ecommerce.backend.model.User;
import com.ecommerce.backend.model.UserPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserPreferenceRepository extends JpaRepository<UserPreference, Long> {
    Optional<UserPreference> findByUser(User user);
    Optional<UserPreference> findByUserId(Long userId);
}
