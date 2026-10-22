// financeData.js — mock data + pure helpers for Finance & Commission
import { daysFromNow } from '../utils/componentsUtils';

export const DEFAULT_RATE = 10;

export const INITIAL_RULES = [
  { id: 'CR-01', scope: 'DEFAULT', target: 'All other categories', rate: 10, status: 'ACTIVE' },
  { id: 'CR-02', scope: 'CATEGORY', target: 'Seeds', rate: 8, status: 'ACTIVE' },
  { id: 'CR-03', scope: 'CATEGORY', target: 'Fertilizers', rate: 10, status: 'ACTIVE' },
  { id: 'CR-04', scope: 'CATEGORY', target: 'Tools', rate: 12, status: 'ACTIVE' },
  { id: 'CR-05', scope: 'CATEGORY', target: 'Irrigation', rate: 9, status: 'ACTIVE' },
  { id: 'CR-06', scope: 'SELLER', target: 'Green Farm Store', rate: 7, status: 'ACTIVE' },
];

export const CATEGORIES = ['Seeds', 'Fertilizers', 'Tools', 'Irrigation'];
export const SELLERS = ['Green Farm Store', 'Kisan Supplies', 'Rural Mart', 'Agri Direct'];

// Resolution order: seller override > category rule > default rule
export const resolveRate = (rules, category, seller) => {
  const active = rules.filter((r) => r.status === 'ACTIVE');
  const sellerRule = active.find((r) => r.scope === 'SELLER' && r.target === seller);
  if (sellerRule) return { rate: sellerRule.rate, source: `Seller override (${seller})` };
  const categoryRule = active.find((r) => r.scope === 'CATEGORY' && r.target === category);
  if (categoryRule) return { rate: categoryRule.rate, source: `Category rule (${category})` };
  const defaultRule = active.find((r) => r.scope === 'DEFAULT');
  return { rate: defaultRule ? defaultRule.rate : DEFAULT_RATE, source: 'Default rule' };
};

export const INITIAL_SETTLEMENTS = [
  { id: 'STL-301', seller: 'Green Farm Store', period: '1–15 Oct', orders: 42, gross: 58200, rate: 7, status: 'PENDING', paidOn: null },
  { id: 'STL-302', seller: 'Kisan Supplies', period: '1–15 Oct', orders: 35, gross: 47850, rate: 10, status: 'PROCESSING', paidOn: null },
  { id: 'STL-303', seller: 'Rural Mart', period: '1–15 Oct', orders: 21, gross: 29400, rate: 12, status: 'ON_HOLD', paidOn: null },
  { id: 'STL-304', seller: 'Agri Direct', period: '1–15 Oct', orders: 18, gross: 21900, rate: 10, status: 'PENDING', paidOn: null },
  { id: 'STL-295', seller: 'Green Farm Store', period: '16–30 Sep', orders: 39, gross: 51300, rate: 7, status: 'PAID', paidOn: daysFromNow(-14) },
  { id: 'STL-296', seller: 'Kisan Supplies', period: '16–30 Sep', orders: 30, gross: 40100, rate: 10, status: 'PAID', paidOn: daysFromNow(-14) },
];

export const withTotals = (s) => {
  const commission = Math.round((s.gross * s.rate) / 100);
  return { ...s, commission, net: s.gross - commission };
};

export const INITIAL_FEES = [
  { id: 'PF-01', partner: 'Ravi Kumar', deliveries: 38, feePerDelivery: 45, status: 'PENDING' },
  { id: 'PF-02', partner: 'Suresh Yadav', deliveries: 27, feePerDelivery: 60, status: 'PENDING' },
  { id: 'PF-03', partner: 'Manoj Tiwari', deliveries: 41, feePerDelivery: 55, status: 'PAID' },
  { id: 'PF-04', partner: 'Anita Sharma', deliveries: 33, feePerDelivery: 45, status: 'PENDING' },
  { id: 'PF-05', partner: 'Debasis Nayak', deliveries: 24, feePerDelivery: 55, status: 'PAID' },
];

const txn = (id, daysAgo, ref, type, method, amount, gatewayAmount, status, recon) => ({
  id, date: daysFromNow(-daysAgo), ref, type, method, amount, gatewayAmount, status, recon,
});

export const INITIAL_TRANSACTIONS = [
  txn('TXN-7001', 2, 'ORD-5001', 'PAYMENT', 'UPI', 900, 900, 'SUCCESS', 'UNRECONCILED'),
  txn('TXN-7002', 7, 'ORD-5002', 'PAYMENT', 'Card', 850, 850, 'SUCCESS', 'MATCHED'),
  txn('TXN-7003', 4, 'ORD-5004', 'PAYMENT', 'Net banking', 1299, 1299, 'SUCCESS', 'UNRECONCILED'),
  txn('TXN-7004', 12, 'ORD-5005', 'PAYMENT', 'UPI', 999, 999, 'SUCCESS', 'MATCHED'),
  txn('TXN-7005', 1, 'ORD-5006', 'PAYMENT', 'UPI', 1700, 0, 'FAILED', 'UNRECONCILED'),
  txn('TXN-7006', 9, 'ORD-5007', 'PAYMENT', 'Card', 1398, 1398, 'SUCCESS', 'MATCHED'),
  txn('TXN-7007', 3, 'ORD-5008', 'PAYMENT', 'COD', 999, 949, 'SUCCESS', 'MISMATCH'),
  txn('TXN-7008', 15, 'ORD-5009', 'PAYMENT', 'UPI', 450, 450, 'SUCCESS', 'MATCHED'),
  txn('TXN-7009', 11, 'ORD-5009', 'REFUND', 'UPI', 450, 450, 'SUCCESS', 'MATCHED'),
  txn('TXN-7010', 14, 'STL-295', 'PAYOUT', 'Bank transfer', 47709, 47709, 'SUCCESS', 'MATCHED'),
  txn('TXN-7011', 14, 'STL-296', 'PAYOUT', 'Bank transfer', 36090, 36900, 'SUCCESS', 'MISMATCH'),
  txn('TXN-7012', 1, 'ORD-5004', 'REFUND', 'Net banking', 1299, 1299, 'PENDING', 'UNRECONCILED'),
];

export const sum = (list, pick) => list.reduce((total, item) => total + pick(item), 0);

export const EMPTY_RULE = { scope: 'CATEGORY', target: CATEGORIES[0], rate: '' };