// Opens after tapping the + icon: a fresh chat with welcome message + quick questions
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Chat, makeNewChat, titleFrom } from './types';
import { ChatHeader, ChatInputBar, MessageBubble, TypingBubble, useChatEngine } from './chatParts';

const SUGGESTIONS = [
  'When should I apply urea in paddy?',
  'Leaves are turning yellow',
  'Best fertilizer for cotton',
  'Is it safe to spray today?',
];

type Props = {
  onBack: () => void;
  onSave: (chat: Chat) => void; // saves this chat into history
  kbVisible: boolean;
  navHeight: number;
};

export default function NewChat({ onBack, onSave, kbVisible, navHeight }: Props) {
  const [chat] = useState<Chat>(makeNewChat); // created once

  const { messages, input, setInput, typing, send, scrollRef } = useChatEngine(chat.messages, (msgs) =>
    onSave({ ...chat, title: titleFrom(msgs), updatedAt: Date.now(), messages: msgs })
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ChatHeader title="New chat" onBack={onBack} />

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {messages.map((m) => (
          <MessageBubble key={m.id} m={m} />
        ))}
        {typing && <TypingBubble />}

        {/* Quick questions (only before the first user message) */}
        {messages.length === 1 && (
          <View className="mt-1 flex-row flex-wrap">
            {SUGGESTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => send(s)}
                activeOpacity={0.85}
                className="mb-2 mr-2 rounded-full border border-[#F6D9A8] bg-[#FEF0DA] px-3 py-2"
              >
                <Text className="text-[13px] font-semibold" style={{ color: '#B26B00' }}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <ChatInputBar value={input} onChange={setInput} onSend={() => send()} paddingBottom={kbVisible ? 8 : navHeight + 4} />
    </KeyboardAvoidingView>
  );
}