import React, { useState } from 'react';
import {
  TraderListing,
  CooperativeSummary,
  GovernmentSupplyForecast,
} from '../types/krishi';
import {
  Building2,
  Landmark,
  ShoppingBag,
  MapPin,
  Phone,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Package,
  Layers,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  Sparkles,
  Database,
  BarChart3,
} from 'lucide-react';
import {
  SAMPLE_TRADER_LISTINGS,
  SAMPLE_COOPERATIVE_DATA,
  SAMPLE_GOVERNMENT_FORECASTS,
  DISTRICT_LIST,
} from '../data/agriData';

export const MultiSidedPlatformView: React.FC = () => {
  const [activeRoleTab, setActiveRoleTab] = useState<'trader' | 'cooperative' | 'government'>('trader');
  const [selectedCropFilter, setSelectedCropFilter] = useState('all');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('all');
  const [contactSuccessId, setContactSuccessId] = useState<string | null>(null);

  const filteredListings = SAMPLE_TRADER_LISTINGS.filter((item) => {
    if (selectedCropFilter !== 'all' && item.cropId !== selectedCropFilter) return false;
    if (selectedGradeFilter !== 'all' && !item.estimatedGrade.includes(selectedGradeFilter)) return false;
    return true;
  });

  const handleContactFarmer = (id: string) => {
    setContactSuccessId(id);
    setTimeout(() => setContactSuccessId(null), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 md:pb-8">
      {/* Top Banner */}
      <div className="bg-[#1A2E22] text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-xl border border-white/5">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-lime-400/20 text-lime-300 border border-lime-400/30 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-3">
            <Building2 className="w-3.5 h-3.5" /> Multi-Sided Agricultural Ecosystem
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Traders, Cooperatives & Government Portal
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed">
            KrishiSetu is not a single-user dashboard — it powers the entire Nepali agricultural supply chain. Wholesalers source direct from farmers, Cooperatives aggregate member yields, and the Ministry of Agriculture forecasts national food security.
          </p>

          {/* Role Navigation Pills */}
          <div className="flex flex-wrap items-center gap-2.5 mt-5">
            <button
              onClick={() => setActiveRoleTab('trader')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-xs ${
                activeRoleTab === 'trader'
                  ? 'bg-lime-400 text-[#1A2E22]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>1. Wholesaler / Trader Sourcing Hub</span>
            </button>

            <button
              onClick={() => setActiveRoleTab('cooperative')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-xs ${
                activeRoleTab === 'cooperative'
                  ? 'bg-amber-400 text-stone-900'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>2. Cooperative Executive Dashboard</span>
            </button>

            <button
              onClick={() => setActiveRoleTab('government')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-xs ${
                activeRoleTab === 'government'
                  ? 'bg-sky-400 text-slate-900'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Landmark className="w-4 h-4" />
              <span>3. Government / DADO Early Warning</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: TRADER / WHOLESALER SOURCING FEED */}
      {activeRoleTab === 'trader' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#2E7D4F]" />
              <span className="text-xs font-bold text-[#1A2E22]">Filter Verified Farm Batches:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={selectedCropFilter}
                onChange={(e) => setSelectedCropFilter(e.target.value)}
                className="bg-[#F7F5F0] border border-black/10 px-3 py-1.5 rounded-xl font-semibold"
              >
                <option value="all">All Crops</option>
                <option value="tomato">Tomato</option>
                <option value="cauliflower">Cauliflower</option>
                <option value="beans">French Beans</option>
                <option value="capsicum">Capsicum</option>
                <option value="potato">Potato</option>
              </select>

              <select
                value={selectedGradeFilter}
                onChange={(e) => setSelectedGradeFilter(e.target.value)}
                className="bg-[#F7F5F0] border border-black/10 px-3 py-1.5 rounded-xl font-semibold"
              >
                <option value="all">All Quality Grades</option>
                <option value="Grade A">Grade A (Export / Banquet)</option>
                <option value="Grade B">Grade B (Standard Mandi)</option>
              </select>
            </div>
          </div>

          {/* Sourcing Listings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-3xl p-5 border border-black/5 shadow-xs flex flex-col justify-between space-y-3.5 hover:border-[#2E7D4F]/40 transition"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl">{listing.emoji}</span>
                      <div>
                        <h4 className="font-extrabold text-sm text-[#1A2E22]">{listing.cropName}</h4>
                        <span className="text-xs text-[#6B7268] flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#2E7D4F]" /> {listing.municipality}, {listing.district}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] bg-[#F7F5F0] text-[#6B7268] px-2 py-0.5 rounded-full">
                      {listing.postedAgo}
                    </span>
                  </div>

                  <div className="mt-3 bg-[#F7F5F0] p-3 rounded-2xl space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#6B7268]">Grower:</span>
                      <span className="font-bold text-[#1A2E22] flex items-center gap-1">
                        {listing.farmerName} <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D4F]" />
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B7268]">Harvest Batch:</span>
                      <span className="font-bold text-[#1A2E22]">{listing.quantityKg.toLocaleString()} KG</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B7268]">Expected Ready Date:</span>
                      <span className="font-bold text-[#2E7D4F]">{listing.harvestDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B7268]">Quality Tier:</span>
                      <span className="font-semibold text-lime-800">{listing.estimatedGrade}</span>
                    </div>
                  </div>

                  {/* Pricing Comparison Box */}
                  <div className="mt-3 p-3 bg-lime-50/60 rounded-2xl border border-lime-200/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-[#6B7268] block">Farmer Asking Price</span>
                      <span className="text-base font-black text-[#2E7D4F]">Rs. {listing.askingPricePerKg.toFixed(2)}/kg</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#6B7268] block">Kalimati Wholesale</span>
                      <span className="text-xs font-bold text-stone-600">Rs. {listing.marketWholesaleRate.toFixed(2)}/kg</span>
                    </div>
                  </div>
                </div>

                <div>
                  {contactSuccessId === listing.id ? (
                    <div className="bg-lime-100 text-[#2E7D4F] text-xs font-bold py-2 rounded-xl text-center border border-lime-300">
                      ✓ Direct inquiry sent to {listing.farmerName} ({listing.phone})
                    </div>
                  ) : (
                    <button
                      onClick={() => handleContactFarmer(listing.id)}
                      className="w-full bg-[#1A2E22] hover:bg-black text-white text-xs font-bold py-2.5 rounded-2xl transition flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" /> Direct Sourcing Inquiry
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: COOPERATIVE EXECUTIVE DASHBOARD */}
      {activeRoleTab === 'cooperative' && (
        <div className="space-y-5">
          <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 pb-4">
              <div>
                <span className="text-xs text-[#2E7D4F] font-bold uppercase tracking-wider block">
                  Regional Agricultural Cooperative Portal
                </span>
                <h3 className="text-xl font-black text-[#1A2E22]">{SAMPLE_COOPERATIVE_DATA.name}</h3>
                <p className="text-xs text-[#6B7268] mt-0.5">
                  Chitwan District • 428 Smallholder Farmer Members • 512 Ropani Cultivated
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs bg-lime-100 text-[#2E7D4F] font-bold px-3 py-1 rounded-xl">
                  Spring 2026 Ingest Active
                </span>
              </div>
            </div>

            {/* Cooperative High-Level Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#F7F5F0] p-4 rounded-2xl border border-black/5">
                <span className="text-xs text-[#6B7268] block">Member Farmers</span>
                <span className="text-2xl font-black text-[#1A2E22]">{SAMPLE_COOPERATIVE_DATA.totalMembers}</span>
                <span className="text-[10px] text-[#2E7D4F] font-semibold mt-1 block">100% Mobile Onboarded</span>
              </div>

              <div className="bg-[#F7F5F0] p-4 rounded-2xl border border-black/5">
                <span className="text-xs text-[#6B7268] block">Combined Acreage</span>
                <span className="text-2xl font-black text-[#1A2E22]">{SAMPLE_COOPERATIVE_DATA.totalLandRopani} Ropani</span>
                <span className="text-[10px] text-[#6B7268] mt-1 block">Subtropical Zone</span>
              </div>

              <div className="bg-[#F7F5F0] p-4 rounded-2xl border border-black/5">
                <span className="text-xs text-[#6B7268] block">Cold Storage Utilized</span>
                <span className="text-2xl font-black text-[#2E7D4F]">
                  {((SAMPLE_COOPERATIVE_DATA.coldStorageUsedKg / SAMPLE_COOPERATIVE_DATA.coldStorageCapacityKg) * 100).toFixed(0)}%
                </span>
                <span className="text-[10px] text-[#6B7268] mt-1 block">
                  {SAMPLE_COOPERATIVE_DATA.coldStorageUsedKg.toLocaleString()} / {SAMPLE_COOPERATIVE_DATA.coldStorageCapacityKg.toLocaleString()} KG
                </span>
              </div>

              <div className="bg-[#F7F5F0] p-4 rounded-2xl border border-black/5">
                <span className="text-xs text-[#6B7268] block">Subsidized Fertilizer Stock</span>
                <span className="text-2xl font-black text-amber-700">{SAMPLE_COOPERATIVE_DATA.fertilizerStockBags} Bags</span>
                <span className="text-[10px] text-amber-800 font-semibold mt-1 block">Urea & DAP Buffer</span>
              </div>
            </div>

            {/* Aggregated Predicted Member Yields */}
            <div>
              <h4 className="font-extrabold text-sm text-[#1A2E22] mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#2E7D4F]" /> Aggregated Member Harvest Predictions (Spring 2026)
              </h4>

              <div className="space-y-2.5">
                {SAMPLE_COOPERATIVE_DATA.majorCrops.map((crop) => (
                  <div
                    key={crop.cropId}
                    className="p-4 bg-[#F7F5F0] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-extrabold text-sm text-[#1A2E22]">{crop.cropName}</span>
                      <p className="text-xs text-[#6B7268] mt-0.5">
                        Predicted Collective Output: <strong>{(crop.totalEstYieldKg / 1000).toFixed(1)} Metric Tons</strong>
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <span className="text-[11px] text-[#6B7268] block">Est. Collective Revenue</span>
                      <span className="text-base font-black text-[#2E7D4F]">
                        Rs. {(crop.estRevenueNPR / 100000).toFixed(2)} Lakhs
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: GOVERNMENT & DADO FOOD SECURITY RADAR */}
      {activeRoleTab === 'government' && (
        <div className="space-y-5">
          <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 pb-4">
              <div>
                <span className="text-xs text-sky-700 font-bold uppercase tracking-wider block">
                  Ministry of Agriculture & Livestock Development (MoALD) • DADO Early Warning System
                </span>
                <h3 className="text-xl font-black text-[#1A2E22]">
                  National Crop Supply & Price Shock Radar
                </h3>
                <p className="text-xs text-[#6B7268] mt-0.5">
                  30-Day Forward Balance Heatmap across Key Production & Consumption Hubs
                </p>
              </div>

              <span className="text-xs bg-sky-100 text-sky-800 font-bold px-3 py-1 rounded-xl">
                National Telemetry Active
              </span>
            </div>

            {/* Regional Alerts Grid */}
            <div className="space-y-3">
              {SAMPLE_GOVERNMENT_FORECASTS.map((item, idx) => {
                const isDeficit = item.balanceStatus === 'deficit';
                return (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border ${
                      isDeficit
                        ? 'bg-rose-50/60 border-rose-200'
                        : 'bg-emerald-50/60 border-emerald-200'
                    } space-y-2.5`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isDeficit ? (
                          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        )}
                        <div>
                          <span className="font-extrabold text-sm text-[#1A2E22]">
                            {item.district} — {item.cropName} ({item.balanceStatus.toUpperCase()})
                          </span>
                          <span className="text-xs text-[#6B7268] block">
                            Supply: {item.predictedSupplyTons} Tons | Local Demand: {item.localDemandTons} Tons ({item.deficitPct > 0 ? `+${item.deficitPct}%` : `${item.deficitPct}%`})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                            item.pricePressure === 'inflationary'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.pricePressure} Pressure
                        </span>
                      </div>
                    </div>

                    <div className="bg-white/80 p-3 rounded-xl text-xs text-[#1A2E22] border border-black/5">
                      <span className="font-bold text-[#6B7268] block mb-0.5">Government Mitigative Protocol:</span>
                      <p className="leading-relaxed">{item.mitigationAction}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
