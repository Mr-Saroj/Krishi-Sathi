package com.krishisathi.dto.response;

public record PendingSellerResponse(
        String sellerId,
        String fullName,
        String email,
        String mobileNumber,
        String loginAccess
) {}