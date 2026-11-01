package com.krishisathi.service;

import com.krishisathi.dto.FarmerAddressRequest;
import com.krishisathi.dto.FarmerDetailsResponse;
import com.krishisathi.model.*;
import com.krishisathi.repository.*;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FarmerProfileService {

    private final UserRepository userRepository;
    private final FarmerProfileRepository profileRepository;



    public FarmerDetailsResponse getFarmerDetails(String email) {

    User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    if (user.getRole() != Role.FARMER) {
        throw new RuntimeException("Farmer access only");
    }

    return new FarmerDetailsResponse(
            user.getFullName(),
            user.getEmail(),
            user.getMobileNumber()
    );
}

    // GET FARMER PROFILE
    // GET LOGGED-IN FARMER'S ADDRESSES
    public List<FarmerAddress> getAddresses(String email) {

        // 1. Find logged-in farmer
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Verify farmer role
        if (user.getRole() != Role.FARMER) {
            throw new RuntimeException("Access denied");
        }

        // 3. Find profile using the same userId used by addAddress()
        return profileRepository.findByUserId(user.getEmail())
                .map(FarmerProfile::getAddresses)
                .orElseGet(ArrayList::new);
    }

    // ADD ADDRESS clean code
    public void addAddress(String email, FarmerAddressRequest request) {

        // 1. Fetch farmer
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.FARMER) {
            throw new RuntimeException("Farmer access only");
        }

        // 2. Find existing profile or create a new one
        FarmerProfile profile = profileRepository
                .findByUserId(user.getEmail())
                .orElseGet(() -> {
                    FarmerProfile newProfile = new FarmerProfile();
                    newProfile.setUserId(user.getEmail());
                    return newProfile;
                });

        // 3. Create address
        FarmerAddress address = new FarmerAddress();

        address.setAddressId(UUID.randomUUID().toString());
        address.setFullName(user.getFullName());
        address.setMobileNumber(user.getMobileNumber());

        address.setAddressType(request.getAddressType());
        address.setVillage(request.getVillage());
        address.setPostOffice(request.getPostOffice());
        address.setDistrict(request.getDistrict());
        address.setState(request.getState());
        address.setPincode(request.getPincode());
        address.setLandmark(request.getLandmark());

        // First address becomes default
        boolean firstAddress = profile.getAddresses().isEmpty();
        address.setDefault(firstAddress);

        // 4. Add address
        profile.getAddresses().add(address);

        // 5. Save profile
        profileRepository.save(profile);
    }

    // DELETE SPECIFIC ADDRESS
    public void deleteAddress(String email, String addressId) {

        // 1. Find the logged-in farmer
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Verify farmer role
        if (user.getRole() != Role.FARMER) {
            throw new RuntimeException("Access denied");
        }

        // 3. Find the farmer's profile
        FarmerProfile profile = profileRepository
                .findByUserId(user.getEmail())
                .orElseThrow(() -> new RuntimeException("Farmer profile not found"));

        // 4. Find the specific address
        FarmerAddress address = profile.getAddresses()
                .stream()
                .filter(a -> a.getAddressId().equals(addressId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Address not found"));

        // 5. Remove the address
        profile.getAddresses().remove(address);

        // 6. If the deleted address was default,
        // make the first remaining address the default
        boolean hasDefaultAddress = profile.getAddresses()
                .stream()
                .anyMatch(FarmerAddress::isDefault);

        if (!profile.getAddresses().isEmpty() && !hasDefaultAddress) {
            profile.getAddresses().get(0).setDefault(true);
        }

        // 7. Save the updated profile
        profileRepository.save(profile);
    }


}