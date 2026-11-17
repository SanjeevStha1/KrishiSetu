import { DbStorageService, PriceAlertSubscriptionItem } from './dbStorageService';
import { MarketDataService } from './marketDataService';
import { SmsService, SmsSendResult } from './smsService';

export interface AlertEvaluationSummary {
  triggerReason: 'scheduled_sync' | 'local_report' | 'manual_check';
  evaluatedCount: number;
  triggeredCount: number;
  skippedCooldownCount: number;
  dispatches: Array<{
    alertId: number;
    phone: string;
    districtId: string;
    cropId: string;
    targetPrice: number;
    actualPrice: number;
    direction: 'above' | 'below';
    smsResult: SmsSendResult;
  }>;
}

const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours between duplicate threshold alerts

export class AlertWorkerService {
  /**
   * Evaluates active Cloud SQL price threshold subscriptions against current 3-layer localized
   * prices for each subscriber's district and dispatches SMS alerts when thresholds are crossed.
   */
  public static async evaluateAndDispatchAlerts(
    triggerReason: AlertEvaluationSummary['triggerReason'] = 'manual_check',
    focusDistrictId?: string
  ): Promise<AlertEvaluationSummary> {
    const allAlerts = await DbStorageService.getPriceAlerts(undefined, true);
    const targetAlerts = focusDistrictId
      ? allAlerts.filter((a) => a.districtId.toLowerCase() === focusDistrictId.toLowerCase())
      : allAlerts;

    if (targetAlerts.length === 0) {
      return {
        triggerReason,
        evaluatedCount: 0,
        triggeredCount: 0,
        skippedCooldownCount: 0,
        dispatches: [],
      };
    }

    // Group unique districts to fetch 3-layer regional prices once per district
    const uniqueDistricts = Array.from(new Set(targetAlerts.map((a) => a.districtId)));
    const districtPriceCache = new Map<
      string,
      Awaited<ReturnType<typeof MarketDataService.getDistrictCommodityPrices>>
    >();

    for (const did of uniqueDistricts) {
      try {
        const reg = await MarketDataService.getDistrictCommodityPrices(did);
        districtPriceCache.set(did, reg);
      } catch {
        // Skip unreachable district gracefully
      }
    }

    const nowMs = Date.now();
    let skippedCooldownCount = 0;
    const dispatches: AlertEvaluationSummary['dispatches'] = [];

    for (const alert of targetAlerts) {
      const regional = districtPriceCache.get(alert.districtId);
      if (!regional) continue;

      const cropRate = regional.prices.find((p) => p.cropId === alert.cropId);
      if (!cropRate) continue;

      const actualPrice = cropRate.localizedWholesalePrice;
      const crossed =
        alert.direction === 'below'
          ? actualPrice <= alert.targetPrice
          : actualPrice >= alert.targetPrice;

      if (!crossed) continue;

      // Enforce 24h cooldown deduplication
      if (alert.lastTriggeredAt) {
        const lastMs = new Date(alert.lastTriggeredAt).getTime();
        if (!isNaN(lastMs) && nowMs - lastMs < COOLDOWN_MS) {
          skippedCooldownCount++;
          continue;
        }
      }

      const distShort = regional.district.name.split('(')[0].trim();
      const cropShort = cropRate.name.split('(')[0].trim();
      const conditionText =
        alert.direction === 'below'
          ? `dropped to Rs${actualPrice}/kg (<= target Rs${alert.targetPrice})`
          : `reached Rs${actualPrice}/kg (>= target Rs${alert.targetPrice})`;

      const message = `[KrishiSetu Alert] ${distShort} ${cropShort} ${conditionText}. ${cropRate.priceSourceLabelEn}.`;

      const smsResult = await SmsService.sendSms({
        phone: alert.phone,
        message,
        districtId: alert.districtId,
        cropId: alert.cropId,
        alertId: alert.id,
      });

      await DbStorageService.markPriceAlertTriggered(alert.id, actualPrice);

      dispatches.push({
        alertId: alert.id,
        phone: alert.phone,
        districtId: alert.districtId,
        cropId: alert.cropId,
        targetPrice: alert.targetPrice,
        actualPrice,
        direction: alert.direction,
        smsResult,
      });
    }

    if (dispatches.length > 0) {
      console.log(
        `[AlertWorker] (${triggerReason}) Triggered ${dispatches.length} price alert SMS out of ${targetAlerts.length} active rules.`
      );
    }

    return {
      triggerReason,
      evaluatedCount: targetAlerts.length,
      triggeredCount: dispatches.length,
      skippedCooldownCount,
      dispatches,
    };
  }

  /**
   * Immediately evaluates a newly created subscription so the farmer receives instant feedback
   * if the market has already crossed their target threshold.
   */
  public static async evaluateSingleSubscription(alert: PriceAlertSubscriptionItem): Promise<{
    triggeredImmediately: boolean;
    actualPrice?: number;
    smsResult?: SmsSendResult;
  }> {
    try {
      const regional = await MarketDataService.getDistrictCommodityPrices(alert.districtId);
      const cropRate = regional.prices.find((p) => p.cropId === alert.cropId);
      if (!cropRate) return { triggeredImmediately: false };

      const actualPrice = cropRate.localizedWholesalePrice;
      const crossed =
        alert.direction === 'below'
          ? actualPrice <= alert.targetPrice
          : actualPrice >= alert.targetPrice;

      if (!crossed) {
        return { triggeredImmediately: false, actualPrice };
      }

      const distShort = regional.district.name.split('(')[0].trim();
      const cropShort = cropRate.name.split('(')[0].trim();
      const conditionText =
        alert.direction === 'below'
          ? `is now Rs${actualPrice}/kg (<= target Rs${alert.targetPrice})`
          : `is now Rs${actualPrice}/kg (>= target Rs${alert.targetPrice})`;

      const message = `[KrishiSetu Alert] ${distShort} ${cropShort} ${conditionText}. ${cropRate.priceSourceLabelEn}.`;

      const smsResult = await SmsService.sendSms({
        phone: alert.phone,
        message,
        districtId: alert.districtId,
        cropId: alert.cropId,
        alertId: alert.id,
      });

      await DbStorageService.markPriceAlertTriggered(alert.id, actualPrice);

      return {
        triggeredImmediately: true,
        actualPrice,
        smsResult,
      };
    } catch {
      return { triggeredImmediately: false };
    }
  }
}
