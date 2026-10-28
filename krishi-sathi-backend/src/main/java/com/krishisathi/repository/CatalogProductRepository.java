package com.krishisathi.repository;

import com.krishisathi.model.CatalogProduct;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface CatalogProductRepository
        extends MongoRepository<CatalogProduct, String> {
}