import { Commodity, MarketDisruption } from '../../../shared/types/krishi';
import {
  KALIMATI_DATASET,
  getKalimatiCrop,
  getKalimatiCurrentPrice,
} from '../data/kalimatiDataset';
import {
  NEPAL_DISTRICTS_MANDIS,
  findDistrictMandi,
  getAmpisHubForDistrict,
  NepalDistrictMandi,
} from '../data/nepalMandis';
import { KalimatiScraper, ScrapedPriceItem } from '../scrapers/kalimatiScraper';
import { AmpisScraper } from '../scrapers/ampisScraper';
import { PriceHistoryService, PriceRecord } from './priceHistoryService';
import { DbStorageService, DistrictPriceReportItem } from './dbStorageService';

interface SeedMeta {
  id: string;
  name: string;
  nameNepali: string;
  category: Commodity['category'];
  categoryNepali: string;
  fallbackCurrent: number;
  fallbackMin: number;
  fallbackMax: number;
  arrivalsTodayTons: number;
  arrivalsYesterdayTons: number;
  confidenceScore: number;
  bestSellingMandi: string;
  bestSellingMandiNepali: string;
  harvestWindowFallback: string;
  image: string;
  color: string;
  emoji: string;
}

const SEED_DEFINITIONS: SeedMeta[] = [
  {
    id: 'tomato',
    name: 'Tomato (Local)',
    nameNepali: 'गोलभेडा (स्थानीय)',
    category: 'vegetable',
    categoryNepali: 'तरकारी',
    fallbackCurrent: 53,
    fallbackMin: 38,
    fallbackMax: 70,
    arrivalsTodayTons: 52.5,
    arrivalsYesterdayTons: 58.0,
    confidenceScore: 91,
    bestSellingMandi: 'Kalimati Mandi, Kathmandu',
    bestSellingMandiNepali: 'कालीमाटी फलफूल तथा तरकारी बजार, काठमाडौं',
    harvestWindowFallback: 'Kartik - Mangsir (Nov Peak: Rs 70.2)',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
    color: '#ef4444',
    emoji: '🍅',
  },
  {
    id: 'potato',
    name: 'Red Potato',
    nameNepali: 'रातो आलु',
    category: 'vegetable',
    categoryNepali: 'तरकारी',
    fallbackCurrent: 32,
    fallbackMin: 27,
    fallbackMax: 60,
    arrivalsTodayTons: 115.0,
    arrivalsYesterdayTons: 110.0,
    confidenceScore: 94,
    bestSellingMandi: 'Balkhu & Kalimati Wholesale, Kathmandu',
    bestSellingMandiNepali: 'बल्खु र कालीमाटी कृषि बजार',
    harvestWindowFallback: 'Ashwin - Kartik (Oct Peak: Rs 59.5)',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80',
    color: '#b45309',
    emoji: '🥔',
  },
  {
    id: 'onion',
    name: 'Dry Onion (Imported)',
    nameNepali: 'सुकेको प्याज',
    category: 'vegetable',
    categoryNepali: 'तरकारी',
    fallbackCurrent: 44,
    fallbackMin: 40,
    fallbackMax: 78,
    arrivalsTodayTons: 92.0,
    arrivalsYesterdayTons: 88.0,
    confidenceScore: 93,
    bestSellingMandi: 'Kalimati & Birgunj Terminal',
    bestSellingMandiNepali: 'कालीमाटी र वीरगञ्ज मन्डी',
    harvestWindowFallback: 'Ashwin - Kartik (Oct Peak: Rs 78.1)',
    image: 'https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?w=600&auto=format&fit=crop&q=80',
    color: '#d97706',
    emoji: '🧅',
  },
  {
    id: 'cauliflower',
    name: 'Cauliflower (Local)',
    nameNepali: 'काउली (स्थानीय)',
    category: 'vegetable',
    categoryNepali: 'तरकारी',
    fallbackCurrent: 65,
    fallbackMin: 35,
    fallbackMax: 151,
    arrivalsTodayTons: 38.0,
    arrivalsYesterdayTons: 42.0,
    confidenceScore: 87,
    bestSellingMandi: 'Kalimati & Pokhara Krishi Bazar',
    bestSellingMandiNepali: 'कालीमाटी र पोखरा कृषि बजार',
    harvestWindowFallback: 'Bhadra - Ashwin (Sep Peak: Rs 150.5)',
    image: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=600&auto=format&fit=crop&q=80',
    color: '#15803d',
    emoji: '🥦',
  },
  {
    id: 'cabbage',
    name: 'Cabbage (Local)',
    nameNepali: 'बन्दा गोभी',
    category: 'vegetable',
    categoryNepali: 'तरकारी',
    fallbackCurrent: 47,
    fallbackMin: 31,
    fallbackMax: 121,
    arrivalsTodayTons: 48.0,
    arrivalsYesterdayTons: 50.0,
    confidenceScore: 86,
    bestSellingMandi: 'Kalimati & Dharan Krishi Bazar',
    bestSellingMandiNepali: 'कालीमाटी र धरान कृषि बजार',
    harvestWindowFallback: 'Bhadra - Ashwin (Sep Peak: Rs 120.7)',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=80',
    color: '#16a34a',
    emoji: '🥬',
  },
  {
    id: 'carrot',
    name: 'Carrot (Local)',
    nameNepali: 'गाजर (स्थानीय)',
    category: 'vegetable',
    categoryNepali: 'तरकारी',
    fallbackCurrent: 59,
    fallbackMin: 33,
    fallbackMax: 113,
    arrivalsTodayTons: 22.0,
    arrivalsYesterdayTons: 21.0,
    confidenceScore: 88,
    bestSellingMandi: 'Kalimati Mandi, Kathmandu',
    bestSellingMandiNepali: 'कालीमाटी बजार, काठमाडौं',
    harvestWindowFallback: 'Ashwin - Kartik (Oct Peak: Rs 113.1)',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=80',
    color: '#ea580c',
    emoji: '🥕',
  },
  {
    id: 'capsicum',
    name: 'Capsicum (Bell Pepper)',
    nameNepali: 'भेडे खुर्सानी',
    category: 'vegetable',
    categoryNepali: 'तरकारी',
    fallbackCurrent: 68,
    fallbackMin: 55,
    fallbackMax: 85,
    arrivalsTodayTons: 11.5,
    arrivalsYesterdayTons: 12.2,
    confidenceScore: 85,
    bestSellingMandi: 'Pokhara & Kathmandu Hotels',
    bestSellingMandiNepali: 'पोखरा र काठमाडौं बजार',
    harvestWindowFallback: 'Chaitra - Ashar',
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&auto=format&fit=crop&q=80',
    color: '#16a34a',
    emoji: '🫑',
  },
  {
    id: 'beans',
    name: 'French Beans (Local)',
    nameNepali: 'घ्यु सिमी',
    category: 'vegetable',
    categoryNepali: 'तरकारी',
    fallbackCurrent: 79,
    fallbackMin: 66,
    fallbackMax: 95,
    arrivalsTodayTons: 19.0,
    arrivalsYesterdayTons: 18.0,
    confidenceScore: 87,
    bestSellingMandi: 'Kalimati Mandi, Kathmandu',
    bestSellingMandiNepali: 'कालीमाटी बजार, काठमाडौं',
    harvestWindowFallback: 'Ashwin (Oct Peak: Rs 94.2)',
    image: 'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=600&auto=format&fit=crop&q=80',
    color: '#15803d',
    emoji: '🫘',
  },
  {
    id: 'peas',
    name: 'Green Peas',
    nameNepali: 'हरियो केराउ / मटरकोसा',
    category: 'vegetable',
    categoryNepali: 'तरकारी',
    fallbackCurrent: 79,
    fallbackMin: 58,
    fallbackMax: 228,
    arrivalsTodayTons: 14.0,
    arrivalsYesterdayTons: 15.0,
    confidenceScore: 85,
    bestSellingMandi: 'Kalimati & Pokhara Krishi Bazar',
    bestSellingMandiNepali: 'कालीमाटी र पोखरा बजार',
    harvestWindowFallback: 'Ashwin (Oct Peak: Rs 228.7)',
    image: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=600&auto=format&fit=crop&q=80',
    color: '#22c55e',
    emoji: '🫛',
  },
  {
    id: 'bitter_gourd',
    name: 'Bitter Gourd',
    nameNepali: 'तीते करेला',
    category: 'vegetable',
    categoryNepali: 'तरकारी',
    fallbackCurrent: 90,
    fallbackMin: 38,
    fallbackMax: 134,
    arrivalsTodayTons: 20.5,
    arrivalsYesterdayTons: 22.0,
    confidenceScore: 86,
    bestSellingMandi: 'Kalimati & Butwal Krishi Bazar',
    bestSellingMandiNepali: 'कालीमाटी र बुटवल बजार',
    harvestWindowFallback: 'Magh - Falgun (Feb Peak: Rs 134.0)',
    image: 'https://images.unsplash.com/photo-1628773822503-930a7eaecf80?w=600&auto=format&fit=crop&q=80',
    color: '#166534',
    emoji: '🥒',
  },
  {
    id: 'bottle_gourd',
    name: 'Bottle Gourd',
    nameNepali: 'लौका',
    category: 'vegetable',
    categoryNepali: 'तरकारी',
    fallbackCurrent: 55,
    fallbackMin: 33,
    fallbackMax: 60,
    arrivalsTodayTons: 25.0,
    arrivalsYesterdayTons: 24.0,
    confidenceScore: 89,
    bestSellingMandi: 'Kalimati & Narayangarh Mandi',
    bestSellingMandiNepali: 'कालीमाटी र नारायणगढ मन्डी',
    harvestWindowFallback: 'Poush - Magh (Jan Peak: Rs 57.3)',
    image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=600&auto=format&fit=crop&q=80',
    color: '#65a30d',
    emoji: '🍈',
  },
  {
    id: 'brinjal',
    name: 'Brinjal (Eggplant)',
    nameNepali: 'भन्टा',
    category: 'vegetable',
    categoryNepali: 'तरकारी',
    fallbackCurrent: 51,
    fallbackMin: 34,
    fallbackMax: 58,
    arrivalsTodayTons: 29.0,
    arrivalsYesterdayTons: 28.0,
    confidenceScore: 88,
    bestSellingMandi: 'Kalimati & Janakpur Mandi',
    bestSellingMandiNepali: 'कालीमाटी र जनकपुर मन्डी',
    harvestWindowFallback: 'Ashwin (Oct Peak: Rs 56.5)',
    image: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=600&auto=format&fit=crop&q=80',
    color: '#7e22ce',
    emoji: '🍆',
  },
  {
    id: 'chilli',
    name: 'Green Chilli',
    nameNepali: 'हरियो खुर्सानी',
    category: 'spice',
    categoryNepali: 'मसला / तरकारी',
    fallbackCurrent: 167,
    fallbackMin: 89,
    fallbackMax: 170,
    arrivalsTodayTons: 16.0,
    arrivalsYesterdayTons: 15.0,
    confidenceScore: 84,
    bestSellingMandi: 'Kalimati & Birtamod Mandi',
    bestSellingMandiNepali: 'कालीमाटी र बिर्तामोड मन्डी',
    harvestWindowFallback: 'Falgun - Chaitra (Mar Peak: Rs 163.2)',
    image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80',
    color: '#059669',
    emoji: '🌶️',
  },
  {
    id: 'coriander',
    name: 'Green Coriander',
    nameNepali: 'हरियो धनिया',
    category: 'spice',
    categoryNepali: 'सागपात / मसला',
    fallbackCurrent: 107,
    fallbackMin: 56,
    fallbackMax: 272,
    arrivalsTodayTons: 9.5,
    arrivalsYesterdayTons: 10.0,
    confidenceScore: 81,
    bestSellingMandi: 'Kalimati & Pokhara Terminal',
    bestSellingMandiNepali: 'कालीमाटी र पोखरा बजार',
    harvestWindowFallback: 'Shrawan - Bhadra (Aug Peak: Rs 271.7)',
    image: 'https://images.unsplash.com/photo-1588879460618-9249e7d947d1?w=600&auto=format&fit=crop&q=80',
    color: '#10b981',
    emoji: '🌿',
  },
  {
    id: 'cucumber',
    name: 'Cucumber (Local)',
    nameNepali: 'काँक्रो (लोकल)',
    category: 'vegetable',
    categoryNepali: 'तरकारी',
    fallbackCurrent: 53,
    fallbackMin: 41,
    fallbackMax: 84,
    arrivalsTodayTons: 31.0,
    arrivalsYesterdayTons: 30.0,
    confidenceScore: 87,
    bestSellingMandi: 'Kalimati & Pokhara Mandi',
    bestSellingMandiNepali: 'कालीमाटी र पोखरा बजार',
    harvestWindowFallback: 'Falgun (Feb Peak: Rs 83.7)',
    image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600&auto=format&fit=crop&q=80',
    color: '#15803d',
    emoji: '🥒',
  },
  {
    id: 'garlic',
    name: 'Dry Garlic (Nepali)',
    nameNepali: 'सुकेको लसुन',
    category: 'spice',
    categoryNepali: 'मसला',
    fallbackCurrent: 196,
    fallbackMin: 175,
    fallbackMax: 260,
    arrivalsTodayTons: 14.5,
    arrivalsYesterdayTons: 14.0,
    confidenceScore: 90,
    bestSellingMandi: 'Kalimati & Nepalgunj Mandi',
    bestSellingMandiNepali: 'कालीमाटी र नेपालगञ्ज मन्डी',
    harvestWindowFallback: 'Magh - Falgun (Feb Peak: Rs 260.1)',
    image: 'https://images.unsplash.com/photo-1615477550927-6ec8445acfcf?w=600&auto=format&fit=crop&q=80',
    color: '#a16207',
    emoji: '🧄',
  },
  {
    id: 'ginger',
    name: 'Fresh Ginger',
    nameNepali: 'अदुवा',
    category: 'spice',
    categoryNepali: 'मसला',
    fallbackCurrent: 129,
    fallbackMin: 86,
    fallbackMax: 153,
    arrivalsTodayTons: 18.0,
    arrivalsYesterdayTons: 17.5,
    confidenceScore: 89,
    bestSellingMandi: 'Birtamod & Kalimati Export Hub',
    bestSellingMandiNepali: 'बिर्तामोड र कालीमाटी निर्यात केन्द्र',
    harvestWindowFallback: 'Ashar - Shrawan (Jul Peak: Rs 152.6)',
    image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600&auto=format&fit=crop&q=80',
    color: '#ca8a04',
    emoji: '🫚',
  },
  {
    id: 'ladies_finger',
    name: 'Okra (Ladies Finger)',
    nameNepali: 'भिन्डी',
    category: 'vegetable',
    categoryNepali: 'तरकारी',
    fallbackCurrent: 78,
    fallbackMin: 42,
    fallbackMax: 112,
    arrivalsTodayTons: 21.0,
    arrivalsYesterdayTons: 19.5,
    confidenceScore: 85,
    bestSellingMandi: 'Kalimati & Birgunj Mandi',
    bestSellingMandiNepali: 'कालीमाटी र वीरगञ्ज मन्डी',
    harvestWindowFallback: 'Magh - Falgun (Feb Peak: Rs 111.6)',
    image: 'https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=600&auto=format&fit=crop&q=80',
    color: '#16a34a',
    emoji: '🌱',
  },
  {
    id: 'mushroom',
    name: 'Button Mushroom',
    nameNepali: 'च्याउ (डल्ले)',
    category: 'vegetable',
    categoryNepali: 'तरकारी',
    fallbackCurrent: 443,
    fallbackMin: 292,
    fallbackMax: 460,
    arrivalsTodayTons: 6.2,
    arrivalsYesterdayTons: 6.0,
    confidenceScore: 84,
    bestSellingMandi: 'Kalimati & Pokhara Valley Hotels',
    bestSellingMandiNepali: 'कालीमाटी र पोखरा बजार',
    harvestWindowFallback: 'Bhadra (Aug Peak: Rs 386.7)',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80',
    color: '#78716c',
    emoji: '🍄',
  },
  {
    id: 'pumpkin',
    name: 'Pumpkin',
    nameNepali: 'फर्सी',
    category: 'vegetable',
    categoryNepali: 'तरकारी',
    fallbackCurrent: 43,
    fallbackMin: 34,
    fallbackMax: 52,
    arrivalsTodayTons: 27.0,
    arrivalsYesterdayTons: 26.5,
    confidenceScore: 91,
    bestSellingMandi: 'Kalimati & Butwal Mandi',
    bestSellingMandiNepali: 'कालीमाटी र बुटवल मन्डी',
    harvestWindowFallback: 'Bhadra (Aug Peak: Rs 52.0)',
    image: 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=600&auto=format&fit=crop&q=80',
    color: '#d97706',
    emoji: '🎃',
  },
  {
    id: 'radish',
    name: 'White Radish',
    nameNepali: 'सेतो मूला',
    category: 'vegetable',
    categoryNepali: 'तरकारी',
    fallbackCurrent: 37,
    fallbackMin: 28,
    fallbackMax: 55,
    arrivalsTodayTons: 33.0,
    arrivalsYesterdayTons: 32.0,
    confidenceScore: 90,
    bestSellingMandi: 'Kalimati & Surkhet Mandi',
    bestSellingMandiNepali: 'कालीमाटी र सुर्खेत मन्डी',
    harvestWindowFallback: 'Ashwin (Oct Peak: Rs 54.9)',
    image: 'https://images.unsplash.com/photo-1590868309235-ea34bed7bd7f?w=600&auto=format&fit=crop&q=80',
    color: '#71717a',
    emoji: '🥕',
  },
  {
    id: 'spinach',
    name: 'Palungo Spinach',
    nameNepali: 'पालुङ्गो साग',
    category: 'vegetable',
    categoryNepali: 'सागसब्जी',
    fallbackCurrent: 91,
    fallbackMin: 49,
    fallbackMax: 163,
    arrivalsTodayTons: 12.0,
    arrivalsYesterdayTons: 11.5,
    confidenceScore: 83,
    bestSellingMandi: 'Kalimati & Kathmandu Valley',
    bestSellingMandiNepali: 'कालीमाटी र उपत्यका बजार',
    harvestWindowFallback: 'Ashwin (Oct Peak: Rs 162.8)',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80',
    color: '#15803d',
    emoji: '🥬',
  },
  {
    id: 'sweet_potato',
    name: 'Sweet Potato',
    nameNepali: 'सखरखण्ड',
    category: 'vegetable',
    categoryNepali: 'कन्दमूल / तरकारी',
    fallbackCurrent: 48,
    fallbackMin: 38,
    fallbackMax: 65,
    arrivalsTodayTons: 10.5,
    arrivalsYesterdayTons: 10.0,
    confidenceScore: 86,
    bestSellingMandi: 'Kalimati & Attariya Mandi',
    bestSellingMandiNepali: 'कालीमाटी र अत्तरिया मन्डी',
    harvestWindowFallback: 'Poush - Magh (Maghe Sankranti Peak)',
    image: 'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=600&auto=format&fit=crop&q=80',
    color: '#c2410c',
    emoji: '🍠',
  },
];

