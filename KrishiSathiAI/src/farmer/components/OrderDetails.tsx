
import React, { useEffect, useState } from "react";

import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    View,
    TouchableOpacity,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
    formatPrice,
    getOrderStatusColor,
    getOrderStatusLabel,
    getPaymentStatusColor,
} from "../utils/orderUtils";

import {
    getAddresses,
    type FarmerAddress,
} from "../services/farmerAddressService";

import type { FarmerOrder } from "../types/order.types";

const FOREST = "#14532D";
const LEAF = "#2E7D32";

interface Props {
    order: FarmerOrder | null;
    loading: boolean;
    error: string | null;
    onBack: () => void;
    onRetry: () => void;
}

// ================= DETAIL ROW =================

function DetailRow({
    label,
    value,
    bold = false,
}: {
    label: string;
    value: string;
    bold?: boolean;
}) {
    return (
        <View className="flex-row items-center justify-between py-3">
            <Text className="text-[13px] text-gray-500">
                {label}
            </Text>

            <Text
                className={`max-w-[60%] text-right text-[13px] ${bold
                    ? "font-extrabold text-[#14532D]"
                    : "font-semibold text-[#1F2A24]"
                    }`}
            >
                {value}
            </Text>
        </View>
    );
}

// ================= DELIVERY ADDRESS =================

