package com.krishisathi.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "sellers")
public class Seller {

    @Id
    private String id;

    // Required registration fields
    private String fullName;

    @Indexed(unique = true)
    private String mobileNumber;

    @Indexed(unique = true)
    private String email;

    private String businessName;
    private String city;
    private String state;
    private String pinCode;

    // Optional identity details
    private String aadhaarNumber;
    private String panNumber;
    private String panDocumentUrl;

    // Optional business details
    private String businessType;
    private String businessAddress;
    private String gstin;
    private String businessRegistrationNumber;
    private String productLicense;
    private String supportingDocumentsUrl;

    // Optional bank details
    private String accountHolderName;
    private String ifscCode;
    private String accountNumber;
    private String bankProofUrl;

    // Set a password after approval
    private String password;

    // PENDING until admin approves the seller
    private SellerLoginAccess loginAccess = SellerLoginAccess.PENDING;

    // True only when every profile field designated below is populated
    private boolean profileIsComplete;

    private Instant createdAt;
    private Instant updatedAt;
    private Instant approvedAt;

    public Seller() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPinCode() {
        return pinCode;
    }

    public void setPinCode(String pinCode) {
        this.pinCode = pinCode;
    }

    public String getAadhaarNumber() {
        return aadhaarNumber;
    }

    public void setAadhaarNumber(String aadhaarNumber) {
        this.aadhaarNumber = aadhaarNumber;
    }

    public String getPanNumber() {
        return panNumber;
    }

    public void setPanNumber(String panNumber) {
        this.panNumber = panNumber;
    }

    public String getPanDocumentUrl() {
        return panDocumentUrl;
    }

    public void setPanDocumentUrl(String panDocumentUrl) {
        this.panDocumentUrl = panDocumentUrl;
    }

    public String getBusinessType() {
        return businessType;
    }

    public void setBusinessType(String businessType) {
        this.businessType = businessType;
    }

    public String getBusinessAddress() {
        return businessAddress;
    }

    public void setBusinessAddress(String businessAddress) {
        this.businessAddress = businessAddress;
    }

    public String getGstin() {
        return gstin;
    }

    public void setGstin(String gstin) {
        this.gstin = gstin;
    }

    public String getBusinessRegistrationNumber() {
        return businessRegistrationNumber;
    }

    public void setBusinessRegistrationNumber(String businessRegistrationNumber) {
        this.businessRegistrationNumber = businessRegistrationNumber;
    }

    public String getProductLicense() {
        return productLicense;
    }

    public void setProductLicense(String productLicense) {
        this.productLicense = productLicense;
    }

    public String getSupportingDocumentsUrl() {
        return supportingDocumentsUrl;
    }

    public void setSupportingDocumentsUrl(String supportingDocumentsUrl) {
        this.supportingDocumentsUrl = supportingDocumentsUrl;
    }

    public String getAccountHolderName() {
        return accountHolderName;
    }

    public void setAccountHolderName(String accountHolderName) {
        this.accountHolderName = accountHolderName;
    }

    public String getIfscCode() {
        return ifscCode;
    }

    public void setIfscCode(String ifscCode) {
        this.ifscCode = ifscCode;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getBankProofUrl() {
        return bankProofUrl;
    }

    public void setBankProofUrl(String bankProofUrl) {
        this.bankProofUrl = bankProofUrl;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public SellerLoginAccess getLoginAccess() {
        return loginAccess;
    }

    public void setLoginAccess(SellerLoginAccess loginAccess) {
        this.loginAccess = loginAccess;
    }

    public boolean isProfileIsComplete() {
        return profileIsComplete;
    }

    public void setProfileIsComplete(boolean profileIsComplete) {
        this.profileIsComplete = profileIsComplete;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Instant getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(Instant approvedAt) {
        this.approvedAt = approvedAt;
    }
}