import fs from 'fs';
import path from 'path';
import { AuthUser, Farm, FarmRecordItem } from '../../../shared/types/krishi';
import { SmsService } from './smsService';

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
  private profiles: Map<string, FarmerProfile> = new Map();
  private farms: Map<string, Farm> = new Map();
  private farmRecords: Map<string, FarmRecordItem[]> = new Map();

  constructor() {
    this.seedInitialDemoData();
    this.loadFromDisk();
  }

  private getStorageFilePath(): string {
    const dataDir = path.join(process.cwd(), 'backend', 'src', 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (e) {}
    }
    return path.join(dataDir, 'registered_users.json');
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

  private seedInitialDemoData() {
    // 1. Account 1: Ram Bahadur Thapa (Chitwan)
    const user1Id = 'usr_ram_chitwan_001';
    const user1Phone = '+9779845012345';
    const user1: AuthUser = {
      id: user1Id,
      name: 'Ram Bahadur Thapa',
      phone: user1Phone,
      district: 'chitwan',
      municipality: 'Bharatpur-11',
      ward: '11',
      locality: 'Bhojad Green Valley',
      landSize: 4.5,
      landUnit: 'ropani',
      primaryCrops: ['tomato', 'cauliflower', 'potato'],
      preferredLanguage: 'ne',
      isRegistered: true,
      status: 'active',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    };
    this.users.set(user1Id, user1);
    this.userByPhone.set(user1Phone, user1Id);
    this.profiles.set(user1Id, {
      id: 'prof_ram_001',
      userId: user1Id,
      fullName: 'Ram Bahadur Thapa',
      preferredLanguage: 'ne',
      province: 'Bagmati',
      district: 'chitwan',
      municipality: 'Bharatpur-11',
      ward: '11',
      locality: 'Bhojad Green Valley',
      profileCompletionPct: 100,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    });
    this.farms.set(user1Id, {
      id: 'farm_ram_001',
      farmer_id: user1Id,
      farm_name: 'Thapa Organic Vegetable Farm',
      land_size: 4.5,
      land_unit: 'ropani',
      land_size_ropani_eqv: 4.5,
      soil_type: 'Alluvial Loam / बलौटे दोमट',
      irrigation_type: 'Borewell Drip / थोपा सिँचाइ',
      primary_crops: ['tomato', 'cauliflower', 'potato'],
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    });

    // 2. Account 2: Sita Devi Adhikari (Dhading)
    const user2Id = 'usr_sita_dhading_002';
    const user2Phone = '+9779801234567';
    const user2: AuthUser = {
      id: user2Id,
      name: 'Sita Devi Adhikari',
      phone: user2Phone,
      district: 'dhading',
      municipality: 'Benighat Rorang-03',
      ward: '3',
      locality: 'Malekhu Corridor',
      landSize: 6.0,
      landUnit: 'ropani',
      primaryCrops: ['cabbage', 'ginger', 'tomato'],
      preferredLanguage: 'ne',
      isRegistered: true,
      status: 'active',
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    };
    this.users.set(user2Id, user2);
    this.userByPhone.set(user2Phone, user2Id);
    this.profiles.set(user2Id, {
      id: 'prof_sita_002',
      userId: user2Id,
      fullName: 'Sita Devi Adhikari',
      preferredLanguage: 'ne',
      province: 'Bagmati',
      district: 'dhading',
      municipality: 'Benighat Rorang-03',
      ward: '3',
      locality: 'Malekhu Corridor',
      profileCompletionPct: 100,
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    });
    this.farms.set(user2Id, {
      id: 'farm_sita_002',
      farmer_id: user2Id,
      farm_name: 'Adhikari Hillside Agro Farm',
      land_size: 6.0,
      land_unit: 'ropani',
      land_size_ropani_eqv: 6.0,
      soil_type: 'Clay Loam / रातो पाङ्गो माटो',
      irrigation_type: 'River Lift & Sprinkler / त्रिशूली लिफ्ट सिँचाइ',
      primary_crops: ['cabbage', 'ginger', 'tomato'],
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    });

    // 3. Account 3: Bikram Shrestha (Kavre)
    const user3Id = 'usr_bikram_kavre_003';
    const user3Phone = '+9779812345678';
    const user3: AuthUser = {
      id: user3Id,
      name: 'Bikram Shrestha',
      phone: user3Phone,
      district: 'kavre',
      municipality: 'Panauti-04',
      ward: '4',
      locality: 'Subbagaun Valley',
      landSize: 3.2,
      landUnit: 'ropani',
      primaryCrops: ['potato', 'onion', 'capsicum'],
      preferredLanguage: 'ne',
      isRegistered: true,
      status: 'active',
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    };
    this.users.set(user3Id, user3);
    this.userByPhone.set(user3Phone, user3Id);
    this.profiles.set(user3Id, {
      id: 'prof_bikram_003',
      userId: user3Id,
      fullName: 'Bikram Shrestha',
      preferredLanguage: 'ne',
      province: 'Bagmati',
      district: 'kavre',
      municipality: 'Panauti-04',
      ward: '4',
      locality: 'Subbagaun Valley',
      profileCompletionPct: 100,
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    });
    this.farms.set(user3Id, {
      id: 'farm_bikram_003',
      farmer_id: user3Id,
      farm_name: 'Panauti Valley Fresh Produce',
      land_size: 3.2,
      land_unit: 'ropani',
      land_size_ropani_eqv: 3.2,
      soil_type: 'Mountain Silt / पहाडी कालो माटो',
      irrigation_type: 'Canal Gravity Flow / कुलो सिँचाइ',
      primary_crops: ['potato', 'onion', 'capsicum'],
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  public normalizePhone(rawPhone: string): string {
    const digits = rawPhone.replace(/\D/g, '');
    if (digits.startsWith('977') && digits.length === 13) {
      return `+${digits}`;
    }
    if (digits.length === 10 && (digits.startsWith('98') || digits.startsWith('97'))) {
      return `+977${digits}`;
    }
    return `+977${digits.slice(-10)}`;
  }

  public async generateAndSendOtp(phone: string, intent: 'login' | 'register' | 'change_phone' = 'login') {
    const normalized = this.normalizePhone(phone);
    const smsRes = await SmsService.sendOtp(normalized);
    return {
      success: true,
      normalizedPhone: normalized,
      message: `OTP sent to ${normalized}`,
      devOtp: process.env.NODE_ENV !== 'production' ? smsRes.code : undefined,
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
    const normalized = this.normalizePhone(rawPhone);

    // 1. Direct lookup
    const userId = this.userByPhone.get(normalized) || this.userByPhone.get(rawPhone);
    if (userId && this.users.has(userId)) {
      return this.users.get(userId)!;
    }

    // 2. Scan all users matching last 10 digits
    if (last10.length >= 7) {
      for (const user of this.users.values()) {
        const uDigits = user.phone.replace(/\D/g, '');
        if (uDigits.endsWith(last10) || (user.normalizedPhone && user.normalizedPhone.replace(/\D/g, '').endsWith(last10))) {
          return user;
        }
      }
    }

    return null;
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
    this.userByPhone.set(newNormalizedPhone, userId);

    return { success: true, user };
  }

  public createSession(userId: string): string {
    const token = `kst_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
    const expiresAt = Date.now() + 30 * 86400000; // 30 days
    this.sessions.set(token, {
      token,
      userId,
      createdAt: Date.now(),
      expiresAt,
    });
    return token;
  }

  public validateSession(token: string) {
    const session = this.sessions.get(token);
    if (!session) return { isValid: false, user: null, profile: null, farm: null };
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(token);
      return { isValid: false, user: null, profile: null, farm: null };
    }
    const user = this.users.get(session.userId) || null;
    const profile = this.profiles.get(session.userId) || null;
    const farm = this.farms.get(session.userId) || null;
    return { isValid: true, user, profile, farm };
  }

  public invalidateSession(token: string) {
    this.sessions.delete(token);
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
