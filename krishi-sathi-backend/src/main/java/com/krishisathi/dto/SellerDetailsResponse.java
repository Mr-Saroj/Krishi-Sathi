package com.krishisathi.dto;

import com.krishisathi.model.SellerProfile;

public record SellerDetailsResponse(
        String sellerId,
        String fullName,
        String email,
        String mobileNumber,
        String role,
        String loginAccess,
        SellerProfile businessDetails
) {
}