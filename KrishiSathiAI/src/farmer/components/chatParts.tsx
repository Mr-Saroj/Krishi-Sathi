// Shared pieces used by BOTH NewChat.tsx and OldChat.tsx
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Msg } from './types';

export const FOREST = '#14532D';
export const LEAF = '#2E7D32';
export const AMBER = '#F5A623';
export const MUTED = '#5E7365';
export const INK = '#1F2A24';

// TODO: replace this with a real API / AI call
export function fakeReply(q: string): string {
  const t = q.toLowerCase();
  if (t.includes('urea') || t.includes('nitrogen'))
    return 'Apply urea in 2–3 split doses: at tillering, panicle initiation and booting. Avoid applying before heavy rain or when the field is dry.';
  if (t.includes('yellow'))
    return 'Yellow leaves can mean nitrogen deficiency or stem borer. Check the base of the plant; if you see dead hearts, spray as advised in the crop advisory. Share a photo in AI Doctor for a better diagnosis.';
  if (t.includes('cotton'))
    return 'For cotton, a balanced NPK dose with extra potash at flowering helps boll formation. Get a soil test for exact quantities.';
  if (t.includes('spray'))
    return 'Today looks safe to spray. Best time is after 4 PM when the wind drops.';
  return 'Thanks for your question. Please tell me your crop, its age and the problem you see, and I will suggest what to do.';
}

// Chat logic (messages, input, typing, send). onUpdate is called after every change.
export function useChatEngine(initial: Msg[], onUpdate: (messages: Msg[]) => void) {
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const firstRun = useRef(true);
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, typing]);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    onUpdateRef.current(messages);
  }, [messages]);

  const send = (text?: string) => {
    const q = (text ?? input).trim();
    if (!q) return;
    setInput('');
    setMessages((m) => [...m, { id: `u${Date.now()}`, from: 'user', text: q }]);
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { id: `b${Date.now()}`, from: 'bot', text: fakeReply(q) }]);
      setTyping(false);
    }, 900);
  };

  return { messages, input, setInput, typing, send, scrollRef };
}

export function ChatHeader({ title, onBack }: { title: string; onBack: () => void }) {
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
      <View className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: FOREST }}>
        <MaterialCommunityIcons name="robot-happy-outline" size={22} color="#FFFFFF" />
      </View>
      <View className="ml-3 flex-1">
        <Text numberOfLines={1} className="text-[16px] font-extrabold" style={{ color: INK }}>
          {title}
        </Text>
        <View className="flex-row items-center">
          <View className="mr-1.5 h-2 w-2 rounded-full" style={{ backgroundColor: LEAF }} />
          <Text className="text-[12px]" style={{ color: MUTED }}>
            Online • Replies in your language
          </Text>
        </View>
      </View>
    </View>
  );
}

export function MessageBubble({ m }: { m: Msg }) {
  const isUser = m.from === 'user';
  return (
    <View className={`mb-3 flex-row ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <View className="mr-2 mt-1 h-8 w-8 items-center justify-center rounded-full bg-[#DDF0DD]">
          <MaterialCommunityIcons name="robot-outline" size={18} color={LEAF} />
        </View>
      )}
      <View
        className="max-w-[78%] rounded-3xl px-4 py-3"
        style={{
          backgroundColor: isUser ? FOREST : '#FFFFFF',
          borderBottomRightRadius: isUser ? 6 : 24,
          borderTopLeftRadius: isUser ? 24 : 6,
        }}
      >
        <Text className="text-[15px] leading-[21px]" style={{ color: isUser ? '#FFFFFF' : INK }}>
          {m.text}
        </Text>
      </View>
    </View>
  );
}

export function TypingBubble() {
  return (
    <View className="mb-3 flex-row items-center">
      <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-[#DDF0DD]">
        <MaterialCommunityIcons name="robot-outline" size={18} color={LEAF} />
      </View>
      <View className="rounded-3xl bg-white px-4 py-3">
        <Text style={{ color: MUTED }}>typing…</Text>
      </View>
    </View>
  );
}

export function ChatInputBar(props: {
  value: string;
  onChange: (t: string) => void;
  onSend: () => void;
  paddingBottom: number;
}) {
  const { value, onChange, onSend, paddingBottom } = props;
  return (
    <View className="flex-row items-center px-4 pt-2" style={{ paddingBottom }}>
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
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Speak">
          <MaterialCommunityIcons name="microphone-outline" size={22} color={MUTED} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={onSend}
        activeOpacity={0.85}
        className="h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: value.trim() ? FOREST : AMBER }}
        accessibilityRole="button"
        accessibilityLabel="Send"
      >
        <MaterialCommunityIcons name="send" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}