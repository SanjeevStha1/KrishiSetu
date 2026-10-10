import { COMMODITY_SEEDS } from '../data/agriData';
import { AuthService } from './authService';

export interface FarmRecordItem {
  id: string;
  user_id?: string;
  farmer_id?: string;
  crop: string;
  cropName?: string;
  record_type: 'expense' | 'revenue' | 'pooling_savings';
  category?: string;
  amount: number;
  source: 'calculator' | 'pooling_group' | 'ai_assist' | 'manual' | 'freight_pool';
  recorded_at: string; // ISO string
  quantityKg?: number;
  note?: string;
}

// Generates baseline demo records ONLY for the default demo profile (Ram Bahadur Thapa)
const generateDemoBaselineRecords = (): FarmRecordItem[] => {
  const records: FarmRecordItem[] = [];
  const now = new Date();

  const getDateStr = (daysAgo: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString();
  };

  records.push(
    {
      id: 'rec-ram-demo-1',
      crop: 'tomato',
      cropName: 'Tomato (गोलभेडा)',
      record_type: 'revenue',
      amount: 24000,
      source: 'manual',
      recorded_at: getDateStr(1),
      quantityKg: 500,
      note: 'Wholesale sales: 500kg Tomato @ Rs 48/kg',
    },
    {
      id: 'rec-ram-demo-2',
      crop: 'tomato',
      cropName: 'Tomato (गोलभेडा)',
      record_type: 'expense',
      amount: 9200,
      source: 'manual',
      recorded_at: getDateStr(1),
      quantityKg: 500,
      note: 'Production cost: Seeds, DAP, labor, irrigation',
    },
    {
      id: 'rec-ram-demo-3',
      crop: 'tomato',
      cropName: 'Tomato (गोलभेडा)',
      record_type: 'pooling_savings',
      amount: 2300,
      source: 'freight_pool',
      recorded_at: getDateStr(2),
      quantityKg: 500,
      note: 'Saved via Kalimati Shared Freight Pool (-55% freight)',
    },
    {
      id: 'rec-ram-demo-4',
      crop: 'cauliflower',
      cropName: 'Cauliflower (काउली)',
      record_type: 'revenue',
      amount: 18500,
      source: 'manual',
      recorded_at: getDateStr(3),
      quantityKg: 350,
      note: 'Harvest sale: 350kg Cauliflower',
    },
    {
      id: 'rec-ram-demo-5',
      crop: 'cauliflower',
      cropName: 'Cauliflower (काउली)',
      record_type: 'expense',
      amount: 6800,
      source: 'manual',
      recorded_at: getDateStr(3),
      quantityKg: 350,
      note: 'Input cost for Cauliflower',
    }
  );

  return records;
};

class FarmRecordsManager {
  private records: FarmRecordItem[] = [];
  private listeners: Array<(records: FarmRecordItem[]) => void> = [];
  private currentUserId: string = '';
  private isLoadedFromBackend: boolean = false;

  constructor() {
    this.init();
    if (typeof window !== 'undefined') {
      AuthService.subscribe((user) => {
        const newId = user?.id || user?.uid || 'usr_ram_chitwan_001';
        if (newId !== this.currentUserId) {
          this.init(newId);
        }
      });
    }
  }

  private getStorageKey(userId: string): string {
    return `krishisetu_farm_records_usr_${userId || 'guest'}`;
  }

  public init(customUserId?: string) {
    const user = AuthService.getCurrentUser();
    const userId = customUserId || user?.id || user?.uid || 'usr_ram_chitwan_001';
    const isNewUser = userId !== 'usr_ram_chitwan_001';
    this.currentUserId = userId;

    try {
      const storageKey = this.getStorageKey(userId);
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        this.records = JSON.parse(saved);
      } else {
        // Only default demo user gets initial demo records; ALL other accounts start completely empty
        if (isNewUser) {
          this.records = [];
        } else {
          this.records = generateDemoBaselineRecords();
        }
        localStorage.setItem(storageKey, JSON.stringify(this.records));
      }
    } catch (e) {
      this.records = isNewUser ? [] : generateDemoBaselineRecords();
    }

    this.notify();

