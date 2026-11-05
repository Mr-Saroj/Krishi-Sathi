package com.krishisathi.dto;

import jakarta.validation.constraints.NotBlank;

public record AssignSellerRequest(
        @NotBlank(message = "sellerId is required")
        String sellerId
) {}