package com.krishisathi.controller;

import com.krishisathi.model.CatalogProduct;
import com.krishisathi.repository.CatalogProductRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/farmer/shop")
@RequiredArgsConstructor
public class FarmershopController {

    private final CatalogProductRepository catalogProductRepository;

    @GetMapping("/products")
    public ResponseEntity<Page<CatalogProduct>> getProductsByCategory(
            @RequestParam String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {

        if (page < 0 || size < 1 || size > 100) {
            return ResponseEntity.badRequest().build();
        }

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<CatalogProduct> products =
                catalogProductRepository.findByCategoryIgnoreCase(
                        category.trim(),
                        pageable
                );

        return ResponseEntity.ok(products);
    }
}