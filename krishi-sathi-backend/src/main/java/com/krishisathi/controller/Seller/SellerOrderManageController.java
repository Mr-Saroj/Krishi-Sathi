package com.krishisathi.controller.Seller;

import com.krishisathi.dto.response.PickupOtpResponse;
import com.krishisathi.dto.response.SellerOrderResponse;
import com.krishisathi.dto.response.SellerPendingSettlementResponse;
import com.krishisathi.model.Role;
import com.krishisathi.model.User;
import com.krishisathi.repository.UserRepository;
import com.krishisathi.service.Seller.SellerOrderManageService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/seller/products")
@RequiredArgsConstructor
public class SellerOrderManageController {

        private final SellerOrderManageService sellerOrderManageService;
        private final UserRepository userRepository;

        @GetMapping("/orders")
        public List<SellerOrderResponse> getSellerOrders(
                        Authentication authentication) {

                String sellerEmail = authentication.getName();

                User seller = userRepository.findByEmail(sellerEmail)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Seller account not found"));

                if (seller.getRole() != Role.SELLER) {
                        throw new ResponseStatusException(
                                        HttpStatus.FORBIDDEN,
                                        "Only sellers can view their orders");
                }

                String sellerId = seller.getId();

                return sellerOrderManageService.getSellerOrders(sellerId);
        }

        // Generate pickup OTP
        @PostMapping("/{orderId}/pickup-otp")
        public PickupOtpResponse generatePickupOtp(
                        @PathVariable String orderId,
                        Authentication authentication) {

                String sellerEmail = authentication.getName();

                User seller = userRepository.findByEmail(sellerEmail)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Seller account not found"));

                if (seller.getRole() != Role.SELLER) {
                        throw new ResponseStatusException(
                                        HttpStatus.FORBIDDEN,
                                        "Only sellers can generate pickup OTP");
                }

                return sellerOrderManageService.generatePickupOtp(
                                orderId,
                                seller.getId());
        }

        @GetMapping("/settlements/pending")
        public List<SellerPendingSettlementResponse> getSellerPendingSettlements(
                        Authentication authentication) {

                String sellerEmail = authentication.getName();

                User seller = userRepository.findByEmail(sellerEmail)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Seller account not found"));

                if (seller.getRole() != Role.SELLER) {
                        throw new ResponseStatusException(
                                        HttpStatus.FORBIDDEN,
                                        "Only sellers can view pending settlements");
                }

                return sellerOrderManageService.getSellerPendingSettlements(
                                seller.getId());
        }

}