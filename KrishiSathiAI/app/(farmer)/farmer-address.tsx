
import { useRouter } from "expo-router";
import FarmerAddressScreen from "../../src/farmer/components/FarmerAddressScreen";

export default function FarmerAddressPage() {
  const router = useRouter();

  return (
    <FarmerAddressScreen
      onBack={() => router.back()}
    />
  );
}