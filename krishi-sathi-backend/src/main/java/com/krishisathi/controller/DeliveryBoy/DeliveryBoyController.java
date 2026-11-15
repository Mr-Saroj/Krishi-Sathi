
package com.krishisathi.controller.DeliveryBoy;

import com.krishisathi.dto.request.DeliveryBoyOnlineStatusRequest;
import com.krishisathi.dto.request.DeliveryBoyRegisterRequest;
import com.krishisathi.dto.request.VerifyPickupOtpRequest;
import com.krishisathi.dto.response.DeliveryBoyEligibilityDto;
import com.krishisathi.model.DeliveryBoy;
import com.krishisathi.model.OrderAssignment;
import com.krishisathi.service.DeliveryBoy.DeliveryBoyService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/farmer/delivery-boy")
@RequiredArgsConstructor
public class DeliveryBoyController {

        private final DeliveryBoyService deliveryBoyService;

        // 1. Check delivery-boy eligibility using city
        @PostMapping("/check-eligibility")
        @PreAuthorize("hasRole('FARMER')")
        public ResponseEntity<String> checkEligibility(
                        @Valid @RequestBody DeliveryBoyEligibilityDto request) {

                return ResponseEntity.ok(
                                deliveryBoyService.checkEligibility(request));
        }

        // 2. Register farmer as a delivery boy
        @PostMapping("/register")
        @PreAuthorize("hasRole('FARMER')")
        public ResponseEntity<?> register(
                        @Valid @RequestBody DeliveryBoyRegisterRequest request,
                        Authentication authentication) {

                String farmerEmail = authentication.getName();

                DeliveryBoy saved = deliveryBoyService.register(
                                farmerEmail,
                                request);

                // Never expose password or password hash
                return ResponseEntity.status(HttpStatus.CREATED).body(
                                Map.of(
                                                "success", true,
                                                "message", "Successfully registered as a delivery boy",
                                                "deliveryBoyId", saved.getId(),
                                                "farmerEmail", saved.getFarmerEmail()));
        }

        // 3. Update delivery-boy online/offline status
        @PatchMapping("/online-status")
        @PreAuthorize("hasRole('FARMER')")
        public ResponseEntity<?> updateOnlineStatus(
                        @Valid @RequestBody DeliveryBoyOnlineStatusRequest request,
                        Authentication authentication) {

                String farmerEmail = authentication.getName();

                DeliveryBoy updated = deliveryBoyService.updateOnlineStatus(
                                farmerEmail,
                                request.getOnline());

                return ResponseEntity.ok(
                                Map.of(
                                                "success", true,
                                                "message", updated.isOnline()
                                                                ? "You are now online"
                                                                : "You are now offline",
                                                "isOnline", updated.isOnline(),
                                                "isBusy", updated.isBusy()));
        }

        // 4. Get new pending delivery assignments
        @GetMapping("/assignments/pending")
        @PreAuthorize("hasRole('FARMER')")
        public ResponseEntity<?> getPendingAssignments(
                        Authentication authentication) {

                String farmerEmail = authentication.getName();

                return ResponseEntity.ok(
                                deliveryBoyService.getPendingAssignments(farmerEmail));
        }

        // 5. Accept assigned delivery order
        @PutMapping("/assignments/{orderId}/accept")
        @PreAuthorize("hasRole('FARMER')")
        public ResponseEntity<?> acceptAssignment(
                        @PathVariable String orderId,
                        Authentication authentication) {

                String farmerEmail = authentication.getName();

                return ResponseEntity.ok(
                                deliveryBoyService.acceptAssignment(orderId, farmerEmail));
        }

        // 6. Reject assigned delivery order
        @PutMapping("/assignments/{orderId}/reject")
        @PreAuthorize("hasRole('FARMER')")
        public ResponseEntity<?> rejectAssignment(
                        @PathVariable String orderId,
                        Authentication authentication) {

                String farmerEmail = authentication.getName();

                return ResponseEntity.ok(
                                deliveryBoyService.rejectAssignment(orderId, farmerEmail));
        }

        // Check current delivery-boy online/offline status
        @GetMapping("/online-status")
        @PreAuthorize("hasRole('FARMER')")
        public ResponseEntity<?> getOnlineStatus(
                        Authentication authentication) {

                String farmerEmail = authentication.getName();

                return ResponseEntity.ok(
                                deliveryBoyService.getOnlineStatus(farmerEmail));
        }

        // 7. Verify seller pickup OTP
        @PostMapping("/assignments/{orderId}/verify-pickup-otp")
        @PreAuthorize("hasRole('FARMER')")
        public ResponseEntity<?> verifyPickupOtp(
                        @PathVariable String orderId,
                        @Valid @RequestBody VerifyPickupOtpRequest request,
                        Authentication authentication) {

                String farmerEmail = authentication.getName();

                return ResponseEntity.ok(
                                deliveryBoyService.verifyPickupOtp(
                                                orderId,
                                                request.getOtp(),
                                                farmerEmail));
        }

        // 8. Complete delivery
        @PostMapping("/orders/{orderId}/complete")
        @PreAuthorize("hasRole('FARMER')")
        public ResponseEntity<?> completeDelivery(
                        @PathVariable String orderId,
                        Authentication authentication) {

                String deliveryBoyEmail = authentication.getName();

                return ResponseEntity.ok(
                                deliveryBoyService.completeDelivery(
                                                orderId,
                                                deliveryBoyEmail));
        }

}
