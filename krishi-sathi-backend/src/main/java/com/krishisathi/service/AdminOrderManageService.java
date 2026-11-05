package com.krishisathi.service;

import com.krishisathi.dto.AvailablePersonResponse;
import com.krishisathi.model.*;
import com.krishisathi.repository.*;

import com.mongodb.client.result.UpdateResult;
import lombok.RequiredArgsConstructor;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminOrderManageService {

        private final MongoTemplate mongoTemplate;

        private final OrderRepository orderRepository;
        private final FarmerProfileRepository farmerProfileRepository;

        // =====================================================================
        // 1) PLACED ORDERS (plain orders, exactly as before)
        // =====================================================================

        public List<Order> getPlacedOrders() {

                AggregationOperation matchPlaced = Aggregation.match(
                                Criteria.where("orderStatus").regex("^PLACED$", "i"));
                AggregationOperation groupByOrderId = Aggregation.group("orderId");
                AggregationOperation lookupOrders = Aggregation.lookup("orders", "_id", "_id", "orderDetails");
                AggregationOperation unwindOrders = Aggregation.unwind("orderDetails");
                AggregationOperation replaceRoot = Aggregation.replaceRoot("orderDetails");

                Aggregation aggregation = Aggregation.newAggregation(
                                matchPlaced, groupByOrderId, lookupOrders, unwindOrders, replaceRoot);

                return mongoTemplate
                                .aggregate(aggregation, "order_status", Order.class)
                                .getMappedResults();
        }

        // =====================================================================
        // 1b) ASSIGNMENTS of the placed orders (seller / delivery boy so far)
        // =====================================================================

        // public List<OrderAssignment> getPlacedOrderAssignments() {
        // List<String> ids = getPlacedOrders().stream().map(Order::getId).toList();
        // if (ids.isEmpty()) return List.of();

        // return mongoTemplate.find(
        // Query.query(Criteria.where("orderId").in(ids)), OrderAssignment.class);
        // }

        // =====================================================================
        // helpers
        // =====================================================================

        private Order getOrder(String orderId) {
                return orderRepository.findById(orderId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Order not found"));
        }

        /** The farmer's saved delivery address for this order (from farmer_profile). */
        private FarmerAddress getAddress(Order order) {
                String addressId = order.getFarmerDeliveryAddressId();

                FarmerProfile profile = farmerProfileRepository
                                .findByAddresses_AddressId(addressId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Delivery address not found"));

                return profile.getAddresses().stream()
                                .filter(a -> addressId.equals(a.getAddressId()))
                                .findFirst()
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Delivery address not found"));
        }

        /** Matches when city == district (ignore case) OR pincode is the same. */
        private Criteria locationMatch(FarmerAddress a, String cityField, String pinField) {
                List<Criteria> any = new ArrayList<>();

                if (a.getDistrict() != null && !a.getDistrict().isBlank()) {
                        any.add(Criteria.where(cityField)
                                        .regex("^" + Pattern.quote(a.getDistrict().trim()) + "$", "i"));
                }
                if (a.getPincode() != null && !a.getPincode().isBlank()) {
                        any.add(Criteria.where(pinField).is(a.getPincode().trim()));
                }
                if (any.isEmpty()) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                        "Delivery address has no district or pincode");
                }
                return new Criteria().orOperator(any.toArray(new Criteria[0]));
        }

        private OrderAssignment findAssignment(String orderId) {
                return mongoTemplate.findOne(
                                Query.query(Criteria.where("orderId").is(orderId)), OrderAssignment.class);
        }

        private OrderAssignment getOrCreateAssignment(String orderId) {
                OrderAssignment a = findAssignment(orderId);
                if (a == null) {
                        a = new OrderAssignment();
                        a.setOrderId(orderId);
                        a.setCreatedAt(Instant.now());
                }
                return a;
        }

        // =====================================================================
        // 2) AVAILABLE SELLERS: city == district OR same pincode
        // =====================================================================

        public List<AvailablePersonResponse> getAvailableSellers(String orderId) {

                // This fetch the orders item address
                FarmerAddress address = getAddress(getOrder(orderId));

                List<SellerProfile> profiles = mongoTemplate.find(
                                Query.query(locationMatch(address, "city", "pinCode")), SellerProfile.class);
                if (profiles.isEmpty())
                        return List.of();

                // seller_profiles.userId can be the user's id OR email, so look up by both
                List<String> keys = profiles.stream().map(SellerProfile::getUserId).toList();
                List<User> found = mongoTemplate.find(Query.query(new Criteria().orOperator(
                                Criteria.where("id").in(keys),
                                Criteria.where("email").in(keys))), User.class);

                Map<String, User> users = new HashMap<>();
                for (User u : found) {
                        users.put(u.getId(), u);
                        if (u.getEmail() != null)
                                users.put(u.getEmail(), u);
                }

                return profiles.stream()
                                .filter(p -> {
                                        User u = users.get(p.getUserId());
                                        // only approved sellers (adjust to your enum value)
                                        return u != null && u.getLoginAccess() == LoginAccess.APPROVED;
                                })
                                .map(p -> {
                                        User u = users.get(p.getUserId());
                                        String name = (p.getBusinessName() != null && !p.getBusinessName().isBlank())
                                                        ? p.getBusinessName()
                                                        : u.getFullName();
                                        return new AvailablePersonResponse(u.getId(), name, u.getMobileNumber(),
                                                        p.getCity());
                                })
                                .toList();
        }

        // =====================================================================
        // 3) AVAILABLE DELIVERY BOYS: (city == district OR same pincode) AND online AND
        // NOT busy
        // =====================================================================

        // Replace getAvailableDeliveryBoys in AdminOrderManageService with this debug
        // version.

        public List<AvailablePersonResponse> getAvailableDeliveryBoys(String orderId) {
                FarmerAddress address = getAddress(getOrder(orderId));

                // DEBUG
                System.out.println("DEBUG [DB-1] address: district=" + address.getDistrict()
                                + ", pincode=" + address.getPincode());

                List<DeliveryBoyProfile> profiles = mongoTemplate.find(
                                Query.query(locationMatch(address, "city", "pincode")), DeliveryBoyProfile.class);

                // DEBUG
                System.out.println("DEBUG [DB-2] delivery_boy_profile matched: " + profiles.size());
                profiles.forEach(p -> System.out.println("DEBUG [DB-2]   profile deliveryBoyId="
                                + p.getDeliveryBoyId() + ", city=" + p.getCity() + ", pincode=" + p.getPincode()));

                if (profiles.isEmpty())
                        return List.of();

                Map<String, DeliveryBoyProfile> profileByBoyId = profiles.stream()
                                .collect(Collectors.toMap(DeliveryBoyProfile::getDeliveryBoyId, p -> p, (a, b) -> a));

                // DEBUG: what do these delivery boys look like, ignoring the online / busy
                // filter?
                List<DeliveryBoy> everyone = mongoTemplate.find(
                                Query.query(Criteria.where("id").in(profileByBoyId.keySet())), DeliveryBoy.class);
                System.out.println("DEBUG [DB-3] delivery_boy_list found by id: " + everyone.size());
                everyone.forEach(b -> System.out.println("DEBUG [DB-3]   " + b.getId()
                                + " online=" + b.isOnline() + ", busy=" + b.isBusy()));

                Query q = Query.query(new Criteria().andOperator(
                                Criteria.where("id").in(profileByBoyId.keySet()),
                                Criteria.where("online").is(true),
                                Criteria.where("busy").is(false)));

                List<DeliveryBoy> available = mongoTemplate.find(q, DeliveryBoy.class);

                // DEBUG
                System.out.println("DEBUG [DB-4] online and not busy: " + available.size());

                return available.stream()
                                .map(b -> new AvailablePersonResponse(
                                                b.getId(), b.getFullName(), b.getMobileNumber(),
                                                profileByBoyId.get(b.getId()).getCity()))
                                .toList();
        }

        // =====================================================================
        // 4) ASSIGN SELLER -> order_assignments
        // =====================================================================

        public OrderAssignment assignSeller(String orderId, String sellerId) {
                getOrder(orderId);

                AvailablePersonResponse seller = getAvailableSellers(orderId).stream()
                                .filter(s -> s.id().equals(sellerId)).findFirst()
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                                "Seller is not available for this location"));

                OrderAssignment a = getOrCreateAssignment(orderId);
                a.setSellerId(seller.id());
                a.setSellerName(seller.name());
                a.setSellerPhone(seller.phone());

                // seller changed -> old delivery boy is no longer valid
                // a.setDeliveryBoyId(null);
                // a.setDeliveryBoyName(null);
                // a.setDeliveryBoyPhone(null);

                a.setUpdatedAt(Instant.now());
                return mongoTemplate.save(a);
        }

        // =====================================================================
        // 5) ASSIGN DELIVERY BOY -> order_assignments, then order becomes CONFIRMED
        // =====================================================================

        public OrderAssignment assignDeliveryBoy(String orderId, String deliveryBoyId) {
                getOrder(orderId);

                OrderAssignment a = findAssignment(orderId);
                if (a == null || a.getSellerId() == null) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assign a seller first");
                }

                AvailablePersonResponse boy = getAvailableDeliveryBoys(orderId).stream()
                                .filter(b -> b.id().equals(deliveryBoyId)).findFirst()
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                                "Delivery boy is offline, busy or not in this location"));

                a.setDeliveryBoyId(boy.id());
                a.setDeliveryBoyName(boy.name());
                a.setDeliveryBoyPhone(boy.phone());
                a.setUpdatedAt(Instant.now());
                OrderAssignment saved = mongoTemplate.save(a);

                // seller + delivery boy both assigned -> order is CONFIRMED
                confirmOrder(orderId);

                return saved;
        }

        /** Changes the order's PLACED status to CONFIRMED in order_status. */
        private void confirmOrder(String orderId) {
                Query placed = Query.query(new Criteria().andOperator(
                                Criteria.where("orderId").is(orderId),
                                Criteria.where("orderStatus").regex("^PLACED$", "i")));

                UpdateResult result = mongoTemplate.updateMulti(
                                placed, new Update().set("orderStatus", "CONFIRMED"), OrderStatus.class);

                // Safety net: if there was no PLACED row, make sure a CONFIRMED row exists
                if (result.getMatchedCount() == 0) {
                        boolean alreadyConfirmed = mongoTemplate.exists(
                                        Query.query(new Criteria().andOperator(
                                                        Criteria.where("orderId").is(orderId),
                                                        Criteria.where("orderStatus").regex("^CONFIRMED$", "i"))),
                                        OrderStatus.class);

                        if (!alreadyConfirmed) {
                                OrderStatus s = new OrderStatus();
                                s.setOrderId(orderId);
                                s.setOrderStatus("CONFIRMED");
                                mongoTemplate.save(s);
                        }
                }
        }
}