function buildCommoditySeeds(): Commodity[] {
  const currentMonthIdx = new Date().getMonth();
  return SEED_DEFINITIONS.map((def) => {
    const datasetCrop = getKalimatiCrop(def.id);
    const monthSeason = datasetCrop?.monthlySeasonality?.[currentMonthIdx];
    const currentPrice = monthSeason ? Math.round(monthSeason.avgPriceNPR) : def.fallbackCurrent;
    const minPrice = monthSeason ? Math.round(monthSeason.p25NPR) : def.fallbackMin;
    const maxPrice = monthSeason ? Math.round(monthSeason.p75NPR) : def.fallbackMax;
    const harvestWindow = datasetCrop
      ? `${datasetCrop.peakWindow.month} Peak: Rs ${datasetCrop.peakWindow.historicalAvgPrice}/kg`
      : def.harvestWindowFallback;

    const forecast = PriceHistoryService.computeForecast(def.id, currentPrice, {
      currentPrice,
      forecast7Day: Math.round(currentPrice * 1.04),
      forecast14Day: Math.round(currentPrice * 1.07),
      forecast30Day: Math.round(currentPrice * 1.1),
      threeMonthForecast: Math.round(currentPrice * 1.08),
      fiveMonthForecast: Math.round(currentPrice * 0.96),
    });

    return {
      id: def.id,
      name: def.name,
      nameNepali: def.nameNepali,
      category: def.category,
      categoryNepali: def.categoryNepali,
      currentPrice,
      minPrice,
      maxPrice,
      yesterdayPrice: Math.max(8, Math.round(currentPrice * 0.97)),
      unit: 'kg',
      unitNepali: 'केजी',
      arrivalsTodayTons: def.arrivalsTodayTons,
      arrivalsYesterdayTons: def.arrivalsYesterdayTons,
      sentiment: forecast.forecast7Day >= currentPrice ? 'bullish' : 'neutral',
      confidenceScore: def.confidenceScore,
      forecast7Day: forecast.forecast7Day,
      forecast14Day: forecast.forecast14Day,
      forecast30Day: forecast.forecast30Day,
      threeMonthForecast: forecast.threeMonthForecast,
      fiveMonthForecast: forecast.fiveMonthForecast,
      seasonalityScore: 88,
      harvestWindow,
      bestSellingMandi: def.bestSellingMandi,
      bestSellingMandiNepali: def.bestSellingMandiNepali,
      interDistrictArbitrageNPR: Math.max(6, Math.round(currentPrice * 0.24)),
      image: def.image,
      color: def.color,
      emoji: def.emoji,
    };
  });
}

