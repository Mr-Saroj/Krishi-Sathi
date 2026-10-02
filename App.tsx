import "./global.css";

import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-green-100">
      <Text className="text-3xl font-bold text-green-700">
        Krishi Sathi AI
      </Text>

      <Text className="mt-2 text-lg text-gray-600">
        NativeWind is working!
      </Text>

      <StatusBar style="auto" />
    </View>
  );
}