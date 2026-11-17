import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  Send,
  MapPin,
  Sprout,
  Radio,
  X,
  Check,
  Phone,
  TrendingUp,
  TrendingDown,
  Trash2,
  RefreshCw,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Smartphone,
} from 'lucide-react';
import { Commodity, UserProfile } from '../types/krishi';
import { DISTRICT_LIST, COMMODITY_SEEDS } from '../data/agriData';
import { InAppMessageService } from '../services/inAppMessageService';
import { AuthService } from '../services/authService';
import { useLanguage } from '../context/LanguageContext';
import { marketApi, RegionalCropPrice } from '../api/marketApi';
import {
  smsApi,
  SmsGatewayConfig,
  PriceAlertSubscription,
  SmsLogItem,
  SmsSendResponse,
} from '../api/smsApi';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDistrict?: string;
  initialCropId?: string;
  commodities?: Commodity[];
  userProfile?: UserProfile;
  // Legacy compatibility props
  commodity?: Commodity;
  userDistrict?: string;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  isOpen,
  onClose,
  selectedDistrict,
  initialCropId,
  commodities = [],
  userProfile,
  commodity,
  userDistrict,
}) => {
  const { language } = useLanguage();
  const isNe = language === 'ne';

  const resolvedDistrict = (selectedDistrict || userDistrict || userProfile?.district || 'chitwan').toLowerCase();
  const resolvedInitialCrop = initialCropId || commodity?.id || 'tomato';

  const currentUser = AuthService.getCurrentUser();
  const defaultPhone = (userProfile?.phone || currentUser?.phone || '9845012345')
    .replace('+977', '')
    .replace(/\s+/g, '')
    .trim();

  const [activeTab, setActiveTab] = useState<'threshold' | 'bulletin'>('threshold');
  const [district, setDistrict] = useState<string>(resolvedDistrict);
  const [phone, setPhone] = useState<string>(defaultPhone || '9845012345');

  // Regional 3-layer localized prices
  const [regionalPrices, setRegionalPrices] = useState<RegionalCropPrice[]>([]);
  const [loadingPrices, setLoadingPrices] = useState<boolean>(false);

  // Gateway & persisted Cloud SQL state
  const [gatewayConfig, setGatewayConfig] = useState<SmsGatewayConfig | null>(null);
  const [alerts, setAlerts] = useState<PriceAlertSubscription[]>([]);
  const [logs, setLogs] = useState<SmsLogItem[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState<boolean>(false);

  // Threshold alert form state
  const [alertCropId, setAlertCropId] = useState<string>(resolvedInitialCrop);
  const [direction, setDirection] = useState<'above' | 'below'>('above');
  const [targetPrice, setTargetPrice] = useState<string>('55');
  const [channel, setChannel] = useState<'sms' | 'in_app' | 'both'>('both');
  const [savingAlert, setSavingAlert] = useState<boolean>(false);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [alertFeedback, setAlertFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Instant bulletin state
  const [selectedCropIds, setSelectedCropIds] = useState<string[]>([
    resolvedInitialCrop,
    'potato',
    'cauliflower',
  ]);
  const [sendingBulletin, setSendingBulletin] = useState<boolean>(false);
  const [bulletinResult, setBulletinResult] = useState<SmsSendResponse | null>(null);
  const [bulletinError, setBulletinError] = useState<string | null>(null);

  const cropCatalog = useMemo(() => {
    if (commodities && commodities.length > 0) {
      return commodities.map((c) => ({
        id: c.id,
        name: c.name,
        nameNepali: c.nameNepali || c.name,
        currentPrice: c.currentPrice,
        emoji: c.emoji || '🌱',
      }));
    }
    return COMMODITY_SEEDS.map((c) => ({
      id: c.id,
      name: c.name,
      nameNepali: c.nepaliName || c.name,
      currentPrice: Math.round(c.basePrice),
      emoji: c.emoji || '🌱',
    }));
  }, [commodities]);

  // Sync props when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setDistrict(resolvedDistrict);
    setAlertCropId(resolvedInitialCrop);
    setAlertFeedback(null);
    setBulletinResult(null);
    setBulletinError(null);
  }, [isOpen, resolvedDistrict, resolvedInitialCrop]);

  // Fetch gateway config, alerts, and delivery logs when modal opens
  useEffect(() => {
    if (!isOpen) return;
    let active = true;

    smsApi
      .getConfig()
      .then((cfg) => {
        if (active) setGatewayConfig(cfg);
      })
      .catch(() => {});

    const cleanPhone = phone.replace(/[\s\-\+]/g, '');
    setLoadingAlerts(true);
    Promise.all([
      smsApi.getAlerts(cleanPhone.length >= 9 ? cleanPhone : undefined).catch(() => ({ alerts: [] })),
      smsApi.getLogs(8, cleanPhone.length >= 9 ? cleanPhone : undefined).catch(() => ({ logs: [] })),
    ])
      .then(([aRes, lRes]) => {
        if (!active) return;
        setAlerts(aRes.alerts || []);
        setLogs(lRes.logs || []);
      })
      .finally(() => {
        if (active) setLoadingAlerts(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen]);

  // Fetch localized 3-layer 77-district prices when district changes
  useEffect(() => {
    if (!isOpen || !district) return;
    let active = true;
    setLoadingPrices(true);

    marketApi
      .getRegionalPrices(district)
      .then((res) => {
        if (active && res.prices) {
          setRegionalPrices(res.prices);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingPrices(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, district]);

  // Helper to get localized price for a crop
  const getLocalizedCropInfo = (cropId: string) => {
    const reg = regionalPrices.find((p) => p.cropId === cropId);
    const seed = cropCatalog.find((c) => c.id === cropId);
    return {
      price: reg ? reg.localizedWholesalePrice : Math.round(seed?.currentPrice || 50),
      sourceLabel: reg
        ? isNe
          ? reg.priceSourceLabelNe
          : reg.priceSourceLabelEn
        : isNe
        ? 'आधार दर'
        : 'Baseline Rate',
      priceSource: reg?.priceSource || 'ampis_calibrated',
      nameEn: reg?.name || seed?.name || cropId,
      nameNe: reg?.nameNepali || seed?.nameNepali || cropId,
    };
  };

  // Pre-fill target price near localized rate when crop/district changes
  useEffect(() => {
    if (!isOpen) return;
    const info = getLocalizedCropInfo(alertCropId);
    const suggested = direction === 'above' ? Math.round(info.price * 1.08) : Math.max(10, Math.round(info.price * 0.92));
    setTargetPrice(String(suggested));
  }, [alertCropId, regionalPrices.length, isOpen]);

  if (!isOpen) return null;

  const districtObj =
    DISTRICT_LIST.find((d) => d.id.toLowerCase() === district.toLowerCase()) || DISTRICT_LIST[0];

  const activeAlertCropInfo = getLocalizedCropInfo(alertCropId);

  const refreshAlertsAndLogs = async () => {
    const cleanPhone = phone.replace(/[\s\-\+]/g, '');
    const [aRes, lRes] = await Promise.all([
      smsApi.getAlerts(cleanPhone.length >= 9 ? cleanPhone : undefined).catch(() => ({ alerts: [] })),
      smsApi.getLogs(8, cleanPhone.length >= 9 ? cleanPhone : undefined).catch(() => ({ logs: [] })),
    ]);
    setAlerts(aRes.alerts || []);
    setLogs(lRes.logs || []);
  };

  const handleCreateThresholdAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAlert(true);
    setAlertFeedback(null);

    try {
      const parsedTarget = Number(targetPrice);
      const res = await smsApi.createAlert({
        phone,
        districtId: district,
        cropId: alertCropId,
        targetPrice: parsedTarget,
        direction,
        channel,
      });

      const triggeredNow = res.evaluation?.triggeredImmediately;
      const actualPrice = res.evaluation?.actualPrice;

      if (triggeredNow && actualPrice) {
        InAppMessageService.dispatchMessage({
          title: isNe
            ? `मूल्य लक्ष्य पूरा भयो (${districtObj.name})`
            : `Price Threshold Reached (${districtObj.name})`,
          body: `${activeAlertCropInfo.nameEn} is currently Rs ${actualPrice}/kg (${
            direction === 'above' ? '>=' : '<='
          } Rs ${parsedTarget}/kg).`,
          type: 'price_bulletin',
          priority: 'high',
          badge: 'Threshold Alert',
          actionLabel: isNe ? 'बजार दर हेर्नुहोस्' : 'View Market Prices',
          actionTab: 'prices',
        });
      }

      setAlertFeedback({
        type: 'success',
        text: triggeredNow
          ? isNe
            ? `सतर्कता सुरक्षित गरियो र हालको दर रु ${actualPrice}/केजी ले लक्ष्य पूरा गरेकोले तत्काल सन्देश पठाइयो!`
            : `Alert saved! Current ${districtObj.name} rate (Rs ${actualPrice}/kg) already meets your target — SMS dispatched.`
          : isNe
          ? `मूल्य सतर्कता सुरक्षित गरियो! दर ${direction === 'above' ? 'रु ' + parsedTarget + ' पुग्दा' : 'रु ' + parsedTarget + ' झर्दा'} SMS आउनेछ।`
          : `Alert saved to Cloud SQL! You will receive an SMS when ${activeAlertCropInfo.nameEn} goes ${direction} Rs ${parsedTarget}/kg in ${districtObj.name}.`,
      });

      await refreshAlertsAndLogs();
    } catch (err: any) {
      setAlertFeedback({
        type: 'error',
        text: err?.message || (isNe ? 'सतर्कता सुरक्षित गर्न सकिएन' : 'Failed to save price alert'),
      });
    } finally {
      setSavingAlert(false);
    }
  };

  const handleDeleteAlert = async (id: number) => {
    try {
      await smsApi.deleteAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch {
      // ignore cleanly
    }
  };

  const handleRunCheckNow = async () => {
    setEvaluating(true);
    setAlertFeedback(null);
    try {
      const res = await smsApi.evaluateAlerts(district);
      await refreshAlertsAndLogs();
      setAlertFeedback({
        type: 'success',
        text: isNe
          ? `${res.evaluatedCount} सक्रिय नियम जाँचियो — ${res.triggeredCount} नयाँ सतर्कता पठाइयो।`
          : `Checked ${res.evaluatedCount} active rules — ${res.triggeredCount} alert(s) triggered (${res.skippedCooldownCount} in 24h cooldown).`,
      });
    } catch (err: any) {
      setAlertFeedback({
        type: 'error',
        text: err?.message || 'Failed to evaluate alerts',
      });
    } finally {
      setEvaluating(false);
    }
  };

  const toggleBulletinCrop = (cropId: string) => {
    if (selectedCropIds.includes(cropId)) {
      if (selectedCropIds.length > 1) {
        setSelectedCropIds(selectedCropIds.filter((id) => id !== cropId));
      }
    } else if (selectedCropIds.length < 4) {
      setSelectedCropIds([...selectedCropIds, cropId]);
    }
  };

  const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const distShort = districtObj.name.split('(')[0].trim();
  const cropSummaries = selectedCropIds
    .map((id) => {
      const info = getLocalizedCropInfo(id);
      const shortName = info.nameEn.split('(')[0].trim();
      return `${shortName} Rs${info.price}`;
    })
    .join(', ');
  const hasCoop = selectedCropIds.some((id) => getLocalizedCropInfo(id).priceSource === 'coop_verified');
  const sourceTag = districtObj.id === 'kathmandu' ? 'Kalimati' : hasCoop ? 'Verified' : 'AMPIS Est';
  const previewMessage = `[KrishiSetu ${todayStr}] ${distShort} (${sourceTag}): ${cropSummaries}/kg.`;

  const handleSendInstantBulletin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingBulletin(true);
    setBulletinError(null);
    setBulletinResult(null);

    try {
      const res = await smsApi.sendPriceAlert(phone, district, selectedCropIds);
      setBulletinResult(res);
      InAppMessageService.generatePriceBulletin(districtObj.name, cropSummaries);
      await refreshAlertsAndLogs();
    } catch (err: any) {
      setBulletinError(err?.message || (isNe ? 'एसएमएस पठाउन सकिएन' : 'Failed to dispatch SMS bulletin'));
    } finally {
      setSendingBulletin(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans text-[#262421] dark:text-[#F2EFE9]">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="bg-[#FCFAF6] dark:bg-[#1E1D1A] rounded-3xl p-5 sm:p-6 max-w-xl w-full border border-[#E4E0D8] dark:border-[#38362F] shadow-2xl space-y-4 relative max-h-[92vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F7F4EF] dark:bg-[#242320] hover:bg-[#EAE5DC] dark:hover:bg-[#2E2C27] text-[#262421] dark:text-[#F2EFE9] flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 pr-8">
          <div className="w-11 h-11 rounded-2xl bg-[#2D6A4F] dark:bg-[#4E9F76] text-white dark:text-[#121714] flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight">
              {isNe ? 'मूल्य सतर्कता र एसएमएस सेवा' : 'Price Threshold & SMS Alerts'}
            </h2>
            <p className="text-xs text-[#6B6862] dark:text-[#9B9790]">
              {isNe
                ? '७७ जिल्लाको स्थानीय दर अनुसार स्वचालित SMS र इन-एप सूचना'
                : 'Automated 77-district SMS threshold monitoring & instant mandi bulletins'}
            </p>
          </div>
        </div>

        {/* Honest Gateway Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#F7F4EF] dark:bg-[#242320] border border-[#E4E0D8] dark:border-[#38362F] text-[11px]">
          <span className="flex items-center gap-1.5 text-[#6B6862] dark:text-[#9B9790] font-semibold">
            <Radio
              className={`w-3.5 h-3.5 ${
                gatewayConfig?.isLiveGateway ? 'text-emerald-600 animate-pulse' : 'text-[#A97C61]'
              }`}
            />
            {isNe ? 'SMS गेटवे:' : 'SMS Gateway:'}
          </span>
          <span
            className={`font-bold ${
              gatewayConfig?.isLiveGateway
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-[#A97C61] dark:text-[#C99678]'
            }`}
          >
            {gatewayConfig?.gatewayLabel || (isNe ? 'जाँच हुँदै...' : 'Checking gateway...')}
          </span>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-[#F7F4EF] dark:bg-[#242320] border border-[#E4E0D8] dark:border-[#38362F]">
          <button
            type="button"
            onClick={() => setActiveTab('threshold')}
            className={`py-2 px-3 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'threshold'
                ? 'bg-[#262421] dark:bg-[#FCFAF6] text-[#FCFAF6] dark:text-[#1E1D1A] shadow-xs'
                : 'text-[#6B6862] dark:text-[#9B9790] hover:text-[#262421] dark:hover:text-[#F2EFE9]'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{isNe ? 'लक्ष्य मूल्य सतर्कता' : 'Target Price Alerts'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bulletin')}
            className={`py-2 px-3 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'bulletin'
                ? 'bg-[#262421] dark:bg-[#FCFAF6] text-[#FCFAF6] dark:text-[#1E1D1A] shadow-xs'
                : 'text-[#6B6862] dark:text-[#9B9790] hover:text-[#262421] dark:hover:text-[#F2EFE9]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{isNe ? 'तत्काल दर SMS' : 'Instant SMS Bulletin'}</span>
          </button>
        </div>

        {/* Common Mobile Number Input */}
        <div className="space-y-1">
          <label className="text-xs font-bold flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-[#6B6862] dark:text-[#9B9790]" />
            {isNe ? 'किसानको मोबाइल नम्बर (NTC / Ncell)' : 'Farmer Mobile Number (NTC / Ncell)'}
          </label>
          <div className="flex items-center rounded-xl border border-[#E4E0D8] dark:border-[#38362F] bg-[#F7F4EF] dark:bg-[#242320] overflow-hidden focus-within:border-[#2D6A4F]">
            <span className="px-3 py-2 bg-[#EAE5DC] dark:bg-[#2E2C27] border-r border-[#E4E0D8] dark:border-[#38362F] text-xs font-bold">
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

        {activeTab === 'threshold' ? (
          <div className="space-y-4">
            {alertFeedback && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold flex items-start gap-2 ${
                  alertFeedback.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                }`}
              >
                {alertFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{alertFeedback.text}</span>
              </div>
            )}

            <form onSubmit={handleCreateThresholdAlert} className="space-y-3 bg-[#F7F4EF] dark:bg-[#242320] p-4 rounded-2xl border border-[#E4E0D8] dark:border-[#38362F]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* District */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#6B6862] dark:text-[#9B9790] flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {isNe ? 'जिल्ला (७७ जिल्ला)' : 'District (All 77)'}
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#38362F] bg-[#FCFAF6] dark:bg-[#1E1D1A] text-xs font-bold outline-none"
                  >
                    {DISTRICT_LIST.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.province})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Crop */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#6B6862] dark:text-[#9B9790] flex items-center gap-1">
                    <Sprout className="w-3 h-3" />
                    {isNe ? 'कृषि उपज' : 'Commodity'}
                  </label>
                  <select
                    value={alertCropId}
                    onChange={(e) => setAlertCropId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#38362F] bg-[#FCFAF6] dark:bg-[#1E1D1A] text-xs font-bold outline-none"
                  >
                    {cropCatalog.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.emoji} {isNe ? c.nameNepali : c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Localized current rate pill */}
              <div className="flex items-center justify-between text-[11px] px-3 py-2 rounded-xl bg-[#FCFAF6] dark:bg-[#1E1D1A] border border-[#E4E0D8] dark:border-[#38362F]">
                <span className="text-[#6B6862] dark:text-[#9B9790]">
                  {loadingPrices
                    ? isNe
                      ? 'स्थानीय दर लोड हुँदै...'
                      : 'Loading district rate...'
                    : isNe
                    ? `हालको ${districtObj.name} दर:`
                    : `Current ${districtObj.name} rate:`}
                </span>
                <span className="font-black text-[#2D6A4F] dark:text-[#4E9F76]">
                  Rs {activeAlertCropInfo.price}/kg · {activeAlertCropInfo.sourceLabel}
                </span>
              </div>

              {/* Condition & Target Price */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#6B6862] dark:text-[#9B9790]">
                    {isNe ? 'शर्त' : 'Trigger Condition'}
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDirection('above')}
                      className={`py-2 px-2 rounded-xl text-[11px] font-extrabold border flex items-center justify-center gap-1 cursor-pointer ${
                        direction === 'above'
                          ? 'bg-[#2D6A4F] text-white border-[#2D6A4F]'
                          : 'bg-[#FCFAF6] dark:bg-[#1E1D1A] border-[#E4E0D8] dark:border-[#38362F]'
                      }`}
                    >
                      <TrendingUp className="w-3 h-3" />
                      <span>{isNe ? 'माथि' : 'Above'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDirection('below')}
                      className={`py-2 px-2 rounded-xl text-[11px] font-extrabold border flex items-center justify-center gap-1 cursor-pointer ${
                        direction === 'below'
                          ? 'bg-[#A97C61] text-white border-[#A97C61]'
                          : 'bg-[#FCFAF6] dark:bg-[#1E1D1A] border-[#E4E0D8] dark:border-[#38362F]'
                      }`}
                    >
                      <TrendingDown className="w-3 h-3" />
                      <span>{isNe ? 'तल' : 'Below'}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#6B6862] dark:text-[#9B9790]">
                    {isNe ? 'लक्ष्य मूल्य (रु / केजी)' : 'Target Price (Rs/kg)'}
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={2500}
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#38362F] bg-[#FCFAF6] dark:bg-[#1E1D1A] text-xs font-black outline-none"
                    required
                  />
                </div>
              </div>

              {/* Channel */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-[11px] font-bold text-[#6B6862] dark:text-[#9B9790]">
                  {isNe ? 'सूचना माध्यम:' : 'Delivery Channel:'}
                </span>
                <div className="flex gap-1.5">
                  {(['both', 'sms', 'in_app'] as const).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setChannel(ch)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                        channel === ch
                          ? 'bg-[#262421] dark:bg-[#FCFAF6] text-[#FCFAF6] dark:text-[#1E1D1A] border-transparent'
                          : 'bg-[#FCFAF6] dark:bg-[#1E1D1A] border-[#E4E0D8] dark:border-[#38362F]'
                      }`}
                    >
                      {ch === 'both'
                        ? isNe
                          ? 'SMS + एप'
                          : 'SMS + App'
                        : ch === 'sms'
                        ? 'SMS'
                        : isNe
                        ? 'एप मात्र'
                        : 'In-App'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={savingAlert}
                className="w-full py-3 rounded-xl bg-[#2D6A4F] hover:bg-[#23543E] text-white text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Bell className="w-4 h-4" />
                <span>
                  {savingAlert
                    ? isNe
                      ? 'सुरक्षित हुँदै...'
                      : 'Saving Alert...'
                    : isNe
                    ? 'मूल्य सतर्कता सेट गर्नुहोस्'
                    : 'Activate Price Threshold Alert'}
                </span>
              </button>
            </form>

            {/* Saved Cloud SQL Alerts List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wide text-[#6B6862] dark:text-[#9B9790]">
                  {isNe ? `सक्रिय सतर्कताहरू (${alerts.length})` : `Active Saved Alerts (${alerts.length})`}
                </h3>
                <button
                  type="button"
                  onClick={handleRunCheckNow}
                  disabled={evaluating}
                  className="text-[11px] font-bold text-[#2D6A4F] dark:text-[#4E9F76] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${evaluating ? 'animate-spin' : ''}`} />
                  <span>{isNe ? 'अहिले जाँच गर्नुहोस्' : 'Check Rates Now'}</span>
                </button>
              </div>

              {loadingAlerts ? (
                <div className="p-3 text-xs text-[#6B6862] dark:text-[#9B9790]">
                  {isNe ? 'लोड हुँदै...' : 'Loading saved alerts...'}
                </div>
              ) : alerts.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#F7F4EF] dark:bg-[#242320] border border-[#E4E0D8] dark:border-[#38362F] text-xs text-[#6B6862] dark:text-[#9B9790] text-center">
                  {isNe
                    ? 'यस नम्बरमा कुनै सक्रिय मूल्य सतर्कता छैन। माथिबाट नयाँ थप्नुहोस्।'
                    : 'No active price alerts for this mobile number yet. Add one above.'}
                </div>
              ) : (
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {alerts.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#F7F4EF] dark:bg-[#242320] border border-[#E4E0D8] dark:border-[#38362F] text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-bold truncate">
                          {a.cropName} · <span className="capitalize">{a.districtId}</span>
                        </div>
                        <div className="text-[11px] text-[#6B6862] dark:text-[#9B9790]">
                          {a.direction === 'above' ? '>=' : '<='} Rs {a.targetPrice}/kg ·{' '}
                          {a.lastTriggeredAt
                            ? isNe
                              ? `पछिल्लो SMS: रु ${a.lastTriggeredPrice}`
                              : `Last sent @ Rs ${a.lastTriggeredPrice}`
                            : isNe
                            ? 'निगरानी सक्रिय'
                            : 'Watching 6h sync'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteAlert(a.id)}
                        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/40 text-red-600 transition cursor-pointer shrink-0"
                        title={isNe ? 'रद्द गर्नुहोस्' : 'Cancel Alert'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendInstantBulletin} className="space-y-4">
            {bulletinError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{bulletinError}</span>
              </div>
            )}

            {bulletinResult && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 font-black text-emerald-800 dark:text-emerald-300">
                  <Check className="w-4 h-4" />
                  <span>
                    {bulletinResult.simulated
                      ? isNe
                        ? 'सन्देश स्यान्डबक्स र इन-एपमा पठाइयो'
                        : 'Bulletin Dispatched (Sandbox + In-App)'
                      : isNe
                      ? 'प्रत्यक्ष SMS पठाइयो!'
                      : 'Live Carrier SMS Dispatched!'}
                  </span>
                </div>
                <p className="text-[11px] text-[#44403B] dark:text-[#D1CCC4]">
                  {bulletinResult.recipient} · {bulletinResult.carrier} · {bulletinResult.gateway}
                </p>
                <div className="p-2 rounded-lg bg-[#FCFAF6] dark:bg-[#1E1D1A] border border-[#E4E0D8] dark:border-[#38362F] font-mono text-[11px]">
                  {bulletinResult.messageText}
                </div>
              </div>
            )}

            {/* Target District */}
            <div className="space-y-1">
              <label className="text-xs font-bold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#6B6862] dark:text-[#9B9790]" />
                {isNe ? 'लक्षित जिल्ला मन्डी (७७ जिल्ला)' : 'Target District Mandi (All 77)'}
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#38362F] bg-[#F7F4EF] dark:bg-[#242320] text-xs font-bold outline-none"
              >
                {DISTRICT_LIST.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.zone})
                  </option>
                ))}
              </select>
            </div>

            {/* Crop multi-select */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5">
                  <Sprout className="w-3.5 h-3.5 text-[#6B6862] dark:text-[#9B9790]" />
                  {isNe ? 'बाली छान्नुहोस् (१-४ वटा)' : 'Select 1-4 Crops for 160-Char SMS'}
                </span>
                <span className="text-[11px] text-[#6B6862] dark:text-[#9B9790]">
                  {selectedCropIds.length}/4
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {cropCatalog.slice(0, 18).map((crop) => {
                  const isSelected = selectedCropIds.includes(crop.id);
                  const locInfo = getLocalizedCropInfo(crop.id);
                  return (
                    <button
                      key={crop.id}
                      type="button"
                      onClick={() => toggleBulletinCrop(crop.id)}
                      className={`p-2 rounded-xl text-left border transition text-[11px] font-bold cursor-pointer ${
                        isSelected
                          ? 'bg-[#2D6A4F] text-white border-[#2D6A4F]'
                          : 'bg-[#F7F4EF] dark:bg-[#242320] border-[#E4E0D8] dark:border-[#38362F]'
                      }`}
                    >
                      <div className="truncate">
                        {crop.emoji} {isNe ? crop.nameNepali : crop.name.split('(')[0].trim()}
                      </div>
                      <div className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-[#6B6862] dark:text-[#9B9790]'}`}>
                        Rs {locInfo.price}/kg
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 160-char GSM preview */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="flex items-center gap-1 text-[#6B6862] dark:text-[#9B9790]">
                  <Smartphone className="w-3.5 h-3.5" />
                  {isNe ? 'स्थानीय १६०-अक्षर SMS पूर्वावलोकन' : 'Localized 160-Char SMS Preview'}
                </span>
                <span className={previewMessage.length <= 160 ? 'text-emerald-600' : 'text-[#A97C61]'}>
                  {previewMessage.length}/160 chars
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#262421] text-[#FCFAF6] font-mono text-xs leading-relaxed">
                {previewMessage}
              </div>
            </div>

            <button
              type="submit"
              disabled={sendingBulletin || selectedCropIds.length === 0}
              className="w-full py-3 rounded-xl bg-[#A97C61] hover:bg-[#96694F] text-white text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>
                {sendingBulletin
                  ? isNe
                    ? 'पठाउँदै...'
                    : 'Dispatching SMS...'
                  : isNe
                  ? 'स्थानीय दर SMS र एपमा पठाउनुहोस्'
                  : 'Send Localized SMS & In-App Alert'}
              </span>
            </button>
          </form>
        )}

        {/* Recent SMS Delivery Audit Trail */}
        {logs.length > 0 && (
          <div className="pt-2 border-t border-[#E4E0D8] dark:border-[#38362F] space-y-1.5">
            <div className="text-[11px] font-extrabold uppercase tracking-wide text-[#6B6862] dark:text-[#9B9790]">
              {isNe ? 'पछिल्ला SMS अभिलेख' : 'Recent SMS Delivery Log'}
            </div>
            <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
              {logs.slice(0, 4).map((l, idx) => (
                <div
                  key={l.messageId || idx}
                  className="p-2 rounded-lg bg-[#F7F4EF] dark:bg-[#242320] border border-[#E4E0D8] dark:border-[#38362F] text-[11px]"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>
                      +977 {l.phone} · {l.carrier}
                    </span>
                    <span className={l.simulated ? 'text-[#A97C61]' : 'text-emerald-600'}>
                      {l.simulated ? 'Sandbox Queue' : 'Delivered'}
                    </span>
                  </div>
                  <p className="text-[#6B6862] dark:text-[#9B9790] truncate mt-0.5">{l.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
