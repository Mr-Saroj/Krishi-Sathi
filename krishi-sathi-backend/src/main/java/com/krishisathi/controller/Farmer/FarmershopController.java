package com.krishisathi.controller.Farmer;

import com.krishisathi.dto.request.PlaceOrderRequest;
import com.krishisathi.dto.response.FarmerShopProductResponse;
import com.krishisathi.model.CatalogProduct;
import com.krishisathi.model.Order;
import com.krishisathi.repository.CatalogProductRepository;
import com.krishisathi.service.Farmer.FarmershopService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/farmer/shop")
@RequiredArgsConstructor
public class FarmershopController {

        private final CatalogProductRepository catalogProductRepository;
        private final FarmershopService farmershopService;

        @GetMapping("/products")
        public ResponseEntity<Page<FarmerShopProductResponse>> getProductsByCategory(
                        @RequestParam String category,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "20") int size) {

                if (category == null || category.isBlank()
                                || page < 0 || size < 1 || size > 100) {
                        return ResponseEntity.badRequest().build();
                }

                Pageable pageable = PageRequest.of(
                                page,
                                size,
                                Sort.by(Sort.Direction.DESC, "createdAt"));

                Page<FarmerShopProductResponse> products = farmershopService.getProductsByCategory(
                                category,
                                pageable);

                return ResponseEntity.ok(products);
        }

        @GetMapping("/availability")
        public ResponseEntity<String> checkAvailability(
                        Authentication authentication) {

                String email = authentication.getName();

                String message = farmershopService.checkAvailability(email);

                return ResponseEntity.ok(message);
        }

        @PostMapping("/orders")
        public ResponseEntity<?> placeOrder(
                        @Valid @RequestBody PlaceOrderRequest request,
                        @RequestHeader("Idempotency-Key") String idempotencyKey,
                        Authentication authentication) {

                String farmerEmail = authentication.getName();

                Order order = farmershopService.placeOrder(
                                farmerEmail,
                                request,
                                idempotencyKey);

                return ResponseEntity.ok(order);
        }
        // =====================================================
        // GET ALL FARMER ORDERS
        // =====================================================

        @GetMapping("/orders")
        public ResponseEntity<?> getFarmerOrders(
                        Authentication authentication) {

                String farmerEmail = authentication.getName();

                return ResponseEntity.ok(
                                farmershopService.getFarmerOrders(farmerEmail));
        }

        // =====================================================
        // GET SINGLE ORDER DETAILS
        // =====================================================

        @GetMapping("/orders/{orderId}")
        public ResponseEntity<?> getFarmerOrderDetails(
                        @PathVariable String orderId,
                        Authentication authentication) {

                String farmerEmail = authentication.getName();

                return ResponseEntity.ok(
                                farmershopService.getFarmerOrderDetails(
                                                farmerEmail,
                                                orderId));
        }
}