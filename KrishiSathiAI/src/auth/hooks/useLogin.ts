import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "./useAuth";

type Errors = Partial<
  Record<"mobile" | "password", string>
>;

export const useLogin = () => {
  const router = useRouter();

  const { login, loading } = useAuth();

  // =========================
  // FORM STATE
  // =========================

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  // =========================
  // VALIDATION
  // =========================

  const validate = () => {
    const e: Errors = {};

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      e.mobile = "Enter a 10-digit mobile number";
    }

    if (password.length < 6) {
      e.password =
        "Password must be at least 6 characters";
    }

    setErrors(e);

    return Object.keys(e).length === 0;
  };

  // =========================
  // LOGIN
  // =========================

  const onLogin = async () => {
    if (!validate()) {
      return;
    }

    const result = await login({
      mobileNumber: mobile,
      password: password,
    });

    // Login failed
    if (!result.success) {
      Alert.alert(
        "Login Failed",
        result.message
      );

      return;
    }

    // Login successful
    Alert.alert(
      "Login Successful",
      `Welcome back, ${result.data?.fullName}!`,
      [
        {
          text: "OK",
          onPress: () => {
            router.replace("/FarmerDashboard" as any);
          },
        },
      ]
    );
  };

  return {
    mobile,
    setMobile,

    password,
    setPassword,

    showPassword,
    setShowPassword,

    errors,

    onLogin,

    loading,
  };
};