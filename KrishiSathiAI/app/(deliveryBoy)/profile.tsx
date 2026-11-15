import React, { useState } from 'react';
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';

/* ------------------------------------------------------------------ */
/* Design tokens (same as Home / Orders)                               */
/* ------------------------------------------------------------------ */
const FOREST = '#14532D';
const FOREST_DEEP = '#0E3F22';
const MUTED = '#5E7365';
const MINT = '#EEF3EC';
const LINE = '#DCE6DE';
const TURMERIC = '#F5C542';
const SOFT_TEXT = '#B5CBBB';
const RED = '#C9503C';
const AMBER = '#A8760A';
const AMBER_BG = '#FDF3D0';

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
type DocStatus = 'verified' | 'pending' | 'rejected' | 'missing';

export type DeliveryProfile = {
  name: string;
  phone: string;
  email?: string;
  area: string;
  memberSince: string; // e.g. "March 2025"
  rating: number;
  totalDeliveries: number;
  onTimePercent: number;
  vehicle: { type: string; number: string };
  documents: { label: string; status: DocStatus }[];
  bank: { holder: string; bankName: string; accountLast4: string };
};

type Props = {
  profile?: DeliveryProfile;
  onEditProfile?: () => void;
  onUploadDocument?: (label: string) => void;
  onEditBank?: () => void;
  onChangeLanguage?: () => void;
  onHelp?: () => void;
  onTerms?: () => void;
  onNotificationsChange?: (enabled: boolean) => void;
  onLogout?: () => void;
};

/* ------------------------------------------------------------------ */
/* Demo data (replace with API data)                                   */
/* ------------------------------------------------------------------ */
const DEMO_PROFILE: DeliveryProfile = {
  name: 'Rahul Kumar',
  phone: '+91 98765 43210',
  email: 'rahul.kumar@example.com',
  area: 'Khordha, Odisha',
  memberSince: 'March 2025',
  rating: 4.8,
  totalDeliveries: 342,
  onTimePercent: 96,
  vehicle: { type: 'Motorcycle', number: 'OD 02 AB 1234' },
  documents: [
    { label: 'Aadhaar card', status: 'verified' },
    { label: 'Driving licence', status: 'verified' },
    { label: 'Vehicle RC', status: 'pending' },
    { label: 'Vehicle insurance', status: 'missing' },
  ],
  bank: { holder: 'Rahul Kumar', bankName: 'State Bank of India', accountLast4: '4821' },
};

/* ------------------------------------------------------------------ */
/* Building blocks                                                     */
/* ------------------------------------------------------------------ */
const STATUS_STYLE: Record<DocStatus, { text: string; color: string; bg: string }> = {
  verified: { text: 'Verified', color: FOREST, bg: '#DDF3E4' },
  pending: { text: 'In review', color: AMBER, bg: AMBER_BG },
  rejected: { text: 'Rejected', color: RED, bg: '#F9E1DC' },
  missing: { text: 'Upload', color: RED, bg: '#F9E1DC' },
};

function Section({ title, action, onAction, children }: {
  title: string;
  action?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <View className="mt-6">
      <View className="mb-2 flex-row items-center justify-between px-1">
        <Text className="text-[17px] font-bold" style={{ color: FOREST }}>
          {title}
        </Text>
        {action && (
          <TouchableOpacity onPress={onAction} accessibilityRole="button" accessibilityLabel={action}>
            <Text className="text-[14px] font-bold" style={{ color: FOREST }}>
              {action}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <View className="overflow-hidden rounded-3xl bg-white" style={cardShadow}>
        {children}
      </View>
    </View>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: LINE, marginLeft: 16 }} />;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between px-4 py-3.5">
      <Text className="text-[14px]" style={{ color: MUTED }}>
        {label}
      </Text>
      <Text className="ml-4 flex-1 text-right text-[15px] font-semibold" style={{ color: FOREST }}>
        {value}
      </Text>
    </View>
  );
}

