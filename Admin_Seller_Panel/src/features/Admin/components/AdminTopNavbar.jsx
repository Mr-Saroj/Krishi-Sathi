
import React from 'react';
import TopNavbar from '../../../components/layout/TopNavbar';

const AdminTopNavbar = ({ sidebarOpen, setSidebarOpen }) => {
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

export default AdminTopNavbar;
