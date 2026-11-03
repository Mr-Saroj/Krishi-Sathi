package com.krishisathi.repository;

import com.krishisathi.model.OrderStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface OrderStatusRepository
        extends MongoRepository<OrderStatus, String> {
}