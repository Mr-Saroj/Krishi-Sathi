
import { api } from '../../services/api';
import type { FarmerOrder } from '../types/order.types';

export type PaymentMethod = 'COD' | 'ONLINE';

export type PlaceOrderRequest = {
  productId: string;
  quantity: number;
  addressId: string;
  productTotal: number;
  platformFee: number;
  deliveryFee: number;
  totalSumFee: number;
  paymentMode: PaymentMethod;
};

export type PlaceOrderResponse = {
  id: string;
  farmerId: string;
  productId: string;
  quantity: number;
  productQuantity: string;
  productTotal: number;
  platformFee: number;
  deliveryFee: number;
  totalSumFee: number;
  paymentMode: PaymentMethod;
  paymentStatus: string;
  farmerDeliveryAddressId: string;
};

export type CreatePaymentResponse = {
  businessOrderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
};

export type VerifyPaymentRequest = {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

export type PaymentStatusResponse = {
  orderId: string;
  razorpayPaymentId: string | null;
  paymentStatus:
    | 'CREATED'
    | 'PENDING'
    | 'AUTHORIZED'
    | 'CAPTURED'
    | 'FAILED'
    | null;
  message: string;
};

// ==================== BUSINESS ORDER ====================

export const placeFarmerOrder = async (
  request: PlaceOrderRequest,
  idempotencyKey: string,
): Promise<PlaceOrderResponse> => {
  const response = await api.post<PlaceOrderResponse>(
    '/farmer/shop/orders',
    request,
    {
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
    },
  );

  return response.data;
};

// ==================== CREATE RAZORPAY ORDER ====================

export const createFarmerPayment = async (orderId: string) => {
  return api.post<CreatePaymentResponse>(
    `/farmer/payment/create-order/${encodeURIComponent(orderId)}`,
  );
};

// ==================== VERIFY RAZORPAY PAYMENT ====================

export const verifyFarmerPayment = async (
  request: VerifyPaymentRequest,
) => {
  return api.post<PaymentStatusResponse>(
    '/farmer/payment/verify',
    request,
  );
};

// ==================== GET PAYMENT STATUS ====================

export const getFarmerPaymentStatus = async (orderId: string) => {
  return api.get<PaymentStatusResponse>(
    `/farmer/payment/status/${encodeURIComponent(orderId)}`,
  );
};

// ==================== EXISTING ORDER APIs ====================

export const farmerOrderService = {
  getMyOrders: async (): Promise<FarmerOrder[]> => {
    const response = await api.get<FarmerOrder[]>(
      '/farmer/shop/orders',
    );

    return response.data;
  },

  getOrderDetails: async (orderId: string): Promise<FarmerOrder> => {
    const response = await api.get<FarmerOrder>(
      `/farmer/shop/orders/${encodeURIComponent(orderId)}`,
    );

    return response.data;
  },
};
