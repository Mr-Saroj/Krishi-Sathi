// src/hooks/useInventory.js
import { useCallback, useEffect, useState } from 'react';

// Which offer fields a seller may edit, by offer status.
// Change this one map to change the rules everywhere.
export const EDITABLE_FIELDS = {
  PENDING: ['price', 'stock', 'packageQty', 'prepTime'],
  APPROVED: ['stock', 'price', 'prepTime'],
  REJECTED: ['price', 'stock', 'packageQty', 'prepTime'], // editing resubmits for review
  SUSPENDED: [], // read-only until support lifts the suspension
};

export const STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'];

const today = () =>
  new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

// Demo data. Replace with GET /master-catalogue and GET /seller/offers.
const initialCatalogue = [
  {
    id: 'C-001',
    name: 'Paddy Seeds (MTU 1010)',
    category: 'Seeds',
    brand: 'Odisha Seeds Corp',
    unit: 'kg',
    requiredDocs: ['Seed certification tag', 'Lot test report'],
  },
  {
    id: 'C-002',
    name: 'Urea 46% N',
    category: 'Fertilizers',
    brand: 'IFFCO',
    unit: 'kg',
    requiredDocs: ['Fertilizer licence', 'Batch analysis report'],
  },
  {
    id: 'C-003',
    name: 'Neem Oil Bio-Pesticide',
    category: 'Pesticides',
    brand: 'GreenShield',
    unit: 'L',
    requiredDocs: ['Pesticide dealer licence', 'Insecticide registration (CIB&RC)'],
  },
  {
    id: 'C-004',
    name: 'Knapsack Hand Sprayer 16 L',
    category: 'Farm Tools',
    brand: 'KisanKraft',
    unit: 'pc',
    requiredDocs: ['Warranty card'],
  },
  {
    id: 'C-005',
    name: 'Drip Irrigation Pipe',
    category: 'Irrigation',
    brand: 'Jain Irrigation',
    unit: 'm',
    requiredDocs: [],
  },
];

const initialOffers = [
  {
    id: 'OF-301',
    catalogueId: 'C-001',
    name: 'Paddy Seeds (MTU 1010)',
    category: 'Seeds',
    unit: 'kg',
    price: 1250,
    stock: 3,
    packageQty: 5,
    prepTime: 2,
    status: 'APPROVED',
    reason: '',
    images: [],
    docs: [
      { name: 'Seed certification tag', fileName: 'tag.pdf' },
      { name: 'Lot test report', fileName: 'lot-report.pdf' },
    ],
    updatedAt: '18 Oct 2026',
  },
  {
    id: 'OF-302',
    catalogueId: 'C-002',
    name: 'Urea 46% N',
    category: 'Fertilizers',
    unit: 'kg',
    price: 590,
    stock: 120,
    packageQty: 50,
    prepTime: 24,
    status: 'APPROVED',
    reason: '',
    images: [],
    docs: [],
    updatedAt: '15 Oct 2026',
  },
  {
    id: 'OF-303',
    catalogueId: 'C-003',
    name: 'Neem Oil Bio-Pesticide',
    category: 'Pesticides',
    unit: 'L',
    price: 780,
    stock: 6,
    packageQty: 1,
    prepTime: 4,
    status: 'PENDING',
    reason: '',
    images: [],
    docs: [],
    updatedAt: '22 Oct 2026',
  },
  {
    id: 'OF-304',
    catalogueId: 'C-004',
    name: 'Knapsack Hand Sprayer 16 L',
    category: 'Farm Tools',
    unit: 'pc',
    price: 1899,
    stock: 14,
    packageQty: 1,
    prepTime: 6,
    status: 'REJECTED',
    reason: 'Warranty card is unreadable. Upload a clear copy and resubmit.',
    images: [],
    docs: [],
    updatedAt: '20 Oct 2026',
  },
  {
    id: 'OF-305',
    catalogueId: 'C-005',
    name: 'Drip Irrigation Pipe',
    category: 'Irrigation',
    unit: 'm',
    price: 2400,
    stock: 9,
    packageQty: 50,
    prepTime: 12,
    status: 'SUSPENDED',
    reason: 'Suspended after repeated delivery-quality complaints. Contact support.',
    images: [],
    docs: [],
    updatedAt: '12 Oct 2026',
  },
];

const useInventory = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [catalogue, setCatalogue] = useState([]);
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setCatalogue(initialCatalogue);
        setOffers(initialOffers);
      } catch (err) {
        console.error('Inventory loading error:', err);
        setError('Failed to load inventory.');
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // form = { catalogueId, price, stock, packageQty, prepTime,
  //          images: [{ file, url }], docs: { [docName]: File } }
  const submitOffer = useCallback(
    async (form) => {
      // Real API: send multipart/form-data
      // const body = new FormData();
      // body.append('catalogueId', form.catalogueId);
      // ['price','stock','packageQty','prepTime'].forEach((k) => body.append(k, form[k]));
      // form.images.forEach((img) => body.append('images', img.file));
      // Object.entries(form.docs).forEach(([name, file]) => body.append(`docs[${name}]`, file));
      // await api.post('/seller/offers', body);
      await new Promise((resolve) => setTimeout(resolve, 600));

      const item = catalogue.find((c) => c.id === form.catalogueId);
      const offer = {
        id: `OF-${Date.now().toString().slice(-6)}`,
        catalogueId: item.id,
        name: item.name,
        category: item.category,
        unit: item.unit,
        price: Number(form.price),
        stock: Number(form.stock),
        packageQty: Number(form.packageQty),
        prepTime: Number(form.prepTime),
        status: 'PENDING',
        reason: '',
        images: form.images.map((img) => img.url),
        docs: Object.entries(form.docs).map(([name, file]) => ({
          name,
          fileName: file.name,
        })),
        updatedAt: today(),
      };
      setOffers((prev) => [offer, ...prev]);
      return offer;
    },
    [catalogue]
  );

  // values: edited fields. files (rejected offers only): { images, docs }
  const updateOffer = useCallback(async (id, values, files) => {
    // await api.patch(`/seller/offers/${id}`, ...);
    await new Promise((resolve) => setTimeout(resolve, 400));

    setOffers((prev) =>
      prev.map((offer) => {
        if (offer.id !== id) return offer;
        const next = { ...offer, updatedAt: today() };

        EDITABLE_FIELDS[offer.status].forEach((field) => {
          if (field in values) next[field] = Number(values[field]);
        });

        if (offer.status === 'REJECTED') {
          next.status = 'PENDING';
          next.reason = '';
          if (files?.images?.length) next.images = files.images.map((i) => i.url);
          if (files?.docs) {
            const replaced = Object.entries(files.docs).map(([name, file]) => ({
              name,
              fileName: file.name,
            }));
            const kept = offer.docs.filter(
              (d) => !replaced.some((r) => r.name === d.name)
            );
            next.docs = [...kept, ...replaced];
          }
        }
        return next;
      })
    );
  }, []);

  return { loading, error, catalogue, offers, submitOffer, updateOffer };
};

export default useInventory;