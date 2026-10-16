
import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Msg } from "./types";
import { chatService } from "../services/chatService";

export const FOREST = "#14532D";
export const LEAF = "#2E7D32";
export const AMBER = "#F5A623";
export const MUTED = "#5E7365";
export const INK = "#1F2A24";

type ChatEvent = Record<string, unknown>;

function extractAnswer(rawResponse: string): string {
  const raw = rawResponse.trim();

  if (!raw) return "";

  // First, try parsing the entire response as JSON.
  try {
    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed === "string") {
      return parsed;
    }

    if (parsed && typeof parsed === "object") {
      const answer = extractTextFromEvent(parsed as ChatEvent);
      if (answer) return answer;
    }
  } catch {
    // The response may contain multiple NDJSON lines or plain text.
  }

  const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const chunks: string[] = [];

  for (const originalLine of lines) {
    // Support SSE-style "data: {...}" lines if they are forwarded.
    const line = originalLine.startsWith("data:")
      ? originalLine.slice(5).trim()
      : originalLine;

    if (!line || line === "[DONE]") continue;

    try {
      const event: unknown = JSON.parse(line);

      if (typeof event === "string") {
        chunks.push(event);
        continue;
      }

      if (event && typeof event === "object") {
        const record = event as ChatEvent;

        if (record.error) {
          throw new Error(String(record.error));
        }

        const chunk = extractTextFromEvent(record);
        if (chunk) chunks.push(chunk);
      }
    } catch (error) {
      if (
        error instanceof Error &&
        !error.message.startsWith("Unexpected token") &&
        !error.message.includes("JSON")
      ) {
        throw error;
      }

      // If the line is not JSON, preserve it as plain text.
      // Do not silently discard a legitimate AI answer.
      chunks.push(line);
    }
  }

  return chunks.join("").trim();
}

function extractTextFromEvent(event: ChatEvent): string {
  const candidates: unknown[] = [
    event.content,
    event.token,
    event.text,
    event.answer,
    event.response,
    event.output,
    typeof event.delta === "object" && event.delta !== null
      ? (event.delta as ChatEvent).content
      : undefined,
    typeof event.message === "object" && event.message !== null
      ? (event.message as ChatEvent).content
      : undefined,
  ];

  const value = candidates.find(
    (candidate): candidate is string => typeof candidate === "string"
  );

  return value ?? "";
}

// Chat logic shared by NewChat.tsx and OldChat.tsx.

export function useChatEngine(
  initial: Msg[],
  onUpdate: (messages: Msg[]) => void,
  conversationId?: string,
  onConversationIdChange?: (id: string) => void
) {
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const onUpdateRef = useRef(onUpdate);
  const conversationIdRef = useRef<string | number | undefined>(
    conversationId
  );
  const busyRef = useRef(false);
  const firstRenderRef = useRef(true);
  const onConversationIdChangeRef = useRef(onConversationIdChange);

  onConversationIdChangeRef.current = onConversationIdChange;

  onUpdateRef.current = onUpdate;

  // Update the ID when opening an existing conversation.
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, typing]);

  useEffect(() => {
    // Avoid saving the initial messages again on first mount.
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    onUpdateRef.current(messages);
  }, [messages]);

  const send = async (text?: string) => {
    const prompt = (text ?? input).trim();

    if (!prompt || busyRef.current) return;

    busyRef.current = true;
    setInput("");
    setTyping(true);

    const userMessage: Msg = {
      id: `user-${Date.now()}`,
      from: "user",
      text: prompt,
    };

    const assistantId = `assistant-${Date.now()}`;

    setMessages((current) => [
      ...current,
      userMessage,
      {
        id: assistantId,
        from: "bot",
        text: "",
      },
    ]);

    try {
      const response = await chatService.sendMessage({
        prompt,
        conversationId:
          conversationIdRef.current != null
            ? String(conversationIdRef.current)
            : undefined,
        topK: 4,
      });

      // Capture the backend ID so subsequent messages continue
      // the same conversation within this chat engine.
      if (response.conversationId) {
        conversationIdRef.current = response.conversationId;

        onConversationIdChangeRef.current?.(
          response.conversationId
        );
      }

      const rawResponse =
        typeof response.data === "string"
          ? response.data
          : JSON.stringify(response.data);

      console.log("AI raw response:", rawResponse);
      console.log("AI conversation ID:", response.conversationId);

      const answer = extractAnswer(rawResponse);

      if (!answer) {
        throw new Error(
          "The server returned an empty or unrecognized answer. Check the raw AI response in the Expo terminal."
        );
      }

      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? { ...message, text: answer }
            : message
        )
      );
    } catch (error: unknown) {
      console.error("Failed to send AI chat message:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? {
              ...message,
              text: `Sorry, I couldn't get a response. ${errorMessage}`,
            }
            : message
        )
      );
    } finally {
      setTyping(false);
      busyRef.current = false;
    }
  };

  return {
    messages,
    input,
    setInput,
    typing,
    send,
    scrollRef,
  };
}

