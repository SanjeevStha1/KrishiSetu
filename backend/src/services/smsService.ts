import crypto from 'crypto';
import { DbStorageService, SmsDeliveryLogItem } from './dbStorageService';
import { findDistrictMandi } from '../data/nepalMandis';

export interface SmsMessagePayload {
  phone: string;
  message: string;
  districtId?: string;
  cropId?: string;
  alertId?: number;
  senderId?: string;
}

export interface SmsSendResult {
  success: boolean;
  carrier: string;
  simulated: boolean;
  messageId: string;
  deliveryStatus: 'delivered' | 'queued_sandbox' | 'failed';
  timestamp: string;
  phone: string;
  recipient: string;
  districtId: string;
  content: string;
  messageText: string;
  provider: 'sparrow_sms' | 'aakash_sms' | 'sandbox_queue';
  gateway: string;
  providerError?: string;
}

export interface GatewayConfig {
  sparrowConfigured: boolean;
  aakashConfigured: boolean;
  sparrowFrom: string;
  activeProvider: 'sparrow_sms' | 'aakash_sms' | 'sandbox_queue';
  gatewayLabel: string;
  isLiveGateway: boolean;
  supportedPrefixes: string[];
}

export class SmsService {
  private static recentLogs: SmsSendResult[] = [];
  private static activeOtpCodes: Map<string, { code: string; expiresAt: number; attempts: number }> = new Map();

  public static getGatewayConfig(): GatewayConfig {
    const sparrowToken = (process.env.SPARROW_SMS_TOKEN || '').trim();
    const aakashToken = (process.env.AAKASH_SMS_TOKEN || '').trim();
    const from = (process.env.SPARROW_SMS_FROM || 'KrishiSetu').trim();

    const sparrowConfigured = sparrowToken.length > 5;
    const aakashConfigured = aakashToken.length > 5;
    const activeProvider: GatewayConfig['activeProvider'] = sparrowConfigured
      ? 'sparrow_sms'
      : aakashConfigured
      ? 'aakash_sms'
      : 'sandbox_queue';

    const gatewayLabel =
      activeProvider === 'sparrow_sms'
        ? `Sparrow SMS Live (${from})`
        : activeProvider === 'aakash_sms'
        ? 'Aakash SMS Live (Nepal Telecom/Ncell)'
        : 'Sandbox SMS Queue (Configure SPARROW_SMS_TOKEN or AAKASH_SMS_TOKEN for live carrier)';

    return {
      sparrowConfigured,
      aakashConfigured,
      sparrowFrom: from,
      activeProvider,
      gatewayLabel,
      isLiveGateway: sparrowConfigured || aakashConfigured,
      supportedPrefixes: ['980', '981', '982', '984', '985', '986', '974', '975', '976', '970', '988'],
    };
  }

  public static normalizeNepalPhone(phone: string): string {
    const clean = (phone || '').replace(/[\s\-\+]/g, '');
    return clean.startsWith('977') ? clean.substring(3) : clean;
  }

  public static isValidNepalMobile(phone: string): boolean {
    const clean = this.normalizeNepalPhone(phone);
    return /^(98|97)\d{8}$/.test(clean);
  }

  public static detectCarrier(phone: string): string {
    const clean = this.normalizeNepalPhone(phone);
    const prefix3 = clean.substring(0, 3);

    if (['984', '985', '986', '974', '975', '976'].includes(prefix3)) {
      return 'Nepal Telecom (NTC - Namaste)';
    }
    if (['980', '981', '982', '970'].includes(prefix3)) {
      return 'Ncell Axiata';
    }
    if (['988'].includes(prefix3)) {
      return 'Smart Telecom (SmartCell)';
    }
    return 'Nepal Mobile Network';
  }

