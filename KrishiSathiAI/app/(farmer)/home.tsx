import React, { useState } from 'react';
import {
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { TabKey } from '../../src/farmer/components/FarmerBottomNav';
import SchemeBanner from '../../src/farmer/components/SchemeBanner';


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
      <SchemeBanner />
      <Weather />
      <MandiRates />
      <QuickServices onNavigate={onNavigate} />
      <Tasks />
      <Advisory />
      <Helpline />
    </ScrollView>
  );
}