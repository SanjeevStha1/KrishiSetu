import { DISTRICT_LIST } from '../data/agriData';

export interface LiveWeatherData {
  districtId: string;
  districtName: string;
  temp: number;
  tempMax: number;
  tempMin: number;
  humidity: number;
  precipProb: number;
  weatherCode: number;
  conditionLabel: string;
  conditionType: 'clear' | 'cloudy' | 'rain';
  fieldStatus: 'optimal' | 'caution' | 'moderate';
  fieldAdvice: string;
  lastUpdated: string;
  isLive: boolean;
}

const WEATHER_CACHE_KEY_PREFIX = 'krishisetu_weather_cache_';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export function mapWmoWeatherCode(code: number): {
  label: string;
  type: 'clear' | 'cloudy' | 'rain';
} {
  if (code === 0) {
    return { label: 'Clear Sky / सफा मौसम', type: 'clear' };
  }
  if (code <= 3) {
    return { label: 'Partly Cloudy / आंशिक बदली', type: 'cloudy' };
  }
  if (code === 45 || code === 48) {
    return { label: 'Foggy / कुहिरो', type: 'cloudy' };
  }
  if (code >= 51 && code <= 67) {
    return { label: 'Light to Moderate Rain / पानी पर्ने सम्भावना', type: 'rain' };
  }
  if (code >= 71 && code <= 77) {
    return { label: 'Snow / हिउँ', type: 'rain' };
  }
  if (code >= 80 && code <= 82) {
    return { label: 'Rain Showers / झरी', type: 'rain' };
  }
  if (code >= 95) {
    return { label: 'Thunderstorm / हावाहुरी र चट्याङ', type: 'rain' };
  }
  return { label: 'Pleasant / सामान्य मौसम', type: 'clear' };
}

export function getFallbackWeather(districtId: string): LiveWeatherData {
  const dist = DISTRICT_LIST.find((d) => d.id === districtId) || DISTRICT_LIST[0];
  const now = new Date();
  
  // Reasonable subtropical vs temperate defaults
  const isHighland = dist.elevation.includes('1') || dist.elevation.includes('2');
  const temp = isHighland ? 21 : 28;

  return {
    districtId: dist.id,
    districtName: dist.name,
    temp,
    tempMax: temp + 4,
    tempMin: temp - 5,
    humidity: 62,
    precipProb: 15,
    weatherCode: 1,
    conditionLabel: 'Partly Cloudy / आंशिक बदली',
    conditionType: 'cloudy',
    fieldStatus: 'optimal',
    fieldAdvice: 'Optimal for field harvest, drying, and highway transport today.',
    lastUpdated: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isLive: false,
  };
}

export async function fetchLiveWeather(districtId: string): Promise<LiveWeatherData> {
  const dist = DISTRICT_LIST.find((d) => d.id === districtId) || DISTRICT_LIST[0];
  const cacheKey = `${WEATHER_CACHE_KEY_PREFIX}${dist.id}`;

  // Check cached data
  try {
    const cachedStr = localStorage.getItem(cacheKey);
    if (cachedStr) {
      const cached = JSON.parse(cachedStr);
      if (Date.now() - cached.timestamp < CACHE_TTL_MS && cached.data) {
        return cached.data;
      }
    }
  } catch (e) {
    // Ignore storage issues
  }

  const lat = dist.lat || 27.6833;
  const lon = dist.lon || 84.4333;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Open-Meteo responded with status ${res.status}`);
    }

    const json = await res.json();
    const current = json.current || {};
    const daily = json.daily || {};

    const temp = Math.round(current.temperature_2m ?? 26);
    const humidity = Math.round(current.relative_humidity_2m ?? 65);
    const weatherCode = current.weather_code ?? 1;
    const precipProb = Math.round(daily.precipitation_probability_max?.[0] ?? 10);
    const tempMax = Math.round(daily.temperature_2m_max?.[0] ?? (temp + 4));
    const tempMin = Math.round(daily.temperature_2m_min?.[0] ?? (temp - 5));

    const { label, type } = mapWmoWeatherCode(weatherCode);

    let fieldStatus: 'optimal' | 'caution' | 'moderate' = 'optimal';
    let fieldAdvice = 'Optimal for field harvest, spraying, and highway transport.';

    if (precipProb >= 50 || type === 'rain') {
      fieldStatus = 'caution';
      fieldAdvice = 'Rain expected today — Harvest or cover vulnerable crops before rainfall.';
    } else if (precipProb >= 30 || temp > 35) {
      fieldStatus = 'moderate';
      fieldAdvice = 'Moderate conditions — Monitor afternoon cloud build-up along highway routes.';
    }

    const liveData: LiveWeatherData = {
      districtId: dist.id,
      districtName: dist.name,
      temp,
      tempMax,
      tempMin,
      humidity,
      precipProb,
      weatherCode,
      conditionLabel: label,
      conditionType: type,
      fieldStatus,
      fieldAdvice,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isLive: true,
    };

    try {
      localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: liveData }));
    } catch (e) {
      // Ignore
    }

    return liveData;
  } catch (err) {
    console.warn(`[WeatherService] Could not fetch Open-Meteo live weather for ${dist.name}:`, err);
    // Return last known cached or fallback
    try {
      const cachedStr = localStorage.getItem(cacheKey);
      if (cachedStr) {
        const cached = JSON.parse(cachedStr);
        if (cached.data) {
          return { ...cached.data, isLive: false };
        }
      }
    } catch (e) {}

    return getFallbackWeather(districtId);
  }
}
