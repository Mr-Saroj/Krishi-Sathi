import React from "react";

import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  RefreshControl,
  Image,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import {
  formatPrice,
  getOrderStatusColor,
  getOrderStatusLabel,
  getPaymentStatusColor,
} from "../utils/orderUtils";

import type { FarmerOrder } from "../types/order.types";

const FOREST = "#14532D";
const LEAF = "#2E7D32";

interface Props {
  orders: FarmerOrder[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;

  onBack: () => void;
  onRefresh: () => void;
  onSelectOrder: (orderId: string) => void;
}

function OrderCard({
  order,
  onPress,
}: {
  order: FarmerOrder;
  onPress: () => void;
}) {
  const statusColor = getOrderStatusColor(order.orderStatus);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="mb-4 rounded-2xl bg-white p-4"
    >
      {/* HEADER */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="mt-1 font-bold text-[#1F2A24]">
           PRODUCT STATUS:
          </Text>
        </View>

        <View
          className="rounded-full px-3 py-2"
          style={{ backgroundColor: `${statusColor}15` }}
        >
          <Text
            className="text-[11px] font-bold"
            style={{ color: statusColor }}
          >
            {getOrderStatusLabel(order.orderStatus)}
          </Text>
        </View>
      </View>

      <View className="my-3 border-t border-gray-100" />

      {/* PRODUCT */}
      <View className="flex-row items-center">
        {/* PRODUCT IMAGE */}
        <View className="h-16 w-16 overflow-hidden items-center justify-center rounded-xl bg-[#E8F5E9]">
          {order.productImage ? (
            <Image
              source={{ uri: order.productImage }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <MaterialCommunityIcons
              name="sprout"
              size={30}
              color={LEAF}
            />
          )}
        </View>

        {/* PRODUCT DETAILS */}
        <View className="ml-3 flex-1">
          <Text
            className="font-bold text-[#1F2A24]"
            numberOfLines={2}
          >
            {order.productName || "Product unavailable"}
          </Text>

          <Text className="mt-1 text-[11px] text-gray-500">
            Product ID: {order.productId}
          </Text>

          <Text className="mt-1 text-[12px] text-gray-500">
            Quantity: {order.quantity} × {order.productQuantity}
          </Text>
        </View>

        <Text className="ml-2 font-bold text-[#1F2A24]">
          {formatPrice(order.productTotal)}
        </Text>
      </View>

      <View className="my-3 border-t border-gray-100" />

      {/* TOTAL */}
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-[11px] text-gray-500">
            Payment Method
          </Text>

          <Text className="mt-1 text-[12px] font-semibold text-gray-700">
            {order.paymentMode}
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-[11px] text-gray-500">
            Total Amount
          </Text>

          <Text className="mt-1 text-[17px] font-extrabold text-[#14532D]">
            {formatPrice(order.totalSumFee)}
          </Text>
        </View>
      </View>

      {/* PAYMENT */}
      <View className="mt-3 flex-row items-center justify-between">
        <Text className="text-[12px] text-gray-500">
          Payment:{" "}
          <Text
            style={{
              color: getPaymentStatusColor(order.paymentStatus),
              fontWeight: "700",
            }}
          >
            {order.paymentStatus}
          </Text>
        </Text>

        <View className="flex-row items-center">
          <Text className="mr-1 text-[12px] font-semibold text-[#2E7D32]">
            View Details
          </Text>

          <MaterialCommunityIcons
            name="chevron-right"
            size={19}
            color={LEAF}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function OrderList({
  orders,
  loading,
  refreshing,
  error,
  onBack,
  onRefresh,
  onSelectOrder,
}: Props) {
  return (
    <View className="flex-1 bg-[#FAFAF6]">

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
            Order History
          </Text>

          <Text className="text-[12px] text-gray-500">
            View your previous purchases
          </Text>
        </View>

        <View className="rounded-full bg-[#E8F5E9] px-3 py-2">
          <Text className="text-[12px] font-bold text-[#14532D]">
            {(orders ?? []).length} Orders
          </Text>
        </View>
      </View>

      {/* CONTENT */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={FOREST} />

          <Text className="mt-3 text-[13px] text-gray-500">
            Loading your orders...
          </Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={60}
            color="#DC2626"
          />

          <Text className="mt-4 text-center font-bold text-[#1F2A24]">
            Unable to load orders
          </Text>

          <Text className="mt-2 text-center text-[13px] text-gray-500">
            {error}
          </Text>

          <TouchableOpacity
            onPress={onRefresh}
            className="mt-5 rounded-xl bg-[#14532D] px-6 py-3"
          >
            <Text className="font-bold text-white">
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[FOREST]}
            />
          }
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 40,
            flexGrow: 1,
          }}
        >
          <Text className="mb-3 text-[13px] font-bold text-[#5E7365]">
            RECENT ORDERS
          </Text>

          {(orders ?? []).length > 0 ? (
            (orders ?? []).map((order) => (
              <OrderCard
                key={order.orderId}
                order={order}
                onPress={() => onSelectOrder(order.orderId)}
              />
            ))
          ) : (
            <View className="flex-1 items-center justify-center py-20">
              <MaterialCommunityIcons
                name="clipboard-text-outline"
                size={75}
                color="#A5B5A8"
              />

              <Text className="mt-4 text-[18px] font-bold text-[#1F2A24]">
                No Orders Yet
              </Text>

              <Text className="mt-2 text-center text-[13px] text-gray-500">
                Your purchased products will appear here.
                Start shopping with Krishi Sathi!
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}