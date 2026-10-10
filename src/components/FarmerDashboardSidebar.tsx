import React, { useMemo } from 'react';
import {
  X,
  User,
  Phone,
  MapPin,
  Building2,
  Sprout,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Truck,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Scale,
  Edit3,
  LogOut,
} from 'lucide-react';
import { UserProfile, AuthUser, Commodity } from '../types/krishi';
import { toSquareMeters, LandUnit } from '../utils/landMeasurement';
import { useLanguage } from '../context/LanguageContext';
import { AppTab } from './Header';
import { DISTRICT_LIST, SAMPLE_TRACK_RECORD } from '../data/agriData';
import { getKalimatiCrop, getKalimatiCurrentPrice } from '../data/kalimatiDataset';

export interface FarmerDashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  authUser: AuthUser;
  commodities: Commodity[];
  selectedDistrict: string;
  onEditFarmData: () => void;
  onNavigateTab: (tab: AppTab, extra?: { commodityId?: string } | string) => void;
  onLogout?: () => void;
}

export const FarmerDashboardSidebar: React.FC<FarmerDashboardSidebarProps> = ({
  isOpen,
  onClose,
  userProfile,
  authUser,
  commodities,
  selectedDistrict,
  onEditFarmData,
  onNavigateTab,
  onLogout,
}) => {
  const { language, t } = useLanguage();
  const isNe = language === 'ne';

  // Resolved farmer details
  const farmerName = userProfile.name || authUser.name || 'Ram Bahadur Thapa';
  const farmerPhone = userProfile.phone || authUser.phone || '+977 9845012345';
  const farmerLocation = userProfile.municipality || 'Bharatpur-11, Ganeshdham';
  const farmerCooperative =
    userProfile.cooperativeMembership || 'Bharatpur Sana Kishan Krishi Sahakari';
  const districtName = useMemo(() => {
    const d = DISTRICT_LIST.find(
      (item) => item.id.toLowerCase() === (userProfile.district || selectedDistrict).toLowerCase()
    );
    return d ? d.name : 'Chitwan';
  }, [userProfile.district, selectedDistrict]);

  // Land measurements
  const landUnit = (userProfile.landUnit || 'ropani') as LandUnit;
  const rawLandSize = Number(userProfile.landSize ?? userProfile.landSizeRopani ?? 1.2);
  const sqMeters = useMemo(() => {
    return Math.round(toSquareMeters(rawLandSize, landUnit));
  }, [rawLandSize, landUnit]);

  // Land unit display string
  const landUnitDisplay = useMemo(() => {
    switch (landUnit) {
      case 'ropani':
        return isNe ? 'रोपनी' : 'Ropani';
      case 'bigha':
        return isNe ? 'बिघा' : 'Bigha';
      case 'kattha':
        return isNe ? 'कट्ठा' : 'Kattha';
      case 'aana':
        return isNe ? 'आना' : 'Aana';
      case 'hectare':
        return isNe ? 'हेक्टर' : 'Hectare';
      default:
        return landUnit;
    }
  }, [landUnit, isNe]);

  // Farm performance metrics (from existing SAMPLE_TRACK_RECORD and userProfile)
  const performanceMetrics = useMemo(() => {
    const harvested = SAMPLE_TRACK_RECORD.filter((r) => r.status === 'harvested');
    const accuracy = harvested.length > 0
      ? (harvested.reduce((sum, r) => sum + r.accuracyPct, 0) / harvested.length).toFixed(1)
      : '96.3';

    const profitGain = userProfile.totalEarningsGainNPR || 48500;

    return {
      forecastAccuracy: `${accuracy}%`,
      smartProfitGain: `+Rs. ${profitGain.toLocaleString('en-IN')}`,
      harvestedKg: '1,200 kg',
      activeSeason: isNe ? 'मौसम २ (२०८२/८३)' : 'Season 2 (2025/26)',
    };
  }, [userProfile, isNe]);

  // Current active crops with realistic field lifecycle data
  const currentCrops = useMemo(() => {
    return [
      {
        id: 'tomato',
        name: 'Tomato (Local)',
        nameNe: 'गोलभेडा (स्थानीय)',
        emoji: '🍅',
        status: isNe ? 'फल्न तयार / बिक्री सिफारिस' : 'Harvest Ready',
        statusColor: 'emerald',
        plantingDate: isNe ? 'जेठ १५, २०८२' : 'May 28, 2025',
        harvestDate: isNe ? 'भदौ २५–२८' : 'Sep 10–13',
        expectedHarvest: '650 kg',
        area: '0.7 Ropani',
      },
      {
        id: 'beans',
        name: 'French Beans',
        nameNe: 'सिमी (French Beans)',
        emoji: '🫘',
        status: isNe ? 'हुर्कँदै (फूल फुल्ने अवस्था)' : 'Growing (Flowering)',
        statusColor: 'amber',
        plantingDate: isNe ? 'असार २०, २०८२' : 'July 4, 2025',
        harvestDate: isNe ? 'असोज ५–१०' : 'Late Sep',
        expectedHarvest: '220 kg',
        area: '0.5 Ropani',
      },
    ];
  }, [isNe]);

  // Market data for farmer's primary crops
  const yourMarketData = useMemo(() => {
    const tomatoComm = commodities.find((c) => c.id === 'tomato');
    const tomatoPrice = tomatoComm?.currentPrice ?? Math.round(getKalimatiCurrentPrice('tomato'));
    const beansPrice = Math.round(getKalimatiCurrentPrice('french_beans')) || 68;

    return [
      {
        cropId: 'tomato',
        name: isNe ? 'गोलभेडा (Tomato)' : 'Tomato (Local)',
        emoji: '🍅',
        price: tomatoPrice,
        changePct: tomatoComm?.changePct ?? 12.5,
        trend: (tomatoComm?.changePct ?? 12.5) >= 0 ? (isNe ? '📈 बढ्दो' : '📈 Rising') : (isNe ? '📉 घट्दो' : '📉 Falling'),
        sentiment: tomatoComm?.sentiment ?? 'bullish',
        mandi: tomatoComm?.bestSellingMandi || (isNe ? 'कालीमाटी थोक' : 'Kalimati Mandi'),
      },
      {
        cropId: 'french_beans',
        name: isNe ? 'सिमी (Beans)' : 'French Beans',
        emoji: '🫘',
        price: beansPrice,
        changePct: 3.2,
        trend: isNe ? '📈 बढ्दो' : '📈 Rising',
        sentiment: 'bullish',
        mandi: isNe ? 'कालीमाटी थोक' : 'Kalimati Mandi',
      },
    ];
  }, [commodities, isNe]);

  if (!isOpen) return null;

  return (
    <div
      id="farmer-dashboard-drawer-container"
      className="fixed inset-0 z-50 overflow-hidden"
      aria-modal="true"
      role="dialog"
      aria-label="Farmer Dashboard Sidebar"
    >
      {/* 1. Subtle Background Overlay */}
      <div
        id="farmer-dashboard-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
      />

      {/* 2. Slide-in Sidebar Panel from the Right */}
      <aside
        id="farmer-dashboard-sidebar"
        className="fixed inset-y-0 right-0 max-w-full flex pl-6"
      >
        <div className="w-screen max-w-md sm:w-[420px] bg-[#FAF7F2] dark:bg-[#181715] border-l border-[#E8E2D8] dark:border-[#383530] text-[#1F1E1B] dark:text-[#F5F3EF] shadow-2xl flex flex-col h-full overflow-hidden transition-transform duration-300 ease-out transform translate-x-0">
          
          {/* HEADER (Section 3) */}
          <div
            id="farmer-sidebar-header"
            className="p-4 sm:p-5 bg-white dark:bg-[#22201D] border-b border-[#E8E2D8] dark:border-[#383530] flex items-center justify-between gap-3 shrink-0"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Profile Avatar / Initial */}
              <div className="w-12 h-12 rounded-2xl bg-[#1F1E1B] dark:bg-[#FAF7F2] text-white dark:text-[#1F1E1B] flex items-center justify-center font-bold text-lg shadow-sm shrink-0 border border-black/10">
                {farmerName.charAt(0) || 'R'}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2
                    id="farmer-sidebar-name"
                    className="font-editorial-serif font-black text-base sm:text-lg text-[#1F1E1B] dark:text-[#F5F3EF] truncate"
                  >
                    {farmerName}
                  </h2>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              id="farmer-sidebar-close-btn"
              onClick={onClose}
              className="px-2.5 py-1.5 rounded-lg bg-[#FAF7F2] dark:bg-[#2A2824] hover:bg-[#F6F2EB] dark:hover:bg-[#322F2A] border border-[#E8E2D8] dark:border-[#383530] text-xs font-bold text-[#1F1E1B] dark:text-[#F5F3EF] flex items-center gap-1.5 transition cursor-pointer shrink-0"
              title={isNe ? 'बन्द गर्नुहोस्' : 'Close Dashboard'}
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">{isNe ? 'बन्द' : 'Close'}</span>
            </button>
          </div>

          {/* SCROLLABLE SIDEBAR BODY */}
          <div
            id="farmer-sidebar-content"
            className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 sm:space-y-5 text-xs"
          >
            {/* SECTION 4: 👤 Personal Information */}
            <section
              id="farmer-sidebar-personal-info"
              className="app-card bg-white dark:bg-[#22201D] border border-[#E8E2D8] dark:border-[#383530] p-4 rounded-xl shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D8] dark:border-[#383530]">
                <h3 className="font-bold text-sm text-[#1F1E1B] dark:text-[#F5F3EF] flex items-center gap-2">
                  <User className="w-4 h-4 text-[#2E7D5A] dark:text-[#4ADE80]" />
                  <span>{isNe ? 'व्यक्तिगत विवरण' : 'Personal Information'}</span>
                </h3>
                <span className="text-[10px] text-[#746F68] dark:text-[#A6A096] uppercase font-bold tracking-wider">
                  {isNe ? 'सदस्य #२०४' : 'ID #204'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[11px] text-[#746F68] dark:text-[#A6A096] block font-medium">
                    {isNe ? 'नाम (Name)' : 'Name'}
                  </span>
                  <span className="font-bold text-xs text-[#1F1E1B] dark:text-[#F5F3EF] mt-0.5 block">
                    {farmerName}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-[#746F68] dark:text-[#A6A096] block font-medium">
                    {isNe ? 'सम्पर्क फोन' : 'Phone'}
                  </span>
                  <span className="font-editorial-mono font-bold text-xs text-[#1F1E1B] dark:text-[#F5F3EF] mt-0.5 block">
                    {farmerPhone}
                  </span>
                </div>

                <div className="col-span-2 pt-1 border-t border-[#E8E2D8]/60 dark:border-[#383530]/60">
                  <span className="text-[11px] text-[#746F68] dark:text-[#A6A096] block font-medium">
                    {isNe ? 'ठेगाना' : 'Location'}
                  </span>
                  <span className="font-semibold text-xs text-[#1F1E1B] dark:text-[#F5F3EF] mt-0.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C8A27C] dark:text-[#D9B591] shrink-0" />
                    {farmerLocation}
                  </span>
                </div>

                <div className="col-span-2 pt-1 border-t border-[#E8E2D8]/60 dark:border-[#383530]/60">
                  <span className="text-[11px] text-[#746F68] dark:text-[#A6A096] block font-medium">
                    {isNe ? 'आबद्ध सहकारी' : 'Cooperative'}
                  </span>
                  <span className="font-semibold text-xs text-[#1F1E1B] dark:text-[#F5F3EF] mt-0.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#2D6CDF] dark:text-[#76A9FA] shrink-0" />
                    {farmerCooperative}
                  </span>
                </div>
              </div>
            </section>

            {/* SECTION 5: 🌾 Farm Information */}
            <section
              id="farmer-sidebar-farm-info"
              className="app-card bg-white dark:bg-[#22201D] border border-[#E8E2D8] dark:border-[#383530] p-4 rounded-xl shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D8] dark:border-[#383530]">
                <h3 className="font-bold text-sm text-[#1F1E1B] dark:text-[#F5F3EF] flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-[#2E7D5A] dark:text-[#4ADE80]" />
                  <span>{isNe ? 'खेत तथा जमिन विवरण' : 'Farm Information'}</span>
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FAF7F2] dark:bg-[#2A2824] border border-[#E8E2D8] dark:border-[#383530]">
                  {districtName}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-lg bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530]">
                  <span className="text-[10px] text-[#746F68] dark:text-[#A6A096] uppercase font-bold block">
                    {isNe ? 'जम्मा जग्गा' : 'Total Land'}
                  </span>
                  <span className="font-bold text-sm text-[#1F1E1B] dark:text-[#F5F3EF] mt-0.5 block">
                    {rawLandSize} {landUnitDisplay}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530]">
                  <span className="text-[10px] text-[#746F68] dark:text-[#A6A096] uppercase font-bold block">
                    {isNe ? 'क्षेत्रफल (Area)' : 'Land Area'}
                  </span>
                  <span className="font-editorial-mono font-bold text-sm text-[#1F1E1B] dark:text-[#F5F3EF] mt-0.5 block">
                    {sqMeters} m²
                  </span>
                </div>

                <div className="col-span-2 pt-1">
                  <span className="text-[11px] text-[#746F68] dark:text-[#A6A096] block font-medium mb-1.5">
                    {isNe ? 'मुख्य बालीहरू (Primary Crops)' : 'Primary Crops'}
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF7F2] dark:bg-[#2A2824] border border-[#E8E2D8] dark:border-[#383530] font-bold text-xs text-[#1F1E1B] dark:text-[#F5F3EF]">
                      <span>🍅</span>
                      <span>{isNe ? 'गोलभेडा (Tomato)' : 'Tomato'}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF7F2] dark:bg-[#2A2824] border border-[#E8E2D8] dark:border-[#383530] font-bold text-xs text-[#1F1E1B] dark:text-[#F5F3EF]">
                      <span>🫘</span>
                      <span>{isNe ? 'सिमी (Beans)' : 'Beans'}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FAF7F2] dark:bg-[#2A2824] border border-[#E8E2D8] dark:border-[#383530] text-[11px] text-[#746F68] dark:text-[#A6A096]">
                      <span>🥦</span>
                      <span>{isNe ? 'काउली' : 'Cauliflower'}</span>
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 6: 📊 Farm Performance */}
            <section
              id="farmer-sidebar-performance"
              className="app-card bg-white dark:bg-[#22201D] border border-[#E8E2D8] dark:border-[#383530] p-4 rounded-xl shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D8] dark:border-[#383530]">
                <h3 className="font-bold text-sm text-[#1F1E1B] dark:text-[#F5F3EF] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#2D6CDF] dark:text-[#76A9FA]" />
                  <span>{isNe ? 'नाफा तथा कार्यसम्पादन' : 'Farm Overview'}</span>
                </h3>
                <span className="text-[10px] text-[#2E7D5A] dark:text-[#4ADE80] font-bold">
                  {performanceMetrics.activeSeason}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-[#EAF3EE] dark:bg-[#1E3327] border border-[#C5DEC8] dark:border-[#2E5E3B]">
                  <span className="text-[10px] uppercase font-bold text-[#1E5E41] dark:text-[#4ADE80] block">
                    {isNe ? 'प्रक्षेपण शुद्धता' : 'Forecast Accuracy'}
                  </span>
                  <span className="font-editorial-mono font-black text-lg text-[#1E5E41] dark:text-[#4ADE80] mt-0.5 block">
                    {performanceMetrics.forecastAccuracy}
                  </span>
                  <span className="text-[10px] text-[#1E5E41]/80 dark:text-[#4ADE80]/80 mt-0.5 block">
                    {isNe ? 'कालीमाटी बजार प्रक्षेपण' : 'vs Kalimati actuals'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#EDF4FC] dark:bg-[#1A2E4C] border border-[#C0D8FA] dark:border-[#2B4B7B]">
                  <span className="text-[10px] uppercase font-bold text-[#1B4FA8] dark:text-[#76A9FA] block">
                    {isNe ? 'खुद नाफा वृद्धि' : 'Smart Profit Gain'}
                  </span>
                  <span className="font-editorial-mono font-black text-lg text-[#1B4FA8] dark:text-[#76A9FA] mt-0.5 block">
                    {performanceMetrics.smartProfitGain}
                  </span>
                  <span className="text-[10px] text-[#1B4FA8]/80 dark:text-[#76A9FA]/80 mt-0.5 block">
                    {isNe ? 'साझा ढुवानी र सही समय' : 'From timing & pooling'}
                  </span>
                </div>
              </div>
            </section>

            {/* SECTION 7: 🌱 Current Crops Status */}
            <section
              id="farmer-sidebar-current-crops"
              className="app-card bg-white dark:bg-[#22201D] border border-[#E8E2D8] dark:border-[#383530] p-4 rounded-xl shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D8] dark:border-[#383530]">
                <h3 className="font-bold text-sm text-[#1F1E1B] dark:text-[#F5F3EF] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#2E7D5A] dark:text-[#4ADE80]" />
                  <span>{isNe ? 'खेतमा रहेका बालीहरू' : 'Current Crops'}</span>
                </h3>
                <span className="text-[10px] text-[#746F68] dark:text-[#A6A096]">
                  {currentCrops.length} {isNe ? 'बाली' : 'Active'}
                </span>
              </div>

              <div className="space-y-2.5">
                {currentCrops.map((crop) => (
                  <div
                    key={crop.id}
                    className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{crop.emoji}</span>
                        <div>
                          <h4 className="font-bold text-xs text-[#1F1E1B] dark:text-[#F5F3EF]">
                            {isNe ? crop.nameNe : crop.name}
                          </h4>
                          <span className="text-[10px] text-[#746F68] dark:text-[#A6A096]">
                            {crop.area}
                          </span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF3EE] text-[#1E5E41] dark:bg-[#1E3327] dark:text-[#4ADE80] border border-[#C5DEC8] dark:border-[#2E5E3B]">
                        {crop.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1.5 border-t border-[#E8E2D8]/60 dark:border-[#383530]/60">
                      <div>
                        <span className="text-[#746F68] dark:text-[#A6A096] block text-[10px]">
                          {isNe ? 'फसल समय' : 'Harvest Window'}
                        </span>
                        <span className="font-bold text-[#1F1E1B] dark:text-[#F5F3EF]">
                          {crop.harvestDate}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#746F68] dark:text-[#A6A096] block text-[10px]">
                          {isNe ? 'अनुमानित फसल' : 'Expected Harvest'}
                        </span>
                        <span className="font-editorial-mono font-bold text-[#1F1E1B] dark:text-[#F5F3EF]">
                          {crop.expectedHarvest}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 8: 📈 Your Market */}
            <section
              id="farmer-sidebar-market-info"
              className="app-card bg-white dark:bg-[#22201D] border border-[#E8E2D8] dark:border-[#383530] p-4 rounded-xl shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D8] dark:border-[#383530]">
                <h3 className="font-bold text-sm text-[#1F1E1B] dark:text-[#F5F3EF] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#2E7D5A] dark:text-[#4ADE80]" />
                  <span>{isNe ? 'तपाईंको बालीको बजार' : 'Your Market'}</span>
                </h3>
                <span className="text-[10px] text-[#746F68] dark:text-[#A6A096]">
                  {isNe ? 'कालीमाटी मन्डी' : 'Kalimati Mandi'}
                </span>
              </div>

              <div className="space-y-2">
                {yourMarketData.map((item) => (
                  <div
                    key={item.cropId}
                    className="p-2.5 rounded-lg bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{item.emoji}</span>
                      <div>
                        <span className="font-bold text-xs text-[#1F1E1B] dark:text-[#F5F3EF] block">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-[#746F68] dark:text-[#A6A096]">
                          {item.trend}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-editorial-mono font-black text-xs text-[#1F1E1B] dark:text-[#F5F3EF] block">
                        Rs {item.price}/kg
                      </span>
                      <span className="text-[10px] text-[#1E5E41] dark:text-[#4ADE80] font-semibold">
                        {item.changePct > 0 ? `+${item.changePct}%` : 'Stable'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 9: 🧠 Current Recommendation (Active Decisions) */}
            <section
              id="farmer-sidebar-recommendation"
              className="app-card bg-white dark:bg-[#22201D] border border-[#E8E2D8] dark:border-[#383530] p-4 rounded-xl shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D8] dark:border-[#383530]">
                <h3 className="font-bold text-sm text-[#1F1E1B] dark:text-[#F5F3EF] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C8A27C] dark:text-[#D9B591]" />
                  <span>{isNe ? 'हालको सिफारिस' : 'Current Recommendation'}</span>
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF3EE] text-[#1E5E41] dark:bg-[#1E3327] dark:text-[#4ADE80]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D5A] animate-pulse" />
                  {isNe ? 'अनुकूल (Favorable)' : 'Favorable'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🍅</span>
                    <span className="font-bold text-xs text-[#1F1E1B] dark:text-[#F5F3EF]">
                      {isNe ? 'गोलभेडा (Tomato)' : 'Tomato (Local)'}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#1E5E41] dark:text-[#4ADE80]">
                    {isNe ? '+रु ६/केजी उच्च दर' : '+Rs 6/kg projected peak'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#746F68] dark:text-[#A6A096] uppercase font-bold block">
                    {isNe ? 'सिफारिस गरिएको बिक्री समय' : 'Recommended Selling Window'}
                  </span>
                  <span className="font-bold text-xs text-[#1F1E1B] dark:text-[#F5F3EF] mt-0.5 block">
                    {isNe ? 'भदौ २५–२७ (Sep 10–12)' : 'Sep 10–12'}
                  </span>
                  <p className="text-[11px] text-[#746F68] dark:text-[#A6A096] mt-1 leading-relaxed">
                    {isNe
                      ? 'कालीमाटीमा आपूर्ति कम भएकाले २ दिनपछि दर उच्च विन्दुमा पुग्ने प्रक्षेपण छ।'
                      : 'High Valley demand and arrival dips project peak wholesale rates in 48–72 hours.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="sidebar-view-decision-btn"
                onClick={() => {
                  onClose();
                  onNavigateTab('home', { commodityId: 'tomato' });
                }}
                className="w-full py-2 px-3 rounded-lg bg-[#FAF7F2] dark:bg-[#2A2824] hover:bg-[#F6F2EB] dark:hover:bg-[#322F2A] border border-[#E8E2D8] dark:border-[#383530] font-bold text-xs text-[#1F1E1B] dark:text-[#F5F3EF] flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <span>{isNe ? 'होममा विस्तृत हेर्नुहोस्' : 'View on Home'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </section>

            {/* SECTION 10: 🚚 Upcoming Transport (Transport Summary) */}
            <section
              id="farmer-sidebar-transport"
              className="app-card bg-white dark:bg-[#22201D] border border-[#E8E2D8] dark:border-[#383530] p-4 rounded-xl shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D8] dark:border-[#383530]">
                <h3 className="font-bold text-sm text-[#1F1E1B] dark:text-[#F5F3EF] flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#C8A27C] dark:text-[#D9B591]" />
                  <span>{isNe ? 'आउँदो साझा ढुवानी' : 'Upcoming Transport'}</span>
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF3EE] text-[#1E5E41] dark:bg-[#1E3327] dark:text-[#4ADE80]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D5A]" />
                  {isNe ? 'उपलब्ध (Available)' : 'Available'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#1F1E1B] dark:text-[#F5F3EF]">
                    {isNe ? 'भदौ २६ (Sep 11)' : 'Sep 11'} · 5:00 PM
                  </span>
                  <span className="text-[10px] text-[#746F68] dark:text-[#A6A096]">
                    {isNe ? 'बोलेरो पिकअप' : 'Bolero Pickup'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-[#1F1E1B] dark:text-[#F5F3EF]">
                  <span>{districtName}</span>
                  <ArrowRight className="w-3 h-3 text-[#746F68] dark:text-[#A6A096]" />
                  <span>{isNe ? 'काठमाडौँ (कालीमाटी)' : 'Kathmandu (Kalimati)'}</span>
                </div>

                <div className="pt-1.5 border-t border-[#E8E2D8]/60 dark:border-[#383530]/60 flex items-center justify-between">
                  <span className="text-[11px] text-[#746F68] dark:text-[#A6A096]">
                    {isNe ? 'अनुमानित भाडा बचत' : 'Estimated saving:'}
                  </span>
                  <span className="font-editorial-mono font-black text-xs text-[#1E5E41] dark:text-[#4ADE80]">
                    Rs. 2,400 (56%)
                  </span>
                </div>
              </div>

              <button
                type="button"
                id="sidebar-view-transport-btn"
                onClick={() => {
                  onClose();
                  onNavigateTab('pool');
                }}
                className="w-full py-2 px-3 rounded-lg bg-[#FAF7F2] dark:bg-[#2A2824] hover:bg-[#F6F2EB] dark:hover:bg-[#322F2A] border border-[#E8E2D8] dark:border-[#383530] font-bold text-xs text-[#1F1E1B] dark:text-[#F5F3EF] flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <span>{isNe ? 'साझा ढुवानीमा हेर्नुहोस्' : 'View on Home'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </section>

            {/* SECTION 11: ⚙️ Account / Farm Settings */}
            <section
              id="farmer-sidebar-settings"
              className="pt-2 border-t border-[#E8E2D8] dark:border-[#383530] space-y-2.5"
            >
              <button
                type="button"
                id="sidebar-edit-farm-data-btn"
                onClick={() => {
                  onClose();
                  onEditFarmData();
                }}
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#1F1E1B] dark:bg-[#FAF7F2] hover:bg-[#2D2B27] dark:hover:bg-[#FFFFFF] text-white dark:text-[#1F1E1B] font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isNe ? 'खेत विवरण सम्पादन गर्नुहोस् (Edit Farm Data)' : 'Edit Farm Data'}</span>
              </button>

              {onLogout && (
                <button
                  type="button"
                  id="sidebar-logout-btn"
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-400 font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isNe ? 'लगआउट गर्नुहोस् (Sign Out / Logout)' : 'Logout'}</span>
                </button>
              )}
            </section>
          </div>

          {/* FOOTER BAR */}
          <div
            id="farmer-sidebar-footer"
            className="p-3 bg-white dark:bg-[#22201D] border-t border-[#E8E2D8] dark:border-[#383530] flex items-center justify-between text-[11px] text-[#746F68] dark:text-[#A6A096] shrink-0"
          >
            <span>{isNe ? 'कृषिसेतु ड्यासबोर्ड' : 'KrishiSetu Dashboard'}</span>
            <span className="font-editorial-mono">v2.4</span>
          </div>
        </div>
      </aside>
    </div>
  );
};
