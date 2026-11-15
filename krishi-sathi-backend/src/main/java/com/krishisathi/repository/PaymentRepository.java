package com.krishisathi.repository;

import com.krishisathi.model.Payment;
import com.krishisathi.model.PaymentStatus;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository
        extends MongoRepository<Payment, String> {

    List<Payment> findByOrderIdOrderByCreatedAtDesc(String orderId);

    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    Optional<Payment> findByRazorpayPaymentId(String razorpayPaymentId);

    List<Payment> findByOrderIdAndStatus(
            String orderId,
            PaymentStatus status
    );
}