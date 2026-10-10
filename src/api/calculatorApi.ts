import { apiRequest } from './apiClient';
import { CalculatorEstimate } from '../../shared/types/krishi';

export const calculatorApi = {
  async getAiEstimate(params: {
    cropId: string;
    district: string;
    landSize: number;
    landUnit: string;
    landSizeRopani?: number;
    notes?: string;
  }) {
    return apiRequest<{ success: boolean; estimate: CalculatorEstimate; source: string }>('/api/calculator/ai-estimate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async simulateMargin(params: {
    quantityKg: number;
    expectedPricePerKg: number;
    inputCostPerKg: number;
    soloFreightPerKg: number;
    pooledFreightPerKg: number;
  }) {
    return apiRequest<{
      success: boolean;
      simulation: {
        quantityKg: number;
        expectedPricePerKg: number;
        grossRevenue: number;
        productionCost: number;
        soloTransportCost: number;
        pooledTransportCost: number;
        soloNetProfit: number;
        pooledNetProfit: number;
        poolingSavings: number;
        soloMarginPct: number;
        pooledMarginPct: number;
      };
    }>('/api/calculator/simulate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};
