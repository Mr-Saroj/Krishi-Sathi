package com.krishisathi.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;

public record CatalogProductRequest(

        @NotBlank(message = "Product ID is required")
        String id,

        @NotBlank(message = "Category is required")
        @Pattern(
                regexp = "^[A-Za-z_ ]+$",
                message = "Category must contain only letters, spaces, or underscores"
        )
        String category,

        @NotBlank(message = "Product name is required")
        String name,

        @NotBlank(message = "Brand name is required")
        String brand,

        @NotBlank(message = "Product description is required")
        String description,

         @NotNull(message = "Quantity is required")
        @DecimalMin(value = "0.01", message = "Quantity must be greater than zero")
        BigDecimal quantity,

        @NotBlank(message = "Quantity unit is required")
        @Pattern(
                regexp = "^(KG|GRAM|PIECE)$",
                message = "Unit must be KG, GRAM, or PIECE"
        )
        String quantityUnit,

        @NotNull(message = "Product price is required")
        @DecimalMin(value = "0.01", message = "Price must be greater than zero")
        BigDecimal price

) {
}