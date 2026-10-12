package com.krishisathi.controller;

import com.krishisathi.dto.ConversationResponse;
import com.krishisathi.service.ConversationService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat/conversations")
public class ConversationController {

    private final ConversationService conversationService;

    public ConversationController(
            ConversationService conversationService) {
        this.conversationService = conversationService;
    }

    @GetMapping
    public ResponseEntity<List<ConversationResponse>> getMyConversations(
            @AuthenticationPrincipal Jwt jwt) {

        String farmerEmail = jwt.getSubject();

        return ResponseEntity.ok(
                conversationService.getMyConversations(farmerEmail)
        );
    }
}