function LinkRow({ label, value, onPress }: { label: string; value?: string; onPress?: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="flex-row items-center justify-between px-4 py-4"
    >
      <Text className="text-[15px] font-semibold" style={{ color: FOREST }}>
        {label}
      </Text>
      <View className="flex-row items-center">
        {value && (
          <Text className="mr-2 text-[14px]" style={{ color: MUTED }}>
            {value}
          </Text>
        )}
        <Text className="text-[20px]" style={{ color: MUTED }}>
          ›
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */
export default function Profile({
  profile = DEMO_PROFILE,
  onEditProfile,
  onUploadDocument,
  onEditBank,
  onChangeLanguage,
  onHelp,
  onTerms,
  onNotificationsChange,
  onLogout,
}: Props) {
  const [notifications, setNotifications] = useState(true);

  const initial = profile.name.trim().charAt(0).toUpperCase();
  const verifiedCount = profile.documents.filter((d) => d.status === 'verified').length;
  const allVerified = verifiedCount === profile.documents.length;

  const confirmLogout = () => {
    Alert.alert('Log out?', 'You will go offline and stop receiving delivery requests.', [
      { text: 'Stay logged in', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => onLogout?.() },
    ]);
  };

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: MINT }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 140 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Identity card */}
      <View className="rounded-3xl p-5" style={{ backgroundColor: FOREST, ...cardShadow }}>
        <View className="flex-row items-center">
          <View
            className="items-center justify-center rounded-full"
            style={{ width: 68, height: 68, backgroundColor: TURMERIC }}
          >
            <Text className="text-[28px] font-extrabold" style={{ color: FOREST }}>
              {initial}
            </Text>
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-[22px] font-extrabold text-white" numberOfLines={1}>
              {profile.name}
            </Text>
            <Text className="mt-0.5 text-[14px]" style={{ color: SOFT_TEXT }}>
              {profile.phone}
            </Text>
            <Text className="text-[13px]" style={{ color: SOFT_TEXT }}>
              {profile.area}
            </Text>
          </View>
        </View>

        <View className="mt-4 flex-row items-center justify-between">
          <View
            className="rounded-full px-3 py-1"
            style={{ backgroundColor: allVerified ? '#DDF3E4' : AMBER_BG }}
          >
            <Text
              className="text-[12px] font-bold"
              style={{ color: allVerified ? FOREST : AMBER }}
            >
              {allVerified
                ? 'Fully verified partner'
                : `${verifiedCount} of ${profile.documents.length} documents verified`}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onEditProfile}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
            className="rounded-full px-4 py-1.5"
            style={{ backgroundColor: FOREST_DEEP }}
          >
            <Text className="text-[13px] font-bold text-white">Edit profile</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-4 flex-row" style={{ gap: 8 }}>
          {[
            { label: 'Deliveries', value: String(profile.totalDeliveries) },
            { label: 'Rating', value: `★ ${profile.rating}` },
            { label: 'On time', value: `${profile.onTimePercent}%` },
          ].map((s) => (
            <View
              key={s.label}
              className="flex-1 items-center rounded-2xl py-3"
              style={{ backgroundColor: FOREST_DEEP }}
            >
              <Text className="text-[20px] font-bold text-white">{s.value}</Text>
              <Text className="text-[12px]" style={{ color: SOFT_TEXT }}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>
        <Text className="mt-3 text-center text-[12px]" style={{ color: SOFT_TEXT }}>
          Delivering with us since {profile.memberSince}
        </Text>
      </View>

      {/* Vehicle */}
      <Section title="Vehicle">
        <InfoRow label="Type" value={profile.vehicle.type} />
        <Divider />
        <InfoRow label="Number plate" value={profile.vehicle.number} />
      </Section>

      {/* Documents */}
      <Section title="Documents">
        {profile.documents.map((doc, i) => {
          const s = STATUS_STYLE[doc.status];
          const actionable = doc.status === 'missing' || doc.status === 'rejected';
          return (
            <View key={doc.label}>
              {i > 0 && <Divider />}
              <TouchableOpacity
                disabled={!actionable}
                onPress={() => onUploadDocument?.(doc.label)}
                activeOpacity={0.7}
                accessibilityRole={actionable ? 'button' : 'text'}
                accessibilityLabel={`${doc.label}, ${s.text}`}
                className="flex-row items-center justify-between px-4 py-3.5"
              >
                <Text className="text-[15px] font-semibold" style={{ color: FOREST }}>
                  {doc.label}
                </Text>
                <View className="rounded-full px-3 py-1" style={{ backgroundColor: s.bg }}>
                  <Text className="text-[12px] font-bold" style={{ color: s.color }}>
                    {s.text}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </Section>

      {/* Payout account */}
      <Section title="Payout account" action="Change" onAction={onEditBank}>
        <InfoRow label="Account holder" value={profile.bank.holder} />
        <Divider />
        <InfoRow label="Bank" value={profile.bank.bankName} />
        <Divider />
        <InfoRow label="Account number" value={`•••• ${profile.bank.accountLast4}`} />
      </Section>

      {/* Settings */}
      <Section title="Settings">
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-1 pr-3">
            <Text className="text-[15px] font-semibold" style={{ color: FOREST }}>
              Order notifications
            </Text>
            <Text className="text-[12px]" style={{ color: MUTED }}>
              Sound and alerts for new delivery requests
            </Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={(v) => {
              setNotifications(v);
              onNotificationsChange?.(v);
            }}
            trackColor={{ false: '#C5D1C8', true: FOREST }}
            thumbColor="#fff"
            accessibilityLabel="Order notifications"
          />
        </View>
        <Divider />
        <LinkRow label="Language" value="English" onPress={onChangeLanguage} />
        <Divider />
        <LinkRow label="Help and support" onPress={onHelp} />
        <Divider />
        <LinkRow label="Terms and privacy" onPress={onTerms} />
      </Section>

      {/* Log out */}
      <TouchableOpacity
        onPress={confirmLogout}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Log out"
        className="mt-6 items-center rounded-2xl py-4"
        style={{ borderWidth: 1.5, borderColor: RED }}
      >
        <Text className="text-[15px] font-bold" style={{ color: RED }}>
          Log out
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}