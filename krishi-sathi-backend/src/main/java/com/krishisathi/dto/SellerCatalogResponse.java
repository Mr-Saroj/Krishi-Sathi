package com.krishisathi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerCatalogResponse {

    private String id;
    private String name;
    private String category;
    private String brand;
    private BigDecimal quantity;
    private String quantityUnit;
    private String description;
    private BigDecimal price;
    private String imageUrl;
}