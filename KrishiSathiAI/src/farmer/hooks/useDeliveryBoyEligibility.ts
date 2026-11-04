
import { useState } from 'react';
import { checkDeliveryBoyEligibility } from '../services/deliveryBoyService';

export type CheckStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'unavailable';

const useDeliveryBoyEligibility = () => {
  const [status, setStatus] = useState<CheckStatus>('idle');
  const [checkedCity, setCheckedCity] = useState('');
  const [error, setError] = useState('');

  const verifyCity = async (city: string) => {
    if (city.trim().length < 2) {
      setError('Enter your city or village');
      return;
    }

    setError('');
    setStatus('checking');

    try {
      const eligible = await checkDeliveryBoyEligibility(city.trim());

      setCheckedCity(city.trim());
      setStatus(eligible ? 'available' : 'unavailable');
    } catch (err) {
      console.log('DELIVERY ELIGIBILITY CHECK FAILED:', err);

      setStatus('idle');
      setError('Could not check right now. Try again.');
    }
  };

  const resetVerification = () => {
    setStatus('idle');
    setCheckedCity('');
    setError('');
  };

  return {
    status,
    checkedCity,
    error,
    verifyCity,
    resetVerification,
  };
};

export default useDeliveryBoyEligibility;
