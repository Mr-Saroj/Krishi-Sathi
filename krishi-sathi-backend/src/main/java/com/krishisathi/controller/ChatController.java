package com.krishisathi.controller;

import com.krishisathi.dto.ChatStreamRequest;
import com.krishisathi.dto.ConversationResponse;
import com.krishisathi.service.ChatService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

        private final ChatService chatService;

        public ChatController(ChatService chatService) {
                this.chatService = chatService;

        }

        // Send user message to AI and recive Ai responce and return to user in stream
        // format
        // consumes = MediaType.APPLICATION_JSON_VALUE :- It means recive value from
        // http in JSON format
        // produces = "application/x-ndjson" :- It means return value to user in stream
        // format
        @PostMapping(value = "/stream", consumes = MediaType.APPLICATION_JSON_VALUE, produces = "application/x-ndjson")
        // StreamingResponseBody :- it is builtin spring MVC interface which return
        // stream respnce instead of whole response at once
        public ResponseEntity<StreamingResponseBody> streamChat(
                        @Valid @RequestBody ChatStreamRequest request) {
                ChatService.StreamChatResult result = chatService.prepareStream(request);

                return ResponseEntity.ok()
                                .header("X-Conversation-Id", result.conversationId())
                                .contentType(MediaType.parseMediaType(
                                                "application/x-ndjson"))
                                .body(result.body());
        }

        // get all conversesson by Logged in user
        @GetMapping("/conversations")
        public ResponseEntity<List<ConversationResponse>> getMyConversations(
                        @AuthenticationPrincipal Jwt jwt) {

                String farmerEmail = jwt.getSubject();

                return ResponseEntity.ok(
                                chatService.getMyConversations(farmerEmail));
        }

        @DeleteMapping("/conversations/{conversationId}")
        public ResponseEntity<String> deleteConversation(
                        @PathVariable String conversationId,
                        @AuthenticationPrincipal Jwt jwt) {

                // Extract email from the validated JWT.
                String farmerEmail = jwt.getSubject();

                chatService.deleteConversation(
                                conversationId,
                                farmerEmail);

                return ResponseEntity.ok(
                                "Conversation and all related messages deleted successfully");
        }

}