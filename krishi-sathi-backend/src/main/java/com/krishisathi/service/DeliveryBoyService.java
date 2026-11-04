package com.krishisathi.service;

import com.krishisathi.dto.DeliveryBoyEligibilityDto;
import com.krishisathi.dto.DeliveryBoyRegisterRequest;
import com.krishisathi.model.DeliveryBoy;
import com.krishisathi.model.SellerProfile;
import com.krishisathi.repository.DeliveryBoyRepository;
import com.krishisathi.repository.SellerProfileRepository;

import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
@RequiredArgsConstructor
public class DeliveryBoyService {

    private final SellerProfileRepository sellerProfileRepository;
     private final PasswordEncoder passwordEncoder;
     private final DeliveryBoyRepository deliveryBoyRepository;


    public String checkEligibility(DeliveryBoyEligibilityDto request) {

        boolean sellerExists = sellerProfileRepository
                .findFirstByCityIgnoreCase(request.getCity().trim())
                .isPresent();

        if (sellerExists) {
            return "You are eligible to become a delivery boy.";
        }

        return "You are not eligible to become a delivery boy.";
    }
    

    public DeliveryBoy register(
            String farmerEmail,
            DeliveryBoyRegisterRequest request
    ) {

        // Prevent the same farmer from registering twice
        if (deliveryBoyRepository.existsByFarmerEmail(farmerEmail)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You are already registered as a delivery boy"
            );
        }

        DeliveryBoy deliveryBoy = DeliveryBoy.builder()
                .farmerEmail(farmerEmail)
                .city(request.getCity().trim())
                .address(request.getAddress().trim())
                .pincode(request.getPincode().trim())
                .vehicleType(request.getVehicleType().trim().toUpperCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .createdAt(LocalDateTime.now())
                .build();

        return deliveryBoyRepository.save(deliveryBoy);
    }
}