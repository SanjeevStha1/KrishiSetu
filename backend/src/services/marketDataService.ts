import { Commodity, MarketDisruption } from '../../../shared/types/krishi';
import {
  KALIMATI_DATASET,
  getKalimatiCrop,
  getKalimatiCurrentPrice,
} from '../data/kalimatiDataset';
import { KalimatiScraper } from '../scrapers/kalimatiScraper';
import { PriceHistoryService, PriceRecord } from './priceHistoryService';

export const COMMODITY_SEEDS: Commodity[] = [
  {
    id: 'tomato',
    name: 'Tomato (Local)',
    nameNepali: 'गोलभेडा (स्थानीय)',
    category: 'vegetable',
    categoryNepali: 'तरकारी',
    currentPrice: 53,
    minPrice: 38,
    maxPrice: 70,
    yesterdayPrice: 51,
    unit: 'kg',
    unitNepali: 'केजी',
    arrivalsTodayTons: 52.5,
    arrivalsYesterdayTons: 58.0,
    sentiment: 'bullish',
    confidenceScore: 91,
    forecast7Day: 56,
    forecast14Day: 61,
    forecast30Day: 68,
    threeMonthForecast: 64,
    fiveMonthForecast: 48,
    seasonalityScore: 89,
    harvestWindow: 'Kartik - Mangsir (Nov Peak: Rs 70.2)',
    bestSellingMandi: 'Kalimati Mandi, Kathmandu',
    bestSellingMandiNepali: 'कालीमाटी फलफूल तथा तरकारी बजार, काठमाडौं',
    interDistrictArbitrageNPR: 16.5,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
    color: '#ef4444',
    emoji: '🍅',
  },
  {
    id: 'potato',
    name: 'Red Potato',
    nameNepali: 'रातो आलु',
    category: 'vegetable',
    categoryNepali: 'तरकारी',
    currentPrice: 32,
    minPrice: 27,
    maxPrice: 60,
    yesterdayPrice: 32,
    unit: 'kg',
    unitNepali: 'केजी',
    arrivalsTodayTons: 115.0,
    arrivalsYesterdayTons: 110.0,
    sentiment: 'neutral',
    confidenceScore: 94,
    forecast7Day: 33,
    forecast14Day: 36,
    forecast30Day: 42,
    threeMonthForecast: 52,
    fiveMonthForecast: 59,
    seasonalityScore: 92,
    harvestWindow: 'Ashwin - Kartik (Oct Peak: Rs 59.5)',
    bestSellingMandi: 'Balkhu Wholesale Market, Kathmandu',
    bestSellingMandiNepali: 'बल्खु कृषि बजार, काठमाडौं',
    interDistrictArbitrageNPR: 9.0,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80',
    color: '#b45309',
    emoji: '🥔',
  },
  {
    id: 'cauliflower',
    name: 'Cauliflower (Local)',
    nameNepali: 'काउली (स्थानीय)',
    category: 'vegetable',
    categoryNepali: 'तरकारी',
    currentPrice: 65,
    minPrice: 35,
    maxPrice: 151,
    yesterdayPrice: 62,
    unit: 'kg',
    unitNepali: 'केजी',
    arrivalsTodayTons: 38.0,
    arrivalsYesterdayTons: 42.0,
    sentiment: 'bullish',
    confidenceScore: 87,
    forecast7Day: 72,
    forecast14Day: 84,
    forecast30Day: 110,
    threeMonthForecast: 135,
    fiveMonthForecast: 150,
    seasonalityScore: 94,
    harvestWindow: 'Bhadra - Ashwin (Sep Peak: Rs 150.5)',
    bestSellingMandi: 'Kalimati Mandi, Kathmandu',
    bestSellingMandiNepali: 'कालीमाटी बजार, काठमाडौं',
    interDistrictArbitrageNPR: 18.5,
    image: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=600&auto=format&fit=crop&q=80',
    color: '#15803d',
    emoji: '🥦',
  },
  {
    id: 'cabbage',
    name: 'Cabbage',
    nameNepali: 'बन्दा गोभी',
    category: 'vegetable',
    categoryNepali: 'तरकारी',
    currentPrice: 47,
    minPrice: 31,
    maxPrice: 121,
    yesterdayPrice: 45,
    unit: 'kg',
    unitNepali: 'केजी',
    arrivalsTodayTons: 48.0,
    arrivalsYesterdayTons: 50.0,
    sentiment: 'bullish',
    confidenceScore: 86,
    forecast7Day: 52,
    forecast14Day: 60,
    forecast30Day: 85,
    threeMonthForecast: 110,
    fiveMonthForecast: 120,
    seasonalityScore: 91,
    harvestWindow: 'Bhadra - Ashwin (Sep Peak: Rs 120.7)',
    bestSellingMandi: 'Tukucha Market, Kathmandu',
    bestSellingMandiNepali: 'टुकुचा बजार, काठमाडौं',
    interDistrictArbitrageNPR: 14.0,
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=80',
    color: '#16a34a',
    emoji: '🥬',
  },
  {
    id: 'onion',
    name: 'Dry Onion (Imported)',
    nameNepali: 'सुकेको प्याज (आयातित)',
    category: 'vegetable',
    categoryNepali: 'तरकारी',
    currentPrice: 44,
    minPrice: 40,
    maxPrice: 78,
    yesterdayPrice: 45,
    unit: 'kg',
    unitNepali: 'केजी',
    arrivalsTodayTons: 92.0,
    arrivalsYesterdayTons: 88.0,
    sentiment: 'neutral',
    confidenceScore: 93,
    forecast7Day: 46,
    forecast14Day: 50,
    forecast30Day: 58,
    threeMonthForecast: 68,
    fiveMonthForecast: 78,
    seasonalityScore: 89,
    harvestWindow: 'Ashwin - Kartik (Oct Peak: Rs 78.1)',
    bestSellingMandi: 'Kalimati Mandi, Kathmandu',
    bestSellingMandiNepali: 'कालीमाटी बजार, काठमाडौं',
    interDistrictArbitrageNPR: 12.0,
    image: 'https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?w=600&auto=format&fit=crop&q=80',
    color: '#d97706',
    emoji: '🧅',
  },
  {
    id: 'green_chilli',
    name: 'Green Chilli',
    nameNepali: 'हरियो खुर्सानी',
    category: 'vegetable',
    categoryNepali: 'तरकारी',
    currentPrice: 167,
    minPrice: 89,
    maxPrice: 168,
    yesterdayPrice: 164,
    unit: 'kg',
    unitNepali: 'केजी',
    arrivalsTodayTons: 16.0,
    arrivalsYesterdayTons: 15.0,
    sentiment: 'bullish',
    confidenceScore: 84,
    forecast7Day: 165,
    forecast14Day: 158,
    forecast30Day: 145,
    threeMonthForecast: 110,
    fiveMonthForecast: 92,
    seasonalityScore: 82,
    harvestWindow: 'Falgun - Chaitra (Mar Peak: Rs 163.2)',
    bestSellingMandi: 'Kalimati Mandi, Kathmandu',
    bestSellingMandiNepali: 'कालीमाटी बजार, काठमाडौं',
    interDistrictArbitrageNPR: 32.0,
    image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80',
    color: '#059669',
    emoji: '🌶️',
  },
];

