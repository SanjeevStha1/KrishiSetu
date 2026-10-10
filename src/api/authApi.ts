import { apiRequest } from './apiClient';
import { AuthUser, Farm } from '../../shared/types/krishi';

export interface SendOtpResponse {
  success: boolean;
  normalizedPhone: string;
  message: string;
  devOtp?: string;
  carrier?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  isNewUser?: boolean;
  alreadyExisted?: boolean;
  token?: string;
  user?: AuthUser;
  profile?: any;
  farm?: Farm;
  message?: string;
  notRegistered?: boolean;
  error?: string;
}

export const authApi = {
  async sendOtp(phone: string, intent: 'login' | 'register' | 'change_phone' = 'login') {
    return apiRequest<SendOtpResponse>('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, intent }),
    });
  },

  async verifyOtp(phone: string, code: string, intent: 'login' | 'register' | 'change_phone' = 'login') {
    return apiRequest<VerifyOtpResponse>('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, code, intent }),
    });
  },

  async completeProfile(data: {
    fullName: string;
    preferredLanguage: 'ne' | 'en';
    province?: string;
    district: string;
    municipality?: string;
    ward?: string;
    locality?: string;
    farmName?: string;
    landSize: number;
    landUnit: string;
    primaryCrops: string[];
    soilType?: string;
    irrigationType?: string;
  }) {
    return apiRequest<{ success: boolean; user: AuthUser; profile: any; farm: Farm; message: string }>('/api/auth/complete-profile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMe() {
    return apiRequest<{ success: boolean; user: AuthUser; profile: any; farm: Farm }>('/api/auth/me', {
      method: 'GET',
    });
  },

  async logout() {
    return apiRequest<{ success: boolean; message: string }>('/api/auth/logout', {
      method: 'POST',
    });
  },

  async updatePhone(newPhone: string, code: string) {
    return apiRequest<{ success: boolean; user: AuthUser; message: string }>('/api/auth/update-phone', {
      method: 'POST',
      body: JSON.stringify({ newPhone, code }),
    });
  },
};
