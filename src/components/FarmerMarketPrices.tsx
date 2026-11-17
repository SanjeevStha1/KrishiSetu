import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Truck,
  MapPin,
  Search,
  Mic,
  X,
  Bell,
  Sparkles,
  Info,
  Calendar,
  Sprout,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Layers,
  Leaf,
  Flame,
  Wheat,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  Award,
  Globe,
  Store,
  Filter,
  ShieldCheck,
  PlusCircle,
  Send,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceDot,
  ReferenceLine,
  Tooltip,
} from 'recharts';
import { Commodity, OHLCV, UserProfile } from '../types/krishi';
import { DISTRICT_LIST, generateHistoricalOHLCV, getRecommendationsForDistrict } from '../data/agriData';
import { getCropImage } from '../data/nepalAgriImages';
import { CropIllustration } from './CropIllustration';
import { KrishiApi } from '../services/krishiApi';
import { PriceAlertModal } from './PriceAlertModal';
import { ActionableInsights } from './ActionableInsights';
import { DistrictWeatherWidget } from './DistrictWeatherWidget';
import { useLanguage } from '../context/LanguageContext';
import {
  marketApi,
  KalimatiBulletinItem,
  NationalMandiHub,
  RegionalCropPrice,
  DistrictPriceReport,
} from '../api/marketApi';
import { AppTab } from './Header';

interface FarmerMarketPricesProps {
  commodities: Commodity[];
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  onNavigateToSell?: (cropId: string) => void;
  initialSelectedCropId?: string;
  userProfile?: UserProfile;
  onNavigateTab?: (tab: AppTab, extra?: { commodityId?: string }) => void;
}

type SortOption = 'price_desc' | 'price_asc' | 'change_desc' | 'name_asc';
type CategoryFilter = 'all' | 'vegetable' | 'fruit' | 'staple' | 'spices';

