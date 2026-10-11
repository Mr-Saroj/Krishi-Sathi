
package com.krishisathi.service;

import com.krishisathi.dto.ChatStreamRequest;
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

    // Returns both the conversation ID and the streaming response.
    public record StreamChatResult(
            String conversationId,
            StreamingResponseBody body) {
    }

    public StreamChatResult prepareStream(ChatStreamRequest request) {

        String email = request.getEmail().trim();

        // Verify the user exists.
        userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"));

        final String userEmail = email;
        final Instant now = Instant.now();

        Conversation conversation;

        // Reuse the conversation when an ID is supplied.
        if (request.getConversationId() != null
                && !request.getConversationId().isBlank()) {

            conversation = conversationRepository
                    .findById(request.getConversationId())
                    .filter(c -> userEmail.equalsIgnoreCase(
                            c.getUserEmail()))
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Conversation not found"));

        } else {
            // First message: create a new conversation.
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

        // MongoDB generates the ID when saving a new conversation.
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

        // Create an assistant message before streaming starts.
        ChatMessage assistantMessage = new ChatMessage();
        assistantMessage.setConversationId(conversationId);
        assistantMessage.setUserEmail(userEmail);
        assistantMessage.setRole("ASSISTANT");
        assistantMessage.setContent("");
        assistantMessage.setStatus("STREAMING");
        assistantMessage.setCreatedAt(Instant.now());
        assistantMessage.setUpdatedAt(Instant.now());

        assistantMessage =
                chatMessageRepository.save(assistantMessage);

        final String assistantMessageId = assistantMessage.getId();

        // Keep your existing FastAPI streaming logic.
        StreamingResponseBody body = outputStream -> {

            ByteArrayOutputStream completeAnswer =
                    new ByteArrayOutputStream();

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
                            byte[] bytes =
                                    new byte[buffer.readableByteCount()];

                            buffer.read(bytes);

                            // Stream the AI answer to the client.
                            outputStream.write(bytes);
                            outputStream.flush();

                            // Accumulate the answer for MongoDB.
                            completeAnswer.write(bytes);

                        } finally {
                            DataBufferUtils.release(buffer);
                        }
                    }
                }

                // Save the completed assistant answer.
                ChatMessage savedMessage =
                        chatMessageRepository.findById(assistantMessageId)
                                .orElseThrow();

                savedMessage.setContent(
                        completeAnswer.toString(StandardCharsets.UTF_8));
                savedMessage.setStatus("COMPLETED");
                savedMessage.setUpdatedAt(Instant.now());
                chatMessageRepository.save(savedMessage);

                // Update conversation timestamps.
                Conversation savedConversation =
                        conversationRepository.findById(conversationId)
                                .orElseThrow();

                Instant finishedAt = Instant.now();
                savedConversation.setUpdatedAt(finishedAt);
                savedConversation.setLastMessageAt(finishedAt);
                conversationRepository.save(savedConversation);

            } catch (Exception ex) {

                ChatMessage failedMessage =
                        chatMessageRepository.findById(assistantMessageId)
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

        // The controller uses this ID for the HTTP response header.
        return new StreamChatResult(conversationId, body);
    }

    private record FastApiChatRequest(
            String prompt,
            int top_k) {
    }
}
