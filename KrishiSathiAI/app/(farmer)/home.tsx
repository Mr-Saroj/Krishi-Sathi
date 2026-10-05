import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { TabKey } from '../../src/farmer/components/FarmerBottomNav';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

// Palette (taken from the design)
const FOREST = '#14532D';
const LEAF = '#2E7D32';
const AMBER = '#F5A623';
const MUTED = '#5E7365';
const INK = '#1F2A24';

// Routes that should switch the bottom-bar tab instead of opening a new page
const TAB_ROUTES: Record<string, TabKey> = {
  '/crops': 'crops',
  '/scan': 'scan',
  '/adviser': 'adviser',
  '/profile': 'profile',
};

/* ----------------------------- Small pieces ----------------------------- */

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <View
      className={`mx-4 mb-4 rounded-3xl bg-white p-4 ${className}`}
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      {children}
    </View>
  );
}

function RoundIconButton({
  icon,
  bg,
  color,
  size = 44,
  onPress,
  label,
}: {
  icon: IconName;
  bg: string;
  color: string;
  size?: number;
  onPress?: () => void;
  label: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="items-center justify-center"
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg }}
    >
      <MaterialCommunityIcons name={icon} size={size * 0.5} color={color} />
    </TouchableOpacity>
  );
}

/* ------------------------------- Greeting ------------------------------- */

// Reusable looping animation value (0 → 1). `reverse` makes it ping-pong.
function useLoop(duration: number, opts: { reverse?: boolean; delay?: number } = {}) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const run = opts.reverse
      ? Animated.sequence([
          Animated.timing(v, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      : Animated.timing(v, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true });
    const loop = Animated.loop(
      opts.delay ? Animated.sequence([Animated.delay(opts.delay), run]) : run
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return v;
}

// Leaf / grain falling across the banner (like confetti in a sale banner)
function FallingItem({
  left,
  delay,
  duration,
  icon,
  color,
  size = 16,
}: {
  left: `${number}%`;
  delay: number;
  duration: number;
  icon: IconName;
  color: string;
  size?: number;
}) {
  const t = useLoop(duration, { delay });
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left,
        opacity: t.interpolate({ inputRange: [0, 0.1, 0.85, 1], outputRange: [0, 0.9, 0.9, 0] }),
        transform: [
          { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [-20, 250] }) },
          { translateX: t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 14, -6] }) },
          { rotate: t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
        ],
      }}
    >
      <MaterialCommunityIcons name={icon} size={size} color={color} />
    </Animated.View>
  );
}

