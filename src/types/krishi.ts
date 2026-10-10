import { LandUnit } from '../utils/landMeasurement';

export interface Commodity {
  id: string;
  name: string;
  nepaliName: string;
  emoji?: string;
  category: 'perishable' | 'staple' | 'spices' | 'exotic';
  basePrice: number;
  currentPrice: number;
  previousClose: number;
  changeAbs: number;
  changePct: number;
  high: number;
  low: number;
  volume: number;
  vwap: number;
  direction: 'up' | 'down' | 'flat';
  daysToHarvest?: number;
  bestSeason?: string;
  risingReason?: string;
  fallingReason?: string;
  rsi: number;
  macd: number;
  macdSignal: number;
  macdHistogram: number;
  sma20: number;
  sma50: number;
  ema12: number;
  bbUpper: number;
  bbMiddle: number;
  bbLower: number;
  bbPosition: number;
  atr14: number;
  volatilityPct: number;
  sentiment: 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell';
  sentimentScore: number;
  signals: string[];
  yesterdayPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  unit?: string;
  unitNepali?: string;
  arrivalsTodayTons?: number;
  arrivalsYesterdayTons?: number;
  forecast7Day?: number;
  forecast14Day?: number;
  forecast30Day?: number;
  threeMonthForecast?: number;
  fiveMonthForecast?: number;
}

export interface OHLCV {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap: number;
  sma20?: number;
  sma50?: number;
  bbUpper?: number;
  bbLower?: number;
}

export interface ForecastPoint {
  date: string;
  predicted: number;
  lower: number;
  upper: number;
  confidence: number;
  momentum: number;
  seasonal: number;
  supply: number;
  // Legacy aliases maintained for backward compatibility
  prophet: number;
  arima: number;
  xgboost: number;
}

export interface ModelMetrics {
  modelName: string;
  mae: number;
  rmse: number;
  mape: number;
  r2?: number;
  sharpeRatio?: number;
  maxDrawdownPct?: number;
  winRatePct: number;
  directionAccuracyPct: number;
  sampleCount?: number;
  backtestPeriod?: string;
  volatilityRating?: 'Low' | 'Medium' | 'High' | 'Very High';
}

export interface ArbitrageOpportunity {
  commodity: string;
  commodityName: string;
  fromLocation: string;
  toLocation: string;
  type: 'cross_border' | 'domestic';
  borderPoint?: string;
  sourcePrice: number;
  targetPrice: number;
  transportCost: number;
  spoilageCost: number;
  customsCost: number;
  totalCost: number;
  netProfit: number;
  profitMarginPct: number;
  travelHours: number;
  route: string;
  riskScore: number;
  breakEvenVolumeKg: number;
  signal: 'strong_buy' | 'buy' | 'weak' | 'none' | 'avoid';
}

export interface DisruptionAlert {
  id: string;
  eventType: 'landslide' | 'highway_block' | 'flood' | 'fertilizer_shortage' | 'pest_outbreak' | 'subsidy' | 'strike' | 'export_ban' | 'weather_extreme' | 'transport_disruption';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  summary: string;
  affectedCommodities: string[];
  affectedRegions: string[];
  affectedRoutes: string[];
  priceImpactPct: number;
  supplyImpactPct: number;
  timeToImpactHours: number;
  durationDays: number;
  confidence: number;
  source: string;
  timestamp: string;
}

export interface FarmerRecommendation {
  rank: number;
  crop: string;
  cropDisplayName: string;
  nepaliName: string;
  plantingWeek: number;
  expectedHarvestWeek: number;
  daysToHarvest: number;
  expectedPricePerKg: number;
  expectedYieldKg: number;
  expectedRevenue: number;
  expectedProfit: number;
  inputCost: number;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidencePct: number;
  compositeScore: number;
  sharpeRatio: number;
  marketOutlook: string;
  keyRisks: string;
  mitigation: string;
}

export interface SellLocationAdvice {
  recommendation: 'sell_local' | 'ship_to_kathmandu' | 'ship_to_pokhara';
  reason: string;
  localPrice: number;
  targetPrice?: number;
  transportCost: number;
  spoilageCost: number;
  netRevenuePerKg: number;
  totalNetRevenue: number;
  timeToMarketHours: number;
}

export interface BugItem {
  id: string;
  file: string;
  severity: 'critical' | 'high' | 'medium';
  title: string;
  description: string;
  codeSnippetBad: string;
  codeSnippetFixed: string;
  impact: string;
}

export type PlatformRole = 'farmer' | 'trader' | 'cooperative' | 'government';

export type { LandUnit } from '../utils/landMeasurement';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  normalizedPhone?: string;
  phoneVerified?: boolean;
  status?: 'active' | 'pending_profile' | 'suspended' | 'deleted';
  preferredLanguage?: 'ne' | 'en';
  province?: string;
  district: string;
  municipality: string;
  ward?: string;
  locality?: string;
  landSizeRopani: number;
  landSize?: number;
  landUnit: LandUnit;
  farmName?: string;
  soilType?: string;
  irrigationType?: string;
  memberSince: string;
  cooperativeMembership?: string;
  primaryCrops: string[];
  totalEarningsGainNPR: number;
  profileCompletionPct?: number;
}

