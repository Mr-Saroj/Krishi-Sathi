
package com.krishisathi.controller;

import com.krishisathi.dto.ChatMessageResponse;
import com.krishisathi.dto.ChatStreamRequest;
import com.krishisathi.dto.ConversationResponse;
import com.krishisathi.service.ChatService;

import jakarta.validation.Valid;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

        private final ChatService chatService;

        public ChatController(ChatService chatService) {
                this.chatService = chatService;
        }

        // Send a message to AI and stream the response.
        @PostMapping(value = "/stream", consumes = MediaType.APPLICATION_JSON_VALUE, produces = "application/x-ndjson")
        public ResponseEntity<StreamingResponseBody> streamChat(
                        @Valid @RequestBody ChatStreamRequest request,
                        @AuthenticationPrincipal Jwt jwt) {

                String farmerEmail = jwt.getSubject();

                ChatService.StreamChatResult result = chatService.prepareStream(request, farmerEmail);

                return ResponseEntity.ok()
                                .header("X-Conversation-Id", result.conversationId())
                                .contentType(
                                                MediaType.parseMediaType("application/x-ndjson"))
                                .body(result.body());
        }

        // Get all conversations belonging to the logged-in farmer.
        @GetMapping("/conversations")
        public ResponseEntity<List<ConversationResponse>> getMyConversations(
                        @AuthenticationPrincipal Jwt jwt) {

                String farmerEmail = jwt.getSubject();

                return ResponseEntity.ok(
                                chatService.getMyConversations(farmerEmail));
        }

        // Get all messages belonging to one conversation.
        @GetMapping("/conversations/{conversationId}/messages")
        public ResponseEntity<List<ChatMessageResponse>> getConversationMessages(
                        @PathVariable String conversationId,
                        @AuthenticationPrincipal Jwt jwt) {

                String farmerEmail = jwt.getSubject();

                return ResponseEntity.ok(
                                chatService.getConversationMessages(
                                                conversationId,
                                                farmerEmail));
        }

        // Delete a conversation and all its messages.
        @DeleteMapping("/conversations/{conversationId}")
        public ResponseEntity<String> deleteConversation(
                        @PathVariable String conversationId,
                        @AuthenticationPrincipal Jwt jwt) {

                String farmerEmail = jwt.getSubject();

                chatService.deleteConversation(
                                conversationId,
                                farmerEmail);

                return ResponseEntity.ok(
                                "Conversation and all related messages deleted successfully");
        }
}
