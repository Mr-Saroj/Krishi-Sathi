
import { api } from "../../services/api";

export type ShopProduct = {
  id: string;
  category: string;
  name: string;
  brand: string;
  description: string;
  quantity: number;
  quantityUnit: string; // raw backend value, e.g. GRAM
  price: number;
  imageUrl?: string;
};

const mapProduct = (p: any): ShopProduct => ({
  id: String(p.id),
  category: p.category ?? '',
  name: p.name ?? 'Unnamed product',
  brand: p.brand ?? '',
  description: p.description ?? '',
  quantity: Number(p.quantity ?? 0),
  quantityUnit: p.quantityUnit ?? '',
  price: Number(p.price ?? 0),
  imageUrl: p.imageUrl || undefined,
});

export async function fetchProductsByCategory(category: string, page = 0, size = 20) {
  const res = await api.get('/farmer/shop/products', {
    params: { category, page, size },
  });

  const data = res.data;
  return {
    items: (data?.content ?? []).map(mapProduct) as ShopProduct[],
    last: !!data?.last,
  };
}