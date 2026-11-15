package com.krishisathi.dto.response;


import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class SettlementPendingResponse {

    private String orderId;
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
    private String settlementStatus;

    private String farmerDeliveryAddressId;

    // Seller details from OrderAssignment
    private String sellerId;
    private String sellerName;
    private String sellerPhone;

    // Delivery boy details from OrderAssignment
    private String deliveryBoyId;
    private String deliveryBoyName;
    private String deliveryBoyPhone;
}
