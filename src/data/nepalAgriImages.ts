import { normalizeCropId } from './cropRegistry';

// Curated authentic photography for Nepali agriculture (Terraced hillsides, Chitwan plains, local crops)
// Hand-curated from Wikimedia Commons & high-reliability agricultural repositories depicting genuine South Asian / Himalayan smallholder farming

export interface CropImageInfo {
  id: string;
  name: string;
  nepaliName: string;
  imageUrl: string;
  alt: string;
  credit: string;
}

export interface PanoramaHotspot {
  id: string;
  x: number; // percentage horizontal position (0 - 100)
  y: number; // percentage vertical position (0 - 100)
  type: 'farmgate' | 'mandi' | 'freight' | 'weather' | 'arbitrage' | 'farmer';
  title: string;
  nepaliTitle: string;
  cropId?: string;
  cropName?: string;
  farmgatePrice?: number;
  mandiPrice?: number;
  arbitrageGain?: number;
  metricLabel: string;
  metricValue: string;
  metricTrend?: 'up' | 'down' | 'neutral';
  description: string;
  actionText: string;
  targetTab: 'market' | 'calculator' | 'records' | 'marketplace';
  farmerStory?: {
    name: string;
    location: string;
    quote: string;
    avatarUrl: string;
    landSize: string;
  };
}

export interface VirtualPanoramaScene {
  id: string;
  districtId: string;
  title: string;
  nepaliTitle: string;
  region: string;
  altitude: string;
  coordinates: string;
  panoramaImageUrl: string;
  thumbnailUrl: string;
  description: string;
  topCrop: {
    id: string;
    name: string;
    nepaliName: string;
    currentPrice: number;
    trendPct: number;
  };
  weatherSummary: {
    temp: number;
    condition: string;
    rainProb: number;
    humidity: number;
  };
  liveFreightConvoy?: {
    truckId: string;
    origin: string;
    destination: string;
    route: string;
    bookedKg: number;
    totalKg: number;
    savingsPct: number;
    departureTime: string;
  };
  hotspots: PanoramaHotspot[];
}

export interface FarmerPortrait {
  id: string;
  name: string;
  nepaliName: string;
  district: string;
  locationDetail: string;
  avatarUrl: string;
  landHolding: string; // e.g., "4.5 Ropani" or "1.2 Bigha"
  primaryCrops: string[];
  role: string;
  quote: string;
  verifiedSavings: string;
  freightTripsCount: number;
}

export const NEPAL_FARMER_PROFILES: FarmerPortrait[] = [
  {
    id: 'farmer-ram-chitwan',
    name: 'Ram Bahadur Thapa',
    nepaliName: 'रामबहादुर थापा',
    district: 'Chitwan (Bharatpur-14)',
    locationDetail: 'Narayani River Vegetable Belt',
    avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
    landHolding: '1.5 Bigha (Tunnel Polyhouse)',
    primaryCrops: ['Tomato (Local)', 'Capsicum', 'Bitter Gourd'],
    role: 'Solanaceous Vegetable Producer',
    quote: 'KrishiSetu’s shared freight pool on Prithvi Highway reduced my transport cost from Rs 6/kg down to Rs 2.2/kg. Booking with neighbors saved Rs 28,000 this season!',
    verifiedSavings: 'Rs 34,500 extra margin',
    freightTripsCount: 14,
  },
  {
    id: 'farmer-sita-kavre',
    name: 'Sita Devi Shrestha',
    nepaliName: 'सीतादेवी श्रेष्ठ',
    district: 'Kavrepalanchok (Panchkhal)',
    locationDetail: 'Valley Terraced Organic Plots',
    avatarUrl: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=400&q=80',
    landHolding: '5 Ropani (Terraces)',
    primaryCrops: ['Green Peas', 'Cauliflower', 'French Beans'],
    role: 'Off-Season Hillside Grower',
    quote: 'Checking the Kalimati econometric forecast 7 days before picking prevented me from selling during the glut. I harvested 4 days later and got Rs 48/kg instead of Rs 26/kg.',
    verifiedSavings: '+42% higher selling price',
    freightTripsCount: 9,
  },
  {
    id: 'farmer-bikram-dhading',
    name: 'Bikram Adhikari',
    nepaliName: 'बिक्रम अधिकारी',
    district: 'Dhading (Malekhu)',
    locationDetail: 'Trishuli River Corridor',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    landHolding: '3.8 Ropani',
    primaryCrops: ['Cucumber', 'Cabbage', 'French Beans'],
    role: 'Cooperative Pooling Coordinator',
    quote: 'We organize 8 farmers into one 3-ton pickup every Tuesday night. Trucks depart directly to Kalimati without middleman cuts.',
    verifiedSavings: 'Rs 51,200 shared cooperative savings',
    freightTripsCount: 22,
  },
  {
    id: 'farmer-keshav-mustang',
    name: 'Keshav Gurung',
    nepaliName: 'केशव गुरुङ',
    district: 'Mustang (Marpha)',
    locationDetail: 'High Altitude Kali Gandaki Valley',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    landHolding: '8 Ropani (Apple Orchard)',
    primaryCrops: ['Highland Apple', 'Dry Garlic', 'Buckwheat'],
    role: 'Cold-Storage & High Altitude Farmer',
    quote: 'Using KrishiSetu arbitrage radar, we time our cold-storage release directly when Kathmandu wholesale prices peak in early spring.',
    verifiedSavings: 'Rs 78,000 seasonal premium',
    freightTripsCount: 6,
  },
];

