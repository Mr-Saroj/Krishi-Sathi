export const formatPrice = (price) => {
  if (price == null || Number.isNaN(Number(price))) {
    return "₹0.00";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(price));
};

export const formatDate = (dateValue) => {
  if (!dateValue) return "Not available";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getOrderStatusColor = (status) => {
  switch (String(status || "").toUpperCase()) {
    case "CONFIRMED":
      return "#2563EB";

    case "PLACED":
      return "#D97706";

    case "PROCESSING":
    case "IN_PROGRESS":
      return "#7C3AED";

    case "COMPLETED":
    case "DELIVERED":
      return "#15803D";

    case "CANCELLED":
    case "REJECTED":
      return "#DC2626";

    default:
      return "#64748B";
  }
};

export const getOrderStatusLabel = (status) => {
  if (!status) return "Unknown";

  return String(status)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export const getPaymentStatusColor = (status) => {
  switch (String(status || "").toUpperCase()) {
    case "PAID":
      return "#15803D";

    case "PENDING":
      return "#D97706";

    case "FAILED":
    case "REFUNDED":
      return "#DC2626";

    default:
      return "#64748B";
  }
};