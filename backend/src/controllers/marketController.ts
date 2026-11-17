import { Request, Response } from 'express';
import { MarketDataService } from '../services/marketDataService';
import { PriceHistoryService } from '../services/priceHistoryService';
import { DbStorageService } from '../services/dbStorageService';
import { NEPAL_DISTRICTS_MANDIS, findDistrictMandi, getAmpisHubForDistrict } from '../data/nepalMandis';
import { AmpisScraper } from '../scrapers/ampisScraper';

export class MarketController {
  public static getCommodities(req: Request, res: Response) {
    const commodities = MarketDataService.getCommodities();
    const scrapeInfo = MarketDataService.getLastScrapeInfo();
    return res.json({
      success: true,
      commodities,
      source: scrapeInfo.source,
      totalBulletinCount: scrapeInfo.totalBulletinCount,
      timestamp: scrapeInfo.lastScrapeTime || new Date().toISOString(),
    });
  }

  public static getCommodityById(req: Request, res: Response) {
    const cropId = req.params.cropId;
    const commodity = MarketDataService.getCommodity(cropId);
    if (!commodity) {
      return res.status(404).json({ success: false, error: 'Crop not found in market registry' });
    }
    return res.json({ success: true, commodity });
  }

  public static getFullBulletin(req: Request, res: Response) {
    const category = (req.query.category as string)?.toLowerCase();
    const search = (req.query.search as string)?.toLowerCase().trim();
    const scrapeInfo = MarketDataService.getLastScrapeInfo();
    let items = MarketDataService.getFullBulletin();

    if (category && category !== 'all') {
      items = items.filter((item) => item.category === category);
    }
    if (search) {
      items = items.filter(
        (item) =>
          item.rawName.toLowerCase().includes(search) ||
          (item.nameEn && item.nameEn.toLowerCase().includes(search))
      );
    }

    return res.json({
      success: true,
      source: scrapeInfo.source,
      scrapedAt: scrapeInfo.lastScrapeTime,
      totalItems: items.length,
      items,
    });
  }

  public static async getMandisNetwork(req: Request, res: Response) {
    const cropId = (req.query.crop as string) || 'tomato';
    const province = (req.query.province as string)?.toLowerCase();
    const search = (req.query.search as string)?.toLowerCase().trim();
    let mandis = await MarketDataService.getMandisNetworkWithReports(cropId);
    if (province && province !== 'all') {
      mandis = mandis.filter((m) => m.province.toLowerCase() === province);
    }
    if (search) {
      mandis = mandis.filter(
        (m) =>
          m.name.toLowerCase().includes(search) ||
          m.nameNe.includes(search) ||
          m.mandiName.toLowerCase().includes(search) ||
          m.id.toLowerCase().includes(search)
      );
    }
    return res.json({
      success: true,
      cropId,
      totalMandis: mandis.length,
      mandis,
    });
  }

  public static getDistricts(req: Request, res: Response) {
    const province = (req.query.province as string)?.toLowerCase();
    let districts = NEPAL_DISTRICTS_MANDIS.map((d) => ({
      id: d.id,
      name: d.name,
      nameNe: d.nameNe,
      province: d.province,
      provinceNe: d.provinceNe,
      zone: d.zone,
      elevation: d.elevation,
      mandiName: d.mandiName,
      mandiNameNepali: d.mandiNameNepali,
      distanceToKalimatiKm: d.distanceToKalimatiKm,
      ampisHubKey: getAmpisHubForDistrict(d),
    }));

    if (province && province !== 'all') {
      districts = districts.filter((d) => d.province.toLowerCase() === province);
    }

    return res.json({
      success: true,
      totalDistricts: districts.length,
      districts,
    });
  }

  public static getAmpisStatus(req: Request, res: Response) {
    const status = AmpisScraper.getAllHubSnapshots();
    return res.json({
      success: true,
      ...status,
      totalHubs: status.hubs.length,
    });
  }

  public static async getRegionalPrices(req: Request, res: Response) {
    try {
      const districtId = req.params.districtId || 'chitwan';
      const data = await MarketDataService.getDistrictCommodityPrices(districtId);
      return res.json({
        success: true,
        ...data,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: 'Failed to compute regional market rates' });
    }
  }

