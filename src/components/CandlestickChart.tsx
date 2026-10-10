import React, { useState } from 'react';
import {
  Activity,
  BarChart2,
  TrendingUp,
  ShieldCheck,
  Zap,
  Info,
  Calendar,
  Layers,
} from 'lucide-react';
import { Commodity, OHLCV } from '../types/krishi';
import { generateHistoricalOHLCV } from '../data/agriData';

interface CandlestickChartProps {
  commodity: Commodity;
  commodities: Commodity[];
  onSelectCommodity: (id: string) => void;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  commodity,
  commodities,
  onSelectCommodity,
}) => {
  const [timeframe, setTimeframe] = useState<number>(60);
  const [showSMA20, setShowSMA20] = useState<boolean>(true);
  const [showSMA50, setShowSMA50] = useState<boolean>(true);
  const [showBB, setShowBB] = useState<boolean>(true);
  const [showVWAP, setShowVWAP] = useState<boolean>(false);
  const [hoveredCandle, setHoveredCandle] = useState<OHLCV | null>(null);

  const rawCandles = generateHistoricalOHLCV(commodity.id, timeframe);
  const candles = rawCandles.slice(-timeframe);

  // Chart bounds calculation
  const allPrices = candles.flatMap((c) => [
    c.high,
    c.low,
    ...(showBB && c.bbUpper ? [c.bbUpper] : []),
    ...(showBB && c.bbLower ? [c.bbLower] : []),
  ]);
  const minPrice = Math.floor(Math.min(...allPrices) * 0.95);
  const maxPrice = Math.ceil(Math.max(...allPrices) * 1.05);
  const priceRange = maxPrice - minPrice || 1;

  const maxVolume = Math.max(...candles.map((c) => c.volume), 1);

  // Dimensions
  const chartHeight = 320;
  const volumeHeight = 70;
  const rsiHeight = 80;
  const svgWidth = 800;
  const paddingLeft = 45;
  const paddingRight = 15;
  const availableWidth = svgWidth - paddingLeft - paddingRight;
  const candleStep = availableWidth / candles.length;
  const candleWidth = Math.max(2.5, candleStep * 0.65);

  const getY = (price: number) => {
    return chartHeight - ((price - minPrice) / priceRange) * (chartHeight - 30) - 15;
  };

  const getVolY = (vol: number) => {
    return volumeHeight - (vol / maxVolume) * (volumeHeight - 10);
  };

  const activeCandle = hoveredCandle || candles[candles.length - 1];

  return (
    <div className="space-y-6">
      {/* Top Header Selector & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center">
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <select
                id="select-chart-commodity"
                value={commodity.id}
                onChange={(e) => onSelectCommodity(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-white font-bold text-base rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-emerald-500 font-mono"
              >
                {commodities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.nepaliName})
                  </option>
                ))}
              </select>
              <span className="text-xs text-slate-400 font-mono">
                Rs. {commodity.currentPrice.toFixed(1)}/kg
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Kalimati Market Microstructure & Technical Oscillator Suite
            </p>
          </div>
        </div>

        {/* Timeframe & Overlays */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Timeframe selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            {[
              { days: 14, label: '14D' },
              { days: 30, label: '30D' },
              { days: 60, label: '60D' },
              { days: 90, label: '90D' },
              { days: 180, label: '180D' },
            ].map((tf) => (
              <button
                key={tf.days}
                id={`tf-${tf.days}`}
                onClick={() => setTimeframe(tf.days)}
                className={`px-2.5 py-1 rounded transition ${
                  timeframe === tf.days
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Overlays toggle */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setShowSMA20(!showSMA20)}
              className={`px-2 py-0.5 rounded font-mono text-[11px] transition ${
                showSMA20 ? 'bg-amber-950 text-amber-300 border border-amber-800/80' : 'text-slate-500'
              }`}
            >
              SMA20
            </button>
            <button
              onClick={() => setShowSMA50(!showSMA50)}
              className={`px-2 py-0.5 rounded font-mono text-[11px] transition ${
                showSMA50 ? 'bg-blue-950 text-blue-300 border border-blue-800/80' : 'text-slate-500'
              }`}
            >
              SMA50
            </button>
            <button
              onClick={() => setShowBB(!showBB)}
              className={`px-2 py-0.5 rounded font-mono text-[11px] transition ${
                showBB ? 'bg-purple-950 text-purple-300 border border-purple-800/80' : 'text-slate-500'
              }`}
            >
              Bollinger
            </button>
            <button
              onClick={() => setShowVWAP(!showVWAP)}
              className={`px-2 py-0.5 rounded font-mono text-[11px] transition ${
                showVWAP ? 'bg-teal-950 text-teal-300 border border-teal-800/80' : 'text-slate-500'
              }`}
            >
              VWAP
            </button>
          </div>
        </div>
      </div>

      {/* Main Chart + Right Signal Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Candlestick & Volume SVG Canvas */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          {/* Active Candle Hover Telemetry */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-2 border-b border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-300 font-semibold">{activeCandle.date}</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span>O: <strong className="text-slate-200">Rs.{activeCandle.open}</strong></span>
              <span>H: <strong className="text-emerald-400">Rs.{activeCandle.high}</strong></span>
              <span>L: <strong className="text-rose-400">Rs.{activeCandle.low}</strong></span>
              <span>C: <strong className="text-white">Rs.{activeCandle.close}</strong></span>
              <span>Vol: <strong className="text-slate-300">{activeCandle.volume.toLocaleString()} kg</strong></span>
              {activeCandle.sma20 && <span>SMA20: <strong className="text-amber-400">Rs.{activeCandle.sma20}</strong></span>}
            </div>
          </div>

          {/* SVG Candlestick Viewport */}
          <div className="relative w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgWidth} ${chartHeight + volumeHeight + 20}`}
              className="w-full h-auto select-none"
              style={{ minWidth: '600px' }}
            >
              {/* Horizontal Gridlines & Price Ticks */}
              {[0, 0.25, 0.5, 0.75, 1.0].map((ratio) => {
                const p = minPrice + (maxPrice - minPrice) * ratio;
                const y = getY(p);
                return (
                  <g key={ratio}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={svgWidth - paddingRight}
                      y2={y}
                      stroke="#334155"
                      strokeDasharray="2 4"
                      strokeWidth="0.8"
                    />
                    <text
                      x={paddingLeft - 6}
                      y={y + 3}
                      fill="#94a3b8"
                      fontSize="9"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {p.toFixed(0)}
                    </text>
                  </g>
                );
              })}

              {/* Bollinger Bands Shaded Area & Lines */}
              {showBB && (
                <>
                  <path
                    d={candles
                      .map((c, i) => {
                        const x = paddingLeft + i * candleStep + candleStep / 2;
                        const y = getY(c.bbUpper || c.close);
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      })
                      .concat(
                        candles
                          .slice()
                          .reverse()
                          .map((c, i) => {
                            const origIdx = candles.length - 1 - i;
                            const x = paddingLeft + origIdx * candleStep + candleStep / 2;
                            const y = getY(c.bbLower || c.close);
                            return `L ${x} ${y}`;
                          })
                      )
                      .join(' ') + ' Z'}
                    fill="#a855f7"
                    fillOpacity="0.07"
                  />
                  <path
                    d={candles
                      .map((c, i) => {
                        const x = paddingLeft + i * candleStep + candleStep / 2;
                        const y = getY(c.bbUpper || c.close);
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      })
                      .join(' ')}
                    fill="none"
                    stroke="#c084fc"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <path
                    d={candles
                      .map((c, i) => {
                        const x = paddingLeft + i * candleStep + candleStep / 2;
                        const y = getY(c.bbLower || c.close);
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      })
                      .join(' ')}
                    fill="none"
                    stroke="#c084fc"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                </>
              )}

              {/* SMA 20 Overlay Line */}
              {showSMA20 && (
                <path
                  d={candles
                    .filter((c) => c.sma20 !== undefined)
                    .map((c, i, arr) => {
                      const idx = candles.indexOf(c);
                      const x = paddingLeft + idx * candleStep + candleStep / 2;
                      const y = getY(c.sma20!);
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="1.5"
                />
              )}

              {/* SMA 50 Overlay Line */}
              {showSMA50 && (
                <path
                  d={candles
                    .filter((c) => c.sma50 !== undefined)
                    .map((c, i) => {
                      const idx = candles.indexOf(c);
                      const x = paddingLeft + idx * candleStep + candleStep / 2;
                      const y = getY(c.sma50!);
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="1.5"
                />
              )}

              {/* VWAP Line */}
              {showVWAP && (
                <path
                  d={candles
                    .map((c, i) => {
                      const x = paddingLeft + i * candleStep + candleStep / 2;
                      const y = getY(c.vwap);
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#2dd4bf"
                  strokeWidth="1.2"
                  strokeDasharray="4 2"
                />
              )}

              {/* Candlesticks & Hover Targets */}
              {candles.map((c, i) => {
                const xCenter = paddingLeft + i * candleStep + candleStep / 2;
                const isGreen = c.close >= c.open;
                const color = isGreen ? '#10b981' : '#f43f5e';
                const yOpen = getY(c.open);
                const yClose = getY(c.close);
                const yHigh = getY(c.high);
                const yLow = getY(c.low);
                const bodyTop = Math.min(yOpen, yClose);
                const bodyHeight = Math.max(1.5, Math.abs(yClose - yOpen));

                // Volume bar placement
                const volY = chartHeight + 15 + getVolY(c.volume);
                const volHeight = chartHeight + 15 + volumeHeight - volY;

                return (
                  <g
                    key={c.date}
                    onMouseEnter={() => setHoveredCandle(c)}
                    onMouseLeave={() => setHoveredCandle(null)}
                    className="cursor-pointer"
                  >
                    {/* Wick Line */}
                    <line
                      x1={xCenter}
                      y1={yHigh}
                      x2={xCenter}
                      y2={yLow}
                      stroke={color}
                      strokeWidth="1"
                    />

                    {/* Candle Body */}
                    <rect
                      x={xCenter - candleWidth / 2}
                      y={bodyTop}
                      width={candleWidth}
                      height={bodyHeight}
                      fill={color}
                      rx="0.5"
                    />

                    {/* Volume Bar */}
                    <rect
                      x={xCenter - candleWidth / 2}
                      y={volY}
                      width={candleWidth}
                      height={volHeight}
                      fill={color}
                      fillOpacity="0.4"
                    />

                    {/* Interactive Invisible Hover Hitbox */}
                    <rect
                      x={xCenter - candleStep / 2}
                      y={0}
                      width={candleStep}
                      height={chartHeight + volumeHeight + 20}
                      fill="transparent"
                    />
                  </g>
                );
              })}

              {/* Volume Area Divider */}
              <line
                x1={paddingLeft}
                y1={chartHeight + 10}
                x2={svgWidth - paddingRight}
                y2={chartHeight + 10}
                stroke="#1e293b"
                strokeWidth="1"
              />
              <text
                x={paddingLeft}
                y={chartHeight + 22}
                fill="#64748b"
                fontSize="9"
                fontFamily="monospace"
              >
                VOLUME HISTOGRAM (MAX: {maxVolume.toLocaleString()} KG)
              </text>
            </svg>
          </div>
        </div>

        {/* Right: Technical Signals & Indicator Snapshot */}
        <div className="space-y-4">
          {/* Signal Sentiment Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Technical Sentiment
              </span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-mono font-bold uppercase ${
                  commodity.sentiment === 'strong_buy'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : commodity.sentiment === 'buy'
                    ? 'bg-teal-950 text-teal-400 border border-teal-800'
                    : commodity.sentiment === 'neutral'
                    ? 'bg-slate-800 text-slate-300'
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}
              >
                {commodity.sentiment.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold font-mono text-white">
                {commodity.sentimentScore > 0 ? `+${commodity.sentimentScore}` : commodity.sentimentScore}
              </span>
              <span className="text-xs text-slate-400">/ 5 Factor Score</span>
            </div>

            <div className="space-y-2 mt-4">
              <span className="text-xs font-semibold text-slate-300 block">Algorithmic Signals:</span>
              <ul className="space-y-1.5 text-xs text-slate-400">
                {commodity.signals.map((sig, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{sig}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Indicator Snapshot Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Oscillators & Volatility
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">RSI (14)</span>
                <span
                  className={`text-base font-bold ${
                    commodity.rsi < 30
                      ? 'text-emerald-400'
                      : commodity.rsi > 70
                      ? 'text-rose-400'
                      : 'text-slate-200'
                  }`}
                >
                  {commodity.rsi}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {commodity.rsi < 30 ? 'Oversold' : commodity.rsi > 70 ? 'Overbought' : 'Neutral Zone'}
                </span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">MACD Histogram</span>
                <span
                  className={`text-base font-bold ${
                    commodity.macdHistogram > 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {commodity.macdHistogram > 0 ? `+${commodity.macdHistogram}` : commodity.macdHistogram}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {commodity.macdHistogram > 0 ? 'Bullish Mom.' : 'Bearish Press.'}
                </span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">ATR (14 Volatility)</span>
                <span className="text-base font-bold text-slate-200">
                  Rs. {commodity.atr14}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {commodity.volatilityPct}% Daily Swing
                </span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Bollinger %B</span>
                <span className="text-base font-bold text-slate-200">
                  {(commodity.bbPosition * 100).toFixed(0)}%
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {commodity.bbPosition > 0.8 ? 'Upper Band' : commodity.bbPosition < 0.2 ? 'Lower Band' : 'Mid Channel'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