export interface PastPredictionTrackRecord {
  id: string;
  season: string;
  year: number;
  cropId: string;
  cropName: string;
  district: string;
  landSizeRopani: number;
  predictedPrice: number;
  actualPrice: number;
  accuracyPct: number;
  deltaPerKg: number;
  predictedProfit: number;
  actualProfit: number;
  status: 'harvested' | 'growing' | 'planned';
  notes: string;
}

export interface GroundTruthFeedback {
  id: string;
  farmerId: string;
  farmerName: string;
  district: string;
  cropId: string;
  cropName: string;
  harvestDate: string;
  actualPricePerKg: number;
  predictedPricePerKg: number;
  volumeSoldKg: number;
  buyerType: 'local_middleman' | 'kalimati_wholesaler' | 'pokhara_mandi' | 'cooperative' | 'hotel_direct';
  roadCondition: 'clear' | 'minor_delay' | 'severe_landslide';
  transportCostPaidPerKg: number;
  comments: string;
  timestamp: string;
  verified: boolean;
}

export interface GroupSellingPool {
  id: string;
  district: string;
  municipality: string;
  cropId: string;
  cropName: string;
  emoji: string;
  targetMarket: string;
  harvestWeek: string;
  totalTargetVolumeKg: number;
  currentPooledVolumeKg: number;
  participantCount: number;
  truckType: string;
  individualCostPerKg: number;
  pooledCostPerKg: number;
  savingsPerKg: number;
  status: 'forming' | 'ready_to_dispatch' | 'dispatched';
  organizerName: string;
  organizerPhone: string;
  departureDate: string;
  participants: {
    id: string;
    name: string;
    volumeKg: number;
    phone: string;
    pickupLocation: string;
  }[];
}

export interface TraderListing {
  id: string;
  farmerId: string;
  farmerName: string;
  district: string;
  municipality: string;
  cropId: string;
  cropName: string;
  emoji: string;
  harvestDate: string;
  quantityKg: number;
  askingPricePerKg: number;
  marketWholesaleRate: number;
  estimatedGrade: 'Grade A (Export/Banquet)' | 'Grade B (Standard Market)' | 'Grade C (Processing)';
  isOrganic: boolean;
  phone: string;
  status: 'available' | 'negotiating' | 'sold';
  postedAgo: string;
}

export interface CooperativeSummary {
  id: string;
  name: string;
  district: string;
  totalMembers: number;
  totalLandRopani: number;
  majorCrops: {
    cropId: string;
    cropName: string;
    totalEstYieldKg: number;
    estRevenueNPR: number;
  }[];
  coldStorageCapacityKg: number;
  coldStorageUsedKg: number;
  fertilizerStockBags: number;
}

export interface GovernmentSupplyForecast {
  district: string;
  cropId: string;
  cropName: string;
  predictedSupplyTons: number;
  localDemandTons: number;
  balanceStatus: 'surplus' | 'balanced' | 'deficit';
  deficitPct: number;
  riskLevel: 'low' | 'moderate' | 'critical';
  pricePressure: 'inflationary' | 'stable' | 'deflationary';
  mitigationAction: string;
}

export interface SimulatedFarmer {
  id: string;
  name: string;
  phone: string;
  district: string;
  ward: string;
  municipality: string;
  cropId: string;
  cropName: string;
  emoji: string;
  landSizeRopani: number;
  plantingDate: string;
  expectedHarvestWeek: string;
  harvestDateStr: string;
  daysToHarvest: number;
  estYieldKg: number;
  latOffset: number;
  lngOffset: number;
}

export interface FarmerMatchCluster {
  district: string;
  cropId: string;
  cropName: string;
  emoji: string;
  expectedHarvestWeek: string;
  matchedFarmers: SimulatedFarmer[];
  totalVolumeKg: number;
  farmerCount: number;
  targetMarket: string;
  distanceKm: number;
  soloCostPerKg: number;
  pooledCostPerKg: number;
  savingsPerKg: number;
  totalGroupSavingsNPR: number;
  truckType: string;
}

export interface GenericFarmer {
  id: string;
  name: string;
  crop: string;
  quantity_kg: number;
  location: {
    lat: number;
    lng: number;
    district_label: string;
  };
  harvest_window: {
    start_date: string;
    end_date: string;
  };
  price_reported: number;
  verified_by_count: number;
}

export interface GenericMarketPrice {
  crop: string;
  unit_price: number;
  currency: 'NPR';
  date: string;
  district_label: string;
}

export interface GenericPoolingMatch {
  crop: string;
  farmers: GenericFarmer[];
  combined_quantity_kg: number;
  solo_transport_cost_per_kg: number;
  pooled_transport_cost_per_kg: number;
  savings_per_kg: number;
}

export interface PitchGuideStep {
  minute: number;
  title: string;
  timing: string;
  hook: string;
  talkingPoints: string[];
  keyQuote: string;
  targetTab: 'home' | 'calculator' | 'prices' | 'sell';
  visualFocus: string;
}

