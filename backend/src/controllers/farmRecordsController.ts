import { Request, Response } from 'express';
import { authStore } from '../services/authStore';
import { getBearerToken } from '../middleware/authMiddleware';
import { DbStorageService } from '../services/dbStorageService';

export class FarmRecordsController {
  private static async resolveUserId(req: Request): Promise<string | null> {
    const token = getBearerToken(req);
    if (token) {
      const session = await authStore.validateSessionAsync(token);
      if (session.isValid && session.user) {
        return session.user.id;
      }
    }
    return null;
  }

  public static async getRecords(req: Request, res: Response) {
    try {
      const userId = await FarmRecordsController.resolveUserId(req);
      if (!userId) {
        return res.json({ success: true, records: [], userId: null, count: 0 });
      }
      const dbRecords = await DbStorageService.getLedgerEntries(userId);
      const memoryRecords = authStore.getUserFarmRecords(userId);

      // Merge records with database persistence prioritizing fresh DB items
      const recordsMap = new Map();
      memoryRecords.forEach((r) => recordsMap.set(r.id, r));
      dbRecords.forEach((r) => recordsMap.set(r.id, r));
      const combined = Array.from(recordsMap.values());

      return res.json({
        success: true,
        records: combined,
        userId,
        count: combined.length,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: 'Failed to fetch farm records' });
    }
  }

  public static async createRecord(req: Request, res: Response) {
    try {
      const userId = await FarmRecordsController.resolveUserId(req);
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication token required' });
      }
      const { crop, cropName, record_type, category, amount, source, quantityKg, note, recorded_at } = req.body;

      if (!crop || !record_type || amount === undefined) {
        return res.status(400).json({ success: false, error: 'Missing required record fields' });
      }

      const created = authStore.addUserFarmRecord(userId, {
        crop,
        cropName: cropName || crop,
        record_type,
        category: category || 'General',
        amount: Number(amount),
        source: source || 'manual',
        quantityKg: quantityKg ? Number(quantityKg) : undefined,
        note,
        recorded_at: recorded_at || new Date().toISOString(),
      });

      // Persist to Cloud SQL
      DbStorageService.saveLedgerEntry(userId, created).catch((e) =>
        console.warn('[FarmRecords] Cloud SQL save ledger error:', e?.message)
      );

      const dbRecords = await DbStorageService.getLedgerEntries(userId);
      const memoryRecords = authStore.getUserFarmRecords(userId);
      const recordsMap = new Map();
      memoryRecords.forEach((r) => recordsMap.set(r.id, r));
      dbRecords.forEach((r) => recordsMap.set(r.id, r));

      return res.json({
        success: true,
        record: created,
        records: Array.from(recordsMap.values()),
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: 'Failed to create farm record' });
    }
  }

  public static async deleteRecord(req: Request, res: Response) {
    try {
      const userId = await FarmRecordsController.resolveUserId(req);
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication token required' });
      }
      const recordId = req.params.id;
      const deleted = authStore.deleteUserFarmRecord(userId, recordId);
      return res.json({
        success: true,
        deleted,
        records: authStore.getUserFarmRecords(userId),
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: 'Failed to delete farm record' });
    }
  }

  public static async syncBulkRecords(req: Request, res: Response) {
    try {
      const userId = await FarmRecordsController.resolveUserId(req);
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication token required' });
      }
      const { records } = req.body;
      if (Array.isArray(records)) {
        authStore.setUserFarmRecords(userId, records);
      }
      return res.json({
        success: true,
        records: authStore.getUserFarmRecords(userId),
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: 'Failed to sync farm records' });
    }
  }
}
