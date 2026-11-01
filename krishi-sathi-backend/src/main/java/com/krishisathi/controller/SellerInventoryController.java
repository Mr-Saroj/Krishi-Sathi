package com.krishisathi.controller;

import com.krishisathi.dto.SellerInventoryPageResponse;
import com.krishisathi.dto.SellerInventoryRequest;
import com.krishisathi.dto.UpdateStockRequest;
import com.krishisathi.model.SellerInventory;
import com.krishisathi.service.SellerInventoryService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/seller/inventory")
public class SellerInventoryController {

    private final SellerInventoryService sellerInventoryService;

    public SellerInventoryController(
            SellerInventoryService sellerInventoryService) {
        this.sellerInventoryService = sellerInventoryService;
    }

    @PostMapping
    public ResponseEntity<?> addProduct(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody SellerInventoryRequest request) {

        /*
         * IMPORTANT:
         * This example assumes JWT subject contains the seller's database ID.
         * If your JWT subject contains the seller's email, resolve the
         * seller's database ID through your existing SellerRepository first.
         */
        String sellerId = jwt.getSubject();

        SellerInventory inventory = sellerInventoryService.addProduct(sellerId, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                        "message", "Product added to seller inventory successfully",
                        "inventoryId", inventory.getId(),
                        "productId", inventory.getCatalogProductId(),
                        "stockQuantity", inventory.getStockQuantity()));
    }

    @PutMapping("/{productId}/stock")
    public SellerInventory updateStock(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String productId,
            @Valid @RequestBody UpdateStockRequest request) {
        String sellerId = jwt.getSubject();

        return sellerInventoryService.updateStock(
                sellerId,
                productId,
                request);
    }

    @GetMapping
    public SellerInventoryPageResponse getSellerInventory(
            @AuthenticationPrincipal Jwt jwt,

            @RequestParam(required = false) String category,

            @RequestParam(defaultValue = "0") int page,

            @RequestParam(defaultValue = "20") int size) {

        String sellerId = jwt.getSubject();

        return sellerInventoryService.getSellerInventory(
                sellerId,
                category,
                page,
                size);
    }
}