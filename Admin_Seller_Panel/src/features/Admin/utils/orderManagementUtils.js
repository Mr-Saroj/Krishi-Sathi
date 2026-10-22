// orderData.js — mock data + pure helpers for Order Management
import { daysFromNow, todayISO, includesText } from '../utils/componentsUtils';

export const SELLERS = ['Green Farm Store', 'Kisan Supplies', 'Rural Mart', 'Agri Direct'];
export const PAYMENT_STATUSES = ['PAID', 'PENDING', 'FAILED', 'REFUNDED'];
export const DELIVERY_STATUSES = ['PLACED', 'PACKED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'RETURNED'];
export const DELIVERY_STEPS = ['PLACED', 'PACKED', 'IN_TRANSIT', 'DELIVERED'];

export const EMPTY_FILTERS = { query: '', seller: 'ALL', payment: 'ALL', delivery: 'ALL', from: '', to: '' };

const order = (id, customer, city, seller, placed, expected, amount, payment, delivery, items, extra = {}) => ({
  id, customer, city, seller,
  placedAt: daysFromNow(placed),
  expectedBy: daysFromNow(expected),
  amount, payment, delivery, items,
  dispute: null,
  refundStatus: 'NONE', // NONE | REQUESTED | APPROVED
  ...extra,
});

export const INITIAL_ORDERS = [
  order('ORD-5001', 'Ramesh Patel', 'Pune', 'Green Farm Store', -2, 2, 900, 'PAID', 'PACKED',
    [{ name: 'Hybrid Tomato Seeds', qty: 2, price: 450 }]),
  order('ORD-5002', 'Sunita Devi', 'Patna', 'Kisan Supplies', -7, -2, 850, 'PAID', 'IN_TRANSIT',
    [{ name: 'Organic NPK Fertilizer', qty: 1, price: 850 }]),
  order('ORD-5003', 'Anil Kumar', 'Lucknow', 'Rural Mart', -10, -5, 699, 'PAID', 'DELIVERED',
    [{ name: 'Garden Hand Tool Set', qty: 1, price: 699 }],
    { dispute: { id: 'DSP-01', reason: 'Tools arrived damaged', status: 'OPEN', outcome: null } }),
  order('ORD-5004', 'Meena Joshi', 'Nashik', 'Green Farm Store', -4, 1, 1299, 'PAID', 'CANCELLED',
    [{ name: 'Drip Irrigation Kit', qty: 1, price: 1299 }], { refundStatus: 'REQUESTED' }),
  order('ORD-5005', 'Harpreet Singh', 'Ludhiana', 'Agri Direct', -12, -7, 999, 'PAID', 'RETURNED',
    [{ name: 'Premium Crop Booster', qty: 1, price: 999 }],
    { refundStatus: 'REQUESTED', dispute: { id: 'DSP-02', reason: 'Product claims not as described', status: 'OPEN', outcome: null } }),
  order('ORD-5006', 'Lakshmi N', 'Hyderabad', 'Kisan Supplies', -1, 4, 1700, 'PENDING', 'PLACED',
    [{ name: 'Organic NPK Fertilizer', qty: 2, price: 850 }]),
  order('ORD-5007', 'Bhaskar Rout', 'Bhubaneswar', 'Rural Mart', -9, -4, 1398, 'PAID', 'PACKED',
    [{ name: 'Garden Hand Tool Set', qty: 2, price: 699 }]),
  order('ORD-5008', 'Farida Khan', 'Jaipur', 'Agri Direct', -3, 3, 999, 'PAID', 'IN_TRANSIT',
    [{ name: 'Premium Crop Booster', qty: 1, price: 999 }]),
  order('ORD-5009', 'Gopal Rao', 'Nagpur', 'Green Farm Store', -15, -10, 450, 'REFUNDED', 'RETURNED',
    [{ name: 'Hybrid Tomato Seeds', qty: 1, price: 450 }],
    { refundStatus: 'APPROVED', dispute: { id: 'DSP-00', reason: 'Wrong seed variety delivered', status: 'RESOLVED', outcome: 'CUSTOMER' } }),
  order('ORD-5010', 'Tanya Sharma', 'Indore', 'Kisan Supplies', -6, -1, 850, 'PAID', 'DELIVERED',
    [{ name: 'Organic NPK Fertilizer', qty: 1, price: 850 }]),
  order('ORD-5011', 'Kavita Rout', 'Bhubaneswar', 'Green Farm Store', -1, 3, 1299, 'PAID', 'PACKED',
    [{ name: 'Drip Irrigation Kit', qty: 1, price: 1299 }]),
  order('ORD-5012', 'Imran Siddiqui', 'Jaipur', 'Agri Direct', -5, 1, 999, 'PAID', 'IN_TRANSIT',
    [{ name: 'Premium Crop Booster', qty: 1, price: 999 }]),
];

const CLOSED = ['DELIVERED', 'CANCELLED', 'RETURNED'];

export const isDelayed = (o) => !CLOSED.includes(o.delivery) && o.expectedBy < todayISO();

export const isCancelledOrReturned = (o) => ['CANCELLED', 'RETURNED'].includes(o.delivery);

export const needsAttention = (o) => o.dispute?.status === 'OPEN' || o.refundStatus === 'REQUESTED';

// Refund can be approved only when paid, requested, no open dispute, and the order was
// cancelled/returned or the dispute was decided in the customer's favour.
export const isRefundEligible = (o) =>
  o.payment === 'PAID' &&
  o.refundStatus === 'REQUESTED' &&
  o.dispute?.status !== 'OPEN' &&
  (isCancelledOrReturned(o) || o.dispute?.outcome === 'CUSTOMER');

export const filterOrders = (orders, f, tab) =>
  orders.filter((o) => {
    if (!includesText([o.id, o.customer, o.seller, o.city], f.query)) return false;
    if (f.seller !== 'ALL' && o.seller !== f.seller) return false;
    if (f.payment !== 'ALL' && o.payment !== f.payment) return false;
    if (f.delivery !== 'ALL' && o.delivery !== f.delivery) return false;
    if (f.from && o.placedAt < f.from) return false;
    if (f.to && o.placedAt > f.to) return false;

    if (tab === 'delayed') return isDelayed(o);
    if (tab === 'issues') return isCancelledOrReturned(o);
    if (tab === 'disputes') return needsAttention(o);
    return true;
  });

export const sellerProgress = (orders) =>
  SELLERS.map((seller) => {
    const list = orders.filter((o) => o.seller === seller);
    const count = (status) => list.filter((o) => o.delivery === status).length;
    const cancelled = list.filter(isCancelledOrReturned).length;
    const delivered = count('DELIVERED');
    const active = list.length - cancelled;
    return {
      seller,
      total: list.length,
      placed: count('PLACED'),
      packed: count('PACKED'),
      inTransit: count('IN_TRANSIT'),
      delivered,
      cancelled,
      delayed: list.filter(isDelayed).length,
      rate: active > 0 ? Math.round((delivered / active) * 100) : 0,
    };
  });