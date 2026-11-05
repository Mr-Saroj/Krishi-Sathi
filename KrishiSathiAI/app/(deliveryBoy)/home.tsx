import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import ChangeOnline from '../../src/deliveryBoy/components/ChangeOnline';

const FOREST = '#14532D';
const MUTED = '#5E7365';
const MINT = '#EEF3EC';
const TURMERIC = '#F5C542';
const RED = '#C9503C';

type Order = {
  id: string;
  pickup: string;
  delivery: string;
  fee: number;
  distanceKm: number;
};

type RequestState = 'new' | 'accepted' | 'rejected';

const driver = {
  name: 'Rahul',
  earnings: 850,
  delivered: 8,
  pending: 2,
};

const incoming: Order = {
  id: 'ORD1025',
  pickup: 'Green Agro Store',
  delivery: 'Khordha, Odisha',
  fee: 45,
  distanceKm: 4.5,
};

const rupees = (n: number) =>
  '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

type Props = {
  /** Optional: be told when the online status changes (after the server confirms it) */
  onOnlineChange?: (online: boolean) => void;
  onStartNavigation?: (order: Order) => void;
};

export default function Home({ onOnlineChange, onStartNavigation }: Props) {
  const [online, setOnline] = useState(false);
  const [status, setStatus] = useState<RequestState>('new');

  const handleOnlineChange = (value: boolean) => {
    setOnline(value);
    onOnlineChange?.(value);
  };

  const total = driver.delivered + driver.pending;
  const progress = Math.round((driver.delivered / total) * 100);

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: MINT }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Greeting */}
      <Text className="mb-4 text-[22px] font-bold" style={{ color: FOREST }}>
        {greeting()}, {driver.name} 👋
      </Text>

      {/* Online / offline switch */}
      <View className="mb-4">
        <ChangeOnline initialOnline={online} onChange={handleOnlineChange} />
      </View>

      {/* Earnings */}
      <View className="rounded-3xl p-5" style={{ backgroundColor: FOREST }}>
        <Text className="text-[14px]" style={{ color: '#B5CBBB' }}>
          Today's earnings
        </Text>
        <Text className="mt-1 text-[44px] font-extrabold" style={{ color: TURMERIC }}>
          {rupees(driver.earnings)}
        </Text>

        <View
          className="mt-4 h-2 overflow-hidden rounded-full"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
        >
          <View
            className="h-full rounded-full"
            style={{ width: `${progress}%`, backgroundColor: '#7BE0A1' }}
          />
        </View>
        <Text className="mt-2 text-[13px]" style={{ color: '#B5CBBB' }}>
          {driver.delivered} of {total} orders delivered
        </Text>

        <View className="mt-4 flex-row" style={{ gap: 8 }}>
          {[
            { label: 'Delivered', value: driver.delivered },
            { label: 'Pending', value: driver.pending },
            { label: 'Total', value: total },
          ].map((s) => (
            <View
              key={s.label}
              className="flex-1 items-center rounded-2xl py-3"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            >
              <Text className="text-[24px] font-bold text-white">{s.value}</Text>
              <Text className="text-[12px]" style={{ color: '#B5CBBB' }}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Delivery request */}
      <Text className="mb-2 mt-6 px-1 text-[16px] font-bold" style={{ color: FOREST }}>
        New delivery request
      </Text>

      {!online && (
        <View
          className="items-center rounded-3xl p-6"
          style={{ borderWidth: 1, borderStyle: 'dashed', borderColor: '#9FB3A5' }}
        >
          <Text className="text-center text-[14px]" style={{ color: MUTED }}>
            You're offline. Go online to receive delivery requests.
          </Text>
        </View>
      )}

      {online && status === 'new' && (
        <View
          className="rounded-3xl bg-white p-5"
          style={{
            shadowColor: '#000',
            shadowOpacity: 0.06,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
          }}
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-[16px] font-bold" style={{ color: FOREST }}>
              Order #{incoming.id}
            </Text>
            <View className="rounded-full px-3 py-0.5" style={{ backgroundColor: TURMERIC }}>
              <Text className="text-[12px] font-bold" style={{ color: FOREST }}>
                New
              </Text>
            </View>
          </View>

          {/* Route */}
          <View className="mt-4">
            <View className="flex-row">
              <View className="items-center" style={{ width: 16 }}>
                <View
                  className="mt-1 rounded-full bg-white"
                  style={{ width: 12, height: 12, borderWidth: 2, borderColor: FOREST }}
                />
                <View className="flex-1" style={{ width: 1, backgroundColor: '#C5D1C8' }} />
              </View>
              <View className="ml-3 pb-5">
                <Text className="text-[12px]" style={{ color: MUTED }}>
                  Pickup
                </Text>
                <Text className="text-[15px] font-semibold" style={{ color: FOREST }}>
                  {incoming.pickup}
                </Text>
              </View>
            </View>
            <View className="flex-row">
              <View className="items-center" style={{ width: 16 }}>
                <View
                  className="mt-1 rounded-full"
                  style={{ width: 12, height: 12, backgroundColor: FOREST }}
                />
              </View>
              <View className="ml-3">
                <Text className="text-[12px]" style={{ color: MUTED }}>
                  Delivery
                </Text>
                <Text className="text-[15px] font-semibold" style={{ color: FOREST }}>
                  {incoming.delivery}
                </Text>
              </View>
            </View>
          </View>

          <View
            className="mt-5 flex-row items-center justify-between rounded-2xl px-4 py-3"
            style={{ backgroundColor: MINT }}
          >
            <View>
              <Text className="text-[12px]" style={{ color: MUTED }}>
                Delivery fee
              </Text>
              <Text className="text-[24px] font-extrabold" style={{ color: FOREST }}>
                ₹{incoming.fee}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-[12px]" style={{ color: MUTED }}>
                Distance
              </Text>
              <Text className="text-[24px] font-extrabold" style={{ color: FOREST }}>
                {incoming.distanceKm} km
              </Text>
            </View>
          </View>

          <View className="mt-4 flex-row" style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={() => setStatus('rejected')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Reject order"
              className="flex-1 items-center rounded-2xl py-3"
              style={{ borderWidth: 1.5, borderColor: RED }}
            >
              <Text className="text-[15px] font-bold" style={{ color: RED }}>
                Reject
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setStatus('accepted')}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Accept order"
              className="flex-1 items-center rounded-2xl py-3"
              style={{ backgroundColor: FOREST }}
            >
              <Text className="text-[15px] font-bold text-white">Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {online && status === 'accepted' && (
        <View className="rounded-3xl bg-white p-5">
          <Text className="text-[16px] font-bold" style={{ color: FOREST }}>
            Order #{incoming.id} accepted
          </Text>
          <Text className="mt-1 text-[14px]" style={{ color: MUTED }}>
            Head to {incoming.pickup} to pick up the order.
          </Text>
          <TouchableOpacity
            onPress={() => onStartNavigation?.(incoming)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Start navigation"
            className="mt-4 items-center rounded-2xl py-3"
            style={{ backgroundColor: FOREST }}
          >
            <Text className="text-[15px] font-bold text-white">Start navigation</Text>
          </TouchableOpacity>
        </View>
      )}

      {online && status === 'rejected' && (
        <View
          className="items-center rounded-3xl p-6"
          style={{ borderWidth: 1, borderStyle: 'dashed', borderColor: '#9FB3A5' }}
        >
          <Text className="text-center text-[14px]" style={{ color: MUTED }}>
            Order #{incoming.id} rejected. We'll show you the next request when it arrives.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}