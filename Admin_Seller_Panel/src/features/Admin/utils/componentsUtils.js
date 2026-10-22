// shared/utils.js — formatters, style tokens and tiny helpers used by every admin page

export const money = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

export const inputBase =
  'neu-inset rounded-xl border-0 py-2.5 text-sm text-on-surface outline-none placeholder:text-outline focus:outline-2 focus:outline-offset-2 focus:outline-secondary/60';

export const btn = 'neu-btn rounded-lg px-3 py-2 text-xs font-semibold text-primary';
export const btnPrimary = 'neu-btn-primary rounded-lg px-3 py-2 text-xs font-semibold';
export const btnDanger = 'neu-btn rounded-lg px-3 py-2 text-xs font-semibold text-rose-600';

const AMBER = 'bg-amber-500/10 text-amber-600';
const GREEN = 'bg-emerald-500/10 text-emerald-600';
const RED = 'bg-rose-500/10 text-rose-600';
const BLUE = 'bg-sky-500/10 text-sky-600';
const VIOLET = 'bg-violet-500/10 text-violet-600';
const GRAY = 'bg-slate-500/10 text-slate-600';

export const statusStyles = {
  // orders
  PLACED: GRAY, PACKED: AMBER, IN_TRANSIT: BLUE, DELIVERED: GREEN,
  CANCELLED: RED, RETURNED: RED, DELAYED: RED,
  PAID: GREEN, PENDING: AMBER, FAILED: RED, REFUNDED: VIOLET,
  OPEN: AMBER, RESOLVED: GREEN, REQUESTED: AMBER, APPROVED: GREEN,
  // delivery
  AWAITING_ASSIGNMENT: AMBER, ASSIGNED: BLUE, PICKED_UP: BLUE,
  VERIFIED: GREEN, REJECTED: RED, AVAILABLE: GREEN, BUSY: AMBER, OFFLINE: GRAY,
  ACTIVE: GREEN, INACTIVE: GRAY,
  // customers
  ALLOWED: GREEN, BLOCKED: RED,
  // finance
  PROCESSING: BLUE, ON_HOLD: RED, SUCCESS: GREEN,
  MATCHED: GREEN, MISMATCH: RED, UNRECONCILED: AMBER,
};

export const labelOf = (value) => String(value).replace(/_/g, ' ');

const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toISO(d);
};

export const todayISO = () => daysFromNow(0);

export const formatDate = (iso) =>
  iso
    ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

export const includesText = (values, query) => {
  const q = query.trim().toLowerCase();
  return !q || values.some((v) => String(v ?? '').toLowerCase().includes(q));
};