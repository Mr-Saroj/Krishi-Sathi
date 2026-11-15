package com.krishisathi.service.Farmer;

import com.krishisathi.dto.cache.CachedProductPage;
import com.krishisathi.dto.request.PlaceOrderRequest;
import com.krishisathi.dto.response.FarmerOrderResponse;
import com.krishisathi.dto.response.FarmerShopProductResponse;
import com.krishisathi.model.CatalogProduct;
import com.krishisathi.model.FarmerAddress;
import com.krishisathi.model.FarmerProfile;
import com.krishisathi.model.OrderStatus;
import com.krishisathi.model.PaymentMode;
import com.krishisathi.model.Role;
import com.krishisathi.model.SellerProfile;
import com.krishisathi.model.User;
import com.krishisathi.repository.CatalogProductRepository;
import com.krishisathi.repository.FarmerProfileRepository;
import com.krishisathi.repository.OrderRepository;
import com.krishisathi.repository.OrderStatusRepository;
import com.krishisathi.repository.SellerProfileRepository;
import com.krishisathi.repository.UserRepository;
import com.krishisathi.service.common.RabbitMessagePublisher;
import java.util.UUID;
import java.time.Duration;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import com.krishisathi.model.Order;
import com.krishisathi.service.common.NotificationMessage;
import com.krishisathi.config.RabbitMQConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

@Service
@RequiredArgsConstructor
public class FarmershopService {

        private final CatalogProductRepository catalogProductRepository;
        private final SellerProfileRepository sellerProfileRepository;
        private final FarmerProfileRepository farmerProfileRepository;
        private final UserRepository userRepository;
        private final OrderRepository orderRepository;
        private final OrderStatusRepository orderStatusRepository;
        private final RabbitMessagePublisher rabbitMessagePublisher;
        private final StringRedisTemplate redisTemplate;
        private final ObjectMapper objectMapper;

