
import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const api = axios.create({
  baseURL: `${process.env.EXPO_PUBLIC_API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// REQUEST INTERCEPTOR
api.interceptors.request.use(
  async (config) => {
    const isPublicAuthEndpoint =
      config.url?.includes("/auth/register") ||
      config.url?.includes("/auth/login");

    // Attach JWT only to protected API requests
    if (!isPublicAuthEndpoint) {
      const token = await SecureStore.getItemAsync("auth_token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => {
    console.log("API SUCCESS:", response.config.url);
    console.log("RESPONSE DATA:", response.data);

    return response;
  },
  (error) => {
    console.log("API FAILED:", error.message);
    console.log("API URL:", error.config?.url);
    console.log("HTTP STATUS:", error.response?.status);
    console.log("ERROR DATA:", error.response?.data);

    return Promise.reject(error);
  }
);
