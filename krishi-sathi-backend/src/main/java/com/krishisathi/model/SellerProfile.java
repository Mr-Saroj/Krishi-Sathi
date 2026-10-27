
package com.krishisathi.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "seller_profiles")
public class SellerProfile {

    @Id
    private String id;

    // Link to the common user account
    private String userId;

    // Business details
    private String businessName;
    private String city;
    private String state;
    private String pinCode;
    private String businessType;
    private String businessAddress;
    private String gstin;
    private String businessRegistrationNumber;
    private String productLicense;

    // Identity details
    private String aadhaarNumber;
    private String panNumber;
    private String panDocumentUrl;

    // Supporting documents
    private String supportingDocumentsUrl;

    // Bank details
    private String accountHolderName;
    private String ifscCode;
    private String accountNumber;
    private String bankProofUrl;

    // Approval and timestamps
    // private LoginAccess loginAccess = LoginAccess.PENDING;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant approvedAt;
}
