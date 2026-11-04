
import { api } from "../../services/api";

export interface DeliveryBoyRegisterRequest {
  city: string;
  address: string;
  pincode: string;
  vehicleType: string;
  password: string;
}

export interface DeliveryBoyRegisterResponse {
  success: boolean;
  message: string;
  deliveryBoyId: string;
  farmerEmail: string;
}

// 1. Check delivery-boy eligibility
export const checkDeliveryBoyEligibility = async (
  city: string
): Promise<boolean> => {
  const response = await api.post(
    '/farmer/delivery-boy/check-eligibility',
    { city }
  );

  const message = String(response.data).toLowerCase();

  return message.startsWith('you are eligible');
};

// 2. Register delivery boy
export const registerDeliveryBoy = async (
  data: DeliveryBoyRegisterRequest
): Promise<DeliveryBoyRegisterResponse> => {
  const response = await api.post(
    '/farmer/delivery-boy/register',
    data
  );

  return response.data;
};
