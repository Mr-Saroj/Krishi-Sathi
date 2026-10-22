// shared/components.jsx — building blocks reused by Order, Delivery and Finance pages
import React from 'react';
import { statusStyles, labelOf } from '../utils/componentsUtils';

export const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-bold ${
      statusStyles[status] || 'bg-primary/5 text-on-surface-variant'
    }`}
  >
    {labelOf(status)}
  </span>
);

export const PageHeader = ({ title, description, action }) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 className="text-xl font-extrabold text-primary sm:text-2xl">{title}</h1>
      <p className="mt-1 text-sm text-on-surface-variant">{description}</p>
    </div>
    {action}
  </div>
);

export const StatGrid = ({ items }) => (
  <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
    {items.map((item) => (
      <div key={item.label} className="neu-raised rounded-2xl p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-on-surface-variant">{item.label}</p>
            <p className="mt-3 text-2xl font-extrabold text-primary">{item.value}</p>
            <p className="mt-2 text-[10px] font-bold tracking-wider text-outline">{item.sub}</p>
          </div>
          <div className={`neu-inset flex h-12 w-12 items-center justify-center rounded-xl ${item.color}`}>
            <span className="material-symbols-outlined text-2xl">{item.icon}</span>
          </div>
        </div>
      </div>
    ))}
  </section>
);

export const TabBar = ({ tabs, active, onChange }) => (
  <div className="flex gap-2 overflow-x-auto pb-1">
    {tabs.map(([key, label]) => (
      <button
        key={key}
        type="button"
        onClick={() => onChange(key)}
        className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-semibold transition-all sm:text-sm ${
          active === key ? 'neu-raised-sm text-primary' : 'text-on-surface-variant hover:text-primary'
        }`}
      >
        {label}
      </button>
    ))}
  </div>
);

export const Field = ({ label, children, hint }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-primary">{label}</label>
    {children}
    {hint && <p className="mt-2 text-xs text-outline">{hint}</p>}
  </div>
);

export const InfoTile = ({ label, value }) => (
  <div className="neu-raised rounded-xl p-3">
    <p className="text-xs text-outline">{label}</p>
    <p className="mt-2 break-words text-sm font-semibold text-primary">{value}</p>
  </div>
);

export const EmptyRow = ({ colSpan, children }) => (
  <tr>
    <td colSpan={colSpan} className="px-6 py-14 text-center text-outline">
      {children}
    </td>
  </tr>
);

export const TableHead = ({ list }) => (
  <thead className="text-xs uppercase tracking-wide text-outline">
    <tr>
      {list.map((h) => (
        <th key={h} className="px-5 py-4 font-semibold">{h}</th>
      ))}
    </tr>
  </thead>
);

export const ProgressBar = ({ segments }) => (
  <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-primary/10">
    {segments.map((s) => (
      <div key={s.label} title={`${s.label}: ${s.value}`} className={s.className} style={{ width: `${s.percent}%` }} />
    ))}
  </div>
);

export const Drawer = ({ title, subtitle, onClose, children }) => (
  <div className="fixed inset-0 z-[80] flex justify-end bg-black/40">
    <button type="button" aria-label="Close details" onClick={onClose} className="absolute inset-0 cursor-default" />
    <aside className="relative z-10 h-full w-full max-w-lg overflow-y-auto bg-surface p-5 shadow-2xl sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-primary">{title}</h2>
          {subtitle && <p className="mt-1 text-xs text-on-surface-variant">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="neu-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          aria-label="Close"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      {children}
    </aside>
  </div>
);

export const Modal = ({ title, subtitle, onClose, children }) => (
  <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-black/40 p-4">
    <div className="my-auto w-full max-w-xl rounded-2xl bg-surface p-5 shadow-2xl sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-primary">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-on-surface-variant">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="neu-btn flex h-10 w-10 items-center justify-center rounded-xl"
          aria-label="Close form"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      {children}
    </div>
  </div>
);

export const Toast = ({ message }) =>
  message ? (
    <div
      role="status"
      className="neu-raised fixed bottom-6 right-6 z-[100] max-w-sm rounded-xl px-5 py-3 text-sm font-semibold text-secondary"
    >
      {message}
    </div>
  ) : null;