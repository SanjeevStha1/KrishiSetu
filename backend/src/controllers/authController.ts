import { Request, Response } from 'express';
import { authStore } from '../services/authStore';
import { AuthenticatedRequest, getBearerToken } from '../middleware/authMiddleware';

export class AuthController {
  public static checkPhone(req: Request, res: Response) {
    try {
      const { phone } = req.body;
      if (!phone) {
        return res.status(400).json({ success: false, error: 'Phone number is required' });
      }
      const existing = authStore.findUserByPhone(phone);
      if (existing) {
        return res.json({
          success: true,
          exists: true,
          user: {
            id: existing.id,
            name: existing.name,
            phone: existing.phone,
            district: existing.district,
            municipality: existing.municipality,
            farmName: existing.farmName,
          },
          message: 'Phone number already registered. Please log in.',
        });
      }
      return res.json({
        success: true,
        exists: false,
        message: 'Phone number is not registered yet.',
      });
    } catch (err: any) {
      console.error('Error in AuthController.checkPhone:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async register(req: Request, res: Response) {
    try {
      const {
        phone,
        name,
        district,
        municipality,
        ward,
        locality,
        farmName,
        landSize,
        landUnit,
        primaryCrops,
        code,
      } = req.body;

      if (!phone || !name || !district) {
        return res.status(400).json({
          success: false,
          error: 'Phone number, full name, and district are required to create an account.',
        });
      }

      // Check if phone already in database
      const existing = authStore.findUserByPhone(phone);
      if (existing) {
        return res.status(409).json({
          success: false,
          alreadyExists: true,
          error: 'This phone number is already registered in the database. Please log in instead.',
          message: 'यो फोन नम्बर पहिले नै दर्ता भइसकेको छ। कृपया साइन इन गर्नुहोस्।',
          existingUser: {
            name: existing.name,
            phone: existing.phone,
            district: existing.district,
          },
        });
      }

      // Verify OTP code if provided (prototype accepts 123456)
      if (code) {
        const cleanCode = String(code).trim();
        if (cleanCode !== '123456') {
          const verification = authStore.verifyOtp(phone, cleanCode);
          if (!verification.success) {
            return res.status(400).json({
              success: false,
              error: 'Invalid verification code. Please check and try again.',
            });
          }
        }
      }

      const { user, token, profile, farm } = authStore.registerFarmerUser({
        name,
        phone,
        district,
        municipality,
        ward,
        locality,
        farmName,
        landSize: Number(landSize) || 2.0,
        landUnit: landUnit || 'ropani',
        primaryCrops: Array.isArray(primaryCrops) && primaryCrops.length > 0 ? primaryCrops : ['tomato', 'potato'],
      });

      return res.status(201).json({
        success: true,
        message: `Account created successfully! Welcome, ${user.name}.`,
        user,
        profile,
        farm,
        token,
      });
    } catch (err: any) {
      console.error('Error in AuthController.register:', err);
      return res.status(500).json({ success: false, error: err.message || 'Failed to register account' });
    }
  }

  public static async sendOtp(req: Request, res: Response) {
    try {
      const { phone, intent = 'login' } = req.body;
      if (!phone) {
        return res.status(400).json({ success: false, error: 'Phone number is required' });
      }

      const existingUser = authStore.findUserByPhone(phone);

      // If user is trying to REGISTER with a number already in database
      if (intent === 'register' && existingUser) {
        return res.status(409).json({
          success: false,
          alreadyExists: true,
          error: 'This phone number is already registered in the database. Please log in.',
          message: 'यो फोन नम्बर पहिले नै दर्ता भइसकेको छ। कृपया साइन इन गर्नुहोस्।',
          existingUser: {
            name: existingUser.name,
            phone: existingUser.phone,
            district: existingUser.district,
          },
        });
      }

      // If user is trying to LOGIN with a number NOT in database
      if (intent === 'login' && !existingUser) {
        return res.status(404).json({
          success: false,
          notRegistered: true,
          error: 'This phone number is not registered yet. Please create an account.',
          message: 'यो फोन नम्बर दर्ता भएको छैन। कृपया नयाँ खाता खोल्नुहोस्।',
        });
      }

      const result = await authStore.generateAndSendOtp(phone, intent);
      return res.json({
        ...result,
        userExists: !!existingUser,
      });
    } catch (err: any) {
      console.error('Error in AuthController.sendOtp:', err);
      return res.status(400).json({ success: false, error: err.message || 'Failed to send OTP' });
    }
  }

  public static async verifyOtp(req: Request, res: Response) {
    try {
      const { phone, code, intent = 'login' } = req.body;
      if (!phone || !code) {
        return res.status(400).json({ success: false, error: 'Phone number and verification code are required' });
      }

      const cleanCode = String(code).trim();
      if (cleanCode !== '123456') {
        const verification = authStore.verifyOtp(phone, cleanCode);
        if (!verification.success) {
          return res.status(400).json(verification);
        }
      }

      // Find user by phone in database
      let activeUser = authStore.findUserByPhone(phone);

      if (intent === 'login' && !activeUser) {
        return res.status(404).json({
          success: false,
          notRegistered: true,
          error: 'No account found with this phone number. Please register first.',
          message: 'यो फोन नम्बर दर्ता भएको छैन। कृपया नयाँ खाता खोल्नुहोस्।',
        });
      }

      if (intent === 'register' && activeUser) {
        return res.status(409).json({
          success: false,
          alreadyExists: true,
          error: 'This phone number is already registered. Please log in instead.',
          message: 'यो फोन नम्बर पहिले नै दर्ता भइसकेको छ। कृपया साइन इन गर्नुहोस्।',
        });
      }

      if (!activeUser) {
        return res.status(404).json({
          success: false,
          notRegistered: true,
          error: 'User not found. Please create an account.',
        });
      }

      const token = authStore.createSession(activeUser.id);
      const profile = authStore.getProfile(activeUser.id) || {
        id: `prof_${activeUser.id}`,
        userId: activeUser.id,
        fullName: activeUser.name,
        preferredLanguage: activeUser.preferredLanguage,
        province: 'Bagmati',
        district: activeUser.district,
        municipality: activeUser.municipality || 'Bharatpur-11',
        ward: activeUser.ward || '1',
        locality: activeUser.locality || 'Krishi Center',
        profileCompletionPct: 100,
        createdAt: activeUser.created_at || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const farm = authStore.getFarm(activeUser.id) || {
        id: `farm_${activeUser.id}`,
        farmer_id: activeUser.id,
        farm_name: activeUser.farmName || `${activeUser.name}'s Agro Farm`,
        land_size: activeUser.landSize || 2.0,
        land_unit: activeUser.landUnit || 'ropani',
        land_size_ropani_eqv: activeUser.landSize || 2.0,
        soil_type: 'Alluvial Loam / बलौटे दोमट',
        irrigation_type: 'Borewell Drip / थोपा सिँचाइ',
        primary_crops: activeUser.primaryCrops,
        created_at: activeUser.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return res.json({
        success: true,
        token,
        user: activeUser,
        profile,
        farm,
        message: `Verified successfully. Welcome back, ${activeUser.name}!`,
      });
    } catch (err: any) {
      console.error('Error in AuthController.verifyOtp:', err);
      return res.status(500).json({ success: false, error: 'Internal authentication server error' });
    }
  }

  public static completeProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const token = getBearerToken(req);
      if (!token) {
        return res.status(401).json({ success: false, error: 'Authentication token is required' });
      }

      const session = authStore.validateSession(token);
      if (!session.isValid || !session.user) {
        return res.status(401).json({ success: false, error: 'Session has expired. Please sign in again.' });
      }

      const {
        fullName,
        preferredLanguage,
        province,
        district,
        municipality,
        ward,
        locality,
        farmName,
        landSize,
        landUnit,
        primaryCrops,
        soilType,
        irrigationType,
      } = req.body;

      if (!fullName || fullName.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'Full name is required' });
      }

      if (!district) {
        return res.status(400).json({ success: false, error: 'District is required' });
      }

      const result = authStore.completeFarmerProfile(session.user.id, {
        fullName,
        preferredLanguage: preferredLanguage || 'ne',
        province,
        district,
        municipality,
        ward,
        locality,
        farmName,
        landSize: Number(landSize) || 1.0,
        landUnit: landUnit || 'ropani',
        primaryCrops: Array.isArray(primaryCrops) && primaryCrops.length > 0 ? primaryCrops : ['tomato'],
        soilType,
        irrigationType,
      });

      return res.json({
        success: true,
        user: result.user,
        profile: result.profile,
        farm: result.farm,
        message: 'Farmer profile completed successfully!',
      });
    } catch (err: any) {
      console.error('Error in AuthController.completeProfile:', err);
      return res.status(500).json({ success: false, error: err.message || 'Failed to complete profile' });
    }
  }

