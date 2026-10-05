import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "./useAuth";

type Errors = Partial<
  Record<"name" | "email" | "mobile" | "password", string>
>;

export const useRegister = () => {
  const router = useRouter();

  const { register, loading, serverError } = useAuth();

  // =========================
  // FORM STATE
  // =========================

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  // =========================
  // UI STATE
  // =========================

  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<Errors>({});

  // =========================
  // VALIDATION
  // =========================

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

  // =========================
  // REGISTER
  // =========================

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

    // Registration successful
    if (result.success) {
      Alert.alert(
        "Registration Successful",
        result.message,
        [
          {
            text: "OK",
            onPress: () => {
              router.replace("/(auth)/login");
            },
          },
        ]
      );

      return;
    }

    // Registration failed
    Alert.alert(
      "Registration Failed",
      result.message
    );
  };

  return {
    // Form
    name,
    setName,

    email,
    setEmail,

    mobile,
    setMobile,

    password,
    setPassword,

    // UI
    showPassword,
    setShowPassword,

    // Validation
    errors,

    // Action
    onRegister,

    // Auth state
    loading,
    serverError,
  };
};