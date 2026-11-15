
package com.krishisathi.dto.request;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record WebSellerRegisterRequest(

                // Personal details
                @NotBlank(message = "Full name is required") @Size(max = 100, message = "Full name cannot exceed 100 characters") String fullName,

                @NotBlank(message = "Mobile number is required") @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit Indian mobile number") String mobileNumber,

                @NotBlank(message = "Email is required") @Email(message = "Enter a valid email address") String email,
                @NotBlank(message = "Password is required") @Size(min = 8, max = 72, message = "Password must contain 8 to 72 characters") String password,

                // Business details
                @NotBlank(message = "Business/shop name is required") @Size(max = 150, message = "Business name cannot exceed 150 characters") String businessName,

                @NotBlank(message = "City/village is required") String city,

                @NotBlank(message = "State is required") String state,

                @NotBlank(message = "PIN code is required") @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Enter a valid 6-digit PIN code") String pinCode,

                @NotBlank(message = "Aadhaar number is required") @Pattern(regexp = "^[2-9]\\d{11}$", message = "Enter a valid 12-digit Aadhaar number") String aadhaarNumber,

                @NotBlank(message = "PAN number is required") @Pattern(regexp = "^[A-Z]{5}[0-9]{4}[A-Z]$", message = "Enter a valid PAN number, for example ABCDE1234F") String panNumber,

                @NotNull(message = "PAN document image is required") MultipartFile panDocument,

                @NotBlank(message = "Business type is required") String businessType,

                @NotBlank(message = "Business address is required") String businessAddress,

                @NotBlank(message = "GSTIN is required") @Pattern(regexp = "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$", message = "Enter a valid GSTIN") String gstin,

                @NotBlank(message = "Business registration number is required") String businessRegistrationNumber,

                @NotBlank(message = "Product license is required") String productLicense,

                @NotNull(message = "Supporting document file is required") MultipartFile supportingDocuments,
                // Bank details
                @NotBlank(message = "Account holder name is required") String accountHolderName,

                @NotBlank(message = "IFSC code is required") @Pattern(regexp = "^[A-Z]{4}0[A-Z0-9]{6}$", message = "Enter a valid IFSC code") String ifscCode,

                @NotBlank(message = "Bank account number is required") @Pattern(regexp = "^[0-9]{9,18}$", message = "Enter a valid bank account number") String accountNumber,

                @NotNull(message = "Bank proof image is required") MultipartFile bankProof

) {
}
