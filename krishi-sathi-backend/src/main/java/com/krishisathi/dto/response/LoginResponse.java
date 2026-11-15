package com.krishisathi.dto.response;

import com.krishisathi.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {

    private String token;

    private String fullName;

    private Role role;
}