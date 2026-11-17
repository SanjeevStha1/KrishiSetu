import { db } from '../../../src/db/index.ts';
import {
  users,
  farmLedger,
  marketplaceListings,
  priceAlerts,
  smsDeliveryLogs,
  dailyMarketPrices,
  districtPriceReports,
} from '../../../src/db/schema.ts';
import { eq, desc, and } from 'drizzle-orm';
import { AuthUser, MarketplaceListing, FarmRecordItem } from '../../../shared/types/krishi';

export interface DistrictPriceReportItem {
  id?: number;
  districtId: string;
  cropId: string;
  marketName: string;
  priceType: 'wholesale' | 'farmgate';
  pricePerKg: number;
  reporterName: string;
  reporterRole: 'farmer' | 'cooperative' | 'mandi_agent';
  reporterPhone?: string;
  recordedDate: string;
  createdAt?: string;
}

export interface PriceAlertSubscriptionItem {
  id: number;
  phone: string;
  districtId: string;
  cropId: string;
  cropName: string;
  targetPrice: number;
  direction: 'above' | 'below';
  channel: 'sms' | 'in_app' | 'both';
  active: boolean;
  lastTriggeredAt?: string;
  lastTriggeredPrice?: number;
  createdAt?: string;
}

export interface SmsDeliveryLogItem {
  id?: number;
  phone: string;
  districtId: string;
  cropId?: string;
  alertId?: number;
  carrier: string;
  provider: string;
  deliveryStatus: string;
  simulated: boolean;
  messageId: string;
  content: string;
  createdAt?: string;
}

export class DbStorageService {
  /**
   * Persists or updates a farmer user record in Cloud SQL
   */
  public static async upsertUser(user: AuthUser): Promise<void> {
    try {
      const uid = user.id || user.uid || `usr_${Date.now()}`;
      await db
        .insert(users)
        .values({
          uid,
          name: user.name,
          phone: user.phone || null,
          district: user.district || 'chitwan',
          municipality: user.municipality || null,
          ward: user.ward || null,
          locality: user.locality || null,
          farmName: user.farmName || null,
          landSize: String(user.landSize || '2.0'),
          landUnit: user.landUnit || 'ropani',
          primaryCrops: JSON.stringify(user.primaryCrops || ['tomato', 'potato']),
          preferredLanguage: user.preferredLanguage || 'ne',
        })
        .onConflictDoUpdate({
          target: users.uid,
          set: {
            name: user.name,
            phone: user.phone || null,
            district: user.district || 'chitwan',
            municipality: user.municipality || null,
            ward: user.ward || null,
            locality: user.locality || null,
            farmName: user.farmName || null,
            landSize: String(user.landSize || '2.0'),
            primaryCrops: JSON.stringify(user.primaryCrops || ['tomato', 'potato']),
            updatedAt: new Date(),
          },
        });
    } catch (err: any) {
      console.warn('[DbStorageService] Cloud SQL upsertUser error (safe fallback to memory):', err?.message);
    }
  }

  /**
   * Loads a registered user by UID from Cloud SQL
   */
  public static async getUserByUid(uid: string): Promise<AuthUser | null> {
    try {
      const rows = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
      const r = rows[0];
      if (!r) return null;
      let primaryCrops: string[] = ['tomato', 'potato'];
      try {
        if (r.primaryCrops) primaryCrops = JSON.parse(r.primaryCrops);
      } catch {}
      return {
        id: r.uid,
        uid: r.uid,
        name: r.name,
        phone: r.phone || '',
        district: r.district || 'chitwan',
        municipality: r.municipality || '',
        ward: r.ward || '1',
        locality: r.locality || '',
        farmName: r.farmName || `${r.name}'s Agro Farm`,
        landSize: Number(r.landSize) || 2.0,
        landUnit: (r.landUnit as any) || 'ropani',
        primaryCrops,
        preferredLanguage: (r.preferredLanguage as 'en' | 'ne') || 'ne',
        isRegistered: true,
        status: 'active',
        created_at: r.createdAt ? r.createdAt.toISOString() : undefined,
      };
    } catch {
      return null;
    }
  }

