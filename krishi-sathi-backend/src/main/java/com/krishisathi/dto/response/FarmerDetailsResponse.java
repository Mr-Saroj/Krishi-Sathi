package com.krishisathi.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FarmerDetailsResponse {
    private String fullName;
    private String email;
    private String mobileNumber;
}