        public Page<FarmerShopProductResponse> getProductsByCategory(
                        String category,
                        Pageable pageable) {

                String normalizedCategory = category.trim()
                                .toLowerCase(Locale.ROOT);

                // 1. Generate unique key for category + page + size
                String cacheKey = "farmer:products:"
                                + normalizedCategory + ":"
                                + pageable.getPageNumber() + ":"
                                + pageable.getPageSize();

                try {
                        // 2. Check Redis first
                        String cachedData = redisTemplate.opsForValue()
                                        .get(cacheKey);

                        if (cachedData != null) {

                                CachedProductPage cachedPage = objectMapper.readValue(
                                                cachedData,
                                                new TypeReference<CachedProductPage>() {
                                                });

                                // 3. Return cached data
                                return new PageImpl<>(
                                                cachedPage.content(),
                                                pageable,
                                                cachedPage.totalElements());
                        }

                } catch (Exception e) {
                        // Redis failure: continue with MongoDB
                }

                // 4. Cache MISS: Fetch from MongoDB
                Page<CatalogProduct> products = catalogProductRepository.findByCategoryIgnoreCase(
                                category.trim(),
                                pageable);

                // 5. Convert MongoDB entities into DTOs
                Page<FarmerShopProductResponse> response = products.map(this::mapToResponse);

                // 6. Prepare cache object
                CachedProductPage cacheData = new CachedProductPage(
                                response.getContent(),
                                response.getNumber(),
                                response.getSize(),
                                response.getTotalElements());

                try {
                        // 7. Store in Redis for 5 minutes
                        String json = objectMapper.writeValueAsString(cacheData);

                        redisTemplate.opsForValue().set(
                                        cacheKey,
                                        json,
                                        Duration.ofMinutes(5));

                } catch (Exception e) {
                        // Cache failure should not break product API
                }

                // 8. Return MongoDB result
                return response;
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

                        if (!order.getFarmerId().equals(farmerEmail)) {
                                throw new RuntimeException("Invalid idempotency key");
                        }

                        // Return existing order; don't create another order
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
                if (profile.getAddresses() == null
                                || profile.getAddresses().isEmpty()) {
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

                // 7. Validate payment mode using enum
                if (request.getPaymentMode() == null
                                || request.getPaymentMode().isBlank()) {
                        throw new RuntimeException("Payment mode is required");
                }

                PaymentMode paymentMode;

                try {
                        paymentMode = PaymentMode.valueOf(
                                        request.getPaymentMode().trim().toUpperCase());
                } catch (IllegalArgumentException e) {
                        throw new RuntimeException("Invalid payment mode. Use COD or ONLINE");
                }

                // 8. Create order
                Order order = new Order();

                order.setId(idempotencyKey);
                order.setFarmerId(farmer.getEmail());

                order.setProductId(product.getId());
                order.setQuantity(request.getQuantity());

                order.setProductQuantity(
                                product.getQuantity() + " " + product.getQuantityUnit());

                order.setProductTotal(request.getProductTotal());
                order.setPlatformFee(request.getPlatformFee());
                order.setDeliveryFee(request.getDeliveryFee());
                order.setTotalSumFee(request.getTotalSumFee());

                order.setPaymentMode(paymentMode.name());

                // Initial payment status for both COD and ONLINE
                order.setPaymentStatus("PENDING");

                order.setFarmerDeliveryAddressId(address.getAddressId());

                // 9. Save order
                orderRepository.save(order);

                // 10. Create initial order status
                OrderStatus orderStatus = new OrderStatus();

                orderStatus.setId(idempotencyKey);
                orderStatus.setOrderId(idempotencyKey);

                if (paymentMode == PaymentMode.COD) {

                        // COD: order can enter seller/delivery assignment flow
                        orderStatus.setOrderStatus("PLACED");

                } else {

                        // ONLINE: wait until Razorpay payment succeeds
                        orderStatus.setOrderStatus("PENDING_PAYMENT");
                }

                orderStatusRepository.save(orderStatus);
                rabbitMessagePublisher.publish(
                                RabbitMQConfig.EMAIL_ROUTING_KEY,

                                new NotificationMessage(

                                                UUID.randomUUID().toString(),
                                                farmerEmail,
                                                "Krishi Sathi - Order Confirmation",
                                                order.getId(),

                                                product.getName(),
                                                product.getBrand(),
                                                product.getImageUrl(),

                                                order.getQuantity(),
                                                order.getProductQuantity(),

                                                String.valueOf(order.getProductTotal()),
                                                String.valueOf(order.getPlatformFee()),
                                                String.valueOf(order.getDeliveryFee()),
                                                String.valueOf(order.getTotalSumFee()),

                                                order.getPaymentMode(),
                                                order.getPaymentStatus()));

                return order;
        }
        // =====================================================
        // GET ALL ORDERS OF LOGGED-IN FARMER
        // =====================================================

        public List<FarmerOrderResponse> getFarmerOrders(String farmerEmail) {

                User farmer = userRepository.findByEmail(farmerEmail)
                                .orElseThrow(() -> new RuntimeException("Farmer account not found"));

                if (farmer.getRole() != Role.FARMER) {
                        throw new RuntimeException("Only farmers can view their orders");
                }

                // Find all orders belonging to this farmer
                List<Order> orders = orderRepository.findByFarmerId(farmerEmail);

                // Convert Order documents into response DTOs
                return orders.stream()
                                .map(this::mapToFarmerOrderResponse)
                                .toList();
        }

        // =====================================================
        // GET SINGLE ORDER DETAILS
        // =====================================================

        public FarmerOrderResponse getFarmerOrderDetails(
                        String farmerEmail,
                        String orderId) {

                User farmer = userRepository.findByEmail(farmerEmail)
                                .orElseThrow(() -> new RuntimeException("Farmer account not found"));

                if (farmer.getRole() != Role.FARMER) {
                        throw new RuntimeException("Only farmers can view orders");
                }

                // Find order
                Order order = orderRepository.findById(orderId)
                                .orElseThrow(() -> new RuntimeException("Order not found"));

                // Verify order ownership
                if (!order.getFarmerId().equals(farmerEmail)) {
                        throw new RuntimeException("You are not authorized to view this order");
                }

                return mapToFarmerOrderResponse(order);
        }

        // =====================================================
        // MAP ORDER + ORDER STATUS + PRODUCT DETAILS
        // =====================================================

        private FarmerOrderResponse mapToFarmerOrderResponse(Order order) {

                // 1. Find current order status
                String currentStatus = orderStatusRepository
                                .findByOrderId(order.getId())
                                .map(OrderStatus::getOrderStatus)
                                .orElse("UNKNOWN");

                // 2. Find product from catalog
                CatalogProduct product = catalogProductRepository
                                .findById(order.getProductId())
                                .orElse(null);

                // 3. Get product name
                String productName = product != null
                                ? product.getName()
                                : "Product unavailable";

                // 4. Get product image
                String productImage = product != null
                                ? product.getImageUrl()
                                : null;

                // 5. Build response
                return FarmerOrderResponse.builder()
                                .orderId(order.getId())
                                .productId(order.getProductId())
                                .productName(productName)
                                .productImage(productImage)
                                .quantity(order.getQuantity())
                                .productQuantity(order.getProductQuantity())
                                .productTotal(order.getProductTotal())
                                .platformFee(order.getPlatformFee())
                                .deliveryFee(order.getDeliveryFee())
                                .totalSumFee(order.getTotalSumFee())
                                .paymentMode(order.getPaymentMode())
                                .paymentStatus(order.getPaymentStatus())
                                .deliveryAddressId(order.getFarmerDeliveryAddressId())
                                .orderStatus(currentStatus)
                                .build();
        }

}