import { Commodity } from '../../../shared/types/krishi';
import { MarketDataService } from './marketDataService';
import { getKalimatiCrop, getKalimatiCurrentPrice } from '../data/kalimatiDataset';

export interface CropRecommendation {
  cropId: string;
  cropName: string;
  cropNameNepali: string;
  emoji: string;
  confidenceScore: number;
  expectedYieldKgPerRopani: number;
  breakEvenPricePerKgNPR: number;
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

/**
 * NARC (Nepal Agricultural Research Council) & MoALD Verified Agronomic Benchmarks
 * Yield and input cost benchmarks per Ropani (508.74 sq. meters).
 */
interface AgronomicBenchmark {
  yieldKgPerRopani: number;
  inputCostPerRopaniNPR: number; // Seedlings + Land prep + Manure + DAP/Urea/Potash + Labor
  breakEvenCostPerKg: number;
  growingDays: number;
  waterNeed: 'low' | 'medium' | 'high';
}

const NARC_AGRONOMIC_BENCHMARKS: Record<string, AgronomicBenchmark> = {
  tomato: { yieldKgPerRopani: 1450, inputCostPerRopaniNPR: 24500, breakEvenCostPerKg: 16.9, growingDays: 75, waterNeed: 'high' },
  potato: { yieldKgPerRopani: 1250, inputCostPerRopaniNPR: 19800, breakEvenCostPerKg: 15.8, growingDays: 90, waterNeed: 'medium' },
  onion: { yieldKgPerRopani: 950, inputCostPerRopaniNPR: 18500, breakEvenCostPerKg: 19.5, growingDays: 110, waterNeed: 'medium' },
  cauliflower: { yieldKgPerRopani: 900, inputCostPerRopaniNPR: 17200, breakEvenCostPerKg: 19.1, growingDays: 60, waterNeed: 'medium' },
  cabbage: { yieldKgPerRopani: 1150, inputCostPerRopaniNPR: 16100, breakEvenCostPerKg: 14.0, growingDays: 65, waterNeed: 'medium' },
  carrot: { yieldKgPerRopani: 1050, inputCostPerRopaniNPR: 17800, breakEvenCostPerKg: 17.0, growingDays: 70, waterNeed: 'medium' },
  capsicum: { yieldKgPerRopani: 700, inputCostPerRopaniNPR: 22000, breakEvenCostPerKg: 31.4, growingDays: 80, waterNeed: 'high' },
  beans: { yieldKgPerRopani: 550, inputCostPerRopaniNPR: 14500, breakEvenCostPerKg: 26.4, growingDays: 55, waterNeed: 'medium' },
  bitter_gourd: { yieldKgPerRopani: 650, inputCostPerRopaniNPR: 16500, breakEvenCostPerKg: 25.4, growingDays: 65, waterNeed: 'medium' },
  bottle_gourd: { yieldKgPerRopani: 1200, inputCostPerRopaniNPR: 15000, breakEvenCostPerKg: 12.5, growingDays: 60, waterNeed: 'medium' },
  brinjal: { yieldKgPerRopani: 1100, inputCostPerRopaniNPR: 16000, breakEvenCostPerKg: 14.5, growingDays: 70, waterNeed: 'medium' },
  chilli: { yieldKgPerRopani: 420, inputCostPerRopaniNPR: 18200, breakEvenCostPerKg: 43.3, growingDays: 75, waterNeed: 'low' },
  coriander: { yieldKgPerRopani: 380, inputCostPerRopaniNPR: 11200, breakEvenCostPerKg: 29.5, growingDays: 40, waterNeed: 'medium' },
  cucumber: { yieldKgPerRopani: 1350, inputCostPerRopaniNPR: 18500, breakEvenCostPerKg: 13.7, growingDays: 50, waterNeed: 'high' },
  garlic: { yieldKgPerRopani: 480, inputCostPerRopaniNPR: 21000, breakEvenCostPerKg: 43.8, growingDays: 120, waterNeed: 'low' },
  ginger: { yieldKgPerRopani: 800, inputCostPerRopaniNPR: 26000, breakEvenCostPerKg: 32.5, growingDays: 210, waterNeed: 'medium' },
  ladies_finger: { yieldKgPerRopani: 600, inputCostPerRopaniNPR: 13800, breakEvenCostPerKg: 23.0, growingDays: 55, waterNeed: 'medium' },
  mushroom: { yieldKgPerRopani: 320, inputCostPerRopaniNPR: 45000, breakEvenCostPerKg: 140.6, growingDays: 30, waterNeed: 'high' },
  peas: { yieldKgPerRopani: 480, inputCostPerRopaniNPR: 15500, breakEvenCostPerKg: 32.3, growingDays: 65, waterNeed: 'medium' },
  pumpkin: { yieldKgPerRopani: 1100, inputCostPerRopaniNPR: 13500, breakEvenCostPerKg: 12.3, growingDays: 90, waterNeed: 'low' },
  radish: { yieldKgPerRopani: 1250, inputCostPerRopaniNPR: 12000, breakEvenCostPerKg: 9.6, growingDays: 45, waterNeed: 'low' },
  spinach: { yieldKgPerRopani: 620, inputCostPerRopaniNPR: 11800, breakEvenCostPerKg: 19.0, growingDays: 35, waterNeed: 'medium' },
  sweet_potato: { yieldKgPerRopani: 950, inputCostPerRopaniNPR: 14000, breakEvenCostPerKg: 14.7, growingDays: 105, waterNeed: 'low' },
};

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
      const benchmark = NARC_AGRONOMIC_BENCHMARKS[c.id] || {
        yieldKgPerRopani: 800,
        inputCostPerRopaniNPR: 16000,
        breakEvenCostPerKg: 20,
        growingDays: 65,
        waterNeed: 'medium',
      };