  private static async dispatchViaSparrow(token: string, from: string, toPhone: string, text: string): Promise<{ ok: boolean; messageId?: string; error?: string }> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const body = new URLSearchParams({ token, from, to: toPhone, text }).toString();
      const res = await fetch('https://api.sparrowsms.com/v2/sms/', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      clearTimeout(timer);
      const raw = await res.text();
      let parsed: any = null;
      try {
        parsed = JSON.parse(raw);
      } catch {}

      if (res.ok && (!parsed || parsed.response_code === 200 || parsed.count > 0)) {
        return {
          ok: true,
          messageId: parsed?.message_id ? String(parsed.message_id) : `sparrow_${Date.now()}`,
        };
      }
      return {
        ok: false,
        error: parsed?.response || `Sparrow HTTP ${res.status}`,
      };
    } catch (err: any) {
      clearTimeout(timer);
      return { ok: false, error: err?.message || 'Sparrow request failed' };
    }
  }

  private static async dispatchViaAakash(token: string, toPhone: string, text: string): Promise<{ ok: boolean; messageId?: string; error?: string }> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const body = new URLSearchParams({ auth_token: token, to: toPhone, text }).toString();
      const res = await fetch('https://sms.aakashsms.com/sms/v3/send', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      clearTimeout(timer);
      const raw = await res.text();
      let parsed: any = null;
      try {
        parsed = JSON.parse(raw);
      } catch {}

      if (res.ok && (!parsed || parsed.error === false)) {
        return {
          ok: true,
          messageId: `aakash_${Date.now()}`,
        };
      }
      return {
        ok: false,
        error: parsed?.message || `Aakash HTTP ${res.status}`,
      };
    } catch (err: any) {
      clearTimeout(timer);
      return { ok: false, error: err?.message || 'Aakash request failed' };
    }
  }

  public static async sendSms(payload: SmsMessagePayload): Promise<SmsSendResult> {
    const sparrowToken = (process.env.SPARROW_SMS_TOKEN || '').trim();
    const aakashToken = (process.env.AAKASH_SMS_TOKEN || '').trim();
    const from = (process.env.SPARROW_SMS_FROM || 'KrishiSetu').trim();

    const cleanPhone = this.normalizeNepalPhone(payload.phone);
    const carrier = this.detectCarrier(cleanPhone);
    const timestamp = new Date().toISOString();
    const districtId = (payload.districtId || 'chitwan').toLowerCase().trim();

    let result: SmsSendResult | null = null;
    let lastProviderErr: string | undefined;

    if (sparrowToken.length > 5) {
      const res = await this.dispatchViaSparrow(sparrowToken, from, cleanPhone, payload.message);
      if (res.ok) {
        result = {
          success: true,
          carrier,
          simulated: false,
          messageId: res.messageId || `sparrow_${Date.now()}`,
          deliveryStatus: 'delivered',
          timestamp,
          phone: cleanPhone,
          recipient: `+977 ${cleanPhone}`,
          districtId,
          content: payload.message,
          messageText: payload.message,
          provider: 'sparrow_sms',
          gateway: `Sparrow SMS Live (${from})`,
        };
      } else {
        lastProviderErr = res.error;
        console.warn('[SmsService] Sparrow SMS failed:', res.error);
      }
    }

    if (!result && aakashToken.length > 5) {
      const res = await this.dispatchViaAakash(aakashToken, cleanPhone, payload.message);
      if (res.ok) {
        result = {
          success: true,
          carrier,
          simulated: false,
          messageId: res.messageId || `aakash_${Date.now()}`,
          deliveryStatus: 'delivered',
          timestamp,
          phone: cleanPhone,
          recipient: `+977 ${cleanPhone}`,
          districtId,
          content: payload.message,
          messageText: payload.message,
          provider: 'aakash_sms',
          gateway: 'Aakash SMS Live Gateway',
        };
      } else {
        lastProviderErr = res.error;
        console.warn('[SmsService] Aakash SMS failed:', res.error);
      }
    }

    if (!result) {
      result = {
        success: true,
        carrier,
        simulated: true,
        messageId: `sbx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        deliveryStatus: 'queued_sandbox',
        timestamp,
        phone: cleanPhone,
        recipient: `+977 ${cleanPhone}`,
        districtId,
        content: payload.message,
        messageText: payload.message,
        provider: 'sandbox_queue',
        gateway: lastProviderErr
          ? `Sandbox Queue (Carrier error: ${lastProviderErr})`
          : 'Sandbox SMS Queue (Awaiting Telecom Token)',
        providerError: lastProviderErr,
      };
    }

    await this.recordLog(result, payload.cropId, payload.alertId);
    return result;
  }

  public static async sendOtp(phone: string): Promise<{
    success: boolean;
    message: string;
    code?: string;
    carrier: string;
    simulated: boolean;
  }> {
    const cleanPhone = this.normalizeNepalPhone(phone);
    const carrier = this.detectCarrier(cleanPhone);
    const cfg = this.getGatewayConfig();

    const code = cfg.isLiveGateway
      ? String(crypto.randomInt(100000, 999999))
      : '123456';

    this.activeOtpCodes.set(cleanPhone, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0,
    });

    const smsResult = await this.sendSms({
      phone: cleanPhone,
      message: `[KrishiSetu] Tapainko verification code (OTP) ${code} ho. 5 minute bhitra prayog garnuhos.`,
      districtId: 'kathmandu',
    });

    return {
      success: true,
      message: smsResult.simulated
        ? `Sandbox OTP ${code} generated for +977 ${cleanPhone}`
        : `Verification OTP sent to +977 ${cleanPhone} via ${smsResult.gateway}`,
      ...(smsResult.simulated ? { code } : {}),
      carrier,
      simulated: smsResult.simulated,
    };
  }

  public static verifyOtp(phone: string, submittedCode: string): { success: boolean; error?: string } {
    const cleanPhone = this.normalizeNepalPhone(phone);
    const cleanCode = (submittedCode || '').trim();
    const cfg = this.getGatewayConfig();

    const entry = this.activeOtpCodes.get(cleanPhone);
    if (entry) {
      if (Date.now() > entry.expiresAt) {
        this.activeOtpCodes.delete(cleanPhone);
        return { success: false, error: 'OTP expired. Please request a new 6-digit code.' };
      }
      entry.attempts += 1;
      if (entry.attempts > 5) {
        this.activeOtpCodes.delete(cleanPhone);
        return { success: false, error: 'Too many invalid attempts. Please request a new OTP.' };
      }
      if (entry.code === cleanCode) {
        this.activeOtpCodes.delete(cleanPhone);
        return { success: true };
      }
      return { success: false, error: 'Invalid verification code. Please check and try again.' };
    }

    if (!cfg.isLiveGateway && cleanCode === '123456') {
      return { success: true };
    }
    return { success: false, error: 'Invalid or expired verification code. Please request a new OTP.' };
  }

  /**
   * Builds and dispatches a live 3-layer 77-district localized market rate SMS bulletin
   */
  public static async sendMarketPriceAlert(params: {
    phone: string;
    district: string;
    cropIds: string[];
  }): Promise<SmsSendResult> {
    const mandi = findDistrictMandi(params.district);
    const { MarketDataService } = await import('./marketDataService');
    const regional = await MarketDataService.getDistrictCommodityPrices(mandi.id);

    const requestedIds = (params.cropIds && params.cropIds.length > 0 ? params.cropIds : ['tomato', 'potato', 'cauliflower']).slice(0, 4);
    const priceSegments = requestedIds.map((cid) => {
      const found = regional.prices.find((p) => p.cropId === cid.toLowerCase().trim());
      if (!found) return `${cid}`;
      const shortName = found.name.split('(')[0].trim();
      return `${shortName} Rs${found.localizedWholesalePrice}`;
    });

    const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const distShort = mandi.name.split('(')[0].trim();
    const hasCoop = requestedIds.some((cid) => regional.prices.find((p) => p.cropId === cid)?.priceSource === 'coop_verified');
    const sourceTag = mandi.id === 'kathmandu' ? 'Kalimati' : hasCoop ? 'Verified' : 'AMPIS Est';

    const message = `[KrishiSetu ${todayStr}] ${distShort} (${sourceTag}): ${priceSegments.join(', ')}/kg.`;

    return this.sendSms({
      phone: params.phone,
      message,
      districtId: mandi.id,
      cropId: requestedIds[0],
    });
  }

  public static async getLogs(limit = 25, phone?: string): Promise<SmsDeliveryLogItem[]> {
    const dbLogs = await DbStorageService.getSmsDeliveryLogs(limit, phone);
    if (dbLogs.length > 0) {
      return dbLogs;
    }
    const cleanPhone = phone ? this.normalizeNepalPhone(phone) : undefined;
    return this.recentLogs
      .filter((l) => (!cleanPhone ? true : l.phone === cleanPhone))
      .slice(0, limit)
      .map((l) => ({
        phone: l.phone,
        districtId: l.districtId,
        carrier: l.carrier,
        provider: l.provider,
        deliveryStatus: l.deliveryStatus,
        simulated: l.simulated,
        messageId: l.messageId,
        content: l.content,
        createdAt: l.timestamp,
      }));
  }

  private static async recordLog(result: SmsSendResult, cropId?: string, alertId?: number) {
    this.recentLogs.unshift(result);
    if (this.recentLogs.length > 50) {
      this.recentLogs.pop();
    }

    await DbStorageService.saveSmsDeliveryLog({
      phone: result.phone,
      districtId: result.districtId,
      cropId,
      alertId,
      carrier: result.carrier,
      provider: result.provider,
      deliveryStatus: result.deliveryStatus,
      simulated: result.simulated,
      messageId: result.messageId,
      content: result.content,
    });
  }
}
