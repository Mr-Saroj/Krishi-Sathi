package com.krishisathi.dto;

import lombok.Data;

@Data
public class FarmerAddressRequest {

    private String addressType;

    private String village;

    private String postOffice;

    private String district;

    private String state;

    private String pincode;

    private String landmark;
}