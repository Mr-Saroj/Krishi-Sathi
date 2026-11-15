
import { api } from "../../services/api";

import type {
  PendingAssignmentResponse,
  AssignmentActionResponse,
} from "../types/deliveryAssignment.types";

export type VerifyPickupOtpResponse = {
  success: boolean;
  message: string;
  orderId: string;
  orderStatus: string;
};
export type CompleteDeliveryResponse = {
  success: boolean;
  message: string;
  orderId: string;
  orderStatus: string;
};

export const deliveryAssignmentService = {
  // Get pending assignments
  async getPendingAssignments(): Promise<PendingAssignmentResponse[]> {
    const response = await api.get(
      "/farmer/delivery-boy/assignments/pending"
    );

    return response.data;
  },

  // Accept an assigned order
  async acceptAssignment(
    orderId: string
  ): Promise<AssignmentActionResponse> {
    const response = await api.put(
      `/farmer/delivery-boy/assignments/${orderId}/accept`
    );

    return response.data;
  },

  // Reject an assigned order
  async rejectAssignment(
    orderId: string
  ): Promise<AssignmentActionResponse> {
    const response = await api.put(
      `/farmer/delivery-boy/assignments/${orderId}/reject`
    );

    return response.data;
  },

  // Verify pickup OTP provided by the shop
  async verifyPickupOtp(
    orderId: string,
    otp: string
  ): Promise<VerifyPickupOtpResponse> {
    const response = await api.post(
      `/farmer/delivery-boy/assignments/${orderId}/verify-pickup-otp`,
      { otp }
    );

    return response.data;
  },
  // Complete delivery
  async completeDelivery(
    orderId: string
  ): Promise<CompleteDeliveryResponse> {
    const response = await api.post(
      `/farmer/delivery-boy/orders/${orderId}/complete`
    );

    return response.data;
  },
};
