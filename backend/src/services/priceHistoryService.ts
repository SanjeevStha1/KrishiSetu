import fs from 'fs';
import path from 'path';
import { KALIMATI_DATASET, getKalimatiCrop } from '../data/kalimatiDataset';

export interface PriceRecord {
  cropId: string;
  date: string; // YYYY-MM-DD
  price: number;
  minPrice?: number;
  maxPrice?: number;
  source?: 'live' | 'fallback';
}

export interface ComputedForecast {
  forecast7Day: number;
  forecast14Day: number;
  forecast30Day: number;
  threeMonthForecast: number;
  fiveMonthForecast: number;
}

const TRACKED_CROPS = [
  'tomato', 'potato', 'onion', 'cauliflower', 'cabbage', 'carrot',
  'capsicum', 'beans', 'peas', 'bitter_gourd', 'bottle_gourd', 'brinjal',
  'chilli', 'coriander', 'cucumber', 'garlic', 'ginger', 'ladies_finger',
  'mushroom', 'pumpkin', 'radish', 'spinach', 'sweet_potato',
];

const EXTRA_FALLBACK_RATES: Record<string, { current: number; min: number; max: number }> = {
  capsicum: { current: 68, min: 55, max: 82 },
  sweet_potato: { current: 48, min: 40, max: 58 },
};

export class PriceHistoryService {
  private static records: Map<string, PriceRecord> = new Map(); // key: `${cropId}:${date}`
  private static isInitialized = false;

  private static normalizeCropKey(cropId: string): string {
    const clean = (cropId || '').toLowerCase().trim();
    return clean === 'green_chilli' ? 'chilli' : clean;
  }

  private static getStorageFilePath(): string {
    const dataDir = path.join(process.cwd(), 'backend', 'src', 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (e) {
        console.warn('[PriceHistoryService] Failed to create data directory:', e);
      }
    }
    return path.join(dataDir, 'price_history.json');
  }

