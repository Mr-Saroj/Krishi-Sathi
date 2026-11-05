package com.krishisathi.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DeliveryBoyOnlineStatusRequest {

    // JSON body: { "online": true }
    @NotNull(message = "online is required")
    private Boolean online;
}