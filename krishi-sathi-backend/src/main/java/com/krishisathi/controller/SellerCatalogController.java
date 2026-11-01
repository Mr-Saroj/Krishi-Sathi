package com.krishisathi.controller;

import com.krishisathi.dto.SellerCatalogPageResponse;
import com.krishisathi.service.SellerCatalogService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/seller/catalog")
@RequiredArgsConstructor
public class SellerCatalogController {

    private final SellerCatalogService sellerCatalogService;

    @GetMapping
    public SellerCatalogPageResponse getCatalog(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {

        String sellerId = jwt.getSubject();

        return sellerCatalogService.getAvailableCatalog(
                sellerId,
                category,
                page,
                size
        );
    }
}