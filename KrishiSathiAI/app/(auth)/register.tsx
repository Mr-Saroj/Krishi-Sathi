import React, { useState } from "react";

import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";

import { useAuth } from "../../src/auth/hooks/useAuth";

const LOGO = require("../../assets/app_logo.png");

const PLACEHOLDER = "#8FA396";
const MUTED = "#5E7365";

type Errors = Partial<
    Record<"name" | "email" | "mobile" | "password", string>
>;

/**
 * Label + bordered input box + error text
 */
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
                className={`h-14 flex-row items-center rounded-2xl border-[1.5px] bg-paper px-4 ${error ? "border-red-500" : "border-line"
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

export default function Register() {
    const router = useRouter();
    const { width } = useWindowDimensions();

    // Form state
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [password, setPassword] = useState("");

    // UI state
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Errors>({});

    // Authentication hook
    const { register, loading, serverError } = useAuth();

    // The logo PNG has wide margins, so crop to the artwork
    const logoW = Math.min(width - 64, 300);

    /**
     * Validate form before sending request
     */
    const validate = () => {
        const e: Errors = {};

        // Full name
        if (name.trim().length < 2) {
            e.name = "Enter your full name";
        }

        // Email
        if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
            e.email = "Enter a valid email address";
        }

        // Mobile
        if (!/^[6-9]\d{9}$/.test(mobile)) {
            e.mobile = "Enter a 10-digit mobile number";
        }

        // Password
        if (password.length < 6) {
            e.password = "Use at least 6 characters";
        }

        setErrors(e);

        return Object.keys(e).length === 0;
    };

    /**
     * Register farmer
     */
    const onRegister = async () => {
        if (!validate()) {
            return;
        }

        const result = await register({
            fullName: name.trim(),
            email: email.trim(),
            mobileNumber: mobile,
            password: password,
        });

        if (result.success) {
            // Show the message sent by the backend
            Alert.alert("Registration Successful", result.message, [
                {
                    text: "OK",
                    onPress: () => router.replace("/(auth)/login"),
                },
            ]);
        } else {
            // Show the error message sent by the backend
            Alert.alert("Registration Failed", result.message);
        }
    };
    return (
        <View className="flex-1 bg-wheat-soft">
            <StatusBar
                barStyle="dark-content"
                backgroundColor="#FBF1DA"
            />

            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                >
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1 }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Header */}
                        <View className="items-center px-6 pb-6 pt-6">
                            <View
                                className="items-center justify-center overflow-hidden"
                                style={{
                                    width: logoW,
                                    height: logoW * 0.54,
                                }}
                            >
                                <Image
                                    source={LOGO}
                                    style={{
                                        width: logoW * 1.15,
                                        height: logoW * 1.15,
                                    }}
                                    resizeMode="contain"
                                    accessibilityLabel="Krishi Sathi AI logo"
                                />
                            </View>

                            <Text className="mt-4 text-center text-[28px] font-extrabold leading-8 text-forest">
                                Create your account
                            </Text>

                            <Text className="mt-2 max-w-[300px] text-center text-[15px] leading-[22px] text-muted">
                                Register to get crop advice, weather alerts and market prices.
                            </Text>
                        </View>

                        {/* Form card */}
                        <View className="flex-1 rounded-t-[32px] bg-white px-6 pb-8 pt-7">

                            {/* Full Name */}
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

                            {/* Email */}
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

                            {/* Mobile */}
                            <Field label="Mobile number" error={errors.mobile}>
                                <Text className="text-base font-semibold text-ink">
                                    +91
                                </Text>

                                <View className="mx-3 h-6 w-px bg-line" />

                                <TextInput
                                    className="h-full flex-1 text-base text-ink"
                                    placeholder="98765 43210"
                                    placeholderTextColor={PLACEHOLDER}
                                    value={mobile}
                                    onChangeText={(text) =>
                                        setMobile(
                                            text.replace(/\D/g, "").slice(0, 10)
                                        )
                                    }
                                    keyboardType="number-pad"
                                    maxLength={10}
                                    textContentType="telephoneNumber"
                                />
                            </Field>

                            {/* Password */}
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
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
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

                            {/* Backend error */}
                            {!!serverError && (
                                <View className="mb-3 rounded-xl bg-red-50 px-4 py-3">
                                    <Text className="text-center text-[13px] font-medium text-red-600">
                                        {serverError}
                                    </Text>
                                </View>
                            )}

                            {/* Register Button */}
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

                            {/* Login */}
                            <View className="mt-6 flex-row items-center justify-center">
                                <Text className="text-base text-muted">
                                    Already have an account?{" "}
                                </Text>

                                <Link
                                    href={"/login" as any}
                                    className="text-base font-bold text-leaf"
                                >
                                    Log in
                                </Link>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}