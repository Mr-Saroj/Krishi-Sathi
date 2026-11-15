package com.krishisathi.controller.Farmer;

import com.krishisathi.dto.request.VerifyPaymentRequest;
import com.krishisathi.dto.response.CreatePaymentResponse;
import com.krishisathi.dto.response.PaymentStatusResponse;
import com.krishisathi.service.Farmer.PaymentService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/farmer/payment")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // Create Razorpay order
    @PostMapping("/create-order/{orderId}")
    public ResponseEntity<?> createPayment(
            @PathVariable String orderId,
            Authentication authentication
    ) throws Exception {

        String farmerId = authentication.getName();

        CreatePaymentResponse response =
                paymentService.createPayment(orderId, farmerId);

        return ResponseEntity.ok(response);
    }

    // Verify Razorpay payment
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            @Valid @RequestBody VerifyPaymentRequest request,
            Authentication authentication
    ) throws Exception {

        String farmerId = authentication.getName();

        PaymentStatusResponse response =
                paymentService.verifyPayment(request, farmerId);

        return ResponseEntity.ok(response);
    }

    // Get payment status
    @GetMapping("/status/{orderId}")
    public ResponseEntity<?> getPaymentStatus(
            @PathVariable String orderId,
            Authentication authentication
    ) {

        String farmerId = authentication.getName();

        PaymentStatusResponse response =
                paymentService.getPaymentStatus(orderId, farmerId);

        return ResponseEntity.ok(response);
    }
}