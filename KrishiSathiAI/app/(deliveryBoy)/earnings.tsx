import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

/* ------------------------------------------------------------------ */
/* Design tokens (same as Home / Orders / Profile)                     */
/* ------------------------------------------------------------------ */
const FOREST = '#14532D';
const FOREST_DEEP = '#0E3F22';
const MUTED = '#5E7365';
const MINT = '#EEF3EC';
const LINE = '#DCE6DE';
const TURMERIC = '#F5C542';
const LEAF = '#7BE0A1';
const SOFT_TEXT = '#B5CBBB';
const RED = '#C9503C';
const AMBER = '#A8760A';
const AMBER_BG = '#FDF3D0';

const MIN_WITHDRAW = 100;

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
export type DayEarning = {
    date: string; // 'YYYY-MM-DD' (local date)
    deliveries: number;
    fees: number; // delivery fees
    bonus: number; // incentives and bonuses
    tips: number; // tips from farmers
};

export type Payout = {
    id: string;
    amount: number;
    date: string; // 'YYYY-MM-DD'
    status: 'paid' | 'processing' | 'failed';
};

type Wallet = {
    available: number; // can be withdrawn now
    processing: number; // withdrawal already requested
    account: string; // e.g. 'State Bank of India •••• 4821'
};

type Props = {
    /** One entry per day the driver worked, any order. */
    days?: DayEarning[];
    wallet?: Wallet;
    payouts?: Payout[];
    /** Call your API to request a payout. Return when done. */
    onWithdraw?: (amount: number) => Promise<void> | void;
};

type Period = 'today' | 'week' | 'month' | 'all';

const PERIODS: { key: Period; label: string; days: number; prevLabel: string }[] = [
    { key: 'today', label: 'Today', days: 1, prevLabel: 'yesterday' },
    { key: 'week', label: '7 days', days: 7, prevLabel: 'the previous 7 days' },
    { key: 'month', label: '30 days', days: 30, prevLabel: 'the previous 30 days' },
    { key: 'all', label: 'All time', days: Infinity, prevLabel: '' },
];

/* ------------------------------------------------------------------ */
/* Demo data (replace with API data)                                   */
/* ------------------------------------------------------------------ */
function dateKey(d: Date) {
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
}

function daysAgo(n: number) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - n);
    return d;
}

const DEMO_DAYS: DayEarning[] = Array.from({ length: 75 }, (_, i) => {
    if (i === 0) return { date: dateKey(daysAgo(0)), deliveries: 8, fees: 850, bonus: 0, tips: 0 };
    const deliveries = 3 + ((i * 7) % 9);
    return {
        date: dateKey(daysAgo(i)),
        deliveries,
        fees: deliveries * (42 + ((i * 3) % 20)),
        bonus: deliveries >= 9 ? 100 : 0,
        tips: i % 3 === 0 ? 30 + (i % 5) * 10 : 0,
    };
});

const DEMO_WALLET: Wallet = {
    available: 2340,
    processing: 1500,
    account: 'State Bank of India •••• 4821',
};

const DEMO_PAYOUTS: Payout[] = [
    { id: 'PO-311', amount: 1500, date: dateKey(daysAgo(1)), status: 'processing' },
    { id: 'PO-298', amount: 3200, date: dateKey(daysAgo(8)), status: 'paid' },
    { id: 'PO-287', amount: 2750, date: dateKey(daysAgo(15)), status: 'paid' },
    { id: 'PO-270', amount: 900, date: dateKey(daysAgo(23)), status: 'failed' },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const rupees = (n: number) =>
    '₹' + Math.round(n).toLocaleString('en-IN');

const dayTotal = (d: DayEarning) => d.fees + d.bonus + d.tips;

function parseKey(key: string) {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d, 12);
}

function longDate(key: string) {
    return parseKey(key).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    });
}

function sumDays(list: DayEarning[]) {
    return list.reduce(
        (a, d) => ({
            deliveries: a.deliveries + d.deliveries,
            fees: a.fees + d.fees,
            bonus: a.bonus + d.bonus,
            tips: a.tips + d.tips,
            total: a.total + dayTotal(d),
        }),
        { deliveries: 0, fees: 0, bonus: 0, tips: 0, total: 0 }
    );
}

const PAYOUT_STYLE = {
    paid: { text: 'Paid', color: FOREST, bg: '#DDF3E4' },
    processing: { text: 'Processing', color: AMBER, bg: AMBER_BG },
    failed: { text: 'Failed', color: RED, bg: '#F9E1DC' },
} as const;

