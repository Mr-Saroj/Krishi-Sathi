
package com.krishisathi.controller;

import com.krishisathi.dto.DeliveryBoyEligibilityDto;
import com.krishisathi.dto.DeliveryBoyRegisterRequest;
import com.krishisathi.model.DeliveryBoy;
import com.krishisathi.service.DeliveryBoyService;

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
                deliveryBoyService.checkEligibility(request)
        );
    }

    // 2. Register farmer as a delivery boy
    @PostMapping("/register")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<?> register(
            @Valid @RequestBody DeliveryBoyRegisterRequest request,
            Authentication authentication
    ) {

        // Extract farmer email from JWT subject
        String farmerEmail = authentication.getName();

        DeliveryBoy saved = deliveryBoyService.register(
                farmerEmail,
                request
        );

        // Do not expose the password or its encrypted hash
        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                        "success", true,
                        "message", "Successfully registered as a delivery boy",
                        "deliveryBoyId", saved.getId(),
                        "farmerEmail", saved.getFarmerEmail()
                )
        );
    }
}
