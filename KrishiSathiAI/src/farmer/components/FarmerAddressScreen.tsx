import React, { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import {
  addAddress,
  deleteAddress,
  getAddresses,
  type AddAddressRequest,
  type FarmerAddress as FarmerAddressType,
} from "../services/farmerAddressService";

const FOREST = "#14532D";
const LEAF = "#2E7D32";
const MUTED = "#5E7365";
const INK = "#1F2A24";

type AddressType = "HOME" | "FARM" | "OTHER";

const initialForm: AddAddressRequest = {
  addressType: "HOME",
  village: "",
  postOffice: "",
  district: "",
  state: "",
  pincode: "",
  landmark: "",
};

export default function FarmerAddress({
  onBack,
}: {
  onBack: () => void;
}) {
  const [addresses, setAddresses] = useState<FarmerAddressType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] =
    useState<AddAddressRequest>(initialForm);

  const [error, setError] = useState("");

  // GET: Fetch logged-in farmer's addresses
  const loadAddresses = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const data = await getAddresses();
      setAddresses(data);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        "Unable to load addresses. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadAddresses();
  }, [loadAddresses]);

  // Update form fields
  const updateField = <K extends keyof AddAddressRequest>(
    field: K,
    value: AddAddressRequest[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // POST: Add another address
  const handleAddAddress = async () => {
    const requiredFields = [
      form.village,
      form.postOffice,
      form.district,
      form.state,
      form.pincode,
    ];

    if (requiredFields.some((value) => !value.trim())) {
      Alert.alert(
        "Missing information",
        "Please fill in the village, post office, district, state and PIN code."
      );
      return;
    }

    if (!/^\d{6}$/.test(form.pincode.trim())) {
      Alert.alert(
        "Invalid PIN code",
        "Please enter a valid 6-digit Indian PIN code."
      );
      return;
    }

    setSubmitting(true);

    try {
      await addAddress({
        ...form,
        village: form.village.trim(),
        postOffice: form.postOffice.trim(),
        district: form.district.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        landmark: form.landmark?.trim() ?? "",
      });

      setForm(initialForm);
      setShowForm(false);

      await loadAddresses(true);

      Alert.alert("Success", "Address added successfully.");
    } catch (err: any) {
      Alert.alert(
        "Unable to add address",
        err?.response?.data?.message ??
          "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // DELETE: Remove one address
  const handleDeleteAddress = (address: FarmerAddressType) => {
    Alert.alert(
      "Delete address",
      `Are you sure you want to delete your ${address.addressType.toLowerCase()} address?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void confirmDelete(address.addressId);
          },
        },
      ]
    );
  };

  const confirmDelete = async (addressId: string) => {
    setDeletingId(addressId);

    try {
      await deleteAddress(addressId);

      // Refresh the list after deletion
      await loadAddresses(true);

      Alert.alert("Success", "Address deleted successfully.");
    } catch (err: any) {
      Alert.alert(
        "Unable to delete address",
        err?.response?.data?.message ??
          "Something went wrong. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Supports either JSON property name for the default flag.
  const isDefaultAddress = (address: FarmerAddressType) =>
    address.isDefault ?? address.default ?? false;

  const renderInput = (
    label: string,
    field: keyof AddAddressRequest,
    placeholder: string,
    options?: {
      keyboardType?: "default" | "number-pad";
      multiline?: boolean;
    }
  ) => (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold" style={{ color: INK }}>
        {label}
      </Text>

      <TextInput
        value={String(form[field] ?? "")}
        onChangeText={(value) => {
          if (field === "addressType") return;
          updateField(field, value as never);
        }}
        placeholder={placeholder}
        placeholderTextColor="#94A39A"
        keyboardType={options?.keyboardType ?? "default"}
        multiline={options?.multiline}
        textAlignVertical={options?.multiline ? "top" : "center"}
        maxLength={field === "pincode" ? 6 : undefined}
        className="rounded-xl border border-[#E4E9E1] bg-white px-4 py-3"
        style={{
          color: INK,
          minHeight: options?.multiline ? 80 : 48,
        }}
      />
    </View>
  );

  return (
    <View className="flex-1 bg-[#FAFAF6]">
      {/* Header */}
      <View className="flex-row items-center px-4 pb-4 pt-14">
        <TouchableOpacity
          onPress={onBack}
          accessibilityLabel="Go back"
          className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-white"
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={23}
            color={FOREST}
          />
        </TouchableOpacity>

        <View className="flex-1">
          <Text className="text-xl font-bold" style={{ color: INK }}>
            My Addresses
          </Text>

          <Text className="mt-1 text-xs" style={{ color: MUTED }}>
            Manage your saved delivery addresses
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => void loadAddresses(true)}
          disabled={loading || refreshing}
          accessibilityLabel="Refresh addresses"
          className="h-10 w-10 items-center justify-center rounded-xl bg-white"
        >
          <MaterialCommunityIcons
            name="refresh"
            size={22}
            color={LEAF}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 40,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Add Address Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setShowForm((previous) => !previous)}
          className="mb-5 flex-row items-center justify-center rounded-2xl border-2 border-dashed border-[#2E7D32] bg-[#EAF5E9] py-4"
        >
          <MaterialCommunityIcons
            name={
              showForm
                ? "close-circle-outline"
                : "plus-circle-outline"
            }
            size={22}
            color={LEAF}
          />

          <Text className="ml-2 font-bold" style={{ color: FOREST }}>
            {showForm ? "Cancel Adding Address" : "Add New Address"}
          </Text>
        </TouchableOpacity>

        {/* Add Address Form */}
        {showForm && (
          <View className="mb-6 rounded-3xl bg-white p-5">
            <Text className="mb-1 text-lg font-bold" style={{ color: INK }}>
              New Delivery Address
            </Text>

            <Text className="mb-5 text-xs" style={{ color: MUTED }}>
              Your name and mobile number are taken from your account.
            </Text>

            <Text className="mb-2 text-sm font-semibold" style={{ color: INK }}>
              Address Type
            </Text>

            <View className="mb-5 flex-row">
              {(["HOME", "FARM", "OTHER"] as AddressType[]).map((type) => {
                const selected = form.addressType === type;

                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => updateField("addressType", type)}
                    className="mr-2 flex-1 items-center rounded-xl border px-2 py-3"
                    style={{
                      backgroundColor: selected ? "#DDF0DD" : "#FFFFFF",
                      borderColor: selected ? LEAF : "#E4E9E1",
                    }}
                  >
                    <Text
                      className="text-xs font-bold"
                      style={{ color: selected ? FOREST : MUTED }}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {renderInput(
              "Village / Town *",
              "village",
              "Enter village or town"
            )}

            {renderInput(
              "Post Office *",
              "postOffice",
              "Enter post office"
            )}

            {renderInput(
              "District *",
              "district",
              "Enter district"
            )}

            {renderInput(
              "State *",
              "state",
              "Enter state"
            )}

            {renderInput(
              "PIN Code *",
              "pincode",
              "6-digit PIN code",
              {
                keyboardType: "number-pad",
              }
            )}

            {renderInput(
              "Landmark (optional)",
              "landmark",
              "Nearby landmark",
              {
                multiline: true,
              }
            )}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => void handleAddAddress()}
              disabled={submitting}
              className="mt-1 items-center rounded-xl py-4"
              style={{
                backgroundColor: submitting ? "#8BA68E" : FOREST,
              }}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="font-bold text-white">
                  Save Address
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Address List Heading */}
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-base font-bold" style={{ color: INK }}>
            Saved Addresses
          </Text>

          {!loading && (
            <Text className="text-xs" style={{ color: MUTED }}>
              {addresses.length}{" "}
              {addresses.length === 1 ? "address" : "addresses"}
            </Text>
          )}
        </View>

        {/* Loading */}
        {loading && (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color={LEAF} />

            <Text className="mt-3 text-sm" style={{ color: MUTED }}>
              Loading your addresses...
            </Text>
          </View>
        )}

        {/* Error */}
        {!loading && error !== "" && (
          <View className="items-center rounded-2xl bg-white p-6">
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={36}
              color="#C0261B"
            />

            <Text className="mt-3 text-center" style={{ color: INK }}>
              {error}
            </Text>

            <TouchableOpacity
              onPress={() => void loadAddresses()}
              className="mt-4 rounded-xl px-5 py-3"
              style={{ backgroundColor: FOREST }}
            >
              <Text className="font-bold text-white">Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State */}
        {!loading && !error && addresses.length === 0 && (
          <View className="items-center rounded-3xl bg-white px-6 py-10">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-[#DDF0DD]">
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={34}
                color={LEAF}
              />
            </View>

            <Text className="mt-4 text-base font-bold" style={{ color: INK }}>
              No addresses saved yet
            </Text>

            <Text
              className="mt-2 text-center text-sm"
              style={{ color: MUTED }}
            >
              Add a home or farm address for your deliveries.
            </Text>
          </View>
        )}

        {/* Saved Address Cards */}
        {!loading &&
          !error &&
          addresses.map((address) => {
            const isDefault = isDefaultAddress(address);
            const deleting = deletingId === address.addressId;

            return (
              <View
                key={address.addressId}
                className="mb-4 rounded-3xl border border-[#E8EDE5] bg-white p-4"
              >
                {/* Card Header */}
                <View className="mb-3 flex-row items-start">
                  <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#DDF0DD]">
                    <MaterialCommunityIcons
                      name={
                        address.addressType === "FARM"
                          ? "sprout"
                          : address.addressType === "HOME"
                            ? "home-outline"
                            : "map-marker-outline"
                      }
                      size={23}
                      color={LEAF}
                    />
                  </View>

                  <View className="ml-3 flex-1">
                    <Text
                      className="text-base font-bold"
                      style={{ color: INK }}
                    >
                      {address.addressType}
                    </Text>

                    <Text
                      className="mt-1 text-sm"
                      style={{ color: MUTED }}
                    >
                      {address.fullName}
                    </Text>
                  </View>

                  {isDefault && (
                    <View className="rounded-full bg-[#DDF0DD] px-3 py-1">
                      <Text
                        className="text-[10px] font-bold"
                        style={{ color: FOREST }}
                      >
                        DEFAULT
                      </Text>
                    </View>
                  )}
                </View>

                {/* Address Details */}
                <Text
                  className="text-sm leading-6"
                  style={{ color: INK }}
                >
                  {address.village}, {address.postOffice},{"\n"}
                  {address.district}, {address.state} - {address.pincode}
                </Text>

                {!!address.landmark && (
                  <Text className="mt-1 text-xs" style={{ color: MUTED }}>
                    Landmark: {address.landmark}
                  </Text>
                )}

                <View className="mt-3 flex-row items-center">
                  <MaterialCommunityIcons
                    name="phone-outline"
                    size={16}
                    color={MUTED}
                  />

                  <Text className="ml-2 text-xs" style={{ color: MUTED }}>
                    {address.mobileNumber
                      ? `+91 ${address.mobileNumber}`
                      : ""}
                  </Text>
                </View>

                {/* Delete Action */}
                <View className="mt-4 border-t border-[#F0ECE0] pt-3">
                  <TouchableOpacity
                    activeOpacity={0.7}
                    disabled={deleting}
                    onPress={() => handleDeleteAddress(address)}
                    className="flex-row items-center justify-center rounded-xl bg-[#FDEDEC] py-3"
                  >
                    {deleting ? (
                      <ActivityIndicator color="#C0261B" />
                    ) : (
                      <>
                        <MaterialCommunityIcons
                          name="delete-outline"
                          size={19}
                          color="#C0261B"
                        />

                        <Text
                          className="ml-2 font-bold"
                          style={{ color: "#C0261B" }}
                        >
                          Delete Address
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

        {/* Refresh indicator */}
        {refreshing && (
          <ActivityIndicator
            className="my-3"
            color={LEAF}
            size="small"
          />
        )}
      </ScrollView>
    </View>
  );
}