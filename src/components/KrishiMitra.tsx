import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  Bot,
  User,
  Sparkles,
  RotateCw,
  AlertCircle,
  Sprout,
  ArrowRight,
} from 'lucide-react';
import { AuthUser, ChatMessage } from '../types/krishi';
import { useLanguage } from '../context/LanguageContext';

interface KrishiMitraProps {
  currentUser: AuthUser;
  selectedDistrict: string;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
  onNavigateTab?: (tab: 'home' | 'records' | 'calculator' | 'market' | 'prices' | 'sell' | 'marketplace', cropId?: string) => void;
}

export const KrishiMitra: React.FC<KrishiMitraProps> = ({
  currentUser,
  selectedDistrict,
  isOpen: externalIsOpen,
  onToggle,
  onNavigateTab,
}) => {
  const { language: globalLanguage } = useLanguage();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = (val: boolean) => {
    setInternalIsOpen(val);
    if (onToggle) onToggle(val);
  };

  // Chat language is strictly isolated to KrishiMitra conversation
  // Defaults to stored chat preference, or fallback to global language
  const [chatLanguage, setChatLanguage] = useState<'en' | 'ne'>(() => {
    try {
      const saved = localStorage.getItem('krishimitra_chat_lang');
      if (saved === 'en' || saved === 'ne') return saved;
    } catch {
      // ignore
    }
    return globalLanguage === 'ne' ? 'ne' : 'en';
  });

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);

  const getInitialGreeting = (lang: 'en' | 'ne', district: string): ChatMessage => ({
    id: 'msg-init',
    role: 'assistant',
    text:
      lang === 'ne'
        ? `नमस्ते! म कृषि मित्र (Krishi Mitra) हुँ। मैले तपाईंको लागि आजको कालीमाटी बजार दर र ${district.toUpperCase()} को ढुवानी विश्लेषण गरेको छु। आज तपाईं कुन बालीको भाउ, बेच्ने निर्णय, वा साझा ढुवानी (Transport Pool) बारे बुझ्न चाहनुहुन्छ?`
        : `Hello! I am Krishi Mitra, your KrishiSetu agricultural assistant. I have analyzed today's Kalimati wholesale clearing prices and transport pooling availability for ${district.toUpperCase()}. How can I assist with your crops, selling timing, or transport pooling today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    getInitialGreeting(chatLanguage, selectedDistrict),
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen]);

  // Handle language switch exclusively within KrishiMitra
  // CRITICAL: Does NOT call setGlobalLanguage to keep the rest of the website intact!
  const handleLanguageChange = (newLang: 'en' | 'ne') => {
    if (newLang === chatLanguage) return;
    setChatLanguage(newLang);
    try {
      localStorage.setItem('krishimitra_chat_lang', newLang);
    } catch {
      // ignore
    }

    // If conversation only contains initial greeting, update it to the selected language
    setMessages((prev) => {
      const hasUserMessages = prev.some((m) => m.role === 'user');
      if (!hasUserMessages) {
        return [getInitialGreeting(newLang, selectedDistrict)];
      }
      return prev;
    });
  };

  // Suggested questions in the active chat language
  const suggestedQuestions =
    chatLanguage === 'ne'
      ? [
          'मैले अहिले गोलभेडा बेच्नु पर्छ?',
          'मेरो लागि कुन बजार राम्रो छ?',
          'यातायात खर्च कसरी घटाउन सक्छु?',
          'आजको बजारको अवस्था कस्तो छ?',
        ]
      : [
          'Should I sell my tomatoes now?',
          'Which market is best for me?',
          'How can I reduce transport costs?',
          "What is today's market trend?",
        ];

  const handleSendMessage = async (customQuery?: string) => {
    const text = (customQuery || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setErrorMessage(null);
    setLastFailedQuery(null);

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    if (!customQuery) setInputText('');
    setIsLoading(true);

    try {
      const historyPayload = updatedHistory
        .filter((m) => !m.id.startsWith('err-'))
        .slice(-6)
        .map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.text,
        }));

      // Call KrishiSetu Backend POST /api/chat with chatLanguage isolated to KrishiMitra
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          language: chatLanguage, // 'en' | 'ne'
          history: historyPayload,
          farmerContext: {
            name: currentUser.name || 'Farmer',
            district: selectedDistrict,
            crops: currentUser.primaryCrops || ['tomato', 'cauliflower', 'potato'],
            vegetables: [
              { name: 'Tomato (Local)', quantity: 500, unit: 'kg' },
              { name: 'Cauliflower', quantity: 350, unit: 'kg' },
            ],
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.reply) {
        throw new Error(data.error || 'Failed to fetch AI response');
      }

      // Check if reply suggests relevant actions
      let actionObj: ChatMessage['suggestedAction'] | undefined;
      const lowerReply = data.reply.toLowerCase();
      if (lowerReply.includes('transport pool') || lowerReply.includes('साझा ढुवानी') || lowerReply.includes('freight')) {
        actionObj = {
          type: 'pool',
          label: chatLanguage === 'ne' ? 'साझा ढुवानी हेर्नुहोस् (Transport Pool)' : 'Open Transport Pool',
          tab: 'sell',
        };
      } else if (lowerReply.includes('marketplace') || (lowerReply.includes('बजार') && lowerReply.includes('खरिददार'))) {
        actionObj = {
          type: 'navigate',
          label: chatLanguage === 'ne' ? 'मार्केटप्लेस हेर्नुहोस् (Marketplace)' : 'Explore Marketplace',
          tab: 'marketplace',
        };
      } else if (lowerReply.includes('calculator') || lowerReply.includes('हिसाब') || lowerReply.includes('नाफा')) {
        actionObj = {
          type: 'calculate',
          label: chatLanguage === 'ne' ? 'नाफा क्याल्कुलेटर खोल्नुहोस्' : 'Open Profit Calculator',
          tab: 'calculator',
        };
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: actionObj,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('[KrishiMitra] Error communicating with /api/chat:', err);
      const errorMsgText =
        chatLanguage === 'ne'
          ? 'कृषि मित्र सेवा अहिले उपलब्ध हुन सकेन। कृपया पुन: प्रयास गर्नुहोस्।'
          : 'KrishiSetu AI is temporarily unavailable. Please try again.';

      setErrorMessage(errorMsgText);
      setLastFailedQuery(text);

      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: errorMsgText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button (Styling aligned with KrishiSetu dark/light theme) */}
      <div className="fixed bottom-18 md:bottom-20 right-4 sm:right-6 z-40">
        <motion.button
          type="button"
          id="krishi-mitra-trigger-btn"
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          aria-label="Open Krishi Mitra AI Assistant"
          className="relative group px-4 py-2.5 rounded-full bg-[#1F1E1B] text-white dark:bg-[#FAF7F2] dark:text-[#1F1E1B] flex items-center gap-2.5 shadow-xl border border-[#E8E2D8] dark:border-[#383530] hover:shadow-2xl transition-all cursor-pointer select-none"
        >
          <div className="w-6 h-6 rounded-full bg-[#2E7D5A] text-white flex items-center justify-center">
            <Sprout className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold tracking-tight">
            {chatLanguage === 'ne' ? 'कृषि मित्र' : 'Krishi Mitra'}
          </span>
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
        </motion.button>
      </div>

      {/* Krishi Mitra Chat Drawer Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="krishi-mitra-chat-window"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-20 md:bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[440px] h-[590px] max-h-[82vh] bg-[#FAF7F2] dark:bg-[#1C1A18] rounded-2xl shadow-2xl border border-[#E8E2D8] dark:border-[#383530] flex flex-col overflow-hidden font-sans text-[#1F1E1B] dark:text-[#F5F3EF]"
          >
            {/* Header: Brand-aligned with Website theme */}
            <div className="p-3.5 bg-white dark:bg-[#22201D] border-b border-[#E8E2D8] dark:border-[#383530] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EAF3EE] dark:bg-[#1E3327] text-[#2E7D5A] dark:text-[#4ADE80] border border-[#2E7D5A]/20 dark:border-[#4ADE80]/20 flex items-center justify-center shadow-xs">
                  <Sprout className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-extrabold text-[#1F1E1B] dark:text-[#F5F3EF]">
                      {chatLanguage === 'ne' ? 'कृषि मित्र' : 'Krishi Mitra'}
                    </h3>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#EAF3EE] text-[#2E7D5A] dark:bg-[#1E3327] dark:text-[#4ADE80] border border-[#2E7D5A]/20 dark:border-[#4ADE80]/20">
                      Live
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-[#746F68] dark:text-[#A6A096]">
                    {chatLanguage === 'ne'
                      ? `कालीमाटी बजार तथा ढुवानी सल्लाहकार • ${selectedDistrict}`
                      : `Kalimati & Freight Advisory • ${selectedDistrict.charAt(0).toUpperCase() + selectedDistrict.slice(1)}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Independent English/Nepali Language Switcher for Chat Only */}
                <div
                  id="chat-language-toggle"
                  className="flex items-center bg-[#FAF7F2] dark:bg-[#262421] rounded-lg p-0.5 border border-[#E8E2D8] dark:border-[#383530]"
                  role="group"
                  aria-label="Krishi Mitra Conversation Language"
                >
                  <button
                    type="button"
                    id="btn-lang-en"
                    onClick={() => handleLanguageChange('en')}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      chatLanguage === 'en'
                        ? 'bg-[#2E7D5A] text-white shadow-xs'
                        : 'text-[#746F68] dark:text-[#A6A096] hover:text-[#1F1E1B] dark:hover:text-[#F5F3EF]'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    id="btn-lang-ne"
                    onClick={() => handleLanguageChange('ne')}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      chatLanguage === 'ne'
                        ? 'bg-[#2E7D5A] text-white shadow-xs'
                        : 'text-[#746F68] dark:text-[#A6A096] hover:text-[#1F1E1B] dark:hover:text-[#F5F3EF]'
                    }`}
                  >
                    नेपाली
                  </button>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  id="btn-close-chat"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-lg bg-[#FAF7F2] dark:bg-[#262421] hover:bg-[#E8E2D8] dark:hover:bg-[#383530] text-[#746F68] dark:text-[#A6A096] hover:text-[#1F1E1B] dark:hover:text-[#F5F3EF] flex items-center justify-center transition cursor-pointer border border-[#E8E2D8] dark:border-[#383530]"
                  aria-label="Close Chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div
              id="chat-messages-scroll"
              className="relative flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#FAF7F2] dark:bg-[#1C1A18] text-xs"
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-[#EAF3EE] dark:bg-[#1E3327] text-[#2E7D5A] dark:text-[#4ADE80] border border-[#2E7D5A]/20 dark:border-[#4ADE80]/20 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3 space-y-2 leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#2E7D5A] text-white rounded-tr-xs shadow-xs font-medium'
                        : msg.id.startsWith('err-')
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 rounded-tl-xs'
                        : 'bg-white dark:bg-[#22201D] text-[#1F1E1B] dark:text-[#F5F3EF] border border-[#E8E2D8] dark:border-[#383530] rounded-tl-xs shadow-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line text-xs leading-relaxed">{msg.text}</p>

                    {/* Action pill if suggested */}
                    {msg.suggestedAction && (
                      <button
                        type="button"
                        onClick={() => {
                          if (msg.suggestedAction?.tab && onNavigateTab) {
                            onNavigateTab(msg.suggestedAction.tab as any);
                            setIsOpen(false);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EAF3EE] hover:bg-[#D5E8DD] dark:bg-[#1E3327] dark:hover:bg-[#264434] text-[#2E7D5A] dark:text-[#4ADE80] border border-[#2E7D5A]/30 dark:border-[#4ADE80]/30 font-bold rounded-lg text-[11px] transition mt-2 shadow-xs cursor-pointer"
                      >
                        <span>{msg.suggestedAction.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}

                    <div
                      className={`text-[9px] font-mono ${
                        msg.role === 'user' ? 'text-emerald-100 text-right' : 'text-[#746F68] dark:text-[#A6A096]'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#22201D] text-[#746F68] dark:text-[#A6A096] flex items-center justify-center shrink-0 mt-0.5 border border-[#E8E2D8] dark:border-[#383530]">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing / Thinking Indicator */}
              {isLoading && (
                <div
                  id="chat-loading-indicator"
                  className="flex items-center gap-2 text-[#746F68] dark:text-[#A6A096] text-xs p-2.5 bg-white dark:bg-[#22201D] rounded-2xl w-fit border border-[#E8E2D8] dark:border-[#383530] shadow-xs"
                >
                  <div className="w-4 h-4 rounded-full bg-[#EAF3EE] dark:bg-[#1E3327] text-[#2E7D5A] dark:text-[#4ADE80] flex items-center justify-center animate-spin">
                    <Sparkles className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-[11px] font-bold text-[#1F1E1B] dark:text-[#F5F3EF]">
                    {chatLanguage === 'ne' ? 'कृषि मित्र सल्लाह विश्लेषण गर्दैछ...' : 'Krishi Mitra is analyzing advice...'}
                  </span>
                </div>
              )}

              {/* Retry Banner if last query failed */}
              {lastFailedQuery && (
                <div
                  id="chat-retry-banner"
                  className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center justify-between gap-2 text-xs text-rose-800 dark:text-rose-200 shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span className="text-[11px]">
                      {chatLanguage === 'ne' ? 'सन्देश पठाउन सकिएन' : 'Message could not be sent'}
                    </span>
                  </div>
                  <button
                    type="button"
                    id="btn-retry-failed-message"
                    onClick={() => handleSendMessage(lastFailedQuery)}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shrink-0 transition text-[11px] cursor-pointer"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>{chatLanguage === 'ne' ? 'पुन: प्रयास' : 'Retry'}</span>
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Question Chips */}
            <div
              id="chat-suggested-questions"
              className="px-3 py-2 bg-white dark:bg-[#22201D] border-t border-[#E8E2D8] dark:border-[#383530] flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar"
            >
              {suggestedQuestions.map((question, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(question)}
                  className="whitespace-nowrap px-3 py-1 bg-[#FAF7F2] dark:bg-[#262421] hover:bg-[#EAF3EE] dark:hover:bg-[#1E3327] text-[#1F1E1B] dark:text-[#F5F3EF] hover:text-[#2E7D5A] dark:hover:text-[#4ADE80] border border-[#E8E2D8] dark:border-[#383530] hover:border-[#2E7D5A]/40 rounded-full font-medium transition cursor-pointer shrink-0"
                >
                  {question}
                </button>
              ))}
            </div>

            {/* Multiline Message Input Bar */}
            <div className="p-3 bg-white dark:bg-[#22201D] border-t border-[#E8E2D8] dark:border-[#383530] flex items-end gap-2">
              <textarea
                id="chat-input-textarea"
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={
                  chatLanguage === 'ne'
                    ? 'कृषि मित्रलाई सोध्नुहोस्... (Enter ले पठाउँछ)'
                    : 'Ask Krishi Mitra... (Press Enter to send)'
                }
                className="flex-1 bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] rounded-xl px-3.5 py-2 text-xs text-[#1F1E1B] dark:text-[#F5F3EF] placeholder:text-[#746F68] dark:placeholder:text-[#A6A096] outline-none focus:border-[#2E7D5A] dark:focus:border-[#4ADE80] resize-none max-h-24 leading-relaxed"
              />
              <button
                type="button"
                id="chat-send-btn"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isLoading}
                className="w-9 h-9 rounded-xl bg-[#2E7D5A] hover:bg-[#246648] text-white flex items-center justify-center transition disabled:opacity-40 disabled:hover:bg-[#2E7D5A] shadow-xs active:scale-95 shrink-0 cursor-pointer font-bold mb-0.5"
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
