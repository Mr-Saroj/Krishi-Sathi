
package com.krishisathi.service.Farmer;

import com.krishisathi.dto.request.ChatStreamRequest;
import com.krishisathi.dto.response.ChatMessageResponse;
import com.krishisathi.dto.response.ConversationResponse;
import com.krishisathi.model.ChatMessage;
import com.krishisathi.model.Conversation;
import com.krishisathi.repository.ChatMessageRepository;
import com.krishisathi.repository.ConversationRepository;
import com.krishisathi.repository.UserRepository;

import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;

@Service
public class ChatService {

        private final WebClient fastApiWebClient;
        private final UserRepository userRepository;
        private final ConversationRepository conversationRepository;
        private final ChatMessageRepository chatMessageRepository;

        public ChatService(
                        WebClient fastApiWebClient,
                        UserRepository userRepository,
                        ConversationRepository conversationRepository,
                        ChatMessageRepository chatMessageRepository) {

                this.fastApiWebClient = fastApiWebClient;
                this.userRepository = userRepository;
                this.conversationRepository = conversationRepository;
                this.chatMessageRepository = chatMessageRepository;
        }

        public record StreamChatResult(
                        String conversationId,
                        StreamingResponseBody body) {
        }

        // Create a new conversation or continue an existing one.
        // The email comes from the authenticated JWT, not the request body.
        public StreamChatResult prepareStream(
                        ChatStreamRequest request,
                        String authenticatedEmail) {

                String email = authenticatedEmail.trim();

                userRepository.findByEmailIgnoreCase(email)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "User not found"));

                final String userEmail = email;
                final Instant now = Instant.now();

                Conversation conversation;

                if (request.getConversationId() != null
                                && !request.getConversationId().isBlank()) {

                        // Continue the existing conversation only if it belongs
                        // to the authenticated farmer.
                        conversation = conversationRepository
                                        .findById(request.getConversationId())
                                        .filter(c -> c.getUserEmail() != null
                                                        && userEmail.equalsIgnoreCase(c.getUserEmail()))
                                        .orElseThrow(() -> new ResponseStatusException(
                                                        HttpStatus.NOT_FOUND,
                                                        "Conversation not found"));

                } else {
                        // Create a new conversation.
                        conversation = new Conversation();
                        conversation.setUserEmail(userEmail);

                        String prompt = request.getPrompt().trim();

                        conversation.setTitle(
                                        prompt.length() > 80
                                                        ? prompt.substring(0, 80)
                                                        : prompt);

                        conversation.setCreatedAt(now);
                }

                conversation.setUpdatedAt(now);
                conversation.setLastMessageAt(now);

                conversation = conversationRepository.save(conversation);

                final String conversationId = conversation.getId();

                // Save the user's message.
                ChatMessage userMessage = new ChatMessage();
                userMessage.setConversationId(conversationId);
                userMessage.setUserEmail(userEmail);
                userMessage.setRole("USER");
                userMessage.setContent(request.getPrompt().trim());
                userMessage.setStatus("COMPLETED");
                userMessage.setCreatedAt(now);
                userMessage.setUpdatedAt(now);

                chatMessageRepository.save(userMessage);

                // Create an empty assistant message before streaming.
                ChatMessage assistantMessage = new ChatMessage();
                assistantMessage.setConversationId(conversationId);
                assistantMessage.setUserEmail(userEmail);
                assistantMessage.setRole("ASSISTANT");
                assistantMessage.setContent("");
                assistantMessage.setStatus("STREAMING");
                assistantMessage.setCreatedAt(now);
                assistantMessage.setUpdatedAt(now);

                assistantMessage = chatMessageRepository.save(assistantMessage);

                final String assistantMessageId = assistantMessage.getId();

                // Stream the FastAPI response to the client and accumulate
                // the answer for saving in MongoDB.
                StreamingResponseBody body = outputStream -> {

                        ByteArrayOutputStream completeAnswer = new ByteArrayOutputStream();

                        try {
                                try (var chunks = fastApiWebClient.post()
                                                .uri("/api/adviser/chat/stream")
                                                .contentType(
                                                                org.springframework.http.MediaType.APPLICATION_JSON)
                                                .bodyValue(new FastApiChatRequest(
                                                                request.getPrompt(),
                                                                request.getTopK()))
                                                .retrieve()
                                                .bodyToFlux(DataBuffer.class)
                                                .toStream()) {

                                        var iterator = chunks.iterator();

                                        while (iterator.hasNext()) {
                                                DataBuffer buffer = iterator.next();

                                                try {
                                                        byte[] bytes = new byte[buffer.readableByteCount()];

                                                        buffer.read(bytes);

                                                        outputStream.write(bytes);
                                                        outputStream.flush();

                                                        completeAnswer.write(bytes);

                                                } finally {
                                                        DataBufferUtils.release(buffer);
                                                }
                                        }
                                }

                                // Mark the assistant response as completed.
                                ChatMessage savedMessage = chatMessageRepository.findById(assistantMessageId)
                                                .orElseThrow();

                                savedMessage.setContent(
                                                completeAnswer.toString(StandardCharsets.UTF_8));
                                savedMessage.setStatus("COMPLETED");
                                savedMessage.setUpdatedAt(Instant.now());

                                chatMessageRepository.save(savedMessage);

                                // Update the conversation timestamps.
                                Conversation savedConversation = conversationRepository.findById(conversationId)
                                                .orElseThrow();

                                Instant finishedAt = Instant.now();

                                savedConversation.setUpdatedAt(finishedAt);
                                savedConversation.setLastMessageAt(finishedAt);

                                conversationRepository.save(savedConversation);

                        } catch (Exception ex) {

                                ChatMessage failedMessage = chatMessageRepository.findById(assistantMessageId)
                                                .orElse(null);

                                if (failedMessage != null) {
                                        failedMessage.setContent(
                                                        completeAnswer.toString(StandardCharsets.UTF_8));
                                        failedMessage.setStatus("FAILED");
                                        failedMessage.setUpdatedAt(Instant.now());

                                        chatMessageRepository.save(failedMessage);
                                }

                                throw new IOException(
                                                "The farming advice stream failed", ex);
                        }
                };

                return new StreamChatResult(conversationId, body);
        }

        private record FastApiChatRequest(
                        String prompt,
                        int top_k) {
        }

        // Get all conversations belonging to a farmer.
        public List<ConversationResponse> getMyConversations(
                        String authenticatedEmail) {

                return conversationRepository
                                .findByUserEmailIgnoreCaseOrderByLastMessageAtDesc(
                                                authenticatedEmail)
                                .stream()
                                .map(ConversationResponse::from)
                                .toList();
        }

        // Delete a conversation and its messages.
        public void deleteConversation(
                        String conversationId,
                        String authenticatedEmail) {

                String email = authenticatedEmail.trim();

                userRepository.findByEmailIgnoreCase(email)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "User not found"));

                Conversation conversation = conversationRepository
                                .findById(conversationId)
                                .filter(c -> c.getUserEmail() != null
                                                && email.equalsIgnoreCase(c.getUserEmail()))
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Conversation not found"));

                chatMessageRepository.deleteByConversationId(conversation.getId());
                conversationRepository.delete(conversation);
        }

        // Get all messages for a specific conversation.
        public List<ChatMessageResponse> getConversationMessages(
                        String conversationId,
                        String authenticatedEmail) {

                String email = authenticatedEmail.trim();

                System.out.println("Requested conversation ID: " + conversationId);
                System.out.println("Authenticated email: " + email);

                Conversation conversation = conversationRepository
                                .findById(conversationId)
                                .orElseThrow(() -> {
                                        System.out.println("Conversation ID not found in MongoDB");
                                        return new ResponseStatusException(
                                                        HttpStatus.NOT_FOUND,
                                                        "Conversation not found");
                                });

                System.out.println("Stored conversation ID: " + conversation.getId());
                System.out.println("Stored owner email: " + conversation.getUserEmail());

                if (conversation.getUserEmail() == null
                                || !email.equalsIgnoreCase(conversation.getUserEmail().trim())) {

                        System.out.println("Conversation owner does not match authenticated user");

                        throw new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Conversation not found");
                }

                return chatMessageRepository
                                .findByConversationIdOrderByCreatedAtAsc(conversation.getId())
                                .stream()
                                .map(ChatMessageResponse::from)
                                .toList();
        }
}
