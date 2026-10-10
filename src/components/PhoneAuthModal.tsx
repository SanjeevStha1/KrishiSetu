import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Phone,
  User,
  MapPin,
  Sprout,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Globe,
  X,
  Sparkles,
  ShieldCheck,
  Building2,
  Layers,
  ChevronRight,
  AlertCircle,
  Clock,
  RotateCcw,
  Check,
} from 'lucide-react';
import { AuthService } from '../services/authService';
import { AuthUser, LandUnit } from '../types/krishi';
import { DISTRICT_LIST, COMMODITY_SEEDS } from '../data/agriData';
import { useLanguage } from '../context/LanguageContext';
import { getLandUnitLabel } from '../utils/landMeasurement';

interface PhoneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  initialMode?: 'login' | 'register';
}

type AuthStep = 'phone' | 'otp' | 'profile_step1' | 'profile_step2' | 'profile_step3' | 'profile_step4' | 'complete';

export const PhoneAuthModal: React.FC<PhoneAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const { language, setLanguage, t } = useLanguage();

  // Mode: Sign In vs Register
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);
  const [step, setStep] = useState<AuthStep>('phone');

  // Phone state
  const [rawPhone, setRawPhone] = useState('9845012345');
  const [carrierInfo, setCarrierInfo] = useState<string>('Nepal Telecom (NTC)');

  // OTP state
  const [otpCode, setOtpCode] = useState<string[]>(['', '', '', '', '', '']);
  const [testCodeHint, setTestCodeHint] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Profile Form state
  const [fullName, setFullName] = useState('');
  const [prefLang, setPrefLang] = useState<'ne' | 'en'>(language as 'ne' | 'en');
  const [province, setProvince] = useState('Bagmati');
  const [district, setDistrict] = useState('chitwan');
  const [municipality, setMunicipality] = useState('');
  const [ward, setWard] = useState('');
  const [locality, setLocality] = useState('');
  const [landSize, setLandSize] = useState<number>(1.0);
  const [landUnit, setLandUnit] = useState<LandUnit>('ropani');
  const [selectedCrops, setSelectedCrops] = useState<string[]>(['tomato', 'potato', 'cauliflower']);

  // Loading & Error states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null);

  // Authenticated temp user before profile completion
  const [pendingUser, setPendingUser] = useState<AuthUser | null>(null);

  // Update carrier detection live as phone is typed
  useEffect(() => {
    const { carrier } = AuthService.normalizePhone(rawPhone);
    setCarrierInfo(carrier);
  }, [rawPhone]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  if (!isOpen) return null;

  // Handle phone format change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^\d\s]/g, '');
    setRawPhone(val);
    setErrorMsg(null);
    setNoticeMsg(null);
  };

  // SEND OTP
  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setNoticeMsg(null);

    const { isValid, national } = AuthService.normalizePhone(rawPhone);
    if (!isValid || national.length !== 10) {
      setErrorMsg(
        language === 'ne'
          ? 'कृपया १० अंकको नेपाली मोबाइल नम्बर राख्नुहोस् (उदा. 9845xxxxxx वा 9801xxxxxx)'
          : 'Please enter a valid 10-digit Nepali mobile number (e.g. 9845xxxxxx or 9801xxxxxx)'
      );
      return;
    }

    setLoading(true);
    try {
      const res = await AuthService.sendPhoneOTP(rawPhone, authMode);
      if (res.alreadyExists) {
        setErrorMsg(
          language === 'ne'
            ? 'यो मोबाइल नम्बर पहिले नै दर्ता भइसकेको छ। कृपया सिधै लगइन गर्नुहोस्।'
            : 'This mobile number is already registered in our database. Please log in instead.'
        );
        return;
      }
      if (res.notRegistered) {
        setErrorMsg(
          language === 'ne'
            ? 'यो मोबाइल नम्बर दर्ता भएको छैन। कृपया नयाँ किसान खाता खोल्नुहोस्।'
            : 'This mobile number is not registered yet. Please create an account.'
        );
        return;
      }

      if (res.success) {
        setTestCodeHint(res.testCode || '123456');
        setResendCooldown(res.cooldownSec || 30);
        setStep('otp');
        // Reset OTP fields
        setOtpCode(['', '', '', '', '', '']);
      } else {
        setErrorMsg(res.message || 'Failed to send verification code.');
        if (res.cooldownSec) setResendCooldown(res.cooldownSec);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  // OTP Input Change Handlers
  const handleOtpDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    const newCode = [...otpCode];

    if (clean.length > 1) {
      // Handle paste
      const pasted = clean.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newCode[i] = pasted[i] || '';
      }
      setOtpCode(newCode);
      const nextFocus = Math.min(clean.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    newCode[index] = clean;
    setOtpCode(newCode);

    if (clean && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Autofill Demo Test Code
  const handleAutofillTestCode = () => {
    const codeToUse = testCodeHint || '123456';
    const digits = codeToUse.split('').slice(0, 6);
    setOtpCode(digits);
    otpInputRefs.current[5]?.focus();
  };

  // VERIFY OTP
  const handleVerifyOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const fullCode = otpCode.join('');
    if (fullCode.length !== 6) {
      setErrorMsg(
        language === 'ne'
          ? 'कृपया ६ अंकको सम्पूर्ण सुरक्षा कोड प्रविष्ट गर्नुहोस्'
          : 'Please enter all 6 digits of the verification code'
      );
      return;
    }

    setLoading(true);
    try {
      const res = await AuthService.verifyOTP({
        phoneNumber: rawPhone,
        code: fullCode,
        intent: authMode,
      });

      if (!res.success) {
        if (res.notRegistered) {
          setErrorMsg(
            language === 'ne'
              ? 'यो नम्बरमा कुनै खाता भेटिएन। कृपया पहिले खाता खोल्नुहोस्।'
              : 'No account found for this number. Please create an account.'
          );
        } else {
          setErrorMsg(res.error || 'Verification code is invalid or expired.');
        }
        return;
      }

      // If user registered or needs to complete profile
      if (res.isNewUser || res.user?.status === 'pending_profile') {
        setPendingUser(res.user || null);
        setStep('profile_step1');
        setNoticeMsg(
          language === 'ne'
            ? 'फोन नम्बर सफलतापूर्वक प्रमाणित भयो! अब आफ्नो कृषक प्रोफाइल विवरण भर्नुहोस्।'
            : 'Phone verified! Please set up your farmer profile.'
        );
      } else if (res.user) {
        // Successful login
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // SUBMIT FINAL PROFILE
  const handleFinishProfile = async (skipOptional: boolean = false) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await AuthService.completeProfile({
        fullName: fullName.trim() || 'Kisan Sathi',
        preferredLanguage: prefLang,
        province,
        district,
        municipality: municipality.trim() || 'Ward-1',
        ward: ward.trim() || '1',
        locality: locality.trim(),
        landSize: Number(landSize) || 1.0,
        landUnit,
        primaryCrops: selectedCrops.length > 0 ? selectedCrops : ['tomato'],
      });

      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setErrorMsg(res.error || 'Failed to complete profile');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Server error saving profile');
    } finally {
      setLoading(false);
    }
  };

  // Toggle crop selection
  const toggleCrop = (cropId: string) => {
    if (selectedCrops.includes(cropId)) {
      if (selectedCrops.length > 1) {
        setSelectedCrops(selectedCrops.filter((c) => c !== cropId));
      }
    } else {
      setSelectedCrops([...selectedCrops, cropId]);
    }
  };

  // Profile completion progress calculation
  const getProgressPercentage = () => {
    switch (step) {
      case 'profile_step1':
        return 40;
      case 'profile_step2':
        return 60;
      case 'profile_step3':
        return 80;
      case 'profile_step4':
        return 95;
      case 'complete':
        return 100;
      default:
        return 20;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 font-sans text-white overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative bg-[#0F172A] text-white rounded-3xl max-w-lg w-full border border-slate-700/80 shadow-2xl overflow-hidden my-auto flex flex-col"
      >
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#2563EB]/20 via-[#10B981]/15 to-transparent pointer-events-none" />

        {/* TOP BAR */}
        <div className="relative z-10 p-5 sm:p-6 pb-3 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#10B981] flex items-center justify-center shadow-xs">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white block">KrishiSetu Nepal</span>
              <span className="text-[10px] text-slate-400 block font-medium">
                {language === 'ne' ? 'सुरक्षित मोबाइल प्रमाणीकरण' : 'Verified Phone Authentication'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PROGRESS BAR FOR REGISTRATION PROFILE STEPS */}
        {step.startsWith('profile_') && (
          <div className="relative z-10 bg-slate-900 px-6 py-2.5 border-b border-slate-800">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-1.5">
              <span>{language === 'ne' ? 'किसान प्रोफाइल दर्ता' : 'Farmer Profile Setup'}</span>
              <span className="text-emerald-400 font-mono">{getProgressPercentage()}% Completed</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
        )}

        {/* MAIN BODY CONTAINER */}
        <div className="relative z-10 p-5 sm:p-6 space-y-4 flex-1">
          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-950/80 border border-red-500/50 text-red-200 rounded-2xl text-xs font-semibold flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Notice Message */}
          {noticeMsg && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 rounded-2xl text-xs font-semibold flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{noticeMsg}</span>
            </div>
          )}

          {/* =========================================================================
              SCREEN 1: PHONE ENTRY (REGISTER vs SIGN IN TABS)
              ========================================================================= */}
          {step === 'phone' && (
            <div className="space-y-4">
              {/* Tab Switcher: Sign In vs Create Account */}
              <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-2xl border border-slate-800 text-xs font-extrabold">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMsg(null);
                  }}
                  className={`py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    authMode === 'login'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{language === 'ne' ? 'साइन इन (Sign In)' : 'Sign In'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMsg(null);
                  }}
                  className={`py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    authMode === 'register'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{language === 'ne' ? 'नयाँ दर्ता (Register)' : 'Create Account'}</span>
                </button>
              </div>

              {/* Title & Explainer */}
              <div className="text-left space-y-1">
                <h3 className="text-base font-extrabold text-white">
                  {authMode === 'register'
                    ? (language === 'ne' ? 'नयाँ कृषक खाता खोल्नुहोस्' : 'Create your KrishiSetu Account')
                    : (language === 'ne' ? 'आफ्नो खातामा साइन इन गर्नुहोस्' : 'Sign in to KrishiSetu')}
                </h3>
                <p className="text-xs text-slate-400">
                  {authMode === 'register'
                    ? (language === 'ne'
                        ? 'आफ्नो मोबाइल नम्बर राख्नुहोस्। हामी ६-अङ्कको सुरक्षा कोड पठाउनेछौं।'
                        : 'Enter your phone number. We will send a secure 6-digit OTP.')
                    : (language === 'ne'
                        ? 'दर्ता गरिएको मोबाइल नम्बरबाट सिधै सुरक्षित लगइन गर्नुहोस्।'
                        : 'Enter your registered mobile number to receive your sign-in OTP.')}
                </p>
              </div>

              {/* Phone Input Box */}
              <form onSubmit={handleSendOTP} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    {language === 'ne' ? 'नेपाली मोबाइल नम्बर' : 'Mobile Number'}
                  </label>

                  <div className="relative flex items-center bg-slate-900 rounded-2xl border border-slate-700 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition p-1.5">
                    <div className="flex items-center gap-1.5 pl-3 pr-2.5 text-slate-300 font-extrabold text-sm border-r border-slate-700">
                      <span className="text-base">🇳🇵</span>
                      <span>+977</span>
                    </div>

                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={rawPhone}
                      onChange={handlePhoneChange}
                      placeholder="9845012345"
                      className="w-full bg-transparent px-3 py-2 text-base font-mono font-bold text-white placeholder:text-slate-600 focus:outline-none tracking-wider"
                      autoFocus
                    />
                  </div>

                  {/* Carrier & Validation Status Pill */}
                  <div className="flex items-center justify-between text-[11px] px-1 text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                      <span>{carrierInfo}</span>
                    </span>
                    <span className="text-slate-500 font-mono">10 digits</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-extrabold text-sm transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 border border-white/20"
                >
                  <span>
                    {loading
                      ? (language === 'ne' ? 'कोड पठाउँदै...' : 'Sending Code...')
                      : (language === 'ne' ? '६-अङ्कको सुरक्षा कोड पठाउनुहोस्' : 'Send 6-Digit OTP Code')}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* =========================================================================
              SCREEN 2: OTP VERIFICATION
              ========================================================================= */}
          {step === 'otp' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 text-xs">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-white cursor-pointer transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{language === 'ne' ? 'नम्बर परिवर्तन' : 'Change Number'}</span>
                </button>
                <span className="font-mono font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-lg border border-emerald-800/60">
                  +977 {rawPhone.replace(/\D/g, '')}
                </span>
              </div>

              <div className="text-left space-y-1">
                <h3 className="text-base font-extrabold text-white">
                  {language === 'ne' ? 'सुरक्षा कोड प्रविष्ट गर्नुहोस्' : 'Enter Verification Code'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'ne'
                    ? 'तपाईँको मोबाइलमा पठाइएको ६-अङ्कको सुरक्षा कोड यहाँ राख्नुहोस्।'
                    : 'Enter the 6-digit code sent to your mobile phone.'}
                </p>
              </div>

              {/* Sandbox / Testing Helper Hint */}
              {testCodeHint && (
                <div className="p-3 bg-slate-900 border border-blue-500/40 rounded-2xl flex items-center justify-between text-xs shadow-inner">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <span className="font-bold text-blue-300">
                        {language === 'ne' ? 'परीक्षण कोड: ' : 'Sandbox Test Code: '}
                      </span>
                      <span className="font-mono font-black text-sm tracking-widest text-white ml-1">
                        {testCodeHint}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutofillTestCode}
                    className="px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[11px] cursor-pointer transition shadow-xs"
                  >
                    {language === 'ne' ? 'स्वतः भर्नुहोस्' : 'Autofill'}
                  </button>
                </div>
              )}

              {/* 6 Digit Monospace Boxes */}
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="flex justify-between gap-1.5 sm:gap-2">
                  {otpCode.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpInputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-11 h-13 sm:w-12 sm:h-14 bg-slate-900 text-center font-mono text-2xl font-black text-white rounded-2xl border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition shadow-sm"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.join('').length !== 6}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-extrabold text-sm transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-white/20"
                >
                  <span>
                    {loading
                      ? (language === 'ne' ? 'प्रमाणीकरण गर्दै...' : 'Verifying...')
                      : (language === 'ne' ? 'कोड प्रमाणित गर्नुहोस्' : 'Verify & Continue')}
                  </span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>

                {/* Resend Cooldown Action */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>{language === 'ne' ? 'कोड प्राप्त भएन?' : 'Didn’t get the code?'}</span>
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || loading}
                    onClick={() => handleSendOTP()}
                    className="font-bold text-blue-400 hover:text-blue-300 hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
                  >
                    {resendCooldown > 0
                      ? (language === 'ne' ? `पुनः पठाउन ${resendCooldown} सेकेन्ड बाँकी` : `Resend in ${resendCooldown}s`)
                      : (language === 'ne' ? 'पुनः कोड पठाउनुहोस्' : 'Resend Code')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =========================================================================
              PROGRESSIVE PROFILE STEP 1: PERSONAL DETAILS
              ========================================================================= */}
          {step === 'profile_step1' && (
            <div className="space-y-4 text-left">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">Step 1 of 4</span>
                <h3 className="text-base font-extrabold text-white">
                  {language === 'ne' ? 'किसानको व्यक्तिगत विवरण' : 'Personal Details'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'ne' ? 'आफ्नो पूरा नाम र भाषा चयन गर्नुहोस्।' : 'Enter your full name and language preference.'}
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">
                    {language === 'ne' ? 'पूरा नाम (Full Name) *' : 'Full Name *'}
                  </label>
                  <div className="flex items-center bg-slate-900 rounded-2xl border border-slate-700 p-1">
                    <User className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ram Bahadur Thapa"
                      className="w-full bg-transparent px-3 py-2 text-sm font-bold text-white focus:outline-none"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">
                    {language === 'ne' ? 'प्राथमिक भाषा (Preferred Language)' : 'Preferred Language'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPrefLang('ne')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        prefLang === 'ne'
                          ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                          : 'bg-slate-900 text-slate-400 border-slate-700'
                      }`}
                    >
                      <span>नेपाली (Nepali)</span>
                      {prefLang === 'ne' && <Check className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrefLang('en')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        prefLang === 'en'
                          ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                          : 'bg-slate-900 text-slate-400 border-slate-700'
                      }`}
                    >
                      <span>English</span>
                      {prefLang === 'en' && <Check className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  disabled={!fullName.trim()}
                  onClick={() => setStep('profile_step2')}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>{language === 'ne' ? 'अर्को चरण: ठेगाना' : 'Next: Location'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              PROGRESSIVE PROFILE STEP 2: LOCATION
              ========================================================================= */}
          {step === 'profile_step2' && (
            <div className="space-y-4 text-left">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">Step 2 of 4</span>
                <h3 className="text-base font-extrabold text-white">
                  {language === 'ne' ? 'खेतबारीको स्थान र ठेगाना' : 'Farm Location & District'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'ne'
                    ? 'यसबाट कालिमाटी र स्थानीय बजार भाउ ठ्याक्कै मिलान गरिन्छ।'
                    : 'Used to benchmark local prices and transport distances.'}
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">
                    {language === 'ne' ? 'जिल्ला (District) *' : 'District *'}
                  </label>
                  <div className="flex items-center bg-slate-900 rounded-2xl border border-slate-700 p-1">
                    <MapPin className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm font-bold text-white focus:outline-none cursor-pointer"
                    >
                      {DISTRICT_LIST.map((d) => (
                        <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                          {d.name} ({d.zone})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-300">
                      {language === 'ne' ? 'नगरपालिका / गापा' : 'Municipality'}
                    </label>
                    <input
                      type="text"
                      value={municipality}
                      onChange={(e) => setMunicipality(e.target.value)}
                      placeholder="e.g. Bharatpur-11"
                      className="w-full bg-slate-900 rounded-2xl border border-slate-700 px-3 py-2 text-xs font-bold text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-300">
                      {language === 'ne' ? 'वडा नं.' : 'Ward No.'}
                    </label>
                    <input
                      type="text"
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                      placeholder="e.g. 11"
                      className="w-full bg-slate-900 rounded-2xl border border-slate-700 px-3 py-2 text-xs font-bold text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('profile_step1')}
                  className="px-4 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setStep('profile_step3')}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{language === 'ne' ? 'अर्को चरण: जग्गा विवरण' : 'Next: Farm Land'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              PROGRESSIVE PROFILE STEP 3: FARM LAND & LOCAL UNITS
              ========================================================================= */}
          {step === 'profile_step3' && (
            <div className="space-y-4 text-left">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">Step 3 of 4</span>
                <h3 className="text-base font-extrabold text-white">
                  {language === 'ne' ? 'जग्गाको क्षेत्रफल र स्थानीय एकाइ' : 'Farm Land & Measurement Unit'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'ne'
                    ? 'तपाईँको क्षेत्र अनुसार रोपनी, कठ्ठा वा बिघा छान्नुहोस्।'
                    : 'Choose your regional land unit (Ropani, Kattha, Bigha, etc.).'}
                </p>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-300">
                      {language === 'ne' ? 'क्षेत्रफल (Land Size)' : 'Land Size'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={landSize}
                      onChange={(e) => setLandSize(Number(e.target.value) || 1.0)}
                      className="w-full bg-slate-900 rounded-2xl border border-slate-700 px-3 py-2.5 text-sm font-mono font-bold text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-300">
                      {language === 'ne' ? 'एकाइ (Unit)' : 'Unit'}
                    </label>
                    <select
                      value={landUnit}
                      onChange={(e) => setLandUnit(e.target.value as LandUnit)}
                      className="w-full bg-slate-900 rounded-2xl border border-slate-700 px-3 py-2.5 text-xs sm:text-sm font-bold text-white focus:outline-none cursor-pointer"
                    >
                      <option value="ropani">Ropani (रोपनी)</option>
                      <option value="kattha">Kattha (कठ्ठा - Tarai)</option>
                      <option value="bigha">Bigha (बिघा)</option>
                      <option value="aana">Aana (आना)</option>
                      <option value="hectare">Hectare (हेक्टर)</option>
                    </select>
                  </div>
                </div>

                {/* Live Canonical Equivalent Display */}
                <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                  <span>{language === 'ne' ? 'मानक क्षेत्रफल:' : 'Standard Equivalent:'}</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {landSize} {getLandUnitLabel(landUnit, language)} ≈{' '}
                    {landUnit === 'kattha'
                      ? (landSize * 0.66).toFixed(2)
                      : landUnit === 'bigha'
                      ? (landSize * 13.3).toFixed(2)
                      : landSize}{' '}
                    Ropani
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('profile_step2')}
                  className="px-4 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setStep('profile_step4')}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{language === 'ne' ? 'अर्को चरण: मुख्य बाली' : 'Next: Crops'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              PROGRESSIVE PROFILE STEP 4: PRIMARY CROPS
              ========================================================================= */}
          {step === 'profile_step4' && (
            <div className="space-y-4 text-left">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">Step 4 of 4</span>
                <h3 className="text-base font-extrabold text-white">
                  {language === 'ne' ? 'तपाईँले लगाउने मुख्य बालीहरू' : 'Primary Farm Crops'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'ne'
                    ? 'तपाईँको बाली अनुसार नाफा क्याल्कुलेटर र मूल्य पूर्वानुमान व्यक्तिगत बनाइनेछ।'
                    : 'Select crops you cultivate to personalize your market analytics.'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto p-1">
                  {COMMODITY_SEEDS.map((crop) => {
                    const isSelected = selectedCrops.includes(crop.id);
                    return (
                      <button
                        key={crop.id}
                        type="button"
                        onClick={() => toggleCrop(crop.id)}
                        className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-md ring-1 ring-white/30'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
                        }`}
                      >
                        <span className="text-sm">{crop.emoji}</span>
                        <span>{crop.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-200" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('profile_step3')}
                  className="px-4 py-3.5 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleFinishProfile(false)}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-extrabold text-sm transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-white/20"
                >
                  <span>
                    {loading
                      ? (language === 'ne' ? 'सुरक्षित गर्दै...' : 'Finalizing Account...')
                      : (language === 'ne' ? 'खाता सम्पन्न गर्नुहोस्' : 'Complete Registration')}
                  </span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>

              {/* Complete Later Action */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => handleFinishProfile(true)}
                  className="text-xs text-slate-400 hover:text-white hover:underline cursor-pointer"
                >
                  {language === 'ne' ? 'पछि पूरा गर्नुहोस् (Start now)' : 'Complete remaining details later'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-bit Encrypted Session</span>
          </div>

          <button
            type="button"
            onClick={() => setLanguage(language === 'ne' ? 'en' : 'ne')}
            className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[11px] font-bold text-slate-300 hover:text-white flex items-center gap-1 transition cursor-pointer border border-white/10"
          >
            <Globe className="w-3 h-3 text-blue-400" />
            <span>{language === 'ne' ? 'English' : 'नेपाली'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
