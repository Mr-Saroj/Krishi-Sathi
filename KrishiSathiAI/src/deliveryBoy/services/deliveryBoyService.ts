import { api } from "../../services/api";

export type OnlineStatusResponse = {
  success: boolean;
  message: string;
  isOnline: boolean;
  isBusy: boolean;
};

// GET: Fetch current online/offline status from MongoDB
export async function getOnlineStatus(): Promise<OnlineStatusResponse> {
  const { data } = await api.get<OnlineStatusResponse>(
    "/farmer/delivery-boy/online-status"
  );

  return data;
}

// PATCH: Update online/offline status
export async function updateOnlineStatus(
  online: boolean
): Promise<OnlineStatusResponse> {
  const { data } = await api.patch<OnlineStatusResponse>(
    "/farmer/delivery-boy/online-status",
    { online }
  );

  return data;
}