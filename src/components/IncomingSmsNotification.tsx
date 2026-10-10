import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Smartphone,
  ExternalLink,
  Copy,
  Check,
  X,
  Radio,
  ArrowRight,
} from 'lucide-react';
import { SmsNotifier, IncomingSmsPayload } from '../services/smsNotifier';

export const IncomingSmsNotification: React.FC = () => {
  const [activeSms, setActiveSms] = useState<IncomingSmsPayload | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsub = SmsNotifier.subscribe((payload) => {
      setActiveSms(payload);
      setCopied(false);
    });
    return unsub;
  }, []);

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!activeSms) return null;

  const deviceSmsUri = SmsNotifier.getDeviceSmsUri(activeSms.phone, activeSms.text);
  const whatsAppUri = SmsNotifier.getWhatsAppUri(activeSms.phone, activeSms.text);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-3 pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: -40, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.94 }}
        className="pointer-events-auto bg-[#262421] text-[#FCFAF6] rounded-2xl p-4 shadow-2xl border border-white/15 space-y-3 backdrop-blur-md"
      >
        {/* Header with carrier & time */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#A97C61] flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5 text-[#FCFAF6]" />
            </div>
            <div>
              <div className="font-black tracking-tight text-[13px] flex items-center gap-1.5">
                <span>KrishiSetu SMS Engine</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#4A7A52] animate-ping" />
              </div>
              <div className="text-[10px] text-white/60">
                To: {activeSms.phone} • {activeSms.carrier || 'Nepal Mobile Network'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-white/50">{activeSms.timestamp}</span>
            <button
              onClick={() => setActiveSms(null)}
              className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Message Bubble */}
        <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs font-mono leading-relaxed text-[#FCFAF6]/90 break-words">
          {activeSms.text}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs pt-0.5">
          {activeSms.code && (
            <button
              onClick={() => handleCopy(activeSms.code!)}
              className="px-2.5 py-1.5 rounded-lg bg-[#A97C61] hover:bg-[#96694F] text-[#FCFAF6] font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-[#FCFAF6]" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Code Copied!' : `Copy OTP: ${activeSms.code}`}</span>
            </button>
          )}

          <a
            href={whatsAppUri}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
            title="Deliver directly to your WhatsApp"
          >
            <Smartphone className="w-3 h-3" />
            <span>Send to WhatsApp</span>
          </a>

          <a
            href={deviceSmsUri}
            className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white/90 border border-white/10 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
            title="Open your device default Messages app"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Open in Phone Messages</span>
          </a>

          <button
            onClick={() => handleCopy(activeSms.text)}
            className="px-2 py-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white text-[11px] flex items-center gap-1 ml-auto transition cursor-pointer"
          >
            <Copy className="w-3 h-3" />
            <span>Copy SMS</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
