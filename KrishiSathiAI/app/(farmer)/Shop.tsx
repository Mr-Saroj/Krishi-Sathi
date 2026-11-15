import React, { useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';

import CategoryProducts from '../../src/farmer/components/CategoryProducts';
import Checkout from '../../src/farmer/components/Checkout';
import OrderSuccess from '../../src/farmer/components/OrderSuccess';

import type { PlaceOrderResponse } from '../../src/farmer/services/farmerOrderService';
import DeliveryBoyForm from '../../src/farmer/components/DeliveryBoyForm';

type IconName = React.ComponentProps<
  typeof MaterialCommunityIcons
>['name'];

// ==================== THEME ====================

const FOREST = '#14532D';
const LEAF = '#2E7D32';
const AMBER = '#F5A623';
const MUTED = '#5E7365';
const INK = '#1F2A24';
const PAGE_BG = '#F3F6EF';
const MINT = '#DDF0DD';

const SIDE = 16;

type Category = {
  id: string;
  name: string;
  apiCategory: string;
  icon: IconName;
  image?: ImageSourcePropType;
};

const CATEGORIES: Category[] = [
  {
    id: 'seeds',
    name: 'Seeds',
    apiCategory: 'SEEDS',
    icon: 'seed-outline',
    image: require('../../assets/Images/seeds.avif'),
  },
  {
    id: 'tools',
    name: 'Farming Tools',
    apiCategory: 'TOOLS',
    icon: 'hammer-wrench',
    image: require('../../assets/Images/tools.avif'),
  },
  {
    id: 'machinery',
    name: 'Farm Machinery & Equipment',
    apiCategory: 'MACHINERY',
    icon: 'tractor',
    image: require('../../assets/Images/machinery.avif'),
  },
  {
    id: 'fertilizer',
    name: 'Fertilizers',
    apiCategory: 'FERTILIZERS',
    icon: 'bag-personal-outline',
    image: require('../../assets/Images/fertilizer.avif'),
  },
  {
    id: 'pesticide',
    name: 'Pesticides',
    apiCategory: 'PESTICIDES',
    icon: 'spray',
    image: require('../../assets/Images/pesticide.jpg'),
  },
  {
    id: 'irrigation',
    name: 'Irrigation',
    apiCategory: 'IRRIGATION',
    icon: 'water-pump',
    image: require('../../assets/Images/irrigation.avif'),
  },
  {
    id: 'feed',
    name: 'Animal Feed',
    apiCategory: 'ANIMAL_FEED',
    icon: 'cow',
    image: require('../../assets/Images/feed.avif'),
  },
];

// ==================== ADVERTISEMENT DATA ====================

const BANNER_SEEDS = require('../../assets/Images/Trending1.png');

const BANNER_RATIO = 3584 / 1184;

type BannerItem = {
  id: string;
  source: ImageSourcePropType;
  label: string;
  categoryId?: string; // tapping the ad opens this category
};

const TRENDING_BANNERS: BannerItem[] = [
  { id: 't1', source: BANNER_SEEDS, label: 'Capsicum seeds', categoryId: 'seeds' },
  { id: 't2', source: BANNER_SEEDS, label: 'Vegetable seeds', categoryId: 'seeds' },
  { id: 't3', source: BANNER_SEEDS, label: 'Hybrid seeds', categoryId: 'seeds' },
];

const PROMO_VIDEO = require('../../assets/Vedios/Promotion2.mp4');

const PROMO_HEIGHT = 190;

// Placeholder offer text: replace with your real campaigns.
type OfferTile = {
  id: string;
  title: string;
  sub: string;
  icon: IconName;
  bg: string;
  fg: string;
  categoryId: string;
};

const OFFER_TILES: OfferTile[] = [
  {
    id: 'o1',
    title: 'Seed season offers',
    sub: 'Sow now, save more',
    icon: 'seed-outline',
    bg: FOREST,
    fg: '#FFFFFF',
    categoryId: 'seeds',
  },
  {
    id: 'o2',
    title: 'Fertilizer deals',
    sub: 'Better yield, better price',
    icon: 'bag-personal-outline',
    bg: AMBER,
    fg: INK,
    categoryId: 'fertilizer',
  },
  {
    id: 'o3',
    title: 'Irrigation savings',
    sub: 'Drip kits for every acre',
    icon: 'water-pump',
    bg: '#1E6F8C',
    fg: '#FFFFFF',
    categoryId: 'irrigation',
  },
  {
    id: 'o4',
    title: 'Machinery offers',
    sub: 'Tillers, sprayers and more',
    icon: 'tractor',
    bg: '#6D4C2F',
    fg: '#FFFFFF',
    categoryId: 'machinery',
  },
];

const TRUST_ITEMS: { icon: IconName; title: string; sub: string }[] = [
  { icon: 'shield-check-outline', title: 'Genuine', sub: 'Quality checked' },
  { icon: 'tag-outline', title: 'Fair prices', sub: 'Direct from sellers' },
  { icon: 'truck-fast-outline', title: 'Delivery', sub: 'To your village' },
];

const cardShadow = {
  shadowColor: '#0B2A14',
  shadowOpacity: 0.08,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 3 },
  elevation: 3,
} as const;

