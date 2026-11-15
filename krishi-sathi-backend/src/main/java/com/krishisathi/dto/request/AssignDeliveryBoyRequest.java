package com.krishisathi.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AssignDeliveryBoyRequest(
        @NotBlank(message = "deliveryBoyId is required")
        String deliveryBoyId
) {}