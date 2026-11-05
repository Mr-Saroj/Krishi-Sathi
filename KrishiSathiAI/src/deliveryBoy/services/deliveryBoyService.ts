import { api } from "../../services/api";

export type OnlineStatusResponse = {
  success: boolean;
  message: string;
  isOnline: boolean;
  isBusy: boolean;
};

// PATCH /api/farmer/delivery-boy/online-status
// The base URL already ends with /api, and the JWT is attached by your request interceptor.
export async function updateOnlineStatus(online: boolean): Promise<OnlineStatusResponse> {
  const { data } = await api.patch<OnlineStatusResponse>('/farmer/delivery-boy/online-status', {
    online,
  });
  return data;
}