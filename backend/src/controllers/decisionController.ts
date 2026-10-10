import { Request, Response } from 'express';
import { DecisionEngineService } from '../services/decisionEngineService';
import { AnalyticsService } from '../services/analyticsService';
import { getBearerToken } from '../middleware/authMiddleware';
import { authStore } from '../services/authStore';

export class DecisionController {
  public static getRecommendations(req: Request, res: Response) {
    try {
      const district = (req.query.district as string) || 'chitwan';
      const landSizeRopani = Number(req.query.landSizeRopani) || 1.0;
      const primaryCrops = req.query.primaryCrops ? (req.query.primaryCrops as string).split(',') : undefined;

      const recommendations = DecisionEngineService.getRecommendations({
        district,
        landSizeRopani,
        primaryCrops,
      });

      return res.json({
        success: true,
        district,
        recommendations,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: 'Failed to compute recommendations' });
    }
  }

  public static getAnalytics(req: Request, res: Response) {
    try {
      const token = getBearerToken(req);
      let userId = 'usr_ram_chitwan_001';

      if (token) {
        const session = authStore.validateSession(token);
        if (session.isValid && session.user) {
          userId = session.user.id;
        }
      }

      const analytics = AnalyticsService.calculateUserAnalytics(userId);
      return res.json({
        success: true,
        userId,
        analytics,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: 'Failed to compute farm analytics' });
    }
  }
}
