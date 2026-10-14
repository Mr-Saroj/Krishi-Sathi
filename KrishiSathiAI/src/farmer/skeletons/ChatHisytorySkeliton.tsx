
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  View,
} from "react-native";

interface ChatHistorySkeletonProps {
  count?: number;
}

export default function ChatHistorySkeleton({
  count = 6,
}: ChatHistorySkeletonProps) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [pulse]);

  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  return (
    <View className="px-4 pt-3">
      {Array.from({ length: count }).map((_, index) => (
        <Animated.View
          key={index}
          style={{ opacity }}
          className="mb-3 flex-row items-center rounded-2xl border border-gray-100 bg-white p-4"
        >
          {/* Conversation icon */}
          <View className="mr-3 h-11 w-11 rounded-full bg-gray-200" />

          {/* Conversation title and date */}
          <View className="flex-1">
            <View className="mb-2 h-4 w-3/4 rounded-md bg-gray-200" />
            <View className="h-3 w-2/5 rounded-md bg-gray-100" />
          </View>

          {/* Trailing placeholder */}
          <View className="ml-3 h-3 w-3 rounded-full bg-gray-200" />
        </Animated.View>
      ))}
    </View>
  );
}
