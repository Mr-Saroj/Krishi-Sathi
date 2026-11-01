import React, { useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useRouter } from 'expo-router';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const FOREST = '#14532D';
const LEAF = '#2E7D32';
const AMBER = '#F5A623';
const MUTED = '#5E7365';
const INK = '#1F2A24';

type Category = {
  id: string;
  name: string;
  apiCategory: string; // must match the backend enum value exactly (e.g. SEEDS)
  icon: IconName;
  image?: ImageSourcePropType;
};

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  icon: IconName;
  image?: string; // paste an image URL here (https://...)
};

// NOTE: check each apiCategory against your Spring enum values
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

// Trending banners. You can also use remote banners: { uri: 'https://...' }
const BANNER_SEEDS = require('../../assets/Images/Trending1.png');
const BANNER_RATIO = 3584 / 1184; // fallback width / height (Trending1.png)

type BannerItem = { id: string; source: ImageSourcePropType; label: string };

const TRENDING_BANNERS: BannerItem[] = [
  { id: 't1', source: BANNER_SEEDS, label: 'Capsicum seeds' },
  { id: 't2', source: BANNER_SEEDS, label: 'Vegetable seeds' },
  { id: 't3', source: BANNER_SEEDS, label: 'Hybrid seeds' },
];

// Offers & Promotions video
const PROMO_VIDEO = require('../../assets/Vedios/Promotion2.mp4');
const PROMO_HEIGHT = 170; // change this number to make the video box taller or shorter

const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Swarna Paddy Seeds', category: 'Seeds', price: 450, unit: '5 kg', icon: 'grain' },
  { id: 'p2', name: 'Hybrid Cotton Seeds', category: 'Seeds', price: 820, unit: '450 g', icon: 'flower-outline' },
  { id: 'p3', name: 'Urea Fertilizer', category: 'Fertilizers', price: 266, unit: '45 kg', icon: 'bag-personal-outline' },
  { id: 'p4', name: 'DAP Fertilizer', category: 'Fertilizers', price: 1350, unit: '50 kg', icon: 'bag-personal-outline' },
  { id: 'p5', name: 'Hand Sprayer 16L', category: 'Farming Tools', price: 1199, unit: '1 pc', icon: 'spray' },
  { id: 'p6', name: 'Garden Sickle', category: 'Farming Tools', price: 180, unit: '1 pc', icon: 'content-cut' },
  { id: 'p7', name: 'Drip Irrigation Kit', category: 'Irrigation', price: 2499, unit: '1 acre', icon: 'water-pump' },
  { id: 'p8', name: 'Mini Power Tiller', category: 'Machinery', price: 32500, unit: '1 pc', icon: 'tractor' },
  { id: 'p9', name: 'Neem Oil Pesticide', category: 'Pesticides', price: 340, unit: '1 L', icon: 'bottle-tonic-outline' },
  { id: 'p10', name: 'Cattle Feed Mix', category: 'Animal Feed', price: 720, unit: '25 kg', icon: 'cow' },
];

const formatPrice = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const cardShadow = {
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
} as const;

