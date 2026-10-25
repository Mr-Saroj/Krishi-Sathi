package com.krishisathi.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record WebSellerRegisterRequest(

        @NotBlank(message = "Full name is required")
        @Size(max = 100)
        String fullName,

        @NotBlank(message = "Mobile number is required")
        @Pattern(
                regexp = "^[6-9]\\d{9}$",
                message = "Enter a valid 10-digit Indian mobile number")
        String mobileNumber,

        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email address")
        String email,

        @NotBlank(message = "Business/shop name is required")
        @Size(max = 150)
        String businessName,

        @NotBlank(message = "City/village is required")
        String city,

        @NotBlank(message = "State is required")
        String state,

        @NotBlank(message = "PIN code is required")
        @Pattern(
                regexp = "^[1-9][0-9]{5}$",
                message = "Enter a valid 6-digit PIN code")
        String pinCode,

        // Optional fields
        String aadhaarNumber,
        String panNumber,
        String panDocumentUrl,
        String businessType,
        String businessAddress,
        String gstin,
        String businessRegistrationNumber,
        String productLicense,
        String supportingDocumentsUrl,
        String accountHolderName,
        String ifscCode,
        String accountNumber,
        String bankProofUrl
) {
}