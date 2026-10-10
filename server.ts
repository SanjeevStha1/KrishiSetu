import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { createBackendApp } from './backend/src/app';
import { MarketDataService } from './backend/src/services/marketDataService';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = createBackendApp();

  // Vite development middleware or static production serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[KrishiSetu] Full-Stack Server active on http://0.0.0.0:${PORT}`);
    console.log(`[KrishiSetu] Backend API endpoints mounted at /api/*`);
    console.log(`[KrishiSetu] Frontend SPA mounted via Vite`);

    // Safely initialize Kalimati market intelligence and 24-hour auto-scraper
    MarketDataService.initializeAutoScraper();
  });
}

startServer().catch((err) => {
  console.error('[KrishiSetu] Failed to start server:', err);
  process.exit(1);
});
