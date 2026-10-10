import {
  Commodity,
  CustomFarmerInput,
  MarketplaceListing,
  SimulatedFarmer,
} from '../types/krishi';
import {
  COMMODITY_SEEDS,
  DISTRICT_LIST,
  SIMULATED_FARMERS,
  generateCommodityList,
  generateHistoricalOHLCV,
} from '../data/agriData';

// In-memory session store for farmer inputs and state
const SESSION_STORAGE_KEY = 'krishisetu_farmer_inputs_v3';
const SALES_STORAGE_KEY = 'krishisetu_confirmed_sales_v1';
const POOLS_STORAGE_KEY = 'krishisetu_active_pools_v1';

export interface ConfirmedSaleRecord {
  id: string;
  cropId: string;
  cropName: string;
  emoji: string;
  quantityKg: number;
  pricePerKg: number;
  totalGrossNPR: number;
  district: string;
  soldAt: string;
  buyerType: string;
  status: 'confirmed' | 'dispatched' | 'settled';
}

export interface UserPoolItem {
  id: string;
  cropId: string;
  cropName: string;
  emoji: string;
  district: string;
  municipality: string;
  targetMarket: string;
  targetVolumeKg: number;
  currentVolumeKg: number;
  farmerCount: number;
  maxFarmers: number;
  targetPricePerKg: number;
  soloCostPerKg: number;
  pooledCostPerKg: number;
  savingsPerKg: number;
  departureWindow: string;
  pickupLocation: string;
  organizerName: string;
  isUserOrganizer: boolean;
  isUserJoined: boolean;
  userContributionKg: number;
  invitedFarmers: Array<{
    id: string;
    name: string;
    phone: string;
    cropName: string;
    status: 'invited' | 'accepted' | 'pending';
  }>;
  status: 'forming' | 'ready_to_dispatch' | 'dispatched';
}

