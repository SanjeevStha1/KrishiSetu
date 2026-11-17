import { NEPAL_DISTRICTS_MANDIS, findDistrictMandi } from '../data/nepalMandis';

export interface DailyForecastDay {
  date: string;
  tempMax: number;
  tempMin: number;
  precipProb: number;
  weatherCode: number;
  conditionType: 'clear' | 'cloudy' | 'rain';
  et0Mm?: number;
}

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
  dailyForecast?: DailyForecastDay[];
  weatherCode: number;
  conditionLabel: string;
  conditionType: 'clear' | 'cloudy' | 'rain';
  fieldStatus: 'optimal' | 'caution' | 'moderate';
  fieldAdvice: string;
  fieldAdviceNe?: string;
  lastUpdated: string;
  isLive: boolean;
}

export class WeatherBackendService {
  private static cache: Map<string, { timestamp: number; data: LiveWeatherData }> = new Map();
  private static CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL

  private static mapWmoCode(code: number): { label: string; labelNe: string; type: 'clear' | 'cloudy' | 'rain' } {
    if (code === 0) return { label: 'Clear Sky', labelNe: 'सफा आकाश', type: 'clear' };
    if (code <= 3) return { label: 'Partly Cloudy', labelNe: 'आंशिक बदली', type: 'cloudy' };
    if (code === 45 || code === 48) return { label: 'Dense Fog', labelNe: 'बाक्लो कुहिरो', type: 'cloudy' };
    if (code >= 51 && code <= 55) return { label: 'Light Drizzle', labelNe: 'सिमसिमे पानी', type: 'rain' };
    if (code >= 61 && code <= 67) return { label: 'Moderate Rain', labelNe: 'मध्यम वर्षा', type: 'rain' };
    if (code >= 80 && code <= 82) return { label: 'Rain Showers', labelNe: 'झरी', type: 'rain' };
    if (code >= 95) return { label: 'Thunderstorm', labelNe: 'चट्याङ सहितको वर्षा', type: 'rain' };
    return { label: 'Partly Cloudy', labelNe: 'बदली', type: 'cloudy' };
  }