  /**
   * Initializes the service and loads existing price history from disk
   */
  public static init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;
    this.loadFromDisk();
    this.seedHistoryFromKalimatiDatasetIfSparse();
  }

  /**
   * Seeds realistic historical daily records grounded in the 2020-2026 Kalimati dataset
   * across all 23 tracked crops when local disk history has < 7 days for a crop.
   */
  private static seedHistoryFromKalimatiDatasetIfSparse(): void {
    let needsSave = false;
    const now = new Date();
    const currentMonthIdx = now.getMonth();

    for (const cropId of TRACKED_CROPS) {
      const existing = this.getHistory(cropId);
      if (existing.length < 7) {
        const datasetCrop = getKalimatiCrop(cropId);
        const monthSeason = datasetCrop?.monthlySeasonality?.[currentMonthIdx];
        const prevMonthIdx = (currentMonthIdx + 11) % 12;
        const prevSeason = datasetCrop?.monthlySeasonality?.[prevMonthIdx];

        const extra = EXTRA_FALLBACK_RATES[cropId];
        const currentAnchor = monthSeason
          ? Math.round(monthSeason.avgPriceNPR)
          : (extra?.current || 55);
        const prevAnchor = prevSeason
          ? Math.round(prevSeason.avgPriceNPR)
          : Math.round(currentAnchor * 0.96);

        const spreadHalf = monthSeason
          ? Math.max(3, Math.round((monthSeason.p75NPR - monthSeason.p25NPR) * 0.25))
          : Math.max(4, Math.round(currentAnchor * 0.1));

        for (let i = 14; i >= 1; i--) {
          const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const dateStr = d.toISOString().split('T')[0];
          const key = `${cropId}:${dateStr}`;

          if (!this.records.has(key)) {
            const step = (14 - i) / 13;
            const seasonalWave = Math.sin(i * 0.65) * Math.min(spreadHalf * 0.45, currentAnchor * 0.05);
            const price = Math.max(10, Math.round(prevAnchor + (currentAnchor - prevAnchor) * step + seasonalWave));

            this.records.set(key, {
              cropId,
              date: dateStr,
              price,
              minPrice: Math.max(8, price - spreadHalf),
              maxPrice: price + spreadHalf,
              source: 'fallback',
            });
            needsSave = true;
          }
        }

        const todayStr = now.toISOString().split('T')[0];
        const todayKey = `${cropId}:${todayStr}`;
        if (!this.records.has(todayKey)) {
          this.records.set(todayKey, {
            cropId,
            date: todayStr,
            price: currentAnchor,
            minPrice: extra?.min || Math.max(8, currentAnchor - spreadHalf),
            maxPrice: extra?.max || currentAnchor + spreadHalf,
            source: 'fallback',
          });
          needsSave = true;
        }
      }
    }

    if (needsSave) {
      this.saveToDisk();
    }
  }

  /**
   * Loads persisted price history from JSON file
   */
  public static loadFromDisk(): void {
    try {
      const filePath = this.getStorageFilePath();
      if (!fs.existsSync(filePath)) {
        return;
      }

      const raw = fs.readFileSync(filePath, 'utf-8');
      if (!raw || !raw.trim()) {
        return;
      }

      const parsed = JSON.parse(raw);
      const list: PriceRecord[] = Array.isArray(parsed)
        ? parsed
        : (Array.isArray(parsed?.records) ? parsed.records : []);

      this.records.clear();
      for (const item of list) {
        if (item && item.cropId && item.date && typeof item.price === 'number') {
          const normId = this.normalizeCropKey(item.cropId);
          const key = `${normId}:${item.date}`;
          this.records.set(key, {
            cropId: normId,
            date: item.date,
            price: Number(item.price),
            minPrice: typeof item.minPrice === 'number' ? item.minPrice : undefined,
            maxPrice: typeof item.maxPrice === 'number' ? item.maxPrice : undefined,
            source: item.source || 'fallback',
          });
        }
      }
    } catch (err) {
      console.warn('[PriceHistoryService] Could not load price_history.json:', err);
    }
  }

  /**
   * Persists in-memory price history to disk
   */
  public static saveToDisk(): void {
    try {
      const filePath = this.getStorageFilePath();
      const allRecords = Array.from(this.records.values());
      fs.writeFileSync(
        filePath,
        JSON.stringify({ records: allRecords, totalRecords: allRecords.length, updatedAt: new Date().toISOString() }, null, 2),
        'utf-8'
      );
    } catch (err) {
      console.warn('[PriceHistoryService] Could not persist price history to disk:', err);
    }
  }

  /**
   * Saves a single price record with duplicate protection.
   */
  public static saveRecord(record: PriceRecord): void {
    this.init();
    const cleanCropId = this.normalizeCropKey(record.cropId);
    const key = `${cleanCropId}:${record.date}`;

    this.records.set(key, {
      cropId: cleanCropId,
      date: record.date,
      price: Math.round(record.price * 100) / 100,
      minPrice: typeof record.minPrice === 'number' ? Math.round(record.minPrice * 100) / 100 : undefined,
      maxPrice: typeof record.maxPrice === 'number' ? Math.round(record.maxPrice * 100) / 100 : undefined,
      source: record.source || 'live',
    });

    this.saveToDisk();
  }

  /**
   * Saves multiple price records with duplicate protection and a single write-through
   */
  public static saveRecords(records: PriceRecord[]): void {
    this.init();
    for (const record of records) {
      const cleanCropId = this.normalizeCropKey(record.cropId);
      const key = `${cleanCropId}:${record.date}`;
      this.records.set(key, {
        cropId: cleanCropId,
        date: record.date,
        price: Math.round(record.price * 100) / 100,
        minPrice: typeof record.minPrice === 'number' ? Math.round(record.minPrice * 100) / 100 : undefined,
        maxPrice: typeof record.maxPrice === 'number' ? Math.round(record.maxPrice * 100) / 100 : undefined,
        source: record.source || 'live',
      });
    }
    this.saveToDisk();
  }

  /**
   * Retrieves historical records for a specific crop (oldest -> newest).
   */
  public static getHistory(cropId: string, days?: number): PriceRecord[] {
    this.init();
    const targetCrop = this.normalizeCropKey(cropId);
    const matched: PriceRecord[] = [];

    for (const rec of this.records.values()) {
      if (rec.cropId === targetCrop) {
        matched.push(rec);
      }
    }

    matched.sort((a, b) => a.date.localeCompare(b.date));

    if (typeof days === 'number' && days > 0) {
      return matched.slice(-days);
    }

    return matched.slice(-30);
  }

  public static getHistoryCount(cropId?: string): number {
    this.init();
    if (!cropId) return this.records.size;
    return this.getHistory(cropId).length;
  }

  /**
   * Computes deterministic econometric + seasonal forecasts grounded in 6-year Kalimati dataset
   */
  public static computeForecast(
    cropId: string,
    currentPrice?: number,
    baselineSeed?: {
      currentPrice: number;
      forecast7Day: number;
      forecast14Day: number;
      forecast30Day: number;
      threeMonthForecast?: number;
      fiveMonthForecast?: number;
    }
  ): ComputedForecast {
    this.init();
    const normCropId = this.normalizeCropKey(cropId);
    const history = this.getHistory(normCropId);
    const cur = (typeof currentPrice === 'number' && currentPrice > 0)
      ? currentPrice
      : (history.length > 0 ? history[history.length - 1].price : (baselineSeed?.currentPrice || 50));

    if (!baselineSeed && history.length === 0) {
      const safeCur = Math.max(1, Math.round(cur));
      return {
        forecast7Day: safeCur,
        forecast14Day: safeCur,
        forecast30Day: safeCur,
        threeMonthForecast: safeCur,
        fiveMonthForecast: safeCur,
      };
    }

    if (history.length < 2 && baselineSeed) {
      const basePrice = baselineSeed.currentPrice > 0 ? baselineSeed.currentPrice : cur;
      const rawRatio = cur / basePrice;
      const ratio = Math.max(0.4, Math.min(2.5, isFinite(rawRatio) ? rawRatio : 1));

      return {
        forecast7Day: Math.max(1, Math.round(baselineSeed.forecast7Day * ratio)),
        forecast14Day: Math.max(1, Math.round(baselineSeed.forecast14Day * ratio)),
        forecast30Day: Math.max(1, Math.round(baselineSeed.forecast30Day * ratio)),
        threeMonthForecast: Math.max(1, Math.round((baselineSeed.threeMonthForecast || baselineSeed.forecast30Day) * ratio)),
        fiveMonthForecast: Math.max(1, Math.round((baselineSeed.fiveMonthForecast || baselineSeed.forecast30Day) * ratio)),
      };
    }

    const n = history.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    for (let i = 0; i < n; i++) {
      const x = i;
      const y = history[i].price;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    }

    const denom = n * sumXX - sumX * sumX;
    const rawSlope = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0;

    const maxDailyChange = cur * 0.03;
    const slope = Math.max(-maxDailyChange, Math.min(maxDailyChange, isFinite(rawSlope) ? rawSlope : 0));

    let f7 = Math.max(1, Math.round(cur + slope * 7 * 0.85));
    let f14 = Math.max(1, Math.round(cur + slope * 14 * 0.70));
    let f30 = Math.max(1, Math.round(cur + slope * 30 * 0.50));

    let f3m = f30;
    let f5m = f30;

    const cropSeasonal = getKalimatiCrop(normCropId);
    if (cropSeasonal && cropSeasonal.monthlySeasonality && cropSeasonal.monthlySeasonality.length === 12) {
      const currentMonthIdx = new Date().getMonth();
      const nextMonthIdx = (currentMonthIdx + 1) % 12;
      const m3Idx = (currentMonthIdx + 3) % 12;
      const m5Idx = (currentMonthIdx + 5) % 12;

      const currentSeasonalAvg = cropSeasonal.monthlySeasonality[currentMonthIdx]?.avgPriceNPR || cur;
      const nextSeasonalAvg = cropSeasonal.monthlySeasonality[nextMonthIdx]?.avgPriceNPR || currentSeasonalAvg;
      const m3SeasonalAvg = cropSeasonal.monthlySeasonality[m3Idx]?.avgPriceNPR || currentSeasonalAvg;
      const m5SeasonalAvg = cropSeasonal.monthlySeasonality[m5Idx]?.avgPriceNPR || currentSeasonalAvg;

      const s1Multiplier = currentSeasonalAvg > 0 ? nextSeasonalAvg / currentSeasonalAvg : 1;
      const s3Multiplier = currentSeasonalAvg > 0 ? m3SeasonalAvg / currentSeasonalAvg : 1;
      const s5Multiplier = currentSeasonalAvg > 0 ? m5SeasonalAvg / currentSeasonalAvg : 1;

      f30 = Math.max(1, Math.round(f30 * 0.65 + (cur * s1Multiplier) * 0.35));
      f3m = Math.max(1, Math.round(cur * 0.4 + cur * s3Multiplier * 0.6));
      f5m = Math.max(1, Math.round(cur * 0.4 + cur * s5Multiplier * 0.6));
    } else if (baselineSeed) {
      const basePrice = baselineSeed.currentPrice > 0 ? baselineSeed.currentPrice : cur;
      const ratio = Math.max(0.4, Math.min(2.5, cur / basePrice));
      f3m = Math.max(1, Math.round((baselineSeed.threeMonthForecast || cur) * ratio));
      f5m = Math.max(1, Math.round((baselineSeed.fiveMonthForecast || cur) * ratio));
    }

    return {
      forecast7Day: isFinite(f7) ? f7 : (baselineSeed?.forecast7Day || cur),
      forecast14Day: isFinite(f14) ? f14 : (baselineSeed?.forecast14Day || cur),
      forecast30Day: isFinite(f30) ? f30 : (baselineSeed?.forecast30Day || cur),
      threeMonthForecast: isFinite(f3m) ? f3m : (baselineSeed?.threeMonthForecast || cur),
      fiveMonthForecast: isFinite(f5m) ? f5m : (baselineSeed?.fiveMonthForecast || cur),
    };
  }
}
