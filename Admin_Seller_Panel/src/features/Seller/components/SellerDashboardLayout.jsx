// src/features/admin/AdminDashboardLayout.jsx

import React from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import SellerSidebar from './SellerSidebar';
import SellerTopNavbar from './SellerTopNavbar';


const SellerDashboardLayout = () => (
  <DashboardLayout
    SidebarComponent={SellerSidebar}
    TopNavbarComponent={SellerTopNavbar}
  />
);

export default SellerDashboardLayout;