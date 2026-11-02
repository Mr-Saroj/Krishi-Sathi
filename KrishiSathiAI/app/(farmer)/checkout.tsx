import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import {
  getAddresses,
  type FarmerAddress,
} from "../../src/farmer/services/farmerAddressService";

const FOREST = "#14532D";
const GREEN = "#2E7D32";
const MUTED = "#647568";
const BACKGROUND = "#F5F8F2";
const BORDER = "#E6EDE3";

export default function CheckoutScreen() {
  const router = useRouter();

  const { productId, product: productParam } =
    useLocalSearchParams<{
      productId: string;
      product: string;
    }>();

  // ==================== PRODUCT ====================

  const [product] = useState<any>(() => {
    try {
      if (!productParam) return null;

      const rawProduct = Array.isArray(productParam)
        ? productParam[0]
        : productParam;

      return JSON.parse(rawProduct);
    } catch {
      return null;
    }
  });

  const [quantity, setQuantity] = useState(1);

  const totalAmount = (Number(product?.price) || 0) * quantity;

  const formatPrice = (amount: number) =>
    `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // ==================== DELIVERY ADDRESSES ====================

  const [addresses, setAddresses] = useState<FarmerAddress[]>([]);

  const [selectedAddress, setSelectedAddress] =
    useState<FarmerAddress | null>(null);

  const [showAddresses, setShowAddresses] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressError, setAddressError] = useState("");

  const handleChooseAddress = async () => {
    // Hide the address list if it is already open.
    if (showAddresses) {
      setShowAddresses(false);
      return;
    }

    setShowAddresses(true);
    setAddressError("");

    // Avoid another request if addresses have already been loaded.
    if (addresses.length > 0) {
      return;
    }

    setLoadingAddresses(true);

    try {
      // Existing service calls:
      // GET /api/farmer/profile/addresses
      // JWT is attached by your existing Axios interceptor.
      const response = await getAddresses();

      setAddresses(response);

      if (response.length === 0) {
        setAddressError(
          "No saved addresses found. Please add an address first."
        );
        return;
      }

      // Preserve the current selection when possible.
      const currentAddress = selectedAddress
        ? response.find(
            (address) =>
              address.addressId === selectedAddress.addressId
          )
        : undefined;

      // Otherwise, select the default address or the first address.
      const defaultAddress = response.find(
        (address) =>
          address.isDefault === true || address.default === true
      );

      setSelectedAddress(
        currentAddress ?? defaultAddress ?? response[0]
      );
    } catch (error) {
      console.error("Failed to fetch farmer addresses:", error);

      setAddressError(
        "Unable to load saved addresses. Please try again."
      );
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleSelectAddress = (address: FarmerAddress) => {
    setSelectedAddress(address);
    setShowAddresses(false);
    setAddressError("");
  };

  const handleRetryAddresses = () => {
    setAddresses([]);
    setAddressError("");
    void handleChooseAddress();
  };

  // ==================== PLACE ORDER ====================

  const handlePlaceOrder = () => {
    if (!product || !productId) {
      Alert.alert(
        "Product unavailable",
        "Product information is missing."
      );
      return;
    }

    if (!selectedAddress) {
      Alert.alert(
        "Delivery Address Required",
        "Please select a delivery address before placing your order."
      );
      return;
    }

    const addressDetails = [
      selectedAddress.village,
      selectedAddress.postOffice,
      selectedAddress.district,
      selectedAddress.state,
      selectedAddress.pincode,
    ]
      .filter(Boolean)
      .join(", ");

    // UI only. No order API call is made.
    Alert.alert(
      "Order Summary",
      `Product: ${product.name}\n` +
        `Product ID: ${productId}\n` +
        `Quantity: ${quantity}\n` +
        `Delivery to: ${selectedAddress.fullName}\n` +
        `Mobile: ${selectedAddress.mobileNumber}\n` +
        `Address: ${addressDetails}\n` +
        `Payment: Cash on Delivery\n` +
        `Product Total: ${formatPrice(totalAmount)}`,
      [{ text: "OK" }]
    );
  };

  // ==================== PRODUCT ERROR ====================

  if (!product) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: BACKGROUND }}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor={BACKGROUND}
        />

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
            onPress={() => router.back()}
            className="mt-6 rounded-xl px-7 py-3"
            style={{ backgroundColor: FOREST }}
          >
            <Text className="font-bold text-white">
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==================== MAIN CHECKOUT ====================

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: BACKGROUND }}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BACKGROUND}
      />

      {/* Header */}
      <View
        className="flex-row items-center px-5 pb-4"
        style={{ paddingTop: 45 }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
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
          style={{ backgroundColor: "#E6F2E3" }}
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
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 8,
          paddingBottom: 30,
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
            style={{ backgroundColor: "#D5E4D1" }}
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
            style={{ backgroundColor: "#E8ECE7" }}
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
            shadowColor: "#000",
            shadowOpacity: 0.04,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 3 },
          }}
        >
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-base font-extrabold text-gray-900">
              Product Details
            </Text>

            <View
              className="rounded-full px-3 py-1"
              style={{ backgroundColor: "#EAF5E7" }}
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
              style={{ backgroundColor: "#F0F5EC" }}
            >
              {product.imageUrl ? (
                <Image
                  source={{ uri: product.imageUrl }}
                  resizeMode="contain"
                  style={{
                    width: "100%",
                    height: "100%",
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
                {product.brand || "Agricultural product"}
              </Text>

              <View
                className="mt-2 self-start rounded-lg px-2 py-1"
                style={{ backgroundColor: "#F1F5EF" }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: FOREST }}
                >
                  {product.category}
                </Text>
              </View>

              <Text
                className="mt-3 text-xl font-extrabold"
                style={{ color: FOREST }}
              >
                {formatPrice(Number(product.price) || 0)}
              </Text>

              <Text className="mt-1 text-[10px] text-gray-400">
                ID: {productId}
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
              {product.description || "No description available."}
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
              style={{ backgroundColor: "#EAF5E7" }}
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
                backgroundColor: "#EDF7E9",
                borderWidth: 1,
                borderColor: "#C8E4C1",
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
                {[
                  selectedAddress.village,
                  selectedAddress.postOffice,
                  selectedAddress.district,
                  selectedAddress.state,
                  selectedAddress.pincode,
                ]
                  .filter(Boolean)
                  .join(", ")}
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
            {/* FIX: "map-marker-edit-outline" is not a valid icon name.
                Using "swap-horizontal" for "change" and
                "map-marker-plus-outline" for "choose". */}
            <MaterialCommunityIcons
              name={
                selectedAddress
                  ? "swap-horizontal"
                  : "map-marker-plus-outline"
              }
              size={20}
              color="white"
            />

            <Text className="ml-2 font-bold text-white">
              {showAddresses
                ? "Hide Saved Addresses"
                : selectedAddress
                  ? "Change Delivery Address"
                  : "Choose Delivery Address"}
            </Text>

            <MaterialCommunityIcons
              name={showAddresses ? "chevron-up" : "chevron-down"}
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
              style={{ backgroundColor: "#FEF2F2" }}
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

                  const formattedAddress = [
                    address.village,
                    address.postOffice,
                    address.district,
                    address.state,
                    address.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ");

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
                          ? "#F0F8ED"
                          : "#FFFFFF",
                      }}
                    >
                      <View className="flex-row items-start">
                        {/* Radio Icon */}
                        <MaterialCommunityIcons
                          name={
                            isSelected
                              ? "radiobox-marked"
                              : "radiobox-blank"
                          }
                          size={23}
                          color={
                            isSelected ? GREEN : "#A0AAA0"
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
                                  backgroundColor: "#E0EEDF",
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
                            {formattedAddress}
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

          {/* Add Address Guidance */}
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
              style={{ backgroundColor: "#EAF5E7" }}
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
            style={{ backgroundColor: "#F7F9F5" }}
          >
            <TouchableOpacity
              disabled={quantity <= 1}
              onPress={() =>
                setQuantity((current) =>
                  Math.max(1, current - 1)
                )
              }
              className="h-11 w-11 items-center justify-center rounded-xl"
              style={{
                backgroundColor:
                  quantity <= 1 ? "#E5E9E3" : "#E0EEDF",
              }}
            >
              <MaterialCommunityIcons
                name="minus"
                size={22}
                color={quantity <= 1 ? "#9AA39A" : FOREST}
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
                {product.quantityUnit || "units"}
              </Text>
            </View>

            <TouchableOpacity
              disabled={quantity >= 99}
              onPress={() =>
                setQuantity((current) =>
                  Math.min(99, current + 1)
                )
              }
              className="h-11 w-11 items-center justify-center rounded-xl"
              style={{
                backgroundColor:
                  quantity >= 99 ? "#E5E9E3" : FOREST,
              }}
            >
              <MaterialCommunityIcons
                name="plus"
                size={22}
                color={quantity >= 99 ? "#9AA39A" : "white"}
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

          <Text
            className="mt-1 text-xs"
            style={{ color: MUTED }}
          >
            Choose how you want to pay
          </Text>

          <View
            className="mt-4 flex-row items-center rounded-2xl p-4"
            style={{
              backgroundColor: "#EDF7E9",
              borderWidth: 1.5,
              borderColor: GREEN,
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

              <Text
                className="mt-1 text-xs"
                style={{ color: MUTED }}
              >
                Pay when your order arrives
              </Text>
            </View>

            <MaterialCommunityIcons
              name="check-circle"
              size={25}
              color={GREEN}
            />
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
              {formatPrice(Number(product.price) || 0)}
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

          <View className="mb-4 flex-row justify-between">
            <Text
              className="text-sm"
              style={{ color: MUTED }}
            >
              Delivery charge
            </Text>

            <Text
              className="text-xs"
              style={{ color: MUTED }}
            >
              Not calculated yet
            </Text>
          </View>

          <View
            className="flex-row items-center justify-between border-t pt-4"
            style={{ borderColor: BORDER }}
          >
            <View className="flex-1">
              <Text className="text-base font-extrabold text-gray-900">
                Product Subtotal
              </Text>

              <Text
                className="mt-1 text-xs"
                style={{ color: MUTED }}
              >
                Delivery charge not included
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
          onPress={handlePlaceOrder}
          activeOpacity={0.85}
          className="flex-row items-center justify-center rounded-2xl py-4"
          style={{
            backgroundColor: FOREST,
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
          <MaterialCommunityIcons
            name="check-circle-outline"
            size={23}
            color="white"
          />

          <Text className="ml-2 text-base font-extrabold text-white">
            Place Order · {formatPrice(totalAmount)}
          </Text>
        </TouchableOpacity>

        <Text
          className="mt-3 text-center text-xs leading-5"
          style={{ color: MUTED }}
        >
          Cash on Delivery · Final delivery charges will be
          calculated separately.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}