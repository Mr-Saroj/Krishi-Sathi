import React, { useState } from 'react';

import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { PlaceOrderResponse } from '../services/farmerOrderService';

import useCheckout, {
    MAX_QUANTITY,
    MIN_QUANTITY,
    formatAddress,
    formatPrice,

} from '../hooks/useCheckout';


const FOREST = '#14532D';
const GREEN = '#2E7D32';
const MUTED = '#647568';
const BACKGROUND = '#F5F8F2';
const BORDER = '#E6EDE3';

// Space so content is not hidden behind the dashboard bottom nav.
const BOTTOM_NAV_SPACE = 130;

type CheckoutProps = {
    product: any;
    onBack: () => void;
    onOrderSuccess: (order: PlaceOrderResponse) => void;
};

export default function Checkout({
    product,
    onBack,
    onOrderSuccess,
}: CheckoutProps) {
    const {
        productId,
        productImage,
        productUnit,
        unitPrice,
        subtotal,
        platformFee,
        deliveryCharge,
        totalAmount,
        quantity,
        increaseQuantity,
        decreaseQuantity,
        addresses,
        selectedAddress,
        showAddresses,
        loadingAddresses,
        addressError,
        handleChooseAddress,
        handleSelectAddress,
        handleRetryAddresses,
        handlePlaceOrder,
        isPlacingOrder,
    } = useCheckout(product, onOrderSuccess);
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');

    // ==================== PRODUCT ERROR ====================

    if (!product || !productId) {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: BACKGROUND,
                }}
            >
                <View className="flex-1 items-center justify-center px-6">
                    <MaterialCommunityIcons
                        name="package-variant-closed"
                        size={64}
                        color="#9BA99C"
                    />

                    <Text className="mt-4 text-xl font-bold text-gray-900">
                        Product unavailable
                    </Text>

                    <Text className="mt-2 text-center text-sm text-gray-500">
                        We couldn't load the selected product information.
                    </Text>

                    <TouchableOpacity
                        onPress={onBack}
                        className="mt-6 rounded-xl px-7 py-3"
                        style={{ backgroundColor: FOREST }}
                    >
                        <Text className="font-bold text-white">
                            Go Back
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // ==================== MAIN CHECKOUT ====================

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: BACKGROUND,
            }}
        >
            {/* Header (top safe area is handled by the dashboard) */}
            <View
                className="flex-row items-center px-5 pb-4"
                style={{ paddingTop: 8 }}
            >
                <TouchableOpacity
                    onPress={onBack}
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                    className="h-11 w-11 items-center justify-center rounded-2xl bg-white"
                    style={{
                        borderWidth: 1,
                        borderColor: BORDER,
                    }}
                >
                    <MaterialCommunityIcons
                        name="arrow-left"
                        size={23}
                        color={FOREST}
                    />
                </TouchableOpacity>

                <View className="ml-4 flex-1">
                    <Text className="text-xl font-extrabold text-gray-900">
                        Checkout
                    </Text>

                    <Text
                        className="mt-1 text-xs"
                        style={{ color: MUTED }}
                    >
                        Review your product and order
                    </Text>
                </View>

                <View
                    className="h-11 w-11 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: '#E6F2E3' }}
                >
                    <MaterialCommunityIcons
                        name="cart-check"
                        size={23}
                        color={FOREST}
                    />
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                    paddingHorizontal: 18,
                    paddingTop: 8,
                    paddingBottom: BOTTOM_NAV_SPACE,
                }}
            >
                {/* Progress Indicator */}
                <View className="mb-5 flex-row items-center">
                    <View
                        className="h-8 w-8 items-center justify-center rounded-full"
                        style={{ backgroundColor: FOREST }}
                    >
                        <MaterialCommunityIcons
                            name="check"
                            size={18}
                            color="white"
                        />
                    </View>

                    <View
                        className="mx-2 h-0.5 flex-1"
                        style={{ backgroundColor: '#D5E4D1' }}
                    />

                    <View
                        className="h-8 w-8 items-center justify-center rounded-full"
                        style={{ backgroundColor: FOREST }}
                    >
                        <Text className="font-bold text-white">2</Text>
                    </View>

                    <View
                        className="mx-2 h-0.5 flex-1"
                        style={{ backgroundColor: BORDER }}
                    />

                    <View
                        className="h-8 w-8 items-center justify-center rounded-full"
                        style={{ backgroundColor: '#E8ECE7' }}
                    >
                        <Text className="font-bold text-gray-500">3</Text>
                    </View>
                </View>

                <View className="mb-5 flex-row justify-between px-1">
                    <Text
                        className="text-xs font-semibold"
                        style={{ color: GREEN }}
                    >
                        Product
                    </Text>

                    <Text
                        className="text-xs font-semibold"
                        style={{ color: GREEN }}
                    >
                        Checkout
                    </Text>

                    <Text className="text-xs text-gray-400">
                        Confirmation
                    </Text>
                </View>

                {/* ==================== PRODUCT DETAILS ==================== */}

                <View
                    className="mb-5 rounded-3xl bg-white p-4"
                    style={{
                        borderWidth: 1,
                        borderColor: BORDER,
                        elevation: 2,
                        shadowColor: '#000',
                        shadowOpacity: 0.04,
                        shadowRadius: 8,
                        shadowOffset: {
                            width: 0,
                            height: 3,
                        },
                    }}
                >
                    <View className="mb-4 flex-row items-center justify-between">
                        <Text className="text-base font-extrabold text-gray-900">
                            Product Details
                        </Text>

                        <View
                            className="rounded-full px-3 py-1"
                            style={{ backgroundColor: '#EAF5E7' }}
                        >
                            <Text
                                className="text-[10px] font-extrabold"
                                style={{ color: FOREST }}
                            >
                                SELECTED PRODUCT
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row">
                        {/* Product Image */}
                        <View
                            className="h-32 w-28 items-center justify-center overflow-hidden rounded-2xl"
                            style={{ backgroundColor: '#F0F5EC' }}
                        >
                            {productImage ? (
                                <Image
                                    source={{ uri: productImage }}
                                    resizeMode="contain"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                    }}
                                />
                            ) : (
                                <MaterialCommunityIcons
                                    name="package-variant"
                                    size={44}
                                    color={GREEN}
                                />
                            )}
                        </View>

                        {/* Product Information */}
                        <View className="ml-4 flex-1 justify-center">
                            <Text
                                className="text-lg font-extrabold text-gray-900"
                                numberOfLines={2}
                            >
                                {product.name}
                            </Text>

                            <Text
                                className="mt-1 text-sm"
                                style={{ color: MUTED }}
                            >
                                {product.brand || 'Agricultural product'}
                            </Text>

                            <View
                                className="mt-2 self-start rounded-lg px-2 py-1"
                                style={{ backgroundColor: '#F1F5EF' }}
                            >
                                <Text
                                    className="text-xs font-semibold"
                                    style={{ color: FOREST }}
                                >
                                    {product.category || 'Product'}
                                </Text>
                            </View>

                            <Text
                                className="mt-3 text-xl font-extrabold"
                                style={{ color: FOREST }}
                            >
                                {formatPrice(unitPrice)}
                            </Text>


                        </View>
                    </View>

                    {/* Description */}
                    <View
                        className="mt-4 border-t pt-4"
                        style={{ borderColor: BORDER }}
                    >
                        <Text className="mb-1 text-sm font-bold text-gray-800">
                            Description
                        </Text>

                        <Text
                            className="text-sm leading-6"
                            style={{ color: MUTED }}
                        >
                            {product.description ||
                                'No description available.'}
                        </Text>
                    </View>
                </View>

                {/* ==================== DELIVERY ADDRESS ==================== */}

                <View
                    className="mb-5 rounded-3xl bg-white p-5"
                    style={{
                        borderWidth: 1,
                        borderColor: BORDER,
                    }}
                >
                    <View className="mb-4 flex-row items-center">
                        <View
                            className="h-11 w-11 items-center justify-center rounded-2xl"
                            style={{ backgroundColor: '#EAF5E7' }}
                        >
                            <MaterialCommunityIcons
                                name="map-marker-radius-outline"
                                size={24}
                                color={FOREST}
                            />
                        </View>

                        <View className="ml-3 flex-1">
                            <Text className="text-base font-extrabold text-gray-900">
                                Delivery Address
                            </Text>

                            <Text
                                className="mt-1 text-xs"
                                style={{ color: MUTED }}
                            >
                                Where should we deliver your order?
                            </Text>
                        </View>
                    </View>

                    {/* Selected Address Preview */}
                    {selectedAddress && (
                        <View
                            className="mb-4 rounded-2xl p-4"
                            style={{
                                backgroundColor: '#EDF7E9',
                                borderWidth: 1,
                                borderColor: '#C8E4C1',
                            }}
                        >
                            <View className="mb-2 flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <MaterialCommunityIcons
                                        name="check-circle"
                                        size={20}
                                        color={GREEN}
                                    />

                                    <Text className="ml-2 font-extrabold text-gray-900">
                                        {selectedAddress.addressType}
                                    </Text>
                                </View>

                                {(selectedAddress.isDefault ||
                                    selectedAddress.default) && (
                                        <View className="rounded-full bg-white px-2 py-1">
                                            <Text
                                                className="text-[10px] font-bold"
                                                style={{ color: GREEN }}
                                            >
                                                DEFAULT
                                            </Text>
                                        </View>
                                    )}
                            </View>

                            <Text className="text-sm font-bold text-gray-800">
                                {selectedAddress.fullName}
                            </Text>

                            <Text
                                className="mt-1 text-sm"
                                style={{ color: MUTED }}
                            >
                                {selectedAddress.mobileNumber}
                            </Text>

                            <Text
                                className="mt-2 text-sm leading-6"
                                style={{ color: MUTED }}
                            >
                                {formatAddress(selectedAddress)}
                            </Text>

                            {!!selectedAddress.landmark && (
                                <Text
                                    className="mt-1 text-xs"
                                    style={{ color: MUTED }}
                                >
                                    Landmark: {selectedAddress.landmark}
                                </Text>
                            )}
                        </View>
                    )}

                    {/* Show / Hide Address List */}
                    <TouchableOpacity
                        onPress={handleChooseAddress}
                        disabled={loadingAddresses}
                        activeOpacity={0.85}
                        className="flex-row items-center justify-center rounded-xl px-4 py-3"
                        style={{
                            backgroundColor: FOREST,
                            opacity: loadingAddresses ? 0.7 : 1,
                        }}
                    >
                        <MaterialCommunityIcons
                            name={
                                selectedAddress
                                    ? 'swap-horizontal'
                                    : 'map-marker-plus-outline'
                            }
                            size={20}
                            color="white"
                        />

                        <Text className="ml-2 font-bold text-white">
                            {showAddresses
                                ? 'Hide Saved Addresses'
                                : selectedAddress
                                    ? 'Change Delivery Address'
                                    : 'Choose Delivery Address'}
                        </Text>

                        <MaterialCommunityIcons
                            name={
                                showAddresses
                                    ? 'chevron-up'
                                    : 'chevron-down'
                            }
                            size={20}
                            color="white"
                            style={{ marginLeft: 6 }}
                        />
                    </TouchableOpacity>

                    {/* Loading */}
                    {loadingAddresses && (
                        <View className="items-center py-6">
                            <ActivityIndicator
                                size="large"
                                color={FOREST}
                            />

                            <Text
                                className="mt-3 text-sm"
                                style={{ color: MUTED }}
                            >
                                Loading your saved addresses...
                            </Text>
                        </View>
                    )}

                    {/* Error */}
                    {!!addressError && !loadingAddresses && (
                        <View
                            className="mt-3 rounded-xl p-3"
                            style={{ backgroundColor: '#FEF2F2' }}
                        >
                            <Text className="text-sm leading-5 text-red-600">
                                {addressError}
                            </Text>

                            {addresses.length === 0 && (
                                <TouchableOpacity
                                    onPress={handleRetryAddresses}
                                    className="mt-3 self-start rounded-lg bg-red-100 px-4 py-2"
                                >
                                    <Text className="text-sm font-bold text-red-700">
                                        Try Again
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* Saved Address List */}
                    {showAddresses &&
                        !loadingAddresses &&
                        addresses.length > 0 && (
                            <View className="mt-4">
                                <Text className="mb-2 text-sm font-bold text-gray-800">
                                    Your Saved Addresses ({addresses.length})
                                </Text>

                                {addresses.map((address) => {
                                    const isSelected =
                                        selectedAddress?.addressId ===
                                        address.addressId;

                                    return (
                                        <TouchableOpacity
                                            key={address.addressId}
                                            onPress={() =>
                                                handleSelectAddress(address)
                                            }
                                            activeOpacity={0.85}
                                            className="mb-3 rounded-2xl p-4"
                                            style={{
                                                borderWidth: isSelected ? 1.5 : 1,
                                                borderColor: isSelected
                                                    ? GREEN
                                                    : BORDER,
                                                backgroundColor: isSelected
                                                    ? '#F0F8ED'
                                                    : '#FFFFFF',
                                            }}
                                        >
                                            <View className="flex-row items-start">
                                                <MaterialCommunityIcons
                                                    name={
                                                        isSelected
                                                            ? 'radiobox-marked'
                                                            : 'radiobox-blank'
                                                    }
                                                    size={23}
                                                    color={
                                                        isSelected ? GREEN : '#A0AAA0'
                                                    }
                                                    style={{ marginTop: 1 }}
                                                />

                                                <View className="ml-3 flex-1">
                                                    <View className="mb-2 flex-row flex-wrap items-center">
                                                        <Text className="mr-2 text-sm font-extrabold text-gray-900">
                                                            {address.addressType}
                                                        </Text>

                                                        {(address.isDefault ||
                                                            address.default) && (
                                                                <View
                                                                    className="rounded-md px-2 py-1"
                                                                    style={{
                                                                        backgroundColor: '#E0EEDF',
                                                                    }}
                                                                >
                                                                    <Text
                                                                        className="text-[10px] font-bold"
                                                                        style={{ color: FOREST }}
                                                                    >
                                                                        DEFAULT
                                                                    </Text>
                                                                </View>
                                                            )}
                                                    </View>

                                                    <Text className="text-sm font-bold text-gray-800">
                                                        {address.fullName}
                                                    </Text>

                                                    <Text
                                                        className="mt-1 text-sm"
                                                        style={{ color: MUTED }}
                                                    >
                                                        {address.mobileNumber}
                                                    </Text>

                                                    <Text
                                                        className="mt-2 text-sm leading-5"
                                                        style={{ color: MUTED }}
                                                    >
                                                        {formatAddress(address)}
                                                    </Text>

                                                    {!!address.landmark && (
                                                        <Text
                                                            className="mt-1 text-xs"
                                                            style={{ color: MUTED }}
                                                        >
                                                            Landmark: {address.landmark}
                                                        </Text>
                                                    )}

                                                    {isSelected && (
                                                        <View className="mt-3 flex-row items-center">
                                                            <MaterialCommunityIcons
                                                                name="check-circle"
                                                                size={16}
                                                                color={GREEN}
                                                            />

                                                            <Text
                                                                className="ml-1 text-xs font-bold"
                                                                style={{ color: GREEN }}
                                                            >
                                                                Selected for delivery
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}

                    {/* No saved addresses */}
                    {showAddresses &&
                        !loadingAddresses &&
                        addresses.length === 0 &&
                        !addressError && (
                            <View className="items-center py-5">
                                <MaterialCommunityIcons
                                    name="map-marker-off-outline"
                                    size={38}
                                    color="#9BA99C"
                                />

                                <Text className="mt-2 text-sm font-semibold text-gray-700">
                                    No saved addresses
                                </Text>

                                <Text className="mt-1 text-center text-xs leading-5 text-gray-500">
                                    Add a delivery address to continue with checkout.
                                </Text>
                            </View>
                        )}
                </View>

                {/* ==================== ORDER QUANTITY ==================== */}

                <View
                    className="mb-5 rounded-3xl bg-white p-5"
                    style={{
                        borderWidth: 1,
                        borderColor: BORDER,
                    }}
                >
                    <View className="flex-row items-center">
                        <View
                            className="h-11 w-11 items-center justify-center rounded-2xl"
                            style={{ backgroundColor: '#EAF5E7' }}
                        >
                            <MaterialCommunityIcons
                                name="basket-outline"
                                size={23}
                                color={FOREST}
                            />
                        </View>

                        <View className="ml-3 flex-1">
                            <Text className="text-base font-extrabold text-gray-900">
                                Order Quantity
                            </Text>

                            <Text
                                className="mt-1 text-xs"
                                style={{ color: MUTED }}
                            >
                                Choose how many units you need
                            </Text>
                        </View>
                    </View>

                    <View
                        className="mt-5 flex-row items-center justify-between rounded-2xl p-3"
                        style={{ backgroundColor: '#F7F9F5' }}
                    >
                        <TouchableOpacity
                            disabled={quantity <= MIN_QUANTITY}
                            onPress={decreaseQuantity}
                            className="h-11 w-11 items-center justify-center rounded-xl"
                            style={{
                                backgroundColor:
                                    quantity <= MIN_QUANTITY
                                        ? '#E5E9E3'
                                        : '#E0EEDF',
                            }}
                        >
                            <MaterialCommunityIcons
                                name="minus"
                                size={22}
                                color={
                                    quantity <= MIN_QUANTITY
                                        ? '#9AA39A'
                                        : FOREST
                                }
                            />
                        </TouchableOpacity>

                        <View className="items-center">
                            <Text className="text-2xl font-extrabold text-gray-900">
                                {quantity}
                            </Text>

                            <Text
                                className="mt-1 text-xs"
                                style={{ color: MUTED }}
                            >
                                {productUnit}
                            </Text>
                        </View>

                        <TouchableOpacity
                            disabled={quantity >= MAX_QUANTITY}
                            onPress={increaseQuantity}
                            className="h-11 w-11 items-center justify-center rounded-xl"
                            style={{
                                backgroundColor:
                                    quantity >= MAX_QUANTITY
                                        ? '#E5E9E3'
                                        : FOREST,
                            }}
                        >
                            <MaterialCommunityIcons
                                name="plus"
                                size={22}
                                color={
                                    quantity >= MAX_QUANTITY
                                        ? '#9AA39A'
                                        : 'white'
                                }
                            />
                        </TouchableOpacity>
                    </View>
                </View>


                {/* ==================== PAYMENT METHOD ==================== */}

                <View
                    className="mb-5 rounded-3xl bg-white p-5"
                    style={{
                        borderWidth: 1,
                        borderColor: BORDER,
                    }}
                >
                    <Text className="text-base font-extrabold text-gray-900">
                        Payment Method
                    </Text>

                    <Text className="mt-1 text-xs" style={{ color: MUTED }}>
                        Choose how you want to pay
                    </Text>

                    {/* Cash on Delivery */}
                    <TouchableOpacity
                        onPress={() => setPaymentMethod('COD')}
                        activeOpacity={0.85}
                        className="mt-4 flex-row items-center rounded-2xl p-4"
                        style={{
                            backgroundColor:
                                paymentMethod === 'COD' ? '#EDF7E9' : '#FFFFFF',
                            borderWidth: 1.5,
                            borderColor:
                                paymentMethod === 'COD' ? GREEN : BORDER,
                        }}
                    >
                        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white">
                            <MaterialCommunityIcons
                                name="cash-multiple"
                                size={27}
                                color={FOREST}
                            />
                        </View>

                        <View className="ml-3 flex-1">
                            <Text className="text-sm font-extrabold text-gray-900">
                                Cash on Delivery
                            </Text>

                            <Text className="mt-1 text-xs" style={{ color: MUTED }}>
                                Pay when your order arrives
                            </Text>
                        </View>

                        <MaterialCommunityIcons
                            name={
                                paymentMethod === 'COD'
                                    ? 'radiobox-marked'
                                    : 'radiobox-blank'
                            }
                            size={24}
                            color={paymentMethod === 'COD' ? GREEN : MUTED}
                        />
                    </TouchableOpacity>

                    {/* Online Payment */}
                    <TouchableOpacity
                        onPress={() => setPaymentMethod('ONLINE')}
                        activeOpacity={0.85}
                        className="mt-3 flex-row items-center rounded-2xl p-4"
                        style={{
                            backgroundColor:
                                paymentMethod === 'ONLINE' ? '#EDF7E9' : '#FFFFFF',
                            borderWidth: 1.5,
                            borderColor:
                                paymentMethod === 'ONLINE' ? GREEN : BORDER,
                        }}
                    >
                        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white">
                            <MaterialCommunityIcons
                                name="credit-card-outline"
                                size={27}
                                color={FOREST}
                            />
                        </View>

                        <View className="ml-3 flex-1">
                            <Text className="text-sm font-extrabold text-gray-900">
                                Online Payment
                            </Text>

                            <Text className="mt-1 text-xs" style={{ color: MUTED }}>
                                UPI, Debit/Credit Card, Net Banking
                            </Text>
                        </View>

                        <MaterialCommunityIcons
                            name={
                                paymentMethod === 'ONLINE'
                                    ? 'radiobox-marked'
                                    : 'radiobox-blank'
                            }
                            size={24}
                            color={paymentMethod === 'ONLINE' ? GREEN : MUTED}
                        />
                    </TouchableOpacity>

                    {/* Payment Information */}
                    <View className="mt-3 flex-row items-start rounded-xl p-3"
                        style={{ backgroundColor: '#F5F8F2' }}
                    >
                        <MaterialCommunityIcons
                            name="information-outline"
                            size={18}
                            color={FOREST}
                        />

                        <Text className="ml-2 flex-1 text-xs leading-5"
                            style={{ color: MUTED }}
                        >
                            {paymentMethod === 'COD'
                                ? 'Keep the total amount ready and pay the delivery partner when your order arrives.'
                                : 'You will be redirected to a secure payment gateway to complete your payment.'}
                        </Text>
                    </View>
                </View>

                {/* ==================== ORDER SUMMARY ==================== */}

                <View
                    className="mb-5 rounded-3xl bg-white p-5"
                    style={{
                        borderWidth: 1,
                        borderColor: BORDER,
                    }}
                >
                    <View className="mb-4 flex-row items-center">
                        <MaterialCommunityIcons
                            name="receipt-text-outline"
                            size={23}
                            color={FOREST}
                        />

                        <Text className="ml-2 text-base font-extrabold text-gray-900">
                            Order Summary
                        </Text>
                    </View>

                    <View className="mb-3 flex-row justify-between">
                        <Text
                            className="text-sm"
                            style={{ color: MUTED }}
                        >
                            Unit price
                        </Text>

                        <Text className="text-sm font-semibold text-gray-800">
                            {formatPrice(unitPrice)}
                        </Text>
                    </View>

                    <View className="mb-3 flex-row justify-between">
                        <Text
                            className="text-sm"
                            style={{ color: MUTED }}
                        >
                            Quantity
                        </Text>

                        <Text className="text-sm font-semibold text-gray-800">
                            × {quantity}
                        </Text>
                    </View>

                    <View className="mb-3 flex-row justify-between">
                        <Text
                            className="text-sm"
                            style={{ color: MUTED }}
                        >
                            Item total
                        </Text>

                        <Text className="text-sm font-semibold text-gray-800">
                            {formatPrice(subtotal)}
                        </Text>
                    </View>

                    <View className="mb-3 flex-row justify-between">
                        <Text
                            className="text-sm"
                            style={{ color: MUTED }}
                        >
                            Platform fee
                        </Text>

                        <Text className="text-sm font-semibold text-gray-800">
                            {formatPrice(platformFee)}
                        </Text>
                    </View>

                    <View className="mb-4 flex-row justify-between">
                        <Text
                            className="text-sm"
                            style={{ color: MUTED }}
                        >
                            Delivery charge
                        </Text>

                        <Text className="text-sm font-semibold text-gray-800">
                            {formatPrice(deliveryCharge)}
                        </Text>
                    </View>

                    <View
                        className="flex-row items-center justify-between border-t pt-4"
                        style={{ borderColor: BORDER }}
                    >
                        <View className="flex-1">
                            <Text className="text-base font-extrabold text-gray-900">
                                Total Payable
                            </Text>

                            <Text
                                className="mt-1 text-xs"
                                style={{ color: MUTED }}
                            >
                                Includes platform fee and delivery
                            </Text>
                        </View>

                        <Text
                            className="text-2xl font-extrabold"
                            style={{ color: FOREST }}
                        >
                            {formatPrice(totalAmount)}
                        </Text>
                    </View>
                </View>

                {/* ==================== TRUST INFORMATION ==================== */}

                <View className="mb-5 flex-row items-center justify-center">
                    <MaterialCommunityIcons
                        name="shield-check-outline"
                        size={18}
                        color={GREEN}
                    />

                    <Text
                        className="ml-2 text-xs"
                        style={{ color: MUTED }}
                    >
                        Review your order before confirming
                    </Text>
                </View>

                {/* ==================== PLACE ORDER ==================== */}

                <TouchableOpacity
                    onPress={() => handlePlaceOrder(paymentMethod)}
                    disabled={isPlacingOrder}
                    activeOpacity={0.85}
                    className="flex-row items-center justify-center rounded-2xl py-4"
                    style={{
                        backgroundColor: FOREST,
                        opacity: isPlacingOrder ? 0.7 : 1,
                        elevation: 4,
                        shadowColor: FOREST,
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                        shadowOffset: {
                            width: 0,
                            height: 4,
                        },
                    }}
                >
                    {isPlacingOrder ? (
                        <>
                            <ActivityIndicator
                                size="small"
                                color="white"
                            />

                            <Text className="ml-2 text-base font-extrabold text-white">
                                Placing Order...
                            </Text>
                        </>
                    ) : (
                        <>
                            <MaterialCommunityIcons
                                name="check-circle-outline"
                                size={23}
                                color="white"
                            />

                            <Text className="ml-2 text-base font-extrabold text-white">
                                Place Order · {formatPrice(totalAmount)}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                <Text
                    className="mt-3 text-center text-xs leading-5"
                    style={{ color: MUTED }}
                >
                    {paymentMethod === 'COD'
                        ? `Pay ${formatPrice(totalAmount)} when your order arrives.`
                        : `Pay ${formatPrice(totalAmount)} securely using Razorpay.`}
                </Text>
            </ScrollView>
        </View>
    );
}