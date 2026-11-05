import { useCallback, useState } from 'react';
import axios from 'axios';
import { updateOnlineStatus } from '../services/deliveryBoyService';


function getErrorMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const serverMessage = e.response?.data?.message;
    if (typeof serverMessage === 'string' && serverMessage) return serverMessage;

    switch (e.response?.status) {
      case 404:
        return 'You are not registered as a delivery boy.';
      case 409:
        return 'Finish your current delivery before going offline.';
      case 401:
      case 403:
        return 'Your session has expired. Please log in again.';
    }
    if (!e.response) return 'No internet connection. Please try again.';
  }
  return 'Could not update your status. Please try again.';
}

export default function useChangeOnline(
  initialOnline = false,
  onChange?: (online: boolean) => void,
) {
  const [online, setOnline] = useState(initialOnline);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = useCallback(async () => {
    if (loading) return;

    const next = !online;
    setOnline(next); // update the switch right away
    setError(null);
    setLoading(true);

    try {
      const res = await updateOnlineStatus(next);
      setOnline(res.isOnline);
      onChange?.(res.isOnline);
    } catch (e) {
      setOnline(!next); // revert the switch if the request failed
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [online, loading, onChange]);

  return { online, loading, error, toggle };
}