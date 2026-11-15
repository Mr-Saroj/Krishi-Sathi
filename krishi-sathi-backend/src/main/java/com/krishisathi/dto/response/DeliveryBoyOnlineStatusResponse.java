package com.krishisathi.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryBoyOnlineStatusResponse {

    private boolean success;

    private String message;

    @JsonProperty("isOnline")
    private boolean online;

    @JsonProperty("isBusy")
    private boolean busy;
}