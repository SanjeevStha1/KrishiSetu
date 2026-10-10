import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Truck,
  Sparkles,
} from 'lucide-react';
import { Commodity, UserProfile } from '../types/krishi';
import { FarmerMarketPrices } from './FarmerMarketPrices';
import { FarmerSellSmart } from './FarmerSellSmart';
import { DISTRICT_LIST } from '../data/agriData';
import { useLanguage } from '../context/LanguageContext';

interface FarmerMarketAndSellProps {
  commodities: Commodity[];
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  initialCropId?: string;
  initialSubTab?: 'prices' | 'sell';
  userProfile?: UserProfile;
  onJoinPool?: (poolId: string, volumeKg: number, pickupLocation: string) => void;
}

export const FarmerMarketAndSell: React.FC<FarmerMarketAndSellProps> = ({
  commodities,
  selectedDistrict,
  setSelectedDistrict,
  initialCropId = 'tomato',
  initialSubTab = 'prices',
  userProfile,
  onJoinPool,
}) => {
  const { t, language } = useLanguage();
  const [subTab, setSubTab] = useState<'prices' | 'sell'>(initialSubTab);
  const [activeCropId, setActiveCropId] = useState<string>(initialCropId);

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  useEffect(() => {
    if (initialCropId) {
      setActiveCropId(initialCropId);
    }
  }, [initialCropId]);

  const handleNavigateToSellFromPrices = (cropId: string) => {
    setActiveCropId(cropId);
    setSubTab('sell');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full space-y-6 pb-16 font-sans text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-200">
      {/* Top Combined Switcher Header */}
      <div className="bg-white dark:bg-[#131E32] rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 text-xs font-extrabold uppercase tracking-wide mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('market.tagKalimati', 'Kalimati Data & Shared Logistics')}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
              {language === 'ne' ? 'कालीमाटी बजार मूल्य तथा ढुवानी' : 'Market Prices & Shared Freight'}
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 mt-0.5 font-medium">
              {language === 'ne'
                ? 'दैनिक कालीमाटी थोक दर हेर्नुहोस् र ५५% सस्तो साझा ढुवानी गाडी बुक गर्नुहोस्।'
                : 'Check live mandi price trends and immediately lock in a solo sale or share a freight truck with nearby farmers.'}
            </p>
          </div>

          {/* Sub-tab pills */}
          <div className="flex items-center bg-[#F8FAFC] dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0 self-start sm:self-auto shadow-2xs">
            <button
              type="button"
              onClick={() => setSubTab('prices')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                subTab === 'prices'
                  ? 'bg-[#0F172A] dark:bg-blue-600 text-white shadow-sm font-extrabold'
                  : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
              }`}
            >
              <TrendingUp className={`w-4 h-4 ${subTab === 'prices' ? 'text-white' : 'text-[#2563EB] dark:text-blue-400'}`} />
              <span>{t('market.tabPrices', '1. Mandi Prices & Graphs')}</span>
            </button>
            <button
              type="button"
              onClick={() => setSubTab('sell')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                subTab === 'sell'
                  ? 'bg-[#2563EB] dark:bg-emerald-600 text-white shadow-sm font-extrabold'
                  : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>{t('market.tabSell', '2. Sell & Pool Freight')}</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                  subTab === 'sell' ? 'bg-white/25 text-white' : 'bg-[#ECFDF5] dark:bg-emerald-950 text-[#065F46] dark:text-emerald-400'
                }`}
              >
                Save 55%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Render Selected Sub-Module */}
      {subTab === 'prices' ? (
        <div className="space-y-6">
          <FarmerMarketPrices
            commodities={commodities}
            selectedDistrict={selectedDistrict}
            setSelectedDistrict={setSelectedDistrict}
            initialSelectedCropId={activeCropId}
            onNavigateToSell={handleNavigateToSellFromPrices}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <FarmerSellSmart
            commodities={commodities}
            selectedDistrict={selectedDistrict}
            setSelectedDistrict={setSelectedDistrict}
            initialCropId={activeCropId}
            userProfile={userProfile}
            onJoinPool={onJoinPool}
          />
        </div>
      )}
    </div>
  );
};
