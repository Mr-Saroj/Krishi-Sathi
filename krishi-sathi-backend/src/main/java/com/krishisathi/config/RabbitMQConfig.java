
package com.krishisathi.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.RetryInterceptorBuilder;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.retry.RejectAndDontRequeueRecoverer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Main exchange
    public static final String EXCHANGE = "krishi.exchange";

    // Main email queue
    public static final String EMAIL_QUEUE = "email.queue";

    // email routing key
    public static final String EMAIL_ROUTING_KEY = "email.send";

    // welcome email queue
    public static final String WELCOME_QUEUE = "welcome.email.queue";

    // welcome email routing key
    public static final String WELCOME_ROUTING_KEY = "email.welcome";

    // Dead letter exchange
    public static final String DLX = "krishi.dlx";

    // Dead letter queue
    public static final String EMAIL_DLQ = "email.dlq";

    public static final String DLQ_ROUTING_KEY = "email.dlq";

    // 1. Main exchange
    @Bean
    public DirectExchange exchange() {
        return new DirectExchange(EXCHANGE);
    }

    // 2. Dead letter exchange
    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange(DLX);
    }

    // 3. Main email queue with DLQ configuration
    @Bean
    public Queue emailQueue() {
        return QueueBuilder.durable(EMAIL_QUEUE)
                .deadLetterExchange(DLX)
                .deadLetterRoutingKey(DLQ_ROUTING_KEY)
                .build();
    }

    // 4. Dead letter queue
    @Bean
    public Queue emailDlq() {
        return QueueBuilder.durable(EMAIL_DLQ).build();
    }

    // 5. Main queue binding
    @Bean
    public Binding emailBinding() {
        return BindingBuilder
                .bind(emailQueue())
                .to(exchange())
                .with(EMAIL_ROUTING_KEY);
    }

    // 6. DLQ binding
    @Bean
    public Binding dlqBinding() {
        return BindingBuilder
                .bind(emailDlq())
                .to(deadLetterExchange())
                .with(DLQ_ROUTING_KEY);
    }

    @Bean
    public Queue welcomeEmailQueue() {
        return QueueBuilder.durable(WELCOME_QUEUE)
                .deadLetterExchange(DLX)
                .deadLetterRoutingKey(DLQ_ROUTING_KEY)
                .build();
    }

    @Bean
    public Binding welcomeEmailBinding() {
        return BindingBuilder
                .bind(welcomeEmailQueue())
                .to(exchange())
                .with(WELCOME_ROUTING_KEY);
    }

    // 7. Automatic retry configuration
    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory) {

        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();

        factory.setConnectionFactory(connectionFactory);

        factory.setAdviceChain(
                RetryInterceptorBuilder.stateless()
                        .maxRetries(3)
                        .backOffOptions(5000, 2.0, 20000)
                        .recoverer(new RejectAndDontRequeueRecoverer())
                        .build());

        return factory;
    }
}
