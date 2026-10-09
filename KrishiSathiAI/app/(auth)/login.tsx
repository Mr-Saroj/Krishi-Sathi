
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

import LoginForm from "../../src/auth/components/LoginForm";

const LOGO = require("../../assets/app_logo.png");

export default function Login() {
  const { width } = useWindowDimensions();

  // Logo size
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
            contentContainerStyle={{
              flexGrow: 1,
            }}
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
                Welcome back
              </Text>

              <Text className="mt-2 max-w-[300px] text-center text-[15px] leading-[22px] text-muted">
                Log in to continue with crop advice,
                weather alerts and market prices.
              </Text>
            </View>

            {/* LOGIN FORM */}

            <View className="flex-1 rounded-t-[32px] bg-white px-6 pb-8 pt-7">
              <LoginForm />

              {/* REGISTER */}

              <View className="mt-6 flex-row items-center justify-center">
                <Text className="text-base text-muted">
                  New to Krishi Sathi?{" "}
                </Text>

                <Link
                  href={"/register" as any}
                  className="text-base font-bold text-leaf"
                >
                  Register
                </Link>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}