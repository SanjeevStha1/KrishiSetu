import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Award, Quote, MapPin, Sparkles } from 'lucide-react';
import { NEPAL_FARMER_PROFILES } from '../data/nepalAgriImages';
import { useLanguage } from '../context/LanguageContext';

interface FarmerStoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FarmerStoriesModal: React.FC<FarmerStoriesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans text-[#1E2119] dark:text-[#F4F2EA] animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: 'spring', damping: 25, stiffness: 260 }}
        className="bg-[#FCFAF6] dark:bg-[#1E1D1A] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E4E0D8] dark:border-[#38362F] shadow-2xl flex flex-col relative transition-colors duration-200"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#262421] dark:bg-[#151413] text-[#FCFAF6] dark:text-[#F2EFE9] border-b border-[#38362F] sticky top-0 z-20 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EE6C33] text-[#FCFAF6] flex items-center justify-center shadow-md">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">
                  Farmer Stories & Example Savings
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-[#FCFAF6]">
                  Illustrative Cases
                </span>
              </div>
              <p className="text-xs text-[#D1CCC4] dark:text-[#9B9790] line-clamp-1">
                Smallholder operational profiles illustrating freight pooling & market timing impact
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-[#FCFAF6] flex items-center justify-center transition cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="p-3.5 rounded-2xl bg-[#F7F4EF] dark:bg-[#242320] border border-[#E4E0D8] dark:border-[#38362F] text-xs text-[#6B6862] dark:text-[#9B9790] leading-relaxed">
            <p>
              <strong className="text-[#EE6C33]">Transparency Note:</strong> The profiles below reflect representative smallholder farm typologies across Chitwan, Dhading, and Kavre corridors. Savings numbers demonstrate the modeled economic difference between solo freight transport vs. aggregated group logistics and terminal timing.
            </p>
          </div>

          <div className="space-y-3.5">
            {NEPAL_FARMER_PROFILES.map((farmer) => (
              <div
                key={farmer.id}
                className="p-4 sm:p-5 rounded-2xl bg-[#F7F4EF] dark:bg-[#242320] border border-[#E4E0D8] dark:border-[#38362F] flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={farmer.avatarUrl}
                      alt={farmer.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#E4E0D8] dark:border-[#38362F] shadow-xs shrink-0"
                    />
                    <div>
                      <div className="font-bold text-sm text-[#262421] dark:text-[#F2EFE9]">{farmer.name}</div>
                      <div className="text-xs text-[#6B6862] dark:text-[#9B9790] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#EE6C33]" />
                        <span>{farmer.locationDetail}</span>
                      </div>
                      <div className="text-[11px] font-semibold text-[#EE6C33] mt-0.5">
                        {farmer.landHolding} • {farmer.primaryCrops.join(', ')}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-[#6B6862] dark:text-[#9B9790] block">Example Margin Gain</span>
                    <span className="font-mono font-bold text-xs text-[#262421] dark:text-[#F2EFE9] bg-[#FCFAF6] dark:bg-[#1E1D1A] px-2 py-1 rounded-lg border border-[#E4E0D8] dark:border-[#38362F] inline-block mt-0.5">
                      {farmer.verifiedSavings}
                    </span>
                  </div>
                </div>

                <div className="relative pl-3 border-l-2 border-[#EE6C33]/40 text-xs italic text-[#454A3D] dark:text-[#D1CCC4] leading-relaxed">
                  “{farmer.quote}”
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F7F4EF] dark:bg-[#151413] border-t border-[#E4E0D8] dark:border-[#38362F] rounded-b-3xl flex items-center justify-between text-xs text-[#6B6862] dark:text-[#9B9790]">
          <span className="text-[11px]">KrishiSetu Smallholder Economic Models</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#262421] dark:bg-[#FCFAF6] text-[#FCFAF6] dark:text-[#1A1917] font-bold text-xs transition cursor-pointer shadow-xs"
          >
            {t('common.close', 'Close')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
