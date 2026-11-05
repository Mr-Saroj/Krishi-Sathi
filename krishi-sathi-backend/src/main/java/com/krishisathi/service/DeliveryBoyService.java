package com.krishisathi.service;

import com.krishisathi.dto.DeliveryBoyEligibilityDto;
import com.krishisathi.dto.DeliveryBoyRegisterRequest;
import com.krishisathi.model.DeliveryBoy;
import com.krishisathi.model.DeliveryBoyProfile;
import com.krishisathi.model.Role;
import com.krishisathi.model.User;
import com.krishisathi.repository.DeliveryBoyProfileRepository;
import com.krishisathi.repository.DeliveryBoyRepository;
import com.krishisathi.repository.SellerProfileRepository;
import com.krishisathi.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class DeliveryBoyService {

    private final SellerProfileRepository sellerProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final DeliveryBoyRepository deliveryBoyRepository;
    private final DeliveryBoyProfileRepository deliveryBoyProfileRepository; // new
    private final UserRepository userRepository;

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
            DeliveryBoyRegisterRequest request) {

        // Prevent the same farmer from registering twice
        if (deliveryBoyRepository.existsByFarmerEmail(farmerEmail)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You are already registered as a delivery boy");
        }

        // Load the farmer's account to get name and mobile number
        User farmer = userRepository
                .findByEmail(farmerEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Farmer account not found"));

        if (farmer.getRole() != Role.FARMER) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only farmers can register as delivery boys");
        }

        // 1. delivery_boy_list: lightweight fields + hashed password
        DeliveryBoy deliveryBoy = DeliveryBoy.builder()
                .fullName(farmer.getFullName())
                .mobileNumber(farmer.getMobileNumber())
                .farmerEmail(farmerEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .online(false)
                .busy(false)
                .build();

        DeliveryBoy saved = deliveryBoyRepository.save(deliveryBoy);

        // 2. delivery_boy_profile: all the other details, linked by deliveryBoyId
        try {
            DeliveryBoyProfile profile = DeliveryBoyProfile.builder()
                    .deliveryBoyId(saved.getId())
                    .city(request.getCity().trim())
                    .address(request.getAddress().trim())
                    .pincode(request.getPincode().trim())
                    .vehicleType(request.getVehicleType().trim().toUpperCase())
                    .createdAt(LocalDateTime.now())
                    .build();

            deliveryBoyProfileRepository.save(profile);
        } catch (RuntimeException ex) {
            // Roll back manually so we never keep a list entry without a profile
            deliveryBoyRepository.deleteById(saved.getId());
            throw ex;
        }

        return saved;
    }

    public DeliveryBoy updateOnlineStatus(String farmerEmail, boolean online) {

        DeliveryBoy deliveryBoy = deliveryBoyRepository
                .findByFarmerEmail(farmerEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "You are not registered as a delivery boy"));

        // A delivery boy on an active delivery cannot go offline
        if (!online && deliveryBoy.isBusy()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Finish your current delivery before going offline");
        }

        deliveryBoy.setOnline(online);
        return deliveryBoyRepository.save(deliveryBoy);
    }
}