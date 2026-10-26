// src/features/seller/components/SellerTopNavbar.jsx

import React from 'react';
import TopNavbar from '../../../components/layout/TopNavbar';

/**
 * Admin variant of TopNavbar.
 * No actionButton prop is passed → the role-specific slot stays empty.
 * The notification bell and avatar are already built into TopNavbar.
 */
const SellerTopNavbar = ({ sidebarOpen, setSidebarOpen }) => {
  // Get user details saved by ProtectedRoute.jsx
  const userName = localStorage.getItem('fullName') || 'Guest';
  const role = localStorage.getItem('role');

  // Select panel title based on role
  const panelTitle =
    role === 'ADMIN'
      ? 'Admin Control Panel'
      : role === 'SELLER'
        ? 'Seller Control Panel'
        : 'Not Found Panel';

  return (
    <TopNavbar
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      subtitle={panelTitle}
      userName={userName}
    />
  );
};

export default SellerTopNavbar;