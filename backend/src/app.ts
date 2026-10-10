import express, { Express } from 'express';
import { authRouter } from './routes/authRoutes';
import { smsRouter } from './routes/smsRoutes';
import { farmRecordsRouter } from './routes/farmRecordsRoutes';
import { marketRouter } from './routes/marketRoutes';
import { decisionRouter } from './routes/decisionRoutes';
import { calculatorRouter } from './routes/calculatorRoutes';
import { aiRouter } from './routes/aiRoutes';
import { weatherRouter } from './routes/weatherRoutes';
import { marketplaceRouter } from './routes/marketplaceRoutes';
import { newsRouter } from './routes/newsRoutes';
import { errorHandler } from './middleware/errorHandler';

export function createBackendApp(): Express {
  const app = express();

  // Core middlewares
  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString(), service: 'KrishiSetu Backend API' });
  });

  // Mount API Routers
  app.use('/api/auth', authRouter);
  app.use('/api/sms', smsRouter);
  app.use('/api/farm-records', farmRecordsRouter);
  app.use('/api/market', marketRouter);
  app.use('/api/decision-engine', decisionRouter);
  app.use('/api/calculator', calculatorRouter);
  app.use('/api', aiRouter); // mounts /api/krishi-mitra
  app.use('/api/weather', weatherRouter);
  app.use('/api/marketplace', marketplaceRouter);
  app.use('/api/news', newsRouter);

  // Centralized error handler
  app.use(errorHandler);

  return app;
}
