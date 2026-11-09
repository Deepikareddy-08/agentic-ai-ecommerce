package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.OrderItemRequest;
import com.ecommerce.backend.dto.OrderRequest;
import com.ecommerce.backend.model.Order;
import com.ecommerce.backend.model.OrderItem;
import com.ecommerce.backend.model.Product;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.repository.OrderItemRepository;
import com.ecommerce.backend.repository.OrderRepository;
import com.ecommerce.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InteractionService interactionService;

    @Transactional
    public Order placeOrder(OrderRequest request, User currentUser) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cannot place an empty order");
        }

        Order order = new Order();
        order.setUser(currentUser);
        order.setCustomerName(currentUser != null ? currentUser.getUsername() : request.getCustomerName());
        order.setCustomerEmail(currentUser != null ? currentUser.getEmail() : request.getCustomerEmail());
        order.setStatus("PLACED");

        double totalAmount = 0.0;
        List<OrderItem> items = new ArrayList<>();

        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + itemReq.getProductId()));

            if (product.getStock() < itemReq.getQuantity()) {
                throw new IllegalStateException("Insufficient stock for product '" + product.getName() + "'. Available: " + product.getStock());
            }

            // Decrement stock
            product.setStock(product.getStock() - itemReq.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setProductName(product.getName());
            orderItem.setUnitPrice(product.getPrice()); // Always use database price
            orderItem.setQuantity(itemReq.getQuantity());

            totalAmount += product.getPrice() * itemReq.getQuantity();
            items.add(orderItem);

            // Log purchase interaction for personalization
            if (currentUser != null) {
                interactionService.logInteraction(currentUser.getId(), product.getId(), "PURCHASE");
            }
        }

        order.setTotalPrice(Math.round(totalAmount * 100.0) / 100.0);
        order.setItems(items);

        return orderRepository.save(order);
    }

    public List<Order> getOrdersForUser(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Order> getAllOrdersForAdmin() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + orderId));
        order.setStatus(newStatus.toUpperCase().trim());
        return orderRepository.save(order);
    }
}