  public static async getWeatherForDistrict(districtId: string): Promise<LiveWeatherData> {
    const config = findDistrictMandi(districtId);
    const key = config.id;

    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${config.lat}&longitude=${config.lon}&current=temperature_2m,relative_humidity_2m,weather_code,precipitation,wind_speed_10m&hourly=soil_temperature_0cm,soil_moisture_0_to_1cm&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,et0_fao_evapotranspiration&forecast_days=7&timezone=Asia%2FKathmandu`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6500);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Open-Meteo HTTP ${response.status}`);
      }

      const json = await response.json();
      const current = json.current || {};
      const daily = json.daily || {};
      const hourly = json.hourly || {};

      const temp = Math.round(current.temperature_2m ?? 24);
      const humidity = Math.round(current.relative_humidity_2m ?? 60);
      const weatherCode = current.weather_code ?? 1;
      const windSpeed = Math.round(current.wind_speed_10m ?? 8);
      const precipProb = Math.round(daily.precipitation_probability_max?.[0] ?? 12);
      const tempMax = Math.round(daily.temperature_2m_max?.[0] ?? (temp + 4));
      const tempMin = Math.round(daily.temperature_2m_min?.[0] ?? (temp - 5));

      // Extract current hour soil telemetry & ET0
      const soilTempRaw = Array.isArray(hourly.soil_temperature_0cm) ? hourly.soil_temperature_0cm[0] : undefined;
      const soilMoistRaw = Array.isArray(hourly.soil_moisture_0_to_1cm) ? hourly.soil_moisture_0_to_1cm[0] : undefined;
      const et0Raw = Array.isArray(daily.et0_fao_evapotranspiration) ? daily.et0_fao_evapotranspiration[0] : undefined;

      const soilTemp0Cm = typeof soilTempRaw === 'number' ? Math.round(soilTempRaw * 10) / 10 : undefined;
      const soilMoisturePct = typeof soilMoistRaw === 'number' ? Math.round(soilMoistRaw * 100) : undefined;
      const evapotranspirationMm = typeof et0Raw === 'number' ? Math.round(et0Raw * 10) / 10 : undefined;

      // Build 7-day forecast array
      const dailyForecast: DailyForecastDay[] = Array.isArray(daily.time)
        ? daily.time.slice(0, 7).map((dateStr: string, idx: number) => {
            const wCode = daily.weather_code?.[idx] ?? 1;
            const mapped = this.mapWmoCode(wCode);
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

      const { label, labelNe, type } = this.mapWmoCode(weatherCode);

      let fieldStatus: 'optimal' | 'caution' | 'moderate' = 'optimal';
      let fieldAdvice = `Weather in ${config.name} is favorable for harvesting, field tillage, and ${config.highwayRoute} transit.`;
      let fieldAdviceNe = `${config.nameNe} क्षेत्रमा बाली भित्र्याउन, गोडमेल गर्न र बजार ढुवानीका लागि मौसम अनुकूल छ।`;

      if (precipProb >= 50 || type === 'rain') {
        fieldStatus = 'caution';
        fieldAdvice = `Elevated rain probability (${precipProb}%) in ${config.name}. Complete vegetable picking early and secure crate tarp covers along ${config.highwayRoute}.`;
        fieldAdviceNe = `वर्षाको सम्भावना उच्च (${precipProb}%) छ। तरकारी छिटो टिप्नुहोस् र ढुवानी गर्दा त्रिपालले सुरक्षित छोप्नुहोस्।`;
      } else if (precipProb >= 30 || temp > 34) {
        fieldStatus = 'moderate';
        fieldAdvice = `Warm afternoon or light showers possible (${tempMax}°C peak). Monitor soil moisture (${soilMoisturePct ?? 25}%) and polyhouse ventilation.`;
        fieldAdviceNe = `दिउँसो तापक्रम (${tempMax}°C) बढ्ने सम्भावना छ। माटोको चिस्यान र टनेलको हावा आवतजावत जाँच गर्नुहोस्।`;
      } else if (tempMin <= 6) {
        fieldStatus = 'caution';
        fieldAdvice = `Low nighttime temperature (${tempMin}°C) detected in ${config.name}. Risk of ground frost for tender potato and tomato foliage.`;
        fieldAdviceNe = `राति चिसो (${tempMin}°C) बढ्ने सम्भावना। आलु र गोलभेडाको पातमा तुसारोबाट जोगाउन हल्का सिँचाइ गर्नुहोस्।`;
      } else if (typeof soilMoisturePct === 'number' && soilMoisturePct < 18) {
        fieldStatus = 'moderate';
        fieldAdvice = `Topsoil moisture is low (${soilMoisturePct}%). Schedule evening drip or furrow irrigation to prevent blossom-end stress.`;
        fieldAdviceNe = `माटोको चिस्यान कम (${soilMoisturePct}%) छ। साँझपख हल्का सिँचाइ गर्न सिफारिस गरिन्छ।`;
      }

      const result: LiveWeatherData = {
        districtId: key,
        districtName: config.name,
        province: config.province,
        elevation: config.elevation,
        temp,
        tempMax,
        tempMin,
        humidity,
        precipProb,
        windSpeedKmH: windSpeed,
        soilTemp0Cm,
        soilMoisturePct,
        evapotranspirationMm,
        dailyForecast,
        weatherCode,
        conditionLabel: `${label} / ${labelNe}`,
        conditionType: type,
        fieldStatus,
        fieldAdvice,
        fieldAdviceNe,
        lastUpdated: new Date().toISOString(),
        isLive: true,
      };

      this.cache.set(key, { timestamp: Date.now(), data: result });
      return result;
    } catch (err: any) {
      console.warn(`[WeatherService] Could not reach Open-Meteo for ${config.name} (${err?.message}). Returning regional baseline.`);

      const isHighland = config.zone === 'Temperate' || config.zone === 'Alpine';
      const baselineTemp = isHighland ? 19 : 27;

      const fallback: LiveWeatherData = {
        districtId: key,
        districtName: config.name,
        province: config.province,
        elevation: config.elevation,
        temp: baselineTemp,
        tempMax: baselineTemp + 4,
        tempMin: baselineTemp - 5,
        humidity: 62,
        precipProb: 15,
        windSpeedKmH: 9,
        weatherCode: 1,
        conditionLabel: 'Partly Cloudy / आंशिक बदली',
        conditionType: 'cloudy',
        fieldStatus: 'optimal',
        fieldAdvice: `Stable agricultural atmospheric conditions in ${config.name} for field harvest and mandi transit.`,
        fieldAdviceNe: `${config.nameNe} क्षेत्रमा बाली टिप्न र बजार पठाउन सामान्य अनुकूल अवस्था छ।`,
        lastUpdated: new Date().toISOString(),
        isLive: false,
      };

      return fallback;
    }
  }
}
