import api from "../../../services/api";

export const getSellerPendingSettlements = async () => {
  const response = await api.get(
    "/seller/products/settlements/pending"
  );

  return response.data;
};