  public static async getPriceReports(req: Request, res: Response) {
    try {
      const district = (req.query.district as string) || undefined;
      const crop = (req.query.crop as string) || undefined;
      const reports = await DbStorageService.getDistrictPriceReports(district, crop, 50);
      return res.json({
        success: true,
        totalReports: reports.length,
        reports,
      });
    } catch {
      return res.status(500).json({ success: false, error: 'Failed to fetch local price reports' });
    }
  }

  public static async submitPriceReport(req: Request, res: Response) {
    try {
      const {
        districtId,
        cropId,
        marketName,
        priceType,
        pricePerKg,
        reporterName,
        reporterRole,
        reporterPhone,
      } = req.body || {};

      if (!districtId || !cropId || !marketName || !reporterName) {
        return res.status(400).json({
          success: false,
          error: 'districtId, cropId, marketName, and reporterName are required',
        });
      }

      const parsedPrice = Number(pricePerKg);
      if (!Number.isFinite(parsedPrice) || parsedPrice < 5 || parsedPrice > 2500) {
        return res.status(400).json({
          success: false,
          error: 'pricePerKg must be a realistic rate between Rs 5 and Rs 2500',
        });
      }

      const validCrop = MarketDataService.getCommodity(cropId);
      if (!validCrop) {
        return res.status(400).json({
          success: false,
          error: 'Invalid cropId',
        });
      }

      const mandi = findDistrictMandi(districtId);
      const saved = await DbStorageService.saveDistrictPriceReport({
        districtId: mandi.id,
        cropId: validCrop.id,
        marketName: String(marketName).slice(0, 120),
        priceType: priceType === 'farmgate' ? 'farmgate' : 'wholesale',
        pricePerKg: Math.round(parsedPrice),
        reporterName: String(reporterName).slice(0, 80),
        reporterRole: ['farmer', 'cooperative', 'mandi_agent'].includes(reporterRole)
          ? reporterRole
          : 'farmer',
        reporterPhone: reporterPhone ? String(reporterPhone).slice(0, 20) : undefined,
      });

      // Evaluate district price alerts non-blockingly with updated local price
      import('../services/alertWorkerService')
        .then((m) => m.AlertWorkerService.evaluateAndDispatchAlerts('local_report', mandi.id))
        .catch(() => null);

      return res.status(201).json({
        success: true,
        report: saved,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: 'Failed to save local price report' });
    }
  }

  public static async getPriceHistory(req: Request, res: Response) {
    const cropId = req.params.cropId;
    const days = req.query.days ? parseInt(req.query.days as string, 10) : undefined;
    const localHistory = PriceHistoryService.getHistory(cropId, days);

    // Merge Cloud SQL daily archives if available so multi-day history persists cleanly
    try {
      const dbHistory = await DbStorageService.getArchivedDailyPrices(cropId, days || 30);
      if (dbHistory.length > 0) {
        const mergedMap = new Map<string, any>();
        for (const h of localHistory) mergedMap.set(h.date, h);
        for (const d of dbHistory) mergedMap.set(d.date, d);
        const merged = Array.from(mergedMap.values()).sort((a, b) => a.date.localeCompare(b.date));
        const sliced = days && days > 0 ? merged.slice(-days) : merged;
        return res.json({
          success: true,
          cropId,
          totalPoints: sliced.length,
          history: sliced,
        });
      }
    } catch {
      // Fallback to local file/memory history
    }

    return res.json({
      success: true,
      cropId,
      totalPoints: localHistory.length,
      history: localHistory,
    });
  }

  public static getDisruptions(req: Request, res: Response) {
    const disruptions = MarketDataService.getDisruptions();
    return res.json({ success: true, disruptions });
  }

  public static getArbitrage(req: Request, res: Response) {
    const district = (req.query.district as string) || 'chitwan';
    const arbitrage = MarketDataService.getArbitrageData(district);
    const corridors = MarketDataService.getNationwideCorridors(district);
    return res.json({
      success: true,
      district,
      arbitrage,
      corridors,
    });
  }

  public static async triggerScrape(req: Request, res: Response) {
    try {
      const syncResult = await MarketDataService.syncLiveMarketData();
      const commodities = MarketDataService.getCommodities();
      return res.json({
        success: true,
        source: syncResult.source,
        itemsCount: syncResult.count,
        totalBulletinCount: syncResult.totalBulletinCount,
        commodities,
        scrapedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: 'Failed to scrape Kalimati prices' });
    }
  }
}
