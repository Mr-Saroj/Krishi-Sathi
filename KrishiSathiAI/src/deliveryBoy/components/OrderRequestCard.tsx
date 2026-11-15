
import React, { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import PickupOtpVerification from './PickupOtpVerification';

/* ------------------------------------------------------------------ */
/* Design tokens                                                       */
/* ------------------------------------------------------------------ */

const FOREST = '#14532D';
const MUTED = '#5E7365';
const MINT = '#EEF3EC';
const LINE = '#DCE6DE';
const TURMERIC = '#F5C542';
const RED = '#C9503C';

const REQUEST_SECONDS = 60;
const URGENT_SECONDS = 8;

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

export type Party = {
  name: string;
  phone: string;
  address: string;
};

export type Order = {
  id: string;
  shop: Party;
  farmer: Party;
  items: {
    name: string;
    qty: string;
  }[];
  fee: number;
  distanceKm: number;
  etaMin: number;
  payment: 'Prepaid' | 'Cash on delivery';
  expiresAt: string;
};

type Status = 'pending' | 'accepted' | 'rejected' | 'expired' | 'out_for_delivery';

type Props = {
  order: Order;

  onAccept: (order: Order) => Promise<void> | void;
  onReject?: (order: Order) => Promise<void> | void;
  onExpire?: (order: Order) => void;

  // Called after successful pickup OTP verification.
  onPickupVerified?: (order: Order) => void;

  isAccepting?: boolean;
  isRejecting?: boolean;
};

/* ------------------------------------------------------------------ */
/* Utils                                                               */
/* ------------------------------------------------------------------ */

function getDeliveryArea(order: Order) {
  return order.farmer.address.split(',').slice(1).join(',').trim();
}

const ACCEPT_STEPS = [
  'Go to the assigned shop',
  'Take the order and enter the OTP the shop gives you',
  'Go to the farmer’s address',
  'Hand over the order and enter the OTP the farmer gives you',
];

/* ------------------------------------------------------------------ */
/* Hook: Countdown based on backend expiry                             */
/* ------------------------------------------------------------------ */

function useRequestCountdown({
  expiresAt,
  active,
  onExpire,
}: {
  expiresAt: string;
  active: boolean;
  onExpire: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());

  const onExpireRef = useRef(onExpire);
  const firedRef = useRef(false);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const expiryTime = new Date(expiresAt).getTime();
  const validExpiry = Number.isFinite(expiryTime);

  const secondsLeft = validExpiry
    ? Math.max(0, Math.ceil((expiryTime - now) / 1000))
    : 0;

  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [active]);

  useEffect(() => {
    if (!active || !validExpiry || secondsLeft > 0) return;

    if (!firedRef.current) {
      firedRef.current = true;
      onExpireRef.current();
    }
  }, [active, secondsLeft, validExpiry]);

  useEffect(() => {
    firedRef.current = false;
    setNow(Date.now());
  }, [expiresAt]);

  const percent = Math.min(
    100,
    Math.max(0, (secondsLeft / REQUEST_SECONDS) * 100),
  );

  return {
    secondsLeft,
    percent,
    isUrgent: secondsLeft <= URGENT_SECONDS,
  };
}

/* ------------------------------------------------------------------ */
/* Small components                                                    */
/* ------------------------------------------------------------------ */

function Chip({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View
      className="flex-1 rounded-2xl px-3 py-3"
      style={{ backgroundColor: MINT }}
    >
      <Text className="text-[12px]" style={{ color: MUTED }}>
        {label}
      </Text>

      <Text
        className="mt-0.5 text-[20px] font-extrabold"
        style={{ color: FOREST }}
      >
        {value}
      </Text>
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  danger,
  flex = 1,
  disabled = false,
  loading = false,
}: {
  label: string;
  onPress: () => void;
  danger?: boolean;
  flex?: number;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={loading ? 'Please wait' : label}
      className="items-center rounded-2xl py-4"
      style={{
        flex,
        opacity: disabled || loading ? 0.5 : 1,
        backgroundColor: danger ? 'transparent' : FOREST,
        borderWidth: danger ? 1.5 : 0,
        borderColor: danger ? RED : 'transparent',
      }}
    >
      <Text
        className="text-[15px] font-bold"
        style={{ color: danger ? RED : '#fff' }}
      >
        {loading ? 'Please wait...' : label}
      </Text>
    </TouchableOpacity>
  );
}

