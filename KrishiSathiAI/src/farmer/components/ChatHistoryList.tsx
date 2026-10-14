
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  FlatList,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { chatService } from "../services/chatService";
import type { ConversationResponse } from "../services/chatService";
import ChatHistorySkeleton from "../skeletons/ChatHisytorySkeliton";

const FOREST = "#14532D";
const LEAF = "#2E7D32";
const AMBER = "#F5A623";
const MUTED = "#5E7365";
const INK = "#1F2A24";
const CREAM = "#FEF0DA";

const SIZE = 64;
const CIRCLE = 56;
const GAP_ABOVE_FOOTER = 16;
const RIGHT = 16;
const SHOW_LABEL = true;

type Props = {
  onOpenChat: (id: string) => void;
  onNewChat: () => void;
  bottomSpace?: number;
};

function formatWhen(timestamp?: string | number | null): string {
  if (timestamp == null) return "";

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return "";

  const today = new Date();

  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
  });
}

/* ---------- Animated pulse ring ---------- */

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
        Animated.timing(anim, {
          toValue: 0,
          duration: 0,
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
        position: "absolute",
        height: CIRCLE,
        width: CIRCLE,
        borderRadius: CIRCLE / 2,
        backgroundColor: LEAF,
        opacity: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.4, 0],
        }),
        transform: [
          {
            scale: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.75],
            }),
          },
        ],
      }}
    />
  );
}

/* ---------- Floating robot button ---------- */

function RobotNewChatButton({
  onPress,
  bottom,
}: {
  onPress: () => void;
  bottom: number;
}) {
  const press = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;
  const wiggle = useRef(new Animated.Value(0)).current;
  const badge = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 1300,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 1300,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const wiggleLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(2200),
        Animated.timing(wiggle, {
          toValue: 1,
          duration: 110,
          useNativeDriver: true,
        }),
        Animated.timing(wiggle, {
          toValue: -1,
          duration: 110,
          useNativeDriver: true,
        }),
        Animated.timing(wiggle, {
          toValue: 1,
          duration: 110,
          useNativeDriver: true,
        }),
        Animated.timing(wiggle, {
          toValue: 0,
          duration: 110,
          useNativeDriver: true,
        }),
      ])
    );

    const badgeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(badge, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(badge, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
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

  const pressIn = () => {
    Animated.spring(press, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 0,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(press, {
      toValue: 0,
      useNativeDriver: true,
      speed: 20,
      bounciness: 14,
    }).start();
  };

  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom,
        right: RIGHT,
        zIndex: 10,
        flexDirection: "row",
        alignItems: "center",
        transform: [
          {
            translateY: float.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -5],
            }),
          },
        ],
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
            flexDirection: "row",
            alignItems: "center",
            transform: [
              {
                scale: press.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.92],
                }),
              },
            ],
          }}
        >
          {SHOW_LABEL && (
            <View
              className="rounded-full border px-3 py-2"
              style={{
                backgroundColor: CREAM,
                borderColor: "#F6D9A8",
                marginRight: -14,
                paddingRight: 22,
                elevation: 3,
              }}
            >
              <Text
                style={{
                  color: FOREST,
                  fontSize: 13,
                  fontWeight: "800",
                }}
              >
                New chat
              </Text>
            </View>
          )}

          <View
            style={{
              height: SIZE,
              width: SIZE,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
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
                alignItems: "center",
                justifyContent: "center",
                elevation: 7,
                shadowColor: "#000",
                shadowOpacity: 0.28,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
              }}
            >
              <Animated.View
                style={{
                  transform: [
                    {
                      rotate: wiggle.interpolate({
                        inputRange: [-1, 1],
                        outputRange: ["-12deg", "12deg"],
                      }),
                    },
                  ],
                }}
              >
                <MaterialCommunityIcons
                  name="robot-happy-outline"
                  size={30}
                  color="#FFFFFF"
                />
              </Animated.View>

              <View style={{ position: "absolute", bottom: 3 }}>
                <MaterialCommunityIcons
                  name="sprout"
                  size={13}
                  color="#8BD18B"
                />
              </View>
            </View>

            <Animated.View
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                height: 24,
                width: 24,
                borderRadius: 12,
                backgroundColor: AMBER,
                borderWidth: 2,
                borderColor: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
                elevation: 8,
                transform: [
                  {
                    scale: badge.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.18],
                    }),
                  },
                ],
              }}
            >
              <MaterialCommunityIcons
                name="plus"
                size={16}
                color="#FFFFFF"
              />
            </Animated.View>
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
}

