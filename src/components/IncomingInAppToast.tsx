import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  MessageSquare,
  TrendingUp,
  Truck,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
  X,
  ArrowRight,
} from 'lucide-react';
import { InAppMessage, InAppMessageType } from '../types/inAppMessage';
import { InAppMessageService } from '../services/inAppMessageService';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedNotification } from '../utils/notificationLocalization';

interface IncomingInAppToastProps {
  onOpenInbox: () => void;
}

export const IncomingInAppToast: React.FC<IncomingInAppToastProps> = ({ onOpenInbox }) => {
  const [activeMessage, setActiveMessage] = useState<InAppMessage | null>(null);
  const [copied, setCopied] = useState(false);
  const { language, t } = useLanguage();

  useEffect(() => {
    const unsub = InAppMessageService.subscribeToToast((msg) => {
      setActiveMessage(msg);
      setCopied(false);

      // Auto dismiss after 7 seconds if no user interaction
      const timer = setTimeout(() => {
        setActiveMessage((current) => (current?.id === msg.id ? null : current));
      }, 7000);

      return () => clearTimeout(timer);
    });

    return unsub;
  }, []);

  if (!activeMessage) return null;

  const loc = getLocalizedNotification(activeMessage, language, t);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getIcon = (type: InAppMessageType) => {
    switch (type) {
      case 'price_bulletin':
        return <TrendingUp className="w-4 h-4 text-[#A97C61] dark:text-[#C99678]" />;
      case 'pooling_match':
        return <Truck className="w-4 h-4 text-[#4A7A52] dark:text-[#88C496]" />;
      case 'weather_alert':
        return <AlertTriangle className="w-4 h-4 text-[#D97706] dark:text-[#FBBF24]" />;
      case 'system_verification':
        return <ShieldCheck className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />;
      default:
        return <MessageSquare className="w-4 h-4 text-[#A97C61] dark:text-[#C99678]" />;
    }
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-3 pointer-events-none font-sans">
      <motion.div
        initial={{ opacity: 0, y: -30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="pointer-events-auto bg-[#262421] dark:bg-[#1A1917] text-[#FCFAF6] dark:text-[#F2EFE9] rounded-2xl p-4 shadow-2xl border border-[#36332E] dark:border-[#38362F] space-y-2.5 backdrop-blur-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#3E3A34] dark:bg-[#242320] flex items-center justify-center border border-[#44403B] dark:border-[#38362F]">
              {getIcon(activeMessage.type)}
            </div>
            <div>
              <div className="font-black text-xs text-[#FCFAF6] dark:text-[#F2EFE9] flex items-center gap-1.5">
                <span>{loc.title}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#A97C61] dark:bg-[#C99678] animate-pulse" />
              </div>
              <div className="text-[10px] text-[#A09B93] dark:text-[#9B9790]">
                KrishiSetu Alert • {loc.timestamp}
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveMessage(null)}
            className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <p className="text-xs text-[#EFEBE4] dark:text-[#D1CCC4] leading-relaxed bg-[#322F2A] dark:bg-[#22211E] p-2.5 rounded-xl border border-[#44403B] dark:border-[#38362F]">
          {loc.body}
        </p>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pt-0.5 text-xs">
          {activeMessage.code && (
            <button
              onClick={() => handleCopyCode(activeMessage.code!)}
              className="px-3 py-1.5 rounded-xl bg-[#A97C61] dark:bg-[#C99678] hover:bg-[#96694F] dark:hover:bg-[#B88567] text-[#FCFAF6] dark:text-[#1A1917] font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t('notif.copied', 'Copied!') : `${t('notif.copyCode', 'Copy Code')}: ${activeMessage.code}`}</span>
            </button>
          )}

          <button
            onClick={() => {
              setActiveMessage(null);
              onOpenInbox();
            }}
            className="px-3 py-1.5 rounded-xl bg-[#3E3A34] dark:bg-[#242320] hover:bg-[#44403B] dark:hover:bg-[#2E2C27] text-[#FCFAF6] dark:text-[#F2EFE9] font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border border-[#504C45] dark:border-[#38362F]"
          >
            <span>{t('header.settings', 'Open Settings / Inbox')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
