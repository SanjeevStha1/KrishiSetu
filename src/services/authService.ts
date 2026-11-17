import { AuthUser, UserProfile, LandUnit } from '../types/krishi';
import { InAppMessageService } from './inAppMessageService';

const AUTH_STORAGE_KEY = 'krishisetu_auth_user_v30';
const TOKEN_STORAGE_KEY = 'krishisetu_auth_token_v30';
const AUTH_IS_LOGGED_IN_KEY = 'krishisetu_is_authenticated_v30';
const OFFLINE_USERS_STORAGE_KEY = 'krishisetu_offline_users_v2';

// Purge legacy pre-cleanup cached user lists so stale local entries never falsely block registration
try {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('krishisetu_custom_users_list');
  }
} catch {}

export const TEST_USER_ACCOUNTS: {
  id: string;
  name: string;
  nepaliName: string;
  phone: string;
  rawDigits: string;
  normalizedPhone: string;
  district: string;
  municipality: string;
  ward: string;
  locality: string;
  landSize: number;
  landUnit: LandUnit;
  farmName: string;
  primaryCrops: string[];
  roleTag: string;
  badge: string;
}[] = [];

export const DEMO_GUEST_USER: AuthUser = {
  id: '',
  uid: '',
  name: 'Farmer',
  phone: '',
  normalizedPhone: '',
  phoneVerified: false,
  status: 'active',
  preferredLanguage: 'ne',
  province: 'Bagmati',
  district: 'chitwan',
  municipality: '',
  ward: '1',
  locality: '',
  landSize: 2.0,
  landUnit: 'ropani',
  landSizeRopani: 2.0,
  farmName: 'My Agro Farm',
  primaryCrops: ['tomato', 'potato'],
  profileCompletionPct: 50,
  isGuest: true,
  createdAt: new Date().toISOString(),
};

export const DEMO_FARMER_USER = DEMO_GUEST_USER;

type AuthListener = (user: AuthUser | null) => void;
const listeners: Set<AuthListener> = new Set();

