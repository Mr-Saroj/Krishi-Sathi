import React, { useState } from 'react';
import { ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import BottomNav, { TabKey } from '../../src/farmer/components/FarmerBottomNav';
import FarmerTopbar from '../../src/farmer/components/FarmerTopbar';
import Home from './home'; // dashboard middle part (move it out of app/ if it shows as its own screen)
import MyCrops from './MyCrops';
import AiAdviser from './AiAdviser';
import Profile from './Profile';
import useKeyboardVisible from '../../src/farmer/hooks/useKeyboardVisible';

const FOREST = '#14532D';
const MUTED = '#5E7365';
const INK = '#1F2A24';
const CREAM = '#FBF8F1';

// Still a placeholder: AI Doctor (camera scan)
function Placeholder({
  icon,
  title,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
}) {
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 130 }}>
      <View className="flex-1 items-center justify-center px-8" style={{ minHeight: 400 }}>
        <MaterialCommunityIcons name={icon} size={56} color={FOREST} />
        <Text className="mt-3 text-[22px] font-extrabold" style={{ color: INK }}>
          {title}
        </Text>
        <Text className="mt-1 text-center text-[14px]" style={{ color: MUTED }}>
          This section is coming soon.
        </Text>
      </View>
    </ScrollView>
  );
}

// Keeps a screen mounted (so its state is not lost) and just hides it when inactive
function Screen({ show, children }: { show: boolean; children: React.ReactNode }) {
  return <View style={{ flex: 1, display: show ? 'flex' : 'none' }}>{children}</View>;
}

export default function FarmerDashboard() {
  const [tab, setTab] = useState<TabKey>('home'); // default = home
  const keyboardOpen = useKeyboardVisible();

  return (
    <View className="flex-1" style={{ backgroundColor: CREAM }}>
      <StatusBar barStyle="dark-content" backgroundColor={CREAM} />

      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {/* Constant top bar */}
        <FarmerTopbar onProfilePress={() => setTab('profile')} />

        {/* Only this middle part changes */}
        <View style={{ flex: 1 }}>
          <Screen show={tab === 'home'}>
            <Home onNavigate={setTab} />
          </Screen>
          <Screen show={tab === 'crops'}>
            <MyCrops />
          </Screen>
          <Screen show={tab === 'scan'}>
            <Placeholder icon="camera-outline" title="AI Doctor" />
          </Screen>
          <Screen show={tab === 'adviser'}>
            <AiAdviser />
          </Screen>
          <Screen show={tab === 'profile'}>
            <Profile />
          </Screen>
        </View>
      </SafeAreaView>

      {/* Constant bottom bar (hidden only while the keyboard is open in the chat) */}
      {!keyboardOpen && <BottomNav active={tab} onChange={setTab} />}
    </View>
  );
}