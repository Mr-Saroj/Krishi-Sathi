
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import {
    fetchWeather,
    formatForecastTime,
    getWeatherCondition,
    type WeatherData as WeatherInfo,
} from '../services/weatherService';
import WeatherSkeleton from '../skeletons/WeatherSkeleton';

type IconName = React.ComponentProps<
    typeof MaterialCommunityIcons
>['name'];

const FOREST = '#14532D';
const LEAF = '#2E7D32';
const AMBER = '#F5A623';
const MUTED = '#5E7365';
const INK = '#1F2A24';

function WeatherCard({ children }: { children: React.ReactNode }) {
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
            {children}
        </View>
    );
}

function WeatherStat({
    icon,
    label,
    value,
}: {
    icon: IconName;
    label: string;
    value: string;
}) {
    return (
        <View className="flex-1 items-center rounded-2xl bg-[#F4F1EA] px-1 py-3">
            <MaterialCommunityIcons name={icon} size={20} color={FOREST} />

            <Text
                className="mt-1 text-center text-[11px]"
                style={{ color: MUTED }}
            >
                {label}
            </Text>

            <Text
                className="text-center text-[14px] font-extrabold"
                style={{ color: INK }}
            >
                {value}
            </Text>
        </View>
    );
}

export default function WeatherData() {
    const [weather, setWeather] = useState<WeatherInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadWeather = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const permission =
                await Location.requestForegroundPermissionsAsync();

            if (permission.status !== 'granted') {
                throw new Error(
                    'Location permission is required to show weather for your area.',
                );
            }

            const position = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const result = await fetchWeather(
                position.coords.latitude,
                position.coords.longitude,
            );

            setWeather(result);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to load weather. Please try again.',
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadWeather();
    }, [loadWeather]);

    if (loading) {
        return  <WeatherSkeleton />;
    }

    if (error || !weather) {
        return (
            <WeatherCard>
                <View className="flex-row items-start">
                    <MaterialCommunityIcons
                        name="weather-cloudy-alert"
                        size={28}
                        color={AMBER}
                    />

                    <View className="ml-3 flex-1">
                        <Text
                            className="text-[16px] font-extrabold"
                            style={{ color: INK }}
                        >
                            Weather unavailable
                        </Text>

                        <Text
                            className="mt-1 text-[13px] leading-5"
                            style={{ color: MUTED }}
                        >
                            {error ?? 'Unable to get weather data.'}
                        </Text>

                        <TouchableOpacity
                            onPress={() => void loadWeather()}
                            activeOpacity={0.8}
                            className="mt-3 self-start rounded-xl px-4 py-2"
                            style={{ backgroundColor: FOREST }}
                            accessibilityRole="button"
                        >
                            <Text className="font-bold text-white">Try again</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </WeatherCard>
        );
    }

    const condition = getWeatherCondition(weather.weatherCode);

    return (
        <WeatherCard>
            {/* Current weather */}
            <View className="flex-row items-center justify-between">
                <View className="flex-1 flex-row items-center">
                    <MaterialCommunityIcons
                        name={condition.icon}
                        size={30}
                        color={AMBER}
                    />

                    <View className="ml-2 flex-1">
                        <Text
                            className="text-[24px] font-extrabold"
                            style={{ color: INK }}
                        >
                            {Math.round(weather.temperature)}°C
                        </Text>

                        <Text className="text-[13px]" style={{ color: MUTED }}>
                            {condition.label}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={() => void loadWeather()}
                    disabled={loading}
                    activeOpacity={0.7}
                    className="flex-row items-center rounded-full bg-[#EFEBE0] px-3 py-2"
                    accessibilityRole="button"
                    accessibilityLabel="Refresh weather"
                >
                    {loading ? (
                        <ActivityIndicator size="small" color={FOREST} />
                    ) : (
                        <MaterialCommunityIcons
                            name="refresh"
                            size={15}
                            color={FOREST}
                        />
                    )}

                    <Text
                        className="ml-1 text-[11px] font-semibold"
                        style={{ color: MUTED }}
                    >
                        {loading ? 'Updating' : 'Refresh'}
                    </Text>
                </TouchableOpacity>
            </View>

            <Text className="mt-2 text-[12px]" style={{ color: MUTED }}>
                Feels like {Math.round(weather.feelsLike)}°C
            </Text>

            {/* Weather statistics */}
            <View className="mt-3 flex-row gap-2">
                <WeatherStat
                    icon="water-outline"
                    label="Rain Chance"
                    value={`${Math.round(weather.rainChance)}%`}
                />

                <WeatherStat
                    icon="weather-windy"
                    label="Wind Speed"
                    value={`${Math.round(weather.windSpeed)} km/h`}
                />

                <WeatherStat
                    icon="water-percent"
                    label="Humidity"
                    value={`${Math.round(weather.humidity)}%`}
                />
            </View>

            {/* Hourly forecast */}
            <View className="mt-5">
                <Text
                    className="mb-3 text-[16px] font-extrabold"
                    style={{ color: INK }}
                >
                    Next 24 Hours
                </Text>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 10 }}
                >
                    {weather.hourly.map((hour, index) => {
                        const hourlyCondition = getWeatherCondition(
                            hour.weatherCode,
                        );

                        return (
                            <View
                                key={`${hour.time}-${index}`}
                                className="w-[86px] items-center rounded-2xl border border-[#EEE9DC] bg-[#FBFAF6] px-2 py-3"
                            >
                                <Text
                                    className="text-[12px] font-semibold"
                                    style={{ color: MUTED }}
                                >
                                    {index === 0
                                        ? 'Now'
                                        : formatForecastTime(hour.time)}
                                </Text>

                                <MaterialCommunityIcons
                                    name={hourlyCondition.icon}
                                    size={25}
                                    color={AMBER}
                                    style={{ marginVertical: 8 }}
                                />

                                <Text
                                    className="text-[16px] font-extrabold"
                                    style={{ color: INK }}
                                >
                                    {Math.round(hour.temperature)}°
                                </Text>

                                <View className="mt-2 flex-row items-center">
                                    <MaterialCommunityIcons
                                        name="water-outline"
                                        size={13}
                                        color="#2879B9"
                                    />

                                    <Text
                                        className="ml-1 text-[11px] font-semibold"
                                        style={{ color: '#2879B9' }}
                                    >
                                        {Math.round(hour.precipitationProbability)}%
                                    </Text>
                                </View>

                                <Text
                                    className="mt-1 text-[10px]"
                                    style={{ color: MUTED }}
                                >
                                    {hour.precipitation.toFixed(1)} mm
                                </Text>
                            </View>
                        );
                    })}
                </ScrollView>
            </View>
        </WeatherCard>
    );
}
