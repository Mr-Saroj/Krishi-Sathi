import React, { useEffect, useRef } from 'react';
import { Animated, Easing, FlatList, Text, TouchableWithoutFeedback, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Chat } from './types';

const FOREST = '#14532D';
const LEAF = '#2E7D32';
const AMBER = '#F5A623';
const MUTED = '#5E7365';
const INK = '#1F2A24';

const CREAM = '#FEF0DA';

const SIZE = 64; // touch area of the robot button
const CIRCLE = 56; // robot circle size
const GAP_ABOVE_FOOTER = 16; // space between the button and the footer bar (bigger = higher)
const RIGHT = 16; // distance from right edge
const SHOW_LABEL = true; // show the small "New chat" tag next to the robot

type Props = {
  chats: Chat[];
  onOpenChat: (id: string) => void;
  onNewChat: () => void;
  bottomSpace?: number; // height of the bottom nav bar (footer)
};

function formatWhen(ts: number) {
  const d = new Date(ts);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

/* ---------- Animated robot "new chat" button (farmer theme) ---------- */
function PulseRing({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim, delay]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        height: CIRCLE,
        width: CIRCLE,
        borderRadius: CIRCLE / 2,
        backgroundColor: LEAF,
        opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] }),
        transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.75] }) }],
      }}
    />
  );
}

function RobotNewChatButton({ onPress, bottom }: { onPress: () => void; bottom: number }) {
  const press = useRef(new Animated.Value(0)).current; // press effect
  const float = useRef(new Animated.Value(0)).current; // up/down floating
  const wiggle = useRef(new Animated.Value(0)).current; // robot head wiggle
  const badge = useRef(new Animated.Value(0)).current; // + badge heartbeat

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 1300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    const wiggleLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(2200),
        Animated.timing(wiggle, { toValue: 1, duration: 110, useNativeDriver: true }),
        Animated.timing(wiggle, { toValue: -1, duration: 110, useNativeDriver: true }),
        Animated.timing(wiggle, { toValue: 1, duration: 110, useNativeDriver: true }),
        Animated.timing(wiggle, { toValue: 0, duration: 110, useNativeDriver: true }),
      ])
    );
    const badgeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(badge, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(badge, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    floatLoop.start();
    wiggleLoop.start();
    badgeLoop.start();
    return () => {
      floatLoop.stop();
      wiggleLoop.stop();
      badgeLoop.stop();
    };
  }, [float, wiggle, badge]);

  const pressIn = () =>
    Animated.spring(press, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 0 }).start();
  const pressOut = () =>
    Animated.spring(press, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 14 }).start();

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom,
        right: RIGHT,
        zIndex: 10,
        flexDirection: 'row',
        alignItems: 'center',
        transform: [{ translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }],
      }}
    >
      <TouchableWithoutFeedback
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        accessibilityRole="button"
        accessibilityLabel="New chat with AI Adviser"
      >
        <Animated.View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            transform: [{ scale: press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.92] }) }],
          }}
        >
          {/* Small label tag */}
          {SHOW_LABEL && (
            <View
              style={{
                backgroundColor: CREAM,
                borderColor: '#F6D9A8',
                borderWidth: 1,
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 7,
                marginRight: -14,
                paddingRight: 22,
                elevation: 3,
              }}
            >
              <Text style={{ color: FOREST, fontSize: 13, fontWeight: '800' }}>New chat</Text>
            </View>
          )}

          {/* Robot button */}
          <View style={{ height: SIZE, width: SIZE, alignItems: 'center', justifyContent: 'center' }}>
            <PulseRing delay={0} />
            <PulseRing delay={1000} />

            <View
              style={{
                height: CIRCLE,
                width: CIRCLE,
                borderRadius: CIRCLE / 2,
                backgroundColor: FOREST,
                borderWidth: 3,
                borderColor: AMBER,
                alignItems: 'center',
                justifyContent: 'center',
                elevation: 7,
                shadowColor: '#000',
                shadowOpacity: 0.28,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
              }}
            >
              <Animated.View
                style={{
                  transform: [
                    { rotate: wiggle.interpolate({ inputRange: [-1, 1], outputRange: ['-12deg', '12deg'] }) },
                  ],
                }}
              >
                <MaterialCommunityIcons name="robot-happy-outline" size={30} color="#FFFFFF" />
              </Animated.View>

              {/* tiny sprout = farmer touch */}
              <View style={{ position: 'absolute', bottom: 3 }}>
                <MaterialCommunityIcons name="sprout" size={13} color="#8BD18B" />
              </View>
            </View>

            {/* + badge */}
            <Animated.View
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                height: 24,
                width: 24,
                borderRadius: 12,
                backgroundColor: AMBER,
                borderWidth: 2,
                borderColor: '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
                elevation: 8,
                transform: [{ scale: badge.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] }) }],
              }}
            >
              <MaterialCommunityIcons name="plus" size={16} color="#FFFFFF" />
            </Animated.View>
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
}

/* ---------- History list ---------- */
export default function ChatHistoryList({ chats, onOpenChat, onNewChat, bottomSpace = 0 }: Props) {
  return (
    <View style={{ flex: 1 }}>
      {/* Title */}
      <View className="mx-4 mb-3 mt-1">
        <Text className="text-[20px] font-extrabold" style={{ color: INK }}>
          AI Adviser
        </Text>
        <Text className="text-[12px]" style={{ color: MUTED }}>
          Your previous conversations
        </Text>
      </View>

      <FlatList
        data={chats}
        keyExtractor={(c) => c.id}
        // extra bottom space so the last chat is not hidden behind the + button
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: bottomSpace + SIZE + GAP_ABOVE_FOOTER + 16,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-8">
            <MaterialCommunityIcons name="chat-processing-outline" size={56} color={LEAF} />
            <Text className="mt-3 text-center text-[15px] font-bold" style={{ color: INK }}>
              No chats yet
            </Text>
            <Text className="mt-1 text-center text-[13px]" style={{ color: MUTED }}>
              Tap the + button to start a new conversation with your AI Adviser.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const last = item.messages[item.messages.length - 1];
          return (
            <View className="mb-3 overflow-hidden rounded-2xl bg-white">
              <TouchableWithoutFeedback onPress={() => onOpenChat(item.id)}>
                <View className="flex-row items-center p-3">
                  <View className="h-11 w-11 items-center justify-center rounded-full bg-[#DDF0DD]">
                    <MaterialCommunityIcons name="robot-outline" size={22} color={LEAF} />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text numberOfLines={1} className="text-[15px] font-bold" style={{ color: INK }}>
                      {item.title}
                    </Text>
                    <Text numberOfLines={1} className="mt-0.5 text-[13px]" style={{ color: MUTED }}>
                      {last?.text}
                    </Text>
                  </View>
                  <Text className="ml-2 text-[11px]" style={{ color: MUTED }}>
                    {formatWhen(item.updatedAt)}
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          );
        }}
      />

      {/* Robot + New chat button: just above the footer, right side */}
      <RobotNewChatButton onPress={onNewChat} bottom={bottomSpace + GAP_ABOVE_FOOTER} />
    </View>
  );
}