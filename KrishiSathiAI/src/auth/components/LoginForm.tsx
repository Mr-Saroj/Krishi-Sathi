
import React from "react";

import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link } from "expo-router";

import { useLogin } from "../hooks/useLogin";

const PLACEHOLDER = "#8FA396";
const MUTED = "#5E7365";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-4">
      <Text className="mb-1.5 text-sm font-semibold text-ink">
        {label}
      </Text>

      <View
        className={`h-14 flex-row items-center rounded-2xl border-[1.5px] bg-paper px-4 ${
          error ? "border-red-500" : "border-line"
        }`}
      >
        {children}
      </View>

      {!!error && (
        <Text className="mt-1 text-[13px] text-red-600">
          {error}
        </Text>
      )}
    </View>
  );
}

export default function LoginForm() {
  const {
    mobile,
    setMobile,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    errors,
    onLogin,
    loading,
  } = useLogin();

  return (
    <View>
      {/* MOBILE NUMBER */}

      <Field label="Mobile number" error={errors.mobile}>
        <Text className="text-base font-semibold text-ink">
          +91
        </Text>

        <View className="mx-3 h-6 w-px bg-line" />

        <TextInput
          className="h-full flex-1 text-base text-ink"
          placeholder="Enter Your Registered mobile number"
          placeholderTextColor={PLACEHOLDER}
          value={mobile}
          onChangeText={(text) =>
            setMobile(text.replace(/\D/g, "").slice(0, 10))
          }
          keyboardType="number-pad"
          maxLength={10}
          textContentType="telephoneNumber"
          autoComplete="tel"
        />
      </Field>

      {/* PASSWORD */}

      <Field label="Password" error={errors.password}>
        <MaterialCommunityIcons
          name="lock-outline"
          size={22}
          color={MUTED}
        />

        <TextInput
          className="ml-3 h-full flex-1 text-base text-ink"
          placeholder="Enter your password"
          placeholderTextColor={PLACEHOLDER}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          textContentType="password"
          autoComplete="password"
          returnKeyType="done"
          onSubmitEditing={onLogin}
        />

        <TouchableOpacity
          onPress={() =>
            setShowPassword((value) => !value)
          }
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={
            showPassword ? "Hide password" : "Show password"
          }
        >
          <MaterialCommunityIcons
            name={
              showPassword
                ? "eye-off-outline"
                : "eye-outline"
            }
            size={22}
            color={MUTED}
          />
        </TouchableOpacity>
      </Field>

      {/* FORGOT PASSWORD */}

      <View className="-mt-1 items-end">
        <Link
          href={"/forgot-password" as any}
          className="text-sm font-semibold text-leaf"
        >
          Forgot password?
        </Link>
      </View>

      {/* LOGIN BUTTON */}

      <TouchableOpacity
        className="mt-5 h-14 items-center justify-center rounded-2xl bg-forest"
        onPress={onLogin}
        disabled={loading}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Log in"
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-lg font-bold text-white">
            Log in
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}