package com.krishisathi.service;

import com.krishisathi.dto.FarmerShopProductResponse;
import com.krishisathi.dto.PlaceOrderRequest;
import com.krishisathi.model.CatalogProduct;
import com.krishisathi.model.FarmerAddress;
import com.krishisathi.model.FarmerProfile;
import com.krishisathi.model.OrderStatus;
import com.krishisathi.model.Role;
import com.krishisathi.model.SellerProfile;
import com.krishisathi.model.User;
import com.krishisathi.repository.CatalogProductRepository;
import com.krishisathi.repository.FarmerProfileRepository;
import com.krishisathi.repository.OrderRepository;
import com.krishisathi.repository.OrderStatusRepository;
import com.krishisathi.repository.SellerProfileRepository;
import com.krishisathi.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.krishisathi.model.Order;

@Service
@RequiredArgsConstructor
public class FarmershopService {

        private final CatalogProductRepository catalogProductRepository;
        private final SellerProfileRepository sellerProfileRepository;
        private final FarmerProfileRepository farmerProfileRepository;
        private final UserRepository userRepository;
        private final OrderRepository orderRepository;
        private final OrderStatusRepository orderStatusRepository;

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
        // =====================================================
        // PLACE ORDER WITH IDEMPOTENCY KEY
        // =====================================================

        public Order placeOrder(
                        String farmerEmail,
                        PlaceOrderRequest request,
                        String idempotencyKey) {

                // 1. Validate idempotency key
                if (idempotencyKey == null || idempotencyKey.isBlank()) {
                        throw new RuntimeException("Idempotency key is required");
                }

                // 2. Check whether this order already exists
                Optional<Order> existingOrder = orderRepository.findById(idempotencyKey);

                if (existingOrder.isPresent()) {

                        Order order = existingOrder.get();

                        // Prevent another farmer from accessing this order
                        if (!order.getFarmerId().equals(farmerEmail)) {
                                throw new RuntimeException("Invalid idempotency key");
                        }

                        // Return the existing order instead of creating another
                        return order;
                }

                // 3. Find logged-in farmer
                User farmer = userRepository.findByEmail(farmerEmail)
                                .orElseThrow(() -> new RuntimeException("Farmer account not found"));

                if (farmer.getRole() != Role.FARMER) {
                        throw new RuntimeException("Only farmers can place orders");
                }

                // 4. Find farmer profile
                FarmerProfile profile = farmerProfileRepository
                                .findByUserId(farmer.getEmail())
                                .orElseThrow(() -> new RuntimeException("Farmer profile not found"));

                // 5. Verify delivery address belongs to farmer
                if (profile.getAddresses() == null || profile.getAddresses().isEmpty()) {
                        throw new RuntimeException("Please add a delivery address first");
                }

                FarmerAddress address = profile.getAddresses()
                                .stream()
                                .filter(a -> request.getAddressId().equals(a.getAddressId()))
                                .findFirst()
                                .orElseThrow(() -> new RuntimeException("Delivery address not found"));

                // 6. Find product
                CatalogProduct product = catalogProductRepository
                                .findById(request.getProductId())
                                .orElseThrow(() -> new RuntimeException("Product not found"));

                // 7. Create order using frontend idempotency key as Order ID
                Order order = new Order();

                order.setId(idempotencyKey); // UUID becomes MongoDB _id
                order.setFarmerId(farmer.getEmail());

                order.setProductId(product.getId());
                order.setQuantity(request.getQuantity());

                order.setProductQuantity(
                                product.getQuantity() + " " + product.getQuantityUnit());

                order.setProductTotal(request.getProductTotal());
                order.setPlatformFee(request.getPlatformFee());
                order.setDeliveryFee(request.getDeliveryFee());
                order.setTotalSumFee(request.getTotalSumFee());

                order.setPaymentMode(request.getPaymentMode().toUpperCase());
                order.setPaymentStatus("PENDING");

                order.setFarmerDeliveryAddressId(address.getAddressId());

                // 8. Save order
                orderRepository.save(order);

                // 9. Create initial order status
                OrderStatus orderStatus = new OrderStatus();

                orderStatus.setId(idempotencyKey);
                orderStatus.setOrderId(idempotencyKey);
                orderStatus.setOrderStatus("PLACED");

                orderStatusRepository.save(orderStatus);

                return order;
        }

}