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

import { LoginRole, useLogin } from "../hooks/useLogin";

const PLACEHOLDER = "#8FA396";
const MUTED = "#5E7365";
const ACTIVE_ICON = "#FFFFFF";

// =========================
// FIELD WRAPPER
// =========================

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
        <Text className="mt-1 text-[13px] text-red-600">{error}</Text>
      )}
    </View>
  );
}

// =========================
// ROLE TOGGLE
// =========================

const ROLES: {
  key: LoginRole;
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
}[] = [
  { key: "farmer", label: "Farmer", icon: "sprout-outline" },
  { key: "delivery", label: "Delivery Boy", icon: "moped-outline" },
];

function RoleToggle({
  role,
  onChange,
  disabled,
}: {
  role: LoginRole;
  onChange: (role: LoginRole) => void;
  disabled?: boolean;
}) {
  return (
    <View className="mb-6 h-14 flex-row rounded-2xl bg-paper p-1 border-[1.5px] border-line">
      {ROLES.map((item) => {
        const active = role === item.key;

        return (
          <TouchableOpacity
            key={item.key}
            className={`flex-1 flex-row items-center justify-center rounded-xl ${
              active ? "bg-forest" : "bg-transparent"
            }`}
            onPress={() => onChange(item.key)}
            disabled={disabled}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`Login as ${item.label}`}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={20}
              color={active ? ACTIVE_ICON : MUTED}
            />

            <Text
              className={`ml-2 text-[15px] font-bold ${
                active ? "text-white" : "text-ink"
              }`}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// =========================
// LOGIN FORM
// =========================

export default function LoginForm() {
  const {
    role,
    setRole,
    mobile,
    setMobile,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    errors,
    onLogin,
    loading,
  } = useLogin();

  const isFarmer = role === "farmer";

  return (
    <View>
      {/* ROLE TOGGLE */}

      <RoleToggle role={role} onChange={setRole} disabled={loading} />

      <Text className="mb-5 text-sm text-ink">
        {isFarmer
          ? "Log in to manage your farm, products and orders."
          : "Log in to view and manage your deliveries."}
      </Text>

      {/* MOBILE (FARMER) or EMAIL (DELIVERY BOY) */}

      {isFarmer ? (
        <Field label="Mobile number" error={errors.mobile}>
          <Text className="text-base font-semibold text-ink">+91</Text>

          <View className="mx-3 h-6 w-px bg-line" />

          <TextInput
            className="h-full flex-1 text-base text-ink"
            placeholder="Enter your registered mobile number"
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
      ) : (
        <Field label="Email address" error={errors.email}>
          <MaterialCommunityIcons
            name="email-outline"
            size={22}
            color={MUTED}
          />

          <TextInput
            className="ml-3 h-full flex-1 text-base text-ink"
            placeholder="Enter your registered email"
            placeholderTextColor={PLACEHOLDER}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            autoComplete="email"
          />
        </Field>
      )}

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
          onPress={() => setShowPassword((value) => !value)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={
            showPassword ? "Hide password" : "Show password"
          }
        >
          <MaterialCommunityIcons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
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
        accessibilityLabel={
          isFarmer ? "Log in as farmer" : "Log in as delivery boy"
        }
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-lg font-bold text-white">
            {isFarmer ? "Log in as Farmer" : "Log in as Delivery Boy"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}