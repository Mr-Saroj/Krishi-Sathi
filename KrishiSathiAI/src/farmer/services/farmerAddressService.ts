import { api } from "../../services/api";

// ==================== FARMER DETAILS ====================

export type FarmerDetails = {
  fullName: string;
  email: string;
  mobileNumber: string;
};

// GET: Fetch logged-in farmer's details
export const getFarmerDetails = async (): Promise<FarmerDetails> => {
  const response = await api.get<FarmerDetails>(
    "/farmer/profile/me"
  );

  return response.data;
};

// ==================== FARMER ADDRESS ====================

export type FarmerAddress = {
  addressId: string;
  addressType: "HOME" | "FARM" | "OTHER";
  fullName: string;
  mobileNumber: string;
  village: string;
  postOffice: string;
  district: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault?: boolean;
  default?: boolean;
};

export type AddAddressRequest = {
  addressType: "HOME" | "FARM" | "OTHER";
  village: string;
  postOffice: string;
  district: string;
  state: string;
  pincode: string;
  landmark?: string;
};

// GET: Fetch all saved addresses
export const getAddresses = async (): Promise<FarmerAddress[]> => {
  const response = await api.get<FarmerAddress[]>(
    "/farmer/profile/addresses"
  );

  return response.data;
};

// POST: Add a new address
export const addAddress = async (
  data: AddAddressRequest
): Promise<void> => {
  await api.post("/farmer/profile/addresses", data);
};

// DELETE: Delete one address
export const deleteAddress = async (
  addressId: string
): Promise<void> => {
  await api.delete(
    `/farmer/profile/addresses/${encodeURIComponent(addressId)}`
  );
};