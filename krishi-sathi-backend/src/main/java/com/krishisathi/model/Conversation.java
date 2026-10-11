package com.krishisathi.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document(collection = "conversations")
public class Conversation {

    @Id
    private String id;

    // Email identifies the owner in this local-testing flow.
    private String userEmail;

    private String title;

    private Instant createdAt;
    private Instant updatedAt;
    private Instant lastMessageAt;
}

