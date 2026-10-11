
package com.krishisathi.controller;

import com.krishisathi.dto.ChatStreamRequest;
import com.krishisathi.service.ChatService;

import jakarta.validation.Valid;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping(
            value = "/stream",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = "application/x-ndjson"
    )
    public ResponseEntity<StreamingResponseBody> streamChat(
            @Valid @RequestBody ChatStreamRequest request
    ) {
        ChatService.StreamChatResult result =
                chatService.prepareStream(request);

        return ResponseEntity.ok()
                .header("X-Conversation-Id", result.conversationId())
                .contentType(MediaType.parseMediaType(
                        "application/x-ndjson"))
                .body(result.body());
    }
}