package com.krishisathi.service.common;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.krishisathi.config.RabbitMQConfig;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class WelcomeEmailConsumer {

    private final ObjectMapper objectMapper;
    private final WelcomeEmailService welcomeEmailService;

    public WelcomeEmailConsumer(
            ObjectMapper objectMapper,
            WelcomeEmailService welcomeEmailService) {

        this.objectMapper = objectMapper;
        this.welcomeEmailService = welcomeEmailService;
    }

    @RabbitListener(
            queues = RabbitMQConfig.WELCOME_QUEUE,
            containerFactory = "rabbitListenerContainerFactory"
    )
    public void consumeWelcomeEmail(String json) throws Exception {

        WelcomeEmailMessage message =
                objectMapper.readValue(
                        json,
                        WelcomeEmailMessage.class
                );

        welcomeEmailService.sendWelcomeEmail(message);
    }
}