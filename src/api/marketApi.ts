import { apiRequest } from './apiClient';
import { Commodity, MarketDisruption } from '../../shared/types/krishi';

export interface KalimatiBulletinItem {
  commodityId?: string;
  rawName: string;
  nameEn?: string;
  unit: string;
  unitEn?: string;
  category?: 'vegetable' | 'fruit' | 'spice' | 'exotic' | 'other';
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
}

export interface NationalMandiHub {
  id: string;
  name: string;
  nameNe: string;
  province: string;
  provinceNe: string;
  zone: string;
  elevation: string;
  mandiName: string;
  mandiNameNepali: string;
  nearestTerminalName: string;
  highwayRoute: string;
  distanceToKalimatiKm: number;
  soloFreightPerKg: number;
  pooledFreightPerKg: number;
  estimatedWholesalePrice: number;
  estimatedFarmgatePrice: number;
  netPooledVsFarmgateGainPerKg: number;
  ampisHubKey?: string;
  ampisRatio?: number;
  priceSource?: 'official_kalimati' | 'coop_verified' | 'ampis_calibrated';
  priceSourceLabelEn?: string;
  priceSourceLabelNe?: string;
  reportCount?: number;
  borderCheckpoint?: string;
  topCrops: string[];
}

export interface RegionalCropPrice {
  cropId: string;
  name: string;
  nameNepali: string;
  kalimatiPrice: number;
  localizedWholesalePrice: number;
  localizedFarmgatePrice: number;
  ampisRatio: number;
  priceSource: 'official_kalimati' | 'coop_verified' | 'ampis_calibrated';
  priceSourceLabelEn: string;
  priceSourceLabelNe: string;
  reportCount: number;
}

export interface DistrictPriceReport {
  id?: number;
  districtId: string;
  cropId: string;
  marketName: string;
  priceType: 'wholesale' | 'farmgate';
  pricePerKg: number;
  reporterName: string;
  reporterRole: 'farmer' | 'cooperative' | 'mandi_agent';
  reporterPhone?: string;
  recordedDate: string;
  createdAt?: string;
}

export const marketApi = {
  async getCommodities() {
    return apiRequest<{
      success: boolean;
      commodities: Commodity[];
      source?: 'live' | 'fallback';
      totalBulletinCount?: number;
      timestamp: string;
    }>('/api/market/commodities', {
      method: 'GET',
    });
  },

  async getCommodity(cropId: string) {
    return apiRequest<{ success: boolean; commodity: Commodity }>(`/api/market/commodities/${cropId}`, {
      method: 'GET',
    });
  },

  async getFullBulletin(category?: string, search?: string) {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.set('category', category);
    if (search && search.trim()) params.set('search', search.trim());
    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<{
      success: boolean;
      source: 'live' | 'fallback';
      scrapedAt: string;
      totalItems: number;
      items: KalimatiBulletinItem[];
    }>(`/api/market/bulletin${qs}`, {
      method: 'GET',
    });
  },

  async getMandisNetwork(cropId = 'tomato', province?: string, search?: string) {
    const params = new URLSearchParams({ crop: cropId });
    if (province && province !== 'all') params.set('province', province);
    if (search && search.trim()) params.set('search', search.trim());
    return apiRequest<{
      success: boolean;
      cropId: string;
      totalMandis: number;
      mandis: NationalMandiHub[];
    }>(`/api/market/mandis?${params.toString()}`, {
      method: 'GET',
    });
  },

  async getRegionalPrices(districtId: string) {
    return apiRequest<{
      success: boolean;
      district: NationalMandiHub;
      ampisHub: {
        hubKey: string;
        nameEn: string;
        nameNe: string;
        province: string;
        lastObservedLabel: string;
        overallRatioVsKalimati: number;
        source: string;
      };
      prices: RegionalCropPrice[];
      recentReports: DistrictPriceReport[];
    }>(`/api/market/regional-prices/${encodeURIComponent(districtId)}`, {
      method: 'GET',
    });
  },

  async getPriceReports(districtId?: string, cropId?: string) {
    const params = new URLSearchParams();
    if (districtId && districtId !== 'all') params.set('district', districtId);
    if (cropId && cropId !== 'all') params.set('crop', cropId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<{
      success: boolean;
      totalReports: number;
      reports: DistrictPriceReport[];
    }>(`/api/market/price-reports${qs}`, {
      method: 'GET',
    });
  },

  async submitPriceReport(payload: {
    districtId: string;
    cropId: string;
    marketName: string;
    priceType: 'wholesale' | 'farmgate';
    pricePerKg: number;
    reporterName: string;
    reporterRole: 'farmer' | 'cooperative' | 'mandi_agent';
    reporterPhone?: string;
  }) {
    return apiRequest<{ success: boolean; report: DistrictPriceReport }>('/api/market/price-reports', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getDisruptions() {
    return apiRequest<{ success: boolean; disruptions: MarketDisruption[] }>('/api/market/disruptions', {
      method: 'GET',
    });
  },

  async getArbitrage(district = 'chitwan') {
    return apiRequest<{
      success: boolean;
      district: string;
      arbitrage: any[];
      corridors: any[];
    }>(`/api/market/arbitrage?district=${encodeURIComponent(district)}`, {
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
    return apiRequest<{ success: boolean; itemsCount: number; totalBulletinCount?: number; source: string }>('/api/market/scrape', {
      method: 'POST',
    });
  },
};
