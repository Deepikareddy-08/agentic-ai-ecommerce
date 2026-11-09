package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.OrderItemRequest;
import com.ecommerce.backend.dto.OrderRequest;
import com.ecommerce.backend.model.Order;
import com.ecommerce.backend.model.Product;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class OrderServiceTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    public void testPlaceOrderValidatesStockAndDeducts() {
        Product product = productRepository.findAll().get(0);
        int initialStock = product.getStock();
        double expectedPrice = product.getPrice();

        User user = userRepository.findByUsername("deepika").orElse(null);

        OrderRequest request = new OrderRequest();
        request.setCustomerName("Deepika R");
        request.setCustomerEmail("deepika@ecommerce.local");
        request.setItems(List.of(new OrderItemRequest(product.getId(), 2)));

        Order placedOrder = orderService.placeOrder(request, user);

        assertNotNull(placedOrder.getId());
        assertEquals(expectedPrice * 2, placedOrder.getTotalPrice(), 0.01);
        assertEquals("PLACED", placedOrder.getStatus());
        assertEquals(1, placedOrder.getItems().size());

        // Check stock was decremented
        Product updatedProduct = productRepository.findById(product.getId()).orElseThrow();
        assertEquals(initialStock - 2, updatedProduct.getStock());
    }

    @Test
    public void testPlaceOrderInsufficientStockThrows() {
        Product product = productRepository.findAll().get(0);

        OrderRequest request = new OrderRequest();
        request.setItems(List.of(new OrderItemRequest(product.getId(), product.getStock() + 100)));

        assertThrows(IllegalStateException.class, () -> {
            orderService.placeOrder(request, null);
        });
    }
}
