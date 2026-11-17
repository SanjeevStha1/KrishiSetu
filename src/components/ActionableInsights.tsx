import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Truck,
  MapPin,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Clock,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Plus,
  Check,
  X,
  Store,
  BarChart3,
  Users,
  Layers,
  Sprout,
  ChevronDown,
  ChevronUp,
  Phone,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import { Commodity, UserProfile } from '../types/krishi';
import { DISTRICT_LIST, COMMODITY_SEEDS, getRecommendationsForDistrict } from '../data/agriData';
import { CropIllustration } from './CropIllustration';
import { CropSelectionModal } from './CropSelectionModal';
import { useLanguage } from '../context/LanguageContext';
import { marketApi } from '../api/marketApi';
import { AppTab } from './Header';

interface ActionableInsightsProps {
  commodities: Commodity[];
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  userProfile?: UserProfile;
  activeCropId: string;
  setActiveCropId: (cropId: string) => void;
  onNavigateTab?: (tab: AppTab, extra?: { commodityId?: string }) => void;
  onNavigateToSell?: (cropId: string) => void;
  dashboardMode?: 'my_data' | 'market_data';
  setDashboardMode?: (mode: 'my_data' | 'market_data') => void;
  marketDataView?: React.ReactNode;
}

export const ActionableInsights: React.FC<ActionableInsightsProps> = ({
  commodities,
  selectedDistrict,
  setSelectedDistrict,
  userProfile,
  activeCropId,
  setActiveCropId,
  onNavigateTab,
  onNavigateToSell,
  dashboardMode = 'my_data',
  setDashboardMode,
  marketDataView,
}) => {
  const { t, language } = useLanguage();
  const isNe = language === 'ne';

  const currentDistrictObj = useMemo(() => {
    return DISTRICT_LIST.find((d) => d.id.toLowerCase() === selectedDistrict.toLowerCase()) || DISTRICT_LIST[0];
  }, [selectedDistrict]);

  // Farmer's available crops list with local storage persistence
  const [availableCropIds, setAvailableCropIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('krishi_farmer_available_crops');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    if (userProfile?.primaryCrops && userProfile.primaryCrops.length > 0) {
      return userProfile.primaryCrops;
    }
    return ['tomato', 'potato', 'cauliflower', 'cabbage', 'onion', 'capsicum'];
  });

  const [isAddCropModalOpen, setIsAddCropModalOpen] = useState<boolean>(false);

  // When crops are updated from CropSelectionModal
  const handleSaveCrops = (newCropIds: string[]) => {
    setAvailableCropIds(newCropIds);
    try {
      localStorage.setItem('krishi_farmer_available_crops', JSON.stringify(newCropIds));
    } catch {
      // ignore
    }
    if (!newCropIds.includes(activeCropId) && newCropIds.length > 0) {
      setActiveCropId(newCropIds[0]);
    }
  };

  // When farmer harvested the crop (days ago: 0 = Today, 1 = 1 day ago, 2 = 2 days ago, 3 = 3+ days ago)
  const [harvestDaysAgo, setHarvestDaysAgo] = useState<number>(0);

  // Simulation toggles for pool & buyer states
  const [hasPoolNearby, setHasPoolNearby] = useState<boolean>(() => {
    // Default: corridor districts have pools active
    const corridor = ['dhading', 'kavre', 'chitwan', 'makwanpur', 'nuwakot', 'kathmandu', 'pokhara'];
    return corridor.includes(selectedDistrict.toLowerCase());
  });

  const [hasBuyerNearby, setHasBuyerNearby] = useState<boolean>(true);

  // Calendar Route Dispatcher states (Matching Image 2)
  const [selectedDispatchDate, setSelectedDispatchDate] = useState<string>('date-4'); // Defaults to 'date-4' (27 Sat)
  const [selectedDestination, setSelectedDestination] = useState<string>('all');
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);

  // Active crop object
  const activeCrop = useMemo(() => {
    return (
      commodities.find((c) => c.id === activeCropId) ||
      commodities.find((c) => c.id === availableCropIds[0]) ||
      commodities[0]
    );
  }, [commodities, activeCropId, availableCropIds]);

  // Crop shelf-life characteristics
  const cropShelfLifeDays = useMemo(() => {
    if (!activeCrop) return 5;
    if (activeCrop.category === 'staple') return 30; // Potato, Onion, etc.
    if (activeCrop.category === 'spices') return 60; // Ginger, Garlic
    if (activeCrop.id === 'tomato') return 5;
    if (activeCrop.id === 'cauliflower' || activeCrop.id === 'cabbage') return 6;
    if (activeCrop.id === 'spinach' || activeCrop.id === 'coriander') return 3;
    return 5;
  }, [activeCrop]);

  // Real price history from backend
  const [priceHistory, setPriceHistory] = useState<Array<{ date: string; price: number }>>([]);

  useEffect(() => {
    if (!activeCrop?.id) return;
    let cancelled = false;
    marketApi.getPriceHistory(activeCrop.id, 14)
      .then((res) => {
        if (!cancelled && res?.history && res.history.length > 0) {
          setPriceHistory(res.history);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [activeCrop?.id]);

  // Recommended crop for highest yield for the selected area
  const highestYieldRecommendation = useMemo(() => {
    const recs = getRecommendationsForDistrict(selectedDistrict.toLowerCase());
    const topRec = recs[0];
    if (!topRec) return null;
    const yieldMtPerHa =
      topRec.crop === 'cabbage'
        ? '28–32 MT/ha'
        : topRec.crop === 'potato'
        ? '22–26 MT/ha'
        : topRec.crop === 'tomato'
        ? '20–25 MT/ha'
        : '18–22 MT/ha';
    return {
      ...topRec,
      yieldMtPerHa,
    };
  }, [selectedDistrict]);

  // -------------------------------------------------------------------------
  // 14-DAY PRICE TRAJECTORY (1 WEEK BEFORE + PREDICTION OF 1 WEEK AFTER)
  // -------------------------------------------------------------------------
  const chartData14Days = useMemo(() => {
    if (!activeCrop) return { points: [], peakPoint: null, minPrice: 0, maxPrice: 100, currentPrice: 50, yesterdayPrice: 50 };

    const currentPrice = Math.round(activeCrop.currentPrice);
    const yesterdayPrice = Math.round(activeCrop.yesterdayPrice ?? activeCrop.previousClose ?? currentPrice);
    const forecast7Day = Math.round(activeCrop.forecast7Day ?? (currentPrice * (activeCrop.changePct >= 0 ? 1.05 : 0.96)));
    const isPerishable = activeCrop.category === 'perishable';

    const points: Array<{
      dayKey: string;
      dayLabel: string;
      dateStr: string;
      price: number;
      actualPrice: number | null;
      predictedPrice: number | null;
      type: 'actual' | 'today' | 'predicted';
    }> = [];

    const now = new Date();
    const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayNamesNe = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिही', 'शुक्र', 'शनि'];

    // Map history records by date
    const historyMap = new Map<string, number>();
    for (const h of priceHistory) {
      if (h && h.date && typeof h.price === 'number') {
        historyMap.set(h.date, Math.round(h.price));
      }
    }

    // 1. Past 7 days (day -7 to day -1)
    for (let i = 7; i >= 1; i--) {
      const pastDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = pastDate.toISOString().split('T')[0];
      const dayName = isNe ? dayNamesNe[pastDate.getDay()] : dayNamesEn[pastDate.getDay()];
      
      let computedPrice: number;
      if (i === 1) {
        // Day -1 is explicitly yesterday's old rate!
        computedPrice = yesterdayPrice;
      } else if (historyMap.has(dateKey)) {
        computedPrice = historyMap.get(dateKey)!;
      } else {
        // Smooth backward interpolation leading to yesterday's price
        const step = (7 - i) / 6;
        const anchor = Math.round(yesterdayPrice * (0.94 + Math.sin(i * 0.5) * 0.04));
        computedPrice = Math.round(anchor * (1 - step) + yesterdayPrice * step);
      }

      points.push({
        dayKey: `-${i}d`,
        dayLabel: i === 1 ? (isNe ? `हिजो (${dayName})` : `Yesterday (${dayName})`) : `-${i}d (${dayName})`,
        dateStr: pastDate.toLocaleDateString(isNe ? 'ne-NP' : 'en-US', { month: 'short', day: 'numeric' }),
        price: computedPrice,
        actualPrice: computedPrice,
        predictedPrice: null,
        type: 'actual',
      });
    }

    // 2. Today (Day 0) - Bridge point with both actual and predicted values for continuous line
    const todayName = isNe ? dayNamesNe[now.getDay()] : dayNamesEn[now.getDay()];
    points.push({
      dayKey: 'Today',
      dayLabel: isNe ? `आज (${todayName})` : `Today (${todayName})`,
      dateStr: now.toLocaleDateString(isNe ? 'ne-NP' : 'en-US', { month: 'short', day: 'numeric' }),
      price: currentPrice,
      actualPrice: currentPrice,
      predictedPrice: currentPrice,
      type: 'today',
    });

    // 3. Next 7 days (+1d to +7d prediction)
    let predictedPeakPrice = currentPrice;
    let peakDayIdx = 0;

    for (let j = 1; j <= 7; j++) {
      const futureDate = new Date(now.getTime() + j * 24 * 60 * 60 * 1000);
      const dayName = isNe ? dayNamesNe[futureDate.getDay()] : dayNamesEn[futureDate.getDay()];

      let predPrice: number;
      const progress = j / 7;
      if (isPerishable && currentPrice >= 50) {
        if (j <= 2) {
          predPrice = Math.round(currentPrice + j * 3.5);
        } else {
          predPrice = Math.round(currentPrice + 7 - (j - 2) * 4);
        }
      } else if (activeCrop.changePct <= -3) {
        if (j <= 4) {
          predPrice = Math.round(currentPrice + j * 2.2);
        } else {
          predPrice = Math.round(currentPrice + 9 + (j - 4) * 0.8);
        }
      } else {
        const targetDiff = forecast7Day - currentPrice;
        predPrice = Math.round(currentPrice + targetDiff * progress + Math.sin(progress * Math.PI) * 2.5);
      }

      predPrice = Math.max(10, predPrice);

      if (predPrice > predictedPeakPrice) {
        predictedPeakPrice = predPrice;
        peakDayIdx = j;
      }

      points.push({
        dayKey: `+${j}d`,
        dayLabel: `+${j}d (${dayName})`,
        dateStr: futureDate.toLocaleDateString(isNe ? 'ne-NP' : 'en-US', { month: 'short', day: 'numeric' }),
        price: predPrice,
        actualPrice: null,
        predictedPrice: predPrice,
        type: 'predicted',
      });
    }

    const allPrices = points.map((p) => p.price);
    const minPrice = Math.max(0, Math.min(...allPrices) - 4);
    const maxPrice = Math.max(...allPrices) + 4;

    const peakPoint = points.find((p) => p.dayKey === `+${peakDayIdx}d`) || points[7];

    return {
      points,
      peakPoint: {
        ...peakPoint,
        peakDayIdx,
        peakPrice: predictedPeakPrice,
        diffVsCurrent: predictedPeakPrice - currentPrice,
      },
      minPrice,
      maxPrice,
      currentPrice,
      yesterdayPrice,
    };
  }, [activeCrop, priceHistory, isNe]);

  // -------------------------------------------------------------------------
  // CARD 1 & 2 COMPUTATIONS (HARVEST TIMING & SELL VERDICT)
  // -------------------------------------------------------------------------
  const decisionEngine = useMemo(() => {
    const currentPrice = chartData14Days.currentPrice;
    const peakInfo = chartData14Days.peakPoint;
    const peakDay = peakInfo ? peakInfo.peakDayIdx : 0;
    const peakPrice = peakInfo ? peakInfo.peakPrice : currentPrice;
    const priceDiff = peakPrice - currentPrice;

    // Remaining shelf life from harvest date
    const remainingDays = Math.max(0, cropShelfLifeDays - harvestDaysAgo);

    let sellInDays: number;
    let verdict: 'SELL_NOW' | 'SELL_LATER';
    let headlineEn: string;
    let headlineNe: string;
    let reasonShortEn: string;
    let reasonShortNe: string;

    if (remainingDays <= 1 || (cropShelfLifeDays <= 6 && harvestDaysAgo >= 3)) {
      // Perishability emergency: cannot wait
      sellInDays = 0;
      verdict = 'SELL_NOW';
      headlineEn = 'SELL TODAY';
      headlineNe = 'आजै बेच्नुहोस्';
      reasonShortEn = 'Produce near expiry limit';
      reasonShortNe = 'गल्ने समय नजिकियो';
    } else if (peakDay > 0 && priceDiff >= 3 && peakDay <= remainingDays) {
      // Worth waiting for peak
      sellInDays = peakDay;
      verdict = 'SELL_LATER';
      headlineEn = `SELL IN ${sellInDays} DAYS`;
      headlineNe = `${sellInDays} दिनपछि बेच्नुहोस्`;
      reasonShortEn = `+Rs ${priceDiff}/kg peak projection`;
      reasonShortNe = `+रु ${priceDiff}/केजी उच्च दर`;
    } else if (priceDiff <= 0) {
      // Price is dropping
      sellInDays = 0;
      verdict = 'SELL_NOW';
      headlineEn = 'SELL NOW';
      headlineNe = 'अहिले बेच्नुहोस्';
      reasonShortEn = 'Current price is highest';
      reasonShortNe = 'हालकै दर उच्च छ';
    } else {
      sellInDays = Math.min(2, remainingDays);
      verdict = sellInDays > 0 ? 'SELL_LATER' : 'SELL_NOW';
      headlineEn = sellInDays > 0 ? `SELL IN ${sellInDays} DAYS` : 'SELL NOW';
      headlineNe = sellInDays > 0 ? `${sellInDays} दिनपछि बेच्नुहोस्` : 'अहिले बेच्नुहोस्';
      reasonShortEn = `Peak price window`;
      reasonShortNe = `उत्तम बिक्री विन्दु`;
    }

    // Shelf life progress bar percent (0% = freshly harvested, 100% = rotten)
    const shelfLifePercent = Math.min(100, Math.round((harvestDaysAgo / cropShelfLifeDays) * 100));

    // Confidence percentage
    const confidence = Math.min(94, Math.max(76, 84 + (verdict === 'SELL_NOW' ? 4 : -2)));

    return {
      sellInDays,
      verdict,
      headlineEn,
      headlineNe,
      reasonShortEn,
      reasonShortNe,
      targetPrice: peakPrice,
      currentPrice,
      priceDiff,
      remainingDays,
      shelfLifePercent,
      confidence,
    };
  }, [chartData14Days, cropShelfLifeDays, harvestDaysAgo]);

  // -------------------------------------------------------------------------
  // CARD 3: TRANSPORT POOL STATUS (Distance-scaled nationwide across 28 districts)
  // -------------------------------------------------------------------------
  const regionalTerminal = useMemo(() => {
    const prov = currentDistrictObj.province;
    if (prov === 'Koshi') return { en: 'Birtamod / Biratnagar Mandi', ne: 'बिर्तामोड / विराटनगर मन्डी' };
    if (prov === 'Madhesh') return { en: 'Birgunj / Lalbandi Mandi', ne: 'वीरगञ्ज / लालबन्दी मन्डी' };
    if (prov === 'Gandaki') return { en: 'Pokhara Wholesale Hub', ne: 'पोखरा थोक बजार' };
    if (prov === 'Lumbini') return { en: 'Butwal / Nepalgunj Mandi', ne: 'बुटवल / नेपालगञ्ज मन्डी' };
    if (prov === 'Karnali') return { en: 'Surkhet / Nepalgunj Hub', ne: 'सुर्खेत / नेपालगञ्ज मन्डी' };
    if (prov === 'Sudurpashchim') return { en: 'Attariya / Dhangadhi Mandi', ne: 'अत्तरिया / धनगढी मन्डी' };
    return { en: 'Kalimati Central Mandi', ne: 'कालीमाटी थोक बजार' };
  }, [currentDistrictObj.province]);

  const transportPoolState = useMemo(() => {
    const distKm = currentDistrictObj.marketDistKm || 0;
    const isValley = ['kathmandu', 'lalitpur', 'bhaktapur'].includes(selectedDistrict.toLowerCase());
    const soloRate = isValley
      ? 3.5
      : Number(Math.min(14.8, Math.max(4.5, 4.2 + distKm * 0.014)).toFixed(1));
    const sharedRate = Number(Math.max(1.8, Math.round(soloRate * 0.44 * 10) / 10).toFixed(1));
    const savingsPct = Math.round(((soloRate - sharedRate) / soloRate) * 100);
    const sampleVolumeKg = 350;
    const totalSavingsNpr = Math.round((soloRate - sharedRate) * sampleVolumeKg);

    return {
      hasPool: hasPoolNearby || distKm > 0,
      route: `${currentDistrictObj.name} → ${isNe ? regionalTerminal.ne : regionalTerminal.en}`,
      departureTime: isNe ? 'आज साँझ ५:०० बजे' : 'Today 5:00 PM',
      capacityBookedKg: 650,
      capacityTotalKg: 1500,
      capacityPercent: Math.round((650 / 1500) * 100),
      capacityRemainingKg: 850,
      joinedFarmersCount: 3,
      soloRate,
      sharedRate,
      savingsPct,
      totalSavingsNpr,
    };
  }, [selectedDistrict, currentDistrictObj, hasPoolNearby, isNe, regionalTerminal]);

  // -------------------------------------------------------------------------
  // CARD 4: MARKETPLACE & DIRECT BUYER DEMAND LIST
  // -------------------------------------------------------------------------
  const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(null);
  const [contactSuccessBuyer, setContactSuccessBuyer] = useState<string | null>(null);

  const localBuyersList = useMemo(() => {
    const currentPrice = chartData14Days.currentPrice;
    const mandiNetPayout = Math.round(currentPrice - (transportPoolState.sharedRate + currentPrice * 0.015));
    const shortDistrict = currentDistrictObj.name.split('(')[0].trim();

    return [
      {
        id: 'buyer-1',
        nameEn: `${shortDistrict} Fresh Agro Mart`,
        nameNe: `${shortDistrict} ताजा कृषि मार्ट`,
        volumeKg: 250,
        rate: Math.round(currentPrice * 1.08),
        distanceKm: 4.2,
        locationEn: `${shortDistrict} Bazar`,
        locationNe: `${shortDistrict} बजार`,
        diffVsMandi: Math.round(currentPrice * 1.08) - mandiNetPayout,
        typeEn: 'Supermarket',
        typeNe: 'सुपरमार्केट',
        phone: '+977 9855012345',
      },
      {
        id: 'buyer-2',
        nameEn: 'Himalayan Fresh Kitchens',
        nameNe: 'हिमालयन ताजा किचेन',
        volumeKg: 150,
        rate: Math.round(currentPrice * 1.10),
        distanceKm: 6.8,
        locationEn: `${currentDistrictObj.province} Corridor`,
        locationNe: `${currentDistrictObj.province} कोरिडोर`,
        diffVsMandi: Math.round(currentPrice * 1.10) - mandiNetPayout,
        typeEn: 'Restaurant Network',
        typeNe: 'रेस्टुरेन्ट सञ्जाल',
        phone: '+977 9855023456',
      },
      {
        id: 'buyer-3',
        nameEn: regionalTerminal.en,
        nameNe: regionalTerminal.ne,
        volumeKg: 500,
        rate: Math.round(currentPrice * 1.05),
        distanceKm: 2.5,
        locationEn: `${shortDistrict} Hub`,
        locationNe: `${shortDistrict} केन्द्र`,
        diffVsMandi: Math.round(currentPrice * 1.05) - mandiNetPayout,
        typeEn: 'Wholesaler',
        typeNe: 'थोक बिक्रेता',
        phone: '+977 9855034567',
      },
    ];
  }, [chartData14Days.currentPrice, transportPoolState.sharedRate, currentDistrictObj.name, currentDistrictObj.province, regionalTerminal]);

  // -------------------------------------------------------------------------
  // PRICE PROJECTION TABLE FOR KRISHI RECOMMENDATIONS (Today, Tomorrow, Day After Tomorrow)
  // -------------------------------------------------------------------------
  const priceTableDays = useMemo(() => {
    const pts = chartData14Days.points;
    const todayPoint = pts.find((p) => p.dayKey === 'Today') || pts[7];
    const tomorrowPoint = pts.find((p) => p.dayKey === '+1d') || pts[8];
    const dayAfterPoint = pts.find((p) => p.dayKey === '+2d') || pts[9];

    const now = new Date();
    const getDayName = (offsetDays: number) => {
      const d = new Date(now.getTime() + offsetDays * 24 * 60 * 60 * 1000);
      const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayNamesNe = ['आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहीबार', 'शुक्रबार', 'शनिबार'];
      return isNe ? dayNamesNe[d.getDay()] : dayNamesEn[d.getDay()];
    };

    const targetDayIdx = decisionEngine.sellInDays; // 0 for today, 1 for tomorrow, 2+ for day after tomorrow

    return [
      {
        id: 'today',
        offset: 0,
        nameEn: 'Today',
        nameNe: 'आज',
        dayLabel: getDayName(0),
        price: todayPoint?.price || chartData14Days.currentPrice,
        diff: 0,
        isTarget: targetDayIdx === 0,
        statusEn: targetDayIdx === 0 ? 'Best Price Today' : 'Baseline',
        statusNe: targetDayIdx === 0 ? 'आजै बेच्ने उत्तम समय' : 'हालको दर',
      },
      {
        id: 'tomorrow',
        offset: 1,
        nameEn: 'Tomorrow',
        nameNe: 'भोलि',
        dayLabel: getDayName(1),
        price: tomorrowPoint?.price || Math.round(chartData14Days.currentPrice + 3),
        diff: (tomorrowPoint?.price || chartData14Days.currentPrice) - chartData14Days.currentPrice,
        isTarget: targetDayIdx === 1,
        statusEn: targetDayIdx === 1 ? 'Target Day' : ((tomorrowPoint?.price || 0) >= chartData14Days.currentPrice ? 'Rising (+)' : 'Dropping (-)'),
        statusNe: targetDayIdx === 1 ? 'सिफारिस गरिएको दिन' : ((tomorrowPoint?.price || 0) >= chartData14Days.currentPrice ? 'बढ्दो (+)' : 'घट्दो (-)'),
      },
      {
        id: 'dayAfter',
        offset: 2,
        nameEn: 'Day After Tomorrow',
        nameNe: 'पर्सि',
        dayLabel: getDayName(2),
        price: dayAfterPoint?.price || Math.round(chartData14Days.currentPrice + 6),
        diff: (dayAfterPoint?.price || chartData14Days.currentPrice) - chartData14Days.currentPrice,
        isTarget: targetDayIdx >= 2,
        statusEn: targetDayIdx >= 2 ? `Peak Day (${targetDayIdx}d target)` : ((dayAfterPoint?.price || 0) >= chartData14Days.currentPrice ? 'Projected (+)' : 'Risk of drop'),
        statusNe: targetDayIdx >= 2 ? `सिफारिस (${targetDayIdx} दिने उच्च)` : ((dayAfterPoint?.price || 0) >= chartData14Days.currentPrice ? 'प्रक्षेपित (+)' : 'घट्ने जोखिम'),
      },
    ];
  }, [chartData14Days, decisionEngine, isNe]);

  // -------------------------------------------------------------------------
  // CALENDAR-BASED ROUTE DISPATCHER DATA (Matching Image 2)
  // -------------------------------------------------------------------------
  const calendarDates = useMemo(() => {
    const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayNamesNe = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिही', 'शुक्र', 'शनि'];
    
    // Day items corresponding to 23 Tue, 24 Wed, 25 Thu, 26 Fri, 27 Sat as in Image 2
    return [
      { id: 'date-0', dayNum: 23, dayName: isNe ? dayNamesNe[2] : 'Tue', bsDateStr: '2083-05-23' },
      { id: 'date-1', dayNum: 24, dayName: isNe ? dayNamesNe[3] : 'Wed', bsDateStr: '2083-05-24' },
      { id: 'date-2', dayNum: 25, dayName: isNe ? dayNamesNe[4] : 'Thu', bsDateStr: '2083-05-25' },
      { id: 'date-3', dayNum: 26, dayName: isNe ? dayNamesNe[5] : 'Fri', bsDateStr: '2083-05-26' },
      { id: 'date-4', dayNum: 27, dayName: isNe ? dayNamesNe[6] : 'Sat', bsDateStr: '2083-05-27' },
    ];
  }, [isNe]);

  const activeCalendarDay = useMemo(() => {
    return calendarDates.find((d) => d.id === selectedDispatchDate) || calendarDates[4];
  }, [calendarDates, selectedDispatchDate]);

  // Comprehensive scheduled trucks database across dates & destinations
  const allScheduledTrucks = useMemo(() => {
    return [
      // 27 Sat (Matching user's selected state in Image 2)
      {
        id: 'truck-sat-kalimati',
        dateId: 'date-4',
        destinationId: 'kalimati',
        nameEn: 'Kalimati Mandi Express',
        nameNe: 'कालीमाटी मन्डी एक्सप्रेस',
        destinationEn: 'Kalimati Wholesale',
        destinationNe: 'कालीमाटी थोक बजार',
        departureEn: '5:00 PM',
        departureNe: '५:०० बजे',
        spaceRemainingKg: transportPoolState.capacityRemainingKg,
        capacityKg: transportPoolState.capacityTotalKg,
        bookedKg: transportPoolState.capacityBookedKg,
        percentFilled: transportPoolState.capacityPercent,
        ratePerKg: transportPoolState.sharedRate,
        savingsPct: transportPoolState.savingsPct,
        farmersCount: transportPoolState.joinedFarmersCount,
      },
      {
        id: 'truck-sat-balkhu',
        dateId: 'date-4',
        destinationId: 'balkhu',
        nameEn: 'Balkhu Saturday Shuttle',
        nameNe: 'बल्खु शनिबारे शटल',
        destinationEn: 'Balkhu Market',
        destinationNe: 'बल्खु कृषि बजार',
        departureEn: '6:30 PM',
        departureNe: '६:३० बजे',
        spaceRemainingKg: 1200,
        capacityKg: 2000,
        bookedKg: 800,
        percentFilled: 40,
        ratePerKg: Math.round((transportPoolState.sharedRate + 0.3) * 10) / 10,
        savingsPct: 44,
        farmersCount: 3,
      },
      {
        id: 'truck-sat-narayangarh',
        dateId: 'date-4',
        destinationId: 'narayangarh',
        nameEn: 'Narayangarh Highway Link',
        nameNe: 'नारायणगढ राजमार्ग लिंक',
        destinationEn: 'Narayangarh Mandi',
        destinationNe: 'नारायणगढ बजार',
        departureEn: '8:00 PM',
        departureNe: '८:०० बजे',
        spaceRemainingKg: 1900,
        capacityKg: 3000,
        bookedKg: 1100,
        percentFilled: 37,
        ratePerKg: Math.round((transportPoolState.sharedRate + 1.2) * 10) / 10,
        savingsPct: 38,
        farmersCount: 2,
      },
      // 23 Tue
      {
        id: 'truck-tue-kalimati',
        dateId: 'date-0',
        destinationId: 'kalimati',
        nameEn: 'Kalimati Mandi Express',
        nameNe: 'कालीमाटी मन्डी एक्सप्रेस',
        destinationEn: 'Kalimati Wholesale',
        destinationNe: 'कालीमाटी थोक बजार',
        departureEn: '5:00 PM',
        departureNe: '५:०० बजे',
        spaceRemainingKg: 1400,
        capacityKg: 3500,
        bookedKg: 2100,
        percentFilled: 60,
        ratePerKg: transportPoolState.sharedRate,
        savingsPct: 48,
        farmersCount: 4,
      },
      {
        id: 'truck-tue-balkhu',
        dateId: 'date-0',
        destinationId: 'balkhu',
        nameEn: 'Balkhu Agri Feeder',
        nameNe: 'बल्खु कृषि फिडर',
        destinationEn: 'Balkhu Market',
        destinationNe: 'बल्खु कृषि बजार',
        departureEn: '7:30 PM',
        departureNe: '७:३० बजे',
        spaceRemainingKg: 1100,
        capacityKg: 2000,
        bookedKg: 900,
        percentFilled: 45,
        ratePerKg: Math.round((transportPoolState.sharedRate + 0.3) * 10) / 10,
        savingsPct: 42,
        farmersCount: 2,
      },
      // 24 Wed
      {
        id: 'truck-wed-narayangarh',
        dateId: 'date-1',
        destinationId: 'narayangarh',
        nameEn: 'Narayangarh Wholesale Link',
        nameNe: 'नारायणगढ थोक ढुवानी',
        destinationEn: 'Narayangarh Mandi',
        destinationNe: 'नारायणगढ बजार',
        departureEn: '6:00 AM',
        departureNe: '६:०० बजे',
        spaceRemainingKg: 2400,
        capacityKg: 3500,
        bookedKg: 1100,
        percentFilled: 31,
        ratePerKg: Math.round((transportPoolState.sharedRate + 1.1) * 10) / 10,
        savingsPct: 38,
        farmersCount: 3,
      },
      {
        id: 'truck-wed-kalimati',
        dateId: 'date-1',
        destinationId: 'kalimati',
        nameEn: 'Kalimati Midday Feeder',
        nameNe: 'कालीमाटी दिउँसोको गाडी',
        destinationEn: 'Kalimati Wholesale',
        destinationNe: 'कालीमाटी थोक बजार',
        departureEn: '1:30 PM',
        departureNe: '१:३० बजे',
        spaceRemainingKg: 1600,
        capacityKg: 3000,
        bookedKg: 1400,
        percentFilled: 47,
        ratePerKg: transportPoolState.sharedRate,
        savingsPct: 46,
        farmersCount: 2,
      },
      // 25 Thu
      {
        id: 'truck-thu-kalimati',
        dateId: 'date-2',
        destinationId: 'kalimati',
        nameEn: 'Kalimati Morning Hauler',
        nameNe: 'कालीमाटी बिहानी ढुवानी',
        destinationEn: 'Kalimati Wholesale',
        destinationNe: 'कालीमाटी थोक बजार',
        departureEn: '7:00 AM',
        departureNe: '७:०० बजे',
        spaceRemainingKg: 1800,
        capacityKg: 3500,
        bookedKg: 1700,
        percentFilled: 49,
        ratePerKg: transportPoolState.sharedRate,
        savingsPct: 48,
        farmersCount: 4,
      },
      {
        id: 'truck-thu-pokhara',
        dateId: 'date-2',
        destinationId: 'pokhara',
        nameEn: 'Pokhara Direct Transit',
        nameNe: 'पोखरा सिधा ढुवानी',
        destinationEn: 'Pokhara Wholesale',
        destinationNe: 'पोखरा थोक बजार',
        departureEn: '4:30 PM',
        departureNe: '४:३० बजे',
        spaceRemainingKg: 950,
        capacityKg: 2500,
        bookedKg: 1550,
        percentFilled: 62,
        ratePerKg: Math.round((transportPoolState.sharedRate + 1.4) * 10) / 10,
        savingsPct: 40,
        farmersCount: 3,
      },
      // 26 Fri
      {
        id: 'truck-fri-balkhu',
        dateId: 'date-3',
        destinationId: 'balkhu',
        nameEn: 'Balkhu Weekend Line',
        nameNe: 'बल्खु सप्ताहान्त लाइन',
        destinationEn: 'Balkhu Market',
        destinationNe: 'बल्खु कृषि बजार',
        departureEn: '5:30 PM',
        departureNe: '५:३० बजे',
        spaceRemainingKg: 1500,
        capacityKg: 3000,
        bookedKg: 1500,
        percentFilled: 50,
        ratePerKg: Math.round((transportPoolState.sharedRate + 0.2) * 10) / 10,
        savingsPct: 45,
        farmersCount: 2,
      },
      {
        id: 'truck-fri-kalimati',
        dateId: 'date-3',
        destinationId: 'kalimati',
        nameEn: 'Kalimati Friday Express',
        nameNe: 'कालीमाटी शुक्रबारे एक्सप्रेस',
        destinationEn: 'Kalimati Wholesale',
        destinationNe: 'कालीमाटी थोक बजार',
        departureEn: '7:00 PM',
        departureNe: '७:०० बजे',
        spaceRemainingKg: 1300,
        capacityKg: 3200,
        bookedKg: 1900,
        percentFilled: 59,
        ratePerKg: transportPoolState.sharedRate,
        savingsPct: 48,
        farmersCount: 5,
      },
    ];
  }, [transportPoolState]);

  // Filtered trucks by selected date and selected destination
  const filteredTrucks = useMemo(() => {
    return allScheduledTrucks.filter((truck) => {
      const matchDate = truck.dateId === selectedDispatchDate;
      const matchDest = selectedDestination === 'all' || truck.destinationId === selectedDestination;
      return matchDate && matchDest;
    });
  }, [allScheduledTrucks, selectedDispatchDate, selectedDestination]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
      {/* ---------------------------------------------------- */}
      {/* 1. STICKY SIDEBAR: YOUR CROPS (Always visible)      */}
      {/* ---------------------------------------------------- */}
      <aside className="md:col-span-5 lg:col-span-4 md:sticky md:top-[112px] self-start z-20 space-y-5">
        <div className="app-card p-5 sm:p-6 space-y-5 max-h-[calc(100vh-128px)] flex flex-col border border-[#E8E2D8] dark:border-[#383530] shadow-sm bg-white dark:bg-[#22201D]">
          {/* Primary View Switcher in Sidebar: My Farm Data vs Market Data */}
          {setDashboardMode && (
            <div className="shrink-0 grid grid-cols-2 p-1 rounded-xl bg-[#F6F2EB] dark:bg-[#2A2824] border border-[#E8E2D8] dark:border-[#383530] w-full gap-1">
              <button
                type="button"
                id="tab-switch-my-data"
                onClick={() => setDashboardMode('my_data')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  dashboardMode === 'my_data'
                    ? 'bg-[#2E7D5A] text-white shadow-xs'
                    : 'text-[#746F68] dark:text-[#A6A096] hover:text-[#1F1E1B] dark:hover:text-[#F5F3EF]'
                }`}
              >
                <Sprout className={`w-4 h-4 shrink-0 ${dashboardMode === 'my_data' ? 'text-white' : 'text-[#2E7D5A]'}`} />
                <span className="truncate">{isNe ? 'मेरो खेतबारी' : 'My Farm Data'}</span>
              </button>

              <button
                type="button"
                id="tab-switch-market-data"
                onClick={() => setDashboardMode('market_data')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  dashboardMode === 'market_data'
                    ? 'bg-[#2E7D5A] text-white shadow-xs'
                    : 'text-[#746F68] dark:text-[#A6A096] hover:text-[#1F1E1B] dark:hover:text-[#F5F3EF]'
                }`}
              >
                <TrendingUp className={`w-4 h-4 shrink-0 ${dashboardMode === 'market_data' ? 'text-white' : 'text-[#2D6CDF]'}`} />
                <span className="truncate">{isNe ? 'बजार दर' : 'Market Data'}</span>
              </button>
            </div>
          )}

          {/* Sidebar Header */}
          <div className="shrink-0 flex items-center justify-between pb-3.5 border-b border-[#E8E2D8] dark:border-[#383530]">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8C6237] dark:text-[#D9B591] block">
                FARM COMMODITIES
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#1F1E1B] dark:text-[#F5F3EF] tracking-tight">
                {isNe ? 'तपाईंका बालीहरू' : 'Your Crops'}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsAddCropModalOpen(true)}
              className="p-2 rounded-xl text-[#746F68] dark:text-[#A6A096] hover:text-[#1F1E1B] dark:hover:text-[#F5F3EF] hover:bg-[#F6F2EB] dark:hover:bg-[#2A2824] border border-transparent hover:border-[#E8E2D8] dark:hover:border-[#383530] transition cursor-pointer"
              title="Add or manage crops"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Market / Location Selector */}
          <div className="shrink-0 space-y-1.5">
            <label className="text-[11px] font-extrabold text-[#746F68] dark:text-[#A6A096] uppercase tracking-wider block">
              {isNe ? 'बजार स्थान' : 'Mandi Location'}
            </label>
            <div className="flex items-center gap-2 bg-[#FAF7F2] dark:bg-[#262421] px-3.5 py-2.5 rounded-xl border border-[#E8E2D8] dark:border-[#383530] text-xs sm:text-sm">
              <MapPin className="w-4 h-4 text-[#C8A27C] dark:text-[#D9B591] shrink-0" />
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full bg-transparent font-bold text-[#1F1E1B] dark:text-[#F5F3EF] focus:outline-none cursor-pointer pr-1 truncate"
              >
                {DISTRICT_LIST.map((dist) => (
                  <option key={dist.id} value={dist.id} className="dark:bg-[#1E1D1B] dark:text-[#F5F3EF]">
                    {dist.name} ({dist.marketDistKm} km)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Crop List: Vertically stacked cards for each crop */}
          <div className="flex-1 min-h-0 space-y-2.5 overflow-y-auto scrollbar-thin pr-1">
            {availableCropIds.map((cropId) => {
              const crop = commodities.find((c) => c.id === cropId) || {
                id: cropId,
                name: cropId.charAt(0).toUpperCase() + cropId.slice(1),
                nepaliName: cropId,
                currentPrice: 50,
              };
              const isSelected = crop.id === activeCrop.id;

              return (
                <button
                  key={crop.id}
                  type="button"
                  onClick={() => setActiveCropId(crop.id)}
                  className={`w-full p-3 sm:p-3.5 rounded-xl text-left transition flex items-center justify-between gap-3 cursor-pointer border ${
                    isSelected
                      ? 'bg-[#2E7D5A] text-white dark:bg-[#3EA678] dark:text-white border-[#2E7D5A] dark:border-[#3EA678] shadow-sm'
                      : 'bg-[#FAF7F2] dark:bg-[#262421] text-[#1F1E1B] dark:text-[#F5F3EF] hover:bg-[#F3ECE0] dark:hover:bg-[#302D28] border-[#E8E2D8] dark:border-[#383530]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-xl ${isSelected ? 'bg-white/20' : 'bg-white dark:bg-[#1E1D1B] border border-[#E8E2D8] dark:border-[#383530]'}`}>
                      <CropIllustration crop={crop.id} cropName={crop.name} size="sm" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold text-sm sm:text-base leading-snug truncate">
                        {isNe ? crop.nepaliName || crop.name : crop.name}
                      </div>
                      {crop.nepaliName && !isNe && (
                        <div className={`text-xs mt-0.5 truncate ${isSelected ? 'text-white/80' : 'text-[#746F68] dark:text-[#A6A096]'}`}>
                          {crop.nepaliName}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <div className={`font-editorial-mono font-black text-sm sm:text-base ${isSelected ? 'text-white' : 'text-[#1F1E1B] dark:text-[#F5F3EF]'}`}>
                      Rs {Math.round(crop.currentPrice)}
                    </div>
                    <div className={`text-xs font-semibold ${isSelected ? 'text-white/80' : 'text-[#746F68] dark:text-[#A6A096]'}`}>
                      /kg
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Large, Integral "Manage Crops" CTA */}
          <div className="shrink-0 pt-2 border-t border-[#E8E2D8] dark:border-[#383530]">
            <button
              type="button"
              id="manage-crops-button-sidebar"
              onClick={() => setIsAddCropModalOpen(true)}
              className="w-full py-3 px-4 rounded-xl bg-[#2E7D5A] text-white dark:bg-[#3EA678] hover:bg-[#246648] dark:hover:bg-[#328B63] text-sm font-black tracking-tight transition cursor-pointer flex items-center justify-center gap-2.5 shadow-sm active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{isNe ? 'बाली व्यवस्थापन' : 'Manage Crops'}</span>
              <span className="text-xs font-editorial-mono px-2 py-0.5 rounded-full bg-white/20">
                {availableCropIds.length}
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* ---------------------------------------------------- */}
      {/* 2. MAIN CONTENT (14-DAY GRAPH, TOOLS, BUYER MATCH)   */}
      {/* ---------------------------------------------------- */}
      <main className="md:col-span-7 lg:col-span-8 space-y-7 min-w-0">
        {dashboardMode === 'market_data' && marketDataView ? (
          marketDataView
        ) : (
          <>
            {/* THE 14-DAY GRAPH (1 WEEK BEFORE + 1 WEEK AFTER) */}
            <div className="app-card p-6 sm:p-8 space-y-6 border border-[#E8E2D8] dark:border-[#383530] shadow-sm bg-white dark:bg-[#22201D]">
              {/* Graph Header: Editorial Publication Layout */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E8E2D8] dark:border-[#383530]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] p-2.5 flex items-center justify-center shrink-0 shadow-xs">
                    <CropIllustration crop={activeCrop.id} cropName={activeCrop.name} size="full" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-[11px] font-black uppercase tracking-widest text-[#1B4FA8] dark:text-[#76A9FA]">
                        MANDI BENCHMARK
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EAF3EE] text-[#1E5E41] dark:bg-[#1E3327] dark:text-[#4ADE80]">
                        {isNe ? '१४ दिने ट्रेन्ड' : '14-Day Trajectory'}
                      </span>
                    </div>
                    
                    <h2 className="text-2xl sm:text-3xl font-black text-[#1F1E1B] dark:text-[#F5F3EF] tracking-tight mt-0.5">
                      {isNe ? activeCrop.nepaliName || activeCrop.name : activeCrop.name}
                    </h2>

                    <div className="flex flex-wrap items-baseline gap-3 mt-1.5">
                      <div className="flex items-baseline gap-2">
                        <span className="font-editorial-mono text-3xl sm:text-4xl font-black text-[#1F1E1B] dark:text-[#F5F3EF]">
                          Rs {chartData14Days.currentPrice}
                        </span>
                        <span className="text-sm font-semibold text-[#746F68] dark:text-[#A6A096]">/kg {isNe ? 'आजको नयाँ दर' : 'today (new)'}</span>
                      </div>

                      {/* Old Rate vs New Rate comparison pill */}
                      <div className="flex items-center gap-2 pl-2 border-l border-[#E8E2D8] dark:border-[#383530]">
                        <span className="text-xs text-[#746F68] dark:text-[#A6A096]">
                          {isNe ? 'हिजो' : 'Yesterday'}: <strong className="font-editorial-mono text-[#1F1E1B] dark:text-[#F5F3EF]">Rs {chartData14Days.yesterdayPrice}/kg</strong>
                        </span>
                        {chartData14Days.currentPrice !== chartData14Days.yesterdayPrice && (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold font-editorial-mono ${
                              chartData14Days.currentPrice > chartData14Days.yesterdayPrice
                                ? 'bg-[#EAF3EE] text-[#1E5E41] dark:bg-[#1E3327] dark:text-[#4ADE80]'
                                : 'bg-[#FDF2F2] text-[#DC2626] dark:bg-[#381E1E] dark:text-[#F87171]'
                            }`}
                          >
                            {chartData14Days.currentPrice > chartData14Days.yesterdayPrice ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            <span>
                              {chartData14Days.currentPrice > chartData14Days.yesterdayPrice ? '+' : ''}
                              Rs {chartData14Days.currentPrice - chartData14Days.yesterdayPrice} ({activeCrop.changePct >= 0 ? '+' : ''}{activeCrop.changePct}%)
                            </span>
                          </span>
                        )}
                      </div>

                      {chartData14Days.peakPoint && chartData14Days.peakPoint.diffVsCurrent > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-editorial-mono font-bold bg-[#EDF4FC] text-[#1B4FA8] dark:bg-[#1E2B3D] dark:text-[#76A9FA] border border-[#C6DEFC] dark:border-[#2C4872]">
                          <span className="w-2 h-2 rounded-full bg-[#FF684A] shadow-xs" />
                          <span>Peak: Rs {chartData14Days.peakPoint.peakPrice}/kg (+Rs {chartData14Days.peakPoint.diffVsCurrent} in {chartData14Days.peakPoint.peakDayIdx}d)</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Graph Legend Markers: Soft Round Dots */}
                <div className="flex items-center gap-5 text-xs self-start sm:self-auto pt-2 sm:pt-0">
                  <div className="flex items-center gap-2 text-[#1F1E1B] dark:text-[#F5F3EF]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2B2A27] dark:bg-[#F5F3EF] inline-block" />
                    <span className="text-xs font-bold">{isNe ? 'विगत ७ दिन' : 'Past 7 Days'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#2D6CDF] dark:text-[#76A9FA]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2D6CDF] dark:text-[#76A9FA] inline-block" />
                    <span className="text-xs font-bold">{isNe ? 'आगामी ७ दिन' : 'Next 7 Days (Forecast)'}</span>
                  </div>
                </div>
              </div>

              {/* The Recharts Continuous Graph */}
              <div className="h-64 sm:h-76 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData14Days.points}
                    margin={{ top: 15, right: 15, left: -5, bottom: 5 }}
                  >
                    <XAxis
                      dataKey="dayKey"
                      tick={{ fontSize: 12, fill: '#746F68', fontWeight: 600 }}
                      tickLine={false}
                      axisLine={{ stroke: '#E8E2D8', strokeWidth: 1 }}
                    />
                    <YAxis
                      domain={[chartData14Days.minPrice, chartData14Days.maxPrice]}
                      tick={{ fontSize: 12, fill: '#746F68', fontWeight: 600 }}
                      tickLine={false}
                      axisLine={{ stroke: '#E8E2D8', strokeWidth: 1 }}
                      tickFormatter={(v) => `Rs ${v}`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const isFut = data.type === 'predicted';
                          const isTod = data.type === 'today';
                          const isYest = data.dayKey === '-1d';
                          const priceDiff = data.price - chartData14Days.yesterdayPrice;
                          return (
                            <div className="bg-[#1E1D1B] text-[#F5F3EF] px-4 py-3 rounded-xl text-xs shadow-xl font-editorial-mono space-y-1.5 border border-[#383530]">
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-[#A6A096] text-xs font-medium">{data.dayLabel} · {data.dateStr}</p>
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    isTod
                                      ? 'bg-[#1E3327] text-[#4ADE80]'
                                      : isYest
                                      ? 'bg-[#362712] text-[#FBBF24]'
                                      : isFut
                                      ? 'bg-[#1E2B3D] text-[#76A9FA]'
                                      : 'bg-[#2A2824] text-[#A6A096]'
                                  }`}
                                >
                                  {isTod
                                    ? (isNe ? 'आजको नयाँ दर' : 'New Rate (Today)')
                                    : isYest
                                    ? (isNe ? 'हिजोको पुरानो दर' : 'Old Rate (Yesterday)')
                                    : isFut
                                    ? (isNe ? 'प्रक्षेपण' : 'Forecast')
                                    : (isNe ? 'अभिलेख दर' : 'Recorded')}
                                </span>
                              </div>
                              <p className="font-extrabold text-xl text-white">Rs {data.price}/kg</p>
                              {isTod && chartData14Days.currentPrice !== chartData14Days.yesterdayPrice && (
                                <p className="text-xs font-bold text-[#4ADE80]">
                                  {priceDiff >= 0 ? '+' : ''}Rs {priceDiff} vs हिजो ({activeCrop.changePct >= 0 ? '+' : ''}{activeCrop.changePct}%)
                                </p>
                              )}
                              {isYest && (
                                <p className="text-[11px] text-[#FBBF24]">
                                  {isNe ? 'कालीमाटी अघिल्लो आधिकारिक दर' : 'Previous Official Mandi Rate'}
                                </p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    {/* Vertical Reference Line for Today */}
                    <ReferenceLine
                      x="Today"
                      stroke="#A6A096"
                      strokeDasharray="3 3"
                      label={{
                        value: isNe ? 'आज (Today)' : 'TODAY',
                        position: 'insideTop',
                        fill: '#746F68',
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    />
                    {/* Reference Dot on Yesterday (Old Rate) */}
                    <ReferenceDot
                      x="-1d"
                      y={chartData14Days.yesterdayPrice}
                      r={5}
                      fill="#F59E0B"
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    />
                    {/* Reference Dot on Today (New Rate) */}
                    <ReferenceDot
                      x="Today"
                      y={chartData14Days.currentPrice}
                      r={6}
                      fill="#10B981"
                      stroke="#FFFFFF"
                      strokeWidth={2.5}
                    />
                    {/* Reference Dot on Peak */}
                    {chartData14Days.peakPoint && chartData14Days.peakPoint.peakDayIdx > 0 && (
                      <ReferenceDot
                        x={`+${chartData14Days.peakPoint.peakDayIdx}d`}
                        y={chartData14Days.peakPoint.peakPrice}
                        r={6}
                        fill="#FF684A"
                        stroke="#FFFFFF"
                        strokeWidth={2.5}
                      />
                    )}
                    {/* Solid Line for Actual History (Past 7d + Today) */}
                    <Line
                      type="monotone"
                      dataKey="actualPrice"
                      stroke="#2B2A27"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#2B2A27' }}
                      activeDot={{ r: 5, fill: '#2B2A27', stroke: '#FFFFFF', strokeWidth: 2 }}
                      connectNulls={false}
                    />
                    {/* Dashed Line for 7-Day Forecast (Today + Next 7d) */}
                    <Line
                      type="monotone"
                      dataKey="predictedPrice"
                      stroke="#2D6CDF"
                      strokeWidth={2.5}
                      strokeDasharray="4 4"
                      dot={{ r: 3, fill: '#2D6CDF' }}
                      activeDot={{ r: 5, fill: '#2D6CDF', stroke: '#FFFFFF', strokeWidth: 2 }}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* RECOMMENDED PRODUCT FOR HIGHEST YIELD IN THIS AREA */}
            {/* ---------------------------------------------------- */}
            {highestYieldRecommendation && (
              <div className="app-card p-4 sm:p-5 border border-[#E8E2D8] dark:border-[#383530] bg-white dark:bg-[#22201D] shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E8E2D8] dark:border-[#383530]">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#EAF3EE] text-[#1E5E41] dark:bg-[#1E3327] dark:text-[#4ADE80]">
                      <Award className="w-3.5 h-3.5" />
                      <span>{isNe ? 'उच्च उत्पादन सिफारिस' : 'Recommended Highest Yield'}</span>
                    </span>
                    <span className="text-xs text-[#746F68] dark:text-[#A6A096]">
                      · {currentDistrictObj.name} {isNe ? 'क्षेत्र' : 'Area'}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-[#2E7D5A] dark:text-[#4ADE80]">
                    {isNe ? '९१% माटो तथा मौसम अनुकूलता' : '91% Agro-Climatic Fit'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] p-1.5 flex items-center justify-center shrink-0">
                      <CropIllustration crop={highestYieldRecommendation.crop} size="full" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base text-[#1F1E1B] dark:text-[#F5F3EF]">
                          {isNe ? highestYieldRecommendation.nepaliName : highestYieldRecommendation.cropDisplayName}
                        </h4>
                        <span className="text-xs text-[#746F68] dark:text-[#A6A096]">
                          ({highestYieldRecommendation.cropDisplayName})
                        </span>
                      </div>
                      <p className="text-xs text-[#746F68] dark:text-[#A6A096] mt-0.5 line-clamp-1">
                        {highestYieldRecommendation.marketOutlook}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-[#746F68] dark:text-[#A6A096] block">
                        {isNe ? 'अपेक्षित उत्पादन' : 'Expected Yield'}
                      </span>
                      <span className="font-editorial-mono font-bold text-sm text-[#1F1E1B] dark:text-[#F5F3EF]">
                        {highestYieldRecommendation.yieldMtPerHa}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-[#746F68] dark:text-[#A6A096] block">
                        {isNe ? 'बजार दर' : 'Est. Mandi Rate'}
                      </span>
                      <span className="font-editorial-mono font-bold text-sm text-[#2E7D5A] dark:text-[#4ADE80]">
                        Rs {highestYieldRecommendation.expectedPricePerKg}/kg
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveCropId(highestYieldRecommendation.crop)}
                      className="px-3 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F3ECE0] dark:bg-[#2A2824] dark:hover:bg-[#33302B] border border-[#E8E2D8] dark:border-[#383530] text-xs font-bold text-[#1F1E1B] dark:text-[#F5F3EF] transition cursor-pointer"
                    >
                      {isNe ? 'बाली हेर्नुहोस्' : 'Select Crop'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* KRISHI RECOMMENDATIONS (Unified with Harvest Selector, Shelflife & Price Projection Table) */}
            {/* ---------------------------------------------------- */}
            <div className="app-card overflow-hidden border border-[#E8E2D8] dark:border-[#383530] shadow-sm bg-white dark:bg-[#22201D]">
              {/* Attached Harvest Date Selector: Clean Minimalist Segmented Control */}
              <div className="p-4 sm:p-5 bg-[#FAF7F2] dark:bg-[#262421] border-b border-[#E8E2D8] dark:border-[#383530] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#1E1D1B] border border-[#E8E2D8] dark:border-[#383530] flex items-center justify-center text-[#C8A27C] dark:text-[#D9B591] shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8C6237] dark:text-[#D9B591] block">
                      HARVEST REFRESH
                    </span>
                    <span className="font-extrabold text-sm sm:text-base text-[#1F1E1B] dark:text-[#F5F3EF]">
                      {isNe ? 'तपाईंले यो बाली कहिले संकलन गर्नुभयो?' : 'When did you harvest this crop?'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none p-1 rounded-xl bg-white dark:bg-[#1E1D1B] border border-[#E8E2D8] dark:border-[#383530]">
                  {[
                    { days: 0, labelEn: 'Today (0d)', labelNe: 'आजै (० दिन)' },
                    { days: 1, labelEn: '1 Day Ago', labelNe: '१ दिन अघि' },
                    { days: 2, labelEn: '2 Days Ago', labelNe: '२ दिन अघि' },
                    { days: 3, labelEn: '3+ Days Ago', labelNe: '३+ दिन अघि' },
                  ].map((opt) => (
                    <button
                      key={opt.days}
                      type="button"
                      onClick={() => setHarvestDaysAgo(opt.days)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
                        harvestDaysAgo === opt.days
                          ? 'bg-[#2E7D5A] text-white dark:bg-[#3EA678] shadow-xs'
                          : 'text-[#746F68] dark:text-[#A6A096] hover:text-[#1F1E1B] dark:hover:text-[#F5F3EF]'
                      }`}
                    >
                      {isNe ? opt.labelNe : opt.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Krishi Recommendations Body */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between gap-2 pb-4 border-b border-[#E8E2D8] dark:border-[#383530]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EAF3EE] dark:bg-[#1E3327] text-[#2E7D5A] dark:text-[#4ADE80] flex items-center justify-center shrink-0">
                      <Sprout className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8C6237] dark:text-[#D9B591] block">
                        DECISION ADVISORY · 01
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-[#1F1E1B] dark:text-[#F5F3EF] tracking-tight">
                        {isNe ? 'कृषि सिफारिस' : 'Krishi Recommendations'}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-editorial-mono text-xs font-bold bg-[#EAF3EE] text-[#1E5E41] dark:bg-[#1E3327] dark:text-[#4ADE80]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D5A] dark:bg-[#4ADE80]" />
                      <span>{decisionEngine.confidence}% Confidence</span>
                    </span>
                  </div>
                </div>

                {/* Stacked Full-Width Cards: Takes up entire width of parent container card */}
                <div className="space-y-5 w-full">
                  
                  {/* Card 1: Shelflife Freshness & Optimal Sell Timing (Full Width) */}
                  <div className="w-full p-5 sm:p-6 rounded-2xl bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8C6237] dark:text-[#D9B591]">
                          {isNe ? 'बिक्री सिफारिस' : 'Optimal Window'}
                        </span>
                        <div className={`text-2xl sm:text-3xl font-black tracking-tight whitespace-nowrap leading-tight ${decisionEngine.verdict === 'SELL_NOW' ? 'text-[#2E7D5A] dark:text-[#4ADE80]' : 'text-[#1B4FA8] dark:text-[#76A9FA]'}`}>
                          {decisionEngine.sellInDays === 0
                            ? (isNe ? 'आजै बेच्नुहोस्' : 'SELL TODAY')
                            : (isNe ? `${decisionEngine.sellInDays} दिनमा बेच्नुहोस्` : `SELL IN ${decisionEngine.sellInDays} DAYS`)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <span className="text-xs font-black px-3 py-1.5 rounded-full bg-white dark:bg-[#1E1D1B] border border-[#E8E2D8] dark:border-[#383530] text-[#1E5E41] dark:text-[#4ADE80]">
                          Target: Rs {decisionEngine.targetPrice}/kg
                        </span>
                      </div>
                    </div>

                    {/* Shelflife Timeline & Progress Bar */}
                    <div className="space-y-2 pt-3 border-t border-[#E8E2D8] dark:border-[#383530]">
                      <div className="flex items-center justify-between text-xs sm:text-[13px]">
                        <span className="text-[#746F68] dark:text-[#A6A096] font-bold flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-[#2E7D5A] dark:text-[#4ADE80]" />
                          {isNe ? 'ताजगी अवस्था:' : 'Shelf Life Freshness:'}
                        </span>
                        <span className="font-editorial-mono font-extrabold text-xs sm:text-[13px] text-[#1F1E1B] dark:text-[#F5F3EF]">
                          {decisionEngine.remainingDays} {isNe ? 'दिन बाँकी' : 'days remaining'}
                        </span>
                      </div>

                      <div className="w-full h-3 bg-white dark:bg-[#1E1D1B] rounded-full overflow-hidden border border-[#E8E2D8] dark:border-[#383530] p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            decisionEngine.remainingDays <= 1
                              ? 'bg-[#FF684A]'
                              : decisionEngine.remainingDays <= 3
                              ? 'bg-[#C8A27C]'
                              : 'bg-[#2E7D5A] dark:bg-[#4ADE80]'
                          }`}
                          style={{ width: `${Math.max(10, 100 - decisionEngine.shelfLifePercent)}%` }}
                        />
                      </div>
                    </div>

                    {/* End shelf life indicator */}
                  </div>

                  {/* Card 2: 3-Day Projected Price Table (Full Width with Refined Font Sizing) */}
                  <div className="w-full p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#22201D] border border-[#E8E2D8] dark:border-[#383530] space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#746F68] dark:text-[#A6A096]">
                          {isNe ? '३ दिने मूल्य प्रक्षेपण' : 'Price Projection (Next 3 Days)'}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-editorial-mono font-bold bg-[#EAF3EE] text-[#1E5E41] dark:bg-[#1E3327] dark:text-[#4ADE80]">
                          Target: Rs {decisionEngine.targetPrice}/kg
                        </span>
                      </div>

                      {/* The Table with slightly smaller font and full container width */}
                      <div className="overflow-x-auto w-full">
                        <table className="w-full text-left border-collapse table-auto">
                          <thead>
                            <tr className="border-b border-[#E8E2D8] dark:border-[#383530] text-[11px] font-extrabold uppercase tracking-wider text-[#746F68] dark:text-[#A6A096]">
                              <th className="py-2.5 px-3">{isNe ? 'दिन' : 'Day'}</th>
                              <th className="py-2.5 px-3">{isNe ? 'प्रक्षेपित दर' : 'Price'}</th>
                              <th className="py-2.5 px-3">{isNe ? 'फरक' : 'Diff'}</th>
                              <th className="py-2.5 px-3 text-right">{isNe ? 'अवस्था' : 'Advisory'}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E8E2D8] dark:divide-[#383530] text-xs sm:text-[13px]">
                            {priceTableDays.map((row) => {
                              return (
                                <tr
                                  key={row.id}
                                  className={`transition-colors rounded-xl ${
                                    row.isTarget
                                      ? 'bg-[#EAF3EE] dark:bg-[#1E3327] font-bold'
                                      : 'hover:bg-[#FAF7F2] dark:hover:bg-[#262421]'
                                  }`}
                                >
                                  <td className="py-2.5 px-3">
                                    <div className="flex items-center gap-2">
                                      <div>
                                        <span className="font-extrabold text-[#1F1E1B] dark:text-[#F5F3EF] block text-xs sm:text-[13px]">
                                          {isNe ? row.nameNe : row.nameEn}
                                        </span>
                                        <span className="text-[11px] text-[#746F68] dark:text-[#A6A096] font-normal">
                                          {row.dayLabel}
                                        </span>
                                      </div>
                                      {row.isTarget && (
                                        <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-[#2E7D5A] text-white dark:bg-[#3EA678]">
                                          {isNe ? 'सिफारिस' : 'TARGET'}
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  <td className="py-2.5 px-3 font-editorial-mono font-black text-xs sm:text-sm">
                                    <span className={row.isTarget ? 'text-[#1E5E41] dark:text-[#4ADE80]' : 'text-[#1F1E1B] dark:text-[#F5F3EF]'}>
                                      Rs {row.price}
                                    </span>
                                    <span className="text-[11px] font-normal text-[#746F68] dark:text-[#A6A096]">/kg</span>
                                  </td>

                                  <td className="py-2.5 px-3 font-editorial-mono">
                                    {row.offset === 0 ? (
                                      <span className="text-xs text-[#746F68] dark:text-[#A6A096] font-medium">{isNe ? 'आधार' : 'Base'}</span>
                                    ) : row.diff >= 0 ? (
                                      <span className="text-xs font-extrabold text-[#2E7D5A] dark:text-[#4ADE80]">
                                        +Rs {row.diff}/kg
                                      </span>
                                    ) : (
                                      <span className="text-xs font-extrabold text-[#FF684A]">
                                        Rs {row.diff}/kg
                                      </span>
                                    )}
                                  </td>

                                  <td className="py-2.5 px-3 text-right">
                                    {row.isTarget ? (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-[#2E7D5A] text-white dark:bg-[#3EA678]">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>{isNe ? row.statusNe : row.statusEn}</span>
                                      </span>
                                    ) : (
                                      <span className="text-xs text-[#746F68] dark:text-[#A6A096] font-semibold">
                                        {isNe ? row.statusNe : row.statusEn}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {onNavigateTab && (
                      <div className="pt-2 border-t border-[#E8E2D8] dark:border-[#383530] flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => onNavigateTab('calculator', { commodityId: activeCrop.id })}
                          className="text-xs font-extrabold text-[#1F1E1B] dark:text-[#F5F3EF] hover:text-[#2E7D5A] hover:underline flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>{isNe ? 'नाफा क्याल्कुलेटर' : 'Profit Calculator'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>

      {/* ---------------------------------------------------- */}
      {/* WHERE TO SELL SECTION (Transport Pool + Direct Buyer Match) */}
      {/* ---------------------------------------------------- */}
      <div className="space-y-5 pt-3">
        <div className="flex items-center justify-between gap-2 pb-1 border-b border-[#E8E2D8] dark:border-[#383530]">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#8C6237] dark:text-[#D9B591]">
              {isNe ? 'बजार र ढुवानी' : 'LOGISTICS & MARKET CHANNELS'}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#1F1E1B] dark:text-[#F5F3EF] tracking-tight mt-0.5">
              {isNe ? 'कहाँ बेच्ने?' : 'Where to Sell'}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          
          {/* CARD A: CALENDAR-BASED ROUTE DISPATCHER */}
          <div className="app-card p-5 sm:p-6 flex flex-col justify-between space-y-5 border border-[#E8E2D8] dark:border-[#383530] shadow-sm hover:border-[#2D6CDF]/40 transition-colors bg-white dark:bg-[#22201D]">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D8] dark:border-[#383530]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#EAF3EE] dark:bg-[#1E3327] text-[#2E7D5A] dark:text-[#4ADE80] flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-black text-[#1F1E1B] dark:text-[#F5F3EF] tracking-tight">
                    {isNe ? 'ढुवानी गाडीहरू' : 'Transport Trucks'}
                  </h4>
                </div>
                <span className="text-xs font-bold text-[#746F68] dark:text-[#A6A096]">
                  {filteredTrucks.length} {isNe ? 'उपलब्ध' : 'available'}
                </span>
              </div>

              {/* CALENDAR & LOCATION CONTROLS */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] space-y-2.5">
                {/* Destination Dropdown & Date Display */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="flex items-center gap-2.5 bg-white dark:bg-[#1E1D1B] px-3.5 py-2.5 rounded-xl border border-[#E8E2D8] dark:border-[#383530] flex-1">
                    <MapPin className="w-4 h-4 text-[#2D6CDF] shrink-0" />
                    <select
                      value={selectedDestination}
                      onChange={(e) => {
                        setSelectedDestination(e.target.value);
                        setSelectedTruckId(null);
                      }}
                      className="bg-transparent text-sm font-bold text-[#1F1E1B] dark:text-[#F5F3EF] focus:outline-none w-full cursor-pointer"
                    >
                      <option value="all" className="dark:bg-[#1E1D1B]">{isNe ? 'सबै बजारहरू' : 'All Mandis'}</option>
                      <option value="kalimati" className="dark:bg-[#1E1D1B]">{isNe ? 'कालीमाटी थोक बजार' : 'Kalimati Wholesale'}</option>
                      <option value="balkhu" className="dark:bg-[#1E1D1B]">{isNe ? 'बल्खु कृषि बजार' : 'Balkhu Market'}</option>
                      <option value="narayangarh" className="dark:bg-[#1E1D1B]">{isNe ? 'नारायणगढ मन्डी' : 'Narayangarh Mandi'}</option>
                      <option value="pokhara" className="dark:bg-[#1E1D1B]">{isNe ? 'पोखरा थोक बजार' : 'Pokhara Wholesale'}</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between sm:justify-center px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E1D1B] border border-[#E8E2D8] dark:border-[#383530] text-xs font-editorial-mono font-bold text-[#1F1E1B] dark:text-[#F5F3EF] shrink-0 gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#2D6CDF]" />
                    <span>{activeCalendarDay.bsDateStr}</span>
                  </div>
                </div>

                {/* Calendar Date Pills Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                  {calendarDates.map((dateObj) => {
                    const isSelected = selectedDispatchDate === dateObj.id;
                    return (
                      <button
                        key={dateObj.id}
                        type="button"
                        onClick={() => {
                          setSelectedDispatchDate(dateObj.id);
                          setSelectedTruckId(null);
                        }}
                        className={`flex-1 flex flex-col items-center justify-center px-2 py-1.5 rounded-xl border text-center transition cursor-pointer min-w-[48px] sm:min-w-[54px] ${
                          isSelected
                            ? 'bg-[#2D6CDF] text-white border-[#2D6CDF] shadow-xs'
                            : 'bg-white dark:bg-[#1E1D1B] text-[#1F1E1B] dark:text-[#F5F3EF] border-[#E8E2D8] dark:border-[#383530] hover:bg-[#FAF7F2] dark:hover:bg-[#262421]'
                        }`}
                      >
                        <span className="text-sm sm:text-base font-black leading-tight">
                          {dateObj.dayNum}
                        </span>
                        <span className={`text-[11px] font-semibold leading-tight ${isSelected ? 'text-white/90' : 'text-[#746F68] dark:text-[#A6A096]'}`}>
                          {dateObj.dayName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TRUCK LIST */}
              <div className="space-y-2.5 pt-1">
                {filteredTrucks.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] text-center space-y-2">
                    <Truck className="w-8 h-8 text-[#A6A096] mx-auto opacity-50" />
                    <span className="text-sm font-bold text-[#1F1E1B] dark:text-[#F5F3EF] block">
                      {isNe ? 'कुनै गाडी तालिका छैन' : 'No trucks scheduled'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedDestination('all')}
                      className="mt-1 text-xs font-bold text-[#2D6CDF] hover:underline cursor-pointer"
                    >
                      {isNe ? 'सबै बजारहरू देखाउनुहोस्' : 'Show all destinations'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {filteredTrucks.map((truck) => {
                      const isExpanded = selectedTruckId === truck.id;
                      return (
                        <div
                          key={truck.id}
                          onClick={() => setSelectedTruckId(isExpanded ? null : truck.id)}
                          className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${
                            isExpanded
                              ? 'bg-[#F0F6FF] dark:bg-[#1B2942] border-[#2D6CDF] shadow-xs'
                              : 'bg-[#FAF7F2] dark:bg-[#262421] border-[#E8E2D8] dark:border-[#383530] hover:border-[#2D6CDF]/40 hover:bg-white dark:hover:bg-[#22201D]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                isExpanded
                                  ? 'bg-[#2D6CDF] text-white'
                                  : 'bg-[#EAF3EE] dark:bg-[#1E3327] text-[#2E7D5A] dark:text-[#4ADE80]'
                              }`}>
                                <Truck className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <h5 className="font-black text-base sm:text-lg text-[#1F1E1B] dark:text-[#F5F3EF]">
                                  {isNe ? truck.destinationNe : truck.destinationEn}
                                </h5>
                                <span className="text-sm font-semibold text-[#545048] dark:text-[#C5BFB5] mt-0.5 block">
                                  {isNe ? truck.departureNe : truck.departureEn}
                                </span>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="font-editorial-mono font-black text-base sm:text-lg text-[#1F1E1B] dark:text-[#F5F3EF]">
                                {truck.capacityKg} kg
                              </span>
                            </div>
                          </div>

                          {/* EXPANDED ON CLICK ONLY: Book Space Button */}
                          {isExpanded && (
                            <div className="mt-3 pt-3 border-t border-[#D0E2FC] dark:border-[#2A3E60] flex justify-end">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onNavigateToSell) {
                                    onNavigateToSell(activeCrop.id);
                                  } else if (onNavigateTab) {
                                    onNavigateTab('pool', { commodityId: activeCrop.id });
                                  }
                                }}
                                className="px-4 py-2 rounded-xl bg-[#2E7D5A] hover:bg-[#246648] text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition active:scale-[0.98]"
                              >
                                <span>{isNe ? 'ठाउँ बुक गर्नुहोस्' : 'Book Space'}</span>
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E2D8] dark:border-[#383530] flex items-center justify-between">
              <span className="text-xs text-[#746F68] dark:text-[#A6A096] font-medium">
                {isNe ? 'अन्य रुटहरू:' : 'Other routes:'}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (onNavigateToSell) {
                    onNavigateToSell(activeCrop.id);
                  } else if (onNavigateTab) {
                    onNavigateTab('pool', { commodityId: activeCrop.id });
                  }
                }}
                className="text-xs font-extrabold text-[#2D6CDF] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{isNe ? 'सम्पूर्ण तालिका' : 'All Schedules'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* CARD B: DIRECT BUYER DEMAND LIST */}
          <div className="app-card p-5 sm:p-6 flex flex-col justify-between space-y-5 border border-[#E8E2D8] dark:border-[#383530] shadow-sm hover:border-[#C8A27C]/50 transition-colors bg-white dark:bg-[#22201D]">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D8] dark:border-[#383530]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] dark:bg-[#2A2824] text-[#8C6237] dark:text-[#D9B591] flex items-center justify-center border border-[#E8E2D8] dark:border-[#383530] shrink-0">
                    <Store className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-black text-[#1F1E1B] dark:text-[#F5F3EF] tracking-tight">
                    {isNe ? 'सिधा खरिददारहरू' : 'Direct Buyers'}
                  </h4>
                </div>
                <span className="text-xs font-bold text-[#746F68] dark:text-[#A6A096]">
                  {localBuyersList.length} {isNe ? 'प्रमाणित' : 'verified'}
                </span>
              </div>

              {/* LIST OF BUYERS: Clean list matching Transport Trucks */}
              <div className="space-y-2.5 pt-1">
                {contactSuccessBuyer && (
                  <div className="p-3 rounded-xl bg-[#EAF3EE] dark:bg-[#1E3327] text-[#2E7D5A] dark:text-[#4ADE80] text-xs sm:text-sm font-bold flex items-center justify-between animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{isNe ? `सम्पर्क कल जोडिँदै: ${contactSuccessBuyer}` : `Calling ${contactSuccessBuyer}...`}</span>
                    </div>
                    <button onClick={() => setContactSuccessBuyer(null)} className="cursor-pointer text-sm font-black px-1">✕</button>
                  </div>
                )}

                <div className="space-y-2.5">
                  {localBuyersList.map((buyer) => {
                    const isExpanded = selectedBuyerId === buyer.id;
                    return (
                      <div
                        key={buyer.id}
                        onClick={() => setSelectedBuyerId(isExpanded ? null : buyer.id)}
                        className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${
                          isExpanded
                            ? 'bg-[#FDFBF7] dark:bg-[#282521] border-[#C8A27C] shadow-xs'
                            : 'bg-[#FAF7F2] dark:bg-[#262421] border-[#E8E2D8] dark:border-[#383530] hover:border-[#C8A27C]/50 hover:bg-white dark:hover:bg-[#22201D]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[#F3ECE0] dark:bg-[#383126] text-[#8C6237] dark:text-[#D9B591]">
                              <Store className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h5 className="font-black text-base sm:text-lg text-[#1F1E1B] dark:text-[#F5F3EF] truncate">
                                {isNe ? buyer.nameNe : buyer.nameEn}
                              </h5>
                              <div className="flex items-center gap-1.5 text-sm font-semibold text-[#545048] dark:text-[#C5BFB5] mt-0.5">
                                <span>{buyer.volumeKg} kg</span>
                                <span>·</span>
                                <span>{buyer.distanceKm} km</span>
                                <span>·</span>
                                <span className="truncate">{isNe ? buyer.locationNe : buyer.locationEn}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-editorial-mono font-black text-lg sm:text-xl text-[#8C6237] dark:text-[#D9B591]">
                              Rs {buyer.rate}
                            </span>
                            <span className="text-xs text-[#2E7D5A] dark:text-[#4ADE80] font-bold block">
                              +Rs {buyer.diffVsMandi}/kg
                            </span>
                          </div>
                        </div>

                        {/* Expanded details on click: phone/contact */}
                        {isExpanded && (
                          <div className="mt-3.5 pt-3.5 border-t border-[#E8E2D8] dark:border-[#383530] flex items-center justify-between gap-3">
                            <div className="text-xs sm:text-sm text-[#746F68] dark:text-[#A6A096]">
                              <span className="font-bold text-[#1F1E1B] dark:text-[#F5F3EF]">{isNe ? buyer.typeNe : buyer.typeEn}</span>
                              <span className="mx-1.5">·</span>
                              <span className="font-editorial-mono">{buyer.phone}</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setContactSuccessBuyer(isNe ? buyer.nameNe : buyer.nameEn);
                              }}
                              className="px-4 py-2 rounded-xl bg-[#2E7D5A] hover:bg-[#246648] text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition active:scale-[0.98]"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>{isNe ? 'सम्पर्क' : 'Contact'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E2D8] dark:border-[#383530] flex items-center justify-between">
              <span className="text-xs text-[#746F68] dark:text-[#A6A096] font-medium">
                {isNe ? 'थप मागहरू:' : 'Marketplace lots:'}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (onNavigateTab) {
                    onNavigateTab('marketplace', { commodityId: activeCrop.id });
                  }
                }}
                className="text-xs font-extrabold text-[#8C6237] dark:text-[#D9B591] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{isNe ? 'सबै खरिददारहरू' : 'All Marketplace Buyers'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>
          </>
        )}
      </main>

      {/* Crop Selection & Management Modal */}
      <CropSelectionModal
        isOpen={isAddCropModalOpen}
        onClose={() => setIsAddCropModalOpen(false)}
        availableCropIds={availableCropIds}
        onSave={handleSaveCrops}
        commodities={commodities}
      />
    </div>
  );
};
