import React from 'react';
import { money, inputBase, formatDate, btn, btnPrimary, btnDanger } from '../utils/componentsUtils';
import {
  StatusBadge, PageHeader, StatGrid, Drawer, Modal, Field, InfoTile, EmptyRow, Toast,
} from './components';
import CustomerManagementSkeleton from '../Skeliton/CustomerManagementSkeleton';
import { useCustomerManagement } from '../hooks/customerManagementHooks';
import { BLOCK_REASONS, EMPTY_FILTERS, daysAgoLabel } from '../utils/customerManagementUtils';

const initials = (name) =>
  name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();

const CustomerManagement = () => {
  const {
    isLoading,
    toast,
    filters,
    setFilters,
    setFilter,
    selected,
    setSelectedId,
    blockForm,
    setBlockForm,
    blockTarget,
    stats,
    districts,
    visibleFarmers,
    openBlockForm,
    closeBlockForm,
    blockFarmer,
    allowFarmer,
  } = useCustomerManagement();

  if (isLoading) return <CustomerManagementSkeleton />;

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Customer Management"
        description="View every registered farmer and control whether they can log in to the marketplace."
      />

      <StatGrid
        items={[
          { label: 'Total Farmers', value: stats.total, icon: 'agriculture', color: 'text-violet-600', sub: 'REGISTERED CUSTOMERS' },
          { label: 'Login Allowed', value: stats.allowed, icon: 'how_to_reg', color: 'text-emerald-600', sub: 'ACTIVE ACCESS' },
          { label: 'Login Blocked', value: stats.blocked, icon: 'block', color: 'text-rose-600', sub: 'ACCESS REVOKED' },
          { label: 'New This Month', value: stats.newThisMonth, icon: 'person_add', color: 'text-sky-600', sub: 'LAST 30 DAYS' },
        ]}
      />

      <section className="neu-raised overflow-hidden rounded-2xl">
        {/* Filters */}
        <div className="flex flex-col gap-3 border-b border-primary/10 p-4 sm:p-6 md:flex-row">
          <div className={`${inputBase} flex items-center px-4 md:max-w-sm md:flex-1`}>
            <span className="material-symbols-outlined mr-2 text-[20px] text-outline">search</span>
            <input
              value={filters.query}
              onChange={(e) => setFilter('query', e.target.value)}
              placeholder="Name, phone, village, crop..."
              className="w-full bg-transparent outline-none placeholder:text-outline"
            />
          </div>

          <select value={filters.access} onChange={(e) => setFilter('access', e.target.value)} className={`${inputBase} px-4`}>
            <option value="ALL">All access states</option>
            <option value="ALLOWED">Login allowed</option>
            <option value="BLOCKED">Login blocked</option>
          </select>

          <select value={filters.district} onChange={(e) => setFilter('district', e.target.value)} className={`${inputBase} px-4`}>
            <option value="ALL">All districts</option>
            {districts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>

          <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className={btn}>
            Clear filters
          </button>
        </div>

        {/* Farmers table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-outline">
              <tr>
                {['Farmer', 'Location', 'Farm', 'Activity', 'Last login', 'Login access', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-4 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-primary/10">
              {visibleFarmers.map((f) => (
                <tr key={f.id} className="transition-colors hover:bg-primary/5">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="neu-inset flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-secondary">
                        {initials(f.name)}
                      </div>
                      <div>
                        <p className="font-semibold text-primary">{f.name}</p>
                        <p className="mt-1 text-xs text-outline">{f.id} · {f.phone}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-primary">{f.village}, {f.district}</p>
                    <p className="mt-1 text-xs text-on-surface-variant">{f.state}</p>
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-primary">{f.acres} acres</p>
                    <p className="mt-1 text-xs text-on-surface-variant">{f.crops.join(', ')}</p>
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-primary">{f.orders} orders</p>
                    <p className="mt-1 text-xs text-on-surface-variant">{money(f.spent)} spent</p>
                  </td>

                  <td className="px-5 py-4 text-on-surface-variant">{daysAgoLabel(f.lastLogin)}</td>

                  <td className="px-5 py-4">
                    <StatusBadge status={f.access} />
                    {f.access === 'BLOCKED' && (
                      <p className="mt-2 max-w-[180px] text-xs text-rose-600">{f.blockReason}</p>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <button type="button" onClick={() => setSelectedId(f.id)} className={btn}>View</button>
                      {f.access === 'ALLOWED' ? (
                        <button type="button" onClick={() => openBlockForm(f.id)} className={btnDanger}>Block login</button>
                      ) : (
                        <button type="button" onClick={() => allowFarmer(f.id)} className={btnPrimary}>Allow login</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {visibleFarmers.length === 0 && <EmptyRow colSpan={7}>No farmers match these filters.</EmptyRow>}
            </tbody>
          </table>
        </div>
      </section>

      {/* Farmer details */}
      {selected && (
        <Drawer title={selected.name} subtitle={`${selected.id} · Registered ${formatDate(selected.registeredAt)}`} onClose={() => setSelectedId(null)}>
          <div className="mt-6 flex items-center justify-between">
            <span className="text-sm text-on-surface-variant">Login access</span>
            <StatusBadge status={selected.access} />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <InfoTile label="Phone" value={selected.phone} />
            <InfoTile label="Email" value={selected.email} />
            <InfoTile label="Village / District" value={`${selected.village}, ${selected.district}`} />
            <InfoTile label="State" value={selected.state} />
            <InfoTile label="Land holding" value={`${selected.acres} acres`} />
            <InfoTile label="Last login" value={formatDate(selected.lastLogin)} />
            <InfoTile label="Total orders" value={selected.orders} />
            <InfoTile label="Total spent" value={money(selected.spent)} />
          </div>

          <div className="mt-6">
            <h3 className="font-bold text-primary">Crops grown</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {selected.crops.map((crop) => (
                <span key={crop} className="neu-inset rounded-full px-3 py-1 text-xs font-semibold text-on-surface-variant">{crop}</span>
              ))}
            </div>
          </div>

          <div className="neu-inset mt-6 space-y-3 rounded-xl p-4">
            <h3 className="font-bold text-primary">Access control</h3>
            {selected.access === 'BLOCKED' ? (
              <>
                <p className="text-sm text-rose-600">
                  Blocked on {formatDate(selected.blockedAt)}: {selected.blockReason}
                </p>
                <button type="button" onClick={() => allowFarmer(selected.id)} className={btnPrimary}>Allow login</button>
              </>
            ) : (
              <>
                <p className="text-sm text-on-surface-variant">
                  This farmer can log in, browse and place orders.
                </p>
                <button type="button" onClick={() => openBlockForm(selected.id)} className={btnDanger}>Block login</button>
              </>
            )}
          </div>

          <div className="mt-6">
            <h3 className="font-bold text-primary">Access history</h3>
            <div className="mt-3 space-y-2">
              {selected.history.map((h, i) => (
                <div key={`${h.date}-${i}`} className="flex items-start justify-between gap-4 border-b border-primary/10 py-2 text-sm">
                  <div>
                    <StatusBadge status={h.action} />
                    <p className="mt-2 text-on-surface-variant">{h.reason}</p>
                  </div>
                  <span className="shrink-0 text-xs text-outline">{formatDate(h.date)}</span>
                </div>
              ))}
              {selected.history.length === 0 && <p className="text-sm text-outline">No access changes recorded.</p>}
            </div>
          </div>
        </Drawer>
      )}

      {/* Block login modal */}
      {blockForm && blockTarget && (
        <Modal
          title="Block login access"
          subtitle={`${blockTarget.name} (${blockTarget.id}) will no longer be able to log in or place new orders.`}
          onClose={closeBlockForm}
        >
          <form onSubmit={blockFarmer} className="mt-6 space-y-4">
            <Field label="Reason">
              <select
                value={blockForm.reason}
                onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                className={`${inputBase} w-full px-4`}
              >
                {BLOCK_REASONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </Field>

            <Field
              label={blockForm.reason === 'Other' ? 'Describe the reason' : 'Additional note (optional)'}
              hint="Existing orders will still be fulfilled. The farmer is signed out immediately."
            >
              <textarea
                rows={3}
                value={blockForm.note}
                onChange={(e) => setBlockForm({ ...blockForm, note: e.target.value })}
                className={`${inputBase} w-full resize-none px-4`}
              />
            </Field>

            <div className="flex flex-wrap gap-3 pt-2">
              <button type="submit" className="neu-btn-primary rounded-xl px-5 py-3 text-sm font-semibold">Block login</button>
              <button type="button" onClick={closeBlockForm} className="neu-btn rounded-xl px-5 py-3 text-sm font-semibold text-primary">Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      <Toast message={toast} />
      <div className="h-2 sm:h-4" />
    </div>
  );
};

export default CustomerManagement;