export const COMMODITY_SEEDS: Commodity[] = buildCommoditySeeds();

export const MARKET_DISRUPTIONS: MarketDisruption[] = [
  {
    id: 'disrupt-1',
    title: 'Narayanghat-Mugling Highway Road Expansion Delay',
    titleNepali: 'नारायणगढ-मुग्लिन सडक विस्तारका कारण रात्रिकालीन जाम',
    type: 'road_block',
    severity: 'high',
    impactedCrops: ['tomato', 'cauliflower', 'chilli', 'green_chilli'],
    impactedDistricts: ['chitwan', 'makwanpur', 'rupandehi', 'kailali'],
    description: 'Landslide clearance and road widening between Tuin Khola causing 3-5 hour delays for night vegetable trucks entering Kathmandu.',
    descriptionNepali: 'तुइन खोला नजिक सडक मर्मतले गर्दा राति काठमाडौं जाने तरकारीका गाडीहरू ३ देखि ५ घण्टा ढिलाइ भइरहेको छ।',
    actionRecommendation: 'Dispatch vehicles by 3:00 PM or route western Tarai cargo into Butwal/Pokhara regional hubs.',
    actionRecommendationNepali: 'गोलभेडा बिग्रन नदिन दिउँसो ३ बजेभित्र गाडी पठाउनुहोस् वा बुटवल/पोखरा क्षेत्रीय बजार प्रयोग गर्नुहोस्।',
    reportedDate: 'Today, 06:30 AM',
  },
  {
    id: 'disrupt-2',
    title: 'Seasonal Festival & Urban Hospitality Demand Surge',
    titleNepali: 'चाडपर्व र सहरी होटल मागमा भारी वृद्धि',
    type: 'festival_demand',
    severity: 'medium',
    impactedCrops: ['potato', 'onion', 'cauliflower', 'capsicum'],
    impactedDistricts: ['kathmandu', 'pokhara', 'jhapa', 'morang', 'rupandehi'],
    description: 'Hospitality and banquet demand rising ~26% across Kathmandu, Pokhara, Biratnagar, and Butwal terminal mandis.',
    descriptionNepali: 'काठमाडौं, पोखरा, विराटनगर र बुटवलका थोक बजारमा आलु, प्याज र काउलीको माग २६% ले बढेको छ।',
    actionRecommendation: 'Grade A cauliflower and capsicum lots qualify for direct hospitality buyer premiums.',
    actionRecommendationNepali: 'ग्रेड-ए काउली र भेडे खुर्सानी सिधै थोक वा होटल खरिदकर्तालाई बिक्री गरी उच्च मूल्य लिनुहोस्।',
    reportedDate: 'Yesterday',
  },
  {
    id: 'disrupt-3',
    title: 'Kakarbhitta & Birgunj Border Quarantine Fast-Track Clearance',
    titleNepali: 'काँकडभिट्टा र वीरगञ्ज नाकामा कृषि निर्यात जाँच सहजीकरण',
    type: 'border_tariff',
    severity: 'low',
    impactedCrops: ['ginger', 'garlic', 'tomato', 'cabbage'],
    impactedDistricts: ['jhapa', 'ilam', 'parsa', 'sarlahi'],
    description: 'Single-window phytosanitary testing at Kakarbhitta and Birgunj ICP reduces border wait time by 5 hours for washed ginger & off-season cabbage.',
    descriptionNepali: 'काँकडभिट्टा र वीरगञ्ज भन्सारमा एकद्वार परीक्षणले गर्दा अदुवा र बन्दा निर्यात ५ घण्टा छिटो भइरहेको छ।',
    actionRecommendation: 'Eastern & Madhesh cooperatives can pool sorted 5-MT lots for cross-border dispatch.',
    actionRecommendationNepali: 'झापा, इलाम र सर्लाहीका सहकारीहरूले ५ टनको समूह बनाएर नाका तर्फ पठाउन सक्छन्।',
    reportedDate: 'Today, 08:00 AM',
  },
];

