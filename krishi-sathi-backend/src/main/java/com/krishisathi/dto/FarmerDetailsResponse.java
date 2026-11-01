package com.krishisathi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FarmerDetailsResponse {
    private String fullName;
    private String email;
    private String mobileNumber;
}