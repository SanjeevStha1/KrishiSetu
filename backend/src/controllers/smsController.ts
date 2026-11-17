import { Request, Response } from 'express';
import { SmsService } from '../services/smsService';
import { DbStorageService } from '../services/dbStorageService';
import { MarketDataService } from '../services/marketDataService';
import { AlertWorkerService } from '../services/alertWorkerService';
import { findDistrictMandi } from '../data/nepalMandis';

export class SmsController {
  public static getConfig(req: Request, res: Response) {
    const config = SmsService.getGatewayConfig();
    return res.json(config);
  }

  public static async sendOtp(req: Request, res: Response) {
    try {
      const { phone } = req.body;
      if (!phone) {
        return res.status(400).json({ success: false, error: 'Phone number is required' });
      }
      if (!SmsService.isValidNepalMobile(phone)) {
        return res.status(400).json({ success: false, error: 'Valid 10-digit Nepali mobile number (98x/97x) is required' });
      }
      const result = await SmsService.sendOtp(phone);
      return res.json(result);
    } catch (err: any) {
      console.error('Error in SmsController.sendOtp:', err);
      return res.status(400).json({ success: false, error: err.message || 'Failed to send OTP' });
    }
  }

  public static verifyOtp(req: Request, res: Response) {
    try {
      const { phone, code } = req.body;
      if (!phone || !code) {
        return res.status(400).json({ success: false, error: 'Phone number and 6-digit code are required' });
      }
      const result = SmsService.verifyOtp(phone, code);
      if (!result.success) {
        return res.status(400).json(result);
      }
      return res.json({ success: true, message: 'Phone verified successfully' });
    } catch {
      return res.status(500).json({ success: false, error: 'Internal server verification error' });
    }
  }

  public static async sendPriceAlert(req: Request, res: Response) {
    try {
      const { phone, district, cropIds } = req.body;
      if (!phone || !SmsService.isValidNepalMobile(phone)) {
        return res.status(400).json({
          success: false,
          error: 'Valid 10-digit Nepali mobile number (98x/97x) is required',
        });
      }
      const result = await SmsService.sendMarketPriceAlert({
        phone,
        district: district || 'Chitwan',
        cropIds: cropIds || ['tomato', 'potato', 'cauliflower'],
      });
      return res.json(result);
    } catch (err: any) {
      console.error('Error in SmsController.sendPriceAlert:', err);
      return res.status(400).json({ success: false, error: err.message || 'Failed to send price alert SMS' });
    }
  }

  public static async getLogs(req: Request, res: Response) {
    try {
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25));
      const phone = (req.query.phone as string) || undefined;
      const logs = await SmsService.getLogs(limit, phone);
      return res.json({ success: true, logs });
    } catch {
      return res.status(500).json({ success: false, error: 'Failed to load SMS delivery logs' });
    }
  }

  public static async getAlerts(req: Request, res: Response) {
    try {
      const phone = (req.query.phone as string) || undefined;
      const activeOnly = req.query.active !== 'false';
      const alerts = await DbStorageService.getPriceAlerts(phone, activeOnly);
      return res.json({ success: true, totalAlerts: alerts.length, alerts });
    } catch {
      return res.status(500).json({ success: false, error: 'Failed to fetch price alert subscriptions' });
    }
  }

  public static async createAlert(req: Request, res: Response) {
    try {
      const { phone, districtId, cropId, targetPrice, direction, channel } = req.body || {};

      if (!phone || !SmsService.isValidNepalMobile(phone)) {
        return res.status(400).json({
          success: false,
          error: 'Please enter a valid 10-digit Nepali mobile number (e.g., 984xxxxxxx)',
        });
      }

      const parsedPrice = Number(targetPrice);
      if (!Number.isFinite(parsedPrice) || parsedPrice < 5 || parsedPrice > 2500) {
        return res.status(400).json({
          success: false,
          error: 'Target price must be between Rs 5 and Rs 2500 per kg',
        });
      }

      const crop = MarketDataService.getCommodity(cropId || 'tomato');
      if (!crop) {
        return res.status(400).json({ success: false, error: 'Invalid cropId' });
      }

      const mandi = findDistrictMandi(districtId || 'chitwan');
      const alert = await DbStorageService.createPriceAlert({
        phone,
        districtId: mandi.id,
        cropId: crop.id,
        cropName: crop.name,
        targetPrice: parsedPrice,
        direction: direction === 'below' ? 'below' : 'above',
        channel: ['sms', 'in_app', 'both'].includes(channel) ? channel : 'both',
      });

      const evaluation = await AlertWorkerService.evaluateSingleSubscription(alert);

      return res.status(201).json({
        success: true,
        alert,
        evaluation,
      });
    } catch (err: any) {
      console.error('Error in SmsController.createAlert:', err);
      return res.status(500).json({ success: false, error: 'Failed to save price alert subscription' });
    }
  }

  public static async deleteAlert(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ success: false, error: 'Valid alert ID is required' });
      }
      const removed = await DbStorageService.deactivatePriceAlert(id);
      return res.json({ success: removed });
    } catch {
      return res.status(500).json({ success: false, error: 'Failed to deactivate price alert' });
    }
  }

  public static async evaluateAlerts(req: Request, res: Response) {
    try {
      const districtId = (req.body?.districtId as string) || undefined;
      const summary = await AlertWorkerService.evaluateAndDispatchAlerts('manual_check', districtId);
      return res.json({
        success: true,
        ...summary,
      });
    } catch {
      return res.status(500).json({ success: false, error: 'Failed to evaluate price alerts' });
    }
  }
}
