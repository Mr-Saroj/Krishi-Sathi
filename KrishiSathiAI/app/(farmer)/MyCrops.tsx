import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const FOREST = '#14532D';
const LEAF = '#2E7D32';
const AMBER = '#F5A623';
const MUTED = '#5E7365';
const INK = '#1F2A24';

type Crop = {
  id: string;
  name: string;
  icon: IconName;
  plot: string;
  area: string;
  stage: string;
  day: number;
  totalDays: number;
  sowing: string;
  health: 'Healthy' | 'Needs attention';
};

// TODO: replace with data from your API / store
const CROPS: Crop[] = [
  {
    id: 'c1',
    name: 'Paddy (Swarna)',
    icon: 'grain',
    plot: 'Plot 1',
    area: '2.5 Acres',
    stage: 'Tillering',
    day: 38,
    totalDays: 140,
    sowing: '28 Aug 2026',
    health: 'Healthy',
  },
  {
    id: 'c2',
    name: 'Cotton',
    icon: 'leaf',
    plot: 'Plot 2',
    area: '1.7 Acres',
    stage: 'Flowering',
    day: 72,
    totalDays: 160,
    sowing: '25 Jul 2026',
    health: 'Needs attention',
  },
];

function CropCard({ c }: { c: Crop }) {
  const ok = c.health === 'Healthy';
  const pct = Math.min(100, Math.round((c.day / c.totalDays) * 100));

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      className="mb-4 rounded-3xl bg-white p-4"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
      accessibilityRole="button"
      accessibilityLabel={c.name}
    >
      {/* Title row */}
      <View className="flex-row items-center">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#DDF0DD]">
          <MaterialCommunityIcons name={c.icon} size={26} color={LEAF} />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-[17px] font-extrabold" style={{ color: INK }}>
            {c.name}
          </Text>
          <Text className="text-[13px]" style={{ color: MUTED }}>
            {c.plot} • {c.area}
          </Text>
        </View>
        <View
          className="rounded-full px-2.5 py-1"
          style={{ backgroundColor: ok ? '#DDF0DD' : '#FDE2E0' }}
        >
          <Text className="text-[11px] font-bold" style={{ color: ok ? LEAF : '#C0261B' }}>
            {c.health}
          </Text>
        </View>
      </View>

      {/* Growth progress */}
      <View className="mt-4">
        <View className="mb-1.5 flex-row items-center justify-between">
          <Text className="text-[13px] font-bold" style={{ color: INK }}>
            Stage: {c.stage}
          </Text>
          <Text className="text-[12px]" style={{ color: MUTED }}>
            Day {c.day} / {c.totalDays}
          </Text>
        </View>
        <View className="h-2.5 overflow-hidden rounded-full bg-[#EFEBE0]">
          <View
            className="h-full rounded-full"
            style={{ width: `${pct}%`, backgroundColor: ok ? LEAF : AMBER }}
          />
        </View>
      </View>

      {/* Footer */}
      <View className="mt-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <MaterialCommunityIcons name="calendar-outline" size={15} color={MUTED} />
          <Text className="ml-1 text-[12px]" style={{ color: MUTED }}>
            Sown {c.sowing}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-[13px] font-bold" style={{ color: FOREST }}>
            View details
          </Text>
          <MaterialCommunityIcons name="chevron-right" size={18} color={FOREST} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function MyCrops() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 130 }}
    >
      <View className="mb-3 flex-row items-end justify-between">
        <View>
          <Text className="text-[22px] font-extrabold" style={{ color: INK }}>
            My Crops
          </Text>
          <Text className="text-[13px]" style={{ color: MUTED }}>
            {CROPS.length} active crops • 4.2 Acres
          </Text>
        </View>
      </View>

      {CROPS.map((c) => (
        <CropCard key={c.id} c={c} />
      ))}

      {/* Add crop */}
      <TouchableOpacity
        activeOpacity={0.85}
        className="flex-row items-center justify-center rounded-3xl border-2 border-dashed border-[#B9B4A5] py-5"
        accessibilityRole="button"
        accessibilityLabel="Add new crop"
      >
        <MaterialCommunityIcons name="plus-circle-outline" size={22} color={FOREST} />
        <Text className="ml-2 text-[15px] font-bold" style={{ color: FOREST }}>
          Add New Crop
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}