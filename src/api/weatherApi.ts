import { apiRequest } from './apiClient';

export interface DailyForecastDay {
  date: string;
  tempMax: number;
  tempMin: number;
  precipProb: number;
  weatherCode: number;
  conditionType: 'clear' | 'cloudy' | 'rain';
  et0Mm?: number;
}

export interface WeatherData {
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

export const weatherApi = {
  async getWeather(districtId = 'chitwan') {
    return apiRequest<{ success: boolean; weather: WeatherData }>(`/api/weather/${encodeURIComponent(districtId)}`, {
      method: 'GET',
    });
  },
};
