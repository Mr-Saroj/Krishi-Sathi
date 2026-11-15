import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';

/* ------------------------------------------------------------------ */
/* Design tokens (same as Home)                                        */
/* ------------------------------------------------------------------ */
const FOREST = '#14532D';
const FOREST_DEEP = '#0E3F22';
const MUTED = '#5E7365';
const MINT = '#EEF3EC';
const LINE = '#DCE6DE';
const TURMERIC = '#F5C542';
const SOFT_TEXT = '#B5CBBB';

const DAY_MS = 24 * 60 * 60 * 1000;

const cardShadow = {
  shadowColor: '#0E3F22',
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 4,
} as const;

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
export type CompletedOrder = {
  id: string;
  shopName: string;
  farmerName: string;
  village: string;
  income: number; // what the delivery partner earned for this order
  distanceKm: number;
  payment: 'Prepaid' | 'Cash on delivery';
  deliveredAt: number; // timestamp in ms (Date.now() style)
};

type Props = {
  /** Completed orders. The screen itself keeps only the last 24 hours. */
  orders?: CompletedOrder[];
  /** Pull-to-refresh: fetch fresh orders from your API */
  onRefresh?: () => Promise<void> | void;
  onOrderPress?: (order: CompletedOrder) => void;
};

/* ------------------------------------------------------------------ */
/* Demo data (replace with API data)                                   */
/* ------------------------------------------------------------------ */
const minsAgo = (m: number) => Date.now() - m * 60 * 1000;