export const MARKET_DISRUPTIONS: MarketDisruption[] = [
  {
    id: 'disrupt-1',
    title: 'Narayanghat-Mugling Highway Road Expansion Delay',
    titleNepali: 'नारायणगढ-मुग्लिन सडक विस्तारका कारण रात्रिकालीन जाम',
    type: 'road_block',
    severity: 'high',
    impactedCrops: ['tomato', 'cauliflower', 'green_chilli'],
    impactedDistricts: ['chitwan', 'makwanpur', 'nawalpur'],
    description: 'Landslide clearance and road widening between Tuin Khola causing 3-5 hour delays for night vegetable trucks entering Kathmandu.',
    descriptionNepali: 'तुइन खोला नजिक सडक मर्मतले गर्दा राति काठमाडौं जाने तरकारीका गाडीहरू ३ देखि ५ घण्टा ढिलाइ भइरहेको छ।',
    actionRecommendation: 'Dispatch vehicles by 3:00 PM or utilize group refrigerated mini-truck pooling to prevent tomato spoilage.',
    actionRecommendationNepali: 'गोलभेडा बिग्रन नदिन दिउँसो ३ बजेभित्र गाडी पठाउनुहोस् वा साझा ढुवानी रोज्नुहोस्।',
    reportedDate: 'Today, 06:30 AM',
  },
  {
    id: 'disrupt-2',
    title: 'Chaite Dashain & Wedding Season Demand Spike',
    titleNepali: 'चैते दसैं र बिहेको लगनका कारण तरकारीको मागमा भारी वृद्धि',
    type: 'festival_demand',
    severity: 'medium',
    impactedCrops: ['potato', 'onion', 'cauliflower'],
    impactedDistricts: ['kathmandu', 'lalitpur', 'bhaktapur', 'kavre'],
    description: 'Hospitality and event catering demand surging by ~28% in Kathmandu Valley.',
    descriptionNepali: 'उपत्यकाका पार्टी प्यालेस र होटलहरूमा आलु, प्याज र काउलीको माग २८% ले बढेको छ।',
    actionRecommendation: 'Harvest high-grade cauliflower and hold potato dispatch for premium weekend spot pricing.',
    actionRecommendationNepali: 'काउली छिट्टै टिप्नुहोस् र आलुलाई राम्रो मूल्यमा बेच्न २ दिन पर्खनुहोस्।',
    reportedDate: 'Yesterday',
  },
];

