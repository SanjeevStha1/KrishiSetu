import { Commodity } from '../../../shared/types/krishi';
import { COMMODITY_SEEDS } from '../services/marketDataService';

export interface ScrapedPriceItem {
  commodityId?: string;
  rawName: string;
  unit: string;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
}

export interface KalimatiScraperResult {
  source: 'live' | 'fallback';
  scrapedAt: string;
  sourceUrl: string;
  itemsCount: number;
  commodities: Commodity[];
  rawItems?: ScrapedPriceItem[];
  unmatchedCount?: number;
}

export class KalimatiScraper {
  private static PRIMARY_URL = 'https://kalimatimarket.gov.np/price';
  private static FALLBACK_URL = 'https://kalimatimarket.gov.np';
  private static TIMEOUT_MS = 7000;

  /**
   * Parses Devanagari numerals (०-९) and standard numerals into a float
   */
  public static parseNepaliNumber(str: string): number {
    if (!str) return 0;
    const devanagariDigits: Record<string, string> = {
      '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
      '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
    };
    let cleaned = str.replace(/[०-९]/g, (d) => devanagariDigits[d] || d);
    cleaned = cleaned.replace(/[^0-9.]/g, '');
    const val = parseFloat(cleaned);
    return isNaN(val) ? 0 : val;
  }

  /**
   * Normalizes text for matching (lowercased, punctuation/parentheses removed, whitespace trimmed)
   */
  private static normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[()[\]{}.,\/#!$%\^&\*;:{}=\-_`~।]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Parses an HTML table containing Kalimati market prices
   */
  public static parsePriceTable(html: string): ScrapedPriceItem[] {
    const items: ScrapedPriceItem[] = [];
    // Match table rows
    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let trMatch: RegExpExecArray | null;

    while ((trMatch = trRegex.exec(html)) !== null) {
      const rowHtml = trMatch[1];
      // Skip header rows
      if (rowHtml.includes('<th')) continue;

      const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
      const cells: string[] = [];
      let tdMatch: RegExpExecArray | null;

      while ((tdMatch = tdRegex.exec(rowHtml)) !== null) {
        cells.push(tdMatch[1].replace(/<[^>]*>/g, '').trim());
      }

      // Kalimati format: [Commodity Name, Unit, Min Price, Max Price, Avg Price]
      if (cells.length >= 4) {
        const rawName = cells[0];
        const unit = cells[1] || 'के.जी.';
        const minPrice = this.parseNepaliNumber(cells[2]);
        const maxPrice = this.parseNepaliNumber(cells[3]);
        const avgPrice = cells[4] ? this.parseNepaliNumber(cells[4]) : (minPrice + maxPrice) / 2;

        if (rawName && avgPrice > 0) {
          items.push({
            rawName,
            unit,
            minPrice,
            maxPrice,
            avgPrice: Math.round(avgPrice * 100) / 100,
          });
        }
      }
    }

    return items;
  }

  /**
   * High-confidence matching rules mapping scraped Kalimati items to existing COMMODITY_SEEDS
   */
  public static matchScrapedToSeeds(
    scrapedItems: ScrapedPriceItem[],
    seeds: Commodity[]
  ): { matchedCommodities: Commodity[]; matchedRawItems: ScrapedPriceItem[]; unmatchedCount: number } {
    const matchedCommodities: Commodity[] = [];
    const matchedRawItems: ScrapedPriceItem[] = [];
    const matchedSeedIds = new Set<string>();

    for (const seed of seeds) {
      let matchedItem: ScrapedPriceItem | undefined;

      if (seed.id === 'tomato') {
        // Prefer local small tomato, then local Nepali tomato
        matchedItem =
          scrapedItems.find((i) => i.rawName.includes('गोलभेडा सानो') && i.rawName.includes('लोकल')) ||
          scrapedItems.find((i) => i.rawName.includes('गोलभेडा सानो')) ||
          scrapedItems.find((i) => i.rawName.includes('गोलभेडा') && (i.rawName.includes('लोकल') || i.rawName.includes('नेपाली'))) ||
          scrapedItems.find((i) => i.rawName.includes('गोलभेडा'));
      } else if (seed.id === 'potato') {
        // Red potato
        matchedItem =
          scrapedItems.find((i) => i.rawName.includes('आलु रातो') || i.rawName.includes('रातो आलु')) ||
          scrapedItems.find((i) => i.rawName.includes('आलु') && !i.rawName.includes('सेतो'));
      } else if (seed.id === 'cauliflower') {
        // Cauliflower (Local)
        matchedItem =
          scrapedItems.find((i) => i.rawName.includes('काउली स्थानिय') || i.rawName.includes('काउली(स्थानीय)')) ||
          scrapedItems.find((i) => i.rawName.includes('काउली'));
      } else if (seed.id === 'cabbage') {
        // Cabbage (Local)
        matchedItem =
          scrapedItems.find((i) => i.rawName.includes('बन्दा(लोकल)') || i.rawName.includes('बन्दा')) ||
          scrapedItems.find((i) => i.rawName.includes('बन्दा गोभी'));
      } else if (seed.id === 'onion') {
        // Dry onion (imported/Indian)
        matchedItem =
          scrapedItems.find((i) => i.rawName.includes('प्याज सुकेको') || i.rawName.includes('सुकेको प्याज')) ||
          scrapedItems.find((i) => i.rawName.includes('प्याज') && !i.rawName.includes('हरियो'));
      } else if (seed.id === 'green_chilli') {
        // Green chilli
        matchedItem =
          scrapedItems.find((i) => (i.rawName.includes('खुर्सानी हरियो') || i.rawName.includes('खु्र्सानी हरियो')) && i.rawName.includes('लाम्चो')) ||
          scrapedItems.find((i) => i.rawName.includes('खुर्सानी हरियो') || i.rawName.includes('खु्र्सानी हरियो')) ||
          scrapedItems.find((i) => i.rawName.includes('खुर्सानी') && !i.rawName.includes('सुकेको'));
      }

      // Secondary fallback: normalized text match
      if (!matchedItem) {
        const normName = this.normalizeText(seed.nameNepali);
        matchedItem = scrapedItems.find((i) => {
          const normRaw = this.normalizeText(i.rawName);
          return normRaw.includes(normName) || normName.includes(normRaw);
        });
      }

      if (matchedItem && matchedItem.avgPrice > 0) {
        matchedSeedIds.add(seed.id);
        const itemWithId = { ...matchedItem, commodityId: seed.id };
        matchedRawItems.push(itemWithId);

        // Preserve all existing fields and update prices from real live market
        matchedCommodities.push({
          ...seed,
          currentPrice: Math.round(matchedItem.avgPrice),
          minPrice: Math.round(matchedItem.minPrice || seed.minPrice),
          maxPrice: Math.round(matchedItem.maxPrice || seed.maxPrice),
          yesterdayPrice: seed.currentPrice, // seed's baseline acts as previous price anchor
        });
      } else {
        // Keep seed unchanged if this individual crop wasn't in bulletin
        matchedCommodities.push({ ...seed });
      }
    }

    const unmatchedCount = scrapedItems.length - matchedRawItems.length;

    return {
      matchedCommodities,
      matchedRawItems,
      unmatchedCount: Math.max(0, unmatchedCount),
    };
  }

  /**
   * Fetches the HTML from a URL with timeout protection
   */
  private static async fetchWithTimeout(url: string, timeoutMs: number): Promise<string> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (KrishiSetu-AgriBot/2.4; +https://krishisetu.gov.np; Nepali Agricultural Intelligence)',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ne,en;q=0.9',
        },
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      return await response.text();
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }

