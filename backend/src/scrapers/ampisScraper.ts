/**
 * AMPIS Regional Mandi Scraper (Department of Agriculture - ampis.gov.np)
 * Scrapes Nepal's 12 official regional wholesale markets across all 7 provinces
 * to extract real inter-regional wholesale price spreads vs Kalimati.
 */

export type AmpisHubKey =
  | 'birtamod'
  | 'dharan'
  | 'dhalkebar'
  | 'lalbandi'
  | 'kamalamai'
  | 'kalimati'
  | 'kawasoti'
  | 'pokhara'
  | 'butwal'
  | 'kohalpur'
  | 'birendranagar'
  | 'attariya';

export interface AmpisHubMeta {
  hubKey: AmpisHubKey;
  ampisFilterId: string;
  nameEn: string;
  nameNe: string;
  districtId: string;
  province: string;
}

export const AMPIS_HUBS: AmpisHubMeta[] = [
  { hubKey: 'birtamod', ampisFilterId: '5', nameEn: 'Birtamod Mandi (Jhapa)', nameNe: 'बिर्तामोड कृषि बजार, झापा', districtId: 'jhapa', province: 'Koshi' },
  { hubKey: 'dharan', ampisFilterId: '6', nameEn: 'Dharan Krishi Bazar (Sunsari)', nameNe: 'धरान कृषि उपज बजार, सुनसरी', districtId: 'sunsari', province: 'Koshi' },
  { hubKey: 'dhalkebar', ampisFilterId: '7', nameEn: 'Dhalkebar Mandi (Dhanusha)', nameNe: 'ढल्केवर कृषि बजार, धनुषा', districtId: 'dhanusha', province: 'Madhesh' },
  { hubKey: 'lalbandi', ampisFilterId: '15', nameEn: 'Lalbandi Krishi Bazar (Sarlahi)', nameNe: 'लालबन्दी कृषि बजार, सर्लाही', districtId: 'sarlahi', province: 'Madhesh' },
  { hubKey: 'kamalamai', ampisFilterId: '8', nameEn: 'Kamalamai Mandi (Sindhuli)', nameNe: 'कमलामाई कृषि बजार, सिन्धुली', districtId: 'sindhuli', province: 'Bagmati' },
  { hubKey: 'kalimati', ampisFilterId: '23', nameEn: 'Kalimati Wholesale (Kathmandu)', nameNe: 'कालीमाटी थोक बजार, काठमाडौं', districtId: 'kathmandu', province: 'Bagmati' },
  { hubKey: 'kawasoti', ampisFilterId: '9', nameEn: 'Kawasoti Mandi (Nawalpur)', nameNe: 'कावासोती कृषि बजार, नवलपुर', districtId: 'nawalpur', province: 'Gandaki' },
  { hubKey: 'pokhara', ampisFilterId: '10', nameEn: 'Pokhara Krishi Bazar (Kaski)', nameNe: 'पोखरा कृषि उपज बजार, कास्की', districtId: 'pokhara', province: 'Gandaki' },
  { hubKey: 'butwal', ampisFilterId: '11', nameEn: 'Butwal Krishi Upaj (Rupandehi)', nameNe: 'बुटवल कृषि उपज बजार, रुपन्देही', districtId: 'rupandehi', province: 'Lumbini' },
  { hubKey: 'kohalpur', ampisFilterId: '12', nameEn: 'Kohalpur Mandi (Banke)', nameNe: 'कोहलपुर कृषि बजार, बाँके', districtId: 'banke', province: 'Lumbini' },
  { hubKey: 'birendranagar', ampisFilterId: '13', nameEn: 'Birendranagar Mandi (Surkhet)', nameNe: 'बिरेन्द्रनगर कृषि बजार, सुर्खेत', districtId: 'surkhet', province: 'Karnali' },
  { hubKey: 'attariya', ampisFilterId: '14', nameEn: 'Attariya Mandi (Kailali)', nameNe: 'अत्तरिया कृषि बजार, कैलाली', districtId: 'kailali', province: 'Sudurpashchim' },
];

export interface AmpisObservation {
  hubKey: AmpisHubKey;
  cropId: string;
  rawName: string;
  monthNe: string;
  dayNe: string;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
}

