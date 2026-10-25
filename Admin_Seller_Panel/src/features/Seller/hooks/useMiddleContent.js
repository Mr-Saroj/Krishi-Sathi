// src/hooks/useMiddleContent.js
import { useCallback, useEffect, useState } from 'react';

// Demo data for UI development. Replace with your seller dashboard API call.
const initialData = {
  today: {
    orders: 14,
    sales: 18450,
  },

  // Orders the seller still has to accept or reject
  awaitingAcceptance: [
    {
      id: 'ORD-2041',
      customer: 'Ramesh Kumar',
      items: '2 × Paddy Seeds (5 kg)',
      amount: 2450,
      placedAgo: '8 min ago',
    },
    {
      id: 'ORD-2040',
      customer: 'Sita Devi',
      items: '1 × Organic Fertilizer (25 kg)',
      amount: 1800,
      placedAgo: '22 min ago',
    },
    {
      id: 'ORD-2038',
      customer: 'Manoj Sahu',
      items: '3 × Hand Sprayer',
      amount: 3200,
      placedAgo: '1 hr ago',
    },
  ],

  // Products at or below their reorder level
  lowStock: [
    { id: 'P-101', name: 'Paddy Seeds (5 kg)', stock: 3, threshold: 20 },
    { id: 'P-114', name: 'Neem Oil (1 L)', stock: 6, threshold: 15 },
    { id: 'P-132', name: 'Drip Pipe (50 m)', stock: 9, threshold: 12 },
    { id: 'P-087', name: 'Urea (50 kg)', stock: 11, threshold: 25 },
  ],

  // Packed orders waiting for the delivery partner
  readyForPickup: [
    {
      id: 'ORD-2032',
      customer: 'Laxmi Behera',
      itemCount: 2,
      partner: 'Bapi Nayak',
      pickupBy: 'Today, 4:00 PM',
    },
    {
      id: 'ORD-2030',
      customer: 'Ajay Patra',
      itemCount: 1,
      partner: null,
      pickupBy: 'Today, 5:30 PM',
    },
  ],

  settlements: {
    pendingAmount: 42680,
    pendingOrders: 21,
    nextPayoutDate: '25 Oct 2026',
    recentPayouts: [
      { id: 'PAY-5012', amount: 38200, date: '18 Oct 2026', status: 'PAID' },
      { id: 'PAY-4987', amount: 29750, date: '11 Oct 2026', status: 'PAID' },
      { id: 'PAY-4961', amount: 33400, date: '04 Oct 2026', status: 'PAID' },
    ],
  },
};

const useMiddleContent = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboard, setDashboard] = useState(initialData);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setDashboard(initialData);
      } catch (err) {
        console.error('Dashboard loading error:', err);
        setError('Failed to load seller dashboard.');
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Accept / reject an order. Call your API here, then update local state.
  const respondToOrder = useCallback((orderId, decision) => {
    // await api.post(`/seller/orders/${orderId}/${decision}`);
    setDashboard((prev) => ({
      ...prev,
      awaitingAcceptance: prev.awaitingAcceptance.filter(
        (order) => order.id !== orderId
      ),
    }));
  }, []);

  return {
    loading,
    error,
    ...dashboard,
    respondToOrder,
  };
};

export default useMiddleContent;