function loadStoredInputs(): Record<string, CustomFarmerInput> {
  try {
    const raw = typeof window !== 'undefined' ? window.sessionStorage.getItem(SESSION_STORAGE_KEY) : null;
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveStoredInputs(data: Record<string, CustomFarmerInput>) {
  try {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
    }
  } catch (e) {
    // Ignore storage quota or iframe errors
  }
}

function loadStoredSales(): ConfirmedSaleRecord[] {
  try {
    const raw = typeof window !== 'undefined' ? window.sessionStorage.getItem(SALES_STORAGE_KEY) : null;
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveStoredSales(data: ConfirmedSaleRecord[]) {
  try {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(data));
    }
  } catch (e) {
    // ignore
  }
}

function loadStoredPools(): UserPoolItem[] {
  try {
    const raw = typeof window !== 'undefined' ? window.sessionStorage.getItem(POOLS_STORAGE_KEY) : null;
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  // Default seeded pools for realism
  return [
    {
      id: 'pool-seed-1',
      cropId: 'tomato',
      cropName: 'Tomato (Local)',
      emoji: '🍅',
      district: 'chitwan',
      municipality: 'Bharatpur-11 / Ratnanagar',
      targetMarket: 'Kathmandu Kalimati Terminal',
      targetVolumeKg: 1000,
      currentVolumeKg: 650,
      farmerCount: 4,
      maxFarmers: 6,
      targetPricePerKg: 46,
      soloCostPerKg: 8.5,
      pooledCostPerKg: 3.4,
      savingsPerKg: 5.1,
      departureWindow: 'Tomorrow at 04:00 AM',
      pickupLocation: 'Bharatpur-11 Ward Chowk',
      organizerName: 'Ram Bahadur Thapa',
      isUserOrganizer: false,
      isUserJoined: false,
      userContributionKg: 0,
      invitedFarmers: [
        { id: 'f-101', name: 'Krishna Maya Tamang', phone: '9845012345', cropName: 'Tomato', status: 'accepted' },
        { id: 'f-102', name: 'Sita Devi Sharma', phone: '9845098765', cropName: 'Tomato', status: 'accepted' },
        { id: 'f-103', name: 'Gopal Shrestha', phone: '9845045678', cropName: 'Tomato', status: 'accepted' },
      ],
      status: 'forming',
    },
    {
      id: 'pool-seed-2',
      cropId: 'cauliflower',
      cropName: 'Cauliflower',
      emoji: '🥦',
      district: 'chitwan',
      municipality: 'Rampur / Geetanagar',
      targetMarket: 'Kathmandu Kalimati Terminal',
      targetVolumeKg: 1500,
      currentVolumeKg: 1200,
      farmerCount: 5,
      maxFarmers: 7,
      targetPricePerKg: 32,
      soloCostPerKg: 8.5,
      pooledCostPerKg: 3.2,
      savingsPerKg: 5.3,
      departureWindow: 'Thursday at 04:30 AM',
      pickupLocation: 'Rampur Agri Gate',
      organizerName: 'Bishnu Prasad',
      isUserOrganizer: false,
      isUserJoined: false,
      userContributionKg: 0,
      invitedFarmers: [],
      status: 'ready_to_dispatch',
    },
  ];
}

function saveStoredPools(data: UserPoolItem[]) {
  try {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(POOLS_STORAGE_KEY, JSON.stringify(data));
    }
  } catch (e) {
    // ignore
  }
}

let inMemoryCustomInputs: Record<string, CustomFarmerInput> = loadStoredInputs();
let inMemorySales: ConfirmedSaleRecord[] = loadStoredSales();
let inMemoryPools: UserPoolItem[] = loadStoredPools();

// Simulated Marketplace Seed Data (Direct Farmer-to-Buyer listings)
export const INITIAL_MARKETPLACE_LISTINGS: MarketplaceListing[] = [
  {
    id: 'mkt-1',
    cropId: 'tomato',
    cropName: 'Tomato (Local)',
    nepaliName: 'गोलभेडा',
    emoji: '🍅',
    farmerName: 'Ram Bahadur Thapa',
    village: 'Gitanagar Chowk',
    municipality: 'Bharatpur-11',
    district: 'chitwan',
    quantityKg: 850,
    askingPricePerKg: 38,
    marketWholesalePrice: 42,
    harvestWindow: 'Ready in 3 Days (Wed)',
    readyStatus: 'ready_now',
    qualityGrade: 'Grade A',
    verified: true,
    rating: 4.9,
    reviewsCount: 14,
    pickupHub: 'Bharatpur Highway Hub',
    description: 'Crisp, greenhouse-protected local tomatoes. Picked fresh at dawn; uniform color and high shelf-life.',
  },
  {
    id: 'mkt-2',
    cropId: 'cauliflower',
    cropName: 'Cauliflower (Snowball)',
    nepaliName: 'काउली',
    emoji: '🥦',
    farmerName: 'Sita Devi Sharma',
    village: 'Rampur Tole',
    municipality: 'Bharatpur-15',
    district: 'chitwan',
    quantityKg: 1200,
    askingPricePerKg: 22,
    marketWholesalePrice: 24,
    harvestWindow: 'Harvesting Today & Tomorrow',
    readyStatus: 'ready_now',
    qualityGrade: 'Organic Certified',
    verified: true,
    rating: 5.0,
    reviewsCount: 22,
    pickupHub: 'Rampur Agri Cooperative Gate',
    description: 'Completely pesticide-free white heads. Ideal for bulk vegetable retailers and Kathmandu restaurant orders.',
  },
  {
    id: 'mkt-3',
    cropId: 'potato',
    cropName: 'Potato (Red Cardinal)',
    nepaliName: 'रातो आलु',
    emoji: '🥔',
    farmerName: 'Bishnu Prasad Adhikari',
    village: 'Panchkhal Bazar',
    municipality: 'Panchkhal-4',
    district: 'kavre',
    quantityKg: 2500,
    askingPricePerKg: 29,
    marketWholesalePrice: 32,
    harvestWindow: 'Ready in 10 Days',
    readyStatus: 'ready_this_month',
    qualityGrade: 'Grade A',
    verified: true,
    rating: 4.8,
    reviewsCount: 9,
    pickupHub: 'Araniko Highway Km 42',
    description: 'Dry-stored red potatoes with excellent curing. Graded above 45mm diameter.',
  },
  {
    id: 'mkt-4',
    cropId: 'cabbage',
    cropName: 'Cabbage (Green Express)',
    nepaliName: 'बन्दा',
    emoji: '🥬',
    farmerName: 'Krishna Maya Tamang',
    village: 'Malekhu Riverside',
    municipality: 'Benighat-3',
    district: 'dhading',
    quantityKg: 1400,
    askingPricePerKg: 23,
    marketWholesalePrice: 26,
    harvestWindow: 'Ready in 5 Days',
    readyStatus: 'ready_now',
    qualityGrade: 'Grade B',
    verified: true,
    rating: 4.7,
    reviewsCount: 11,
    pickupHub: 'Malekhu Bridge Checkpoint',
    description: 'Dense, tight heads grown along Trishuli fertile alluvial terraces. Fast road access to KTM.',
  },
  {
    id: 'mkt-5',
    cropId: 'capsicum',
    cropName: 'Capsicum (Bell Pepper)',
    nepaliName: 'भेडे खुर्सानी',
    emoji: '🫑',
    farmerName: 'Prem Gurung',
    village: 'Hemja Valley',
    municipality: 'Pokhara-25',
    district: 'pokhara',
    quantityKg: 400,
    askingPricePerKg: 54,
    marketWholesalePrice: 58,
    harvestWindow: 'Ready Next Monday',
    readyStatus: 'ready_now',
    qualityGrade: 'Grade A',
    verified: true,
    rating: 4.9,
    reviewsCount: 18,
    pickupHub: 'Hemja Mandi Collection Point',
    description: 'Thick-walled deep green bell peppers cultivated in temperature-controlled polyhouse tunnels.',
  },
  {
    id: 'mkt-6',
    cropId: 'ginger',
    cropName: 'Fresh Ginger (Bose)',
    nepaliName: 'अदुवा',
    emoji: '🫚',
    farmerName: 'Dhan Maya Rai',
    village: 'Tansen Hill Ward 2',
    municipality: 'Tansen-2',
    district: 'palpa',
    quantityKg: 1800,
    askingPricePerKg: 78,
    marketWholesalePrice: 85,
    harvestWindow: 'Ready in 2 Weeks',
    readyStatus: 'ready_this_month',
    qualityGrade: 'Organic Certified',
    verified: true,
    rating: 5.0,
    reviewsCount: 31,
    pickupHub: 'Siddhartha Highway Km 18',
    description: 'High gingerol content, low fiber rhizomes. Excellent for export cleaning or essential oil extraction.',
  },
  {
    id: 'mkt-7',
    cropId: 'beans',
    cropName: 'French Beans',
    nepaliName: 'सिमी',
    emoji: '🫘',
    farmerName: 'Gopal Shrestha',
    village: 'Palung Hill',
    municipality: 'Thaha-3',
    district: 'makwanpur',
    quantityKg: 650,
    askingPricePerKg: 44,
    marketWholesalePrice: 48,
    harvestWindow: 'Ready in 4 Days',
    readyStatus: 'ready_now',
    qualityGrade: 'Grade A',
    verified: true,
    rating: 4.8,
    reviewsCount: 8,
    pickupHub: 'Tribhuvan Highway Junction',
    description: 'Crisp stringless green beans picked at tender stage. High altitude mountain freshness.',
  },
];

// Helper delay to simulate clean realistic network latency (triggers UI skeletons)
const delay = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * KrishiSetu Service Layer API
 */
export const KrishiApi = {
  /**
   * Fetch wholesale commodity prices and market list
   */
  async getMarketPrices(selectedDistrict?: string): Promise<Commodity[]> {
    await delay(180);
    return generateCommodityList();
  },

  /**
   * Fetch historical OHLCV chart records for a crop
   */
  async getCropPriceHistory(cropId: string, days = 42) {
    await delay(160);
    return generateHistoricalOHLCV(cropId, days).map((pt) => ({
      date: pt.date.slice(5), // 'MM-DD'
      price: pt.close,
      high: pt.high,
      low: pt.low,
      volume: pt.volume,
    }));
  },

  /**
   * Compute decision recommendation, merging base time-series with custom farmer input
   */
  async getDecisionRecommendation(
    cropId: string,
    districtId: string,
    quantityKg: number,
    customInput?: CustomFarmerInput
  ) {
    await delay(240);

    const seed = COMMODITY_SEEDS.find((s) => s.id === cropId) || COMMODITY_SEEDS[0];
    const districtObj = DISTRICT_LIST.find((d) => d.id.toLowerCase() === districtId.toLowerCase()) || DISTRICT_LIST[0];

    const baseWholesale = seed.basePrice;
    let expectedMinPrice = Math.round(baseWholesale * 0.88);
    let expectedAvgPrice = Math.round(baseWholesale * 1.08);
    let expectedMaxPrice = Math.round(baseWholesale * 1.28);

    let adjustmentNote = '';
    let discrepancyWarning = '';
    let isAdjusted = false;

    // Merge custom farmer input if provided & applied
    if (customInput && customInput.isApplied) {
      isAdjusted = true;

      // 1. Soil & Irrigation adjustment
      if (customInput.soilIrrigation === 'irrigated') {
        // Irrigated farms get 3-5% better quality grade realization
        expectedAvgPrice = Math.round(expectedAvgPrice * 1.04);
        expectedMaxPrice = Math.round(expectedMaxPrice * 1.05);
      } else {
        // Rain-fed has wider downside band
        expectedMinPrice = Math.round(expectedMinPrice * 0.95);
      }

      // 2. Land size scale adjustments
      if (customInput.landSize === '5_plus') {
        // Bulk volume gets steady institutional contract pricing
        expectedAvgPrice = Math.round(expectedAvgPrice * 0.98);
      } else if (customInput.landSize === 'less_than_1') {
        // Micro-plots often capture local retail / village haat premium
        expectedAvgPrice = Math.round(expectedAvgPrice * 1.03);
      }

      // 3. Recent local price observation discrepancy check (>15%)
      if (customInput.recentLocalPrice && customInput.recentLocalPrice > 0) {
        const farmerObserved = customInput.recentLocalPrice;
        const diffPct = Math.round(((farmerObserved - expectedAvgPrice) / expectedAvgPrice) * 100);

        if (Math.abs(diffPct) > 15) {
          if (diffPct > 15) {
            discrepancyWarning = `Your reported price (Rs ${farmerObserved}/kg) is ${diffPct}% higher than nearby wholesale data — this could reflect a local retail premium or a different crop grade. Recommendation shown is anchored on wholesale Mandi trends.`;
          } else {
            discrepancyWarning = `Your reported price (Rs ${farmerObserved}/kg) is ${Math.abs(diffPct)}% lower than central wholesale rates — transport pooling to Kathmandu/Pokhara can capture higher margins.`;
          }
          // Slight blend towards farmer observation (20% weight) without completely distorting model
          expectedAvgPrice = Math.round(expectedAvgPrice * 0.8 + farmerObserved * 0.2);
          expectedMinPrice = Math.min(expectedMinPrice, Math.round(farmerObserved * 0.9));
          expectedMaxPrice = Math.max(expectedMaxPrice, Math.round(farmerObserved * 1.1));
        }
      }

      adjustmentNote = 'Adjusted using your reported land size, irrigation profile, and local price observation.';
    }

    const totalProjectedRevenue = Math.round(quantityKg * expectedAvgPrice);
    const minProjectedRevenue = Math.round(quantityKg * expectedMinPrice);
    const maxProjectedRevenue = Math.round(quantityKg * expectedMaxPrice);

    const isHighProfit = expectedAvgPrice >= 40;
    const recommendationSentence = isHighProfit
      ? `Good time to plant ${seed.name} — high projected demand during harvest window in ${seed.bestSeason}.`
      : `Moderate return expected for ${seed.name} — consider staggered planting for the ${seed.bestSeason} window.`;

    const baseReasoning = `Based on last 3 years' seasonal pattern and this week's prices from Kalimati wholesale arrivals.`;

    return {
      crop: seed,
      district: districtObj,
      quantityKg,
      expectedMinPrice,
      expectedAvgPrice,
      expectedMaxPrice,
      totalProjectedRevenue,
      minProjectedRevenue,
      maxProjectedRevenue,
      recommendationSentence,
      baseReasoning,
      adjustmentNote,
      discrepancyWarning,
      isAdjusted,
      lastUpdated: new Date().toISOString(),
    };
  },

  /**
   * Save and persist farmer's custom input for a crop
   */
  async submitFarmerInput(cropId: string, input: CustomFarmerInput) {
    await delay(150);
    inMemoryCustomInputs[cropId] = { ...input, isApplied: true };
    saveStoredInputs(inMemoryCustomInputs);
    return { success: true, input: inMemoryCustomInputs[cropId] };
  },

  /**
   * Retrieve saved custom input for a crop
   */
  getSavedFarmerInput(cropId: string): CustomFarmerInput | null {
    return inMemoryCustomInputs[cropId] || null;
  },

  /**
   * Clear custom input
   */
  clearFarmerInput(cropId: string) {
    delete inMemoryCustomInputs[cropId];
    saveStoredInputs(inMemoryCustomInputs);
  },

  /**
   * Fetch nearby simulated pooling farmers
   */
  async getPoolingMatches(cropId: string, districtId: string): Promise<SimulatedFarmer[]> {
    await delay(200);
    return SIMULATED_FARMERS.filter(
      (f) =>
        f.district.toLowerCase() === districtId.toLowerCase() &&
        (cropId === 'all' || f.cropId === cropId)
    );
  },

  /**
   * Fetch marketplace listings with filtering and search (Cross-user sync via API & storage)
   */
  async getMarketplaceListings(filters?: {
    cropId?: string;
    district?: string;
    readyStatus?: string;
    searchQuery?: string;
  }): Promise<MarketplaceListing[]> {
    let list: MarketplaceListing[] = [];

    // 1. Fetch from server backend API
    try {
      const params = new URLSearchParams();
      if (filters?.cropId && filters.cropId !== 'all') params.append('crop', filters.cropId);
      if (filters?.district && filters.district !== 'all') params.append('district', filters.district);

      const res = await fetch(`/api/marketplace/listings?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.listings) && data.listings.length > 0) {
          list = data.listings.map((l: any) => ({
            id: l.id,
            cropId: (l.cropId || l.crop || 'tomato').toLowerCase(),
            crop: (l.crop || l.cropId || 'tomato').toLowerCase(),
            cropName: l.cropName || l.crop || 'Crop',
            nepaliName: l.nepaliName || l.cropName || 'बाली',
            emoji: l.emoji || '🌾',
            farmerId: l.farmerId,
            farmerName: l.farmerName || 'Nepali Farmer',
            farmerPhone: l.farmerPhone || '+977 98XXXXXXXX',
            village: l.village || l.location || 'Local Hub',
            municipality: l.municipality || 'Ward 1',
            district: (l.district || 'chitwan').toLowerCase(),
            quantityKg: Number(l.quantityKg) || 100,
            availableKg: Number(l.availableKg ?? l.quantityKg) || 100,
            askingPricePerKg: Number(l.askingPricePerKg ?? l.pricePerKg) || 35,
            pricePerKg: Number(l.pricePerKg ?? l.askingPricePerKg) || 35,
            marketWholesalePrice: Number(l.marketWholesalePrice) || Math.round((Number(l.pricePerKg) || 35) * 1.05),
            harvestWindow: l.harvestWindow || 'Ready Now',
            readyStatus: l.readyStatus || 'ready_now',
            qualityGrade: l.qualityGrade || 'Grade A',
            isOrganic: Boolean(l.isOrganic),
            verified: l.verified !== undefined ? Boolean(l.verified) : true,
            rating: Number(l.rating) || 5.0,
            reviewsCount: Number(l.reviewsCount) || 1,
            pickupHub: l.pickupHub || l.location || l.village || 'Collection Hub',
            description: l.description || 'Clean farm produce ready for direct pickup.',
            status: l.status || 'active',
            allowPooling: l.allowPooling !== undefined ? Boolean(l.allowPooling) : true,
            created_at: l.created_at || l.createdAt || new Date().toISOString(),
          }));
        }
      }
    } catch (err) {
      console.warn('Could not fetch server marketplace listings, using local fallback:', err);
    }

    // 2. Fallback to INITIAL seeds if server list is empty
    if (list.length === 0) {
      list = [...INITIAL_MARKETPLACE_LISTINGS];
    }

    // 3. Merge locally persisted user listings if any were stored in client storage
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('krishisetu_marketplace_listings');
        if (saved) {
          const localLots: MarketplaceListing[] = JSON.parse(saved);
          if (Array.isArray(localLots)) {
            // Prepend new local lots if not already present by id
            for (const item of localLots) {
              if (!list.some((existing) => existing.id === item.id)) {
                list.unshift(item);
              }
            }
          }
        }
      }
    } catch (e) {}

    // 4. Apply client-side filters
    if (filters?.cropId && filters.cropId !== 'all') {
      list = list.filter((item) => item.cropId.toLowerCase() === filters.cropId?.toLowerCase());
    }

    if (filters?.district && filters.district !== 'all') {
      list = list.filter((item) => item.district.toLowerCase() === filters.district?.toLowerCase());
    }

    if (filters?.readyStatus && filters.readyStatus !== 'all') {
      list = list.filter((item) => item.readyStatus === filters.readyStatus);
    }

    if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.cropName.toLowerCase().includes(q) ||
          item.nepaliName.includes(q) ||
          item.farmerName.toLowerCase().includes(q) ||
          item.village.toLowerCase().includes(q) ||
          item.municipality.toLowerCase().includes(q) ||
          item.district.toLowerCase().includes(q) ||
          (item.farmerPhone && item.farmerPhone.includes(q))
      );
    }

    return list;
  },

  /**
   * Post new harvest lot to marketplace and broadcast to all users
   */
  async createMarketplaceListing(listing: MarketplaceListing): Promise<MarketplaceListing> {
    const enriched: MarketplaceListing = {
      ...listing,
      id: listing.id || `mkt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: 'active',
      verified: true,
      rating: listing.rating || 5.0,
      reviewsCount: listing.reviewsCount || 1,
      created_at: listing.created_at || new Date().toISOString(),
      createdAt: listing.createdAt || new Date().toISOString(),
    };

    // 1. Post to backend server so other users / sessions can see it
    try {
      const res = await fetch('/api/marketplace/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('krishisetu_auth_token') || ''}`,
        },
        body: JSON.stringify(enriched),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.listing) {
          Object.assign(enriched, data.listing);
        }
      }
    } catch (err) {
      console.warn('Backend API post failed, persisting locally:', err);
    }

    // 2. Persist in local storage for instant offline / cache redundancy
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('krishisetu_marketplace_listings');
        const list: MarketplaceListing[] = saved ? JSON.parse(saved) : [];
        const updated = [enriched, ...list.filter((l) => l.id !== enriched.id)];
        localStorage.setItem('krishisetu_marketplace_listings', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('krishi_marketplace_updated', { detail: enriched }));
      }
    } catch (e) {}

    return enriched;
  },

  /**
   * Confirm a solo farmgate / mandi sale
   */
  async confirmSoloSale(sale: Omit<ConfirmedSaleRecord, 'id' | 'soldAt' | 'status'>): Promise<ConfirmedSaleRecord> {
    await delay(250);
    const newSale: ConfirmedSaleRecord = {
      ...sale,
      id: `sale-${Date.now()}`,
      soldAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'confirmed',
    };
    inMemorySales = [newSale, ...inMemorySales];
    saveStoredSales(inMemorySales);
    return newSale;
  },

  /**
   * Get all confirmed solo sales
   */
  getConfirmedSales(): ConfirmedSaleRecord[] {
    return inMemorySales;
  },

  /**
   * Get active transport pools for district/crop
   */
  async getActivePools(districtId?: string, cropId?: string): Promise<UserPoolItem[]> {
    await delay(180);
    return inMemoryPools.filter((p) => {
      const matchDistrict = !districtId || districtId === 'all' || p.district.toLowerCase() === districtId.toLowerCase();
      const matchCrop = !cropId || cropId === 'all' || p.cropId === cropId;
      return matchDistrict && matchCrop;
    });
  },

  /**
   * Join an existing transport pool
   */
  async joinPool(poolId: string, volumeKg: number, pickupLocation: string, userName = 'You'): Promise<UserPoolItem> {
    await delay(280);
    inMemoryPools = inMemoryPools.map((pool) => {
      if (pool.id === poolId) {
        const newVolume = pool.currentVolumeKg + volumeKg;
        const newCount = pool.isUserJoined ? pool.farmerCount : pool.farmerCount + 1;
        return {
          ...pool,
          currentVolumeKg: Math.min(pool.targetVolumeKg, newVolume),
          farmerCount: newCount,
          isUserJoined: true,
          userContributionKg: (pool.userContributionKg || 0) + volumeKg,
          pickupLocation: pickupLocation || pool.pickupLocation,
          status: newVolume >= pool.targetVolumeKg ? 'ready_to_dispatch' : pool.status,
        };
      }
      return pool;
    });
    saveStoredPools(inMemoryPools);
    const updated = inMemoryPools.find((p) => p.id === poolId);
    return updated || inMemoryPools[0];
  },

  /**
   * Create a new transport pool
   */
  async createPool(newPool: Omit<UserPoolItem, 'id' | 'currentVolumeKg' | 'farmerCount' | 'isUserOrganizer' | 'isUserJoined' | 'invitedFarmers' | 'status'>): Promise<UserPoolItem> {
    await delay(300);
    const created: UserPoolItem = {
      ...newPool,
      id: `pool-user-${Date.now()}`,
      currentVolumeKg: newPool.userContributionKg || 250,
      farmerCount: 1,
      isUserOrganizer: true,
      isUserJoined: true,
      userContributionKg: newPool.userContributionKg || 250,
      invitedFarmers: [],
      status: 'forming',
    };
    inMemoryPools = [created, ...inMemoryPools];
    saveStoredPools(inMemoryPools);
    return created;
  },

  /**
   * Invite a nearby farmer to a pool
   */
  async inviteFarmerToPool(poolId: string, farmer: { id: string; name: string; phone: string; cropName: string }): Promise<UserPoolItem> {
    await delay(200);
    inMemoryPools = inMemoryPools.map((pool) => {
      if (pool.id === poolId) {
        const alreadyInvited = pool.invitedFarmers.some((f) => f.id === farmer.id);
        if (!alreadyInvited) {
          return {
            ...pool,
            invitedFarmers: [...pool.invitedFarmers, { ...farmer, status: 'invited' }],
          };
        }
      }
      return pool;
    });
    saveStoredPools(inMemoryPools);
    const updated = inMemoryPools.find((p) => p.id === poolId);
    return updated || inMemoryPools[0];
  },
};
