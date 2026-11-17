import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Phone,
  MapPin,
  Sprout,
  Clock,
  Radio,
  X,
  AlertCircle,
  Smartphone,
  Sparkles,
  Copy,
} from 'lucide-react';
import { Commodity } from '../types/krishi';
import { DISTRICT_LIST, COMMODITY_SEEDS } from '../data/agriData';
import { AuthService } from '../services/authService';
import { InAppMessageService } from '../services/inAppMessageService';
import { marketApi, RegionalCropPrice } from '../api/marketApi';
import { smsApi, SmsGatewayConfig, SmsSendResponse } from '../api/smsApi';

interface SmsPriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDistrict: string;
  initialCropId?: string;
  commodities: Commodity[];
}

export const SmsPriceAlertModal: React.FC<SmsPriceAlertModalProps> = ({
  isOpen,
  onClose,
  selectedDistrict,
  initialCropId = 'tomato',
  commodities,
}) => {
  const currentUser = AuthService.getCurrentUser();
  const [phone, setPhone] = useState(
    currentUser?.phone?.replace('+977', '').replace(/\s+/g, '').trim() || '9845012345'
  );
  const [district, setDistrict] = useState(selectedDistrict || 'chitwan');
  const [selectedCropIds, setSelectedCropIds] = useState<string[]>([
    initialCropId,
    'potato',
    'cauliflower',
  ]);
  const [dailySubscription, setDailySubscription] = useState(true);
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState<SmsSendResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [gatewayInfo, setGatewayInfo] = useState<SmsGatewayConfig | null>(null);
  const [regionalPrices, setRegionalPrices] = useState<RegionalCropPrice[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    smsApi
      .getConfig()
      .then((data) => setGatewayInfo(data))
      .catch(() => {});
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !district) return;
    marketApi
      .getRegionalPrices(district)
      .then((res) => {
        if (res.prices) setRegionalPrices(res.prices);
      })
      .catch(() => {});
  }, [isOpen, district]);

  if (!isOpen) return null;

  const toggleCrop = (cropId: string) => {
    if (selectedCropIds.includes(cropId)) {
      if (selectedCropIds.length > 1) {
        setSelectedCropIds(selectedCropIds.filter((id) => id !== cropId));
      }
    } else if (selectedCropIds.length < 4) {
      setSelectedCropIds([...selectedCropIds, cropId]);
    }
  };

  const districtName =
    DISTRICT_LIST.find((d) => d.id.toLowerCase() === district.toLowerCase())?.name || 'Chitwan';
  const todayDateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const cropSummaries = selectedCropIds
    .map((id) => {
      const reg = regionalPrices.find((p) => p.cropId === id);
      const comm = commodities.find((c) => c.id === id);
      const price = reg ? reg.localizedWholesalePrice : Math.round(comm?.currentPrice || 45);
      const name = (reg?.name || comm?.name || id).split('(')[0].trim();
      return `${name} Rs${price}`;
    })
    .join(', ');

  const hasCoop = selectedCropIds.some(
    (id) => regionalPrices.find((p) => p.cropId === id)?.priceSource === 'coop_verified'
  );
  const sourceTag =
    district.toLowerCase() === 'kathmandu' ? 'Kalimati' : hasCoop ? 'Verified' : 'AMPIS Est';
  const previewMessage = `[KrishiSetu ${todayDateStr}] ${districtName} (${sourceTag}): ${cropSummaries}/kg.`;
  const charCount = previewMessage.length;

  const handleSendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 8) {
      setErrorMsg('Please enter a valid Nepali mobile phone number');
      return;
    }
    setSending(true);
    setErrorMsg(null);
    setSentSuccess(null);

    try {
      const data = await smsApi.sendPriceAlert(phone, district, selectedCropIds);
      setSentSuccess(data);
      InAppMessageService.dispatchMessage({
        title: `दैनिक बजार मूल्य दर (${districtName})`,
        body: data.messageText || previewMessage,
        type: 'price_bulletin',
        priority: 'high',
        badge: 'Mandi Rate',
        actionLabel: 'बजार दर तालिका हेर्नुहोस्',
        actionTab: 'prices',
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to dispatch SMS alert');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans text-[#262421] dark:text-[#F2EFE9]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-[#FCFAF6] dark:bg-[#1E1D1A] rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-[#E4E0D8] dark:border-[#38362F] shadow-2xl space-y-5 relative max-h-[92vh] overflow-y-auto"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F7F4EF] dark:bg-[#242320] hover:bg-[#EAE5DC] dark:hover:bg-[#2E2C27] flex items-center justify-center font-bold text-xs transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#A97C61] text-[#FCFAF6] flex items-center justify-center shadow-xs">
            <MessageSquare className="w-6 h-6 text-[#FCFAF6]" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">
              SMS Market Price Alerts (एसएमएस मूल्य)
            </h2>
            <p className="text-xs text-[#6B6862] dark:text-[#9B9790]">
              Receive localized 77-district mandi wholesale rates directly on 2G/4G phones.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-2.5 bg-[#F7F4EF] dark:bg-[#242320] rounded-xl border border-[#E4E0D8] dark:border-[#38362F] text-[11px]">
          <span className="flex items-center gap-1.5 text-[#6B6862] dark:text-[#9B9790]">
            <Radio
              className={`w-3.5 h-3.5 ${
                gatewayInfo?.isLiveGateway ? 'text-emerald-600 animate-pulse' : 'text-[#A97C61]'
              }`}
            />
            Active SMS Delivery Route:
          </span>
          <span className="font-bold">
            {gatewayInfo?.gatewayLabel || 'Sandbox SMS Queue'}
          </span>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {sentSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-[#EBF2EC] dark:bg-emerald-950/30 border border-[#4A7A52]/30 rounded-2xl space-y-1.5 text-[#4A7A52] dark:text-emerald-300"
          >
            <div className="flex items-center gap-2 font-black text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {sentSuccess.simulated ? 'SMS Queued (Sandbox + In-App)' : 'Live SMS Dispatched!'}
              </span>
            </div>
            <p className="text-xs text-[#262421] dark:text-[#F2EFE9] leading-relaxed">
              Sent to <strong>{sentSuccess.recipient}</strong> via{' '}
              <strong>{sentSuccess.carrier}</strong> ({sentSuccess.gateway}).
            </p>
            <div className="font-mono text-[11px] bg-[#FCFAF6] dark:bg-[#1E1D1A] p-2 rounded-lg border border-[#E4E0D8] dark:border-[#38362F] text-[#262421] dark:text-[#F2EFE9] break-all mt-1">
              "{sentSuccess.messageText}"
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSendSms} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#6B6862] dark:text-[#9B9790]" />
              Recipient Mobile Number (NTC / Ncell)
            </label>
            <div className="flex items-center rounded-xl border border-[#E4E0D8] dark:border-[#38362F] bg-[#F7F4EF] dark:bg-[#242320] overflow-hidden">
              <span className="px-3 py-2 bg-[#EAE5DC] dark:bg-[#2E2C27] border-r border-[#E4E0D8] dark:border-[#38362F] font-bold">
                +977
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9845012345"
                className="w-full px-3 py-2 bg-transparent text-sm font-mono outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#6B6862] dark:text-[#9B9790]" />
              Market District (All 77)
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#38362F] bg-[#F7F4EF] dark:bg-[#242320] text-xs font-semibold outline-none cursor-pointer"
            >
              {DISTRICT_LIST.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.zone})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold flex items-center gap-1.5">
                <Sprout className="w-3.5 h-3.5 text-[#6B6862] dark:text-[#9B9790]" />
                Select Crops (Max 4 for single 160-char SMS)
              </label>
              <span className="text-[10px] text-[#6B6862] dark:text-[#9B9790]">{selectedCropIds.length}/4 chosen</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {COMMODITY_SEEDS.map((crop) => {
                const isSelected = selectedCropIds.includes(crop.id);
                return (
                  <button
                    type="button"
                    key={crop.id}
                    onClick={() => toggleCrop(crop.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#262421] dark:bg-[#FCFAF6] text-[#FCFAF6] dark:text-[#1E1D1A] shadow-2xs'
                        : 'bg-[#F7F4EF] dark:bg-[#242320] border border-[#E4E0D8] dark:border-[#38362F]'
                    }`}
                  >
                    <span>{crop.emoji}</span>
                    <span>{crop.name}</span>
                    {isSelected && <CheckCircle2 className="w-3 h-3 text-[#A97C61] ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-[#6B6862] dark:text-[#9B9790]" />
                Standard 160-Char SMS Preview
              </span>
              <span className={`font-mono font-bold ${charCount <= 160 ? 'text-[#4A7A52]' : 'text-[#A97C61]'}`}>
                {charCount}/160 chars
              </span>
            </div>
            <div className="p-3 bg-[#262421] text-[#FCFAF6] font-mono text-xs rounded-xl border border-black/20 leading-relaxed shadow-inner">
              {previewMessage}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <button
                type="button"
                onClick={() => {
                  InAppMessageService.dispatchMessage({
                    title: `बजार दर बुलेटिन (${districtName})`,
                    body: previewMessage,
                    type: 'price_bulletin',
                    priority: 'high',
                    badge: 'Mandi Rate',
                    actionLabel: 'बजार दर हेर्नुहोस्',
                    actionTab: 'prices',
                  });
                }}
                className="px-2.5 py-1.5 rounded-lg bg-[#A97C61] hover:bg-[#96694F] text-[#FCFAF6] text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Deliver to In-App Inbox</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(previewMessage);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-[#F7F4EF] dark:bg-[#242320] border border-[#E4E0D8] dark:border-[#38362F] text-[11px] font-bold flex items-center gap-1 transition ml-auto cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Text</span>
              </button>
            </div>
          </div>

          <div className="p-3 bg-[#F7F4EF] dark:bg-[#242320] rounded-xl border border-[#E4E0D8] dark:border-[#38362F] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#A97C61]" />
              <div>
                <span className="font-bold block">Daily Localized SMS Push</span>
                <span className="text-[10px] text-[#6B6862] dark:text-[#9B9790]">
                  Automated district wholesale rates synced every 6 hours
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={dailySubscription}
              onChange={(e) => setDailySubscription(e.target.checked)}
              className="w-4 h-4 accent-[#A97C61] cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full py-3.5 rounded-xl bg-[#A97C61] text-[#FCFAF6] text-xs font-black hover:bg-[#96694F] transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            {sending ? (
              <span>Connecting to SMS Carrier...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Market Price SMS Now</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
