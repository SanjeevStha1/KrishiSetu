import { Router } from 'express';
import { SmsController } from '../controllers/smsController';

export const smsRouter = Router();

smsRouter.get('/config', SmsController.getConfig);
smsRouter.post('/send-otp', SmsController.sendOtp);
smsRouter.post('/verify-otp', SmsController.verifyOtp);
smsRouter.post('/send-price-alert', SmsController.sendPriceAlert);
smsRouter.get('/logs', SmsController.getLogs);