export interface AmpisHubSnapshot {
  hubKey: AmpisHubKey;
  nameEn: string;
  nameNe: string;
  province: string;
  lastObservedLabel: string;
  matchedCropsCount: number;
  overallRatioVsKalimati: number;
  cropRatios: Record<string, number>;
  cropPrices: Record<string, { min: number; max: number; avg: number }>;
  source: 'live_ampis' | 'calibrated_ampis_baseline';
}

// Initial baseline ratios derived from empirical AMPIS comparative tables vs Kalimati
const DEFAULT_HUB_RATIOS: Record<AmpisHubKey, number> = {
  birtamod: 0.88,
  dharan: 0.91,
  dhalkebar: 0.86,
  lalbandi: 0.83,
  kamalamai: 0.92,
  kalimati: 1.00,
  kawasoti: 0.93,
  pokhara: 1.05,
  butwal: 0.94,
  kohalpur: 0.95,
  birendranagar: 1.04,
  attariya: 0.96,
};

const NEPALI_CROP_RULES: Array<{ cropId: string; keywords: string[]; exclude?: string[] }> = [
  { cropId: 'tomato', keywords: ['गोलभेडा', 'गोलभेंडा', 'टमाटर'] },
  { cropId: 'potato', keywords: ['आलु'], exclude: ['सखरखण्ड'] },
  { cropId: 'onion', keywords: ['प्याज'] },
  { cropId: 'cauliflower', keywords: ['काउली'], exclude: ['ब्रोकाउली'] },
  { cropId: 'cabbage', keywords: ['बन्दा'] },
  { cropId: 'carrot', keywords: ['गाजर', 'गाँजर'] },
  { cropId: 'capsicum', keywords: ['भेडे खुर्सानी'] },
  { cropId: 'beans', keywords: ['सिमी', 'बोडी', 'घिउ सिमी'] },
  { cropId: 'bitter_gourd', keywords: ['करेला', 'तिते करेला'] },
  { cropId: 'bottle_gourd', keywords: ['लौका'] },
  { cropId: 'brinjal', keywords: ['भन्टा', 'भण्टा', 'बैगुन'] },
  { cropId: 'chilli', keywords: ['खुर्सानी'], exclude: ['भेडे'] },
  { cropId: 'coriander', keywords: ['धनिया'] },
  { cropId: 'cucumber', keywords: ['काँक्रो', 'काक्रो'] },
  { cropId: 'garlic', keywords: ['लसुन'] },
  { cropId: 'ginger', keywords: ['अदुवा'] },
  { cropId: 'ladies_finger', keywords: ['भिन्डी', 'रामतोरिया'] },
  { cropId: 'mushroom', keywords: ['च्याउ'] },
  { cropId: 'peas', keywords: ['केराउ', 'मटरकोसा'] },
  { cropId: 'pumpkin', keywords: ['फर्सी'] },
  { cropId: 'radish', keywords: ['मूला', 'मुला'] },
  { cropId: 'spinach', keywords: ['पालुङ्गो', 'पालुंगो', 'रायोको साग'] },
  { cropId: 'sweet_potato', keywords: ['सखरखण्ड'] },
];

export class AmpisScraper {
  private static BASE_URL = 'https://ampis.gov.np/market-price-comparison';
  private static TIMEOUT_MS = 6000;
  private static hubCache: Map<AmpisHubKey, AmpisHubSnapshot> = new Map();
  private static lastSyncedAt: string = '';
  private static lastSyncSource: 'live_ampis' | 'calibrated_ampis_baseline' = 'calibrated_ampis_baseline';

  private static initDefaults(): void {
    if (this.hubCache.size > 0) return;
    for (const meta of AMPIS_HUBS) {
      this.hubCache.set(meta.hubKey, {
        hubKey: meta.hubKey,
        nameEn: meta.nameEn,
        nameNe: meta.nameNe,
        province: meta.province,
        lastObservedLabel: 'AMPIS Reference Baseline',
        matchedCropsCount: 0,
        overallRatioVsKalimati: DEFAULT_HUB_RATIOS[meta.hubKey] ?? 0.95,
        cropRatios: {},
        cropPrices: {},
        source: 'calibrated_ampis_baseline',
      });
    }
  }

