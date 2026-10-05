import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useKeyboardVisible from '../../src/farmer/hooks/useKeyboardVisible';

const FOREST = '#14532D';
const LEAF = '#2E7D32';
const AMBER = '#F5A623';
const MUTED = '#5E7365';
const INK = '#1F2A24';

type Msg = { id: string; from: 'bot' | 'user'; text: string };

const SUGGESTIONS = [
  'When should I apply urea in paddy?',
  'Leaves are turning yellow',
  'Best fertilizer for cotton',
  'Is it safe to spray today?',
];

// TODO: replace this with a real API / AI call
function fakeReply(q: string): string {
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

export default function AiAdviser() {
  const insets = useSafeAreaInsets();
  const kbVisible = useKeyboardVisible();
  const navHeight = 64 + Math.max(insets.bottom, 8); // space for the bottom bar

  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 'm0',
      from: 'bot',
      text: 'Namaskar! 🙏 I am your Krishi AI Adviser. Ask me anything about your crops, fertilizer, pests, weather or mandi.',
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, typing]);

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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Chat header */}
      <View className="mx-4 mb-2 mt-1 flex-row items-center rounded-2xl bg-white p-3">
        <View className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: FOREST }}>
          <MaterialCommunityIcons name="robot-happy-outline" size={22} color="#FFFFFF" />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-[16px] font-extrabold" style={{ color: INK }}>
            AI Adviser
          </Text>
          <View className="flex-row items-center">
            <View className="mr-1.5 h-2 w-2 rounded-full" style={{ backgroundColor: LEAF }} />
            <Text className="text-[12px]" style={{ color: MUTED }}>
              Online • Replies in your language
            </Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {messages.map((m) => {
          const isUser = m.from === 'user';
          return (
            <View key={m.id} className={`mb-3 flex-row ${isUser ? 'justify-end' : 'justify-start'}`}>
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
        })}

        {typing && (
          <View className="mb-3 flex-row items-center">
            <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-[#DDF0DD]">
              <MaterialCommunityIcons name="robot-outline" size={18} color={LEAF} />
            </View>
            <View className="rounded-3xl bg-white px-4 py-3">
              <Text style={{ color: MUTED }}>typing…</Text>
            </View>
          </View>
        )}

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

      {/* Input bar (sits above the bottom bar; bottom bar hides while typing) */}
      <View
        className="flex-row items-center px-4 pt-2"
        style={{ paddingBottom: kbVisible ? 8 : navHeight + 4 }}
      >
        <View className="mr-2 flex-1 flex-row items-center rounded-full bg-white px-4">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about your crop…"
            placeholderTextColor="#9AA79F"
            className="flex-1 py-3 text-[15px]"
            style={{ color: INK }}
            returnKeyType="send"
            onSubmitEditing={() => send()}
          />
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Speak">
            <MaterialCommunityIcons name="microphone-outline" size={22} color={MUTED} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => send()}
          activeOpacity={0.85}
          className="h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: input.trim() ? FOREST : AMBER }}
          accessibilityRole="button"
          accessibilityLabel="Send"
        >
          <MaterialCommunityIcons name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}