export class MarketDataService {
  private static activeCommodities: Commodity[] = COMMODITY_SEEDS.map((c) => ({ ...c }));
  private static fullBulletin: ScrapedPriceItem[] = [];
  private static isInitialized = false;
  private static scraperTimer: NodeJS.Timeout | null = null;
  private static lastScrapeTime: string = new Date().toISOString();
  private static lastScrapeSource: 'live' | 'fallback' = 'fallback';

  public static init(): void {
    if (this.isInitialized) return;
    PriceHistoryService.init();
    this.refreshForecastsFromHistory();
    this.isInitialized = true;
  }

  public static getCommodities(): Commodity[] {
    if (!this.isInitialized) {
      this.init();
    }
    return this.activeCommodities;
  }

  public static getCommodity(cropId: string): Commodity | undefined {
    const clean = (cropId || '').toLowerCase().trim();
    const resolved = clean === 'green_chilli' ? 'chilli' : clean;
    return this.getCommodities().find((c) => c.id.toLowerCase() === resolved);
  }

  public static getFullBulletin(): ScrapedPriceItem[] {
    if (this.fullBulletin.length > 0) {
      return this.fullBulletin;
    }
    // Fallback to tracked core seeds formatted as bulletin items
    return this.getCommodities().map((c) => ({
      commodityId: c.id,
      rawName: c.nameNepali,
      nameEn: c.name,
      unit: c.unitNepali,
      unitEn: c.unit.toUpperCase(),
      category: c.category === 'spice' ? 'spice' : 'vegetable',
      minPrice: c.minPrice,
      maxPrice: c.maxPrice,
      avgPrice: c.currentPrice,
    }));
  }

