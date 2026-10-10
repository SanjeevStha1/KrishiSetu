import React from 'react';
import { TransparencyItem } from '../types/krishi';
import { TRANSPARENCY_DISCLOSURE } from '../data/agriData';
import { ShieldCheck, CheckCircle2, AlertTriangle, Cpu, Database, Info, X, Layers } from 'lucide-react';

interface TransparencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransparencyModal: React.FC<TransparencyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto text-[#2B2118] shadow-2xl border border-[#EBE4D5] flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#245A3E] text-white p-5 sm:p-6 rounded-t-3xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#E2D8C3] hover:text-white p-2 rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="inline-flex items-center gap-1.5 bg-white/15 text-[#82E0AA] border border-white/20 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Technical Honesty & Methodology
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            What's Live vs. Simulated in this Demo
          </h2>
          <p className="text-xs text-[#E2D8C3] mt-1.5 leading-relaxed">
            We believe in total engineering transparency. Here is the exact breakdown of the real machine learning algorithms, real Kalimati market data, and simulated demonstration layers.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="bg-[#EBF5EE] border border-[#245A3E]/20 rounded-2xl p-4 text-xs text-[#2B2118] flex items-start gap-3">
            <Info className="w-4 h-4 text-[#245A3E] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Pitch Rule of Honesty:</p>
              <p className="text-[#6E6155] mt-0.5">
                "Pooling demo uses simulated farmer registrations to illustrate the matching mechanism — in production this runs on live registered users."
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {TRANSPARENCY_DISCLOSURE.map((item, idx) => {
              const isLive = item.type === 'live';
              const isSim = item.type === 'simulated';

              return (
                <div
                  key={idx}
                  className="bg-[#F7F4EB] rounded-2xl p-4 border border-[#E8DFD0] hover:border-[#245A3E]/30 transition space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-[#6E6155] uppercase tracking-wider block">
                        {item.category}
                      </span>
                      <h4 className="font-extrabold text-sm text-[#2B2118] mt-0.5">{item.title}</h4>
                    </div>

                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase shrink-0 flex items-center gap-1 ${
                        isLive
                          ? 'bg-[#245A3E] text-white'
                          : isSim
                          ? 'bg-[#FBF6EE] text-[#C88A34] border border-[#C88A34]/40'
                          : 'bg-[#F7F4EB] text-[#6E6155] border border-[#E8DFD0]'
                      }`}
                    >
                      {isLive && <CheckCircle2 className="w-3 h-3 text-[#82E0AA]" />}
                      {isSim && <Database className="w-3 h-3 text-[#C88A34]" />}
                      {item.type.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-[#6E6155] leading-relaxed">{item.details}</p>

                  <div className="bg-white rounded-xl p-2.5 border border-[#EBE4D5] flex items-center gap-2 text-[11px]">
                    <span className="font-bold text-[#2B2118] shrink-0">Source / Proof:</span>
                    <span className="text-[#245A3E] font-semibold">{item.honestyNote}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#F7F4EB] border-t border-[#EBE4D5] p-4 sm:p-5 flex items-center justify-between rounded-b-3xl">
          <span className="text-[11px] text-[#6E6155]">
            KrishiSetu Architecture Specification v3.0
          </span>
          <button
            onClick={onClose}
            className="bg-[#245A3E] hover:bg-[#1C4731] text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs cursor-pointer"
          >
            Got it, Back to App
          </button>
        </div>
      </div>
    </div>
  );
};

