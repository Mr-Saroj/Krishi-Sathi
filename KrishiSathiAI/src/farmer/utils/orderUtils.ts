
export const formatPrice = (amount: number): string => {
  return `₹${(amount || 0).toLocaleString("en-IN")}`;
};

export const formatOrderDate = (date: string): string => {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) return "Invalid date";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const getOrderStatusLabel = (status: string): string => {
  if (!status) return "Unknown";

  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const getOrderStatusColor = (status: string): string => {
  switch (status?.toUpperCase()) {
    case "DELIVERED":
      return "#15803D";

    case "PLACED":
    case "PENDING":
      return "#D97706";

    case "CONFIRMED":
    case "PROCESSING":
      return "#2563EB";

    case "SHIPPED":
    case "OUT_FOR_DELIVERY":
      return "#7C3AED";

    case "CANCELLED":
    case "REJECTED":
      return "#DC2626";

    default:
      return "#64748B";
  }
};
