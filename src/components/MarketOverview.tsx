import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Zap,
  SlidersHorizontal,
} from 'lucide-react';
import { Commodity } from '../types/krishi';

interface MarketOverviewProps {
  commodities: Commodity[];
  onSelectCommodity: (id: string, view?: 'chart' | 'forecast') => void;
}

export const MarketOverview: React.FC<MarketOverviewProps> = ({
  commodities,
  onSelectCommodity,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'change' | 'volume' | 'price' | 'name'>('change');

  const filtered = commodities
    .filter((c) => {
      const matchCat = selectedCategory === 'all' || c.category === selectedCategory;
      const matchQuery =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.nepaliName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    })
    .sort((a, b) => {
      if (sortBy === 'change') return b.changePct - a.changePct;
      if (sortBy === 'volume') return b.volume - a.volume;
      if (sortBy === 'price') return b.currentPrice - a.currentPrice;
      return a.name.localeCompare(b.name);
    });

  const gainers = [...commodities].sort((a, b) => b.changePct - a.changePct).slice(0, 4);
  const losers = [...commodities].sort((a, b) => a.changePct - b.changePct).slice(0, 4);
  const totalVolume = commodities.reduce((acc, c) => acc + c.volume, 0);

  return (
    <div className="space-y-6">
      {/* Top Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Kalimati Traded Volume</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {totalVolume.toLocaleString()} <span className="text-sm font-normal text-slate-400">kg</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
            <span>+14.2% vs 7-day average</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Top Market Gainer</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-white font-mono">{gainers[0]?.name.split(' ')[0]}</span>
            <span className="text-sm font-mono font-bold text-emerald-400">+{gainers[0]?.changePct}%</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Current Price: <span className="text-slate-200 font-mono">Rs. {gainers[0]?.currentPrice}/kg</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Top Market Loser</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-white font-mono">{losers[0]?.name.split(' ')[0]}</span>
            <span className="text-sm font-mono font-bold text-rose-400">{losers[0]?.changePct}%</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Current Price: <span className="text-slate-200 font-mono">Rs. {losers[0]?.currentPrice}/kg</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Market Regime Indicator</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold font-mono text-emerald-400 flex items-center gap-2">
            BULLISH MOMENTUM
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            18/24 Commodities Trading Above SMA20
          </div>
        </div>
      </div>

      {/* Control Bar: Categories, Search, Sort */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Crops (23)' },
            { id: 'perishable', label: 'Perishable Vegetables' },
            { id: 'staple', label: 'Staples & Roots' },
            { id: 'spices', label: 'Spices & Bulbs' },
            { id: 'exotic', label: 'High-Value / Exotic' },
          ].map((cat) => (
            <button
              key={cat.id}
              id={`cat-${cat.id}`}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search and Sort */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            id="commodity-search"
            type="text"
            placeholder="Search crop or नेपाली नाम..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full sm:w-48 placeholder-slate-500"
          />

          <div className="flex items-center gap-1.5 shrink-0 text-xs text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="change">% Price Change</option>
              <option value="volume">Traded Volume</option>
              <option value="price">Highest Price</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Commodity Heatmap Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((item) => {
          const isUp = item.changePct > 0;
          const isDown = item.changePct < 0;

          return (
            <div
              key={item.id}
              id={`commodity-card-${item.id}`}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 shadow-sm transition hover:shadow-md group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm group-hover:text-emerald-400 transition">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-sans">{item.nepaliName}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-mono font-bold ${
                      isUp
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                        : isDown
                        ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {isUp ? <ArrowUpRight className="w-3 h-3" /> : isDown ? <ArrowDownRight className="w-3 h-3" /> : null}
                    {item.changePct > 0 ? `+${item.changePct}%` : `${item.changePct}%`}
                  </span>
                </div>

                <div className="flex items-baseline justify-between my-3">
                  <div>
                    <span className="text-2xl font-bold font-mono text-white">
                      Rs. {item.currentPrice.toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">/kg</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Prev Close</span>
                    <span className="text-xs font-mono text-slate-300">Rs. {item.previousClose.toFixed(1)}</span>
                  </div>
                </div>

                {/* Micro indicators bar */}
                <div className="grid grid-cols-3 gap-1.5 bg-slate-950/70 p-2 rounded-lg text-[10px] font-mono mb-3 border border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block">RSI (14)</span>
                    <span
                      className={`font-semibold ${
                        item.rsi < 30 ? 'text-emerald-400' : item.rsi > 70 ? 'text-rose-400' : 'text-slate-300'
                      }`}
                    >
                      {item.rsi}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">SMA 20</span>
                    <span className="text-slate-300 font-semibold">Rs.{item.sma20.toFixed(0)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">ATR Vol</span>
                    <span className="text-slate-300 font-semibold">{item.volatilityPct}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span>Vol: <strong className="text-slate-200 font-mono">{item.volume.toLocaleString()} kg</strong></span>
                  <span
                    className={`px-1.5 py-0.2 rounded uppercase text-[10px] font-bold ${
                      item.sentiment === 'strong_buy' || item.sentiment === 'buy'
                        ? 'text-emerald-400 bg-emerald-950/50'
                        : item.sentiment === 'strong_sell' || item.sentiment === 'sell'
                        ? 'text-rose-400 bg-rose-950/50'
                        : 'text-slate-300 bg-slate-800'
                    }`}
                  >
                    {item.sentiment.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                <button
                  id={`btn-chart-${item.id}`}
                  onClick={() => onSelectCommodity(item.id, 'chart')}
                  className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                >
                  <Activity className="w-3 h-3 text-emerald-400" />
                  Technicals
                </button>
                <button
                  id={`btn-forecast-${item.id}`}
                  onClick={() => onSelectCommodity(item.id, 'forecast')}
                  className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/70 text-emerald-300 text-xs font-medium transition"
                >
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  30D Forecast
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
