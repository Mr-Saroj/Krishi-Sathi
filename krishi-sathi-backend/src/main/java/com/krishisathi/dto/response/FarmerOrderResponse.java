package com.krishisathi.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FarmerOrderResponse {

    private String orderId;

    private String productId;
    private String productName;
    private String productImage;

    private Integer quantity;

    private String productQuantity;

    private BigDecimal productTotal;

    private BigDecimal platformFee;

    private BigDecimal deliveryFee;

    private BigDecimal totalSumFee;

    private String paymentMode;

    private String paymentStatus;

    private String deliveryAddressId;

    private String orderStatus;
}