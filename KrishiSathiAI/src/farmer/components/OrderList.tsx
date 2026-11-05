
import React from "react";

import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { formatOrderDate ,formatPrice,getOrderStatusColor,getOrderStatusLabel} from "../utils/orderUtils";


type IconName =
  React.ComponentProps<typeof MaterialCommunityIcons>["name"];

const FOREST = "#14532D";
const LEAF = "#2E7D32";
const MUTED = "#5E7365";

interface Props {
  onBack: () => void;
}

// Temporary dummy data for UI testing
const dummyOrders = [
  {
    id: "ORD1001",
    orderNumber: "ORD1001",
    items: [
      {
        productId: "P101",
        productName: "Organic Tomato Seeds",
        quantity: 2,
        quantityUnit: "pack",
        price: 120,
      },
      {
        productId: "P102",
        productName: "Organic Fertilizer",
        quantity: 5,
        quantityUnit: "kg",
        price: 80,
      },
    ],
    totalAmount: 640,
    orderStatus: "DELIVERED",
    paymentStatus: "PAID",
    createdAt: "2026-11-02T10:30:00",
  },
  {
    id: "ORD1002",
    orderNumber: "ORD1002",
    items: [
      {
        productId: "P103",
        productName: "Rice Seeds",
        quantity: 3,
        quantityUnit: "kg",
        price: 150,
      },
    ],
    totalAmount: 450,
    orderStatus: "PROCESSING",
    paymentStatus: "PAID",
    createdAt: "2026-11-04T14:20:00",
  },
  {
    id: "ORD1003",
    orderNumber: "ORD1003",
    items: [
      {
        productId: "P104",
        productName: "Crop Protection Spray",
        quantity: 2,
        quantityUnit: "piece",
        price: 250,
      },
    ],
    totalAmount: 500,
    orderStatus: "PENDING",
    paymentStatus: "PENDING",
    createdAt: "2026-11-05T09:15:00",
  },
];

function OrderCard({ order }: { order: (typeof dummyOrders)[number] }) {
  const statusColor = getOrderStatusColor(order.orderStatus);

  return (
    <View className="mb-4 rounded-2xl bg-white p-4">

      {/* ORDER HEADER */}
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-[11px] text-gray-500">
            Order ID
          </Text>

          <Text className="mt-1 font-bold text-[#1F2A24]">
            #{order.orderNumber}
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

      {/* PRODUCTS */}
      {order.items.map((item, index) => (
        <View
          key={`${item.productId}-${index}`}
          className="mb-3 flex-row items-center"
        >
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#E8F5E9]">
            <MaterialCommunityIcons
              name="sprout"
              size={23}
              color={LEAF}
            />
          </View>

          <View className="ml-3 flex-1">
            <Text className="font-semibold text-[#1F2A24]">
              {item.productName}
            </Text>

            <Text className="mt-1 text-[12px] text-gray-500">
              Qty: {item.quantity} {item.quantityUnit}
            </Text>
          </View>

          <Text className="font-semibold text-[#1F2A24]">
            {formatPrice(item.price * item.quantity)}
          </Text>
        </View>
      ))}

      <View className="my-2 border-t border-gray-100" />

      {/* ORDER DETAILS */}
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-[11px] text-gray-500">
            Order Date
          </Text>

          <Text className="mt-1 text-[12px] font-semibold text-gray-700">
            {formatOrderDate(order.createdAt)}
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-[11px] text-gray-500">
            Total Amount
          </Text>

          <Text className="mt-1 text-[17px] font-extrabold text-[#14532D]">
            {formatPrice(order.totalAmount)}
          </Text>
        </View>
      </View>

      {/* PAYMENT STATUS */}
      <View className="mt-3 flex-row items-center">
        <MaterialCommunityIcons
          name="credit-card-check-outline"
          size={16}
          color={MUTED}
        />

        <Text className="ml-2 text-[12px] text-gray-500">
          Payment: {order.paymentStatus}
        </Text>
      </View>
    </View>
  );
}

export default function OrderList({ onBack }: Props) {
  const orders = dummyOrders;

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
            {orders.length} Orders
          </Text>
        </View>
      </View>

      {/* ORDER LIST */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 40,
        }}
      >
        <Text className="mb-3 text-[13px] font-bold text-[#5E7365]">
          RECENT ORDERS
        </Text>

        {orders.length > 0 ? (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
            />
          ))
        ) : (
          <View className="items-center justify-center py-20">
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
    </View>
  );
}
