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
import { SmsService } from './services/smsService';
import { NEPAL_DISTRICTS_MANDIS } from './data/nepalMandis';

export function createBackendApp(): Express {
  const app = express();

  // Core middlewares
  app.use(express.json());

  // Health & Deployment Readiness check (strictly non-secret boolean flags)
  app.get('/api/health', (req, res) => {
    const smsCfg = SmsService.getGatewayConfig();
    res.json({
      status: 'ok',
      time: new Date().toISOString(),
      service: 'KrishiSetu Backend API',
      environment: process.env.NODE_ENV || 'development',
      readiness: {
        cloudSqlConfigured: Boolean((process.env.SQL_HOST || process.env.DATABASE_URL || '').trim()),
        geminiConfigured: Boolean((process.env.GEMINI_API_KEY || '').trim()),
        openRouterConfigured: Boolean((process.env.OPENROUTER_API_KEY || '').trim()),
        sessionSecretConfigured: Boolean((process.env.SESSION_SECRET || '').trim()),
        smsProvider: smsCfg.activeProvider,
        smsLiveEnabled: smsCfg.isLiveGateway,
        trackedDistricts: NEPAL_DISTRICTS_MANDIS.length,
        trackedCrops: 23,
      },
    });
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
