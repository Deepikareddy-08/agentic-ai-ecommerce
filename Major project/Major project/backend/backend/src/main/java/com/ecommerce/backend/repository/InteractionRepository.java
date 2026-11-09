package com.ecommerce.backend.repository;

import com.ecommerce.backend.model.Interaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InteractionRepository extends JpaRepository<Interaction, Long> {
    List<Interaction> findByUserIdOrderByTimestampDesc(Long userId);
    List<Interaction> findByProductIdOrderByTimestampDesc(Long productId);

    @Query("SELECT DISTINCT i.product.id FROM Interaction i WHERE i.user.id = :userId")
    List<Long> findInteractedProductIdsByUserId(@Param("userId") Long userId);
}
