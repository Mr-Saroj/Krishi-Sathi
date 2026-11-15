package com.krishisathi.service.Admin;

import com.krishisathi.config.RabbitMQConfig;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.GetResponse;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class FailedEmailRetryService {

    private final RabbitTemplate rabbitTemplate;

    public FailedEmailRetryService(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public int retryFailedEmails(int limit) {

        if (limit < 1 || limit > 100) {
            throw new IllegalArgumentException(
                    "Limit must be between 1 and 100"
            );
        }

        return rabbitTemplate.execute(channel -> {

            int retriedCount = 0;

            // Enable publisher confirmations on this channel
            channel.confirmSelect();

            for (int i = 0; i < limit; i++) {

                // Read one message without automatically deleting it
                GetResponse message = channel.basicGet(
                        RabbitMQConfig.EMAIL_DLQ,
                        false
                );

                if (message == null) {
                    break;
                }

                try {
                    // Send the original message back to the main exchange
                    channel.basicPublish(
                            RabbitMQConfig.EXCHANGE,
                            RabbitMQConfig.EMAIL_ROUTING_KEY,
                            message.getProps(),
                            message.getBody()
                    );

                    // Wait for RabbitMQ to confirm the publish
                    channel.waitForConfirmsOrDie(5000);

                    // Remove it from DLQ only after successful publish
                    channel.basicAck(
                            message.getEnvelope().getDeliveryTag(),
                            false
                    );

                    retriedCount++;

                } catch (Exception e) {

                    // Leave the message in DLQ if republishing fails
                    // It will be available for another admin retry.
                    throw new RuntimeException(
                            "Failed to republish DLQ email message",
                            e
                    );
                }
            }

            return retriedCount;
        });
    }
}
