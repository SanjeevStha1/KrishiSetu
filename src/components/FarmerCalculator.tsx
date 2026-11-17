import React, { useState, useMemo, useEffect } from 'react';
import {
  Calculator as CalcIcon,
  MapPin,
  Truck,
  ArrowRight,
  Calendar,
  Layers,
  Percent,
  Search,
  ChevronDown,
  ChevronUp,
  Plus,
} from 'lucide-react';
import { UserProfile } from '../types/krishi';
import { DISTRICT_LIST, COMMODITY_SEEDS } from '../data/agriData';
import { getKalimatiCurrentPrice } from '../data/kalimatiDataset';
import { useLanguage } from '../context/LanguageContext';
import {
  marketApi,
  KalimatiBulletinItem,
  RegionalCropPrice,
  NationalMandiHub,
} from '../api/marketApi';

interface FarmerCalculatorProps {
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  onNavigateToSell?: (cropId: string) => void;
  userProfile?: UserProfile;
  initialCropId?: string;
}

type CropCategoryFilter = 'all' | 'vegetable' | 'fruit' | 'spice' | 'exotic' | 'other';

interface CalculatorCropOption {
  id: string;
  baseCropId?: string;
  name: string;
  nepaliName: string;
  emoji: string;
  category: 'vegetable' | 'fruit' | 'spice' | 'exotic' | 'other';
  unit: string;
  kalimatiPrice: number;
  districtPrice: number;
  priceSource: 'official_kalimati' | 'coop_verified' | 'ampis_calibrated' | 'benchmark';
  isCoreSeed: boolean;
}

const getCategoryEmoji = (category?: string, name?: string): string => {
  const lower = (name || '').toLowerCase();
  if (lower.includes('apple') || lower.includes('स्याउ')) return '🍎';
  if (lower.includes('banana') || lower.includes('केरा')) return '🍌';
  if (lower.includes('mango') || lower.includes('आँप')) return '🥭';
  if (lower.includes('orange') || lower.includes('mandarin') || lower.includes('सुन्तला')) return '🍊';
  if (lower.includes('grape') || lower.includes('अंगुर')) return '🍇';
  if (lower.includes('watermelon') || lower.includes('तरबुजा')) return '🍉';
  if (lower.includes('pineapple') || lower.includes('भुईकटहर')) return '🍍';
  if (lower.includes('lemon') || lower.includes('lime') || lower.includes('कागती')) return '🍋';
  if (lower.includes('kiwi') || lower.includes('किवी')) return '🥝';
  if (lower.includes('avocado') || lower.includes('एभोकाडो')) return '🥑';
  if (lower.includes('broccoli') || lower.includes('ब्रोकाउली')) return '🥦';
  if (lower.includes('corn') || lower.includes('मकै')) return '🌽';
  if (lower.includes('mushroom') || lower.includes('च्याउ')) return '🍄';
  if (lower.includes('garlic') || lower.includes('लसुन')) return '🧄';
  if (lower.includes('ginger') || lower.includes('अदुवा')) return '🫚';
  if (lower.includes('chilli') || lower.includes('chili') || lower.includes('खुर्सानी')) return '🌶️';
  if (lower.includes('tomato') || lower.includes('गोलभेडा')) return '🍅';
  if (lower.includes('potato') || lower.includes('आलु')) return '🥔';
  if (lower.includes('onion') || lower.includes('प्याज')) return '🧅';
  if (lower.includes('carrot') || lower.includes('गाजर')) return '🥕';
  if (lower.includes('cucumber') || lower.includes('काँक्रो')) return '🥒';
  if (lower.includes('brinjal') || lower.includes('भन्टा')) return '🍆';
  if (lower.includes('pumpkin') || lower.includes('फर्सी')) return '🎃';

  switch (category) {
    case 'fruit':
      return '🍎';
    case 'spice':
      return '🌶️';
    case 'exotic':
      return '🥦';
    case 'other':
      return '🌾';
    default:
      return '🥬';
  }
};

const getSeedCategory = (cat: string, id: string): CalculatorCropOption['category'] => {
  if (cat === 'spices' || ['garlic', 'ginger', 'chilli'].includes(id)) return 'spice';
  if (cat === 'exotic' || ['mushroom', 'capsicum'].includes(id)) return 'exotic';
  return 'vegetable';
};

