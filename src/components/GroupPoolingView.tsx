import React, { useState, useMemo } from 'react';
import { GroupSellingPool, UserProfile, SimulatedFarmer, FarmerMatchCluster } from '../types/krishi';
import {
  Users,
  Truck,
  TrendingDown,
  MapPin,
  Calendar,
  CheckCircle2,
  Phone,
  Plus,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  PackageCheck,
  Sparkles,
  Sliders,
  DollarSign,
  Info,
  Navigation,
  Scale,
  Award,
  Layers,
} from 'lucide-react';
import {
  DISTRICT_LIST,
  COMMODITY_SEEDS,
  DEFAULT_USER_PROFILE,
  SIMULATED_FARMERS,
  getFarmerMatchClusters,
} from '../data/agriData';

interface GroupPoolingViewProps {
  pools: GroupSellingPool[];
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  userProfile?: UserProfile;
  onJoinPool: (poolId: string, volumeKg: number, pickupLocation: string) => void;
  onCreatePool: (newPool: GroupSellingPool) => void;
}

export const GroupPoolingView: React.FC<GroupPoolingViewProps> = ({
  pools,
  selectedDistrict,
  setSelectedDistrict,
  userProfile,
  onJoinPool,
  onCreatePool,
}) => {
  const currentProfile = userProfile || DEFAULT_USER_PROFILE;
  const currentUserName = currentProfile?.name || 'Ram Bahadur Thapa';

  const [selectedCropFilter, setSelectedCropFilter] = useState<string>('all');
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);
  const [joinVolume, setJoinVolume] = useState<string>('300');
  const [pickupLocation, setPickupLocation] = useState<string>('Bharatpur-11 Chowk');
  const [isJoinSuccess, setIsJoinSuccess] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Regex handlers for flexible custom inputs
  const handleJoinVolumeChange = (val: string) => {
    if (val === '' || /^\d+$/.test(val)) {
      setJoinVolume(val);
    }
  };

  const handleCapacityChange = (val: string) => {
    if (val === '' || /^\d+$/.test(val)) {
      setNewCapacity(val);
    }
  };

  // Dynamic Pool Size Simulation Slider (1 to 8 farmers)
  const [simulatedFarmerCount, setSimulatedFarmerCount] = useState<number>(5);
  const [selectedFarmerPin, setSelectedFarmerPin] = useState<SimulatedFarmer | null>(null);

  // New pool form state
  const [newCropId, setNewCropId] = useState('tomato');
  const [newDistrict, setNewDistrict] = useState(selectedDistrict);
  const [newMunicipality, setNewMunicipality] = useState('Bharatpur / Ratnanagar');
  const [newTargetMarket, setNewTargetMarket] = useState('Kathmandu Kalimati Central Market');
  const [newDepartureDate, setNewDepartureDate] = useState('2026-03-12 at 04:00 AM');
  const [newCapacity, setNewCapacity] = useState('2500');

  // Match clusters generated from the 200+ simulated farmer database
  const activeClusters = useMemo(() => {
    return getFarmerMatchClusters(
      selectedDistrict,
      selectedCropFilter === 'all' ? undefined : selectedCropFilter
    );
  }, [selectedDistrict, selectedCropFilter]);

  // District metadata
  const currentDistrictObj =
    DISTRICT_LIST.find((d) => d.id.toLowerCase() === selectedDistrict.toLowerCase()) ||
    DISTRICT_LIST[0];
  const distanceToKTM = currentDistrictObj.marketDistKm || 160;

  // Real-time dynamic transport economics based on simulation slider
  const dynamicSoloFreightPerKg = Number(
    Math.min(12.5, Math.max(4.5, distanceToKTM / 20 + 1.2)).toFixed(2)
  );
  // As group size grows from 1 to 8, fixed truck cost (~Rs 12,000) is shared over more kg
  const dynamicTotalKg = Math.round(simulatedFarmerCount * 380);
  const dynamicFixedTruckHire = Math.max(4500, Math.round(distanceToKTM * 65 + 3500));
  const dynamicPooledFreightPerKg = Number(
    (dynamicFixedTruckHire / Math.max(dynamicTotalKg, 1500)).toFixed(2)
  );
  const dynamicSavingsPerKg = Number(
    Math.max(0.5, dynamicSoloFreightPerKg - dynamicPooledFreightPerKg).toFixed(2)
  );
  const dynamicWholesalePrice = 42.0; // Baseline Tomato Kalimati Price
  const dynamicSoloNet = Number((dynamicWholesalePrice - dynamicSoloFreightPerKg).toFixed(2));
  const dynamicPooledNet = Number((dynamicWholesalePrice - dynamicPooledFreightPerKg).toFixed(2));
  const dynamicFarmerExtraGain = Math.round(dynamicSavingsPerKg * 300); // 300kg harvest gain

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoolId) return;
    onJoinPool(selectedPoolId, parseFloat(joinVolume) || 100, pickupLocation);
    setIsJoinSuccess(true);
    setTimeout(() => {
      setIsJoinSuccess(false);
      setSelectedPoolId(null);
    }, 1800);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const seed = COMMODITY_SEEDS.find((s) => s.id === newCropId) || COMMODITY_SEEDS[0];
    const created: GroupSellingPool = {
      id: `pool-${Date.now()}`,
      district: newDistrict,
      municipality: newMunicipality,
      cropId: newCropId,
      cropName: seed?.name || 'Tomato',
      emoji: seed?.emoji || '🌱',
      targetMarket: newTargetMarket,
      harvestWeek: 'Next Week (March 12-14)',
      totalTargetVolumeKg: parseFloat(newCapacity) || 2000,
      currentPooledVolumeKg: parseFloat(joinVolume) || 300,
      participantCount: 1,
      truckType: 'Mahindra Bolero Maxi Truck (2.5 Ton)',
      individualCostPerKg: dynamicSoloFreightPerKg,
      pooledCostPerKg: dynamicPooledFreightPerKg,
      savingsPerKg: dynamicSavingsPerKg,
      status: 'forming',
      organizerName: `${currentUserName} (You)`,
      organizerPhone: currentProfile?.phone || '+977 9845012345',
      departureDate: newDepartureDate,
      participants: [
        {
          id: `p-${Date.now()}`,
          name: `${currentUserName} (Organizer)`,
          volumeKg: parseFloat(joinVolume) || 300,
          phone: currentProfile?.phone || '+977 9845012345',
          pickupLocation,
        },
      ],
    };

    onCreatePool(created);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16 md:pb-8">
      {/* 1. Flagship Positioning Header Card */}
      <div className="bg-[#1A2E22] text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-xl border border-white/5">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-lime-400/20 text-lime-300 border border-lime-400/30 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider mb-3">
            <Users className="w-3.5 h-3.5" /> Flagship Feature • Zero Direct Competitors
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
            Group Selling & Shared Freight Pooling Engine
          </h1>

          <p className="text-xs sm:text-sm text-stone-300 mt-2.5 leading-relaxed">
            Hiring a pickup truck solo for 250kg eats up to <strong>22%</strong> of your harvest revenue in transport fees alone. KrishiSetu clusters neighboring smallholders harvesting within the same ±5 day window, sharing a Mahindra Bolero to slash freight by up to <strong>68%</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-5">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#2E7D4F] hover:bg-[#256640] text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition active:scale-95"
            >
              <Plus className="w-4 h-4" /> Start New Transport Pool
            </button>
            <div className="flex items-center gap-2 text-xs text-lime-300 bg-black/30 px-3.5 py-2 rounded-xl border border-white/10">
              <Sparkles className="w-4 h-4 text-lime-400 shrink-0" />
              <span>
                Matching logic: <strong>district + crop + harvest week (±5 days)</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Decorative Background Truck Graphic */}
        <div className="absolute right-4 -bottom-8 opacity-10 pointer-events-none hidden lg:block text-white">
          <Truck className="w-72 h-72" />
        </div>
      </div>

      {/* 2. THE VISUAL WOW-MOMENT: CENTERPIECE BEFORE/AFTER COMPARISON BAR */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/10 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#2E7D4F] uppercase tracking-wider mb-1">
              <Scale className="w-4 h-4" /> Live Demo Centerpiece
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#1A2E22]">
              "Sell Alone" vs. "Sell Pooled" Freight Comparison
            </h2>
            <p className="text-xs text-[#6B7268] mt-0.5">
              Based on {currentDistrictObj.name} to Kalimati transit ({distanceToKTM} km corridor).
            </p>
          </div>

          {/* Interactive Group Size Slider */}
          <div className="bg-[#F7F5F0] p-3 rounded-2xl border border-black/5 flex flex-col gap-1 min-w-[240px]">
            <div className="flex items-center justify-between text-xs font-bold text-[#1A2E22]">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#2E7D4F]" /> Pool Size Simulator:
              </span>
              <span className="bg-[#2E7D4F] text-white px-2 py-0.5 rounded-full text-[11px] font-black">
                {simulatedFarmerCount} Farmers
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              step="1"
              value={simulatedFarmerCount}
              onChange={(e) => setSimulatedFarmerCount(parseInt(e.target.value))}
              className="w-full accent-[#2E7D4F] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#6B7268]">
              <span>1 (Solo)</span>
              <span>3 (Small)</span>
              <span>5 (Bolero)</span>
              <span>8 (Tata 407)</span>
            </div>
          </div>
        </div>

        {/* The Two Horizontal Comparison Bars */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Selling Alone Bar */}
          <div
            className={`rounded-2xl p-5 border transition-all ${
              simulatedFarmerCount === 1
                ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400'
                : 'bg-stone-50 border-black/5 opacity-80'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-black text-[#C4622D] uppercase tracking-wider">
                  Option A
                </span>
                <h3 className="font-extrabold text-base text-[#1A2E22]">
                  Selling Alone (Solo Charter)
                </h3>
              </div>
              <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full">
                High Overhead
              </span>
            </div>

            {/* Visual Bar Breakdown */}
            <div className="space-y-1.5 my-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B7268]">Transport Freight Cost</span>
                <span className="font-extrabold text-[#C4622D]">
                  Rs. {dynamicSoloFreightPerKg.toFixed(2)} / kg
                </span>
              </div>
              <div className="w-full bg-[#EAE6DF] h-5 rounded-xl overflow-hidden flex">
                <div
                  className="bg-[#C4622D] h-full flex items-center justify-center text-[10px] font-black text-white px-2"
                  style={{
                    width: `${Math.min(
                      100,
                      (dynamicSoloFreightPerKg / dynamicWholesalePrice) * 100 * 2.5
                    )}%`,
                  }}
                >
                  Freight: Rs {dynamicSoloFreightPerKg}/kg
                </div>
                <div className="bg-stone-300 h-full flex-1 flex items-center justify-end text-[10px] font-bold text-stone-700 pr-2">
                  Net Farmgate: Rs {dynamicSoloNet}/kg
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-black/5">
              <div>
                <span className="text-[#6B7268] text-[11px] block">Net Realized Price:</span>
                <span className="font-black text-sm text-[#1A2E22]">Rs. {dynamicSoloNet} / kg</span>
              </div>
              <div>
                <span className="text-[#6B7268] text-[11px] block">Ram's 300kg Transport Fee:</span>
                <span className="font-bold text-sm text-[#C4622D]">
                  Rs. {(dynamicSoloFreightPerKg * 300).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Selling Pooled Bar */}
          <div
            className={`rounded-2xl p-5 border transition-all ${
              simulatedFarmerCount > 1
                ? 'bg-lime-50/80 border-lime-300 ring-2 ring-[#2E7D4F]/40'
                : 'bg-stone-50 border-black/5 opacity-80'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-black text-[#2E7D4F] uppercase tracking-wider">
                  Option B (KrishiSetu Collective)
                </span>
                <h3 className="font-extrabold text-base text-[#1A2E22]">
                  Pooled with {simulatedFarmerCount} Neighbors
                </h3>
              </div>
              <span className="text-xs font-black bg-[#2E7D4F] text-white px-2.5 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-lime-300" /> Save {Math.round((dynamicSavingsPerKg / dynamicSoloFreightPerKg) * 100)}%
              </span>
            </div>

            {/* Visual Bar Breakdown */}
            <div className="space-y-1.5 my-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B7268]">Shared Freight Cost</span>
                <span className="font-black text-[#2E7D4F]">
                  Rs. {dynamicPooledFreightPerKg.toFixed(2)} / kg
                </span>
              </div>
              <div className="w-full bg-[#EAE6DF] h-5 rounded-xl overflow-hidden flex">
                <div
                  className="bg-[#2E7D4F] h-full flex items-center justify-center text-[10px] font-black text-white px-2 transition-all duration-300"
                  style={{
                    width: `${Math.max(
                      12,
                      (dynamicPooledFreightPerKg / dynamicWholesalePrice) * 100 * 2.5
                    )}%`,
                  }}
                >
                  Rs {dynamicPooledFreightPerKg}/kg
                </div>
                <div className="bg-lime-200/80 h-full flex-1 flex items-center justify-end text-[10px] font-black text-[#1A2E22] pr-2">
                  Net Farmgate: Rs {dynamicPooledNet}/kg
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-black/5">
              <div>
                <span className="text-[#6B7268] text-[11px] block">Net Realized Price:</span>
                <span className="font-black text-sm text-[#2E7D4F]">Rs. {dynamicPooledNet} / kg</span>
              </div>
              <div>
                <span className="text-[#6B7268] text-[11px] block">Cash Kept in Ram's Pocket:</span>
                <span className="font-black text-sm text-lime-700 bg-lime-200 px-2 py-0.5 rounded-lg inline-block">
                  +Rs. {dynamicFarmerExtraGain.toLocaleString()} cash!
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Comparison Pitch Highlight */}
        <div className="bg-[#1A2E22] text-white p-4 rounded-2xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-lime-400/20 text-lime-300 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-stone-200">The Live Demo Pitch Line:</span>
              <p className="font-extrabold text-lime-300 text-xs sm:text-sm">
                "Selling alone: Rs. {dynamicSoloFreightPerKg}/kg transport, net Rs. {dynamicSoloNet}/kg. Pooling with {simulatedFarmerCount} neighbors: Rs. {dynamicPooledFreightPerKg}/kg transport, net Rs. {dynamicPooledNet}/kg."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE GEOGRAPHIC CLUSTER MAP & NEIGHBOR MATCH EXPLORER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Corridor Cluster Map */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-black/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#2E7D4F]" />
              <h3 className="font-black text-base text-[#1A2E22]">
                {currentDistrictObj.name} Corridor Dispatch Map
              </h3>
            </div>
            <span className="text-[10px] font-bold text-[#6B7268] bg-[#F7F5F0] px-2.5 py-1 rounded-full">
              GPS Radius: ~12 km
            </span>
          </div>

          <p className="text-xs text-[#6B7268]">
            Interactive pins show smallholders matched within your ward corridor ready to dispatch to Kalimati Terminal Hub.
          </p>

          {/* SVG Map Canvas */}
          <div className="bg-[#1A2E22] rounded-2xl p-4 relative overflow-hidden h-[300px] border border-black/10 shadow-inner flex items-center justify-center">
            {/* Background Grid Lines & Road Corridor */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Highway Route (Prithvi / East-West Highway into Kathmandu) */}
              <path
                d="M 40 240 Q 150 180 220 150 T 360 60"
                fill="none"
                stroke="#2E7D4F"
                strokeWidth="4"
                strokeDasharray="6 4"
                className="opacity-70"
              />

              {/* Central Collection Hub Pin */}
              <circle cx="220" cy="150" r="16" fill="#2E7D4F" opacity="0.3" className="animate-ping" />
              <circle cx="220" cy="150" r="10" fill="#2E7D4F" stroke="#ffffff" strokeWidth="2" />
            </svg>

            {/* Central Hub Label */}
            <div className="absolute top-[138px] left-[235px] bg-[#2E7D4F] text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-md pointer-events-none whitespace-nowrap z-10">
              📍 Central Pickup Hub ({currentDistrictObj.name})
            </div>

            {/* Destination Terminal Tag */}
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-xs text-lime-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-lime-400/30 flex items-center gap-1 z-10">
              <Navigation className="w-3 h-3" /> To Kalimati Mandi ({distanceToKTM} km)
            </div>

            {/* Farmer Pins Positioned with Offsets */}
            <div className="absolute inset-0 pointer-events-auto">
              {SIMULATED_FARMERS.filter(
                (f) => f.district.toLowerCase() === selectedDistrict.toLowerCase()
              )
                .slice(0, 7)
                .map((farmer, idx) => {
                  const pinX = 220 + farmer.lngOffset * 4000;
                  const pinY = 150 + farmer.latOffset * 4000;
                  const isSelected = selectedFarmerPin?.id === farmer.id;

                  return (
                    <button
                      key={farmer.id}
                      onClick={() => setSelectedFarmerPin(farmer)}
                      style={{
                        left: `${Math.min(90, Math.max(10, (pinX / 400) * 100))}%`,
                        top: `${Math.min(85, Math.max(15, (pinY / 300) * 100))}%`,
                      }}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125 z-20 group ${
                        isSelected ? 'scale-125' : ''
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-lg border-2 ${
                          isSelected
                            ? 'bg-lime-400 border-white text-[#1A2E22] ring-4 ring-lime-400/40'
                            : 'bg-white border-[#2E7D4F] text-[#1A2E22]'
                        }`}
                      >
                        {farmer.emoji}
                      </div>

                      {/* Tooltip on pin hover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-black/90 text-white text-[10px] rounded-lg p-2 whitespace-nowrap shadow-xl border border-white/10 z-30 pointer-events-none">
                        <div className="font-extrabold">{farmer.name}</div>
                        <div className="text-stone-300">{farmer.cropName} • {farmer.estYieldKg} kg</div>
                        <div className="text-lime-300 font-bold">{farmer.municipality}</div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Selected Pin Details Box */}
          {selectedFarmerPin ? (
            <div className="bg-[#F7F5F0] rounded-2xl p-3.5 border border-black/10 flex items-center justify-between text-xs animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{selectedFarmerPin.emoji}</span>
                <div>
                  <h4 className="font-bold text-[#1A2E22]">{selectedFarmerPin.name}</h4>
                  <p className="text-[11px] text-[#6B7268]">
                    {selectedFarmerPin.municipality} • {selectedFarmerPin.landSizeRopani} Ropani ({selectedFarmerPin.estYieldKg} kg est.)
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-[#2E7D4F] text-white px-2.5 py-1 rounded-lg">
                Ready in {selectedFarmerPin.daysToHarvest} days
              </span>
            </div>
          ) : (
            <p className="text-[11px] text-[#6B7268] text-center italic">
              Tap any map pin above to inspect individual smallholder yield and pickup location.
            </p>
          )}
        </div>

        {/* Right Column: Live Match Clustering Algorithm Explorer */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-black/10 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#6B7268] uppercase tracking-wider block">
                  Simulated Database Matching (200+ Smallholders)
                </span>
                <h3 className="font-black text-base text-[#1A2E22]">
                  Live Algorithm Cluster Matches
                </h3>
              </div>
              <span className="text-xs font-extrabold text-[#2E7D4F] bg-lime-100 px-2.5 py-1 rounded-full">
                {activeClusters.length} Matched Clusters
              </span>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] font-bold text-[#6B7268] block mb-1">Select District:</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full bg-[#F7F5F0] border border-black/10 px-2.5 py-1.5 rounded-xl font-bold capitalize focus:outline-[#2E7D4F]"
                >
                  {DISTRICT_LIST.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#6B7268] block mb-1">Filter Crop:</label>
                <select
                  value={selectedCropFilter}
                  onChange={(e) => setSelectedCropFilter(e.target.value)}
                  className="w-full bg-[#F7F5F0] border border-black/10 px-2.5 py-1.5 rounded-xl font-bold focus:outline-[#2E7D4F]"
                >
                  <option value="all">All Crops</option>
                  {COMMODITY_SEEDS.slice(0, 10).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clusters List */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {activeClusters.length > 0 ? (
                activeClusters.map((cluster, idx) => (
                  <div
                    key={idx}
                    className="bg-[#F7F5F0] rounded-2xl p-4 border border-black/5 hover:border-[#2E7D4F]/40 transition space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{cluster.emoji}</span>
                        <div>
                          <h4 className="font-extrabold text-sm text-[#1A2E22]">
                            {cluster.cropName} Pooling Group
                          </h4>
                          <span className="text-[11px] text-[#6B7268] flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#2E7D4F]" /> {cluster.expectedHarvestWeek}
                          </span>
                        </div>
                      </div>
                      <span className="bg-[#2E7D4F] text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                        {cluster.farmerCount} Farmers Matched
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-white p-2.5 rounded-xl border border-black/5 text-center text-[11px]">
                      <div>
                        <span className="text-[#6B7268] block text-[10px]">Total Volume</span>
                        <span className="font-bold text-[#1A2E22]">{cluster.totalVolumeKg.toLocaleString()} kg</span>
                      </div>
                      <div>
                        <span className="text-[#6B7268] block text-[10px]">Assigned Vehicle</span>
                        <span className="font-bold text-[#1A2E22]">{cluster.truckType.split('(')[0]}</span>
                      </div>
                      <div>
                        <span className="text-[#6B7268] block text-[10px]">Total Savings</span>
                        <span className="font-black text-[#2E7D4F]">Rs. {cluster.totalGroupSavingsNPR.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#6B7268] space-y-1">
                      <span className="font-bold text-[#1A2E22]">Matched Neighbors:</span>
                      <div className="flex flex-wrap gap-1">
                        {cluster.matchedFarmers.map((f) => (
                          <span
                            key={f.id}
                            className="bg-white border border-black/5 px-2 py-0.5 rounded-md text-[10px] font-medium text-stone-700"
                          >
                            {f.name} ({f.municipality}, {f.estYieldKg}kg)
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-[#6B7268] bg-[#F7F5F0] rounded-2xl">
                  No group pools matched for selected filter. Try switching districts or choosing "All Crops".
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. ACTIVE FORMING POOLS & ACTION CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-[#1A2E22]">
              Active Transport Pools in {currentDistrictObj.name}
            </h2>
            <p className="text-xs text-[#6B7268]">
              Join an existing collective truck or confirm your scheduled dispatch date.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#2E7D4F] hover:bg-[#256640] text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Start New Pool
          </button>
        </div>

        {/* Pools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pools.map((pool) => {
            const fillPct = Math.min(
              100,
              Math.round((pool.currentPooledVolumeKg / pool.totalTargetVolumeKg) * 100)
            );
            const isUserInPool = pool.participants.some((p) => p.name?.includes(currentUserName));

            return (
              <div
                key={pool.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-black/10 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#2E7D4F]/40 transition"
              >
                <div>
                  {/* Card Top */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl">{pool.emoji}</span>
                      <div>
                        <h3 className="font-extrabold text-base text-[#1A2E22]">{pool.cropName}</h3>
                        <span className="text-xs text-[#6B7268] flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#2E7D4F]" /> {pool.municipality}, {pool.district.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                        pool.status === 'ready_to_dispatch'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-lime-100 text-[#2E7D4F]'
                      }`}
                    >
                      {pool.status === 'ready_to_dispatch' ? 'Ready to Dispatch' : 'Forming Group'}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="bg-[#F7F5F0] rounded-2xl p-3.5 space-y-2 text-xs mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[#6B7268]">Destination Mandi</span>
                      <span className="font-bold text-[#1A2E22]">{pool.targetMarket}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6B7268]">Scheduled Departure</span>
                      <span className="font-bold text-[#2E7D4F] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {pool.departureDate}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6B7268]">Assigned Vehicle</span>
                      <span className="font-bold text-[#1A2E22]">{pool.truckType}</span>
                    </div>
                  </div>

                  {/* Fill Bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[#6B7268]">Truck Capacity Filled</span>
                      <span className="text-[#1A2E22]">
                        {pool.currentPooledVolumeKg.toLocaleString()} / {pool.totalTargetVolumeKg.toLocaleString()} KG ({fillPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#EAE6DF] h-3 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          fillPct >= 90 ? 'bg-amber-500' : 'bg-[#2E7D4F]'
                        }`}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-[#6B7268] block">
                      {pool.participantCount} local farmers joined so far
                    </span>
                  </div>

                  {/* Savings Pill */}
                  <div className="bg-lime-50/80 border border-lime-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
                    <span className="text-[#6B7268] font-medium">Solo: Rs {pool.individualCostPerKg.toFixed(2)}</span>
                    <ArrowRight className="w-3 h-3 text-[#2E7D4F]" />
                    <span className="font-black text-[#2E7D4F]">
                      Pooled: Rs {pool.pooledCostPerKg.toFixed(2)}/kg (-Rs {pool.savingsPerKg.toFixed(2)})
                    </span>
                  </div>
                </div>

                {/* Card Action */}
                <div className="pt-2">
                  {isUserInPool ? (
                    <div className="w-full bg-lime-100 text-[#2E7D4F] py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border border-lime-300">
                      <CheckCircle2 className="w-4 h-4" /> You are booked in this pool (
                      {pool.participants.find((p) => p.name?.includes(currentUserName))?.volumeKg ||
                        300}{' '}
                      kg)
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedPoolId(pool.id)}
                      className="w-full bg-[#2E7D4F] hover:bg-[#256640] text-white py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition active:scale-95"
                    >
                      <PackageCheck className="w-4 h-4" /> Join This Pool (Save Rs.{' '}
                      {pool.savingsPerKg.toFixed(2)}/kg)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Join Pool Modal */}
      {selectedPoolId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-[#1A2E22] space-y-4 shadow-2xl border border-black/10">
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <h3 className="font-black text-base">Join Collective Transport Pool</h3>
              <button
                onClick={() => setSelectedPoolId(null)}
                className="text-stone-400 hover:text-stone-600 text-xs font-bold"
              >
                Cancel
              </button>
            </div>

            {isJoinSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-lime-100 text-[#2E7D4F] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base">You have joined the transport pool!</h4>
                <p className="text-xs text-[#6B7268]">
                  The driver and organizer have received your dispatch pickup notice for{' '}
                  <strong>{pickupLocation}</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleJoinSubmit} className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-[#1A2E22]">
                      Your Harvest Volume to Load (KG)
                    </label>
                    <div className="flex items-center gap-1">
                      {[100, 250, 300, 500].map((qty) => (
                        <button
                          key={qty}
                          type="button"
                          onClick={() => setJoinVolume(String(qty))}
                          className="px-1.5 py-0.5 rounded bg-stone-100 text-[10px] font-bold text-stone-700 hover:bg-stone-200"
                        >
                          {qty}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setJoinVolume('300')}
                        className="text-[10px] font-bold text-[#2E7D4F] hover:underline ml-1"
                      >
                        Default
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={joinVolume}
                    onChange={(e) => handleJoinVolumeChange(e.target.value)}
                    placeholder="300"
                    required
                    className="w-full bg-[#F7F5F0] border border-black/10 px-3 py-2.5 rounded-xl font-bold font-mono focus:outline-[#2E7D4F]"
                  />
                  <span className="text-[10px] text-[#6B7268] mt-1 block">
                    Estimated freight savings: Rs. {(Math.round((parseFloat(joinVolume) || 0) * 5.2)).toLocaleString()} NPR
                  </span>
                </div>

                <div>
                  <label className="font-bold text-[#1A2E22] block mb-1">
                    Pickup Location / Nearest Highway Chowk
                  </label>
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    required
                    className="w-full bg-[#F7F5F0] border border-black/10 px-3 py-2.5 rounded-xl font-bold focus:outline-[#2E7D4F]"
                  />
                </div>

                <div className="bg-lime-50 p-3 rounded-2xl border border-lime-200 flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#2E7D4F] shrink-0" />
                  <span className="text-[11px] text-[#2E7D4F] font-semibold">
                    Collective Bolero picks up at your designated chowk at 04:00 AM on departure day.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#2E7D4F] hover:bg-[#256640] text-white py-3 rounded-xl font-bold text-xs shadow-md transition"
                >
                  Confirm Booking ({joinVolume} KG)
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Create Pool Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 text-[#1A2E22] space-y-4 shadow-2xl border border-black/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <h3 className="font-black text-base">Start a New Collective Freight Pool</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-xs font-bold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#1A2E22] block mb-1">Crop to Transport</label>
                <select
                  value={newCropId}
                  onChange={(e) => setNewCropId(e.target.value)}
                  className="w-full bg-[#F7F5F0] border border-black/10 px-3 py-2.5 rounded-xl font-bold focus:outline-[#2E7D4F]"
                >
                  {COMMODITY_SEEDS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.nepaliName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1A2E22] block mb-1">District</label>
                  <select
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="w-full bg-[#F7F5F0] border border-black/10 px-3 py-2 rounded-xl font-bold capitalize focus:outline-[#2E7D4F]"
                  >
                    {DISTRICT_LIST.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#1A2E22] block mb-1">Municipality / Area</label>
                  <input
                    type="text"
                    value={newMunicipality}
                    onChange={(e) => setNewMunicipality(e.target.value)}
                    className="w-full bg-[#F7F5F0] border border-black/10 px-3 py-2 rounded-xl font-bold focus:outline-[#2E7D4F]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#1A2E22] block mb-1">Destination Wholesale Terminal</label>
                <input
                  type="text"
                  value={newTargetMarket}
                  onChange={(e) => setNewTargetMarket(e.target.value)}
                  className="w-full bg-[#F7F5F0] border border-black/10 px-3 py-2 rounded-xl font-bold focus:outline-[#2E7D4F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-[#1A2E22]">Truck Capacity (KG)</label>
                    <button
                      type="button"
                      onClick={() => setNewCapacity('2500')}
                      className="text-[10px] font-bold text-[#2E7D4F] hover:underline"
                    >
                      Default
                    </button>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={newCapacity}
                    onChange={(e) => handleCapacityChange(e.target.value)}
                    placeholder="2500"
                    className="w-full bg-[#F7F5F0] border border-black/10 px-3 py-2 rounded-xl font-bold font-mono focus:outline-[#2E7D4F]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1A2E22] block mb-1">Departure Date & Time</label>
                  <input
                    type="text"
                    value={newDepartureDate}
                    onChange={(e) => setNewDepartureDate(e.target.value)}
                    className="w-full bg-[#F7F5F0] border border-black/10 px-3 py-2 rounded-xl font-bold focus:outline-[#2E7D4F]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#2E7D4F] hover:bg-[#256640] text-white py-3 rounded-xl font-bold text-xs shadow-md transition mt-2"
              >
                Create Transport Pool & Broadcast to Neighbors
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
