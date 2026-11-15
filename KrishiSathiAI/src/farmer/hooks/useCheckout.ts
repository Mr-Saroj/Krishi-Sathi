
import { useState, useRef } from 'react';
import { Alert } from 'react-native';
import * as Crypto from 'expo-crypto';
import RazorpayCheckout from 'react-native-razorpay';

import {
  getAddresses,
  type FarmerAddress,
} from '../services/farmerAddressService';

import {
  placeFarmerOrder,
  createFarmerPayment,
  verifyFarmerPayment,
  getFarmerPaymentStatus,
  type PlaceOrderRequest,
  type PlaceOrderResponse,
  type CreatePaymentResponse,
  type VerifyPaymentRequest,
  type PaymentStatusResponse,
} from '../services/farmerOrderService';

export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 99;

export const PLATFORM_FEE = 30;
export const DELIVERY_CHARGE = 50;

export type PaymentMethod = 'COD' | 'ONLINE';

// Stores the exact request and already-created business order.
// This prevents duplicate orders when online payment is retried.
type PendingOrderAttempt = {
  idempotencyKey: string;
  request: PlaceOrderRequest;
  order?: PlaceOrderResponse;
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

  const pendingOrderRef =
    useRef<PendingOrderAttempt | null>(null);

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
    const existingAttempt = pendingOrderRef.current;

    // Reuse the same order attempt if request is identical.
    if (
      existingAttempt &&
      JSON.stringify(existingAttempt.request) ===
        JSON.stringify(currentRequest)
    ) {
      return existingAttempt;
    }

    const newAttempt: PendingOrderAttempt = {
      idempotencyKey: Crypto.randomUUID(),
      request: currentRequest,
    };

    pendingOrderRef.current = newAttempt;

    setIdempotencyKey(newAttempt.idempotencyKey);

    return newAttempt;
  };

  // ==================== CREATE RAZORPAY ORDER ====================

  const createRazorpayOrder = async (
    orderId: string,
  ): Promise<CreatePaymentResponse> => {
    const response = await createFarmerPayment(orderId);

    return response.data;
  };

  // ==================== VERIFY RAZORPAY PAYMENT ====================

  const verifyRazorpayPayment = async (
    paymentData: VerifyPaymentRequest,
  ): Promise<PaymentStatusResponse> => {
    const response = await verifyFarmerPayment(paymentData);

    return response.data;
  };

  // ==================== CHECK PAYMENT STATUS ====================

  const checkPaymentStatus = async (
    orderId: string,
  ): Promise<PaymentStatusResponse> => {
    const response = await getFarmerPaymentStatus(orderId);

    return response.data;
  };

  // ==================== OPEN RAZORPAY CHECKOUT ====================

  const openRazorpayCheckout = async (
    order: PlaceOrderResponse,
  ): Promise<PlaceOrderResponse> => {

    // Step 1: Create or reuse Razorpay order from backend.
    const paymentOrder = await createRazorpayOrder(order.id);

    console.log('RAZORPAY ORDER:', paymentOrder);

    if (
      !paymentOrder.razorpayOrderId ||
      !paymentOrder.keyId ||
      !paymentOrder.amount
    ) {
      throw new Error('Invalid Razorpay order response.');
    }

    // Step 2: Open Razorpay checkout.
    const razorpayResponse = await RazorpayCheckout.open({
      key: paymentOrder.keyId,
      amount: String(paymentOrder.amount),
      currency: paymentOrder.currency,
      name: 'Krishi Sathi AI',
      description: 'Agricultural product order',
      order_id: paymentOrder.razorpayOrderId,
      theme: {
        color: '#14532D',
      },
    });

    console.log('RAZORPAY RESPONSE:', razorpayResponse);

    // Step 3: Send payment details to backend for verification.
    const verificationResponse = await verifyRazorpayPayment({
      razorpayOrderId: razorpayResponse.razorpay_order_id,
      razorpayPaymentId: razorpayResponse.razorpay_payment_id,
      razorpaySignature: razorpayResponse.razorpay_signature,
    });

    console.log(
      'PAYMENT VERIFICATION:',
      verificationResponse,
    );

    if (verificationResponse.paymentStatus !== 'CAPTURED') {
      throw new Error(
        verificationResponse.message ||
          'Payment could not be confirmed.',
      );
    }

    // Step 4: Return updated order for success navigation.
    return {
      ...order,
      paymentStatus: 'PAID',
    };
  };

  // ==================== PLACE ORDER ====================

  const handlePlaceOrder = async (
    paymentMethod: PaymentMethod,
  ) => {
    if (isPlacingOrder) {
      return;
    }

    // Validate product.
    if (!product || !productId) {
      Alert.alert(
        'Product Unavailable',
        'Product information is missing.',
      );
      return;
    }

    // Validate quantity.
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

    // Validate address.
    if (!selectedAddress?.addressId) {
      Alert.alert(
        'Delivery Address Required',
        'Please select a delivery address before placing your order.',
      );
      return;
    }

    // Validate price.
    if (unitPrice <= 0 || !Number.isFinite(unitPrice)) {
      Alert.alert(
        'Invalid Product Price',
        'Product price is not available.',
      );
      return;
    }

    try {
      setIsPlacingOrder(true);

      // Prepare business order request.
      const orderData: PlaceOrderRequest = {
        productId,
        quantity,
        addressId: selectedAddress.addressId,
        productTotal: subtotal,
        platformFee: PLATFORM_FEE,
        deliveryFee: DELIVERY_CHARGE,
        totalSumFee: totalAmount,
        paymentMode: paymentMethod,
      };

      // Create or reuse the same business order attempt.
      const attempt = getOrCreateOrderAttempt(orderData);

      console.log(
        'ORDER IDEMPOTENCY KEY:',
        attempt.idempotencyKey,
      );

      console.log('ORDER REQUEST:', attempt.request);

      let order = attempt.order;

      // Create business order only once.
      if (!order) {
        order = await placeFarmerOrder(
          attempt.request,
          attempt.idempotencyKey,
        );

        // Save it locally before starting online payment.
        attempt.order = order;
        pendingOrderRef.current = attempt;
      }

      console.log('BUSINESS ORDER:', order);

      // ==================== COD ====================

      if (paymentMethod === 'COD') {
        pendingOrderRef.current = null;
        setIdempotencyKey(null);

        // COD order is placed. Payment is collected at delivery.
        onOrderSuccess(order);
        return;
      }

      // ==================== ONLINE ====================

      const paidOrder = await openRazorpayCheckout(order);

      // Payment verified successfully.
      pendingOrderRef.current = null;
      setIdempotencyKey(null);

      onOrderSuccess(paidOrder);

    } catch (error: any) {
      console.error(
        'PLACE ORDER / PAYMENT ERROR:',
        error?.response?.data || error,
      );

      const backendMessage =
        error?.response?.data?.message ||
        (typeof error?.response?.data === 'string'
          ? error.response.data
          : null) ||
        error?.description ||
        error?.message ||
        'Something went wrong. Please try again.';

      // If online payment might have succeeded but the app
      // did not receive the verification response, check status.
      const pendingAttempt = pendingOrderRef.current;

      if (
        pendingAttempt?.order &&
        pendingAttempt.request.paymentMode === 'ONLINE'
      ) {
        try {
          const status = await checkPaymentStatus(
            pendingAttempt.order.id,
          );

          console.log('CURRENT PAYMENT STATUS:', status);

          if (status.paymentStatus === 'CAPTURED') {
            const paidOrder: PlaceOrderResponse = {
              ...pendingAttempt.order,
              paymentStatus: 'PAID',
            };

            pendingOrderRef.current = null;
            setIdempotencyKey(null);

            onOrderSuccess(paidOrder);
            return;
          }
        } catch (statusError) {
          console.error(
            'PAYMENT STATUS CHECK ERROR:',
            statusError,
          );
        }
      }

      Alert.alert(
        'Payment / Order Not Confirmed',
        `${backendMessage}\n\nYour order attempt is retained. You can retry without creating another business order.`,
      );

      // Keep pending attempt for retry.
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
      'The local retry reference has been cleared. This does not cancel an order or payment already created on the server.',
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
