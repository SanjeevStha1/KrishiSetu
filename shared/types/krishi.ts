// Shared Domain Types & Contracts for KrishiSetu (Frontend & Backend)

export type SupportedLanguage = 'en' | 'ne';
export type AppTheme = 'dark' | 'light';

export interface Commodity {
  id: string;
  name: string;
  nameNepali: string;
  category: 'vegetable' | 'cereal' | 'cash_crop' | 'fruit' | 'spice';
  categoryNepali: string;
  currentPrice: number;
  minPrice: number;
  maxPrice: number;
  yesterdayPrice: number;
  unit: string;
  unitNepali: string;
  arrivalsTodayTons: number;
  arrivalsYesterdayTons: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidenceScore: number;
  forecast7Day: number;
  forecast14Day: number;
  forecast30Day: number;
  threeMonthForecast?: number;
  fiveMonthForecast?: number;
  seasonalityScore: number;
  harvestWindow: string;
  bestSellingMandi: string;
  bestSellingMandiNepali: string;
  interDistrictArbitrageNPR: number;
  image: string;
  color: string;
  emoji: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  district: string;
  municipality?: string;
  ward?: string;
  locality?: string;
  landSizeRopani: number;
  landSizeBigha?: number;
  landUnit?: string;
  primaryCrops: string[];
  preferredLanguage: SupportedLanguage;
  notificationsEnabled: boolean;
  smsAlertsEnabled: boolean;
  targetMandi: string;
  experienceYears: number;
}

export interface AuthUser {
  id: string;
  uid?: string;
  name: string;
  phone: string;
  normalizedPhone?: string;
  province?: string;
  district: string;
  municipality?: string;
  ward?: string;
  locality?: string;
  landSize?: number;
  landUnit?: string;
  landSizeRopani?: number;
  farmName?: string;
  primaryCrops: string[];
  preferredLanguage?: SupportedLanguage;
  isRegistered?: boolean;
  status?: 'active' | 'pending_profile' | 'suspended';
  role?: 'farmer' | 'buyer';
  profileCompletionPct?: number;
  isGuest?: boolean;
  phoneVerified?: boolean;
  createdAt?: string;
  created_at?: string;
}

export interface Farm {
  id: string;
  farmer_id: string;
  farm_name: string;
  land_size: number;
  land_unit: string;
  land_size_ropani_eqv: number;
  soil_type?: string;
  irrigation_type?: string;
  primary_crops: string[];
  created_at?: string;
  updated_at?: string;
}

export interface FarmRecordItem {
  id: string;
  crop: string;
  cropName: string;
  record_type: 'revenue' | 'expense' | 'harvest' | 'yield';
  category: string;
  amount: number;
  source: 'manual' | 'calculator' | 'sell_pool' | 'harvest_log' | 'marketplace' | 'ai_simulation';
  quantityKg?: number;
  pricePerKg?: number;
  note?: string;
  recorded_at: string;
}

export interface CustomFarmerInput {
  cropId: string;
  landAreaRopani: number;
  landAreaBigha?: number;
  selectedLandUnit?: string;
  expectedYieldKg: number;
  inputCostsNPR: number;
  targetSellingPriceNPR: number;
  plannedHarvestDate: string;
  chosenMandiId: string;
  enableFreightPooling: boolean;
  notes?: string;
}

export interface MarketplaceListing {
  id: string;
  farmerId?: string;
  farmerName: string;
  farmerPhone?: string;
  crop: string;
  cropId?: string;
  cropName: string;
  nepaliName?: string;
  emoji?: string;
  quantityKg: number;
  availableKg?: number;
  pricePerKg?: number;
  askingPricePerKg?: number;
  marketWholesalePrice?: number;
  minOrderKg?: number;
  district: string;
  location?: string;
  village?: string;
  municipality?: string;
  harvestDate?: string;
  harvestWindow?: string;
  readyStatus?: 'ready_now' | 'ready_this_month';
  availableUntil?: string;
  qualityGrade: 'Grade A' | 'Grade B' | 'Export' | 'Organic Certified';
  isOrganic?: boolean;
  status?: 'active' | 'sold' | 'reserved' | 'cancelled';
  photoUrl?: string;
  allowPooling?: boolean;
  bidsCount?: number;
  verified?: boolean;
  rating?: number;
  reviewsCount?: number;
  pickupHub?: string;
  description?: string;
  created_at?: string;
  createdAt?: string;
}

export interface MarketDisruption {
  id: string;
  title: string;
  titleNepali: string;
  type: 'road_block' | 'festival_demand' | 'weather_alert' | 'border_tariff' | 'fuel_hike';
  severity: 'high' | 'medium' | 'low';
  impactedCrops: string[];
  impactedDistricts: string[];
  description: string;
  descriptionNepali: string;
  actionRecommendation: string;
  actionRecommendationNepali: string;
  reportedDate: string;
}

export interface CalculatorEstimate {
  cropId: string;
  district: string;
  quantityKg: number;
  expectedSalePrice: number;
  inputCostPerKg: number;
  seedCost: number;
  fertilizerCost: number;
  laborCost: number;
  irrigationCost: number;
  soloTransportCostPerKg: number;
  reasoningSummary: string;
}

export interface SimulatedFarmer {
  id: string;
  name: string;
  phone: string;
  district: string;
  location: string;
  crop: string;
  cropName: string;
  volumeKg: number;
  targetMandi: string;
  harvestDate: string;
  poolingStatus: 'ready' | 'pending' | 'dispatched';
}
