
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import ChangeOnline from '../../src/deliveryBoy/components/ChangeOnline';
import OrderRequestCard from '../../src/deliveryBoy/components/OrderRequestCard';

import type {
  DeliveryItem,
  Order,
  Party,
} from '../../src/deliveryBoy/types/deliveryAssignment.types';

import useDeliveryAssignments from '../../src/deliveryBoy/hooks/useDeliveryAssignments';
import { deliveryAssignmentService } from '../../src/deliveryBoy/services/deliveryAssignmentService';

/* ------------------------------------------------------------------ */
/* Design tokens                                                       */
/* ------------------------------------------------------------------ */

const FOREST = '#14532D';
const FOREST_DEEP = '#0E3F22';
const MUTED = '#5E7365';
const MINT = '#EEF3EC';
const LINE = '#DCE6DE';
const TURMERIC = '#F5C542';
const TURMERIC_SOFT = '#FDF3D0';
const LEAF = '#7BE0A1';
const RED = '#C9503C';
const SOFT_TEXT = '#B5CBBB';

const DAILY_GOAL = 1200;
const PICKUP_OTP_LENGTH = 6;

const cardShadow = {
  shadowColor: '#0E3F22',
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 4,
} as const;

/**
 * Delivery flow:
 * new -> toShop -> pickupOtp -> toFarmer -> confirmDelivery -> delivered
 */
type Stage =
  | 'new'
  | 'toShop'
  | 'pickupOtp'
  | 'toFarmer'
  | 'confirmDelivery'
  | 'delivered'
  | 'waiting';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const rupees = (n: number) =>
  '₹' +
  n.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function todayLabel() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
}

function openMaps(address: string) {
  if (!address) return;

  Linking.openURL(
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
  );
}

function callNumber(phone: string) {
  if (!phone) return;

  Linking.openURL(`tel:${phone}`);
}

/* ------------------------------------------------------------------ */
/* Shared button                                                       */
/* ------------------------------------------------------------------ */

