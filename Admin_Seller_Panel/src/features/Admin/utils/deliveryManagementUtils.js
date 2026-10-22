// deliveryData.js — mock data + pure helpers for Delivery Management
import { includesText } from '../utils/componentsUtils';

export const VEHICLES = ['Bike', 'Van', 'Mini truck'];
export const FAIL_REASONS = [
  'Customer not reachable',
  'Wrong or incomplete address',
  'Customer refused delivery',
  'Vehicle breakdown',
  'Area not accessible',
];

export const INITIAL_AREAS = [
  { id: 'AR-01', name: 'Pune', state: 'Maharashtra', active: true },
  { id: 'AR-02', name: 'Nashik', state: 'Maharashtra', active: true },
  { id: 'AR-03', name: 'Patna', state: 'Bihar', active: true },
  { id: 'AR-04', name: 'Lucknow', state: 'Uttar Pradesh', active: true },
  { id: 'AR-05', name: 'Indore', state: 'Madhya Pradesh', active: true },
  { id: 'AR-06', name: 'Jaipur', state: 'Rajasthan', active: true },
  { id: 'AR-07', name: 'Ludhiana', state: 'Punjab', active: false },
  { id: 'AR-08', name: 'Bhubaneswar', state: 'Odisha', active: true },
];

export const INITIAL_PARTNERS = [
  { id: 'DP-01', name: 'Ravi Kumar', phone: '9876500011', vehicle: 'Bike', verification: 'VERIFIED', availability: 'AVAILABLE', areas: ['Pune', 'Nashik'], rating: 4.6, documents: 'Aadhaar, Driving licence, RC' },
  { id: 'DP-02', name: 'Suresh Yadav', phone: '9876500022', vehicle: 'Mini truck', verification: 'VERIFIED', availability: 'BUSY', areas: ['Patna', 'Lucknow'], rating: 4.3, documents: 'Aadhaar, Driving licence, RC' },
  { id: 'DP-03', name: 'Manoj Tiwari', phone: '9876500033', vehicle: 'Van', verification: 'VERIFIED', availability: 'AVAILABLE', areas: ['Lucknow', 'Indore'], rating: 4.8, documents: 'Aadhaar, Driving licence, RC' },
  { id: 'DP-04', name: 'Anita Sharma', phone: '9876500044', vehicle: 'Bike', verification: 'VERIFIED', availability: 'BUSY', areas: ['Jaipur', 'Ludhiana'], rating: 4.5, documents: 'Aadhaar, Driving licence' },
  { id: 'DP-05', name: 'Debasis Nayak', phone: '9876500055', vehicle: 'Van', verification: 'VERIFIED', availability: 'AVAILABLE', areas: ['Bhubaneswar'], rating: 4.7, documents: 'Aadhaar, Driving licence, RC' },
  { id: 'DP-06', name: 'Imran Khan', phone: '9876500066', vehicle: 'Bike', verification: 'PENDING', availability: 'OFFLINE', areas: ['Pune'], rating: 0, documents: 'Aadhaar, Driving licence' },
  { id: 'DP-07', name: 'Rakesh Das', phone: '9876500077', vehicle: 'Mini truck', verification: 'PENDING', availability: 'OFFLINE', areas: ['Bhubaneswar'], rating: 0, documents: 'Aadhaar' },
];

const ship = (id, orderId, seller, area, customer, partnerId, status, extra = {}) => ({
  id, orderId, seller, area, customer, partnerId, status, attempts: 0, failReason: null, ...extra,
});

export const INITIAL_SHIPMENTS = [
  ship('DEL-9001', 'ORD-5001', 'Green Farm Store', 'Pune', 'Ramesh Patel', null, 'AWAITING_ASSIGNMENT'),
  ship('DEL-9002', 'ORD-5007', 'Rural Mart', 'Bhubaneswar', 'Bhaskar Rout', null, 'AWAITING_ASSIGNMENT'),
  ship('DEL-9003', 'ORD-5002', 'Kisan Supplies', 'Patna', 'Sunita Devi', 'DP-02', 'IN_TRANSIT'),
  ship('DEL-9004', 'ORD-5008', 'Agri Direct', 'Jaipur', 'Farida Khan', 'DP-04', 'PICKED_UP'),
  ship('DEL-9005', 'ORD-5010', 'Kisan Supplies', 'Indore', 'Tanya Sharma', 'DP-03', 'DELIVERED'),
  ship('DEL-9006', 'ORD-5011', 'Green Farm Store', 'Bhubaneswar', 'Kavita Rout', 'DP-05', 'ASSIGNED'),
  ship('DEL-9007', 'ORD-5012', 'Agri Direct', 'Jaipur', 'Imran Siddiqui', 'DP-04', 'FAILED',
    { attempts: 1, failReason: 'Customer not reachable' }),
];

export const TRACK_STEPS = [
  ['ASSIGNED', 'Assigned'],
  ['PICKED_UP', 'Picked up'],
  ['IN_TRANSIT', 'In transit'],
  ['DELIVERED', 'Delivered'],
];

export const NEXT_STEP = {
  ASSIGNED: ['PICKED_UP', 'Mark picked up'],
  PICKED_UP: ['IN_TRANSIT', 'Mark in transit'],
  IN_TRANSIT: ['DELIVERED', 'Mark delivered'],
};

export const IN_FLIGHT = ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'];

export const workloadOf = (partnerId, shipments) =>
  shipments.filter((s) => s.partnerId === partnerId && IN_FLIGHT.includes(s.status)).length;

// Verified, not offline, covers the shipment's area and that area is active.
export const eligiblePartners = (shipment, partners, areas, excludeId = null) => {
  const area = areas.find((a) => a.name === shipment.area);
  if (!area || !area.active) return [];
  return partners.filter(
    (p) =>
      p.verification === 'VERIFIED' &&
      p.availability !== 'OFFLINE' &&
      p.areas.includes(shipment.area) &&
      p.id !== excludeId
  );
};

export const filterShipments = (shipments, partners, query, status) =>
  shipments.filter((s) => {
    if (s.status === 'AWAITING_ASSIGNMENT' || s.status === 'FAILED') return false;
    if (status !== 'ALL' && s.status !== status) return false;
    const partner = partners.find((p) => p.id === s.partnerId);
    return includesText([s.id, s.orderId, s.seller, s.area, s.customer, partner?.name], query);
  });

export const EMPTY_PARTNER = { name: '', phone: '', vehicle: 'Bike', documents: '', areas: [] };