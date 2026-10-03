import React, { useRef, useState } from 'react';

import {
  Animated,
  FlatList,
  Image,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const LOGO = require('../../assets/app_logo.png');

// Where to go when onboarding ends. Change to a route that exists in your app.
const NEXT_ROUTE = '/register';

type Slide = {
  key: string;
  title: string;
  body: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
};

const SLIDES: Slide[] = [
  {
    key: 'welcome',
    title: 'Your farming companion',
    body: 'Get crop advice, weather alerts and market prices in simple words.',
  },
  {
    key: 'ask',
    icon: 'camera-iris',
    title: 'Ask about any crop problem',
    body: 'Take a photo of a sick leaf or type your question. Get a clear answer on what to do next.',
  },
  {
    key: 'plan',
    icon: 'weather-partly-rainy',
    title: 'Plan with weather and prices',
    body: 'Know when to sow, spray and sell, with updates for your district.',
  },
];

export default function Welcome() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const listRef = useRef<FlatList<Slide>>(null);

  const isLast = index === SLIDES.length - 1;
  const logoWidth = Math.min(width - 32, 420);

  const onFinish = () => router.replace(NEXT_ROUTE as any);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index != null) setIndex(viewableItems[0].index);
    },
  ).current;

  const handleNext = () => {
    if (isLast) onFinish();
    else listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={{ width }} className="flex-1 items-center px-7">
      <View className="max-h-[340px] flex-1 items-center justify-center">
        {item.icon ? (
          <View className="h-[220px] w-[220px] items-center justify-center rounded-full border-[3px] border-wheat">
            <View className="h-[170px] w-[170px] items-center justify-center rounded-full bg-wheat-soft">
              <MaterialCommunityIcons name={item.icon} size={72} color="#14532D" />
            </View>
          </View>
        ) : (
          // The source logo has wide margins, so crop to the artwork
          <View
            className="justify-center overflow-hidden"
            style={{ width: logoWidth, height: logoWidth * 0.5 }}
          >
            <Image
              source={LOGO}
              style={{ width: logoWidth, height: logoWidth }}
              resizeMode="contain"
              accessibilityLabel="Krishi Sathi AI logo"
            />
          </View>
        )}
      </View>

      <Text className="mt-2 text-center text-[30px] font-extrabold leading-9 text-forest">
        {item.title}
      </Text>
      <Text className="mt-3 max-w-[320px] text-center text-[17px] leading-[25px] text-muted">
        {item.body}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-paper">
      <StatusBar barStyle="dark-content" backgroundColor="#F8FBF8" />
      <SafeAreaView style={{ flex: 1 }}>
        <View className="h-14 flex-row items-center justify-between px-6">
          {index > 0 ? (
            <Image
              source={LOGO}
              className="h-10 w-10 rounded-full"
              resizeMode="cover"
              accessibilityLabel="Krishi Sathi AI"
            />
          ) : (
            <View />
          )}
          {!isLast && (
            <TouchableOpacity onPress={onFinish} hitSlop={12} accessibilityRole="button">
              <Text className="text-base font-semibold text-muted">Skip</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* No className here: Animated components don't take className */}
        <Animated.FlatList
          ref={listRef as any}
          data={SLIDES}
          keyExtractor={(s) => s.key}
          renderItem={renderSlide}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: false,
          })}
          scrollEventThrottle={16}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ viewAreaCoveragePercentThreshold: 60 }}
        />

        <View className="items-center px-6 pb-4">
          <View className="mb-5 h-5 flex-row items-center">
            {SLIDES.map((_, i) => {
              const range = [(i - 1) * width, i * width, (i + 1) * width];
              const dotWidth = scrollX.interpolate({
                inputRange: range,
                outputRange: [8, 28, 8],
                extrapolate: 'clamp',
              });
              const opacity = scrollX.interpolate({
                inputRange: range,
                outputRange: [0.35, 1, 0.35],
                extrapolate: 'clamp',
              });
              return (
                <Animated.View
                  key={i}
                  style={{ width: dotWidth, opacity }}
                  className="mx-1 h-2 rounded bg-leaf"
                />
              );
            })}
          </View>

          <TouchableOpacity
            className="h-14 w-full items-center justify-center rounded-2xl bg-forest"
            onPress={handleNext}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={isLast ? 'Get started' : 'Next'}
          >
            <Text className="text-lg font-bold text-white">
              {isLast ? 'Get started' : 'Next'}
            </Text>
          </TouchableOpacity>

          <Text className="mt-3.5 text-[13px] text-muted">
            Free to use. Works in English, हिन्दी and ଓଡ଼ିଆ.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}