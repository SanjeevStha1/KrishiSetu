import { apiRequest } from './apiClient';

export interface DecisionEngineRecommendationsResponse {
  success: boolean;
  district: string;
  recommendations: Array<{
    cropId: string;
    cropName: string;
    cropNameNepali: string;
    emoji: string;
    confidenceScore: number;
    expectedRevenuePerRopaniNPR: number;
    estimatedInputCostPerRopaniNPR: number;
    estimatedNetProfitPerRopaniNPR: number;
    profitMarginPct: number;
    recommendedHarvestMonth: string;
    marketRiskLevel: 'low' | 'moderate' | 'high';
    kalimatiTrend: 'bullish' | 'bearish' | 'neutral';
    keyAdvantage: string;
    keyAdvantageNepali: string;
    transportAdvice: string;
    transportAdviceNepali: string;
  }>;
}

export interface FarmAnalyticsResponse {
  success: boolean;
  userId: string;
  analytics: {
    totalRevenueNPR: number;
    totalExpensesNPR: number;
    netProfitNPR: number;
    netMarginPct: number;
    totalHarvestKg: number;
    cropBreakdown: Array<{
      crop: string;
      cropName: string;
      revenueNPR: number;
      expensesNPR: number;
      netNPR: number;
      harvestKg: number;
    }>;
    recentRecordsCount: number;
    hasRecords: boolean;
  };
}

export const decisionEngineApi = {
  async getRecommendations(params: { district?: string; landSizeRopani?: number; primaryCrops?: string[] } = {}) {
    const query = new URLSearchParams();
    if (params.district) query.set('district', params.district);
    if (params.landSizeRopani) query.set('landSizeRopani', String(params.landSizeRopani));
    if (params.primaryCrops && params.primaryCrops.length > 0) query.set('primaryCrops', params.primaryCrops.join(','));

    return apiRequest<DecisionEngineRecommendationsResponse>(`/api/decision-engine/recommendations?${query.toString()}`, {
      method: 'GET',
    });
  },

  async getAnalytics() {
    return apiRequest<FarmAnalyticsResponse>('/api/decision-engine/analytics', {
      method: 'GET',
    });
  },
};
