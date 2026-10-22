import React from 'react';
import { money, inputBase, formatDate, btn, btnPrimary, btnDanger } from '../utils/componentsUtils';
import {
  StatusBadge, PageHeader, StatGrid, TabBar, Modal, Field, EmptyRow, TableHead, Toast,
} from './components';
import FinanceCommissionSkeleton from '../Skeliton/FinanceCommissionSkeleton';
import { useFinanceCommission } from '../hooks/financeCommissionHooks';
import { CATEGORIES, SELLERS, sum } from '../utils/financeCommissionUtils';

const FinanceCommission = () => {
  const {
    isLoading,
    toast,
    rules,
    rows,
    feeRows,
    stats,
    reconCounts,
    calcResult,
    tab,
    setTab,
    editing,
    setEditing,
    showRuleForm,
    setShowRuleForm,
    ruleForm,
    setRuleForm,
    calc,
    setCalc,
    txnFilter,
    setTxnFilter,
    reconFilter,
    setReconFilter,
    visibleTransactions,
    reconTransactions,
    saveRate,
    toggleRule,
    addRule,
    releasePayout,
    holdPayout,
    payFee,
    runReconciliation,
    fixLedger,
  } = useFinanceCommission();

  if (isLoading) return <FinanceCommissionSkeleton />;

  const tabs = [
    ['rules', 'Commission rules'],
    ['settlements', 'Seller settlements'],
    ['fees', 'Delivery partner fees'],
    ['payments', 'Payments & payouts'],
    ['recon', `Reconciliation (${reconCounts.MISMATCH + reconCounts.UNRECONCILED})`],
  ];


  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Finance & Commission"
        description="Configure commissions, settle sellers, pay delivery partners and reconcile every transaction."
        action={
          tab === 'rules' && (
            <button type="button" onClick={() => setShowRuleForm(true)} className="neu-btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold">
              <span className="material-symbols-outlined text-lg">add</span>
              Add rule
            </button>
          )
        }
      />

      <StatGrid
        items={[
          { label: 'Gross Sales', value: money(stats.gross), icon: 'payments', color: 'text-violet-600', sub: 'SUCCESSFUL PAYMENTS' },
          { label: 'Commission Earned', value: money(stats.commission), icon: 'percent', color: 'text-emerald-600', sub: 'ALL SETTLEMENT CYCLES' },
          { label: 'Pending Payouts', value: money(stats.pendingPayout), icon: 'account_balance_wallet', color: 'text-amber-600', sub: 'SELLER NET AMOUNT' },
          { label: 'Refunds Issued', value: money(stats.refunds), icon: 'currency_exchange', color: 'text-rose-600', sub: 'SUCCESSFUL REFUNDS' },
        ]}
      />

      <section className="neu-raised overflow-hidden rounded-2xl">
        <div className="border-b border-primary/10 p-4 sm:p-6">
          <TabBar tabs={tabs} active={tab} onChange={setTab} />
        </div>

        {/* Commission rules */}
        {tab === 'rules' && (
          <div className="space-y-6 p-4 sm:p-6">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <TableHead list={['Rule', 'Applies to', 'Rate', 'Status', 'Actions']} />
                <tbody className="divide-y divide-primary/10">
                  {rules.map((r) => (
                    <tr key={r.id} className="transition-colors hover:bg-primary/5">
                      <td className="px-5 py-4 font-semibold text-primary">{r.id}</td>
                      <td className="px-5 py-4">
                        <p className="text-primary">{r.target}</p>
                        <p className="mt-1 text-xs text-outline">{r.scope === 'SELLER' ? 'Seller override' : r.scope === 'CATEGORY' ? 'Category' : 'Default'}</p>
                      </td>
                      <td className="px-5 py-4">
                        {editing?.id === r.id ? (
                          <input
                            autoFocus
                            type="number"
                            min="0"
                            max="50"
                            step="0.5"
                            value={editing.rate}
                            onChange={(e) => setEditing({ ...editing, rate: e.target.value })}
                            className={`${inputBase} w-24 px-3`}
                          />
                        ) : (
                          <span className="font-semibold text-primary">{r.rate}%</span>
                        )}
                      </td>
                      <td className="px-5 py-4"><StatusBadge status={r.status} /></td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          {editing?.id === r.id ? (
                            <>
                              <button type="button" onClick={saveRate} className={btnPrimary}>Save</button>
                              <button type="button" onClick={() => setEditing(null)} className={btn}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <button type="button" onClick={() => setEditing({ id: r.id, rate: r.rate })} className={btn}>Edit rate</button>
                              {r.scope !== 'DEFAULT' && (
                                <button type="button" onClick={() => toggleRule(r)} className={btn}>
                                  {r.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="neu-inset grid grid-cols-1 gap-5 rounded-xl p-5 lg:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h2 className="font-bold text-primary">Commission calculator</h2>
                  <p className="mt-1 text-xs text-on-surface-variant">Seller override wins over category rule, which wins over the default.</p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <select value={calc.category} onChange={(e) => setCalc({ ...calc, category: e.target.value })} className={`${inputBase} px-3`}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <select value={calc.seller} onChange={(e) => setCalc({ ...calc, seller: e.target.value })} className={`${inputBase} px-3`}>
                    {SELLERS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <input type="number" min="0" value={calc.amount} onChange={(e) => setCalc({ ...calc, amount: e.target.value })} placeholder="Order amount" className={`${inputBase} px-3`} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  ['Applied rate', `${calcResult.rate}%`],
                  ['Commission', money(calcResult.commission)],
                  ['Seller payout', money(calcResult.payout)],
                ].map(([label, value]) => (
                  <div key={label} className="neu-raised rounded-xl p-3">
                    <p className="text-xs text-outline">{label}</p>
                    <p className="mt-2 text-sm font-bold text-primary">{value}</p>
                  </div>
                ))}
                <p className="col-span-3 text-xs text-on-surface-variant">Source: {calcResult.source}</p>
              </div>
            </div>
          </div>
        )}

        {/* Seller settlements */}
        {tab === 'settlements' && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <TableHead list={['Settlement', 'Gross sales', 'Commission', 'Net payout', 'Status', 'Actions']} />
              <tbody className="divide-y divide-primary/10">
                {rows.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-primary/5">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-primary">{r.seller}</p>
                      <p className="mt-1 text-xs text-outline">{r.id} · {r.period} · {r.orders} orders</p>
                    </td>
                    <td className="px-5 py-4 text-primary">{money(r.gross)}</td>
                    <td className="px-5 py-4">
                      <p className="text-primary">{money(r.commission)}</p>
                      <p className="mt-1 text-xs text-outline">at {r.rate}%</p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-primary">{money(r.net)}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={r.status} />
                      {r.paidOn && <p className="mt-2 text-xs text-outline">Paid {formatDate(r.paidOn)}</p>}
                    </td>
                    <td className="px-5 py-4">
                      {r.status !== 'PAID' ? (
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => releasePayout(r)} className={btnPrimary}>
                            {r.status === 'ON_HOLD' ? 'Release hold & pay' : 'Release payout'}
                          </button>
                          {r.status !== 'ON_HOLD' && (
                            <button type="button" onClick={() => holdPayout(r.id)} className={btnDanger}>Hold</button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-outline">Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Delivery partner fees */}
        {tab === 'fees' && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <TableHead list={['Partner', 'Deliveries', 'Fee / delivery', 'Total fee', 'Status', 'Actions']} />
              <tbody className="divide-y divide-primary/10">
                {feeRows.map((f) => (
                  <tr key={f.id} className="transition-colors hover:bg-primary/5">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-primary">{f.partner}</p>
                      <p className="mt-1 text-xs text-outline">{f.id}</p>
                    </td>
                    <td className="px-5 py-4 text-on-surface-variant">{f.deliveries}</td>
                    <td className="px-5 py-4 text-on-surface-variant">{money(f.feePerDelivery)}</td>
                    <td className="px-5 py-4 font-semibold text-primary">{money(f.total)}</td>
                    <td className="px-5 py-4"><StatusBadge status={f.status} /></td>
                    <td className="px-5 py-4">
                      {f.status === 'PENDING' ? (
                        <button type="button" onClick={() => payFee(f)} className={btnPrimary}>Mark as paid</button>
                      ) : (
                        <span className="text-xs text-outline">Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={3} className="px-5 py-4 text-right text-xs font-bold uppercase text-outline">Outstanding</td>
                  <td colSpan={3} className="px-5 py-4 font-extrabold text-primary">
                    {money(sum(feeRows.filter((f) => f.status === 'PENDING'), (f) => f.total))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Payments, refunds, payouts */}
        {tab === 'payments' && (
          <div>
            <div className="flex flex-col gap-3 border-b border-primary/10 p-4 sm:flex-row sm:p-6">
              <select value={txnFilter.type} onChange={(e) => setTxnFilter({ ...txnFilter, type: e.target.value })} className={`${inputBase} px-4`}>
                <option value="ALL">All types</option>
                <option value="PAYMENT">Payments</option>
                <option value="REFUND">Refunds</option>
                <option value="PAYOUT">Payouts</option>
              </select>
              <select value={txnFilter.status} onChange={(e) => setTxnFilter({ ...txnFilter, status: e.target.value })} className={`${inputBase} px-4`}>
                <option value="ALL">All statuses</option>
                <option value="SUCCESS">Success</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <TableHead list={['Transaction', 'Date', 'Type', 'Method', 'Amount', 'Status']} />
                <tbody className="divide-y divide-primary/10">
                  {visibleTransactions.map((t) => (
                    <tr key={t.id} className="transition-colors hover:bg-primary/5">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-primary">{t.id}</p>
                        <p className="mt-1 text-xs text-outline">Ref {t.ref}</p>
                      </td>
                      <td className="px-5 py-4 text-on-surface-variant">{formatDate(t.date)}</td>
                      <td className="px-5 py-4 text-primary">{t.type}</td>
                      <td className="px-5 py-4 text-on-surface-variant">{t.method}</td>
                      <td className={`px-5 py-4 font-semibold ${t.type === 'PAYMENT' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {t.type === 'PAYMENT' ? '+' : '−'}{money(t.amount)}
                      </td>
                      <td className="px-5 py-4"><StatusBadge status={t.status} /></td>
                    </tr>
                  ))}
                  {visibleTransactions.length === 0 && <EmptyRow colSpan={6}>No transactions found.</EmptyRow>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reconciliation */}
        {tab === 'recon' && (
          <div>
            <div className="flex flex-col gap-4 border-b border-primary/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="grid grid-cols-3 gap-3 text-center">
                {Object.entries(reconCounts).map(([key, value]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setReconFilter(reconFilter === key ? 'ALL' : key)}
                    className={`rounded-xl px-5 py-3 ${reconFilter === key ? 'neu-inset' : 'neu-raised'}`}
                  >
                    <p className="text-lg font-extrabold text-primary">{value}</p>
                    <p className="text-[10px] font-bold tracking-wider text-outline">{key}</p>
                  </button>
                ))}
              </div>
              <button type="button" onClick={runReconciliation} className="neu-btn-primary rounded-xl px-5 py-3 text-sm font-semibold">
                Run reconciliation
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <TableHead list={['Transaction', 'Ledger amount', 'Gateway amount', 'Difference', 'Result', 'Actions']} />
                <tbody className="divide-y divide-primary/10">
                  {reconTransactions.map((t) => {
                    const diff = t.amount - t.gatewayAmount;
                    return (
                      <tr key={t.id} className="transition-colors hover:bg-primary/5">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-primary">{t.id}</p>
                          <p className="mt-1 text-xs text-outline">{t.type} · {t.ref}</p>
                        </td>
                        <td className="px-5 py-4 text-primary">{money(t.amount)}</td>
                        <td className="px-5 py-4 text-primary">{money(t.gatewayAmount)}</td>
                        <td className={`px-5 py-4 font-semibold ${diff === 0 ? 'text-on-surface-variant' : 'text-rose-600'}`}>
                          {diff === 0 ? '—' : money(diff)}
                        </td>
                        <td className="px-5 py-4"><StatusBadge status={t.recon} /></td>
                        <td className="px-5 py-4">
                          {t.recon === 'MISMATCH' ? (
                            <button type="button" onClick={() => fixLedger(t.id)} className={btnPrimary}>Adjust ledger</button>
                          ) : (
                            <span className="text-xs text-outline">{t.status === 'PENDING' ? 'Awaiting gateway' : '—'}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {reconTransactions.length === 0 && <EmptyRow colSpan={6}>No transactions in this view.</EmptyRow>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Add rule */}
      {showRuleForm && (
        <Modal title="Add commission rule" subtitle="Rates apply to future settlements." onClose={() => setShowRuleForm(false)}>
          <form onSubmit={addRule} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Rule type">
                <select
                  value={ruleForm.scope}
                  onChange={(e) => setRuleForm({ ...ruleForm, scope: e.target.value, target: e.target.value === 'SELLER' ? SELLERS[0] : CATEGORIES[0] })}
                  className={`${inputBase} w-full px-4`}
                >
                  <option value="CATEGORY">Category rule</option>
                  <option value="SELLER">Seller override</option>
                </select>
              </Field>
              <Field label={ruleForm.scope === 'SELLER' ? 'Seller' : 'Category'}>
                <select value={ruleForm.target} onChange={(e) => setRuleForm({ ...ruleForm, target: e.target.value })} className={`${inputBase} w-full px-4`}>
                  {(ruleForm.scope === 'SELLER' ? SELLERS : CATEGORIES).map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Commission rate (%)" hint="Between 0 and 50.">
              <input required type="number" min="0" max="50" step="0.5" value={ruleForm.rate} onChange={(e) => setRuleForm({ ...ruleForm, rate: e.target.value })} placeholder="10" className={`${inputBase} w-full px-4`} />
            </Field>
            <div className="flex flex-wrap gap-3 pt-2">
              <button type="submit" className="neu-btn-primary rounded-xl px-5 py-3 text-sm font-semibold">Create rule</button>
              <button type="button" onClick={() => setShowRuleForm(false)} className="neu-btn rounded-xl px-5 py-3 text-sm font-semibold text-primary">Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      <Toast message={toast} />
      <div className="h-2 sm:h-4" />
    </div>
  );
};

export default FinanceCommission;