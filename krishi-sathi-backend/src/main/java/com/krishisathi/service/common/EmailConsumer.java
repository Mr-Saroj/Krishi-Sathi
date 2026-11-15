package com.krishisathi.service.common;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.krishisathi.model.EmailDelivery;
import com.krishisathi.repository.EmailDeliveryRepository;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class EmailConsumer {

    private final ObjectMapper objectMapper;
    private final EmailService emailService;
    private final EmailDeliveryRepository emailDeliveryRepository;

    public EmailConsumer(
            ObjectMapper objectMapper,
            EmailService emailService,
            EmailDeliveryRepository emailDeliveryRepository) {

        this.objectMapper = objectMapper;
        this.emailService = emailService;
        this.emailDeliveryRepository = emailDeliveryRepository;
    }

    @RabbitListener(queues = "email.queue")
    public void consumeEmail(String json) throws Exception {

        // 1. Convert JSON into NotificationMessage
        NotificationMessage notification =
                objectMapper.readValue(
                        json,
                        NotificationMessage.class
                );

        String messageId = notification.messageId();

        // 2. Check whether this email was already sent
        boolean alreadySent =
                emailDeliveryRepository.existsByMessageIdAndStatus(
                        messageId,
                        "SENT"
                );

        // 3. If already sent, skip duplicate
        if (alreadySent) {
            System.out.println(
                    "Duplicate email skipped: " + messageId
            );
            return;
        }

        // 4. Send email
        emailService.sendEmail(notification);

        // 5. Save successful delivery in MongoDB
        EmailDelivery delivery =
                new EmailDelivery(messageId, "SENT");

        delivery.setSentAt(LocalDateTime.now());

        emailDeliveryRepository.save(delivery);

        System.out.println(
                "Email sent successfully: " + messageId
        );
    }
}
