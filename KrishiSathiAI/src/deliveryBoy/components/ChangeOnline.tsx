import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import useChangeOnline from '../hooks/useChangeOnline';


const FOREST = '#14532D';
const MUTED = '#5E7365';
const ONLINE_BG = '#DDF0DD';
const ONLINE_DOT = '#22A559';
const OFFLINE_BG = '#E3E9E4';
const OFFLINE_DOT = '#A8B3AB';
const RED = '#C9503C';

type Props = {
  /** Starting state (default offline, matching the database default) */
  initialOnline?: boolean;
  /** Called after the server confirms the new status */
  onChange?: (online: boolean) => void;
};

export default function ChangeOnline({ initialOnline = false, onChange }: Props) {
  const { online, loading, error, toggle } = useChangeOnline(initialOnline, onChange);

  return (
    <View>
      <TouchableOpacity
        onPress={toggle}
        disabled={loading}
        activeOpacity={0.85}
        accessibilityRole="switch"
        accessibilityLabel="Availability for delivery requests"
        accessibilityState={{ checked: online, busy: loading }}
        className="flex-row items-center justify-between rounded-full py-2.5 pl-4 pr-2.5"
        style={{ backgroundColor: online ? ONLINE_BG : OFFLINE_BG, opacity: loading ? 0.85 : 1 }}
      >
        <View className="flex-row items-center">
          <View
            className="mr-3 rounded-full"
            style={{
              width: 10,
              height: 10,
              backgroundColor: online ? ONLINE_DOT : OFFLINE_DOT,
            }}
          />
          <View>
            <Text className="text-[15px] font-bold" style={{ color: online ? FOREST : MUTED }}>
              {online ? "You're online" : "You're offline"}
            </Text>
            <Text className="text-[12px]" style={{ color: MUTED }}>
              {online ? 'Receiving delivery requests' : 'Go online to get requests'}
            </Text>
          </View>
        </View>

        {/* Switch track */}
        <View
          className="justify-center rounded-full"
          style={{
            width: 50,
            height: 28,
            padding: 3,
            backgroundColor: online ? FOREST : '#C2CBC5',
            alignItems: online ? 'flex-end' : 'flex-start',
          }}
        >
          <View
            className="items-center justify-center rounded-full bg-white"
            style={{ width: 22, height: 22 }}
          >
            {loading && <ActivityIndicator size="small" color={FOREST} style={{ transform: [{ scale: 0.6 }] }} />}
          </View>
        </View>
      </TouchableOpacity>

      {!!error && (
        <Text className="mt-2 px-3 text-[13px]" style={{ color: RED }} accessibilityRole="alert">
          {error}
        </Text>
      )}
    </View>
  );
}