// ==================== SECTION TITLE ====================

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View className="mb-3 mt-7" style={{ paddingHorizontal: SIDE }}>
      <Text className="text-[19px] font-extrabold" style={{ color: INK }}>
        {title}
      </Text>
      {subtitle ? (
        <Text className="mt-0.5 text-[12px]" style={{ color: MUTED }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

// ==================== CATEGORY ITEM ====================

function CategoryItem({
  c,
  onPress,
}: {
  c: Category;
  onPress: () => void;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="mr-3 items-center"
      style={{ width: 84 }}
      accessibilityRole="button"
      accessibilityLabel={c.name}
    >
      <View
        className="h-[76px] w-[76px] items-center justify-center overflow-hidden rounded-[26px]"
        style={{
          backgroundColor: MINT,
          borderWidth: 2,
          borderColor: '#FFFFFF',
          ...cardShadow,
        }}
      >
        {c.image && !failed ? (
          <Image
            source={c.image}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <MaterialCommunityIcons name={c.icon} size={32} color={LEAF} />
        )}
      </View>

      <Text
        numberOfLines={2}
        className="mt-2 text-center text-[11.5px] font-bold leading-[14px]"
        style={{ color: INK }}
      >
        {c.name}
      </Text>
    </TouchableOpacity>
  );
}

// ==================== TRUST STRIP ====================

function TrustStrip() {
  return (
    <View
      className="flex-row rounded-2xl bg-white py-3"
      style={{ marginHorizontal: SIDE, ...cardShadow }}
    >
      {TRUST_ITEMS.map((t, i) => (
        <View
          key={t.title}
          className="flex-1 flex-row items-center justify-center px-2"
          style={{
            borderLeftWidth: i === 0 ? 0 : 1,
            borderLeftColor: '#E3EBDF',
          }}
        >
          <MaterialCommunityIcons name={t.icon} size={22} color={LEAF} />
          <View className="ml-1.5">
            <Text className="text-[12px] font-extrabold" style={{ color: INK }}>
              {t.title}
            </Text>
            <Text className="text-[10px]" style={{ color: MUTED }}>
              {t.sub}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ==================== PROMO VIDEO ====================

function PromoVideo({ width }: { width: number }) {
  const player = useVideoPlayer(PROMO_VIDEO, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <View
      className="overflow-hidden rounded-3xl bg-[#EEF5EA]"
      style={{
        width,
        height: PROMO_HEIGHT,
        marginHorizontal: SIDE,
        ...cardShadow,
      }}
    >
      <VideoView
        player={player}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        nativeControls={false}
        allowsPictureInPicture={false}
      />

      <View
        className="absolute left-3 top-3 flex-row items-center rounded-full px-2.5 py-1"
        style={{ backgroundColor: AMBER }}
      >
        <MaterialCommunityIcons name="sale" size={14} color={INK} />
        <Text className="ml-1 text-[11px] font-extrabold" style={{ color: INK }}>
          Offers
        </Text>
      </View>
    </View>
  );
}

// ==================== OFFER TILES ====================

function OfferTiles({
  tiles,
  onPress,
}: {
  tiles: OfferTile[];
  onPress: (categoryId: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: SIDE, paddingBottom: 4 }}
    >
      {tiles.map((t) => (
        <TouchableOpacity
          key={t.id}
          activeOpacity={0.9}
          onPress={() => onPress(t.categoryId)}
          className="mr-3 overflow-hidden rounded-3xl p-4"
          style={{
            width: 210,
            height: 124,
            backgroundColor: t.bg,
            ...cardShadow,
          }}
          accessibilityRole="button"
          accessibilityLabel={`${t.title}. ${t.sub}`}
        >
          <MaterialCommunityIcons
            name={t.icon}
            size={92}
            color={t.fg}
            style={{ position: 'absolute', right: -12, bottom: -14, opacity: 0.16 }}
          />

          <Text
            numberOfLines={2}
            className="text-[17px] font-extrabold leading-[21px]"
            style={{ color: t.fg }}
          >
            {t.title}
          </Text>
          <Text
            className="mt-1 text-[12px]"
            style={{ color: t.fg, opacity: 0.85 }}
          >
            {t.sub}
          </Text>

          <View
            className="mt-auto flex-row items-center self-start rounded-full px-3 py-1"
            style={{ backgroundColor: 'rgba(255,255,255,0.22)' }}
          >
            <Text className="text-[12px] font-bold" style={{ color: t.fg }}>
              View offers
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={14} color={t.fg} />
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// ==================== BANNER SLIDER ====================

function BannerSlider({
  items,
  width,
  onPressItem,
  heightScale = 1,
  resizeMode = 'contain',
}: {
  items: BannerItem[];
  width: number;
  onPressItem?: (b: BannerItem) => void;
  heightScale?: number;
  resizeMode?: 'contain' | 'cover';
}) {
  const [index, setIndex] = useState(0);

  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / (width + 12)));
  };

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={width + 12}
        snapToAlignment="start"
        decelerationRate="fast"
        onMomentumScrollEnd={onEnd}
        contentContainerStyle={{ paddingHorizontal: SIDE }}
      >
        {items.map((b) => {
          const meta = Image.resolveAssetSource(b.source);

          const ratio =
            meta?.width && meta?.height
              ? meta.width / meta.height
              : BANNER_RATIO;

          const height = Math.round((width / ratio) * heightScale);

          return (
            <TouchableOpacity
              key={b.id}
              activeOpacity={0.9}
              onPress={() => onPressItem?.(b)}
              className="mr-3 overflow-hidden rounded-3xl"
              style={{ width, height, ...cardShadow }}
              accessibilityRole="button"
              accessibilityLabel={b.label}
            >
              <Image
                source={b.source}
                style={{ width: '100%', height: '100%' }}
                resizeMode={resizeMode}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View className="mt-3 flex-row items-center justify-center">
        {items.map((b, i) => (
          <View
            key={b.id}
            className="mx-1 rounded-full"
            style={{
              height: 6,
              width: i === index ? 20 : 6,
              backgroundColor: i === index ? LEAF : '#C5D6C3',
            }}
          />
        ))}
      </View>
    </View>
  );
}

// ==================== JOIN DELIVERY BOY CARD ====================

function JoinDeliveryCard({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="mt-7 flex-row items-center overflow-hidden rounded-3xl p-4"
      style={{ backgroundColor: FOREST, marginHorizontal: SIDE, ...cardShadow }}
      accessibilityRole="button"
      accessibilityLabel="Join as a delivery boy"
    >
      <View
        className="absolute -right-8 -top-8 h-28 w-28 rounded-full"
        style={{ backgroundColor: LEAF, opacity: 0.35 }}
      />
      <View
        className="absolute -bottom-10 right-16 h-20 w-20 rounded-full"
        style={{ backgroundColor: AMBER, opacity: 0.18 }}
      />

      <View
        className="h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: AMBER }}
      >
        <MaterialCommunityIcons name="moped" size={30} color={INK} />
      </View>

      <View className="ml-3 flex-1">
        <Text className="text-[16px] font-extrabold text-white">
          Join as a Delivery Boy
        </Text>
        <Text className="mt-0.5 text-[12px]" style={{ color: '#CFE8D2' }}>
          Earn by delivering farm products near you
        </Text>
      </View>

      <View
        className="h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: 'rgba(255,255,255,0.16)' }}
      >
        <MaterialCommunityIcons name="chevron-right" size={24} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
}

// ==================== MAIN SHOP ====================

export default function Shop() {
  const { width } = useWindowDimensions();

  const [query, setQuery] = useState('');

  const [currentScreen, setCurrentScreen] = useState<
    'shop' | 'category' | 'checkout' | 'success' | 'deliveryForm'
  >('shop');

  const [checkoutReturnScreen, setCheckoutReturnScreen] =
    useState<'shop' | 'category'>('shop');

  const [selectedCategory, setSelectedCategory] = useState({
    name: '',
    apiCategory: '',
  });

  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Stores the response returned by the backend after placing an order.
  const [placedOrder, setPlacedOrder] =
    useState<PlaceOrderResponse | null>(null);

  const bannerWidth = width - SIDE * 2;

  // Search now looks through categories (products live inside each category).
  const q = query.trim().toLowerCase();
  const visibleCategories = CATEGORIES.filter(
    (c) => !q || c.name.toLowerCase().includes(q),
  );

  // ==================== NAVIGATION FUNCTIONS ====================

  const openCategory = (c: Category) => {
    setSelectedCategory({
      name: c.name,
      apiCategory: c.apiCategory,
    });

    setCurrentScreen('category');
  };

  const openCategoryById = (id?: string) => {
    const c = CATEGORIES.find((x) => x.id === id);
    if (c) openCategory(c);
  };

  const openCheckout = (product: any) => {
    setCheckoutReturnScreen(
      currentScreen === 'category' ? 'category' : 'shop',
    );

    setSelectedProduct(product);
    setCurrentScreen('checkout');
  };

  const handleOrderSuccess = (order: PlaceOrderResponse) => {
    console.log('ORDER PLACED SUCCESSFULLY:', order);

    setPlacedOrder(order);
    setCurrentScreen('success');
  };

  const handleContinueShopping = () => {
    setPlacedOrder(null);
    setSelectedProduct(null);

    setSelectedCategory({
      name: '',
      apiCategory: '',
    });

    setCurrentScreen('shop');
  };

  // ==================== CATEGORY SCREEN ====================

  if (currentScreen === 'category') {
    return (
      <CategoryProducts
        category={selectedCategory}
        onBack={() => setCurrentScreen('shop')}
        onCheckout={openCheckout}
      />
    );
  }

  // ==================== CHECKOUT SCREEN ====================

  if (currentScreen === 'checkout') {
    return (
      <Checkout
        product={selectedProduct}
        onBack={() => setCurrentScreen(checkoutReturnScreen)}
        onOrderSuccess={handleOrderSuccess}
      />
    );
  }

  // ==================== ORDER SUCCESS SCREEN ====================

  if (currentScreen === 'success' && placedOrder) {
    return (
      <OrderSuccess
        order={placedOrder}
        onContinueShopping={handleContinueShopping}
      />
    );
  }

  // ==================== DELIVERY BOY FORM SCREEN ====================

  if (currentScreen === 'deliveryForm') {
    return <DeliveryBoyForm onBack={() => setCurrentScreen('shop')} />;
  }

  // ==================== SHOP HOME SCREEN (ADS ONLY) ====================

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: PAGE_BG }}
      contentContainerStyle={{ paddingBottom: 130 }}
    >
      {/* Hero header */}
      <View
        style={{
          backgroundColor: FOREST,
          paddingHorizontal: SIDE,
          paddingTop: 16,
          paddingBottom: 40,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          overflow: 'hidden',
        }}
      >
        <View
          className="absolute -right-10 -top-12 h-40 w-40 rounded-full"
          style={{ backgroundColor: LEAF, opacity: 0.4 }}
        />
        <View
          className="absolute -left-12 bottom-0 h-24 w-24 rounded-full"
          style={{ backgroundColor: AMBER, opacity: 0.14 }}
        />

        <View className="flex-row items-center">
          <View className="flex-1">
            <Text className="text-[13px]" style={{ color: '#CFE8D2' }}>
              Namaste, farmer
            </Text>
            <Text className="mt-0.5 text-[22px] font-extrabold text-white">
              Everything your farm needs
            </Text>
          </View>

          <View
            className="h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.14)' }}
          >
            <MaterialCommunityIcons name="storefront-outline" size={26} color="#FFFFFF" />
          </View>
        </View>
      </View>

      {/* Search bar overlaps the header */}
      <View
        className="h-[52px] flex-row items-center rounded-full bg-white px-4"
        style={{ marginHorizontal: SIDE, marginTop: -26, ...cardShadow }}
      >
        <MaterialCommunityIcons name="magnify" size={22} color={LEAF} />

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search categories: seeds, tools, feed..."
          placeholderTextColor={MUTED}
          returnKeyType="search"
          className="ml-2 flex-1 text-[14px]"
          style={{ color: INK }}
          accessibilityLabel="Search categories"
        />

        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => setQuery('')}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <MaterialCommunityIcons
              name="close-circle"
              size={18}
              color={MUTED}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Trust strip (Genuine / Fair prices / Delivery) */}
      <View className="mt-4">
        <TrustStrip />
      </View>

      {/* Categories (navigation to the product screens) */}
      <SectionTitle title="Shop by category" />

      {visibleCategories.length === 0 ? (
        <View className="items-center px-6 py-6">
          <MaterialCommunityIcons name="magnify-close" size={36} color={MUTED} />
          <Text
            className="mt-2 text-center text-[14px]"
            style={{ color: MUTED }}
          >
            No category matches “{query}”. Try seeds, tools or feed.
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: SIDE }}
        >
          {visibleCategories.map((c) => (
            <CategoryItem key={c.id} c={c} onPress={() => openCategory(c)} />
          ))}
        </ScrollView>
      )}

      {/* Advertisements: hidden while searching so results stay in focus */}
      {!q && (
        <>
          {/* Offers & Promotions video */}
          <SectionTitle title="Offers & Promotions" />
          <PromoVideo width={bannerWidth} />

          {/* Offer tiles */}
          <SectionTitle
            title="Special offers"
            subtitle="Tap an offer to see what is on sale"
          />
          <OfferTiles tiles={OFFER_TILES} onPress={openCategoryById} />

          {/* Trending banners */}
          <SectionTitle title="Trending now" />
          <BannerSlider
            items={TRENDING_BANNERS}
            width={bannerWidth}
            onPressItem={(b) => openCategoryById(b.categoryId)}
          />

          {/* Join as delivery boy */}
          <JoinDeliveryCard onPress={() => setCurrentScreen('deliveryForm')} />
        </>
      )}
    </ScrollView>
  );
}