export const VIRTUAL_PANORAMA_SCENES: VirtualPanoramaScene[] = [
  {
    id: 'scene-chitwan',
    districtId: 'chitwan',
    title: 'Chitwan Narayani Valley',
    nepaliTitle: 'चितवन नारायणी तरकारी क्षेत्र',
    region: 'Central Terai Vegetable Basin',
    altitude: '280m • Subtropical',
    coordinates: '27.6833° N, 84.4333° E',
    panoramaImageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=2400&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=400&q=80',
    description: 'Nepal’s premier solanaceous vegetable powerhouse. High-yield plastic polyhouse tunnel farming producing over 120 tons of fresh tomatoes, capsicum, and gourds daily for the Kathmandu & Pokhara corridors.',
    topCrop: {
      id: 'tomato',
      name: 'Tomato (Local)',
      nepaliName: 'गोलभेडा',
      currentPrice: 42,
      trendPct: 18.5,
    },
    weatherSummary: {
      temp: 28,
      condition: 'Clear Sunshine',
      rainProb: 10,
      humidity: 58,
    },
    liveFreightConvoy: {
      truckId: 'BA 2 KHA 8421',
      origin: 'Bharatpur-14 Hub',
      destination: 'Kalimati Mandi, KTM',
      route: 'Prithvi Highway (160 km)',
      bookedKg: 2450,
      totalKg: 3000,
      savingsPct: 58,
      departureTime: 'Today 5:30 PM',
    },
    hotspots: [
      {
        id: 'hs-chitwan-polyhouse',
        x: 28,
        y: 46,
        type: 'farmgate',
        title: 'Bharatpur Polyhouse Tunnel Cluster',
        nepaliTitle: 'भरतपुर टनेल गोलभेडा क्लस्टर',
        cropId: 'tomato',
        cropName: 'Tomato (Local)',
        farmgatePrice: 28,
        mandiPrice: 42,
        arbitrageGain: 14,
        metricLabel: 'Farmgate Spot',
        metricValue: 'Rs 28 / kg',
        metricTrend: 'up',
        description: '28 smallholder farmers harvesting vine-ripened local tomatoes. High solid-sugar grade ready for bulk crates.',
        actionText: 'Calculate Net Margin',
        targetTab: 'calculator',
        farmerStory: {
          name: 'Ram Bahadur Thapa',
          location: 'Bharatpur-14, Chitwan',
          quote: 'Our polyhouses protect against unseasonal rains. We pool crates onto one nightly truck.',
          avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80',
          landSize: '1.5 Bigha',
        },
      },
      {
        id: 'hs-chitwan-freight',
        x: 62,
        y: 64,
        type: 'freight',
        title: 'Prithvi Highway Shared Freight Pool',
        nepaliTitle: 'पृथ्वी राजमार्ग साझा ढुवानी',
        metricLabel: 'Truck Capacity',
        metricValue: '82% Booked (550kg left)',
        metricTrend: 'up',
        description: 'Scheduled 3-ton refrigerated haul departing at 5:30 PM. Direct drop-off at Kalimati Wholesale Gate 2.',
        actionText: 'Book Remaining 550kg',
        targetTab: 'market',
      },
      {
        id: 'hs-chitwan-arbitrage',
        x: 80,
        y: 35,
        type: 'arbitrage',
        title: 'Kathmandu-Chitwan Arbitrage Spread',
        nepaliTitle: 'काठमाडौँ-चितवन मूल्य अन्तर',
        cropId: 'tomato',
        cropName: 'Tomato (Local)',
        arbitrageGain: 14,
        metricLabel: 'Net Margin Delta',
        metricValue: '+Rs 14.0 / kg',
        metricTrend: 'up',
        description: 'Kalimati Mandi is paying Rs 42/kg while local spot price is Rs 28/kg. Transport cost via shared pool is Rs 2.2/kg.',
        actionText: 'View Arbitrage Radar',
        targetTab: 'market',
      },
      {
        id: 'hs-chitwan-weather',
        x: 15,
        y: 22,
        type: 'weather',
        title: 'Narayani Basin Agro-Meteorology',
        nepaliTitle: 'नारायणी मौसम तथा आर्द्रता सेन्सर',
        metricLabel: 'DHM Forecast',
        metricValue: '28°C • 10% Rain Risk',
        metricTrend: 'neutral',
        description: 'Optimal dry harvesting conditions for next 72 hours. Low fungal blight risk.',
        actionText: 'Open Weather Analytics',
        targetTab: 'records',
      },
    ],
  },
  {
    id: 'scene-kavre',
    districtId: 'kavre',
    title: 'Kavre Himalayan Terraces',
    nepaliTitle: 'काभ्रेपलाञ्चोक पहाडी कान्ला',
    region: 'Eastern Mid-Hills Vegetable Zone',
    altitude: '1,550m • Temperate',
    coordinates: '27.6221° N, 85.5564° E',
    panoramaImageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=2400&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400&q=80',
    description: 'Dramatic terraced mountain hillsides famous for off-season green peas, crisp cauliflower, and red potatoes. Direct 35 km proximity to the Kathmandu valley via Araniko & BP Highway.',
    topCrop: {
      id: 'peas',
      name: 'Green Peas',
      nepaliName: 'केराउ',
      currentPrice: 72,
      trendPct: 24.1,
    },
    weatherSummary: {
      temp: 20,
      condition: 'Partly Cloudy Mountain Mist',
      rainProb: 25,
      humidity: 65,
    },
    liveFreightConvoy: {
      truckId: 'BA 3 KHA 1904',
      origin: 'Panchkhal Collection Center',
      destination: 'Balkhu & Kalimati Mandi',
      route: 'Araniko Highway (38 km)',
      bookedKg: 1800,
      totalKg: 2000,
      savingsPct: 62,
      departureTime: 'Today 4:00 PM',
    },
    hotspots: [
      {
        id: 'hs-kavre-peas',
        x: 35,
        y: 52,
        type: 'farmgate',
        title: 'Panchkhal Off-Season Pea Harvest',
        nepaliTitle: 'पाँचखाल हरियो केराउ संकलन',
        cropId: 'peas',
        cropName: 'Green Peas',
        farmgatePrice: 52,
        mandiPrice: 72,
        arbitrageGain: 20,
        metricLabel: 'Peak Premium',
        metricValue: 'Rs 72 / kg in Mandi',
        metricTrend: 'up',
        description: 'Sweet highland peas fetching premium restaurant prices in Kathmandu. 7-day econometric trajectory projects +12% increase.',
        actionText: 'Inspect Harvest Timing',
        targetTab: 'calculator',
        farmerStory: {
          name: 'Sita Devi Shrestha',
          location: 'Panchkhal, Kavre',
          quote: 'Timing our harvest with the Kalimati deficit gave our women cooperative Rs 42% higher returns.',
          avatarUrl: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=200&q=80',
          landSize: '5 Ropani',
        },
      },
      {
        id: 'hs-kavre-mandi-link',
        x: 68,
        y: 38,
        type: 'arbitrage',
        title: 'Araniko Corridor Fast Transit',
        nepaliTitle: 'अरनिको कोरिडोर छिटो ढुवानी',
        metricLabel: 'Travel Time',
        metricValue: '1.5 Hours to Kalimati',
        metricTrend: 'up',
        description: 'Zero spoilage transit window. Produce picked at 2 PM reaches evening auctions by 4 PM.',
        actionText: 'View Freight Options',
        targetTab: 'market',
      },
      {
        id: 'hs-kavre-farmer',
        x: 82,
        y: 62,
        type: 'farmer',
        title: 'Kavre Women Agro-Cooperative',
        nepaliTitle: 'काभ्रे महिला कृषि सहकारी',
        metricLabel: 'Pooled Volume',
        metricValue: '4.2 Tons / Week',
        metricTrend: 'up',
        description: '34 smallholders sharing input bulk purchase, organic certification, and combined transport.',
        actionText: 'View Group Pools',
        targetTab: 'market',
      },
    ],
  },
  {
    id: 'scene-kalimati',
    districtId: 'kathmandu',
    title: 'Kalimati Central Wholesale Mandi',
    nepaliTitle: 'कालीमाटी फलफूल तथा तरकारी बजार',
    region: 'National Capital Terminal Wholesale Floor',
    altitude: '1,400m • Terminal Market',
    coordinates: '27.7001° N, 85.3050° E',
    panoramaImageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=2400&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
    description: 'The heartbeat of Nepal’s fresh produce economy. Handling over 750 metric tons of vegetables and fruits daily, establishing national benchmark prices via early morning auctions.',
    topCrop: {
      id: 'tomato',
      name: 'Tomato (Local)',
      nepaliName: 'गोलभेडा',
      currentPrice: 42,
      trendPct: 8.2,
    },
    weatherSummary: {
      temp: 22,
      condition: 'Urban Morning Clear',
      rainProb: 5,
      humidity: 50,
    },
    hotspots: [
      {
        id: 'hs-kalimati-floor',
        x: 48,
        y: 54,
        type: 'mandi',
        title: 'Central Auction Floor (Shed A & B)',
        nepaliTitle: 'कालीमाटी मुख्य लिलाम स्थल',
        cropId: 'tomato',
        cropName: 'Tomato (Local)',
        mandiPrice: 42,
        metricLabel: 'Daily Arrivals',
        metricValue: '142 Metric Tons',
        metricTrend: 'neutral',
        description: 'Morning bidding starts at 4:30 AM. Current supply is -15% lower than weekly average, keeping prices firm.',
        actionText: 'View Live Price Ticker',
        targetTab: 'market',
      },
      {
        id: 'hs-kalimati-arbitrage-inflow',
        x: 75,
        y: 42,
        type: 'arbitrage',
        title: 'District Inflow Arbitrage Tracker',
        nepaliTitle: 'जिल्ला अनुसार आपूर्ति तथा मूल्य',
        metricLabel: 'Top Supplier',
        metricValue: 'Dhading (38%) • Chitwan (31%)',
        metricTrend: 'up',
        description: 'Real-time entry gate telemetry cross-referenced against DHM weather and highway checkposts.',
        actionText: 'Compare District Prices',
        targetTab: 'market',
      },
    ],
  },
  {
    id: 'scene-dhading',
    districtId: 'dhading',
    title: 'Dhading Trishuli River Corridor',
    nepaliTitle: 'धादिङ त्रिशूली नदी कोरिडोर',
    region: 'Highway Valley & Greenhouses',
    altitude: '750m • Subtropical River Basin',
    coordinates: '27.8667° N, 84.9000° E',
    panoramaImageUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=2400&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=400&q=80',
    description: 'Nepal’s vegetable artery along Prithvi Highway. High-intensity cucumber, cabbage, and french bean plots feeding trucks directly from farmgate gates.',
    topCrop: {
      id: 'cucumber',
      name: 'Cucumber',
      nepaliName: 'काँक्रो',
      currentPrice: 35,
      trendPct: 14.3,
    },
    weatherSummary: {
      temp: 26,
      condition: 'Sunny Warm',
      rainProb: 15,
      humidity: 55,
    },
    hotspots: [
      {
        id: 'hs-dhading-corridor',
        x: 42,
        y: 50,
        type: 'farmgate',
        title: 'Malekhu Farmgate Collection Depot',
        nepaliTitle: 'मलेखु संकलन केन्द्र',
        cropId: 'cucumber',
        cropName: 'Cucumber',
        farmgatePrice: 22,
        mandiPrice: 35,
        arbitrageGain: 13,
        metricLabel: 'Daily Pickup',
        metricValue: '6.5 Tons Available',
        metricTrend: 'up',
        description: 'Greenhouse crisp cucumbers picked daily. Easy highway loading with low transport overhead.',
        actionText: 'Join Malekhu Freight Pool',
        targetTab: 'market',
      },
    ],
  },
  {
    id: 'scene-bhaktapur',
    districtId: 'kathmandu',
    title: 'Bhaktapur Heritage Farmlands',
    nepaliTitle: 'भक्तपुर परम्परागत कृषि फाँट',
    region: 'Kathmandu Suburban High-Value Belt',
    altitude: '1,420m • Temperate Alluvial',
    coordinates: '27.6710° N, 85.4298° E',
    panoramaImageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=2400&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80',
    description: 'Ancient rich alluvial soil producing high-density red potatoes, carrots, and leafy spinach. Direct farm-to-table consumer access across Kathmandu valley.',
    topCrop: {
      id: 'potato',
      name: 'Potato (Red)',
      nepaliName: 'रातो आलु',
      currentPrice: 32,
      trendPct: 6.5,
    },
    weatherSummary: {
      temp: 21,
      condition: 'Sunny Pleasant',
      rainProb: 10,
      humidity: 52,
    },
    hotspots: [
      {
        id: 'hs-bhaktapur-potato',
        x: 38,
        y: 58,
        type: 'farmgate',
        title: 'Bode & Changunarayan Potato Fields',
        nepaliTitle: 'बोडे तथा चाँगु आलु फाँट',
        cropId: 'potato',
        cropName: 'Potato (Red)',
        farmgatePrice: 26,
        mandiPrice: 32,
        arbitrageGain: 6,
        metricLabel: 'Direct Spot',
        metricValue: 'Rs 26 / kg',
        metricTrend: 'up',
        description: 'Firm high-starch red potatoes. High consumer brand recall in local wholesale markets.',
        actionText: 'Log Harvest in Farm Records',
        targetTab: 'records',
      },
    ],
  },
  {
    id: 'scene-mustang',
    districtId: 'jumla',
    title: 'Mustang Marpha Apple Orchards',
    nepaliTitle: 'मुस्ताङ मार्फा स्याउ बगान',
    region: 'High Himalayan Trans-Himalayan Valley',
    altitude: '2,670m • Alpine Dry',
    coordinates: '28.7500° N, 83.6833° E',
    panoramaImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=2400&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    description: 'Crisp organic Royal Delicious apples grown with glacier meltwater along the Kali Gandaki valley. High-altitude cold storage preservation allows strategic counter-seasonal sales.',
    topCrop: {
      id: 'garlic',
      name: 'Dry Garlic',
      nepaliName: 'सुकेको लसुन',
      currentPrice: 125,
      trendPct: 15.8,
    },
    weatherSummary: {
      temp: 14,
      condition: 'Crisp Alpine Wind',
      rainProb: 5,
      humidity: 32,
    },
    hotspots: [
      {
        id: 'hs-mustang-orchard',
        x: 45,
        y: 44,
        type: 'farmgate',
        title: 'Marpha Cold Storage Facility',
        nepaliTitle: 'मार्फा शीतभण्डार तथा प्रशोधन',
        cropId: 'garlic',
        cropName: 'Dry Garlic',
        farmgatePrice: 95,
        mandiPrice: 125,
        arbitrageGain: 30,
        metricLabel: 'Cold Chain Stock',
        metricValue: '22 Tons Reserved',
        metricTrend: 'up',
        description: 'Controlled atmosphere storage preserving quality for premium spring market release.',
        actionText: 'View Futures Timing',
        targetTab: 'calculator',
      },
    ],
  },
  {
    id: 'scene-pokhara',
    districtId: 'pokhara',
    title: 'Pokhara Hemja Valley',
    nepaliTitle: 'पोखरा हेम्जा अर्गानिक तरकारी क्षेत्र',
    region: 'Western Regional Tourism & Organic Belt',
    altitude: '900m • Subtropical Foothill',
    coordinates: '28.2096° N, 83.9856° E',
    panoramaImageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=2400&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80',
    description: 'Lush farmland framed by the Annapurna mountain range. High commercial hospitality demand from Pokhara’s lakeside restaurants and hotel clusters.',
    topCrop: {
      id: 'capsicum',
      name: 'Capsicum',
      nepaliName: 'भेडे खुर्सानी',
      currentPrice: 58,
      trendPct: 16.0,
    },
    weatherSummary: {
      temp: 24,
      condition: 'Sunny with Mountain Breeze',
      rainProb: 20,
      humidity: 62,
    },
    hotspots: [
      {
        id: 'hs-pokhara-market',
        x: 52,
        y: 56,
        type: 'mandi',
        title: 'Hemja Agro-Wholesale Market',
        nepaliTitle: 'हेम्जा कृषि थोक बजार',
        cropId: 'capsicum',
        cropName: 'Capsicum',
        farmgatePrice: 42,
        mandiPrice: 58,
        arbitrageGain: 16,
        metricLabel: 'Regional Spot',
        metricValue: 'Rs 58 / kg',
        metricTrend: 'up',
        description: 'Direct procurement hub serving 180+ hotels and local markets in Kaski.',
        actionText: 'Explore Marketplace Buyers',
        targetTab: 'marketplace',
      },
    ],
  },
];

