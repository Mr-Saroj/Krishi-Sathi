
import React from "react";

import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useRegister } from "../hooks/useRegister";

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

export default function RegisterForm() {
  const {
    name,
    setName,
    email,
    setEmail,
    mobile,
    setMobile,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    errors,
    onRegister,
    loading,
    serverError,
  } = useRegister();

  return (
    <View>
      {/* FULL NAME */}

      <Field label="Full name" error={errors.name}>
        <MaterialCommunityIcons
          name="account-outline"
          size={22}
          color={MUTED}
        />

        <TextInput
          className="ml-3 h-full flex-1 text-base text-ink"
          placeholder="Ramesh Kumar"
          placeholderTextColor={PLACEHOLDER}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          textContentType="name"
        />
      </Field>

      {/* EMAIL */}

      <Field label="Email" error={errors.email}>
        <MaterialCommunityIcons
          name="email-outline"
          size={22}
          color={MUTED}
        />

        <TextInput
          className="ml-3 h-full flex-1 text-base text-ink"
          placeholder="you@example.com"
          placeholderTextColor={PLACEHOLDER}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
        />
      </Field>

      {/* MOBILE NUMBER */}

      <Field label="Mobile number" error={errors.mobile}>
        <Text className="text-base font-semibold text-ink">
          +91
        </Text>

        <View className="mx-3 h-6 w-px bg-line" />

        <TextInput
          className="h-full flex-1 text-base text-ink"
          placeholder="xxxxx xxxxx"
          placeholderTextColor={PLACEHOLDER}
          value={mobile}
          onChangeText={(text) =>
            setMobile(text.replace(/\D/g, "").slice(0, 10))
          }
          keyboardType="number-pad"
          maxLength={10}
          textContentType="telephoneNumber"
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
          placeholder="At least 6 characters"
          placeholderTextColor={PLACEHOLDER}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          textContentType="newPassword"
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

      {/* BACKEND ERROR */}

      {!!serverError && (
        <View className="mb-3 rounded-xl bg-red-50 px-4 py-3">
          <Text className="text-center text-[13px] font-medium text-red-600">
            {serverError}
          </Text>
        </View>
      )}

      {/* REGISTER BUTTON */}

      <TouchableOpacity
        className="mt-3 h-14 items-center justify-center rounded-2xl bg-forest"
        onPress={onRegister}
        disabled={loading}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Register"
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-lg font-bold text-white">
            Register
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}