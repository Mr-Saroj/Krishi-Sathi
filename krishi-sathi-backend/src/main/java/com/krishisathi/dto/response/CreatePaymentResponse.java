package com.krishisathi.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CreatePaymentResponse {

    private String businessOrderId;

    private String razorpayOrderId;

    private Long amount;

    private String currency;

    private String keyId;
}