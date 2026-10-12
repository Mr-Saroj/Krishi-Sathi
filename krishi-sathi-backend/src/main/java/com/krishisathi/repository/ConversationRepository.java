
package com.krishisathi.repository;

import com.krishisathi.model.Conversation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ConversationRepository
        extends MongoRepository<Conversation, String> {

    List<Conversation> findByUserEmailOrderByUpdatedAtDesc(
            String userEmail
    );
     List<Conversation> findByUserEmailIgnoreCaseOrderByLastMessageAtDesc(
            String userEmail
    );
}
