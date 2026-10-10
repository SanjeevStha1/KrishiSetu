import { Router } from 'express';
import { DecisionController } from '../controllers/decisionController';

export const decisionRouter = Router();

decisionRouter.get('/recommendations', DecisionController.getRecommendations);
decisionRouter.get('/analytics', DecisionController.getAnalytics);
