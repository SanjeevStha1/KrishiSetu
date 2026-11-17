import React, { useState, useMemo } from 'react';
import {
  Sun,
  CloudRain,
  CloudSun,
  Cloud,
  TrendingUp,
  Truck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Calculator,
  ChevronRight,
  X,
  Bot,
  Sprout,
  Bell,
  Clock,
  BarChart2,
  Layers,
  Store,
  MapPin,
  ShieldCheck,
  Zap,
  Tag,
  ArrowUpRight,
  Users,
  Compass,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Commodity, DisruptionAlert, UserProfile } from '../types/krishi';
import { DISTRICT_LIST, SAMPLE_GROUP_POOLS, COMMODITY_SEEDS } from '../data/agriData';
import { getCropImage } from '../data/nepalAgriImages';
import { AppTab } from './Header';
import { PriceAlertModal } from './PriceAlertModal';
import { DispatchScheduleModal, ScheduleDayItem } from './DispatchScheduleModal';
import { useLanguage } from '../context/LanguageContext';
import { FarmRecordsService } from '../services/farmRecordsService';
import { DistrictWeatherWidget } from './DistrictWeatherWidget';
import { THEME } from '../theme';

interface FarmerHomeProps {
  commodities: Commodity[];
  alerts: DisruptionAlert[];
  selectedDistrict: string;
  setSelectedDistrict?: (district: string) => void;
  userProfile?: UserProfile;
  onNavigate: (tab: AppTab, extra?: { commodityId?: string }) => void;
  onOpenHowItWorks?: () => void;
}