    // Trigger background sync with backend server
    this.syncWithServer(userId);
  }

  public async syncWithServer(userId?: string) {
    const targetUserId = userId || this.currentUserId;
    const token = AuthService.getToken();

    try {
      const res = await fetch('/api/farm-records', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.records)) {
          this.records = data.records;
          this.isLoadedFromBackend = true;
          this.saveLocal();
          this.notify();
        }
      }
    } catch (err) {
      console.warn('Could not sync farm records with server:', err);
    }
  }

  private saveLocal() {
    try {
      const storageKey = this.getStorageKey(this.currentUserId);
      localStorage.setItem(storageKey, JSON.stringify(this.records));
    } catch (e) {}
  }

  private notify() {
    this.listeners.forEach((fn) => fn([...this.records]));
  }

  public subscribe(fn: (records: FarmRecordItem[]) => void): () => void {
    this.listeners.push(fn);
    fn([...this.records]);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  public getRecords(): FarmRecordItem[] {
    return [...this.records];
  }

  /**
   * Explicitly Add Farm Record (Synchronized with Backend Database)
   */
  public async addRecord(
    item: Omit<FarmRecordItem, 'id' | 'recorded_at'> & { recorded_at?: string }
  ): Promise<FarmRecordItem> {
    const newRecord: FarmRecordItem = {
      ...item,
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      recorded_at: item.recorded_at || new Date().toISOString(),
    };

    // Optimistic local update
    this.records = [newRecord, ...this.records];
    this.saveLocal();
    this.notify();

    // Persist to Server
    const token = AuthService.getToken();
    try {
      const res = await fetch('/api/farm-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          crop: newRecord.crop,
          cropName: newRecord.cropName,
          record_type: newRecord.record_type,
          category: newRecord.category,
          amount: newRecord.amount,
          source: newRecord.source,
          quantityKg: newRecord.quantityKg,
          note: newRecord.note,
          recorded_at: newRecord.recorded_at,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.record) {
          // Replace optimistic ID with server-provided ID if needed
          const index = this.records.findIndex((r) => r.id === newRecord.id);
          if (index !== -1) {
            this.records[index] = data.record;
            this.saveLocal();
            this.notify();
            return data.record;
          }
        }
      }
    } catch (err) {
      console.warn('Failed to persist record to server:', err);
    }

    return newRecord;
  }

  /**
   * Explicit Farmer Action: Save Calculator Result to Ledger
   * This is ONLY called when the farmer clicks the "Save to Farm Records" button.
   */
  public async explicitSaveCalculationRecord(params: {
    cropId: string;
    cropName?: string;
    productionCost: number;
    expectedRevenue: number;
    quantityKg: number;
    isAi?: boolean;
    note?: string;
  }): Promise<{ expenseRecord: FarmRecordItem; revenueRecord: FarmRecordItem }> {
    const timestamp = new Date().toISOString();
    const seed = COMMODITY_SEEDS.find((s) => s.id.toLowerCase() === params.cropId.toLowerCase());
    const cropDisplay = params.cropName || seed?.name || params.cropId;

    const expenseRecord = await this.addRecord({
      crop: params.cropId,
      cropName: cropDisplay,
      record_type: 'expense',
      amount: Math.round(params.productionCost),
      source: params.isAi ? 'ai_assist' : 'calculator',
      recorded_at: timestamp,
      quantityKg: params.quantityKg,
      note: params.note || `Calculated production cost: ${params.quantityKg}kg ${cropDisplay}`,
    });

    const revenueRecord = await this.addRecord({
      crop: params.cropId,
      cropName: cropDisplay,
      record_type: 'revenue',
      amount: Math.round(params.expectedRevenue),
      source: params.isAi ? 'ai_assist' : 'calculator',
      recorded_at: timestamp,
      quantityKg: params.quantityKg,
      note: params.note || `Calculated expected revenue: ${params.quantityKg}kg ${cropDisplay}`,
    });

    return { expenseRecord, revenueRecord };
  }

  public async addCalculatorRecords(params: {
    cropId: string;
    cropName?: string;
    productionCost: number;
    expectedRevenue: number;
    quantityKg: number;
    isAi?: boolean;
    note?: string;
  }): Promise<{ expenseRecord: FarmRecordItem; revenueRecord: FarmRecordItem }> {
    return this.explicitSaveCalculationRecord(params);
  }

  /**
   * Explicit Farmer Action: Record Freight Pooling Savings
   */
  public async addPoolSavingsRecord(params: {
    cropId: string;
    cropName?: string;
    savingsAmount: number;
    quantityKg: number;
    poolLocation?: string;
  }): Promise<FarmRecordItem> {
    const timestamp = new Date().toISOString();
    const seed = COMMODITY_SEEDS.find((s) => s.id.toLowerCase() === params.cropId.toLowerCase());
    const cropDisplay = params.cropName || seed?.name || params.cropId;

    return await this.addRecord({
      crop: params.cropId,
      cropName: cropDisplay,
      record_type: 'pooling_savings',
      amount: Math.round(params.savingsAmount),
      source: 'pooling_group',
      recorded_at: timestamp,
      quantityKg: params.quantityKg,
      note: `Freight pooling savings: Joined shared pool (${params.quantityKg}kg ${cropDisplay} to ${params.poolLocation || 'Kalimati'})`,
    });
  }

  public async deleteRecord(id: string) {
    this.records = this.records.filter((r) => r.id !== id);
    this.saveLocal();
    this.notify();

    const token = AuthService.getToken();
    try {
      await fetch(`/api/farm-records/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch (err) {
      console.warn('Failed to delete record on server:', err);
    }
  }

  public resetToBaseline() {
    this.records = generateDemoBaselineRecords();
    this.saveLocal();
    this.notify();

    // Sync to server
    const token = AuthService.getToken();
    fetch('/api/farm-records/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ records: this.records }),
    }).catch((e) => console.warn(e));
  }

  public clearAll() {
    this.records = [];
    this.saveLocal();
    this.notify();

    const token = AuthService.getToken();
    fetch('/api/farm-records/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ records: [] }),
    }).catch((e) => console.warn(e));
  }
}

export const FarmRecordsService = new FarmRecordsManager();
