import { Request, Response } from 'express';
import { SmsService } from '../services/smsService';

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
    } catch (err: any) {
      return res.status(500).json({ success: false, error: 'Internal server verification error' });
    }
  }

  public static async sendPriceAlert(req: Request, res: Response) {
    try {
      const { phone, district, cropIds } = req.body;
      if (!phone) {
        return res.status(400).json({ success: false, error: 'Phone number is required' });
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

  public static getLogs(req: Request, res: Response) {
    const limit = Number(req.query.limit) || 25;
    const logs = SmsService.getLogs(limit);
    return res.json({ logs });
  }
}
