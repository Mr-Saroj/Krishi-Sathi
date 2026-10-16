
import React, { useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const FOREST = '#14532D';
const LEAF = '#2E7D32';
const MUTED = '#5E7365';
const INK = '#1F2A24';

const CATEGORIES = [
  'All',
  'Cereals',
  'Pulses',
  'Vegetables',
  'Fruits',
  'Oilseeds',
  'Other',
];

const CROPS = [
  { id: '1', name: 'Paddy (Swarna)', category: 'Cereals', price: 2203, change: 45 },
  { id: '2', name: 'Wheat', category: 'Cereals', price: 2450, change: 20 },
  { id: '3', name: 'Maize', category: 'Cereals', price: 2250, change: -30 },
  { id: '4', name: 'Ragi', category: 'Cereals', price: 3900, change: 50 },
  { id: '5', name: 'Chana', category: 'Pulses', price: 5600, change: 80 },
  { id: '6', name: 'Moong', category: 'Pulses', price: 7200, change: -40 },
  { id: '7', name: 'Arhar (Toor)', category: 'Pulses', price: 6800, change: 100 },
  { id: '8', name: 'Tomato', category: 'Vegetables', price: 1800, change: 200 },
  { id: '9', name: 'Potato', category: 'Vegetables', price: 1400, change: -100 },
  { id: '10', name: 'Onion', category: 'Vegetables', price: 2600, change: 150 },
  { id: '11', name: 'Brinjal', category: 'Vegetables', price: 2200, change: 70 },
  { id: '12', name: 'Banana', category: 'Fruits', price: 2500, change: 100 },
  { id: '13', name: 'Mango', category: 'Fruits', price: 4500, change: 200 },
  { id: '14', name: 'Mustard', category: 'Oilseeds', price: 5900, change: 50 },
  { id: '15', name: 'Groundnut', category: 'Oilseeds', price: 6100, change: -25 },
  { id: '16', name: 'Cotton', category: 'Other', price: 7120, change: 120 },
  { id: '17', name: 'Turmeric', category: 'Other', price: 9500, change: 150 },
];

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function MandiRatesPopup({ visible, onClose }: Props) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filteredCrops = useMemo(() => {
    return CROPS.filter((crop) => {
      const matchesSearch = crop.name
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      const matchesCategory =
        category === 'All' || crop.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  const formatPrice = (price: number) =>
    `₹${price.toLocaleString('en-IN')}`;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View
          className="h-[88%] overflow-hidden rounded-t-[30px] bg-[#F7F6F0]"
        >
          {/* Popup header */}
          <View
            className="rounded-b-[24px] px-5 pb-5 pt-4"
            style={{ backgroundColor: FOREST }}
          >
            <View className="mb-4 items-center">
              <View className="h-1.5 w-12 rounded-full bg-white/50" />
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-[23px] font-extrabold text-white">
                  All Mandi Rates
                </Text>
                <Text className="mt-1 text-[12px] text-white/80">
                  Explore prices for different crops
                </Text>
              </View>

              <TouchableOpacity
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close mandi rates"
                className="h-10 w-10 items-center justify-center rounded-full bg-white/15"
              >
                <MaterialCommunityIcons
                  name="close"
                  size={23}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View className="mt-4 flex-row items-center rounded-2xl bg-white px-3">
              <MaterialCommunityIcons
                name="magnify"
                size={22}
                color={MUTED}
              />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search crop..."
                placeholderTextColor="#8A958D"
                className="flex-1 px-3 py-3 text-[14px] text-[#1F2A24]"
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={20}
                    color={MUTED}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16, paddingBottom: 35 }}
          >
            {/* Categories */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingBottom: 5 }}
            >
              {CATEGORIES.map((item) => {
                const selected = category === item;

                return (
                  <TouchableOpacity
                    key={item}
                    onPress={() => setCategory(item)}
                    className="rounded-full border px-4 py-2.5"
                    style={{
                      backgroundColor: selected ? FOREST : '#FFFFFF',
                      borderColor: selected ? FOREST : '#E8E4D9',
                    }}
                  >
                    <Text
                      className="text-[12px] font-bold"
                      style={{ color: selected ? '#FFFFFF' : MUTED }}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View className="mb-3 mt-4 flex-row items-center justify-between">
              <Text className="text-[17px] font-extrabold" style={{ color: INK }}>
                Crop prices
              </Text>
              <Text className="text-[12px]" style={{ color: MUTED }}>
                {filteredCrops.length} crops
              </Text>
            </View>

            {/* Crop list */}
            {filteredCrops.length > 0 ? (
              filteredCrops.map((crop) => {
                const isUp = crop.change >= 0;

                return (
                  <View
                    key={crop.id}
                    className="mb-3 flex-row items-center rounded-2xl border border-[#EEE9DC] bg-white p-3"
                  >
                    <View className="mr-3 h-11 w-11 items-center justify-center rounded-xl bg-[#DDF0DD]">
                      <MaterialCommunityIcons
                        name="sprout"
                        size={24}
                        color={LEAF}
                      />
                    </View>

                    <View className="flex-1">
                      <Text
                        className="text-[14px] font-extrabold"
                        style={{ color: INK }}
                      >
                        {crop.name}
                      </Text>
                      <Text className="mt-1 text-[11px]" style={{ color: MUTED }}>
                        {crop.category} • Per quintal
                      </Text>
                    </View>

                    <View className="items-end">
                      <Text
                        className="text-[16px] font-extrabold"
                        style={{ color: INK }}
                      >
                        {formatPrice(crop.price)}
                      </Text>

                      <Text
                        className="mt-1 text-[11px] font-bold"
                        style={{ color: isUp ? LEAF : '#C2571A' }}
                      >
                        {isUp ? '▲ +' : '▼ -'}
                        {formatPrice(Math.abs(crop.change))}
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <View className="items-center rounded-2xl bg-white p-8">
                <MaterialCommunityIcons
                  name="magnify"
                  size={35}
                  color={MUTED}
                />
                <Text className="mt-3 font-bold" style={{ color: INK }}>
                  No crops found
                </Text>
                <Text className="mt-1 text-[12px]" style={{ color: MUTED }}>
                  Try another crop name or category.
                </Text>
              </View>
            )}

            <Text className="mt-2 text-center text-[11px]" style={{ color: MUTED }}>
              Sample prices for UI development — not verified live market rates.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
