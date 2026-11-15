package com.krishisathi.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class PickupOtpResponse {

    private String orderId;
    private String pickupOtp;
    private Instant expiresAt;
    private String message;
}