  public static getDisruptions(): MarketDisruption[] {
    return MARKET_DISRUPTIONS;
  }

  /**
   * Resolves 3-Layer localized wholesale & farmgate price for any of Nepal's 77 districts:
   * Layer 2 (highest priority): Today's Cloud SQL verified local cooperative/mandi median report
   * Layer 1: Official Kalimati terminal rate (for Kathmandu)
   * Layer 3: AMPIS 12-hub empirical ratio + spatial highway spread
   */
  private static computeLocalizedMandiRate(
    mandi: NepalDistrictMandi,
    crop: Commodity,
    todayMedian?: {
      wholesalePrice?: number;
      farmgatePrice?: number;
      reportCount: number;
      marketName: string;
      lastReporterRole: string;
    }
  ) {
    const baseKalimati = Math.round(crop?.currentPrice || 50);
    const ampisHubKey = getAmpisHubForDistrict(mandi);
    const ampisMult = AmpisScraper.getHubMultiplier(ampisHubKey, crop.id);

    const isPrimaryAmpisDistrict = [
      'jhapa', 'sunsari', 'dhanusha', 'sarlahi', 'sindhuli',
      'kathmandu', 'nawalpur', 'pokhara', 'rupandehi', 'banke', 'surkhet', 'kailali',
    ].includes(mandi.id);

    const effectiveRatio =
      mandi.id === 'kathmandu'
        ? 1.0
        : isPrimaryAmpisDistrict && ampisMult.isAmpisDirectCropRatio
        ? ampisMult.ratio
        : Math.max(
            0.62,
            Math.min(
              1.42,
              Math.round((ampisMult.ratio * 0.7 + mandi.regionalWholesaleSpread * 0.3) * 100) / 100
            )
          );

    const farmgateFraction = Math.max(
      0.55,
      Math.min(0.88, mandi.farmgateRatio / Math.max(0.88, mandi.regionalWholesaleSpread))
    );

    let estimatedWholesalePrice =
      mandi.id === 'kathmandu' ? baseKalimati : Math.max(8, Math.round(baseKalimati * effectiveRatio));
    let estimatedFarmgatePrice = Math.max(5, Math.round(estimatedWholesalePrice * farmgateFraction));

    let priceSource: 'official_kalimati' | 'coop_verified' | 'ampis_calibrated' =
      mandi.id === 'kathmandu' ? 'official_kalimati' : 'ampis_calibrated';

    const hubShortEn = ampisMult.hubSnapshot.nameEn.split('(')[0].trim();
    const hubShortNe = ampisMult.hubSnapshot.nameNe.split(',')[0].trim();

    let priceSourceLabelEn =
      mandi.id === 'kathmandu'
        ? 'Official Kalimati Terminal'
        : ampisMult.isAmpisDirectCropRatio
        ? `AMPIS Hub Calibrated (${hubShortEn})`
        : `Regional Hub Calibrated (${hubShortEn})`;

    let priceSourceLabelNe =
      mandi.id === 'kathmandu'
        ? 'आधिकारिक कालिमाटी थोक बजार'
        : ampisMult.isAmpisDirectCropRatio
        ? `AMPIS क्षेत्रीय समायोजित (${hubShortNe})`
        : `क्षेत्रीय बजार समायोजित (${hubShortNe})`;

    let reportCount = 0;

    if (todayMedian && todayMedian.reportCount > 0) {
      reportCount = todayMedian.reportCount;
      if (typeof todayMedian.wholesalePrice === 'number' && todayMedian.wholesalePrice > 0) {
        estimatedWholesalePrice = Math.round(todayMedian.wholesalePrice);
        if (typeof todayMedian.farmgatePrice === 'number' && todayMedian.farmgatePrice > 0) {
          estimatedFarmgatePrice = Math.round(todayMedian.farmgatePrice);
        } else {
          estimatedFarmgatePrice = Math.max(5, Math.round(estimatedWholesalePrice * farmgateFraction));
        }
        priceSource = 'coop_verified';
      } else if (typeof todayMedian.farmgatePrice === 'number' && todayMedian.farmgatePrice > 0) {
        estimatedFarmgatePrice = Math.round(todayMedian.farmgatePrice);
        estimatedWholesalePrice = Math.max(
          estimatedFarmgatePrice + 3,
          Math.round(estimatedFarmgatePrice / Math.max(0.55, farmgateFraction))
        );
        priceSource = 'coop_verified';
      }

      if (priceSource === 'coop_verified') {
        priceSourceLabelEn = `Local Co-op Verified (${todayMedian.marketName})`;
        priceSourceLabelNe = `स्थानीय सहकारी प्रमाणित (${todayMedian.marketName})`;
      }
    }

    return {
      ampisHubKey,
      ampisHubNameEn: ampisMult.hubSnapshot.nameEn,
      ampisHubNameNe: ampisMult.hubSnapshot.nameNe,
      ampisRatio: effectiveRatio,
      estimatedWholesalePrice,
      estimatedFarmgatePrice,
      priceSource,
      priceSourceLabelEn,
      priceSourceLabelNe,
      reportCount,
    };
  }