export class MarketDataService {
  private static activeCommodities: Commodity[] = COMMODITY_SEEDS.map((c) => ({ ...c }));
  private static isInitialized = false;
  private static scraperTimer: NodeJS.Timeout | null = null;
  private static lastScrapeTime: string = new Date().toISOString();
  private static lastScrapeSource: 'live' | 'fallback' = 'fallback';

  public static init(): void {
    if (this.isInitialized) return;
    PriceHistoryService.init();
    this.refreshForecastsFromHistory();
    this.isInitialized = true;
  }

  public static getCommodities(): Commodity[] {
    if (!this.isInitialized) {
      this.init();
    }
    return this.activeCommodities;
  }

  public static getCommodity(cropId: string): Commodity | undefined {
    return this.getCommodities().find((c) => c.id.toLowerCase() === cropId.toLowerCase());
  }

  public static getDisruptions(): MarketDisruption[] {
    return MARKET_DISRUPTIONS;
  }

  public static getArbitrageData(district: string = 'chitwan') {
    return this.getCommodities().map((c) => ({
      cropId: c.id,
      cropName: c.name,
      cropNameNepali: c.nameNepali,
      localFarmgatePrice: Math.round(c.currentPrice * 0.72),
      kalimatiWholesalePrice: c.currentPrice,
      grossArbitrageNPR: Math.round(c.currentPrice * 0.28),
      soloTransportCostPerKg: 8.5,
      pooledTransportCostPerKg: 3.4,
      netPooledGainPerKg: Math.round(c.currentPrice * 0.28 - 3.4),
      emoji: c.emoji,
    }));
  }

  public static getLastScrapeInfo() {
    return {
      lastScrapeTime: this.lastScrapeTime,
      source: this.lastScrapeSource,
    };
  }

