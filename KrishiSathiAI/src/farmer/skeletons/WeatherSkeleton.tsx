
import React from 'react';
import { ScrollView, View } from 'react-native';

const SKELETON = '#E8EDE5';
const LIGHT_SKELETON = '#EEF1EB';

function SkeletonBlock({
  className,
}: {
  className: string;
}) {
  return (
    <View
      className={className}
      style={{ backgroundColor: SKELETON }}
    />
  );
}

export default function WeatherSkeleton() {
  return (
    <View
      className="mx-4 mb-4 rounded-3xl bg-white p-3"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      {/* Current weather */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center">
          <SkeletonBlock className="h-11 w-11 rounded-full" />

          <View className="ml-3 flex-1">
            <SkeletonBlock className="h-7 w-24 rounded-lg" />

            <View
              className="mt-2 h-3 w-28 rounded-md"
              style={{ backgroundColor: LIGHT_SKELETON }}
            />
          </View>
        </View>

        {/* Refresh button placeholder */}
        <View
          className="h-9 w-20 rounded-full"
          style={{ backgroundColor: LIGHT_SKELETON }}
        />
      </View>

      {/* Feels like */}
      <View
        className="mt-3 h-3 w-32 rounded-md"
        style={{ backgroundColor: LIGHT_SKELETON }}
      />

      {/* Weather statistics */}
      <View className="mt-3 flex-row gap-2">
        {[1, 2, 3].map((item) => (
          <View
            key={item}
            className="h-[70px] flex-1 items-center justify-center rounded-2xl px-1"
            style={{ backgroundColor: '#F4F1EA' }}
          >
            <SkeletonBlock className="h-5 w-5 rounded-full" />

            <View
              className="mt-2 h-3 w-14 rounded-md"
              style={{ backgroundColor: '#E1E8DD' }}
            />

            <View
              className="mt-2 h-4 w-12 rounded-md"
              style={{ backgroundColor: '#E1E8DD' }}
            />
          </View>
        ))}
      </View>

      {/* Hourly forecast */}
      <View className="mt-4">
        <View
          className="mb-3 h-5 w-36 rounded-md"
          style={{ backgroundColor: SKELETON }}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10 }}
        >
          {[1, 2, 3, 4, 5].map((item) => (
            <View
              key={item}
              className="h-[112px] w-[76px] items-center rounded-2xl border border-[#EEE9DC] px-2 py-3"
              style={{ backgroundColor: '#FBFAF6' }}
            >
              <View
                className="h-3 w-10 rounded-md"
                style={{ backgroundColor: SKELETON }}
              />

              <View
                className="my-3 h-6 w-6 rounded-full"
                style={{ backgroundColor: '#E1E8DD' }}
              />

              <View
                className="h-4 w-10 rounded-md"
                style={{ backgroundColor: SKELETON }}
              />

              <View
                className="mt-3 h-3 w-8 rounded-md"
                style={{ backgroundColor: LIGHT_SKELETON }}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
