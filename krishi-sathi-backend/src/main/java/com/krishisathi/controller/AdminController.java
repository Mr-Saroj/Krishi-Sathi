package com.krishisathi.controller;

import com.krishisathi.dto.CatalogPriceUpdateRequest;
import com.krishisathi.dto.CatalogProductRequest;
import com.krishisathi.dto.CursorPageResponse;
import com.krishisathi.dto.PendingSellerResponse;
import com.krishisathi.dto.SellerApprovalRequest;
import com.krishisathi.dto.SellerDetailsResponse;
import com.krishisathi.model.CatalogProduct;
import com.krishisathi.service.AdminCatalogService;
import com.krishisathi.service.AdminOrderManageService;
import com.krishisathi.service.AdminSellerService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import com.krishisathi.model.Order;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

        private final AdminSellerService adminSellerService;
        private final AdminCatalogService adminCatalogService;
        private final AdminOrderManageService adminOrderManageService;

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

        // Add catalog product with image upload
        @PostMapping(value = "/add-catalog", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<CatalogProduct> addCatalogProduct(

                        @RequestParam("id") String id,

                        @RequestParam("category") String category,

                        @RequestParam("name") String name,

                        @RequestParam("brand") String brand,

                        @RequestParam("description") String description,

                        @RequestParam("quantity") BigDecimal quantity,

                        @RequestParam("quantityUnit") String quantityUnit,

                        @RequestParam("price") BigDecimal price,

                        @RequestPart("image") MultipartFile image) {

                CatalogProductRequest request = new CatalogProductRequest(
                                id,
                                category,
                                name,
                                brand,
                                description,
                                quantity,
                                quantityUnit,
                                price);

                CatalogProduct product = adminCatalogService.addCatalogProduct(request, image);

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(product);
        }

        // Get all catalog products
        @GetMapping("/catalog")
        public ResponseEntity<List<CatalogProduct>> getAllCatalogProducts() {

                return ResponseEntity.ok(
                                adminCatalogService.getAllCatalogProducts());
        }

        // Update only catalog product price
        @PatchMapping("/catalog/{productId}/price")
        public ResponseEntity<CatalogProduct> updateCatalogProductPrice(
                        @PathVariable String productId,
                        @Valid @RequestBody CatalogPriceUpdateRequest request) {

                return ResponseEntity.ok(
                                adminCatalogService.updateCatalogProductPrice(
                                                productId,
                                                request));
        }

        // Get all placed orders
        @GetMapping("/orders/placed")
        public ResponseEntity<List<Order>> getPlacedOrders() {

                return ResponseEntity.ok(
                                adminOrderManageService.getPlacedOrders());
        }
}