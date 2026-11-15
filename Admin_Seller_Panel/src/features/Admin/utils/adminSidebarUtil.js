// src/features/Admin/utils/adminSidebarUtil.js

export const ADMIN_NAV_LINKS = [
  {
    icon: 'dashboard',
    label: 'Dashboard',
    to: '/admin-dashboard',
    end: true,
  },
  {
    icon: 'store',
    label: 'Seller Management',
    to: '/admin-dashboard/sellers',
  },
  {
    icon: 'inventory_2',
    label: 'Product Catalog',
    to: '/admin-dashboard/product',
  },
  {
    icon: 'hourglass_empty',
    label: 'Waiting Orders',
    to: '/admin-dashboard/waiting-orders',
  },
  {
    icon: 'local_shipping',
    label: 'Delivery Partners',
    to: '/admin-dashboard/delivery-management',
  },

  {
    icon: 'account_balance_wallet',
    label: 'Finance & COD Settlement',
    to: '/admin-dashboard/finance',
  },
  {
    icon: 'groups',
    label: 'Customers',
    to: '/admin-dashboard/customers',
  },
  {
    icon: 'local_offer',
    label: 'Coupons & Offers',
    to: '/admin-dashboard/coupons',
  },
  {
    icon: 'support_agent',
    label: 'Complaints & Support',
    to: '/admin-dashboard/support',
  },
  {
    icon: 'analytics',
    label: 'Reports & Analytics',
    to: '/admin-dashboard/reports',
  },
  {
    icon: 'settings',
    label: 'Settings & Permissions',
    to: '/admin-dashboard/settings',
  },
];

export const ADMIN_BOTTOM_LINKS = [
  {
    icon: 'help',
    label: 'Help Center',
    to: '/admin-dashboard/help',
  },
  {
    icon: 'logout',
    label: 'Logout',
    isDanger: true,
    action: 'logout',
  },
];

export const DASHBOARD_LABEL = 'ADMIN CONTROL PANEL';