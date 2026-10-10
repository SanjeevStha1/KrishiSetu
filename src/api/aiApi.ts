import { apiRequest } from './apiClient';

export const aiApi = {
  /**
   * Sends chat message to POST /api/chat powered by OpenRouter API
   */
  async sendChatMessage(payload: {
    message: string;
    language?: 'en' | 'ne';
    history?: Array<{ role: 'user' | 'assistant'; content: string }>;
    farmerContext?: any;
  }) {
    return apiRequest<{ reply: string; error?: string; success?: boolean }>('/api/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async sendKrishiMitraMessage(messages: Array<{ role: string; text: string }>, userContext?: any, language?: 'en' | 'ne') {
    return apiRequest<{ reply: string }>('/api/krishi-mitra', {
      method: 'POST',
      body: JSON.stringify({ messages, userContext, language }),
    });
  },
};

