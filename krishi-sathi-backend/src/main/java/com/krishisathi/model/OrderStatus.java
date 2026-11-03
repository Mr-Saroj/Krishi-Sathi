package com.krishisathi.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "order_status")
public class OrderStatus {

    @Id
    private String id;

    private String orderId;

    private String orderStatus;
}