function RouteLine({
  pickup,
  delivery,
}: {
  pickup: string;
  delivery: string;
}) {
  return (
    <View>
      <View className="flex-row">
        <View className="items-center" style={{ width: 16 }}>
          <View
            className="mt-1 rounded-full bg-white"
            style={{
              width: 12,
              height: 12,
              borderWidth: 2,
              borderColor: FOREST,
            }}
          />

          <View
            className="flex-1"
            style={{
              width: 1.5,
              backgroundColor: '#C5D1C8',
            }}
          />
        </View>

        <View className="ml-3 flex-1 pb-5">
          <Text className="text-[12px]" style={{ color: MUTED }}>
            Pickup shop
          </Text>

          <Text
            className="text-[16px] font-semibold"
            style={{ color: FOREST }}
          >
            {pickup}
          </Text>
        </View>
      </View>

      <View className="flex-row">
        <View className="items-center" style={{ width: 16 }}>
          <View
            className="mt-1 rounded-full"
            style={{
              width: 12,
              height: 12,
              backgroundColor: TURMERIC,
            }}
          />
        </View>

        <View className="ml-3 flex-1">
          <Text className="text-[12px]" style={{ color: MUTED }}>
            Deliver to
          </Text>

          <Text
            className="text-[16px] font-semibold"
            style={{ color: FOREST }}
          >
            {delivery}
          </Text>
        </View>
      </View>
    </View>
  );
}

