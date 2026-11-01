package com.krishisathi.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "seller_inventory")
@CompoundIndex(
    name = "seller_product_unique",
    def = "{'sellerId': 1, 'catalogProductId': 1}",
    unique = true
)
public class SellerInventory {

    @Id
    private String id;

    private String sellerId;

    private String catalogProductId;

    private int stockQuantity;

    private Instant createdAt;

    private Instant updatedAt;
}