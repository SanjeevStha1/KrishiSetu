import { apiRequest } from './apiClient';
import { FarmRecordItem } from '../../shared/types/krishi';

export interface FarmRecordsResponse {
  success: boolean;
  records: FarmRecordItem[];
  userId?: string;
  count?: number;
}

export const farmRecordsApi = {
  async getRecords() {
    return apiRequest<FarmRecordsResponse>('/api/farm-records', {
      method: 'GET',
    });
  },

  async createRecord(record: Omit<FarmRecordItem, 'id' | 'recorded_at'> & { recorded_at?: string }) {
    return apiRequest<{ success: boolean; record: FarmRecordItem; records: FarmRecordItem[] }>('/api/farm-records', {
      method: 'POST',
      body: JSON.stringify(record),
    });
  },

  async deleteRecord(recordId: string) {
    return apiRequest<{ success: boolean; deleted: boolean; records: FarmRecordItem[] }>(`/api/farm-records/${recordId}`, {
      method: 'DELETE',
    });
  },

  async bulkSync(records: FarmRecordItem[]) {
    return apiRequest<FarmRecordsResponse>('/api/farm-records/bulk', {
      method: 'POST',
      body: JSON.stringify({ records }),
    });
  },
};
