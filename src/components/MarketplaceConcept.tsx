import React, { useState, useEffect, useMemo } from 'react';
import {
  Store,
  MapPin,
  Search,
  Phone,
  ArrowRight,
  CheckCircle2,
  Plus,
  X,
  Tag,
  Check,
  Building2,
  Layers,
  Users,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MarketplaceListing, AuthUser, UserProfile } from '../types/krishi';
import { KrishiApi } from '../services/krishiApi';
import { DISTRICT_LIST, COMMODITY_SEEDS } from '../data/agriData';
import { FarmRecordsService } from '../services/farmRecordsService';
import { useLanguage } from '../context/LanguageContext';

interface MarketplaceConceptProps {
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  authUser?: AuthUser;
  userProfile?: UserProfile;
  onNavigateToSell?: (cropId: string) => void;
}

export interface DirectBuyer {
  id: string;
  nameEn: string;
  nameNe: string;
  cropId: string;
  volumeKg: number;
  rate: number;
  distanceKm: number;
  locationEn: string;
  locationNe: string;
  diffVsMandi: number;
  typeEn: string;
  typeNe: string;
  phone: string;
}

function getWhatsAppUrl(phone: string, text: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  const normalized = digits.startsWith('977') ? digits : digits.length === 10 ? `977${digits}` : digits;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`;
}

function getTelUrl(phone: string): string {
  const digits = (phone || '').replace(/[^\d+]/g, '');
  return `tel:${digits}`;
}

export const MarketplaceConcept: React.FC<MarketplaceConceptProps> = ({
  selectedDistrict,
  setSelectedDistrict,
  authUser,
  userProfile,
  onNavigateToSell,
}) => {
  const { language } = useLanguage();
  const isNe = language === 'ne';

  const [activeTab, setActiveTab] = useState<'buyers' | 'listings'>('listings');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCropFilter, setSelectedCropFilter] = useState<string>('all');
  const [listingFilterTab, setListingFilterTab] = useState<'all' | 'my' | 'others'>('all');
  const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(null);
  const [contactSuccessBuyer, setContactSuccessBuyer] = useState<string | null>(null);

  // New Listing Form Modal / State
  const [isNewListingOpen, setIsNewListingOpen] = useState<boolean>(false);
  const [newCropId, setNewCropId] = useState<string>('tomato');
  const [newQuantityKg, setNewQuantityKg] = useState<number>(300);
  const [newAskingPrice, setNewAskingPrice] = useState<number>(44);
  const [newQualityGrade, setNewQualityGrade] = useState<'Grade A' | 'Grade B' | 'Organic Certified'>('Grade A');
  const [newLocation, setNewLocation] = useState<string>(
    userProfile?.locality || userProfile?.municipality || `${selectedDistrict.toUpperCase()} Hub`
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Direct Buyers matching Home Page
  const buyersList: DirectBuyer[] = useMemo(() => {
    return [
      {
        id: 'buyer-1',
        nameEn: 'Kathmandu Fresh Mart',
        nameNe: 'काठमाडौँ ताजा मार्ट',
        cropId: 'tomato',
        volumeKg: 450,
        rate: 48,
        distanceKm: 4.2,
        locationEn: 'Bharatpur-10',
        locationNe: 'भरतपुर-१०',
        diffVsMandi: 4,
        typeEn: 'Supermarket Chain',
        typeNe: 'सुपरमार्केट सञ्जाल',
        phone: '+977 9855012345',
      },
      {
        id: 'buyer-2',
        nameEn: 'Himalayan Kitchens',
        nameNe: 'हिमालयन किचेन',
        cropId: 'potato',
        volumeKg: 600,
        rate: 42,
        distanceKm: 6.8,
        locationEn: 'Sauraha Road',
        locationNe: 'सौराह रोड',
        diffVsMandi: 5,
        typeEn: 'Restaurant Network',
        typeNe: 'रेस्टुरेन्ट सञ्जाल',
        phone: '+977 9855023456',
      },
      {
        id: 'buyer-3',
        nameEn: 'Narayangarh Agro-Hub',
        nameNe: 'नारायणगढ एग्रो-हब',
        cropId: 'onion',
        volumeKg: 1200,
        rate: 62,
        distanceKm: 3.1,
        locationEn: 'Pulchowk Mandi',
        locationNe: 'पुलचोक मन्डी',
        diffVsMandi: 4,
        typeEn: 'Wholesale Depot',
        typeNe: 'थोक डिपो',
        phone: '+977 9855034567',
      },
      {
        id: 'buyer-4',
        nameEn: 'Everest Cold Chain Processing',
        nameNe: 'एभरेष्ट कोल्ड चेन',
        cropId: 'cauliflower',
        volumeKg: 800,
        rate: 38,
        distanceKm: 9.5,
        locationEn: 'Industrial Estate',
        locationNe: 'औद्योगिक क्षेत्र',
        diffVsMandi: 4,
        typeEn: 'Processing Plant',
        typeNe: 'प्रशोधन केन्द्र',
        phone: '+977 9855045678',
      },
      {
        id: 'buyer-5',
        nameEn: 'Trishuli Valley Fresh',
        nameNe: 'त्रिशूली भ्याली फ्रेस',
        cropId: 'cabbage',
        volumeKg: 500,
        rate: 28,
        distanceKm: 12.0,
        locationEn: 'Highway Junction',
        locationNe: 'राजमार्ग चोक',
        diffVsMandi: 3,
        typeEn: 'Wholesale Distributor',
        typeNe: 'थोक वितरक',
        phone: '+977 9855056789',
      },
    ];
  }, []);

  // Filtered Buyers
  const filteredBuyers = useMemo(() => {
    return buyersList.filter((b) => {
      const matchCrop = selectedCropFilter === 'all' || b.cropId === selectedCropFilter;
      const matchSearch =
        !searchQuery.trim() ||
        b.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.nameNe.includes(searchQuery) ||
        b.locationEn.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCrop && matchSearch;
    });
  }, [buyersList, selectedCropFilter, searchQuery]);

  // Farmer listings with Cross-User Sync
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchListings = async () => {
    try {
      const data = await KrishiApi.getMarketplaceListings({
        cropId: selectedCropFilter === 'all' ? undefined : selectedCropFilter,
        district: selectedDistrict,
      });
      setListings(data);
    } catch (err) {
      console.warn('Failed fetching marketplace listings:', err);
    }
  };

  useEffect(() => {
    fetchListings();

    // Auto-poll every 5 seconds so new listings posted by other users/sessions appear in real time
    const interval = setInterval(fetchListings, 5000);

    // Cross-user event listener for instant local broadcast
    const handleUpdateEvent = (e: any) => {
      const newLot = e.detail;
      if (newLot) {
        setListings((prev) => [newLot, ...prev.filter((l) => l.id !== newLot.id)]);
      }
    };
    window.addEventListener('krishi_marketplace_updated', handleUpdateEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener('krishi_marketplace_updated', handleUpdateEvent);
    };
  }, [selectedCropFilter, selectedDistrict]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchListings();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    const seed = COMMODITY_SEEDS.find((s) => s.id === newCropId) || COMMODITY_SEEDS[0];
    const farmerName = authUser?.name || userProfile?.name || 'Nepali Farmer';
    const farmerPhone = authUser?.phone || userProfile?.phone || '+977 9845012345';
    const farmerId = authUser?.id || `usr_farmer_${Date.now()}`;
    const district = selectedDistrict.toLowerCase();
    const village = newLocation || userProfile?.locality || userProfile?.municipality || `${selectedDistrict.toUpperCase()} Center`;
    const municipality = userProfile?.municipality || `${selectedDistrict.toUpperCase()} Ward 4`;

    const newLot: MarketplaceListing = {
      id: `lot-${Date.now()}`,
      cropId: newCropId,
      crop: newCropId,
      cropName: seed.name,
      nepaliName: seed.nepaliName,
      emoji: seed.emoji,
      farmerId,
      farmerName,
      farmerPhone,
      village,
      municipality,
      district,
      quantityKg: newQuantityKg,
      availableKg: newQuantityKg,
      askingPricePerKg: newAskingPrice,
      pricePerKg: newAskingPrice,
      marketWholesalePrice: Math.round(newAskingPrice * 1.05),
      harvestWindow: 'Ready for Immediate Pickup',
      readyStatus: 'ready_now',
      qualityGrade: newQualityGrade || 'Grade A',
      verified: true,
      rating: 5.0,
      reviewsCount: 1,
      pickupHub: village,
      description: `${newQuantityKg}kg fresh ${seed.name} (${seed.nepaliName}) directly harvested in ${village}. Ready for bulk pickup.`,
      status: 'active',
      allowPooling: true,
      created_at: new Date().toISOString(),
    };

    // Save to backend & broadcast so others see it immediately
    const saved = await KrishiApi.createMarketplaceListing(newLot);

    // Update local state immediately
    setListings((prev) => [saved, ...prev.filter((l) => l.id !== saved.id)]);
    setIsNewListingOpen(false);

    FarmRecordsService.addRecord({
      crop: newCropId,
      cropName: `${seed.name} (${seed.nepaliName})`,
      record_type: 'revenue',
      amount: Math.round(newQuantityKg * newAskingPrice),
      source: 'manual',
      quantityKg: newQuantityKg,
      note: `Published Harvest Lot: ${newQuantityKg}kg @ Rs ${newAskingPrice}/kg (${farmerName})`,
    });

    setToastMessage(
      isNe
        ? `तपाईंको ${seed.nepaliName} लट हाटबजारमा प्रकाशित भयो (सबै प्रयोगकर्ताले देख्न सक्छन्)`
        : `Your ${seed.name} lot has been published to all buyers and farmers!`
    );
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-6 font-sans text-[#1F1E1B] dark:text-[#F5F3EF]">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#1F1E1B] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-[#4ADE80] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2D8] dark:border-[#383530]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] dark:bg-[#262421] text-[#8C6237] dark:text-[#D9B591] border border-[#E8E2D8] dark:border-[#383530] flex items-center justify-center shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#1F1E1B] dark:text-[#F5F3EF]">
            {isNe ? 'बजार' : 'Marketplace'}
          </h1>
        </div>

        {/* Action & District Controls */}
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

          <button
            type="button"
            onClick={() => setIsNewListingOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-[#2E7D5A] hover:bg-[#246648] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isNe ? 'नयाँ लट' : 'New Listing'}</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Segmented View Control */}
        <div className="flex items-center p-1 rounded-xl bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('buyers')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'buyers'
                ? 'bg-white dark:bg-[#1E1D1B] text-[#1F1E1B] dark:text-[#F5F3EF] shadow-xs'
                : 'text-[#746F68] dark:text-[#A6A096]'
            }`}
          >
            {isNe ? 'खरिददारहरू' : 'Buyers'} ({filteredBuyers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'listings'
                ? 'bg-white dark:bg-[#1E1D1B] text-[#1F1E1B] dark:text-[#F5F3EF] shadow-xs'
                : 'text-[#746F68] dark:text-[#A6A096]'
            }`}
          >
            {isNe ? 'बालीहरू' : 'Listings'} ({listings.length})
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#22201D] px-3 py-1.5 rounded-xl border border-[#E8E2D8] dark:border-[#383530] text-xs flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#746F68] dark:text-[#A6A096]" />
          <input
            type="text"
            placeholder={isNe ? 'खोजी...' : 'Search...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-[#1F1E1B] dark:text-[#F5F3EF] focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="cursor-pointer">
              <X className="w-3.5 h-3.5 text-[#746F68] dark:text-[#A6A096]" />
            </button>
          )}
        </div>
      </div>

      {/* Crop Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
        <button
          type="button"
          onClick={() => setSelectedCropFilter('all')}
          className={`px-3 py-1 rounded-lg text-xs font-bold border transition cursor-pointer shrink-0 ${
            selectedCropFilter === 'all'
              ? 'bg-[#1F1E1B] text-white dark:bg-[#F5F3EF] dark:text-[#1F1E1B] border-[#1F1E1B]'
              : 'bg-white dark:bg-[#22201D] text-[#746F68] dark:text-[#A6A096] border-[#E8E2D8] dark:border-[#383530]'
          }`}
        >
          {isNe ? 'सबै' : 'All'}
        </button>
        {COMMODITY_SEEDS.map((seed) => (
          <button
            key={seed.id}
            type="button"
            onClick={() => setSelectedCropFilter(seed.id)}
            className={`px-3 py-1 rounded-lg text-xs font-bold border transition cursor-pointer shrink-0 ${
              selectedCropFilter === seed.id
                ? 'bg-[#1F1E1B] text-white dark:bg-[#F5F3EF] dark:text-[#1F1E1B] border-[#1F1E1B]'
                : 'bg-white dark:bg-[#22201D] text-[#746F68] dark:text-[#A6A096] border-[#E8E2D8] dark:border-[#383530]'
            }`}
          >
            {isNe ? seed.nepaliName : seed.name}
          </button>
        ))}
      </div>

      {/* VIEW 1: DIRECT BUYERS (Matching Home Page CARD B) */}
      {activeTab === 'buyers' && (
        <div className="space-y-4">
          {contactSuccessBuyer && (
            <div className="p-3 rounded-xl bg-[#EAF3EE] dark:bg-[#1E3327] text-[#2E7D5A] dark:text-[#4ADE80] text-xs sm:text-sm font-bold flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>
                  {isNe ? `सम्पर्क कल जोडिँदै: ${contactSuccessBuyer}` : `Calling ${contactSuccessBuyer}...`}
                </span>
              </div>
              <button
                onClick={() => setContactSuccessBuyer(null)}
                className="cursor-pointer text-sm font-black px-1"
              >
                ✕
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredBuyers.map((buyer) => {
              const isExpanded = selectedBuyerId === buyer.id;
              return (
                <div
                  key={buyer.id}
                  onClick={() => setSelectedBuyerId(isExpanded ? null : buyer.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isExpanded
                      ? 'bg-white dark:bg-[#22201D] border-[#C8A27C] shadow-sm ring-1 ring-[#C8A27C]/30'
                      : 'bg-white dark:bg-[#22201D] border-[#E8E2D8] dark:border-[#383530] hover:border-[#C8A27C]/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#FAF7F2] dark:bg-[#262421] text-[#8C6237] dark:text-[#D9B591] border border-[#E8E2D8] dark:border-[#383530]">
                        <Store className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-sm sm:text-base text-[#1F1E1B] dark:text-[#F5F3EF] truncate">
                          {isNe ? buyer.nameNe : buyer.nameEn}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#545048] dark:text-[#C5BFB5] mt-0.5">
                          <span>{buyer.volumeKg} kg</span>
                          <span>·</span>
                          <span>{buyer.distanceKm} km</span>
                          <span>·</span>
                          <span className="truncate">{isNe ? buyer.locationNe : buyer.locationEn}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-black text-sm sm:text-base text-[#8C6237] dark:text-[#D9B591]">
                        Rs {buyer.rate}/kg
                      </span>
                      <span className="text-[11px] text-[#2E7D5A] dark:text-[#4ADE80] font-bold block">
                        +Rs {buyer.diffVsMandi}/kg
                      </span>
                    </div>
                  </div>

                  {/* Expanded Actions & Contact Info */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-[#E8E2D8] dark:border-[#383530] flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-[#1F1E1B] dark:text-[#F5F3EF]">
                          {isNe ? buyer.typeNe : buyer.typeEn}
                        </span>
                        <span className="text-[#746F68] dark:text-[#A6A096] font-mono block">
                          {buyer.phone}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={getTelUrl(buyer.phone)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setContactSuccessBuyer(isNe ? buyer.nameNe : buyer.nameEn);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#2E7D5A] hover:bg-[#246648] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition active:scale-[0.98]"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{isNe ? 'कल' : 'Call'}</span>
                        </a>
                        <a
                          href={getWhatsAppUrl(
                            buyer.phone,
                            isNe
                              ? `नमस्ते ${buyer.nameNe}, म KrishiSetu मार्फत ${buyer.volumeKg} kg ${buyer.cropId} बिक्रीका लागि सम्पर्क गर्दैछु। दर: रु ${buyer.rate}/kg।`
                              : `Hello ${buyer.nameEn}, I am contacting you via KrishiSetu regarding supply of ${buyer.volumeKg}kg ${buyer.cropId} at Rs ${buyer.rate}/kg.`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition active:scale-[0.98]"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: FARMER LOTS */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {/* Filter Bar for Listings & Live Sync Indicator */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#22201D] p-3 rounded-2xl border border-[#E8E2D8] dark:border-[#383530] shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <span className="text-[#746F68] dark:text-[#A6A096] mr-1 hidden sm:inline">
                {isNe ? 'लट प्रकार:' : 'Filter:'}
              </span>
              <button
                type="button"
                onClick={() => setListingFilterTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  listingFilterTab === 'all'
                    ? 'bg-[#2E7D5A] text-white shadow-xs'
                    : 'bg-[#FAF7F2] dark:bg-[#262421] text-[#6B655B] dark:text-[#A6A096] hover:text-[#1F1E1B]'
                }`}
              >
                {isNe ? `सबै लटहरू (${listings.length})` : `All Lots (${listings.length})`}
              </button>
              <button
                type="button"
                onClick={() => setListingFilterTab('my')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  listingFilterTab === 'my'
                    ? 'bg-[#2E7D5A] text-white shadow-xs'
                    : 'bg-[#FAF7F2] dark:bg-[#262421] text-[#6B655B] dark:text-[#A6A096] hover:text-[#1F1E1B]'
                }`}
              >
                {isNe ? 'तपाईंको लट (My)' : 'My Lots'}
              </button>
              <button
                type="button"
                onClick={() => setListingFilterTab('others')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  listingFilterTab === 'others'
                    ? 'bg-[#2E7D5A] text-white shadow-xs'
                    : 'bg-[#FAF7F2] dark:bg-[#262421] text-[#6B655B] dark:text-[#A6A096] hover:text-[#1F1E1B]'
                }`}
              >
                {isNe ? 'अन्य किसानका लट (Others)' : 'Other Farmers'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#2E7D5A] dark:text-[#4ADE80] bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 px-2.5 py-1 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{isNe ? 'प्रत्यक्ष प्रसारण सक्रिय' : 'Cross-User Sync Active'}</span>
              </div>
              <button
                type="button"
                onClick={handleManualRefresh}
                title="Refresh listings"
                className="p-1.5 rounded-xl bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] text-[#746F68] hover:text-[#1F1E1B] transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#2E7D5A]' : ''}`} />
              </button>
            </div>
          </div>

          {/* Listings Grid */}
          {(() => {
            const filteredList = listings.filter((lot) => {
              const isMyLot =
                (lot.farmerId && lot.farmerId === authUser?.id) ||
                (lot.farmerPhone && lot.farmerPhone === authUser?.phone);
              if (listingFilterTab === 'my') return isMyLot;
              if (listingFilterTab === 'others') return !isMyLot;
              return true;
            });

            if (filteredList.length === 0) {
              return (
                <div className="bg-white dark:bg-[#22201D] p-10 rounded-2xl border border-[#E8E2D8] dark:border-[#383530] text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] dark:bg-[#262421] text-[#746F68] flex items-center justify-center mx-auto">
                    <Store className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-sm text-[#1F1E1B] dark:text-[#F5F3EF]">
                    {listingFilterTab === 'my'
                      ? isNe
                        ? 'तपाईंले अहिलेसम्म कुनै लट राख्नुभएको छैन'
                        : 'You haven’t posted any lots yet'
                      : isNe
                      ? 'कुनै लट फेला परेन'
                      : 'No listings found'}
                  </h4>
                  <p className="text-xs text-[#746F68] dark:text-[#A6A096] max-w-sm mx-auto">
                    {listingFilterTab === 'my'
                      ? isNe
                        ? 'नयाँ लट राख्नुहोस्, अन्य सबै किसान र खरिददारहरूले तुरुन्तै देख्नेछन्।'
                        : 'Click "नयाँ लट" above to post a lot. It will appear for all users instantly.'
                      : isNe
                      ? 'बाली वा जिल्ला फिल्टर परिवर्तन गर्नुहोस्।'
                      : 'Try changing crop or district filters.'}
                  </p>
                  {listingFilterTab === 'my' && (
                    <button
                      type="button"
                      onClick={() => setIsNewListingOpen(true)}
                      className="px-4 py-2 rounded-xl bg-[#2E7D5A] hover:bg-[#246648] text-white text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isNe ? 'पहिलो लट प्रकाशित गर्नुहोस्' : 'Post Your First Lot'}</span>
                    </button>
                  )}
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredList.map((lot) => {
                  const isMyLot =
                    (lot.farmerId && lot.farmerId === authUser?.id) ||
                    (lot.farmerPhone && lot.farmerPhone === authUser?.phone);
                  const totalValue = (lot.quantityKg || 0) * (lot.askingPricePerKg || lot.pricePerKg || 0);

                  return (
                    <div
                      key={lot.id}
                      className={`bg-white dark:bg-[#22201D] p-4 rounded-2xl border transition shadow-xs space-y-3 ${
                        isMyLot
                          ? 'border-[#2E7D5A] dark:border-[#2E7D5A]/80 ring-1 ring-[#2E7D5A]/20'
                          : 'border-[#E8E2D8] dark:border-[#383530]'
                      }`}
                    >
                      {/* Header with Crop & Ownership Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{lot.emoji || '🌾'}</span>
                          <div>
                            <div className="font-black text-sm text-[#1F1E1B] dark:text-[#F5F3EF]">
                              {isNe ? lot.nepaliName || lot.cropName : lot.cropName}
                            </div>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FAF7F2] dark:bg-[#262421] text-[#746F68] dark:text-[#A6A096] border border-[#E8E2D8]/60 dark:border-[#383530]">
                              {lot.qualityGrade || 'Grade A'}
                            </span>
                          </div>
                        </div>

                        {/* Owner Badge vs Verified Farmer */}
                        {isMyLot ? (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#2E7D5A] text-white shadow-2xs">
                            {isNe ? 'तपाईंको लट' : 'Your Lot'}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            {lot.farmerName}
                          </span>
                        )}
                      </div>

                      {/* Price & Volume Cards */}
                      <div className="p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#262421] text-xs space-y-1.5 font-mono">
                        <div className="flex justify-between items-center text-[#746F68] dark:text-[#A6A096]">
                          <span>{isNe ? 'दर' : 'Rate'}:</span>
                          <span className="font-mono font-black text-sm text-[#2E7D5A] dark:text-[#4ADE80]">
                            Rs {lot.askingPricePerKg || lot.pricePerKg}/kg
                          </span>
                        </div>
                        <div className="flex justify-between text-[#746F68] dark:text-[#A6A096]">
                          <span>{isNe ? 'परिमाण' : 'Volume'}:</span>
                          <span className="font-bold text-[#1F1E1B] dark:text-[#F5F3EF]">
                            {lot.quantityKg} kg
                          </span>
                        </div>
                        <div className="flex justify-between text-[#746F68] dark:text-[#A6A096]">
                          <span>{isNe ? 'कुल मूल्य' : 'Total Lot'}:</span>
                          <span className="font-bold text-[#1F1E1B] dark:text-[#F5F3EF]">
                            Rs {totalValue.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-[#746F68] dark:text-[#A6A096]">
                          <span>{isNe ? 'संकलन स्थान' : 'Pickup Hub'}:</span>
                          <span className="truncate max-w-[150px] font-sans font-medium text-[#1F1E1B] dark:text-[#F5F3EF]">
                            {lot.pickupHub || lot.village || lot.location}
                          </span>
                        </div>
                        <div className="flex justify-between text-[#746F68] dark:text-[#A6A096]">
                          <span>{isNe ? 'अवस्था' : 'Window'}:</span>
                          <span className="text-[#2E7D5A] dark:text-[#4ADE80] font-sans font-bold">
                            {lot.harvestWindow || 'Ready Now'}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      {isMyLot ? (
                        <div className="w-full py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-center font-bold text-xs flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isNe ? 'लाइभ छ (अन्य किसानले देखिरहेका छन्)' : 'Active & Visible to All'}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${lot.farmerPhone || '+9779845012345'}`}
                            onClick={() =>
                              setContactSuccessBuyer(
                                isNe
                                  ? `${lot.farmerName} सँग सम्पर्क नम्बर: ${lot.farmerPhone || '९८४५०१२३४५'}`
                                  : `Farmer: ${lot.farmerName} (${lot.farmerPhone || '9845012345'})`
                              )
                            }
                            className="flex-1 py-2 rounded-xl bg-[#2E7D5A] hover:bg-[#246648] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{isNe ? 'फोन सम्पर्क' : 'Call Farmer'}</span>
                          </a>

                          <a
                            href={getWhatsAppUrl(
                              lot.farmerPhone || '+9779845012345',
                              isNe
                                ? `नमस्ते ${lot.farmerName} ज्यू, म तपाईंको KrishiSetu मा राखिएको ${lot.quantityKg} kg ${lot.nepaliName || lot.cropName} (रु ${lot.askingPricePerKg || lot.pricePerKg}/kg) खरिद गर्न चाहन्छु। संकलन स्थान: ${lot.pickupHub || lot.village}।`
                                : `Hello ${lot.farmerName}, I want to purchase your ${lot.quantityKg}kg ${lot.cropName} listed on KrishiSetu at Rs ${lot.askingPricePerKg || lot.pricePerKg}/kg.`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer shadow-2xs"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* NEW LISTING MODAL */}
      <AnimatePresence>
        {isNewListingOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-[#22201D] rounded-2xl border border-[#E8E2D8] dark:border-[#383530] p-5 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D8] dark:border-[#383530]">
                <div>
                  <h2 className="font-black text-base text-[#1F1E1B] dark:text-[#F5F3EF]">
                    {isNe ? 'नयाँ बाली लट प्रकाशित गर्नुहोस्' : 'Publish New Produce Lot'}
                  </h2>
                  <p className="text-[11px] text-[#746F68] dark:text-[#A6A096]">
                    {isNe
                      ? 'तपाईंले प्रकाशित गरेको लट अन्य सबै किसान तथा खरिददारले तुरुन्तै देख्नेछन्'
                      : 'All other farmers and buyers will see this listing in real time'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewListingOpen(false)}
                  className="cursor-pointer text-[#746F68] dark:text-[#A6A096]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateListing} className="space-y-3 text-xs">
                {/* Farmer identity preview */}
                <div className="p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#2E7D5A]/10 text-[#2E7D5A] flex items-center justify-center">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-[#1F1E1B] dark:text-[#F5F3EF]">
                        {authUser?.name || userProfile?.name || 'Nepali Farmer'}
                      </div>
                      <div className="text-[10px] text-[#746F68] dark:text-[#A6A096]">
                        {authUser?.phone || userProfile?.phone || '+977 9845012345'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white dark:bg-[#1E1D1B] border border-[#E8E2D8] text-[#2E7D5A]">
                    {selectedDistrict.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#746F68] dark:text-[#A6A096]">
                    {isNe ? 'बाली' : 'Crop'}
                  </label>
                  <select
                    value={newCropId}
                    onChange={(e) => setNewCropId(e.target.value)}
                    className="w-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] rounded-xl px-3 py-2 font-bold text-[#1F1E1B] dark:text-[#F5F3EF] focus:outline-none cursor-pointer"
                  >
                    {COMMODITY_SEEDS.map((s) => (
                      <option key={s.id} value={s.id} className="dark:bg-[#1E1D1B]">
                        {isNe ? `${s.emoji} ${s.nepaliName} (${s.name})` : `${s.emoji} ${s.name}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#746F68] dark:text-[#A6A096]">
                      {isNe ? 'परिमाण (केजी)' : 'Quantity (kg)'}
                    </label>
                    <input
                      type="number"
                      min={10}
                      step={50}
                      value={newQuantityKg}
                      onChange={(e) => setNewQuantityKg(Number(e.target.value) || 0)}
                      className="w-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] rounded-xl px-3 py-2 font-mono font-bold text-[#1F1E1B] dark:text-[#F5F3EF] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#746F68] dark:text-[#A6A096]">
                      {isNe ? 'माग दर (रु/केजी)' : 'Asking Price (Rs/kg)'}
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={newAskingPrice}
                      onChange={(e) => setNewAskingPrice(Number(e.target.value) || 0)}
                      className="w-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] rounded-xl px-3 py-2 font-mono font-bold text-[#1F1E1B] dark:text-[#F5F3EF] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Quality Grade */}
                <div className="space-y-1">
                  <label className="font-bold text-[#746F68] dark:text-[#A6A096]">
                    {isNe ? 'गुणस्तर स्तर (Quality Grade)' : 'Quality Grade'}
                  </label>
                  <select
                    value={newQualityGrade}
                    onChange={(e) => setNewQualityGrade(e.target.value as any)}
                    className="w-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] rounded-xl px-3 py-2 font-bold text-[#1F1E1B] dark:text-[#F5F3EF] focus:outline-none cursor-pointer"
                  >
                    <option value="Grade A">Grade A (उत्कृष्ट - समान आकार र रङ)</option>
                    <option value="Grade B">Grade B (मध्यम)</option>
                    <option value="Organic Certified">Organic Certified (प्राङ्गारिक प्रमाणीकरण)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#746F68] dark:text-[#A6A096]">
                    {isNe ? 'संकलन केन्द्र वा ठेगाना' : 'Pickup Hub or Village'}
                  </label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] rounded-xl px-3 py-2 font-bold text-[#1F1E1B] dark:text-[#F5F3EF] focus:outline-none"
                  />
                </div>

                {/* Live total lot calculation */}
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex justify-between items-center text-xs font-mono">
                  <span className="text-[#6B655B] font-sans font-bold">
                    {isNe ? 'अनुमानित कुल आम्दानी:' : 'Estimated Total Value:'}
                  </span>
                  <span className="font-black text-sm text-[#2E7D5A] dark:text-[#4ADE80]">
                    Rs {(newQuantityKg * newAskingPrice).toLocaleString()}
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#2E7D5A] hover:bg-[#246648] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs active:scale-[0.99] mt-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{isNe ? 'हाटबजारमा प्रकाशित गर्नुहोस्' : 'Publish Lot to Marketplace'}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MarketplaceConcept;
