import { Router } from 'express';
import { AuthController } from '../controllers/authController';

export const authRouter = Router();

authRouter.post('/check-phone', AuthController.checkPhone);
authRouter.post('/register', AuthController.register);
authRouter.post('/send-otp', AuthController.sendOtp);
authRouter.post('/verify-otp', AuthController.verifyOtp);
authRouter.post('/complete-profile', AuthController.completeProfile);
authRouter.get('/me', AuthController.getMe);
authRouter.post('/logout', AuthController.logout);
authRouter.post('/update-phone', AuthController.updatePhone);
