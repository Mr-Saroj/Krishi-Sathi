package com.krishisathi.dto;

public record PendingSellerResponse(
        String sellerId,
        String fullName,
        String email,
        String mobileNumber,
        String loginAccess
) {}