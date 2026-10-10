import { Request, Response } from 'express';
import { MarketDataService } from '../services/marketDataService';
import { KalimatiScraper } from '../scrapers/kalimatiScraper';
import { PriceHistoryService } from '../services/priceHistoryService';

export class MarketController {
  public static getCommodities(req: Request, res: Response) {
    const commodities = MarketDataService.getCommodities();
    const scrapeInfo = MarketDataService.getLastScrapeInfo();
    return res.json({
      success: true,
      commodities,
      source: scrapeInfo.source,
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

  public static getPriceHistory(req: Request, res: Response) {
    const cropId = req.params.cropId;
    const days = req.query.days ? parseInt(req.query.days as string, 10) : undefined;
    const history = PriceHistoryService.getHistory(cropId, days);
    return res.json({
      success: true,
      cropId,
      totalPoints: history.length,
      history,
    });
  }

  public static getDisruptions(req: Request, res: Response) {
    const disruptions = MarketDataService.getDisruptions();
    return res.json({ success: true, disruptions });
  }

  public static getArbitrage(req: Request, res: Response) {
    const district = (req.query.district as string) || 'chitwan';
    const arbitrage = MarketDataService.getArbitrageData(district);
    return res.json({ success: true, district, arbitrage });
  }

  public static async triggerScrape(req: Request, res: Response) {
    try {
      const syncResult = await MarketDataService.syncLiveMarketData();
      const commodities = MarketDataService.getCommodities();
      return res.json({
        success: true,
        source: syncResult.source,
        itemsCount: syncResult.count,
        commodities,
        scrapedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: 'Failed to scrape Kalimati prices' });
    }
  }
}

