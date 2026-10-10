import { Router } from 'express';
import { MarketController } from '../controllers/marketController';

export const marketRouter = Router();

marketRouter.get('/commodities', MarketController.getCommodities);
marketRouter.get('/commodities/:cropId', MarketController.getCommodityById);
marketRouter.get('/history/:cropId', MarketController.getPriceHistory);
marketRouter.get('/disruptions', MarketController.getDisruptions);
marketRouter.get('/arbitrage', MarketController.getArbitrage);
marketRouter.post('/scrape', MarketController.triggerScrape);