function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <View className="mb-3 mt-6 flex-row items-center justify-between">
      <Text className="text-[18px] font-extrabold" style={{ color: INK }}>
        {title}
      </Text>
      {action ? (
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${action} ${title}`}>
          <Text className="text-[13px] font-bold" style={{ color: FOREST }}>
            {action}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function CategoryItem({
  c,
  active,
  onPress,
}: {
  c: Category;
  active: boolean;
  onPress: () => void;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="mr-3 items-center"
      style={{ width: 92 }}
      accessibilityRole="button"
      accessibilityLabel={c.name}
      accessibilityState={{ selected: active }}
    >
      <View
        className="h-20 w-20 items-center justify-center overflow-hidden rounded-full"
        style={{
          backgroundColor: active ? LEAF : '#DDF0DD',
          borderWidth: active ? 3 : 0,
          borderColor: LEAF,
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
          <MaterialCommunityIcons name={c.icon} size={34} color={active ? '#FFFFFF' : LEAF} />
        )}
      </View>
      <Text
        numberOfLines={2}
        className="mt-2 text-center text-[12px] font-bold"
        style={{ color: active ? FOREST : INK }}
      >
        {c.name}
      </Text>
    </TouchableOpacity>
  );
}

function BannerSlider({
  items,
  width,
  heightScale = 1,
  resizeMode = 'contain',
}: {
  items: BannerItem[];
  width: number;
  heightScale?: number; // 1 = normal, 0.85 = 15% shorter
  resizeMode?: 'contain' | 'cover';
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={width + 12}
      snapToAlignment="start"
      decelerationRate="fast"
    >
      {items.map((b) => {
        // Use each image's own shape so nothing is cropped
        const meta = Image.resolveAssetSource(b.source);
        const ratio = meta?.width && meta?.height ? meta.width / meta.height : BANNER_RATIO;
        const height = Math.round((width / ratio) * heightScale);

        return (
          <TouchableOpacity
            key={b.id}
            activeOpacity={0.9}
            className="mr-3 overflow-hidden rounded-3xl"
            style={{ width, height }}
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
  );
}

function PromoVideo({ width }: { width: number }) {
  const player = useVideoPlayer(PROMO_VIDEO, (p) => {
    p.loop = true; // repeat forever
    p.muted = true; // no sound
    p.play(); // start automatically
  });

  return (
    <View
      className="overflow-hidden rounded-3xl bg-[#EEF5EA]"
      style={{ width, height: PROMO_HEIGHT }}
    >
      <VideoView
        player={player}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        nativeControls={false}
        allowsPictureInPicture={false}
      />
    </View>
  );
}

function ProductCard({ p, width }: { p: Product; width: number }) {
  const [failed, setFailed] = useState(false);
  return (
    <View className="mb-4 rounded-3xl bg-white p-3" style={{ width, ...cardShadow }}>
      <View className="h-28 items-center justify-center overflow-hidden rounded-2xl bg-[#EEF5EA]">
        {p.image && !failed ? (
          <Image
            source={{ uri: p.image }}
            className="h-full w-full"
            resizeMode="cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <MaterialCommunityIcons name={p.icon} size={44} color={LEAF} />
        )}
      </View>

      <Text numberOfLines={2} className="mt-2 text-[14px] font-extrabold" style={{ color: INK }}>
        {p.name}
      </Text>
      <Text className="text-[12px]" style={{ color: MUTED }}>
        {p.category} • {p.unit}
      </Text>
      <Text className="mt-1 text-[16px] font-extrabold" style={{ color: FOREST }}>
        {formatPrice(p.price)}
      </Text>

      <TouchableOpacity
        activeOpacity={0.85}
        className="mt-2 items-center rounded-full py-2.5"
        style={{ backgroundColor: AMBER }}
        accessibilityRole="button"
        accessibilityLabel={`Buy ${p.name} now`}
      >
        <Text className="text-[13px] font-extrabold" style={{ color: INK }}>
          Buy Now
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function Shop() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState('');

  // 2-column grid: screen padding 16*2, gap 12
  const cardWidth = (width - 32 - 12) / 2;
  const bannerWidth = width - 32;

  const q = query.trim().toLowerCase();
  const visible = PRODUCTS.filter(
    (p) => !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q),
  );

  // Open the category page and pass the name + API category
  const openCategory = (c: Category) => {
    router.push({
      pathname: '/category', // change if your route file is somewhere else
      params: { name: c.name, apiCategory: c.apiCategory },
    });
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 130 }}
    >
      {/* Search bar */}
      <View
        className="h-12 flex-row items-center rounded-full bg-white px-4"
        style={cardShadow}
      >
        <MaterialCommunityIcons name="magnify" size={22} color={MUTED} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search seeds, tools, machinery..."
          placeholderTextColor={MUTED}
          returnKeyType="search"
          className="ml-2 flex-1 text-[14px]"
          style={{ color: INK }}
          accessibilityLabel="Search products"
        />
        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => setQuery('')}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <MaterialCommunityIcons name="close-circle" size={18} color={MUTED} />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories (horizontal scroll) */}
      <SectionTitle title="What are you looking for?" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 8 }}
        className="-mx-1 px-1"
      >
        {CATEGORIES.map((c) => (
          <CategoryItem
            key={c.id}
            c={c}
            active={false}
            onPress={() => openCategory(c)}
          />
        ))}
      </ScrollView>

      {/* Offers & Promotions (autoplay video, muted) */}
      <SectionTitle title="Offers & Promotions" />
      <PromoVideo width={bannerWidth} />

      {/* Trending */}
      <SectionTitle title="Trending Products" />
      <BannerSlider items={TRENDING_BANNERS} width={bannerWidth} />

      {/* Recommended products (grid, 8+ items) */}
      <SectionTitle title="Recommended Products" action="See all" />
      {visible.length === 0 ? (
        <View className="items-center py-10">
          <MaterialCommunityIcons name="magnify-close" size={36} color={MUTED} />
          <Text className="mt-2 text-[14px]" style={{ color: MUTED }}>
            No products match “{query}”. Try another name.
          </Text>
        </View>
      ) : (
        <View className="flex-row flex-wrap justify-between">
          {visible.map((p) => (
            <ProductCard key={p.id} p={p} width={cardWidth} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}