function Greeting({ userName = 'Farmer' }: { userName?: string }) {
  // loops
  const sunSpin = useLoop(14000);
  const shimmer = useLoop(3200, { delay: 1200 });
  const pulse = useLoop(1600);
  const wave = useLoop(500, { reverse: true });
  const float = useLoop(2200, { reverse: true });

  // entry animation
  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(enter, { toValue: 1, friction: 7, tension: 40, useNativeDriver: true }).start();
  }, []);
  const rise = (offset: number) => ({
    opacity: enter,
    transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [offset, 0] }) }],
  });

  return (
    <View
      className="mx-4 mb-4 overflow-hidden rounded-3xl p-4"
      style={{
        backgroundColor: FOREST,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
      }}
    >
      {/* ---- Background decoration ---- */}
      <View
        pointerEvents="none"
        style={{ position: 'absolute', right: -50, top: -50, width: 190, height: 190, borderRadius: 95, backgroundColor: 'rgba(255,255,255,0.06)' }}
      />
      <View
        pointerEvents="none"
        style={{ position: 'absolute', left: -40, bottom: -60, width: 170, height: 170, borderRadius: 85, backgroundColor: 'rgba(46,125,50,0.55)' }}
      />

      {/* Rotating sun */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          right: 62,
          top: 10,
          opacity: 0.9,
          transform: [{ rotate: sunSpin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
        }}
      >
        <MaterialCommunityIcons name="white-balance-sunny" size={46} color={AMBER} />
      </Animated.View>

      {/* Falling leaves & grains */}
      <FallingItem left="8%" delay={0} duration={5200} icon="leaf" color="#8BD18F" />
      <FallingItem left="26%" delay={1400} duration={6000} icon="grain" color={AMBER} size={14} />
      <FallingItem left="48%" delay={700} duration={5600} icon="leaf" color="#B8E6B9" size={13} />
      <FallingItem left="68%" delay={2200} duration={6400} icon="grain" color="#FFD27A" size={15} />
      <FallingItem left="86%" delay={1000} duration={5000} icon="leaf" color="#8BD18F" size={18} />

      {/* Shimmer sweep (event-banner shine) */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -40,
          height: 340,
          width: 56,
          backgroundColor: 'rgba(255,255,255,0.10)',
          transform: [
            { translateX: shimmer.interpolate({ inputRange: [0, 1], outputRange: [-120, 460] }) },
            { rotate: '20deg' },
          ],
        }}
      />

      {/* ---- Content ---- */}
      <Animated.View style={rise(14)} className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          {/* Location chip */}
          <View
            className="flex-row items-center self-start rounded-full px-2.5 py-1"
            style={{ backgroundColor: 'rgba(255,255,255,0.16)' }}
          >
            <MaterialCommunityIcons name="map-marker-outline" size={14} color="#FFFFFF" />
            <Text className="ml-1 text-[12px] font-semibold text-white">Barpali, Bargarh (Odisha)</Text>
          </View>

          {/* Welcome back */}
          <View className="mt-3 flex-row items-center">
            <Text className="text-[14px] font-semibold" style={{ color: '#FFD27A' }}>
              Namaskar
            </Text>
            <Animated.Text
              style={{
                marginLeft: 6,
                fontSize: 16,
                transform: [
                  { rotate: wave.interpolate({ inputRange: [0, 1], outputRange: ['-14deg', '20deg'] }) },
                ],
              }}
            >
              🙏
            </Animated.Text>
          </View>
          <Text className="mt-0.5 text-[15px]" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Welcome back,
          </Text>
          <Text className="text-[26px] font-extrabold text-white" numberOfLines={1}>
            {userName} 👋
          </Text>
        </View>

        <Animated.View style={{ transform: [{ translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }] }}>
          <RoundIconButton icon="volume-high" bg="#FCE8CC" color="#B26B00" size={44} label="Read aloud" />
        </Animated.View>
      </Animated.View>

      {/* Farm info chips */}
      <Animated.View style={rise(20)} className="mt-3 flex-row">
        <View className="mr-2 flex-row items-center rounded-full px-3 py-1.5" style={{ backgroundColor: 'rgba(255,255,255,0.16)' }}>
          <MaterialCommunityIcons name="vector-square" size={14} color="#FFD27A" />
          <Text className="ml-1 text-[12px] font-bold text-white">4.2 Acres</Text>
        </View>
        <View className="flex-row items-center rounded-full px-3 py-1.5" style={{ backgroundColor: 'rgba(255,255,255,0.16)' }}>
          <MaterialCommunityIcons name="sprout" size={14} color="#8BD18F" />
          <Text className="ml-1 text-[12px] font-bold text-white">Paddy & Cotton</Text>
        </View>
      </Animated.View>

      {/* Voice prompt */}
      <Animated.View style={rise(28)}>
        <TouchableOpacity
          activeOpacity={0.85}
          className="mt-4 flex-row items-center rounded-2xl border border-[#F6D9A8] bg-[#FEF0DA] p-3"
          accessibilityRole="button"
          accessibilityLabel="Speak your question"
        >
          {/* Mic with pulsing ring */}
          <View className="items-center justify-center" style={{ width: 44, height: 44 }}>
            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: AMBER,
                opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
                transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] }) }],
              }}
            />
            <RoundIconButton icon="microphone" bg={AMBER} color="#FFFFFF" size={44} label="Mic" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-[15px] font-bold" style={{ color: INK }}>
              What help do you need today?
            </Text>
            <Text className="text-[13px]" style={{ color: MUTED }} numberOfLines={1}>
              Tap mic and speak in your language
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={26} color={INK} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

/* ------------------------------- Weather -------------------------------- */

function Stat({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View className="flex-1 items-center rounded-2xl bg-[#F4F1EA] px-2 py-3">
      <MaterialCommunityIcons name={icon} size={20} color={FOREST} />
      <Text className="mt-1 text-[12px]" style={{ color: MUTED }}>
        {label}
      </Text>
      <Text className="text-[16px] font-extrabold" style={{ color: INK }}>
        {value}
      </Text>
    </View>
  );
}