  /**
   * Loads a registered user by phone number suffix (last 10 digits) from Cloud SQL
   */
  public static async getUserByPhone(rawPhone: string): Promise<AuthUser | null> {
    try {
      const last10 = (rawPhone || '').replace(/\D/g, '').slice(-10);
      if (last10.length < 7) return null;
      const rows = await db.select().from(users).limit(500);
      const matched = rows.find((r) => (r.phone || '').replace(/\D/g, '').endsWith(last10));
      if (!matched) return null;
      let primaryCrops: string[] = ['tomato', 'potato'];
      try {
        if (matched.primaryCrops) primaryCrops = JSON.parse(matched.primaryCrops);
      } catch {}
      return {
        id: matched.uid,
        uid: matched.uid,
        name: matched.name,
        phone: matched.phone || '',
        district: matched.district || 'chitwan',
        municipality: matched.municipality || '',
        ward: matched.ward || '1',
        locality: matched.locality || '',
        farmName: matched.farmName || `${matched.name}'s Agro Farm`,
        landSize: Number(matched.landSize) || 2.0,
        landUnit: (matched.landUnit as any) || 'ropani',
        primaryCrops,
        preferredLanguage: (matched.preferredLanguage as 'en' | 'ne') || 'ne',
        isRegistered: true,
        status: 'active',
        created_at: matched.createdAt ? matched.createdAt.toISOString() : undefined,
      };
    } catch {
      return null;
    }
  }

  /**
   * Saves a farm accounting ledger transaction to Cloud SQL
   */
  public static async saveLedgerEntry(userId: string, record: FarmRecordItem): Promise<void> {
    try {
      await db.insert(farmLedger).values({
        userId,
        recordType: record.record_type,
        category: record.category || 'General',
        categoryLabel: record.categoryLabel || record.category || 'General',
        cropId: record.crop || null,
        cropName: record.cropName || record.crop || null,
        amount: Math.round(record.amount),
        quantityKg: record.quantityKg ? Math.round(record.quantityKg) : null,
        note: record.note || null,
      });
    } catch (err: any) {
      console.warn('[DbStorageService] Cloud SQL saveLedgerEntry error:', err?.message);
    }
  }

  /**
   * Retrieves all farm accounting ledger records for a user from Cloud SQL
   */
  public static async getLedgerEntries(userId: string): Promise<FarmRecordItem[]> {
    try {
      const rows = await db
        .select()
        .from(farmLedger)
        .where(eq(farmLedger.userId, userId))
        .orderBy(desc(farmLedger.recordedAt));

      return rows.map((r) => ({
        id: `acc-db-${r.id}`,
        record_type: r.recordType as any,
        category: r.category,
        categoryLabel: r.categoryLabel || r.category,
        crop: r.cropId || 'general',
        cropName: r.cropName || 'General Crop',
        amount: r.amount,
        quantityKg: r.quantityKg || undefined,
        note: r.note || undefined,
        source: 'manual',
        recorded_at: r.recordedAt ? r.recordedAt.toISOString() : new Date().toISOString(),
      }));
    } catch (err: any) {
      console.warn('[DbStorageService] Cloud SQL getLedgerEntries error:', err?.message);
      return [];
    }
  }

