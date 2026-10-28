export const CATEGORY_OPTIONS = ['SEEDS', 'FERTILIZERS', 'TOOLS', 'IRRIGATION'];

export const INITIAL_CATALOG = [
  { id: 'PRODUCT01', category: 'SEEDS', name: 'Tomato Seeds', brand: 'AgroGrow', price: 450 },
];

export const money = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

export const inputBase =
  'neu-inset rounded-xl border-0 py-2.5 text-sm text-on-surface outline-none placeholder:text-outline focus:outline-2 focus:outline-offset-2 focus:outline-secondary/60';