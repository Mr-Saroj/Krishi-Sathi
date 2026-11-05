import React, { useState } from 'react';
import { btn, btnPrimary } from '../utils/componentsUtils';

/**
 * Inline "assign" block used inside the order drawer.
 * Flow: shows current assignee -> click Assign/Change -> loads available
 * people for this order's location -> pick one -> Confirm.
 *
 * Props:
 *  label        "Seller" | "Delivery boy"
 *  icon         material symbol name
 *  current      currently assigned { id, name, phone? } or null
 *  load         async () => [{ id, name, phone?, area?, activeOrders? }]
 *  onAssign     async (id) => void
 *  disabled     boolean (e.g. seller must be assigned first)
 *  disabledHint string shown when disabled
 */
const AssignPicker = ({
  label,
  icon,
  current,
  load,
  onAssign,
  disabled = false,
  disabledHint = '',
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [options, setOptions] = useState([]);
  const [choice, setChoice] = useState(null);
  const [err, setErr] = useState('');

  const openPicker = async () => {
    setOpen(true);
    setChoice(current?.id ?? null);
    setErr('');
    setLoading(true);
    try {
      setOptions(await load());
    } catch (e) {
      setErr(e.response?.data?.message || `Unable to load ${label.toLowerCase()}s.`);
    } finally {
      setLoading(false);
    }
  };

  const confirm = async () => {
    if (!choice) return;
    try {
      setSaving(true);
      await onAssign(choice);
      setOpen(false);
    } catch (e) {
      setErr(e.response?.data?.message || `Unable to assign ${label.toLowerCase()}.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="neu-inset rounded-xl p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
            <span className="material-symbols-outlined text-xl text-emerald-600">{icon}</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-on-surface-variant">{label}</p>
            <p className="truncate font-bold text-primary">
              {current?.name || 'Not assigned'}
            </p>
            {current?.phone && (
              <p className="text-xs text-outline">{current.phone}</p>
            )}
          </div>
        </div>

        {!open && (
          <button
            type="button"
            disabled={disabled}
            onClick={openPicker}
            className={`${current ? btn : btnPrimary} shrink-0 disabled:opacity-50`}
          >
            {current ? 'Change' : 'Assign'}
          </button>
        )}
      </div>

      {disabled && disabledHint && (
        <p className="mt-3 text-xs text-on-surface-variant">{disabledHint}</p>
      )}

      {open && (
        <div className="mt-4 border-t border-primary/10 pt-4">
          <p className="text-sm font-semibold text-primary">
            Available {label.toLowerCase()}s in this location
          </p>

          {loading && (
            <p className="mt-3 text-sm text-on-surface-variant">Loading…</p>
          )}

          {err && (
            <p className="mt-3 rounded-lg bg-rose-500/5 p-3 text-sm text-rose-600">{err}</p>
          )}

          {!loading && !err && options.length === 0 && (
            <p className="mt-3 text-sm text-on-surface-variant">
              No {label.toLowerCase()} is available for this location right now.
            </p>
          )}

          <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
            {options.map((o) => {
              const active = choice === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setChoice(o.id)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition-colors ${
                    active
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-primary/10 hover:bg-primary/5'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-primary">{o.name}</p>
                    <p className="mt-0.5 text-xs text-on-surface-variant">
                      {[o.phone, o.area].filter(Boolean).join(' • ') || `ID: ${o.id}`}
                    </p>
                    {o.activeOrders !== undefined && (
                      <p className="mt-0.5 text-xs text-outline">
                        {o.activeOrders} active orders
                      </p>
                    )}
                  </div>
                  <span
                    className={`material-symbols-outlined text-xl ${
                      active ? 'text-emerald-600' : 'text-outline'
                    }`}
                  >
                    {active ? 'radio_button_checked' : 'radio_button_unchecked'}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex gap-3">
            <button type="button" onClick={() => setOpen(false)} className={`${btn} flex-1`}>
              Cancel
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={!choice || saving}
              className={`${btnPrimary} flex-1 disabled:opacity-50`}
            >
              {saving ? 'Saving…' : `Confirm ${label.toLowerCase()}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignPicker;