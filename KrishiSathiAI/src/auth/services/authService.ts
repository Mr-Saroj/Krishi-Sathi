import { api } from "../../services/api";

export type BackendRole = "FARMER" | "DELIVERY_BOY";

export interface RegisterData {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
}

export interface LoginData {
  role: BackendRole;
  mobileNumber?: string; // FARMER
  email?: string;        // DELIVERY_BOY
  password: string;
}

export interface ApiResponse {
  message: string;
}

export interface LoginResponse {
  token: string;
  fullName: string;
  role: "FARMER" | "ADMIN" | "DELIVERY_BOY";
}

export const registerFarmer = async (
  data: RegisterData
): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>("/auth/register", data);
  return response.data;
};

// One login for both farmer and delivery boy
export const loginUser = async (
  data: LoginData
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/login", data);
  return response.data;
};