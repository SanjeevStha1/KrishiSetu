import { pgTable, serial, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

// 1. Registered Farmer Users & Profiles
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID / Unique Phone ID
  name: text('name').notNull(),
  phone: text('phone'),
  district: text('district').notNull().default('chitwan'),
  municipality: text('municipality'),
  ward: text('ward'),
  locality: text('locality'),
  farmName: text('farm_name'),
  landSize: text('land_size').default('2.0'),
  landUnit: text('land_unit').default('ropani'),
  primaryCrops: text('primary_crops').default('["tomato","potato"]'),
  preferredLanguage: text('preferred_language').default('ne'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 2. Farm Accounting Ledger Entries (आय-व्यय / Income & Expenses)
export const farmLedger = pgTable('farm_ledger', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  recordType: text('record_type').notNull(), // 'revenue' | 'expense' | 'pooling_savings'
  category: text('category').notNull(),      // 'sale', 'fertilizer', 'seed', 'labor', 'freight', 'other'
  categoryLabel: text('category_label'),
  cropId: text('crop_id'),
  cropName: text('crop_name'),
  amount: integer('amount').notNull(),
  quantityKg: integer('quantity_kg'),
  note: text('note'),
  recordedAt: timestamp('recorded_at').defaultNow(),
});

// 3. Marketplace Harvest Lots (बजार लटहरू)
export const marketplaceListings = pgTable('marketplace_listings', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  farmerName: text('farmer_name').notNull(),
  farmerPhone: text('farmer_phone').notNull(),
  cropId: text('crop_id').notNull(),
  cropName: text('crop_name').notNull(),
  nepaliName: text('nepali_name'),
  emoji: text('emoji').default('🌾'),
  quantityKg: integer('quantity_kg').notNull(),
  pricePerKg: integer('price_per_kg').notNull(),
  district: text('district').notNull(),
  village: text('village'),
  pickupHub: text('pickup_hub'),
  qualityGrade: text('quality_grade').default('Grade A'),
  isOrganic: boolean('is_organic').default(false),
  harvestWindow: text('harvest_window').default('Ready Now'),
  status: text('status').default('active'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 4. SMS & Push Price Alert Subscriptions (मूल्य सूचना)
export const priceAlerts = pgTable('price_alerts', {
  id: serial('id').primaryKey(),
  phone: text('phone').notNull(),
  districtId: text('district_id').notNull().default('chitwan'),
  cropId: text('crop_id').notNull(),
  cropName: text('crop_name').notNull(),
  targetPrice: integer('target_price').notNull(),
  direction: text('direction').notNull().default('above'), // 'above' | 'below'
  channel: text('channel').notNull().default('sms'), // 'sms' | 'in_app' | 'both'
  active: boolean('active').default(true),
  lastTriggeredAt: timestamp('last_triggered_at'),
  lastTriggeredPrice: integer('last_triggered_price'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 4b. SMS Telecom Gateway Delivery & Trigger Audit Logs (एसएमएस पठाएको अभिलेख)
export const smsDeliveryLogs = pgTable('sms_delivery_logs', {
  id: serial('id').primaryKey(),
  phone: text('phone').notNull(),
  districtId: text('district_id').notNull().default('chitwan'),
  cropId: text('crop_id'),
  alertId: integer('alert_id'),
  carrier: text('carrier').notNull(),
  provider: text('provider').notNull().default('sandbox_queue'), // 'sparrow_sms' | 'aakash_sms' | 'sandbox_queue'
  deliveryStatus: text('delivery_status').notNull().default('queued_sandbox'), // 'delivered' | 'queued_sandbox' | 'failed'
  simulated: boolean('simulated').notNull().default(true),
  messageId: text('message_id').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 5. Daily Mandi Wholesale Price Archive (कालीमाटी तथा प्रादेशिक बजार दर अभिलेख)
export const dailyMarketPrices = pgTable('daily_market_prices', {
  id: serial('id').primaryKey(),
  cropId: text('crop_id').notNull(),
  cropName: text('crop_name').notNull(),
  mandiName: text('mandi_name').notNull().default('Kalimati Mandi, Kathmandu'),
  minPrice: integer('min_price').notNull(),
  maxPrice: integer('max_price').notNull(),
  avgPrice: integer('avg_price').notNull(),
  source: text('source').default('live'),
  recordedDate: text('recorded_date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 6. Crowd-Verified 77-District Local Mandi & Farmgate Price Reports (स्थानीय मन्डी तथा खेतबारी दर)
export const districtPriceReports = pgTable('district_price_reports', {
  id: serial('id').primaryKey(),
  districtId: text('district_id').notNull(),
  cropId: text('crop_id').notNull(),
  marketName: text('market_name').notNull(),
  priceType: text('price_type').notNull().default('wholesale'), // 'wholesale' | 'farmgate'
  pricePerKg: integer('price_per_kg').notNull(),
  reporterName: text('reporter_name').notNull(),
  reporterRole: text('reporter_role').notNull().default('farmer'), // 'farmer' | 'cooperative' | 'mandi_agent'
  reporterPhone: text('reporter_phone'),
  recordedDate: text('recorded_date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
