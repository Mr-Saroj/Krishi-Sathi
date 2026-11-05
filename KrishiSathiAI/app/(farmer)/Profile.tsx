
import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import {
  getFarmerDetails,
  type FarmerDetails,
} from "../../src/farmer/services/farmerAddressService";

import FarmerAddress from "../../src/farmer/components/FarmerAddressScreen";
import OrderList from "../../src/farmer/components/OrderList";

type IconName =
  React.ComponentProps<typeof MaterialCommunityIcons>["name"];

const FOREST = "#14532D";
const LEAF = "#2E7D32";
const MUTED = "#5E7365";
const INK = "#1F2A24";

function Row({
  icon,
  label,
  value,
  danger,
}: {
  icon: IconName;
  label: string;
  value?: string;
  danger?: boolean;
}) {
  return (
    <View className="flex-row items-center border-b border-[#F0ECE0] py-4">
      <View
        className="h-10 w-10 items-center justify-center rounded-xl"
        style={{
          backgroundColor: danger ? "#FDE2E0" : "#DDF0DD",
        }}
      >
        <MaterialCommunityIcons
          name={icon}
          size={21}
          color={danger ? "#C0261B" : LEAF}
        />
      </View>

      <View className="ml-3 flex-1">
        <Text
          className="text-[15px] font-semibold"
          style={{ color: danger ? "#C0261B" : INK }}
        >
          {label}
        </Text>

        {value ? (
          <Text
            className="mt-0.5 text-[12px]"
            style={{ color: MUTED }}
          >
            {value}
          </Text>
        ) : null}
      </View>

      <MaterialCommunityIcons
        name="chevron-right"
        size={21}
        color={MUTED}
      />
    </View>
  );
}

export default function Profile() {
  const [farmer, setFarmer] = useState<FarmerDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const [showAddress, setShowAddress] = useState(false);
  const [showOrders, setShowOrders] = useState(false);

  // FETCH LOGGED-IN FARMER DETAILS
  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const data = await getFarmerDetails();

        if (isMounted) {
          setFarmer(data);
        }
      } catch (error: any) {
        console.error(
          "Failed to fetch farmer profile:",
          error?.response?.data ?? error?.message
        );

        if (isMounted) {
          Alert.alert(
            "Profile Error",
            error?.response?.data?.message ||
              "Unable to load your profile. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  // OPEN ADDRESS SCREEN
  const handleEditAddress = () => {
    setShowAddress(true);
  };

  // OPEN ORDER HISTORY
  const handleOrderHistory = () => {
    setShowOrders(true);
  };

  // SHOW ADDRESS SCREEN
  if (showAddress) {
    return (
      <FarmerAddress
        onBack={() => setShowAddress(false)}
      />
    );
  }

  // SHOW ORDER HISTORY SCREEN
  if (showOrders) {
    return (
      <OrderList
        onBack={() => setShowOrders(false)}
      />
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 130,
      }}
      className="bg-[#FAFAF6]"
    >
      {/* PROFILE HEADER */}
      <View
        className="mb-5 items-center rounded-3xl px-5 py-7"
        style={{ backgroundColor: FOREST }}
      >
        <View className="h-24 w-24 items-center justify-center rounded-full border-4 border-white/20 bg-white/15">
          <MaterialCommunityIcons
            name="account"
            size={52}
            color="#FFFFFF"
          />
        </View>

        {/* FARMER NAME */}
        <Text className="mt-4 text-center text-[22px] font-extrabold text-white">
          {loading
            ? "Loading profile..."
            : farmer?.fullName || "Farmer"}
        </Text>

        {/* MOBILE NUMBER */}
        <Text
          className="mt-1 text-[14px]"
          style={{ color: "rgba(255,255,255,0.85)" }}
        >
          {farmer?.mobileNumber
            ? `+91 ${farmer.mobileNumber}`
            : ""}
        </Text>

        <View className="mt-4 flex-row items-center rounded-full bg-white/15 px-4 py-2">
          <MaterialCommunityIcons
            name="sprout"
            size={16}
            color="#FFFFFF"
          />

          <Text className="ml-2 text-[12px] font-semibold text-white">
            Krishi Sathi Farmer
          </Text>
        </View>
      </View>

      {/* ACCOUNT SETTINGS */}
      <Text
        className="mb-2 ml-1 text-[13px] font-bold uppercase tracking-wider"
        style={{ color: MUTED }}
      >
        Account Settings
      </Text>

      <View className="mb-5 rounded-3xl bg-white px-4">

        {/* ORDER HISTORY */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={handleOrderHistory}
        >
          <Row
            icon="clipboard-list-outline"
            label="Order History"
            value="View your previous purchases"
          />
        </TouchableOpacity>

        {/* MY ADDRESSES */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={handleEditAddress}
        >
          <Row
            icon="map-marker-outline"
            label="My Addresses"
            value="View and manage your addresses"
          />
        </TouchableOpacity>

        {/* EMAIL */}
        <Row
          icon="email-outline"
          label="Email"
          value={farmer?.email || ""}
        />

        {/* LANGUAGE */}
        <Row
          icon="translate"
          label="Language"
          value="ଓଡ଼ିଆ"
        />

        {/* HELP */}
        <Row
          icon="help-circle-outline"
          label="Help & Support"
          value="Get assistance"
        />

        {/* LOGOUT */}
        <Row
          icon="logout"
          label="Logout"
          danger
        />
      </View>

      {/* LOADING INDICATOR */}
      {loading && (
        <View className="items-center py-3">
          <ActivityIndicator size="small" color={LEAF} />
        </View>
      )}

      {/* APP INFORMATION */}
      <View className="items-center py-3">
        <MaterialCommunityIcons
          name="leaf"
          size={24}
          color={LEAF}
        />

        <Text
          className="mt-1 text-[12px] font-semibold"
          style={{ color: MUTED }}
        >
          Krishi Sathi AI
        </Text>

        <Text
          className="mt-1 text-[11px]"
          style={{ color: "#94A39A" }}
        >
          Growing together with farmers
        </Text>
      </View>
    </ScrollView>
  );
}
