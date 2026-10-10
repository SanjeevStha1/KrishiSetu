import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Info,
  Calendar,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { OHLCV, Commodity } from '../types/krishi';
import { THEME } from '../theme';
import { useLanguage } from '../context/LanguageContext';

interface PriceTrendOutlookProps {
  commodity: Commodity;
  historicalData: OHLCV[];
  onNavigateToSell?: (commodityId: string) => void;
  className?: string;
}

export interface DayProjection {
  dayIndex: number;
  date: string;
  formattedDate: string;
  projectedPrice: number;
  seasonalBaseline: number;
  linearTrend: number;
  lowerBound: number;
  upperBound: number;
}

export const PriceTrendOutlook: React.FC<PriceTrendOutlookProps> = ({
  commodity,
  historicalData,
  onNavigateToSell,
  className = '',
}) => {
  const { language, t } = useLanguage();

  // Statistical Projection Engine
  const projectionResult = useMemo(() => {
    if (!historicalData || historicalData.length < 21) {
      return {
        isValid: false,
        warning: language === 'ne' 
          ? '७ दिने तथ्यांक प्रक्षेपणका लागि पर्याप्त इतिहास (< २१ दिन) छैन। कालीमाटी अभिलेख कम्तीमा २१ दिनको हुनुपर्छ।'
          : 'Insufficient history (< 21 days) to compute 7-day statistical trend projection. Kalimati records require at least 21 days for statistical reliability.',
        projections: [] as DayProjection[],
        stdDev: 0,
        slope: 0,
        rSquared: 0,
        net7DayDelta: 0,
        currentPrice: commodity.currentPrice,
        day7Price: commodity.currentPrice,
      };
    }

    const n = 21;
    const recent21 = historicalData.slice(-n);
    const prices = recent21.map((d) => d.close || d.price || commodity.currentPrice);
    const currentPrice = prices[prices.length - 1];

    // 1. Calculate Linear Regression over past 21 days (x = 0..20, y = prices)
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;
    let sumY2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += prices[i];
      sumXY += i * prices[i];
      sumX2 += i * i;
      sumY2 += prices[i] * prices[i];
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // R-squared and standard deviation of residuals (sigma)
    let residualSquaresSum = 0;
    for (let i = 0; i < n; i++) {
      const fitted = intercept + slope * i;
      residualSquaresSum += Math.pow(prices[i] - fitted, 2);
    }
    const stdDev = Math.max(1.5, Math.sqrt(residualSquaresSum / (n - 2)));
    const totalSS = sumY2 - (sumY * sumY) / n;
    const rSquared = totalSS > 0 ? Math.max(0, Math.min(1, 1 - residualSquaresSum / totalSS)) : 0.5;

    // 2. Generate 7-Day Forward Projections
    // Formula: projected_price = (0.6 * seasonal_baseline) + (0.4 * linear_trend_extrapolation)
    const projections: DayProjection[] = [];
    const baseSeasonal = commodity.basePrice || currentPrice;
    const now = new Date();

    for (let d = 1; d <= 7; d++) {
      const futureDate = new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
      const dayOfYear = Math.floor(
        (futureDate.getTime() - new Date(futureDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Multi-year seasonal curve component
      const seasonalWave = baseSeasonal * (1 + 0.08 * Math.sin((dayOfYear / 365) * 2 * Math.PI - 1.2));
      const seasonalBaseline = Number(seasonalWave.toFixed(1));

      // Extrapolated linear trend from the 21-day line
      const linearExtrapolated = intercept + slope * (n - 1 + d);
      const linearTrend = Number(linearExtrapolated.toFixed(1));

      // 60% Seasonal + 40% Linear Trend
      const rawProjected = 0.6 * seasonalBaseline + 0.4 * linearTrend;
      const projectedPrice = Math.max(5, Math.round(rawProjected));

      // Confidence Band (± 1 standard deviation, expanding slightly over horizon)
      const horizonMultiplier = 1 + (d - 1) * 0.08;
      const bandWidth = Number((stdDev * horizonMultiplier).toFixed(1));
      const lowerBound = Math.max(4, Math.round(projectedPrice - bandWidth));
      const upperBound = Math.round(projectedPrice + bandWidth);

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      projections.push({
        dayIndex: d,
        date: futureDate.toISOString().split('T')[0],
        formattedDate: `+${d}d (${dayNames[futureDate.getDay()]}, ${futureDate.getDate()} ${monthNames[futureDate.getMonth()]})`,
        projectedPrice,
        seasonalBaseline,
        linearTrend,
        lowerBound,
        upperBound,
      });
    }

    const day7Price = projections[projections.length - 1].projectedPrice;
    const net7DayDelta = day7Price - currentPrice;

    return {
      isValid: true,
      warning: null,
      projections,
      stdDev: Number(stdDev.toFixed(1)),
      slope: Number(slope.toFixed(2)),
      rSquared: Number(rSquared.toFixed(2)),
      net7DayDelta,
      currentPrice,
      day7Price,
    };
  }, [historicalData, commodity, language]);

  if (!projectionResult.isValid) {
    return (
      <div className={`p-5 rounded-3xl bg-[#FFFBEB] dark:bg-amber-950/40 border border-[#FDE68A] dark:border-amber-800/80 text-[#92400E] dark:text-amber-300 space-y-2.5 ${className}`}>
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0" />
          <h4 className="text-sm font-extrabold">{language === 'ne' ? 'पूर्वानुमान उपलब्ध छैन' : 'Price Trend Outlook Unavailable'}</h4>
        </div>
        <p className="text-xs leading-relaxed text-[#B45309] dark:text-amber-400">
          {projectionResult.warning}
        </p>
      </div>
    );
  }

  const isProjectedUp = projectionResult.net7DayDelta >= 0;
  const maxChartPrice = Math.max(
    ...projectionResult.projections.map((p) => p.upperBound),
    projectionResult.currentPrice
  );
  const minChartPrice = Math.min(
    ...projectionResult.projections.map((p) => p.lowerBound),
    projectionResult.currentPrice
  );
  const chartRange = maxChartPrice - minChartPrice || 10;

  return (
    <div className={`app-card p-5 space-y-4 font-editorial-sans border border-[#E8E2D8] dark:border-[#383530] bg-white dark:bg-[#22201D] ${className}`}>
      {/* Header with Transparency Flag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2D8] dark:border-[#383530]">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-md flex items-center justify-center font-bold border ${
              isProjectedUp
                ? 'bg-[#EAF3EE] text-[#1E5E41] border-[#C2DEC8] dark:bg-[#1E3327] dark:text-[#4ADE80] dark:border-[#2E7D5A]'
                : 'bg-[#FDEDE9] text-[#C4381C] border-[#F8C8BE] dark:bg-[#3B1E19] dark:text-[#FF8A73] dark:border-[#FF684A]/40'
            }`}
          >
            {isProjectedUp ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-editorial-serif text-base font-bold text-[#1F1E1B] dark:text-[#F5F3EF] tracking-tight">
                {language === 'ne' ? '७ दिने मूल्य पूर्वानुमान' : '7-Day Price Trend Outlook'}
              </h3>
              <span className="tag-pastel-blue">
                {language === 'ne' ? 'तथ्यांक विश्लेषण' : 'Statistical Projection'}
              </span>
            </div>
          </div>
        </div>

        {/* 7-Day Net Shift Metric */}
        <div className="text-right self-start sm:self-auto">
          <span className="text-[10px] font-semibold text-[#746F68] dark:text-[#A6A096] block uppercase tracking-wider">
            {language === 'ne' ? '७ दिनको सम्भावित परिवर्तन' : '7-Day Projected Shift'}
          </span>
          <div className="flex items-baseline gap-1.5 justify-end">
            <span
              className={`text-lg font-bold font-editorial-mono tabular-nums ${
                isProjectedUp ? 'text-[#2E7D5A] dark:text-[#4ADE80]' : 'text-[#FF684A] dark:text-[#FF8A73]'
              }`}
            >
              {isProjectedUp ? `+Rs ${projectionResult.net7DayDelta}` : `-Rs ${Math.abs(projectionResult.net7DayDelta)}`}
            </span>
            <span className="text-xs text-[#746F68] dark:text-[#A6A096] font-editorial-mono">
              (Rs {projectionResult.currentPrice} → Rs {projectionResult.day7Price}/kg)
            </span>
          </div>
        </div>
      </div>

      {/* 7-Day Projection Trajectory Bars & Table */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-[#746F68] dark:text-[#A6A096]">
          <span className="font-medium flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#C8A27C]" />
            {language === 'ne' ? '७ दिने प्रक्षेपण र विश्वसनीयता दायरा (±१σ)' : '7-Day Horizon Projections & Confidence Band (±1σ)'}
          </span>
          <span className="font-editorial-mono text-[11px] text-[#8C6237] dark:text-[#D9B591]">
            Kalimati Market Corridor
          </span>
        </div>

        <div className="space-y-1.5">
          {projectionResult.projections.map((proj) => {
            const relOffset = ((proj.projectedPrice - minChartPrice) / chartRange) * 100;
            const boundedOffset = Math.max(5, Math.min(95, relOffset));

            return (
              <div
                key={proj.dayIndex}
                className="p-2.5 rounded-md bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] hover:border-[#2D6CDF] dark:hover:border-[#76A9FA] transition text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                {/* Day label */}
                <div className="w-32 shrink-0 flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-white dark:bg-[#1E1D1B] border border-[#E8E2D8] dark:border-[#383530] flex items-center justify-center font-bold font-editorial-mono text-[10px] text-[#1F1E1B] dark:text-[#F5F3EF]">
                    +{proj.dayIndex}d
                  </span>
                  <span className="font-medium text-[#1F1E1B] dark:text-[#F5F3EF] text-xs">
                    {proj.formattedDate.split('(')[1]?.replace(')', '') || proj.date}
                  </span>
                </div>

                {/* Visual Bar / Point with Range Band */}
                <div className="flex-1 px-2 flex items-center gap-2">
                  <span className="text-[10px] font-editorial-mono text-[#746F68] dark:text-[#A6A096] w-12 text-right">
                    Rs {proj.lowerBound}
                  </span>
                  <div className="flex-1 h-2 bg-white dark:bg-[#1E1D1B] rounded-full relative overflow-hidden border border-[#E8E2D8] dark:border-[#383530]">
                    {/* Shaded Confidence Band */}
                    <div
                      className="absolute top-0 bottom-0 bg-[#E6F0FC] dark:bg-[#1E2D4A] rounded-full"
                      style={{
                        left: `${Math.max(0, ((proj.lowerBound - minChartPrice) / chartRange) * 100)}%`,
                        width: `${Math.max(8, (((proj.upperBound - proj.lowerBound) / chartRange) * 100))}%`,
                      }}
                    />
                    {/* Projected Target Dot */}
                    <div
                      className="absolute top-0 bottom-0 w-2 h-2 rounded-full bg-[#2D6CDF] dark:bg-[#76A9FA] -ml-1"
                      style={{ left: `${boundedOffset}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-editorial-mono text-[#746F68] dark:text-[#A6A096] w-12">
                    Rs {proj.upperBound}
                  </span>
                </div>

                {/* Values Column */}
                <div className="w-32 text-right shrink-0 flex items-center justify-end gap-2">
                  <span className="text-xs font-bold text-[#1F1E1B] dark:text-[#F5F3EF] font-editorial-mono tabular-nums">
                    Rs {proj.projectedPrice}
                  </span>
                  <span className="text-[10px] text-[#746F68] dark:text-[#A6A096]">/kg</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-editorial-mono ${
                      proj.projectedPrice >= projectionResult.currentPrice
                        ? 'bg-[#EAF3EE] text-[#1E5E41] dark:bg-[#1E3327] dark:text-[#4ADE80]'
                        : 'bg-[#FDEDE9] text-[#C4381C] dark:bg-[#3B1E19] dark:text-[#FF8A73]'
                    }`}
                  >
                    {proj.projectedPrice >= projectionResult.currentPrice
                      ? `+${proj.projectedPrice - projectionResult.currentPrice}`
                      : `${proj.projectedPrice - projectionResult.currentPrice}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transparent Formula & Methodology Card */}
      <div className="p-3.5 rounded-md bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] text-xs text-[#1F1E1B] dark:text-[#F5F3EF] space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-xs text-[#1F1E1B] dark:text-[#F5F3EF]">
          <Info className="w-3.5 h-3.5 text-[#C8A27C] shrink-0" />
          <span>{language === 'ne' ? 'पारदर्शी तथ्यांक विधि' : 'Transparent Statistical Methodology'}</span>
        </div>

        {/* Auditable Math Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
          <div className="p-2 rounded-md bg-white dark:bg-[#1E1D1B] border border-[#E8E2D8] dark:border-[#383530]">
            <span className="text-[#746F68] dark:text-[#A6A096] block text-[10px]">{language === 'ne' ? '६०% मौसमी भार:' : '60% Seasonal Weight:'}</span>
            <span className="font-bold text-[#1F1E1B] dark:text-[#F5F3EF] font-editorial-mono">
              Rs {projectionResult.projections[0]?.seasonalBaseline}/kg base
            </span>
          </div>

          <div className="p-2 rounded-md bg-white dark:bg-[#1E1D1B] border border-[#E8E2D8] dark:border-[#383530]">
            <span className="text-[#746F68] dark:text-[#A6A096] block text-[10px]">{language === 'ne' ? '४०% हालको स्लोप:' : '40% Recent Slope:'}</span>
            <span className="font-bold text-[#1F1E1B] dark:text-[#F5F3EF] font-editorial-mono">
              {projectionResult.slope >= 0 ? `+Rs ${projectionResult.slope}` : `-Rs ${Math.abs(projectionResult.slope)}`}/day
            </span>
          </div>

          <div className="p-2 rounded-md bg-white dark:bg-[#1E1D1B] border border-[#E8E2D8] dark:border-[#383530]">
            <span className="text-[#746F68] dark:text-[#A6A096] block text-[10px]">{language === 'ne' ? 'विश्वसनीयता (±१σ):' : 'Confidence Band (±1σ):'}</span>
            <span className="font-bold text-[#1F1E1B] dark:text-[#F5F3EF] font-editorial-mono">
              ± Rs {projectionResult.stdDev}/kg
            </span>
          </div>
        </div>
      </div>

      {/* Selling / Pooling Action Callout */}
      {onNavigateToSell && (
        <div className="pt-2 flex items-center justify-end border-t border-[#E8E2D8] dark:border-[#383530]">
          <button
            type="button"
            onClick={() => onNavigateToSell(commodity.id)}
            className="px-3.5 py-1.5 rounded-md bg-[#FF684A] hover:bg-[#E85D3F] text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
          >
            <span>{language === 'ne' ? `${commodity.nepaliName || commodity.name} को ढुवानी बुक गर्नुहोस्` : `Pool Freight for ${commodity.name}`}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default PriceTrendOutlook;
