import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  MessageSquare,
  AlertTriangle,
  Truck,
  TrendingUp,
  ShieldCheck,
  X,
  Trash2,
  CheckCheck,
  Sparkles,
  Send,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';
import { InAppMessage, InAppMessageType } from '../types/inAppMessage';
import { InAppMessageService } from '../services/inAppMessageService';
import { getLocalizedNotification } from '../utils/notificationLocalization';
import { useLanguage } from '../context/LanguageContext';
import { AppTab } from './Header';
import { DISTRICT_LIST } from '../data/agriData';

interface InAppNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: AppTab) => void;
  onOpenRlsDiagnostic?: () => void;
}

export const InAppNotificationCenter: React.FC<InAppNotificationCenterProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenRlsDiagnostic,
}) => {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<InAppMessage[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | InAppMessageType>('all');
  const [showComposer, setShowComposer] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Composer state
  const [customTitle, setCustomTitle] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [customType, setCustomType] = useState<InAppMessageType>('price_bulletin');
  const [customDistrict, setCustomDistrict] = useState('Chitwan');

  useEffect(() => {
    const unsub = InAppMessageService.subscribe((msgs) => {
      setMessages(msgs);
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const isNe = language === 'ne';
  const unreadCount = messages.filter((m) => !m.read).length;

  const filteredMessages = messages.filter((m) => {
    if (activeFilter === 'all') return true;
    return m.type === activeFilter;
  });

  const handleAction = (msg: InAppMessage) => {
    InAppMessageService.markAsRead(msg.id);
    if (msg.actionTab && onNavigateTab) {
      onNavigateTab(msg.actionTab);
      onClose();
    }
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendCustomBulletin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle || !customBody) return;

    InAppMessageService.dispatchMessage({
      title: customTitle,
      body: customBody,
      type: customType,
      priority: 'high',
      badge: customType === 'price_bulletin' ? 'Mandi Alert' : 'Farmer Note',
      actionLabel: customType === 'price_bulletin' ? t('notif.viewPrices', 'View Market Rates') : undefined,
      actionTab: customType === 'price_bulletin' ? 'prices' : undefined,
    });

    setCustomTitle('');
    setCustomBody('');
    setShowComposer(false);
  };

  const handleQuickPriceBroadcast = () => {
    InAppMessageService.generatePriceBulletin(
      customDistrict,
      isNe
        ? 'गोलभेडा रु ४६/केजी (+८%), आलु रु ३८/केजी, काउली रु ३४/केजी, प्याज रु ५८/केजी'
        : 'Tomato Rs 46/kg (+8%), Potato Rs 38/kg, Cauliflower Rs 34/kg, Onion Rs 58/kg'
    );
  };

  const getTypeIcon = (type: InAppMessageType) => {
    switch (type) {
      case 'price_bulletin':
        return <TrendingUp className="w-3.5 h-3.5 text-[#2E7D5A] dark:text-[#4ADE80]" />;
      case 'pooling_match':
        return <Truck className="w-3.5 h-3.5 text-[#2D6CDF] dark:text-[#76A9FA]" />;
      case 'weather_alert':
        return <AlertTriangle className="w-3.5 h-3.5 text-[#C4381C] dark:text-[#FF8A73]" />;
      case 'system_verification':
        return <ShieldCheck className="w-3.5 h-3.5 text-[#C8A27C] dark:text-[#D9B591]" />;
      default:
        return <MessageSquare className="w-3.5 h-3.5 text-[#746F68] dark:text-[#A6A096]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1F1E1B]/35 backdrop-blur-xs flex justify-end font-sans text-[#1F1E1B] dark:text-[#F5F3EF]">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="bg-white dark:bg-[#1E1D1B] w-full max-w-md h-full shadow-xl border-l border-[#E8E2D8] dark:border-[#383530] flex flex-col relative z-50 text-[#1F1E1B] dark:text-[#F5F3EF]"
      >
        {/* Minimalist Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8E2D8] dark:border-[#383530] flex items-center justify-between bg-white dark:bg-[#1E1D1B]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] flex items-center justify-center text-[#1F1E1B] dark:text-[#F5F3EF]">
              <Bell className="w-4 h-4 text-[#C8A27C] dark:text-[#D9B591]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-[#1F1E1B] dark:text-[#F5F3EF]">
                  {t('header.alerts', 'Notifications')}
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#EAF3EE] text-[#1E5E41] dark:bg-[#1E3327] dark:text-[#4ADE80] text-[11px] font-bold">
                    {unreadCount} {t('notif.new', 'New')}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#746F68] dark:text-[#A6A096]">
                {isNe ? 'कालिमाटी दर, ढुवानी र मौसम अपडेट' : 'Mandi rates, freight & weather updates'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={() => InAppMessageService.markAllAsRead()}
                className="p-1.5 rounded-lg hover:bg-[#FAF7F2] dark:hover:bg-[#262421] text-[#746F68] dark:text-[#A6A096] hover:text-[#1F1E1B] dark:hover:text-[#F5F3EF] text-xs transition cursor-pointer"
                title={t('settings.notifMarkAll', 'Mark all as read')}
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[#FAF7F2] dark:hover:bg-[#262421] text-[#746F68] dark:text-[#A6A096] hover:text-[#1F1E1B] dark:hover:text-[#F5F3EF] transition cursor-pointer"
              aria-label="Close notifications"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Minimal Category Filter Tabs */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-[#E8E2D8] dark:border-[#383530] bg-[#FAF7F2]/60 dark:bg-[#24221F]/60 overflow-x-auto scrollbar-none text-xs">
          {[
            { id: 'all', label: isNe ? `सबै (${messages.length})` : `All (${messages.length})` },
            { id: 'price_bulletin', label: isNe ? 'बजार दर' : 'Rates' },
            { id: 'pooling_match', label: isNe ? 'ढुवानी' : 'Freight' },
            { id: 'weather_alert', label: isNe ? 'मौसम' : 'Weather' },
            { id: 'system_verification', label: isNe ? 'सुरक्षा' : 'Security' },
          ].map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as 'all' | InAppMessageType)}
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap text-xs transition cursor-pointer ${
                  isActive
                    ? 'bg-[#1F1E1B] text-white dark:bg-[#F5F3EF] dark:text-[#1F1E1B]'
                    : 'text-[#746F68] dark:text-[#A6A096] hover:text-[#1F1E1B] dark:hover:text-[#F5F3EF] hover:bg-[#E8E2D8]/50 dark:hover:bg-[#383530]/50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Minimal Utilities Row: Broadcast / Test */}
        <div className="px-4 py-2 border-b border-[#E8E2D8] dark:border-[#383530] bg-white dark:bg-[#1E1D1B] flex items-center justify-between text-xs">
          <button
            onClick={() => setShowComposer(!showComposer)}
            className="flex items-center gap-1 text-xs font-semibold text-[#746F68] dark:text-[#A6A096] hover:text-[#1F1E1B] dark:hover:text-[#F5F3EF] transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C8A27C] dark:text-[#D9B591]" />
            <span>{showComposer ? (isNe ? 'बन्द गर्नुहोस्' : 'Close Composer') : (isNe ? '+ सन्देश थप्नुहोस्' : '+ Add Note')}</span>
          </button>

          <div className="flex items-center gap-2">
            {onOpenRlsDiagnostic && (
              <button
                onClick={onOpenRlsDiagnostic}
                className="text-[11px] font-medium text-[#746F68] dark:text-[#A6A096] hover:text-[#1F1E1B] dark:hover:text-[#F5F3EF] transition cursor-pointer"
              >
                RLS Test
              </button>
            )}
            <button
              onClick={handleQuickPriceBroadcast}
              className="px-2.5 py-1 rounded-md bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] text-[11px] font-semibold text-[#1F1E1B] dark:text-[#F5F3EF] hover:bg-[#F3ECE0] dark:hover:bg-[#302D28] transition cursor-pointer"
            >
              {isNe ? 'ताजा दर प्राप्त' : 'Sample Bulletin'}
            </button>
          </div>
        </div>

        {/* Minimal Collapsible Composer */}
        <AnimatePresence>
          {showComposer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-[#FAF7F2] dark:bg-[#262421] border-b border-[#E8E2D8] dark:border-[#383530] space-y-2.5 overflow-hidden text-xs"
            >
              <form onSubmit={handleSendCustomBulletin} className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value as InAppMessageType)}
                    className="bg-white dark:bg-[#1E1D1B] border border-[#E8E2D8] dark:border-[#383530] rounded-lg px-2.5 py-1.5 text-xs text-[#1F1E1B] dark:text-[#F5F3EF] focus:outline-none"
                  >
                    <option value="price_bulletin">{isNe ? 'मूल्य बुलेटिन' : 'Price Bulletin'}</option>
                    <option value="pooling_match">{isNe ? 'ढुवानी म्याच' : 'Freight Match'}</option>
                    <option value="weather_alert">{isNe ? 'सडक/मौसम' : 'Weather Alert'}</option>
                    <option value="system_verification">{isNe ? 'सुरक्षा कोड' : 'Security OTP'}</option>
                  </select>

                  <select
                    value={customDistrict}
                    onChange={(e) => setCustomDistrict(e.target.value)}
                    className="bg-white dark:bg-[#1E1D1B] border border-[#E8E2D8] dark:border-[#383530] rounded-lg px-2.5 py-1.5 text-xs text-[#1F1E1B] dark:text-[#F5F3EF] focus:outline-none"
                  >
                    {DISTRICT_LIST.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  type="text"
                  placeholder={isNe ? 'शीर्षक (जस्तै: कालिमाटी आजको भाउ)' : 'Title (e.g. Mandi Alert)'}
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-white dark:bg-[#1E1D1B] border border-[#E8E2D8] dark:border-[#383530] rounded-lg px-3 py-1.5 text-xs text-[#1F1E1B] dark:text-[#F5F3EF] placeholder:text-[#746F68] focus:outline-none"
                />

                <textarea
                  rows={2}
                  placeholder={isNe ? 'सन्देश विवरण लेख्नुहोस्...' : 'Message details...'}
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  className="w-full bg-white dark:bg-[#1E1D1B] border border-[#E8E2D8] dark:border-[#383530] rounded-lg p-2 text-xs text-[#1F1E1B] dark:text-[#F5F3EF] placeholder:text-[#746F68] focus:outline-none"
                />

                <button
                  type="submit"
                  className="w-full py-1.5 rounded-lg bg-[#1F1E1B] text-white dark:bg-[#F5F3EF] dark:text-[#1F1E1B] font-semibold text-xs hover:opacity-90 transition cursor-pointer"
                >
                  {isNe ? 'सन्देश पठाउनुहोस्' : 'Send Notification'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Minimal Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredMessages.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-[#746F68] dark:text-[#A6A096] space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] flex items-center justify-center text-[#746F68] dark:text-[#A6A096]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <p className="font-semibold text-sm text-[#1F1E1B] dark:text-[#F5F3EF]">
                {t('settings.notifEmpty', 'No notifications')}
              </p>
              <p className="text-xs text-[#746F68] dark:text-[#A6A096] max-w-xs leading-relaxed">
                {isNe
                  ? 'दैनिक कालिमाटी मूल्य बुलेटिन वा ढुवानी अपडेट आउँदा यहाँ देखिनेछ।'
                  : 'Daily Kalimati mandi price bulletins and freight alerts will appear here.'}
              </p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const localized = getLocalizedNotification(msg, language, t);
              return (
                <motion.div
                  key={msg.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className={`p-3.5 rounded-xl border transition relative space-y-1.5 ${
                    msg.read
                      ? 'bg-white dark:bg-[#1E1D1B] border-[#E8E2D8] dark:border-[#383530]'
                      : 'bg-[#FAF7F2] dark:bg-[#252320] border-[#E8E2D8] dark:border-[#383530]'
                  }`}
                >
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#1E1D1B] border border-[#E8E2D8] dark:border-[#383530] flex items-center justify-center shrink-0 mt-0.5">
                        {getTypeIcon(msg.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-xs sm:text-sm text-[#1F1E1B] dark:text-[#F5F3EF] leading-snug">
                            {localized.title}
                          </span>
                          {!msg.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D5A] dark:bg-[#4ADE80] shrink-0" />
                          )}
                        </div>
                        <span className="text-[11px] font-editorial-mono text-[#746F68] dark:text-[#A6A096]">
                          {localized.timestamp}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => InAppMessageService.deleteMessage(msg.id)}
                      className="text-[#746F68] hover:text-[#C4381C] dark:text-[#A6A096] dark:hover:text-[#FF8A73] p-1 transition cursor-pointer"
                      title={isNe ? 'हटाउनुहोस्' : 'Delete'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Body Text */}
                  <p className="text-xs text-[#524E48] dark:text-[#C5BFB5] leading-relaxed pl-9.5">
                    {localized.body}
                  </p>

                  {/* Verification Code Box (Clean Minimal) */}
                  {msg.code && (
                    <div className="ml-9.5 p-2 rounded-lg bg-white dark:bg-[#1E1D1B] border border-[#E8E2D8] dark:border-[#383530] flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-[#746F68] dark:text-[#A6A096] block">
                          {isNe ? 'प्रमाणीकरण कोड:' : 'Verification Code:'}
                        </span>
                        <strong className="font-mono text-sm tracking-wider text-[#1F1E1B] dark:text-[#F5F3EF]">
                          {msg.code}
                        </strong>
                      </div>
                      <button
                        onClick={() => handleCopyCode(msg.id, msg.code!)}
                        className="px-2 py-1 rounded-md bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] text-[11px] font-medium flex items-center gap-1 text-[#1F1E1B] dark:text-[#F5F3EF] hover:bg-[#F3ECE0] transition cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-[#2E7D5A]" />
                            <span>{t('notif.copied', 'Copied')}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>{t('notif.copyCode', 'Copy')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Action Link (Clean Minimal Text Link) */}
                  {localized.actionLabel && (
                    <div className="pl-9.5 pt-0.5">
                      <button
                        onClick={() => handleAction(msg)}
                        className="text-xs font-semibold text-[#2D6CDF] hover:text-[#2356B2] dark:text-[#76A9FA] flex items-center gap-1 transition cursor-pointer"
                      >
                        <span>{localized.actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>

        {/* Minimal Footer */}
        <div className="px-4 py-2.5 border-t border-[#E8E2D8] dark:border-[#383530] text-center text-[11px] text-[#746F68] dark:text-[#A6A096] bg-[#FAF7F2]/40 dark:bg-[#24221F]/40">
          {isNe ? 'कृषिसेतु इन-एप सूचना प्रणाली' : 'KrishiSetu Mandi & Farm Alerts'}
        </div>
      </motion.div>
    </div>
  );
};
