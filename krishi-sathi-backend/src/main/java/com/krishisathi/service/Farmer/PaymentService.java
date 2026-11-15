package com.krishisathi.service.Farmer;

import com.krishisathi.dto.request.VerifyPaymentRequest;
import com.krishisathi.dto.response.CreatePaymentResponse;
import com.krishisathi.dto.response.PaymentStatusResponse;
import com.krishisathi.model.Order;
import com.krishisathi.model.OrderStatus;
import com.krishisathi.model.Payment;
import com.krishisathi.model.PaymentMode;
import com.krishisathi.model.PaymentStatus;

import com.krishisathi.repository.OrderRepository;
import com.krishisathi.repository.OrderStatusRepository;
import com.krishisathi.repository.PaymentRepository;

import com.razorpay.RazorpayClient;
import com.razorpay.Utils;

import org.json.JSONObject;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final OrderStatusRepository orderStatusRepository;
    private final RazorpayClient razorpayClient;

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    public PaymentService(
            PaymentRepository paymentRepository,
            OrderRepository orderRepository,
            OrderStatusRepository orderStatusRepository,
            @Value("${razorpay.key.id}") String razorpayKeyId,
            @Value("${razorpay.key.secret}") String razorpayKeySecret) throws Exception {

        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.orderStatusRepository = orderStatusRepository;

        this.keyId = razorpayKeyId;
        this.keySecret = razorpayKeySecret;

        this.razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
    }

    // --------------------------------------------------
    // CREATE RAZORPAY ORDER
    // --------------------------------------------------

    public CreatePaymentResponse createPayment(
            String orderId,
            String farmerId) throws Exception {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getFarmerId().equals(farmerId)) {
            throw new RuntimeException("Unauthorized order");
        }

        if (!PaymentMode.ONLINE.name().equals(order.getPaymentMode())) {
            throw new RuntimeException("This order is not an online order");
        }

        if ("PAID".equals(order.getPaymentStatus())) {
            throw new RuntimeException("Order is already paid");
        }

        // Check previous attempts.
        List<Payment> attempts = paymentRepository.findByOrderIdOrderByCreatedAtDesc(orderId);

        for (Payment previous : attempts) {

            if (previous.getStatus() == PaymentStatus.CAPTURED) {
                throw new RuntimeException("Order is already paid");
            }

            // Do not create a second attempt while the previous one
            // is unresolved. Reconcile it with Razorpay first.
            if (previous.getStatus() == PaymentStatus.CREATED
                    || previous.getStatus() == PaymentStatus.PENDING
                    || previous.getStatus() == PaymentStatus.AUTHORIZED) {

                throw new RuntimeException(
                        "Previous payment attempt is unresolved. "
                                + "Please check payment status before retrying.");
            }
        }

        BigDecimal total = order.getTotalSumFee();

        if (total == null || total.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Invalid order amount");
        }

        long amountInPaise = total
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .longValueExact();

        JSONObject options = new JSONObject();

        options.put("amount", amountInPaise);
        options.put("currency", "INR");
        options.put("receipt", orderId);

        com.razorpay.Order razorpayOrder = razorpayClient.orders.create(options);

        String razorpayOrderId = razorpayOrder.get("id");

        LocalDateTime now = LocalDateTime.now();

        Payment payment = new Payment();

        payment.setOrderId(orderId);
        payment.setFarmerId(farmerId);
        payment.setRazorpayOrderId(razorpayOrderId);
        payment.setAmount(amountInPaise);
        payment.setCurrency("INR");
        payment.setStatus(PaymentStatus.CREATED);
        payment.setCreatedAt(now);
        payment.setUpdatedAt(now);

        paymentRepository.save(payment);

        return new CreatePaymentResponse(
                orderId,
                razorpayOrderId,
                amountInPaise,
                "INR",
                keyId);
    }

    // --------------------------------------------------
    // VERIFY PAYMENT
    // --------------------------------------------------

    public PaymentStatusResponse verifyPayment(
            VerifyPaymentRequest request,
            String farmerId) throws Exception {

        Payment payment = paymentRepository
                .findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new RuntimeException("Payment attempt not found"));

        if (!payment.getFarmerId().equals(farmerId)) {
            throw new RuntimeException("Unauthorized payment");
        }

        Order order = orderRepository.findById(payment.getOrderId())
                .orElseThrow(() -> new RuntimeException("Business order not found"));

        // Idempotent repeat verification.
        if (payment.getStatus() == PaymentStatus.CAPTURED
                && "PAID".equals(order.getPaymentStatus())) {

            return new PaymentStatusResponse(
                    order.getId(),
                    payment.getRazorpayPaymentId(),
                    PaymentStatus.CAPTURED,
                    "Payment already verified");
        }

        // Verify the HMAC signature.
        JSONObject attributes = new JSONObject();

        attributes.put(
                "razorpay_order_id",
                request.getRazorpayOrderId());

        attributes.put(
                "razorpay_payment_id",
                request.getRazorpayPaymentId());

        attributes.put(
                "razorpay_signature",
                request.getRazorpaySignature());

        boolean signatureValid = Utils.verifyPaymentSignature(
                attributes,
                keySecret);

        if (!signatureValid) {
            throw new RuntimeException("Invalid payment signature");
        }

        // Fetch actual payment details from Razorpay.
        com.razorpay.Payment razorpayPayment = razorpayClient.payments.fetch(
                request.getRazorpayPaymentId());

        String actualOrderId = razorpayPayment.get("order_id");
        String actualStatus = razorpayPayment.get("status");
        String actualCurrency = razorpayPayment.get("currency");

        long actualAmount = ((Number) razorpayPayment.get("amount"))
                .longValue();

        if (!request.getRazorpayOrderId().equals(actualOrderId)) {
            throw new RuntimeException("Razorpay order ID mismatch");
        }

        if (!"INR".equals(actualCurrency)
                || !payment.getCurrency().equals(actualCurrency)) {
            throw new RuntimeException("Payment currency mismatch");
        }

        if (actualAmount != payment.getAmount()) {
            throw new RuntimeException("Payment amount mismatch");
        }

        BigDecimal expectedTotal = order.getTotalSumFee()
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP);

        if (expectedTotal.longValueExact() != actualAmount) {
            throw new RuntimeException("Business order amount mismatch");
        }

        if (!"captured".equalsIgnoreCase(actualStatus)) {

            payment.setStatus(
                    "authorized".equalsIgnoreCase(actualStatus)
                            ? PaymentStatus.AUTHORIZED
                            : PaymentStatus.PENDING);

            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);

            return new PaymentStatusResponse(
                    order.getId(),
                    request.getRazorpayPaymentId(),
                    payment.getStatus(),
                    "Payment has not been captured yet");
        }

        // Do not allow a second attempt to mark an already-paid order.
        if ("PAID".equals(order.getPaymentStatus())
                && !request.getRazorpayPaymentId()
                        .equals(payment.getRazorpayPaymentId())) {

            throw new RuntimeException(
                    "Another payment attempt has already paid this order");
        }

        LocalDateTime now = LocalDateTime.now();

        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setStatus(PaymentStatus.CAPTURED);
        payment.setUpdatedAt(now);
        payment.setPaidAt(now);

        paymentRepository.save(payment);

        order.setPaymentStatus("PAID");
        orderRepository.save(order);

        OrderStatus orderStatus = orderStatusRepository.findByOrderId(order.getId())
                .orElseThrow(() -> new RuntimeException("Order status not found"));

        orderStatus.setOrderStatus("PLACED");
        orderStatusRepository.save(orderStatus);

        return new PaymentStatusResponse(
                order.getId(),
                request.getRazorpayPaymentId(),
                PaymentStatus.CAPTURED,
                "Payment successful");
    }

    // --------------------------------------------------
    // PAYMENT STATUS
    // --------------------------------------------------

    public PaymentStatusResponse getPaymentStatus(
            String orderId,
            String farmerId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getFarmerId().equals(farmerId)) {
            throw new RuntimeException("Unauthorized order");
        }

        if ("PAID".equals(order.getPaymentStatus())) {

            return new PaymentStatusResponse(
                    orderId,
                    null,
                    PaymentStatus.CAPTURED,
                    "Order is paid");
        }

        List<Payment> attempts = paymentRepository.findByOrderIdOrderByCreatedAtDesc(orderId);

        if (attempts.isEmpty()) {

            return new PaymentStatusResponse(
                    orderId,
                    null,
                    PaymentStatus.FAILED,
                    "No payment attempt found");
        }

        Payment latest = attempts.get(0);

        return new PaymentStatusResponse(
                orderId,
                latest.getRazorpayPaymentId(),
                latest.getStatus(),
                "Latest payment attempt status");
    }
}