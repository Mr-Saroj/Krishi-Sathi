// src/features/admin/components/SellerDetailPanel.jsx
import React, { useState } from 'react';
import {
  STATUS_TEXT,
  DOC_TEXT,
  formatINR,
} from '../utils/sellerManagementUtils';

const TABS = [
  ['overview', 'Overview'],
  ['products', 'Products'],
  ['orders', 'Orders'],
  ['performance', 'Performance'],
  ['complaints', 'Complaints'],
];

const Chip = ({ text, className = '' }) => (
  <span className={`neu-inset-sm whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-bold ${className}`}>
    {text}
  </span>
);

const Info = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-xs text-on-surface-variant">{label}</p>
    <p className="mt-0.5 break-words text-sm font-semibold text-on-surface">{value || '—'}</p>
  </div>
);

const Empty = ({ text }) => (
  <p className="neu-inset rounded-xl px-4 py-8 text-center text-sm text-outline">{text}</p>
);

const SellerDetailPanel = ({ seller, onClose, actions }) => {
  const [tab, setTab] = useState('overview');
  const [mode, setMode] = useState(null); // 'reject' | 'suspend' | null
  const [reason, setReason] = useState('');

  if (!seller) return null;

  const cancelMode = () => {
    setMode(null);
    setReason('');
  };

  const confirmMode = () => {
    if (!reason.trim()) return;
    if (mode === 'reject') actions.reject(seller.id, reason.trim());
    if (mode === 'suspend') actions.suspend(seller.id, reason.trim());
    cancelMode();
  };

  const { perf } = seller;

  return (
    <>
      <div className="fixed inset-0 z-[55] bg-primary/30 backdrop-blur-sm" onClick={onClose} />

      <aside className="fixed inset-y-0 right-0 z-[60] flex w-full max-w-xl flex-col bg-surface shadow-[-8px_0_24px_var(--neu-dark)]">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-secondary">{seller.id}</p>
            <h2 className="truncate text-xl font-extrabold text-primary">{seller.shopName}</h2>
            <p className="text-sm text-on-surface-variant">
              {seller.owner} • {seller.city}, {seller.state}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Chip text={seller.status} className={STATUS_TEXT[seller.status]} />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="neu-btn flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 pb-3">
          <div className="neu-inset flex gap-1 overflow-x-auto rounded-xl p-1.5">
            {TABS.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                  tab === key ? 'neu-raised-sm text-primary' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-3">
          {seller.note && (
            <div className="neu-inset rounded-xl px-4 py-3 text-sm text-on-surface-variant">
              <span className="font-semibold text-primary">Admin note: </span>
              {seller.note}
            </div>
          )}

          {tab === 'overview' && (
            <>
              <div className="neu-raised-sm grid gap-4 rounded-2xl p-4 sm:grid-cols-2">
                <Info label="Owner" value={seller.owner} />
                <Info label="Mobile" value={seller.mobile} />
                <Info label="Email" value={seller.email} />
                <Info label="Applied on" value={seller.appliedOn} />
                <div className="sm:col-span-2"><Info label="Shop address" value={seller.address} /></div>
                <Info label="GSTIN" value={seller.gstin} />
                <Info label="Product licence" value={seller.licence} />
                <div className="sm:col-span-2"><Info label="Categories" value={seller.categories.join(', ')} /></div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-bold text-primary">Required documents</h3>
                <div className="space-y-3">
                  {seller.documents.map((d) => (
                    <div key={d.name} className="neu-inset flex items-center justify-between gap-3 rounded-xl px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="material-symbols-outlined text-[20px] text-outline">description</span>
                        <span className="truncate text-sm font-medium text-on-surface">{d.name}</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className={`text-[11px] font-bold ${DOC_TEXT[d.status]}`}>{d.status}</span>
                        <button
                          type="button"
                          disabled={d.status === 'MISSING'}
                          className="neu-btn rounded-lg px-3 py-1.5 text-xs font-semibold text-secondary disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === 'products' &&
            (seller.products.length === 0 ? (
              <Empty text="No products listed yet." />
            ) : (
              <div className="space-y-3">
                {seller.products.map((p) => (
                  <div key={p.name} className="neu-raised-sm flex items-center justify-between gap-3 rounded-xl px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-primary">{p.name}</p>
                      <p className="text-xs text-on-surface-variant">
                        {formatINR(p.price)} • Stock {p.stock}
                      </p>
                    </div>
                    <Chip text={p.status} className={p.status === 'ACTIVE' ? 'text-secondary' : 'text-outline'} />
                  </div>
                ))}
              </div>
            ))}

          {tab === 'orders' &&
            (seller.orders.length === 0 ? (
              <Empty text="No orders yet." />
            ) : (
              <div className="space-y-3">
                {seller.orders.map((o) => (
                  <div key={o.id} className="neu-raised-sm flex items-center justify-between gap-3 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-primary">{o.id}</p>
                      <p className="text-xs text-on-surface-variant">{o.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-on-surface">{formatINR(o.amount)}</span>
                      <Chip
                        text={o.status}
                        className={o.status === 'CANCELLED' ? 'text-error' : o.status === 'DELIVERED' ? 'text-secondary' : 'text-amber-700'}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}

          {tab === 'performance' && (
            <div className="grid grid-cols-2 gap-4">
              {[
                ['Total sales', formatINR(perf.totalSales)],
                ['Total orders', perf.orders],
                ['Rating', perf.rating ? `${perf.rating} / 5` : '—'],
                ['On-time dispatch', perf.onTimeRate ? `${perf.onTimeRate}%` : '—'],
                ['Return rate', perf.orders ? `${perf.returnRate}%` : '—'],
                ['Open complaints', seller.complaints.filter((c) => c.status === 'OPEN').length],
              ].map(([label, value]) => (
                <div key={label} className="neu-raised-sm rounded-2xl p-4">
                  <p className="text-xs text-on-surface-variant">{label}</p>
                  <p className="mt-1 text-xl font-extrabold text-primary">{value}</p>
                </div>
              ))}
            </div>
          )}

          {tab === 'complaints' &&
            (seller.complaints.length === 0 ? (
              <Empty text="No complaints against this seller." />
            ) : (
              <div className="space-y-3">
                {seller.complaints.map((c) => (
                  <div key={c.id} className="neu-raised-sm flex items-center justify-between gap-3 rounded-xl px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-primary">{c.subject}</p>
                      <p className="text-xs text-on-surface-variant">{c.id} • {c.date}</p>
                    </div>
                    {c.status === 'OPEN' ? (
                      <button
                        type="button"
                        onClick={() => actions.resolveComplaint(seller.id, c.id)}
                        className="neu-btn shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-secondary"
                      >
                        Mark resolved
                      </button>
                    ) : (
                      <Chip text="RESOLVED" className="text-secondary" />
                    )}
                  </div>
                ))}
              </div>
            ))}
        </div>

        {/* Action bar */}
        <div className="border-t border-primary/10 px-5 py-4">
          {mode ? (
            <div className="space-y-3">
              <label className="text-sm font-semibold text-primary">
                Reason for {mode === 'reject' ? 'rejection' : 'suspension'}
                <span className="ml-1 text-error">*</span>
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Seller will see this note"
                className="neu-inset w-full resize-none rounded-xl border-0 px-4 py-3 text-sm text-on-surface outline-none placeholder:text-outline focus:outline-2 focus:outline-offset-2 focus:outline-secondary/60"
              />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={cancelMode} className="neu-btn rounded-xl px-5 py-2.5 text-sm font-semibold text-on-surface">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmMode}
                  disabled={!reason.trim()}
                  className="neu-btn rounded-xl px-5 py-2.5 text-sm font-semibold text-error disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Confirm {mode}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap justify-end gap-3">
              {seller.status === 'PENDING' && (
                <>
                  <button type="button" onClick={() => setMode('reject')} className="neu-btn rounded-xl px-5 py-2.5 text-sm font-semibold text-error">
                    Reject
                  </button>
                  <button type="button" onClick={() => actions.approve(seller.id)} className="neu-btn-primary rounded-xl px-6 py-2.5 text-sm font-semibold">
                    Approve seller
                  </button>
                </>
              )}
              {seller.status === 'APPROVED' && (
                <button type="button" onClick={() => setMode('suspend')} className="neu-btn rounded-xl px-5 py-2.5 text-sm font-semibold text-error">
                  Suspend seller
                </button>
              )}
              {seller.status === 'SUSPENDED' && (
                <button type="button" onClick={() => actions.reinstate(seller.id)} className="neu-btn-primary rounded-xl px-6 py-2.5 text-sm font-semibold">
                  Reinstate seller
                </button>
              )}
              {seller.status === 'REJECTED' && (
                <button type="button" onClick={() => actions.approve(seller.id)} className="neu-btn-primary rounded-xl px-6 py-2.5 text-sm font-semibold">
                  Approve anyway
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default SellerDetailPanel;