package com.krishisathi.repository;

import com.krishisathi.model.CatalogProduct;

import org.springframework.data.domain.Page;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.domain.Pageable;

public interface CatalogProductRepository
        extends MongoRepository<CatalogProduct, String> {
                 Page<CatalogProduct> findByCategoryIgnoreCase(
            String category,
            Pageable pageable
    );
}