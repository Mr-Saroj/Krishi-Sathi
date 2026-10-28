package com.krishisathi.controller;

import com.krishisathi.dto.CatalogPriceUpdateRequest;
import com.krishisathi.dto.CatalogProductRequest;
import com.krishisathi.dto.CursorPageResponse;
import com.krishisathi.dto.PendingSellerResponse;
import com.krishisathi.dto.SellerApprovalRequest;
import com.krishisathi.dto.SellerDetailsResponse;
import com.krishisathi.model.CatalogProduct;
import com.krishisathi.service.AdminCatalogService;
import com.krishisathi.service.AdminSellerService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

        private final AdminSellerService adminSellerService;
        private final AdminCatalogService adminCatalogService;

        @GetMapping("/sellers/pending")
        public ResponseEntity<CursorPageResponse<PendingSellerResponse>> getPendingSellers(
                        @RequestParam(required = false) String cursor) {

                CursorPageResponse<PendingSellerResponse> response = adminSellerService.getPendingSellers(cursor);

                return ResponseEntity.ok(response);
        }

        @PatchMapping("/sellers/{sellerId}/approval")
        public ResponseEntity<PendingSellerResponse> updateSellerApproval(
                        @PathVariable String sellerId,
                        @Valid @RequestBody SellerApprovalRequest request) {

                PendingSellerResponse response = adminSellerService.updateSellerApproval(
                                sellerId,
                                request);

                return ResponseEntity.ok(response);
        }

        @GetMapping("/sellers/{sellerId}")
        public ResponseEntity<SellerDetailsResponse> getSellerDetails(
                        @PathVariable String sellerId) {

                SellerDetailsResponse response = adminSellerService.getSellerDetails(sellerId);

                return ResponseEntity.ok(response);
        }

        // Add a new catalog product
        @PostMapping("/add-catalog")
        public ResponseEntity<CatalogProduct> addCatalogProduct(
                        @Valid @RequestBody CatalogProductRequest request) {

                CatalogProduct product = adminCatalogService.addCatalogProduct(request);

                return ResponseEntity.status(HttpStatus.CREATED).body(product);
        }

        @GetMapping("/catalog")
        public ResponseEntity<List<CatalogProduct>> getAllCatalogProducts() {

                List<CatalogProduct> products = adminCatalogService.getAllCatalogProducts();

                return ResponseEntity.ok(products);
        }

        // Update only the catalog product price
        @PatchMapping("/catalog/{productId}/price")
        public ResponseEntity<CatalogProduct> updateCatalogProductPrice(
                        @PathVariable String productId,
                        @Valid @RequestBody CatalogPriceUpdateRequest request) {

                CatalogProduct product = adminCatalogService.updateCatalogProductPrice(
                                productId,
                                request);

                return ResponseEntity.ok(product);
        }
}