package com.krishisathi.repository;

import com.krishisathi.model.OrderStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface OrderStatusRepository
        extends MongoRepository<OrderStatus, String> {

    List<OrderStatus> findByOrderStatusIgnoreCase(String orderStatus);
}