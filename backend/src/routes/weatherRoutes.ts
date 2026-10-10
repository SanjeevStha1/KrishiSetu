import { Router } from 'express';
import { WeatherController } from '../controllers/weatherController';

export const weatherRouter = Router();

weatherRouter.get('/', WeatherController.getWeather);
weatherRouter.get('/:districtId', WeatherController.getWeather);
