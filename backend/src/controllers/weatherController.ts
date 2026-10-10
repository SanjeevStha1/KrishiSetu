import { Request, Response } from 'express';
import { WeatherBackendService } from '../services/weatherService';

export class WeatherController {
  public static getWeather(req: Request, res: Response) {
    const districtId = req.params.districtId || (req.query.district as string) || 'chitwan';
    const weather = WeatherBackendService.getWeatherForDistrict(districtId);
    return res.json({ success: true, weather });
  }
}
