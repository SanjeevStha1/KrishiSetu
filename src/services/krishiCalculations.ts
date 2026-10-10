import { CustomFarmerInput } from '../types/krishi';
import { COMMODITY_SEEDS, DISTRICT_LIST } from '../data/agriData';
import { getKalimatiCrop, getKalimatiCurrentPrice, getKalimatiCropSummary } from '../data/kalimatiDataset';

export interface ExpectedRevenueParams {
  crop: string | any;
  quantityKg: number;
  district?: string | any;
  farmerReport?: CustomFarmerInput;
}

export interface ExpectedRevenueResult {
  cropId: string;
  cropName: string;
  quantityKg: number;
  expectedMinPrice: number;
  expectedAvgPrice: number;
  expectedMaxPrice: number;
  totalProjectedRevenue: number;
  minProjectedRevenue: number;
  maxProjectedRevenue: number;
  recommendationSentence: string;
  baseReasoning: string;
  adjustmentNote: string;
  discrepancyWarning: string;
  isAdjusted: boolean;
}

export interface InputCostBreakdown {
  seeds: number;
  fertilizer: number;
  labor: number;
  irrigation: number;
  other: number;
}

export interface NetMarginParams {
  totalProjectedRevenue: number;
  minProjectedRevenue?: number;
  maxProjectedRevenue?: number;
  quantityKg: number;
  inputCosts: Partial<InputCostBreakdown>;
}

export interface NetMarginResult {
  totalInputCosts: number;
  costBreakdown: InputCostBreakdown;
  netMargin: number; // expectedRevenue - totalInputCosts
  netMarginLow: number;
  netMarginHigh: number;
  marginPercent: number; // (netMargin / revenue) * 100
  costPerKg: number; // totalInputCosts / quantityKg
  breakEvenPrice: number;
  isProfitable: boolean;
  roiPercent: number; // (netMargin / totalInputCosts) * 100
}

export interface PoolingSavingsParams {
  soloCostPerKg?: number;
  pooledCostPerKg?: number;
  quantityKg: number;
  groupMembersCount?: number;
  district?: string;
}

export interface PoolingSavingsResult {
  soloCostPerKg: number;
  pooledCostPerKg: number;
  savingsPerKg: number;
  savingsTotal: number;
  savingsPercent: number;
}

/**
 * Pure calculation function: Revenue Projection based on Kalimati wholesale time-series
 * and optional farmer custom parameters.
 */
export function calculateExpectedRevenue(params: ExpectedRevenueParams): ExpectedRevenueResult {
  const { crop, quantityKg, district, farmerReport } = params;

  let seedObj: any;
  if (typeof crop === 'string') {
    seedObj = COMMODITY_SEEDS.find((s) => s.id.toLowerCase() === crop.toLowerCase() || s.name.toLowerCase() === crop.toLowerCase());
  } else {
    seedObj = crop;
  }
  if (!seedObj) {
    seedObj = COMMODITY_SEEDS[0];
  }

  const kalimatiSummary = getKalimatiCropSummary(seedObj.id);
  const baseWholesale = kalimatiSummary ? kalimatiSummary.currentPrice : (seedObj.basePrice || seedObj.currentPrice || 40);

  // Ground price range in actual Kalimati IQR distribution (p25 to p75)
  let expectedMinPrice = kalimatiSummary ? Math.round(kalimatiSummary.currentP25) : Math.round(baseWholesale * 0.88);
  let expectedAvgPrice = kalimatiSummary ? Math.round(kalimatiSummary.currentPrice) : Math.round(baseWholesale * 1.05);
  let expectedMaxPrice = kalimatiSummary ? Math.round(kalimatiSummary.currentP75) : Math.round(baseWholesale * 1.25);

  let adjustmentNote = '';
  let discrepancyWarning = '';
  let isAdjusted = false;

  if (farmerReport && farmerReport.isApplied) {
    isAdjusted = true;

    // Soil & Irrigation
    if (farmerReport.soilIrrigation === 'irrigated') {
      expectedAvgPrice = Math.round(expectedAvgPrice * 1.04);
      expectedMaxPrice = Math.round(expectedMaxPrice * 1.05);
    } else {
      expectedMinPrice = Math.round(expectedMinPrice * 0.95);
    }

    // Land scale
    if (farmerReport.landSize === '5_plus') {
      expectedAvgPrice = Math.round(expectedAvgPrice * 0.98);
    } else if (farmerReport.landSize === 'less_than_1') {
      expectedAvgPrice = Math.round(expectedAvgPrice * 1.03);
    }

    // Local price discrepancy check (>15%)
    if (farmerReport.recentLocalPrice && farmerReport.recentLocalPrice > 0) {
      const farmerObserved = farmerReport.recentLocalPrice;
      const diffPct = Math.round(((farmerObserved - expectedAvgPrice) / expectedAvgPrice) * 100);

      if (Math.abs(diffPct) > 15) {
        if (diffPct > 15) {
          discrepancyWarning = `Your reported price (Rs ${farmerObserved}/kg) is ${diffPct}% above regional wholesale benchmarks — could reflect local retail demand.`;
        } else {
          discrepancyWarning = `Your reported price (Rs ${farmerObserved}/kg) is ${Math.abs(diffPct)}% lower than central wholesale rates — transport pooling captures higher margins.`;
        }
        expectedAvgPrice = Math.round(expectedAvgPrice * 0.8 + farmerObserved * 0.2);
        expectedMinPrice = Math.min(expectedMinPrice, Math.round(farmerObserved * 0.9));
        expectedMaxPrice = Math.max(expectedMaxPrice, Math.round(farmerObserved * 1.1));
      }
    }

    adjustmentNote = 'Adjusted for land size, irrigation profile, and local price report.';
  }

  const validQty = Math.max(1, quantityKg);
  const totalProjectedRevenue = Math.round(validQty * expectedAvgPrice);
  const minProjectedRevenue = Math.round(validQty * expectedMinPrice);
  const maxProjectedRevenue = Math.round(validQty * expectedMaxPrice);

  const isHighProfit = expectedAvgPrice >= 40;
  const recommendationSentence = isHighProfit
    ? `Favorable return projected for ${seedObj.name} — align harvest with ${kalimatiSummary ? kalimatiSummary.peakWindow.month : seedObj.bestSeason} to target higher prices.`
    : `Moderate return expected for ${seedObj.name} — monitor arrival volumes to avoid the ${kalimatiSummary ? kalimatiSummary.glutRiskWindow.month : 'seasonal'} glut dip.`;

  const baseReasoning = kalimatiSummary
    ? `Based on 2020–2026 Kalimati dataset (107k+ observations): overall historical average wholesale rate is Rs ${kalimatiSummary.overallAvg}/kg with peak in ${kalimatiSummary.peakWindow.month} (Rs ${kalimatiSummary.peakWindow.historicalAvgPrice}/kg) and glut in ${kalimatiSummary.glutRiskWindow.month} (Rs ${kalimatiSummary.glutRiskWindow.historicalAvgPrice}/kg).`
    : `Prices have followed this seasonal pattern across multi-year Kalimati wholesale arrivals.`;

  return {
    cropId: seedObj.id,
    cropName: seedObj.name,
    quantityKg: validQty,
    expectedMinPrice,
    expectedAvgPrice,
    expectedMaxPrice,
    totalProjectedRevenue,
    minProjectedRevenue,
    maxProjectedRevenue,
    recommendationSentence,
    baseReasoning,
    adjustmentNote,
    discrepancyWarning,
    isAdjusted,
  };
}

