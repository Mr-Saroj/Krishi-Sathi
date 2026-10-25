// src/components/InventoryComponents.jsx
// Neumorphic inventory UI. Requires the neu-* utilities from index.css.
import React, { useEffect, useState } from 'react';
import { EDITABLE_FIELDS, STATUSES } from '../hooks/useInventory';

const formatINR = (value) => `₹${Number(value).toLocaleString('en-IN')}`;

const MAX_IMAGES = 5;
const MAX_IMAGE_MB = 2;
const MAX_DOC_MB = 5;

const inputClass =
  'neu-inset w-full rounded-lg bg-transparent px-3 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/40 disabled:cursor-not-allowed disabled:opacity-60';

/* ------------------------------------------------------------------ */
/* Status chip + tabs                                                  */
/* ------------------------------------------------------------------ */

const statusMeta = {
  PENDING: { label: 'Pending', icon: 'hourglass_top', text: 'text-amber-700' },
  APPROVED: { label: 'Approved', icon: 'check_circle', text: 'text-secondary' },
  REJECTED: { label: 'Rejected', icon: 'cancel', text: 'text-error' },
  SUSPENDED: { label: 'Suspended', icon: 'block', text: 'text-orange-700' },
};

export const StatusChip = ({ status }) => {
  const meta = statusMeta[status];
  return (
    <span
      className={`neu-inset-sm inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-bold ${meta.text}`}
    >
      <span className="material-symbols-outlined text-sm">{meta.icon}</span>
      {meta.label}
    </span>
  );
};

