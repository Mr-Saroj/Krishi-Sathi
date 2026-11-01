package com.krishisathi.repository;

import com.krishisathi.model.SellerInventory;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface SellerInventoryRepository
        extends MongoRepository<SellerInventory, String> {

    boolean existsBySellerIdAndCatalogProductId(
        String sellerId,
        String catalogProductId
    );

    Optional<SellerInventory> findBySellerIdAndCatalogProductId(
        String sellerId,
        String catalogProductId
    );
    Optional<SellerInventory> findByIdAndSellerId(
        String inventoryId,
        String sellerId
);




}