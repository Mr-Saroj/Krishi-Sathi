import { useCallback, useEffect, useState } from "react";
import axios from "axios";

import {
  getOnlineStatus,
  updateOnlineStatus,
} from "../services/deliveryBoyService";

function getErrorMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const serverMessage = e.response?.data?.message;

    if (typeof serverMessage === "string" && serverMessage) {
      return serverMessage;
    }

    switch (e.response?.status) {
      case 404:
        return "You are not registered as a delivery boy.";

      case 409:
        return "Finish your current delivery before going offline.";

      case 401:
      case 403:
        return "Your session has expired. Please log in again.";
    }

    if (!e.response) {
      return "No internet connection. Please try again.";
    }
  }

  return "Could not update your status. Please try again.";
}

export default function useChangeOnline(
  initialOnline = false,
  onChange?: (online: boolean) => void
) {
  const [online, setOnline] = useState(initialOnline);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch current status when component mounts
  useEffect(() => {
    let isMounted = true;

    const fetchStatus = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getOnlineStatus();

        if (isMounted) {
          setOnline(res.isOnline);
        }
      } catch (e) {
        if (isMounted) {
          setError(getErrorMessage(e));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Toggle status using PATCH API
  const toggle = useCallback(async () => {
    if (loading) return;

    const next = !online;

    setOnline(next);
    setError(null);
    setLoading(true);

    try {
      const res = await updateOnlineStatus(next);

      setOnline(res.isOnline);
      onChange?.(res.isOnline);
    } catch (e) {
      // Restore previous state if API fails
      setOnline(!next);
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [online, loading, onChange]);

  return {
    online,
    loading,
    error,
    toggle,
  };
}