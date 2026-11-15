package com.krishisathi.service.common;

public record NotificationMessage(
        
        String messageId,
        String recipient,
        String subject,
        String orderId,

        String productName,
        String brand,
        String imageUrl,

        Integer quantity,
        String productQuantity,

        String productTotal,
        String platformFee,
        String deliveryFee,
        String totalSumFee,

        String paymentMode,
        String paymentStatus

) {
}