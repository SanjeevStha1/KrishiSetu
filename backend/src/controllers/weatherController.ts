import { Request, Response } from 'express';
import { WeatherBackendService } from '../services/weatherService';

export class WeatherController {
  public static async getWeather(req: Request, res: Response) {
    try {
      const districtId = req.params.districtId || (req.query.district as string) || 'chitwan';
      const weather = await WeatherBackendService.getWeatherForDistrict(districtId);
      return res.json({ success: true, weather });
    } catch (err: any) {
      console.error('[WeatherController] Error:', err);
      return res.status(500).json({ success: false, error: 'Failed to retrieve live weather data' });
    }
  }
}
