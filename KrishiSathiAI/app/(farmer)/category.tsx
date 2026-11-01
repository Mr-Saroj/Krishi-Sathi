import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ShopProduct ,fetchProductsByCategory} from '../../src/farmer/services/shopService';


const FOREST = '#14532D';
const LEAF = '#2E7D32';
const AMBER = '#F5A623';
const MUTED = '#5E7365';
const INK = '#1F2A24';

const formatPrice = (n: number) => `₹${n.toLocaleString('en-IN')}`;

// Backend unit -> short label. Add more if your enum has other values.
const UNIT_LABELS: Record<string, string> = {
  GRAM: 'g',
  KILOGRAM: 'kg',
  KG: 'kg',
  MILLILITER: 'ml',
  LITER: 'L',
  LITRE: 'L',
  PIECE: 'pc',
  PACKET: 'pkt',
};

const formatQuantity = (qty: number, unit: string) => {
  const label = UNIT_LABELS[unit?.toUpperCase()] ?? unit?.toLowerCase() ?? '';
  return `${qty} ${label}`.trim();
};

const cardShadow = {
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
} as const;

function ProductCard({ p, width }: { p: ShopProduct; width: number }) {
  const [failed, setFailed] = useState(false);

  return (
    <View className="mb-4 rounded-3xl bg-white p-3" style={{ width, ...cardShadow }}>
      <View className="h-28 items-center justify-center overflow-hidden rounded-2xl bg-[#EEF5EA]">
        {p.imageUrl && !failed ? (
          <Image
            source={{ uri: p.imageUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <MaterialCommunityIcons name="package-variant" size={44} color={LEAF} />
        )}
      </View>

      <Text numberOfLines={2} className="mt-2 text-[14px] font-extrabold" style={{ color: INK }}>
        {p.name}
      </Text>

      {!!p.brand && (
        <Text numberOfLines={1} className="text-[12px] font-bold" style={{ color: LEAF }}>
          {p.brand}
        </Text>
      )}

      {!!p.description && (
        <Text numberOfLines={2} className="mt-1 text-[12px]" style={{ color: MUTED }}>
          {p.description}
        </Text>
      )}

      <View className="mt-2 flex-row items-center justify-between">
        <Text className="text-[16px] font-extrabold" style={{ color: FOREST }}>
          {formatPrice(p.price)}
        </Text>
        <View className="rounded-full px-2 py-1" style={{ backgroundColor: '#EEF5EA' }}>
          <Text className="text-[11px] font-bold" style={{ color: FOREST }}>
            {formatQuantity(p.quantity, p.quantityUnit)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        className="mt-2 items-center rounded-full py-2.5"
        style={{ backgroundColor: AMBER }}
        accessibilityRole="button"
        accessibilityLabel={`Buy ${p.name} now`}
        onPress={() => {
          // TODO: add to cart / go to checkout
        }}
      >
        <Text className="text-[13px] font-extrabold" style={{ color: INK }}>
          Buy Now
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function CategoryProducts() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { name, apiCategory } = useLocalSearchParams<{ name: string; apiCategory: string }>();

  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const cardWidth = (width - 32 - 12) / 2;

  const load = useCallback(async () => {
    if (!apiCategory) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetchProductsByCategory(apiCategory, 0, 20);
      setProducts(res.items);
      setLast(res.last);
      setPage(0);
    } catch {
      setError('Could not load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [apiCategory]);

  useEffect(() => {
    load();
  }, [load]);

  const loadMore = async () => {
    if (loadingMore || loading || last || !apiCategory) return;
    try {
      setLoadingMore(true);
      const next = page + 1;
      const res = await fetchProductsByCategory(apiCategory, next, 20);
      setProducts((prev) => [...prev, ...res.items]);
      setLast(res.last);
      setPage(next);
    } catch {
      // keep existing items
    } finally {
      setLoadingMore(false);
    }
  };

  const q = query.trim().toLowerCase();
  const visible = products.filter(
    (p) =>
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q),
  );

  return (
    <View className="flex-1" style={{ backgroundColor: '#F6FAF3' }}>
      {/* Header */}
      <View className="flex-row items-center px-4 pb-2 pt-12">
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <MaterialCommunityIcons name="arrow-left" size={26} color={INK} />
        </TouchableOpacity>
        <Text className="ml-3 text-[20px] font-extrabold" style={{ color: INK }}>
          {name}
        </Text>
      </View>

      {/* Search */}
      <View
        className="mx-4 mb-3 h-12 flex-row items-center rounded-full bg-white px-4"
        style={cardShadow}
      >
        <MaterialCommunityIcons name="magnify" size={22} color={MUTED} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={`Search in ${name}...`}
          placeholderTextColor={MUTED}
          className="ml-2 flex-1 text-[14px]"
          style={{ color: INK }}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <MaterialCommunityIcons name="close-circle" size={18} color={MUTED} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={LEAF} style={{ marginTop: 40 }} />
      ) : error ? (
        <View className="items-center px-6 py-10">
          <Text className="text-center text-[14px]" style={{ color: MUTED }}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={load}
            className="mt-3 rounded-full px-5 py-2"
            style={{ backgroundColor: LEAF }}
          >
            <Text className="font-bold text-white">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(p) => p.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          renderItem={({ item }) => <ProductCard p={item} width={cardWidth} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center py-10">
              <MaterialCommunityIcons name="magnify-close" size={36} color={MUTED} />
              <Text className="mt-2 text-[14px]" style={{ color: MUTED }}>
                No products found.
              </Text>
            </View>
          }
          ListFooterComponent={loadingMore ? <ActivityIndicator color={LEAF} /> : null}
        />
      )}
    </View>
  );
}