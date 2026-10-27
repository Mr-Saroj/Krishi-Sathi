import React, { useState } from 'react';

import {
  STATUS_TEXT,
} from '../utils/sellerManagementUtils';

const displayValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  return value;
};

const Chip = ({ text, className = '' }) => (
  <span
    className={`neu-inset-sm whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-bold ${className}`}
  >
    {displayValue(text)}
  </span>
);

const Info = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-xs text-on-surface-variant">{label}</p>

    <p className="mt-0.5 break-words text-sm font-semibold text-on-surface">
      {displayValue(value)}
    </p>
  </div>
);

const DocumentItem = ({ name, url }) => (
  <div className="neu-inset flex items-center justify-between gap-3 rounded-xl px-4 py-3">
    <div className="flex min-w-0 items-center gap-3">
      <span className="material-symbols-outlined text-[20px] text-outline">
        description
      </span>

      <span className="break-words text-sm font-medium text-on-surface">
        {name}
      </span>
    </div>

    {url ? (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="neu-btn shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-secondary"
      >
        View
      </a>
    ) : (
      <span className="text-xs text-outline">Not uploaded</span>
    )}
  </div>
);

const SellerDetailPanel = ({ seller, onClose, actions = {} }) => {
  const [mode, setMode] = useState(null);
  const [reason, setReason] = useState('');

  if (!seller) {
    return null;
  }

  // The API returns business information inside businessDetails.
  const business = seller.businessDetails ?? {};

  const sellerId = seller.sellerId ?? seller.id ?? seller._id;

  const sellerStatus =
    seller.loginAccess ?? seller.status ?? 'PENDING';

  const statusClass =
    STATUS_TEXT?.[sellerStatus] ?? 'text-outline';

  const cancelMode = () => {
    setMode(null);
    setReason('');
  };

  const confirmMode = () => {
    if (!reason.trim()) {
      return;
    }

    if (mode === 'reject') {
      actions.reject?.(sellerId, reason.trim());
    }

    if (mode === 'suspend') {
      actions.suspend?.(sellerId, reason.trim());
    }

    cancelMode();
  };

  const handleApprove = () => {
    if (sellerId) {
      actions.approve?.(sellerId);
    }
  };

  const handleReinstate = () => {
    if (sellerId) {
      actions.reinstate?.(sellerId);
    }
  };

  return (
    <>
      {/* Background overlay */}
      <div
        className="fixed inset-0 z-[55] bg-primary/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Seller details panel */}
      <aside
        className="fixed inset-y-0 right-0 z-[60] flex w-full max-w-xl flex-col bg-surface shadow-[-8px_0_24px_var(--neu-dark)]"
        role="dialog"
        aria-modal="true"
        aria-label="Seller registration details"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-5">
          <div className="min-w-0">
            <p className="break-all text-xs font-semibold uppercase tracking-wider text-secondary">
              {displayValue(sellerId)}
            </p>

            <h2 className="mt-1 truncate text-xl font-extrabold text-primary">
              {displayValue(business.businessName)}
            </h2>

            <p className="mt-1 text-sm text-on-surface-variant">
              {displayValue(seller.fullName)}
              {' • '}
              {displayValue(business.city)}
              {business.state ? `, ${business.state}` : ''}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <Chip
              text={sellerStatus}
              className={statusClass}
            />

            <button
              type="button"
              onClick={onClose}
              aria-label="Close seller details"
              className="neu-btn flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant"
            >
              <span className="material-symbols-outlined text-[22px]">
                close
              </span>
            </button>
          </div>
        </div>

        {/* Only the Overview tab remains */}
        <div className="px-5 pb-3">
          <div className="neu-inset rounded-xl p-1.5">
            <div className="neu-raised-sm rounded-lg px-4 py-2 text-xs font-semibold text-primary">
              Seller Registration Details
            </div>
          </div>
        </div>

        {/* Scrollable seller information */}
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-3">
          {/* Personal information */}
          <section>
            <h3 className="mb-3 text-sm font-bold text-primary">
              Personal Information
            </h3>

            <div className="neu-raised-sm grid gap-4 rounded-2xl p-4 sm:grid-cols-2">
              <Info
                label="Full name"
                value={seller.fullName}
              />

              <Info
                label="Mobile number"
                value={seller.mobileNumber}
              />

              <Info
                label="Email address"
                value={seller.email}
              />

              <Info
                label="Account role"
                value={seller.role}
              />

              <Info
                label="Application status"
                value={seller.loginAccess}
              />

              <Info
                label="Applied on"
                value={business.createdAt}
              />
            </div>
          </section>

          {/* Business information */}
          <section>
            <h3 className="mb-3 text-sm font-bold text-primary">
              Business Information
            </h3>

            <div className="neu-raised-sm grid gap-4 rounded-2xl p-4 sm:grid-cols-2">
              <Info
                label="Business name"
                value={business.businessName}
              />

              <Info
                label="Business type"
                value={business.businessType}
              />

              <div className="sm:col-span-2">
                <Info
                  label="Business address"
                  value={business.businessAddress}
                />
              </div>

              <Info
                label="City"
                value={business.city}
              />

              <Info
                label="State"
                value={business.state}
              />

              <Info
                label="PIN code"
                value={business.pinCode}
              />

              <Info
                label="GSTIN"
                value={business.gstin}
              />

              <Info
                label="Business registration number"
                value={business.businessRegistrationNumber}
              />

              <Info
                label="Product licence"
                value={business.productLicense}
              />
            </div>
          </section>

          {/* Identity information */}
          <section>
            <h3 className="mb-3 text-sm font-bold text-primary">
              Identity Information
            </h3>

            <div className="neu-raised-sm grid gap-4 rounded-2xl p-4 sm:grid-cols-2">
              <Info
                label="Aadhaar number"
                value={business.aadhaarNumber}
              />

              <Info
                label="PAN number"
                value={business.panNumber}
              />
            </div>
          </section>

          {/* Uploaded documents */}
          <section>
            <h3 className="mb-3 text-sm font-bold text-primary">
              Uploaded Documents
            </h3>

            <div className="space-y-3">
              <DocumentItem
                name="PAN Document"
                url={business.panDocumentUrl}
              />

              <DocumentItem
                name="Supporting Document"
                url={business.supportingDocumentsUrl}
              />

              <DocumentItem
                name="Bank Proof"
                url={business.bankProofUrl}
              />
            </div>
          </section>

          {/* Bank information */}
          <section>
            <h3 className="mb-3 text-sm font-bold text-primary">
              Bank Account Information
            </h3>

            <div className="neu-raised-sm grid gap-4 rounded-2xl p-4 sm:grid-cols-2">
              <Info
                label="Account holder name"
                value={business.accountHolderName}
              />

              <Info
                label="Bank account number"
                value={business.accountNumber}
              />

              <Info
                label="IFSC code"
                value={business.ifscCode}
              />
            </div>
          </section>
        </div>

        {/* Bottom action bar */}
        <div className="border-t border-primary/10 px-5 py-4">
          {mode ? (
            <div className="space-y-3">
              <label className="text-sm font-semibold text-primary">
                Reason for{' '}
                {mode === 'reject' ? 'rejection' : 'suspension'}

                <span className="ml-1 text-error">*</span>
              </label>

              <textarea
                rows={3}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Enter the reason..."
                className="neu-inset w-full resize-none rounded-xl border-0 px-4 py-3 text-sm text-on-surface outline-none placeholder:text-outline focus:outline-2 focus:outline-offset-2 focus:outline-secondary/60"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={cancelMode}
                  className="neu-btn rounded-xl px-5 py-2.5 text-sm font-semibold text-on-surface"
                >
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
              {sellerStatus === 'PENDING' && (
                <>
                  <button
                    type="button"
                    onClick={() => setMode('reject')}
                    className="neu-btn rounded-xl px-5 py-2.5 text-sm font-semibold text-error"
                  >
                    Reject
                  </button>

                  <button
                    type="button"
                    onClick={handleApprove}
                    className="neu-btn-primary rounded-xl px-6 py-2.5 text-sm font-semibold"
                  >
                    Approve Seller
                  </button>
                </>
              )}

              {sellerStatus === 'APPROVED' && (
                <button
                  type="button"
                  onClick={() => setMode('suspend')}
                  className="neu-btn rounded-xl px-5 py-2.5 text-sm font-semibold text-error"
                >
                  Suspend Seller
                </button>
              )}

              {sellerStatus === 'SUSPENDED' && (
                <button
                  type="button"
                  onClick={handleReinstate}
                  className="neu-btn-primary rounded-xl px-6 py-2.5 text-sm font-semibold"
                >
                  Reinstate Seller
                </button>
              )}

              {sellerStatus === 'REJECTED' && (
                <button
                  type="button"
                  onClick={handleApprove}
                  className="neu-btn-primary rounded-xl px-6 py-2.5 text-sm font-semibold"
                >
                  Approve Anyway
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