/**
 * Pure calculation function: Net Margin & Production Input Cost calculation
 */
export function calculateNetMargin(params: NetMarginParams): NetMarginResult {
  const { totalProjectedRevenue, minProjectedRevenue, maxProjectedRevenue, quantityKg, inputCosts } = params;

  const validQty = Math.max(1, quantityKg);
  const costBreakdown: InputCostBreakdown = {
    seeds: Math.max(0, Number(inputCosts.seeds) || 0),
    fertilizer: Math.max(0, Number(inputCosts.fertilizer) || 0),
    labor: Math.max(0, Number(inputCosts.labor) || 0),
    irrigation: Math.max(0, Number(inputCosts.irrigation) || 0),
    other: Math.max(0, Number(inputCosts.other) || 0),
  };

  const totalInputCosts =
    costBreakdown.seeds +
    costBreakdown.fertilizer +
    costBreakdown.labor +
    costBreakdown.irrigation +
    costBreakdown.other;

  const netMargin = totalProjectedRevenue - totalInputCosts;
  const minRev = minProjectedRevenue ?? Math.round(totalProjectedRevenue * 0.85);
  const maxRev = maxProjectedRevenue ?? Math.round(totalProjectedRevenue * 1.15);

  const netMarginLow = minRev - totalInputCosts;
  const netMarginHigh = maxRev - totalInputCosts;

  const marginPercent = totalProjectedRevenue > 0
    ? Math.round((netMargin / totalProjectedRevenue) * 100)
    : 0;

  const costPerKg = Math.round((totalInputCosts / validQty) * 10) / 10;
  const breakEvenPrice = costPerKg;
  const isProfitable = netMargin > 0;

  const roiPercent = totalInputCosts > 0
    ? Math.round((netMargin / totalInputCosts) * 100)
    : totalProjectedRevenue > 0 ? 100 : 0;

  return {
    totalInputCosts,
    costBreakdown,
    netMargin,
    netMarginLow,
    netMarginHigh,
    marginPercent,
    costPerKg,
    breakEvenPrice,
    isProfitable,
    roiPercent,
  };
}

/**
 * Pure calculation function: Cooperative transport pooling savings calculation
 */
export function calculatePoolingSavings(params: PoolingSavingsParams): PoolingSavingsResult {
  const solo = params.soloCostPerKg ?? 8.5;
  const pooled = params.pooledCostPerKg ?? 3.5;
  const qty = Math.max(1, params.quantityKg);

  const savingsPerKg = Math.max(0, solo - pooled);
  const savingsTotal = Math.round(savingsPerKg * qty);
  const savingsPercent = solo > 0 ? Math.round((savingsPerKg / solo) * 100) : 58;

  return {
    soloCostPerKg: solo,
    pooledCostPerKg: pooled,
    savingsPerKg,
    savingsTotal,
    savingsPercent,
  };
}
