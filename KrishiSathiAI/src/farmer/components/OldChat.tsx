import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

import { Chat, Msg, titleFrom } from "./types";

import {
  ChatHeader,
  ChatInputBar,
  MessageBubble,
  TypingBubble,
  useChatEngine,
} from "./chatParts";

import {
  chatService,
  ChatMessageResponse,
} from "../services/chatService";

type Props = {
  chat: Chat;
  onBack: () => void;
  onSave: (chat: Chat) => void;
  kbVisible: boolean;
  navHeight: number;
};

type ConversationProps = Props & {
  initialMessages: Msg[];
};

/* Inner component: mounted only AFTER messages are loaded, so the hook
   starts with the real saved messages. */
function OldChatConversation({
  chat,
  onBack,
  onSave,
  kbVisible,
  navHeight,
  initialMessages,
}: ConversationProps) {
  const { messages, input, setInput, typing, send, scrollRef } =
    useChatEngine(
      initialMessages,
      (updatedMessages) => {
        onSave({
          ...chat,
          title: titleFrom(updatedMessages),
          updatedAt: Date.now(),
          messages: updatedMessages,
        });
      },
      chat.id
    );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ChatHeader title={chat.title} onBack={onBack} />

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
      </ScrollView>

      <ChatInputBar
        value={input}
        onChange={setInput}
        onSend={() => send()}
        paddingBottom={kbVisible ? 8 : navHeight + 4}
      />
    </KeyboardAvoidingView>
  );
}

/* Outer component: loads the saved messages from the backend. */
export default function OldChat(props: Props) {
  const { chat, onBack } = props;

  const [loadingMessages, setLoadingMessages] = useState(true);
  const [savedMessages, setSavedMessages] = useState<
    ChatMessageResponse[]
  >([]);
  const [loadError, setLoadError] = useState(false);

  const loadMessages = useCallback(async () => {
    setLoadingMessages(true);
    setLoadError(false);

    try {
      const response = await chatService.getConversationMessages(
        chat.id
      );
      setSavedMessages(response);
    } catch (error: unknown) {
      console.error("Failed to load conversation messages:", error);
      setLoadError(true);

      Alert.alert(
        "Unable to load chat",
        "Please check your connection and try again."
      );
    } finally {
      setLoadingMessages(false);
    }
  }, [chat.id]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  // Map backend messages to your frontend Msg type: { id, from, text }
  const initialMessages: Msg[] = useMemo(
    () =>
      savedMessages.map((message) => ({
        id: String(message.id),
        from: message.role === "USER" ? "user" : "bot",
        text: message.content,
      })),
    [savedMessages]
  );

  if (loadingMessages) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F8FAF5]">
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text className="mt-3 text-sm text-gray-600">
          Loading conversation...
        </Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F8FAF5] px-6">
        <Text className="mb-4 text-center text-gray-700">
          Could not load this conversation.
        </Text>

        <Text
          onPress={() => void loadMessages()}
          className="font-bold text-green-800"
        >
          Tap to retry
        </Text>

        <Text onPress={onBack} className="mt-5 text-gray-500">
          Go back
        </Text>
      </View>
    );
  }

  // key={chat.id} resets the hook state when a different chat is opened.
  return (
    <OldChatConversation
      key={chat.id}
      {...props}
      initialMessages={initialMessages}
    />
  );
}