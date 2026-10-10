import { Router, Request, Response } from 'express';
import { AgriNewsFeedScraper } from '../scrapers/agriNewsScraper';

export const newsRouter = Router();

/**
 * GET /api/news
 * Fetches latest agricultural bulletins, circulars, and research advisories
 * with automated scraper health metadata
 */
newsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { category, district, search } = req.query;
    const data = AgriNewsFeedScraper.getCurrentResponse();

    let filtered = data.articles;

    if (category && category !== 'all') {
      filtered = filtered.filter((a) => a.category === category);
    }

    if (district && district !== 'all') {
      filtered = filtered.filter(
        (a) => a.district && a.district.toLowerCase() === String(district).toLowerCase()
      );
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.titleNe.toLowerCase().includes(q) ||
          a.summaryEn.toLowerCase().includes(q) ||
          a.summaryNe.toLowerCase().includes(q) ||
          a.impactedCrops.some((c) => c.toLowerCase().includes(q))
      );
    }

    res.json({
      success: true,
      lastSyncedAt: data.lastSyncedAt,
      totalArticles: filtered.length,
      sources: data.sources,
      articles: filtered,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agricultural news feed',
      message: err.message,
    });
  }
});

/**
 * POST /api/news/sync
 * Forces a live scrape & RSS sync across official Nepali agricultural portals
 */
newsRouter.post('/sync', async (req: Request, res: Response) => {
  try {
    const syncResult = await AgriNewsFeedScraper.checkAndSyncFeeds();
    res.json(syncResult);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to trigger automated news scraper',
      message: err.message,
    });
  }
});
