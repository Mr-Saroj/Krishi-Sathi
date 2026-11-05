package com.krishisathi.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Collection: order_assignments
 * Same style as OrderStatus: a flat document linked to the order by orderId.
 * One document per order.
 */
@Data
@Document(collection = "order_assignments")
public class OrderAssignment {

    @Id
    private String id;

    @Indexed(unique = true)
    private String orderId;

    // seller (null until assigned)
    private String sellerId;
    private String sellerName;
    private String sellerPhone;

    // delivery boy (null until assigned)
    private String deliveryBoyId;
    private String deliveryBoyName;
    private String deliveryBoyPhone;

    private Instant createdAt;
    private Instant updatedAt;
}