  /**
   * Computes regional mandi clearing prices across all 7 provinces / 77 districts (sync baseline + AMPIS)
   */
  public static getMandisNetwork(cropId: string = 'tomato') {
    const crop = this.getCommodity(cropId) || this.getCommodities()[0];
    const baseKalimati = Math.round(crop?.currentPrice || 50);

    return NEPAL_DISTRICTS_MANDIS.map((m) => {
      const rate = this.computeLocalizedMandiRate(m, crop);
      return {
        ...m,
        referenceCropId: crop.id,
        referenceCropName: crop.name,
        referenceCropNameNepali: crop.nameNepali,
        kalimatiBenchmarkPrice: baseKalimati,
        estimatedWholesalePrice: rate.estimatedWholesalePrice,
        estimatedFarmgatePrice: rate.estimatedFarmgatePrice,
        ampisHubKey: rate.ampisHubKey,
        ampisRatio: rate.ampisRatio,
        priceSource: rate.priceSource,
        priceSourceLabelEn: rate.priceSourceLabelEn,
        priceSourceLabelNe: rate.priceSourceLabelNe,
        reportCount: 0,
        netPooledVsFarmgateGainPerKg: Math.max(
          0,
          Math.round(
            baseKalimati -
              rate.estimatedFarmgatePrice -
              m.pooledFreightPerKg -
              (baseKalimati * m.spoilageBasePct) / 100
          )
        ),
      };
    });
  }

  /**
   * Async 3-Layer version of getMandisNetwork incorporating today's Cloud SQL verified co-op/farmer reports
   */
  public static async getMandisNetworkWithReports(cropId: string = 'tomato') {
    const crop = this.getCommodity(cropId) || this.getCommodities()[0];
    const baseKalimati = Math.round(crop?.currentPrice || 50);
    const today = new Date().toISOString().split('T')[0];

    const todayByDistrict = new Map<
      string,
      {
        wholesalePrice?: number;
        farmgatePrice?: number;
        reportCount: number;
        marketName: string;
        lastReporterRole: string;
      }
    >();

    try {
      const recentReports = await DbStorageService.getDistrictPriceReports(undefined, crop.id, 300);
      const todayReports = recentReports.filter((r) => r.recordedDate === today);

      const grouped = new Map<string, DistrictPriceReportItem[]>();
      for (const r of todayReports) {
        if (!grouped.has(r.districtId)) grouped.set(r.districtId, []);
        grouped.get(r.districtId)!.push(r);
      }

      const calcMedian = (nums: number[]): number | undefined => {
        if (nums.length === 0) return undefined;
        const s = [...nums].sort((a, b) => a - b);
        const mid = Math.floor(s.length / 2);
        return s.length % 2 === 1 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
      };

      for (const [did, list] of grouped.entries()) {
        todayByDistrict.set(did, {
          wholesalePrice: calcMedian(list.filter((x) => x.priceType === 'wholesale').map((x) => x.pricePerKg)),
          farmgatePrice: calcMedian(list.filter((x) => x.priceType === 'farmgate').map((x) => x.pricePerKg)),
          reportCount: list.length,
          marketName: list[0].marketName,
          lastReporterRole: list[0].reporterRole,
        });
      }
    } catch {
      // Fallback gracefully to AMPIS + baseline
    }

    return NEPAL_DISTRICTS_MANDIS.map((m) => {
      const rate = this.computeLocalizedMandiRate(m, crop, todayByDistrict.get(m.id));
      return {
        ...m,
        referenceCropId: crop.id,
        referenceCropName: crop.name,
        referenceCropNameNepali: crop.nameNepali,
        kalimatiBenchmarkPrice: baseKalimati,
        estimatedWholesalePrice: rate.estimatedWholesalePrice,
        estimatedFarmgatePrice: rate.estimatedFarmgatePrice,
        ampisHubKey: rate.ampisHubKey,
        ampisRatio: rate.ampisRatio,
        priceSource: rate.priceSource,
        priceSourceLabelEn: rate.priceSourceLabelEn,
        priceSourceLabelNe: rate.priceSourceLabelNe,
        reportCount: rate.reportCount,
        netPooledVsFarmgateGainPerKg: Math.max(
          0,
          Math.round(
            baseKalimati -
              rate.estimatedFarmgatePrice -
              m.pooledFreightPerKg -
              (baseKalimati * m.spoilageBasePct) / 100
          )
        ),
      };
    });
  }

  /**
   * Returns 3-layer localized commodity prices across all 23 tracked crops for a specific district
   */
  public static async getDistrictCommodityPrices(districtId: string) {
    const mandi = findDistrictMandi(districtId);
    const todayMedians = await DbStorageService.getTodayDistrictMedianPrices(mandi.id);
    const recentReports = await DbStorageService.getDistrictPriceReports(mandi.id, undefined, 25);

    const prices = this.getCommodities().map((c) => {
      const rate = this.computeLocalizedMandiRate(mandi, c, todayMedians.get(c.id));
      return {
        cropId: c.id,
        name: c.name,
        nameNepali: c.nameNepali,
        kalimatiPrice: Math.round(c.currentPrice),
        localizedWholesalePrice: rate.estimatedWholesalePrice,
        localizedFarmgatePrice: rate.estimatedFarmgatePrice,
        ampisRatio: rate.ampisRatio,
        priceSource: rate.priceSource,
        priceSourceLabelEn: rate.priceSourceLabelEn,
        priceSourceLabelNe: rate.priceSourceLabelNe,
        reportCount: rate.reportCount,
      };
    });

    const ampisHubKey = getAmpisHubForDistrict(mandi);
    const ampisSnap = AmpisScraper.getHubMultiplier(ampisHubKey).hubSnapshot;

    return {
      district: mandi,
      ampisHub: ampisSnap,
      prices,
      recentReports,
    };
  }

  /**
   * Dynamic district-aware arbitrage table across all tracked crops for a given district
   */
  public static getArbitrageData(district: string = 'chitwan') {
    const mandi = findDistrictMandi(district);
    return this.getCommodities().map((c) => {
      const localFarmgatePrice = Math.round(c.currentPrice * mandi.farmgateRatio);
      const targetWholesalePrice = Math.round(c.currentPrice);
      const grossArbitrageNPR = Math.max(0, targetWholesalePrice - localFarmgatePrice);
      const spoilageCost = Math.round(((c.currentPrice * mandi.spoilageBasePct) / 100) * 10) / 10;
      const netPooledGainPerKg = Math.round((grossArbitrageNPR - mandi.pooledFreightPerKg - spoilageCost) * 10) / 10;

      return {
        cropId: c.id,
        cropName: c.name,
        cropNameNepali: c.nameNepali,
        districtId: mandi.id,
        districtName: mandi.name,
        province: mandi.province,
        fromMandi: mandi.mandiName,
        toMandi: mandi.nearestTerminalName,
        highwayRoute: mandi.highwayRoute,
        distanceKm: mandi.distanceToKalimatiKm,
        localFarmgatePrice,
        kalimatiWholesalePrice: targetWholesalePrice,
        grossArbitrageNPR,
        soloTransportCostPerKg: mandi.soloFreightPerKg,
        pooledTransportCostPerKg: mandi.pooledFreightPerKg,
        spoilageCostPerKg: spoilageCost,
        netPooledGainPerKg,
        emoji: c.emoji,
      };
    });
  }

