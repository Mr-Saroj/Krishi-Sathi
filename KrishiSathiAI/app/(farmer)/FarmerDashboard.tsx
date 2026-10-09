import React, { useEffect, useState } from 'react';
import { BackHandler, StatusBar, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BottomNav, { TabKey } from '../../src/farmer/components/FarmerBottomNav';
import FarmerTopbar from '../../src/farmer/components/FarmerTopbar';
import AiDoctorScanner from './AiDoctorScanner';
import Home from './home'; // dashboard middle part (move it out of app/ if it shows as its own screen)
import MyCrops from './MyCrops';
import AiAdviser from './AiAdviser';
import Profile from './Profile';
import useKeyboardVisible from '../../src/farmer/hooks/useKeyboardVisible';

const CREAM = '#FBF8F1';

// Keeps a screen mounted (so its state is not lost) and just hides it when inactive
function Screen({ show, children }: { show: boolean; children: React.ReactNode }) {
  return <View style={{ flex: 1, display: show ? 'flex' : 'none' }}>{children}</View>;
}

export default function FarmerDashboard() {
  const [tab, setTab] = useState<TabKey>('home'); // default = home
  const keyboardOpen = useKeyboardVisible();
  const scanning = tab === 'scan';

  // Android back button closes the scanner instead of leaving the app
  useEffect(() => {
    if (!scanning) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setTab('home');
      return true;
    });
    return () => sub.remove();
  }, [scanning]);

  return (
    <View className="flex-1" style={{ backgroundColor: CREAM }}>
      <StatusBar
        barStyle={scanning ? 'light-content' : 'dark-content'}
        backgroundColor={scanning ? '#000000' : CREAM}
      />

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
          <Screen show={tab === 'adviser'}>
            <AiAdviser />
          </Screen>
          <Screen show={tab === 'profile'}>
            <Profile />
          </Screen>
        </View>
      </SafeAreaView>

      {/* AI Doctor scanner: full screen, mounted only while open so the camera stops when closed */}
      {scanning && (
        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 50 }}>
          <AiDoctorScanner onClose={() => setTab('home')} />
        </View>
      )}

      {/* Constant bottom bar (hidden while the keyboard is open or the scanner is showing) */}
      {!keyboardOpen && !scanning && <BottomNav active={tab} onChange={setTab} />}
    </View>
  );
}