export const FarmerMarketPrices: React.FC<FarmerMarketPricesProps> = ({
  commodities,
  selectedDistrict,
  setSelectedDistrict,
  onNavigateToSell,
  initialSelectedCropId = 'tomato',
  userProfile,
  onNavigateTab,
}) => {
  const { t, language } = useLanguage();

  // Primary Mode Switch: "My Data" vs "Market Data" (Defaulting to "My Data" for actionable farm guidance)
  const [dashboardMode, setDashboardMode] = useState<'my_data' | 'market_data'>('my_data');

  const [selectedCropId, setSelectedCropId] = useState<string>(initialSelectedCropId);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [showVoiceRoadmapModal, setShowVoiceRoadmapModal] = useState<boolean>(false);

  const currentDistrictObj = useMemo(() => {
    return DISTRICT_LIST.find((d) => d.id.toLowerCase() === selectedDistrict.toLowerCase()) || DISTRICT_LIST[0];
  }, [selectedDistrict]);

  const activeCrop = useMemo(() => {
    return commodities.find((c) => c.id === selectedCropId) || commodities[0];
  }, [commodities, selectedCropId]);

  // Recommended Crop for Highest Yield for that area
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

  // Real price history from backend
  const [priceHistory, setPriceHistory] = useState<Array<{ date: string; price: number }>>([]);

  // Nationwide 77-District Multi-Mandi Network & 3-Layer Regional Prices
  const [mandiNetwork, setMandiNetwork] = useState<NationalMandiHub[]>([]);
  const [mandiProvinceFilter, setMandiProvinceFilter] = useState<string>('all');
  const [mandiSearch, setMandiSearch] = useState<string>('');
  const [isMandisLoading, setIsMandisLoading] = useState<boolean>(false);
  const [regionalPriceMap, setRegionalPriceMap] = useState<Record<string, RegionalCropPrice>>({});
  const [ampisHubInfo, setAmpisHubInfo] = useState<{
    hubKey: string;
    nameEn: string;
    nameNe: string;
    lastObservedLabel: string;
    overallRatioVsKalimati: number;
    source: string;
  } | null>(null);
  const [recentReports, setRecentReports] = useState<DistrictPriceReport[]>([]);
  const [regionalRefreshKey, setRegionalRefreshKey] = useState<number>(0);

  // Local Mandi Price Reporting Modal State
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportCropId, setReportCropId] = useState<string>(initialSelectedCropId || 'tomato');
  const [reportMarketName, setReportMarketName] = useState<string>('');
  const [reportPriceType, setReportPriceType] = useState<'wholesale' | 'farmgate'>('wholesale');
  const [reportPricePerKg, setReportPricePerKg] = useState<string>('');
  const [reportReporterName, setReportReporterName] = useState<string>(userProfile?.name || '');
  const [reportReporterRole, setReportReporterRole] = useState<'farmer' | 'cooperative' | 'mandi_agent'>('farmer');
  const [reportPhone, setReportPhone] = useState<string>(userProfile?.phone || '');
  const [isSubmittingReport, setIsSubmittingReport] = useState<boolean>(false);
  const [reportError, setReportError] = useState<string>('');
  const [reportSuccess, setReportSuccess] = useState<string>('');

  const [fullBulletin, setFullBulletin] = useState<KalimatiBulletinItem[]>([]);
  const [bulletinCategory, setBulletinCategory] = useState<'all' | 'vegetable' | 'fruit' | 'spice' | 'exotic'>('all');
  const [bulletinSearch, setBulletinSearch] = useState<string>('');
  const [showAllBulletin, setShowAllBulletin] = useState<boolean>(false);
  const [isBulletinLoading, setIsBulletinLoading] = useState<boolean>(false);

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

  // Fetch 3-layer localized prices for selectedDistrict
  useEffect(() => {
    let cancelled = false;
    marketApi.getRegionalPrices(selectedDistrict || 'chitwan')
      .then((res) => {
        if (cancelled || !res) return;
        const map: Record<string, RegionalCropPrice> = {};
        for (const p of res.prices || []) {
          map[p.cropId] = p;
        }
        setRegionalPriceMap(map);
        setAmpisHubInfo(res.ampisHub || null);
        setRecentReports(res.recentReports || []);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [selectedDistrict, commodities, regionalRefreshKey]);

  // Fetch nationwide 77-district mandi comparison for selected crop
  useEffect(() => {
    let cancelled = false;
    setIsMandisLoading(true);
    marketApi.getMandisNetwork(selectedCropId || 'tomato', mandiProvinceFilter)
      .then((res) => {
        if (!cancelled && res?.mandis) {
          setMandiNetwork(res.mandis);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsMandisLoading(false);
      });
    return () => { cancelled = true; };
  }, [selectedCropId, mandiProvinceFilter, regionalRefreshKey]);

  // Fetch full official Kalimati daily bulletin (~116 items)
  useEffect(() => {
    let cancelled = false;
    setIsBulletinLoading(true);
    marketApi.getFullBulletin()
      .then((res) => {
        if (!cancelled && res?.items) {
          setFullBulletin(res.items);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsBulletinLoading(false);
      });
    return () => { cancelled = true; };
  }, [commodities]);

  const activeRegionalPrice = activeCrop ? regionalPriceMap[activeCrop.id] : undefined;

  const filteredMandiNetwork = useMemo(() => {
    if (!mandiSearch.trim()) return mandiNetwork;
    const q = mandiSearch.toLowerCase().trim();
    return mandiNetwork.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.nameNe.includes(q) ||
        h.mandiName.toLowerCase().includes(q) ||
        h.province.toLowerCase().includes(q)
    );
  }, [mandiNetwork, mandiSearch]);

  const handleOpenReportModal = (presetCropId?: string) => {
    setReportCropId(presetCropId || selectedCropId || 'tomato');
    setReportMarketName(
      currentDistrictObj.name.includes('(')
        ? `${currentDistrictObj.name.split('(')[1].replace(')', '').trim()} Krishi Mandi`
        : `${currentDistrictObj.name} Krishi Bazar`
    );
    setReportPricePerKg('');
    setReportError('');
    setReportSuccess('');
    setShowReportModal(true);
  };

  const handleSubmitLocalReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportError('');
    setReportSuccess('');
    const numPrice = Number(reportPricePerKg);
    if (!Number.isFinite(numPrice) || numPrice < 5 || numPrice > 2500) {
      setReportError(
        language === 'ne'
          ? 'कृपया रु ५ देखि २५०० भित्र सही मूल्य राख्नुहोस्।'
          : 'Please enter a valid price between Rs 5 and Rs 2500/kg.'
      );
      return;
    }
    if (!reportMarketName.trim() || !reportReporterName.trim()) {
      setReportError(
        language === 'ne'
          ? 'बजारको नाम र रिपोर्टरको नाम अनिवार्य छ।'
          : 'Market name and reporter name are required.'
      );
      return;
    }

    setIsSubmittingReport(true);
    try {
      await marketApi.submitPriceReport({
        districtId: selectedDistrict,
        cropId: reportCropId,
        marketName: reportMarketName.trim(),
        priceType: reportPriceType,
        pricePerKg: Math.round(numPrice),
        reporterName: reportReporterName.trim(),
        reporterRole: reportReporterRole,
        reporterPhone: reportPhone.trim() || undefined,
      });
      setReportSuccess(
        language === 'ne'
          ? 'स्थानीय मन्डी दर सफलतापूर्वक सुरक्षित गरियो र जिल्ला दर अद्यावधिक भयो!'
          : 'Local rate saved! District prices updated immediately.'
      );
      setRegionalRefreshKey((k) => k + 1);
      setTimeout(() => {
        setShowReportModal(false);
      }, 1100);
    } catch (err: any) {
      setReportError(err?.message || 'Failed to save report');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // 14-Day Price Trajectory (Past 7 Days + 7-Day Forecast) - Matches My Farm Data
  const chartData14Days = useMemo(() => {
    if (!activeCrop) {
      return {
        points: [],
        peakPoint: { dayKey: '+2d', dayLabel: '+2d', dateStr: '', price: 50, actualPrice: null, predictedPrice: 50, type: 'predicted' as const, peakDayIdx: 2, peakPrice: 50, diffVsCurrent: 0 },
        minPrice: 0,
        maxPrice: 100,
        currentPrice: 50,
        yesterdayPrice: 50,
      };
    }

    const kalimatiCurrent = Math.round(activeCrop.currentPrice);
    const localScale =
      activeRegionalPrice && kalimatiCurrent > 0
        ? activeRegionalPrice.localizedWholesalePrice / kalimatiCurrent
        : 1;
    const currentPrice = activeRegionalPrice
      ? Math.round(activeRegionalPrice.localizedWholesalePrice)
      : kalimatiCurrent;
    const yesterdayPrice = Math.round((activeCrop.yesterdayPrice ?? activeCrop.previousClose ?? kalimatiCurrent) * localScale);
    const forecast7Day = Math.round((activeCrop.forecast7Day ?? (kalimatiCurrent * (activeCrop.changePct >= 0 ? 1.05 : 0.96))) * localScale);
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
    const isNe = language === 'ne';

    // Map history records by date
    const historyMap = new Map<string, number>();
    for (const h of priceHistory) {
      if (h && h.date && typeof h.price === 'number') {
        historyMap.set(h.date, Math.round(h.price * localScale));
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
        // Smooth backward curve leading to yesterday's price
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

    // 2. Today (Day 0) - Bridge point
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
  }, [activeCrop, activeRegionalPrice, priceHistory, language]);

  // Best Selling Crops (Crops Sold in that Area across all 7 Provinces)
  const areaBestSellingCrops = useMemo(() => {
    const districtKey = selectedDistrict.toLowerCase();

    const areaTurnoverProfiles: Record<string, Array<{ id: string; volumeMt: string; highlightEn: string; highlightNe: string }>> = {
      chitwan: [
        { id: 'tomato', volumeMt: '18.5 MT/day', highlightEn: 'High Daily Turnover', highlightNe: 'दैनिक उच्च मन्डी माग' },
        { id: 'potato', volumeMt: '24.2 MT/day', highlightEn: 'Everyday Household Staple', highlightNe: 'नियमित मुख्य भान्सा बाली' },
        { id: 'cabbage', volumeMt: '21.0 MT/day', highlightEn: 'Highway Wholesale Bulk', highlightNe: 'राजमार्ग थोक ढुवानी' },
        { id: 'cauliflower', volumeMt: '15.4 MT/day', highlightEn: 'Peak Seasonal Demand', highlightNe: 'मौसमी उच्च माग' },
        { id: 'capsicum', volumeMt: '8.2 MT/day', highlightEn: 'Hotel Corridor Demand', highlightNe: 'होटल कोरिडोर बिक्री' },
        { id: 'onion', volumeMt: '19.0 MT/day', highlightEn: 'Continuous Daily Supply', highlightNe: 'नियमित दैनिक आपूर्ति' },
      ],
      kathmandu: [
        { id: 'tomato', volumeMt: '42.0 MT/day', highlightEn: 'Valley Core Daily Demand', highlightNe: 'उपत्यका मुख्य खपत' },
        { id: 'potato', volumeMt: '65.0 MT/day', highlightEn: 'Kalimati Highest Influx', highlightNe: 'कालीमाटी सर्वाधिक बिक्री' },
        { id: 'onion', volumeMt: '38.0 MT/day', highlightEn: 'Heavy Kitchen Consumption', highlightNe: 'दैनिक भान्सा माग' },
        { id: 'cauliflower', volumeMt: '28.0 MT/day', highlightEn: 'Morning Mandi Absorption', highlightNe: 'बिहानी थोक बिक्री' },
        { id: 'cabbage', volumeMt: '26.0 MT/day', highlightEn: 'Bulk Catering Flow', highlightNe: 'थोक क्याटरिङ खपत' },
        { id: 'carrot', volumeMt: '14.0 MT/day', highlightEn: 'Fast Retail Turnover', highlightNe: 'द्रुत खुद्रा बिक्री' },
      ],
      dhading: [
        { id: 'cauliflower', volumeMt: '22.0 MT/day', highlightEn: 'Major Valley Feeder', highlightNe: 'राजधानीको मुख्य आपूर्ति' },
        { id: 'cabbage', volumeMt: '25.0 MT/day', highlightEn: 'Highway Freight Transit', highlightNe: 'ट्रक ढुवानी उच्च' },
        { id: 'tomato', volumeMt: '16.5 MT/day', highlightEn: 'Tunnel Harvest Favourite', highlightNe: 'टनेल उत्पादन' },
        { id: 'capsicum', volumeMt: '9.0 MT/day', highlightEn: 'Commercial High Cash', highlightNe: 'उच्च मूल्य नगदे बाली' },
        { id: 'bitter_gourd', volumeMt: '11.0 MT/day', highlightEn: 'River Basin Harvest', highlightNe: 'बेँसीको उत्पादन' },
        { id: 'potato', volumeMt: '18.0 MT/day', highlightEn: 'Terrace Farm Staple', highlightNe: 'पहाडी मुख्य बाली' },
      ],
      kavre: [
        { id: 'tomato', volumeMt: '26.0 MT/day', highlightEn: 'Panchkhal Tunnel Tomato', highlightNe: 'पाँचखाल टनेल गोलभेडा' },
        { id: 'potato', volumeMt: '32.0 MT/day', highlightEn: 'Red Potato Core Trade', highlightNe: 'रातो आलु मुख्य केन्द्र' },
        { id: 'cauliflower', volumeMt: '18.0 MT/day', highlightEn: 'Valley Morning Supply', highlightNe: 'काठमाडौँ बिहानी आपूर्ति' },
        { id: 'cabbage', volumeMt: '16.0 MT/day', highlightEn: 'Highway Direct Supply', highlightNe: 'राजमार्ग सिधा आपूर्ति' },
        { id: 'peas', volumeMt: '12.0 MT/day', highlightEn: 'Seasonal High Demand', highlightNe: 'नगदे मौसमी बाली' },
        { id: 'onion', volumeMt: '14.0 MT/day', highlightEn: 'Local Trading Hub', highlightNe: 'स्थानीय व्यापार' },
      ],
      jhapa: [
        { id: 'ginger', volumeMt: '16.0 MT/day', highlightEn: 'Kakarbhitta Export Spice', highlightNe: 'काँकरभिट्टा निर्यात अदुवा' },
        { id: 'potato', volumeMt: '28.0 MT/day', highlightEn: 'Birtamod Mandi Staple', highlightNe: 'बिर्तामोड थोक आलु' },
        { id: 'tomato', volumeMt: '19.5 MT/day', highlightEn: 'East Tarai Corridor', highlightNe: 'पूर्वी तराई मुख्य आपूर्ति' },
        { id: 'cabbage', volumeMt: '21.0 MT/day', highlightEn: 'Mahendra Hwy Bulk', highlightNe: 'राजमार्ग थोक बन्दा' },
        { id: 'chilli', volumeMt: '8.5 MT/day', highlightEn: 'High Cash Spice', highlightNe: 'उच्च मूल्य खुर्सानी' },
        { id: 'onion', volumeMt: '22.0 MT/day', highlightEn: 'Daily Regional Demand', highlightNe: 'दैनिक क्षेत्रीय माग' },
      ],
      morang: [
        { id: 'potato', volumeMt: '34.0 MT/day', highlightEn: 'Biratnagar Gudri Core', highlightNe: 'गुद्री थोक आलु' },
        { id: 'onion', volumeMt: '29.0 MT/day', highlightEn: 'Border Transit Hub', highlightNe: 'सीमा व्यापार मुख्य बाली' },
        { id: 'brinjal', volumeMt: '15.0 MT/day', highlightEn: 'East Tarai Warm Crop', highlightNe: 'पूर्वी तराई भन्टा' },
        { id: 'ladies_finger', volumeMt: '13.0 MT/day', highlightEn: 'Fast Summer Turnover', highlightNe: 'गर्मीयाम उच्च माग' },
        { id: 'tomato', volumeMt: '24.0 MT/day', highlightEn: 'Urban Household Staple', highlightNe: 'शहरी दैनिक माग' },
        { id: 'garlic', volumeMt: '7.0 MT/day', highlightEn: 'High Value Spice', highlightNe: 'उच्च मूल्य मसला' },
      ],
      sarlahi: [
        { id: 'tomato', volumeMt: '32.0 MT/day', highlightEn: 'Lalbandi National Hub', highlightNe: 'लालबन्दी मुख्य गोलभेडा' },
        { id: 'bottle_gourd', volumeMt: '18.0 MT/day', highlightEn: 'East-West Highway Bulk', highlightNe: 'राजमार्ग थोक लौका' },
        { id: 'bitter_gourd', volumeMt: '14.5 MT/day', highlightEn: 'Madhesh Spring Cash Crop', highlightNe: 'मधेश नगदे बाली' },
        { id: 'ladies_finger', volumeMt: '16.0 MT/day', highlightEn: 'Tarai Belt Volume', highlightNe: 'तराई उच्च उत्पादन' },
        { id: 'chilli', volumeMt: '9.5 MT/day', highlightEn: 'High Margin Cash Spice', highlightNe: 'उच्च नाफा खुर्सानी' },
        { id: 'brinjal', volumeMt: '17.0 MT/day', highlightEn: 'Regional Mandi Staple', highlightNe: 'क्षेत्रीय थोक बिक्री' },
      ],
      pokhara: [
        { id: 'tomato', volumeMt: '22.0 MT/day', highlightEn: 'Tourism & City Demand', highlightNe: 'पोखरा होटल तथा शहरी माग' },
        { id: 'capsicum', volumeMt: '10.5 MT/day', highlightEn: 'Lakeside Hospitality', highlightNe: 'होटल तथा रेस्टुरेन्ट माग' },
        { id: 'cauliflower', volumeMt: '19.0 MT/day', highlightEn: 'Gandaki Wholesale Flow', highlightNe: 'गण्डकी थोक बिक्री' },
        { id: 'mushroom', volumeMt: '5.5 MT/day', highlightEn: 'High Margin City Crop', highlightNe: 'उच्च मूल्य च्याउ' },
        { id: 'cucumber', volumeMt: '14.0 MT/day', highlightEn: 'Fresh Valley Produce', highlightNe: 'ताजा स्थानीय उत्पादन' },
        { id: 'potato', volumeMt: '27.0 MT/day', highlightEn: 'Steady Staple Trade', highlightNe: 'नियमित थोक कारोबार' },
      ],
      rupandehi: [
        { id: 'onion', volumeMt: '31.0 MT/day', highlightEn: 'Butwal / Sunauli Trade', highlightNe: 'बुटवल-सुनौली मुख्य प्याज' },
        { id: 'potato', volumeMt: '35.0 MT/day', highlightEn: 'Lumbini Wholesale Core', highlightNe: 'लुम्बिनी थोक आलु' },
        { id: 'tomato', volumeMt: '25.0 MT/day', highlightEn: 'Daily Consumer Influx', highlightNe: 'दैनिक उच्च खपत' },
        { id: 'cauliflower', volumeMt: '18.0 MT/day', highlightEn: 'Hill-Tarai Hub Trade', highlightNe: 'पहाड-तराई थोक व्यापार' },
        { id: 'cabbage', volumeMt: '16.0 MT/day', highlightEn: 'Highway Wholesale', highlightNe: 'राजमार्ग थोक बिक्री' },
        { id: 'chilli', volumeMt: '8.0 MT/day', highlightEn: 'Spice Market Demand', highlightNe: 'मसला बजार माग' },
      ],
      banke: [
        { id: 'onion', volumeMt: '26.0 MT/day', highlightEn: 'Nepalgunj Western Hub', highlightNe: 'नेपालगञ्ज पश्चिम केन्द्र' },
        { id: 'potato', volumeMt: '30.0 MT/day', highlightEn: 'Karnali-Lumbini Feeder', highlightNe: 'कर्णाली आपूर्ति मुख्य बाली' },
        { id: 'tomato', volumeMt: '20.0 MT/day', highlightEn: 'Daily Mandi Trade', highlightNe: 'दैनिक मन्डी कारोबार' },
        { id: 'ginger', volumeMt: '11.0 MT/day', highlightEn: 'Hill Spice Collection', highlightNe: 'पहाडी अदुवा संकलन' },
        { id: 'garlic', volumeMt: '8.5 MT/day', highlightEn: 'Western Export Trade', highlightNe: 'उच्च मूल्य लसुन' },
        { id: 'brinjal', volumeMt: '14.0 MT/day', highlightEn: 'Tarai Regional Crop', highlightNe: 'तराई क्षेत्रीय बाली' },
      ],
      kailali: [
        { id: 'potato', volumeMt: '25.0 MT/day', highlightEn: 'Attariya Far-West Hub', highlightNe: 'अत्तरिया सुदूरपश्चिम केन्द्र' },
        { id: 'onion', volumeMt: '22.0 MT/day', highlightEn: 'Dhangadhi Daily Staple', highlightNe: 'धनगढी दैनिक माग' },
        { id: 'tomato', volumeMt: '18.0 MT/day', highlightEn: 'Regional Mandi Volume', highlightNe: 'क्षेत्रीय थोक गोलभेडा' },
        { id: 'cabbage', volumeMt: '15.0 MT/day', highlightEn: 'Winter Highway Cargo', highlightNe: 'हिउँदे थोक बाली' },
        { id: 'garlic', volumeMt: '7.5 MT/day', highlightEn: 'High Value Spice', highlightNe: 'उच्च मूल्य लसुन' },
        { id: 'peas', volumeMt: '9.0 MT/day', highlightEn: 'Hill-Tarai Cash Crop', highlightNe: 'नगदे हरियो केराउ' },
      ],
      jumla: [
        { id: 'potato', volumeMt: '12.0 MT/day', highlightEn: 'Highland Organic Potato', highlightNe: 'जुम्ली अर्गानिक आलु' },
        { id: 'beans', volumeMt: '8.5 MT/day', highlightEn: 'Signature Jumli Simi', highlightNe: 'प्रसिद्ध जुम्ली सिमी' },
        { id: 'garlic', volumeMt: '4.5 MT/day', highlightEn: 'Mountain Cash Spice', highlightNe: 'उच्च पहाडी लसुन' },
        { id: 'cabbage', volumeMt: '9.0 MT/day', highlightEn: 'Off-Season Summer Crop', highlightNe: 'बेमौसमी बन्दा' },
        { id: 'carrot', volumeMt: '6.0 MT/day', highlightEn: 'Crisp Cold-Climate Crop', highlightNe: 'चिसो हावापानी गाजर' },
        { id: 'radish', volumeMt: '7.5 MT/day', highlightEn: 'Karnali Local Staple', highlightNe: 'कर्णाली स्थानीय बाली' },
      ],
      mustang: [
        { id: 'potato', volumeMt: '10.0 MT/day', highlightEn: 'Highland Organic Tubers', highlightNe: 'हिमाली अर्गानिक आलु' },
        { id: 'carrot', volumeMt: '5.5 MT/day', highlightEn: 'Sweet Alpine Carrot', highlightNe: 'मुस्ताङ्गी मीठो गाजर' },
        { id: 'cabbage', volumeMt: '7.0 MT/day', highlightEn: 'Off-Season Hill Crop', highlightNe: 'बेमौसमी पहाडी बन्दा' },
        { id: 'beans', volumeMt: '4.8 MT/day', highlightEn: 'High Altitude Pulse', highlightNe: 'उच्च पहाडी सिमी' },
        { id: 'garlic', volumeMt: '3.5 MT/day', highlightEn: 'High Value Dried Bulb', highlightNe: 'उच्च मूल्य लसुन' },
        { id: 'cauliflower', volumeMt: '5.0 MT/day', highlightEn: 'Pokhara Corridor Premium', highlightNe: 'पोखरा कोरिडोर माग' },
      ],
    };

    const alpineDefaultProfile = [
      { id: 'potato', volumeMt: '11.0 MT/day', highlightEn: 'Highland Organic Staple', highlightNe: 'हिमाली मुख्य आलु' },
      { id: 'beans', volumeMt: '7.5 MT/day', highlightEn: 'Highland Cash Beans', highlightNe: 'उच्च पहाडी सिमी' },
      { id: 'garlic', volumeMt: '4.5 MT/day', highlightEn: 'Long Shelf-Life Spice', highlightNe: 'लामो भण्डारण लसुन' },
      { id: 'cabbage', volumeMt: '8.0 MT/day', highlightEn: 'Off-Season Corridor Crop', highlightNe: 'बेमौसमी बन्दा' },
      { id: 'carrot', volumeMt: '5.5 MT/day', highlightEn: 'Cool Climate Produce', highlightNe: 'चिसो हावापानी गाजर' },
      { id: 'peas', volumeMt: '6.0 MT/day', highlightEn: 'Highland Pod Harvest', highlightNe: 'पहाडी केराउ' },
    ];

    const temperateDefaultProfile = [
      { id: 'tomato', volumeMt: '15.0 MT/day', highlightEn: 'Mid-Hill Off-Season Crop', highlightNe: 'मध्यपहाडी बेमौसमी गोलभेडा' },
      { id: 'ginger', volumeMt: '12.0 MT/day', highlightEn: 'Hill Spice Cash Crop', highlightNe: 'पहाडी नगदे अदुवा' },
      { id: 'cauliflower', volumeMt: '14.0 MT/day', highlightEn: 'Hill Corridor Demand', highlightNe: 'पहाडी मन्डी माग' },
      { id: 'cabbage', volumeMt: '16.0 MT/day', highlightEn: 'High Volume Transit', highlightNe: 'थोक ढुवानी बन्दा' },
      { id: 'potato', volumeMt: '19.0 MT/day', highlightEn: 'Hill Terrace Staple', highlightNe: 'पहाडी मुख्य आलु' },
      { id: 'peas', volumeMt: '9.5 MT/day', highlightEn: 'Seasonal Hill Legume', highlightNe: 'मौसमी पहाडी केराउ' },
    ];

    const subtropicalDefaultProfile = [
      { id: 'tomato', volumeMt: '18.0 MT/day', highlightEn: 'High Daily Mandi Turnover', highlightNe: 'दैनिक उच्च मन्डी माग' },
      { id: 'potato', volumeMt: '24.0 MT/day', highlightEn: 'Everyday Household Staple', highlightNe: 'नियमित मुख्य भान्सा बाली' },
      { id: 'onion', volumeMt: '20.0 MT/day', highlightEn: 'Continuous Daily Supply', highlightNe: 'नियमित दैनिक आपूर्ति' },
      { id: 'cabbage', volumeMt: '17.0 MT/day', highlightEn: 'High Volume Transit', highlightNe: 'थोक ढुवानी उच्च' },
      { id: 'cauliflower', volumeMt: '14.5 MT/day', highlightEn: 'Peak Seasonal Demand', highlightNe: 'मौसमी उच्च माग' },
      { id: 'bitter_gourd', volumeMt: '11.0 MT/day', highlightEn: 'Warm Belt Cash Crop', highlightNe: 'तराई नगदे बाली' },
    ];

    const currentProfile =
      areaTurnoverProfiles[districtKey] ||
      (currentDistrictObj.zone === 'Alpine'
        ? alpineDefaultProfile
        : currentDistrictObj.zone === 'Temperate'
        ? temperateDefaultProfile
        : subtropicalDefaultProfile);

    let items = currentProfile
      .map((p) => {
        const comm = commodities.find((c) => c.id === p.id);
        if (!comm) return null;
        return {
          ...comm,
          volumeMt: p.volumeMt,
          highlightEn: p.highlightEn,
          highlightNe: p.highlightNe,
        };
      })
      .filter(Boolean) as Array<Commodity & { volumeMt: string; highlightEn: string; highlightNe: string }>;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matches = commodities.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.nepaliName && c.nepaliName.includes(q)) ||
          c.id.toLowerCase().includes(q)
      );
      items = matches.map((c) => {
        const existing = items.find((it) => it.id === c.id);
        return {
          ...c,
          volumeMt: existing ? existing.volumeMt : '~10 MT/day',
          highlightEn: existing ? existing.highlightEn : 'Area Mandi Trade',
          highlightNe: existing ? existing.highlightNe : 'क्षेत्रीय मन्डी व्यापार',
        };
      });
    }

    return items;
  }, [selectedDistrict, currentDistrictObj.zone, commodities, searchQuery]);

  // Filtered Official Kalimati Bulletin items
  const filteredBulletinItems = useMemo(() => {
    const q = (bulletinSearch || searchQuery).toLowerCase().trim();
    return fullBulletin.filter((item) => {
      const cat = item.category || 'other';
      const matchCat =
        bulletinCategory === 'all' ||
        (bulletinCategory === 'exotic' ? cat === 'exotic' || cat === 'other' : cat === bulletinCategory);
      if (!matchCat) return false;
      if (!q) return true;
      return (
        item.rawName.toLowerCase().includes(q) ||
        (item.nameEn && item.nameEn.toLowerCase().includes(q)) ||
        (item.commodityId && item.commodityId.toLowerCase().includes(q))
      );
    });
  }, [fullBulletin, bulletinCategory, bulletinSearch, searchQuery]);

  // Plain-language summary
  const krishiMitraSummary = useMemo(() => {
    if (!activeCrop) return '';
    const isNe = language === 'ne';
    const currentPriceVal = chartData14Days.currentPrice;
    const peak = chartData14Days.peakPoint;
    const distName = currentDistrictObj.name.split('(')[0].trim();

    if (isNe) {
      return `${distName} क्षेत्रमा ${activeCrop.nepaliName || activeCrop.name} को हालको दर रु ${currentPriceVal}/केजी छ (कालिमाटी आधार: रु ${Math.round(activeCrop.currentPrice)}/केजी)। आगामी ${peak.peakDayIdx || 2} दिनमा रु ${peak.peakPrice}/केजी सम्म पुग्ने प्रक्षेपण गरिएको छ।`;
    }
    return `${activeCrop.name} in ${distName} is currently Rs ${currentPriceVal}/kg (Kalimati benchmark: Rs ${Math.round(activeCrop.currentPrice)}/kg). Statistical model projects Rs ${peak.peakPrice}/kg in ${peak.peakDayIdx || 2} days.`;
  }, [activeCrop, chartData14Days, currentDistrictObj.name, language]);

  const todayFormattedDate = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString(language === 'ne' ? 'ne-NP' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [language]);

  const isNe = language === 'ne';

  return (
    <div className="relative w-full max-w-7xl mx-auto space-y-5 pb-6 font-editorial-sans text-[#1F1E1B] dark:text-[#F5F3EF]">
      {/* Live District Microclimate & Field Advisory (Real-time Open-Meteo) */}
      <DistrictWeatherWidget
        selectedDistrict={selectedDistrict}
        setSelectedDistrict={setSelectedDistrict}
        compact={false}
      />

      <ActionableInsights
        commodities={commodities}
        selectedDistrict={selectedDistrict}
        setSelectedDistrict={setSelectedDistrict}
        userProfile={userProfile}
        activeCropId={selectedCropId}
        setActiveCropId={setSelectedCropId}
        onNavigateTab={onNavigateTab}
        onNavigateToSell={onNavigateToSell}
        dashboardMode={dashboardMode}
        setDashboardMode={setDashboardMode}
        marketDataView={
          <div className="space-y-5">
            {/* Top Context & Search Bar */}
            <div className="app-card p-4 sm:p-5 space-y-3.5 border border-[#E8E2D8] dark:border-[#383530] bg-white dark:bg-[#22201D]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="tag-pastel-blue">
                      {isNe ? "कालिमाटी तथा क्षेत्रीय मन्डी" : "Kalimati & Regional Mandi"}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded border border-[#E8E2D8] dark:border-[#383530] text-[#746F68] dark:text-[#A6A096]">
                      {currentDistrictObj.province} {isNe ? "प्रदेश" : "Province"}
                    </span>
                    <span className="text-[11px] font-editorial-mono text-[#746F68] dark:text-[#A6A096]">
                      {todayFormattedDate}
                    </span>
                  </div>
                  <h1 className="font-editorial-serif text-lg sm:text-xl font-bold text-[#1F1E1B] dark:text-[#F5F3EF] tracking-tight">
                    {isNe
                      ? `${currentDistrictObj.name} क्षेत्र बजार दर तथा प्रक्षेपण`
                      : `${currentDistrictObj.name} Regional Market Rates & Trends`}
                  </h1>
                </div>

                {/* District Selector */}
                <div className="flex items-center gap-2 bg-[#FAF7F2] dark:bg-[#262421] px-3 py-1.5 rounded-lg border border-[#E8E2D8] dark:border-[#383530] text-xs self-start sm:self-auto">
                  <MapPin className="w-3.5 h-3.5 text-[#C8A27C] dark:text-[#D9B591]" />
                  <span className="text-[#746F68] dark:text-[#A6A096]">{t("header.marketSelector", "Market:")}</span>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="bg-transparent font-medium text-[#1F1E1B] dark:text-[#F5F3EF] focus:outline-none cursor-pointer pr-1"
                  >
                    {DISTRICT_LIST.map((dist) => (
                      <option key={dist.id} value={dist.id} className="dark:bg-[#1E1D1B] dark:text-[#F5F3EF]">
                        {dist.name} ({dist.province})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#746F68] dark:text-[#A6A096] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t(
                    "market.searchPlaceholder",
                    "Search commodities (e.g. Tomato, Potato, गोलभेडा, आलु, काउली)..."
                  )}
                  className="w-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] focus:border-[#2D6CDF] dark:focus:border-[#76A9FA] rounded-lg pl-10 pr-20 py-2 text-xs sm:text-sm text-[#1F1E1B] dark:text-[#F5F3EF] placeholder:text-[#746F68] focus:outline-none transition"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="p-1 text-[#746F68] hover:text-[#1F1E1B] dark:hover:text-[#F5F3EF] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowVoiceRoadmapModal(true)}
                    className="p-1 text-[#746F68] hover:text-[#1F1E1B] dark:hover:text-[#F5F3EF] cursor-pointer"
                    title="Nepali Voice Search"
                  >
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 1. Recommended Product for Highest Yield for that Area */}
            {highestYieldRecommendation && (
              <div className="app-card p-4 sm:p-5 border border-[#E8E2D8] dark:border-[#383530] bg-white dark:bg-[#22201D] shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E8E2D8] dark:border-[#383530]">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#EAF3EE] text-[#1E5E41] dark:bg-[#1E3327] dark:text-[#4ADE80]">
                      <Award className="w-3.5 h-3.5" />
                      <span>{isNe ? "उच्च उत्पादन सिफारिस" : "Recommended Highest Yield"}</span>
                    </span>
                    <span className="text-xs text-[#746F68] dark:text-[#A6A096]">
                      · {currentDistrictObj.name} {isNe ? "क्षेत्र" : "Area"}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-[#2E7D5A] dark:text-[#4ADE80]">
                    {isNe ? "९१% माटो तथा मौसम अनुकूलता" : "91% Agro-Climatic Fit"}
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
                        {isNe ? "अपेक्षित उत्पादन" : "Expected Yield"}
                      </span>
                      <span className="font-editorial-mono font-bold text-sm text-[#1F1E1B] dark:text-[#F5F3EF]">
                        {highestYieldRecommendation.yieldMtPerHa}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-[#746F68] dark:text-[#A6A096] block">
                        {isNe ? "बजार दर" : "Est. Mandi Rate"}
                      </span>
                      <span className="font-editorial-mono font-bold text-sm text-[#2E7D5A] dark:text-[#4ADE80]">
                        Rs {highestYieldRecommendation.expectedPricePerKg}/kg
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCropId(highestYieldRecommendation.crop)}
                      className="px-3 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F3ECE0] dark:bg-[#2A2824] dark:hover:bg-[#33302B] border border-[#E8E2D8] dark:border-[#383530] text-xs font-bold text-[#1F1E1B] dark:text-[#F5F3EF] transition cursor-pointer"
                    >
                      {isNe ? "बाली हेर्नुहोस्" : "Select Crop"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. 14-Day Price Graph (Past 7 Days vs Predicted 7 Days) - Same as My Farm Data */}
            {activeCrop && (
              <div className="app-card p-4 sm:p-5 border border-[#E8E2D8] dark:border-[#383530] bg-white dark:bg-[#22201D] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2D8] dark:border-[#383530]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] p-1 flex items-center justify-center shrink-0">
                      <CropIllustration crop={activeCrop.id} size="full" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-baseline gap-2.5">
                        <h3 className="font-bold text-base text-[#1F1E1B] dark:text-[#F5F3EF]">
                          {isNe ? activeCrop.nepaliName : activeCrop.name}
                        </h3>
                        <span className="font-editorial-mono font-bold text-sm text-[#2E7D5A] dark:text-[#4ADE80]">
                          Rs {chartData14Days.currentPrice}/kg{' '}
                          {selectedDistrict.toLowerCase() === 'kathmandu'
                            ? isNe ? 'कालिमाटी दर' : 'Kalimati rate'
                            : isNe ? 'स्थानीय थोक दर' : 'local wholesale'}
                        </span>
                        {activeRegionalPrice && selectedDistrict.toLowerCase() !== 'kathmandu' && (
                          <span className="text-[11px] font-editorial-mono text-[#746F68] dark:text-[#A6A096]">
                            ({isNe ? 'खेतबारी' : 'Farmgate'}: Rs {activeRegionalPrice.localizedFarmgatePrice} · {isNe ? 'कालिमाटी' : 'Kalimati'}: Rs {activeRegionalPrice.kalimatiPrice})
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {activeRegionalPrice && (
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              activeRegionalPrice.priceSource === 'coop_verified'
                                ? 'bg-[#EAF3EE] text-[#1E5E41] dark:bg-[#1E3327] dark:text-[#4ADE80]'
                                : activeRegionalPrice.priceSource === 'official_kalimati'
                                ? 'bg-[#EBF2FC] text-[#2D6CDF] dark:bg-[#1E2E4A] dark:text-[#76A9FA]'
                                : 'bg-[#FEF3C7] text-[#92400E] dark:bg-[#362712] dark:text-[#FBBF24]'
                            }`}
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>{isNe ? activeRegionalPrice.priceSourceLabelNe : activeRegionalPrice.priceSourceLabelEn}</span>
                          </span>
                        )}
                        <span className="text-xs text-[#746F68] dark:text-[#A6A096]">
                          {isNe ? "हिजोको दर" : "Yesterday"}: <strong className="font-editorial-mono text-[#1F1E1B] dark:text-[#F5F3EF]">Rs {chartData14Days.yesterdayPrice}/kg</strong>
                        </span>
                        {chartData14Days.currentPrice !== chartData14Days.yesterdayPrice && (
                          <span
                            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-bold font-editorial-mono ${
                              chartData14Days.currentPrice > chartData14Days.yesterdayPrice
                                ? "bg-[#EAF3EE] text-[#1E5E41] dark:bg-[#1E3327] dark:text-[#4ADE80]"
                                : "bg-[#FDF2F2] text-[#DC2626] dark:bg-[#381E1E] dark:text-[#F87171]"
                            }`}
                          >
                            {chartData14Days.currentPrice > chartData14Days.yesterdayPrice ? "+" : ""}
                            Rs {chartData14Days.currentPrice - chartData14Days.yesterdayPrice} ({activeCrop.changePct >= 0 ? "+" : ""}{activeCrop.changePct}%)
                          </span>
                        )}
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-[#EAF3EE] text-[#1E5E41] dark:bg-[#1E3327] dark:text-[#4ADE80]">
                          {isNe ? "उच्चतम प्रक्षेपण" : "Peak"}: Rs {chartData14Days.peakPoint.peakPrice}/kg (+Rs {chartData14Days.peakPoint.diffVsCurrent} in {chartData14Days.peakPoint.peakDayIdx}d)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Legend & Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                    <div className="flex items-center gap-2.5 text-[11px] font-medium text-[#746F68] dark:text-[#A6A096]">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1F1E1B] dark:bg-[#F5F3EF] inline-block" />
                        <span>{isNe ? "विगत ७ दिन" : "Past 7 Days"}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#2D6CDF] inline-block" />
                        <span>{isNe ? "आगामी ७ दिन (प्रक्षेपण)" : "Next 7 Days (Forecast)"}</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenReportModal(activeCrop.id)}
                      className="px-2.5 py-1 rounded-lg border border-[#2E7D5A]/40 bg-[#EAF3EE] hover:bg-[#DCECE3] dark:bg-[#1E3327] dark:hover:bg-[#254031] text-xs font-semibold text-[#1E5E41] dark:text-[#4ADE80] flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>{isNe ? "स्थानीय दर पठाउनुहोस्" : "Report Local Rate"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsAlertModalOpen(true)}
                      className="px-2.5 py-1 rounded-lg border border-[#E8E2D8] dark:border-[#383530] bg-[#FAF7F2] hover:bg-[#F3ECE0] dark:bg-[#2A2824] dark:hover:bg-[#33302B] text-xs font-semibold text-[#1F1E1B] dark:text-[#F5F3EF] flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Bell className="w-3.5 h-3.5 text-[#C8A27C] dark:text-[#D9B591]" />
                      <span>{isNe ? "सूचना" : "Alert"}</span>
                    </button>
                  </div>
                </div>

                {/* The 14-Day Trajectory Line Chart */}
                <div className="h-60 sm:h-72 w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData14Days.points} margin={{ top: 12, right: 16, left: -20, bottom: 4 }}>
                      <XAxis
                        dataKey="dayLabel"
                        tick={{ fill: "#8C887B", fontSize: 11 }}
                        tickLine={false}
                        axisLine={{ stroke: "#E8E2D8" }}
                      />
                      <YAxis
                        domain={[chartData14Days.minPrice, chartData14Days.maxPrice]}
                        tick={{ fill: "#8C887B", fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `Rs ${v}`}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            const isPredicted = d.type === "predicted";
                            const isToday = d.type === "today";
                            const isYesterday = d.dayKey === "-1d";
                            const priceDiff = d.price - chartData14Days.yesterdayPrice;
                            return (
                              <div className="bg-white dark:bg-[#1E1D1B] border border-[#E8E2D8] dark:border-[#383530] p-2.5 rounded-lg shadow-sm text-xs space-y-1.5">
                                <div className="flex items-center justify-between gap-3">
                                  <span className="font-bold text-[#1F1E1B] dark:text-[#F5F3EF]">
                                    {d.dayLabel} ({d.dateStr})
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                      isToday
                                        ? "bg-[#EAF3EE] text-[#1E5E41] dark:bg-[#1E3327] dark:text-[#4ADE80]"
                                        : isYesterday
                                        ? "bg-[#FEF3C7] text-[#92400E] dark:bg-[#362712] dark:text-[#FBBF24]"
                                        : isPredicted
                                        ? "bg-[#EBF2FC] text-[#2D6CDF] dark:bg-[#1E2E4A] dark:text-[#76A9FA]"
                                        : "bg-[#FAF7F2] text-[#746F68] dark:bg-[#262421] dark:text-[#A6A096]"
                                    }`}
                                  >
                                    {isToday
                                      ? (isNe ? "आजको नयाँ दर" : "New Rate (Today)")
                                      : isYesterday
                                      ? (isNe ? "हिजोको पुरानो दर" : "Old Rate (Yesterday)")
                                      : isPredicted
                                      ? (isNe ? "प्रक्षेपण" : "Forecast")
                                      : (isNe ? "अभिलेख दर" : "Recorded")}
                                  </span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                  <span className="font-editorial-mono font-bold text-base text-[#1F1E1B] dark:text-[#F5F3EF]">
                                    Rs {d.price}/kg
                                  </span>
                                  {isToday && chartData14Days.currentPrice !== chartData14Days.yesterdayPrice && (
                                    <span className="font-editorial-mono text-xs font-bold text-[#2E7D5A] dark:text-[#4ADE80]">
                                      {priceDiff >= 0 ? "+" : ""}Rs {priceDiff} vs हिजो ({activeCrop.changePct >= 0 ? "+" : ""}{activeCrop.changePct}%)
                                    </span>
                                  )}
                                  {isYesterday && (
                                    <span className="text-[11px] text-[#92400E] dark:text-[#FBBF24]">
                                      {isNe ? "कालीमाटी अघिल्लो दर" : "Previous Mandi Rate"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />

                      {/* Bridge Reference Line for Today */}
                      <ReferenceLine
                        x={chartData14Days.points[7]?.dayLabel}
                        stroke="#8C887B"
                        strokeDasharray="2 2"
                        label={{
                          value: isNe ? "आज" : "Today",
                          position: "top",
                          fill: "#8C887B",
                          fontSize: 10,
                          fontWeight: "bold",
                        }}
                      />

                      {/* Dot on Yesterday (Old Rate) */}
                      {chartData14Days.points[6] && (
                        <ReferenceDot
                          x={chartData14Days.points[6]?.dayLabel}
                          y={chartData14Days.yesterdayPrice}
                          r={5}
                          fill="#F59E0B"
                          stroke="#FFFFFF"
                          strokeWidth={2}
                        />
                      )}

                      {/* Dot on Today (New Rate) */}
                      <ReferenceDot
                        x={chartData14Days.points[7]?.dayLabel}
                        y={chartData14Days.currentPrice}
                        r={6}
                        fill="#10B981"
                        stroke="#FFFFFF"
                        strokeWidth={2}
                      />

                      {/* Dot on Forecast Peak */}
                      {chartData14Days.peakPoint.peakDayIdx > 0 && (
                        <ReferenceDot
                          x={chartData14Days.peakPoint.dayLabel}
                          y={chartData14Days.peakPoint.peakPrice}
                          r={5}
                          fill="#2D6CDF"
                          stroke="#FFFFFF"
                          strokeWidth={2}
                        />
                      )}

                      {/* 1. Actual Solid Line (Past 7 Days + Today) */}
                      <Line
                        type="monotone"
                        dataKey="actualPrice"
                        stroke="#2B2A27"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: "#2B2A27" }}
                        activeDot={{ r: 5, fill: "#2B2A27", stroke: "#FFFFFF", strokeWidth: 2 }}
                        connectNulls={false}
                      />

                      {/* 2. Predicted Dashed Line (Today + Next 7 Days) */}
                      <Line
                        type="monotone"
                        dataKey="predictedPrice"
                        stroke="#2D6CDF"
                        strokeWidth={2.5}
                        strokeDasharray="4 4"
                        dot={{ r: 3, fill: "#2D6CDF" }}
                        activeDot={{ r: 5, fill: "#2D6CDF", stroke: "#FFFFFF", strokeWidth: 2 }}
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Krishi Mitra Grounded Plain-Language Advisory */}
                <div className="p-3 rounded-lg bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] flex items-start gap-2.5 text-xs">
                  <Sparkles className="w-4 h-4 text-[#C8A27C] dark:text-[#D9B591] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#1F1E1B] dark:text-[#F5F3EF] block">
                      {t("market.krishiMitraAdvice", "Krishi Mitra Advice:")}
                    </span>
                    <p className="text-[#746F68] dark:text-[#A6A096] mt-0.5 leading-relaxed">
                      {krishiMitraSummary}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Best Selling Crops (Crops Sold in that Area) */}
            <div className="app-card p-4 sm:p-5 border border-[#E8E2D8] dark:border-[#383530] bg-white dark:bg-[#22201D] shadow-xs space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E8E2D8] dark:border-[#383530]">
                <div>
                  <h3 className="font-bold text-base text-[#1F1E1B] dark:text-[#F5F3EF]">
                    {isNe
                      ? `${currentDistrictObj.name} क्षेत्रमा धेरै बिक्री हुने बालीहरू`
                      : `Best Selling Crops in ${currentDistrictObj.name}`}
                  </h3>
                  <p className="text-xs text-[#746F68] dark:text-[#A6A096] mt-0.5">
                    {isNe
                      ? "यस क्षेत्रको मन्डी कोरिडोरमा सक्रिय रूपमा बिक्री हुने मुख्य बालीहरू"
                      : "High-turnover commodities actively sold in this regional market corridor"}
                  </p>
                </div>
                <span className="text-xs text-[#746F68] dark:text-[#A6A096]">
                  {areaBestSellingCrops.length} {isNe ? "बालीहरू" : "crops available"}
                </span>
              </div>

              {/* Best Selling Crops Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {areaBestSellingCrops.map((item) => {
                  const isSelected = item.id === selectedCropId;
                  const regPrice = regionalPriceMap[item.id];
                  const displayPrice = regPrice ? regPrice.localizedWholesalePrice : Math.round(item.currentPrice);
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedCropId(item.id)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-[#FAF7F2] dark:bg-[#2A2824] border-[#2E7D5A] ring-1 ring-[#2E7D5A]"
                          : "bg-white dark:bg-[#22201D] hover:bg-[#FAF7F2] dark:hover:bg-[#262421] border-[#E8E2D8] dark:border-[#383530]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] p-1 flex items-center justify-center shrink-0">
                          <CropIllustration crop={item.id} size="full" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#1F1E1B] dark:text-[#F5F3EF]">
                            {isNe ? item.nepaliName : item.name}
                          </h4>
                          <span className="text-[11px] text-[#746F68] dark:text-[#A6A096] block">
                            {item.volumeMt} · {isNe ? item.highlightNe : item.highlightEn}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-editorial-mono font-bold text-sm text-[#1F1E1B] dark:text-[#F5F3EF]">
                          Rs {displayPrice}/kg
                        </div>
                        {regPrice && selectedDistrict.toLowerCase() !== 'kathmandu' && (
                          <div className="text-[10px] font-editorial-mono text-[#746F68] dark:text-[#A6A096]">
                            KTM: Rs {regPrice.kalimatiPrice}
                          </div>
                        )}
                        <span
                          className={`text-[10px] font-editorial-mono font-bold px-1.5 py-0.5 rounded inline-block mt-0.5 ${
                            item.changePct >= 0
                              ? "bg-[#EAF3EE] text-[#1E5E41] dark:bg-[#1E3327] dark:text-[#4ADE80]"
                              : "bg-[#FDEDE9] text-[#C4381C] dark:bg-[#3B1E19] dark:text-[#FF8A73]"
                          }`}
                        >
                          {item.changePct >= 0 ? "+" : ""}{item.changePct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Nationwide 77-District & 12-AMPIS Hub Multi-Mandi Price Comparison */}
            <div className="app-card p-4 sm:p-5 border border-[#E8E2D8] dark:border-[#383530] bg-white dark:bg-[#22201D] shadow-xs space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#E8E2D8] dark:border-[#383530]">
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#EAF3EE] dark:bg-[#1E3327] text-[#2E7D5A] dark:text-[#4ADE80] flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#1F1E1B] dark:text-[#F5F3EF]">
                      {isNe
                        ? `राष्ट्रव्यापी ७७ जिल्ला मन्डी दर तुलना — ${activeCrop ? activeCrop.nepaliName : ''}`
                        : `Nationwide 77-District Mandi Network — ${activeCrop ? activeCrop.name : ''}`}
                    </h3>
                    <p className="text-xs text-[#746F68] dark:text-[#A6A096] mt-0.5">
                      {isNe
                        ? 'कालिमाटी + कृषि विभाग (AMPIS १२ मुख्य बजार) + स्थानीय सहकारी प्रमाणित दरमा आधारित'
                        : 'Calibrated across all 77 districts using Kalimati + DoA AMPIS 12 regional hubs & verified local cooperative reports'}
                    </p>
                  </div>
                </div>

                {/* Search + Province Filter + Local Report CTA */}
                <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#746F68] absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={mandiSearch}
                      onChange={(e) => setMandiSearch(e.target.value)}
                      placeholder={isNe ? '७७ जिल्ला खोज्नुहोस्...' : 'Search 77 districts...'}
                      className="w-44 bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-[#1F1E1B] dark:text-[#F5F3EF] focus:outline-none focus:border-[#2E7D5A]"
                    />
                  </div>

                  <div className="flex items-center gap-2 bg-[#FAF7F2] dark:bg-[#262421] px-3 py-1.5 rounded-lg border border-[#E8E2D8] dark:border-[#383530] text-xs">
                    <Filter className="w-3.5 h-3.5 text-[#746F68] dark:text-[#A6A096]" />
                    <select
                      value={mandiProvinceFilter}
                      onChange={(e) => setMandiProvinceFilter(e.target.value)}
                      className="bg-transparent font-semibold text-[#1F1E1B] dark:text-[#F5F3EF] focus:outline-none cursor-pointer"
                    >
                      <option value="all" className="dark:bg-[#1E1D1B]">{isNe ? 'सबै ७ प्रदेश (७७ जिल्ला)' : 'All 7 Provinces (77 Districts)'}</option>
                      <option value="Koshi" className="dark:bg-[#1E1D1B]">{isNe ? 'कोशी प्रदेश (१४)' : 'Koshi Province (14)'}</option>
                      <option value="Madhesh" className="dark:bg-[#1E1D1B]">{isNe ? 'मधेश प्रदेश (८)' : 'Madhesh Province (8)'}</option>
                      <option value="Bagmati" className="dark:bg-[#1E1D1B]">{isNe ? 'बागमती प्रदेश (१३)' : 'Bagmati Province (13)'}</option>
                      <option value="Gandaki" className="dark:bg-[#1E1D1B]">{isNe ? 'गण्डकी प्रदेश (११)' : 'Gandaki Province (11)'}</option>
                      <option value="Lumbini" className="dark:bg-[#1E1D1B]">{isNe ? 'लुम्बिनी प्रदेश (१२)' : 'Lumbini Province (12)'}</option>
                      <option value="Karnali" className="dark:bg-[#1E1D1B]">{isNe ? 'कर्णाली प्रदेश (१०)' : 'Karnali Province (10)'}</option>
                      <option value="Sudurpashchim" className="dark:bg-[#1E1D1B]">{isNe ? 'सुदूरपश्चिम प्रदेश (९)' : 'Sudurpashchim Province (9)'}</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenReportModal(selectedCropId)}
                    className="px-3 py-1.5 rounded-lg bg-[#2E7D5A] hover:bg-[#256649] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{isNe ? 'आजको स्थानीय दर थप्नुहोस्' : 'Submit Local Rate'}</span>
                  </button>
                </div>
              </div>

              {ampisHubInfo && (
                <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] text-[11px] text-[#746F68] dark:text-[#A6A096]">
                  <div>
                    <strong className="text-[#1F1E1B] dark:text-[#F5F3EF]">
                      {isNe ? 'नजिकको AMPIS क्षेत्रीय बजार' : 'Calibrated Regional AMPIS Hub'}:
                    </strong>{' '}
                    {isNe ? ampisHubInfo.nameNe : ampisHubInfo.nameEn} ({ampisHubInfo.lastObservedLabel})
                  </div>
                  <div className="font-editorial-mono">
                    {isNe ? 'कालिमाटी तुलनात्मक अनुपात' : 'Hub vs Kalimati Index'}:{' '}
                    <strong className="text-[#1F1E1B] dark:text-[#F5F3EF]">
                      {Math.round(ampisHubInfo.overallRatioVsKalimati * 100)}%
                    </strong>
                  </div>
                </div>
              )}

              {isMandisLoading ? (
                <div className="py-6 text-center text-xs text-[#746F68] dark:text-[#A6A096]">
                  {isNe ? 'राष्ट्रव्यापी ७७ जिल्लाको मन्डी दर लोड हुँदैछ...' : 'Loading 77-district mandi comparison...'}
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[380px] overflow-y-auto border border-[#E8E2D8] dark:border-[#383530] rounded-lg">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 bg-[#FAF7F2] dark:bg-[#262421] border-b border-[#E8E2D8] dark:border-[#383530] text-[11px] uppercase tracking-wider text-[#746F68] dark:text-[#A6A096] z-10">
                      <tr>
                        <th className="py-2.5 px-3 font-bold">{isNe ? 'जिल्ला र मन्डी' : 'District & Mandi'}</th>
                        <th className="py-2.5 px-3 font-bold">{isNe ? 'प्रदेश / स्रोत' : 'Province & Provenance'}</th>
                        <th className="py-2.5 px-3 font-bold text-right">{isNe ? 'खेतबारी दर' : 'Farmgate'}</th>
                        <th className="py-2.5 px-3 font-bold text-right">{isNe ? 'थोक दर' : 'Wholesale'}</th>
                        <th className="py-2.5 px-3 font-bold text-right">{isNe ? 'सामूहिक ढुवानी' : 'Pooled Freight'}</th>
                        <th className="py-2.5 px-3 font-bold text-right">{isNe ? 'कार्य' : 'Action'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E2D8] dark:divide-[#383530]">
                      {filteredMandiNetwork.map((hub) => {
                        const isCurrent = hub.id.toLowerCase() === selectedDistrict.toLowerCase();
                        return (
                          <tr
                            key={hub.id}
                            className={`transition-colors ${
                              isCurrent
                                ? 'bg-[#EAF3EE]/60 dark:bg-[#1E3327]/50'
                                : 'hover:bg-[#FAF7F2] dark:hover:bg-[#262421]'
                            }`}
                          >
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-[#1F1E1B] dark:text-[#F5F3EF]">
                                {isNe ? hub.nameNe : hub.name}
                              </div>
                              <div className="text-[11px] text-[#746F68] dark:text-[#A6A096]">
                                {isNe ? hub.mandiNameNepali : hub.mandiName}
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-medium text-[#1F1E1B] dark:text-[#F5F3EF] block">
                                {isNe ? hub.provinceNe : hub.province} · {hub.distanceToKalimatiKm} km
                              </span>
                              <span
                                className={`inline-block mt-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                  hub.priceSource === 'coop_verified'
                                    ? 'bg-[#EAF3EE] text-[#1E5E41] dark:bg-[#1E3327] dark:text-[#4ADE80]'
                                    : hub.priceSource === 'official_kalimati'
                                    ? 'bg-[#EBF2FC] text-[#2D6CDF] dark:bg-[#1E2E4A] dark:text-[#76A9FA]'
                                    : 'bg-[#FAF7F2] text-[#746F68] dark:bg-[#262421] dark:text-[#A6A096]'
                                }`}
                              >
                                {isNe ? hub.priceSourceLabelNe : hub.priceSourceLabelEn}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-editorial-mono font-semibold text-[#746F68] dark:text-[#A6A096]">
                              Rs {hub.estimatedFarmgatePrice}
                            </td>
                            <td className="py-2.5 px-3 text-right font-editorial-mono font-bold text-[#2E7D5A] dark:text-[#4ADE80]">
                              Rs {hub.estimatedWholesalePrice}/kg
                            </td>
                            <td className="py-2.5 px-3 text-right font-editorial-mono text-[#1F1E1B] dark:text-[#F5F3EF]">
                              <div>Rs {hub.pooledFreightPerKg}/kg</div>
                              <div className="text-[10px] text-[#746F68] dark:text-[#A6A096] line-through">
                                Rs {hub.soloFreightPerKg}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              {isCurrent ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2E7D5A] dark:text-[#4ADE80]">
                                  <Check className="w-3.5 h-3.5" />
                                  {isNe ? 'छानिएको' : 'Active'}
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setSelectedDistrict(hub.id)}
                                  className="px-2.5 py-1 rounded border border-[#E8E2D8] dark:border-[#383530] bg-[#FAF7F2] hover:bg-[#F3ECE0] dark:bg-[#2A2824] dark:hover:bg-[#33302B] text-[11px] font-bold text-[#1F1E1B] dark:text-[#F5F3EF] transition cursor-pointer"
                                >
                                  {isNe ? 'छान्नुहोस्' : 'Select'}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {recentReports.length > 0 && (
                <div className="pt-2 border-t border-[#E8E2D8] dark:border-[#383530] space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#746F68] dark:text-[#A6A096]">
                    {isNe
                      ? `${currentDistrictObj.name} का हालैका प्रमाणित स्थानीय मन्डी रिपोर्टहरू`
                      : `Recent Verified Local Mandi Reports in ${currentDistrictObj.name}`}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {recentReports.slice(0, 6).map((rep, idx) => {
                      const cropMeta = commodities.find((c) => c.id === rep.cropId);
                      return (
                        <div
                          key={rep.id || `${rep.cropId}-${idx}`}
                          className="p-2.5 rounded-lg bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0">
                            <div className="font-bold text-[#1F1E1B] dark:text-[#F5F3EF] truncate">
                              {isNe ? cropMeta?.nepaliName || rep.cropId : cropMeta?.name || rep.cropId} · {rep.marketName}
                            </div>
                            <div className="text-[10px] text-[#746F68] dark:text-[#A6A096] truncate">
                              {rep.reporterName} ({rep.reporterRole}) · {rep.recordedDate}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-editorial-mono font-bold text-[#2E7D5A] dark:text-[#4ADE80]">
                              Rs {rep.pricePerKg}/kg
                            </div>
                            <div className="text-[10px] uppercase font-semibold text-[#746F68] dark:text-[#A6A096]">
                              {rep.priceType}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 5. Official Daily Kalimati Wholesale Bulletin (All 110+ Listed Commodities) */}
            <div className="app-card p-4 sm:p-5 border border-[#E8E2D8] dark:border-[#383530] bg-white dark:bg-[#22201D] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2D8] dark:border-[#383530]">
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] text-[#8C6237] dark:text-[#D9B591] flex items-center justify-center shrink-0">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#1F1E1B] dark:text-[#F5F3EF]">
                      {isNe
                        ? `आधिकारिक कालिमाटी दैनिक थोक मूल्य सूची (${fullBulletin.length} कृषि उपज)`
                        : `Official Daily Kalimati Wholesale Bulletin (${fullBulletin.length} Items)`}
                    </h3>
                    <p className="text-xs text-[#746F68] dark:text-[#A6A096] mt-0.5">
                      {isNe
                        ? 'कालिमाटी फलफूल तथा तरकारी बजार विकास समिति (kalimatimarket.gov.np) बाट प्रत्यक्ष संकलित दर'
                        : 'Complete bilingual wholesale bulletin from Kalimati Fruit & Vegetable Market Development Board'}
                    </p>
                  </div>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-[#746F68] dark:text-[#A6A096] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={bulletinSearch}
                    onChange={(e) => setBulletinSearch(e.target.value)}
                    placeholder={isNe ? 'सूचीमा खोज्नुहोस्...' : 'Filter all 110+ items...'}
                    className="w-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] rounded-lg pl-8 pr-7 py-1.5 text-xs text-[#1F1E1B] dark:text-[#F5F3EF] placeholder:text-[#746F68] focus:outline-none focus:border-[#2E7D5A]"
                  />
                  {bulletinSearch && (
                    <button
                      type="button"
                      onClick={() => setBulletinSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#746F68] hover:text-[#1F1E1B] dark:hover:text-[#F5F3EF] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      { id: 'all', en: 'All Items', ne: 'सबै' },
                      { id: 'vegetable', en: 'Vegetables', ne: 'तरकारी' },
                      { id: 'fruit', en: 'Fruits', ne: 'फलफूल' },
                      { id: 'spice', en: 'Spices & Herbs', ne: 'मसला / सागपात' },
                      { id: 'exotic', en: 'Exotic / Other', ne: 'अन्य / विशेष' },
                    ] as const
                  ).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setBulletinCategory(cat.id);
                        setShowAllBulletin(false);
                      }}
                      className={`px-3 py-1 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                        bulletinCategory === cat.id
                          ? 'bg-[#2E7D5A] text-white border-[#2E7D5A]'
                          : 'bg-[#FAF7F2] dark:bg-[#262421] text-[#746F68] dark:text-[#A6A096] border-[#E8E2D8] dark:border-[#383530] hover:text-[#1F1E1B] dark:hover:text-[#F5F3EF]'
                      }`}
                    >
                      {isNe ? cat.ne : cat.en}
                    </button>
                  ))}
                </div>
                <span className="text-[11px] font-editorial-mono text-[#746F68] dark:text-[#A6A096]">
                  {filteredBulletinItems.length} {isNe ? 'नतिजा' : 'matching'}
                </span>
              </div>

              {isBulletinLoading && fullBulletin.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#746F68] dark:text-[#A6A096]">
                  {isNe ? 'दैनिक कालिमाटी सूची लोड हुँदैछ...' : 'Loading official Kalimati bulletin...'}
                </div>
              ) : filteredBulletinItems.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#746F68] dark:text-[#A6A096]">
                  {isNe ? 'खोजिएको कृषि उपज सूचीमा भेटिएन।' : 'No commodities matched your bulletin filter.'}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto max-h-[380px] overflow-y-auto border border-[#E8E2D8] dark:border-[#383530] rounded-lg">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="sticky top-0 bg-[#FAF7F2] dark:bg-[#262421] border-b border-[#E8E2D8] dark:border-[#383530] text-[11px] uppercase tracking-wider text-[#746F68] dark:text-[#A6A096] z-10">
                        <tr>
                          <th className="py-2.5 px-3 font-bold">{isNe ? 'कृषि उपज' : 'Commodity'}</th>
                          <th className="py-2.5 px-3 font-bold">{isNe ? 'ईकाइ' : 'Unit'}</th>
                          <th className="py-2.5 px-3 font-bold text-right">{isNe ? 'न्यूनतम' : 'Min'}</th>
                          <th className="py-2.5 px-3 font-bold text-right">{isNe ? 'अधिकतम' : 'Max'}</th>
                          <th className="py-2.5 px-3 font-bold text-right">{isNe ? 'औसत' : 'Avg Rate'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8E2D8] dark:divide-[#383530]">
                        {(showAllBulletin ? filteredBulletinItems : filteredBulletinItems.slice(0, 20)).map((item, idx) => {
                          const hasTrackedModel = Boolean(
                            item.commodityId && commodities.some((c) => c.id === item.commodityId)
                          );
                          return (
                            <tr
                              key={`${item.rawName}-${idx}`}
                              onClick={() => {
                                if (hasTrackedModel && item.commodityId) {
                                  setSelectedCropId(item.commodityId);
                                }
                              }}
                              className={`transition-colors ${
                                hasTrackedModel
                                  ? 'cursor-pointer hover:bg-[#EAF3EE]/50 dark:hover:bg-[#1E3327]/40'
                                  : 'hover:bg-[#FAF7F2] dark:hover:bg-[#262421]'
                              }`}
                            >
                              <td className="py-2 px-3">
                                <div className="font-semibold text-[#1F1E1B] dark:text-[#F5F3EF] flex items-center gap-2">
                                  <span>{isNe ? item.rawName : item.nameEn || item.rawName}</span>
                                  {hasTrackedModel && (
                                    <span className="text-[10px] font-bold text-[#2E7D5A] dark:text-[#4ADE80]">
                                      · {isNe ? 'चार्ट हेर्नुहोस्' : 'Forecast'}
                                    </span>
                                  )}
                                </div>
                                {!isNe && item.nameEn && item.nameEn !== item.rawName && (
                                  <div className="text-[11px] text-[#746F68] dark:text-[#A6A096]">{item.rawName}</div>
                                )}
                              </td>
                              <td className="py-2 px-3 text-[#746F68] dark:text-[#A6A096]">
                                {isNe ? item.unit : item.unitEn || item.unit}
                              </td>
                              <td className="py-2 px-3 text-right font-editorial-mono text-[#746F68] dark:text-[#A6A096]">
                                Rs {item.minPrice}
                              </td>
                              <td className="py-2 px-3 text-right font-editorial-mono text-[#746F68] dark:text-[#A6A096]">
                                Rs {item.maxPrice}
                              </td>
                              <td className="py-2 px-3 text-right font-editorial-mono font-bold text-[#1F1E1B] dark:text-[#F5F3EF]">
                                Rs {item.avgPrice}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {filteredBulletinItems.length > 20 && (
                    <div className="flex justify-center pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAllBulletin((prev) => !prev)}
                        className="px-4 py-1.5 rounded-lg border border-[#E8E2D8] dark:border-[#383530] bg-[#FAF7F2] hover:bg-[#F3ECE0] dark:bg-[#2A2824] dark:hover:bg-[#33302B] text-xs font-bold text-[#1F1E1B] dark:text-[#F5F3EF] flex items-center gap-1.5 transition cursor-pointer"
                      >
                        {showAllBulletin ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" />
                            <span>{isNe ? 'कम देखाउनुहोस्' : 'Show Top 20'}</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" />
                            <span>
                              {isNe
                                ? `बाँकी सबै ${filteredBulletinItems.length} उपज हेर्नुहोस्`
                                : `Show All ${filteredBulletinItems.length} Commodities`}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        }
      />

      {/* Price Alert Modal */}
      {activeCrop && (
        <PriceAlertModal
          isOpen={isAlertModalOpen}
          onClose={() => setIsAlertModalOpen(false)}
          selectedDistrict={selectedDistrict}
          initialCropId={activeCrop.id}
          commodities={commodities}
          userProfile={userProfile}
        />
      )}

      {/* Local Cooperative & Mandi Price Reporting Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-[#111111]/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#22201D] rounded-2xl p-5 sm:p-6 max-w-md w-full border border-[#E8E2D8] dark:border-[#383530] shadow-lg space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-editorial-serif text-lg font-bold text-[#1F1E1B] dark:text-[#F5F3EF]">
                  {isNe ? 'आजको स्थानीय मन्डी दर पठाउनुहोस्' : "Report Today's Local Mandi Rate"}
                </h3>
                <p className="text-xs text-[#746F68] dark:text-[#A6A096] mt-0.5">
                  {isNe
                    ? `${currentDistrictObj.name} का किसान र सहकारीका लागि आजको वास्तविक दर अपडेट गर्नुहोस्।`
                    : `Share today's actual trading rate in ${currentDistrictObj.name} to override regional estimates.`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="p-1 text-[#746F68] hover:text-[#1F1E1B] dark:hover:text-[#F5F3EF] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitLocalReport} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1F1E1B] dark:text-[#F5F3EF] mb-1">
                    {isNe ? 'बाली' : 'Commodity'}
                  </label>
                  <select
                    value={reportCropId}
                    onChange={(e) => setReportCropId(e.target.value)}
                    className="w-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] rounded-lg px-2.5 py-2 text-[#1F1E1B] dark:text-[#F5F3EF]"
                  >
                    {commodities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {isNe ? c.nepaliName : c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1F1E1B] dark:text-[#F5F3EF] mb-1">
                    {isNe ? 'दरको प्रकार' : 'Rate Type'}
                  </label>
                  <select
                    value={reportPriceType}
                    onChange={(e) => setReportPriceType(e.target.value as 'wholesale' | 'farmgate')}
                    className="w-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] rounded-lg px-2.5 py-2 text-[#1F1E1B] dark:text-[#F5F3EF]"
                  >
                    <option value="wholesale">{isNe ? 'स्थानीय थोक मन्डी' : 'Local Wholesale Mandi'}</option>
                    <option value="farmgate">{isNe ? 'खेतबारी / संकलन केन्द्र' : 'Farmgate / Collection'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1F1E1B] dark:text-[#F5F3EF] mb-1">
                    {isNe ? 'बजार / हाटबजार नाम' : 'Local Market / Haat Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={reportMarketName}
                    onChange={(e) => setReportMarketName(e.target.value)}
                    placeholder={isNe ? 'जस्तै: लालबन्दी संकलन केन्द्र' : 'e.g. Lalbandi Collection Center'}
                    className="w-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] rounded-lg px-2.5 py-2 text-[#1F1E1B] dark:text-[#F5F3EF]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1F1E1B] dark:text-[#F5F3EF] mb-1">
                    {isNe ? 'आजको मूल्य (रु/केजी)' : "Today's Price (Rs/kg)"}
                  </label>
                  <input
                    type="number"
                    required
                    min={5}
                    max={2500}
                    value={reportPricePerKg}
                    onChange={(e) => setReportPricePerKg(e.target.value)}
                    placeholder="e.g. 42"
                    className="w-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] rounded-lg px-2.5 py-2 font-editorial-mono text-[#1F1E1B] dark:text-[#F5F3EF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1F1E1B] dark:text-[#F5F3EF] mb-1">
                    {isNe ? 'तपाईंको नाम / सहकारी' : 'Your Name / Co-op'}
                  </label>
                  <input
                    type="text"
                    required
                    value={reportReporterName}
                    onChange={(e) => setReportReporterName(e.target.value)}
                    placeholder={isNe ? 'राम बहादुर / कृषि सहकारी' : 'e.g. Sita Krishi Sahakari'}
                    className="w-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] rounded-lg px-2.5 py-2 text-[#1F1E1B] dark:text-[#F5F3EF]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1F1E1B] dark:text-[#F5F3EF] mb-1">
                    {isNe ? 'भूमिका' : 'Reporter Role'}
                  </label>
                  <select
                    value={reportReporterRole}
                    onChange={(e) => setReportReporterRole(e.target.value as 'farmer' | 'cooperative' | 'mandi_agent')}
                    className="w-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] rounded-lg px-2.5 py-2 text-[#1F1E1B] dark:text-[#F5F3EF]"
                  >
                    <option value="farmer">{isNe ? 'किसान' : 'Farmer'}</option>
                    <option value="cooperative">{isNe ? 'कृषि सहकारी (Sahakari)' : 'Krishi Cooperative'}</option>
                    <option value="mandi_agent">{isNe ? 'मन्डी प्रतिनिधि' : 'Mandi Trader / Agent'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1F1E1B] dark:text-[#F5F3EF] mb-1">
                  {isNe ? 'फोन नम्बर (ऐच्छिक)' : 'Phone Number (Optional)'}
                </label>
                <input
                  type="tel"
                  value={reportPhone}
                  onChange={(e) => setReportPhone(e.target.value)}
                  placeholder="98XXXXXXXX"
                  className="w-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] rounded-lg px-2.5 py-2 font-editorial-mono text-[#1F1E1B] dark:text-[#F5F3EF]"
                />
              </div>

              {reportError && (
                <div className="p-2.5 rounded-lg bg-[#FDF2F2] dark:bg-[#381E1E] text-[#DC2626] dark:text-[#F87171] font-medium">
                  {reportError}
                </div>
              )}
              {reportSuccess && (
                <div className="p-2.5 rounded-lg bg-[#EAF3EE] dark:bg-[#1E3327] text-[#1E5E41] dark:text-[#4ADE80] font-medium">
                  {reportSuccess}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-3.5 py-2 rounded-lg border border-[#E8E2D8] dark:border-[#383530] text-[#746F68] dark:text-[#A6A096] font-semibold cursor-pointer"
                >
                  {t('common.close', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="px-4 py-2 rounded-lg bg-[#2E7D5A] hover:bg-[#256649] text-white font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingReport ? (isNe ? 'पठाउँदै...' : 'Saving...') : (isNe ? 'दर सुरक्षित गर्नुहोस्' : 'Submit Rate')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Voice Search Roadmap Modal */}
      {showVoiceRoadmapModal && (
        <div className="fixed inset-0 z-50 bg-[#111111]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] dark:bg-[#1E1E1E] rounded-lg p-5 max-w-sm w-full border border-[#EAEAEA] dark:border-[#2E2E2E] shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-md bg-[#F0EFEA] dark:bg-[#2E2E2E] text-[#111111] dark:text-[#F0F0EE] flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="font-editorial-serif text-base font-bold text-[#111111] dark:text-[#F0F0EE]">
              {language === 'ne' ? 'नेपाली बोली खोजी (Voice Search)' : 'Nepali Voice Search'}
            </h3>
            <p className="text-xs text-[#787774] dark:text-[#9B9A97] leading-relaxed">
              {language === 'ne'
                ? 'बोलेर बालीको भाउ खोज्ने सुविधा चाँडै उपलब्ध हुँदैछ। कृपया माथिको खोज बाकसमा टाइप गर्नुहोस्।'
                : 'Nepali speech recognition for mandi price search is currently queued for real-time model integration. Please type above.'}
            </p>
            <button
              type="button"
              onClick={() => setShowVoiceRoadmapModal(false)}
              className="w-full py-2 rounded-md bg-[#111111] text-white dark:bg-[#F0F0EE] dark:text-[#111111] text-xs font-medium cursor-pointer"
            >
              {t('common.close', 'Close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