function PrimaryButton({
  label,
  onPress,
  tone = 'forest',
  disabled,
  flex,
}: {
  label: string;
  onPress: () => void;
  tone?: 'forest' | 'turmeric' | 'outline' | 'danger';
  disabled?: boolean;
  flex?: number;
}) {
  const bg =
    tone === 'forest'
      ? FOREST
      : tone === 'turmeric'
        ? TURMERIC
        : 'transparent';

  const border =
    tone === 'outline' ? FOREST : tone === 'danger' ? RED : 'transparent';

  const color =
    tone === 'forest' ? '#fff' : tone === 'danger' ? RED : FOREST;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="items-center rounded-2xl py-4"
      style={{
        flex: flex ?? 1,
        backgroundColor: bg,
        borderWidth: tone === 'outline' || tone === 'danger' ? 1.5 : 0,
        borderColor: border,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Text className="text-[15px] font-bold" style={{ color }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */

type Props = {
  onOnlineChange?: (online: boolean) => void;

  /** Override navigation. Default opens Google Maps. */
  onStartNavigation?: (order: Order, target: 'shop' | 'farmer') => void;

  onAccept?: (order: Order) => void;
  onReject?: (order: Order) => void;
  onExpire?: (order: Order) => void;

  onReachedShop?: (order: Order) => void;
  onReachedFarmer?: (order: Order) => void;
  onDelivered?: (order: Order) => void;
};

/* ------------------------------------------------------------------ */
/* Driver demo information                                             */
/* ------------------------------------------------------------------ */

const initialDriver = {
  name: 'Rahul',
  earnings: 850,
  delivered: 8,
  pending: 2,
  rating: 4.8,
};

/* ------------------------------------------------------------------ */
/* Progress tracker                                                    */
/* ------------------------------------------------------------------ */

const STEPS = [
  'Accept',
  'Reach shop',
  'Pickup OTP',
  'Reach farmer',
  'Complete delivery',
];

function stepsDone(stage: Stage) {
  switch (stage) {
    case 'toShop':
      return 1;
    case 'pickupOtp':
      return 2;
    case 'toFarmer':
      return 3;
    case 'confirmDelivery':
      return 4;
    case 'delivered':
      return 5;
    default:
      return 0;
  }
}

function Tracker({ stage }: { stage: Stage }) {
  const done = stepsDone(stage);

  return (
    <View className="mb-4 flex-row items-start">
      {STEPS.map((label, i) => {
        const isDone = i < done;
        const isCurrent = i === done;

        return (
          <View key={label} className="flex-1 items-center">
            <View className="w-full flex-row items-center">
              <View
                className="flex-1"
                style={{
                  height: 2,
                  backgroundColor:
                    i === 0 ? 'transparent' : i <= done ? FOREST : LINE,
                }}
              />

              <View
                className="items-center justify-center rounded-full"
                style={{
                  width: 24,
                  height: 24,
                  backgroundColor: isDone
                    ? FOREST
                    : isCurrent
                      ? TURMERIC
                      : '#fff',
                  borderWidth: 2,
                  borderColor: isDone ? FOREST : isCurrent ? TURMERIC : LINE,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '800',
                    color: isDone ? '#fff' : FOREST,
                  }}
                >
                  {isDone ? '✓' : i + 1}
                </Text>
              </View>

              <View
                className="flex-1"
                style={{
                  height: 2,
                  backgroundColor:
                    i === STEPS.length - 1
                      ? 'transparent'
                      : i < done
                        ? FOREST
                        : LINE,
                }}
              />
            </View>

            <Text
              className="mt-1 text-center text-[10px] font-semibold"
              style={{ color: isDone || isCurrent ? FOREST : MUTED }}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Instruction                                                         */
/* ------------------------------------------------------------------ */

function Instruction({ title, text }: { title: string; text: string }) {
  return (
    <View
      className="mb-4 rounded-2xl p-4"
      style={{ backgroundColor: TURMERIC_SOFT }}
    >
      <Text className="text-[12px] font-bold" style={{ color: MUTED }}>
        What to do now
      </Text>

      <Text
        className="mt-0.5 text-[16px] font-extrabold"
        style={{ color: FOREST }}
      >
        {title}
      </Text>

      <Text className="mt-1 text-[14px]" style={{ color: FOREST }}>
        {text}
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Destination                                                         */
/* ------------------------------------------------------------------ */

function Destination({
  label,
  party,
  onNavigate,
}: {
  label: string;
  party: Party;
  onNavigate: () => void;
}) {
  const hasAddress = !!party.address;
  const hasPhone = !!party.phone;

  return (
    <View
      className="mb-4 rounded-2xl p-4"
      style={{ borderWidth: 1, borderColor: LINE }}
    >
      <Text className="text-[12px]" style={{ color: MUTED }}>
        {label}
      </Text>

      <Text
        className="mt-0.5 text-[17px] font-bold"
        style={{ color: FOREST }}
      >
        {party.name || 'Name not available'}
      </Text>

      <Text className="mt-0.5 text-[14px]" style={{ color: MUTED }}>
        {hasAddress ? party.address : 'Address not available'}
      </Text>

      <View className="mt-3 flex-row" style={{ gap: 10 }}>
        <PrimaryButton
          label="Navigate"
          onPress={onNavigate}
          disabled={!hasAddress && !party.name}
        />

        <PrimaryButton
          label="Call"
          tone="outline"
          onPress={() => callNumber(party.phone)}
          disabled={!hasPhone}
        />
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Order items                                                         */
/* ------------------------------------------------------------------ */

function ItemsList({
  items,
  title,
}: {
  items: DeliveryItem[];
  title: string;
}) {
  return (
    <View className="mb-4 rounded-2xl p-4" style={{ backgroundColor: MINT }}>
      <Text className="mb-2 text-[13px] font-bold" style={{ color: FOREST }}>
        {title}
      </Text>

      {items.length === 0 ? (
        <Text className="text-[14px]" style={{ color: MUTED }}>
          Item details are not available. Check the order with the shop.
        </Text>
      ) : (
        items.map((it, index) => (
          <View
            key={`${it.name}-${index}`}
            className="flex-row justify-between py-1"
          >
            <Text className="text-[14px]" style={{ color: FOREST }}>
              {it.name}
            </Text>

            <Text
              className="text-[14px] font-semibold"
              style={{ color: MUTED }}
            >
              {it.qty}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* OTP input - shop pickup only                                        */
/* ------------------------------------------------------------------ */

function OtpInput({
  value,
  onChange,
  error,
  disabled,
  length,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
  disabled?: boolean;
  length: number;
}) {
  const ref = useRef<TextInput>(null);
  const activeIndex = Math.min(value.length, length - 1);

  return (
    <View>
      <Pressable
        onPress={() => ref.current?.focus()}
        className="flex-row justify-between"
        accessibilityLabel={`Enter ${length}-digit OTP`}
      >
        {Array.from({ length }).map((_, i) => {
          const focused = i === activeIndex && value.length < length;

          return (
            <View
              key={i}
              className="items-center justify-center rounded-2xl bg-white"
              style={{
                width: 48,
                height: 66,
                borderWidth: 2,
                borderColor: error ? RED : focused ? FOREST : LINE,
              }}
            >
              <Text
                className="text-[28px] font-extrabold"
                style={{ color: FOREST }}
              >
                {value[i] ?? ''}
              </Text>
            </View>
          );
        })}
      </Pressable>

      <TextInput
        ref={ref}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, length))}
        keyboardType="number-pad"
        maxLength={length}
        editable={!disabled}
        caretHidden
        style={{
          position: 'absolute',
          opacity: 0,
          width: 1,
          height: 1,
        }}
      />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* OTP panel - shop pickup only                                        */
/* ------------------------------------------------------------------ */

function OtpPanel({
  heading,
  hint,
  buttonLabel,
  onVerify,
  otpLength,
}: {
  heading: string;
  hint: string;
  buttonLabel: string;
  onVerify: (otp: string) => Promise<boolean>;
  otpLength: number;
}) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const submit = async () => {
    if (otp.length !== otpLength || loading) return;

    setLoading(true);
    setError('');

    try {
      const ok = await onVerify(otp);

      if (!ok) {
        setAttempts((a) => a + 1);
        setError('That OTP is incorrect. Check the number and try again.');
        setOtp('');
      }
    } catch (error: any) {
      console.log(
        'OTP VERIFICATION ERROR:',
        error?.response?.data || error?.message
      );

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Couldn't verify the OTP. Please try again.";

      setAttempts((a) => a + 1);
      setError(message);
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="mb-1">
      <Text className="text-[16px] font-bold" style={{ color: FOREST }}>
        {heading}
      </Text>

      <Text className="mb-3 mt-1 text-[13px]" style={{ color: MUTED }}>
        {hint}
      </Text>

      <OtpInput
        value={otp}
        onChange={(v) => {
          setOtp(v);
          if (error) setError('');
        }}
        error={!!error}
        disabled={loading}
        length={otpLength}
      />

      {!!error && (
        <Text
          className="mt-2 text-[13px] font-semibold"
          style={{ color: RED }}
        >
          {error}
        </Text>
      )}

      {attempts >= 3 && (
        <Text className="mt-1 text-[13px]" style={{ color: MUTED }}>
          Still not working? Ask the shop to check the OTP again.
        </Text>
      )}

      <View className="mt-4 flex-row">
        <PrimaryButton
          label={loading ? 'Verifying…' : buttonLabel}
          onPress={submit}
          disabled={otp.length !== otpLength || loading}
        />
      </View>
    </View>
  );
}

/* ================================================================== */
/* HOME SCREEN                                                         */
/* ================================================================== */

export default function Home({
  onOnlineChange,
  onStartNavigation,
  onAccept,
  onReject,
  onExpire,
  onReachedShop,
  onReachedFarmer,
  onDelivered,
}: Props) {
  /* Local screen state */

  const [online, setOnline] = useState(false);
  const [stage, setStage] = useState<Stage>('new');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [driver, setDriver] = useState(initialDriver);

  const [completionLoading, setCompletionLoading] = useState(false);
  const [completionError, setCompletionError] = useState('');

  const busy =
    stage === 'toShop' ||
    stage === 'pickupOtp' ||
    stage === 'toFarmer' ||
    stage === 'confirmDelivery';

  /* Delivery assignments */

  const {
    orders: pendingOrders,
    loading: assignmentsLoading,
    actionLoading,
    error: assignmentError,
    fetchPendingAssignments,
    acceptOrder,
    rejectOrder,
  } = useDeliveryAssignments({ enabled: online && !busy });

  const pendingOrder = pendingOrders[0];
  const order = activeOrder ?? pendingOrder;
  const hasPendingOrder = !!pendingOrder;

  /* Online / offline */

  const handleOnlineChange = (value: boolean) => {
    setOnline(value);

    if (value && !busy && stage !== 'delivered') {
      setStage('new');
    }

    onOnlineChange?.(value);
  };

  /* Navigation */

  const navigate = (target: 'shop' | 'farmer') => {
    if (!order) return;

    if (onStartNavigation) {
      onStartNavigation(order, target);
      return;
    }

    const party = target === 'shop' ? order.shop : order.farmer;
    openMaps(party.address || party.name);
  };

  /* Accept assignment */

  const handleAccept = async (selectedOrder: Order) => {
    const accepted = await acceptOrder(selectedOrder);

    if (!accepted) {
      throw new Error('Unable to accept this order. Please try again.');
    }

    setActiveOrder(selectedOrder);
    setStage('toShop');
    onAccept?.(selectedOrder);
  };

  /* Reject assignment */

  const handleReject = async (selectedOrder: Order) => {
    const rejected = await rejectOrder(selectedOrder);

    if (!rejected) {
      throw new Error('Unable to reject this order. Please try again.');
    }

    onReject?.(selectedOrder);
  };

  /* Assignment expired */

  const handleExpire = (expiredOrder: Order) => {
    onExpire?.(expiredOrder);
    void fetchPendingAssignments();
  };

  /* Delivery stage transitions */

  const reachedShop = () => {
    if (!activeOrder) return;

    setStage('pickupOtp');
    onReachedShop?.(activeOrder);
  };

  const reachedFarmer = () => {
    if (!activeOrder) return;

    setCompletionError('');
    setStage('confirmDelivery');
    onReachedFarmer?.(activeOrder);
  };

  /* -------------------------------------------------------------- */
  /* Pickup OTP verification - shop OTP only                        */
  /* -------------------------------------------------------------- */

  const handlePickupVerify = async (otp: string): Promise<boolean> => {
    if (!activeOrder) return false;

    try {
      const response = await deliveryAssignmentService.verifyPickupOtp(
        activeOrder.id,
        otp
      );

      console.log('PICKUP OTP API RESPONSE:', response);

      if (!response.success) {
        throw new Error(response.message || 'Incorrect pickup OTP');
      }

      setStage('toFarmer');
      return true;
    } catch (error: any) {
      console.log(
        'PICKUP OTP ERROR:',
        error.response?.data || error.message
      );

      throw new Error(
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        'Pickup OTP verification failed'
      );
    }
  };

  /* -------------------------------------------------------------- */
  /* Complete delivery - NO FARMER OTP                              */
  /* -------------------------------------------------------------- */

  const handleCompleteDelivery = async () => {
    if (!activeOrder || completionLoading) return;

    setCompletionLoading(true);
    setCompletionError('');

    try {
      const response = await deliveryAssignmentService.completeDelivery(
        activeOrder.id
      );

      console.log('DELIVERY COMPLETION API RESPONSE:', response);

      if (!response.success) {
        throw new Error(response.message || 'Unable to complete delivery');
      }

      // Update UI only after backend confirms completion.
      setStage('delivered');

      setDriver((d) => ({
        ...d,
        earnings: d.earnings + activeOrder.fee,
        delivered: d.delivered + 1,
        pending: Math.max(0, d.pending - 1),
      }));

      onDelivered?.(activeOrder);
    } catch (error: any) {
      console.log(
        'DELIVERY COMPLETION ERROR:',
        error.response?.data || error.message
      );

      setCompletionError(
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        'Unable to complete delivery. Please try again.'
      );
    } finally {
      setCompletionLoading(false);
    }
  };

  /* Find next order */

  const findNextOrder = async () => {
    setActiveOrder(null);
    setCompletionError('');
    setStage('waiting');
    await fetchPendingAssignments();
  };

  /* Dashboard calculations */

  const total = driver.delivered + driver.pending;

  const progress = total
    ? Math.round((driver.delivered / total) * 100)
    : 0;

  const goalPct = Math.min(
    100,
    Math.round((driver.earnings / DAILY_GOAL) * 100)
  );

  const sectionTitle = busy
    ? 'Current delivery'
    : stage === 'delivered'
      ? 'Delivery complete'
      : hasPendingOrder
        ? 'New delivery request'
        : 'Delivery requests';

  /* Screen */

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ backgroundColor: MINT }}
    >
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: MINT }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 140,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}

        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-[13px]" style={{ color: MUTED }}>
              {todayLabel()}
            </Text>

            <Text
              className="text-[24px] font-extrabold"
              style={{ color: FOREST }}
            >
              {greeting()}, {driver.name}
            </Text>
          </View>

          <View>
            <View
              className="items-center justify-center rounded-full"
              style={{ width: 48, height: 48, backgroundColor: FOREST }}
            >
              <Text
                className="text-[18px] font-bold"
                style={{ color: TURMERIC }}
              >
                {driver.name.charAt(0)}
              </Text>
            </View>

            <View
              className="absolute rounded-full"
              style={{
                right: 0,
                bottom: 0,
                width: 14,
                height: 14,
                borderWidth: 2,
                borderColor: MINT,
                backgroundColor: online ? '#22C55E' : '#9CA3AF',
              }}
            />
          </View>
        </View>

        {/* Online / offline switch */}

        <View className="mb-4">
          <ChangeOnline
            initialOnline={online}
            onChange={handleOnlineChange}
          />
        </View>

        {/* Earnings dashboard */}

        <View
          className="rounded-3xl p-5"
          style={{ backgroundColor: FOREST, ...cardShadow }}
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-[14px]" style={{ color: SOFT_TEXT }}>
              Today's earnings
            </Text>

            <View
              className="rounded-full px-3 py-1"
              style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
            >
              <Text className="text-[12px] font-semibold text-white">
                ★ {driver.rating} rating
              </Text>
            </View>
          </View>

          <Text
            className="mt-1 text-[44px] font-extrabold"
            style={{ color: TURMERIC }}
          >
            {rupees(driver.earnings)}
          </Text>

          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-[13px]" style={{ color: SOFT_TEXT }}>
              Daily goal ₹{DAILY_GOAL.toLocaleString('en-IN')}
            </Text>

            <Text className="text-[13px] font-bold" style={{ color: LEAF }}>
              {goalPct}%
            </Text>
          </View>

          <View
            className="mt-2 h-2 overflow-hidden rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <View
              className="h-full rounded-full"
              style={{ width: `${goalPct}%`, backgroundColor: TURMERIC }}
            />
          </View>

          <View className="mt-4 flex-row items-center justify-between">
            <Text className="text-[13px]" style={{ color: SOFT_TEXT }}>
              {driver.delivered} of {total} orders delivered
            </Text>

            <Text className="text-[13px] font-bold" style={{ color: LEAF }}>
              {progress}%
            </Text>
          </View>

          <View
            className="mt-2 h-2 overflow-hidden rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <View
              className="h-full rounded-full"
              style={{ width: `${progress}%`, backgroundColor: LEAF }}
            />
          </View>

          <View className="mt-5 flex-row" style={{ gap: 8 }}>
            {[
              { label: 'Delivered', value: driver.delivered },
              { label: 'Pending', value: driver.pending },
              { label: 'Total', value: total },
            ].map((s) => (
              <View
                key={s.label}
                className="flex-1 items-center rounded-2xl py-3"
                style={{ backgroundColor: FOREST_DEEP }}
              >
                <Text className="text-[24px] font-bold text-white">
                  {s.value}
                </Text>

                <Text className="text-[12px]" style={{ color: SOFT_TEXT }}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Section title */}

        <View className="mb-2 mt-6 flex-row items-center justify-between px-1">
          <Text className="text-[17px] font-bold" style={{ color: FOREST }}>
            {sectionTitle}
          </Text>

          {online && (
            <View className="flex-row items-center">
              <View
                className="mr-1.5 rounded-full"
                style={{ width: 8, height: 8, backgroundColor: '#22C55E' }}
              />

              <Text
                className="text-[12px] font-semibold"
                style={{ color: MUTED }}
              >
                Live
              </Text>
            </View>
          )}
        </View>

        {/* Offline */}

        {!online && !busy && stage !== 'delivered' && (
          <View
            className="items-center rounded-3xl p-6"
            style={{
              borderWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: '#9FB3A5',
            }}
          >
            <Text className="text-[16px] font-bold" style={{ color: FOREST }}>
              You're offline
            </Text>

            <Text
              className="mt-1 text-center text-[14px]"
              style={{ color: MUTED }}
            >
              Go online to start receiving delivery requests.
            </Text>
          </View>
        )}

        {/* Loading pending assignments */}

        {online && !busy && !hasPendingOrder && assignmentsLoading && (
          <View
            className="items-center rounded-3xl bg-white p-6"
            style={cardShadow}
          >
            <ActivityIndicator size="large" color={FOREST} />

            <Text className="mt-3 text-[14px]" style={{ color: MUTED }}>
              Loading delivery requests...
            </Text>
          </View>
        )}

        {/* Assignment API error */}

        {online && !busy && !!assignmentError && (
          <View
            className="mb-3 rounded-2xl bg-white p-4"
            style={{ borderWidth: 1, borderColor: '#F1C5BE' }}
          >
            <Text className="text-[14px] font-semibold" style={{ color: RED }}>
              {assignmentError}
            </Text>

            <TouchableOpacity
              onPress={() => void fetchPendingAssignments()}
              className="mt-3 self-start rounded-xl px-4 py-2"
              style={{ backgroundColor: MINT }}
            >
              <Text
                className="text-[13px] font-bold"
                style={{ color: FOREST }}
              >
                Try again
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* New request from backend */}

        {online &&
          !busy &&
          pendingOrder &&
          (stage === 'new' || stage === 'waiting') && (
            <OrderRequestCard
              key={pendingOrder.id}
              order={pendingOrder}
              onAccept={handleAccept}
              onReject={handleReject}
              onExpire={handleExpire}
              isAccepting={actionLoading === pendingOrder.id}
              isRejecting={actionLoading === pendingOrder.id}
            />
          )}

        {/* No pending assignments */}

        {online &&
          !busy &&
          !hasPendingOrder &&
          !assignmentsLoading &&
          stage !== 'delivered' && (
            <View
              className="items-center rounded-3xl p-6"
              style={{
                borderWidth: 1.5,
                borderStyle: 'dashed',
                borderColor: '#9FB3A5',
              }}
            >
              <Text
                className="text-[16px] font-bold"
                style={{ color: FOREST }}
              >
                Waiting for the next order
              </Text>

              <Text
                className="mt-1 text-center text-[14px]"
                style={{ color: MUTED }}
              >
                Stay online. New delivery requests will appear here.
              </Text>
            </View>
          )}

        {/* Active delivery */}

        {busy && activeOrder && (
          <View className="rounded-3xl bg-white p-5" style={cardShadow}>
            <View className="mb-4 flex-row items-center justify-between">
              <View>
                <Text
                  className="text-[16px] font-bold"
                  style={{ color: FOREST }}
                >
                  Order #{activeOrder.id}
                </Text>

                <Text className="text-[12px]" style={{ color: MUTED }}>
                  {activeOrder.payment}
                  {activeOrder.distanceKm > 0
                    ? ` • ${activeOrder.distanceKm} km`
                    : ''}
                  {activeOrder.etaMin > 0
                    ? ` • ${activeOrder.etaMin} min`
                    : ''}
                </Text>
              </View>

              <Text
                className="text-[22px] font-extrabold"
                style={{ color: FOREST }}
              >
                ₹{activeOrder.fee}
              </Text>
            </View>

            <Tracker stage={stage} />

            {/* Go to shop */}

            {stage === 'toShop' && (
              <>
                <Instruction
                  title="Go to the shop"
                  text={`Drive to ${activeOrder.shop.name} to collect the order. Tap “I've reached the shop” when you arrive.`}
                />

                <Destination
                  label="Assigned shop"
                  party={activeOrder.shop}
                  onNavigate={() => navigate('shop')}
                />

                <View className="flex-row">
                  <PrimaryButton
                    label="I've reached the shop"
                    tone="turmeric"
                    onPress={reachedShop}
                  />
                </View>
              </>
            )}

            {/* Shop pickup OTP */}

            {stage === 'pickupOtp' && (
              <>
                <Instruction
                  title="Verify the order with the shop OTP"
                  text="Check that all items are packed, then ask the shop for the 6-digit pickup OTP and enter it below."
                />

                <ItemsList
                  items={activeOrder.items}
                  title="Check these items before you leave"
                />

                <OtpPanel
                  heading="Shop pickup OTP"
                  hint={`Ask ${activeOrder.shop.name} for the 6-digit OTP shown in their app.`}
                  buttonLabel="Verify and pick up"
                  onVerify={handlePickupVerify}
                  otpLength={PICKUP_OTP_LENGTH}
                />
              </>
            )}

            {/* Go to farmer */}

            {stage === 'toFarmer' && (
              <>
                <Instruction
                  title="Take the order to the farmer"
                  text="The shop pickup OTP has been verified. Navigate to the farmer's address and hand over the order."
                />

                <Destination
                  label="Deliver to"
                  party={activeOrder.farmer}
                  onNavigate={() => navigate('farmer')}
                />

                <View className="flex-row">
                  <PrimaryButton
                    label="I've reached the farmer"
                    tone="turmeric"
                    onPress={reachedFarmer}
                  />
                </View>
              </>
            )}

            {/* Complete delivery - no farmer OTP */}

            {stage === 'confirmDelivery' && (
              <>
                <Instruction
                  title="Complete the delivery"
                  text={
                    activeOrder.payment === 'Cash on delivery'
                      ? 'Hand over all items to the farmer and collect the cash payment. Then tap Mark as Complete.'
                      : 'Hand over all items to the farmer. Once the delivery is complete, tap Mark as Complete.'
                  }
                />

                <ItemsList
                  items={activeOrder.items}
                  title="Items to hand over"
                />

                <Destination
                  label="Delivery destination"
                  party={activeOrder.farmer}
                  onNavigate={() => navigate('farmer')}
                />

                {!!completionError && (
                  <Text
                    className="mb-3 text-[13px] font-semibold"
                    style={{ color: RED }}
                  >
                    {completionError}
                  </Text>
                )}

                <View className="flex-row">
                  <PrimaryButton
                    label={
                      completionLoading
                        ? 'Completing delivery...'
                        : 'Mark as Complete'
                    }
                    tone="turmeric"
                    onPress={handleCompleteDelivery}
                    disabled={completionLoading}
                  />
                </View>

                {completionLoading && (
                  <View className="mt-3 flex-row items-center justify-center">
                    <ActivityIndicator size="small" color={FOREST} />
                    <Text className="ml-2 text-[12px]" style={{ color: MUTED }}>
                      Updating order status...
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        )}

        {/* Delivered */}

        {stage === 'delivered' && activeOrder && (
          <View
            className="items-center rounded-3xl bg-white p-6"
            style={cardShadow}
          >
            <View
              className="items-center justify-center rounded-full"
              style={{ width: 56, height: 56, backgroundColor: FOREST }}
            >
              <Text style={{ color: '#fff', fontSize: 26, fontWeight: '800' }}>
                ✓
              </Text>
            </View>

            <Text
              className="mt-3 text-[20px] font-extrabold"
              style={{ color: FOREST }}
            >
              Delivery complete
            </Text>

            <Text
              className="mt-1 text-center text-[14px]"
              style={{ color: MUTED }}
            >
              The order has been marked as delivered successfully. You earned ₹
              {activeOrder.fee} for order #{activeOrder.id}.
            </Text>

            <View className="mt-5 w-full flex-row">
              <PrimaryButton
                label="Find next order"
                onPress={findNextOrder}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
