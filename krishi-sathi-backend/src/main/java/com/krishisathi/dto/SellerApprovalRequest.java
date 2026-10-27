package com.krishisathi.dto;

import com.krishisathi.model.LoginAccess;
import jakarta.validation.constraints.NotNull;

public record SellerApprovalRequest(
        @NotNull LoginAccess loginAccess
) {
}