import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Layers,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Key,
} from 'lucide-react';
import { Commodity } from '../types/krishi';
import { DISTRICT_LIST, COMMODITY_SEEDS } from '../data/agriData';
import { AuthService } from '../services/authService';
import { InAppMessageService } from '../services/inAppMessageService';

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
  const [phone, setPhone] = useState(currentUser.phone.replace('+977 ', '') || '9845012345');
  const [district, setDistrict] = useState(selectedDistrict || 'chitwan');
  const [selectedCropIds, setSelectedCropIds] = useState<string[]>([
    initialCropId,
    'potato',
    'cauliflower',
  ]);
  const [dailySubscription, setDailySubscription] = useState(true);
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [gatewayInfo, setGatewayInfo] = useState<any>({ activeGateway: 'sandbox' });

  useEffect(() => {
    fetch('/api/sms/config')
      .then((res) => res.json())
      .then((data) => setGatewayInfo(data))
      .catch(() => {});
  }, []);

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

  // Build real-time 160-char SMS preview
  const districtName =
    DISTRICT_LIST.find((d) => d.id.toLowerCase() === district.toLowerCase())?.name || 'Chitwan';
  const todayDateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const cropSummaries = selectedCropIds
    .map((id) => {
      const comm = commodities.find((c) => c.id === id);
      const price = comm?.currentPrice || 45;
      const name = comm?.name || id;
      return `${name} Rs${price}/kg`;
    })
    .join(', ');

  const previewMessage = `[KrishiSetu ${todayDateStr}] ${districtName} Mandi: ${cropSummaries}. Freight pooling active. krishisetu.com`;
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
      const response = await fetch('/api/sms/send-price-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          district,
          cropIds: selectedCropIds,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSentSuccess(data);
        // Trigger In-App notification & chime banner
        InAppMessageService.dispatchMessage({
          title: `दैनिक कालिमाटी मूल्य दर (${district})`,
          body: data.messageText || previewMessage,
          type: 'price_bulletin',
          priority: 'high',
          badge: 'Mandi Rate',
          actionLabel: 'बजार दर तालिका हेर्नुहोस्',
          actionTab: 'prices',
        });
      } else {
        setErrorMsg(data.error || 'Failed to dispatch SMS alert');
      }
    } catch (err: any) {
      setErrorMsg('Network error while dispatching SMS');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans text-[#262421]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-[#FCFAF6] rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-[#E4E0D8] shadow-2xl space-y-5 relative max-h-[92vh] overflow-y-auto text-[#262421]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F7F4EF] hover:bg-[#EAE5DC] text-[#262421] flex items-center justify-center font-bold text-xs transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Branding */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#A97C61] text-[#FCFAF6] flex items-center justify-center shadow-xs">
            <MessageSquare className="w-6 h-6 text-[#FCFAF6]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#262421] tracking-tight">
              SMS Market Price Alerts (एसएमएस मूल्य)
            </h2>
            <p className="text-xs text-[#6B6862]">
              Receive daily Kalimati mandi wholesale rates directly on 2G/4G feature phones.
            </p>
          </div>
        </div>

        {/* Gateway Status Pill */}
        <div className="flex items-center justify-between p-2.5 bg-[#F7F4EF] rounded-xl border border-[#E4E0D8] text-[11px]">
          <span className="flex items-center gap-1.5 text-[#6B6862]">
            <Radio className="w-3.5 h-3.5 text-[#A97C61] animate-pulse" />
            Active SMS Delivery Route:
          </span>
          <span className="font-bold text-[#262421]">
            {gatewayInfo.isLive ? gatewayInfo.name : 'Sparrow / Sandbox SMS Router'}
          </span>
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#F7F4EF] border border-[#A97C61]/40 rounded-xl text-xs text-[#A97C61] font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Banner */}
        {sentSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-[#EBF2EC] border border-[#4A7A52]/30 rounded-2xl space-y-1.5 text-[#4A7A52]"
          >
            <div className="flex items-center gap-2 font-black text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 text-[#4A7A52]" />
              <span>SMS Dispatched Successfully!</span>
            </div>
            <p className="text-xs text-[#262421] leading-relaxed">
              Message sent to <strong>{sentSuccess.recipient}</strong> via{' '}
              <strong>{sentSuccess.carrier}</strong> ({sentSuccess.gateway}).
            </p>
            <div className="font-mono text-[11px] bg-[#FCFAF6] p-2 rounded-lg border border-[#E4E0D8] text-[#262421] break-all mt-1">
              "{sentSuccess.messageText}"
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSendSms} className="space-y-4 text-xs">
          {/* Mobile Number */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#262421] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#6B6862]" />
              Recipient Mobile Number (NTC / Ncell)
            </label>
            <div className="flex items-center rounded-xl border border-[#E4E0D8] bg-[#F7F4EF] focus-within:border-[#A97C61] overflow-hidden">
              <span className="px-3 py-2 bg-[#EAE5DC] border-r border-[#E4E0D8] font-bold text-[#262421]">
                +977
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9845xxxxxx"
                className="w-full px-3 py-2 bg-transparent text-sm font-mono text-[#262421] outline-none"
                required
              />
            </div>
          </div>

          {/* District Selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#262421] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#6B6862]" />
              Market District
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E4E0D8] bg-[#F7F4EF] text-xs font-semibold text-[#262421] outline-none focus:border-[#A97C61] cursor-pointer"
            >
              {DISTRICT_LIST.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.zone})
                </option>
              ))}
            </select>
          </div>

          {/* Crops to include (max 4) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#262421] flex items-center gap-1.5">
                <Sprout className="w-3.5 h-3.5 text-[#6B6862]" />
                Select Crops (Max 4 for single 160-char SMS)
              </label>
              <span className="text-[10px] text-[#6B6862]">{selectedCropIds.length}/4 chosen</span>
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
                        ? 'bg-[#262421] text-[#FCFAF6] shadow-2xs'
                        : 'bg-[#F7F4EF] text-[#262421] border border-[#E4E0D8] hover:border-[#A97C61]'
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

          {/* 160-Char SMS Live Preview Terminal */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-[#262421] flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-[#6B6862]" />
                Standard 160-Char SMS Preview (Feature Phone Display)
              </span>
              <span
                className={`font-mono font-bold ${
                  charCount <= 160 ? 'text-[#4A7A52]' : 'text-[#A97C61]'
                }`}
              >
                {charCount}/160 chars (1 SMS segment)
              </span>
            </div>
            <div className="p-3 bg-[#262421] text-[#FCFAF6] font-mono text-xs rounded-xl border border-black/20 leading-relaxed shadow-inner">
              {previewMessage}
            </div>

            {/* Direct In-App & Clipboard Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <button
                type="button"
                onClick={() => {
                  InAppMessageService.dispatchMessage({
                    title: `कालिमाटी दर बुलेटिन (${district})`,
                    body: previewMessage,
                    type: 'price_bulletin',
                    priority: 'high',
                    badge: 'Mandi Rate',
                    actionLabel: 'बजार दर हेर्नुहोस्',
                    actionTab: 'prices',
                  });
                }}
                className="px-2.5 py-1.5 rounded-lg bg-[#A97C61] hover:bg-[#96694F] text-[#FCFAF6] text-[11px] font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
                title="Send directly as In-App notification"
              >
                <Sparkles className="w-3 h-3 text-[#FCFAF6]" />
                <span>Deliver to In-App Inbox</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(previewMessage);
                  InAppMessageService.dispatchMessage({
                    title: 'दर बुलेटिन कपी गरियो',
                    body: 'कालिमाटी बजार दर सन्देश क्लिपबोर्डमा सफलतापूर्वक कपी भयो।',
                    type: 'system_verification',
                    priority: 'normal',
                    badge: 'Copied',
                  });
                }}
                className="px-2.5 py-1.5 rounded-lg bg-[#F7F4EF] hover:bg-[#EAE5DC] text-[#262421] border border-[#E4E0D8] text-[11px] font-bold flex items-center gap-1 transition ml-auto cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Text</span>
              </button>
            </div>
          </div>

          {/* Daily Schedule Toggle */}
          <div className="p-3 bg-[#F7F4EF] rounded-xl border border-[#E4E0D8] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#A97C61]" />
              <div>
                <span className="font-bold text-[#262421] block">Daily 7:30 AM Kalimati SMS Push</span>
                <span className="text-[10px] text-[#6B6862]">
                  Automated wholesale rates sent before morning mandi opening
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

          {/* Submit / Action Button */}
          <button
            type="submit"
            disabled={sending}
            className="w-full py-3.5 rounded-xl bg-[#A97C61] text-[#FCFAF6] text-xs font-black hover:bg-[#96694F] transition flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] cursor-pointer disabled:opacity-50"
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
