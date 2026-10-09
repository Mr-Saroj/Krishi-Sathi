
import React, { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";

const PLACEHOLDER = "#8FA396";
const MUTED = "#5E7365";
const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function ForgotPasswordForm() {
  const router = useRouter();

  const [otpSent, setOtpSent] = useState(false);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const otpRef = useRef<TextInput>(null);

  // Resend countdown
  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setTimeout(
      () => setSecondsLeft((seconds) => seconds - 1),
      1000
    );

    return () => clearTimeout(timer);
  }, [secondsLeft]);

  // Send OTP
  const sendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError("Enter a 10-digit mobile number");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // TODO: Connect your API:
      // await api.post("/auth/forgot-password", { mobile });

      setOtpSent(true);
      setOtp("");
      setSecondsLeft(RESEND_SECONDS);

      setTimeout(() => otpRef.current?.focus(), 300);
    } catch {
      setError("Could not send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    if (otp.length !== OTP_LENGTH) {
      setError(`Enter the ${OTP_LENGTH}-digit OTP`);
      return;
    }

    setError("");
    setLoading(true);

    try {
      // TODO: Connect your API:
      // await api.post("/auth/verify-otp", { mobile, otp });

      router.push({
        pathname: "/reset-password",
        params: { mobile, otp },
      } as any);
    } catch {
      setError("Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  // Change mobile number
  const changeNumber = () => {
    setOtpSent(false);
    setOtp("");
    setError("");
    setSecondsLeft(0);
  };

  return (
    <View>
      {/* BACK BUTTON */}

      <View className="mb-4">
        <TouchableOpacity
          onPress={() => (otpSent ? changeNumber() : router.back())}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="h-10 w-10 items-center justify-center"
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={26}
            color={MUTED}
          />
        </TouchableOpacity>
      </View>

      {/* FORM HEADING */}

      <View className="items-center px-6 pb-6 pt-2">
        <Text className="text-center text-[28px] font-extrabold leading-8 text-forest">
          {otpSent ? "Verify OTP" : "Forgot password?"}
        </Text>

        <Text className="mt-2 max-w-[300px] text-center text-[15px] leading-[22px] text-muted">
          {otpSent
            ? `We sent a ${OTP_LENGTH}-digit code to +91 ${mobile}.`
            : "No worries! Enter your registered mobile number and we'll send you an OTP."}
        </Text>
      </View>

      {/* FORM CARD */}

      <View className="flex-1 rounded-t-[32px] bg-white px-6 pb-8 pt-7">
        <View className="mb-6 items-center">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-wheat-soft">
            <MaterialCommunityIcons
              name={
                otpSent
                  ? "message-text-lock-outline"
                  : "lock-reset"
              }
              size={34}
              color={MUTED}
            />
          </View>
        </View>

        {/* MOBILE NUMBER */}

        <View className="mb-4">
          <View className="mb-1.5 flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-ink">
              Mobile number
            </Text>

            {otpSent && (
              <TouchableOpacity onPress={changeNumber} hitSlop={10}>
                <Text className="text-sm font-semibold text-leaf">
                  Change
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View
            className={`h-14 flex-row items-center rounded-2xl border-[1.5px] px-4 ${
              error && !otpSent
                ? "border-red-500"
                : "border-line"
            } ${otpSent ? "bg-wheat-soft" : "bg-paper"}`}
          >
            <Text className="text-base font-semibold text-ink">
              +91
            </Text>

            <View className="mx-3 h-6 w-px bg-line" />

            <TextInput
              className="h-full flex-1 text-base text-ink"
              placeholder="Enter Your Registered mobile number"
              placeholderTextColor={PLACEHOLDER}
              value={mobile}
              onChangeText={(value) => {
                setMobile(value.replace(/\D/g, "").slice(0, 10));
                if (error) setError("");
              }}
              keyboardType="number-pad"
              maxLength={10}
              editable={!otpSent}
              textContentType="telephoneNumber"
              autoComplete="tel"
              returnKeyType="done"
              onSubmitEditing={sendOtp}
            />

            {otpSent && (
              <MaterialCommunityIcons
                name="check-circle"
                size={22}
                color="#2E7D32"
              />
            )}
          </View>

          {!!error && !otpSent && (
            <Text className="mt-1 text-[13px] text-red-600">
              {error}
            </Text>
          )}
        </View>

        {/* OTP INPUT */}

        {otpSent && (
          <View className="mb-2">
            <Text className="mb-1.5 text-sm font-semibold text-ink">
              Enter OTP
            </Text>

            <View
              className={`h-14 flex-row items-center rounded-2xl border-[1.5px] bg-paper px-4 ${
                error ? "border-red-500" : "border-line"
              }`}
            >
              <MaterialCommunityIcons
                name="shield-key-outline"
                size={22}
                color={MUTED}
              />

              <TextInput
                ref={otpRef}
                className="ml-3 h-full flex-1 text-lg font-semibold tracking-[8px] text-ink"
                placeholder="••••••"
                placeholderTextColor={PLACEHOLDER}
                value={otp}
                onChangeText={(value) => {
                  setOtp(value.replace(/\D/g, "").slice(0, OTP_LENGTH));
                  if (error) setError("");
                }}
                keyboardType="number-pad"
                maxLength={OTP_LENGTH}
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                returnKeyType="done"
                onSubmitEditing={verifyOtp}
              />
            </View>

            {!!error && (
              <Text className="mt-1 text-[13px] text-red-600">
                {error}
              </Text>
            )}

            {/* RESEND OTP */}

            <View className="mt-3 flex-row items-center justify-center">
              {secondsLeft > 0 ? (
                <Text className="text-sm text-muted">
                  Resend OTP in {secondsLeft}s
                </Text>
              ) : (
                <>
                  <Text className="text-sm text-muted">
                    Didn't get the code?{" "}
                  </Text>

                  <TouchableOpacity
                    onPress={sendOtp}
                    hitSlop={10}
                    disabled={loading}
                  >
                    <Text className="text-sm font-bold text-leaf">
                      Resend OTP
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}

        {/* SEND OTP / VERIFY OTP */}

        <TouchableOpacity
          className="mt-4 h-14 items-center justify-center rounded-2xl bg-forest"
          onPress={otpSent ? verifyOtp : sendOtp}
          disabled={loading}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={otpSent ? "Verify OTP" : "Send OTP"}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-lg font-bold text-white">
              {otpSent ? "Verify OTP" : "Send OTP"}
            </Text>
          )}
        </TouchableOpacity>

        {/* BACK TO LOGIN */}

        <View className="mt-6 flex-row items-center justify-center">
          <MaterialCommunityIcons
            name="arrow-left"
            size={18}
            color={MUTED}
          />

          <Link
            href={"/login" as any}
            className="ml-1 text-base font-bold text-leaf"
          >
            Back to log in
          </Link>
        </View>
      </View>
    </View>
  );
}