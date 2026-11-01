package com.krishisathi.service;

import com.krishisathi.dto.FarmerShopProductResponse;
import com.krishisathi.model.CatalogProduct;
import com.krishisathi.repository.CatalogProductRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FarmershopService {

    private final CatalogProductRepository catalogProductRepository;

    public Page<FarmerShopProductResponse> getProductsByCategory(
            String category,
            Pageable pageable
    ) {

        Page<CatalogProduct> products =
                catalogProductRepository.findByCategoryIgnoreCase(
                        category.trim(),
                        pageable
                );

        return products.map(this::mapToResponse);
    }

    private FarmerShopProductResponse mapToResponse(
            CatalogProduct product
    ) {

        return FarmerShopProductResponse.builder()
                .id(product.getId())
                .category(product.getCategory())
                .name(product.getName())
                .brand(product.getBrand())
                .description(product.getDescription())
                .quantity(product.getQuantity())
                .quantityUnit(product.getQuantityUnit())
                .price(product.getPrice())
                .imageUrl(product.getImageUrl())
                .build();
    }
}