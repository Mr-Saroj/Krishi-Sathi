// src/components/SellerInventory.jsx
import React, { useEffect, useMemo, useState } from 'react';
import useInventory from '../hooks/useInventory';
import { Skeleton } from '../utils/middlecontentUtils';
import {
  StatusTabs,
  OffersTable,
  AddOfferModal,
  EditOfferModal,
} from './InventoryComponents';

const SellerInventory = () => {
  const { loading, error, catalogue, offers, submitOffer, updateOffer } = useInventory();

  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState('');

  // Clear the confirmation message after a few seconds
  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const counts = useMemo(
    () =>
      offers.reduce((acc, offer) => {
        acc[offer.status] = (acc[offer.status] || 0) + 1;
        return acc;
      }, {}),
    [offers]
  );

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return offers.filter(
      (offer) =>
        (activeTab === 'ALL' || offer.status === activeTab) &&
        (!term || `${offer.name} ${offer.category} ${offer.id}`.toLowerCase().includes(term))
    );
  }, [offers, activeTab, search]);

  // Look up the offer fresh so the modal reflects the latest state
  const editingOffer = offers.find((offer) => offer.id === editingId);

  const handleSubmit = async (form) => {
    await submitOffer(form);
    setActiveTab('PENDING');
    setNotice('Offer submitted. It will appear as approved once reviewed.');
  };

  const handleSave = async (id, values, files) => {
    const wasRejected = editingOffer?.status === 'REJECTED';
    await updateOffer(id, values, files);
    setNotice(wasRejected ? 'Offer resubmitted for approval.' : 'Offer updated.');
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {error && (
        <div role="alert" className="neu-inset rounded-xl px-4 py-3 text-sm font-medium text-error">
          {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="neu-inset rounded-xl px-4 py-3 text-sm font-medium text-secondary"
        >
          {notice}
        </div>
      )}

      {/* Heading */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-primary sm:text-2xl">Inventory</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Manage your product offers, stock, and approval status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAdding(true)}
          disabled={loading}
          className="neu-btn inline-flex w-fit items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-secondary disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          Add product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <StatusTabs
          active={activeTab}
          counts={counts}
          total={offers.length}
          onChange={setActiveTab}
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your offers"
          aria-label="Search your offers"
          className="neu-inset w-full rounded-lg bg-transparent px-3 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/40 lg:w-72"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="neu-raised space-y-4 rounded-2xl p-6" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="neu-raised rounded-2xl px-6 py-14 text-center">
          <span className="material-symbols-outlined text-4xl text-outline">inventory_2</span>
          <p className="mt-3 text-sm font-semibold text-primary">
            {offers.length === 0 ? 'No offers yet' : 'No offers match this view'}
          </p>
          <p className="mt-1 text-xs text-on-surface-variant">
            {offers.length === 0
              ? 'Add a product from the catalogue to start selling.'
              : 'Try another status or clear the search.'}
          </p>
        </div>
      ) : (
        <OffersTable offers={visible} onEdit={(offer) => setEditingId(offer.id)} />
      )}

      {adding && (
        <AddOfferModal
          catalogue={catalogue}
          offers={offers}
          onSubmit={handleSubmit}
          onClose={() => setAdding(false)}
        />
      )}

      {editingOffer && (
        <EditOfferModal
          offer={editingOffer}
          catalogue={catalogue}
          onSave={handleSave}
          onClose={() => setEditingId(null)}
        />
      )}

      <div className="h-2 sm:h-4" />
    </div>
  );
};

export default SellerInventory;