export const AuthService = {
  /**
   * Get stored auth token
   */
  getToken(): string | null {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem(TOKEN_STORAGE_KEY);
      }
    } catch (e) {}
    return null;
  },

  /**
   * Save session token
   */
  setToken(token: string | null) {
    try {
      if (typeof window !== 'undefined') {
        if (token) {
          localStorage.setItem(TOKEN_STORAGE_KEY, token);
        } else {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      }
    } catch (e) {}
  },

  /**
   * Check if user is logged in
   */
  isAuthenticated(): boolean {
    try {
      if (typeof window !== 'undefined') {
        const isAuth = localStorage.getItem(AUTH_IS_LOGGED_IN_KEY) === 'true';
        if (!isAuth) return false;

        // Auto-purge any legacy guest or pre-configured test accounts
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        if (raw) {
          try {
            const user = JSON.parse(raw);
            if (
              user.isGuest ||
              user.id === 'usr_guest' ||
              user.id?.startsWith('usr_ram_chitwan') ||
              user.id?.startsWith('usr_sita_dhading') ||
              user.id?.startsWith('usr_bikram_kavre')
            ) {
              localStorage.removeItem(AUTH_IS_LOGGED_IN_KEY);
              localStorage.removeItem(AUTH_STORAGE_KEY);
              localStorage.removeItem(TOKEN_STORAGE_KEY);
              return false;
            }
          } catch (e) {}
        }
        return true;
      }
    } catch (e) {}
    return false;
  },

  /**
   * Get currently logged-in user (null if unauthenticated)
   */
  getCurrentUser(): AuthUser | null {
    try {
      if (typeof window !== 'undefined') {
        if (!this.isAuthenticated()) {
          return null;
        }
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        if (raw) {
          return JSON.parse(raw);
        }
      }
    } catch (e) {}
    return null;
  },

  /**
   * Validate Nepal mobile number format
   */
  validateNepalPhone(rawInput: string, lang = 'en'): {
    isValid: boolean;
    error?: string;
    national: string;
    display: string;
    normalized: string;
    carrier: string;
  } {
    const trimmed = (rawInput || '').trim();

    if (!trimmed) {
      return {
        isValid: false,
        error: lang === 'ne' ? 'कृपया आफ्नो मोबाइल नम्बर राख्नुहोस्।' : 'Please enter your mobile number.',
        national: '',
        display: '',
        normalized: '',
        carrier: '',
      };
    }

    // Check for letters or invalid non-phone symbols
    if (/[a-zA-Z]/.test(trimmed) || /[^0-9\+\-\s]/.test(trimmed)) {
      return {
        isValid: false,
        error: lang === 'ne' ? 'कृपया मान्य १० अंकको नेपाली मोबाइल नम्बर राख्नुहोस्।' : 'Please enter a valid Nepal mobile number.',
        national: '',
        display: '',
        normalized: '',
        carrier: '',
      };
    }

    const digitsOnly = trimmed.replace(/\D/g, '');
    let national = '';

    if (digitsOnly.startsWith('977')) {
      national = digitsOnly.slice(3);
    } else if (digitsOnly.startsWith('0')) {
      national = digitsOnly.slice(1);
    } else {
      national = digitsOnly;
    }

    // Must be exactly 10 digits
    if (national.length !== 10) {
      return {
        isValid: false,
        error: lang === 'ne' ? 'कृपया मान्य १० अंकको नेपाली मोबाइल नम्बर राख्नुहोस्।' : 'Please enter a valid Nepal mobile number.',
        national,
        display: national ? `+977 ${national}` : '',
        normalized: national ? `+977${national}` : '',
        carrier: '',
      };
    }

    // Must start with valid Nepal mobile prefix: 98, 97, or 96
    const prefix2 = national.slice(0, 2);
    if (!['98', '97', '96'].includes(prefix2)) {
      return {
        isValid: false,
        error: lang === 'ne' ? 'कृपया मान्य १० अंकको नेपाली मोबाइल नम्बर राख्नुहोस्।' : 'Please enter a valid Nepal mobile number.',
        national,
        display: `+977 ${national}`,
        normalized: `+977${national}`,
        carrier: '',
      };
    }

    let carrier = 'Nepal Mobile Network';
    const prefix3 = national.slice(0, 3);
    if (['984', '985', '986', '974', '975', '976'].includes(prefix3)) {
      carrier = 'Nepal Telecom (NTC)';
    } else if (['980', '981', '982', '970'].includes(prefix3)) {
      carrier = 'Ncell Axiata';
    } else if (prefix3 === '988') {
      carrier = 'Smart Cell';
    }

    const display = `+977 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`;
    const normalized = `+977${national}`;

    return {
      isValid: true,
      national,
      display,
      normalized,
      carrier,
    };
  },

  /**
   * Backward-compatible alias for normalizePhone
   */
  normalizePhone(phone: string) {
    return this.validateNepalPhone(phone);
  },

  /**
   * 1. Send Simulated OTP to Phone Number (Exhibition Demo - NO real SMS)
   */
  async sendPhoneOTP(
    phoneNumber: string,
    intent: 'register' | 'login' | 'change_phone' = 'login'
  ): Promise<{
    success: boolean;
    carrier?: string;
    normalizedPhone?: string;
    testCode?: string;
    simulated?: boolean;
    message: string;
    cooldownSec?: number;
    expiresInSec?: number;
    alreadyExists?: boolean;
    notRegistered?: boolean;
    existingUser?: Partial<AuthUser>;
    error?: string;
  }> {
    const val = this.validateNepalPhone(phoneNumber);
    if (!val.isValid) {
      return {
        success: false,
        message: val.error || 'Please enter a valid Nepal mobile number.',
        error: val.error || 'Please enter a valid Nepal mobile number.',
      };
    }

    // Try backend check first
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: val.normalized, intent }),
      });

      const data = await res.json().catch(() => null);

      if (res.status === 409 || (data && data.alreadyExists)) {
        return {
          success: false,
          alreadyExists: true,
          message: data?.message || 'यो फोन नम्बर पहिले नै दर्ता भइसकेको छ। कृपया साइन इन गर्नुहोस्।',
          error: data?.error || 'User with this phone number already exists.',
          existingUser: data?.existingUser,
        };
      }

      if (res.status === 404 || (data && data.notRegistered)) {
        return {
          success: false,
          notRegistered: true,
          message: data?.message || 'यो फोन नम्बर दर्ता भएको छैन। कृपया नयाँ खाता खोल्नुहोस्।',
          error: data?.error || 'User is not registered yet.',
        };
      }

      if (data && data.success) {
        return {
          success: true,
          carrier: data.carrier || val.carrier,
          normalizedPhone: val.normalized,
          testCode: data.devOtp || undefined,
          simulated: Boolean(data.simulated),
          message: data.message || `We've sent a 6-digit verification code to ${val.display}`,
          cooldownSec: 30,
          expiresInSec: 300,
        };
      }

      // Server responded with a non-success response (e.g., 400 invalid phone / carrier error)
      return {
        success: false,
        message: data?.message || data?.error || 'Failed to send verification code.',
        error: data?.error || data?.message || 'Failed to send verification code.',
      };
    } catch (e) {
      // Backend offline or network unreachable fallback handled below
    }

    // Client-side local check fallback
    const localUser = this.findUserByPhone(phoneNumber);
    if (intent === 'register' && localUser) {
      return {
        success: false,
        alreadyExists: true,
        message: 'यो फोन नम्बर पहिले नै दर्ता भइसकेको छ। कृपया साइन इन गर्नुहोस्। (This phone number is already registered. Please log in.)',
        error: 'Phone number already registered.',
        existingUser: localUser,
      };
    }

    if (intent === 'login' && !localUser) {
      return {
        success: false,
        notRegistered: true,
        message: 'यो फोन नम्बर दर्ता भएको छैन। कृपया नयाँ खाता खोल्नुहोस्। (This phone number is not registered yet. Please create an account.)',
        error: 'No registered user found for this phone number.',
      };
    }

    return {
      success: true,
      carrier: val.carrier,
      normalizedPhone: val.normalized,
      testCode: '123456',
      message: `We've sent a 6-digit verification code to ${val.display}`,
      cooldownSec: 30,
      expiresInSec: 900,
    };
  },

  /**
   * Find existing user in local offline cache by exact 10-digit Nepal mobile number
   */
  findUserByPhone(phone: string): AuthUser | null {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '');
    const last10 = digits.slice(-10);
    if (last10.length < 10) return null;

    try {
      if (typeof window !== 'undefined') {
        const savedCustomRaw = localStorage.getItem(OFFLINE_USERS_STORAGE_KEY);
        if (savedCustomRaw) {
          const rawList: AuthUser[] = JSON.parse(savedCustomRaw);
          const cleanedList = rawList.filter(
            (u) =>
              u.id !== 'usr_guest' &&
              !u.id?.startsWith('usr_ram_chitwan') &&
              !u.id?.startsWith('usr_sita_dhading') &&
              !u.id?.startsWith('usr_bikram_kavre')
          );
          if (cleanedList.length !== rawList.length) {
            localStorage.setItem(OFFLINE_USERS_STORAGE_KEY, JSON.stringify(cleanedList));
          }
          const found = cleanedList.find((u) => {
            const uDigits = (u.phone || '').replace(/\D/g, '');
            const uNormDigits = (u.normalizedPhone || '').replace(/\D/g, '');
            return (
              (uDigits.length >= 10 && uDigits.endsWith(last10)) ||
              (uNormDigits.length >= 10 && uNormDigits.endsWith(last10))
            );
          });
          if (found) return found;
        }
      }
    } catch (e) {}

    return null;
  },

  /**
   * Check if a phone number is registered in the database (authoritative backend check first)
   */
  async checkPhoneRegistered(phone: string): Promise<{ exists: boolean; user?: Partial<AuthUser> }> {
    const val = this.validateNepalPhone(phone);
    try {
      const res = await fetch('/api/auth/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: val.isValid ? val.normalized : phone }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        return data.exists ? { exists: true, user: data.user } : { exists: false };
      }
    } catch (e) {
      // Offline fallback only if backend is unreachable
      const local = this.findUserByPhone(phone);
      if (local) {
        return { exists: true, user: local };
      }
    }

    return { exists: false };
  },

  /**
   * Cache an authenticated user into localStorage for offline resilience
   */
  saveCustomUser(user: AuthUser) {
    try {
      if (typeof window !== 'undefined') {
        const savedCustomRaw = localStorage.getItem(OFFLINE_USERS_STORAGE_KEY);
        const list: AuthUser[] = savedCustomRaw ? JSON.parse(savedCustomRaw) : [];
        const digits = (user.phone || '').replace(/\D/g, '').slice(-10);
        const index = list.findIndex(
          (u) =>
            u.id === user.id ||
            (digits.length === 10 && (u.phone || '').replace(/\D/g, '').endsWith(digits))
        );
        if (index >= 0) {
          list[index] = { ...list[index], ...user };
        } else {
          list.push(user);
        }
        localStorage.setItem(OFFLINE_USERS_STORAGE_KEY, JSON.stringify(list));
      }
    } catch (e) {}
  },

  /**
   * Register a brand new farmer user, storing their details into backend database & localStorage
   */
  async registerFarmerUser(data: {
    name: string;
    phone: string;
    district: string;
    municipality?: string;
    ward?: string;
    locality?: string;
    farmName?: string;
    landSize?: number;
    landUnit?: string;
    primaryCrops?: string[];
    code?: string;
  }): Promise<{
    success: boolean;
    user?: AuthUser;
    token?: string;
    alreadyExists?: boolean;
    error?: string;
    message?: string;
  }> {
    const val = this.validateNepalPhone(data.phone);
    if (!val.isValid) {
      return {
        success: false,
        error: val.error || 'Please enter a valid 10-digit Nepal mobile number.',
        message: val.error || 'कृपया मान्य १० अंकको नेपाली मोबाइल नम्बर राख्नुहोस्।',
      };
    }

    let registeredUser: AuthUser | null = null;
    let token = '';
    let networkFailed = false;

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          phone: val.normalized,
        }),
      });
      const resData = await res.json().catch(() => null);

      if (res.status === 409 || (resData && resData.alreadyExists)) {
        return {
          success: false,
          alreadyExists: true,
          message: resData?.message || 'यो फोन नम्बर पहिले नै दर्ता भइसकेको छ। कृपया साइन इन गर्नुहोस्।',
          error: resData?.error || 'User already exists.',
        };
      }

      if (!res.ok) {
        return {
          success: false,
          error: resData?.error || 'Registration failed. Please verify your OTP and try again.',
          message: resData?.message || resData?.error || 'Registration failed.',
        };
      }

      if (resData && resData.success && resData.user) {
        registeredUser = resData.user;
        token = resData.token;
      }
    } catch (e) {
      networkFailed = true;
    }

    if (!registeredUser && !networkFailed) {
      return {
        success: false,
        error: 'Unable to complete registration.',
      };
    }

    if (!registeredUser && networkFailed) {
      const offlineExisting = this.findUserByPhone(data.phone);
      if (offlineExisting) {
        return {
          success: false,
          alreadyExists: true,
          message: 'यो फोन नम्बर पहिले नै दर्ता भइसकेको छ। कृपया साइन इन गर्नुहोस्।',
          error: 'This phone number already exists in offline cache. Please log in.',
        };
      }
      const digits = (data.phone || '').replace(/\D/g, '').slice(-10);
      const display = val.isValid ? val.display : `+977 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
      const newUserId = `usr_${digits || Date.now()}`;
      registeredUser = {
        id: newUserId,
        uid: newUserId,
        name: data.name,
        phone: display,
        normalizedPhone: val.isValid ? val.normalized : `+977${digits}`,
        phoneVerified: true,
        status: 'active',
        preferredLanguage: 'ne',
        province: 'Bagmati',
        district: data.district.toLowerCase(),
        municipality: data.municipality || 'Bharatpur-11',
        ward: data.ward || '1',
        locality: data.locality || `${data.district} Farm Sector`,
        landSize: Number(data.landSize) || 2.0,
        landUnit: (data.landUnit as any) || 'ropani',
        landSizeRopani: Number(data.landSize) || 2.0,
        farmName: data.farmName || `${data.name}'s Agro Farm`,
        primaryCrops: data.primaryCrops && data.primaryCrops.length > 0 ? data.primaryCrops : ['tomato', 'potato'],
        profileCompletionPct: 100,
        isGuest: false,
        createdAt: new Date().toISOString(),
      };
      token = `kst_token_${newUserId}`;
    }

    // Persist to custom users list in localStorage and set active session
    this.saveCustomUser(registeredUser);
    this.saveCurrentUser(registeredUser);
    this.setToken(token);

    InAppMessageService.dispatchMessage({
      title: `स्वागत छ, ${registeredUser.name}! (नयाँ किसान खाता)`,
      body: `तपाईँको किसान खाता सफलतापूर्वक तयार भयो। अब आफ्ना कृषि उत्पादनहरू सिधै हाटबजारमा सूचीकृत गर्न सक्नुहुन्छ।`,
      type: 'system_verification',
      priority: 'high',
      badge: `${registeredUser.district.toUpperCase()} New Farmer`,
      actionLabel: 'उत्पादन बिक्री गर्नुहोस्',
      actionTab: 'marketplace',
    });

    return {
      success: true,
      user: registeredUser,
      token,
      message: `खाता सफलतापूर्वक दर्ता भयो! स्वागत छ ${registeredUser.name}।`,
    };
  },

  /**
   * Resolve farmer profile from test accounts or custom accounts list
   */
  resolveFarmerByPhone(phone: string): AuthUser {
    const existing = this.findUserByPhone(phone);
    if (existing) return existing;

    // Fallback: build a default profile if resolution is needed
    const digits = phone.replace(/\D/g, '');
    const val = this.validateNepalPhone(phone);
    const newUserId = `usr_${digits.slice(-8) || Date.now()}`;
    const newUser: AuthUser = {
      id: newUserId,
      uid: newUserId,
      name: `Kisan (${digits.slice(-4)})`,
      phone: val.isValid ? val.display : `+977 ${digits}`,
      normalizedPhone: val.isValid ? val.normalized : `+977${digits}`,
      phoneVerified: true,
      status: 'active',
      preferredLanguage: 'ne',
      province: 'Bagmati',
      district: 'chitwan',
      municipality: 'Bharatpur-11',
      ward: '11',
      locality: 'New Agri Corridor',
      landSize: 2.5,
      landUnit: 'ropani',
      landSizeRopani: 2.5,
      farmName: 'KrishiSetu Member Farm',
      primaryCrops: ['tomato', 'potato'],
      profileCompletionPct: 90,
      isGuest: false,
      createdAt: new Date().toISOString(),
    };

    this.saveCustomUser(newUser);
    return newUser;
  },

  loginAsTestAccount(_indexOrId: number | string): AuthUser | null {
    return null;
  },

  /**
   * 2. Verify OTP & Authenticate Farmer Account
   */
  async verifyOTP(params: {
    phoneNumber: string;
    code: string;
    intent?: 'register' | 'login' | 'change_phone';
    registrationData?: {
      name?: string;
      district?: string;
      municipality?: string;
      farmName?: string;
      landSize?: number;
      landUnit?: string;
      primaryCrops?: string[];
    };
  }): Promise<{
    success: boolean;
    isNewUser?: boolean;
    alreadyExists?: boolean;
    notRegistered?: boolean;
    user?: AuthUser;
    token?: string;
    error?: string;
    message?: string;
  }> {
    const { phoneNumber, code, intent = 'login', registrationData } = params;
    const cleanCode = (code || '').trim();

    if (!/^\d{6}$/.test(cleanCode)) {
      return {
        success: false,
        error: 'Please enter a valid 6-digit verification code.',
        message: 'कृपया ६ अंकको प्रमाणीकरण कोड राख्नुहोस्।',
      };
    }

    const val = this.validateNepalPhone(phoneNumber);

    if (intent === 'register') {
      const regRes = await this.registerFarmerUser({
        name: registrationData?.name || 'Nepali Farmer',
        phone: phoneNumber,
        district: registrationData?.district || 'chitwan',
        municipality: registrationData?.municipality || 'Bharatpur-11',
        farmName: registrationData?.farmName,
        landSize: registrationData?.landSize,
        landUnit: registrationData?.landUnit,
        primaryCrops: registrationData?.primaryCrops,
        code: cleanCode,
      });

      return {
        ...regRes,
        isNewUser: true,
      };
    }

    if (intent === 'login') {
      // Always verify OTP against backend server first
      let serverOffline = false;
      try {
        const res = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: val.isValid ? val.normalized : phoneNumber,
            code: cleanCode,
            intent: 'login',
          }),
        });
        const data = await res.json().catch(() => null);

        if (res.status === 404 || (data && data.notRegistered)) {
          return {
            success: false,
            notRegistered: true,
            error: data?.error || 'This phone number is not registered yet. Please create an account.',
            message: data?.message || 'यो फोन नम्बर दर्ता भएको छैन। कृपया नयाँ खाता खोल्नुहोस्।',
          };
        }

        if (!res.ok) {
          return {
            success: false,
            error: data?.error || 'Invalid or expired verification code.',
            message: data?.message || 'प्रमाणीकरण कोड मिलेन वा म्याद सकियो।',
          };
        }

        if (data && data.success && data.user) {
          this.saveCustomUser(data.user);
          this.saveCurrentUser(data.user);
          this.setToken(data.token || `kst_token_${data.user.id}`);

          InAppMessageService.dispatchMessage({
            title: `स्वागत छ, ${data.user.name}! (Signed In)`,
            body: `तपाईँको फोन नम्बर सफलतापूर्वक प्रमाणित भयो। कृषिसेतुमा स्वागत छ (${(data.user.district || 'NEPAL').toUpperCase()})!`,
            type: 'system_verification',
            priority: 'high',
            badge: `${(data.user.district || 'NEPAL').toUpperCase()} Verified Farmer`,
            actionLabel: 'बजार हेर्नुहोस्',
            actionTab: 'home',
          });

          return {
            success: true,
            user: data.user,
            token: data.token,
            message: `Verified successfully. Welcome back, ${data.user.name}!`,
          };
        }

        return {
          success: false,
          error: data?.error || 'Unable to verify code.',
          message: data?.message || 'प्रमाणीकरण असफल भयो।',
        };
      } catch (e) {
        serverOffline = true;
      }

      // Local offline fallback ONLY when backend server is unreachable
      const offlineUser = this.findUserByPhone(phoneNumber);
      if (serverOffline && offlineUser && cleanCode === '123456') {
        this.saveCurrentUser(offlineUser);
        const token = `kst_token_${offlineUser.id}`;
        this.setToken(token);

        InAppMessageService.dispatchMessage({
          title: `स्वागत छ, ${offlineUser.name}! (Signed In)`,
          body: `तपाईँको फोन नम्बर सफलतापूर्वक प्रमाणित भयो। कृषिसेतुमा स्वागत छ (${offlineUser.district.toUpperCase()})!`,
          type: 'system_verification',
          priority: 'high',
          badge: `${offlineUser.district.toUpperCase()} Verified Farmer`,
          actionLabel: 'बजार हेर्नुहोस्',
          actionTab: 'home',
        });

        return {
          success: true,
          user: offlineUser,
          token,
          message: `सफलतापूर्वक लगइन भयो! स्वागत छ, ${offlineUser.name}।`,
        };
      }

      return {
        success: false,
        notRegistered: !offlineUser,
        error: offlineUser ? 'Invalid verification code.' : 'Unable to reach authentication server.',
        message: offlineUser ? 'प्रमाणीकरण कोड मिलेन।' : 'सर्भरसँग जडान हुन सकेन। कृपया पुनः प्रयास गर्नुहोस्।',
      };
    }

    // Default change_phone or generic
    const activeFarmerUser = this.resolveFarmerByPhone(phoneNumber);
    this.saveCurrentUser(activeFarmerUser);
    return {
      success: true,
      user: activeFarmerUser,
      token: `kst_token_${activeFarmerUser.id}`,
      message: `Verified successfully.`,
    };
  },

  /**
   * 3. Complete Farmer Profile & Farm Setup
   */
  async completeProfile(params: {
    fullName: string;
    preferredLanguage?: 'ne' | 'en';
    province?: string;
    district: string;
    municipality?: string;
    ward?: string;
    locality?: string;
    farmName?: string;
    landSize?: number;
    landUnit?: LandUnit;
    primaryCrops?: string[];
    soilType?: string;
    irrigationType?: string;
  }): Promise<{
    success: boolean;
    user: AuthUser;
    error?: string;
  }> {
    const token = this.getToken();
    const currentUser = this.getCurrentUser();

    try {
      const res = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(params),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete profile');
      }

      const baseUser = currentUser || ({} as Partial<AuthUser>);
      const updatedUser: AuthUser = {
        ...(baseUser as AuthUser),
        id: data.user.id,
        uid: data.user.id,
        phone: data.user.phone || data.user.phone_number || baseUser.phone || '',
        normalizedPhone: data.user.normalizedPhone || data.user.normalized_phone_number || baseUser.normalizedPhone || '',
        phoneVerified: true,
        status: 'active',
        name: data.profile?.fullName || data.profile?.full_name || data.user.name || params.fullName,
        preferredLanguage: data.profile?.preferredLanguage || data.profile?.preferred_language || params.preferredLanguage || 'ne',
        province: data.profile?.province || params.province || 'Bagmati',
        district: data.profile?.district || params.district,
        municipality: data.profile?.municipality || params.municipality || '',
        ward: data.profile?.ward || params.ward || '1',
        locality: data.profile?.locality || params.locality || '',
        landSize: data.farm?.land_size ?? params.landSize ?? 1.0,
        landUnit: data.farm?.land_unit || params.landUnit || 'ropani',
        landSizeRopani: data.farm?.land_size_ropani_eqv ?? params.landSize ?? 1.0,
        farmName: data.farm?.farm_name || params.farmName || `${params.fullName}'s Farm`,
        primaryCrops: data.farm?.primary_crops || params.primaryCrops || ['tomato'],
        profileCompletionPct: data.profile?.profileCompletionPct || data.profile?.profile_completion_pct || 100,
        isGuest: false,
      };

      this.saveCurrentUser(updatedUser);

      InAppMessageService.dispatchMessage({
        title: `कृषक प्रोफाइल तयार भयो! (Profile Completed)`,
        body: `नमस्ते ${updatedUser.name}, तपाईँको खेतबारी विवरण (${updatedUser.district.toUpperCase()}, ${updatedUser.landSize} ${updatedUser.landUnit}) सुरक्षित गरियो।`,
        type: 'system_verification',
        priority: 'high',
        badge: 'Verified Farmer',
        actionLabel: 'ड्यासबोर्ड हेर्नुहोस्',
        actionTab: 'home',
      });

      return { success: true, user: updatedUser };
    } catch (e: any) {
      // Local fallback
      const updatedUser: AuthUser = {
        ...currentUser,
        name: params.fullName,
        district: params.district.toLowerCase(),
        municipality: params.municipality || '',
        ward: params.ward || '',
        province: params.province || 'Bagmati',
        landSize: params.landSize || 1.0,
        landUnit: params.landUnit || 'ropani',
        landSizeRopani: params.landSize || 1.0,
        primaryCrops: params.primaryCrops && params.primaryCrops.length > 0 ? params.primaryCrops : ['tomato'],
        status: 'active',
        profileCompletionPct: 90,
        isGuest: false,
      };
      this.saveCurrentUser(updatedUser);
      return { success: true, user: updatedUser };
    }
  },

  /**
   * 4. Secure Phone Number Migration (Requires OTP)
   */
  async updatePhoneNumber(params: {
    newPhone: string;
    code: string;
  }): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    const token = this.getToken();
    try {
      const res = await fetch('/api/auth/update-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(params),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to update phone number' };
      }

      const current = this.getCurrentUser() || ({} as AuthUser);
      const updated: AuthUser = {
        ...current,
        phone: data.user.phone || data.user.phone_number || current.phone,
        normalizedPhone: data.user.normalizedPhone || data.user.normalized_phone_number || current.normalizedPhone,
        phoneVerified: true,
      };
      this.saveCustomUser(updated);
      this.saveCurrentUser(updated);
      return { success: true, user: updated };
    } catch (e: any) {
      return { success: false, error: e.message || 'Server error updating phone number' };
    }
  },

  /**
   * Save user to local storage and trigger listeners
   */
  saveCurrentUser(user: AuthUser) {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_IS_LOGGED_IN_KEY, 'true');
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      }
    } catch (e) {}
    this.notifyListeners(user);
  },

  /**
   * Fast Demo Login for presentations
   */
  loginAsDemoFarmer(phone?: string): AuthUser {
    const val = phone ? this.validateNepalPhone(phone) : null;
    const user: AuthUser = {
      ...DEMO_FARMER_USER,
      phone: val && val.isValid ? val.display : DEMO_FARMER_USER.phone,
      normalizedPhone: val && val.isValid ? val.normalized : DEMO_FARMER_USER.normalizedPhone,
    };
    this.setToken('kst_demo_token_v30');
    this.saveCurrentUser(user);
    return user;
  },

  loginAsGuest(): AuthUser {
    return this.loginAsDemoFarmer();
  },

  /**
   * Sign out and clear stored session
   */
  logout() {
    const token = this.getToken();
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }

    this.setToken(null);
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_IS_LOGGED_IN_KEY);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    } catch (e) {}
    this.notifyListeners(null);
  },

  signOut() {
    this.logout();
  },

  /**
   * Subscribe to auth changes
   */
  subscribe(listener: AuthListener) {
    listeners.add(listener);
    listener(this.getCurrentUser());
    return () => {
      listeners.delete(listener);
    };
  },

  notifyListeners(user: AuthUser | null) {
    listeners.forEach((l) => l(user));
  },
};