  /**
   * Saves a harvest lot listing into Cloud SQL
   */
  public static async saveMarketplaceListing(listing: MarketplaceListing): Promise<void> {
    try {
      await db
        .insert(marketplaceListings)
        .values({
          id: listing.id,
          userId: listing.farmerId || null,
          farmerName: listing.farmerName,
          farmerPhone: listing.farmerPhone,
          cropId: listing.cropId || listing.crop,
          cropName: listing.cropName,
          nepaliName: listing.nepaliName || null,
          emoji: listing.emoji || '🌾',
          quantityKg: Math.round(listing.quantityKg),
          pricePerKg: Math.round(listing.askingPricePerKg || listing.pricePerKg),
          district: listing.district.toLowerCase(),
          village: listing.village || null,
          pickupHub: listing.pickupHub || null,
          qualityGrade: listing.qualityGrade || 'Grade A',
          isOrganic: Boolean(listing.isOrganic),
          harvestWindow: listing.harvestWindow || 'Ready Now',
          status: listing.status || 'active',
        })
        .onConflictDoNothing();
    } catch (err: any) {
      console.warn('[DbStorageService] Cloud SQL saveMarketplaceListing error:', err?.message);
    }
  }

  /**
   * Retrieves marketplace listings from Cloud SQL
   */
  public static async getMarketplaceListings(crop?: string, district?: string): Promise<MarketplaceListing[]> {
    try {
      let query = db.select().from(marketplaceListings).orderBy(desc(marketplaceListings.createdAt));
      const rows = await query;

      let filtered = rows;
      if (crop && crop !== 'all') {
        filtered = filtered.filter((r) => r.cropId.toLowerCase() === crop.toLowerCase());
      }
      if (district && district !== 'all') {
        filtered = filtered.filter((r) => r.district.toLowerCase() === district.toLowerCase());
      }

      return filtered.map((r) => ({
        id: r.id,
        cropId: r.cropId,
        crop: r.cropId,
        cropName: r.cropName,
        nepaliName: r.nepaliName || r.cropName,
        emoji: r.emoji || '🌾',
        farmerId: r.userId || 'usr_kisan',
        farmerName: r.farmerName,
        farmerPhone: r.farmerPhone,
        village: r.village || '',
        municipality: '',
        district: r.district,
        location: `${r.village || ''}, ${r.district.toUpperCase()}`,
        quantityKg: r.quantityKg,
        availableKg: r.quantityKg,
        pricePerKg: r.pricePerKg,
        askingPricePerKg: r.pricePerKg,
        marketWholesalePrice: Math.round(r.pricePerKg * 1.05),
        harvestWindow: r.harvestWindow || 'Ready Now',
        readyStatus: 'ready_now',
        qualityGrade: (r.qualityGrade as any) || 'Grade A',
        isOrganic: Boolean(r.isOrganic),
        verified: true,
        rating: 4.9,
        reviewsCount: 5,
        pickupHub: r.pickupHub || r.village || `${r.district} Center`,
        description: `${r.quantityKg} kg ${r.cropName} harvested in ${r.district}.`,
        status: (r.status as any) || 'active',
        allowPooling: true,
        bidsCount: 0,
        createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
      }));
    } catch (err: any) {
      console.warn('[DbStorageService] Cloud SQL getMarketplaceListings error:', err?.message);
      return [];
    }
  }

