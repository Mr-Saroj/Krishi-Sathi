
import React from "react";

import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    Text,
    View,
    useWindowDimensions,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";

import RegisterForm from "../../src/auth/components/RegisterForm";

const LOGO = require("../../assets/app_logo.png");

export default function Register() {
    const { width } = useWindowDimensions();

    const logoW = Math.min(width - 64, 300);

    return (
        <View className="flex-1 bg-wheat-soft">
            <StatusBar
                barStyle="dark-content"
                backgroundColor="#FBF1DA"
            />

            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={
                        Platform.OS === "ios" ? "padding" : undefined
                    }
                >
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1 }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* HEADER */}

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
                                Register to get crop advice, weather alerts
                                and market prices.
                            </Text>
                        </View>

                        {/* REGISTER FORM */}

                        <View className="flex-1 rounded-t-[32px] bg-white px-6 pb-8 pt-7">
                            <RegisterForm />

                            {/* LOGIN LINK */}

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