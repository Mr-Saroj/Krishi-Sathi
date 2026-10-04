import { api } from "../../services/api";

export interface RegisterData {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
}

export interface LoginData {
  mobileNumber: string;
  password: string;
}

export interface ApiResponse {
  message: string;
}

export interface LoginResponse {
  token: string;
  fullName: string;
  role: "FARMER" | "ADMIN";
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


export const loginFarmer = async (
  data: LoginData
): Promise<LoginResponse> => {

  const response = await api.post<LoginResponse>(
    "/auth/login",
    data
  );

  return response.data;
};