import { Router } from 'express';
import { MarketController } from '../controllers/marketController';

export const marketRouter = Router();

marketRouter.get('/commodities', MarketController.getCommodities);
marketRouter.get('/commodities/:cropId', MarketController.getCommodityById);
marketRouter.get('/bulletin', MarketController.getFullBulletin);
marketRouter.get('/districts', MarketController.getDistricts);
marketRouter.get('/ampis-status', MarketController.getAmpisStatus);
marketRouter.get('/regional-prices/:districtId', MarketController.getRegionalPrices);
marketRouter.get('/price-reports', MarketController.getPriceReports);
marketRouter.post('/price-reports', MarketController.submitPriceReport);
marketRouter.get('/mandis', MarketController.getMandisNetwork);
marketRouter.get('/history/:cropId', MarketController.getPriceHistory);
marketRouter.get('/disruptions', MarketController.getDisruptions);
marketRouter.get('/arbitrage', MarketController.getArbitrage);
marketRouter.post('/scrape', MarketController.triggerScrape);