  /**
   * Computes ranked nationwide domestic & cross-border corridor arbitrage opportunities
   * grounded in live scraped Kalimati terminal rates and actual highway/customs costs.
   */
  public static getNationwideCorridors(district?: string) {
    const byId = (id: string) => this.getCommodity(id) || this.getCommodities()[0];
    const tomato = byId('tomato');
    const potato = byId('potato');
    const onion = byId('onion');
    const capsicum = byId('capsicum');
    const cauliflower = byId('cauliflower');
    const garlic = byId('garlic');
    const ginger = byId('ginger');
    const cabbage = byId('cabbage');

    const corridorTemplates: Array<{
      commodity: Commodity;
      fromMandi: NepalDistrictMandi;
      toLocation: string;
      type: 'cross_border' | 'domestic';
      borderPoint?: string;
      sourceMultiplier: number;
      targetMultiplier: number;
      transportCost: number;
      spoilageCost: number;
      customsCost: number;
      travelHours: number;
      route: string;
      riskScore: number;
    }> = [
      {
        commodity: tomato,
        fromMandi: findDistrictMandi('sarlahi'),
        toLocation: 'Kalimati Terminal (Kathmandu)',
        type: 'domestic',
        sourceMultiplier: 0.67,
        targetMultiplier: 1.0,
        transportCost: 3.6,
        spoilageCost: 1.9,
        customsCost: 0,
        travelHours: 6.5,
        route: 'Lalbandi → Bardibas → BP Highway',
        riskScore: 3.1,
      },
      {
        commodity: onion,
        fromMandi: findDistrictMandi('parsa'),
        toLocation: 'Pokhara Krishi Bazar (Gandaki)',
        type: 'cross_border',
        borderPoint: 'Birgunj / Raxaul ICP',
        sourceMultiplier: 0.72,
        targetMultiplier: 1.05,
        transportCost: 4.8,
        spoilageCost: 1.4,
        customsCost: 2.2,
        travelHours: 6.0,
        route: 'Birgunj → Narayanghat → Mugling → Pokhara',
        riskScore: 3.9,
      },
      {
        commodity: capsicum,
        fromMandi: findDistrictMandi('chitwan'),
        toLocation: 'Kalimati Terminal (Kathmandu)',
        type: 'domestic',
        sourceMultiplier: 0.73,
        targetMultiplier: 1.0,
        transportCost: 3.4,
        spoilageCost: 2.0,
        customsCost: 0,
        travelHours: 4.8,
        route: 'Narayanghat → Mugling → Prithvi Highway',
        riskScore: 4.2,
      },
      {
        commodity: ginger,
        fromMandi: findDistrictMandi('ilam'),
        toLocation: 'Birtamod & Kakarbhitta Export Hub (Koshi)',
        type: 'cross_border',
        borderPoint: 'Kakarbhitta / Panitanki',
        sourceMultiplier: 0.66,
        targetMultiplier: 0.98,
        transportCost: 4.2,
        spoilageCost: 1.5,
        customsCost: 2.5,
        travelHours: 3.2,
        route: 'Ilam → Charali → Kakarbhitta Mechi Corridor',
        riskScore: 2.8,
      },
      {
        commodity: potato,
        fromMandi: findDistrictMandi('dadeldhura'),
        toLocation: 'Attariya & Dhangadhi Mandi (Sudurpashchim)',
        type: 'domestic',
        sourceMultiplier: 0.67,
        targetMultiplier: 0.96,
        transportCost: 3.8,
        spoilageCost: 1.1,
        customsCost: 0,
        travelHours: 4.0,
        route: 'Amargadhi → Bhimdatta Pant Highway → Attariya',
        riskScore: 3.0,
      },
      {
        commodity: garlic,
        fromMandi: findDistrictMandi('jumla'),
        toLocation: 'Surkhet & Nepalgunj Wholesale (Karnali/Lumbini)',
        type: 'domestic',
        sourceMultiplier: 0.63,
        targetMultiplier: 0.95,
        transportCost: 6.4,
        spoilageCost: 2.2,
        customsCost: 0,
        travelHours: 9.5,
        route: 'Jumla → Karnali Highway → Birendranagar → Nepalgunj',
        riskScore: 4.6,
      },
      {
        commodity: cauliflower,
        fromMandi: findDistrictMandi('dhading'),
        toLocation: 'Pokhara Wholesale Market (Gandaki)',
        type: 'domestic',
        sourceMultiplier: 0.74,
        targetMultiplier: 1.04,
        transportCost: 3.5,
        spoilageCost: 1.8,
        customsCost: 0,
        travelHours: 4.5,
        route: 'Charaundi → Mugling → Prithvi Highway West',
        riskScore: 3.4,
      },
      {
        commodity: cabbage,
        fromMandi: findDistrictMandi('palpa'),
        toLocation: 'Butwal & Bhairahawa Mandi (Lumbini)',
        type: 'cross_border',
        borderPoint: 'Belahiya / Sunauli',
        sourceMultiplier: 0.71,
        targetMultiplier: 0.96,
        transportCost: 2.6,
        spoilageCost: 1.1,
        customsCost: 1.5,
        travelHours: 1.5,
        route: 'Tansen → Siddhartha Highway → Butwal/Sunauli',
        riskScore: 2.6,
      },
    ];

    const computed = corridorTemplates.map((tpl) => {
      const sourcePrice = Math.round(tpl.commodity.currentPrice * tpl.sourceMultiplier * 10) / 10;
      const targetPrice = Math.round(tpl.commodity.currentPrice * tpl.targetMultiplier * 10) / 10;
      const totalCost = Math.round((sourcePrice + tpl.transportCost + tpl.spoilageCost + tpl.customsCost) * 100) / 100;
      const netProfit = Math.round((targetPrice - totalCost) * 100) / 100;
      const profitMarginPct = totalCost > 0 ? Math.round((netProfit / totalCost) * 1000) / 10 : 0;
      const breakEvenVolumeKg = Math.max(150, Math.round(5000 / Math.max(1.5, netProfit)));

      let signal: 'strong_buy' | 'buy' | 'weak' | 'none' | 'avoid' = 'weak';
      if (profitMarginPct >= 18) signal = 'strong_buy';
      else if (profitMarginPct >= 10) signal = 'buy';
      else if (netProfit <= 0) signal = 'avoid';

      return {
        commodity: tpl.commodity.id,
        commodityName: tpl.commodity.name,
        commodityNameNepali: tpl.commodity.nameNepali,
        emoji: tpl.commodity.emoji,
        fromLocation: `${tpl.fromMandi.mandiName} (${tpl.fromMandi.province})`,
        fromDistrictId: tpl.fromMandi.id,
        toLocation: tpl.toLocation,
        type: tpl.type,
        borderPoint: tpl.borderPoint,
        sourcePrice,
        targetPrice,
        transportCost: tpl.transportCost,
        spoilageCost: tpl.spoilageCost,
        customsCost: tpl.customsCost,
        totalCost,
        netProfit,
        profitMarginPct,
        travelHours: tpl.travelHours,
        route: tpl.route,
        riskScore: tpl.riskScore,
        breakEvenVolumeKg,
        signal,
      };
    });

    if (district) {
      const selected = findDistrictMandi(district);
      computed.sort((a, b) => {
        const aMatch = a.fromDistrictId === selected.id ? 1 : 0;
        const bMatch = b.fromDistrictId === selected.id ? 1 : 0;
        if (aMatch !== bMatch) return bMatch - aMatch;
        return b.profitMarginPct - a.profitMarginPct;
      });
    } else {
      computed.sort((a, b) => b.profitMarginPct - a.profitMarginPct);
    }

    return computed;
  }

