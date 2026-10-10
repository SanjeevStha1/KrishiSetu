import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  PhoneCall,
  Smartphone,
  Send,
  Mic,
  Volume2,
  VolumeX,
  Play,
  Pause,
  CheckCheck,
  Sparkles,
  Bot,
  Radio,
  Share2,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { COMMODITY_SEEDS, DISTRICT_LIST } from '../data/agriData';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  hasAudio?: boolean;
  audioDuration?: string;
  quickReplies?: string[];
}

export const ChannelSimulators: React.FC = () => {
  const [activeChannel, setActiveChannel] = useState<'whatsapp' | 'sms' | 'ivr'>('whatsapp');

  // WhatsApp State
  const [waMessages, setWaMessages] = useState<ChatMessage[]>([
    {
      id: 'wa-1',
      sender: 'bot',
      text: '🙏 नमस्ते राम बहादुर ज्यू! KrishiSetu WhatsApp सेवामा स्वागत छ।\n\nतपाईंलाई आज के जानकारी चाहिन्छ?',
      timestamp: '10:02 AM',
      hasAudio: true,
      audioDuration: '0:14',
      quickReplies: ['🍅 Chitwan Tomato Rate', '🌱 What to Plant (1 Ropani)', '🚛 Shared Truck to Kalimati', '📝 Log Harvest Outcome'],
    },
  ]);
  const [waInput, setWaInput] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);

  // SMS State
  const [smsMessages, setSmsMessages] = useState<ChatMessage[]>([
    {
      id: 'sms-1',
      sender: 'user',
      text: 'RATE TOMATO CHITWAN',
      timestamp: '09:40 AM',
    },
    {
      id: 'sms-2',
      sender: 'bot',
      text: '[KrishiSetu Alert] Tomato (Chitwan): Farmgate Rs. 42/kg. Kalimati Wholesale: Rs. 48/kg (+14%). Recommend shipping to Kalimati via pooled Bolero. Next departure: 3:00 AM.',
      timestamp: '09:40 AM',
    },
  ]);
  const [smsInput, setSmsInput] = useState('');

  // IVR State
  const [ivrStep, setIvrStep] = useState<number>(0);
  const [ivrLanguage, setIvrLanguage] = useState<'nepali' | 'english'>('nepali');
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let timer: any;
    if (isCalling) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [isCalling]);

  const handleSendWa = (textToSend?: string) => {
    const query = textToSend || waInput.trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `wa-u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setWaMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setWaInput('');
    setIsBotTyping(true);

    setTimeout(() => {
      let botResponse = '';
      let quickChips: string[] = ['🍅 Price Update', '🌱 Crop Advice', '🚛 Shared Transport'];

      const lower = query.toLowerCase();
      if (lower.includes('tomato') || lower.includes('गोलभेडा')) {
        botResponse = `🍅 *Tomato Forecast (Chitwan ➔ Kalimati)*:\n• Today Farmgate: *Rs. 42.00/kg*\n• Kalimati Mandi: *Rs. 48.50/kg*\n• Predicted 30-Day Peak: *Rs. 56.00/kg (Week 4 May)*\n\n💡 *Action:* Prithvi Highway is CLEAR. Joining the Bharatpur pooled Bolero saves Rs. 5.20/kg on freight. Reply *JOIN POOL* to reserve 250kg space.`;
      } else if (lower.includes('plant') || lower.includes('रोप') || lower.includes('ropani')) {
        botResponse = `🌱 *Planting Recommendation for 1.2 Ropani in Chitwan*:\n1. 🥇 *Tomato (Local)* — Est. Profit: Rs. 44,500 (Risk: Low)\n2. 🥈 *French Beans* — Est. Profit: Rs. 38,000 (Harvest: 55 Days)\n3. 🥉 *Capsicum* — Est. Profit: Rs. 52,000 (High Hotel Demand)\n\nReply with crop name for complete seed & fertilizer schedule.`;
      } else if (lower.includes('truck') || lower.includes('pool') || lower.includes('freight') || lower.includes('गाडी')) {
        botResponse = `🚛 *Active Transport Pool Found!*:\n• *Route:* Bharatpur-11 ➔ Kalimati Mandi\n• *Vehicle:* Mahindra Bolero Maxi (2.5 Ton)\n• *Scheduled:* Tomorrow 03:00 AM\n• *Cost:* Rs. 2.60/kg (Solo is Rs. 7.80/kg)\n• *Status:* 1,450 / 2,000 kg filled.\n\nType *CONFIRM 300KG* to book your batch.`;
      } else if (lower.includes('log') || lower.includes('harvest') || lower.includes('outcome')) {
        botResponse = `📝 *Harvest Outcome Logger*:\nTo log your sale, reply in this format:\n\n*SOLD [Crop] [Kg] [Price]*\nExample: *SOLD TOMATO 300 43.5*\n\nThis automatically updates KrishiSetu's self-correcting machine learning model!`;
      } else {
        botResponse = `✅ KrishiSetu Engine Analyzed "${query}":\n• Nearest Mandi: Narayangarh & Kalimati\n• Overall Price Trend: ↗ Upward Bullish (+6.4% this week)\n• Disruption Radar: Malekhu section clear.\n\nType *TOMATO*, *BEANS*, or *WEATHER* for detailed advisory.`;
      }

      const botMsg: ChatMessage = {
        id: `wa-b-${Date.now()}`,
        sender: 'bot',
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hasAudio: true,
        audioDuration: '0:18',
        quickReplies: quickChips,
      };

      setWaMessages((prev) => [...prev, botMsg]);
      setIsBotTyping(false);
    }, 900);
  };

  const handleSendSms = (textToSend?: string) => {
    const query = textToSend || smsInput.trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `sms-u-${Date.now()}`,
      sender: 'user',
      text: query.toUpperCase(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setSmsMessages((prev) => [...prev, userMsg]);
    if (!smsInput) setSmsInput('');

    setTimeout(() => {
      let reply = `[KrishiSetu 1660] Kalimati Rates: Tomato Rs 48/kg, Potato Rs 32/kg, Cauliflower Rs 24/kg, Beans Rs 48/kg. Highway: CLEAR. Help: 1660-01-57474.`;
      if (query.toUpperCase().includes('TOMATO')) {
        reply = `[KrishiSetu 1660] TOMATO: Chitwan Rs 42/kg. Kalimati Rs 48/kg. 30-Day Trend: RISING to Rs 54. Pooled Bolero leaving Bharatpur 3 AM.`;
      } else if (query.toUpperCase().includes('ALERT')) {
        reply = `[KrishiSetu 1660] HIGHWAY ALERT: Prithvi Highway Mugling-Naubise corridor is fully open. Transit time Chitwan-KTM: 4.5 hrs.`;
      }

      setSmsMessages((prev) => [
        ...prev,
        {
          id: `sms-b-${Date.now()}`,
          sender: 'bot',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 md:pb-8">
      {/* Top Banner */}
      <div className="bg-[#1A2E22] text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-xl border border-white/5">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-lime-400/20 text-lime-300 border border-lime-400/30 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-3">
            <Radio className="w-3.5 h-3.5" /> Omnichannel Farmer Access Layer
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            WhatsApp Bot, SMS 1660 & IVR Hotline
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed">
            Nepali farmers like Ram Bahadur spend their day in the field, not in a browser tab. KrishiSetu delivers real-time mandi prices, voice notes, and transport pooling via WhatsApp, zero-rated SMS shortcodes, and toll-free interactive voice response.
          </p>

          {/* Channel Selector Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-5">
            <button
              onClick={() => setActiveChannel('whatsapp')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-xs ${
                activeChannel === 'whatsapp'
                  ? 'bg-[#25D366] text-[#0B3B17]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Bot (Interactive Simulator)</span>
            </button>

            <button
              onClick={() => setActiveChannel('sms')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-xs ${
                activeChannel === 'sms'
                  ? 'bg-lime-400 text-[#1A2E22]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>SMS 1660 Shortcode</span>
            </button>

            <button
              onClick={() => setActiveChannel('ivr')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-xs ${
                activeChannel === 'ivr'
                  ? 'bg-amber-400 text-stone-900'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>Toll-Free IVR (1660-01-KRISHI)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Channel Simulators Display */}
      {activeChannel === 'whatsapp' && (
        <div className="bg-white rounded-3xl border border-black/5 shadow-xl overflow-hidden max-w-2xl mx-auto flex flex-col h-[640px]">
          {/* WhatsApp Header */}
          <div className="bg-[#075E54] text-white p-3.5 sm:p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white font-black text-base shadow-sm">
                🌾
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-white">KrishiSetu AI Assistant</h3>
                  <ShieldCheck className="w-4 h-4 text-[#25D366] fill-[#25D366]" />
                </div>
                <p className="text-[11px] text-lime-200">
                  {isBotTyping ? 'typing advisory...' : 'Online • Official Verified Bot'}
                </p>
              </div>
            </div>

            <div className="text-right text-xs text-white/80 hidden sm:block">
              <span>+977 98012-KRISHI</span>
            </div>
          </div>

          {/* WhatsApp Message Canvas */}
          <div
            className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#E5DDD5] bg-opacity-70"
            style={{
              backgroundImage: 'radial-gradient(#00000010 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          >
            {/* Timestamp Marker */}
            <div className="text-center my-2">
              <span className="bg-white/80 text-[#6B7268] text-[10px] font-bold px-3 py-1 rounded-full shadow-2xs">
                TODAY • ENCRYPTED END-TO-END
              </span>
            </div>

            {waMessages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-3 rounded-2xl shadow-xs text-xs sm:text-[13px] leading-relaxed relative ${
                      isUser
                        ? 'bg-[#DCF8C6] text-[#1A2E22] rounded-tr-none'
                        : 'bg-white text-[#1A2E22] rounded-tl-none'
                    }`}
                  >
                    {/* Audio Voice Note Simulation if available */}
                    {msg.hasAudio && (
                      <div className="mb-2 p-2 bg-[#F0F2F5] rounded-xl flex items-center gap-2.5 border border-black/5">
                        <button
                          type="button"
                          onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                          className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs shrink-0"
                        >
                          {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                        </button>
                        <div className="flex-1 space-y-1">
                          <div className="h-2 bg-[#D1D7DB] rounded-full overflow-hidden flex items-center">
                            <div
                              className={`h-full bg-[#25D366] transition-all duration-300 ${
                                isPlayingAudio ? 'w-3/4 animate-pulse' : 'w-1/4'
                              }`}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-[#6B7268] font-bold">
                            <span>Nepali Audio Summary</span>
                            <span>{msg.audioDuration}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <p className="whitespace-pre-line">{msg.text}</p>

                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[#6B7268]">
                      <span>{msg.timestamp}</span>
                      {isUser && <CheckCheck className="w-3.5 h-3.5 text-[#34B7F1]" />}
                    </div>
                  </div>

                  {/* Quick Reply Chips */}
                  {msg.quickReplies && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.quickReplies.map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendWa(chip)}
                          className="bg-white hover:bg-[#DCF8C6] text-[#075E54] text-[11px] font-bold px-3 py-1.5 rounded-full shadow-xs border border-[#25D366]/30 transition"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {isBotTyping && (
              <div className="flex items-center gap-1.5 bg-white p-2.5 rounded-2xl rounded-tl-none w-20 shadow-xs">
                <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
          </div>

          {/* WhatsApp Bottom Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendWa();
            }}
            className="p-3 bg-[#F0F2F5] flex items-center gap-2 border-t border-black/10"
          >
            <input
              type="text"
              value={waInput}
              onChange={(e) => setWaInput(e.target.value)}
              placeholder="Type message (e.g., Tomato Chitwan, French beans rate, What to plant)..."
              className="flex-1 bg-white rounded-full px-4 py-2.5 text-xs text-[#1A2E22] focus:outline-none shadow-2xs"
            />
            <button
              type="submit"
              className="w-10 h-10 rounded-full bg-[#075E54] hover:bg-[#064e46] text-white flex items-center justify-center shadow-xs transition shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* SMS Gateway Simulator */}
      {activeChannel === 'sms' && (
        <div className="bg-stone-900 text-white rounded-3xl p-6 max-w-xl mx-auto shadow-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-xs text-lime-400 font-bold block">Zero-Rated National Shortcode</span>
              <h3 className="text-lg font-black tracking-tight">SMS Gateway: 1660-01-KRISHI</h3>
            </div>
            <span className="text-[10px] bg-lime-500/20 text-lime-300 font-bold px-2.5 py-1 rounded-full border border-lime-500/30">
              NTC & Ncell Free
            </span>
          </div>

          <div className="bg-black/60 rounded-2xl p-4 space-y-3 min-h-[300px] overflow-y-auto font-mono text-xs">
            {smsMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-xl max-w-[85%] ${
                  msg.sender === 'user'
                    ? 'ml-auto bg-stone-800 text-lime-300 border border-white/10'
                    : 'bg-emerald-950/80 text-white border border-emerald-500/30'
                }`}
              >
                <div className="text-[10px] text-stone-400 mb-1">
                  {msg.sender === 'user' ? 'TO: 1660-01-KRISHI' : 'FROM: KRISHISETU'} • {msg.timestamp}
                </div>
                <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
              </div>
            ))}
          </div>

          {/* Quick SMS Chips */}
          <div className="flex flex-wrap gap-2 text-xs">
            {['RATE TOMATO', 'RATE POTATO', 'ALERT PRITHVI', 'HARVEST CHITWAN'].map((cmd) => (
              <button
                key={cmd}
                onClick={() => handleSendSms(cmd)}
                className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-1.5 rounded-lg border border-white/5 font-mono text-[11px]"
              >
                {cmd}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendSms();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={smsInput}
              onChange={(e) => setSmsInput(e.target.value)}
              placeholder="Type SMS command (e.g. RATE TOMATO)..."
              className="flex-1 bg-stone-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-lime-400 font-mono"
            />
            <button
              type="submit"
              className="bg-lime-400 hover:bg-lime-300 text-[#1A2E22] px-4 py-2 rounded-xl text-xs font-bold transition"
            >
              Send SMS
            </button>
          </form>
        </div>
      )}

      {/* IVR Hotline Simulator */}
      {activeChannel === 'ivr' && (
        <div className="bg-[#1A2E22] text-white rounded-3xl p-6 max-w-xl mx-auto shadow-2xl border border-white/10 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-xs text-amber-300 font-bold block">Toll-Free Interactive Voice Response</span>
              <h3 className="text-lg font-black tracking-tight">Call 1660-01-57474 (KRISHI)</h3>
            </div>
            <button
              onClick={() => setIvrLanguage(ivrLanguage === 'nepali' ? 'english' : 'nepali')}
              className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-xl font-bold transition text-stone-200"
            >
              Language: {ivrLanguage === 'nepali' ? 'नेपाली (Nepali)' : 'English'}
            </button>
          </div>

          {/* Interactive Call Status Box */}
          <div className="bg-black/40 rounded-2xl p-6 text-center space-y-4 border border-white/5">
            {isCalling ? (
              <div className="space-y-3 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto animate-pulse">
                  <PhoneCall className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-black text-lg">Call in Progress...</h4>
                  <span className="text-xs text-emerald-400 font-mono">00:{callDuration < 10 ? `0${callDuration}` : callDuration}</span>
                </div>

                <div className="bg-white/5 p-4 rounded-xl text-xs text-stone-200 text-left space-y-2 border border-white/5">
                  <div className="flex items-center gap-2 text-amber-300 font-bold">
                    <Volume2 className="w-4 h-4 animate-bounce" /> Spoken Automated Prompt:
                  </div>
                  <p className="italic leading-relaxed text-[13px]">
                    {ivrLanguage === 'nepali'
                      ? '"कृषिसेतु आवाज सेवामा स्वागत छ। आजको कालिमाटी दरका लागि १ थिच्नुहोस्, रोप्ने बाली सिफारिसका लागि २ थिच्नुहोस्, राजमार्ग अवरोध स्थितिका लागि ३ थिच्नुहोस्..."'
                      : '"Welcome to KrishiSetu Voice. Press 1 for Kalimati rates, Press 2 for Sowing Recommendations, Press 3 for Highway Alerts."'}
                  </p>
                </div>

                {/* Keypad simulation */}
                <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto pt-2">
                  {[
                    { num: '1', label: 'Mandi Rates' },
                    { num: '2', label: 'Plant Wizard' },
                    { num: '3', label: 'Highway Status' },
                    { num: '4', label: 'Chitwan Pool' },
                    { num: '5', label: 'Log Harvest' },
                    { num: '9', label: 'Speak to DADO' },
                  ].map((btn) => (
                    <button
                      key={btn.num}
                      onClick={() => {
                        if (btn.num === '1') {
                          alert(ivrLanguage === 'nepali' ? 'कालीमाटी थोक दर: गोलभेडा रु ४८, आलु रु ३२, काउली रु २४, सिमी रु ४८ प्रति केजी।' : 'Kalimati Rates: Tomato Rs 48, Potato Rs 32, Cauliflower Rs 24, Beans Rs 48/kg.');
                        } else if (btn.num === '3') {
                          alert(ivrLanguage === 'nepali' ? 'पृथ्वी राजमार्ग: मुग्लिन-नौबिसे सडक पूर्ण रूपमा खुला छ।' : 'Prithvi Highway: Fully open without delays.');
                        } else {
                          alert(`IVR Option ${btn.num} selected.`);
                        }
                      }}
                      className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl text-center transition"
                    >
                      <span className="text-base font-black block">{btn.num}</span>
                      <span className="text-[9px] text-stone-400">{btn.label}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setIsCalling(false)}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg transition"
                >
                  End Call
                </button>
              </div>
            ) : (
              <div className="py-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-white/10 text-stone-300 flex items-center justify-center mx-auto">
                  <PhoneCall className="w-8 h-8" />
                </div>
                <h4 className="font-black text-lg">Test Voice Hotline Simulation</h4>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">
                  Designed for farmers without smartphones or internet data. Accessible on any basic button phone across all 77 districts.
                </p>
                <button
                  onClick={() => setIsCalling(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xl transition flex items-center gap-2 mx-auto active:scale-95"
                >
                  <PhoneCall className="w-4 h-4" /> Start Simulated Voice Call
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
