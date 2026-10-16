
export type WeatherCondition = {
  label: string;
  icon:
    | 'white-balance-sunny'
    | 'weather-night'
    | 'weather-partly-cloudy'
    | 'weather-cloudy'
    | 'weather-fog'
    | 'weather-rainy'
    | 'weather-pouring'
    | 'weather-snowy'
    | 'weather-lightning';
};

export type HourlyForecast = {
  time: string;
  temperature: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
};

export type WeatherData = {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  rainChance: number;
  updatedAt: string;
  hourly: HourlyForecast[];
};

type OpenMeteoResponse = {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
    precipitation: number[];
    weather_code: number[];
  };
};

export function getWeatherCondition(code: number, isDay = true): WeatherCondition {
  if (code === 0) {
    return {
      label: isDay ? 'Sunny' : 'Clear night',
      icon: isDay ? 'white-balance-sunny' : 'weather-night',
    };
  }

  if (code === 1) {
    return { label: 'Mainly clear', icon: 'weather-partly-cloudy' };
  }

  if (code === 2) {
    return { label: 'Partly cloudy', icon: 'weather-partly-cloudy' };
  }

  if (code === 3) {
    return { label: 'Overcast', icon: 'weather-cloudy' };
  }

  if ([45, 48].includes(code)) {
    return { label: 'Foggy', icon: 'weather-fog' };
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return { label: 'Drizzle', icon: 'weather-rainy' };
  }

  if ([61, 63, 66, 80, 81].includes(code)) {
    return { label: 'Rain', icon: 'weather-rainy' };
  }

  if ([65, 67, 82].includes(code)) {
    return { label: 'Heavy rain', icon: 'weather-pouring' };
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { label: 'Snow', icon: 'weather-snowy' };
  }

  if ([95, 96, 99].includes(code)) {
    return { label: 'Thunderstorm', icon: 'weather-lightning' };
  }

  return { label: 'Unknown conditions', icon: 'weather-cloudy' };
}

export function formatForecastTime(time: string): string {
  // Open-Meteo returns local wall-clock times for the requested timezone.
  const hour = Number(time.slice(11, 13));
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;

  return `${hour12} ${suffix}`;
}

export async function fetchWeather(
  latitude: number,
  longitude: number,
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'wind_speed_10m',
      'weather_code',
    ].join(','),
    hourly: [
      'temperature_2m',
      'precipitation_probability',
      'precipitation',
      'weather_code',
    ].join(','),
    forecast_days: '2',
    timezone: 'auto',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
  });

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error(
      `Weather service returned an error (${response.status}). Please try again.`,
    );
  }

  const json = (await response.json()) as OpenMeteoResponse;

  if (
    !json.current ||
    !json.hourly ||
    !Array.isArray(json.hourly.time) ||
    json.hourly.time.length === 0
  ) {
    throw new Error('Weather data is unavailable for this location.');
  }

  const currentIndex = Math.max(
    0,
    json.hourly.time.findIndex((time) => time >= json.current.time),
  );

  const hourly: HourlyForecast[] = json.hourly.time
    .slice(currentIndex, currentIndex + 24)
    .map((time, offset) => {
      const i = currentIndex + offset;

      return {
        time,
        temperature: json.hourly.temperature_2m[i] ?? 0,
        precipitationProbability:
          json.hourly.precipitation_probability[i] ?? 0,
        precipitation: json.hourly.precipitation[i] ?? 0,
        weatherCode: json.hourly.weather_code[i] ?? 3,
      };
    });

  const currentHourIndex = Math.min(
    currentIndex,
    json.hourly.time.length - 1,
  );

  return {
    temperature: json.current.temperature_2m,
    feelsLike: json.current.apparent_temperature,
    humidity: json.current.relative_humidity_2m,
    windSpeed: json.current.wind_speed_10m,
    weatherCode: json.current.weather_code,
    rainChance:
      json.hourly.precipitation_probability[currentHourIndex] ?? 0,
    updatedAt: json.current.time,
    hourly,
  };
}
