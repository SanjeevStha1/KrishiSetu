import React from 'react';
import {
  AlertTriangle,
  Flame,
  Radio,
  Clock,
  MapPin,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { SAMPLE_DISRUPTIONS } from '../data/agriData';

export const DisruptionFeed: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAF8F4] border border-[#E8E2D9] flex items-center justify-center">
            <Radio className="w-5 h-5 text-[#A5453D] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#2B2621]">Disruption Intelligence Feed</h2>
              <span className="px-2 py-0.5 rounded bg-[#FAF8F4] text-[#A5453D] text-xs font-medium border border-[#E8E2D9]">
                Live NLP Parsing
              </span>
            </div>
            <p className="text-xs text-[#6B625A]">
              Automated Disruption Entity & Impact Extraction (10 Event Archetypes + Highway Telemetry)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#6B625A]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#A5453D]" />
            1 Critical
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#D9732E]" />
            2 High
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#4A6B4E]" />
            1 Advisory
          </span>
        </div>
      </div>

      {/* Disruption Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SAMPLE_DISRUPTIONS.map((alert) => {
          const isCritical = alert.severity === 'critical';
          const isHigh = alert.severity === 'high';

          return (
            <div
              key={alert.id}
              id={`alert-card-${alert.id}`}
              className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-2xl p-6 shadow-xs space-y-4 transition"
            >
              {/* Header Badges */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                      isCritical
                        ? 'bg-[#FAF8F4] text-[#A5453D] border border-[#E8E2D9]'
                        : isHigh
                        ? 'bg-[#FAF8F4] text-[#D9732E] border border-[#E8E2D9]'
                        : 'bg-[#FAF8F4] text-[#4A6B4E] border border-[#E8E2D9]'
                    }`}
                  >
                    {alert.severity} • {alert.eventType.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-[#6B625A] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {alert.timestamp}
                  </span>
                </div>

                <span className="text-xs text-[#4A6B4E] font-bold">
                  {(alert.confidence * 100).toFixed(0)}% Confidence
                </span>
              </div>

              {/* Title & Summary */}
              <div>
                <h3 className="text-base font-bold text-[#2B2621] mb-1.5 leading-snug">{alert.title}</h3>
                <p className="text-xs text-[#6B625A] leading-relaxed">{alert.summary}</p>
              </div>

              {/* Impact Matrix */}
              <div className="grid grid-cols-3 gap-2 bg-[#FAF8F4] p-3.5 rounded-xl border border-[#E8E2D9] text-xs">
                <div>
                  <span className="text-[#6B625A] block text-[10px]">Price Shock</span>
                  <span
                    className={`font-bold text-sm ${
                      alert.priceImpactPct > 0 ? 'text-[#A5453D]' : 'text-[#4A6B4E]'
                    }`}
                  >
                    {alert.priceImpactPct > 0 ? `+${alert.priceImpactPct}%` : `${alert.priceImpactPct}%`}
                  </span>
                </div>

                <div>
                  <span className="text-[#6B625A] block text-[10px]">Supply Flux</span>
                  <span
                    className={`font-bold text-sm ${
                      alert.supplyImpactPct < 0 ? 'text-[#A5453D]' : 'text-[#4A6B4E]'
                    }`}
                  >
                    {alert.supplyImpactPct > 0 ? `+${alert.supplyImpactPct}%` : `${alert.supplyImpactPct}%`}
                  </span>
                </div>

                <div>
                  <span className="text-[#6B625A] block text-[10px]">Time to Impact</span>
                  <span className="font-bold text-sm text-[#2B2621]">
                    {alert.timeToImpactHours} Hours
                  </span>
                </div>
              </div>

              {/* Affected Tags */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[#6B625A] text-[11px]">Affected Crops:</span>
                  {alert.affectedCommodities.map((c, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-[#FAF8F4] text-[#2B2621] text-[11px] border border-[#E8E2D9]">
                      {c}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[#6B625A] text-[11px]">Key Corridor:</span>
                  {alert.affectedRoutes.map((r, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-[#FAF8F4] text-[#D9732E] text-[11px] border border-[#E8E2D9]">
                      {r}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#E8E2D9] text-[11px] text-[#6B625A] flex items-center justify-between">
                  <span>Source: {alert.source}</span>
                  <span className="text-[#4A6B4E] font-medium">Duration: ~{alert.durationDays} days</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
