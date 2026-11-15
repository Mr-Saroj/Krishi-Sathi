package com.krishisathi.repository;

import com.krishisathi.model.OrderAssignment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface OrderAssignmentRepository
        extends MongoRepository<OrderAssignment, String> {

    List<OrderAssignment> findBySellerId(String sellerId);

    Optional<OrderAssignment> findByOrderIdAndSellerId(
            String orderId,
            String sellerId);

    Optional<OrderAssignment> findByOrderId(String orderId);
}