import { Router } from 'express';
import { AiController } from '../controllers/aiController';

export const aiRouter = Router();

aiRouter.post('/chat', AiController.handleChat);
aiRouter.post('/krishi-mitra', AiController.handleKrishiMitra);
