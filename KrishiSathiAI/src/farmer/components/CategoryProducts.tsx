import React from 'react';

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

import type { ShopProduct } from '../services/shopService';

import useCategoryProduct, {
  formatPrice,
  formatQuantity,
} from '../hooks/useCategoryProduct';

const FOREST = '#14532D';
const LEAF = '#2E7D32';
const MUTED = '#5E7365';
const INK = '#1F2A24';
const BACKGROUND = '#F6FAF3';

// Space so content is not hidden behind the dashboard bottom nav.
const BOTTOM_NAV_SPACE = 130;

const cardShadow = {
  shadowColor: '#000',
  shadowOpacity: 0.07,
  shadowRadius: 5,
  shadowOffset: {
    width: 0,
    height: 2,
  },
  elevation: 3,
} as const;

type CategoryProductsProps = {
  category: {
    name: string;
    apiCategory: string;
  };
  onBack: () => void;
  onCheckout: (product: ShopProduct) => void;
};

function ProductCard({
  p,
  width,
  onBuyNow,
}: {
  p: ShopProduct;
  width: number;
  onBuyNow: (product: ShopProduct) => void;
}) {
  const [failed, setFailed] = React.useState(false);

  return (
    <View
      className="mb-4 rounded-3xl bg-white p-3"
      style={{
        width,
        ...cardShadow,
      }}
    >
      {/* Product image */}
      <View
        style={{
          width: '100%',
          height: 140,
          borderRadius: 18,
          overflow: 'hidden',
          backgroundColor: '#EEF5EA',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {p.imageUrl && !failed ? (
          <Image
            source={{ uri: p.imageUrl }}
            style={{
              width: '100%',
              height: '100%',
            }}
            resizeMode="cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <MaterialCommunityIcons
            name="package-variant"
            size={48}
            color={LEAF}
          />
        )}
      </View>

      {/* Product name */}
      <Text
        numberOfLines={2}
        className="mt-2 text-[15px] font-extrabold"
        style={{ color: INK }}
      >
        {p.name}
      </Text>

      {/* Brand */}
      {!!p.brand && (
        <Text
          numberOfLines={1}
          className="text-[13px] font-bold"
          style={{ color: LEAF }}
        >
          {p.brand}
        </Text>
      )}

      {/* Description */}
      {!!p.description && (
        <Text
          numberOfLines={2}
          className="mt-1 text-[13px]"
          style={{
            color: MUTED,
            lineHeight: 18,
            minHeight: 36,
          }}
        >
          {p.description}
        </Text>
      )}

      {/* Price and quantity */}
      <View className="mt-2 flex-row items-center justify-between">
        <Text
          numberOfLines={1}
          className="text-[17px] font-extrabold"
          style={{ color: FOREST }}
        >
          {formatPrice(p.price)}
        </Text>

        <View
          className="ml-1 rounded-full px-2 py-1"
          style={{ backgroundColor: '#EEF5EA' }}
        >
          <Text
            className="text-[11px] font-bold"
            style={{ color: FOREST }}
          >
            {formatQuantity(p.quantity, p.quantityUnit)}
          </Text>
        </View>
      </View>

      {/* Buy Now */}
      <TouchableOpacity
        onPress={() => onBuyNow(p)}
        accessibilityRole="button"
        accessibilityLabel={`Buy ${p.name} now`}
        activeOpacity={0.8}
        className="mt-3 items-center rounded-xl py-3"
        style={{ backgroundColor: FOREST }}
      >
        <Text className="text-sm font-extrabold text-white">
          Buy Now
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function CategoryProducts({
  category,
  onBack,
  onCheckout,
}: CategoryProductsProps) {
  const { width } = useWindowDimensions();

  const name = category.name;

  const {
    visible,
    loading,
    loadingMore,
    error,
    query,
    setQuery,
    clearQuery,
    load,
    loadMore,
    handleBuyNow,
  } = useCategoryProduct(category.apiCategory, onCheckout);

  const cardWidth = (width - 32 - 12) / 2;

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: BACKGROUND }}
    >
      {/* Header (top safe area is handled by the dashboard) */}
      <View className="flex-row items-center px-4 pb-3 pt-2">
        <TouchableOpacity
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="items-center justify-center"
          style={{
            width: 32,
            height: 32,
          }}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={26}
            color={INK}
          />
        </TouchableOpacity>

        <Text
          numberOfLines={1}
          className="ml-3 flex-1 text-[21px] font-extrabold"
          style={{ color: INK }}
        >
          {name}
        </Text>
      </View>

      {/* Search bar */}
      <View
        className="mx-4 mb-4 h-12 flex-row items-center rounded-full bg-white px-4"
        style={cardShadow}
      >
        <MaterialCommunityIcons
          name="magnify"
          size={22}
          color={MUTED}
        />

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={`Search in ${name}...`}
          placeholderTextColor={MUTED}
          className="ml-2 flex-1 text-[14px]"
          style={{ color: INK }}
          returnKeyType="search"
          autoCapitalize="none"
        />

        {query.length > 0 && (
          <TouchableOpacity
            onPress={clearQuery}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <MaterialCommunityIcons
              name="close-circle"
              size={19}
              color={MUTED}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Loading, error or product list */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={LEAF}
          style={{ marginTop: 40 }}
        />
      ) : error ? (
        <View className="items-center px-6 py-10">
          <MaterialCommunityIcons
            name="cloud-alert-outline"
            size={40}
            color={MUTED}
          />

          <Text
            className="mt-3 text-center text-[14px]"
            style={{ color: MUTED }}
          >
            {error}
          </Text>

          <TouchableOpacity
            onPress={load}
            className="mt-4 rounded-full px-6 py-3"
            style={{ backgroundColor: LEAF }}
          >
            <Text className="font-bold text-white">
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: 'space-between',
          }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 2,
            paddingBottom: BOTTOM_NAV_SPACE,
            flexGrow: 1,
          }}
          renderItem={({ item }) => (
            <ProductCard
              p={item}
              width={cardWidth}
              onBuyNow={handleBuyNow}
            />
          )}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center py-12">
              <MaterialCommunityIcons
                name="magnify-close"
                size={42}
                color={MUTED}
              />

              <Text
                className="mt-3 text-[14px]"
                style={{ color: MUTED }}
              >
                No products found.
              </Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                color={LEAF}
                style={{ marginVertical: 16 }}
              />
            ) : null
          }
        />
      )}
    </View>
  );
}