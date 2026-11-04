
import { useState, useRef } from 'react';
import { Alert } from 'react-native';
import * as Crypto from 'expo-crypto';

import {
  getAddresses,
  type FarmerAddress,
} from '../services/farmerAddressService';

import {
  placeFarmerOrder,
  type PlaceOrderRequest,
  type PlaceOrderResponse,
} from '../services/farmerOrderService';

export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 99;

export const PLATFORM_FEE = 30;
export const DELIVERY_CHARGE = 50;

// Stores both UUID and the exact request for a pending attempt.
type PendingOrderAttempt = {
  idempotencyKey: string;
  request: PlaceOrderRequest;
};

export const formatPrice = (amount: number) =>
  `₹${Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const formatAddress = (address: FarmerAddress) =>
  [
    address.village,
    address.postOffice,
    address.district,
    address.state,
    address.pincode,
  ]
    .filter(Boolean)
    .join(', ');

export default function useCheckout(
  product: any,
  onOrderSuccess: (order: PlaceOrderResponse) => void,
) {
  // ==================== PRODUCT ====================

  const productId = String(
    product?.id ?? product?.productId ?? '',
  );

  const productImage =
    product?.imageUrl ?? product?.image ?? null;

  const productUnit =
    product?.quantityUnit ?? product?.unit ?? 'units';

  const [quantity, setQuantity] = useState(MIN_QUANTITY);

  const unitPrice = Number(product?.price) || 0;

  // ==================== PRICING ====================

  const subtotal = unitPrice * quantity;

  const totalAmount =
    subtotal + PLATFORM_FEE + DELIVERY_CHARGE;

  const increaseQuantity = () =>
    setQuantity((current) =>
      Math.min(MAX_QUANTITY, current + 1),
    );

  const decreaseQuantity = () =>
    setQuantity((current) =>
      Math.max(MIN_QUANTITY, current - 1),
    );

  // ==================== DELIVERY ADDRESSES ====================

  const [addresses, setAddresses] = useState<FarmerAddress[]>([]);

  const [selectedAddress, setSelectedAddress] =
    useState<FarmerAddress | null>(null);

  const [showAddresses, setShowAddresses] = useState(false);

  const [loadingAddresses, setLoadingAddresses] =
    useState(false);

  const [addressError, setAddressError] = useState('');

  // ==================== ORDER STATE ====================

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Keep the current pending attempt in memory.
  // useRef prevents unnecessary renders.
  const pendingOrderRef =
    useRef<PendingOrderAttempt | null>(null);

  // Expose key for debugging/UI if required.
  const [idempotencyKey, setIdempotencyKey] =
    useState<string | null>(null);

  // ==================== FETCH ADDRESSES ====================

  const loadAddresses = async () => {
    setLoadingAddresses(true);
    setAddressError('');

    try {
      const response = await getAddresses();

      setAddresses(response);

      if (response.length === 0) {
        setAddressError(
          'No saved addresses found. Please add an address first.',
        );
        return;
      }

      const currentAddress = selectedAddress
        ? response.find(
            (address) =>
              address.addressId === selectedAddress.addressId,
          )
        : undefined;

      const defaultAddress = response.find(
        (address) =>
          address.isDefault === true ||
          address.default === true,
      );

      setSelectedAddress(
        currentAddress ?? defaultAddress ?? response[0],
      );
    } catch (error) {
      console.error('Failed to fetch farmer addresses:', error);

      setAddressError(
        'Unable to load saved addresses. Please try again.',
      );
    } finally {
      setLoadingAddresses(false);
    }
  };

  // ==================== ADDRESS LIST ====================

  const handleChooseAddress = async () => {
    if (showAddresses) {
      setShowAddresses(false);
      return;
    }

    setShowAddresses(true);
    setAddressError('');

    if (addresses.length > 0) {
      return;
    }

    await loadAddresses();
  };

  const handleSelectAddress = (address: FarmerAddress) => {
    setSelectedAddress(address);
    setShowAddresses(false);
    setAddressError('');
  };

  const handleRetryAddresses = () => {
    setAddresses([]);
    void loadAddresses();
  };

  // ==================== CREATE OR REUSE ATTEMPT ====================

  const getOrCreateOrderAttempt = (
    currentRequest: PlaceOrderRequest,
  ): PendingOrderAttempt => {
    // If an attempt already exists, reuse its UUID and exact request.
    if (pendingOrderRef.current) {
      return pendingOrderRef.current;
    }

    // First attempt: create a new UUID.
    const newAttempt: PendingOrderAttempt = {
      idempotencyKey: Crypto.randomUUID(),
      request: currentRequest,
    };

    pendingOrderRef.current = newAttempt;

    setIdempotencyKey(newAttempt.idempotencyKey);

    return newAttempt;
  };

  // ==================== PLACE ORDER API ====================

  const handlePlaceOrder = async () => {
    if (isPlacingOrder) {
      return;
    }

    // Validate product
    if (!product || !productId) {
      Alert.alert(
        'Product Unavailable',
        'Product information is missing.',
      );
      return;
    }

    // Validate quantity
    if (
      quantity < MIN_QUANTITY ||
      quantity > MAX_QUANTITY
    ) {
      Alert.alert(
        'Invalid Quantity',
        'Please select a valid product quantity.',
      );
      return;
    }

    // Validate address
    if (!selectedAddress?.addressId) {
      Alert.alert(
        'Delivery Address Required',
        'Please select a delivery address before placing your order.',
      );
      return;
    }

    // Validate price
    if (unitPrice <= 0 || !Number.isFinite(unitPrice)) {
      Alert.alert(
        'Invalid Product Price',
        'Product price is not available.',
      );
      return;
    }

    try {
      setIsPlacingOrder(true);

      // Prepare current checkout request.
      const orderData: PlaceOrderRequest = {
        productId,
        quantity,
        addressId: selectedAddress.addressId,
        productTotal: subtotal,
        platformFee: PLATFORM_FEE,
        deliveryFee: DELIVERY_CHARGE,
        totalSumFee: totalAmount,
        paymentMode: 'COD',
      };

      // Create a new attempt or reuse the pending attempt.
      const attempt = getOrCreateOrderAttempt(orderData);

      console.log(
        'ORDER IDEMPOTENCY KEY:',
        attempt.idempotencyKey,
      );

      console.log(
        'ORDER REQUEST:',
        attempt.request,
      );

      // Always send the original request and same UUID on retry.
      const response = await placeFarmerOrder(
        attempt.request,
        attempt.idempotencyKey,
      );

      console.log('PLACE ORDER RESPONSE:', response);

      // Clear pending attempt only after confirmed success.
      pendingOrderRef.current = null;
      setIdempotencyKey(null);

      // Navigate to success screen with actual Order response.
      onOrderSuccess(response);

    } catch (error: any) {
      console.error(
        'PLACE ORDER ERROR:',
        error?.response?.data || error,
      );

      const backendMessage =
        error?.response?.data?.message ||
        (typeof error?.response?.data === 'string'
          ? error.response.data
          : null) ||
        error?.message ||
        'Something went wrong while placing your order.';

      Alert.alert(
        'Order Failed',
        `${backendMessage}\n\nYou can retry. The same order ID and original request will be used.`,
      );

      // Do not clear pendingOrderRef here.
      // The next retry will reuse the same UUID and request.
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // ==================== CANCEL PENDING ATTEMPT ====================

  const handleCancelPendingAttempt = () => {
    if (isPlacingOrder) {
      return;
    }

    pendingOrderRef.current = null;
    setIdempotencyKey(null);

    Alert.alert(
      'Retry Attempt Reset',
      'The previous pending attempt has been cleared. The next order submission will generate a new ID.',
    );
  };

  // ==================== RETURN ====================

  return {
    // Product
    productId,
    productImage,
    productUnit,
    unitPrice,

    // Pricing
    subtotal,
    platformFee: PLATFORM_FEE,
    deliveryCharge: DELIVERY_CHARGE,
    totalAmount,

    // Quantity
    quantity,
    increaseQuantity,
    decreaseQuantity,

    // Addresses
    addresses,
    selectedAddress,
    showAddresses,
    loadingAddresses,
    addressError,
    handleChooseAddress,
    handleSelectAddress,
    handleRetryAddresses,

    // Order
    handlePlaceOrder,
    isPlacingOrder,
    idempotencyKey,
    handleCancelPendingAttempt,
  };
}
