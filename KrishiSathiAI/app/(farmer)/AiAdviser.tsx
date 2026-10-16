import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import useKeyboardVisible from "../../src/farmer/hooks/useKeyboardVisible";
import ChatHistoryList from "../../src/farmer/components/ChatHistoryList";
import NewChat from "../../src/farmer/components/NewChat";
import OldChat from "../../src/farmer/components/OldChat";

import type {
  Chat,
  Msg,
} from "../../src/farmer/components/types";

import {
  chatService,
} from "../../src/farmer/services/chatService";

import type {
  ChatMessageResponse,
  ConversationResponse,
} from "../../src/farmer/services/chatService";

type Screen =
  | { name: "history" }
  | { name: "new" }
  | { name: "old"; chat: Chat };

export default function AiAdviser() {
  const insets = useSafeAreaInsets();
  const kbVisible = useKeyboardVisible();

  const navHeight = 64 + Math.max(insets.bottom, 8);

  const [screen, setScreen] = useState<Screen>({
    name: "history",
  });

  const [openingChat, setOpeningChat] = useState(false);
  const [draftChat, setDraftChat] = useState<Chat | null>(null);

  const goHistory = useCallback(() => {
    setScreen({ name: "history" });
  }, []);

  // Convert the backend message format into your existing Msg type.
  const toChatMessage = useCallback(
    (message: ChatMessageResponse): Msg => ({
      id: message.id,
      from:
        message.role === "USER"
          ? "user"
          : "bot",
      text: message.content ?? "",
    }),
    []
  );

  // Open an existing saved conversation.
  const handleOpenChat = useCallback(
    async (conversationId: string) => {
      if (openingChat) return;

      setOpeningChat(true);

      try {
        const [conversations, messages] = await Promise.all([
          chatService.getMyConversations(),
          chatService.getConversationMessages(conversationId),
        ]);

        const conversation: ConversationResponse | undefined =
          conversations.find(
            (item) => item.id === conversationId
          );

        if (!conversation) {
          Alert.alert(
            "Conversation not found",
            "This conversation may have been deleted. Refresh your history."
          );
          return;
        }

        const chat: Chat = {
          id: conversation.id,
          title: conversation.title || "New chat",
          messages: messages.map(toChatMessage),
          updatedAt: conversation.lastMessageAt
            ? new Date(conversation.lastMessageAt).getTime()
            : Date.now(),
        };

        setScreen({
          name: "old",
          chat,
        });
      } catch (error: unknown) {
        console.error("Failed to open conversation:", error);

        Alert.alert(
          "Unable to open chat",
          "Could not load this conversation. Please check your connection and try again."
        );
      } finally {
        setOpeningChat(false);
      }
    },
    [openingChat, toChatMessage]
  );

  // Handle Android hardware back button.
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (screen.name !== "history") {
          goHistory();
          return true;
        }

        return false;
      }
    );

    return () => subscription.remove();
  }, [screen.name, goHistory]);

  return (
    <View style={{ flex: 1 }}>
      {screen.name === "history" && (
        <ChatHistoryList
          bottomSpace={navHeight}
          onNewChat={() => setScreen({ name: "new" })}
          onOpenChat={handleOpenChat}
        />
      )}

      {screen.name === "new" && (
        <NewChat
          conversationId={null}
          onBack={goHistory}
          onSave={(updatedChat: Chat) => {
            // Save the draft without navigating away from NewChat.
            setDraftChat(updatedChat);
          }}
          kbVisible={kbVisible}
          navHeight={navHeight}
        />
      )}

      {screen.name === "old" && (
        <OldChat
          key={screen.chat.id}
          chat={screen.chat}
          onBack={goHistory}
          onSave={(updatedChat: Chat) => {
            setScreen({
              name: "old",
              chat: updatedChat,
            });
          }}
          kbVisible={kbVisible}
          navHeight={navHeight}
        />
      )}

      {openingChat && (
        <View
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <View
            style={{
              backgroundColor: "#FFFFFF",
              paddingHorizontal: 24,
              paddingVertical: 20,
              borderRadius: 16,
              alignItems: "center",
              minWidth: 160,
            }}
          >
            <ActivityIndicator
              size="large"
              color="#2E7D32"
            />

            <Text
              style={{
                marginTop: 12,
                color: "#14532D",
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              Loading conversation...
            </Text>

            <TouchableOpacity
              onPress={goHistory}
              style={{ marginTop: 12, padding: 8 }}
            >
              <Text style={{ color: "#2E7D32" }}>
                Back to history
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
