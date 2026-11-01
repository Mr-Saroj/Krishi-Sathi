package com.krishisathi.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class FarmerShopProductResponse {

    private String id;

    private String category;

    private String name;

    private String brand;

    private String description;

    private BigDecimal quantity;

    private String quantityUnit;

    private BigDecimal price;

    private String imageUrl;
}