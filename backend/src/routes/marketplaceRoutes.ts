import { Router } from 'express';
import { MarketplaceController } from '../controllers/marketplaceController';

export const marketplaceRouter = Router();

marketplaceRouter.get('/listings', MarketplaceController.getListings);
marketplaceRouter.post('/listings', MarketplaceController.createListing);
