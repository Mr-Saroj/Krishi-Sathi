package com.krishisathi.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "products_catalog")
public class CatalogProduct {

    @Id
    private String id;

    private String category;

    private String name;

    private String brand;

    private String description;

    private BigDecimal quantity;

    private String quantityUnit;

    private BigDecimal price;

    private String imageUrl;

    private Instant createdAt;

    private Instant updatedAt;
}