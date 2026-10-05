import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const FOREST = '#14532D';
const MUTED = '#5E7365';

const LOGO = require('../../../assets/dashboard_icon.png');

const LANGS = [
  { code: 'or', label: 'ଓଡ଼ିଆ' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'en', label: 'EN' },
];

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

type Props = {
  /** Optional: lift language state to the parent */
  lang?: string;
  onLangChange?: (code: string) => void;
  /** Called when the profile button is tapped (default: router.push('/profile')) */
  onProfilePress?: () => void;
};

export default function FarmerTopbar({ lang: langProp, onLangChange, onProfilePress }: Props) {
  const router = useRouter();
  const [internalLang, setInternalLang] = useState('or');
  const lang = langProp ?? internalLang;

  const changeLang = (code: string) => {
    setInternalLang(code);
    onLangChange?.(code);
  };

  return (
    <View className="flex-row items-center justify-between px-4 pb-2 pt-1">
      <View className="flex-row items-center">
        <Image source={LOGO} style={{ width: 40, height: 40 }} resizeMode="contain" />
        <View className="ml-2">
          <Text className="text-[18px] font-extrabold leading-5" style={{ color: FOREST }}>
            Krishi Sathi AI
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
                onPress={() => changeLang(l.code)}
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

        <View className="w-2" />
        <RoundIconButton
          icon="account"
          bg={FOREST}
          color="#FFFFFF"
          size={36}
          label="Profile"
          onPress={onProfilePress ?? (() => router.push('/profile' as any))}
        />
      </View>
    </View>
  );
}