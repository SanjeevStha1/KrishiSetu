import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  Send,
  MapPin,
  Sprout,
  Radio,
  X,
  Check,
} from 'lucide-react';
import { Commodity } from '../types/krishi';
import { DISTRICT_LIST, COMMODITY_SEEDS } from '../data/agriData';
import { InAppMessageService } from '../services/inAppMessageService';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDistrict: string;
  initialCropId?: string;
  commodities: Commodity[];
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  isOpen,
  onClose,
  selectedDistrict,
  initialCropId = 'tomato',
  commodities,
}) => {
  const [district, setDistrict] = useState(selectedDistrict || 'chitwan');
  const [selectedCropIds, setSelectedCropIds] = useState<string[]>([
    initialCropId,
    'potato',
    'cauliflower',
  ]);
  const [dailySubscription, setDailySubscription] = useState(true);
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleCrop = (cropId: string) => {
    if (selectedCropIds.includes(cropId)) {
      if (selectedCropIds.length > 1) {
        setSelectedCropIds(selectedCropIds.filter((id) => id !== cropId));
      }
    } else {
      if (selectedCropIds.length < 4) {
        setSelectedCropIds([...selectedCropIds, cropId]);
      }
    }
  };

  const districtObj =
    DISTRICT_LIST.find((d) => d.id.toLowerCase() === district.toLowerCase()) || DISTRICT_LIST[0];

  const cropSummaries = selectedCropIds
    .map((id) => {
      const comm = commodities.find((c) => c.id === id);
      const price = comm?.currentPrice || 45;
      const name = comm?.nameNepali || comm?.name || id;
      return `${name} रु ${price}/केजी`;
    })
    .join(', ');

  const previewMessage = `[कालिमाटी दैनिक दर] ${districtObj.name} मन्डी: ${cropSummaries}। ढुवानी पुलिङ सक्रिय।`;

  const handleSendAlert = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setErrorMsg(null);

    setTimeout(() => {
      InAppMessageService.generatePriceBulletin(districtObj.name, cropSummaries);
      setSending(false);
      setSentSuccess(true);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans text-[#262421] dark:text-[#F2EFE9]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-[#FCFAF6] dark:bg-[#1E1D1A] rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-[#E4E0D8] dark:border-[#38362F] shadow-2xl space-y-5 relative max-h-[92vh] overflow-y-auto text-[#262421] dark:text-[#F2EFE9]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F7F4EF] dark:bg-[#242320] hover:bg-[#EAE5DC] dark:hover:bg-[#2E2C27] text-[#262421] dark:text-[#F2EFE9] flex items-center justify-center font-bold text-xs transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#A97C61] dark:bg-[#C99678] text-[#FCFAF6] dark:text-[#1A1917] flex items-center justify-center shadow-xs">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-[#262421] dark:text-[#F2EFE9] tracking-tight">
                दैनिक मूल्य सन्देश तथा सतर्कता
              </h2>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#F7F4EF] dark:bg-[#242320] text-[#A97C61] dark:text-[#C99678] border border-[#A97C61]/30">
                In-App
              </span>
            </div>
            <p className="text-xs text-[#6B6862] dark:text-[#9B9790]">
              In-App Daily Mandi Rates & Instant Arbitrage Alerts
            </p>
          </div>
        </div>

        {/* Success State */}
        {sentSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 bg-[#F7F4EF] dark:bg-[#242320] border border-[#A97C61]/50 dark:border-[#C99678]/50 rounded-2xl space-y-3 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-[#A97C61] dark:bg-[#C99678] text-[#FCFAF6] dark:text-[#1A1917] mx-auto flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base text-[#262421] dark:text-[#F2EFE9]">
                मूल्य सन्देश एपमा प्राप्त भयो!
              </h3>
              <p className="text-xs text-[#6B6862] dark:text-[#9B9790] mt-1">
                तपाईंको इन-एप सन्देश केन्द्रमा ताजा कालिमाटी दर बुलेटिन सफलतापूर्वक पठाइएको छ।
              </p>
            </div>

            <div className="p-3 bg-[#FCFAF6] dark:bg-[#1E1D1A] rounded-xl border border-[#E4E0D8] dark:border-[#38362F] text-xs text-[#44403B] dark:text-[#D1CCC4] text-left">
              <div className="font-bold text-[#A97C61] dark:text-[#C99678] mb-1">पठाइएको सन्देश:</div>
              <p className="font-sans leading-relaxed">{previewMessage}</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSentSuccess(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#38362F] bg-[#FCFAF6] dark:bg-[#1E1D1A] text-xs font-bold text-[#262421] dark:text-[#F2EFE9] hover:bg-[#EAE5DC] dark:hover:bg-[#2E2C27] transition cursor-pointer"
              >
                अर्को सन्देश पठाउनुहोस्
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-[#262421] dark:bg-[#FCFAF6] text-[#FCFAF6] dark:text-[#1A1917] text-xs font-bold hover:bg-[#36332E] transition cursor-pointer"
              >
                सम्पन्न भयो (Done)
              </button>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSendAlert} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-[#F7F4EF] dark:bg-[#242320] border border-[#A97C61]/50 rounded-xl text-xs text-[#A97C61] dark:text-[#C99678] font-bold">
                {errorMsg}
              </div>
            )}

            {/* Target Mandi Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#262421] dark:text-[#F2EFE9] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#6B6862] dark:text-[#9B9790]" />
                लक्षित जिल्ला / मन्डी बजार (Target Mandi Market)
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#38362F] bg-[#F7F4EF] dark:bg-[#242320] text-xs font-bold text-[#262421] dark:text-[#F2EFE9] outline-none"
              >
                {DISTRICT_LIST.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.zone})
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Crops */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#262421] dark:text-[#F2EFE9] flex items-center gap-1.5">
                  <Sprout className="w-3.5 h-3.5 text-[#6B6862] dark:text-[#9B9790]" />
                  मूल्य ट्र्याक गर्ने बालीहरू (Select 1-4 Crops)
                </label>
                <span className="text-[11px] text-[#6B6862] dark:text-[#9B9790]">
                  {selectedCropIds.length}/4 चयन गरियो
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {COMMODITY_SEEDS.map((crop) => {
                  const isSelected = selectedCropIds.includes(crop.id);
                  return (
                    <button
                      key={crop.id}
                      type="button"
                      onClick={() => toggleCrop(crop.id)}
                      className={`p-2 rounded-xl text-left border transition text-xs font-bold flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-[#A97C61] dark:bg-[#C99678] text-[#FCFAF6] dark:text-[#1A1917] border-[#A97C61] dark:border-[#C99678] shadow-xs'
                          : 'bg-[#F7F4EF] dark:bg-[#242320] text-[#262421] dark:text-[#F2EFE9] border-[#E4E0D8] dark:border-[#38362F] hover:border-[#A97C61] dark:hover:border-[#C99678]'
                      }`}
                    >
                      <span className="truncate">{crop.nepaliName}</span>
                      <span
                        className={`text-[10px] ${
                          isSelected ? 'text-[#FCFAF6]/80 dark:text-[#1A1917]/80' : 'text-[#6B6862] dark:text-[#9B9790]'
                        }`}
                      >
                        {crop.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* In-App Live Preview */}
            <div className="p-3.5 bg-[#F7F4EF] dark:bg-[#242320] rounded-2xl border border-[#E4E0D8] dark:border-[#38362F] space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#6B6862] dark:text-[#9B9790]">
                <span className="flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-[#A97C61] dark:text-[#C99678] animate-pulse" />
                  इन-एप सन्देश पूर्वावलोकन (Live App Preview)
                </span>
                <span className="text-[#A97C61] dark:text-[#C99678] font-mono font-bold">In-App Direct</span>
              </div>
              <div className="p-3 bg-[#FCFAF6] dark:bg-[#1E1D1A] rounded-xl border border-[#E4E0D8] dark:border-[#38362F] text-xs font-sans text-[#262421] dark:text-[#F2EFE9] leading-relaxed">
                {previewMessage}
              </div>
            </div>

            {/* Daily Subscription Toggle */}
            <label className="flex items-center gap-3 p-3 bg-[#F7F4EF] dark:bg-[#242320] rounded-xl border border-[#E4E0D8] dark:border-[#38362F] cursor-pointer">
              <input
                type="checkbox"
                checked={dailySubscription}
                onChange={(e) => setDailySubscription(e.target.checked)}
                className="w-4 h-4 rounded accent-[#A97C61] dark:accent-[#C99678]"
              />
              <div className="text-xs">
                <span className="font-bold text-[#262421] dark:text-[#F2EFE9] block">
                  दैनिक बिहान ७:०० बजे स्वचालित दर बुलेटिन प्राप्त गर्नुहोस्
                </span>
                <span className="text-[11px] text-[#6B6862] dark:text-[#9B9790]">
                  Daily 7:00 AM automated Kalimati Mandi price bulletin delivered in-app
                </span>
              </div>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={sending || selectedCropIds.length === 0}
              className="w-full py-3.5 rounded-xl bg-[#A97C61] dark:bg-[#C99678] text-[#FCFAF6] dark:text-[#1A1917] text-xs font-black hover:bg-[#96694F] dark:hover:bg-[#B88567] transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>
                {sending ? 'एपमा पठाउँदै...' : 'ताजा मूल्य बुलेटिन प्राप्त गर्नुहोस् (Deliver to App)'}
              </span>
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