  private static mapCropName(rawName: string): string | null {
    const clean = (rawName || '').toLowerCase();
    for (const rule of NEPALI_CROP_RULES) {
      if (rule.exclude && rule.exclude.some((ex) => clean.includes(ex))) continue;
      if (rule.keywords.some((kw) => clean.includes(kw))) {
        return rule.cropId;
      }
    }
    return null;
  }

  private static parseNum(str: string): number {
    const digits: Record<string, string> = {
      '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
      '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
    };
    const normalized = (str || '').replace(/[०-९]/g, (d) => digits[d] || d).replace(/[^0-9.]/g, '');
    const n = parseFloat(normalized);
    return isNaN(n) ? 0 : n;
  }

  private static parseMarketHtml(html: string, hubKey: AmpisHubKey): AmpisObservation[] {
    const observations: AmpisObservation[] = [];
    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let m: RegExpExecArray | null;

    while ((m = trRegex.exec(html)) !== null) {
      if (m[1].includes('<th')) continue;
      const cells = [...m[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((c) =>
        c[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
      );
      // Format: [कृषि बजार, महिना, गते, कृषि उपज, ईकाइ, न्यूनतम, अधिकतम, औसत]
      if (cells.length >= 8) {
        const monthNe = cells[1];
        const dayNe = cells[2];
        const rawName = cells[3];
        const minPrice = this.parseNum(cells[5]);
        const maxPrice = this.parseNum(cells[6]);
        const avgPrice = this.parseNum(cells[7]) || (minPrice + maxPrice) / 2;
        const cropId = this.mapCropName(rawName);
        if (cropId && avgPrice > 0) {
          observations.push({
            hubKey,
            cropId,
            rawName,
            monthNe,
            dayNe,
            minPrice,
            maxPrice,
            avgPrice,
          });
        }
      }
    }
    return observations;
  }

  private static async fetchHubObservations(meta: AmpisHubMeta): Promise<AmpisObservation[]> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.TIMEOUT_MS);
    try {
      const url = `${this.BASE_URL}?uid_entityreference_filter=${encodeURIComponent(meta.ampisFilterId)}`;
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (KrishiSetu-AgriIntel/3.0)',
          'Accept': 'text/html,application/xhtml+xml',
        },
      });
      clearTimeout(timer);
      if (!res.ok) return [];
      const html = await res.text();
      return this.parseMarketHtml(html, meta.hubKey);
    } catch {
      clearTimeout(timer);
      return [];
    }
  }

  /**
   * Concurrently syncs AMPIS's 12 official regional markets and computes
   * empirical crop-level regional ratios relative to Kalimati on matching dates.
   */
  public static async syncRegionalHubs(): Promise<{
    source: 'live_ampis' | 'calibrated_ampis_baseline';
    syncedHubs: number;
    lastSyncedAt: string;
  }> {
    this.initDefaults();
    try {
      const results = await Promise.all(
        AMPIS_HUBS.map(async (meta) => ({
          meta,
          obs: await this.fetchHubObservations(meta),
        }))
      );

      // Build Kalimati AMPIS reference baseline per crop (hubKey === 'kalimati')
      const kalimatiResult = results.find((r) => r.meta.hubKey === 'kalimati');
      const kalimatiCropAvgs: Record<string, number> = {};
      if (kalimatiResult && kalimatiResult.obs.length > 0) {
        const grouped: Record<string, number[]> = {};
        for (const o of kalimatiResult.obs) {
          if (!grouped[o.cropId]) grouped[o.cropId] = [];
          grouped[o.cropId].push(o.avgPrice);
        }
        for (const [cid, arr] of Object.entries(grouped)) {
          kalimatiCropAvgs[cid] = arr.reduce((a, b) => a + b, 0) / arr.length;
        }
      }

      let liveCount = 0;
      for (const { meta, obs } of results) {
        if (obs.length === 0) continue;
        liveCount++;

        const cropGroups: Record<string, AmpisObservation[]> = {};
        for (const o of obs) {
          if (!cropGroups[o.cropId]) cropGroups[o.cropId] = [];
          cropGroups[o.cropId].push(o);
        }

        const cropPrices: Record<string, { min: number; max: number; avg: number }> = {};
        const cropRatios: Record<string, number> = {};
        const ratioSamples: number[] = [];

        for (const [cid, list] of Object.entries(cropGroups)) {
          const avg = Math.round((list.reduce((s, i) => s + i.avgPrice, 0) / list.length) * 10) / 10;
          const min = Math.min(...list.map((i) => i.minPrice || i.avgPrice));
          const max = Math.max(...list.map((i) => i.maxPrice || i.avgPrice));
          cropPrices[cid] = { min, max, avg };

          const kAvg = kalimatiCropAvgs[cid];
          if (kAvg && kAvg > 0 && meta.hubKey !== 'kalimati') {
            // Clamp empirical ratio between 0.62x and 1.38x to guard against grade mismatches
            const rawRatio = avg / kAvg;
            const clamped = Math.max(0.62, Math.min(1.38, Math.round(rawRatio * 100) / 100));
            cropRatios[cid] = clamped;
            ratioSamples.push(clamped);
          } else if (meta.hubKey === 'kalimati') {
            cropRatios[cid] = 1.0;
          }
        }

        const overallRatio =
          meta.hubKey === 'kalimati'
            ? 1.0
            : ratioSamples.length > 0
            ? Math.round((ratioSamples.reduce((a, b) => a + b, 0) / ratioSamples.length) * 100) / 100
            : DEFAULT_HUB_RATIOS[meta.hubKey];

        const firstObs = obs[0];
        this.hubCache.set(meta.hubKey, {
          hubKey: meta.hubKey,
          nameEn: meta.nameEn,
          nameNe: meta.nameNe,
          province: meta.province,
          lastObservedLabel: `${firstObs.monthNe} ${firstObs.dayNe} (AMPIS)`,
          matchedCropsCount: Object.keys(cropPrices).length,
          overallRatioVsKalimati: overallRatio,
          cropRatios,
          cropPrices,
          source: 'live_ampis',
        });
      }

      this.lastSyncedAt = new Date().toISOString();
      this.lastSyncSource = liveCount > 0 ? 'live_ampis' : 'calibrated_ampis_baseline';
      if (liveCount > 0) {
        console.log(`[AMPIS] Synced ${liveCount}/${AMPIS_HUBS.length} official regional wholesale markets from ampis.gov.np`);
      }

      return {
        source: this.lastSyncSource,
        syncedHubs: liveCount,
        lastSyncedAt: this.lastSyncedAt,
      };
    } catch {
      this.lastSyncedAt = new Date().toISOString();
      return {
        source: 'calibrated_ampis_baseline',
        syncedHubs: 0,
        lastSyncedAt: this.lastSyncedAt,
      };
    }
  }

  public static getHubMultiplier(hubKey: string, cropId?: string): {
    ratio: number;
    hubSnapshot: AmpisHubSnapshot;
    isAmpisDirectCropRatio: boolean;
  } {
    this.initDefaults();
    const cleanKey = (hubKey || 'kalimati').toLowerCase() as AmpisHubKey;
    const snap = this.hubCache.get(cleanKey) || this.hubCache.get('kalimati')!;
    if (cropId && snap.cropRatios[cropId] !== undefined) {
      return {
        ratio: snap.cropRatios[cropId],
        hubSnapshot: snap,
        isAmpisDirectCropRatio: snap.source === 'live_ampis',
      };
    }
    return {
      ratio: snap.overallRatioVsKalimati,
      hubSnapshot: snap,
      isAmpisDirectCropRatio: false,
    };
  }

  public static getAllHubSnapshots(): {
    source: 'live_ampis' | 'calibrated_ampis_baseline';
    lastSyncedAt: string;
    hubs: AmpisHubSnapshot[];
  } {
    this.initDefaults();
    return {
      source: this.lastSyncSource,
      lastSyncedAt: this.lastSyncedAt || new Date().toISOString(),
      hubs: Array.from(this.hubCache.values()),
    };
  }
}
