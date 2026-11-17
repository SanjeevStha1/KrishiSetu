import { apiRequest } from './apiClient';

export interface SmsGatewayConfig {
  sparrowConfigured: boolean;
  aakashConfigured: boolean;
  sparrowFrom: string;
  activeProvider: 'sparrow_sms' | 'aakash_sms' | 'sandbox_queue';
  gatewayLabel: string;
  isLiveGateway: boolean;
  supportedPrefixes: string[];
}

export interface SmsLogItem {
  id?: number;
  carrier: string;
  simulated: boolean;
  messageId: string;
  deliveryStatus: 'delivered' | 'queued_sandbox' | 'failed' | string;
  timestamp?: string;
  createdAt?: string;
  phone: string;
  districtId?: string;
  cropId?: string;
  alertId?: number;
  content: string;
  provider: 'sparrow_sms' | 'aakash_sms' | 'sandbox_queue' | string;
}

export interface SmsSendResponse {
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

export interface PriceAlertSubscription {
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

export const smsApi = {
  async getConfig() {
    return apiRequest<SmsGatewayConfig>('/api/sms/config', {
      method: 'GET',
    });
  },

  async sendPriceAlert(phone: string, district: string, cropIds: string[]) {
    return apiRequest<SmsSendResponse>('/api/sms/send-price-alert', {
      method: 'POST',
      body: JSON.stringify({ phone, district, cropIds }),
    });
  },

  async getLogs(limit = 25, phone?: string) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (phone && phone.trim()) params.set('phone', phone.trim());
    return apiRequest<{ success: boolean; logs: SmsLogItem[] }>(`/api/sms/logs?${params.toString()}`, {
      method: 'GET',
    });
  },

  async getAlerts(phone?: string, activeOnly = true) {
    const params = new URLSearchParams({ active: String(activeOnly) });
    if (phone && phone.trim()) params.set('phone', phone.trim());
    return apiRequest<{ success: boolean; totalAlerts: number; alerts: PriceAlertSubscription[] }>(
      `/api/sms/alerts?${params.toString()}`,
      { method: 'GET' }
    );
  },

  async createAlert(payload: {
    phone: string;
    districtId: string;
    cropId: string;
    targetPrice: number;
    direction: 'above' | 'below';
    channel: 'sms' | 'in_app' | 'both';
  }) {
    return apiRequest<{
      success: boolean;
      alert: PriceAlertSubscription;
      evaluation?: {
        triggeredImmediately: boolean;
        actualPrice?: number;
        smsResult?: SmsSendResponse;
      };
    }>('/api/sms/alerts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async deleteAlert(id: number) {
    return apiRequest<{ success: boolean }>(`/api/sms/alerts/${id}`, {
      method: 'DELETE',
    });
  },

  async evaluateAlerts(districtId?: string) {
    return apiRequest<{
      success: boolean;
      triggerReason: string;
      evaluatedCount: number;
      triggeredCount: number;
      skippedCooldownCount: number;
    }>('/api/sms/alerts/evaluate', {
      method: 'POST',
      body: JSON.stringify({ districtId }),
    });
  },
};
