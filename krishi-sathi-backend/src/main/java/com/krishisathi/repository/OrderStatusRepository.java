package com.krishisathi.repository;

import com.krishisathi.model.OrderStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;
import java.util.Collection;
import java.util.List;

public interface OrderStatusRepository
        extends MongoRepository<OrderStatus, String> {

    List<OrderStatus> findByOrderStatusIgnoreCase(String orderStatus);
     Optional<OrderStatus> findByOrderId(String orderId);
      List<OrderStatus> findByOrderIdInAndOrderStatusIn(
        Collection<String> orderIds,
        Collection<String> orderStatuses
);
}