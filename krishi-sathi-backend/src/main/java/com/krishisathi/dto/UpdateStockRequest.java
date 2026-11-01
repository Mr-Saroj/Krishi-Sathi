package com.krishisathi.dto;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class UpdateStockRequest {

    @Min(value = 0, message = "Stock quantity cannot be negative")
    private int stockQuantity;
}