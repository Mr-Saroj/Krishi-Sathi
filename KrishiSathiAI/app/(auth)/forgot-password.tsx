
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  View,
  useWindowDimensions,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import ForgotPasswordForm from "../../src/auth/components/ForgotPasswordForm";

const LOGO = require("../../assets/app_logo.png");

export default function ForgotPassword() {
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
            {/* LOGO */}

            <View className="items-center px-6 pb-2 pt-2">
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
            </View>

            {/* FORGOT PASSWORD FORM */}

            <ForgotPasswordForm />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}