/* ------------------------------------------------------------------ */
/* Bar chart (plain Views, no chart library needed)                    */
/* ------------------------------------------------------------------ */
function BarChart({
    data,
    selected,
    onSelect,
    dense,
}: {
    data: DayEarning[];
    selected: number;
    onSelect: (i: number) => void;
    dense: boolean;
}) {
    const max = Math.max(1, ...data.map(dayTotal));
    const CHART_H = 130;

    return (
        <View>
            <View className="flex-row items-end" style={{ height: CHART_H, gap: dense ? 2 : 8 }}>
                {data.map((d, i) => {
                    const h = Math.max(4, (dayTotal(d) / max) * CHART_H);
                    const active = i === selected;
                    return (
                        <Pressable2
                            key={d.date}
                            onPress={() => onSelect(i)}
                            label={`${longDate(d.date)}, ${rupees(dayTotal(d))}`}
                        >
                            <View
                                style={{
                                    height: h,
                                    borderRadius: dense ? 2 : 6,
                                    backgroundColor: active ? TURMERIC : dayTotal(d) === 0 ? LINE : FOREST,
                                    opacity: active ? 1 : 0.9,
                                }}
                            />
                        </Pressable2>
                    );
                })}
            </View>
            <View className="mt-1.5 flex-row" style={{ gap: dense ? 2 : 8 }}>
                {data.map((d, i) => {
                    const show = dense ? i % 5 === 0 || i === data.length - 1 : true;
                    const text = dense
                        ? String(parseKey(d.date).getDate())
                        : parseKey(d.date).toLocaleDateString('en-IN', { weekday: 'short' }).slice(0, 3);
                    return (
                        <View key={d.date} className="flex-1 items-center">
                            {show && (
                                <Text
                                    numberOfLines={1}
                                    style={{
                                        fontSize: 10,
                                        color: i === selected ? FOREST : MUTED,
                                        fontWeight: i === selected ? '800' : '500',
                                        width: 40,
                                        textAlign: 'center',
                                    }}
                                >
                                    {text}
                                </Text>
                            )}
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

// Tiny helper: a full-height tap target that aligns the bar to the bottom
function Pressable2({
    children,
    onPress,
    label,
}: {
    children: React.ReactNode;
    onPress: () => void;
    label: string;
}) {
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={label}
            style={{ flex: 1, height: '100%', justifyContent: 'flex-end' }}
        >
            {children}
        </TouchableOpacity>
    );
}

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */
export default function Earnings({
    days = DEMO_DAYS,
    wallet = DEMO_WALLET,
    payouts = DEMO_PAYOUTS,
    onWithdraw,
}: Props) {
    const [period, setPeriod] = useState<Period>('week');
    const [selected, setSelected] = useState<number | null>(null);
    const [withdrawing, setWithdrawing] = useState(false);

    const sorted = useMemo(() => [...days].sort((a, b) => (a.date < b.date ? -1 : 1)), [days]);
    const cfg = PERIODS.find((p) => p.key === period)!;

    const current = useMemo(
        () => (Number.isFinite(cfg.days) ? sorted.slice(-cfg.days) : sorted),
        [sorted, cfg.days]
    );
    const previous = useMemo(
        () =>
            Number.isFinite(cfg.days) ? sorted.slice(-cfg.days * 2, -cfg.days) : [],
        [sorted, cfg.days]
    );

    const totals = sumDays(current);
    const prevTotals = sumDays(previous);
    const lifetime = sumDays(sorted);

    const change =
        previous.length && prevTotals.total > 0
            ? Math.round(((totals.total - prevTotals.total) / prevTotals.total) * 100)
            : null;

    const avgPerDelivery = totals.deliveries ? totals.total / totals.deliveries : 0;
    const best = current.reduce<DayEarning | null>(
        (b, d) => (!b || dayTotal(d) > dayTotal(b) ? d : b),
        null
    );

    const showChart = period === 'week' || period === 'month';
    const chartIndex = selected ?? current.length - 1;
    const chartDay = current[chartIndex];

    const breakdown = [
        { label: 'Delivery fees', value: totals.fees, color: FOREST },
        { label: 'Bonuses and incentives', value: totals.bonus, color: TURMERIC },
        { label: 'Tips from farmers', value: totals.tips, color: LEAF },
    ];

    const canWithdraw = wallet.available >= MIN_WITHDRAW && !withdrawing;

    const confirmWithdraw = () => {
        Alert.alert(
            `Withdraw ${rupees(wallet.available)}?`,
            `The money will be sent to ${wallet.account}.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Withdraw',
                    onPress: async () => {
                        setWithdrawing(true);
                        try {
                            await onWithdraw?.(wallet.available);
                        } catch {
                            Alert.alert('Withdrawal failed', "We couldn't send the request. Please try again.");
                        } finally {
                            setWithdrawing(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <ScrollView
            className="flex-1"
            style={{ backgroundColor: MINT }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 140 }}
            showsVerticalScrollIndicator={false}
        >
            {/* Wallet */}
            <View className="rounded-3xl p-5" style={{ backgroundColor: FOREST, ...cardShadow }}>
                <Text className="text-[14px]" style={{ color: SOFT_TEXT }}>
                    Available to withdraw
                </Text>
                <Text className="mt-1 text-[44px] font-extrabold" style={{ color: TURMERIC }}>
                    {rupees(wallet.available)}
                </Text>

                {wallet.processing > 0 && (
                    <Text className="text-[13px]" style={{ color: SOFT_TEXT }}>
                        {rupees(wallet.processing)} is being sent to your bank
                    </Text>
                )}

                <TouchableOpacity
                    onPress={confirmWithdraw}
                    disabled={!canWithdraw}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Withdraw to bank"
                    className="mt-4 items-center rounded-2xl py-4"
                    style={{ backgroundColor: TURMERIC, opacity: canWithdraw ? 1 : 0.5 }}
                >
                    <Text className="text-[15px] font-bold" style={{ color: FOREST }}>
                        {withdrawing ? 'Sending request…' : 'Withdraw to bank'}
                    </Text>
                </TouchableOpacity>
                <Text className="mt-2 text-center text-[12px]" style={{ color: SOFT_TEXT }}>
                    {wallet.available < MIN_WITHDRAW
                        ? `You can withdraw once you have ${rupees(MIN_WITHDRAW)} or more`
                        : `To ${wallet.account}`}
                </Text>

                <View className="mt-4 flex-row" style={{ gap: 8 }}>
                    <View
                        className="flex-1 items-center rounded-2xl py-3"
                        style={{ backgroundColor: FOREST_DEEP }}
                    >
                        <Text className="text-[18px] font-bold text-white">{rupees(lifetime.total)}</Text>
                        <Text className="text-[12px]" style={{ color: SOFT_TEXT }}>
                            Earned in total
                        </Text>
                    </View>
                    <View
                        className="flex-1 items-center rounded-2xl py-3"
                        style={{ backgroundColor: FOREST_DEEP }}
                    >
                        <Text className="text-[18px] font-bold text-white">{lifetime.deliveries}</Text>
                        <Text className="text-[12px]" style={{ color: SOFT_TEXT }}>
                            Deliveries done
                        </Text>
                    </View>
                </View>
            </View>

            {/* Period tabs */}
            <View
                className="mt-6 flex-row rounded-2xl p-1"
                style={{ backgroundColor: '#DDE7DF' }}
                accessibilityRole="tablist"
            >
                {PERIODS.map((p) => {
                    const active = p.key === period;
                    return (
                        <TouchableOpacity
                            key={p.key}
                            onPress={() => {
                                setPeriod(p.key);
                                setSelected(null);
                            }}
                            activeOpacity={0.8}
                            accessibilityRole="tab"
                            accessibilityState={{ selected: active }}
                            className="flex-1 items-center rounded-xl py-2.5"
                            style={{ backgroundColor: active ? FOREST : 'transparent' }}
                        >
                            <Text
                                className="text-[13px] font-bold"
                                style={{ color: active ? '#fff' : FOREST }}
                            >
                                {p.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Period summary */}
            <View className="mt-4 rounded-3xl bg-white p-5" style={cardShadow}>
                <Text className="text-[14px]" style={{ color: MUTED }}>
                    {period === 'today'
                        ? 'Earned today'
                        : period === 'all'
                            ? 'Earned since you joined'
                            : `Earned in the last ${cfg.days} days`}
                </Text>
                <Text className="mt-1 text-[38px] font-extrabold" style={{ color: FOREST }}>
                    {rupees(totals.total)}
                </Text>
                {change !== null && (
                    <Text
                        className="text-[13px] font-semibold"
                        style={{ color: change >= 0 ? FOREST : RED }}
                    >
                        {change >= 0 ? '▲' : '▼'} {Math.abs(change)}% compared with {cfg.prevLabel}
                    </Text>
                )}

                <View className="mt-4 flex-row" style={{ gap: 8 }}>
                    {[
                        { label: 'Deliveries', value: String(totals.deliveries) },
                        { label: 'Avg per delivery', value: rupees(avgPerDelivery) },
                        {
                            label: 'Best day',
                            value: best ? rupees(dayTotal(best)) : '₹0',
                        },
                    ].map((s) => (
                        <View
                            key={s.label}
                            className="flex-1 items-center rounded-2xl py-3"
                            style={{ backgroundColor: MINT }}
                        >
                            <Text className="text-[17px] font-extrabold" style={{ color: FOREST }}>
                                {s.value}
                            </Text>
                            <Text className="text-[11px]" style={{ color: MUTED }}>
                                {s.label}
                            </Text>
                        </View>
                    ))}
                </View>

                {showChart && chartDay && (
                    <View className="mt-5">
                        <View className="mb-3 flex-row items-center justify-between">
                            <Text className="text-[13px] font-semibold" style={{ color: MUTED }}>
                                {longDate(chartDay.date)}
                            </Text>
                            <Text className="text-[15px] font-extrabold" style={{ color: FOREST }}>
                                {rupees(dayTotal(chartDay))} · {chartDay.deliveries} deliveries
                            </Text>
                        </View>
                        <BarChart
                            data={current}
                            selected={chartIndex}
                            onSelect={setSelected}
                            dense={period === 'month'}
                        />
                    </View>
                )}
            </View>

            {/* Breakdown */}
            <Text className="mb-2 mt-6 px-1 text-[17px] font-bold" style={{ color: FOREST }}>
                Where your money came from
            </Text>
            <View className="rounded-3xl bg-white p-5" style={cardShadow}>
                {breakdown.map((b, i) => {
                    const pct = totals.total ? Math.round((b.value / totals.total) * 100) : 0;
                    return (
                        <View key={b.label} style={{ marginTop: i === 0 ? 0 : 16 }}>
                            <View className="flex-row items-center justify-between">
                                <Text className="text-[14px] font-semibold" style={{ color: FOREST }}>
                                    {b.label}
                                </Text>
                                <Text className="text-[15px] font-extrabold" style={{ color: FOREST }}>
                                    {rupees(b.value)}
                                </Text>
                            </View>
                            <View
                                className="mt-2 h-2 overflow-hidden rounded-full"
                                style={{ backgroundColor: MINT }}
                            >
                                <View
                                    className="h-full rounded-full"
                                    style={{ width: `${pct}%`, backgroundColor: b.color }}
                                />
                            </View>
                            <Text className="mt-1 text-[12px]" style={{ color: MUTED }}>
                                {pct}% of your earnings
                            </Text>
                        </View>
                    );
                })}
            </View>

            {/* Payout history */}
            <Text className="mb-2 mt-6 px-1 text-[17px] font-bold" style={{ color: FOREST }}>
                Withdrawals
            </Text>
            <View className="overflow-hidden rounded-3xl bg-white" style={cardShadow}>
                {payouts.length === 0 ? (
                    <View className="items-center p-6">
                        <Text className="text-center text-[14px]" style={{ color: MUTED }}>
                            No withdrawals yet. When you withdraw, they will be listed here.
                        </Text>
                    </View>
                ) : (
                    payouts.map((p, i) => {
                        const s = PAYOUT_STYLE[p.status];
                        return (
                            <View key={p.id}>
                                {i > 0 && <View style={{ height: 1, backgroundColor: LINE, marginLeft: 16 }} />}
                                <View className="flex-row items-center justify-between px-4 py-3.5">
                                    <View>
                                        <Text className="text-[16px] font-extrabold" style={{ color: FOREST }}>
                                            {rupees(p.amount)}
                                        </Text>
                                        <Text className="text-[12px]" style={{ color: MUTED }}>
                                            {longDate(p.date)} · {p.id}
                                        </Text>
                                    </View>
                                    <View className="rounded-full px-3 py-1" style={{ backgroundColor: s.bg }}>
                                        <Text className="text-[12px] font-bold" style={{ color: s.color }}>
                                            {s.text}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })
                )}
            </View>
        </ScrollView>
    );
}