package com.krishisathi.repository;

import com.krishisathi.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface OrderRepository extends MongoRepository<Order, String> {

    List<Order> findByIdIn(List<String> ids);
}