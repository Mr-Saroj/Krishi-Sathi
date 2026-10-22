// src/features/admin/utils/sellerManagementUtils.js
// Helpers + mock data for Seller Management (UI only – replace with API data).

export const STATUS_TEXT = {
  PENDING: 'text-amber-700',
  APPROVED: 'text-secondary',
  REJECTED: 'text-error',
  SUSPENDED: 'text-orange-700',
};

export const DOC_TEXT = {
  VERIFIED: 'text-secondary',
  PENDING: 'text-amber-700',
  MISSING: 'text-error',
};

export const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export const getSellerStats = (sellers) => ({
  total: sellers.length,
  pending: sellers.filter((s) => s.status === 'PENDING').length,
  approved: sellers.filter((s) => s.status === 'APPROVED').length,
  suspended: sellers.filter((s) => s.status === 'SUSPENDED').length,
});

export const openComplaintCount = (seller) =>
  seller.complaints.filter((c) => c.status === 'OPEN').length;

export const filterSellers = (sellers, { tab, query, status }) => {
  const q = query.trim().toLowerCase();
  return sellers.filter((s) => {
    if (tab === 'applications' && s.status !== 'PENDING') return false;
    if (tab === 'complaints' && openComplaintCount(s) === 0) return false;
    if (tab === 'all' && status !== 'ALL' && s.status !== status) return false;
    if (!q) return true;
    return [s.id, s.shopName, s.owner, s.city, s.state]
      .join(' ')
      .toLowerCase()
      .includes(q);
  });
};

const docs = (a, b, c) => [
  { name: 'GST Certificate', status: a },
  { name: 'Fertilizer / Seed Licence', status: b },
  { name: 'Shop Registration Proof', status: c },
];

const seller = (base) => ({
  products: [],
  orders: [],
  complaints: [],
  perf: { totalSales: 0, orders: 0, rating: 0, onTimeRate: 0, returnRate: 0 },
  note: '',
  ...base,
});

export const INITIAL_SELLERS = [
  seller({
    id: 'S-1001', shopName: 'Gill Agri-Biotech', owner: 'Gurpreet Singh Gill',
    mobile: '9876543210', email: 'gill@agribiotech.in', city: 'Ludhiana', state: 'Punjab',
    address: 'Focal Point, Phase 5, Ludhiana', gstin: '03ABCDE1234F1Z5',
    licence: 'PB/SEED/2023/4471', categories: ['Seeds', 'Fertilizers'],
    appliedOn: '12 Mar 2026', status: 'APPROVED',
    documents: docs('VERIFIED', 'VERIFIED', 'VERIFIED'),
    products: [
      { name: 'PBW-824 Wheat Seed 40kg', price: 2450, stock: 120, status: 'ACTIVE' },
      { name: 'Bio-NPK Granules 10kg', price: 780, stock: 64, status: 'ACTIVE' },
    ],
    orders: [
      { id: 'ORD-8841', amount: 12250, status: 'DELIVERED', date: '18 Oct 2026' },
      { id: 'ORD-8870', amount: 4680, status: 'SHIPPED', date: '21 Oct 2026' },
    ],
    perf: { totalSales: 245680, orders: 184, rating: 4.9, onTimeRate: 96, returnRate: 1.2 },
  }),
  seller({
    id: 'S-1002', shopName: 'Green Harvest Traders', owner: 'Anita Devi',
    mobile: '9123456780', email: 'anita@greenharvest.in', city: 'Patna', state: 'Bihar',
    address: 'Kankarbagh Main Road, Patna', gstin: '10PQRSX5678L1Z2',
    licence: 'BR/FERT/2025/1182', categories: ['Fertilizers'],
    appliedOn: '19 Oct 2026', status: 'PENDING',
    documents: docs('VERIFIED', 'PENDING', 'VERIFIED'),
  }),
  seller({
    id: 'S-1003', shopName: 'Kisan Seva Kendra', owner: 'Ramesh Patel',
    mobile: '9988776655', email: 'ramesh@kisanseva.in', city: 'Anand', state: 'Gujarat',
    address: 'Station Road, Anand', gstin: '24LMNOP9087K1Z9',
    licence: 'Not provided', categories: ['Crop Protection', 'Sprayers'],
    appliedOn: '21 Oct 2026', status: 'PENDING',
    documents: docs('VERIFIED', 'MISSING', 'PENDING'),
  }),
  seller({
    id: 'S-1004', shopName: 'Odisha Agro Mart', owner: 'Subrat Mohanty',
    mobile: '9437001122', email: 'subrat@odishaagro.in', city: 'Bhubaneswar', state: 'Odisha',
    address: 'Unit-3, Market Building, Bhubaneswar', gstin: '21ABCPM4321D1ZQ',
    licence: 'OD/PEST/2024/0932', categories: ['Drip Irrigation', 'Tools'],
    appliedOn: '02 Jun 2026', status: 'APPROVED',
    documents: docs('VERIFIED', 'VERIFIED', 'VERIFIED'),
    products: [{ name: '16mm Inline Lateral 100m', price: 1850, stock: 38, status: 'ACTIVE' }],
    orders: [{ id: 'ORD-8812', amount: 5550, status: 'DELIVERED', date: '14 Oct 2026' }],
    perf: { totalSales: 98400, orders: 71, rating: 4.3, onTimeRate: 88, returnRate: 3.8 },
    complaints: [
      { id: 'C-501', subject: 'Late delivery of drip kit', date: '20 Oct 2026', status: 'OPEN' },
    ],
  }),
  seller({
    id: 'S-1005', shopName: 'Farm Fresh Inputs', owner: 'Vikram Rao',
    mobile: '9822001133', email: 'vikram@farmfresh.in', city: 'Nashik', state: 'Maharashtra',
    address: 'MIDC Area, Nashik', gstin: '27FGHIJ3344M1Z1',
    licence: 'MH/FERT/2022/7710', categories: ['Fertilizers'],
    appliedOn: '15 Jan 2026', status: 'SUSPENDED',
    note: 'Suspended after repeated quality complaints.',
    documents: docs('VERIFIED', 'VERIFIED', 'VERIFIED'),
    products: [{ name: 'Liquid Potash 5L', price: 640, stock: 0, status: 'INACTIVE' }],
    orders: [{ id: 'ORD-8630', amount: 3200, status: 'CANCELLED', date: '02 Oct 2026' }],
    perf: { totalSales: 41200, orders: 33, rating: 3.1, onTimeRate: 72, returnRate: 11.5 },
    complaints: [
      { id: 'C-488', subject: 'Product quality below label claim', date: '28 Sep 2026', status: 'OPEN' },
      { id: 'C-472', subject: 'Wrong item delivered', date: '11 Sep 2026', status: 'RESOLVED' },
    ],
  }),
  seller({
    id: 'S-1006', shopName: 'Bio Bharat Supplies', owner: 'Meena Kumari',
    mobile: '9414002244', email: 'meena@biobharat.in', city: 'Jaipur', state: 'Rajasthan',
    address: 'Sitapura Industrial Area, Jaipur', gstin: '08RSTUV7788N1Z3',
    licence: 'Expired', categories: ['Organic Inputs'],
    appliedOn: '05 Oct 2026', status: 'REJECTED',
    note: 'Product licence expired. Re-apply with a valid licence.',
    documents: docs('VERIFIED', 'MISSING', 'VERIFIED'),
  }),
];