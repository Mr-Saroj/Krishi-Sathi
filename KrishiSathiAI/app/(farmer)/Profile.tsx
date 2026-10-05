import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const FOREST = '#14532D';
const LEAF = '#2E7D32';
const MUTED = '#5E7365';
const INK = '#1F2A24';

function InfoBox({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View className="flex-1 items-center rounded-2xl bg-[#F4F1EA] px-2 py-3">
      <MaterialCommunityIcons name={icon} size={20} color={FOREST} />
      <Text className="mt-1 text-[12px]" style={{ color: MUTED }}>
        {label}
      </Text>
      <Text className="text-[15px] font-extrabold" style={{ color: INK }} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function Row({
  icon,
  label,
  value,
  onPress,
  danger,
}: {
  icon: IconName;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="flex-row items-center border-b border-[#F0ECE0] py-3.5"
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View
        className="h-9 w-9 items-center justify-center rounded-xl"
        style={{ backgroundColor: danger ? '#FDE2E0' : '#DDF0DD' }}
      >
        <MaterialCommunityIcons name={icon} size={20} color={danger ? '#C0261B' : LEAF} />
      </View>
      <Text
        className="ml-3 flex-1 text-[15px] font-semibold"
        style={{ color: danger ? '#C0261B' : INK }}
      >
        {label}
      </Text>
      {!!value && (
        <Text className="mr-1 text-[13px]" style={{ color: MUTED }}>
          {value}
        </Text>
      )}
      <MaterialCommunityIcons name="chevron-right" size={20} color={MUTED} />
    </TouchableOpacity>
  );
}

export default function Profile({ onLogout }: { onLogout?: () => void }) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 130 }}
    >
      {/* Profile header */}
      <View
        className="mb-4 items-center rounded-3xl p-5"
        style={{ backgroundColor: FOREST }}
      >
        <View className="h-20 w-20 items-center justify-center rounded-full bg-white/20">
          <MaterialCommunityIcons name="account" size={48} color="#FFFFFF" />
        </View>
        <Text className="mt-3 text-[22px] font-extrabold text-white">Farmer</Text>
        <Text className="text-[14px]" style={{ color: 'rgba(255,255,255,0.85)' }}>
          +91 98765 43210
        </Text>
        <View className="mt-2 flex-row items-center rounded-full bg-white/15 px-3 py-1">
          <MaterialCommunityIcons name="map-marker-outline" size={14} color="#FFFFFF" />
          <Text className="ml-1 text-[12px] font-semibold text-white">
            Barpali, Bargarh (Odisha)
          </Text>
        </View>
      </View>

      {/* Farm summary */}
      <View className="mb-4 rounded-3xl bg-white p-4">
        <Text className="mb-3 text-[17px] font-extrabold" style={{ color: INK }}>
          My Farm
        </Text>
        <View className="flex-row gap-2">
          <InfoBox icon="vector-square" label="Land" value="4.2 Acres" />
          <InfoBox icon="sprout" label="Crops" value="2 Active" />
          <InfoBox icon="calendar-check-outline" label="Season" value="Kharif" />
        </View>
      </View>

      {/* Settings */}
      <View className="mb-4 rounded-3xl bg-white px-4 py-1">
        <Row icon="account-edit-outline" label="Edit Profile" />
        <Row icon="translate" label="Language" value="ଓଡ଼ିଆ" />
        <Row icon="bell-outline" label="Notifications" />
        <Row icon="bank-outline" label="Govt Schemes" />
        <Row icon="help-circle-outline" label="Help & Support" />
        <Row icon="logout" label="Logout" danger onPress={onLogout} />
      </View>
    </ScrollView>
  );
}