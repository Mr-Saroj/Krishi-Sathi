package com.krishisathi.dto;

import com.krishisathi.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {

    // Required for FARMER (checked in AuthService)
    private String mobileNumber;

    // Required for DELIVERY_BOY (checked in AuthService)
    @Email(message = "Enter a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    // FARMER or DELIVERY_BOY (null is treated as FARMER)
    private Role role;
}