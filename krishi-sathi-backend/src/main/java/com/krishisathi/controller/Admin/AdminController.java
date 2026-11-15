package com.krishisathi.controller.Admin;

import com.krishisathi.dto.request.AssignDeliveryBoyRequest;
import com.krishisathi.dto.request.AssignSellerRequest;
import com.krishisathi.dto.request.CatalogPriceUpdateRequest;
import com.krishisathi.dto.request.CatalogProductRequest;
import com.krishisathi.dto.request.SellerApprovalRequest;
import com.krishisathi.dto.response.AvailablePersonResponse;
import com.krishisathi.dto.response.CursorPageResponse;
import com.krishisathi.dto.response.PendingSellerResponse;
import com.krishisathi.dto.response.SellerDetailsResponse;
import com.krishisathi.dto.response.SettlementPendingResponse;
import com.krishisathi.model.CatalogProduct;
import com.krishisathi.service.Admin.AdminCatalogService;
import com.krishisathi.service.Admin.AdminOrderManageService;
import com.krishisathi.service.Admin.AdminSellerService;

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
import com.krishisathi.model.OrderAssignment;

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

        // Get orders waiting for assignment
        @GetMapping("/orders/placed")
        public ResponseEntity<List<Order>> getPlacedOrders() {
                return ResponseEntity.ok(
                                adminOrderManageService.getPlacedOrders());
        }

        // Get assignment information for placed orders
        @GetMapping("/orders/assignments")
        public ResponseEntity<List<OrderAssignment>> getOrderAssignments() {
                return ResponseEntity.ok(
                                adminOrderManageService.getPlacedOrderAssignments());
        }

        // Get available sellers
        @GetMapping("/orders/{orderId}/available-sellers")
        public ResponseEntity<List<AvailablePersonResponse>> getAvailableSellers(
                        @PathVariable String orderId) {

                return ResponseEntity.ok(
                                adminOrderManageService.getAvailableSellers(orderId));
        }

        // Get available delivery boys
        @GetMapping("/orders/{orderId}/available-delivery-boys")
        public ResponseEntity<List<AvailablePersonResponse>> getAvailableDeliveryBoys(
                        @PathVariable String orderId) {

                return ResponseEntity.ok(
                                adminOrderManageService.getAvailableDeliveryBoys(orderId));
        }

        // Assign seller directly
        @PutMapping("/orders/{orderId}/assign-seller")
        public ResponseEntity<OrderAssignment> assignSeller(
                        @PathVariable String orderId,
                        @Valid @RequestBody AssignSellerRequest request) {

                return ResponseEntity.ok(
                                adminOrderManageService.assignSeller(
                                                orderId,
                                                request.sellerId()));
        }

        // Assign delivery boy with 30-second acceptance deadline
        @PutMapping("/orders/{orderId}/assign-delivery-boy")
        public ResponseEntity<OrderAssignment> assignDeliveryBoy(
                        @PathVariable String orderId,
                        @Valid @RequestBody AssignDeliveryBoyRequest request) {

                return ResponseEntity.ok(
                                adminOrderManageService.assignDeliveryBoy(
                                                orderId,
                                                request.deliveryBoyId()));
        }

        @GetMapping("/orders/settlement-pending")
        public ResponseEntity<List<SettlementPendingResponse>> getPendingSettlementOrders() {

                return ResponseEntity.ok(
                                adminOrderManageService.getPendingSettlementOrders());
        }

        @PutMapping("/orders/{orderId}/settlement-complete")
        public ResponseEntity<?> completeSettlement(
                        @PathVariable String orderId) {

                try {
                        boolean completed = adminOrderManageService.completeSettlement(orderId);

                        if (!completed) {
                                return ResponseEntity.status(HttpStatus.CONFLICT)
                                                .body("Settlement could not be completed. Please check the order status.");
                        }

                        return ResponseEntity.ok(
                                        "Settlement completed successfully.");

                } catch (RuntimeException e) {
                        return ResponseEntity.status(HttpStatus.CONFLICT)
                                        .body(e.getMessage());
                }
        }
}