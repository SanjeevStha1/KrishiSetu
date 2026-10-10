import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  TrendingUp,
  Truck,
  ShieldCheck,
  AlertTriangle,
  Calculator,
  Percent,
  MapPin,
} from 'lucide-react';
import { ArbitrageOpportunity } from '../types/krishi';
import { SAMPLE_ARBITRAGE } from '../data/agriData';

export const ArbitrageRadar: React.FC = () => {
  const [filterType, setFilterType] = useState<'all' | 'cross_border' | 'domestic'>('all');
  const [truckCapacityKg, setTruckCapacityKg] = useState<number>(3000);
  const [selectedOpp, setSelectedOpp] = useState<ArbitrageOpportunity>(SAMPLE_ARBITRAGE[0]);

  const filteredOpps = SAMPLE_ARBITRAGE.filter(
    (op) => filterType === 'all' || op.type === filterType
  );

  const calculateTripEconomics = (opp: ArbitrageOpportunity) => {
    const grossRevenue = opp.targetPrice * truckCapacityKg;
    const procurementCost = opp.sourcePrice * truckCapacityKg;
    const totalTransport = opp.transportCost * truckCapacityKg;
    const totalSpoilage = opp.spoilageCost * truckCapacityKg;
    const totalCustoms = opp.customsCost * truckCapacityKg;
    const totalTripExpenses = procurementCost + totalTransport + totalSpoilage + totalCustoms;
    const netTripProfit = grossRevenue - totalTripExpenses;
    const roi = (netTripProfit / totalTripExpenses) * 100;

    return {
      grossRevenue,
      procurementCost,
      totalTransport,
      totalSpoilage,
      totalCustoms,
      totalTripExpenses,
      netTripProfit,
      roi,
    };
  };

  const trip = calculateTripEconomics(selectedOpp);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center">
            <Compass className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white font-mono">Geospatial Arbitrage Radar</h2>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-xs font-mono border border-emerald-800">
                6 Border Mandis + 12 Domestic Corridors
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Real-time Indian Mandi Rates (Agmarknet 1.6x INR-NPR) & Freight Optimization
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded transition ${
              filterType === 'all' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Corridors ({SAMPLE_ARBITRAGE.length})
          </button>
          <button
            onClick={() => setFilterType('cross_border')}
            className={`px-3 py-1 rounded transition ${
              filterType === 'cross_border' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cross-Border (India-Nepal)
          </button>
          <button
            onClick={() => setFilterType('domestic')}
            className={`px-3 py-1 rounded transition ${
              filterType === 'domestic' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Domestic Inter-District
          </button>
        </div>
      </div>

      {/* Main Grid: Opportunities List + Real-time Freight Trip Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Opportunities List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredOpps.map((opp, idx) => {
            const isSelected = selectedOpp.commodity === opp.commodity && selectedOpp.fromLocation === opp.fromLocation;
            return (
              <div
                key={idx}
                id={`arbitrage-card-${idx}`}
                onClick={() => setSelectedOpp(opp)}
                className={`bg-slate-900 border rounded-xl p-4 transition cursor-pointer hover:border-slate-700 ${
                  isSelected ? 'border-emerald-500 ring-1 ring-emerald-500/50 bg-slate-900/90' : 'border-slate-800'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono text-base">{opp.commodityName}</span>
                    <span
                      className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        opp.type === 'cross_border'
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : 'bg-teal-950 text-teal-300 border border-teal-800'
                      }`}
                    >
                      {opp.type.replace('_', ' ')}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-xs font-mono font-bold uppercase ${
                      opp.signal === 'strong_buy'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-teal-950 text-teal-300 border border-teal-800'
                    }`}
                  >
                    {opp.signal.replace('_', ' ')}
                  </span>
                </div>

                {/* Route Vector */}
                <div className="flex items-center gap-2 text-xs text-slate-300 my-2 bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">{opp.fromLocation}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate text-white font-medium">{opp.toLocation}</span>
                </div>

                {/* Profit Math */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono mt-3 pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Source Price</span>
                    <span className="text-slate-300 font-semibold">Rs.{opp.sourcePrice.toFixed(1)}/kg</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Terminal Price</span>
                    <span className="text-white font-semibold">Rs.{opp.targetPrice.toFixed(1)}/kg</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Net Profit / kg</span>
                    <span className="text-emerald-400 font-bold">+Rs.{opp.netProfit.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Net Margin</span>
                    <span className="text-emerald-400 font-bold text-sm">+{opp.profitMarginPct}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Trip Economics Simulator */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-emerald-400" />
              Freight Trip Dispatcher
            </h3>
            <span className="text-xs text-slate-400 font-mono">1 Truck Payload</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">
                Consignment Size (Payload in kg):
              </label>
              <div className="flex items-center gap-2">
                {[1000, 3000, 5000].map((cap) => (
                  <button
                    key={cap}
                    onClick={() => setTruckCapacityKg(cap)}
                    className={`flex-1 py-1 rounded text-xs font-mono font-medium transition ${
                      truckCapacityKg === cap
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {cap.toLocaleString()} kg
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Gross Terminal Revenue:</span>
                <span className="text-white font-bold">Rs. {trip.grossRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Procurement (Source Mandi):</span>
                <span className="text-slate-300">-Rs. {trip.procurementCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Freight & Highway Toll:</span>
                <span className="text-slate-300">-Rs. {trip.totalTransport.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Spoilage / Loss:</span>
                <span className="text-slate-300">-Rs. {trip.totalSpoilage.toLocaleString()}</span>
              </div>
              {selectedOpp.type === 'cross_border' && (
                <div className="flex justify-between text-slate-400">
                  <span>Customs & Clearance Broker:</span>
                  <span className="text-slate-300">-Rs. {trip.totalCustoms.toLocaleString()}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 flex justify-between text-sm">
                <span className="font-bold text-slate-200">Net Profit per Truck:</span>
                <span className="font-bold text-emerald-400 text-base">
                  Rs. {trip.netTripProfit.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-emerald-400 pt-1">
                <span>Trip ROI (Return on Capital):</span>
                <span className="font-bold">+{trip.roi.toFixed(1)}%</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-400 pt-1">
              <div className="flex items-center justify-between">
                <span>Estimated Travel Duration:</span>
                <span className="font-mono text-slate-200">{selectedOpp.travelHours} hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Break-Even Volume:</span>
                <span className="font-mono text-slate-200">{selectedOpp.breakEvenVolumeKg.toLocaleString()} kg</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Corridor Risk Score:</span>
                <span className="font-mono text-amber-400">{selectedOpp.riskScore} / 10</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
