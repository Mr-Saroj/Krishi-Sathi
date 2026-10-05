import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const FOREST = '#14532D';
const MUTED = '#5E7365';
const ACTIVE_PILL = '#DDF0DD'; // light green behind the active icon

export type TabKey = 'home' | 'crops' | 'scan' | 'adviser' | 'profile';

function NavItem({
  icon,
  activeIcon,
  label,
  active,
  onPress,
}: {
  icon: IconName; // outline icon (inactive)
  activeIcon: IconName; // filled icon (active)
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      className="flex-1 items-center pt-2"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!active }}
    >
      <View
        className="items-center justify-center rounded-full"
        style={{
          width: 52,
          height: 30,
          backgroundColor: active ? ACTIVE_PILL : 'transparent',
        }}
      >
        <MaterialCommunityIcons
          name={active ? activeIcon : icon}
          size={24}
          color={active ? FOREST : MUTED}
        />
      </View>
      <Text
        className="mt-0.5 text-[11px]"
        style={{ color: active ? FOREST : MUTED, fontWeight: active ? '700' : '500' }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function FarmerBottomNav({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}) {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 8);

  return (
    <View
      className="absolute bottom-0 left-0 right-0 flex-row rounded-t-3xl border-t border-[#EEE9DC] bg-white"
      style={{
        paddingBottom: bottom,
        height: 64 + bottom,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: -2 },
        elevation: 12,
      }}
    >
      <NavItem
        icon="home-outline"
        activeIcon="home"
        label="Home"
        active={active === 'home'}
        onPress={() => onChange('home')}
      />
      <NavItem
        icon="sprout-outline"
        activeIcon="sprout"
        label="My Crops"
        active={active === 'crops'}
        onPress={() => onChange('crops')}
      />

      {/* Center AI Doctor button */}
      <View className="flex-1 items-center">
        <TouchableOpacity
          onPress={() => onChange('scan')}
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

      <NavItem
        icon="robot-outline"
        activeIcon="robot"
        label="AI Adviser"
        active={active === 'adviser'}
        onPress={() => onChange('adviser')}
      />
      <NavItem
        icon="account-outline"
        activeIcon="account"
        label="Profile"
        active={active === 'profile'}
        onPress={() => onChange('profile')}
      />
    </View>
  );
}