export const StatusTabs = ({ active, counts, total, onChange }) => {
  const tabs = [
    { key: 'ALL', label: 'All', count: total },
    ...STATUSES.map((s) => ({
      key: s,
      label: statusMeta[s].label,
      count: counts[s] || 0,
    })),
  ];

  return (
    <div role="tablist" aria-label="Filter offers by status" className="flex flex-wrap gap-3">
      {tabs.map((tab) => {
        const selected = active === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.key)}
            className={`${
              selected ? 'neu-inset-sm text-primary' : 'neu-btn text-on-surface-variant'
            } rounded-lg px-4 py-2 text-xs font-semibold`}
          >
            {tab.label}
            <span className="ml-2 text-[10px] opacity-70">{tab.count}</span>
          </button>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Offers table                                                        */
/* ------------------------------------------------------------------ */

export const OffersTable = ({ offers, onEdit }) => (
  <div className="neu-raised overflow-hidden rounded-2xl">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-outline">
          <tr>
            {['Product', 'Price', 'Stock', 'Package', 'Prep time', 'Status', ''].map(
              (heading, i) => (
                <th key={heading || i} className="px-6 py-3 font-semibold">
                  {heading || <span className="sr-only">Actions</span>}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-primary/10">
          {offers.map((offer) => {
            const editable = EDITABLE_FIELDS[offer.status].length > 0;
            return (
              <tr key={offer.id} className="align-top transition-colors hover:bg-primary/5">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="neu-inset-sm flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg text-outline">
                      {offer.images[0] ? (
                        <img src={offer.images[0]} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined">image</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-primary">{offer.name}</p>
                      <p className="text-xs text-on-surface-variant">
                        {offer.category} · {offer.id}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 font-semibold text-on-surface">
                  {formatINR(offer.price)}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`font-semibold ${
                      offer.stock === 0 ? 'text-error' : 'text-on-surface'
                    }`}
                  >
                    {offer.stock === 0 ? 'Out of stock' : offer.stock}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-on-surface-variant">
                  {offer.packageQty} {offer.unit}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-on-surface-variant">
                  {offer.prepTime} hrs
                </td>
                <td className="px-6 py-4">
                  <StatusChip status={offer.status} />
                  {offer.reason && (
                    <p className="mt-2 max-w-[220px] text-xs leading-5 text-on-surface-variant">
                      {offer.reason}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onEdit(offer)}
                    className="neu-btn rounded-lg px-4 py-2 text-xs font-semibold text-secondary"
                  >
                    {offer.status === 'REJECTED'
                      ? 'Fix & resubmit'
                      : editable
                      ? 'Edit'
                      : 'View'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Modal shell                                                         */
/* ------------------------------------------------------------------ */

const Modal = ({ title, subtitle, onClose, children, footer }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="inventory-modal-title"
        className="neu-raised flex max-h-[92vh] w-full max-w-2xl flex-col rounded-t-2xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-primary/10 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id="inventory-modal-title" className="text-lg font-bold text-primary">
              {title}
            </h2>
            {subtitle && <p className="mt-1 text-xs text-on-surface-variant">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="neu-btn flex rounded-lg p-2 text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">{children}</div>
        <div className="flex flex-wrap justify-end gap-3 border-t border-primary/10 px-4 py-4 sm:px-6">
          {footer}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Form pieces                                                         */
/* ------------------------------------------------------------------ */

const Field = ({ id, label, hint, error, children }) => (
  <div>
    <label htmlFor={id} className="mb-1 block text-xs font-semibold text-on-surface-variant">
      {label}
    </label>
    {children}
    {error ? (
      <p role="alert" className="mt-1 text-xs text-error">
        {error}
      </p>
    ) : (
      hint && <p className="mt-1 text-[11px] text-outline">{hint}</p>
    )}
  </div>
);

const validateFields = (values, fields) => {
  const errors = {};
  const whole = (v) => v !== '' && Number.isInteger(Number(v));
  if (fields.includes('price') && !(Number(values.price) > 0))
    errors.price = 'Enter a price greater than 0.';
  if (fields.includes('stock') && !(whole(values.stock) && Number(values.stock) >= 0))
    errors.stock = 'Enter a whole number, 0 or more.';
  if (fields.includes('packageQty') && !(Number(values.packageQty) > 0))
    errors.packageQty = 'Enter a package size greater than 0.';
  if (
    fields.includes('prepTime') &&
    !(whole(values.prepTime) && Number(values.prepTime) >= 1 && Number(values.prepTime) <= 720)
  )
    errors.prepTime = 'Enter whole hours between 1 and 720.';
  return errors;
};

const OfferFields = ({ values, errors, onChange, editable, unit }) => {
  const locked = 'Locked for this status.';
  const field = (name) => ({
    id: `offer-${name}`,
    value: values[name],
    disabled: !editable.includes(name),
    onChange: (e) => onChange(name, e.target.value),
    className: inputClass,
  });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field
        id="offer-price"
        label="Price per package (₹)"
        error={errors.price}
        hint={!editable.includes('price') ? locked : undefined}
      >
        <input type="number" min="0" step="0.01" inputMode="decimal" {...field('price')} />
      </Field>
      <Field
        id="offer-stock"
        label="Stock (packages)"
        error={errors.stock}
        hint={!editable.includes('stock') ? locked : undefined}
      >
        <input type="number" min="0" step="1" inputMode="numeric" {...field('stock')} />
      </Field>
      <Field
        id="offer-packageQty"
        label={`Package size${unit ? ` (${unit})` : ''}`}
        error={errors.packageQty}
        hint={!editable.includes('packageQty') ? 'Fixed once approved. Submit a new offer for another size.' : undefined}
      >
        <input type="number" min="0" step="any" inputMode="decimal" {...field('packageQty')} />
      </Field>
      <Field
        id="offer-prepTime"
        label="Preparation time (hours)"
        error={errors.prepTime}
        hint={!editable.includes('prepTime') ? locked : 'Time to pack before pickup.'}
      >
        <input type="number" min="1" max="720" step="1" inputMode="numeric" {...field('prepTime')} />
      </Field>
    </div>
  );
};

const ImagePicker = ({ images, onChange, error }) => {
  const [problem, setProblem] = useState('');

  const handleFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    let message = '';
    const valid = [];

    picked.forEach((file) => {
      if (!file.type.startsWith('image/')) message = 'Only image files are allowed.';
      else if (file.size > MAX_IMAGE_MB * 1024 * 1024)
        message = `Each image must be under ${MAX_IMAGE_MB} MB.`;
      else valid.push({ file, url: URL.createObjectURL(file) });
    });

    const room = MAX_IMAGES - images.length;
    if (valid.length > room) {
      message = `You can upload up to ${MAX_IMAGES} images.`;
      valid.slice(room).forEach((img) => URL.revokeObjectURL(img.url));
    }
    setProblem(message);
    onChange([...images, ...valid.slice(0, Math.max(room, 0))]);
  };

  const remove = (index) => {
    URL.revokeObjectURL(images[index].url);
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-on-surface-variant">
        Product images ({images.length}/{MAX_IMAGES})
      </p>
      <div className="flex flex-wrap gap-3">
        {images.map((img, i) => (
          <div key={img.url} className="neu-inset-sm relative h-20 w-20 overflow-hidden rounded-lg">
            <img src={img.url} alt={`Upload ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label={`Remove image ${i + 1}`}
              className="absolute right-1 top-1 flex rounded-full bg-black/60 p-0.5 text-white"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        ))}
        {images.length < MAX_IMAGES && (
          <label className="neu-btn flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-semibold text-secondary focus-within:ring-2 focus-within:ring-secondary/40">
            <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
            Add
            <input type="file" accept="image/*" multiple onChange={handleFiles} className="sr-only" />
          </label>
        )}
      </div>
      {(problem || error) && (
        <p role="alert" className="mt-1 text-xs text-error">
          {problem || error}
        </p>
      )}
      {!problem && !error && (
        <p className="mt-1 text-[11px] text-outline">JPG or PNG, up to {MAX_IMAGE_MB} MB each.</p>
      )}
    </div>
  );
};

const DocPicker = ({ requiredDocs, docs, onChange, errors = {}, optional = false }) => {
  const [problems, setProblems] = useState({});

  if (requiredDocs.length === 0) {
    return (
      <p className="text-xs text-on-surface-variant">
        No documents are required for this product.
      </p>
    );
  }

  const pick = (name, file) => {
    if (!file) return;
    if (file.size > MAX_DOC_MB * 1024 * 1024) {
      setProblems((p) => ({ ...p, [name]: `File must be under ${MAX_DOC_MB} MB.` }));
      return;
    }
    setProblems((p) => ({ ...p, [name]: '' }));
    onChange({ ...docs, [name]: file });
  };

  const remove = (name) => {
    const next = { ...docs };
    delete next[name];
    onChange(next);
  };

  return (
    <ul className="space-y-3">
      {requiredDocs.map((name, i) => {
        const file = docs[name];
        const message = problems[name] || errors[name];
        return (
          <li key={name} className="neu-inset rounded-xl p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-primary">
                  {name}
                  {!optional && <span className="text-error"> *</span>}
                </p>
                <p className="truncate text-xs text-on-surface-variant">
                  {file ? file.name : 'PDF, JPG or PNG'}
                </p>
              </div>
              <div className="flex gap-2">
                {file && (
                  <button
                    type="button"
                    onClick={() => remove(name)}
                    className="neu-btn rounded-lg px-3 py-1.5 text-xs font-semibold text-error"
                  >
                    Remove
                  </button>
                )}
                <label className="neu-btn cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold text-secondary focus-within:ring-2 focus-within:ring-secondary/40">
                  {file ? 'Replace' : 'Upload'}
                  <input
                    id={`doc-${i}`}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/*"
                    onChange={(e) => {
                      pick(name, e.target.files?.[0]);
                      e.target.value = '';
                    }}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
            {message && (
              <p role="alert" className="mt-2 text-xs text-error">
                {message}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
};

const SectionLabel = ({ children }) => (
  <h3 className="mb-3 mt-6 text-sm font-bold text-primary first:mt-0">{children}</h3>
);

/* ------------------------------------------------------------------ */
/* Add offer modal                                                     */
/* ------------------------------------------------------------------ */

const emptyValues = { price: '', stock: '', packageQty: '', prepTime: '' };
const ALL_FIELDS = ['price', 'stock', 'packageQty', 'prepTime'];

export const AddOfferModal = ({ catalogue, offers, onSubmit, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [values, setValues] = useState(emptyValues);
  const [images, setImages] = useState([]);
  const [docs, setDocs] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const selected = catalogue.find((c) => c.id === selectedId);
  const filtered = catalogue.filter((c) =>
    `${c.name} ${c.category} ${c.brand}`.toLowerCase().includes(query.trim().toLowerCase())
  );

  const close = () => {
    images.forEach((img) => URL.revokeObjectURL(img.url));
    onClose();
  };

  const setValue = (name, value) => setValues((v) => ({ ...v, [name]: value }));

  const handleSubmit = async () => {
    const next = validateFields(values, ALL_FIELDS);
    if (!selected) next.catalogue = 'Choose a product from the catalogue.';
    if (selected) {
      const duplicate = offers.some(
        (o) =>
          o.catalogueId === selected.id &&
          Number(o.packageQty) === Number(values.packageQty) &&
          o.status !== 'REJECTED'
      );
      if (duplicate) next.packageQty = 'You already have an offer for this package size.';
      if (images.length === 0) next.images = 'Upload at least one product image.';
      selected.requiredDocs.forEach((name) => {
        if (!docs[name]) next[name] = 'This document is required.';
      });
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      // Keep image object URLs alive: the saved offer uses them as thumbnails.
      await onSubmit({ catalogueId: selected.id, ...values, images, docs });
      onClose();
    } catch (err) {
      console.error('Submit offer error:', err);
      setSubmitError('Could not submit the offer. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Add product offer"
      subtitle="Pick an approved catalogue product, then set your price and stock."
      onClose={close}
      footer={
        <>
          <button
            type="button"
            onClick={close}
            className="neu-btn rounded-lg px-5 py-2 text-sm font-semibold text-on-surface-variant"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="neu-btn rounded-lg px-5 py-2 text-sm font-semibold text-secondary disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Submit for approval'}
          </button>
        </>
      }
    >
      {submitError && (
        <div role="alert" className="neu-inset mb-4 rounded-xl px-4 py-3 text-sm font-medium text-error">
          {submitError}
        </div>
      )}

      <SectionLabel>1. Catalogue product</SectionLabel>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, category or brand"
        aria-label="Search master catalogue"
        className={inputClass}
      />
      <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto pr-1">
        {filtered.length === 0 && (
          <li className="py-4 text-center text-sm text-outline">No matching catalogue products.</li>
        )}
        {filtered.map((item) => {
          const active = item.id === selectedId;
          return (
            <li key={item.id}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setSelectedId(item.id);
                  setDocs({});
                  setErrors((e) => ({ ...e, catalogue: undefined }));
                }}
                className={`${
                  active ? 'neu-inset-sm' : 'neu-btn'
                } flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-left`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-primary">{item.name}</span>
                  <span className="block text-xs text-on-surface-variant">
                    {item.category} · {item.brand} · sold per {item.unit}
                  </span>
                </span>
                {active && (
                  <span className="material-symbols-outlined text-secondary">check_circle</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      {errors.catalogue && (
        <p role="alert" className="mt-1 text-xs text-error">
          {errors.catalogue}
        </p>
      )}

      <SectionLabel>2. Your offer</SectionLabel>
      <OfferFields
        values={values}
        errors={errors}
        onChange={setValue}
        editable={ALL_FIELDS}
        unit={selected?.unit}
      />

      <SectionLabel>3. Images</SectionLabel>
      <ImagePicker images={images} onChange={setImages} error={errors.images} />

      <SectionLabel>4. Required documents</SectionLabel>
      {selected ? (
        <DocPicker requiredDocs={selected.requiredDocs} docs={docs} onChange={setDocs} errors={errors} />
      ) : (
        <p className="text-xs text-on-surface-variant">
          Choose a product to see which documents it needs.
        </p>
      )}
    </Modal>
  );
};

/* ------------------------------------------------------------------ */
/* Edit offer modal                                                    */
/* ------------------------------------------------------------------ */

export const EditOfferModal = ({ offer, catalogue, onSave, onClose }) => {
  const editable = EDITABLE_FIELDS[offer.status];
  const readOnly = editable.length === 0;
  const resubmit = offer.status === 'REJECTED';
  const requiredDocs = catalogue.find((c) => c.id === offer.catalogueId)?.requiredDocs || [];

  const [values, setValues] = useState({
    price: String(offer.price),
    stock: String(offer.stock),
    packageQty: String(offer.packageQty),
    prepTime: String(offer.prepTime),
  });
  const [images, setImages] = useState([]);
  const [docs, setDocs] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const close = () => {
    images.forEach((img) => URL.revokeObjectURL(img.url));
    onClose();
  };

  const handleSave = async () => {
    const next = validateFields(values, editable);
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    setSaveError('');
    try {
      await onSave(offer.id, values, resubmit ? { images, docs } : undefined);
      onClose();
    } catch (err) {
      console.error('Update offer error:', err);
      setSaveError('Could not save changes. Please try again.');
      setSaving(false);
    }
  };

  return (
    <Modal
      title={readOnly ? 'Offer details' : resubmit ? 'Fix and resubmit' : 'Edit offer'}
      subtitle={`${offer.name} · ${offer.id}`}
      onClose={close}
      footer={
        <>
          <button
            type="button"
            onClick={close}
            className="neu-btn rounded-lg px-5 py-2 text-sm font-semibold text-on-surface-variant"
          >
            {readOnly ? 'Close' : 'Cancel'}
          </button>
          {!readOnly && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="neu-btn rounded-lg px-5 py-2 text-sm font-semibold text-secondary disabled:opacity-60"
            >
              {saving ? 'Saving…' : resubmit ? 'Resubmit for approval' : 'Save changes'}
            </button>
          )}
        </>
      }
    >
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <StatusChip status={offer.status} />
        <span className="text-xs text-outline">Updated {offer.updatedAt}</span>
      </div>

      {offer.reason && (
        <div className="neu-inset mb-5 rounded-xl px-4 py-3 text-sm text-on-surface-variant">
          {offer.reason}
        </div>
      )}
      {saveError && (
        <div role="alert" className="neu-inset mb-4 rounded-xl px-4 py-3 text-sm font-medium text-error">
          {saveError}
        </div>
      )}

      <OfferFields
        values={values}
        errors={errors}
        onChange={(name, value) => setValues((v) => ({ ...v, [name]: value }))}
        editable={editable}
        unit={offer.unit}
      />

      {resubmit && (
        <>
          <SectionLabel>Replace images (optional)</SectionLabel>
          <ImagePicker images={images} onChange={setImages} />
          <SectionLabel>Replace documents (optional)</SectionLabel>
          <DocPicker requiredDocs={requiredDocs} docs={docs} onChange={setDocs} optional />
        </>
      )}

      {offer.docs.length > 0 && (
        <>
          <SectionLabel>Submitted documents</SectionLabel>
          <ul className="space-y-2 text-sm text-on-surface-variant">
            {offer.docs.map((doc) => (
              <li key={doc.name} className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-secondary">description</span>
                {doc.name} <span className="text-xs text-outline">({doc.fileName})</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Modal>
  );
};