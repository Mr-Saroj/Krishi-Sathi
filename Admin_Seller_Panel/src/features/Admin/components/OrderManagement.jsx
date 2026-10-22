import React from 'react';
import { money, inputBase, formatDate, btn, btnPrimary } from '../utils/componentsUtils';
import {
  StatusBadge, PageHeader, StatGrid, TabBar, Drawer, InfoTile,
  EmptyRow, ProgressBar, Toast,
} from './components';
import OrderManagementSkeleton from '../Skeliton/OrderManagementSkeleton';
import { useOrderManagement } from '../hooks/orderManagementHooks';
import {
  SELLERS, PAYMENT_STATUSES, DELIVERY_STATUSES, DELIVERY_STEPS, EMPTY_FILTERS,
  isDelayed, isRefundEligible, isCancelledOrReturned,
} from '../utils/orderManagementUtils';

const OrderManagement = () => {
  const {
    isLoading,
    toast,
    orders,
    tab,
    setTab,
    filters,
    setFilters,
    setFilter,
    selected,
    setSelectedId,
    counts,
    visibleOrders,
    progress,
    resolveDispute,
    approveRefund,
  } = useOrderManagement();

  if (isLoading) return <OrderManagementSkeleton />;

  const tabs = [
    ['all', 'All orders'],
    ['delayed', `Delayed (${counts.delayed})`],
    ['issues', `Cancelled & returned (${counts.issues})`],
    ['disputes', `Disputes & refunds (${counts.disputes})`],
    ['fulfilment', 'Seller fulfilment'],
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Order Management"
        description="Monitor marketplace orders, resolve disputes, approve refunds and track seller fulfilment."
      />

      <StatGrid
        items={[
          { label: 'Total Orders', value: orders.length, icon: 'shopping_cart', color: 'text-violet-600', sub: 'ALL MARKETPLACE ORDERS' },
          { label: 'Delayed Orders', value: counts.delayed, icon: 'schedule', color: 'text-amber-600', sub: 'PAST EXPECTED DATE' },
          { label: 'Cancelled / Returned', value: counts.issues, icon: 'assignment_return', color: 'text-rose-600', sub: 'NEEDS MONITORING' },
          { label: 'Disputes & Refunds', value: counts.disputes, icon: 'gavel', color: 'text-sky-600', sub: 'AWAITING ACTION' },
        ]}
      />

      <section className="neu-raised overflow-hidden rounded-2xl">
        <div className="flex flex-col gap-4 border-b border-primary/10 p-4 sm:p-6">
          <TabBar tabs={tabs} active={tab} onChange={setTab} />

          {tab !== 'fulfilment' && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-6">
              <div className={`${inputBase} flex items-center px-4 xl:col-span-2`}>
                <span className="material-symbols-outlined mr-2 text-[20px] text-outline">search</span>
                <input
                  value={filters.query}
                  onChange={(e) => setFilter('query', e.target.value)}
                  placeholder="Order, customer, seller, city..."
                  className="w-full bg-transparent outline-none placeholder:text-outline"
                />
              </div>

              <select value={filters.seller} onChange={(e) => setFilter('seller', e.target.value)} className={`${inputBase} px-4`}>
                <option value="ALL">All sellers</option>
                {SELLERS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>

              <select value={filters.payment} onChange={(e) => setFilter('payment', e.target.value)} className={`${inputBase} px-4`}>
                <option value="ALL">All payments</option>
                {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>

              <select value={filters.delivery} onChange={(e) => setFilter('delivery', e.target.value)} className={`${inputBase} px-4`}>
                <option value="ALL">All delivery statuses</option>
                {DELIVERY_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>

              <div className="flex gap-2">
                <input
                  type="date"
                  aria-label="From date"
                  value={filters.from}
                  onChange={(e) => setFilter('from', e.target.value)}
                  className={`${inputBase} min-w-0 flex-1 px-3`}
                />
                <input
                  type="date"
                  aria-label="To date"
                  value={filters.to}
                  onChange={(e) => setFilter('to', e.target.value)}
                  className={`${inputBase} min-w-0 flex-1 px-3`}
                />
              </div>

              <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className={`${btn} md:col-span-3 xl:col-span-1 xl:col-start-6`}>
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Orders table */}
        {tab !== 'fulfilment' && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-outline">
                <tr>
                  {['Order', 'Seller', 'Placed', 'Amount', 'Payment', 'Delivery', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-4 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {visibleOrders.map((o) => (
                  <tr key={o.id} className="transition-colors hover:bg-primary/5">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-primary">{o.id}</p>
                      <p className="mt-1 text-xs text-outline">{o.customer} · {o.city}</p>
                    </td>
                    <td className="px-5 py-4 text-on-surface-variant">{o.seller}</td>
                    <td className="px-5 py-4">
                      <p className="text-primary">{formatDate(o.placedAt)}</p>
                      <p className="mt-1 text-xs text-outline">Due {formatDate(o.expectedBy)}</p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-primary">{money(o.amount)}</td>
                    <td className="px-5 py-4"><StatusBadge status={o.payment} /></td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        <StatusBadge status={o.delivery} />
                        {isDelayed(o) && <StatusBadge status="DELAYED" />}
                      </div>
                      {o.dispute?.status === 'OPEN' && (
                        <p className="mt-2 text-xs text-rose-600">Dispute open</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button type="button" onClick={() => setSelectedId(o.id)} className={btn}>View</button>
                        {isRefundEligible(o) && (
                          <button type="button" onClick={() => approveRefund(o.id)} className={btnPrimary}>
                            Approve refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {visibleOrders.length === 0 && <EmptyRow colSpan={7}>No orders found for this view.</EmptyRow>}
              </tbody>
            </table>
          </div>
        )}

        {/* Seller fulfilment */}
        {tab === 'fulfilment' && (
          <div className="grid grid-cols-1 gap-5 p-4 sm:p-6 xl:grid-cols-2">
            {progress.map((p) => {
              const pct = (n) => (p.total ? (n / p.total) * 100 : 0);
              return (
                <div key={p.seller} className="neu-raised space-y-4 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-primary">{p.seller}</p>
                      <p className="mt-1 text-xs text-on-surface-variant">{p.total} orders in total</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-extrabold text-primary">{p.rate}%</p>
                      <p className="text-[10px] font-bold tracking-wider text-outline">FULFILMENT RATE</p>
                    </div>
                  </div>

                  <ProgressBar
                    segments={[
                      { label: 'Delivered', value: p.delivered, percent: pct(p.delivered), className: 'bg-emerald-500' },
                      { label: 'In transit', value: p.inTransit, percent: pct(p.inTransit), className: 'bg-sky-500' },
                      { label: 'Packed', value: p.packed, percent: pct(p.packed), className: 'bg-amber-500' },
                      { label: 'Placed', value: p.placed, percent: pct(p.placed), className: 'bg-slate-400' },
                      { label: 'Cancelled / returned', value: p.cancelled, percent: pct(p.cancelled), className: 'bg-rose-500' },
                    ]}
                  />

                  <div className="grid grid-cols-3 gap-3 text-center text-xs sm:grid-cols-6">
                    {[
                      ['Placed', p.placed], ['Packed', p.packed], ['Transit', p.inTransit],
                      ['Delivered', p.delivered], ['Cancelled', p.cancelled], ['Delayed', p.delayed],
                    ].map(([label, value]) => (
                      <div key={label} className="neu-inset rounded-lg py-2">
                        <p className="text-base font-bold text-primary">{value}</p>
                        <p className="mt-1 text-outline">{label}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFilters({ ...EMPTY_FILTERS, seller: p.seller });
                      setTab('all');
                    }}
                    className={btn}
                  >
                    View this seller's orders
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Order details */}
      {selected && (
        <Drawer title={selected.id} subtitle={`${selected.customer} · ${selected.city}`} onClose={() => setSelectedId(null)}>
          <div className="mt-6 flex items-center justify-between">
            <span className="text-sm text-on-surface-variant">Delivery status</span>
            <div className="flex gap-1.5">
              <StatusBadge status={selected.delivery} />
              {isDelayed(selected) && <StatusBadge status="DELAYED" />}
            </div>
          </div>

          {isCancelledOrReturned(selected) ? (
            <p className="neu-inset mt-4 rounded-xl p-3 text-sm text-rose-600">
              This order was {selected.delivery.toLowerCase()}.
            </p>
          ) : (
            <ol className="mt-4 grid grid-cols-4 gap-2 text-center text-[11px]">
              {DELIVERY_STEPS.map((step, i) => {
                const done = i <= DELIVERY_STEPS.indexOf(selected.delivery);
                return (
                  <li key={step} className="space-y-2">
                    <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full ${done ? 'bg-emerald-500/20 text-emerald-600' : 'neu-inset text-outline'}`}>
                      <span className="material-symbols-outlined text-base">{done ? 'check' : 'circle'}</span>
                    </div>
                    <p className={done ? 'font-semibold text-primary' : 'text-outline'}>{step.replace(/_/g, ' ')}</p>
                  </li>
                );
              })}
            </ol>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <InfoTile label="Seller" value={selected.seller} />
            <InfoTile label="Order total" value={money(selected.amount)} />
            <InfoTile label="Placed on" value={formatDate(selected.placedAt)} />
            <InfoTile label="Expected by" value={formatDate(selected.expectedBy)} />
            <InfoTile label="Payment" value={selected.payment} />
            <InfoTile label="Refund" value={selected.refundStatus === 'NONE' ? 'None' : selected.refundStatus} />
          </div>

          <div className="mt-6">
            <h3 className="font-bold text-primary">Items</h3>
            <div className="mt-3 space-y-2">
              {selected.items.map((it) => (
                <div key={it.name} className="flex justify-between gap-4 border-b border-primary/10 py-2 text-sm">
                  <span className="text-on-surface-variant">{it.name} × {it.qty}</span>
                  <span className="font-medium text-primary">{money(it.price * it.qty)}</span>
                </div>
              ))}
            </div>
          </div>

          {selected.dispute && (
            <div className="neu-inset mt-6 space-y-3 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-primary">Dispute {selected.dispute.id}</h3>
                <StatusBadge status={selected.dispute.status} />
              </div>
              <p className="text-sm text-on-surface-variant">{selected.dispute.reason}</p>
              {selected.dispute.status === 'OPEN' ? (
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => resolveDispute(selected.id, 'CUSTOMER')} className={btnPrimary}>
                    Resolve for customer
                  </button>
                  <button type="button" onClick={() => resolveDispute(selected.id, 'SELLER')} className={btn}>
                    Resolve for seller
                  </button>
                </div>
              ) : (
                <p className="text-xs text-outline">
                  Decided in favour of the {selected.dispute.outcome === 'CUSTOMER' ? 'customer' : 'seller'}.
                </p>
              )}
            </div>
          )}

          {selected.refundStatus === 'REQUESTED' && (
            <div className="neu-inset mt-4 space-y-3 rounded-xl p-4">
              <h3 className="font-bold text-primary">Refund request</h3>
              {isRefundEligible(selected) ? (
                <>
                  <p className="text-sm text-on-surface-variant">
                    Eligible for a refund of {money(selected.amount)}.
                  </p>
                  <button type="button" onClick={() => approveRefund(selected.id)} className={btnPrimary}>
                    Approve refund
                  </button>
                </>
              ) : (
                <p className="text-sm text-amber-600">
                  {selected.dispute?.status === 'OPEN'
                    ? 'Resolve the open dispute before approving this refund.'
                    : 'This order is not eligible for a refund.'}
                </p>
              )}
            </div>
          )}

          <div className="mt-8">
            <button
              type="button"
              onClick={() => {
                setTab('fulfilment');
                setSelectedId(null);
              }}
              className={btn}
            >
              View seller fulfilment progress
            </button>
          </div>
        </Drawer>
      )}

      <Toast message={toast} />
      <div className="h-2 sm:h-4" />
    </div>
  );
};

export default OrderManagement;