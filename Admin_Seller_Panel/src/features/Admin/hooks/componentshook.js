// shared/hooks.js
import { useEffect, useState } from 'react';

export const useSimulatedLoading = (delay = 650) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return isLoading;
};

export const useToast = (duration = 2800) => {
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), duration);
    return () => clearTimeout(timer);
  }, [toast, duration]);

  return { toast, notify: setToast };
};