const DEMO_ORDERS: CompletedOrder[] = [
  {
    id: 'ORD1024',
    shopName: 'Green Agro Store',
    farmerName: 'Bikash Nayak',
    village: 'Tangi, Khordha',
    income: 45,
    distanceKm: 4.5,
    payment: 'Cash on delivery',
    deliveredAt: minsAgo(35),
  },
  {
    id: 'ORD1021',
    shopName: 'Kisan Seeds & More',
    farmerName: 'Sushila Das',
    village: 'Jatni, Khordha',
    income: 60,
    distanceKm: 6.2,
    payment: 'Prepaid',
    deliveredAt: minsAgo(150),
  },
  {
    id: 'ORD1018',
    shopName: 'Green Agro Store',
    farmerName: 'Prasanna Sahoo',
    village: 'Balugaon, Khordha',
    income: 85,
    distanceKm: 9.8,
    payment: 'Prepaid',
    deliveredAt: minsAgo(60 * 6),
  },
  {
    id: 'ORD1015',
    shopName: 'Odisha Krishi Kendra',
    farmerName: 'Madhab Behera',
    village: 'Begunia, Khordha',
    income: 55,
    distanceKm: 5.4,
    payment: 'Cash on delivery',
    deliveredAt: minsAgo(60 * 15),
  },
  {
    id: 'ORD1009',
    shopName: 'Odisha Krishi Kendra',
    farmerName: 'Ratnakar Jena',
    village: 'Banapur, Khordha',
    income: 70,
    distanceKm: 8.1,
    payment: 'Prepaid',
    deliveredAt: minsAgo(60 * 23),
  },
  // Older than 24 hours: filtered out
  {
    id: 'ORD0990',
    shopName: 'Green Agro Store',
    farmerName: 'Lalita Mohanty',
    village: 'Tangi, Khordha',
    income: 50,
    distanceKm: 5,
    payment: 'Prepaid',
    deliveredAt: minsAgo(60 * 30),
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const rupees = (n: number) =>
  '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

function timeAgo(ts: number, now: number) {
  const mins = Math.max(0, Math.round((now - ts) / 60000));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem ? `${hrs} hr ${rem} min ago` : `${hrs} hr ago`;
}

function clock(ts: number, now: number) {
  const d = new Date(ts);
  const time = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  const sameDay = new Date(now).toDateString() === d.toDateString();
  return sameDay ? time : `Yesterday, ${time}`;
}

/* ------------------------------------------------------------------ */
/* Order row: income on the LEFT, details on the right                 */
/* ------------------------------------------------------------------ */
function OrderRow({
  order,
  now,
  onPress,
}: {
  order: CompletedOrder;
  now: number;
  onPress?: (o: CompletedOrder) => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress?.(order)}
      accessibilityRole="button"
      accessibilityLabel={`Order ${order.id}, earned ${order.income} rupees`}
      className="mb-3 flex-row overflow-hidden rounded-3xl bg-white"
      style={cardShadow}
    >
      {/* Income */}
      <View
        className="items-center justify-center px-3"
        style={{ width: 96, backgroundColor: FOREST }}
      >
        <Text className="text-[12px]" style={{ color: SOFT_TEXT }}>
          Earned
        </Text>
        <Text className="mt-0.5 text-[26px] font-extrabold" style={{ color: TURMERIC }}>
          {rupees(order.income)}
        </Text>
      </View>

      {/* Details */}
      <View className="flex-1 p-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-[15px] font-bold" style={{ color: FOREST }}>
            Order #{order.id}
          </Text>
          <View className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: MINT }}>
            <Text className="text-[11px] font-bold" style={{ color: FOREST }}>
              Delivered
            </Text>
          </View>
        </View>

        <View className="mt-3">
          <View className="flex-row items-center">
            <View
              className="mr-2 rounded-full bg-white"
              style={{ width: 9, height: 9, borderWidth: 2, borderColor: FOREST }}
            />
            <Text className="flex-1 text-[13px]" numberOfLines={1} style={{ color: MUTED }}>
              {order.shopName}
            </Text>
          </View>
          <View
            style={{
              width: 1.5,
              height: 8,
              marginLeft: 3.5,
              backgroundColor: '#C5D1C8',
            }}
          />
          <View className="flex-row items-center">
            <View
              className="mr-2 rounded-full"
              style={{ width: 9, height: 9, backgroundColor: TURMERIC }}
            />
            <Text
              className="flex-1 text-[13px] font-semibold"
              numberOfLines={1}
              style={{ color: FOREST }}
            >
              {order.farmerName}, {order.village}
            </Text>
          </View>
        </View>

        <View className="mt-3 flex-row items-center justify-between">
          <Text className="text-[12px]" style={{ color: MUTED }}>
            {clock(order.deliveredAt, now)} · {timeAgo(order.deliveredAt, now)}
          </Text>
        </View>
        <Text className="mt-0.5 text-[12px]" style={{ color: MUTED }}>
          {order.distanceKm} km · {order.payment}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */
export default function Orders({ orders = DEMO_ORDERS, onRefresh, onOrderPress }: Props) {
  const [now, setNow] = useState(Date.now());
  const [refreshing, setRefreshing] = useState(false);

  // Tick every minute so orders drop off after 24 hours and "x min ago" stays correct
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(t);
  }, []);

  const recent = useMemo(
    () =>
      orders
        .filter((o) => now - o.deliveredAt <= DAY_MS && o.deliveredAt <= now)
        .sort((a, b) => b.deliveredAt - a.deliveredAt),
    [orders, now]
  );

  const totalIncome = recent.reduce((sum, o) => sum + o.income, 0);
  const totalKm = recent.reduce((sum, o) => sum + o.distanceKm, 0);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefresh?.();
    } finally {
      setNow(Date.now());
      setRefreshing(false);
    }
  }, [onRefresh]);

  return (
    <FlatList
      data={recent}
      keyExtractor={(o) => o.id}
      renderItem={({ item }) => <OrderRow order={item} now={now} onPress={onOrderPress} />}
      style={{ backgroundColor: MINT }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={FOREST} />
      }
      ListHeaderComponent={
        <View className="mb-4">
          <Text className="text-[24px] font-extrabold" style={{ color: FOREST }}>
            Completed orders
          </Text>
          <Text className="mt-0.5 text-[13px]" style={{ color: MUTED }}>
            Deliveries from the last 24 hours
          </Text>

          <View
            className="mt-4 rounded-3xl p-5"
            style={{ backgroundColor: FOREST, ...cardShadow }}
          >
            <Text className="text-[14px]" style={{ color: SOFT_TEXT }}>
              Earned in the last 24 hours
            </Text>
            <Text className="mt-1 text-[40px] font-extrabold" style={{ color: TURMERIC }}>
              {rupees(totalIncome)}
            </Text>
            <View className="mt-4 flex-row" style={{ gap: 8 }}>
              {[
                { label: 'Orders', value: String(recent.length) },
                { label: 'Distance', value: `${totalKm.toFixed(1)} km` },
                {
                  label: 'Avg / order',
                  value: recent.length ? rupees(Math.round(totalIncome / recent.length)) : '₹0',
                },
              ].map((s) => (
                <View
                  key={s.label}
                  className="flex-1 items-center rounded-2xl py-3"
                  style={{ backgroundColor: FOREST_DEEP }}
                >
                  <Text className="text-[18px] font-bold text-white">{s.value}</Text>
                  <Text className="text-[12px]" style={{ color: SOFT_TEXT }}>
                    {s.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      }
      ListEmptyComponent={
        <View
          className="items-center rounded-3xl p-6"
          style={{ borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#9FB3A5' }}
        >
          <Text className="text-[16px] font-bold" style={{ color: FOREST }}>
            No completed orders yet
          </Text>
          <Text className="mt-1 text-center text-[14px]" style={{ color: MUTED }}>
            Orders you deliver in the next 24 hours will show up here with what you earned.
          </Text>
        </View>
      }
    />
  );
}