function ClosedState({
  order,
  status,
}: {
  order: Order;
  status: 'rejected' | 'expired';
}) {
  return (
    <View
      className="items-center rounded-3xl p-6"
      style={{
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: '#9FB3A5',
      }}
    >
      <Text className="text-[16px] font-bold" style={{ color: FOREST }}>
        {status === 'rejected' ? 'Order rejected' : 'Request timed out'}
      </Text>

      <Text className="mt-1 text-center text-[14px]" style={{ color: MUTED }}>
        Order #{order.id}{' '}
        {status === 'rejected'
          ? 'was rejected'
          : 'was not accepted in time'}.
        {' '}We'll show you the next request when it arrives.
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Main card                                                           */
/* ------------------------------------------------------------------ */

export default function OrderRequestCard({
  order,
  onAccept,
  onReject,
  onExpire,
  onPickupVerified,
  isAccepting = false,
  isRejecting = false,
}: Props) {
  const [status, setStatus] = useState<Status>('pending');
  const [actionError, setActionError] = useState<string | null>(null);

  const actionInProgress = isAccepting || isRejecting;

  /* ------------------------ Expiration ----------------------------- */

  const handleExpire = () => {
    setStatus('expired');
    onExpire?.(order);
  };

  const {
    secondsLeft,
    percent,
    isUrgent,
  } = useRequestCountdown({
    expiresAt: order.expiresAt,
    active: status === 'pending',
    onExpire: handleExpire,
  });

  /* ------------------------ Reject API ----------------------------- */

  const handleReject = async () => {
    if (actionInProgress || status !== 'pending') return;

    setActionError(null);

    if (secondsLeft <= 0) {
      handleExpire();
      return;
    }

    try {
      await onReject?.(order);
      setStatus('rejected');
    } catch (error) {
      console.error('Reject assignment failed:', error);
      setActionError('Unable to reject this order. Please try again.');
    }
  };

  /* ------------------------ Accept API ----------------------------- */

  const handleAccept = async () => {
    if (actionInProgress || status !== 'pending') return;

    if (secondsLeft <= 0) {
      handleExpire();
      return;
    }

    setActionError(null);

    try {
      await onAccept(order);

      // Show pickup OTP verification after successful acceptance.
      setStatus('accepted');
    } catch (error) {
      console.error('Accept assignment failed:', error);
      setActionError('Unable to accept this order. Please try again.');
    }
  };

  /* ------------------------ OTP verified --------------------------- */

  const handlePickupVerified = (orderId: string) => {
    if (orderId !== order.id) return;

    setStatus('out_for_delivery');
    onPickupVerified?.(order);
  };

  const timerColor = isUrgent ? RED : FOREST;

  /* ------------------------ Rejected / Expired --------------------- */

  if (status === 'rejected' || status === 'expired') {
    return <ClosedState order={order} status={status} />;
  }

  /* ------------------------ Out for delivery ----------------------- */

  if (status === 'out_for_delivery') {
    return (
      <View
        className="rounded-3xl bg-white p-5"
        style={cardShadow}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-[16px] font-bold" style={{ color: FOREST }}>
            Order #{order.id}
          </Text>

          <View
            className="rounded-full px-3 py-1"
            style={{ backgroundColor: MINT }}
          >
            <Text className="text-[12px] font-bold" style={{ color: FOREST }}>
              Out for delivery
            </Text>
          </View>
        </View>

        <Text className="mt-3 text-[14px]" style={{ color: MUTED }}>
          Pickup OTP verified successfully. You can now deliver this order to
          the farmer.
        </Text>

        <View className="mt-4">
          <RouteLine
            pickup={order.shop.name}
            delivery={order.farmer.address}
          />
        </View>
      </View>
    );
  }

  /* ------------------------ Accepted: Pickup OTP ------------------- */

  if (status === 'accepted') {
    return (
      <View
        className="rounded-3xl bg-white p-5"
        style={cardShadow}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-[16px] font-bold" style={{ color: FOREST }}>
            Order #{order.id}
          </Text>

          <View
            className="rounded-full px-3 py-1"
            style={{ backgroundColor: MINT }}
          >
            <Text className="text-[12px] font-bold" style={{ color: FOREST }}>
              Accepted
            </Text>
          </View>
        </View>

        <View className="mt-4">
          <RouteLine
            pickup={order.shop.name}
            delivery={order.farmer.address}
          />
        </View>

        <View className="mt-4">
          <PickupOtpVerification
            orderId={order.id}
            onVerified={handlePickupVerified}
          />
        </View>
      </View>
    );
  }

  /* ------------------------ Pending request ------------------------ */

  return (
    <View
      className="overflow-hidden rounded-3xl bg-white"
      style={cardShadow}
    >
      {/* Countdown bar */}

      <View style={{ height: 5, backgroundColor: LINE }}>
        <View
          style={{
            height: 5,
            width: `${percent}%`,
            backgroundColor: timerColor,
          }}
        />
      </View>

      <View className="p-5">
        {/* Title + timer */}

        <View className="flex-row items-center justify-between">
          <Text className="text-[16px] font-bold" style={{ color: FOREST }}>
            Order #{order.id}
          </Text>

          <View className="flex-row items-center" style={{ gap: 8 }}>
            <Text
              className="text-[13px] font-bold"
              style={{ color: timerColor }}
            >
              {secondsLeft}s
            </Text>

            <View
              className="rounded-full px-3 py-0.5"
              style={{ backgroundColor: TURMERIC }}
            >
              <Text
                className="text-[12px] font-bold"
                style={{ color: FOREST }}
              >
                New
              </Text>
            </View>
          </View>
        </View>

        {/* Route */}

        <View className="mt-4">
          <RouteLine
            pickup={order.shop.name}
            delivery={getDeliveryArea(order)}
          />
        </View>

        {/* Fee / distance / time */}

        <View className="mt-5 flex-row" style={{ gap: 8 }}>
          <Chip label="Delivery fee" value={`₹${order.fee}`} />
          <Chip label="Distance" value={`${order.distanceKm} km`} />
          <Chip label="Est. time" value={`${order.etaMin} min`} />
        </View>

        {/* Items / payment */}

        <View className="mt-3 flex-row items-center justify-between px-1">
          <Text className="text-[13px]" style={{ color: MUTED }}>
            {order.items.length} items
          </Text>

          <Text
            className="text-[13px] font-semibold"
            style={{ color: FOREST }}
          >
            {order.payment}
          </Text>
        </View>

        {/* How the delivery works */}

        <View
          className="mt-4 rounded-2xl p-4"
          style={{ backgroundColor: MINT }}
        >
          <Text
            className="mb-2 text-[13px] font-bold"
            style={{ color: FOREST }}
          >
            If you accept, you will
          </Text>

          {ACCEPT_STEPS.map((step, index) => (
            <View key={step} className="flex-row py-1">
              <Text
                className="w-5 text-[13px] font-bold"
                style={{ color: FOREST }}
              >
                {index + 1}.
              </Text>

              <Text
                className="flex-1 text-[13px]"
                style={{ color: FOREST }}
              >
                {step}
              </Text>
            </View>
          ))}
        </View>

        {/* API error */}

        {actionError && (
          <Text className="mt-3 text-[13px]" style={{ color: RED }}>
            {actionError}
          </Text>
        )}

        {/* Actions */}

        <View className="mt-4 flex-row" style={{ gap: 12 }}>
          <ActionButton
            label="Reject"
            danger
            onPress={handleReject}
            disabled={actionInProgress || secondsLeft <= 0}
            loading={isRejecting}
          />

          <ActionButton
            label="Accept order"
            onPress={handleAccept}
            flex={1.4}
            disabled={actionInProgress || secondsLeft <= 0}
            loading={isAccepting}
          />
        </View>
      </View>
    </View>
  );
}
