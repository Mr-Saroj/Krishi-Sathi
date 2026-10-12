// Opens after tapping an old chat in history: shows all previous messages, continue the conversation
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Chat, titleFrom } from './types';
import { ChatHeader, ChatInputBar, MessageBubble, TypingBubble, useChatEngine } from './chatParts';

type Props = {
  chat: Chat; // the old chat that was tapped
  onBack: () => void;
  onSave: (chat: Chat) => void; // updates the same chat in history
  kbVisible: boolean;
  navHeight: number;
};

export default function OldChat({ chat, onBack, onSave, kbVisible, navHeight }: Props) {
  const { messages, input, setInput, typing, send, scrollRef } = useChatEngine(chat.messages, (msgs) =>
    onSave({ ...chat, title: titleFrom(msgs), updatedAt: Date.now(), messages: msgs })
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ChatHeader title={chat.title} onBack={onBack} />

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
      </ScrollView>

      <ChatInputBar value={input} onChange={setInput} onSend={() => send()} paddingBottom={kbVisible ? 8 : navHeight + 4} />
    </KeyboardAvoidingView>
  );
}