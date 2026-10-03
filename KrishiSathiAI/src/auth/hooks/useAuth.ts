import { useState } from "react";
import axios from "axios";
import {
  registerFarmer,
  RegisterData,
} from "../services/authService";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const register = async (data: RegisterData) => {
    setLoading(true);
    setServerError("");

    try {
      const response = await registerFarmer(data);

      return {
        success: true,
        message: response.message,
      };
    } catch (error) {
      let message = "Something went wrong";

      if (axios.isAxiosError(error)) {
        message =
          error.response?.data?.message ||
          "Unable to register. Please try again.";
      }

      setServerError(message);

      return {
        success: false,
        message,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    register,
    loading,
    serverError,
  };
};