package com.krishisathi.dto.response;

import com.krishisathi.model.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PaymentStatusResponse {

    private String orderId;

    private String paymentId;

    private PaymentStatus paymentStatus;

    private String message;
}