function Weather() {
  return (
    <Card>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <MaterialCommunityIcons name="white-balance-sunny" size={30} color={AMBER} />
          <Text className="ml-2 text-[24px] font-extrabold" style={{ color: INK }}>
            31°C
          </Text>
          <Text className="ml-2 mt-1 text-[14px]" style={{ color: MUTED }}>
            Sunny
          </Text>
        </View>
        <View className="rounded-full bg-[#EFEBE0] px-3 py-1">
          <Text className="text-[12px] font-semibold" style={{ color: MUTED }}>
            Updated 7:30 AM
          </Text>
        </View>
      </View>

      <View className="mt-3 flex-row gap-2">
        <Stat icon="water-outline" label="Rain Chance" value="15%" />
        <Stat icon="weather-windy" label="Wind Speed" value="12 km/h" />
        <Stat icon="water-percent" label="Humidity" value="62%" />
      </View>

      <View className="mt-3 flex-row items-center rounded-2xl p-3" style={{ backgroundColor: LEAF }}>
        <View className="h-10 w-10 items-center justify-center rounded-full bg-white/25">
          <MaterialCommunityIcons name="check-all" size={22} color="#FFFFFF" />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-[15px] font-extrabold text-white">Safe to Spray Today</Text>
          <Text className="text-[13px] text-white/90">
            Best time: After 4:00 PM when wind drops
          </Text>
        </View>
        <RoundIconButton icon="volume-high" bg="rgba(255,255,255,0.25)" color="#FFFFFF" size={36} label="Read aloud" />
      </View>
    </Card>
  );
}

/* ---------------------------- Live Mandi Rates --------------------------- */

function Rate({
  name,
  icon,
  price,
  change,
}: {
  name: string;
  icon: IconName;
  price: string;
  change: string;
}) {
  return (
    <View className="flex-1 rounded-2xl border border-[#EEE9DC] bg-[#FBFAF6] p-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-[14px] font-bold" style={{ color: INK }}>
          {name}
        </Text>
        <MaterialCommunityIcons name={icon} size={18} color={LEAF} />
      </View>
      <Text className="mt-1 text-[22px] font-extrabold" style={{ color: INK }}>
        {price}
      </Text>
      <View className="mt-1 flex-row items-center justify-between">
        <Text className="text-[12px]" style={{ color: MUTED }}>
          / Quintal
        </Text>
        <View className="rounded-full bg-[#DDF0DD] px-2 py-0.5">
          <Text className="text-[12px] font-bold" style={{ color: LEAF }}>
            {change} ▲
          </Text>
        </View>
      </View>
    </View>
  );
}

function MandiRates() {
  const router = useRouter();
  return (
    <Card>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="mr-2 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: LEAF }} />
          <Text className="text-[18px] font-extrabold" style={{ color: INK }}>
            Live Mandi Rates
          </Text>
        </View>
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => router.push('/mandi' as any)}
        >
          <Text className="text-[14px] font-bold" style={{ color: FOREST }}>
            View all
          </Text>
          <MaterialCommunityIcons name="chevron-right" size={18} color={FOREST} />
        </TouchableOpacity>
      </View>
      <Text className="mb-3 ml-5 text-[12px]" style={{ color: MUTED }}>
        Bargarh APMC • Today
      </Text>

      <View className="flex-row gap-3">
        <Rate name="Paddy (Swarna)" icon="grain" price="₹2,203" change="+₹45" />
        <Rate name="Cotton" icon="leaf" price="₹7,120" change="+₹120" />
      </View>
    </Card>
  );
}

/* ----------------------------- Quick Services ---------------------------- */

type Service = {
  title: string;
  subtitle: string;
  badge: string;
  icon: IconName;
  route: string;
  tint: string; // icon box bg
  iconColor: string;
  badgeBg: string;
  badgeColor: string;
  featured?: boolean;
};

const SERVICES: Service[] = [
  {
    title: 'Scan Crop Problem',
    subtitle: 'Check disease with camera',
    badge: 'AI Doctor',
    icon: 'camera-outline',
    route: '/scan',
    tint: 'rgba(255,255,255,0.18)',
    iconColor: '#FFFFFF',
    badgeBg: AMBER,
    badgeColor: '#FFFFFF',
    featured: true,
  },
  {
    title: 'My Crops',
    subtitle: '2 active crops, plot view',
    badge: 'Plot View',
    icon: 'sprout-outline',
    route: '/crops',
    tint: '#DDF0DD',
    iconColor: LEAF,
    badgeBg: '#F1EEE6',
    badgeColor: MUTED,
  },
  {
    title: 'Agri Store',
    subtitle: 'Seeds, Fertilizers, Tools',
    badge: 'Offers',
    icon: 'storefront-outline',
    route: '/store',
    tint: '#FCE3CF',
    iconColor: '#C2571A',
    badgeBg: '#FCE3CF',
    badgeColor: '#C2571A',
  },
  {
    title: 'Mandi Rates',
    subtitle: 'Live market prices',
    badge: 'Live',
    icon: 'trending-up',
    route: '/mandi',
    tint: '#DDF0DD',
    iconColor: LEAF,
    badgeBg: '#DDF0DD',
    badgeColor: LEAF,
  },
  {
    title: 'Govt Schemes',
    subtitle: 'PM-Kisan, KALIA, and more',
    badge: 'Eligible',
    icon: 'bank-outline',
    route: '/schemes',
    tint: '#FADCD3',
    iconColor: '#C0452B',
    badgeBg: '#DDF0DD',
    badgeColor: LEAF,
  },
  {
    title: 'Ask Agri Expert',
    subtitle: 'Chat & Voice call',
    badge: '24x7',
    icon: 'face-agent',
    route: '/expert',
    tint: '#FCE3CF',
    iconColor: '#C2571A',
    badgeBg: '#F1EEE6',
    badgeColor: MUTED,
  },
];

