import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { AuthUser, Farm, FarmRecordItem } from '../../../shared/types/krishi';
import { SmsService } from './smsService';
import { DbStorageService } from './dbStorageService';

export interface UserSession {
  token: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
}

export interface FarmerProfile {
  id: string;
  userId: string;
  fullName: string;
  preferredLanguage: 'ne' | 'en';
  province?: string;
  district: string;
  municipality?: string;
  ward?: string;
  locality?: string;
  profileCompletionPct: number;
  createdAt: string;
  updatedAt: string;
}

export class AuthStore {
  private users: Map<string, AuthUser> = new Map();
  private userByPhone: Map<string, string> = new Map();
  private sessions: Map<string, UserSession> = new Map();
  private revokedTokens: Set<string> = new Set();
  private profiles: Map<string, FarmerProfile> = new Map();
  private farms: Map<string, Farm> = new Map();
  private farmRecords: Map<string, FarmRecordItem[]> = new Map();

  private static getSessionSecret(): string {
    const envSecret = (process.env.SESSION_SECRET || '').trim();
    if (envSecret.length >= 16) return envSecret;
    const dbSeed = (process.env.DATABASE_URL || '').trim();
    const fallbackMaterial = dbSeed
      ? `krishisetu-hmac:${dbSeed}`
      : 'krishisetu-dev-session-secret-configure-in-env';
    return crypto.createHash('sha256').update(fallbackMaterial).digest('hex');
  }

  constructor() {
    this.loadFromDisk();
  }

  private getStorageFilePath(): string {
    const dataDir = path.join(process.cwd(), 'backend', 'src', 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (e) {}
    }
    const filename = process.env.NODE_ENV === 'test' ? 'registered_users.test.json' : 'registered_users.json';
    return path.join(dataDir, filename);
  }

  public saveToDisk() {
    try {
      const filePath = this.getStorageFilePath();
      const allUsers = Array.from(this.users.values());
      const allProfiles = Array.from(this.profiles.values());
      const allFarms = Array.from(this.farms.values());
      fs.writeFileSync(
        filePath,
        JSON.stringify({ users: allUsers, profiles: allProfiles, farms: allFarms }, null, 2),
        'utf-8'
      );
    } catch (e) {
      console.warn('[AuthStore] Could not persist to disk:', e);
    }
  }

