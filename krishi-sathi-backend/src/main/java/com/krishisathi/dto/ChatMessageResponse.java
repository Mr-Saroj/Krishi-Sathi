package com.krishisathi.dto;

import com.krishisathi.model.ChatMessage;
import java.time.Instant;

public record ChatMessageResponse(
        String id,
        String conversationId,
        String role,
        String content,
        String status,
        Instant createdAt,
        Instant updatedAt
) {
    public static ChatMessageResponse from(ChatMessage message) {
        return new ChatMessageResponse(
                message.getId(),
                message.getConversationId(),
                message.getRole(),
                message.getContent(),
                message.getStatus(),
                message.getCreatedAt(),
                message.getUpdatedAt()
        );
    }
}