function ServiceCard({ s, onNavigate }: { s: Service; onNavigate?: (tab: TabKey) => void }) {
  const router = useRouter();

  const handlePress = () => {
    const tab = TAB_ROUTES[s.route];
    if (tab && onNavigate) onNavigate(tab); // switch middle section only
    else router.push(s.route as any); // other pages open normally
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      className="flex-1 rounded-3xl p-3.5"
      style={{
        backgroundColor: s.featured ? FOREST : '#FFFFFF',
        minHeight: 128,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
      accessibilityRole="button"
      accessibilityLabel={s.title}
    >
      <View className="flex-row items-start justify-between">
        <View
          className="h-11 w-11 items-center justify-center rounded-xl"
          style={{ backgroundColor: s.tint }}
        >
          <MaterialCommunityIcons name={s.icon} size={24} color={s.iconColor} />
        </View>
        <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: s.badgeBg }}>
          <Text className="text-[11px] font-bold" style={{ color: s.badgeColor }}>
            {s.badge}
          </Text>
        </View>
      </View>
      <Text
        className="mt-auto pt-4 text-[16px] font-extrabold"
        style={{ color: s.featured ? '#FFFFFF' : INK }}
        numberOfLines={2}
      >
        {s.title}
      </Text>
      <Text
        className="text-[13px]"
        style={{ color: s.featured ? 'rgba(255,255,255,0.85)' : MUTED }}
        numberOfLines={1}
      >
        {s.subtitle}
      </Text>
    </TouchableOpacity>
  );
}

function QuickServices({ onNavigate }: { onNavigate?: (tab: TabKey) => void }) {
  const rows = [SERVICES.slice(0, 2), SERVICES.slice(2, 4), SERVICES.slice(4, 6)];
  return (
    <View className="mb-4 px-4">
      <View className="mb-3 flex-row items-end justify-between">
        <Text className="text-[20px] font-extrabold" style={{ color: INK }}>
          Quick Services
        </Text>
        <Text className="text-[13px]" style={{ color: MUTED }}>
          One-tap actions
        </Text>
      </View>
      {rows.map((row, i) => (
        <View key={i} className="mb-3 flex-row gap-3">
          {row.map((s) => (
            <ServiceCard key={s.title} s={s} onNavigate={onNavigate} />
          ))}
        </View>
      ))}
    </View>
  );
}

/* ------------------------------ Today's Tasks ----------------------------- */

type Task = {
  id: string;
  title: string;
  tag: string;
  tagBg: string;
  tagColor: string;
  time: string;
  timeIcon: IconName;
};

const TASKS: Task[] = [
  {
    id: 't1',
    title: 'Apply Nitrogen/Urea in Paddy (Plot 1)',
    tag: 'Urgent • Before sunset',
    tagBg: '#FDE2E0',
    tagColor: '#C0261B',
    time: '5:00 PM',
    timeIcon: 'clock-outline',
  },
  {
    id: 't2',
    title: 'Irrigation for Vegetable Plot',
    tag: 'Scheduled • 30 mins',
    tagBg: '#DDF0DD',
    tagColor: LEAF,
    time: '4:00 PM',
    timeIcon: 'water-outline',
  },
];

