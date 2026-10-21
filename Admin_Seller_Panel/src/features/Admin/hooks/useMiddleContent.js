
import { useEffect, useState } from 'react';

const initialData = {
  stats: {
    totalSales: 245680,
    totalOrders: 384,
    totalSellers: 56,
    pendingSellers: 7,
    activeProducts: 428,
    deliveryPartners: 24,
    commissionRevenue: 18425,
    pendingOrders: 18,
  },

  salesData: [
    { day: 'Mon', sales: 12500 },
    { day: 'Tue', sales: 18200 },
    { day: 'Wed', sales: 15400 },
    { day: 'Thu', sales: 22600 },
    { day: 'Fri', sales: 19800 },
    { day: 'Sat', sales: 28500 },
    { day: 'Sun', sales: 32100 },
  ],

  recentOrders: [
    {
      id: 'ORD-1001',
      farmer: 'Ramesh Kumar',
      seller: 'Green Agro Store',
      amount: 2450,
      status: 'PLACED',
      date: '21 Oct 2026',
    },
    {
      id: 'ORD-1002',
      farmer: 'Sita Devi',
      seller: 'Odisha Seeds',
      amount: 1800,
      status: 'CONFIRMED',
      date: '21 Oct 2026',
    },
    {
      id: 'ORD-1003',
      farmer: 'Manoj Sahu',
      seller: 'Farm Tools Hub',
      amount: 3200,
      status: 'SHIPPED',
      date: '20 Oct 2026',
    },
    {
      id: 'ORD-1004',
      farmer: 'Laxmi Behera',
      seller: 'Green Agro Store',
      amount: 950,
      status: 'DELIVERED',
      date: '20 Oct 2026',
    },
    {
      id: 'ORD-1005',
      farmer: 'Ajay Patra',
      seller: 'Odisha Seeds',
      amount: 1450,
      status: 'CANCELLED',
      date: '19 Oct 2026',
    },
  ],

  alerts: [
    {
      id: 1,
      title: 'Seller approvals pending',
      description: '7 seller applications need review.',
      icon: 'storefront',
      color: 'amber',
      link: '/admin-dashboard/sellers',
      action: 'Review sellers',
    },
    {
      id: 2,
      title: 'Orders awaiting processing',
      description: '18 orders are awaiting the next action.',
      icon: 'shopping_bag',
      color: 'blue',
      link: '/admin-dashboard/orders',
      action: 'View orders',
    },
    {
      id: 3,
      title: 'Delivery assignment required',
      description: 'Check orders that still need a delivery partner.',
      icon: 'local_shipping',
      color: 'orange',
      link: '/admin-dashboard/orders',
      action: 'Manage delivery',
    },
  ],
};

const useMiddleContent = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboard, setDashboard] = useState(initialData);

  useEffect(() => {
    // Demo data for UI development.
    // Replace this with your dashboard API request later.
    const timer = setTimeout(() => {
      try {
        setDashboard(initialData);
      } catch (err) {
        console.error('Dashboard loading error:', err);
        setError('Failed to load marketplace dashboard.');
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return {
    loading,
    error,
    ...dashboard,
  };
};

export default useMiddleContent;
