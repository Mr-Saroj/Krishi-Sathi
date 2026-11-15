// src/features/Admin/utils/adminSidebarUtil.js

export const SELLER_NAV_LINKS = [
  {
    icon: 'dashboard',
    label: 'Dashboard',
    to: '/seller-dashboard',
    end: true,
  },
  {
    icon: 'add_box',
    label: 'Add New Product',
    to: '/seller-dashboard/add-new product',
  },
  {
    icon: 'inventory',
    label: 'Inventory Management',
    to: '/seller-dashboard/inventory',
  },
  {
    icon: 'local_shipping',
    label: 'Ready for Pickup',
    to: '/seller-dashboard/ready-for-pickup',
  },


  {
    icon: 'assignment_return',
    label: 'Returns & Cancellations',
    to: '/seller-dashboard/returns',
  },
  {
    icon: 'account_balance_wallet',
    label: 'Pending Settlements',
    to: '/seller-dashboard/settlements',
  },
  {
    icon: 'store',
    label: 'Shop Profile',
    to: '/seller-dashboard/shop-profile',
  },
];

export const SELLER_BOTTOM_LINKS = [
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

export const DASHBOARD_LABEL = 'SELLER CONTROL PANEL';