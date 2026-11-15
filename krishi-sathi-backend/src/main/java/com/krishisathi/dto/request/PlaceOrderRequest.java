package com.krishisathi.dto.request;

import lombok.Data;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

@Data
public class PlaceOrderRequest {

    @NotBlank(message = "Product ID is required")
    private String productId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @NotBlank(message = "Address ID is required")
    private String addressId;

    @NotNull(message = "Product total is required")
    @DecimalMin(value = "0.0", message = "Product total cannot be negative")
    private BigDecimal productTotal;

    @NotNull(message = "Platform fee is required")
    @DecimalMin(value = "0.0", message = "Platform fee cannot be negative")
    private BigDecimal platformFee;

    @NotNull(message = "Delivery fee is required")
    @DecimalMin(value = "0.0", message = "Delivery fee cannot be negative")
    private BigDecimal deliveryFee;

    @NotNull(message = "Total sum fee is required")
    @DecimalMin(value = "0.0", message = "Total sum fee cannot be negative")
    private BigDecimal totalSumFee;

    @NotBlank(message = "Payment mode is required")
    @Pattern(regexp = "^(COD|ONLINE)$", flags = Pattern.Flag.CASE_INSENSITIVE, message = "Payment mode must be COD or ONLINE")
    private String paymentMode;
}