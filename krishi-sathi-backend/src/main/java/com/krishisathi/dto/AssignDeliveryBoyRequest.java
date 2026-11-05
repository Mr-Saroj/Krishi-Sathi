package com.krishisathi.dto;

import jakarta.validation.constraints.NotBlank;

public record AssignDeliveryBoyRequest(
        @NotBlank(message = "deliveryBoyId is required")
        String deliveryBoyId
) {}