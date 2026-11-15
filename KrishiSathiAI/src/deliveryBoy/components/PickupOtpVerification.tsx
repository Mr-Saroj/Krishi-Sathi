
import React, { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { deliveryAssignmentService } from "../services/deliveryAssignmentService";

const FOREST = "#14532D";
const MUTED = "#5E7365";
const MINT = "#EEF3EC";
const RED = "#C9503C";
const LINE = "#DCE6DE";

type Props = {
  orderId: string;
  onVerified: (orderId: string) => void;
};

export default function PickupOtpVerification({
  orderId,
  onVerified,
}: Props) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await deliveryAssignmentService.verifyPickupOtp(
          orderId,
          otp
        );

      if (response.success) {
        setSuccess(true);
        onVerified(orderId);
      } else {
        setError(response.message || "Invalid pickup OTP.");
      }
    } catch (err: any) {
      console.error(
        "Pickup OTP verification failed:",
        err.response?.data || err.message
      );

      const message =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Unable to verify OTP. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View
        className="rounded-2xl p-4"
        style={{ backgroundColor: MINT }}
      >
        <View className="flex-row items-center">
          <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-white">
            <Text className="text-lg font-bold" style={{ color: FOREST }}>
              ✓
            </Text>
          </View>

          <View className="flex-1">
            <Text
              className="text-[16px] font-bold"
              style={{ color: FOREST }}
            >
              Pickup verified successfully
            </Text>

            <Text
              className="mt-1 text-[13px]"
              style={{ color: MUTED }}
            >
              Order is now out for delivery.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View
      className="rounded-2xl p-4"
      style={{ backgroundColor: MINT }}
    >
      <Text
        className="text-[16px] font-bold"
        style={{ color: FOREST }}
      >
        Shop pickup verification
      </Text>

      <Text
        className="mt-1 text-[13px]"
        style={{ color: MUTED }}
      >
        Ask the shop seller for the 6-digit pickup OTP.
      </Text>

      <TextInput
        value={otp}
        onChangeText={(value) => {
          const digitsOnly = value.replace(/[^0-9]/g, "").slice(0, 6);
          setOtp(digitsOnly);
          setError("");
        }}
        placeholder="Enter 6-digit OTP"
        placeholderTextColor={MUTED}
        keyboardType="number-pad"
        maxLength={6}
        editable={!loading}
        autoComplete="off"
        textContentType="oneTimeCode"
        className="mt-4 rounded-xl bg-white px-4 py-4 text-center text-[22px] font-bold"
        style={{
          color: FOREST,
          borderWidth: 1,
          borderColor: error ? RED : LINE,
          letterSpacing: 8,
        }}
      />

      <Text
        className="mt-2 text-right text-[11px]"
        style={{ color: MUTED }}
      >
        {otp.length}/6 digits
      </Text>

      {error ? (
        <Text
          className="mt-2 text-[13px]"
          style={{ color: RED }}
        >
          {error}
        </Text>
      ) : null}

      <TouchableOpacity
        onPress={handleVerify}
        disabled={loading || otp.length !== 6}
        activeOpacity={0.85}
        className="mt-4 items-center rounded-xl py-4"
        style={{
          backgroundColor: FOREST,
          opacity: loading || otp.length !== 6 ? 0.5 : 1,
        }}
      >
        {loading ? (
          <View className="flex-row items-center">
            <ActivityIndicator color="#FFFFFF" />
            <Text className="ml-2 text-[15px] font-bold text-white">
              Verifying...
            </Text>
          </View>
        ) : (
          <Text className="text-[15px] font-bold text-white">
            Verify Pickup OTP
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