  /**
   * Recomputes forecasts for all active commodities based on price history
   */
  public static refreshForecastsFromHistory(): void {
    const updated = this.activeCommodities.map((crop) => {
      const seed = COMMODITY_SEEDS.find((s) => s.id === crop.id) || crop;
      const forecast = PriceHistoryService.computeForecast(crop.id, crop.currentPrice, seed);

      // Check price direction/sentiment based on recent history
      const history = PriceHistoryService.getHistory(crop.id, 7);
      let sentiment: 'bullish' | 'bearish' | 'neutral' = crop.sentiment;
      let yesterdayPrice = crop.yesterdayPrice;

      if (history.length >= 2) {
        yesterdayPrice = history[history.length - 2].price;
        const diff = crop.currentPrice - yesterdayPrice;
        const pct = (diff / yesterdayPrice) * 100;
        if (pct >= 1.5) sentiment = 'bullish';
        else if (pct <= -1.5) sentiment = 'bearish';
        else sentiment = 'neutral';
      }

      return {
        ...crop,
        yesterdayPrice,
        sentiment,
        forecast7Day: forecast.forecast7Day,
        forecast14Day: forecast.forecast14Day,
        forecast30Day: forecast.forecast30Day,
        threeMonthForecast: forecast.threeMonthForecast,
        fiveMonthForecast: forecast.fiveMonthForecast,
      };
    });

    this.activeCommodities = updated;
  }

  /**
   * Performs an asynchronous scrape cycle:
   * 1. Scrapes latest Kalimati rates (live or fallback)
   * 2. Saves today's price records in PriceHistoryService (preventing same-day duplicates)
   * 3. Computes deterministic forecasts
   * 4. Updates activeCommodities
   */
  public static async syncLiveMarketData(): Promise<{ source: 'live' | 'fallback'; count: number }> {
    this.init();

    try {
      const result = await KalimatiScraper.scrapeDailyPrices();
      this.lastScrapeTime = result.scrapedAt;
      this.lastScrapeSource = result.source;

      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const recordsToSave: PriceRecord[] = [];

      // Update in-memory commodities
      const newCommodities = this.activeCommodities.map((existing) => {
        const scraped = result.commodities.find((c) => c.id === existing.id);
        const seed = COMMODITY_SEEDS.find((s) => s.id === existing.id) || existing;

        const currentPrice = scraped ? scraped.currentPrice : existing.currentPrice;
        const minPrice = scraped ? scraped.minPrice : existing.minPrice;
        const maxPrice = scraped ? scraped.maxPrice : existing.maxPrice;

        recordsToSave.push({
          cropId: existing.id,
          date: today,
          price: currentPrice,
          minPrice,
          maxPrice,
          source: result.source,
        });

        return {
          ...existing,
          currentPrice,
          minPrice,
          maxPrice,
          yesterdayPrice: scraped ? scraped.yesterdayPrice : existing.yesterdayPrice,
        };
      });

      this.activeCommodities = newCommodities;

      // Save today's price points with duplicate protection
      PriceHistoryService.saveRecords(recordsToSave);
      console.log("[Kalimati] Saved today's price history.");

      // Compute forecasts from updated history
      this.refreshForecastsFromHistory();
      console.log('[Kalimati] Forecasts updated.');

      return {
        source: result.source,
        count: result.commodities.length,
      };
    } catch (err: any) {
      console.warn('[Kalimati] WARNING: Live scraping failed. Using fallback seed data.', err?.message || err);
      this.lastScrapeSource = 'fallback';
      this.refreshForecastsFromHistory();
      return { source: 'fallback', count: COMMODITY_SEEDS.length };
    }
  }

  /**
   * Initializes automatic scraping at server startup and schedules 24-hour recurrence
   */
  public static initializeAutoScraper(): void {
    this.init();

    // Prevent overlapping intervals
    if (this.scraperTimer) {
      clearInterval(this.scraperTimer);
      this.scraperTimer = null;
    }

    // Run initial scrape asynchronously without blocking server
    this.syncLiveMarketData().catch((err) => {
      console.warn('[Kalimati] Initial automatic scrape encountered error:', err);
    });

    // Schedule 24-hour interval
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    this.scraperTimer = setInterval(() => {
      this.syncLiveMarketData().catch((err) => {
        console.warn('[Kalimati] Scheduled 24h market sync encountered error:', err);
      });
    }, TWENTY_FOUR_HOURS);

    console.log('[Kalimati] 24-hour market intelligence sync interval registered.');
  }
}