export const FarmerHome: React.FC<FarmerHomeProps> = ({
  commodities,
  alerts,
  selectedDistrict,
  setSelectedDistrict,
  userProfile,
  onNavigate,
  onOpenHowItWorks,
}) => {
  const { t } = useLanguage();
  const currentDistrictObj =
    DISTRICT_LIST.find((d) => d.id.toLowerCase() === selectedDistrict.toLowerCase()) || DISTRICT_LIST[0];

  // Primary Farmer Crop computation
  const farmerProfileCrops = useMemo(() => {
    return userProfile?.primaryCrops && userProfile.primaryCrops.length > 0
      ? userProfile.primaryCrops
      : ['tomato', 'potato', 'cauliflower'];
  }, [userProfile?.primaryCrops]);

  // Top active crop highlight
  const topCrop = useMemo(() => {
    if (farmerProfileCrops.length > 0) {
      const matching = commodities.filter((c) =>
        farmerProfileCrops.some(
          (fc) =>
            fc.toLowerCase() === c.id.toLowerCase() ||
            fc.toLowerCase() === c.name.toLowerCase()
        )
      );
      if (matching.length > 0) {
        return matching.sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))[0];
      }
    }
    const sorted = [...commodities].sort(
      (a, b) => Math.abs(b.changePct) - Math.abs(a.changePct)
    );
    return sorted[0] || commodities[0];
  }, [commodities, farmerProfileCrops]);

  const topCropImg = getCropImage(topCrop?.id || 'tomato');

  // Modals state
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState<boolean>(false);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState<boolean>(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
  const [confirmedHarvestDetected, setConfirmedHarvestDetected] = useState<boolean>(false);

  // Relevant Group Freight Pools
  const districtPools = useMemo(() => {
    return SAMPLE_GROUP_POOLS.filter(
      (p) => p.district.toLowerCase() === selectedDistrict.toLowerCase()
    );
  }, [selectedDistrict]);

  // Real-time Farm Records analytics
  const [farmRecords, setFarmRecords] = useState(() => FarmRecordsService.getRecords());
  React.useEffect(() => {
    return FarmRecordsService.subscribe(setFarmRecords);
  }, []);

  const homeRecordsSummary = useMemo(() => {
    const now = new Date();
    const currentDayOfWeek = (now.getDay() + 6) % 7;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - currentDayOfWeek);
    weekStart.setHours(0, 0, 0, 0);

    const thisWeek = farmRecords.filter((r) => new Date(r.recorded_at) >= weekStart);
    let rev = 0;
    let exp = 0;
    let sav = 0;
    thisWeek.forEach((r) => {
      if (r.record_type === 'revenue') rev += r.amount;
      if (r.record_type === 'expense') exp += r.amount;
      if (r.record_type === 'pooling_savings') sav += r.amount;
    });
    const net = rev - exp;

    // 7-day mini sparkline bars (M, T, W, T, F, S, S)
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const sparkline = days.map((dayLabel, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const dStr = d.toISOString().split('T')[0];
      const dayRecs = thisWeek.filter((r) => r.recorded_at.split('T')[0] === dStr);
      let dayRev = 0;
      let dayExp = 0;
      dayRecs.forEach((r) => {
        if (r.record_type === 'revenue') dayRev += r.amount;
        if (r.record_type === 'expense') dayExp += r.amount;
      });
      const dayNet = dayRev - dayExp;
      return { dayLabel, value: Math.max(0, dayNet), rawNet: dayNet };
    });

    const maxVal = Math.max(...sparkline.map((s) => s.value), 1000);

    return {
      revenue: rev,
      expense: exp,
      netProfit: net,
      savings: sav,
      count: thisWeek.length,
      sparkline,
      maxVal,
    };
  }, [farmRecords]);

  // Handle 1-click confirmation of AI-detected farm record
  const handleConfirmDetectedHarvest = () => {
    FarmRecordsService.addRecord({
      crop: topCrop.id,
      cropName: `${topCrop.name} (${topCrop.nepaliName})`,
      record_type: 'revenue',
      amount: 23400,
      source: 'ai_assist',
      quantityKg: 300,
      note: `Confirmed detected harvest: 300kg ${topCrop.name} ready for market`,
    });
    setConfirmedHarvestDetected(true);
  };

  // Sample Buyer Demand Requests for B2B Produce Marketplace Showcase
  const sampleBuyerDemands = [
    {
      id: 'dem-1',
      buyer: 'Kathmandu Hotel & Restaurant Consortium',
      buyerType: 'Institutional Hospitality Buyer',
      cropName: 'Tomato (गोलभेडा)',
      cropId: 'tomato',
      volumeNeededKg: 500,
      targetPriceRange: 'Rs 42 – 48 / kg',
      deliveryLocation: 'Kalimati / Balkhu Terminal',
      urgency: 'Needed in 3 Days',
    },
    {
      id: 'dem-2',
      buyer: 'Panchakanya Supermarket Distribution',
      buyerType: 'Retail Chain Buyer',
      cropName: 'Potato (रातो आलु)',
      cropId: 'potato',
      volumeNeededKg: 1200,
      targetPriceRange: 'Rs 30 – 34 / kg',
      deliveryLocation: 'Narayangarh Central Hub',
      urgency: 'Immediate Dispatch',
    },
    {
      id: 'dem-3',
      buyer: 'Everest Cold Chain Wholesale',
      buyerType: 'Wholesale Distributor',
      cropName: 'Cauliflower (काउली)',
      cropId: 'cauliflower',
      volumeNeededKg: 400,
      targetPriceRange: 'Rs 24 – 28 / kg',
      deliveryLocation: 'Pokhara Prithvi Chowk',
      urgency: 'Needed this Week',
    },
  ];

  // Top 5 Key Mandi Commodities for Quick Overview
  const topMandiCommodities = useMemo(() => {
    return commodities.slice(0, 5);
  }, [commodities]);

  return (
    <div className="w-full space-y-8 pb-16 font-sans text-[#0F172A] transition-colors duration-200">
      
      {/* ========================================================
          1. HERO SECTION: Know your farm. Know your market. Sell smarter.
         ======================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#EFF6FF] via-[#F8FAFC] to-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm">
        {/* Subtle Background Glow Accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2563EB]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Narrative Headline + Product Story */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-[#2563EB] text-xs font-extrabold shadow-2xs border border-[#BFDBFE]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Agricultural Decision Suite • नेपाल</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-[1.15]">
              Know your farm.
              <br />
              <span className="text-[#2563EB]">Know your market.</span>
              <br />
              Sell smarter.
            </h1>

            <p className="text-sm sm:text-base text-[#64748B] font-medium leading-relaxed max-w-xl">
              KrishiSetu combines your farm records, live Kalimati wholesale prices, AI timing insights, and verified buyer demand to help you decide when and where to sell your harvest for maximum profit.
            </p>

            {/* Primary & Secondary Call to Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                type="button"
                id="hero-sell-harvest-btn"
                onClick={() => onNavigate('marketplace')}
                className="px-6 py-3.5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition active:scale-[0.98] cursor-pointer flex items-center gap-2"
              >
                <Store className="w-4 h-4" />
                <span>Sell My Harvest</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                type="button"
                id="hero-view-prices-btn"
                onClick={() => onNavigate('prices')}
                className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-[#0F172A] border border-slate-200 text-xs sm:text-sm font-extrabold shadow-xs transition active:scale-[0.98] cursor-pointer flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4 text-[#2563EB]" />
                <span>View Market Prices</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Connected Farm & Market Highlight Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-md space-y-4 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-extrabold text-sm">
                    {topCrop.emoji || '🍅'}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#0F172A]">
                      {topCrop.name} ({topCrop.nepaliName})
                    </h3>
                    <span className="text-[10px] text-[#64748B] font-medium">
                      Estimated Harvest: <strong className="text-[#0F172A]">300 kg</strong> in 3 Days
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-black text-[#0F172A] font-mono tabular-nums">
                    Rs {topCrop.currentPrice}
                    <span className="text-xs font-bold text-[#64748B]">/kg</span>
                  </div>
                  <span
                    className={`inline-flex items-center text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      topCrop.changePct >= 0
                        ? 'bg-[#ECFDF5] text-[#065F46]'
                        : 'bg-[#FEF2F2] text-[#991B1B]'
                    }`}
                  >
                    {topCrop.changePct >= 0 ? '+' : ''}{topCrop.changePct}% 7-Day Trend
                  </span>
                </div>
              </div>

              {/* AI Recommendation Box */}
              <div className="bg-[#F8FAFC] rounded-2xl p-3.5 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#2563EB]">
                  <Bot className="w-3.5 h-3.5" />
                  <span>AI Market Outlook & Recommendation</span>
                </div>
                <p className="text-xs text-[#0F172A] font-medium leading-relaxed">
                  Prices in Kalimati are trending upward (+{Math.abs(topCrop.changePct)}%). Your 300kg harvest begins in 3 days. Preparing a bulk lot now gives you leverage with 3 nearby institutional buyers.
                </p>
              </div>

              {/* Quick Card Action */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate('market', { commodityId: topCrop.id })}
                  className="text-xs font-extrabold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 cursor-pointer"
                >
                  <span>View selling opportunity</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-bold text-[#64748B]">
                  Confidence: <strong className="text-[#065F46]">Moderate (84%)</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          LIVE DISTRICT MICROCLIMATE & FIELD WEATHER ADVISORY
         ======================================================== */}
      <section className="space-y-2">
        <DistrictWeatherWidget
          selectedDistrict={selectedDistrict}
          setSelectedDistrict={setSelectedDistrict}
          compact={false}
        />
      </section>

      {/* ========================================================
          2. SECTION: Today's Kalimati Agricultural Market Overview
         ======================================================== */}
      <section className="bg-white dark:bg-[#22201D] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-[#383530] shadow-xs space-y-5 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-extrabold uppercase tracking-wide mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Kalimati Wholesale Clearing Rates</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
              Today's Agricultural Market Benchmark
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] font-medium">
              Real-time daily rates across major vegetable, staple, and spice wholesale terminals.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('prices')}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#2563EB] hover:text-[#1D4ED8] self-start sm:self-auto cursor-pointer"
          >
            <span>Full Mandi Table ({commodities.length} commodities)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Chunky Two-Tone Horizontal Bar Graph Preview */}
        <div className="space-y-3 pt-2">
          {topMandiCommodities.map((item) => {
            const catTheme = THEME.getCategoryTheme(item.category);
            const isUp = item.changePct >= 0;
            const maxPrice = 120;
            const barWidthPct = Math.min(100, Math.max(15, (item.currentPrice / maxPrice) * 100));

            return (
              <div
                key={item.id}
                onClick={() => onNavigate('prices', { commodityId: item.id })}
                className="group p-3 sm:p-4 rounded-2xl bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200/70 hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
              >
                {/* Crop Glyph & Title */}
                <div className="flex items-center gap-3 sm:w-1/3 shrink-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs text-base"
                    style={{ backgroundColor: catTheme.bg, color: catTheme.color }}
                  >
                    {item.emoji || '🌱'}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                      {item.name}
                    </h4>
                    <span className="text-[11px] text-[#64748B] font-medium">
                      {item.nepaliName} • {catTheme.shortLabel}
                    </span>
                  </div>
                </div>

                {/* Horizontal Chunky Bar Indicator */}
                <div className="flex-1 px-2">
                  <div className="flex justify-between text-[10px] font-bold text-[#64748B] mb-1">
                    <span>Min Rs {item.low}</span>
                    <span>Max Rs {item.high}</span>
                  </div>
                  <div className="w-full h-3.5 rounded-full bg-slate-200 overflow-hidden relative">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${barWidthPct}%`,
                        backgroundColor: catTheme.color,
                      }}
                    />
                  </div>
                </div>

                {/* Rate & 7-Day Movement */}
                <div className="text-right shrink-0 sm:w-28">
                  <div className="text-base font-black text-[#0F172A] font-mono tabular-nums">
                    Rs {item.currentPrice}
                    <span className="text-xs font-bold text-[#64748B]">/kg</span>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold inline-flex items-center ${
                      isUp ? 'text-[#065F46]' : 'text-[#991B1B]'
                    }`}
                  >
                    {isUp ? '↑ +' : '↓ '}{item.changePct}% this week
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          3. SECTION: AI Farm Records & Auto-Intelligence
         ======================================================== */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] text-[#065F46] text-xs font-extrabold uppercase tracking-wide mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Zero-Effort Farm Intelligence</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
              KrishiSetu keeps your farm records for you
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] font-medium">
              Every calculator calculation, freight booking, and harvest activity automatically syncs into your financial ledger.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('records')}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#2563EB] hover:text-[#1D4ED8] self-start sm:self-auto cursor-pointer"
          >
            <span>Open Farm Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* AI-Detected Harvest Confirmation Notification Box */}
        <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-[#0F172A]">
                Detected Harvest: 300 kg {topCrop.name}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB]">
                Ready in 3 Days
              </span>
            </div>
            <p className="text-xs text-[#64748B] font-medium">
              Estimated gross value: <strong className="text-[#0F172A]">Rs 23,400</strong> (@ Rs 78/kg avg mandi price).
            </p>
          </div>

          {confirmedHarvestDetected ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ECFDF5] text-[#065F46] text-xs font-extrabold border border-[#A7F3D0]">
              <Check className="w-4 h-4" />
              <span>Recorded in Farm Ledger</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleConfirmDetectedHarvest}
              className="px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-extrabold transition shadow-xs cursor-pointer shrink-0"
            >
              Confirm Record (खातामा थप्नुहोस्)
            </button>
          )}
        </div>

        {/* Real Financial Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200">
            <span className="text-[10px] font-extrabold uppercase tracking-wide text-[#64748B] block">
              This Week's Revenue
            </span>
            <div className="text-xl font-black text-[#065F46] font-mono tabular-nums mt-1">
              Rs {homeRecordsSummary.revenue.toLocaleString()}
            </div>
            <span className="text-[10px] text-[#64748B] font-medium mt-0.5 block">
              From verified harvest sales
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200">
            <span className="text-[10px] font-extrabold uppercase tracking-wide text-[#64748B] block">
              Production Costs
            </span>
            <div className="text-xl font-black text-[#991B1B] font-mono tabular-nums mt-1">
              Rs {homeRecordsSummary.expense.toLocaleString()}
            </div>
            <span className="text-[10px] text-[#64748B] font-medium mt-0.5 block">
              Seeds, fertilizer & labor
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200">
            <span className="text-[10px] font-extrabold uppercase tracking-wide text-[#64748B] block">
              Shared Freight Savings
            </span>
            <div className="text-xl font-black text-[#2563EB] font-mono tabular-nums mt-1">
              +Rs {homeRecordsSummary.savings.toLocaleString()}
            </div>
            <span className="text-[10px] text-[#64748B] font-medium mt-0.5 block">
              Saved via freight pooling
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. SECTION: Decision Engine ("What Should I Do Next?")
         ======================================================== */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-extrabold uppercase tracking-wide mb-1">
              <Bot className="w-3.5 h-3.5" />
              <span>Intelligent Timing & Arbitrage</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
              Decision Engine: What should I do next?
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] font-medium">
              Transparent market momentum analysis with clear, actionable recommendations.
            </p>
          </div>

          <span className="text-xs font-bold text-[#64748B]">
            Confidence Rating: <strong className="text-[#065F46]">Moderate (84%)</strong>
          </span>
        </div>

        {/* 3 Action Pathways: Sell Now, Wait, Compare Buyers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Pathway 1: Sell Now */}
          <div className="p-5 rounded-2xl bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 transition space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#ECFDF5] text-[#065F46] flex items-center justify-center font-extrabold text-xs">
                1
              </div>
              <h3 className="font-extrabold text-sm text-[#0F172A]">
                Sell Now (तत्काल बिक्री)
              </h3>
              <p className="text-xs text-[#64748B] font-medium leading-relaxed">
                Current Kalimati wholesale average is Rs {topCrop.currentPrice}/kg. Lock in peak margin before regional arrivals peak.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('marketplace')}
              className="w-full py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-extrabold transition shadow-2xs cursor-pointer"
            >
              List Produce Lot
            </button>
          </div>

          {/* Pathway 2: Wait 3 Days */}
          <div className="p-5 rounded-2xl bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 transition space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#FFFBEB] text-[#B45309] flex items-center justify-center font-extrabold text-xs">
                2
              </div>
              <h3 className="font-extrabold text-sm text-[#0F172A]">
                Wait 3 Days (प्रतिक्षा गर्नुहोस्)
              </h3>
              <p className="text-xs text-[#64748B] font-medium leading-relaxed">
                Statistical projection shows projected range Rs {Math.round(topCrop.currentPrice * 0.98)}–{Math.round(topCrop.currentPrice * 1.08)}/kg. Harvesting in 3 days allows full maturity.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('prices', { commodityId: topCrop.id })}
              className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#0F172A] border border-slate-200 text-xs font-extrabold transition shadow-2xs cursor-pointer"
            >
              Track Price Outlook
            </button>
          </div>

          {/* Pathway 3: Pool Freight Truck */}
          <div className="p-5 rounded-2xl bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 transition space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-extrabold text-xs">
                3
              </div>
              <h3 className="font-extrabold text-sm text-[#0F172A]">
                Pool Freight (ढुवानी साझा)
              </h3>
              <p className="text-xs text-[#64748B] font-medium leading-relaxed">
                Save 55% on transport by sharing a freight truck to Kathmandu with nearby smallholders in {currentDistrictObj.name}.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('sell')}
              className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-extrabold transition shadow-2xs cursor-pointer"
            >
              Join Freight Pool (-55%)
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. SECTION: B2B Agricultural Produce Marketplace
         ======================================================== */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-extrabold uppercase tracking-wide mb-1">
              <Store className="w-3.5 h-3.5" />
              <span>B2B Harvest Lots & Wholesaler Demands</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
              Your harvest has a direct market
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] font-medium">
              Institutional buyers, restaurant chains, and wholesalers actively seeking bulk produce in your corridor.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('marketplace')}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#2563EB] hover:text-[#1D4ED8] self-start sm:self-auto cursor-pointer"
          >
            <span>Explore All Harvest Lots</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live Buyer Demand Request Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {sampleBuyerDemands.map((demand) => (
            <div
              key={demand.id}
              onClick={() => onNavigate('marketplace')}
              className="p-5 rounded-2xl bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200/80 transition space-y-3 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46]">
                  {demand.urgency}
                </span>
                <span className="text-[10px] text-[#64748B] font-bold">
                  Target: {demand.targetPriceRange}
                </span>
              </div>

              <div>
                <h4 className="font-extrabold text-sm text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                  {demand.volumeNeededKg} kg {demand.cropName}
                </h4>
                <p className="text-xs text-[#64748B] font-medium mt-0.5">
                  Buyer: {demand.buyer}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-[#64748B] mt-1 font-medium">
                  <MapPin className="w-3 h-3 text-[#2563EB]" />
                  <span>{demand.deliveryLocation}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-extrabold text-[#2563EB]">
                <span>Supply this Lot</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          6. SECTION: Krishi Mitra Smart Question Entry Point
         ======================================================== */}
      <section className="bg-gradient-to-r from-[#F8FAFC] to-[#EFF6FF] rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-[#0F172A]">
              Ask Krishi Mitra AI Assistant
            </h3>
            <p className="text-xs text-[#64748B] font-medium">
              Ask anything about Kalimati prices, soil health, fertilizer dosing, or shared freight pools.
            </p>
          </div>
        </div>

        {/* Realistic Farmer Prompt Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            'What is Tomato worth in Kalimati today?',
            'Any shared freight trucks in Chitwan?',
            'How much will 500kg Cauliflower earn?',
            'When is the best date to harvest Potato?',
          ].map((promptText, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                // KrishiMitra listens or opens
                const el = document.getElementById('krishi-mitra-launcher-btn');
                if (el) el.click();
              }}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#0F172A] border border-slate-200 text-xs font-bold transition shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-[#2563EB]" />
              <span>{promptText}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ========================================================
          7. FINAL CALL TO ACTION: Start managing your farm smarter
         ======================================================== */}
      <section className="bg-[#0F172A] text-white rounded-3xl p-8 sm:p-10 shadow-lg text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-extrabold uppercase tracking-wide">
          <Sprout className="w-3.5 h-3.5" />
          <span>Complete Agricultural Intelligence</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight max-w-xl mx-auto">
          Start managing your farm smarter with KrishiSetu
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-lg mx-auto">
          Join thousands of Nepali smallholders taking control of market prices, slashing transport costs, and selling directly to verified buyers.
        </p>

        <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('calculator')}
            className="px-6 py-3 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-extrabold transition cursor-pointer shadow-md"
          >
            Calculate My Crop Earnings
          </button>
          <button
            type="button"
            onClick={() => onNavigate('marketplace')}
            className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold transition cursor-pointer border border-white/20"
          >
            Post a Harvest Lot
          </button>
        </div>
      </section>

      {/* Modals & Dialogs */}
      {isSmsModalOpen && (
        <PriceAlertModal
          isOpen={isSmsModalOpen}
          onClose={() => setIsSmsModalOpen(false)}
          selectedDistrict={selectedDistrict}
          initialCropId={topCrop?.id}
          commodities={commodities}
          userProfile={userProfile}
        />
      )}
    </div>
  );
};
