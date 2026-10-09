import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

// Icon `color` props can't take classNames, so these stay as hex values
const FOREST = '#14532D';
const LEAF = '#2E7D32';
const AMBER = '#F5A623';
const MUTED = '#5E7365';

/* --------------------------------- Data ---------------------------------- */
// SAMPLE DATA. Replace with a fetch from your Spring Boot API
// daysLeft = null means the scheme is open all year.

type Tag = 'New' | 'Updated' | 'Closing soon';

type Scheme = {
  id: string;
  title: string;
  benefit: string;
  tag: Tag;
  icon: IconName;
  released: string;
  lastDate: string;
  daysLeft: number | null;
  window: number; // total days the window was open (for the progress bar)
};

const SCHEMES: Scheme[] = [
  {
    id: 'paddy-reg',
    title: 'Paddy procurement registration',
    benefit: 'Register to sell your Kharif paddy at the support price in your nearby mandi.',
    tag: 'Closing soon',
    icon: 'grain',
    released: 'Released 3 days ago',
    lastDate: 'Last date: 12 Oct',
    daysLeft: 6,
    window: 45,
  },
  {
    id: 'pmfby',
    title: 'PM Fasal Bima Yojana',
    benefit: 'Insure your Rabi crop against loss. You pay only a small share of the premium.',
    tag: 'New',
    icon: 'shield-check-outline',
    released: 'Released today',
    lastDate: 'Last date: 15 Dec',
    daysLeft: 70,
    window: 90,
  },
  {
    id: 'cm-kisan',
    title: 'CM-KISAN (Odisha)',
    benefit: 'State income support for small and marginal farmers. Check if your name is listed.',
    tag: 'Updated',
    icon: 'bank-outline',
    released: 'Updated this week',
    lastDate: 'Open all year',
    daysLeft: null,
    window: 0,
  },
  {
    id: 'pm-kisan',
    title: 'PM-KISAN instalment',
    benefit: 'Track your instalment status and update your e-KYC to avoid payment delays.',
    tag: 'Updated',
    icon: 'cash-multiple',
    released: 'Updated 2 days ago',
    lastDate: 'Open all year',
    daysLeft: null,
    window: 0,
  },
  {
    id: 'kcc',
    title: 'Kisan Credit Card',
    benefit: 'Low-interest crop loan for seeds, fertilizer and farm needs. Apply at your bank.',
    tag: 'New',
    icon: 'credit-card-outline',
    released: 'Released 1 week ago',
    lastDate: 'Last date: 30 Oct',
    daysLeft: 24,
    window: 60,
  },
];

const TAG_CLASS: Record<Tag, { box: string; text: string }> = {
  New: { box: 'bg-[#FEF0DA]', text: 'text-[#B26B00]' },
  Updated: { box: 'bg-[#EEF1EF]', text: 'text-[#5E7365]' },
  'Closing soon': { box: 'bg-[#FDE2E0]', text: 'text-[#C0261B]' },
};

/* --------------------------------- Slide --------------------------------- */

function Meta({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View className="mr-4 flex-row items-center">
      <MaterialCommunityIcons name={icon} size={14} color={MUTED} />
      <Text className="ml-1 text-[12px] text-[#5E7365]">{text}</Text>
    </View>
  );
}

