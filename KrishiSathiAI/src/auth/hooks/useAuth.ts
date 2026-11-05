import { useState } from "react";
import axios from "axios";

import {
  registerFarmer,
  RegisterData,
  loginUser,
  LoginData,
} from "../services/authService";

import { saveAuthData } from "../../services/storageService";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // =========================
  // REGISTER (FARMER)
  // =========================

  const register = async (data: RegisterData) => {
    setLoading(true);
    setServerError("");

    try {
      const response = await registerFarmer(data);

      return {
        success: true,
        message:
          response?.message ||
          "Your account has been created successfully.",
      };
    } catch (error) {
      let message = "Something went wrong";

      if (axios.isAxiosError(error)) {
        if (error.response) {
          message =
            error.response.data?.message ||
            "Unable to register. Please try again.";
        } else {
          message =
            "Cannot reach the server. Check your internet connection.";
        }
      }

      setServerError(message);

      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOGIN (FARMER + DELIVERY BOY)
  // =========================

  const login = async (data: LoginData) => {
    setLoading(true);
    setServerError("");

    try {
      const response = await loginUser(data);

      await saveAuthData(
        response.token,
        response.role,
        response.fullName
      );

      return {
        success: true,
        message: "Login successful",
        data: response,
      };
    } catch (error) {
      let message = "Something went wrong";

      if (axios.isAxiosError(error)) {
        if (error.response) {
          message =
            error.response.data?.message ||
            "Login failed. Please try again.";
        } else {
          message =
            "Cannot reach the server. Check your internet connection.";
        }
      }

      setServerError(message);

      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return {
    register,
    login,
    loading,
    serverError,
  };
};