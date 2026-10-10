import { apiRequest } from './apiClient';

export interface SmsLogItem {
  carrier: string;
  simulated: boolean;
  messageId: string;
  deliveryStatus: string;
  timestamp: string;
  phone: string;
  content: string;
  provider: string;
}

export const smsApi = {
  async getConfig() {
    return apiRequest<{ sparrowConfigured: boolean; sparrowFrom: string; isLiveGateway: boolean; supportedPrefixes: string[] }>('/api/sms/config', {
      method: 'GET',
    });
  },

  async sendPriceAlert(phone: string, district: string, cropIds: string[]) {
    return apiRequest<{ success: boolean; carrier: string; provider: string; messageId: string }>('/api/sms/send-price-alert', {
      method: 'POST',
      body: JSON.stringify({ phone, district, cropIds }),
    });
  },

  async getLogs(limit = 25) {
    return apiRequest<{ logs: SmsLogItem[] }>(`/api/sms/logs?limit=${limit}`, {
      method: 'GET',
    });
  },
};