function DeliveryAddressCard({
    addressId,
}: {
    addressId: string;
}) {
    const [address, setAddress] = useState<FarmerAddress | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchAddress = async () => {
            try {
                setLoading(true);
                setError(null);

                const addresses = await getAddresses();

                const matchedAddress = addresses.find(
                    (item) => item.addressId === addressId
                );

                if (isMounted) {
                    setAddress(matchedAddress ?? null);
                }

                if (!matchedAddress) {
                    console.log("DELIVERY ADDRESS NOT FOUND:", addressId);
                }
            } catch (err: any) {
                console.log(
                    "FETCH DELIVERY ADDRESS ERROR:",
                    err.response?.data || err.message
                );

                if (isMounted) {
                    setError("Unable to load delivery address. Please try again.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        if (addressId) {
            fetchAddress();
        } else {
            setLoading(false);
            setAddress(null);
        }

        return () => {
            isMounted = false;
        };
    }, [addressId]);

    if (loading) {
        return (
            <View className="items-center py-5">
                <ActivityIndicator size="small" color={FOREST} />

                <Text className="mt-2 text-[12px] text-gray-500">
                    Loading delivery address...
                </Text>
            </View>
        );
    }

    if (error) {
        return (
            <View className="py-3">
                <Text className="text-[13px] text-red-600">
                    {error}
                </Text>
            </View>
        );
    }

    if (!address) {
        return (
            <View className="py-3">
                <Text className="text-[13px] text-gray-500">
                    Delivery address not found.
                </Text>
            </View>
        );
    }

    return (
        <View>
            {/* ADDRESS TYPE */}
            <View className="mb-4 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <MaterialCommunityIcons
                        name="map-marker"
                        size={23}
                        color={LEAF}
                    />

                    <Text className="ml-2 text-[14px] font-bold text-[#14532D]">
                        {address.addressType}
                    </Text>
                </View>

                {address.isDefault && (
                    <View className="rounded-full bg-[#E8F5E9] px-3 py-1">
                        <Text className="text-[11px] font-bold text-[#2E7D32]">
                            DEFAULT
                        </Text>
                    </View>
                )}
            </View>

            {/* NAME */}
            <View className="mb-3 flex-row items-start">
                <MaterialCommunityIcons
                    name="account-outline"
                    size={20}
                    color="#64748B"
                />

                <View className="ml-3 flex-1">
                    <Text className="text-[11px] text-gray-500">
                        Receiver Name
                    </Text>

                    <Text className="mt-1 text-[14px] font-bold text-[#1F2A24]">
                        {address.fullName}
                    </Text>
                </View>
            </View>

            {/* MOBILE */}
            <View className="mb-3 flex-row items-start">
                <MaterialCommunityIcons
                    name="phone-outline"
                    size={20}
                    color="#64748B"
                />

                <View className="ml-3 flex-1">
                    <Text className="text-[11px] text-gray-500">
                        Mobile Number
                    </Text>

                    <Text className="mt-1 text-[14px] font-semibold text-[#1F2A24]">
                        {address.mobileNumber}
                    </Text>
                </View>
            </View>

            {/* COMPLETE LOCATION */}
            <View className="mb-3 flex-row items-start">
                <MaterialCommunityIcons
                    name="home-map-marker"
                    size={20}
                    color="#64748B"
                />

                <View className="ml-3 flex-1">
                    <Text className="text-[11px] text-gray-500">
                        Complete Address
                    </Text>

                    <Text className="mt-1 text-[14px] font-semibold leading-6 text-[#1F2A24]">
                        {address.village}
                        {"\n"}
                        Post Office: {address.postOffice}
                        {"\n"}
                        {address.district}, {address.state}
                        {"\n"}
                        PIN: {address.pincode}
                    </Text>
                </View>
            </View>

            {/* LANDMARK */}
            {address.landmark ? (
                <View className="mb-3 flex-row items-start">
                    <MaterialCommunityIcons
                        name="sign-direction"
                        size={20}
                        color="#64748B"
                    />

                    <View className="ml-3 flex-1">
                        <Text className="text-[11px] text-gray-500">
                            Landmark
                        </Text>

                        <Text className="mt-1 text-[14px] font-semibold text-[#1F2A24]">
                            {address.landmark}
                        </Text>
                    </View>
                </View>
            ) : null}

            {/* ADDRESS ID */}
            <View className="mt-2 border-t border-gray-100 pt-3">
                <Text className="text-[10px] text-gray-400">
                    Address ID: {address.addressId}
                </Text>
            </View>
        </View>
    );
}

// ================= ORDER DETAILS =================

export default function OrderDetails({
    order,
    loading,
    error,
    onBack,
    onRetry,
}: Props) {
    const insets = useSafeAreaInsets();

    // LOADING
    if (loading) {
        return (
            <View
                className="flex-1 items-center justify-center bg-[#FAFAF6]"
                style={{
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom + 70,
                }}
            >
                <ActivityIndicator size="large" color={FOREST} />

                <Text className="mt-3 text-gray-500">
                    Loading order details...
                </Text>
            </View>
        );
    }

    // ERROR
    if (error || !order) {
        return (
            <View
                className="flex-1 items-center justify-center bg-[#FAFAF6] px-6"
                style={{
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom + 80,
                }}
            >
                <MaterialCommunityIcons
                    name="alert-circle-outline"
                    size={60}
                    color="#DC2626"
                />

                <Text className="mt-4 text-lg font-bold text-[#1F2A24]">
                    Unable to load order
                </Text>

                <Text className="mt-2 text-center text-gray-500">
                    {error || "Order details not found"}
                </Text>

                <TouchableOpacity
                    onPress={onRetry}
                    className="mt-5 rounded-xl bg-[#14532D] px-6 py-3"
                >
                    <Text className="font-bold text-white">
                        Try Again
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onBack} className="mt-4">
                    <Text className="font-semibold text-[#14532D]">
                        Go Back
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    const statusColor = getOrderStatusColor(order.orderStatus);

    return (
        <View
            className="flex-1 bg-[#FAFAF6]"
            style={{ paddingTop: insets.top }}
        >
            {/* HEADER */}
            <View className="flex-row items-center bg-white px-4 py-4">
                <TouchableOpacity
                    onPress={onBack}
                    className="mr-3"
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons
                        name="arrow-left"
                        size={25}
                        color={FOREST}
                    />
                </TouchableOpacity>

                <View className="flex-1">
                    <Text className="text-[20px] font-extrabold text-[#14532D]">
                        Order Details
                    </Text>

                    <Text className="text-[12px] text-gray-500">
                        Your purchase information
                    </Text>
                </View>
            </View>

            {/* DETAILS CONTENT */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    padding: 16,
                    paddingBottom: Math.max(insets.bottom, 16) + 100,
                }}
            >
                {/* ORDER STATUS */}
                <View className="rounded-2xl bg-white p-5">
                    <View className="flex-row items-center">


                        <View className="ml-3 flex-1">



                        </View>
                    </View>

                    <View className="my-4 border-t border-gray-100" />

                    <Text className="text-[12px] text-gray-500">
                        CURRENT ORDER STATUS
                    </Text>

                    <View
                        className="mt-3 self-start rounded-full px-4 py-2"
                        style={{ backgroundColor: `${statusColor}15` }}
                    >
                        <Text
                            className="font-bold"
                            style={{ color: statusColor }}
                        >
                            {getOrderStatusLabel(order.orderStatus)}
                        </Text>
                    </View>
                </View>

                {/* PRODUCT INFORMATION */}
                <View className="mt-4 rounded-2xl bg-white p-4">
                    <Text className="mb-4 text-[15px] font-extrabold text-[#14532D]">
                        Product Information
                    </Text>

                    <View className="flex-row items-center">
                        {/* PRODUCT IMAGE */}
                        <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-[#E8F5E9]">
                            {order.productImage ? (
                                <Image
                                    source={{ uri: order.productImage }}
                                    className="h-full w-full"
                                    resizeMode="cover"
                                />
                            ) : (
                                <MaterialCommunityIcons
                                    name="sprout"
                                    size={32}
                                    color={LEAF}
                                />
                            )}
                        </View>

                        {/* PRODUCT NAME */}
                        <View className="ml-3 flex-1">
                            <Text className="font-bold text-[#1F2A24]">
                                {order.productName || "Product unavailable"}
                            </Text>

                            <Text className="mt-1 text-[11px] text-gray-400">
                                Product ID: {order.productId}
                            </Text>

                            <Text className="mt-1 text-[12px] text-gray-500">
                                {order.productQuantity}
                            </Text>
                        </View>
                    </View>

                    <View className="my-3 border-t border-gray-100" />

                    <DetailRow
                        label="Quantity"
                        value={String(order.quantity)}
                    />

                    <DetailRow
                        label="Product unit"
                        value={order.productQuantity}
                    />

                    <DetailRow
                        label="Product total"
                        value={formatPrice(order.productTotal)}
                    />
                </View>

                {/* PRICE BREAKDOWN */}
                <View className="mt-4 rounded-2xl bg-white p-4">
                    <Text className="mb-3 text-[15px] font-extrabold text-[#14532D]">
                        Payment Summary
                    </Text>

                    <DetailRow
                        label="Product Amount"
                        value={formatPrice(order.productTotal)}
                    />

                    <DetailRow
                        label="Platform Fee"
                        value={formatPrice(order.platformFee)}
                    />

                    <DetailRow
                        label="Delivery Fee"
                        value={formatPrice(order.deliveryFee)}
                    />

                    <View className="my-2 border-t border-dashed border-gray-200" />

                    <DetailRow
                        label="Grand Total"
                        value={formatPrice(order.totalSumFee)}
                        bold
                    />
                </View>

                {/* PAYMENT INFORMATION */}
                <View className="mt-4 rounded-2xl bg-white p-4">
                    <Text className="mb-3 text-[15px] font-extrabold text-[#14532D]">
                        Payment Information
                    </Text>

                    <DetailRow
                        label="Payment Method"
                        value={order.paymentMode}
                    />

                    <View className="flex-row items-center justify-between py-3">
                        <Text className="text-[13px] text-gray-500">
                            Payment Status
                        </Text>

                        <Text
                            className="text-[13px] font-bold"
                            style={{
                                color: getPaymentStatusColor(order.paymentStatus),
                            }}
                        >
                            {order.paymentStatus}
                        </Text>
                    </View>
                </View>

                {/* DELIVERY ADDRESS */}
                <View className="mt-4 rounded-2xl bg-white p-4">
                    <Text className="mb-4 text-[15px] font-extrabold text-[#14532D]">
                        Delivery Address
                    </Text>

                    <DeliveryAddressCard
                        addressId={order.deliveryAddressId}
                    />
                </View>
            </ScrollView>
        </View>
    );
}