  /**
   * Scrapes daily prices from official Kalimati Mandi source.
   * Safe and fault-tolerant: returns fallback seed data if scraping fails.
   */
  public static async scrapeDailyPrices(): Promise<KalimatiScraperResult> {
    const timestamp = new Date().toISOString();
    console.log('[Kalimati] Fetching market prices...');

    let html = '';
    let usedUrl = this.PRIMARY_URL;

    try {
      html = await this.fetchWithTimeout(this.PRIMARY_URL, this.TIMEOUT_MS);
    } catch (primaryErr: any) {
      console.warn(`[Kalimati] Primary URL (${this.PRIMARY_URL}) unreachable (${primaryErr?.message || primaryErr}), attempting homepage fallback...`);
      try {
        usedUrl = this.FALLBACK_URL;
        html = await this.fetchWithTimeout(this.FALLBACK_URL, this.TIMEOUT_MS);
      } catch (fallbackErr: any) {
        console.warn('[Kalimati] WARNING: Live scraping failed. Using fallback seed data.', fallbackErr?.message || fallbackErr);
        return {
          source: 'fallback',
          scrapedAt: timestamp,
          sourceUrl: this.PRIMARY_URL,
          itemsCount: COMMODITY_SEEDS.length,
          commodities: COMMODITY_SEEDS.map((c) => ({ ...c })),
        };
      }
    }

    try {
      const scrapedItems = this.parsePriceTable(html);

      if (!scrapedItems || scrapedItems.length === 0) {
        console.warn('[Kalimati] WARNING: Live scraping failed. Using fallback seed data. (No table rows parsed)');
        return {
          source: 'fallback',
          scrapedAt: timestamp,
          sourceUrl: usedUrl,
          itemsCount: COMMODITY_SEEDS.length,
          commodities: COMMODITY_SEEDS.map((c) => ({ ...c })),
        };
      }

      console.log(`[Kalimati] Successfully fetched ${scrapedItems.length} commodities.`);

      const { matchedCommodities, matchedRawItems, unmatchedCount } = this.matchScrapedToSeeds(
        scrapedItems,
        COMMODITY_SEEDS
      );

      console.log(`[Kalimati] Matched ${matchedRawItems.length}/${COMMODITY_SEEDS.length} commodities.`);

      if (unmatchedCount > 0) {
        // Collect a few sample unmatched names for logging without flooding
        const sampleUnmatched = scrapedItems
          .filter((item) => !matchedRawItems.some((m) => m.rawName === item.rawName))
          .slice(0, 5)
          .map((i) => i.rawName)
          .join(', ');
        console.log(`[Kalimati] Logged ${unmatchedCount} other Mandi commodities (e.g., ${sampleUnmatched}).`);
      }

      // If at least one commodity matched, consider it a successful live scrape
      if (matchedRawItems.length > 0) {
        return {
          source: 'live',
          scrapedAt: timestamp,
          sourceUrl: usedUrl,
          itemsCount: matchedRawItems.length,
          commodities: matchedCommodities,
          rawItems: matchedRawItems,
          unmatchedCount,
        };
      }

      console.warn('[Kalimati] WARNING: Live scraping failed. Using fallback seed data. (Zero matched commodities)');
      return {
        source: 'fallback',
        scrapedAt: timestamp,
        sourceUrl: usedUrl,
        itemsCount: COMMODITY_SEEDS.length,
        commodities: COMMODITY_SEEDS.map((c) => ({ ...c })),
      };
    } catch (parseErr: any) {
      console.warn('[Kalimati] WARNING: Live scraping failed. Using fallback seed data.', parseErr?.message || parseErr);
      return {
        source: 'fallback',
        scrapedAt: timestamp,
        sourceUrl: usedUrl,
        itemsCount: COMMODITY_SEEDS.length,
        commodities: COMMODITY_SEEDS.map((c) => ({ ...c })),
      };
    }
  }
}
