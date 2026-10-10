import React, { useState } from 'react';
import {
  Layers,
  Database,
  Cpu,
  Globe2,
  CheckCircle2,
  X,
  Radio,
  FileCode,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FCFAF6] rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-[#E4E0D8] shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 text-[#262421]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E4E0D8]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#262421] text-[#A97C61] flex items-center justify-center shadow-xs">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#262421]">
                How KrishiSetu Works & Technical Rigor
              </h2>
              <p className="text-xs text-[#6B6862]">
                Methodology, Data Sources, and Architecture for Judges
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F7F4EF] hover:bg-[#E4E0D8] text-[#262421] flex items-center justify-center transition font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Core Architectural One-Liner */}
        <div className="bg-[#F7F4EF] border border-[#E4E0D8] rounded-2xl p-4 text-xs sm:text-sm text-[#262421] leading-relaxed">
          <p>
            <strong className="text-[#A97C61]">Engine Portability: </strong>
            Built on a generic pooling and forecasting engine — this version runs on Nepali market data, but the mechanism applies anywhere smallholder farmers sell into fragmented local markets.
          </p>
        </div>

        {/* 1. Forecasting Methodology */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#A97C61] uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>1. Forecasting & Decision Methodology</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F7F4EF] border border-[#E4E0D8] space-y-1">
              <span className="font-bold text-[#262421] block">Fourier Seasonal Decomposition</span>
              <p className="text-[#6B6862]">
                Captures annual monsoonal cycles, Dashain/Tihar holiday demand spikes, and weekly Mandi trading patterns across historical arrival volumes.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F7F4EF] border border-[#E4E0D8] space-y-1">
              <span className="font-bold text-[#262421] block">Lagged Weather & Highway Features</span>
              <p className="text-[#6B6862]">
                Ingests 48-hour precipitation anomalies from DHM Nepal and Prithvi Highway clearance states to forecast farmgate price volatility.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Official Data Sources */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#A97C61] uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span>2. Data Sources & Verified Baselines</span>
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F7F4EF] border border-[#E4E0D8]">
              <span className="w-2 h-2 rounded-full bg-[#A97C61] mt-1.5 shrink-0"></span>
              <div>
                <strong className="text-[#262421]">Kalimati Fruit & Vegetable Market Board: </strong>
                Daily wholesale arrival volumes and commodity price series across Kathmandu terminals.
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F7F4EF] border border-[#E4E0D8]">
              <span className="w-2 h-2 rounded-full bg-[#A97C61] mt-1.5 shrink-0"></span>
              <div>
                <strong className="text-[#262421]">Department of Hydrology & Meteorology (DHM): </strong>
                Precipitation and extreme weather alerts across agricultural hill and Terai corridors.
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F7F4EF] border border-[#E4E0D8]">
              <span className="w-2 h-2 rounded-full bg-[#A97C61] mt-1.5 shrink-0"></span>
              <div>
                <strong className="text-[#262421]">MoALD / DADO Agriculture Bulletins: </strong>
                District-level yield constants (kg per Ropani) and planting schedules.
              </div>
            </div>
          </div>
        </div>

        {/* 3. Transparent Disclosure: Live vs. Simulated */}
        <div className="space-y-2 bg-[#F7F4EF] border border-[#A97C61]/30 p-4 rounded-2xl text-xs text-[#262421]">
          <span className="font-black text-[#262421] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#A97C61]" />
            <span>Demo Transparency Disclosure</span>
          </span>
          <p className="text-[#6B6862] leading-relaxed">
            The pooling and price data shown is simulated for this demo; the underlying engine is what is real, and it is designed to run on live data with no schema changes.
          </p>
        </div>

        {/* 4. Exactly Two Roadmap Lines */}
        <div className="space-y-3 pt-2 border-t border-[#E4E0D8]">
          <h3 className="text-sm font-bold text-[#6B6862] uppercase tracking-wider">
            Future Product Roadmap (1-Line Slides)
          </h3>
          <div className="space-y-2 text-xs text-[#262421]">
            <div className="p-3 rounded-xl bg-[#F7F4EF] border border-[#E4E0D8]">
              <strong>Roadmap 1: </strong>
              Low-bandwidth SMS (1660) and interactive voice hotline access for non-smartphone smallholders.
            </div>
            <div className="p-3 rounded-xl bg-[#F7F4EF] border border-[#E4E0D8]">
              <strong>Roadmap 2: </strong>
              Expansion beyond Nepal across South Asia and East Africa using the same generic pooling and forecasting engine.
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-[#A97C61] hover:bg-[#96694F] text-[#FCFAF6] font-black py-3 rounded-xl transition shadow-xs text-sm cursor-pointer"
        >
          Close Methodology & Return to App
        </button>
      </div>
    </div>
  );
};