export interface TransparencyItem {
  category: string;
  type: 'live' | 'simulated' | 'hybrid';
  title: string;
  sourceOrMethod: string;
  details: string;
  honestyNote: string;
}

export interface CustomFarmerInput {
  landSize: 'less_than_1' | '1_to_5' | '5_plus';
  lastSeasonYieldKg?: number | null;
  recentLocalPrice?: number | null;
  soilIrrigation: 'irrigated' | 'rain_fed';
  isApplied: boolean;
  notes?: string;
}

export interface AuthUser {
  id?: string;
  uid: string;
  phone: string;
  normalizedPhone?: string;
  phoneVerified?: boolean;
  status?: 'active' | 'pending_profile' | 'suspended' | 'deleted';
  name: string;
  preferredLanguage?: 'ne' | 'en';
  province?: string;
  district: string;
  municipality?: string;
  ward?: string;
  locality?: string;
  landSize?: number;
  landUnit?: LandUnit;
  landSizeRopani?: number;
  farmName?: string;
  primaryCrops: string[];
  profileCompletionPct?: number;
  isGuest: boolean;
  token?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedAction?: {
    type: 'navigate' | 'calculate' | 'pool';
    tab?: string;
    params?: Record<string, any>;
    label: string;
  };
  toolCallData?: {
    toolName: string;
    resultSummary: string;
  };
}

export interface MarketplaceListing {
  id: string;
  cropId: string;
  cropName: string;
  nepaliName: string;
  emoji: string;
  crop?: string;
  farmerId?: string;
  farmerName: string;
  farmerPhone?: string;
  village: string;
  municipality: string;
  district: string;
  quantityKg: number;
  availableKg?: number;
  askingPricePerKg: number;
  pricePerKg?: number;
  marketWholesalePrice: number;
  harvestWindow: string;
  readyStatus: 'ready_now' | 'ready_this_month';
  qualityGrade: 'Grade A' | 'Grade B' | 'Organic Certified' | 'Export';
  verified: boolean;
  rating: number;
  reviewsCount: number;
  photoUrl?: string;
  pickupHub: string;
  description: string;
  isOrganic?: boolean;
  status?: 'active' | 'sold' | 'reserved' | 'cancelled';
  allowPooling?: boolean;
  created_at?: string;
  createdAt?: string;
}

export type AccountingType = 'money_in' | 'money_out';

export type AccountingCategory =
  | 'sale'
  | 'seed'
  | 'fertilizer'
  | 'transport'
  | 'labor'
  | 'pesticide'
  | 'equipment'
  | 'irrigation'
  | 'other';

export interface BuyerDemandItem {
  id: string;
  buyerName: string;
  buyerType: 'Wholesale Distributor' | 'Hotel & Restaurant Network' | 'Supermarket Chain' | 'Processing Plant';
  cropId: string;
  cropName: string;
  nepaliName: string;
  volumeNeededKg: number;
  targetPriceRange: string;
  minPrice: number;
  maxPrice: number;
  deliveryLocation: string;
  district: string;
  urgency: 'Needed in 2 Days' | 'Immediate' | 'Next Week';
  verifiedBuyer: boolean;
  contactPhone?: string;
  notes?: string;
}

export interface DecisionInsight {
  cropId: string;
  cropName: string;
  nepaliName: string;
  currentPrice: number;
  priceTrendPct: number;
  priceTrendDirection: 'up' | 'down' | 'flat';
  daysToHarvest: number;
  expectedYieldKg: number;
  buyerDemandLevel: 'High' | 'Moderate' | 'Low';
  buyerMatchesCount: number;
  recommendation: 'Prepare to sell' | 'Hold & wait for price peak' | 'Pool freight immediately' | 'Harvest early';
  recommendationNe: string;
  whyReasons: string[];
  whyReasonsNe: string[];
  confidence: 'High' | 'Moderate' | 'Low';
  confidenceScore: number;
  observedRange: { min: number; max: number; avg: number };
  projectedRange: { min: number; max: number; expected: number };
  projectedNetMargin: number;
  suggestedAction: {
    primaryLabel: string;
    primaryTab: string;
    secondaryLabel: string;
    secondaryTab: string;
  };
}

export interface FarmAccountingEntry {
  id: string;
  type: AccountingType;
  amount: number;
  category: AccountingCategory;
  categoryLabel: string;
  date: string;
  note?: string;
  cropId?: string;
  cropName?: string;
  source?: 'sell_pool' | 'manual' | 'ai_voice' | 'ai_auto';
  quantityKg?: number;
}

export interface ProductionRecord {
  id: string;
  cropId: string;
  cropName: string;
  cropEmoji: string;
  quantityKg: number;
  plotName: string;
  date: string;
  grade?: 'Grade A' | 'Grade B' | 'Standard';
  notes?: string;
}

export type ResourceCategory = 'seeds' | 'fertilizer' | 'pesticide' | 'tools' | 'irrigation' | 'other';

export interface ResourceInventoryItem {
  id: string;
  name: string;
  category: ResourceCategory;
  quantity: number;
  unit: string;
  lowStockThreshold: number;
  lastUpdated: string;
  notes?: string;
  location?: string;
}
