package com.krishisathi.service;

import com.krishisathi.dto.ConversationResponse;
import com.krishisathi.repository.ConversationRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ConversationService {

    private final ConversationRepository conversationRepository;

    public ConversationService(
            ConversationRepository conversationRepository) {
        this.conversationRepository = conversationRepository;
    }

    public List<ConversationResponse> getMyConversations(
            String authenticatedEmail) {

        return conversationRepository
                .findByUserEmailIgnoreCaseOrderByLastMessageAtDesc(
                        authenticatedEmail
                )
                .stream()
                .map(ConversationResponse::from)
                .toList();
    }
}