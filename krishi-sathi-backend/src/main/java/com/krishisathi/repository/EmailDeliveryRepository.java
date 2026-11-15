
package com.krishisathi.repository;

import com.krishisathi.model.EmailDelivery;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface EmailDeliveryRepository
        extends MongoRepository<EmailDelivery, String> {

    boolean existsByMessageIdAndStatus(
            String messageId,
            String status
    );
}
