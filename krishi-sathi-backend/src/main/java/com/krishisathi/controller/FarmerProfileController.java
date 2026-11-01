package com.krishisathi.controller;

import com.krishisathi.dto.FarmerAddressRequest;
import com.krishisathi.dto.FarmerDetailsResponse;
import com.krishisathi.model.FarmerAddress;
import com.krishisathi.service.FarmerProfileService;

import java.util.List;
import java.util.Map;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/farmer/profile")
@RequiredArgsConstructor
public class FarmerProfileController {

    private final FarmerProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<FarmerDetailsResponse> getMyProfile(
            Authentication authentication) {

        return ResponseEntity.ok(
                profileService.getFarmerDetails(
                        authentication.getName()));
    }

    // GET PROFILE
    @GetMapping("/addresses")
    public ResponseEntity<List<FarmerAddress>> getAddresses(
            Authentication authentication) {

        return ResponseEntity.ok(
                profileService.getAddresses(authentication.getName()));
    }

    @PostMapping("/addresses")
    public ResponseEntity<Map<String, String>> addAddress(
            Authentication authentication,
            @RequestBody FarmerAddressRequest request) {

        profileService.addAddress(
                authentication.getName(),
                request);

        return ResponseEntity.ok(
                Map.of("message", "Address added successfully"));
    }

    @DeleteMapping("/addresses/{addressId}")
    public ResponseEntity<Map<String, String>> deleteAddress(
            Authentication authentication,
            @PathVariable String addressId) {

        profileService.deleteAddress(
                authentication.getName(),
                addressId);

        return ResponseEntity.ok(
                Map.of("message", "Address deleted successfully"));
    }

}