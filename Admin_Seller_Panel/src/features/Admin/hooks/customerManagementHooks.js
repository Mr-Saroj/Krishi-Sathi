// customerManagementHooks.js — state, derived data and actions for Customer Management
import { useMemo, useState } from 'react';
import { useSimulatedLoading, useToast } from '../hooks/componentshook';
import { daysFromNow } from '../utils/componentsUtils';
import {
  INITIAL_FARMERS, EMPTY_FILTERS, EMPTY_BLOCK_FORM, districtsOf, filterFarmers, farmerStats,
} from '../utils/customerManagementUtils';

export const useCustomerManagement = () => {
  const isLoading = useSimulatedLoading(650);
  const { toast, notify } = useToast();

  const [farmers, setFarmers] = useState(INITIAL_FARMERS);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [selectedId, setSelectedId] = useState(null);
  const [blockForm, setBlockForm] = useState(null); // null = modal closed

  const setFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const selected = farmers.find((f) => f.id === selectedId) || null;
  const blockTarget = blockForm ? farmers.find((f) => f.id === blockForm.id) : null;

  const stats = useMemo(() => farmerStats(farmers), [farmers]);
  const districts = useMemo(() => districtsOf(farmers), [farmers]);
  const visibleFarmers = useMemo(() => filterFarmers(farmers, filters), [farmers, filters]);

  const openBlockForm = (id) => setBlockForm({ ...EMPTY_BLOCK_FORM, id });
  const closeBlockForm = () => setBlockForm(null);

  const blockFarmer = (event) => {
    event.preventDefault();
    const note = blockForm.note.trim();

    if (blockForm.reason === 'Other' && !note) {
      notify('Please describe the reason for blocking.');
      return;
    }

    const reason = blockForm.reason === 'Other' ? note : note ? `${blockForm.reason} — ${note}` : blockForm.reason;
    const today = daysFromNow(0);

    setFarmers((prev) =>
      prev.map((f) =>
        f.id === blockForm.id
          ? {
              ...f,
              access: 'BLOCKED',
              blockReason: reason,
              blockedAt: today,
              history: [{ action: 'BLOCKED', reason, date: today }, ...f.history],
            }
          : f
      )
    );
    notify('Login access blocked.');
    setBlockForm(null);
  };

  const allowFarmer = (id) => {
    const farmer = farmers.find((f) => f.id === id);
    if (!window.confirm(`Allow ${farmer.name} to log in again?`)) return;

    const today = daysFromNow(0);
    setFarmers((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              access: 'ALLOWED',
              blockReason: null,
              blockedAt: null,
              history: [{ action: 'ALLOWED', reason: 'Access restored by admin', date: today }, ...f.history],
            }
          : f
      )
    );
    notify('Login access restored.');
  };

  return {
    isLoading,
    toast,
    farmers,
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
  };
};