export const NEPAL_HERO_IMAGES = {
  // Terraced hillside farming in Nepal (Kavre / Dhading / Trishuli river valley)
  terraces: {
    url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
    alt: 'Terraced agricultural fields in the Himalayan foothills of Nepal',
    caption: 'Terraced hillside smallholder plots — Kavre & Dhading corridor',
  },
  // Chitwan fertile agricultural plains & vegetable tunnel farming
  chitwanValley: {
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
    alt: 'Lush agricultural farmland in Nepal Terai plains',
    caption: 'Fertile vegetable & solanaceous plots — Chitwan Valley',
  },
  // Smallholder farmer working in hillside plot with morning sunlight
  farmerField: {
    url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80',
    alt: 'Farmer tending to fresh vegetable crop in morning light',
    caption: 'Morning harvest routine — Local smallholder farmgate',
  },
};

export const CROP_IMAGES: Record<string, CropImageInfo> = {
  paddy: {
    id: 'paddy',
    name: 'Paddy / Rice (Dhan)',
    nepaliName: 'धान',
    imageUrl: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=400&q=80',
    alt: 'Golden green paddy rice fields in Terai Nepal',
    credit: 'Terai paddy harvest',
  },
  wheat: {
    id: 'wheat',
    name: 'Wheat (Gahu)',
    nepaliName: 'गहुँ',
    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=400&q=80',
    alt: 'Golden ripe wheat ears in spring',
    credit: 'Spring wheat harvest',
  },
  maize: {
    id: 'maize',
    name: 'Maize (Makai)',
    nepaliName: 'मकै',
    imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=400&q=80',
    alt: 'Fresh green corn maize cobs in field',
    credit: 'Hillside maize plots',
  },
  mustard: {
    id: 'mustard',
    name: 'Mustard (Tori)',
    nepaliName: 'तोरी',
    imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=400&q=80',
    alt: 'Yellow blooming mustard field in Chitwan',
    credit: 'Chitwan mustard fields',
  },
  tomato: {
    id: 'tomato',
    name: 'Tomato (Local)',
    nepaliName: 'गोलभेडा',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
    alt: 'Fresh Nepali local vine-ripened tomatoes',
    credit: 'Local farmgate harvest',
  },
  potato: {
    id: 'potato',
    name: 'Potato (Red)',
    nepaliName: 'रातो आलु',
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80',
    alt: 'Freshly harvested red potatoes',
    credit: 'Hillside red potato harvest',
  },
  onion: {
    id: 'onion',
    name: 'Dry Onion',
    nepaliName: 'सुकेको प्याज',
    imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=400&q=80',
    alt: 'Cured red dry onions for storage and mandi trade',
    credit: 'Mandi wholesale grade onions',
  },
  cauliflower: {
    id: 'cauliflower',
    name: 'Cauliflower',
    nepaliName: 'काउली',
    imageUrl: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=400&q=80',
    alt: 'Crisp fresh white cauliflower head with green leaves',
    credit: 'Winter harvest cauliflower',
  },
  cabbage: {
    id: 'cabbage',
    name: 'Cabbage',
    nepaliName: 'बन्दा',
    imageUrl: 'https://images.unsplash.com/photo-1550950158-d0d960dff51b?auto=format&fit=crop&w=400&q=80',
    alt: 'Fresh green leafy cabbage',
    credit: 'Makwanpur field harvest',
  },
  carrot: {
    id: 'carrot',
    name: 'Carrot',
    nepaliName: 'गाजर',
    imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?auto=format&fit=crop&w=400&q=80',
    alt: 'Fresh crisp orange carrots with greens',
    credit: 'Bhaktapur & Valley carrots',
  },
  capsicum: {
    id: 'capsicum',
    name: 'Capsicum',
    nepaliName: 'भेडे खुर्सानी',
    imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=400&q=80',
    alt: 'Lush green bell pepper capsicum from polyhouse',
    credit: 'Chitwan polyhouse capsicum',
  },
  beans: {
    id: 'beans',
    name: 'French Beans',
    nepaliName: 'सिमी',
    imageUrl: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=400&q=80',
    alt: 'Fresh green french beans',
    credit: 'Dhading terrace french beans',
  },
  bitter_gourd: {
    id: 'bitter_gourd',
    name: 'Bitter Gourd',
    nepaliName: 'करेला',
    imageUrl: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=400&q=80',
    alt: 'Fresh green bitter gourd (Karela)',
    credit: 'Tarai summer crop',
  },
  bottle_gourd: {
    id: 'bottle_gourd',
    name: 'Bottle Gourd',
    nepaliName: 'लौका',
    imageUrl: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=400&q=80',
    alt: 'Fresh tender bottle gourd (Lauka)',
    credit: 'Chitwan valley gourd harvest',
  },
  brinjal: {
    id: 'brinjal',
    name: 'Brinjal (Eggplant)',
    nepaliName: 'भन्टा',
    imageUrl: 'https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?auto=format&fit=crop&w=400&q=80',
    alt: 'Fresh purple brinjal eggplant',
    credit: 'Tarai farm harvest',
  },
  chilli: {
    id: 'chilli',
    name: 'Green Chilli',
    nepaliName: 'हरियो खुर्सानी',
    imageUrl: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=400&q=80',
    alt: 'Spicy fresh green chillies',
    credit: 'Local green chillies',
  },
  coriander: {
    id: 'coriander',
    name: 'Green Coriander',
    nepaliName: 'धनिया',
    imageUrl: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&w=400&q=80',
    alt: 'Aromatic fresh green coriander bunch',
    credit: 'Suburban valley greens',
  },
  cucumber: {
    id: 'cucumber',
    name: 'Cucumber',
    nepaliName: 'काँक्रो',
    imageUrl: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=400&q=80',
    alt: 'Crisp green cucumber',
    credit: 'Dhading greenhouse cucumber',
  },
  garlic: {
    id: 'garlic',
    name: 'Dry Garlic',
    nepaliName: 'सुकेको लसुन',
    imageUrl: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=400&q=80',
    alt: 'Dry white garlic bulbs',
    credit: 'Hill country garlic',
  },
  ginger: {
    id: 'ginger',
    name: 'Fresh Ginger',
    nepaliName: 'अदुवा',
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80',
    alt: 'Fresh aromatic ginger roots',
    credit: 'Palpa & Nawalparasi ginger',
  },
  ladies_finger: {
    id: 'ladies_finger',
    name: 'Okra (Bhindi)',
    nepaliName: 'भिन्डी',
    imageUrl: 'https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?auto=format&fit=crop&w=400&q=80',
    alt: 'Fresh tender green okra pods',
    credit: 'Tarai summer bhindi',
  },
  mushroom: {
    id: 'mushroom',
    name: 'Button Mushroom',
    nepaliName: 'च्याउ',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    alt: 'Fresh white button mushrooms',
    credit: 'Valley mushroom shed harvest',
  },
  peas: {
    id: 'peas',
    name: 'Green Peas',
    nepaliName: 'केराउ',
    imageUrl: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?auto=format&fit=crop&w=400&q=80',
    alt: 'Fresh sweet green peas in pod',
    credit: 'Kavre winter peas',
  },
  pumpkin: {
    id: 'pumpkin',
    name: 'Pumpkin',
    nepaliName: 'फर्सी',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80',
    alt: 'Ripe orange pumpkin',
    credit: 'Local farm pumpkin',
  },
  radish: {
    id: 'radish',
    name: 'White Radish',
    nepaliName: 'मूला',
    imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?auto=format&fit=crop&w=400&q=80',
    alt: 'Fresh crisp white radish',
    credit: 'Kathmandu valley radish',
  },
  spinach: {
    id: 'spinach',
    name: 'Palungo Spinach',
    nepaliName: 'पालुङ्गो',
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80',
    alt: 'Fresh green leafy Palungo spinach',
    credit: 'Valley green leafy harvest',
  },
  sweet_potato: {
    id: 'sweet_potato',
    name: 'Sweet Potato',
    nepaliName: 'सखरखण्ड',
    imageUrl: 'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?auto=format&fit=crop&w=400&q=80',
    alt: 'Red sweet potatoes (Sakharkhand)',
    credit: 'Winter root crop',
  },
};

