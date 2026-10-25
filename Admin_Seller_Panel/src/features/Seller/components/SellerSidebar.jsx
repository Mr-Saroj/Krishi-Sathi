// src/features/admin/components/AdminSidebar.jsx

import React from 'react';
import Sidebar from '../../../components/layout/Sidebar';
import {
  SELLER_NAV_LINKS,
  SELLER_BOTTOM_LINKS,
  DASHBOARD_LABEL,
} from '../utils/sellerSidebarUtil';

const SellerSidebar = ({ sidebarOpen, setSidebarOpen }) => (
  <Sidebar
    sidebarOpen={sidebarOpen}
    setSidebarOpen={setSidebarOpen}
    navLinks={SELLER_NAV_LINKS}
    bottomLinks={SELLER_BOTTOM_LINKS}
    dashboardLabel={DASHBOARD_LABEL}
  />
);

export default SellerSidebar;