/* ---------- Chat history screen ---------- */

export default function ChatHistoryList({
  onOpenChat,
  onNewChat,
  bottomSpace = 0,
}: Props) {
  const [chats, setChats] = useState<ConversationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadChats = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const conversations = await chatService.getMyConversations();
      setChats(conversations);
    } catch (error: unknown) {
      const apiError = error as {
        response?: { status?: number; data?: unknown };
        message?: string;
      };

      console.error(
        "Failed to load conversations:",
        apiError.response?.data ?? apiError.message
      );

      if (apiError.response?.status === 401) {
        Alert.alert(
          "Session expired",
          "Please log in again to view your conversations."
        );
      } else {
        Alert.alert(
          "Error",
          "Unable to load chat history. Please try again."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const renderItem = ({ item }: { item: ConversationResponse }) => (
    <View className="mb-3 overflow-hidden rounded-2xl bg-white">
      <TouchableWithoutFeedback onPress={() => onOpenChat(item.id)}>
        <View className="flex-row items-center p-3">
          <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-green-100">
            <MaterialCommunityIcons
              name="robot-outline"
              size={22}
              color={LEAF}
            />
          </View>

          <View className="ml-0 flex-1">
            <Text
              numberOfLines={1}
              className="text-[15px] font-bold"
              style={{ color: INK }}
            >
              {item.title || "New conversation"}
            </Text>

            <Text
              numberOfLines={1}
              className="mt-0.5 text-[13px]"
              style={{ color: MUTED }}
            >
              Tap to continue this conversation
            </Text>
          </View>

          <Text
            className="ml-2 text-[11px]"
            style={{ color: MUTED }}
          >
            {formatWhen(item.lastMessageAt || item.updatedAt)}
          </Text>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-[#F8FAF5]">
        <View className="mx-4 mb-3 mt-1">
          <Text
            className="text-xl font-extrabold"
            style={{ color: INK }}
          >
            AI Adviser
          </Text>

          <Text className="text-xs" style={{ color: MUTED }}>
            Your previous conversations
          </Text>
        </View>

        <ChatHistorySkeleton count={6} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F8FAF5]">
      <View className="mx-4 mb-3 mt-1">
        <Text
          className="text-xl font-extrabold"
          style={{ color: INK }}
        >
          AI Adviser
        </Text>

        <Text className="text-xs" style={{ color: MUTED }}>
          Your previous conversations
        </Text>
      </View>

      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={() => loadChats(true)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: bottomSpace + SIZE + GAP_ABOVE_FOOTER + 16,
          flexGrow: 1,
        }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-8 py-12">
            <MaterialCommunityIcons
              name="chat-processing-outline"
              size={56}
              color={LEAF}
            />

            <Text
              className="mt-3 text-center text-[15px] font-bold"
              style={{ color: INK }}
            >
              No chats yet
            </Text>

            <Text
              className="mt-1 text-center text-[13px]"
              style={{ color: MUTED }}
            >
              Tap the New chat button to start a conversation with your AI
              Adviser.
            </Text>
          </View>
        }
      />

      <RobotNewChatButton
        onPress={onNewChat}
        bottom={bottomSpace + GAP_ABOVE_FOOTER}
      />
    </View>
  );
}
