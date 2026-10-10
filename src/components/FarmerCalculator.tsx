import React, { useState, useMemo } from 'react';
import {
  Calculator as CalcIcon,
  MapPin,
  TrendingUp,
  Truck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  Percent,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types/krishi';
import { DISTRICT_LIST, COMMODITY_SEEDS } from '../data/agriData';
import { getKalimatiCrop, getKalimatiCurrentPrice } from '../data/kalimatiDataset';
import { useLanguage } from '../context/LanguageContext';

interface FarmerCalculatorProps {
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  onNavigateToSell?: (cropId: string) => void;
  userProfile?: UserProfile;
  initialCropId?: string;
}

export const FarmerCalculator: React.FC<FarmerCalculatorProps> = ({
  selectedDistrict,
  setSelectedDistrict,
  onNavigateToSell,
  userProfile,
  initialCropId = 'tomato',
}) => {
  const { language } = useLanguage();
  const isNe = language === 'ne';

  const currentDistrictObj = useMemo(() => {
    return (
      DISTRICT_LIST.find((d) => d.id.toLowerCase() === selectedDistrict.toLowerCase()) ||
      DISTRICT_LIST[0]
    );
  }, [selectedDistrict]);

  // Parameters State
  const [selectedCropId, setSelectedCropId] = useState<string>(initialCropId);
  const [quantityInput, setQuantityInput] = useState<string>('500');

  // Selected crop benchmark
  const activeCrop = useMemo(() => {
    return (
      COMMODITY_SEEDS.find((s) => s.id === selectedCropId) || COMMODITY_SEEDS[0]
    );
  }, [selectedCropId]);

  // Financial State (Calibrated directly to Kalimati dataset)
  const defaultPrice = useMemo(() => {
    return Math.round(getKalimatiCurrentPrice(selectedCropId));
  }, [selectedCropId]);

  const getCropProductionCost = (cropId: string) => {
    const baseP = getKalimatiCurrentPrice(cropId);
    switch (cropId) {
      case 'tomato': return 16;
      case 'potato': return 12;
      case 'onion': return 15;
      case 'cauliflower': return 18;
      case 'cabbage': return 14;
      case 'capsicum': return 22;
      case 'chilli': case 'green_chilli': return 40;
      default: return Math.max(8, Math.round(baseP * 0.3));
    }
  };

  const [salePriceInput, setSalePriceInput] = useState<string>(() => String(defaultPrice));
  const [productionCostInput, setProductionCostInput] = useState<string>(() => String(getCropProductionCost(initialCropId)));
  const [transportMode, setTransportMode] = useState<'pooled' | 'solo'>('pooled');

  // Regex handlers allowing custom values, empty backspacing, and proper numbers
  const handleQuantityChange = (val: string) => {
    if (val === '' || /^\d+$/.test(val)) {
      setQuantityInput(val);
    }
  };

  const handleSalePriceChange = (val: string) => {
    if (val === '' || /^\d*(\.\d{0,2})?$/.test(val)) {
      setSalePriceInput(val);
    }
  };

  const handleProductionCostChange = (val: string) => {
    if (val === '' || /^\d*(\.\d{0,2})?$/.test(val)) {
      setProductionCostInput(val);
    }
  };

  // Sync sale price when crop changes
  const handleCropChange = (cropId: string) => {
    setSelectedCropId(cropId);
    setSalePriceInput(String(Math.round(getKalimatiCurrentPrice(cropId))));
    setProductionCostInput(String(getCropProductionCost(cropId)));
  };

  const quantityKg = parseFloat(quantityInput) || 0;
  const salePrice = parseFloat(salePriceInput) || 0;
  const productionCostPerKg = parseFloat(productionCostInput) || 0;

  // Transport rates
  const soloTransportRate = 7.8;
  const pooledTransportRate = 2.5;
  const currentTransportRate = transportMode === 'pooled' ? pooledTransportRate : soloTransportRate;

  // Math calculations
  const totalRevenue = Math.round(quantityKg * salePrice);
  const totalProductionCost = Math.round(quantityKg * productionCostPerKg);
  const totalTransportCost = Math.round(quantityKg * currentTransportRate);
  const totalCosts = totalProductionCost + totalTransportCost;
  const netProfit = totalRevenue - totalCosts;
  const marginPct = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  // Pooling comparison
  const soloTotalTransport = Math.round(quantityKg * soloTransportRate);
  const pooledTotalTransport = Math.round(quantityKg * pooledTransportRate);
  const transportSavings = soloTotalTransport - pooledTotalTransport;

  // 3-Day Projection Matrix (Matching Home Page)
  const projectionRows = useMemo(() => {
    return [
      {
        dayLabel: isNe ? 'आज' : 'Today',
        dayKey: 'today',
        projectedPrice: salePrice,
        profitDiff: 0,
        recommendation: isNe ? 'सामान्य' : 'Neutral',
      },
      {
        dayLabel: isNe ? '+१ दिन' : '+1 Day',
        dayKey: '+1d',
        projectedPrice: Math.round(salePrice * 1.04),
        profitDiff: Math.round(quantityKg * (salePrice * 1.04 - salePrice)),
        recommendation: isNe ? 'होल्ड' : 'Hold',
      },
      {
        dayLabel: isNe ? '+२ दिन (उच्च)' : '+2 Days (Peak)',
        dayKey: '+2d',
        projectedPrice: Math.round(salePrice * 1.09),
        profitDiff: Math.round(quantityKg * (salePrice * 1.09 - salePrice)),
        recommendation: isNe ? 'उत्कृष्ट' : 'Optimal',
        highlight: true,
      },
      {
        dayLabel: isNe ? '+३ दिन' : '+3 Days',
        dayKey: '+3d',
        projectedPrice: Math.round(salePrice * 1.02),
        profitDiff: Math.round(quantityKg * (salePrice * 1.02 - salePrice)),
        recommendation: isNe ? 'बिक्री' : 'Sell',
      },
    ];
  }, [salePrice, quantityKg, isNe]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-6 font-sans text-[#1F1E1B] dark:text-[#F5F3EF]">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2D8] dark:border-[#383530]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] dark:bg-[#262421] text-[#2E7D5A] dark:text-[#4ADE80] border border-[#E8E2D8] dark:border-[#383530] flex items-center justify-center shrink-0">
            <CalcIcon className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#1F1E1B] dark:text-[#F5F3EF]">
            {isNe ? 'क्याल्कुलेटर' : 'Calculator'}
          </h1>
        </div>

        {/* District & Rate Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-[#FAF7F2] dark:bg-[#262421] px-3 py-1.5 rounded-lg border border-[#E8E2D8] dark:border-[#383530] text-xs">
            <MapPin className="w-3.5 h-3.5 text-[#C8A27C] dark:text-[#D9B591]" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-transparent font-bold text-[#1F1E1B] dark:text-[#F5F3EF] focus:outline-none cursor-pointer pr-1"
            >
              {DISTRICT_LIST.map((dist) => (
                <option key={dist.id} value={dist.id} className="dark:bg-[#1C1A18] dark:text-[#F5F3EF]">
                  {dist.name}
                </option>
              ))}
            </select>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] text-xs font-bold text-[#2E7D5A] dark:text-[#4ADE80]">
            {isNe ? activeCrop.nepaliName : activeCrop.name}: Rs {salePrice}/kg
          </div>
        </div>
      </div>

      {/* Main Grid: Parameters (Left) & Profit / Returns (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* COLUMN 1: PARAMETERS & PROJECTIONS (Left)                                 */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* PARAMETERS CARD */}
          <div className="bg-white dark:bg-[#22201D] p-5 sm:p-6 rounded-2xl border border-[#E8E2D8] dark:border-[#383530] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D8] dark:border-[#383530]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4 text-[#2E7D5A]" />
                </div>
                <h2 className="text-base sm:text-lg font-black text-[#1F1E1B] dark:text-[#F5F3EF]">
                  {isNe ? 'विवरण' : 'Parameters'}
                </h2>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Crop Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#746F68] dark:text-[#A6A096]">
                  {isNe ? 'बाली' : 'Crop'}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {COMMODITY_SEEDS.map((seed) => {
                    const isSelected = selectedCropId === seed.id;
                    return (
                      <button
                        key={seed.id}
                        type="button"
                        onClick={() => handleCropChange(seed.id)}
                        className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#1F1E1B] text-white dark:bg-[#F5F3EF] dark:text-[#1F1E1B] border-[#1F1E1B] dark:border-[#F5F3EF] shadow-xs'
                            : 'bg-[#FAF7F2] dark:bg-[#262421] text-[#1F1E1B] dark:text-[#F5F3EF] border-[#E8E2D8] dark:border-[#383530] hover:bg-white dark:hover:bg-[#1E1D1B]'
                        }`}
                      >
                        <span className="font-bold text-xs truncate block">
                          {isNe ? seed.nepaliName : seed.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#746F68] dark:text-[#A6A096]">
                    {isNe ? 'परिमाण (केजी)' : 'Quantity (kg)'}
                  </label>
                  <div className="flex items-center gap-1">
                    {[100, 250, 500, 1000].map((qty) => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => setQuantityInput(String(qty))}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition ${
                          quantityInput === String(qty)
                            ? 'bg-[#1F1E1B] text-white dark:bg-[#F5F3EF] dark:text-[#1F1E1B]'
                            : 'bg-[#FAF7F2] dark:bg-[#262421] text-[#746F68] dark:text-[#A6A096]'
                        }`}
                      >
                        {qty}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setQuantityInput('500')}
                      className="text-[10px] font-bold text-[#2D6CDF] hover:underline cursor-pointer ml-1"
                    >
                      {isNe ? 'डिफल्ट' : 'Default'}
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={quantityInput}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  placeholder="500"
                  className="w-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] rounded-xl px-3 py-2 font-mono font-bold text-sm text-[#1F1E1B] dark:text-[#F5F3EF] focus:outline-none"
                />
              </div>

              {/* Sale Price & Production Cost */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[#746F68] dark:text-[#A6A096]">
                      {isNe ? 'बिक्री दर (रु/केजी)' : 'Sale Price (Rs/kg)'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setSalePriceInput(String(defaultPrice))}
                      className="text-[10px] font-bold text-[#2D6CDF] hover:underline cursor-pointer"
                    >
                      {isNe ? 'मन्डी दर' : 'Mandi Rate'}
                    </button>
                  </div>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={salePriceInput}
                    onChange={(e) => handleSalePriceChange(e.target.value)}
                    placeholder="42"
                    className="w-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] rounded-xl px-3 py-2 font-mono font-bold text-xs text-[#1F1E1B] dark:text-[#F5F3EF] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[#746F68] dark:text-[#A6A096]">
                      {isNe ? 'उत्पादन लागत (रु/केजी)' : 'Production Cost (Rs/kg)'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setProductionCostInput(String(getCropProductionCost(selectedCropId)))}
                      className="text-[10px] font-bold text-[#2D6CDF] hover:underline cursor-pointer"
                    >
                      {isNe ? 'डिफल्ट' : 'Default'}
                    </button>
                  </div>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={productionCostInput}
                    onChange={(e) => handleProductionCostChange(e.target.value)}
                    placeholder="16"
                    className="w-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] rounded-xl px-3 py-2 font-mono font-bold text-xs text-[#1F1E1B] dark:text-[#F5F3EF] focus:outline-none"
                  />
                </div>
              </div>

              {/* Transport Mode Toggle */}
              <div className="space-y-1.5 pt-1">
                <label className="font-bold text-[#746F68] dark:text-[#A6A096]">
                  {isNe ? 'ढुवानी' : 'Transport'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTransportMode('pooled')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      transportMode === 'pooled'
                        ? 'bg-[#EAF3EE] dark:bg-[#1E3327] border-[#2E7D5A] dark:border-[#4ADE80] ring-1 ring-[#2E7D5A]/30'
                        : 'bg-[#FAF7F2] dark:bg-[#262421] border-[#E8E2D8] dark:border-[#383530]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#1F1E1B] dark:text-[#F5F3EF]">
                        {isNe ? 'साझा गाडी' : 'Pooled Freight'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-full bg-[#2E7D5A] text-white text-[10px] font-bold">
                        -68%
                      </span>
                    </div>
                    <span className="font-mono font-black text-sm text-[#2E7D5A] dark:text-[#4ADE80] block mt-0.5">
                      Rs {pooledTransportRate}/kg
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTransportMode('solo')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      transportMode === 'solo'
                        ? 'bg-[#FAF7F2] dark:bg-[#262421] border-[#1F1E1B] dark:border-[#F5F3EF] ring-1 ring-[#1F1E1B]/30'
                        : 'bg-[#FAF7F2] dark:bg-[#262421] border-[#E8E2D8] dark:border-[#383530]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#1F1E1B] dark:text-[#F5F3EF]">
                        {isNe ? 'एक्लै गाडी' : 'Solo Truck'}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-sm text-[#746F68] dark:text-[#A6A096] block mt-0.5">
                      Rs {soloTransportRate}/kg
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3-DAY PROJECTION MATRIX (Matching Home Page Feature) */}
          <div className="bg-white dark:bg-[#22201D] p-5 sm:p-6 rounded-2xl border border-[#E8E2D8] dark:border-[#383530] shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D8] dark:border-[#383530]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#2D6CDF]" />
                <h2 className="text-sm sm:text-base font-black text-[#1F1E1B] dark:text-[#F5F3EF]">
                  {isNe ? 'प्रक्षेपण' : 'Projections'}
                </h2>
              </div>
              <span className="text-xs font-bold text-[#2E7D5A] dark:text-[#4ADE80]">
                {isNe ? 'शिखर +२ दिन' : 'Peak in +2 Days'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#E8E2D8] dark:border-[#383530] text-[#746F68] dark:text-[#A6A096]">
                    <th className="text-left py-2">{isNe ? 'दिन' : 'Day'}</th>
                    <th className="text-right py-2">{isNe ? 'दर (रु)' : 'Price'}</th>
                    <th className="text-right py-2">{isNe ? 'अन्तर' : 'Net Diff'}</th>
                    <th className="text-right py-2">{isNe ? 'सुझाव' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2D8] dark:divide-[#383530]">
                  {projectionRows.map((row) => (
                    <tr
                      key={row.dayKey}
                      className={row.highlight ? 'bg-[#EAF3EE]/60 dark:bg-[#1E3327]/60 font-bold' : ''}
                    >
                      <td className="py-2.5 font-sans font-bold text-[#1F1E1B] dark:text-[#F5F3EF]">
                        {row.dayLabel}
                      </td>
                      <td className="py-2.5 text-right font-bold text-[#1F1E1B] dark:text-[#F5F3EF]">
                        Rs {row.projectedPrice}/kg
                      </td>
                      <td className="py-2.5 text-right text-[#2E7D5A] dark:text-[#4ADE80] font-bold">
                        {row.profitDiff > 0 ? `+Rs ${row.profitDiff.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-2.5 text-right">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-bold ${
                            row.highlight
                              ? 'bg-[#2E7D5A] text-white'
                              : 'bg-[#FAF7F2] dark:bg-[#262421] text-[#746F68] dark:text-[#A6A096]'
                          }`}
                        >
                          {row.recommendation}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COLUMN 2: PROFIT & RETURNS (Right)                                        */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          {/* RETURNS CARD */}
          <div className="bg-white dark:bg-[#22201D] p-5 sm:p-6 rounded-2xl border border-[#E8E2D8] dark:border-[#383530] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D8] dark:border-[#383530]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EAF3EE] dark:bg-[#1E3327] text-[#2E7D5A] dark:text-[#4ADE80] flex items-center justify-center font-bold">
                  <Percent className="w-4 h-4" />
                </div>
                <h2 className="text-base sm:text-lg font-black text-[#1F1E1B] dark:text-[#F5F3EF]">
                  {isNe ? 'नाफा' : 'Returns'}
                </h2>
              </div>
              <span className="text-xs font-mono font-bold text-[#2E7D5A] dark:text-[#4ADE80]">
                {marginPct}% {isNe ? 'मार्जिन' : 'Margin'}
              </span>
            </div>

            {/* Big Headline Metric */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] text-center space-y-1">
              <span className="text-xs font-bold text-[#746F68] dark:text-[#A6A096] uppercase tracking-wider block">
                {isNe ? 'खुद आम्दानी' : 'Net Profit'}
              </span>
              <span className="font-mono font-black text-2xl sm:text-3xl text-[#2E7D5A] dark:text-[#4ADE80] block">
                Rs {netProfit.toLocaleString()}
              </span>
              <span className="text-[11px] text-[#746F68] dark:text-[#A6A096] block">
                Rs {Math.round(netProfit / quantityKg)}/kg {isNe ? 'खुद नाफा' : 'net per kg'}
              </span>
            </div>

            {/* Financial Breakdown Table */}
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-[#E8E2D8] dark:border-[#383530]">
                <span className="text-[#746F68] dark:text-[#A6A096]">
                  {isNe ? 'कुल बिक्री' : 'Revenue'} ({quantityKg} kg × Rs {salePrice})
                </span>
                <span className="font-bold text-[#1F1E1B] dark:text-[#F5F3EF]">
                  Rs {totalRevenue.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#E8E2D8] dark:border-[#383530]">
                <span className="text-[#746F68] dark:text-[#A6A096]">
                  {isNe ? 'उत्पादन लागत' : 'Production'} ({quantityKg} kg × Rs {productionCostPerKg})
                </span>
                <span className="font-bold text-[#C4381C] dark:text-[#FF8A73]">
                  -Rs {totalProductionCost.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#E8E2D8] dark:border-[#383530]">
                <span className="text-[#746F68] dark:text-[#A6A096]">
                  {isNe ? 'ढुवानी' : 'Transport'} ({quantityKg} kg × Rs {currentTransportRate})
                </span>
                <span className="font-bold text-[#C4381C] dark:text-[#FF8A73]">
                  -Rs {totalTransportCost.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between py-1 text-sm font-bold pt-1.5">
                <span className="text-[#1F1E1B] dark:text-[#F5F3EF]">
                  {isNe ? 'खुद नाफा' : 'Net Returns'}
                </span>
                <span className="text-[#2E7D5A] dark:text-[#4ADE80]">
                  Rs {netProfit.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Transport Savings Callout */}
            {transportMode === 'pooled' && (
              <div className="p-3 rounded-xl bg-[#EAF3EE] dark:bg-[#1E3327] border border-[#2E7D5A]/30 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#1E5E41] dark:text-[#4ADE80] block">
                    {isNe ? 'साझा गाडी बचत' : 'Freight Savings'}
                  </span>
                  <span className="text-[11px] text-[#1E5E41]/80 dark:text-[#4ADE80]/80">
                    Rs {pooledTransportRate}/kg vs Rs {soloTransportRate}/kg
                  </span>
                </div>
                <span className="font-mono font-black text-sm text-[#1E5E41] dark:text-[#4ADE80]">
                  +Rs {transportSavings.toLocaleString()}
                </span>
              </div>
            )}

            {/* Direct CTA to Transport Pool */}
            <button
              type="button"
              onClick={() => onNavigateToSell && onNavigateToSell(selectedCropId)}
              className="w-full py-2.5 rounded-xl bg-[#2E7D5A] hover:bg-[#246648] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs active:scale-[0.99]"
            >
              <Truck className="w-4 h-4" />
              <span>{isNe ? 'ढुवानी बुक गर्नुहोस्' : 'Book Transport'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerCalculator;
