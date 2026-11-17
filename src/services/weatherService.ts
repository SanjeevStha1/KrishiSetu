import { DISTRICT_LIST } from '../data/agriData';

export interface LiveWeatherData {
  districtId: string;
  districtName: string;
  province?: string;
  elevation?: string;
  temp: number;
  tempMax: number;
  tempMin: number;
  humidity: number;
  precipProb: number;
  windSpeedKmH?: number;
  soilTemp0Cm?: number;
  soilMoisturePct?: number;
  evapotranspirationMm?: number;
  dailyForecast?: Array<{
    date: string;
    tempMax: number;
    tempMin: number;
    precipProb: number;
    weatherCode: number;
    conditionType: 'clear' | 'cloudy' | 'rain';
    et0Mm?: number;
  }>;
  weatherCode: number;
  conditionLabel: string;
  conditionType: 'clear' | 'cloudy' | 'rain';
  fieldStatus: 'optimal' | 'caution' | 'moderate';
  fieldAdvice: string;
  fieldAdviceNe?: string;
  lastUpdated: string;
  isLive: boolean;
}

const WEATHER_CACHE_KEY_PREFIX = 'krishisetu_weather_cache_v2_';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export function mapWmoWeatherCode(code: number): {
  label: string;
  type: 'clear' | 'cloudy' | 'rain';
} {
  if (code === 0) return { label: 'Clear Sky / सफा मौसम', type: 'clear' };
  if (code <= 3) return { label: 'Partly Cloudy / आंशिक बदली', type: 'cloudy' };
  if (code === 45 || code === 48) return { label: 'Foggy / कुहिरो', type: 'cloudy' };
  if (code >= 51 && code <= 67) return { label: 'Light to Moderate Rain / पानी पर्ने सम्भावना', type: 'rain' };
  if (code >= 71 && code <= 77) return { label: 'Snow / हिउँ', type: 'rain' };
  if (code >= 80 && code <= 82) return { label: 'Rain Showers / झरी', type: 'rain' };
  if (code >= 95) return { label: 'Thunderstorm / हावाहुरी र चट्याङ', type: 'rain' };
  return { label: 'Pleasant / सामान्य मौसम', type: 'clear' };
}

export function getFallbackWeather(districtId: string): LiveWeatherData {
  const dist = DISTRICT_LIST.find((d) => d.id === districtId) || DISTRICT_LIST[0];
  const now = new Date();
  const isHighland = dist.zone === 'Temperate' || dist.zone === 'Alpine';
  const temp = isHighland ? 20 : 27;

  return {
    districtId: dist.id,
    districtName: dist.name,
    province: (dist as any).province,
    elevation: dist.elevation,
    temp,
    tempMax: temp + 4,
    tempMin: temp - 5,
    humidity: 62,
    precipProb: 15,
    windSpeedKmH: 9,
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

  try {
    const cachedStr = localStorage.getItem(cacheKey);
    if (cachedStr) {
      const cached = JSON.parse(cachedStr);
      if (Date.now() - cached.timestamp < CACHE_TTL_MS && cached.data) {
        return cached.data;
      }
    }
  } catch {}

  const lat = dist.lat || 27.6833;
  const lon = dist.lon || 84.4333;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,precipitation,wind_speed_10m&hourly=soil_temperature_0cm,soil_moisture_0_to_1cm&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,et0_fao_evapotranspiration&forecast_days=7&timezone=Asia%2FKathmandu`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Open-Meteo responded with status ${res.status}`);
    }

    const json = await res.json();
    const current = json.current || {};
    const daily = json.daily || {};
    const hourly = json.hourly || {};

    const temp = Math.round(current.temperature_2m ?? 26);
    const humidity = Math.round(current.relative_humidity_2m ?? 65);
    const weatherCode = current.weather_code ?? 1;
    const windSpeedKmH = Math.round(current.wind_speed_10m ?? 8);
    const precipProb = Math.round(daily.precipitation_probability_max?.[0] ?? 10);
    const tempMax = Math.round(daily.temperature_2m_max?.[0] ?? (temp + 4));
    const tempMin = Math.round(daily.temperature_2m_min?.[0] ?? (temp - 5));

    const soilTempRaw = Array.isArray(hourly.soil_temperature_0cm) ? hourly.soil_temperature_0cm[0] : undefined;
    const soilMoistRaw = Array.isArray(hourly.soil_moisture_0_to_1cm) ? hourly.soil_moisture_0_to_1cm[0] : undefined;
    const et0Raw = Array.isArray(daily.et0_fao_evapotranspiration) ? daily.et0_fao_evapotranspiration[0] : undefined;

    const soilTemp0Cm = typeof soilTempRaw === 'number' ? Math.round(soilTempRaw * 10) / 10 : undefined;
    const soilMoisturePct = typeof soilMoistRaw === 'number' ? Math.round(soilMoistRaw * 100) : undefined;
    const evapotranspirationMm = typeof et0Raw === 'number' ? Math.round(et0Raw * 10) / 10 : undefined;

    const dailyForecast = Array.isArray(daily.time)
      ? daily.time.slice(0, 7).map((dateStr: string, idx: number) => {
          const wCode = daily.weather_code?.[idx] ?? 1;
          const mapped = mapWmoWeatherCode(wCode);
          return {
            date: dateStr,
            tempMax: Math.round(daily.temperature_2m_max?.[idx] ?? tempMax),
            tempMin: Math.round(daily.temperature_2m_min?.[idx] ?? tempMin),
            precipProb: Math.round(daily.precipitation_probability_max?.[idx] ?? 10),
            weatherCode: wCode,
            conditionType: mapped.type,
            et0Mm: typeof daily.et0_fao_evapotranspiration?.[idx] === 'number'
              ? Math.round(daily.et0_fao_evapotranspiration[idx] * 10) / 10
              : undefined,
          };
        })
      : [];

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
      province: (dist as any).province,
      elevation: dist.elevation,
      temp,
      tempMax,
      tempMin,
      humidity,
      precipProb,
      windSpeedKmH,
      soilTemp0Cm,
      soilMoisturePct,
      evapotranspirationMm,
      dailyForecast,
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
    } catch {}

    return liveData;
  } catch (err) {
    console.warn(`[WeatherService] Could not fetch Open-Meteo live weather for ${dist.name}:`, err);
    try {
      const cachedStr = localStorage.getItem(cacheKey);
      if (cachedStr) {
        const cached = JSON.parse(cachedStr);
        if (cached.data) {
          return { ...cached.data, isLive: false };
        }
      }
    } catch {}

    return getFallbackWeather(districtId);
  }
}