export function ChatHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <View className="mx-4 mb-2 mt-1 flex-row items-center rounded-2xl bg-white p-3">
      <TouchableOpacity
        onPress={onBack}
        className="mr-2 h-9 w-9 items-center justify-center"
        accessibilityRole="button"
        accessibilityLabel="Back to chats"
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color={INK} />
      </TouchableOpacity>

      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: FOREST }}
      >
        <MaterialCommunityIcons
          name="robot-happy-outline"
          size={22}
          color="#FFFFFF"
        />
      </View>

      <View className="ml-3 flex-1">
        <Text
          numberOfLines={1}
          className="text-[16px] font-extrabold"
          style={{ color: INK }}
        >
          {title}
        </Text>

        <View className="flex-row items-center">
          <View
            className="mr-1.5 h-2 w-2 rounded-full"
            style={{ backgroundColor: LEAF }}
          />
          <Text className="text-[12px]" style={{ color: MUTED }}>
            Online • Replies in your language
          </Text>
        </View>
      </View>
    </View>
  );
}

export function MessageBubble({ m }: { m: Msg }) {
  const isUser = m.from === "user";

  return (
    <View
      className={`mb-3 flex-row ${isUser ? "justify-end" : "justify-start"
        }`}
    >
      {!isUser && (
        <View className="mr-2 mt-1 h-8 w-8 items-center justify-center rounded-full bg-[#DDF0DD]">
          <MaterialCommunityIcons
            name="robot-outline"
            size={18}
            color={LEAF}
          />
        </View>
      )}

      <View
        className="max-w-[78%] rounded-3xl px-4 py-3"
        style={{
          backgroundColor: isUser ? FOREST : "#FFFFFF",
          borderBottomRightRadius: isUser ? 6 : 24,
          borderTopLeftRadius: isUser ? 24 : 6,
        }}
      >
        <Text
          className="text-[15px] leading-[21px]"
          style={{ color: isUser ? "#FFFFFF" : INK }}
        >
          {m.text}
        </Text>
      </View>
    </View>
  );
}

export function TypingBubble() {
  return (
    <View className="mb-4 flex-row items-end">
      <View className="rounded-2xl rounded-bl-md border border-[#E5EDE5] bg-white px-4 py-3">
        <View className="flex-row items-center">
          <View className="mr-1.5 h-2 w-2 rounded-full bg-[#2E7D32]" />
          <View className="mr-1.5 h-2 w-2 rounded-full bg-[#2E7D32] opacity-70" />
          <View className="h-2 w-2 rounded-full bg-[#2E7D32] opacity-40" />
          <Text className="ml-2 text-xs font-medium text-[#5E7365]">
            Thinking
          </Text>
        </View>
      </View>
    </View>
  );
}

export function ChatInputBar(props: {
  value: string;
  onChange: (text: string) => void;
  onSend: () => void;
  paddingBottom: number;
}) {
  const { value, onChange, onSend, paddingBottom } = props;

  return (
    <View
      className="flex-row items-center px-4 pt-2"
      style={{ paddingBottom }}
    >
      <View className="mr-2 flex-1 flex-row items-center rounded-full bg-white px-4">
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="Ask about your crop…"
          placeholderTextColor="#9AA79F"
          className="flex-1 py-3 text-[15px]"
          style={{ color: INK }}
          returnKeyType="send"
          onSubmitEditing={onSend}
        />

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Speak"
        >
          <MaterialCommunityIcons
            name="microphone-outline"
            size={22}
            color={MUTED}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={onSend}
        activeOpacity={0.85}
        className="h-12 w-12 items-center justify-center rounded-full"
        style={{
          backgroundColor: value.trim() ? FOREST : AMBER,
        }}
        accessibilityRole="button"
        accessibilityLabel="Send"
      >
        <MaterialCommunityIcons name="send" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
