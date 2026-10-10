import { Request, Response } from 'express';
import { authStore } from '../services/authStore';
import { getBearerToken } from '../middleware/authMiddleware';

export class FarmRecordsController {
  private static resolveUserId(req: Request): string {
    const token = getBearerToken(req);
    if (token) {
      const session = authStore.validateSession(token);
      if (session.isValid && session.user) {
        return session.user.id;
      }
    }
    return 'usr_ram_chitwan_001';
  }

  public static getRecords(req: Request, res: Response) {
    try {
      const userId = FarmRecordsController.resolveUserId(req);
      const records = authStore.getUserFarmRecords(userId);
      return res.json({
        success: true,
        records,
        userId,
        count: records.length,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: 'Failed to fetch farm records' });
    }
  }

  public static createRecord(req: Request, res: Response) {
    try {
      const userId = FarmRecordsController.resolveUserId(req);
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

      return res.json({
        success: true,
        record: created,
        records: authStore.getUserFarmRecords(userId),
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: 'Failed to create farm record' });
    }
  }

  public static deleteRecord(req: Request, res: Response) {
    try {
      const userId = FarmRecordsController.resolveUserId(req);
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

  public static syncBulkRecords(req: Request, res: Response) {
    try {
      const userId = FarmRecordsController.resolveUserId(req);
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
