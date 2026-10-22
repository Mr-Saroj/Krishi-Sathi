// deliveryManagementHooks.js — state, derived data and actions for Delivery Management
import { useMemo, useState } from 'react';
import { useSimulatedLoading, useToast } from '../hooks/componentshook';
import {
  INITIAL_AREAS, INITIAL_PARTNERS, INITIAL_SHIPMENTS, EMPTY_PARTNER, filterShipments,
} from '../utils/deliveryManagementUtils';

export const useDeliveryManagement = () => {
  const isLoading = useSimulatedLoading(650);
  const { toast, notify } = useToast();

  const [areas, setAreas] = useState(INITIAL_AREAS);
  const [partners, setPartners] = useState(INITIAL_PARTNERS);
  const [shipments, setShipments] = useState(INITIAL_SHIPMENTS);

  const [tab, setTab] = useState('monitor');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [picks, setPicks] = useState({}); // shipmentId -> partnerId

  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [partnerForm, setPartnerForm] = useState(EMPTY_PARTNER);
  const [areaForm, setAreaForm] = useState({ name: '', state: '' });
  const [failTarget, setFailTarget] = useState(null); // { id, reason }

  const awaiting = shipments.filter((s) => s.status === 'AWAITING_ASSIGNMENT');
  const failed = shipments.filter((s) => s.status === 'FAILED');
  const partnerName = (id) => partners.find((p) => p.id === id)?.name || '—';

  const stats = useMemo(
    () => ({
      verified: partners.filter((p) => p.verification === 'VERIFIED').length,
      pending: partners.filter((p) => p.verification === 'PENDING').length,
      awaiting: shipments.filter((s) => s.status === 'AWAITING_ASSIGNMENT').length,
      moving: shipments.filter((s) => s.status === 'PICKED_UP' || s.status === 'IN_TRANSIT').length,
      failed: shipments.filter((s) => s.status === 'FAILED').length,
    }),
    [partners, shipments]
  );

  const visibleShipments = useMemo(
    () => filterShipments(shipments, partners, query, statusFilter),
    [shipments, partners, query, statusFilter]
  );

  const patchShipment = (id, patch, message) => {
    setShipments((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    if (message) notify(message);
  };

  const patchPartner = (id, patch, message) => {
    setPartners((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    if (message) notify(message);
  };

  /* ---------- Assignment ---------- */
  const assign = (shipment, partnerId, { reassign = false } = {}) => {
    if (!partnerId) {
      notify('Select a delivery partner first.');
      return;
    }
    patchShipment(
      shipment.id,
      { partnerId, status: 'ASSIGNED', failReason: null },
      reassign
        ? `${shipment.id} reassigned to ${partnerName(partnerId)}.`
        : `${shipment.id} assigned to ${partnerName(partnerId)}.`
    );
    setPicks((prev) => ({ ...prev, [shipment.id]: '' }));
  };

  const confirmFailure = () => {
    patchShipment(
      failTarget.id,
      {
        status: 'FAILED',
        failReason: failTarget.reason,
        attempts: (shipments.find((s) => s.id === failTarget.id)?.attempts || 0) + 1,
      },
      'Delivery marked as failed.'
    );
    setFailTarget(null);
  };

  /* ---------- Partners ---------- */
  const togglePartnerArea = (name) =>
    setPartnerForm((f) => ({
      ...f,
      areas: f.areas.includes(name) ? f.areas.filter((a) => a !== name) : [...f.areas, name],
    }));

  const registerPartner = (event) => {
    event.preventDefault();
    const name = partnerForm.name.trim();
    const phone = partnerForm.phone.trim();

    if (!name || !/^\d{10}$/.test(phone)) {
      notify('Enter the partner name and a valid 10-digit phone number.');
      return;
    }
    if (partners.some((p) => p.phone === phone)) {
      notify('A partner with this phone number already exists.');
      return;
    }
    if (partnerForm.areas.length === 0) {
      notify('Select at least one service area.');
      return;
    }

    const nextNumber = Math.max(0, ...partners.map((p) => Number(p.id.slice(3)))) + 1;
    setPartners((prev) => [
      ...prev,
      {
        id: `DP-${String(nextNumber).padStart(2, '0')}`,
        name,
        phone,
        vehicle: partnerForm.vehicle,
        verification: 'PENDING',
        availability: 'OFFLINE',
        areas: partnerForm.areas,
        rating: 0,
        documents: partnerForm.documents.trim() || 'Not provided',
      },
    ]);
    setPartnerForm(EMPTY_PARTNER);
    setShowPartnerForm(false);
    setTab('partners');
    notify('Delivery partner registered. Verification is pending.');
  };

  const verifyPartner = (id, approved) =>
    patchPartner(
      id,
      approved ? { verification: 'VERIFIED', availability: 'AVAILABLE' } : { verification: 'REJECTED', availability: 'OFFLINE' },
      approved ? 'Partner verified and set as available.' : 'Partner rejected.'
    );

  /* ---------- Areas ---------- */
  const addArea = (event) => {
    event.preventDefault();
    const name = areaForm.name.trim();
    const state = areaForm.state.trim();
    if (!name || !state) {
      notify('Enter an area name and state.');
      return;
    }
    if (areas.some((a) => a.name.toLowerCase() === name.toLowerCase())) {
      notify('This service area already exists.');
      return;
    }
    setAreas((prev) => [...prev, { id: `AR-${String(prev.length + 1).padStart(2, '0')}`, name, state, active: true }]);
    setAreaForm({ name: '', state: '' });
    notify('Service area added.');
  };

  const toggleArea = (id) => {
    setAreas((prev) => prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a)));
    notify('Service area updated.');
  };

  return {
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
  };
};