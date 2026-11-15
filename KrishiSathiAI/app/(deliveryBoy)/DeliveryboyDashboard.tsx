import React, { useEffect, useState } from 'react';
import { BackHandler, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';



import useKeyboardVisible from '../../src/farmer/hooks/useKeyboardVisible';
import Home from './home';
import DeliveryboyTopbar from '../../src/deliveryBoy/components/DeliveryboyTopbar';
import DeliveryboyBottomNav from '../../src/deliveryBoy/components/DeliveryboyBottomNav';
import Orders from './orders';
import Profile from './profile';
import Earnings from './earnings';

const BG = '#EEF3EC';
type TabKey = 'home' | 'orders' | 'map' | 'earnings' | 'profile';

// Keeps a screen mounted (so its state is not lost) and just hides it when inactive
function Screen({ show, children }: { show: boolean; children: React.ReactNode }) {
    return <View style={{ flex: 1, display: show ? 'flex' : 'none' }}>{children}</View>;
}

// Temporary placeholder until you build each screen
function Placeholder({ title }: { title: string }) {
    return (
        <View className="flex-1 items-center justify-center">
            <Text className="text-[18px] font-bold" style={{ color: '#14532D' }}>
                {title}
            </Text>
        </View>
    );
}

export default function DeliveryboyDashboard() {
    const [tab, setTab] = useState<TabKey>('home'); // default = home
    const keyboardOpen = useKeyboardVisible();

    // Android back button returns to Home instead of leaving the app
    useEffect(() => {
        if (tab === 'home') return;
        const sub = BackHandler.addEventListener('hardwareBackPress', () => {
            setTab('home');
            return true;
        });
        return () => sub.remove();
    }, [tab]);

    return (
        <View className="flex-1" style={{ backgroundColor: BG }}>
            <StatusBar barStyle="dark-content" backgroundColor={BG} />

            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                {/* Constant top bar */}
                <DeliveryboyTopbar onProfilePress={() => setTab('profile')} />

                {/* Only this middle part changes */}
                <View style={{ flex: 1 }}>
                    <Screen show={tab === 'home'}>
                        <Home onStartNavigation={() => setTab('map')} />
                    </Screen>
                    <Screen show={tab === 'orders'}>
                        <Orders/>
                    </Screen>
                    <Screen show={tab === 'map'}>
                        <Placeholder title="Map" />
                    </Screen>
                    <Screen show={tab === 'earnings'}>
                        <Earnings/>
                    </Screen>
                    <Screen show={tab === 'profile'}>
                       <Profile/>
                    </Screen>
                </View>
            </SafeAreaView>

            {/* Bottom nav: absolutely positioned, so it must be rendered here, outside SafeAreaView */}
            {!keyboardOpen && (
                <DeliveryboyBottomNav active={tab} onChange={setTab} pendingOrders={2} />
            )}
        </View>
    );
}