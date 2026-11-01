package com.krishisathi.model;



import lombok.Data;

@Data
public class FarmerAddress {

    private String addressId;

    private String addressType; // HOME, FARM, OTHER

    private String fullName;

    private String mobileNumber;

    private String village;

    private String postOffice;

    private String district;

    private String state;

    private String pincode;

    private String landmark;

    private boolean isDefault;
}