  public loadFromDisk() {
    try {
      const filePath = this.getStorageFilePath();
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data.users)) {
          for (const u of data.users) {
            this.users.set(u.id, u);
            this.userByPhone.set(u.phone, u.id);
            if (u.normalizedPhone) this.userByPhone.set(u.normalizedPhone, u.id);
          }
        }
        if (Array.isArray(data.profiles)) {
          for (const p of data.profiles) {
            this.profiles.set(p.userId, p);
          }
        }
        if (Array.isArray(data.farms)) {
          for (const f of data.farms) {
            this.farms.set(f.farmer_id, f);
          }
        }
      }
    } catch (e) {
      console.warn('[AuthStore] Could not load persisted users:', e);
    }
  }


  public normalizePhone(rawPhone: string): string {
    const digits = (rawPhone || '').replace(/\D/g, '');
    if (digits.startsWith('977') && digits.length === 13) {
      return `+${digits}`;
    }
    if (digits.startsWith('0') && digits.length === 11) {
      return `+977${digits.slice(1)}`;
    }
    if (digits.length >= 10) {
      return `+977${digits.slice(-10)}`;
    }
    return `+977${digits}`;
  }

  public async generateAndSendOtp(phone: string, intent: 'login' | 'register' | 'change_phone' = 'login') {
    const normalized = this.normalizePhone(phone);
    const smsRes = await SmsService.sendOtp(normalized);
    return {
      success: true,
      normalizedPhone: normalized,
      message: smsRes.message,
      simulated: smsRes.simulated,
      devOtp: process.env.NODE_ENV !== 'production' && smsRes.simulated ? smsRes.code : undefined,
      carrier: smsRes.carrier,
    };
  }

  public verifyOtp(phone: string, code: string) {
    const normalized = this.normalizePhone(phone);
    const verification = SmsService.verifyOtp(normalized, code);
    return {
      ...verification,
      normalizedPhone: normalized,
    };
  }

  public findUserByPhone(rawPhone: string): AuthUser | null {
    if (!rawPhone) return null;
    const digits = rawPhone.replace(/\D/g, '');
    const last10 = digits.slice(-10);
    if (last10.length < 10) return null;
    const normalized = this.normalizePhone(rawPhone);

    // 1. Direct lookup
    const userId = this.userByPhone.get(normalized) || this.userByPhone.get(rawPhone);
    if (userId && this.users.has(userId)) {
      return this.users.get(userId)!;
    }

    // 2. Scan all users matching exact last 10 digits
    for (const user of this.users.values()) {
      const uDigits = (user.phone || '').replace(/\D/g, '');
      const uNormDigits = (user.normalizedPhone || '').replace(/\D/g, '');
      if (
        (uDigits.length >= 10 && uDigits.endsWith(last10)) ||
        (uNormDigits.length >= 10 && uNormDigits.endsWith(last10))
      ) {
        return user;
      }
    }

    return null;
  }

  public async findUserByPhoneAsync(rawPhone: string): Promise<AuthUser | null> {
    const cached = this.findUserByPhone(rawPhone);
    if (cached) return cached;

    const dbUser = await DbStorageService.getUserByPhone(rawPhone);
    if (dbUser) {
      this.hydrateUserFromDb(dbUser);
      return dbUser;
    }
    return null;
  }

  public async getUserAsync(userId: string): Promise<AuthUser | null> {
    const cached = this.users.get(userId);
    if (cached) return cached;

    const dbUser = await DbStorageService.getUserByUid(userId);
    if (dbUser) {
      this.hydrateUserFromDb(dbUser);
      return dbUser;
    }
    return null;
  }

  private hydrateUserFromDb(user: AuthUser) {
    this.users.set(user.id, user);
    if (user.phone) {
      this.userByPhone.set(user.phone, user.id);
      this.userByPhone.set(this.normalizePhone(user.phone), user.id);
    }
    if (!this.profiles.has(user.id)) {
      this.profiles.set(user.id, {
        id: `prof_${user.id}`,
        userId: user.id,
        fullName: user.name,
        preferredLanguage: user.preferredLanguage || 'ne',
        province: user.province || 'Bagmati',
        district: user.district || 'chitwan',
        municipality: user.municipality || '',
        ward: user.ward || '1',
        locality: user.locality || '',
        profileCompletionPct: 100,
        createdAt: user.created_at || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    if (!this.farms.has(user.id)) {
      this.farms.set(user.id, {
        id: `farm_${user.id}`,
        farmer_id: user.id,
        farm_name: user.farmName || `${user.name}'s Agro Farm`,
        land_size: user.landSize || 2.0,
        land_unit: user.landUnit || 'ropani',
        land_size_ropani_eqv: user.landSize || 2.0,
        soil_type: 'Alluvial Loam / दोमट माटो',
        irrigation_type: 'Drip / थोपा सिँचाइ',
        primary_crops: user.primaryCrops || ['tomato', 'potato'],
        created_at: user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }

  public isPhoneRegistered(rawPhone: string): boolean {
    return this.findUserByPhone(rawPhone) !== null;
  }

  public registerFarmerUser(data: {
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
  }): { user: AuthUser; token: string; profile: FarmerProfile; farm: Farm } {
    const normalized = this.normalizePhone(data.phone);
    const existing = this.findUserByPhone(data.phone);
    if (existing) {
      throw new Error('User already exists with this phone number. Please log in.');
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const digits = normalized.replace(/\D/g, '').slice(-10);
    const displayPhone = `+977 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;

    const newUser: AuthUser = {
      id: userId,
      uid: userId,
      name: data.name,
      phone: displayPhone,
      normalizedPhone: normalized,
      phoneVerified: true,
      status: 'active',
      preferredLanguage: 'ne',
      province: 'Bagmati',
      district: data.district.toLowerCase(),
      municipality: data.municipality || '',
      ward: data.ward || '1',
      locality: data.locality || '',
      landSize: data.landSize || 2.0,
      landUnit: (data.landUnit as any) || 'ropani',
      landSizeRopani: data.landSize || 2.0,
      farmName: data.farmName || `${data.name}'s Agro Farm`,
      primaryCrops: data.primaryCrops && data.primaryCrops.length > 0 ? data.primaryCrops : ['tomato', 'potato'],
      profileCompletionPct: 100,
      isGuest: false,
      isRegistered: true,
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    this.users.set(userId, newUser);
    this.userByPhone.set(normalized, userId);
    this.userByPhone.set(displayPhone, userId);
    this.userByPhone.set(digits, userId);

    const profile: FarmerProfile = {
      id: `prof_${userId}`,
      userId,
      fullName: data.name,
      preferredLanguage: 'ne',
      province: 'Bagmati',
      district: data.district.toLowerCase(),
      municipality: data.municipality || '',
      ward: data.ward || '1',
      locality: data.locality || '',
      profileCompletionPct: 100,
      createdAt: newUser.created_at || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.profiles.set(userId, profile);

    const farm: Farm = {
      id: `farm_${userId}`,
      farmer_id: userId,
      farm_name: data.farmName || `${data.name}'s Agro Farm`,
      land_size: data.landSize || 2.0,
      land_unit: data.landUnit || 'ropani',
      land_size_ropani_eqv: data.landSize || 2.0,
      soil_type: 'Alluvial Loam / दोमट माटो',
      irrigation_type: 'Drip / थोपा सिँचाइ',
      primary_crops: newUser.primaryCrops,
      created_at: newUser.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.farms.set(userId, farm);
    this.farmRecords.set(userId, []);

    this.saveToDisk();

    // Persist to Cloud SQL
    DbStorageService.upsertUser(newUser).catch((e) =>
      console.warn('[AuthStore] Cloud SQL user sync error:', e?.message)
    );

    const token = this.createSession(userId);
    return { user: newUser, token, profile, farm };
  }

  public getUser(userId: string): AuthUser | null {
    return this.users.get(userId) || null;
  }

  public getProfile(userId: string): FarmerProfile | null {
    return this.profiles.get(userId) || null;
  }

  public getFarm(userId: string): Farm | null {
    return this.farms.get(userId) || null;
  }

  public registerUserDirectly(user: AuthUser) {
    this.users.set(user.id, user);
    this.userByPhone.set(user.phone, user.id);
  }

  public registerUser(normalizedPhone: string): { user: AuthUser } {
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newUser: AuthUser = {
      id: userId,
      name: '',
      phone: normalizedPhone,
      district: '',
      primaryCrops: [],
      preferredLanguage: 'ne',
      isRegistered: false,
      status: 'pending_profile',
      created_at: new Date().toISOString(),
    };

    this.users.set(userId, newUser);
    this.userByPhone.set(normalizedPhone, userId);

    // Initial farm records for a new user is ALWAYS empty
    this.farmRecords.set(userId, []);

    return { user: newUser };
  }

  public completeFarmerProfile(
    userId: string,
    data: {
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
    }
  ) {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');

    user.name = data.fullName;
    user.district = data.district;
    user.municipality = data.municipality;
    user.ward = data.ward;
    user.locality = data.locality;
    user.landSize = data.landSize;
    user.landUnit = data.landUnit;
    user.primaryCrops = data.primaryCrops;
    user.preferredLanguage = data.preferredLanguage;
    user.isRegistered = true;
    user.status = 'active';

    const profile: FarmerProfile = {
      id: `prof_${userId}`,
      userId,
      fullName: data.fullName,
      preferredLanguage: data.preferredLanguage,
      province: data.province || 'Bagmati',
      district: data.district,
      municipality: data.municipality,
      ward: data.ward,
      locality: data.locality,
      profileCompletionPct: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.profiles.set(userId, profile);

    const farm: Farm = {
      id: `farm_${userId}`,
      farmer_id: userId,
      farm_name: data.farmName || `${data.fullName}'s Farm`,
      land_size: data.landSize,
      land_unit: data.landUnit,
      land_size_ropani_eqv: data.landSize,
      soil_type: data.soilType || 'Alluvial Loam',
      irrigation_type: data.irrigationType || 'Irrigated',
      primary_crops: data.primaryCrops,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.farms.set(userId, farm);

    this.saveToDisk();
    DbStorageService.upsertUser(user).catch((e) =>
      console.warn('[AuthStore] Cloud SQL completeFarmerProfile sync error:', e?.message)
    );

    return { user, profile, farm };
  }

  public updatePhoneNumber(userId: string, newNormalizedPhone: string) {
    const user = this.users.get(userId);
    if (!user) return { success: false, error: 'User not found' };

    const existingUserId = this.userByPhone.get(newNormalizedPhone);
    if (existingUserId && existingUserId !== userId) {
      return { success: false, error: 'This phone number is already registered to another account' };
    }

    this.userByPhone.delete(user.phone);
    user.phone = newNormalizedPhone;
    user.normalizedPhone = newNormalizedPhone;
    this.userByPhone.set(newNormalizedPhone, userId);

    this.saveToDisk();
    DbStorageService.upsertUser(user).catch((e) =>
      console.warn('[AuthStore] Cloud SQL updatePhoneNumber sync error:', e?.message)
    );

    return { success: true, user };
  }

  public createSession(userId: string): string {
    const iat = Date.now();
    const expiresAt = iat + 30 * 86400000; // 30 days
    const payload = Buffer.from(JSON.stringify({ uid: userId, iat, exp: expiresAt })).toString('base64url');
    const sig = crypto
      .createHmac('sha256', AuthStore.getSessionSecret())
      .update(payload)
      .digest('base64url');
    const token = `kst2.${payload}.${sig}`;

    this.sessions.set(token, {
      token,
      userId,
      createdAt: iat,
      expiresAt,
    });
    return token;
  }

  private verifySignedToken(token: string): { valid: boolean; userId?: string; expiresAt?: number } {
    if (!token || !token.startsWith('kst2.')) return { valid: false };
    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false };
    const [, payloadB64, providedSig] = parts;
    if (!payloadB64 || !providedSig) return { valid: false };

    const expectedSig = crypto
      .createHmac('sha256', AuthStore.getSessionSecret())
      .update(payloadB64)
      .digest('base64url');

    const providedBuf = Buffer.from(providedSig, 'utf8');
    const expectedBuf = Buffer.from(expectedSig, 'utf8');
    if (providedBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(providedBuf, expectedBuf)) {
      return { valid: false };
    }

    try {
      const parsed = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
      if (!parsed?.uid || typeof parsed.exp !== 'number' || Date.now() > parsed.exp) {
        return { valid: false };
      }
      return { valid: true, userId: String(parsed.uid), expiresAt: parsed.exp };
    } catch {
      return { valid: false };
    }
  }

  public validateSession(token: string) {
    if (!token || this.revokedTokens.has(token)) {
      return { isValid: false, user: null, profile: null, farm: null };
    }

    let resolvedUserId: string | null = null;
    const session = this.sessions.get(token);
    if (session) {
      if (Date.now() > session.expiresAt) {
        this.sessions.delete(token);
        return { isValid: false, user: null, profile: null, farm: null };
      }
      resolvedUserId = session.userId;
    } else {
      const signed = this.verifySignedToken(token);
      if (!signed.valid || !signed.userId) {
        return { isValid: false, user: null, profile: null, farm: null };
      }
      resolvedUserId = signed.userId;
    }

    const user = this.users.get(resolvedUserId) || null;
    if (!user) {
      return { isValid: false, user: null, profile: null, farm: null };
    }
    const profile = this.profiles.get(resolvedUserId) || null;
    const farm = this.farms.get(resolvedUserId) || null;
    return { isValid: true, user, profile, farm };
  }

  public async validateSessionAsync(token: string) {
    const syncRes = this.validateSession(token);
    if (syncRes.isValid && syncRes.user) return syncRes;

    if (!token || this.revokedTokens.has(token)) {
      return { isValid: false, user: null, profile: null, farm: null };
    }

    const signed = this.verifySignedToken(token);
    if (!signed.valid || !signed.userId) {
      return { isValid: false, user: null, profile: null, farm: null };
    }

    const hydratedUser = await this.getUserAsync(signed.userId);
    if (!hydratedUser) {
      return { isValid: false, user: null, profile: null, farm: null };
    }

    return {
      isValid: true,
      user: hydratedUser,
      profile: this.profiles.get(hydratedUser.id) || null,
      farm: this.farms.get(hydratedUser.id) || null,
    };
  }

  public invalidateSession(token: string) {
    if (token) {
      this.revokedTokens.add(token);
      this.sessions.delete(token);
    }
  }

  public getUserFarmRecords(userId: string): FarmRecordItem[] {
    return this.farmRecords.get(userId) || [];
  }

  public setUserFarmRecords(userId: string, records: FarmRecordItem[]) {
    this.farmRecords.set(userId, [...records]);
  }

  public addUserFarmRecord(userId: string, record: Omit<FarmRecordItem, 'id'>): FarmRecordItem {
    const existing = this.farmRecords.get(userId) || [];
    const newRecord: FarmRecordItem = {
      ...record,
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      recorded_at: record.recorded_at || new Date().toISOString(),
    };
    this.farmRecords.set(userId, [newRecord, ...existing]);
    return newRecord;
  }

  public deleteUserFarmRecord(userId: string, recordId: string): boolean {
    const existing = this.farmRecords.get(userId) || [];
    const filtered = existing.filter((r) => r.id !== recordId);
    this.farmRecords.set(userId, filtered);
    return filtered.length < existing.length;
  }
}

export const authStore = new AuthStore();
