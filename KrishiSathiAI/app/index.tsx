
import { useEffect, useState, } from "react";
import {
  View,
  ActivityIndicator,
  Text,
  Pressable
} from "react-native";

import { useRouter } from "expo-router";

import { api } from "../src/services/api";
import {
  getToken,
  clearAuthData
} from "../src/services/storageService";
import { Alert } from "react-native";

export default function Index() {

  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {

    const checkAuthentication = async () => {

      try {

        // 1. Check JWT in SecureStore
        const token = await getToken();

        if (!token) {
          router.replace("/(onboarding)/welcome");
          return;
        }

        // 2. Validate JWT using backend /me
        const response = await api.get("/auth/app-me");

        // 3. Get actual role from backend
        const role = response.data.role;

        // 4. Navigate according to role
        switch (role) {

          case "FARMER":
            router.replace("/(farmer)/FarmerDashboard");
            break;

          case "DELIVERY_BOY":
            router.replace("/(deliveryBoy)/DeliveryBoyDashboard");
            break;

          case "SELLER":
          case "ADMIN":

            await clearAuthData();

            Alert.alert(
              "Access Restricted",
              "You cannot access the mobile application with this account. Please use the Krishi Sathi AI website to continue.",
              [
                {
                  text: "OK",
                  onPress: () => router.replace("/(onboarding)/welcome")
                }
              ]
            );

            break;

          default:
            await clearAuthData();
            router.replace("/(onboarding)/welcome");
        }

      } catch (err: any) {

        console.log("Authentication check:", err);

        if (err.response?.status === 401) {

          // Invalid or expired JWT
          await clearAuthData();
          router.replace("/(onboarding)/welcome");

        } else if (err.response?.status === 403) {

          // Authenticated but not permitted
          await clearAuthData();
          router.replace("/(onboarding)/welcome");

        } else {

          // Server unavailable or network error
          setError(true);

        }

      } finally {

        setChecking(false);

      }
    };

    checkAuthentication();

  }, []);

  if (error) {
    return (
      <View style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
      }}>
        <Text>Unable to verify your login.</Text>

        <Pressable
          onPress={() => {
            setError(false);
            setChecking(true);
            router.replace("/");
          }}
        >
          <Text style={{ marginTop: 15 }}>
            Retry
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center"
    }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 10 }}>
        Checking authentication...
      </Text>
    </View>
  );
}
