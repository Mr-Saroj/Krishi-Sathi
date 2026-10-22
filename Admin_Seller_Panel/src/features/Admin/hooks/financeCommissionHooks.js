// financeCommissionHooks.js — state, derived data and actions for Finance & Commission
import { useMemo, useState } from 'react';
import { useSimulatedLoading, useToast } from '../hooks/componentshook';
import { money, daysFromNow } from '../utils/componentsUtils';
import {
  INITIAL_RULES, INITIAL_SETTLEMENTS, INITIAL_FEES, INITIAL_TRANSACTIONS,
  CATEGORIES, SELLERS, EMPTY_RULE, resolveRate, withTotals, sum,
} from '../utils/financeCommissionUtils';

export const useFinanceCommission = () => {
  const isLoading = useSimulatedLoading(650);
  const { toast, notify } = useToast();

  const [rules, setRules] = useState(INITIAL_RULES);
  const [settlements, setSettlements] = useState(INITIAL_SETTLEMENTS);
  const [fees, setFees] = useState(INITIAL_FEES);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);

  const [tab, setTab] = useState('rules');
  const [editing, setEditing] = useState(null); // { id, rate }
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [ruleForm, setRuleForm] = useState(EMPTY_RULE);
  const [calc, setCalc] = useState({ category: CATEGORIES[0], seller: SELLERS[0], amount: '10000' });
  const [txnFilter, setTxnFilter] = useState({ type: 'ALL', status: 'ALL' });
  const [reconFilter, setReconFilter] = useState('ALL');

  const rows = useMemo(() => settlements.map(withTotals), [settlements]);
  const feeRows = useMemo(() => fees.map((f) => ({ ...f, total: f.deliveries * f.feePerDelivery })), [fees]);

  const stats = useMemo(
    () => ({
      gross: sum(transactions.filter((t) => t.type === 'PAYMENT' && t.status === 'SUCCESS'), (t) => t.amount),
      commission: sum(rows, (r) => r.commission),
      pendingPayout: sum(rows.filter((r) => r.status !== 'PAID'), (r) => r.net),
      refunds: sum(transactions.filter((t) => t.type === 'REFUND' && t.status === 'SUCCESS'), (t) => t.amount),
    }),
    [transactions, rows]
  );

  const reconCounts = useMemo(
    () => ({
      MATCHED: transactions.filter((t) => t.recon === 'MATCHED').length,
      MISMATCH: transactions.filter((t) => t.recon === 'MISMATCH').length,
      UNRECONCILED: transactions.filter((t) => t.recon === 'UNRECONCILED').length,
    }),
    [transactions]
  );

  const calcResult = useMemo(() => {
    const { rate, source } = resolveRate(rules, calc.category, calc.seller);
    const amount = Number(calc.amount) || 0;
    const commission = (amount * rate) / 100;
    return { rate, source, commission, payout: amount - commission };
  }, [rules, calc]);

  const visibleTransactions = transactions.filter(
    (t) =>
      (txnFilter.type === 'ALL' || t.type === txnFilter.type) &&
      (txnFilter.status === 'ALL' || t.status === txnFilter.status)
  );
  const reconTransactions = transactions.filter((t) => reconFilter === 'ALL' || t.recon === reconFilter);

  const addTransaction = (ref, type, method, amount) =>
    setTransactions((prev) => [
      {
        id: `TXN-${Date.now().toString().slice(-6)}`,
        date: daysFromNow(0),
        ref, type, method, amount,
        gatewayAmount: amount,
        status: 'SUCCESS',
        recon: 'UNRECONCILED',
      },
      ...prev,
    ]);

  /* ---------- Commission rules ---------- */
  const saveRate = () => {
    const rate = Number(editing.rate);
    if (!Number.isFinite(rate) || rate < 0 || rate > 50) {
      notify('Enter a commission rate between 0 and 50.');
      return;
    }
    setRules((prev) => prev.map((r) => (r.id === editing.id ? { ...r, rate } : r)));
    setEditing(null);
    notify('Commission rate updated. It applies to future settlements.');
  };

  const toggleRule = (rule) => {
    if (rule.scope === 'DEFAULT') {
      notify('The default rule cannot be disabled.');
      return;
    }
    setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, status: r.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : r)));
    notify('Rule status updated.');
  };

  const addRule = (event) => {
    event.preventDefault();
    const rate = Number(ruleForm.rate);
    if (!Number.isFinite(rate) || rate < 0 || rate > 50 || ruleForm.rate === '') {
      notify('Enter a commission rate between 0 and 50.');
      return;
    }
    if (rules.some((r) => r.scope === ruleForm.scope && r.target === ruleForm.target)) {
      notify('A rule for this target already exists. Edit it instead.');
      return;
    }
    setRules((prev) => [
      ...prev,
      { id: `CR-${String(prev.length + 1).padStart(2, '0')}`, scope: ruleForm.scope, target: ruleForm.target, rate, status: 'ACTIVE' },
    ]);
    setShowRuleForm(false);
    setRuleForm(EMPTY_RULE);
    notify('Commission rule created.');
  };

  /* ---------- Settlements & fees ---------- */
  const releasePayout = (row) => {
    if (!window.confirm(`Release payout of ${money(row.net)} to ${row.seller}?`)) return;
    setSettlements((prev) => prev.map((s) => (s.id === row.id ? { ...s, status: 'PAID', paidOn: daysFromNow(0) } : s)));
    addTransaction(row.id, 'PAYOUT', 'Bank transfer', row.net);
    notify('Payout released and recorded in transactions.');
  };

  const holdPayout = (id) => {
    setSettlements((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'ON_HOLD' } : s)));
    notify('Settlement put on hold.');
  };

  const payFee = (fee) => {
    if (!window.confirm(`Pay ${money(fee.total)} to ${fee.partner}?`)) return;
    setFees((prev) => prev.map((f) => (f.id === fee.id ? { ...f, status: 'PAID' } : f)));
    addTransaction(fee.id, 'PAYOUT', 'Bank transfer', fee.total);
    notify('Delivery fee paid.');
  };

  /* ---------- Reconciliation ---------- */
  const runReconciliation = () => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.recon === 'UNRECONCILED' && t.status !== 'PENDING'
          ? { ...t, recon: t.amount === t.gatewayAmount ? 'MATCHED' : 'MISMATCH' }
          : t
      )
    );
    notify('Reconciliation complete.');
  };

  const fixLedger = (id) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, amount: t.gatewayAmount, recon: 'MATCHED' } : t)));
    notify('Ledger adjusted to the gateway amount.');
  };

  return {
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
  };
};