function SchemeSlide({
  s,
  active,
  width,
  onPress,
}: {
  s: Scheme;
  active: boolean;
  width: number;
  onPress: () => void;
}) {
  const fill = useRef(new Animated.Value(1)).current;
  const ongoing = s.daysLeft === null;
  const soon = !ongoing && (s.daysLeft as number) <= 15;
  const tag = TAG_CLASS[s.tag];

  // progress bar animates to the real value each time the slide appears
  useEffect(() => {
    if (ongoing || !active) return;
    fill.setValue(1);
    Animated.timing(fill, {
      toValue: Math.max(0.06, (s.daysLeft as number) / s.window),
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [active]);

  return (
    <View className="px-4 pb-2" style={{ width }}>
      {/* Icon + tag */}
      <View className="flex-row items-center justify-between">
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#DDF0DD]">
          <MaterialCommunityIcons name={s.icon} size={24} color={FOREST} />
        </View>
        <View className={`rounded-full px-3 py-1 ${tag.box}`}>
          <Text className={`text-[12px] font-bold ${tag.text}`}>{s.tag}</Text>
        </View>
      </View>

      {/* Title + benefit */}
      <Text className="mt-3 text-[18px] font-extrabold text-[#1F2A24]" numberOfLines={1}>
        {s.title}
      </Text>
      <Text className="mt-1 text-[13px] leading-[19px] text-[#5E7365]" numberOfLines={2}>
        {s.benefit}
      </Text>

      {/* Dates */}
      <View className="mt-3 flex-row flex-wrap">
        <Meta icon="clock-outline" text={s.released} />
        <Meta icon={ongoing ? 'calendar-check-outline' : 'calendar-end'} text={s.lastDate} />
      </View>

      {/* Deadline */}
      <View className="mt-3 min-h-[34px] justify-center">
        {ongoing ? (
          <Text className="text-[13px] font-bold text-[#2E7D32]">Open all year</Text>
        ) : (
          <>
            <Text className={`text-[13px] font-bold ${soon ? 'text-[#C0261B]' : 'text-[#2E7D32]'}`}>
              {s.daysLeft} days left to apply
            </Text>
            <View className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#EEE9DC]">
              <Animated.View
                className="h-1.5 rounded-full"
                style={{
                  backgroundColor: soon ? AMBER : LEAF,
                  width: fill.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                }}
              />
            </View>
          </>
        )}
      </View>

      {/* Actions */}
      <View className="mt-4 flex-row items-center gap-3">
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel={`Apply for ${s.title}`}
          className="h-11 flex-1 flex-row items-center justify-center rounded-xl bg-[#14532D]"
        >
          <Text className="text-[14px] font-bold text-white">
            {ongoing ? 'Check eligibility' : 'Apply now'}
          </Text>
          <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Details of ${s.title}`}
          className="h-11 items-center justify-center rounded-xl border border-[#D9D4C5] px-5"
        >
          <Text className="text-[14px] font-bold text-[#1F2A24]">Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* --------------------------------- Banner -------------------------------- */

export default function SchemeBanner() {
  const router = useRouter();
  const goSchemes = () => router.push('/schemes' as any);

  const [w, setW] = useState(0);
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  // auto-advance; timer restarts whenever the slide changes (also after a manual swipe)
  useEffect(() => {
    if (!w) return;
    const t = setTimeout(() => {
      const next = (index + 1) % SCHEMES.length;
      scrollRef.current?.scrollTo({ x: next * w, animated: true });
      setIndex(next);
    }, 5000);
    return () => clearTimeout(t);
  }, [index, w]);

  const onSwipeEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!w) return;
    setIndex(Math.round(e.nativeEvent.contentOffset.x / w));
  };

  return (
    <View
      className="mx-4 mb-4 overflow-hidden rounded-3xl bg-white"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pb-3 pt-4">
        <View className="flex-row items-center">
          <MaterialCommunityIcons name="bank-outline" size={20} color={FOREST} />
          <Text className="ml-2 text-[17px] font-extrabold text-[#1F2A24]">Government schemes</Text>
        </View>
        <TouchableOpacity
          onPress={goSchemes}
          className="flex-row items-center"
          accessibilityRole="button"
          accessibilityLabel="See all schemes"
        >
          <Text className="text-[14px] font-bold text-[#14532D]">View all</Text>
          <MaterialCommunityIcons name="chevron-right" size={18} color={FOREST} />
        </TouchableOpacity>
      </View>

      <View className="mx-4 h-px bg-[#EEE9DC]" />

      {/* Slides */}
      <View className="pt-4">
        {w > 0 && (
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onSwipeEnd}
            scrollEventThrottle={16}
          >
            {SCHEMES.map((s, i) => (
              <SchemeSlide key={s.id} s={s} active={i === index} width={w} onPress={goSchemes} />
            ))}
          </ScrollView>
        )}
      </View>

      {/* Dots */}
      <View className="flex-row items-center justify-center gap-1.5 pb-4 pt-2">
        {SCHEMES.map((s, i) => (
          <View
            key={s.id}
            className={`h-1.5 rounded-full ${i === index ? 'w-5 bg-[#14532D]' : 'w-1.5 bg-[#D9D4C5]'}`}
          />
        ))}
      </View>
    </View>
  );
}