function Tasks() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const pending = TASKS.filter((t) => !done[t.id]).length;

  return (
    <Card>
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <MaterialCommunityIcons name="check-circle-outline" size={24} color={LEAF} />
          <Text className="ml-2 text-[18px] font-extrabold" style={{ color: INK }}>
            Today's Tasks
          </Text>
        </View>
        <View className="rounded-full bg-[#FEF0DA] px-3 py-1">
          <Text className="text-[12px] font-bold" style={{ color: '#B26B00' }}>
            {pending} Pending
          </Text>
        </View>
      </View>

      {TASKS.map((t) => {
        const checked = !!done[t.id];
        return (
          <TouchableOpacity
            key={t.id}
            activeOpacity={0.85}
            onPress={() => setDone((d) => ({ ...d, [t.id]: !d[t.id] }))}
            className="mb-2 flex-row items-start rounded-2xl bg-[#F4F1EA] p-3"
            accessibilityRole="checkbox"
            accessibilityState={{ checked }}
          >
            <View
              className="mr-3 mt-0.5 h-6 w-6 items-center justify-center rounded-md border-2"
              style={{
                borderColor: checked ? LEAF : '#B9B4A5',
                backgroundColor: checked ? LEAF : '#FFFFFF',
              }}
            >
              {checked && <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />}
            </View>
            <View className="flex-1">
              <Text
                className="text-[15px] font-bold"
                style={{
                  color: INK,
                  textDecorationLine: checked ? 'line-through' : 'none',
                  opacity: checked ? 0.5 : 1,
                }}
              >
                {t.title}
              </Text>
              <View className="mt-1.5 flex-row items-center">
                <View className="mr-2 rounded-md px-2 py-0.5" style={{ backgroundColor: t.tagBg }}>
                  <Text className="text-[11px] font-bold" style={{ color: t.tagColor }}>
                    {t.tag}
                  </Text>
                </View>
                <MaterialCommunityIcons name={t.timeIcon} size={14} color={MUTED} />
                <Text className="ml-1 text-[13px]" style={{ color: MUTED }}>
                  {t.time}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </Card>
  );
}

/* ------------------------------ Crop Advisory ----------------------------- */

function Advisory() {
  return (
    <Card>
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color={AMBER} />
          <Text className="ml-2 text-[18px] font-extrabold" style={{ color: INK }}>
            Today's Crop Advisory
          </Text>
        </View>
        <RoundIconButton icon="volume-high" bg="#EFEBE0" color={MUTED} size={34} label="Read aloud" />
      </View>

      <View className="flex-row">
        {/* TODO: replace with require('../../assets/paddy.jpg') */}
        <View className="h-24 w-24 items-center justify-center rounded-2xl bg-[#DDF0DD]">
          <MaterialCommunityIcons name="grass" size={44} color={LEAF} />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-[16px] font-extrabold" style={{ color: INK }}>
            Stem Borer & Leaf Yellowing Alert
          </Text>
          <Text className="mt-1 text-[13px] leading-[19px]" style={{ color: MUTED }}>
            If slight yellowing appears on leaves, spray Neem oil solution (Azadirachtin 0.03%)
            promptly.
          </Text>
          <TouchableOpacity className="mt-1.5 flex-row items-center">
            <Text className="text-[14px] font-bold" style={{ color: FOREST }}>
              Read full advisory
            </Text>
            <MaterialCommunityIcons name="arrow-right" size={16} color={FOREST} />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
}

/* -------------------------------- Helpline -------------------------------- */

function Helpline() {
  return (
    <View className="mx-4 mb-4 flex-row items-center rounded-3xl bg-[#EFEBE0] p-3">
      <View
        className="h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: FOREST }}
      >
        <MaterialCommunityIcons name="phone-in-talk" size={24} color="#FFFFFF" />
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-[12px]" style={{ color: MUTED }}>
          Free 24x7 Farmer Helpline
        </Text>
        <Text className="text-[18px] font-extrabold" style={{ color: INK }}>
          1800-180-1551
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => Linking.openURL('tel:18001801551')}
        activeOpacity={0.85}
        className="rounded-xl px-4 py-3"
        style={{ backgroundColor: LEAF }}
        accessibilityRole="button"
        accessibilityLabel="Call farmer helpline"
      >
        <Text className="text-[14px] font-bold text-white">Tap to Call</Text>
      </TouchableOpacity>
    </View>
  );
}

/* --------------------- Home = middle part of dashboard -------------------- */

export default function Home({ onNavigate }: { onNavigate?: (tab: TabKey) => void }) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: 8, paddingBottom: 130 }}
    >
      <Greeting />
      <Weather />
      <MandiRates />
      <QuickServices onNavigate={onNavigate} />
      <Tasks />
      <Advisory />
      <Helpline />
    </ScrollView>
  );
}