
package com.krishisathi.service.DeliveryBoy;

import com.krishisathi.dto.request.DeliveryBoyRegisterRequest;
import com.krishisathi.dto.response.DeliveryBoyEligibilityDto;
import com.krishisathi.dto.response.DeliveryBoyOnlineStatusResponse;
import com.krishisathi.model.DeliveryAssignmentStatus;
import com.krishisathi.model.DeliveryBoy;
import com.krishisathi.model.DeliveryBoyProfile;
import com.krishisathi.model.OrderAssignment;
import com.krishisathi.model.OrderStatus;
import com.krishisathi.model.Role;
import com.krishisathi.model.User;

import com.krishisathi.repository.DeliveryBoyProfileRepository;
import com.krishisathi.repository.DeliveryBoyRepository;
import com.krishisathi.repository.OrderAssignmentRepository;
import com.krishisathi.repository.OrderRepository;
import com.krishisathi.repository.OrderStatusRepository;
import com.krishisathi.repository.SellerProfileRepository;
import com.krishisathi.repository.UserRepository;
import com.mongodb.client.result.UpdateResult;

import lombok.RequiredArgsConstructor;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import com.krishisathi.model.Order;

@Service
@RequiredArgsConstructor
public class DeliveryBoyService {

        private final SellerProfileRepository sellerProfileRepository;
        private final PasswordEncoder passwordEncoder;
        private final DeliveryBoyRepository deliveryBoyRepository;
        private final DeliveryBoyProfileRepository deliveryBoyProfileRepository;
        private final UserRepository userRepository;
        private final OrderRepository orderRepository;

        private final OrderAssignmentRepository orderAssignmentRepository;
        private final OrderStatusRepository orderStatusRepository;

        // Used for atomic assignment updates
        private final MongoTemplate mongoTemplate;

        // --------------------------------------------------
        // 1. CHECK DELIVERY-BOY ELIGIBILITY
        // --------------------------------------------------

        public String checkEligibility(DeliveryBoyEligibilityDto request) {

                boolean sellerExists = sellerProfileRepository
                                .findFirstByCityIgnoreCase(request.getCity().trim())
                                .isPresent();

                if (sellerExists) {
                        return "You are eligible to become a delivery boy.";
                }

                return "You are not eligible to become a delivery boy.";
        }

        // --------------------------------------------------
        // 2. REGISTER FARMER AS DELIVERY BOY
        // --------------------------------------------------

        public DeliveryBoy register(
                        String farmerEmail,
                        DeliveryBoyRegisterRequest request) {

                // Prevent duplicate registration
                if (deliveryBoyRepository.existsByFarmerEmail(farmerEmail)) {
                        throw new ResponseStatusException(
                                        HttpStatus.CONFLICT,
                                        "You are already registered as a delivery boy");
                }

                // Get farmer account
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

                // Create delivery boy record
                DeliveryBoy deliveryBoy = DeliveryBoy.builder()
                                .fullName(farmer.getFullName())
                                .mobileNumber(farmer.getMobileNumber())
                                .farmerEmail(farmerEmail)
                                .password(passwordEncoder.encode(request.getPassword()))
                                .online(false)
                                .busy(false)
                                .build();

                DeliveryBoy saved = deliveryBoyRepository.save(deliveryBoy);

                // Create delivery boy profile
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

                        // Remove delivery boy if profile creation fails
                        deliveryBoyRepository.deleteById(saved.getId());

                        throw ex;
                }

