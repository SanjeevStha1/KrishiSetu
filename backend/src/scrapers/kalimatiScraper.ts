import { Commodity } from '../../../shared/types/krishi';
import { COMMODITY_SEEDS } from '../services/marketDataService';

export interface ScrapedPriceItem {
  commodityId?: string;
  rawName: string;
  nameEn?: string;
  unit: string;
  unitEn?: string;
  category?: 'vegetable' | 'fruit' | 'spice' | 'exotic' | 'other';
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
}

export interface KalimatiScraperResult {
  source: 'live' | 'fallback';
  scrapedAt: string;
  sourceUrl: string;
  itemsCount: number;
  totalBulletinCount: number;
  commodities: Commodity[];
  rawItems?: ScrapedPriceItem[];
  fullBulletin: ScrapedPriceItem[];
  unmatchedCount?: number;
}

export class KalimatiScraper {
  private static PRIMARY_URL = 'https://kalimatimarket.gov.np/price';
  private static LANG_EN_URL = 'https://kalimatimarket.gov.np/lang/en';
  private static FALLBACK_URL = 'https://kalimatimarket.gov.np';
  private static TIMEOUT_MS = 8500;

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

  private static normalizeText(text: string): string {
    return (text || '')
      .toLowerCase()
      .replace(/[()[\]{}.,\/#!$%\^&\*;:{}=\-_`~।]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private static classifyBulletinItem(nameNe: string, nameEn: string): ScrapedPriceItem['category'] {
    const combo = `${nameNe} ${nameEn}`.toLowerCase();
    if (
      combo.includes('apple') || combo.includes('banana') || combo.includes('mango') ||
      combo.includes('orange') || combo.includes('grapes') || combo.includes('pomegranate') ||
      combo.includes('watermelon') || combo.includes('papaya') || combo.includes('pineapple') ||
      combo.includes('guava') || combo.includes('kiwi') || combo.includes('strawberry') ||
      combo.includes('avocado') || combo.includes('pear') || combo.includes('mandarin') ||
      combo.includes('स्याउ') || combo.includes('केरा') || combo.includes('आँप') ||
      combo.includes('सुन्तला') || combo.includes('अंगुर') || combo.includes('अनार') ||
      combo.includes('मेवा') || combo.includes('तरबुजा') || combo.includes('भुईकटहर') ||
      combo.includes('किवी') || combo.includes('एभोकाडो') || combo.includes('नास्पाती')
    ) {
      return 'fruit';
    }
    if (
      combo.includes('garlic') || combo.includes('ginger') || combo.includes('chilli') ||
      combo.includes('chili') || combo.includes('coriander') || combo.includes('clove') ||
      combo.includes('cardamom') || combo.includes('turmeric') || combo.includes('mint') ||
      combo.includes('लसुन') || combo.includes('अदुवा') || combo.includes('खुर्सानी') ||
      combo.includes('धनिया') || combo.includes('पुदिना') || combo.includes('बेसार')
    ) {
      return 'spice';
    }
    if (
      combo.includes('mushroom') || combo.includes('broccoli') || combo.includes('asparagus') ||
      combo.includes('celery') || combo.includes('parsley') || combo.includes('lettuce') ||
      combo.includes('capsicum') || combo.includes('च्याउ') || combo.includes('ब्रोकाउली') ||
      combo.includes('कुरिलो') || combo.includes('भेडे खुर्सानी')
    ) {
      return 'exotic';
    }
    if (combo.includes('fish') || combo.includes('माछा') || combo.includes('tofu') || combo.includes('gundruk') || combo.includes('गुन्द्रुक')) {
      return 'other';
    }
    return 'vegetable';
  }

  /**
   * Parses an HTML table containing Kalimati market prices
   */
  public static parsePriceTable(html: string): ScrapedPriceItem[] {
    const items: ScrapedPriceItem[] = [];
    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let trMatch: RegExpExecArray | null;

    while ((trMatch = trRegex.exec(html)) !== null) {
      const rowHtml = trMatch[1];
      if (rowHtml.includes('<th')) continue;

      const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
      const cells: string[] = [];
      let tdMatch: RegExpExecArray | null;

      while ((tdMatch = tdRegex.exec(rowHtml)) !== null) {
        cells.push(tdMatch[1].replace(/<[^>]*>/g, '').trim());
      }

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

  private static matchSingleSeedId(seedId: string, scrapedItems: ScrapedPriceItem[]): ScrapedPriceItem | undefined {
    const findByText = (pred: (ne: string, en: string) => boolean) =>
      scrapedItems.find((i) => pred(i.rawName || '', (i.nameEn || '').toLowerCase()));

    switch (seedId) {
      case 'tomato':
        return (
          findByText((n, e) => (n.includes('गोलभेडा सानो') && n.includes('लोकल')) || e.includes('tomato small(local)')) ||
          findByText((n, e) => n.includes('गोलभेडा सानो') || e.includes('tomato small')) ||
          findByText((n, e) => n.includes('गोलभेडा') || e.includes('tomato'))
        );
      case 'potato':
        return (
          findByText((n, e) => (n.includes('आलु रातो') && !n.includes('भारतीय')) || e === 'potato red(round)' || e === 'potato red(long)') ||
          findByText((n, e) => n.includes('आलु रातो') || e.includes('potato red')) ||
          findByText((n, e) => (n.includes('आलु') && !n.includes('सेतो')) || e.includes('potato'))
        );
      case 'onion':
        return (
          findByText((n, e) => n.includes('प्याज सुकेको') || e.includes('onion dry')) ||
          findByText((n, e) => (n.includes('प्याज') && !n.includes('हरियो')) || (e.includes('onion') && !e.includes('green')))
        );
      case 'cauliflower':
        return (
          findByText((n, e) => n.includes('काउली स्थानिय') || n.includes('काउली स्थानीय') || e.includes('cauli local')) ||
          findByText((n, e) => n.includes('काउली') || e.includes('cauliflower') || e.includes('cauli'))
        );
      case 'cabbage':
        return (
          findByText((n, e) => n.includes('बन्दा(लोकल)') || n.includes('बन्दा लोकल') || e.includes('cabbage(local)')) ||
          findByText((n, e) => n.includes('बन्दा') || e.includes('cabbage'))
        );
      case 'carrot':
        return (
          findByText((n, e) => n.includes('गाजर(लोकल)') || e.includes('carrot(local)')) ||
          findByText((n, e) => n.includes('गाजर') || e.includes('carrot'))
        );
      case 'capsicum':
        return findByText((n, e) => n.includes('भेडे खुर्सानी') || e.includes('capsicum'));
      case 'beans':
        return (
          findByText((n, e) => n.includes('घ्यु सिमी(लोकल)') || e.includes('french bean(local)')) ||
          findByText((n, e) => n.includes('घ्यु सिमी') || n.includes('सिमी') || e.includes('french bean'))
        );
      case 'peas':
        return findByText((n, e) => n.includes('मटरकोसा') || n.includes('केराउ') || e.includes('green peas'));
      case 'bitter_gourd':
        return findByText((n, e) => n.includes('तीते करेला') || n.includes('करेला') || e.includes('bitter gourd'));
      case 'bottle_gourd':
        return findByText((n, e) => n.includes('लौका') || e.includes('bottle gourd'));
      case 'brinjal':
        return (
          findByText((n, e) => n.includes('भन्टा लाम्चो') || e.includes('brinjal long')) ||
          findByText((n, e) => n.includes('भन्टा') || e.includes('brinjal'))
        );
      case 'chilli':
      case 'green_chilli':
        return (
          findByText((n, e) => (n.includes('खुर्सानी हरियो') || n.includes('खु्र्सानी हरियो')) && !n.includes('अकबरे') && !n.includes('भेडे')) ||
          findByText((n, e) => e.includes('chilli green') && !e.includes('akabare')) ||
          findByText((n, e) => n.includes('खुर्सानी') && !n.includes('सुकेको') && !n.includes('भेडे'))
        );
      case 'coriander':
        return findByText((n, e) => n.includes('धनिया हरियो') || n.includes('धनिया') || e.includes('coriander green'));
      case 'cucumber':
        return (
          findByText((n, e) => n.includes('काक्रो(लोकल)') || n.includes('काँक्रो(लोकल)') || e.includes('cucumber(local)')) ||
          findByText((n, e) => n.includes('काक्रो') || n.includes('काँक्रो') || e.includes('cucumber'))
        );
      case 'garlic':
        return (
          findByText((n, e) => n.includes('लसुन सुकेको नेपाली') || e.includes('garlic dry nepali')) ||
          findByText((n, e) => n.includes('लसुन सुकेको') || e.includes('garlic dry'))
        );
      case 'ginger':
        return findByText((n, e) => n.includes('अदुवा') || e.includes('ginger'));
      case 'ladies_finger':
        return findByText((n, e) => n.includes('भिण्डी') || n.includes('भिन्डी') || e.includes('ladies finger'));
      case 'mushroom':
        return (
          findByText((n, e) => n.includes('च्याउ(डल्ले)') || e.includes('mushroom(button)')) ||
          findByText((n, e) => n.includes('च्याउ') || e.includes('mushroom'))
        );
      case 'pumpkin':
        return (
          findByText((n, e) => n.includes('फर्सी पाकेको') || e.includes('pumpkin')) ||
          findByText((n, e) => n.includes('फर्सी'))
        );
      case 'radish':
        return (
          findByText((n, e) => n.includes('मूला सेतो(लोकल)') || n.includes('मूला सेतो') || e.includes('raddish white(local)')) ||
          findByText((n, e) => n.includes('मूला') || e.includes('radish') || e.includes('raddish'))
        );
      case 'spinach':
        return findByText((n, e) => n.includes('पालुङ्गो') || n.includes('पालुंगो') || e.includes('spinach leaf'));
      case 'sweet_potato':
        return findByText((n, e) => n.includes('सखरखण्ड') || e.includes('sweet potato'));
      default:
        return undefined;
    }
  }

  /**
   * High-confidence matching rules mapping scraped Kalimati items to COMMODITY_SEEDS
   */
  public static matchScrapedToSeeds(
    scrapedItems: ScrapedPriceItem[],
    seeds: Commodity[]
  ): { matchedCommodities: Commodity[]; matchedRawItems: ScrapedPriceItem[]; unmatchedCount: number } {
    const matchedCommodities: Commodity[] = [];
    const matchedRawItems: ScrapedPriceItem[] = [];

    for (const seed of seeds) {
      let matchedItem = this.matchSingleSeedId(seed.id, scrapedItems);

      if (!matchedItem) {
        const normName = this.normalizeText(seed.nameNepali);
        const normEn = this.normalizeText(seed.name);
        matchedItem = scrapedItems.find((i) => {
          const normRaw = this.normalizeText(i.rawName);
          const normRawEn = this.normalizeText(i.nameEn || '');
          return (
            (normName && (normRaw.includes(normName) || normName.includes(normRaw))) ||
            (normEn && normRawEn && (normRawEn.includes(normEn) || normEn.includes(normRawEn)))
          );
        });
      }

      if (matchedItem && matchedItem.avgPrice > 0) {
        matchedItem.commodityId = seed.id;
        matchedRawItems.push({ ...matchedItem });

        matchedCommodities.push({
          ...seed,
          currentPrice: Math.round(matchedItem.avgPrice),
          minPrice: Math.round(matchedItem.minPrice || seed.minPrice),
          maxPrice: Math.round(matchedItem.maxPrice || seed.maxPrice),
          yesterdayPrice: seed.currentPrice,
        });
      } else {
        matchedCommodities.push({ ...seed });
      }
    }

    const unmatchedCount = Math.max(0, scrapedItems.length - matchedRawItems.length);

    return {
      matchedCommodities,
      matchedRawItems,
      unmatchedCount,
    };
  }

  private static async fetchWithTimeout(url: string, timeoutMs: number, headers: Record<string, string> = {}): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (KrishiSetu-AgriBot/3.0; +https://krishisetu.gov.np; Nepali Agricultural Intelligence)',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          ...headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timer);
      return response;
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }

  /**
   * Fetches English bulletin by acquiring Laravel language session cookies first.
   */
  private static async fetchEnglishBulletin(): Promise<ScrapedPriceItem[]> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.TIMEOUT_MS);
      const langRes = await fetch(this.LANG_EN_URL, {
        method: 'GET',
        redirect: 'manual',
        headers: {
          'User-Agent': 'Mozilla/5.0 (KrishiSetu-AgriBot/3.0)',
        },
        signal: controller.signal,
      });
      clearTimeout(timer);

      const getSetCookie = (langRes.headers as any).getSetCookie;
      const cookieHeader = typeof getSetCookie === 'function'
        ? getSetCookie.call(langRes.headers).map((c: string) => c.split(';')[0]).join('; ')
        : '';

      if (!cookieHeader) return [];

      const enRes = await this.fetchWithTimeout(this.PRIMARY_URL, this.TIMEOUT_MS, {
        Cookie: cookieHeader,
        'Accept-Language': 'en-US,en;q=0.9',
      });
      if (!enRes.ok) return [];
      const enHtml = await enRes.text();
      return this.parsePriceTable(enHtml);
    } catch {
      return [];
    }
  }

  /**
   * Scrapes daily prices (both Nepali & English) from official Kalimati Mandi source.
   */
  public static async scrapeDailyPrices(): Promise<KalimatiScraperResult> {
    const timestamp = new Date().toISOString();
    console.log('[Kalimati] Fetching full bilingual market bulletin...');

    let html = '';
    let usedUrl = this.PRIMARY_URL;

    try {
      const res = await this.fetchWithTimeout(this.PRIMARY_URL, this.TIMEOUT_MS, { 'Accept-Language': 'ne,en;q=0.9' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      html = await res.text();
    } catch (primaryErr: any) {
      console.warn(`[Kalimati] Primary URL unreachable (${primaryErr?.message || primaryErr}), attempting homepage fallback...`);
      try {
        usedUrl = this.FALLBACK_URL;
        const res = await this.fetchWithTimeout(this.FALLBACK_URL, this.TIMEOUT_MS);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        html = await res.text();
      } catch (fallbackErr: any) {
        console.warn('[Kalimati] Live scraping failed. Using calibrated fallback seed data.', fallbackErr?.message || fallbackErr);
        return {
          source: 'fallback',
          scrapedAt: timestamp,
          sourceUrl: this.PRIMARY_URL,
          itemsCount: COMMODITY_SEEDS.length,
          totalBulletinCount: COMMODITY_SEEDS.length,
          commodities: COMMODITY_SEEDS.map((c) => ({ ...c })),
          fullBulletin: [],
        };
      }
    }

    try {
      const scrapedNe = this.parsePriceTable(html);
      if (!scrapedNe || scrapedNe.length === 0) {
        throw new Error('No table rows parsed from Kalimati HTML');
      }

      // Fetch English names concurrently for complete bilingual catalog
      const scrapedEn = await this.fetchEnglishBulletin();

      // Merge bilingual fields row-by-row when counts align closely
      const mergedItems: ScrapedPriceItem[] = scrapedNe.map((itemNe, idx) => {
        const candidateEn = scrapedEn[idx];
        const samePrices =
          candidateEn &&
          Math.abs(candidateEn.avgPrice - itemNe.avgPrice) < 0.5 &&
          Math.abs(candidateEn.minPrice - itemNe.minPrice) < 0.5;

        const nameEn = samePrices ? candidateEn.rawName : undefined;
        const unitEn = samePrices ? candidateEn.unit : undefined;
        return {
          ...itemNe,
          nameEn,
          unitEn,
          category: this.classifyBulletinItem(itemNe.rawName, nameEn || ''),
        };
      });

      const { matchedCommodities, matchedRawItems, unmatchedCount } = this.matchScrapedToSeeds(
        mergedItems,
        COMMODITY_SEEDS
      );

      console.log(
        `[Kalimati] Parsed ${mergedItems.length} full bulletin items (${scrapedEn.length > 0 ? 'bilingual' : 'Nepali'}), matched ${matchedRawItems.length}/${COMMODITY_SEEDS.length} tracked crops.`
      );

      if (matchedRawItems.length > 0) {
        return {
          source: 'live',
          scrapedAt: timestamp,
          sourceUrl: usedUrl,
          itemsCount: matchedRawItems.length,
          totalBulletinCount: mergedItems.length,
          commodities: matchedCommodities,
          rawItems: matchedRawItems,
          fullBulletin: mergedItems,
          unmatchedCount,
        };
      }

      throw new Error('Zero matched tracked commodities');
    } catch (parseErr: any) {
      console.warn('[Kalimati] Live scraping parse issue, using fallback seeds:', parseErr?.message || parseErr);
      return {
        source: 'fallback',
        scrapedAt: timestamp,
        sourceUrl: usedUrl,
        itemsCount: COMMODITY_SEEDS.length,
        totalBulletinCount: COMMODITY_SEEDS.length,
        commodities: COMMODITY_SEEDS.map((c) => ({ ...c })),
        fullBulletin: [],
      };
    }
  }
}