export function getCropImage(cropId: string): CropImageInfo {
  const norm = normalizeCropId(cropId);
  if (CROP_IMAGES[norm]) {
    return CROP_IMAGES[norm];
  }
  if (CROP_IMAGES[cropId]) {
    return CROP_IMAGES[cropId];
  }
  return {
    id: 'harvest_fallback',
    name: 'Farm Produce',
    nepaliName: 'कृषि उपज',
    imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80',
    alt: 'Fresh organic farm produce harvest',
    credit: 'Fresh harvest basket',
  };
}

export const CINEMATIC_TILES = {
  hero: {
    imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=85',
    alt: 'Golden hour sunlight over terraced Himalayan farmlands in Nepal',
    caption: 'Terraced Himalayan farmlands at golden hour — Bagmati & Gandaki belt',
  },
  weather: {
    imageUrl: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=800&q=80',
    alt: 'Morning sun and passing clouds over misty hillside crops',
    label: "Today's Weather",
    nepaliLabel: 'आजको मौसम',
  },
  priceAlert: {
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
    alt: 'Fresh vine-ripened tomatoes in morning market light',
    label: 'Price Alert',
    nepaliLabel: 'मूल्य सूचना',
  },
  pooling: {
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    alt: 'Freight transport truck moving produce along highway corridor',
    label: 'Pool & Save',
    nepaliLabel: 'भाडा साझेदारी',
  },
  calculator: {
    imageUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
    alt: 'Farmer inspecting healthy crop before harvest in sunlight',
    label: 'Profit Calculator',
    nepaliLabel: 'नाफा हिसाब',
  },
  marketplace: {
    imageUrl: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80',
    alt: 'Direct fresh harvest produce baskets and buyer market',
    label: 'Direct Market',
    nepaliLabel: 'सिधा बजार',
  },
};


