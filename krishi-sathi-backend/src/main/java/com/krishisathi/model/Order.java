package com.krishisathi.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;

@Data
@Document(collection = "orders")
public class Order {

    @Id
    private String id;

    private String farmerId;

    private String productId;

    private Integer quantity;

    private String productQuantity;

    private BigDecimal productTotal;

    private BigDecimal platformFee;

    private BigDecimal deliveryFee;

    private BigDecimal totalSumFee;

    private String paymentMode;

    private String paymentStatus;

    private String farmerDeliveryAddressId;
}