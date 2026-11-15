package com.krishisathi.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerInventoryResponse {

    private String id;

    // Seller inventory information
    private String catalogProductId;
    private int stockQuantity;

    // Catalogue product information
    private String name;
    private String category;
    private String brand;
    private BigDecimal price;
    private String imageUrl;
    private BigDecimal quantity;
    private String quantityUnit;
    private String description;
}