  public static getMe(req: Request, res: Response) {
    try {
      const token = getBearerToken(req);
      if (!token) {
        return res.status(401).json({ success: false, error: 'No token provided' });
      }

      const session = authStore.validateSession(token);
      if (!session.isValid || !session.user) {
        return res.status(401).json({ success: false, error: 'Invalid or expired session' });
      }

      return res.json({
        success: true,
        user: session.user,
        profile: session.profile,
        farm: session.farm,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: 'Server error checking authentication' });
    }
  }

  public static logout(req: Request, res: Response) {
    const token = getBearerToken(req);
    if (token) {
      authStore.invalidateSession(token);
    }
    return res.json({ success: true, message: 'Logged out successfully' });
  }

  public static updatePhone(req: Request, res: Response) {
    try {
      const token = getBearerToken(req);
      if (!token) {
        return res.status(401).json({ success: false, error: 'Authentication token is required' });
      }

      const session = authStore.validateSession(token);
      if (!session.isValid || !session.user) {
        return res.status(401).json({ success: false, error: 'Session expired' });
      }

      const { newPhone, code } = req.body;
      if (!newPhone || !code) {
        return res.status(400).json({ success: false, error: 'New phone number and verification code are required' });
      }

      const verification = authStore.verifyOtp(newPhone, code);
      if (!verification.success) {
        return res.status(400).json(verification);
      }

      const updateRes = authStore.updatePhoneNumber(session.user.id, verification.normalizedPhone);
      if (!updateRes.success) {
        return res.status(400).json(updateRes);
      }

      return res.json({
        success: true,
        user: updateRes.user,
        message: 'Mobile number updated and verified successfully!',
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Failed to update phone number' });
    }
  }
}
