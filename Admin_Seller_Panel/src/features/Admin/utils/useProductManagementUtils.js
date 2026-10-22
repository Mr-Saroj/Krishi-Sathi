// utils.js — constants, formatters and pure helpers

export const INITIAL_CATEGORIES = [
  { id: 1, name: 'Seeds', slug: 'seeds', count: 2, status: 'ACTIVE' },
  { id: 2, name: 'Fertilizers', slug: 'fertilizers', count: 1, status: 'ACTIVE' },
  { id: 3, name: 'Tools', slug: 'tools', count: 1, status: 'ACTIVE' },
  { id: 4, name: 'Irrigation', slug: 'irrigation', count: 1, status: 'ACTIVE' },
];

export const INITIAL_BRANDS = ['AgroGrow', 'FarmCare', 'AgroTools', 'WaterWise'];

export const INITIAL_PRODUCTS = [
  {
    id: 'PRD-1001',
    name: 'Hybrid Tomato Seeds',
    category: 'Seeds',
    brand: 'AgroGrow',
    seller: 'Green Farm Store',
    price: 450,
    previousPrice: 400,
    stock: 120,
    status: 'PENDING',
    attributes: { Weight: '500 g', Type: 'Hybrid', Crop: 'Tomato' },
    complaints: 1,
    priceChangePending: true,
    image: 'eco',
  },
  {
    id: 'PRD-1002',
    name: 'Organic NPK Fertilizer',
    category: 'Fertilizers',
    brand: 'FarmCare',
    seller: 'Kisan Supplies',
    price: 850,
    previousPrice: 850,
    stock: 75,
    status: 'APPROVED',
    attributes: { Weight: '5 kg', Type: 'Organic', Crop: 'Multiple' },
    complaints: 0,
    priceChangePending: false,
    image: 'compost',
  },
  {
    id: 'PRD-1003',
    name: 'Garden Hand Tool Set',
    category: 'Tools',
    brand: 'AgroTools',
    seller: 'Rural Mart',
    price: 699,
    previousPrice: 699,
    stock: 35,
    status: 'APPROVED',
    attributes: { Material: 'Steel', Pieces: '5', Type: 'Hand tools' },
    complaints: 0,
    priceChangePending: false,
    image: 'construction',
  },
  {
    id: 'PRD-1004',
    name: 'Drip Irrigation Kit',
    category: 'Irrigation',
    brand: 'WaterWise',
    seller: 'Green Farm Store',
    price: 1299,
    previousPrice: 1199,
    stock: 18,
    status: 'PENDING',
    attributes: { Length: '20 m', Type: 'Drip', Material: 'Plastic' },
    complaints: 2,
    priceChangePending: true,
    image: 'water_drop',
  },
  {
    id: 'PRD-1005',
    name: 'Premium Crop Booster',
    category: 'Fertilizers',
    brand: 'FarmCare',
    seller: 'Agri Direct',
    price: 999,
    previousPrice: 699,
    stock: 50,
    status: 'REJECTED',
    attributes: { Weight: '1 kg', Type: 'Crop input' },
    complaints: 1,
    priceChangePending: false,
    image: 'science',
  },
];

export const INITIAL_COMPLAINTS = [
  { id: 'CMP-101', productId: 'PRD-1001', reason: 'Product description may be misleading', status: 'OPEN' },
  { id: 'CMP-102', productId: 'PRD-1004', reason: 'Customer reported a quality issue', status: 'OPEN' },
  { id: 'CMP-103', productId: 'PRD-1005', reason: 'Unverified product claims', status: 'OPEN' },
];

export const money = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

export const statusStyles = {
  PENDING: 'bg-amber-500/10 text-amber-600',
  APPROVED: 'bg-emerald-500/10 text-emerald-600',
  REJECTED: 'bg-rose-500/10 text-rose-600',
  REMOVED: 'bg-rose-500/10 text-rose-600',
  ACTIVE: 'bg-emerald-500/10 text-emerald-600',
  OPEN: 'bg-amber-500/10 text-amber-600',
  RESOLVED: 'bg-emerald-500/10 text-emerald-600',
};

export const inputBase =
  'neu-inset rounded-xl border-0 py-2.5 text-sm text-on-surface outline-none placeholder:text-outline focus:outline-2 focus:outline-offset-2 focus:outline-secondary/60';

export const slugify = (text) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// "Weight: 500 g, Crop: Tomato" -> { Weight: '500 g', Crop: 'Tomato' }
export const parseAttributes = (text) => {
  const attributes = {};
  text.split(',').forEach((entry) => {
    const separator = entry.indexOf(':');
    if (separator > 0) {
      const key = entry.slice(0, separator).trim();
      const value = entry.slice(separator + 1).trim();
      if (key && value) attributes[key] = value;
    }
  });
  return attributes;
};