import React, { useState } from 'react';
import {
  Image,
  Linking,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const LOGO = require('../../assets/app_logo.png');

// Palette (taken from the design)
const FOREST = '#14532D';
const LEAF = '#2E7D32';
const AMBER = '#F5A623';
const MUTED = '#5E7365';
const INK = '#1F2A24';
const CREAM = '#FBF8F1';

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

/* -------------------------------- Header -------------------------------- */

const LANGS = [
  { code: 'or', label: 'ଓଡ଼ିଆ' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'en', label: 'EN' },
];

function Header() {
  const router = useRouter();
  const [lang, setLang] = useState('or');

  return (
    <View className="flex-row items-center justify-between px-4 pb-2 pt-1">
      <View className="flex-row items-center">
        <Image source={LOGO} style={{ width: 40, height: 40 }} resizeMode="contain" />
        <View className="ml-2">
          <Text className="text-[18px] font-extrabold leading-5" style={{ color: FOREST }}>
            Krishi Sathi
          </Text>
          <Text className="text-xs" style={{ color: MUTED }}>
            Home
          </Text>
        </View>
      </View>

      <View className="flex-row items-center">
        {/* Language switch */}
        <View className="mr-2 flex-row items-center rounded-full bg-[#EFEBE0] p-1">
          {LANGS.map((l) => {
            const active = lang === l.code;
            return (
              <TouchableOpacity
                key={l.code}
                onPress={() => setLang(l.code)}
                className="rounded-full px-3 py-1.5"
                style={{ backgroundColor: active ? FOREST : 'transparent' }}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text
                  className="text-[13px] font-bold"
                  style={{ color: active ? '#FFFFFF' : MUTED }}
                >
                  {l.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <RoundIconButton icon="microphone" bg={AMBER} color="#FFFFFF" size={40} label="Voice help" />
        <View className="w-2" />
        <RoundIconButton
          icon="account"
          bg={FOREST}
          color="#FFFFFF"
          size={36}
          label="Profile"
          onPress={() => router.push('/profile' as any)}
        />
      </View>
    </View>
  );
}

/* ------------------------------- Greeting ------------------------------- */

function Greeting() {
  return (
    <Card>
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="map-marker-outline" size={16} color={FOREST} />
            <Text className="ml-1 text-[13px] font-semibold" style={{ color: FOREST }}>
              Barpali, Bargarh (Odisha)
            </Text>
          </View>
          <Text
            className="mt-1 text-[22px] font-extrabold"
            style={{ color: INK }}
            numberOfLines={1}
          >
            Namaskar,MRDon! 👋
          </Text>
          <Text className="mt-0.5 text-[14px]" style={{ color: MUTED }}>
            4.2 Acres • Paddy & Cotton
          </Text>
        </View>
        <RoundIconButton icon="volume-high" bg="#FCE8CC" color="#B26B00" size={44} label="Read aloud" />
      </View>

      {/* Voice prompt */}
      <TouchableOpacity
        activeOpacity={0.85}
        className="mt-4 flex-row items-center rounded-2xl border border-[#F6D9A8] bg-[#FEF0DA] p-3"
        accessibilityRole="button"
        accessibilityLabel="Speak your question"
      >
        <RoundIconButton icon="microphone" bg={AMBER} color="#FFFFFF" size={44} label="Mic" />
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
    </Card>
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

function ServiceCard({ s }: { s: Service }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(s.route as any)}
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

function QuickServices() {
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
            <ServiceCard key={s.title} s={s} />
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

/* ------------------------------- Bottom nav ------------------------------- */

function BottomNav() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const Item = ({
    icon,
    label,
    route,
    active,
  }: {
    icon: IconName;
    label: string;
    route: string;
    active?: boolean;
  }) => (
    <TouchableOpacity
      className="flex-1 items-center pt-2"
      onPress={() => router.push(route as any)}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <MaterialCommunityIcons name={icon} size={24} color={active ? FOREST : MUTED} />
      <Text
        className="mt-0.5 text-[11px]"
        style={{ color: active ? FOREST : MUTED, fontWeight: active ? '700' : '500' }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View
      className="absolute bottom-0 left-0 right-0 flex-row rounded-t-3xl border-t border-[#EEE9DC] bg-white"
      style={{
        paddingBottom: Math.max(insets.bottom, 8),
        height: 64 + Math.max(insets.bottom, 8),
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: -2 },
        elevation: 12,
      }}
    >
      <Item icon="home-outline" label="Home" route="/" active />
      <Item icon="sprout-outline" label="My Crops" route="/crops" />

      {/* Center AI Doctor button */}
      <View className="flex-1 items-center">
        <TouchableOpacity
          onPress={() => router.push('/scan' as any)}
          activeOpacity={0.9}
          className="h-16 w-16 items-center justify-center rounded-full border-4 border-white"
          style={{
            backgroundColor: FOREST,
            marginTop: -26,
            shadowColor: '#000',
            shadowOpacity: 0.25,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 8,
          }}
          accessibilityRole="button"
          accessibilityLabel="AI Doctor"
        >
          <MaterialCommunityIcons name="camera" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="mt-0.5 text-[11px] font-bold" style={{ color: FOREST }}>
          AI Doctor
        </Text>
      </View>

      <Item icon="storefront-outline" label="Store" route="/store" />
      <Item icon="account-outline" label="Profile" route="/profile" />
    </View>
  );
}

/* --------------------------------- Screen --------------------------------- */

export default function Home() {
  return (
    <View className="flex-1" style={{ backgroundColor: CREAM }}>
      <StatusBar barStyle="dark-content" backgroundColor={CREAM} />
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <Header />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 130 }}
        >
          <Greeting />
          <Weather />
          <MandiRates />
          <QuickServices />
          <Tasks />
          <Advisory />
          <Helpline />
        </ScrollView>
      </SafeAreaView>

      <BottomNav />
    </View>
  );
}