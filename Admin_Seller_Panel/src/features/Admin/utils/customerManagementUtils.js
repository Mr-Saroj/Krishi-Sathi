// customerManagementUtils.js — mock data + pure helpers for Customer (Farmer) Management
import { daysFromNow, includesText } from '../utils/componentsUtils';

export const BLOCK_REASONS = [
  'Fraudulent activity',
  'Repeated payment failures',
  'Policy violation',
  'Fake or duplicate account',
  'Abusive behaviour',
  'Other',
];

export const EMPTY_FILTERS = { query: '', access: 'ALL', district: 'ALL' };
export const EMPTY_BLOCK_FORM = { id: null, reason: BLOCK_REASONS[0], note: '' };

const farmer = (id, name, phone, village, district, state, acres, crops, joined, lastLogin, orders, spent, extra = {}) => ({
  id, name, phone, village, district, state, acres, crops,
  email: `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@example.com`,
  registeredAt: daysFromNow(-joined),
  lastLogin: daysFromNow(-lastLogin),
  orders, spent,
  access: 'ALLOWED', // ALLOWED | BLOCKED
  blockReason: null,
  blockedAt: null,
  history: [],
  ...extra,
});

export const INITIAL_FARMERS = [
  farmer('FRM-1001', 'Ramesh Patel', '9811100001', 'Shirur', 'Pune', 'Maharashtra', 6.5, ['Tomato', 'Onion'], 420, 1, 24, 31850),
  farmer('FRM-1002', 'Sunita Devi', '9811100002', 'Danapur', 'Patna', 'Bihar', 3, ['Wheat', 'Maize'], 310, 3, 15, 18400),
  farmer('FRM-1003', 'Anil Kumar', '9811100003', 'Malihabad', 'Lucknow', 'Uttar Pradesh', 8, ['Mango', 'Sugarcane'], 520, 12, 31, 52300),
  farmer('FRM-1004', 'Meena Joshi', '9811100004', 'Sinnar', 'Nashik', 'Maharashtra', 4.2, ['Grapes'], 150, 0, 9, 14999),
  farmer('FRM-1005', 'Harpreet Singh', '9811100005', 'Jagraon', 'Ludhiana', 'Punjab', 12, ['Wheat', 'Paddy'], 610, 40, 44, 88650, {
    access: 'BLOCKED',
    blockReason: 'Fraudulent activity',
    blockedAt: daysFromNow(-20),
    history: [{ action: 'BLOCKED', reason: 'Fraudulent activity', date: daysFromNow(-20) }],
  }),
  farmer('FRM-1006', 'Lakshmi Narayan', '9811100006', 'Medchal', 'Hyderabad', 'Telangana', 2.5, ['Chilli', 'Cotton'], 45, 2, 3, 4250),
  farmer('FRM-1007', 'Bhaskar Rout', '9811100007', 'Khordha', 'Bhubaneswar', 'Odisha', 5, ['Paddy', 'Vegetables'], 260, 5, 19, 26700, {
    history: [
      { action: 'BLOCKED', reason: 'Repeated payment failures', date: daysFromNow(-90) },
      { action: 'ALLOWED', reason: 'Payment issue resolved', date: daysFromNow(-84) },
    ],
  }),
  farmer('FRM-1008', 'Farida Khan', '9811100008', 'Sanganer', 'Jaipur', 'Rajasthan', 7.8, ['Mustard', 'Bajra'], 380, 8, 27, 39100),
  farmer('FRM-1009', 'Gopal Rao', '9811100009', 'Katol', 'Nagpur', 'Maharashtra', 9, ['Orange', 'Cotton'], 700, 60, 12, 16200, {
    access: 'BLOCKED',
    blockReason: 'Fake or duplicate account',
    blockedAt: daysFromNow(-33),
    history: [{ action: 'BLOCKED', reason: 'Fake or duplicate account', date: daysFromNow(-33) }],
  }),
  farmer('FRM-1010', 'Tanya Sharma', '9811100010', 'Mhow', 'Indore', 'Madhya Pradesh', 3.6, ['Soybean', 'Gram'], 18, 0, 2, 2550),
];

export const districtsOf = (farmers) => [...new Set(farmers.map((f) => f.district))].sort();

export const filterFarmers = (farmers, f) =>
  farmers.filter(
    (x) =>
      includesText([x.name, x.id, x.phone, x.email, x.village, x.district, x.crops.join(' ')], f.query) &&
      (f.access === 'ALL' || x.access === f.access) &&
      (f.district === 'ALL' || x.district === f.district)
  );

export const farmerStats = (farmers) => ({
  total: farmers.length,
  allowed: farmers.filter((f) => f.access === 'ALLOWED').length,
  blocked: farmers.filter((f) => f.access === 'BLOCKED').length,
  newThisMonth: farmers.filter((f) => f.registeredAt >= daysFromNow(-30)).length,
});

// "Today", "Yesterday", "5 days ago"
export const daysAgoLabel = (iso) => {
  const diff = Math.round((new Date(`${daysFromNow(0)}T00:00:00`) - new Date(`${iso}T00:00:00`)) / 86400000);
  if (diff <= 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return `${diff} days ago`;
};