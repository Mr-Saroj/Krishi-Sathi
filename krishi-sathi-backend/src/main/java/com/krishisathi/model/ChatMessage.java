
package com.krishisathi.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document(collection = "chat_messages")
public class ChatMessage {

    @Id
    private String id;

    private String conversationId;
    private String userEmail;

    // USER or ASSISTANT
    private String role;

    private String content;

    // STREAMING, COMPLETED, or FAILED
    private String status;

    private Instant createdAt;
    private Instant updatedAt;
}
