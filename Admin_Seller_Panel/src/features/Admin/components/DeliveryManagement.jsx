import React from 'react';
import { inputBase, btn, btnPrimary, btnDanger } from '../utils/componentsUtils';
import {
  StatusBadge, PageHeader, StatGrid, TabBar, Modal, Field, EmptyRow, Toast,
} from './components';
import DeliveryManagementSkeleton from '../Skeliton/DeliveryManagementSkeleton';
import { useDeliveryManagement } from '../hooks/deliveryManagementHooks';
import {
  VEHICLES, FAIL_REASONS, TRACK_STEPS, NEXT_STEP, IN_FLIGHT, workloadOf, eligiblePartners,
} from '../utils/deliveryManagementUtils';

const DeliveryManagement = () => {
  const {
    isLoading,
    toast,
    areas,
    partners,
    shipments,
    tab,
    setTab,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    picks,
    setPicks,
    showPartnerForm,
    setShowPartnerForm,
    partnerForm,
    setPartnerForm,
    areaForm,
    setAreaForm,
    failTarget,
    setFailTarget,
    awaiting,
    failed,
    partnerName,
    stats,
    visibleShipments,
    patchShipment,
    patchPartner,
    assign,
    confirmFailure,
    togglePartnerArea,
    registerPartner,
    verifyPartner,
    addArea,
    toggleArea,
  } = useDeliveryManagement();

  if (isLoading) return <DeliveryManagementSkeleton />;

  const tabs = [
    ['monitor', 'Live deliveries'],
    ['assign', `Assign orders (${awaiting.length})`],
    ['failed', `Failed & reassign (${failed.length})`],
    ['partners', 'Delivery partners'],
    ['areas', 'Service areas'],
  ];

  const renderAssign = (shipment, excludeId = null, reassign = false) => {
    const options = eligiblePartners(shipment, partners, areas, excludeId);
    return (
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={picks[shipment.id] || ''}
          onChange={(e) => setPicks((prev) => ({ ...prev, [shipment.id]: e.target.value }))}
          className={`${inputBase} min-w-[200px] px-3`}
        >
          <option value="">{options.length ? 'Select partner' : 'No eligible partner'}</option>
          {options.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · {p.vehicle} · {workloadOf(p.id, shipments)} active
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={!options.length}
          onClick={() => assign(shipment, picks[shipment.id], { reassign })}
          className={`${btnPrimary} disabled:opacity-50`}
        >
          {reassign ? 'Reassign' : 'Assign'}
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Delivery Management"
        description="Register partners, manage service areas, assign packed orders and monitor every delivery."
        action={
          <button
            type="button"
            onClick={() => setShowPartnerForm(true)}
            className="neu-btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
          >
            <span className="material-symbols-outlined text-lg">person_add</span>
            Register partner
          </button>
        }
      />

      <StatGrid
        items={[
          { label: 'Verified Partners', value: stats.verified, icon: 'verified_user', color: 'text-emerald-600', sub: `${stats.pending} AWAITING VERIFICATION` },
          { label: 'Awaiting Assignment', value: stats.awaiting, icon: 'inventory', color: 'text-amber-600', sub: 'PACKED ORDERS' },
          { label: 'On the Road', value: stats.moving, icon: 'local_shipping', color: 'text-sky-600', sub: 'PICKED UP / IN TRANSIT' },
          { label: 'Failed Deliveries', value: stats.failed, icon: 'report_problem', color: 'text-rose-600', sub: 'NEED REASSIGNMENT' },
        ]}
      />

      <section className="neu-raised overflow-hidden rounded-2xl">
        <div className="flex flex-col gap-4 border-b border-primary/10 p-4 sm:p-6">
          <TabBar tabs={tabs} active={tab} onChange={setTab} />

          {tab === 'monitor' && (
            <div className="flex flex-col gap-3 md:flex-row">
              <div className={`${inputBase} flex items-center px-4 md:max-w-sm md:flex-1`}>
                <span className="material-symbols-outlined mr-2 text-[20px] text-outline">search</span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Shipment, order, partner, area..."
                  className="w-full bg-transparent outline-none placeholder:text-outline"
                />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`${inputBase} px-4`}>
                <option value="ALL">All statuses</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="PICKED_UP">Picked up</option>
                <option value="IN_TRANSIT">In transit</option>
                <option value="DELIVERED">Delivered</option>
              </select>
            </div>
          )}
        </div>

        {/* Monitor pickup, transit and delivery */}
        {tab === 'monitor' && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-outline">
                <tr>
                  {['Shipment', 'Route', 'Partner', 'Progress', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-4 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {visibleShipments.map((s) => {
                  const current = TRACK_STEPS.findIndex(([key]) => key === s.status);
                  const next = NEXT_STEP[s.status];
                  return (
                    <tr key={s.id} className="transition-colors hover:bg-primary/5">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-primary">{s.id}</p>
                        <p className="mt-1 text-xs text-outline">{s.orderId} · {s.customer}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-primary">{s.seller}</p>
                        <p className="mt-1 text-xs text-on-surface-variant">to {s.area}</p>
                      </td>
                      <td className="px-5 py-4 text-on-surface-variant">{partnerName(s.partnerId)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          {TRACK_STEPS.map(([key, label], i) => (
                            <div key={key} title={label} className={`h-2 w-9 rounded-full ${i <= current ? 'bg-emerald-500' : 'bg-primary/10'}`} />
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4"><StatusBadge status={s.status} /></td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          {next && (
                            <button type="button" onClick={() => patchShipment(s.id, { status: next[0] }, `${s.id}: ${next[1].replace('Mark ', '').toLowerCase()}.`)} className={btnPrimary}>
                              {next[1]}
                            </button>
                          )}
                          {IN_FLIGHT.includes(s.status) && (
                            <button type="button" onClick={() => setFailTarget({ id: s.id, reason: FAIL_REASONS[0] })} className={btnDanger}>
                              Mark failed
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {visibleShipments.length === 0 && <EmptyRow colSpan={6}>No deliveries found for this view.</EmptyRow>}
              </tbody>
            </table>
          </div>
        )}

        {/* Assign packed orders */}
        {tab === 'assign' && (
          <div className="space-y-3 p-4 sm:p-6">
            {awaiting.map((s) => (
              <div key={s.id} className="neu-raised flex flex-col gap-4 rounded-xl p-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-primary">{s.orderId}</p>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="mt-2 text-sm text-on-surface-variant">Pickup: {s.seller} → Deliver to {s.customer}, {s.area}</p>
                  <p className="mt-1 text-xs text-outline">{s.id}</p>
                </div>
                {renderAssign(s)}
              </div>
            ))}
            {awaiting.length === 0 && (
              <p className="py-12 text-center text-sm text-outline">All packed orders have a delivery partner.</p>
            )}
          </div>
        )}

        {/* Failed deliveries */}
        {tab === 'failed' && (
          <div className="space-y-3 p-4 sm:p-6">
            {failed.map((s) => (
              <div key={s.id} className="neu-raised flex flex-col gap-4 rounded-xl p-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-primary">{s.orderId}</p>
                    <StatusBadge status="FAILED" />
                    <span className="text-xs text-outline">Attempt {s.attempts}</span>
                  </div>
                  <p className="mt-2 text-sm text-rose-600">{s.failReason}</p>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    {s.customer}, {s.area} · last partner {partnerName(s.partnerId)}
                  </p>
                </div>
                <div className="flex flex-col gap-2 lg:items-end">
                  {renderAssign(s, s.partnerId, true)}
                  <button type="button" onClick={() => patchShipment(s.id, { status: 'ASSIGNED', failReason: null }, 'Delivery rescheduled with the same partner.')} className={btn}>
                    Retry with same partner
                  </button>
                </div>
              </div>
            ))}
            {failed.length === 0 && <p className="py-12 text-center text-sm text-outline">No failed deliveries.</p>}
          </div>
        )}

        {/* Partners */}
        {tab === 'partners' && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-outline">
                <tr>
                  {['Partner', 'Vehicle / Documents', 'Service areas', 'Verification', 'Availability', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-4 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {partners.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-primary/5">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-primary">{p.name}</p>
                      <p className="mt-1 text-xs text-outline">{p.id} · {p.phone}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-primary">{p.vehicle}</p>
                      <p className="mt-1 text-xs text-on-surface-variant">{p.documents}</p>
                    </td>
                    <td className="px-5 py-4 text-on-surface-variant">{p.areas.join(', ')}</td>
                    <td className="px-5 py-4"><StatusBadge status={p.verification} /></td>
                    <td className="px-5 py-4">
                      {p.verification === 'VERIFIED' ? (
                        <select
                          value={p.availability}
                          onChange={(e) => patchPartner(p.id, { availability: e.target.value }, 'Availability updated.')}
                          className={`${inputBase} px-3`}
                        >
                          <option value="AVAILABLE">Available</option>
                          <option value="BUSY">Busy</option>
                          <option value="OFFLINE">Offline</option>
                        </select>
                      ) : (
                        <StatusBadge status={p.availability} />
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {p.verification === 'PENDING' ? (
                        <div className="flex gap-2">
                          <button type="button" onClick={() => verifyPartner(p.id, true)} className={btnPrimary}>Verify</button>
                          <button type="button" onClick={() => verifyPartner(p.id, false)} className={btnDanger}>Reject</button>
                        </div>
                      ) : (
                        <span className="text-xs text-outline">{workloadOf(p.id, shipments)} active deliveries</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Service areas */}
        {tab === 'areas' && (
          <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 xl:grid-cols-2">
            <div className="space-y-3">
              {areas.map((a) => (
                <div key={a.id} className="neu-raised flex items-center justify-between gap-3 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="neu-inset flex h-10 w-10 items-center justify-center rounded-lg text-secondary">
                      <span className="material-symbols-outlined">location_on</span>
                    </div>
                    <div>
                      <p className="font-semibold text-primary">{a.name}</p>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        {a.state} · {partners.filter((p) => p.areas.includes(a.name) && p.verification === 'VERIFIED').length} verified partners
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={a.active ? 'ACTIVE' : 'INACTIVE'} />
                    <button type="button" onClick={() => toggleArea(a.id)} className={btn}>
                      {a.active ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={addArea} className="neu-inset h-fit space-y-4 rounded-xl p-5">
              <h2 className="font-bold text-primary">Add service area</h2>
              <Field label="City / area name">
                <input value={areaForm.name} onChange={(e) => setAreaForm({ ...areaForm, name: e.target.value })} placeholder="e.g. Cuttack" className={`${inputBase} w-full px-4`} />
              </Field>
              <Field label="State">
                <input value={areaForm.state} onChange={(e) => setAreaForm({ ...areaForm, state: e.target.value })} placeholder="e.g. Odisha" className={`${inputBase} w-full px-4`} />
              </Field>
              <button type="submit" className="neu-btn-primary rounded-xl px-5 py-3 text-sm font-semibold">Add area</button>
              <p className="text-xs text-outline">Disabled areas are excluded when assigning delivery partners.</p>
            </form>
          </div>
        )}
      </section>

      {/* Register partner */}
      {showPartnerForm && (
        <Modal title="Register delivery partner" subtitle="New partners stay offline until verified." onClose={() => setShowPartnerForm(false)}>
          <form onSubmit={registerPartner} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full name">
                <input required value={partnerForm.name} onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })} className={`${inputBase} w-full px-4`} />
              </Field>
              <Field label="Phone number">
                <input required inputMode="numeric" maxLength={10} value={partnerForm.phone} onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })} placeholder="10 digits" className={`${inputBase} w-full px-4`} />
              </Field>
              <Field label="Vehicle">
                <select value={partnerForm.vehicle} onChange={(e) => setPartnerForm({ ...partnerForm, vehicle: e.target.value })} className={`${inputBase} w-full px-4`}>
                  {VEHICLES.map((v) => <option key={v}>{v}</option>)}
                </select>
              </Field>
              <Field label="Documents submitted">
                <input value={partnerForm.documents} onChange={(e) => setPartnerForm({ ...partnerForm, documents: e.target.value })} placeholder="Aadhaar, Driving licence, RC" className={`${inputBase} w-full px-4`} />
              </Field>
            </div>

            <Field label="Service areas">
              <div className="flex flex-wrap gap-2">
                {areas.filter((a) => a.active).map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => togglePartnerArea(a.name)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${partnerForm.areas.includes(a.name) ? 'neu-raised-sm text-primary' : 'neu-inset text-on-surface-variant'}`}
                  >
                    {a.name}
                  </button>
                ))}
              </div>
            </Field>

            <div className="flex flex-wrap gap-3 pt-2">
              <button type="submit" className="neu-btn-primary rounded-xl px-5 py-3 text-sm font-semibold">Register partner</button>
              <button type="button" onClick={() => setShowPartnerForm(false)} className="neu-btn rounded-xl px-5 py-3 text-sm font-semibold text-primary">Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Failure reason */}
      {failTarget && (
        <Modal title="Mark delivery as failed" subtitle={failTarget.id} onClose={() => setFailTarget(null)}>
          <div className="mt-6 space-y-4">
            <Field label="Reason">
              <select value={failTarget.reason} onChange={(e) => setFailTarget({ ...failTarget, reason: e.target.value })} className={`${inputBase} w-full px-4`}>
                {FAIL_REASONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </Field>
            <div className="flex gap-3">
              <button type="button" onClick={confirmFailure} className="neu-btn-primary rounded-xl px-5 py-3 text-sm font-semibold">Confirm failure</button>
              <button type="button" onClick={() => setFailTarget(null)} className="neu-btn rounded-xl px-5 py-3 text-sm font-semibold text-primary">Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      <Toast message={toast} />
      <div className="h-2 sm:h-4" />
    </div>
  );
};

export default DeliveryManagement;