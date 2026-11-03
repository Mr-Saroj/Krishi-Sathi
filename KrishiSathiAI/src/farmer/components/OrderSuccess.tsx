import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';

const FOREST = '#14532D';
const GREEN = '#2E7D32';
const AMBER = '#F5A623';
const MUTED = '#647568';

export type OrderSuccessData = {
  id: string;
  farmerId: string;
  productId: string;
  quantity: number;
  productQuantity: string;
  productTotal: number;
  platformFee: number;
  deliveryFee: number;
  totalSumFee: number;
  paymentMode: string;
  paymentStatus: string;
  farmerDeliveryAddressId: string;
};

type Props = {
  order: OrderSuccessData;
  onContinueShopping: () => void;
};

const formatPrice = (amount: number) =>
  `₹${Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function OrderSuccess({
  order,
  onContinueShopping,
}: Props) {
  return (
    <SafeAreaView className="flex-1 bg-[#F7FAF7]">

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 25,
        }}
      >
        {/* Back Button */}
        <View className="px-5 pt-3">
          <TouchableOpacity
            onPress={onContinueShopping}
            activeOpacity={0.75}
            className="flex-row items-center self-start rounded-xl bg-white px-4 py-3"
            style={{
              elevation: 2,
              shadowColor: '#000',
              shadowOpacity: 0.05,
              shadowRadius: 5,
            }}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={21}
              color={FOREST}
            />

            <Text
              className="ml-2 text-sm font-bold"
              style={{ color: FOREST }}
            >
              Back to Shop
            </Text>
          </TouchableOpacity>
        </View>

        {/* Success Section */}
        <View className="items-center px-6 pt-9 pb-8">
          <View
            className="h-28 w-28 items-center justify-center rounded-full"
            style={{ backgroundColor: '#DCFCE7' }}
          >
            <View
              className="h-20 w-20 items-center justify-center rounded-full"
              style={{ backgroundColor: '#BBF7D0' }}
            >
              <MaterialCommunityIcons
                name="check-circle"
                size={58}
                color={GREEN}
              />
            </View>
          </View>

          <Text
            className="mt-7 text-center text-2xl font-extrabold"
            style={{ color: FOREST }}
          >
            Order Placed Successfully!
          </Text>

          <Text
            className="mt-3 px-5 text-center text-sm leading-6"
            style={{ color: MUTED }}
          >
            Thank you for shopping with Krishi Sathi. Your order has been
            successfully placed.
          </Text>

          <View
            className="mt-5 flex-row items-center rounded-full px-4 py-2"
            style={{ backgroundColor: '#DCFCE7' }}
          >
            <MaterialCommunityIcons
              name="check-decagram"
              size={18}
              color={GREEN}
            />

            <Text
              className="ml-2 text-sm font-bold"
              style={{ color: FOREST }}
            >
              Order Confirmed
            </Text>
          </View>
        </View>

        {/* Order ID Card */}
        <View
          className="mx-5 rounded-2xl bg-white p-5"
          style={{
            elevation: 2,
            shadowColor: '#000',
            shadowOpacity: 0.06,
            shadowRadius: 8,
          }}
        >
          <Text className="text-sm font-medium" style={{ color: MUTED }}>
            Your Order ID
          </Text>

          <View className="mt-2 flex-row items-center justify-between">
            <Text
              className="text-xl font-extrabold"
              style={{ color: FOREST }}
            >
              {order.id}
            </Text>

            <MaterialCommunityIcons
              name="receipt-text-check"
              size={25}
              color={GREEN}
            />
          </View>

          <View className="mt-4 border-t border-dashed border-gray-200 pt-4">
            <View className="flex-row items-center">
              <MaterialCommunityIcons
                name="truck-delivery-outline"
                size={22}
                color={GREEN}
              />

              <Text
                className="ml-2 text-sm font-semibold"
                style={{ color: FOREST }}
              >
                Your order is being processed
              </Text>
            </View>

            <Text className="mt-2 text-xs leading-5" style={{ color: MUTED }}>
              We will update your order status as it progresses.
            </Text>
          </View>
        </View>

        {/* Order Summary */}
        <View
          className="mx-5 mt-4 rounded-2xl bg-white p-5"
          style={{
            elevation: 2,
            shadowColor: '#000',
            shadowOpacity: 0.06,
            shadowRadius: 8,
          }}
        >
          <Text
            className="mb-4 text-base font-extrabold"
            style={{ color: FOREST }}
          >
            Order Summary
          </Text>

          <View className="mb-3 flex-row justify-between">
            <Text className="text-sm" style={{ color: MUTED }}>
              Product Quantity
            </Text>

            <Text className="text-sm font-semibold text-gray-800">
              {order.quantity} {order.productQuantity || 'unit(s)'}
            </Text>
          </View>

          <View className="mb-3 flex-row justify-between">
            <Text className="text-sm" style={{ color: MUTED }}>
              Product Total
            </Text>

            <Text className="text-sm font-semibold text-gray-800">
              {formatPrice(order.productTotal)}
            </Text>
          </View>

          <View className="mb-3 flex-row justify-between">
            <Text className="text-sm" style={{ color: MUTED }}>
              Platform Fee
            </Text>

            <Text className="text-sm font-semibold text-gray-800">
              {formatPrice(order.platformFee)}
            </Text>
          </View>

          <View className="mb-4 flex-row justify-between">
            <Text className="text-sm" style={{ color: MUTED }}>
              Delivery Fee
            </Text>

            <Text className="text-sm font-semibold text-gray-800">
              {formatPrice(order.deliveryFee)}
            </Text>
          </View>

          <View className="border-t border-dashed border-gray-200 pt-4">
            <View className="flex-row items-center justify-between">
              <Text
                className="text-base font-extrabold"
                style={{ color: FOREST }}
              >
                Total Amount
              </Text>

              <Text
                className="text-xl font-extrabold"
                style={{ color: GREEN }}
              >
                {formatPrice(order.totalSumFee)}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View
          className="mx-5 mt-4 rounded-2xl p-4"
          style={{ backgroundColor: '#FFF7E6' }}
        >
          <View className="flex-row items-center">
            <MaterialCommunityIcons
              name="cash-multiple"
              size={25}
              color="#B7791F"
            />

            <View className="ml-3 flex-1">
              <Text className="text-sm font-bold text-gray-800">
                Cash on Delivery
              </Text>

              <Text className="mt-1 text-xs" style={{ color: MUTED }}>
                Payment Status: {order.paymentStatus}
              </Text>
            </View>

            <View
              className="rounded-full px-3 py-1"
              style={{ backgroundColor: '#FDE68A' }}
            >
              <Text className="text-xs font-bold text-amber-900">
                COD
              </Text>
            </View>
          </View>
        </View>

        {/* Thank You Message */}
        <Text
          className="mt-6 mb-2 text-center text-xs"
          style={{ color: MUTED }}
        >
          Thank you for choosing Krishi Sathi AI 🌱
        </Text>
      </ScrollView>

      {/* Fixed Bottom Footer */}
      <View
        className="border-t border-gray-100 bg-white px-5 pt-3"
        style={{
          paddingBottom: 12,
          elevation: 10,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: -3 },
        }}
      >
        <TouchableOpacity
          onPress={onContinueShopping}
          activeOpacity={0.85}
          className="flex-row items-center justify-center rounded-2xl py-4"
          style={{
            backgroundColor: FOREST,
            elevation: 3,
            shadowColor: FOREST,
            shadowOpacity: 0.2,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 3 },
          }}
        >
          <MaterialCommunityIcons
            name="shopping-outline"
            size={22}
            color="white"
          />

          <Text className="ml-2 text-base font-extrabold text-white">
            Continue Shopping
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}