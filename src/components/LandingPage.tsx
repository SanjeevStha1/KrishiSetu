import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sprout,
  Store,
  Truck,
  TrendingUp,
  Bot,
  ShieldCheck,
  ArrowRight,
  MapPin,
  Phone,
  Users,
  Clock,
  X,
  Check,
  Globe,
  LogIn,
  UserPlus,
  CheckCircle2,
  ChevronRight,
  Package,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { DISTRICT_LIST } from '../data/agriData';
import { AuthService } from '../services/authService';
import { AuthUser, LandUnit } from '../types/krishi';

interface LandingPageProps {
  onLoginSuccess: (user: AuthUser) => void;
}

type AuthModalMode = 'login' | 'register' | null;

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginSuccess }) => {
  const { language, setLanguage } = useLanguage();
  const isNe = language === 'ne';

  // Modal State
  const [modalMode, setModalMode] = useState<AuthModalMode>(null);
  const [authStep, setAuthStep] = useState<'form' | 'otp'>('form');

  // Login Form
  const [loginPhone, setLoginPhone] = useState('');

  // Register Form
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDistrict, setRegDistrict] = useState('chitwan');
  const [regLandSize, setRegLandSize] = useState<number>(2);
  const [regLandUnit, setRegLandUnit] = useState<LandUnit>('ropani');
  const [regCrops, setRegCrops] = useState<string[]>(['tomato', 'cauliflower']);

  // OTP State
  const [otpDigits, setOtpDigits] = useState<string[]>(['1', '2', '3', '4', '5', '6']);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active phone being authenticated
  const activePhone = modalMode === 'register' ? regPhone : loginPhone;
  const phoneValidation = AuthService.validateNepalPhone(activePhone);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setModalMode(mode);
    setAuthStep('form');
    setAuthError(null);
  };

  const handleCloseAuth = () => {
    setModalMode(null);
    setAuthStep('form');
    setAuthError(null);
  };

  const toggleCropSelection = (cropId: string) => {
    setRegCrops((prev) =>
      prev.includes(cropId) ? prev.filter((c) => c !== cropId) : [...prev, cropId]
    );
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!phoneValidation.isValid) {
      setAuthError(
        isNe
          ? 'कृपया १० अङ्कको सही नेपाली मोबाइल नम्बर प्रविष्ट गर्नुहोस्।'
          : 'Please enter a valid 10-digit Nepal mobile number (98XXXXXXXX or 97XXXXXXXX).'
      );
      return;
    }

    if (modalMode === 'register' && !regName.trim()) {
      setAuthError(isNe ? 'कृपया आफ्नो नाम लेख्नुहोस्।' : 'Please enter your name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await AuthService.sendPhoneOTP(
        activePhone,
        modalMode === 'register' ? 'register' : 'login'
      );

      if (res.alreadyExists && modalMode === 'register') {
        setAuthError(
          isNe
            ? 'यो फोन नम्बर पहिले नै दर्ता भइसकेको छ। कृपया लगइन गर्नुहोस्।'
            : 'This mobile number is already registered. Please log in.'
        );
        return;
      }

      if (res.notRegistered && modalMode === 'login') {
        setAuthError(
          isNe
            ? 'यो नम्बर दर्ता भएको छैन। कृपया नयाँ खाता खोल्नुहोस्।'
            : 'Phone not registered. Please sign up to create an account.'
        );
        return;
      }

      setAuthStep('otp');
      // Default to dev test code for seamless preview testing
      setOtpDigits(['1', '2', '3', '4', '5', '6']);
    } catch (err: any) {
      setAuthError(err.message || 'Error sending code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) {
      setAuthError(isNe ? '६ अङ्कको कोड प्रविष्ट गर्नुहोस्।' : 'Enter 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (modalMode === 'register') {
        // Register new farmer
        const res = await AuthService.registerFarmerUser({
          phone: regPhone,
          name: regName.trim(),
          district: regDistrict,
          landSize: regLandSize,
          landUnit: regLandUnit,
          primaryCrops: regCrops,
        });

        if (res.success && res.user) {
          onLoginSuccess(res.user);
          handleCloseAuth();
          return;
        } else {
          setAuthError(res.error || 'Registration failed.');
        }
      } else {
        // Verify login
        const res = await AuthService.verifyOTP({
          phoneNumber: loginPhone,
          code: fullCode,
          intent: 'login',
        });

        if (res.success && res.user) {
          onLoginSuccess(res.user);
          handleCloseAuth();
          return;
        } else {
          setAuthError(res.error || (isNe ? 'कोड मिलेन वा म्याद सकियो।' : 'Invalid code.'));
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cropOptions = [
    { id: 'tomato', name: isNe ? 'गोलभेडा' : 'Tomato', emoji: '🍅' },
    { id: 'potato', name: isNe ? 'आलु' : 'Potato', emoji: '🥔' },
    { id: 'cauliflower', name: isNe ? 'काउली' : 'Cauliflower', emoji: '🥦' },
    { id: 'cabbage', name: isNe ? 'बन्दा' : 'Cabbage', emoji: '🥬' },
    { id: 'onion', name: isNe ? 'प्याज' : 'Onion', emoji: '🧅' },
    { id: 'ginger', name: isNe ? 'अदुवा' : 'Ginger', emoji: '🫚' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1F1E1B] flex flex-col selection:bg-[#2E7D5A] selection:text-white">
      {/* 1. TOP NAVIGATION */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E8E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E7D5A] text-white flex items-center justify-center shadow-xs">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-lg sm:text-xl tracking-tight text-[#1F1E1B]">
                  KrishiSetu
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded-md bg-[#2E7D5A]/10 text-[#2E7D5A] font-bold">
                  {isNe ? 'कृषिसेतु' : 'Agri Network'}
                </span>
              </div>
              <p className="text-[10px] text-[#78716A] uppercase tracking-wider font-semibold">
                {isNe ? 'नेपाल थोक बजार मञ्च' : 'Nepal Mandi Network'}
              </p>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language toggle */}
            <button
              type="button"
              onClick={() => setLanguage(isNe ? 'en' : 'ne')}
              className="px-2.5 py-1.5 rounded-xl border border-[#E8E2D8] bg-white text-xs font-bold text-[#4A453E] hover:border-[#2E7D5A] transition flex items-center gap-1 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#2E7D5A]" />
              <span>{isNe ? 'English' : 'नेपाली'}</span>
            </button>

            {/* Log In */}
            <button
              type="button"
              onClick={() => handleOpenAuth('login')}
              className="px-3.5 py-1.5 rounded-xl border border-[#D5CEC2] bg-white hover:bg-[#F2ECE4] text-xs font-bold text-[#1F1E1B] transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-[#2E7D5A]" />
              <span>{isNe ? 'लगइन' : 'Log In'}</span>
            </button>

            {/* Sign Up */}
            <button
              type="button"
              onClick={() => handleOpenAuth('register')}
              className="px-4 py-1.5 rounded-xl bg-[#2E7D5A] hover:bg-[#246648] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isNe ? 'दर्ता गर्नुहोस्' : 'Sign Up'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="pt-10 pb-12 sm:pt-16 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="max-w-3xl space-y-6">
          {/* Status badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E8E2D8] text-xs font-bold text-[#2E7D5A] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {isNe
                ? 'कालीमाटी • नारायणगढ • पोखरा दैनिक थोक दर'
                : 'Live Kalimati • Narayangarh • Pokhara Wholesale Rates'}
            </span>
          </div>

          {/* Punchy Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#1F1E1B] font-serif leading-[1.15] tracking-tight">
            {isNe ? (
              <>
                सटीक बजार भाउ। <br />
                <span className="text-[#2E7D5A]">बचतपूर्ण साझा ढुवानी।</span>
              </>
            ) : (
              <>
                Better Mandi Prices. <br />
                <span className="text-[#2E7D5A]">Less Freight Waste.</span>
              </>
            )}
          </h1>

          {/* Micro-copy Subtitle (1 punchy sentence) */}
          <p className="text-base sm:text-lg text-[#5A544C] leading-relaxed max-w-2xl">
            {isNe
              ? 'दैनिक थोक दर ट्र्याक गर्नुहोस्, छिमेकी किसानसँग साझा गाडी बुक गर्नुहोस् र बिचौलिया बिना सिधा बिक्री गर्नुहोस्।'
              : 'Real-time wholesale benchmarks, shared vehicle routes, and direct buyer connections for Nepali farmers.'}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleOpenAuth('register')}
              className="px-6 py-3 rounded-2xl bg-[#2E7D5A] hover:bg-[#246648] text-white font-black text-sm transition shadow-md shadow-[#2E7D5A]/20 flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <span>{isNe ? 'नयाँ कृषक खाता खोल्नुहोस्' : 'Register Farmer Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => handleOpenAuth('login')}
              className="px-5 py-3 rounded-2xl bg-white border border-[#D5CEC2] hover:bg-[#F2ECE4] text-[#1F1E1B] font-bold text-sm transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <LogIn className="w-4 h-4 text-[#2E7D5A]" />
              <span>{isNe ? 'मोबाइलबाट लगइन' : 'Sign In with Phone'}</span>
            </button>
          </div>
        </div>

        {/* 3. METRICS RIBBON (Layout conveys scale) */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              value: '42+',
              label: isNe ? 'थोक मन्डी बजार' : 'Mandi Hubs',
              desc: isNe ? 'कालीमाटी सहित' : 'Kalimati & corridors',
            },
            {
              value: '15 min',
              label: isNe ? 'दर अपडेट' : 'Sync Frequency',
              desc: isNe ? 'प्रत्येक बिहान' : 'Daily official feed',
            },
            {
              value: '50%',
              label: isNe ? 'ढुवानी बचत' : 'Freight Savings',
              desc: isNe ? 'साझा गाडी सेयरिङ' : 'Shared pickup routes',
            },
            {
              value: '0%',
              label: isNe ? 'बिचौलिया कमिसन' : 'Middleman Fee',
              desc: isNe ? 'सिधा भुक्तानी' : 'Direct farmgate cash',
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white border border-[#E8E2D8] shadow-xs space-y-1"
            >
              <span className="text-2xl sm:text-3xl font-black text-[#2E7D5A] font-serif block">
                {stat.value}
              </span>
              <span className="text-xs font-black text-[#1F1E1B] block">{stat.label}</span>
              <span className="text-[11px] text-[#78716A] block">{stat.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. LIVE COMMODITY BENCHMARK TICKER */}
      <section className="py-8 bg-white border-y border-[#E8E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h2 className="text-xs font-black uppercase tracking-wider text-[#78716A]">
                {isNe ? 'आजको कालीमाटी थोक दर' : "Today's Kalimati Wholesale Benchmarks"}
              </h2>
            </div>
            <span className="text-[11px] text-[#78716A] font-medium">
              {isNe ? 'प्रमाणित कालीमाटी दर' : 'KFVMDB Official Rates'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                crop: isNe ? 'गोलभेडा (लोकल)' : 'Tomato (Local)',
                emoji: '🍅',
                rate: 'Rs 38 / kg',
                trend: '+5.2%',
                up: true,
              },
              {
                crop: isNe ? 'रातो आलु' : 'Red Potato',
                emoji: '🥔',
                rate: 'Rs 29 / kg',
                trend: 'Stable',
                up: null,
              },
              {
                crop: isNe ? 'काउली (स्थानीय)' : 'Cauliflower',
                emoji: '🥦',
                rate: 'Rs 24 / kg',
                trend: '+8.0%',
                up: true,
              },
              {
                crop: isNe ? 'हरियो बन्दा' : 'Green Cabbage',
                emoji: '🥬',
                rate: 'Rs 21 / kg',
                trend: '-3.5%',
                up: false,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E2D8] flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <span className="text-xs font-bold text-[#1F1E1B] block">{item.crop}</span>
                    <span className="text-xs font-mono font-black text-[#2E7D5A] block">
                      {item.rate}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    item.up === true
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.up === false
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {item.trend}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 3-PILLAR BENTO GRID (Layout and visual cards explain the solution) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-[#2E7D5A]">
            {isNe ? 'मुख्य सुविधाहरू' : 'Platform Modules'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1F1E1B] font-serif">
            {isNe ? 'किसानका लागि सम्पूर्ण बजार समाधान' : 'Integrated Market Tools for Farmers'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Mandi Rates */}
          <div className="p-6 rounded-3xl bg-white border border-[#E8E2D8] shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#2E7D5A] flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#1F1E1B] font-serif">
                  {isNe ? '१. थोक बजार भाउ' : '1. Mandi Intelligence'}
                </h3>
                <p className="text-xs text-[#5A544C] mt-1">
                  {isNe
                    ? 'कालीमाटी, नारायणगढ र पोखरा मन्डीको दैनिक वास्तविक दर।'
                    : 'Verified daily wholesale benchmarks across major agricultural corridors.'}
                </p>
              </div>

              {/* Visual mini-data box */}
              <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1F1E1B]">Kalimati Hub</span>
                  <span className="font-mono text-[#2E7D5A] font-bold">15-min sync</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1F1E1B]">Pokhara Hub</span>
                  <span className="font-mono text-[#2E7D5A] font-bold">Updated today</span>
                </div>
              </div>
            </div>

            <ul className="space-y-2 text-xs text-[#4A453E] border-t border-[#E8E2D8] pt-4">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#2E7D5A]" />
                <span>{isNe ? 'दैनिक मूल्य अपडेट' : 'Real-time wholesale updates'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#2E7D5A]" />
                <span>{isNe ? '७-दिनको मूल्य पूर्वानुमान' : '7-day price forecasting'}</span>
              </li>
            </ul>
          </div>

          {/* Pillar 2: Shared Freight */}
          <div className="p-6 rounded-3xl bg-white border border-[#E8E2D8] shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#1F1E1B] font-serif">
                  {isNe ? '२. साझा गाडी ढुवानी' : '2. Shared Freight Pooling'}
                </h3>
                <p className="text-xs text-[#5A544C] mt-1">
                  {isNe
                    ? 'छिमेकी किसानसँग गाडी सेयर गरी ढुवानी खर्च ५०% सम्म बचत गर्नुहोस्।'
                    : 'Pool cargo space on shared Bolero and Tata trucks to slash transport fees.'}
                </p>
              </div>

              {/* Visual route card */}
              <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#1F1E1B]">
                  <span>Chitwan → Kalimati</span>
                  <span className="text-[#2E7D5A]">Rs 2.2 / kg</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#E8E2D8] overflow-hidden">
                  <div className="w-3/4 h-full bg-[#2E7D5A] rounded-full" />
                </div>
                <span className="text-[10px] text-[#78716A] block">1,500 kg / 2,000 kg booked</span>
              </div>
            </div>

            <ul className="space-y-2 text-xs text-[#4A453E] border-t border-[#E8E2D8] pt-4">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#2E7D5A]" />
                <span>{isNe ? 'केजी अनुसार बुकिङ' : 'Book by the kilogram'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#2E7D5A]" />
                <span>{isNe ? 'खेतबाटै संकलन' : 'Corridor doorstep pickups'}</span>
              </li>
            </ul>
          </div>

          {/* Pillar 3: Direct Trade */}
          <div className="p-6 rounded-3xl bg-white border border-[#E8E2D8] shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#1F1E1B] font-serif">
                  {isNe ? '३. खुला थोक हाटबजार' : '3. Direct Wholesale Market'}
                </h3>
                <p className="text-xs text-[#5A544C] mt-1">
                  {isNe
                    ? 'आफ्नो बाली सिधै थोक खरिददारलाई शून्य बिचौलिया कमिसनमा बेच्नुहोस्।'
                    : 'List harvested lots directly to verified hotel, retail, and wholesale buyers.'}
                </p>
              </div>

              {/* Visual trade preview */}
              <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1F1E1B]">🍅 Tomato Lot #481</span>
                  <span className="font-mono text-[#2E7D5A] font-bold">850 kg</span>
                </div>
                <div className="flex items-center justify-between text-[#78716A] text-[11px]">
                  <span>Farmer: Chitwan Agro</span>
                  <span>Ready in 2 days</span>
                </div>
              </div>
            </div>

            <ul className="space-y-2 text-xs text-[#4A453E] border-t border-[#E8E2D8] pt-4">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#2E7D5A]" />
                <span>{isNe ? '०% बिचौलिया कटौती' : '0% commission fee'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#2E7D5A]" />
                <span>{isNe ? 'सिधा फोन सम्पर्क' : 'Direct buyer telephone call'}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS (3 Simple Steps) */}
      <section className="py-12 bg-white border-y border-[#E8E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-[#2E7D5A]">
              {isNe ? 'प्रयोग विधि' : 'Workflow'}
            </span>
            <h2 className="text-2xl font-black text-[#1F1E1B] font-serif">
              {isNe ? '३ सरल चरणमा सुरु गर्नुहोस्' : 'Start in 3 Simple Steps'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: isNe ? 'फोन नम्बर दर्ता' : 'Enter Phone',
                desc: isNe
                  ? '१ मिनेटमा आफ्नो जिल्ला र बाली रोजेर खाता बनाउनुहोस्।'
                  : 'Quick 1-minute profile with your district and primary crops.',
              },
              {
                step: '02',
                title: isNe ? 'बजार दर तुलना' : 'Check Mandi Rates',
                desc: isNe
                  ? 'कालीमाटी र क्षेत्रीय मन्डीको दैनिक भाउ हेर्नुहोस्।'
                  : 'Compare daily wholesale benchmarks before selling at farmgate.',
              },
              {
                step: '03',
                title: isNe ? 'साझा ढुवानी र बिक्री' : 'Pool & Sell Direct',
                desc: isNe
                  ? 'छिमेकीसँग गाडी सेयर गर्नुहोस् वा सिधा खरिददारलाई बेच्नुहोस्।'
                  : 'Book shared freight space or connect directly with verified buyers.',
              },
            ].map((st, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] space-y-2 relative"
              >
                <span className="font-mono text-xs font-black text-[#2E7D5A] bg-white px-2 py-0.5 rounded-md border border-[#E8E2D8]">
                  {st.step}
                </span>
                <h3 className="text-base font-black text-[#1F1E1B]">{st.title}</h3>
                <p className="text-xs text-[#5A544C] leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. BOTTOM CALL TO ACTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#2E7D5A] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-black font-serif">
              {isNe ? 'आफ्नो उपजको उचित मूल्य पाउनुहोस्' : 'Take Control of Your Harvest Returns'}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100">
              {isNe
                ? 'कालीमाटी दर, साझा गाडी ढुवानी र खुला बजारमा आजै निःशुल्क जोडिनुहोस्।'
                : 'Join Nepal growers using real-time wholesale benchmarks and shared freight.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleOpenAuth('register')}
              className="px-6 py-3 rounded-2xl bg-white text-[#2E7D5A] font-black text-sm hover:bg-[#F2ECE4] transition cursor-pointer shadow-xs active:scale-98"
            >
              {isNe ? 'निःशुल्क दर्ता गर्नुहोस्' : 'Sign Up Free'}
            </button>
            <button
              type="button"
              onClick={() => handleOpenAuth('login')}
              className="px-5 py-3 rounded-2xl bg-[#246648] hover:bg-[#1c5038] text-white font-bold text-sm border border-white/20 transition cursor-pointer"
            >
              {isNe ? 'लगइन' : 'Log In'}
            </button>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="mt-auto py-8 bg-white border-t border-[#E8E2D8] text-center text-xs text-[#78716A]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-[#2E7D5A]" />
            <span className="font-bold text-[#1F1E1B]">KrishiSetu कृषिसेतु</span>
            <span>• Nepal Agricultural Exchange</span>
          </div>
          <p className="text-[11px]">
            Kalimati Fruit & Vegetable Market Development Board (KFVMDB) benchmarked.
          </p>
        </div>
      </footer>

      {/* 9. CLEAN LOGIN & REGISTRATION MODAL */}
      <AnimatePresence>
        {modalMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseAuth}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-3xl border border-[#E8E2D8] shadow-2xl p-6 sm:p-7 z-10 space-y-5"
            >
              {/* Top Close & Tabs */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 p-1 bg-[#FAF7F2] rounded-xl border border-[#E8E2D8]">
                  <button
                    type="button"
                    onClick={() => {
                      setModalMode('login');
                      setAuthStep('form');
                      setAuthError(null);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      modalMode === 'login'
                        ? 'bg-[#2E7D5A] text-white shadow-xs'
                        : 'text-[#5A544C] hover:text-[#1F1E1B]'
                    }`}
                  >
                    {isNe ? 'लगइन' : 'Log In'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalMode('register');
                      setAuthStep('form');
                      setAuthError(null);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      modalMode === 'register'
                        ? 'bg-[#2E7D5A] text-white shadow-xs'
                        : 'text-[#5A544C] hover:text-[#1F1E1B]'
                    }`}
                  >
                    {isNe ? 'नयाँ दर्ता' : 'Sign Up'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCloseAuth}
                  className="w-8 h-8 rounded-full bg-[#FAF7F2] hover:bg-[#E8E2D8] flex items-center justify-center text-[#5A544C] transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Error Message */}
              {authError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* STEP 1: FORM INPUT */}
              {authStep === 'form' && (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  {/* Registration fields */}
                  {modalMode === 'register' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-[#1F1E1B] mb-1">
                          {isNe ? 'पूरा नाम' : 'Full Name'}
                        </label>
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder={isNe ? 'उदा: राम बहादुर थापा' : 'e.g. Ram Bahadur Thapa'}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CEC2] bg-[#FAF7F2] text-sm text-[#1F1E1B] focus:border-[#2E7D5A] focus:bg-white outline-hidden transition"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-[#1F1E1B] mb-1">
                            {isNe ? 'जिल्ला' : 'District'}
                          </label>
                          <select
                            value={regDistrict}
                            onChange={(e) => setRegDistrict(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-[#D5CEC2] bg-[#FAF7F2] text-xs text-[#1F1E1B] focus:border-[#2E7D5A] focus:bg-white outline-hidden transition capitalize"
                          >
                            {DISTRICT_LIST.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#1F1E1B] mb-1">
                            {isNe ? 'जमिन' : 'Land Size'}
                          </label>
                          <div className="flex gap-1.5">
                            <input
                              type="number"
                              min="0.5"
                              step="0.5"
                              value={regLandSize}
                              onChange={(e) => setRegLandSize(parseFloat(e.target.value) || 1)}
                              className="w-1/2 px-2.5 py-2.5 rounded-xl border border-[#D5CEC2] bg-[#FAF7F2] text-xs text-[#1F1E1B] focus:border-[#2E7D5A] focus:bg-white outline-hidden transition"
                            />
                            <select
                              value={regLandUnit}
                              onChange={(e) => setRegLandUnit(e.target.value as LandUnit)}
                              className="w-1/2 px-1.5 py-2.5 rounded-xl border border-[#D5CEC2] bg-[#FAF7F2] text-xs text-[#1F1E1B] focus:border-[#2E7D5A] focus:bg-white outline-hidden transition"
                            >
                              <option value="ropani">Ropani</option>
                              <option value="kattha">Kattha</option>
                              <option value="bigha">Bigha</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#1F1E1B] mb-1.5">
                          {isNe ? 'मुख्य बालीहरू' : 'Primary Crops'}
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {cropOptions.map((crop) => {
                            const selected = regCrops.includes(crop.id);
                            return (
                              <button
                                key={crop.id}
                                type="button"
                                onClick={() => toggleCropSelection(crop.id)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer flex items-center gap-1 ${
                                  selected
                                    ? 'bg-[#2E7D5A] text-white border-[#2E7D5A]'
                                    : 'bg-[#FAF7F2] text-[#5A544C] border-[#E8E2D8] hover:border-[#D5CEC2]'
                                }`}
                              >
                                <span>{crop.emoji}</span>
                                <span>{crop.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Phone Input */}
                  <div>
                    <label className="block text-xs font-bold text-[#1F1E1B] mb-1">
                      {isNe ? 'मोबाइल नम्बर' : 'Mobile Number'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#78716A]">
                        +977
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        value={modalMode === 'register' ? regPhone : loginPhone}
                        onChange={(e) => {
                          const clean = e.target.value.replace(/\D/g, '');
                          if (modalMode === 'register') setRegPhone(clean);
                          else setLoginPhone(clean);
                        }}
                        placeholder="98XXXXXXXX"
                        className="w-full pl-14 pr-3.5 py-2.5 rounded-xl border border-[#D5CEC2] bg-[#FAF7F2] font-mono text-sm text-[#1F1E1B] focus:border-[#2E7D5A] focus:bg-white outline-hidden transition"
                      />
                    </div>
                    {phoneValidation.carrier && (
                      <p className="text-[11px] text-[#2E7D5A] font-semibold mt-1">
                        ✓ {phoneValidation.carrier}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-[#2E7D5A] hover:bg-[#246648] text-white font-black text-sm transition cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98"
                  >
                    <span>
                      {isSubmitting
                        ? isNe
                          ? 'पठाउँदै...'
                          : 'Sending...'
                        : isNe
                        ? 'ओटीपी कोड पठाउनुहोस्'
                        : 'Send Verification Code'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* STEP 2: OTP VERIFICATION */}
              {authStep === 'otp' && (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setAuthStep('form')}
                      className="text-[#78716A] hover:text-[#1F1E1B] font-semibold cursor-pointer"
                    >
                      ← {isNe ? 'नम्बर परिवर्तन' : 'Change Number'}
                    </button>
                    <span className="font-mono font-bold text-[#2E7D5A]">
                      +977 {activePhone}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-[#1F1E1B]">
                      {isNe ? '६ अङ्कको सुरक्षा कोड' : '6-Digit Verification Code'}
                    </h3>
                    <p className="text-xs text-[#78716A]">
                      {isNe
                        ? 'मोबाइलमा पठाइएको कोड यहाँ राख्नुहोस्।'
                        : 'Enter the code sent to your mobile phone.'}
                    </p>
                  </div>

                  {/* 6 Digit Input Grid */}
                  <div className="flex justify-between gap-1.5">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-box-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          const newDigits = [...otpDigits];
                          newDigits[idx] = val;
                          setOtpDigits(newDigits);
                          if (val && idx < 5) {
                            document.getElementById(`otp-box-${idx + 1}`)?.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
                            document.getElementById(`otp-box-${idx - 1}`)?.focus();
                          }
                        }}
                        className="w-11 h-12 text-center font-mono font-black text-lg rounded-xl border border-[#D5CEC2] bg-[#FAF7F2] focus:border-[#2E7D5A] focus:bg-white outline-hidden"
                      />
                    ))}
                  </div>

                  {/* Sandbox helper */}
                  <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8E2D8] text-[11px] text-[#78716A] flex items-center justify-between">
                    <span>{isNe ? 'परीक्षण कोड: १२३४५६' : 'Dev Test Code: 123456'}</span>
                    <button
                      type="button"
                      onClick={() => setOtpDigits(['1', '2', '3', '4', '5', '6'])}
                      className="text-[#2E7D5A] font-bold hover:underline cursor-pointer"
                    >
                      {isNe ? 'स्वतः भर्नुहोस्' : 'Auto Fill'}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-[#2E7D5A] hover:bg-[#246648] text-white font-black text-sm transition cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98"
                  >
                    <span>
                      {isSubmitting
                        ? isNe
                          ? 'प्रमाणित गर्दै...'
                          : 'Verifying...'
                        : isNe
                        ? 'प्रमाणित गर्नुहोस् र प्रवेश गर्नुहोस्'
                        : 'Verify & Open App'}
                    </span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
