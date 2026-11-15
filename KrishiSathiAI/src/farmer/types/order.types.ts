export interface FarmerOrder {
  orderId: string;
  productId: string;
  productName: string;
  productImage: string | null;
  quantity: number;
  productQuantity: string;
  productTotal: number;
  platformFee: number;
  deliveryFee: number;
  totalSumFee: number;
  paymentMode: string;
  paymentStatus: string;
  deliveryAddressId: string;
  orderStatus: string;
}

export interface OrderListResponse {
  orders: FarmerOrder[];
}