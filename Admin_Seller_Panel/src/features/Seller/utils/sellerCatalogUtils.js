export const categories = [
  {
    id: "seeds",
    apiValue: "SEEDS",
    name: "Seeds",
    icon: "grass",
    description: "Crop and vegetable seeds",
  },
  {
    id: "fertilizers",
    apiValue: "FERTILIZERS",
    name: "Fertilizers",
    icon: "compost",
    description: "Organic and chemical fertilizers",
  },
  {
    id: "pesticides",
    apiValue: "PESTICIDES",
    name: "Pesticides",
    icon: "pest_control",
    description: "Crop protection products",
  },
  {
    id: "tools",
    apiValue: "TOOLS",
    name: "Agricultural Tools",
    icon: "agriculture",
    description: "Farming equipment and tools",
  },
  {
    id: "irrigation",
    apiValue: "IRRIGATION",
    name: "Irrigation",
    icon: "water_drop",
    description: "Watering and irrigation systems",
  },
];

export const getApiCategory = (categoryId) =>
  categories.find((item) => item.id === categoryId)?.apiValue ?? null;

export const formatPrice = (price) => {
  const amount = Number(price);

  if (price === null || price === undefined || !Number.isFinite(amount)) {
    return "Price unavailable";
  }

  return `₹${amount.toLocaleString("en-IN")}`;
};