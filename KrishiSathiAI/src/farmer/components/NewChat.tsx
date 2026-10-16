
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { chatService } from "../services/chatService";

import {
  Chat,
  makeNewChat,
  titleFrom,
} from "./types";

import {
  ChatHeader,
  ChatInputBar,
  MessageBubble,
  TypingBubble,
  useChatEngine,
} from "./chatParts";

const SUGGESTIONS = [
  "When should I apply urea in paddy?",
  "Leaves are turning yellow",
  "Best fertilizer for cotton",
  "Is it safe to spray today?",
];

type Props = {
  conversationId?: string | null;
  onBack: () => void;
  onSave: (chat: Chat) => void;
  kbVisible: boolean;
  navHeight: number;
};

export default function NewChat({
  conversationId = null,
  onBack,
  onSave,
  kbVisible,
  navHeight,
}: Props) {
  // Local chat remains available even before it is saved in MongoDB.
  const [chat, setChat] = useState<Chat>(() => makeNewChat());

  // Only set this when the backend returns its real conversation ID.
  const [backendConversationId, setBackendConversationId] =
    useState<string | undefined>(undefined);




  // Keep messages and the temporary chat in parent state.
  const handleMessagesUpdate = (msgs: Chat["messages"]) => {
    setChat((current) => {
      const updatedChat: Chat = {
        ...current,
        title: titleFrom(msgs),
        updatedAt: Date.now(),
        messages: msgs,
      };

      onSave(updatedChat);
      return updatedChat;
    });
  };

  // Called by useChatEngine after receiving the backend conversation ID.
  const handleConversationIdChange = (id: string) => {
    setBackendConversationId(id);

    setChat((current) => {
      const updatedChat: Chat = {
        ...current,
        id,
        updatedAt: Date.now(),
      };

      onSave(updatedChat);
      return updatedChat;
    });
  };

  const {
    messages,
    input,
    setInput,
    typing,
    send,
    scrollRef,
  } = useChatEngine(
    chat.messages,
    handleMessagesUpdate,
    backendConversationId,
    handleConversationIdChange
  );

  const handleBack = () => {
    // Preserve the current draft before returning to history.
    onSave({
      ...chat,
      title: titleFrom(messages),
      updatedAt: Date.now(),
      messages,
    });

    onBack();
  };
  useEffect(() => {
    let cancelled = false;

    const loadConversation = async () => {
      if (!conversationId) {
        // New chat: no backend messages to load.
        setBackendConversationId(undefined);
        return;
      }

      try {
        const messages =
          await chatService.getConversationMessages(conversationId);

        if (cancelled) return;

        const mappedMessages = messages.map((message) => ({
          id: message.id,
          from: message.role === "USER" ? "user" as const : "bot" as const,
          text: message.content ?? "",
        }));

        setBackendConversationId(conversationId);

        setChat((current) => {
          const updatedChat: Chat = {
            ...current,
            id: conversationId,
            messages: mappedMessages,
            updatedAt: Date.now(),
          };

          onSave(updatedChat);
          return updatedChat;
        });
      } catch (error) {
        if (cancelled) return;

        console.error("Failed to load conversation:", error);

        Alert.alert(
          "Unable to load conversation",
          "Could not load messages for this conversation."
        );
      }
    };

    void loadConversation();

    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ChatHeader title="New chat" onBack={handleBack} />

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} m={message} />
        ))}

        {typing && <TypingBubble />}

        {messages.filter((message) => message.from === "user").length ===
          0 && (
            <View className="mt-1 flex-row flex-wrap">
              {SUGGESTIONS.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion}
                  onPress={() => void send(suggestion)}
                  activeOpacity={0.85}
                  className="mb-2 mr-2 rounded-full border border-[#F6D9A8] bg-[#FEF0DA] px-3 py-2"
                >
                  <Text
                    className="text-[13px] font-semibold"
                    style={{ color: "#B26B00" }}
                  >
                    {suggestion}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
      </ScrollView>

      <ChatInputBar
        value={input}
        onChange={setInput}
        onSend={() => void send()}
        paddingBottom={kbVisible ? 8 : navHeight + 4}
      />
    </KeyboardAvoidingView>
  );
}
