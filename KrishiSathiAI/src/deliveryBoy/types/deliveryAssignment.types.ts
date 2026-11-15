export type Party = {
  name: string;
  phone: string;
  address: string;
};

export type DeliveryItem = {
  name: string;
  qty: string;
};

export type DeliveryOrder = {
  id: string;
  shop: Party;
  farmer: Party;
  items: DeliveryItem[];
  fee: number;
  distanceKm: number;
  etaMin: number;
  payment: 'Prepaid' | 'Cash on delivery';
  expiresAt: string;
  /** Set when built from a pending assignment */
  assignedAt?: string;
};

/** The UI uses DeliveryOrder everywhere */
export type Order = DeliveryOrder;

export type PendingAssignmentResponse = {
  id: string;
  orderId: string;
  deliveryBoyId: string;
  deliveryBoyName: string;
  deliveryBoyPhone: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  deliveryStatus: 'PENDING';
  assignedAt: string;
  expiresAt: string;
  acceptedAt: string | null;
};

export type AssignmentActionResponse = {
  orderId: string;
  deliveryBoyId: string;
  deliveryStatus: 'ACCEPTED' | 'REJECTED';
  acceptedAt?: string;
};