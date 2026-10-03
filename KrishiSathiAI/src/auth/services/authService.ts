import { api } from "../../services/api";

export interface RegisterData {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
}

export interface ApiResponse {
  message: string;
}

export const registerFarmer = async (
  data: RegisterData
): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>(
    "/auth/register",
    data
  );

  return response.data;
};