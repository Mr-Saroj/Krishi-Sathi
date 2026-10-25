// src/features/seller/components/SellerTopNavbar.jsx

import React from 'react';
import TopNavbar from '../../../components/layout/TopNavbar';

/**
 * Admin variant of TopNavbar.
 * No actionButton prop is passed → the role-specific slot stays empty.
 * The notification bell and avatar are already built into TopNavbar.
 */
const SellerTopNavbar = ({ sidebarOpen, setSidebarOpen }) => (
  <TopNavbar
    sidebarOpen={sidebarOpen}
    setSidebarOpen={setSidebarOpen}
    subtitle="Seller Control Panel"
    // actionButton intentionally omitted — sellers don't get a CTA button
  />
);

export default SellerTopNavbar;