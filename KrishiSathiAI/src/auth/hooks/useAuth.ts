import { useState } from "react";
import axios from "axios";
import { registerFarmer, RegisterData } from "../services/authService";

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
                message: response?.message || "Your account has been created successfully.",
            };
        } catch (error) {
            let message = "Something went wrong";

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    // Backend responded with an error (400, 409, 500, ...)
                    message =
                        error.response.data?.message ||
                        "Unable to register. Please try again.";
                } else {
                    // No response: network down / wrong IP / server off
                    message = "Cannot reach the server. Check your internet connection.";
                }
            }

            setServerError(message);

            return { success: false, message };
        } finally {
            setLoading(false);
        }
    };

    return { register, loading, serverError };
};