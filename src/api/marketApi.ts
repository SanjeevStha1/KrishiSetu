import { apiRequest } from './apiClient';
import { Commodity, MarketDisruption } from '../../shared/types/krishi';

export const marketApi = {
  async getCommodities() {
    return apiRequest<{ success: boolean; commodities: Commodity[]; timestamp: string }>('/api/market/commodities', {
      method: 'GET',
    });
  },

  async getCommodity(cropId: string) {
    return apiRequest<{ success: boolean; commodity: Commodity }>(`/api/market/commodities/${cropId}`, {
      method: 'GET',
    });
  },

  async getDisruptions() {
    return apiRequest<{ success: boolean; disruptions: MarketDisruption[] }>('/api/market/disruptions', {
      method: 'GET',
    });
  },

  async getArbitrage(district = 'chitwan') {
    return apiRequest<{ success: boolean; district: string; arbitrage: any[] }>(`/api/market/arbitrage?district=${encodeURIComponent(district)}`, {
      method: 'GET',
    });
  },

  async getPriceHistory(cropId: string, days?: number) {
    const query = typeof days === 'number' && days > 0 ? `?days=${days}` : '';
    return apiRequest<{
      success: boolean;
      cropId: string;
      totalPoints: number;
      history: Array<{
        cropId: string;
        date: string;
        price: number;
        minPrice?: number;
        maxPrice?: number;
        source?: string;
      }>;
    }>(`/api/market/history/${encodeURIComponent(cropId)}${query}`, {
      method: 'GET',
    });
  },

  async triggerScrape() {
    return apiRequest<{ success: boolean; itemsCount: number; status: string }>('/api/market/scrape', {
      method: 'POST',
    });
  },
};