export const FarmerCalculator: React.FC<FarmerCalculatorProps> = ({
  selectedDistrict,
  setSelectedDistrict,
  onNavigateToSell,
  initialCropId = 'tomato',
}) => {
  const { language } = useLanguage();
  const isNe = language === 'ne';

  // Live API Data State
  const [bulletinItems, setBulletinItems] = useState<KalimatiBulletinItem[]>([]);
  const [regionalPrices, setRegionalPrices] = useState<RegionalCropPrice[]>([]);
  const [districtHubInfo, setDistrictHubInfo] = useState<NationalMandiHub | null>(null);
  const [ampisRatio, setAmpisRatio] = useState<number>(1);
  const [isLoadingMarket, setIsLoadingMarket] = useState<boolean>(false);

  // Crop Picker Controls
  const [selectedCropId, setSelectedCropId] = useState<string>(initialCropId || 'tomato');
  const [cropSearch, setCropSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<CropCategoryFilter>('all');
  const [showAllCrops, setShowAllCrops] = useState<boolean>(false);
  const [isCustomCropMode, setIsCustomCropMode] = useState<boolean>(false);
  const [customCropName, setCustomCropName] = useState<string>('');

  // Financial Parameters State
  const [quantityInput, setQuantityInput] = useState<string>('500');
  const [salePriceInput, setSalePriceInput] = useState<string>(() =>
    String(Math.round(getKalimatiCurrentPrice(initialCropId || 'tomato')))
  );
  const [productionCostInput, setProductionCostInput] = useState<string>('16');
  const [hasCustomPriceEdit, setHasCustomPriceEdit] = useState<boolean>(false);
  const [transportMode, setTransportMode] = useState<'pooled' | 'solo'>('pooled');

  const getCropProductionCost = (cropId: string, refPrice: number) => {
    const clean = (cropId || '').toLowerCase();
    switch (clean) {
      case 'tomato':
        return 16;
      case 'potato':
        return 12;
      case 'onion':
        return 15;
      case 'cauliflower':
        return 18;
      case 'cabbage':
        return 14;
      case 'capsicum':
        return 22;
      case 'chilli':
      case 'green_chilli':
        return 40;
      default:
        return Math.max(8, Math.round(refPrice * 0.35));
    }
  };

  // Fetch full 116+ Kalimati bulletin once
  useEffect(() => {
    let active = true;
    marketApi
      .getFullBulletin()
      .then((res) => {
        if (active && res.success && Array.isArray(res.items)) {
          setBulletinItems(res.items);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Fetch district-calibrated regional prices whenever district changes
  useEffect(() => {
    let active = true;
    setIsLoadingMarket(true);
    marketApi
      .getRegionalPrices(selectedDistrict || 'chitwan')
      .then((res) => {
        if (!active) return;
        if (res.success) {
          setRegionalPrices(Array.isArray(res.prices) ? res.prices : []);
          setDistrictHubInfo(res.district || null);
          setAmpisRatio(res.ampisHub?.overallRatioVsKalimati || res.district?.ampisRatio || 1);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setIsLoadingMarket(false);
      });
    return () => {
      active = false;
    };
  }, [selectedDistrict]);

  // Sync if navigated from another screen with a target cropId
  useEffect(() => {
    if (initialCropId) {
      setSelectedCropId(initialCropId);
      setIsCustomCropMode(false);
      setHasCustomPriceEdit(false);
    }
  }, [initialCropId]);

  // Build full unified crop catalog (23 core benchmark crops + all 116+ live Kalimati bulletin crops)
  const catalogCrops = useMemo<CalculatorCropOption[]>(() => {
    const regionalByCropId = new Map<string, RegionalCropPrice>();
    for (const rp of regionalPrices) {
      regionalByCropId.set(rp.cropId.toLowerCase(), rp);
    }

    const items: CalculatorCropOption[] = [];
    const seenPrimaryIds = new Set<string>();

    // 1. Core benchmark seeds (with historical seasonality + district AMPIS calibration)
    for (const seed of COMMODITY_SEEDS) {
      const rp = regionalByCropId.get(seed.id.toLowerCase());
      const kalimatiFallback = Math.round(getKalimatiCurrentPrice(seed.id));
      const kalimatiPrice = rp ? Math.round(rp.kalimatiPrice) : kalimatiFallback;
      const districtPrice = rp
        ? Math.round(rp.localizedWholesalePrice)
        : Math.round(kalimatiFallback * ampisRatio);

      seenPrimaryIds.add(seed.id.toLowerCase());
      items.push({
        id: seed.id,
        baseCropId: seed.id,
        name: seed.name,
        nepaliName: seed.nepaliName,
        emoji: seed.emoji || '🌱',
        category: getSeedCategory(seed.category, seed.id),
        unit: 'kg',
        kalimatiPrice,
        districtPrice,
        priceSource: rp?.priceSource || 'benchmark',
        isCoreSeed: true,
      });
    }

    // 2. All 116+ live Kalimati scraped bulletin varieties & fruits/spices/exotics
    const seenNames = new Set(items.map((i) => i.name.toLowerCase()));
    bulletinItems.forEach((b, idx) => {
      const displayEn = (b.nameEn || b.rawName || '').trim();
      const displayNe = (b.rawName || displayEn).trim();
      if (!displayEn && !displayNe) return;

      // Skip if exact same name already covered
      if (seenNames.has(displayEn.toLowerCase())) return;
      seenNames.add(displayEn.toLowerCase());

      const slug = displayEn
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
      const uniqueId =
        b.commodityId && !seenPrimaryIds.has(b.commodityId.toLowerCase())
          ? b.commodityId
          : `kalimati_${slug || idx}_${idx}`;

      const unitLower = (b.unitEn || b.unit || 'kg').toLowerCase();
      const unitLabel = unitLower.includes('dozen') || unitLower.includes('दर्जन')
        ? 'dozen'
        : unitLower.includes('piece') || unitLower.includes('गोटा')
        ? 'pc'
        : 'kg';

      const kPrice = Math.round(b.avgPrice || (b.minPrice + b.maxPrice) / 2 || 50);
      const dPrice =
        selectedDistrict.toLowerCase() === 'kathmandu'
          ? kPrice
          : Math.max(5, Math.round(kPrice * ampisRatio));

      items.push({
        id: uniqueId,
        baseCropId: b.commodityId,
        name: displayEn || displayNe,
        nepaliName: displayNe || displayEn,
        emoji: getCategoryEmoji(b.category, `${displayEn} ${displayNe}`),
        category: b.category || 'vegetable',
        unit: unitLabel,
        kalimatiPrice: kPrice,
        districtPrice: dPrice,
        priceSource:
          selectedDistrict.toLowerCase() === 'kathmandu'
            ? 'official_kalimati'
            : 'ampis_calibrated',
        isCoreSeed: false,
      });
    });

    return items;
  }, [bulletinItems, regionalPrices, ampisRatio, selectedDistrict]);

  // Filtered crops based on search & category
  const filteredCrops = useMemo(() => {
    const q = cropSearch.trim().toLowerCase();
    return catalogCrops.filter((crop) => {
      if (categoryFilter !== 'all' && crop.category !== categoryFilter) {
        return false;
      }
      if (!q) return true;
      return (
        crop.name.toLowerCase().includes(q) ||
        crop.nepaliName.toLowerCase().includes(q) ||
        crop.id.toLowerCase().includes(q)
      );
    });
  }, [catalogCrops, cropSearch, categoryFilter]);

  const displayedGridCrops = useMemo(() => {
    if (cropSearch.trim() || categoryFilter !== 'all' || showAllCrops) {
      return filteredCrops;
    }
    return filteredCrops.slice(0, 12);
  }, [filteredCrops, cropSearch, categoryFilter, showAllCrops]);

  const activeCrop = useMemo(() => {
    return (
      catalogCrops.find((s) => s.id === selectedCropId) ||
      catalogCrops[0]
    );
  }, [catalogCrops, selectedCropId]);

  const defaultPrice = activeCrop ? activeCrop.districtPrice : 50;
  const activeUnit = isCustomCropMode ? 'kg' : activeCrop?.unit || 'kg';

  // Auto-sync sale price to live district price when district or crop loads (unless user typed custom price)
  useEffect(() => {
    if (!isCustomCropMode && !hasCustomPriceEdit && activeCrop) {
      setSalePriceInput(String(activeCrop.districtPrice));
      setProductionCostInput(
        String(getCropProductionCost(activeCrop.baseCropId || activeCrop.id, activeCrop.districtPrice))
      );
    }
  }, [activeCrop, isCustomCropMode, hasCustomPriceEdit]);

  // Handlers
  const handleQuantityChange = (val: string) => {
    if (val === '' || /^\d+$/.test(val)) {
      setQuantityInput(val);
    }
  };

  const handleSalePriceChange = (val: string) => {
    if (val === '' || /^\d*(\.\d{0,2})?$/.test(val)) {
      setHasCustomPriceEdit(true);
      setSalePriceInput(val);
    }
  };

  const handleProductionCostChange = (val: string) => {
    if (val === '' || /^\d*(\.\d{0,2})?$/.test(val)) {
      setHasCustomPriceEdit(true);
      setProductionCostInput(val);
    }
  };

  const handleCropChange = (cropId: string) => {
    if (cropId === '__custom__') {
      setIsCustomCropMode(true);
      setHasCustomPriceEdit(true);
      return;
    }
    setIsCustomCropMode(false);
    setHasCustomPriceEdit(false);
    setSelectedCropId(cropId);
    const chosen = catalogCrops.find((c) => c.id === cropId);
    if (chosen) {
      setSalePriceInput(String(chosen.districtPrice));
      setProductionCostInput(
        String(getCropProductionCost(chosen.baseCropId || chosen.id, chosen.districtPrice))
      );
    }
  };

  const quantityKg = parseFloat(quantityInput) || 0;
  const salePrice = parseFloat(salePriceInput) || 0;
  const productionCostPerKg = parseFloat(productionCostInput) || 0;

  // District-aware freight rates (uses 77-district mandi registry when loaded)
  const soloTransportRate = districtHubInfo?.soloFreightPerKg
    ? Number(districtHubInfo.soloFreightPerKg.toFixed(1))
    : 7.8;
  const pooledTransportRate = districtHubInfo?.pooledFreightPerKg
    ? Number(districtHubInfo.pooledFreightPerKg.toFixed(1))
    : 2.5;
  const currentTransportRate = transportMode === 'pooled' ? pooledTransportRate : soloTransportRate;

  // Math calculations
  const totalRevenue = Math.round(quantityKg * salePrice);
  const totalProductionCost = Math.round(quantityKg * productionCostPerKg);
  const totalTransportCost = Math.round(quantityKg * currentTransportRate);
  const totalCosts = totalProductionCost + totalTransportCost;
  const netProfit = totalRevenue - totalCosts;
  const marginPct = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;
  const netPerUnit = quantityKg > 0 ? Math.round(netProfit / quantityKg) : 0;

  // Pooling comparison
  const soloTotalTransport = Math.round(quantityKg * soloTransportRate);
  const pooledTotalTransport = Math.round(quantityKg * pooledTransportRate);
  const transportSavings = Math.max(0, soloTotalTransport - pooledTotalTransport);
  const poolingDiscountPct =
    soloTransportRate > 0
      ? Math.round(((soloTransportRate - pooledTransportRate) / soloTransportRate) * 100)
      : 68;

  // 3-Day Projection Matrix
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

  const activeCropTitle = isCustomCropMode
    ? customCropName.trim() || (isNe ? 'अन्य बाली' : 'Custom Crop')
    : isNe
    ? activeCrop?.nepaliName
    : activeCrop?.name;

  const categoryCounts = useMemo(() => {
    return {
      all: catalogCrops.length,
      vegetable: catalogCrops.filter((c) => c.category === 'vegetable').length,
      fruit: catalogCrops.filter((c) => c.category === 'fruit').length,
      spice: catalogCrops.filter((c) => c.category === 'spice').length,
      exotic: catalogCrops.filter((c) => c.category === 'exotic').length,
    };
  }, [catalogCrops]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-6 font-sans text-[#1F1E1B] dark:text-[#F5F3EF]">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2D8] dark:border-[#383530]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] dark:bg-[#262421] text-[#2E7D5A] dark:text-[#4ADE80] border border-[#E8E2D8] dark:border-[#383530] flex items-center justify-center shrink-0">
            <CalcIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#1F1E1B] dark:text-[#F5F3EF]">
              {isNe ? 'क्याल्कुलेटर' : 'Calculator'}
            </h1>
            <p className="text-[11px] text-[#746F68] dark:text-[#A6A096]">
              {isNe
                ? `${catalogCrops.length}+ बाली र ७७ जिल्लाको मन्डी दरमा आधारित`
                : `Live rates across ${catalogCrops.length}+ commodities & 77 districts`}
            </p>
          </div>
        </div>

        {/* District & Rate Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-[#FAF7F2] dark:bg-[#262421] px-3 py-1.5 rounded-lg border border-[#E8E2D8] dark:border-[#383530] text-xs">
            <MapPin className="w-3.5 h-3.5 text-[#C8A27C] dark:text-[#D9B591]" />
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setHasCustomPriceEdit(false);
                setSelectedDistrict(e.target.value);
              }}
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
            {activeCropTitle}: Rs {salePrice}/{activeUnit}
            {isLoadingMarket ? ' …' : ''}
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
              <span className="text-[11px] font-mono font-bold text-[#746F68] dark:text-[#A6A096]">
                {filteredCrops.length} {isNe ? 'बालीहरू' : 'crops'}
              </span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Crop Selector (Full Searchable 116+ Live Kalimati & Regional Catalog + Custom Crop) */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="font-bold text-[#746F68] dark:text-[#A6A096]">
                    {isNe ? 'बाली छान्नुहोस् (कालीमाटी र क्षेत्रीय)' : 'Select Crop (All Live Mandi Crops)'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (isCustomCropMode) {
                        handleCropChange(selectedCropId || 'tomato');
                      } else {
                        handleCropChange('__custom__');
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                      isCustomCropMode
                        ? 'bg-[#2E7D5A] text-white border-[#2E7D5A]'
                        : 'bg-[#FAF7F2] dark:bg-[#262421] text-[#2E7D5A] dark:text-[#4ADE80] border-[#E8E2D8] dark:border-[#383530] hover:border-[#2E7D5A]'
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>{isNe ? 'अन्य बाली' : 'Custom Crop'}</span>
                  </button>
                </div>

                {isCustomCropMode ? (
                  <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#262421] border border-[#2E7D5A]/40 space-y-2">
                    <label className="block text-[11px] font-bold text-[#1F1E1B] dark:text-[#F5F3EF]">
                      {isNe ? 'आफ्नो बालीको नाम लेख्नुहोस्' : 'Enter Custom Crop Name'}
                    </label>
                    <input
                      type="text"
                      value={customCropName}
                      onChange={(e) => setCustomCropName(e.target.value)}
                      placeholder={isNe ? 'उदा: अलैंची, किवी, फापर...' : 'e.g. Cardamom, Kiwi, Millet, Orange...'}
                      className="w-full px-3 py-2 rounded-lg border border-[#D5CEC2] dark:border-[#383530] bg-white dark:bg-[#1E1D1B] text-xs font-bold text-[#1F1E1B] dark:text-[#F5F3EF] focus:outline-none focus:border-[#2E7D5A]"
                    />
                  </div>
                ) : (
                  <>
                    {/* Search + Quick Full Dropdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-[#746F68] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={cropSearch}
                          onChange={(e) => setCropSearch(e.target.value)}
                          placeholder={
                            isNe
                              ? '११६+ बाली खोज्नुहोस् (स्याउ, केरा, ब्रोकाउली...)'
                              : 'Search 116+ crops (Apple, Banana, Broccoli...)'
                          }
                          className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] text-xs font-medium text-[#1F1E1B] dark:text-[#F5F3EF] focus:outline-none focus:border-[#2E7D5A]"
                        />
                      </div>

                      <select
                        aria-label="All crops selector"
                        value={selectedCropId}
                        onChange={(e) => handleCropChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] text-xs font-bold text-[#1F1E1B] dark:text-[#F5F3EF] focus:outline-none focus:border-[#2E7D5A] cursor-pointer"
                      >
                        {filteredCrops.map((crop) => (
                          <option
                            key={crop.id}
                            value={crop.id}
                            className="dark:bg-[#1C1A18] dark:text-[#F5F3EF]"
                          >
                            {crop.emoji} {isNe ? crop.nepaliName : crop.name} — Rs {crop.districtPrice}/{crop.unit}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Category Filter Tabs */}
                    <div className="flex flex-wrap gap-1.5">
                      {(
                        [
                          { id: 'all', en: `All (${categoryCounts.all})`, ne: `सबै (${categoryCounts.all})` },
                          { id: 'vegetable', en: `Vegetables (${categoryCounts.vegetable})`, ne: `तरकारी (${categoryCounts.vegetable})` },
                          { id: 'fruit', en: `Fruits (${categoryCounts.fruit})`, ne: `फलफूल (${categoryCounts.fruit})` },
                          { id: 'spice', en: `Spices (${categoryCounts.spice})`, ne: `मसला (${categoryCounts.spice})` },
                          { id: 'exotic', en: `Exotic (${categoryCounts.exotic})`, ne: `अन्य/च्याउ (${categoryCounts.exotic})` },
                        ] as { id: CropCategoryFilter; en: string; ne: string }[]
                      ).map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategoryFilter(cat.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                            categoryFilter === cat.id
                              ? 'bg-[#2E7D5A] text-white border-[#2E7D5A]'
                              : 'bg-[#FAF7F2] dark:bg-[#262421] text-[#746F68] dark:text-[#A6A096] border-[#E8E2D8] dark:border-[#383530] hover:border-[#2E7D5A]/50'
                          }`}
                        >
                          {isNe ? cat.ne : cat.en}
                        </button>
                      ))}
                    </div>

                    {/* Scrollable Crop Grid */}
                    <div className="max-h-56 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {displayedGridCrops.map((crop) => {
                        const isSelected = selectedCropId === crop.id;
                        return (
                          <button
                            key={crop.id}
                            type="button"
                            onClick={() => handleCropChange(crop.id)}
                            title={`${crop.name} (${crop.nepaliName}) — Rs ${crop.districtPrice}/${crop.unit}`}
                            className={`p-2 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'bg-[#1F1E1B] text-white dark:bg-[#F5F3EF] dark:text-[#1F1E1B] border-[#1F1E1B] dark:border-[#F5F3EF] shadow-xs'
                                : 'bg-[#FAF7F2] dark:bg-[#262421] text-[#1F1E1B] dark:text-[#F5F3EF] border-[#E8E2D8] dark:border-[#383530] hover:bg-white dark:hover:bg-[#1E1D1B]'
                            }`}
                          >
                            <span className="font-bold text-[11px] leading-tight line-clamp-1">
                              {crop.emoji} {isNe ? crop.nepaliName : crop.name}
                            </span>
                            <span
                              className={`text-[10px] font-mono mt-0.5 ${
                                isSelected
                                  ? 'text-emerald-300 dark:text-emerald-700'
                                  : 'text-[#2E7D5A] dark:text-[#4ADE80]'
                              }`}
                            >
                              Rs {crop.districtPrice}/{crop.unit}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {!cropSearch.trim() && categoryFilter === 'all' && filteredCrops.length > 12 && (
                      <button
                        type="button"
                        onClick={() => setShowAllCrops((prev) => !prev)}
                        className="w-full py-1.5 rounded-lg bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] text-[11px] font-bold text-[#2E7D5A] dark:text-[#4ADE80] hover:bg-white dark:hover:bg-[#1E1D1B] transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        {showAllCrops ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" />
                            <span>{isNe ? 'कम बाली देखाउनुहोस्' : 'Show top 12 crops'}</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" />
                            <span>
                              {isNe
                                ? `सबै ${filteredCrops.length} बालीहरू देखाउनुहोस्`
                                : `Show all ${filteredCrops.length} live commodities`}
                            </span>
                          </>
                        )}
                      </button>
                    )}

                    {filteredCrops.length === 0 && (
                      <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#262421] text-center text-xs text-[#746F68] dark:text-[#A6A096]">
                        {isNe
                          ? 'यो नामको बाली भेटिएन। "अन्य बाली" बाट थप्न सक्नुहुन्छ।'
                          : 'No matching commodity found. Click "Custom Crop" above to calculate any crop.'}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Quantity */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#746F68] dark:text-[#A6A096]">
                    {isNe ? `परिमाण (${activeUnit})` : `Quantity (${activeUnit})`}
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
                      {isNe ? `बिक्री दर (रु/${activeUnit})` : `Sale Price (Rs/${activeUnit})`}
                    </label>
                    {!isCustomCropMode && (
                      <button
                        type="button"
                        onClick={() => {
                          setHasCustomPriceEdit(false);
                          setSalePriceInput(String(defaultPrice));
                        }}
                        className="text-[10px] font-bold text-[#2D6CDF] hover:underline cursor-pointer"
                      >
                        {isNe ? 'मन्डी दर' : 'Mandi Rate'}
                      </button>
                    )}
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
                      {isNe ? `उत्पादन लागत (रु/${activeUnit})` : `Production Cost (Rs/${activeUnit})`}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setHasCustomPriceEdit(false);
                        setProductionCostInput(
                          String(
                            getCropProductionCost(
                              activeCrop?.baseCropId || selectedCropId,
                              defaultPrice
                            )
                          )
                        );
                      }}
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
                        -{poolingDiscountPct}%
                      </span>
                    </div>
                    <span className="font-mono font-black text-sm text-[#2E7D5A] dark:text-[#4ADE80] block mt-0.5">
                      Rs {pooledTransportRate}/{activeUnit}
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
                      Rs {soloTransportRate}/{activeUnit}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3-DAY PROJECTION MATRIX */}
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
                        Rs {row.projectedPrice}/{activeUnit}
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
              <span
                className={`font-mono font-black text-2xl sm:text-3xl block ${
                  netProfit >= 0
                    ? 'text-[#2E7D5A] dark:text-[#4ADE80]'
                    : 'text-[#C4381C] dark:text-[#FF8A73]'
                }`}
              >
                Rs {netProfit.toLocaleString()}
              </span>
              <span className="text-[11px] text-[#746F68] dark:text-[#A6A096] block">
                Rs {netPerUnit}/{activeUnit} {isNe ? 'खुद नाफा' : `net per ${activeUnit}`}
              </span>
            </div>

            {/* Financial Breakdown Table */}
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-[#E8E2D8] dark:border-[#383530]">
                <span className="text-[#746F68] dark:text-[#A6A096]">
                  {isNe ? 'कुल बिक्री' : 'Revenue'} ({quantityKg} {activeUnit} × Rs {salePrice})
                </span>
                <span className="font-bold text-[#1F1E1B] dark:text-[#F5F3EF]">
                  Rs {totalRevenue.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#E8E2D8] dark:border-[#383530]">
                <span className="text-[#746F68] dark:text-[#A6A096]">
                  {isNe ? 'उत्पादन लागत' : 'Production'} ({quantityKg} {activeUnit} × Rs {productionCostPerKg})
                </span>
                <span className="font-bold text-[#C4381C] dark:text-[#FF8A73]">
                  -Rs {totalProductionCost.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#E8E2D8] dark:border-[#383530]">
                <span className="text-[#746F68] dark:text-[#A6A096]">
                  {isNe ? 'ढुवानी' : 'Transport'} ({quantityKg} {activeUnit} × Rs {currentTransportRate})
                </span>
                <span className="font-bold text-[#C4381C] dark:text-[#FF8A73]">
                  -Rs {totalTransportCost.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between py-1 text-sm font-bold pt-1.5">
                <span className="text-[#1F1E1B] dark:text-[#F5F3EF]">
                  {isNe ? 'खुद नाफा' : 'Net Returns'}
                </span>
                <span
                  className={
                    netProfit >= 0
                      ? 'text-[#2E7D5A] dark:text-[#4ADE80]'
                      : 'text-[#C4381C] dark:text-[#FF8A73]'
                  }
                >
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
                    Rs {pooledTransportRate}/{activeUnit} vs Rs {soloTransportRate}/{activeUnit}
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
              onClick={() =>
                onNavigateToSell &&
                onNavigateToSell(activeCrop?.baseCropId || selectedCropId || 'tomato')
              }
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
