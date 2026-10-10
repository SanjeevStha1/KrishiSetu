import { apiRequest } from './apiClient';

export interface WeatherData {
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

export const weatherApi = {
  async getWeather(districtId = 'chitwan') {
    return apiRequest<{ success: boolean; weather: WeatherData }>(`/api/weather/${districtId}`, {
      method: 'GET',
    });
  },
};