                return saved;
        }

        // --------------------------------------------------
        // 3. UPDATE ONLINE / OFFLINE STATUS
        // --------------------------------------------------

        public DeliveryBoy updateOnlineStatus(
                        String farmerEmail,
                        boolean online) {

                DeliveryBoy deliveryBoy = getDeliveryBoyByEmail(farmerEmail);

                // Cannot go offline during an active delivery
                if (!online && deliveryBoy.isBusy()) {
                        throw new ResponseStatusException(
                                        HttpStatus.CONFLICT,
                                        "Finish your current delivery before going offline");
                }

                deliveryBoy.setOnline(online);

                return deliveryBoyRepository.save(deliveryBoy);
        }

        // --------------------------------------------------
        // 6. FIND DELIVERY BOY USING FARMER EMAIL
        // --------------------------------------------------

        private DeliveryBoy getDeliveryBoyByEmail(String farmerEmail) {

                return deliveryBoyRepository
                                .findByFarmerEmail(farmerEmail)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "You are not registered as a delivery boy"));
        }

        public List<OrderAssignment> getPendingAssignments(String farmerEmail) {

                // Step 1: Find delivery boy registered by this farmer
                DeliveryBoy deliveryBoy = deliveryBoyRepository
                                .findByFarmerEmail(farmerEmail)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Delivery boy account not found"));

                // Step 2: Get delivery boy ID
                String deliveryBoyId = deliveryBoy.getId();

                // Step 3: Get current time
                Instant now = Instant.now();

                // Step 4: Find only valid pending assignments for this delivery boy
                Query query = Query.query(
                                Criteria.where("deliveryBoyId").is(deliveryBoyId)
                                                .and("deliveryStatus").is(DeliveryAssignmentStatus.PENDING)
                                                .and("expiresAt").gt(now));

                // Step 5: Return matching assignments
                return mongoTemplate.find(query, OrderAssignment.class);
        }

        public OrderAssignment acceptAssignment(
                        String orderId,
                        String farmerEmail) {

                // Step 1: Find delivery boy using logged-in farmer email
                DeliveryBoy boy = deliveryBoyRepository
                                .findByFarmerEmail(farmerEmail)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Delivery boy account not found"));

                Instant now = Instant.now();

                // Step 2: Check assignment conditions
                Query query = Query.query(
                                Criteria.where("orderId").is(orderId)
                                                .and("deliveryBoyId").is(boy.getId())
                                                .and("deliveryStatus").is(DeliveryAssignmentStatus.PENDING)
                                                .and("expiresAt").gt(now));

                // Step 3: Change PENDING to ACCEPTED
                Update update = new Update()
                                .set("deliveryStatus", DeliveryAssignmentStatus.ACCEPTED)
                                .set("acceptedAt", now)
                                .set("updatedAt", now);

                // Step 4: Atomic update
                OrderAssignment accepted = mongoTemplate.findAndModify(
                                query,
                                update,
                                FindAndModifyOptions.options().returnNew(true),
                                OrderAssignment.class);

                // Step 5: If no assignment matched, acceptance failed
                if (accepted == null) {
                        throw new ResponseStatusException(
                                        HttpStatus.CONFLICT,
                                        "Assignment expired or is no longer available");
                }

                // Step 6: Confirm order after successful acceptance
                // Set settlement status to PENDING when delivery boy accepts
                mongoTemplate.updateFirst(
                                Query.query(Criteria.where("_id").is(orderId)),
                                new Update().set("settlementStatus", "PENDING"),
                                Order.class);

                confirmOrder(orderId);

                return accepted;
        }

        private void confirmOrder(String orderId) {

                Query query = Query.query(
                                Criteria.where("orderId").is(orderId)
                                                .and("orderStatus").is("PLACED"));

                Update update = new Update()
                                .set("orderStatus", "CONFIRMED");

                UpdateResult result = mongoTemplate.updateMulti(
                                query,
                                update,
                                OrderStatus.class);

                if (result.getMatchedCount() == 0) {
                        throw new ResponseStatusException(
                                        HttpStatus.CONFLICT,
                                        "Order is not in PLACED status");
                }
        }

        private void releaseDeliveryBoy(String deliveryBoyId) {
                DeliveryBoy deliveryBoy = deliveryBoyRepository.findById(deliveryBoyId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Delivery boy account not found"));

                deliveryBoy.setBusy(false);
                deliveryBoyRepository.save(deliveryBoy);
        }

        public OrderAssignment rejectAssignment(
                        String orderId,
                        String farmerEmail) {

                // Step 1: Find delivery boy using logged-in farmer email
                DeliveryBoy boy = deliveryBoyRepository
                                .findByFarmerEmail(farmerEmail)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Delivery boy account not found"));

                Instant now = Instant.now();

                // Step 2: Check assignment conditions
                Query query = Query.query(
                                Criteria.where("orderId").is(orderId)
                                                .and("deliveryBoyId").is(boy.getId())
                                                .and("deliveryStatus").is(DeliveryAssignmentStatus.PENDING)
                                                .and("expiresAt").gt(now));

                // Step 3: Change PENDING to REJECTED
                Update update = new Update()
                                .set("deliveryStatus", DeliveryAssignmentStatus.REJECTED)
                                .set("updatedAt", now);

                // Step 4: Atomically update assignment
                OrderAssignment rejected = mongoTemplate.findAndModify(
                                query,
                                update,
                                FindAndModifyOptions.options().returnNew(true),
                                OrderAssignment.class);

                // Step 5: If no assignment matched, rejection failed
                if (rejected == null) {
                        throw new ResponseStatusException(
                                        HttpStatus.CONFLICT,
                                        "Assignment expired or is no longer available");
                }

                // Step 6: Release delivery boy
                releaseDeliveryBoy(boy.getId());

                return rejected;
        }

        public DeliveryBoyOnlineStatusResponse getOnlineStatus(String farmerEmail) {

                DeliveryBoy deliveryBoy = deliveryBoyRepository
                                .findByFarmerEmail(farmerEmail)
                                .orElseThrow(() -> new RuntimeException("You are not registered as a delivery boy"));

                return DeliveryBoyOnlineStatusResponse.builder()
                                .success(true)
                                .message("Delivery boy status fetched successfully")
                                .online(deliveryBoy.isOnline())
                                .busy(deliveryBoy.isBusy())
                                .build();
        }

        public Map<String, Object> verifyPickupOtp(
                        String orderId,
                        String otp,
                        String farmerEmail) {

                // 1. Find the logged-in delivery boy
                DeliveryBoy deliveryBoy = deliveryBoyRepository
                                .findByFarmerEmail(farmerEmail)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Delivery boy account not found"));

                // 2. Find the assignment for this order
                OrderAssignment assignment = orderAssignmentRepository
                                .findByOrderId(orderId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Order assignment not found"));

                // 3. Check whether this order belongs to this delivery boy
                if (!deliveryBoy.getId().equals(assignment.getDeliveryBoyId())) {
                        throw new ResponseStatusException(
                                        HttpStatus.FORBIDDEN,
                                        "This order is not assigned to you");
                }

                // 4. Check whether delivery boy accepted the assignment
                if (assignment.getDeliveryStatus() != DeliveryAssignmentStatus.ACCEPTED) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "You must accept the delivery assignment first");
                }

                // 5. Check whether OTP was generated
                if (assignment.getPickupOtpHash() == null
                                || assignment.getPickupOtpExpiresAt() == null) {

                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Pickup OTP has not been generated");
                }

                // 6. Check OTP expiry
                if (!Instant.now().isBefore(assignment.getPickupOtpExpiresAt())) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Pickup OTP has expired. Ask the seller to generate a new OTP");
                }

                // 7. Verify OTP using BCrypt
                if (!passwordEncoder.matches(
                                otp,
                                assignment.getPickupOtpHash())) {

                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Incorrect pickup OTP");
                }

                // 8. Find existing order status
                OrderStatus orderStatus = orderStatusRepository.findAll()
                                .stream()
                                .filter(status -> orderId.equals(status.getOrderId()))
                                .findFirst()
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Order status not found"));

                // 9. Update order status
                orderStatus.setOrderStatus("OUT_FOR_DELIVERY");
                orderStatusRepository.save(orderStatus);

                // 10. Clear OTP so it cannot be reused
                assignment.setPickupOtpHash(null);
                assignment.setPickupOtpGeneratedAt(null);
                assignment.setPickupOtpExpiresAt(null);

                orderAssignmentRepository.save(assignment);

                return Map.of(
                                "success", true,
                                "message", "Pickup OTP verified successfully",
                                "orderId", orderId,
                                "orderStatus", "OUT_FOR_DELIVERY");
        }

        public Map<String, Object> completeDelivery(
                        String orderId,
                        String deliveryBoyEmail) {

                // 1. Find assignment
                OrderAssignment assignment = orderAssignmentRepository
                                .findByOrderId(orderId)
                                .orElseThrow(() -> new RuntimeException("Order assignment not found"));

                // 2. Find delivery boy
                DeliveryBoy deliveryBoy = deliveryBoyRepository
                                .findByFarmerEmail(deliveryBoyEmail)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Delivery boy account not found"));

                // 3. Verify delivery boy ownership
                if (!deliveryBoy.getId().equals(assignment.getDeliveryBoyId())) {
                        throw new RuntimeException("You are not assigned to this order");
                }

                // 4. Find order status
                OrderStatus orderStatus = orderStatusRepository
                                .findByOrderId(orderId)
                                .orElseThrow(() -> new RuntimeException("Order status not found"));

                // 5. Find order
                Order order = orderRepository.findById(orderId)
                                .orElseThrow(() -> new RuntimeException("Order not found"));

                // 6. Update order status
                orderStatus.setOrderStatus("COMPLETED");

                // 7. Update payment status
                order.setPaymentStatus("PAID");

                // 8. Save both documents
                orderStatusRepository.save(orderStatus);
                orderRepository.save(order);

                return Map.of(
                                "success", true,
                                "message", "Delivery completed successfully",
                                "orderId", orderId,
                                "orderStatus", "COMPLETED",
                                "paymentStatus", "PAID");
        }

}
