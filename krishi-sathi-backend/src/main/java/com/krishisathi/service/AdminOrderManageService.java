package com.krishisathi.service;

import com.krishisathi.model.Order;

import lombok.RequiredArgsConstructor;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminOrderManageService {

    private final MongoTemplate mongoTemplate;

    // Get all placed orders using an aggregation pipeline
    public List<Order> getPlacedOrders() {

        // Stage 1: order_status documents whose status is PLACED (case-insensitive)
        AggregationOperation matchPlaced = Aggregation.match(
                Criteria.where("orderStatus").regex("^PLACED$", "i"));

        // Stage 2: one row per orderId (removes duplicates)
        AggregationOperation groupByOrderId = Aggregation.group("orderId");

        // Stage 3: join with the orders collection (_id after group = orderId)
        AggregationOperation lookupOrders = Aggregation.lookup(
                "orders", // from
                "_id", // local field
                "_id", // foreign field in orders
                "orderDetails"); // output array

        // Stage 4: flatten the array (also drops statuses with no matching order)
        AggregationOperation unwindOrders = Aggregation.unwind("orderDetails");

        // Stage 5: make the order document the root
        AggregationOperation replaceRoot = Aggregation.replaceRoot("orderDetails");

        Aggregation aggregation = Aggregation.newAggregation(
                matchPlaced,
                groupByOrderId,
                lookupOrders,
                unwindOrders,
                replaceRoot);

        return mongoTemplate
                .aggregate(aggregation, "order_status", Order.class)
                .getMappedResults();
    }
}