  /**
   * Archives daily Mandi clearing rates in Cloud SQL with same-day deduplication
   */
  public static async archiveDailyPrice(
    cropId: string,
    cropName: string,
    minPrice: number,
    maxPrice: number,
    avgPrice: number,
    source: string = 'live',
    mandiName: string = 'Kalimati Mandi, Kathmandu'
  ): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const existing = await db
        .select({ id: dailyMarketPrices.id })
        .from(dailyMarketPrices)
        .where(
          and(
            eq(dailyMarketPrices.cropId, cropId),
            eq(dailyMarketPrices.recordedDate, today),
            eq(dailyMarketPrices.mandiName, mandiName)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(dailyMarketPrices)
          .set({
            cropName,
            minPrice: Math.round(minPrice),
            maxPrice: Math.round(maxPrice),
            avgPrice: Math.round(avgPrice),
            source,
          })
          .where(eq(dailyMarketPrices.id, existing[0].id));
      } else {
        await db.insert(dailyMarketPrices).values({
          cropId,
          cropName,
          mandiName,
          minPrice: Math.round(minPrice),
          maxPrice: Math.round(maxPrice),
          avgPrice: Math.round(avgPrice),
          source,
          recordedDate: today,
        });
      }
    } catch (err: any) {
      console.warn('[DbStorageService] Cloud SQL archiveDailyPrice error:', err?.message);
    }
  }

  /**
   * Reads archived daily market prices from Cloud SQL
   */
  public static async getArchivedDailyPrices(cropId: string, limitDays: number = 30): Promise<Array<{
    cropId: string;
    date: string;
    price: number;
    minPrice: number;
    maxPrice: number;
    source: string;
  }>> {
    try {
      const rows = await db
        .select()
        .from(dailyMarketPrices)
        .where(eq(dailyMarketPrices.cropId, cropId))
        .orderBy(desc(dailyMarketPrices.recordedDate))
        .limit(limitDays);

      return rows
        .map((r) => ({
          cropId: r.cropId,
          date: r.recordedDate,
          price: r.avgPrice,
          minPrice: r.minPrice,
          maxPrice: r.maxPrice,
          source: r.source || 'live',
        }))
        .reverse();
    } catch {
      return [];
    }
  }

  // In-memory cache/fallback for 77-district verified local price reports
  private static memoryDistrictReports: DistrictPriceReportItem[] = [];

  /**
   * Saves a farmer/cooperative/mandi-agent local market price report to Cloud SQL
   */
  public static async saveDistrictPriceReport(input: Omit<DistrictPriceReportItem, 'id' | 'createdAt' | 'recordedDate'> & { recordedDate?: string }): Promise<DistrictPriceReportItem> {
    const recordedDate = input.recordedDate || new Date().toISOString().split('T')[0];
    const cleanReport: DistrictPriceReportItem = {
      districtId: input.districtId.toLowerCase().trim(),
      cropId: input.cropId.toLowerCase().trim(),
      marketName: input.marketName.trim(),
      priceType: input.priceType === 'farmgate' ? 'farmgate' : 'wholesale',
      pricePerKg: Math.max(5, Math.round(Number(input.pricePerKg))),
      reporterName: input.reporterName.trim(),
      reporterRole: input.reporterRole || 'farmer',
      reporterPhone: input.reporterPhone?.trim() || undefined,
      recordedDate,
      createdAt: new Date().toISOString(),
    };

    try {
      const inserted = await db
        .insert(districtPriceReports)
        .values({
          districtId: cleanReport.districtId,
          cropId: cleanReport.cropId,
          marketName: cleanReport.marketName,
          priceType: cleanReport.priceType,
          pricePerKg: cleanReport.pricePerKg,
          reporterName: cleanReport.reporterName,
          reporterRole: cleanReport.reporterRole,
          reporterPhone: cleanReport.reporterPhone || null,
          recordedDate: cleanReport.recordedDate,
        })
        .returning({ id: districtPriceReports.id });

      if (inserted[0]?.id) {
        cleanReport.id = inserted[0].id;
      }
    } catch (err: any) {
      console.warn('[DbStorageService] Cloud SQL saveDistrictPriceReport fallback to memory:', err?.message);
    }

    this.memoryDistrictReports = [cleanReport, ...this.memoryDistrictReports].slice(0, 500);
    return cleanReport;
  }

  /**
   * Lists recent crowd-verified local market price reports
   */
  public static async getDistrictPriceReports(districtId?: string, cropId?: string, limitCount: number = 40): Promise<DistrictPriceReportItem[]> {
    try {
      const conditions = [];
      if (districtId && districtId !== 'all') {
        conditions.push(eq(districtPriceReports.districtId, districtId.toLowerCase().trim()));
      }
      if (cropId && cropId !== 'all') {
        conditions.push(eq(districtPriceReports.cropId, cropId.toLowerCase().trim()));
      }

      const rows = conditions.length > 0
        ? await db
            .select()
            .from(districtPriceReports)
            .where(conditions.length === 1 ? conditions[0] : and(...conditions))
            .orderBy(desc(districtPriceReports.createdAt))
            .limit(limitCount)
        : await db
            .select()
            .from(districtPriceReports)
            .orderBy(desc(districtPriceReports.createdAt))
            .limit(limitCount);

      return rows.map((r) => ({
        id: r.id,
        districtId: r.districtId,
        cropId: r.cropId,
        marketName: r.marketName,
        priceType: (r.priceType as 'wholesale' | 'farmgate') || 'wholesale',
        pricePerKg: r.pricePerKg,
        reporterName: r.reporterName,
        reporterRole: (r.reporterRole as 'farmer' | 'cooperative' | 'mandi_agent') || 'farmer',
        reporterPhone: r.reporterPhone || undefined,
        recordedDate: r.recordedDate,
        createdAt: r.createdAt ? r.createdAt.toISOString() : undefined,
      }));
    } catch {
      return this.memoryDistrictReports
        .filter((r) => {
          if (districtId && districtId !== 'all' && r.districtId !== districtId.toLowerCase()) return false;
          if (cropId && cropId !== 'all' && r.cropId !== cropId.toLowerCase()) return false;
          return true;
        })
        .slice(0, limitCount);
    }
  }

  /**
   * Computes today's median reported wholesale & farmgate prices per crop for a district
   */
  public static async getTodayDistrictMedianPrices(districtId: string): Promise<Map<string, {
    wholesalePrice?: number;
    farmgatePrice?: number;
    reportCount: number;
    marketName: string;
    lastReporterRole: string;
  }>> {
    const today = new Date().toISOString().split('T')[0];
    const reports = await this.getDistrictPriceReports(districtId, undefined, 100);
    const todayReports = reports.filter((r) => r.recordedDate === today);

    const grouped = new Map<string, DistrictPriceReportItem[]>();
    for (const r of todayReports) {
      if (!grouped.has(r.cropId)) grouped.set(r.cropId, []);
      grouped.get(r.cropId)!.push(r);
    }

    const median = (nums: number[]): number | undefined => {
      if (nums.length === 0) return undefined;
      const sorted = [...nums].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 === 1 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
    };

    const result = new Map<string, {
      wholesalePrice?: number;
      farmgatePrice?: number;
      reportCount: number;
      marketName: string;
      lastReporterRole: string;
    }>();

    for (const [cid, list] of grouped.entries()) {
      const wholesaleList = list.filter((x) => x.priceType === 'wholesale').map((x) => x.pricePerKg);
      const farmgateList = list.filter((x) => x.priceType === 'farmgate').map((x) => x.pricePerKg);
      result.set(cid, {
        wholesalePrice: median(wholesaleList),
        farmgatePrice: median(farmgateList),
        reportCount: list.length,
        marketName: list[0].marketName,
        lastReporterRole: list[0].reporterRole,
      });
    }

    return result;
  }

  // Memory fallbacks for price alerts & SMS logs (when DB offline / test env)
  private static memoryPriceAlerts: PriceAlertSubscriptionItem[] = [];
  private static memorySmsLogs: SmsDeliveryLogItem[] = [];
  private static nextMemoryAlertId = 1;

  public static normalizePhoneNumber(rawPhone: string): string {
    const clean = (rawPhone || '').replace(/[\s\-\+]/g, '');
    return clean.startsWith('977') ? clean.substring(3) : clean;
  }

  /**
   * Creates a persistent target price alert subscription in Cloud SQL
   */
  public static async createPriceAlert(input: {
    phone: string;
    districtId: string;
    cropId: string;
    cropName: string;
    targetPrice: number;
    direction?: 'above' | 'below';
    channel?: 'sms' | 'in_app' | 'both';
  }): Promise<PriceAlertSubscriptionItem> {
    const cleanPhone = this.normalizePhoneNumber(input.phone);
    const direction = input.direction === 'below' ? 'below' : 'above';
    const channel = ['sms', 'in_app', 'both'].includes(input.channel || '')
      ? (input.channel as 'sms' | 'in_app' | 'both')
      : 'sms';
    const cleanDistrict = (input.districtId || 'chitwan').toLowerCase().trim();
    const cleanCrop = (input.cropId || 'tomato').toLowerCase().trim();
    const targetPrice = Math.max(5, Math.round(Number(input.targetPrice)));

    try {
      const inserted = await db
        .insert(priceAlerts)
        .values({
          phone: cleanPhone,
          districtId: cleanDistrict,
          cropId: cleanCrop,
          cropName: input.cropName || cleanCrop,
          targetPrice,
          direction,
          channel,
          active: true,
        })
        .returning();

      if (inserted[0]) {
        const r = inserted[0];
        return {
          id: r.id,
          phone: r.phone,
          districtId: r.districtId,
          cropId: r.cropId,
          cropName: r.cropName,
          targetPrice: r.targetPrice,
          direction: (r.direction as 'above' | 'below') || 'above',
          channel: (r.channel as 'sms' | 'in_app' | 'both') || 'sms',
          active: Boolean(r.active),
          lastTriggeredAt: r.lastTriggeredAt ? r.lastTriggeredAt.toISOString() : undefined,
          lastTriggeredPrice: r.lastTriggeredPrice ?? undefined,
          createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
        };
      }
    } catch (err: any) {
      console.warn('[DbStorageService] Cloud SQL createPriceAlert fallback to memory:', err?.message);
    }

    const memItem: PriceAlertSubscriptionItem = {
      id: this.nextMemoryAlertId++,
      phone: cleanPhone,
      districtId: cleanDistrict,
      cropId: cleanCrop,
      cropName: input.cropName || cleanCrop,
      targetPrice,
      direction,
      channel,
      active: true,
      createdAt: new Date().toISOString(),
    };
    this.memoryPriceAlerts.unshift(memItem);
    return memItem;
  }

  /**
   * Lists active price alert subscriptions (optionally filtered by phone)
   */
  public static async getPriceAlerts(phone?: string, activeOnly: boolean = true): Promise<PriceAlertSubscriptionItem[]> {
    const cleanPhone = phone ? this.normalizePhoneNumber(phone) : undefined;
    try {
      const conditions = [];
      if (activeOnly) conditions.push(eq(priceAlerts.active, true));
      if (cleanPhone) conditions.push(eq(priceAlerts.phone, cleanPhone));

      const rows = conditions.length > 0
        ? await db
            .select()
            .from(priceAlerts)
            .where(conditions.length === 1 ? conditions[0] : and(...conditions))
            .orderBy(desc(priceAlerts.createdAt))
            .limit(100)
        : await db
            .select()
            .from(priceAlerts)
            .orderBy(desc(priceAlerts.createdAt))
            .limit(100);

      return rows.map((r) => ({
        id: r.id,
        phone: r.phone,
        districtId: r.districtId,
        cropId: r.cropId,
        cropName: r.cropName,
        targetPrice: r.targetPrice,
        direction: (r.direction as 'above' | 'below') || 'above',
        channel: (r.channel as 'sms' | 'in_app' | 'both') || 'sms',
        active: Boolean(r.active),
        lastTriggeredAt: r.lastTriggeredAt ? r.lastTriggeredAt.toISOString() : undefined,
        lastTriggeredPrice: r.lastTriggeredPrice ?? undefined,
        createdAt: r.createdAt ? r.createdAt.toISOString() : undefined,
      }));
    } catch {
      return this.memoryPriceAlerts.filter((a) => {
        if (activeOnly && !a.active) return false;
        if (cleanPhone && a.phone !== cleanPhone) return false;
        return true;
      });
    }
  }

  /**
   * Deactivates/cancels a price alert subscription by ID
   */
  public static async deactivatePriceAlert(id: number): Promise<boolean> {
    try {
      await db
        .update(priceAlerts)
        .set({ active: false })
        .where(eq(priceAlerts.id, id));
      return true;
    } catch {
      const found = this.memoryPriceAlerts.find((a) => a.id === id);
      if (found) {
        found.active = false;
        return true;
      }
      return false;
    }
  }

  /**
   * Records when an alert threshold was triggered to enforce 24h cooldown deduplication
   */
  public static async markPriceAlertTriggered(id: number, triggeredPrice: number): Promise<void> {
    try {
      await db
        .update(priceAlerts)
        .set({
          lastTriggeredAt: new Date(),
          lastTriggeredPrice: Math.round(triggeredPrice),
        })
        .where(eq(priceAlerts.id, id));
    } catch {
      const found = this.memoryPriceAlerts.find((a) => a.id === id);
      if (found) {
        found.lastTriggeredAt = new Date().toISOString();
        found.lastTriggeredPrice = Math.round(triggeredPrice);
      }
    }
  }

  /**
   * Persists an SMS dispatch record in Cloud SQL sms_delivery_logs
   */
  public static async saveSmsDeliveryLog(log: SmsDeliveryLogItem): Promise<SmsDeliveryLogItem> {
    const clean: SmsDeliveryLogItem = {
      ...log,
      phone: this.normalizePhoneNumber(log.phone),
      districtId: (log.districtId || 'chitwan').toLowerCase().trim(),
      createdAt: log.createdAt || new Date().toISOString(),
    };

    try {
      const inserted = await db
        .insert(smsDeliveryLogs)
        .values({
          phone: clean.phone,
          districtId: clean.districtId,
          cropId: clean.cropId || null,
          alertId: clean.alertId ?? null,
          carrier: clean.carrier,
          provider: clean.provider,
          deliveryStatus: clean.deliveryStatus,
          simulated: Boolean(clean.simulated),
          messageId: clean.messageId,
          content: clean.content,
        })
        .returning({ id: smsDeliveryLogs.id });

      if (inserted[0]?.id) {
        clean.id = inserted[0].id;
      }
    } catch (err: any) {
      console.warn('[DbStorageService] Cloud SQL saveSmsDeliveryLog fallback to memory:', err?.message);
    }

    this.memorySmsLogs = [clean, ...this.memorySmsLogs].slice(0, 100);
    return clean;
  }

  /**
   * Fetches SMS delivery audit logs from Cloud SQL
   */
  public static async getSmsDeliveryLogs(limitCount: number = 30, phone?: string): Promise<SmsDeliveryLogItem[]> {
    const cleanPhone = phone ? this.normalizePhoneNumber(phone) : undefined;
    try {
      const rows = cleanPhone
        ? await db
            .select()
            .from(smsDeliveryLogs)
            .where(eq(smsDeliveryLogs.phone, cleanPhone))
            .orderBy(desc(smsDeliveryLogs.createdAt))
            .limit(limitCount)
        : await db
            .select()
            .from(smsDeliveryLogs)
            .orderBy(desc(smsDeliveryLogs.createdAt))
            .limit(limitCount);

      return rows.map((r) => ({
        id: r.id,
        phone: r.phone,
        districtId: r.districtId,
        cropId: r.cropId || undefined,
        alertId: r.alertId ?? undefined,
        carrier: r.carrier,
        provider: r.provider,
        deliveryStatus: r.deliveryStatus,
        simulated: Boolean(r.simulated),
        messageId: r.messageId,
        content: r.content,
        createdAt: r.createdAt ? r.createdAt.toISOString() : undefined,
      }));
    } catch {
      return this.memorySmsLogs
        .filter((l) => (!cleanPhone ? true : l.phone === cleanPhone))
        .slice(0, limitCount);
    }
  }
}
