package com.krishisathi.service.Seller;

import com.krishisathi.dto.response.PickupOtpResponse;
import com.krishisathi.dto.response.SellerOrderResponse;
import com.krishisathi.dto.response.SellerPendingSettlementResponse;
import com.krishisathi.model.CatalogProduct;
import com.krishisathi.model.Order;
import com.krishisathi.model.OrderAssignment;
import com.krishisathi.model.OrderStatus;
import com.krishisathi.repository.CatalogProductRepository;
import com.krishisathi.repository.OrderAssignmentRepository;
import com.krishisathi.repository.OrderRepository;
import com.krishisathi.repository.OrderStatusRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class SellerOrderManageService {

        private final OrderAssignmentRepository orderAssignmentRepository;
        private final OrderStatusRepository orderStatusRepository;
        private final OrderRepository orderRepository;
        private final PasswordEncoder passwordEncoder;
        private final CatalogProductRepository catalogProductRepository;

        private static final SecureRandom SECURE_RANDOM = new SecureRandom();

        public List<SellerOrderResponse> getSellerOrders(String sellerId) {

                // 1. Get all assignments belonging to this seller
                List<OrderAssignment> assignments = orderAssignmentRepository.findBySellerId(sellerId);

                if (assignments.isEmpty()) {
                        return Collections.emptyList();
                }

                // 2. Extract order IDs
                List<String> orderIds = assignments.stream()
                                .map(OrderAssignment::getOrderId)
                                .filter(Objects::nonNull)
                                .distinct()
                                .toList();

                // 3. Fetch orders
                Map<String, Order> ordersById = orderRepository
                                .findAllById(orderIds)
                                .stream()
                                .collect(Collectors.toMap(
                                                Order::getId,
                                                Function.identity()));

                // 4. Extract product IDs from orders
                List<String> productIds = ordersById.values().stream()
                                .map(Order::getProductId)
                                .filter(Objects::nonNull)
                                .distinct()
                                .toList();

                // 5. Fetch catalog products
                Map<String, CatalogProduct> productsById = catalogProductRepository.findAllById(productIds)
                                .stream()
                                .collect(Collectors.toMap(
                                                CatalogProduct::getId,
                                                Function.identity()));

                // 6. Fetch actual order statuses
                Set<String> requestedOrderIds = new HashSet<>(orderIds);

                Map<String, String> statusMap = orderStatusRepository.findAll()
                                .stream()
                                .filter(status -> requestedOrderIds.contains(status.getOrderId()))
                                .collect(Collectors.toMap(
                                                OrderStatus::getOrderId,
                                                OrderStatus::getOrderStatus,
                                                (oldValue, newValue) -> newValue));

                // 7. Keep only CONFIRMED orders and prepare response
                return assignments.stream()
                                .filter(a -> ordersById.containsKey(a.getOrderId()))
                                .filter(a -> "CONFIRMED".equals(
                                                statusMap.get(a.getOrderId())))
                                .sorted(Comparator.comparing(
                                                OrderAssignment::getAssignedAt,
                                                Comparator.nullsLast(Comparator.reverseOrder())))
                                .map(assignment -> {

                                        Order order = ordersById.get(assignment.getOrderId());

                                        // Get product details
                                        CatalogProduct product = productsById.get(order.getProductId());

                                        String productName = product != null
                                                        ? product.getName()
                                                        : "Product unavailable";

                                        return SellerOrderResponse.builder()
                                                        .orderId(order.getId())
                                                        .farmerId(order.getFarmerId())

                                                        .productId(order.getProductId())
                                                        .productName(productName)

                                                        .quantity(order.getQuantity())
                                                        .productQuantity(order.getProductQuantity())

                                                        .productTotal(order.getProductTotal())
                                                        .platformFee(order.getPlatformFee())
                                                        .deliveryFee(order.getDeliveryFee())
                                                        .totalSumFee(order.getTotalSumFee())

                                                        .paymentMode(order.getPaymentMode())
                                                        .paymentStatus(order.getPaymentStatus())
                                                        .farmerDeliveryAddressId(
                                                                        order.getFarmerDeliveryAddressId())

                                                        .orderStatus(statusMap.getOrDefault(
                                                                        order.getId(), "UNKNOWN"))

                                                        .assignmentId(assignment.getId())
                                                        .sellerId(assignment.getSellerId())
                                                        .sellerName(assignment.getSellerName())
                                                        .sellerPhone(assignment.getSellerPhone())
                                                        .assignedAt(assignment.getAssignedAt())

                                                        .deliveryStatus(
                                                                        assignment.getDeliveryStatus() == null
                                                                                        ? null
                                                                                        : assignment.getDeliveryStatus()
                                                                                                        .name())

                                                        .deliveryBoyId(assignment.getDeliveryBoyId())
                                                        .deliveryBoyName(assignment.getDeliveryBoyName())
                                                        .deliveryBoyPhone(assignment.getDeliveryBoyPhone())
                                                        .acceptedAt(assignment.getAcceptedAt())

                                                        .build();
                                })
                                .toList();
        }

        public PickupOtpResponse generatePickupOtp(
                        String orderId,
                        String sellerId) {

                // 1. Find order assignment belonging to this seller
                OrderAssignment assignment = orderAssignmentRepository
                                .findByOrderIdAndSellerId(orderId, sellerId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Order not found for this seller"));

                // 2. Generate six-digit OTP
                String otp = String.format(
                                "%06d",
                                SECURE_RANDOM.nextInt(1_000_000));

                // 3. OTP validity: 5 minutes
                Instant now = Instant.now();
                Instant expiresAt = now.plusSeconds(300);

                // 4. Save hashed OTP in MongoDB
                assignment.setPickupOtpHash(
                                passwordEncoder.encode(otp));

                assignment.setPickupOtpGeneratedAt(now);
                assignment.setPickupOtpExpiresAt(expiresAt);

                orderAssignmentRepository.save(assignment);

                // 5. Return OTP to seller
                return PickupOtpResponse.builder()
                                .orderId(orderId)
                                .pickupOtp(otp)
                                .expiresAt(expiresAt)
                                .message("Pickup OTP generated successfully")
                                .build();
        }

        public List<SellerPendingSettlementResponse> getSellerPendingSettlements(
                        String sellerId) {

                // 1. Get seller assignments
                List<OrderAssignment> assignments = orderAssignmentRepository.findBySellerId(sellerId);

                if (assignments.isEmpty()) {
                        return Collections.emptyList();
                }

                // 2. Extract order IDs
                List<String> orderIds = assignments.stream()
                                .map(OrderAssignment::getOrderId)
                                .filter(Objects::nonNull)
                                .distinct()
                                .toList();

                // 3. Fetch orders
                Map<String, Order> ordersById = orderRepository
                                .findAllById(orderIds)
                                .stream()
                                .collect(Collectors.toMap(
                                                Order::getId,
                                                Function.identity()));

                // 4. Extract product IDs
                List<String> productIds = ordersById.values().stream()
                                .map(Order::getProductId)
                                .filter(Objects::nonNull)
                                .distinct()
                                .toList();

                // 5. Fetch catalog products
                Map<String, CatalogProduct> productsById = catalogProductRepository.findAllById(productIds)
                                .stream()
                                .collect(Collectors.toMap(
                                                CatalogProduct::getId,
                                                Function.identity()));

                // 6. Filter pending settlements and build response
                return assignments.stream()
                                .filter(a -> ordersById.containsKey(a.getOrderId()))
                                .filter(a -> {
                                        Order order = ordersById.get(a.getOrderId());

                                        return order.getSettlementStatus() != null
                                                        && "PENDING".equalsIgnoreCase(
                                                                        order.getSettlementStatus());
                                })
                                .sorted(Comparator.comparing(
                                                OrderAssignment::getAssignedAt,
                                                Comparator.nullsLast(Comparator.reverseOrder())))
                                .map(assignment -> {

                                        Order order = ordersById.get(assignment.getOrderId());

                                        CatalogProduct product = productsById.get(order.getProductId());

                                        String productName = product != null
                                                        ? product.getName()
                                                        : "Product unavailable";

                                        return SellerPendingSettlementResponse.builder()
                                                        .orderId(order.getId())
                                                        .farmerId(order.getFarmerId())
                                                        .productId(order.getProductId())
                                                        .productName(productName)
                                                        .quantity(order.getQuantity())
                                                        .productQuantity(order.getProductQuantity())
                                                        .productTotal(order.getProductTotal())
                                                        .platformFee(order.getPlatformFee())
                                                        .deliveryFee(order.getDeliveryFee())
                                                        .totalSumFee(order.getTotalSumFee())
                                                        .paymentMode(order.getPaymentMode())
                                                        .paymentStatus(order.getPaymentStatus())
                                                        .settlementStatus(order.getSettlementStatus())
                                                        .deliveryBoyName(assignment.getDeliveryBoyName())
                                                        .deliveryBoyPhone(assignment.getDeliveryBoyPhone())
                                                        .assignedAt(assignment.getAssignedAt())
                                                        .build();
                                })
                                .toList();
        }

}