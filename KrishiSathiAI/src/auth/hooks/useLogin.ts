import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "./useAuth";

export type LoginRole = "farmer" | "delivery";

type Errors = Partial<Record<"mobile" | "email" | "password", string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const useLogin = () => {
  const router = useRouter();

  const { login, loading } = useAuth();

  // =========================
  // FORM STATE
  // =========================

  const [role, setRoleState] = useState<LoginRole>("farmer");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  // Switch role, clear errors and the password
  const setRole = (newRole: LoginRole) => {
    setRoleState(newRole);
    setErrors({});
    setPassword("");
  };

  // =========================
  // VALIDATION
  // =========================

  const validate = () => {
    const e: Errors = {};

    if (role === "farmer") {
      if (!/^[6-9]\d{9}$/.test(mobile)) {
        e.mobile = "Enter a valid 10-digit mobile number";
      }
    } else if (!EMAIL_REGEX.test(email.trim())) {
      e.email = "Enter a valid email address";
    }

    if (password.length < 6) {
      e.password = "Password must be at least 6 characters";
    }

    setErrors(e);

    return Object.keys(e).length === 0;
  };

  // =========================
  // LOGIN
  // =========================

  const onLogin = async () => {
    if (loading || !validate()) {
      return;
    }

    const result = await login(
      role === "farmer"
        ? {
            role: "FARMER",
            mobileNumber: mobile,
            password,
          }
        : {
            role: "DELIVERY_BOY",
            email: email.trim().toLowerCase(),
            password,
          }
    );

    if (!result.success) {
      Alert.alert("Login Failed", result.message);
      return;
    }

    Alert.alert(
      "Login Successful",
      `Welcome back, ${result.data?.fullName}!`,
      [
        {
          text: "OK",
          onPress: () => {
            router.replace(
              (role === "farmer"
                ? "/FarmerDashboard"
                : "/DeliveryboyDashboard") as any
            );
          },
        },
      ]
    );
  };

  return {
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
  };
};