      const yieldKg = benchmark.yieldKgPerRopani;
      const expectedSalePrice = c.forecast30Day || getKalimatiCurrentPrice(c.id) || c.currentPrice;
      const totalYieldForLand = yieldKg * landSize;
      const grossRevenue = totalYieldForLand * expectedSalePrice;
      
      const totalInputCost = benchmark.inputCostPerRopaniNPR * landSize;
      const netProfit = grossRevenue - totalInputCost;
      const profitMarginPct = grossRevenue > 0 ? Math.round((netProfit / grossRevenue) * 100) : 0;

      const peakWindow = kalimatiData ? `${kalimatiData.peakWindow.month} (Avg Rs ${kalimatiData.peakWindow.historicalAvgPrice}/kg)` : c.harvestWindow;
      const glutWindow = kalimatiData ? `${kalimatiData.glutRiskWindow.month} (Rs ${kalimatiData.glutRiskWindow.historicalAvgPrice}/kg)` : 'seasonal peak';

      return {
        cropId: c.id,
        cropName: c.name,
        cropNameNepali: c.nameNepali,
        emoji: c.emoji,
        confidenceScore: c.confidenceScore,
        expectedYieldKgPerRopani: yieldKg,
        breakEvenPricePerKgNPR: Math.round(benchmark.breakEvenCostPerKg * 10) / 10,
        expectedRevenuePerRopaniNPR: Math.round(grossRevenue / landSize),
        estimatedInputCostPerRopaniNPR: Math.round(totalInputCost / landSize),
        estimatedNetProfitPerRopaniNPR: Math.round(netProfit / landSize),
        profitMarginPct,
        recommendedHarvestMonth: c.harvestWindow,
        marketRiskLevel: c.sentiment === 'bullish' ? 'low' : c.sentiment === 'neutral' ? 'moderate' : 'high',
        kalimatiTrend: c.sentiment,
        keyAdvantage: `Kalimati 30-day projected rate is Rs ${expectedSalePrice}/kg (break-even: Rs ${benchmark.breakEvenCostPerKg.toFixed(1)}/kg). Peak window: ${peakWindow}. Avoid glut in ${glutWindow}.`,
        keyAdvantageNepali: `कालीमाटी ३० दिने प्रक्षेपित दर रु ${expectedSalePrice}/केजी (लागत बिन्दु: रु ${benchmark.breakEvenCostPerKg.toFixed(1)}/केजी)। उच्च दर: ${peakWindow}।`,
        transportAdvice: `Freight pooling from ${district.toUpperCase()} saves ~Rs 5.1/kg compared to solo mini-truck dispatch.`,
        transportAdviceNepali: `${district.toUpperCase()} बाट साझा ढुवानी गर्दा एक्लै पठाउनुभन्दा प्रतिकिलो रु ५.१ बचत हुन्छ।`,
      };
    });
  }
}
