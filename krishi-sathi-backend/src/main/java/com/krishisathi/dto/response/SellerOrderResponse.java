package com.krishisathi.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class SellerOrderResponse {

    // Order details
    private String orderId;
    private String farmerId;
    private String productId;
    private Integer quantity;
    private String productQuantity;
    private String productName;

    private BigDecimal productTotal;
    private BigDecimal platformFee;
    private BigDecimal deliveryFee;
    private BigDecimal totalSumFee;

    private String paymentMode;
    private String paymentStatus;
    private String farmerDeliveryAddressId;

    // Current order status
    private String orderStatus;

    // Seller assignment details
    private String assignmentId;
    private String sellerId;
    private String sellerName;
    private String sellerPhone;
    private Instant assignedAt;

    // Delivery assignment details
    private String deliveryStatus;
    private String deliveryBoyId;
    private String deliveryBoyName;
    private String deliveryBoyPhone;
    private Instant acceptedAt;
}