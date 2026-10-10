import { Router } from 'express';
import { CalculatorController } from '../controllers/calculatorController';

export const calculatorRouter = Router();

calculatorRouter.post('/ai-estimate', CalculatorController.getAiEstimate);
calculatorRouter.post('/simulate', CalculatorController.simulateMargin);
