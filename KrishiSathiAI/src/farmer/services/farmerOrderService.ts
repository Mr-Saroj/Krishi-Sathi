import { api } from '../../services/api';

export type PlaceOrderRequest = {
  productId: string;
  quantity: number;
  addressId: string;
  productTotal: number;
  platformFee: number;
  deliveryFee: number;
  totalSumFee: number;
  paymentMode: 'COD';
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
  paymentMode: string;
  paymentStatus: string;
  farmerDeliveryAddressId: string;
};

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