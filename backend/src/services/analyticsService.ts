import { authStore } from './authStore';
import { FarmRecordItem } from '../../../shared/types/krishi';

export interface FarmerAnalyticsSummary {
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
}

export class AnalyticsService {
  public static calculateUserAnalytics(userId: string): FarmerAnalyticsSummary {
    const records = authStore.getUserFarmRecords(userId);

    if (!records || records.length === 0) {
      return {
        totalRevenueNPR: 0,
        totalExpensesNPR: 0,
        netProfitNPR: 0,
        netMarginPct: 0,
        totalHarvestKg: 0,
        cropBreakdown: [],
        recentRecordsCount: 0,
        hasRecords: false,
      };
    }

    let totalRevenue = 0;
    let totalExpenses = 0;
    let totalHarvestKg = 0;
    const cropMap = new Map<string, { cropName: string; revenue: number; expenses: number; harvestKg: number }>();

    for (const rec of records) {
      const cropKey = rec.crop.toLowerCase();
      if (!cropMap.has(cropKey)) {
        cropMap.set(cropKey, {
          cropName: rec.cropName || rec.crop,
          revenue: 0,
          expenses: 0,
          harvestKg: 0,
        });
      }

      const entry = cropMap.get(cropKey)!;

      if (rec.record_type === 'revenue') {
        totalRevenue += rec.amount;
        entry.revenue += rec.amount;
      } else if (rec.record_type === 'expense') {
        totalExpenses += rec.amount;
        entry.expenses += rec.amount;
      } else if (rec.record_type === 'harvest' || rec.record_type === 'yield') {
        if (rec.quantityKg) {
          totalHarvestKg += rec.quantityKg;
          entry.harvestKg += rec.quantityKg;
        }
      }
    }

    const netProfit = totalRevenue - totalExpenses;
    const netMarginPct = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

    const cropBreakdown = Array.from(cropMap.entries()).map(([crop, data]) => ({
      crop,
      cropName: data.cropName,
      revenueNPR: data.revenue,
      expensesNPR: data.expenses,
      netNPR: data.revenue - data.expenses,
      harvestKg: data.harvestKg,
    }));

    return {
      totalRevenueNPR: totalRevenue,
      totalExpensesNPR: totalExpenses,
      netProfitNPR: netProfit,
      netMarginPct,
      totalHarvestKg,
      cropBreakdown,
      recentRecordsCount: records.length,
      hasRecords: true,
    };
  }
}
