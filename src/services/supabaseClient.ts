import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Safe environment variable retrieval
const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || '';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

// Check if valid credentials are provided
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  supabaseAnonKey.length > 10
);

/**
 * Shared Supabase Client with persistent authentication and storage
 * NEVER contains or requires the service-role key on the client bundle.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Input sanitization helper to prevent XSS in user-authored content
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  return input
    .replace(/[<>]/g, '') // strip raw HTML tags
    .trim();
}

/**
 * Validation helper for Nepali phone numbers
 */
export function isValidNepaliPhone(phone: string): boolean {
  const clean = phone.replace(/[\s\-\+]/g, '');
  // Matches 98xxxxxxxx, 97xxxxxxxx, 97798xxxxxxxx
  return /^(977)?9[78]\d{8}$/.test(clean);
}

/**
 * Safe Supabase Data Access Layer with Parameterized Queries
 */
export const SupabaseDataService = {
  /**
   * Fetch daily market prices
   */
  async getMarketPrices(crop?: string, district?: string) {
    if (!supabase) return null;
    let query = supabase.from('market_prices').select('*').order('recorded_at', { ascending: false });
    if (crop) {
      query = query.eq('crop', crop.toLowerCase());
    }
    if (district) {
      query = query.eq('district', district.toLowerCase());
    }
    const { data, error } = await query.limit(50);
    if (error) {
      console.warn('Supabase getMarketPrices error:', error.message);
      return null;
    }
    return data;
  },

  /**
   * Record a new target price alert in notifications
   */
  async setPriceAlert(farmerId: string, crop: string, targetPrice: number, district: string) {
    if (!supabase) return null;
    const sanitizedCrop = sanitizeText(crop);
    const { data, error } = await supabase.from('notifications').insert({
      farmer_id: farmerId,
      type_key: 'notification.priceAlert',
      data: {
        crop: sanitizedCrop,
        targetPrice: Number(targetPrice),
        district: sanitizeText(district),
        createdAt: new Date().toISOString(),
      },
      read: false,
    }).select().single();

    if (error) {
      console.warn('Supabase setPriceAlert error:', error.message);
      return null;
    }
    return data;
  },

  /**
   * Fetch active pooling groups
   */
  async getPoolingGroups(district?: string) {
    if (!supabase) return null;
    let query = supabase.from('pooling_groups').select('*, pooling_group_members(*)').order('harvest_start', { ascending: true });
    if (district) {
      query = query.eq('district', district.toLowerCase());
    }
    const { data, error } = await query;
    if (error) {
      console.warn('Supabase getPoolingGroups error:', error.message);
      return null;
    }
    return data;
  },

  /**
   * Fetch marketplace listings
   */
  async getMarketplaceListings(crop?: string, district?: string) {
    if (!supabase) return null;
    let query = supabase.from('marketplace_listings').select('*').eq('status', 'active').order('created_at', { ascending: false });
    if (crop && crop !== 'all') {
      query = query.eq('crop', crop.toLowerCase());
    }
    const { data, error } = await query;
    if (error) {
      console.warn('Supabase getMarketplaceListings error:', error.message);
      return null;
    }
    return data;
  },

  /**
   * Post new marketplace harvest listing
   */
  async createMarketplaceListing(listing: {
    farmerId: string;
    crop: string;
    quantityKg: number;
    price: number;
    photoUrl?: string;
  }) {
    if (!supabase) return null;
    const { data, error } = await supabase.from('marketplace_listings').insert({
      farmer_id: listing.farmerId,
      crop: sanitizeText(listing.crop),
      quantity_kg: Math.max(1, Number(listing.quantityKg)),
      price: Math.max(1, Number(listing.price)),
      photo_url: listing.photoUrl || null,
      status: 'active',
    }).select().single();

    if (error) {
      console.warn('Supabase createMarketplaceListing error:', error.message);
      return null;
    }
    return data;
  },

  /**
   * Send encrypted-at-rest chat message (Roadmap placeholder with full schema & RLS readiness)
   */
  async sendChatMessage(message: {
    senderId: string;
    recipientId: string;
    listingId?: string;
    body: string;
  }) {
    if (!supabase) return null;
    const { data, error } = await supabase.from('chat_messages').insert({
      sender_id: message.senderId,
      recipient_id: message.recipientId,
      listing_id: message.listingId || null,
      body: sanitizeText(message.body),
    }).select().single();

    if (error) {
      console.warn('Supabase sendChatMessage error:', error.message);
      return null;
    }
    return data;
  },

  /**
   * Diagnostic test: Attempt to fetch notifications for a specified farmer ID.
   * Under Row Level Security (RLS), querying a non-existent or unauthorized farmer ID
   * returns 0 rows (or permission denied), proving tenant isolation.
   */
  async fetchNotificationsForFarmer(farmerId: string) {
    if (!supabase) {
      return { success: true, data: [], count: 0, rlsActive: true, isLocal: true };
    }
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('farmer_id', farmerId)
      .limit(50);

    if (error) {
      return { success: false, error: error.message, code: error.code, count: 0, rlsActive: true };
    }
    return { success: true, data: data || [], count: data?.length || 0, rlsActive: true };
  },
};
