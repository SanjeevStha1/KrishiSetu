import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Commodity } from '../types/krishi';

interface TickerBarProps {
  commodities: Commodity[];
  onSelectCommodity: (id: string) => void;
}

export const TickerBar: React.FC<TickerBarProps> = ({ commodities, onSelectCommodity }) => {
  return (
    <div className="bg-slate-950 border-b border-slate-800 text-xs overflow-hidden py-1.5 px-4 flex items-center gap-4">
      <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px] text-slate-400 uppercase tracking-wider font-semibold border-r border-slate-800 pr-3">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        TICKER TAPE
      </div>

      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-0.5 whitespace-nowrap">
        {commodities.map((c) => (
          <button
            key={c.id}
            id={`ticker-${c.id}`}
            onClick={() => onSelectCommodity(c.id)}
            className="flex items-center gap-2 hover:bg-slate-800/80 px-2 py-0.5 rounded transition text-left cursor-pointer group"
          >
            <span className="font-medium text-slate-200 group-hover:text-emerald-400 transition">
              {c.name.split(' ')[0]}
            </span>
            <span className="font-mono text-slate-100 font-semibold">
              Rs.{c.currentPrice.toFixed(1)}
            </span>
            <span
              className={`flex items-center text-[11px] font-mono font-medium ${
                c.changePct > 0
                  ? 'text-emerald-400'
                  : c.changePct < 0
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }`}
            >
              {c.changePct > 0 ? (
                <TrendingUp className="w-3 h-3 mr-0.5 inline" />
              ) : c.changePct < 0 ? (
                <TrendingDown className="w-3 h-3 mr-0.5 inline" />
              ) : (
                <Minus className="w-3 h-3 mr-0.5 inline" />
              )}
              {c.changePct > 0 ? `+${c.changePct}%` : `${c.changePct}%`}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
