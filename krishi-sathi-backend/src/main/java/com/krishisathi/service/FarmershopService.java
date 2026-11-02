package com.krishisathi.service;

import com.krishisathi.dto.FarmerShopProductResponse;
import com.krishisathi.model.CatalogProduct;
import com.krishisathi.model.FarmerAddress;
import com.krishisathi.model.FarmerProfile;
import com.krishisathi.model.Role;
import com.krishisathi.model.SellerProfile;
import com.krishisathi.model.User;
import com.krishisathi.repository.CatalogProductRepository;
import com.krishisathi.repository.FarmerProfileRepository;
import com.krishisathi.repository.SellerProfileRepository;
import com.krishisathi.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FarmershopService {

        private final CatalogProductRepository catalogProductRepository;
        private final SellerProfileRepository sellerProfileRepository;
        private final FarmerProfileRepository farmerProfileRepository;
        private final UserRepository userRepository;

        public Page<FarmerShopProductResponse> getProductsByCategory(
                        String category,
                        Pageable pageable) {

                Page<CatalogProduct> products = catalogProductRepository.findByCategoryIgnoreCase(
                                category.trim(),
                                pageable);

                return products.map(this::mapToResponse);
        }

        private FarmerShopProductResponse mapToResponse(
                        CatalogProduct product) {

                return FarmerShopProductResponse.builder()
                                .id(product.getId())
                                .category(product.getCategory())
                                .name(product.getName())
                                .brand(product.getBrand())
                                .description(product.getDescription())
                                .quantity(product.getQuantity())
                                .quantityUnit(product.getQuantityUnit())
                                .price(product.getPrice())
                                .imageUrl(product.getImageUrl())
                                .build();
        }

        public String checkAvailability(String email) {

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                if (user.getRole() != Role.FARMER) {
                        throw new RuntimeException("Farmer access only");
                }

                FarmerProfile profile = farmerProfileRepository
                                .findByUserId(user.getEmail())
                                .orElse(null);

                // Check whether the farmer has an address.
                if (profile == null
                                || profile.getAddresses() == null
                                || profile.getAddresses().isEmpty()) {

                        return "Please add your address first, then come back.";
                }

                // Find the default address.
                FarmerAddress defaultAddress = profile.getAddresses()
                                .stream()
                                .filter(FarmerAddress::isDefault)
                                .findFirst()
                                .orElse(null);

                if (defaultAddress == null) {
                        return "Please set a default address first.";
                }

                String district = defaultAddress.getDistrict();

                if (district == null || district.isBlank()) {
                        return "Please update your default address with a valid district.";
                }

                // Find sellers in the farmer's district.
                List<SellerProfile> sellers = sellerProfileRepository
                                .findByCityIgnoreCase(district.trim());

                if (sellers.isEmpty()) {
                        return "You cannot buy products because no seller is available in your district.";
                }

                return "You can buy products in your district.";
        }
}