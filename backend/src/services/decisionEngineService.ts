import { Commodity } from '../../../shared/types/krishi';
import { MarketDataService } from './marketDataService';
import { getKalimatiCrop, getKalimatiCurrentPrice } from '../data/kalimatiDataset';

export interface CropRecommendation {
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
}

export class DecisionEngineService {
  public static getRecommendations(params: {
    district?: string;
    landSizeRopani?: number;
    primaryCrops?: string[];
  }): CropRecommendation[] {
    const district = (params.district || 'chitwan').toLowerCase();
    const landSize = params.landSizeRopani || 1.0;
    const commodities = MarketDataService.getCommodities();

    return commodities.map((c) => {
      const kalimatiData = getKalimatiCrop(c.id);
      const yieldKg = c.id === 'tomato' ? 650 : c.id === 'potato' ? 850 : c.id === 'cauliflower' ? 500 : c.id === 'green_chilli' ? 350 : 600;
      const expectedSalePrice = c.forecast30Day || getKalimatiCurrentPrice(c.id) || c.currentPrice;
      const grossRevenue = yieldKg * expectedSalePrice * landSize;
      
      // Cost per kg grounded in realistic agricultural inputs
      const costPerKg = c.id === 'tomato' ? 16 : c.id === 'potato' ? 12 : c.id === 'cauliflower' ? 15 : c.id === 'green_chilli' ? 35 : 14;
      const totalInputCost = yieldKg * costPerKg * landSize;
      const netProfit = grossRevenue - totalInputCost;
      const profitMarginPct = Math.round((netProfit / grossRevenue) * 100);

      const peakWindow = kalimatiData ? `${kalimatiData.peakWindow.month} (Avg Rs ${kalimatiData.peakWindow.historicalAvgPrice}/kg)` : c.harvestWindow;
      const glutWindow = kalimatiData ? `${kalimatiData.glutRiskWindow.month} (Rs ${kalimatiData.glutRiskWindow.historicalAvgPrice}/kg)` : 'seasonal low';

      return {
        cropId: c.id,
        cropName: c.name,
        cropNameNepali: c.nameNepali,
        emoji: c.emoji,
        confidenceScore: c.confidenceScore,
        expectedRevenuePerRopaniNPR: Math.round(grossRevenue / landSize),
        estimatedInputCostPerRopaniNPR: Math.round(totalInputCost / landSize),
        estimatedNetProfitPerRopaniNPR: Math.round(netProfit / landSize),
        profitMarginPct,
        recommendedHarvestMonth: c.harvestWindow,
        marketRiskLevel: c.sentiment === 'bullish' ? 'low' : c.sentiment === 'neutral' ? 'moderate' : 'high',
        kalimatiTrend: c.sentiment,
        keyAdvantage: `Kalimati 30-day projected rate is Rs ${expectedSalePrice}/kg. Historical peak window: ${peakWindow}. Avoid glut in ${glutWindow}.`,
        keyAdvantageNepali: `कालीमाटी ३० दिने प्रक्षेपित दर रु ${expectedSalePrice}/केजी। ऐतिहासिक उच्च दर: ${peakWindow}।`,
        transportAdvice: `Freight pooling from ${district.toUpperCase()} saves ~Rs 5.1/kg compared to solo mini-truck dispatch.`,
        transportAdviceNepali: `${district.toUpperCase()} बाट साझा ढुवानी गर्दा एक्लै पठाउनुभन्दा प्रतिकिलो रु ५.१ बचत हुन्छ।`,
      };
    });
  }
}