  public static getLastScrapeInfo() {
    return {
      lastScrapeTime: this.lastScrapeTime,
      source: this.lastScrapeSource,
      totalBulletinCount: this.fullBulletin.length || this.activeCommodities.length,
    };
  }

  public static refreshForecastsFromHistory(): void {
    const updated = this.activeCommodities.map((crop) => {
      const seed = COMMODITY_SEEDS.find((s) => s.id === crop.id) || crop;
      const forecast = PriceHistoryService.computeForecast(crop.id, crop.currentPrice, seed);

      const history = PriceHistoryService.getHistory(crop.id, 7);
      let sentiment: 'bullish' | 'bearish' | 'neutral' = crop.sentiment;
      let yesterdayPrice = crop.yesterdayPrice;

      if (history.length >= 2) {
        yesterdayPrice = history[history.length - 2].price;
        const diff = crop.currentPrice - yesterdayPrice;
        const pct = yesterdayPrice > 0 ? (diff / yesterdayPrice) * 100 : 0;
        if (pct >= 1.5) sentiment = 'bullish';
        else if (pct <= -1.5) sentiment = 'bearish';
        else sentiment = 'neutral';
      }

      return {
        ...crop,
        yesterdayPrice,
        sentiment,
        forecast7Day: forecast.forecast7Day,
        forecast14Day: forecast.forecast14Day,
        forecast30Day: forecast.forecast30Day,
        threeMonthForecast: forecast.threeMonthForecast,
        fiveMonthForecast: forecast.fiveMonthForecast,
      };
    });

    this.activeCommodities = updated;
  }

  public static async syncLiveMarketData(): Promise<{ source: 'live' | 'fallback'; count: number; totalBulletinCount: number; ampisSyncedHubs?: number }> {
    this.init();

    try {
      const [result, ampisResult] = await Promise.all([
        KalimatiScraper.scrapeDailyPrices(),
        AmpisScraper.syncRegionalHubs().catch(() => ({ source: 'calibrated_ampis_baseline' as const, syncedHubs: 0, lastSyncedAt: '' })),
      ]);
      this.lastScrapeTime = result.scrapedAt;
      this.lastScrapeSource = result.source;
      if (result.fullBulletin && result.fullBulletin.length > 0) {
        this.fullBulletin = result.fullBulletin;
      }

      const today = new Date().toISOString().split('T')[0];
      const recordsToSave: PriceRecord[] = [];

      const newCommodities = this.activeCommodities.map((existing) => {
        const scraped = result.commodities.find((c) => c.id === existing.id);

        const currentPrice = scraped ? scraped.currentPrice : existing.currentPrice;
        const minPrice = scraped ? scraped.minPrice : existing.minPrice;
        const maxPrice = scraped ? scraped.maxPrice : existing.maxPrice;

        recordsToSave.push({
          cropId: existing.id,
          date: today,
          price: currentPrice,
          minPrice,
          maxPrice,
          source: result.source,
        });

        return {
          ...existing,
          currentPrice,
          minPrice,
          maxPrice,
          yesterdayPrice: scraped ? scraped.yesterdayPrice : existing.yesterdayPrice,
        };
      });

      this.activeCommodities = newCommodities;

      PriceHistoryService.saveRecords(recordsToSave);
      console.log(`[Kalimati] Saved today's price history across ${recordsToSave.length} crops.`);

      // Archive tracked crops into Cloud SQL asynchronously with duplicate protection
      for (const r of recordsToSave) {
        const meta = newCommodities.find((c) => c.id === r.cropId);
        DbStorageService.archiveDailyPrice(
          r.cropId,
          meta?.name || r.cropId,
          r.minPrice || r.price,
          r.maxPrice || r.price,
          r.price,
          r.source || 'live'
        ).catch(() => null);
      }

      this.refreshForecastsFromHistory();
      console.log('[Kalimati] Forecasts updated across all 23 crops.');

      // Trigger automated price threshold alert worker non-blockingly after sync
      import('./alertWorkerService')
        .then((m) => m.AlertWorkerService.evaluateAndDispatchAlerts('scheduled_sync'))
        .catch(() => null);

      return {
        source: result.source,
        count: result.commodities.length,
        totalBulletinCount: result.totalBulletinCount || result.commodities.length,
        ampisSyncedHubs: ampisResult.syncedHubs,
      };
    } catch (err: any) {
      console.warn('[Kalimati] WARNING: Live scraping failed. Using fallback seed data.', err?.message || err);
      this.lastScrapeSource = 'fallback';
      this.refreshForecastsFromHistory();
      return {
        source: 'fallback',
        count: COMMODITY_SEEDS.length,
        totalBulletinCount: COMMODITY_SEEDS.length,
      };
    }
  }

  public static initializeAutoScraper(): void {
    this.init();

    if (this.scraperTimer) {
      clearInterval(this.scraperTimer);
      this.scraperTimer = null;
    }

    this.syncLiveMarketData().catch((err) => {
      console.warn('[Kalimati] Initial automatic scrape encountered error:', err);
    });

    const SIX_HOURS = 6 * 60 * 60 * 1000;
    this.scraperTimer = setInterval(() => {
      this.syncLiveMarketData().catch((err) => {
        console.warn('[Kalimati] Scheduled 6h market sync encountered error:', err);
      });
    }, SIX_HOURS);

    console.log('[Kalimati] 6-hour nationwide market intelligence sync interval registered.');
  }
}
