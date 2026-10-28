package com.krishisathi.service;

import com.krishisathi.dto.CatalogPriceUpdateRequest;
import com.krishisathi.dto.CatalogProductRequest;
import com.krishisathi.model.CatalogProduct;
import com.krishisathi.repository.CatalogProductRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import org.springframework.data.domain.Sort;

@Service
@RequiredArgsConstructor
public class AdminCatalogService {

    private final CatalogProductRepository catalogProductRepository;

    public CatalogProduct addCatalogProduct(CatalogProductRequest request) {

        String productId = request.id().trim();

        // Check for duplicate product ID
        if (catalogProductRepository.existsById(productId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Product ID already exists");
        }

        Instant now = Instant.now();

        CatalogProduct product = CatalogProduct.builder()
                .id(productId)
                .category(request.category().trim()
                        .toUpperCase(Locale.ROOT)
                        .replace(' ', '_'))
                .name(request.name().trim())
                .brand(request.brand().trim())
                .price(request.price())
                .createdAt(now)
                .updatedAt(now)
                .build();

        return catalogProductRepository.save(product);
    }

    public List<CatalogProduct> getAllCatalogProducts() {

        return catalogProductRepository.findAll(
                Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public CatalogProduct updateCatalogProductPrice(
            String productId,
            CatalogPriceUpdateRequest request) {

        CatalogProduct product = catalogProductRepository
                .findById(productId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Catalog product not found: " + productId));

        product.setPrice(request.price());

        product.setUpdatedAt(java.time.Instant.now());

        return catalogProductRepository.save(product);
    }
}