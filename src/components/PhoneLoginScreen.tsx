import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Phone,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Lock,
  Globe,
  Sprout,
  KeyRound,
  Check,
  Users,
  MapPin,
  Zap,
} from 'lucide-react';
import { AuthService, TEST_USER_ACCOUNTS } from '../services/authService';
import { AuthUser } from '../types/krishi';
import { useLanguage } from '../context/LanguageContext';

interface PhoneLoginScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const PhoneLoginScreen: React.FC<PhoneLoginScreenProps> = ({ onLoginSuccess }) => {
  const { language, setLanguage, t } = useLanguage();

  // Screen step: 'phone' or 'otp'
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState<string>('9845012345');
  const [phoneError, setPhoneError] = useState<string>('');
  const [detectedCarrier, setDetectedCarrier] = useState<string>('Nepal Telecom (NTC)');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('usr_ram_chitwan_001');

  // OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string>('');
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [resendSent, setResendSent] = useState<boolean>(false);

  const phoneInputRef = useRef<HTMLInputElement>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus on mount
  useEffect(() => {
    if (step === 'phone') {
      phoneInputRef.current?.focus();
    } else if (step === 'otp') {
      otpInputRefs.current[0]?.focus();
    }
  }, [step]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle phone input change with live carrier detection & formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setPhoneError('');

    // Allow digits, spaces, hyphens, and plus
    const sanitized = rawVal.replace(/[^0-9\+\-\s]/g, '');
    setPhoneNumber(sanitized);

    const validation = AuthService.validateNepalPhone(sanitized, language);
    if (validation.carrier) {
      setDetectedCarrier(validation.carrier);
    } else {
      setDetectedCarrier('');
    }
  };

  // Submit phone number step
  const handlePhoneSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPhoneError('');

    const validation = AuthService.validateNepalPhone(phoneNumber, language);
    if (!validation.isValid) {
      setPhoneError(validation.error || (language === 'ne'
        ? 'कृपया मान्य १० अंकको नेपाली मोबाइल नम्बर राख्नुहोस्।'
        : 'Please enter a valid Nepal mobile number.'));
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await AuthService.sendPhoneOTP(validation.national);
      if (res.success) {
        setStep('otp');
        setOtpDigits(['', '', '', '', '', '']);
        setOtpError('');
        setResendCooldown(30);
      } else {
        setPhoneError(res.error || (language === 'ne'
          ? 'कृपया मान्य १० अंकको नेपाली मोबाइल नम्बर राख्नुहोस्।'
          : 'Please enter a valid Nepal mobile number.'));
      }
    } catch (err: any) {
      setPhoneError(err.message || 'Error requesting verification code.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Quick autofill demo phone
  const handleUseDemoPhone = () => {
    const demoNum = '9845012345';
    setPhoneNumber(demoNum);
    setPhoneError('');
    setDetectedCarrier('Nepal Telecom (NTC)');
  };

  // Select one of the 3 test accounts
  const handleSelectAccount = (acc: typeof TEST_USER_ACCOUNTS[0]) => {
    setSelectedAccountId(acc.id);
    setPhoneNumber(acc.rawDigits);
    setPhoneError('');
    const val = AuthService.validateNepalPhone(acc.rawDigits, language);
    if (val.carrier) {
      setDetectedCarrier(val.carrier);
    }
  };

  // 1-Click instant test login for exhibition demo
  const handleInstantLogin = (acc: typeof TEST_USER_ACCOUNTS[0]) => {
    const user = AuthService.loginAsTestAccount(acc.id);
    onLoginSuccess(user);
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, val: string) => {
    setOtpError('');
    const char = val.replace(/\D/g, '').slice(-1);

    const next = [...otpDigits];
    next[index] = char;
    setOtpDigits(next);

    // Auto-advance
    if (char && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        const next = [...otpDigits];
        next[index - 1] = '';
        setOtpDigits(next);
        otpInputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const next = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      next[i] = pasteData[i] || '';
    }
    setOtpDigits(next);
    const targetIdx = Math.min(pasteData.length, 5);
    otpInputRefs.current[targetIdx]?.focus();
  };

  // Autofill Demo OTP 123456
  const handleAutofillDemoOtp = () => {
    setOtpDigits(['1', '2', '3', '4', '5', '6']);
    setOtpError('');
  };

  // Verify OTP submission
  const handleVerifySubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setOtpError('');

    const enteredCode = otpDigits.join('').trim();
    if (enteredCode.length !== 6) {
      setOtpError(language === 'ne'
        ? 'कृपया ६ अंकको प्रमाणीकरण कोड पूरा भर्नुहोस्।'
        : 'Please enter the complete 6-digit verification code.');
      return;
    }

    if (enteredCode !== '123456') {
      setOtpError(language === 'ne'
        ? 'गलत प्रमाणीकरण कोड। कृपया पुनः प्रयास गर्नुहोस्।'
        : 'Invalid verification code. Please try again.');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await AuthService.verifyOTP({
        phoneNumber,
        code: enteredCode,
      });

      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setOtpError(res.error || (language === 'ne'
          ? 'गलत प्रमाणीकरण कोड। कृपया पुनः प्रयास गर्नुहोस्।'
          : 'Invalid verification code. Please try again.'));
      }
    } catch (err: any) {
      setOtpError(err.message || 'Error verifying code.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setResendSent(false);
    setOtpError('');
    try {
      await AuthService.sendPhoneOTP(phoneNumber);
      setResendCooldown(30);
      setResendSent(true);
      setTimeout(() => setResendSent(false), 3000);
    } catch (err) {
      // ignore
    }
  };

  const validation = AuthService.validateNepalPhone(phoneNumber, language);
  const displayPhone = validation.isValid ? validation.display : `+977 ${phoneNumber}`;
  const cleanDigits = phoneNumber.replace(/\D/g, '');
  const matchedTestAccount = TEST_USER_ACCOUNTS.find(
    (acc) => cleanDigits.endsWith(acc.rawDigits) || acc.rawDigits === cleanDigits
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1F1E1B] flex flex-col justify-between selection:bg-[#2E7D5A] selection:text-white">
      {/* Top Header */}
      <header className="w-full border-b border-[#E8E2D8] bg-[#FAF7F2]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2E7D5A] text-white flex items-center justify-center font-black text-xl shadow-xs">
            <Sprout className="w-6 h-6 text-[#A3E635]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-[#1F1E1B] font-editorial-serif">
                KrishiSetu
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#2E7D5A]/10 text-[#2E7D5A] text-[10px] font-bold border border-[#2E7D5A]/20">
                कृषिसेतु नेपाल
              </span>
            </div>
            <p className="text-[11px] text-[#6B655B] font-medium hidden sm:block">
              {language === 'ne' ? 'कालीमाटी बजार भाउ र कृषक सहकार्य' : 'Kalimati Mandi Rates & Farmer Cooperative Network'}
            </p>
          </div>
        </div>

        {/* Language switch & exhibition badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-800 text-[11px] font-bold border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Exhibition Demo
          </span>

          <div className="inline-flex rounded-lg border border-[#E8E2D8] bg-white p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setLanguage('ne')}
              className={`px-2.5 py-1 rounded-md font-bold transition ${
                language === 'ne'
                  ? 'bg-[#2E7D5A] text-white shadow-xs'
                  : 'text-[#6B655B] hover:text-[#1F1E1B]'
              }`}
            >
              नेपाली
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-md font-bold transition ${
                language === 'en'
                  ? 'bg-[#2E7D5A] text-white shadow-xs'
                  : 'text-[#6B655B] hover:text-[#1F1E1B]'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#E8E2D8] shadow-sm p-6 sm:p-8 space-y-6">
          <AnimatePresence mode="wait">
            {step === 'phone' ? (
              <motion.div
                key="step-phone"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="space-y-6"
              >
                {/* Heading */}
                <div className="space-y-2 text-center">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-[#2E7D5A]/10 text-[#2E7D5A] flex items-center justify-center mb-3">
                    <Phone className="w-6 h-6" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#1F1E1B] font-editorial-serif">
                    {language === 'ne' ? 'किसान लगइन' : 'Farmer Sign In'}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#6B655B] leading-relaxed">
                    {language === 'ne'
                      ? 'कालीमाटी थोक दर, बाली क्याल्कुलेटर र साझा ढुवानीमा पहुँचका लागि आफ्नो मोबाइल नम्बर राख्नुहोस्।'
                      : 'Enter your Nepal mobile number to access Kalimati wholesale rates, crop planning calculator, and shared freight pools.'}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-[#6B655B] mb-1.5">
                      {language === 'ne' ? 'मोबाइल नम्बर' : 'Phone Number'}
                    </label>

                    <div
                      className={`flex items-center rounded-2xl border bg-[#FAF7F2] transition focus-within:bg-white focus-within:ring-2 focus-within:ring-[#2E7D5A]/20 ${
                        phoneError
                          ? 'border-red-500 focus-within:border-red-500'
                          : 'border-[#E8E2D8] focus-within:border-[#2E7D5A]'
                      }`}
                    >
                      {/* Nepal Flag & Code Badge */}
                      <div className="px-3.5 py-3 border-r border-[#E8E2D8] flex items-center gap-1.5 shrink-0 select-none bg-white rounded-l-2xl">
                        <span className="text-base" role="img" aria-label="Nepal flag">
                          🇳🇵
                        </span>
                        <span className="text-xs font-black text-[#1F1E1B] tracking-tight">
                          +977
                        </span>
                      </div>

                      <input
                        ref={phoneInputRef}
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        placeholder="98XXXXXXXX"
                        maxLength={15}
                        className="w-full px-3.5 py-3 bg-transparent text-sm sm:text-base font-extrabold text-[#1F1E1B] placeholder-[#9E978C] focus:outline-hidden tracking-wide"
                      />
                    </div>

                    {/* Detected Carrier pill */}
                    {detectedCarrier && !phoneError && (
                      <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#2E7D5A] font-bold">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#2E7D5A]" />
                          {detectedCarrier}
                        </span>
                        <span className="text-[10px] text-[#6B655B]">Nepal Mobile</span>
                      </div>
                    )}

                    {/* Validation Error Message */}
                    {phoneError && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700 font-semibold"
                      >
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <span>{phoneError}</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Primary Continue Button */}
                  <button
                    type="submit"
                    disabled={isSendingOtp}
                    className="w-full py-3.5 rounded-2xl bg-[#2E7D5A] hover:bg-[#256649] active:scale-[0.99] text-white font-extrabold text-sm sm:text-base transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSendingOtp ? (
                      <span className="flex items-center gap-2">
                        <RotateCcw className="w-4 h-4 animate-spin" />
                        {language === 'ne' ? 'जाँचिदैछ...' : 'Checking...'}
                      </span>
                    ) : (
                      <>
                        <span>{language === 'ne' ? 'अगाडि बढ्नुहोस्' : 'Continue'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* 3 Dedicated Test Accounts Selector */}
                <div className="pt-3 border-t border-[#E8E2D8]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#6B655B] flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#2E7D5A]" />
                      {language === 'ne' ? '३ फरक परीक्षण किसान खाताहरू' : '3 Test Farmer Accounts'}
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
                      Exhibition Ready
                    </span>
                  </div>

                  <p className="text-[11px] text-[#6B655B] mb-2.5">
                    {language === 'ne'
                      ? 'सिधै लगइन गर्न वा नम्बर परीक्षण गर्न तलको कुनै एक किसान खाता रोज्नुहोस्:'
                      : 'Select any of the 3 pre-configured farmer accounts to test different locations & crops:'}
                  </p>

                  <div className="space-y-2">
                    {TEST_USER_ACCOUNTS.map((acc, index) => {
                      const isSelected = matchedTestAccount?.id === acc.id;
                      return (
                        <div
                          key={acc.id}
                          className={`p-2.5 sm:p-3 rounded-2xl border transition-all text-left flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-[#2E7D5A]/5 border-[#2E7D5A] shadow-xs ring-1 ring-[#2E7D5A]/20'
                              : 'bg-white border-[#E8E2D8] hover:border-[#2E7D5A]/40'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-[#2E7D5A]/10 text-[#2E7D5A] font-black text-[11px] flex items-center justify-center shrink-0">
                                {index + 1}
                              </span>
                              <span className="text-xs font-black text-[#1F1E1B]">
                                {acc.name}
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-[#FAF7F2] border border-[#E8E2D8] text-[#6B655B] flex items-center gap-1">
                                <MapPin className="w-2.5 h-2.5 text-[#2E7D5A]" />
                                {acc.district.toUpperCase()}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-[#6B655B]">
                              <span className="font-mono font-bold text-[#1F1E1B]">
                                {acc.phone}
                              </span>
                              <span>•</span>
                              <span>{acc.landSize} Ropani</span>
                              <span>•</span>
                              <span className="text-[#2E7D5A] font-medium">{acc.primaryCrops.join(', ')}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                            <button
                              type="button"
                              onClick={() => handleSelectAccount(acc)}
                              className={`px-2 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                                isSelected
                                  ? 'bg-[#2E7D5A] text-white'
                                  : 'bg-[#FAF7F2] hover:bg-[#E8E2D8] text-[#1F1E1B] border border-[#E8E2D8]'
                              }`}
                            >
                              {isSelected ? (
                                <span className="flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  {language === 'ne' ? 'छानियो' : 'Selected'}
                                </span>
                              ) : (
                                <span>{language === 'ne' ? 'नम्बर राख्नुहोस्' : 'Use Number'}</span>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleInstantLogin(acc)}
                              className="px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-300/70 text-xs font-extrabold flex items-center gap-1 transition cursor-pointer shadow-2xs"
                              title="Instant Login"
                            >
                              <Zap className="w-3 h-3 text-amber-600" />
                              <span>{language === 'ne' ? 'सिधै लगइन' : 'Instant Login'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-[10px] text-[#8C8477] text-center pt-2">
                    {language === 'ne'
                      ? 'वा कुनै पनि नयाँ १० अंकको नम्बर राखी नयाँ किसान दर्ता परीक्षण गर्नुहोस्।'
                      : 'Or enter any other 10-digit number above to test dynamic new farmer registration.'}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step-otp"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="space-y-5"
              >
                {/* Back / Change Phone Button */}
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setOtpError('');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#6B655B] hover:text-[#1F1E1B] transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{language === 'ne' ? 'फोन नम्बर बदल्नुहोस्' : 'Change phone number'}</span>
                </button>

                {/* Account Profile Banner in OTP screen */}
                {matchedTestAccount ? (
                  <div className="p-3 rounded-2xl bg-[#2E7D5A]/10 border border-[#2E7D5A]/25 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#2E7D5A] text-white flex items-center justify-center font-black text-xs shadow-xs">
                        {matchedTestAccount.name.slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-xs font-black text-[#1F1E1B]">
                          {matchedTestAccount.name}
                        </div>
                        <div className="text-[11px] text-[#2E7D5A] font-semibold">
                          {matchedTestAccount.farmName} ({matchedTestAccount.district.toUpperCase()})
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#2E7D5A] text-white">
                      Test Profile
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] text-center text-xs text-[#6B655B]">
                    New Farmer Profile for <span className="font-bold text-[#1F1E1B]">{displayPhone}</span>
                  </div>
                )}

                {/* Heading */}
                <div className="space-y-1.5 text-center">
                  <div className="w-10 h-10 mx-auto rounded-2xl bg-[#2E7D5A]/10 text-[#2E7D5A] flex items-center justify-center mb-2">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <h1 className="text-xl font-black tracking-tight text-[#1F1E1B] font-editorial-serif">
                    {language === 'ne' ? 'फोन नम्बर प्रमाणीकरण' : 'Verify your phone number'}
                  </h1>
                  <p className="text-xs text-[#6B655B] leading-relaxed">
                    {language === 'ne' ? (
                      <>
                        हामीले <span className="font-extrabold text-[#1F1E1B]">{displayPhone}</span> मा ६ अंकको कोड पठाएका छौँ।
                      </>
                    ) : (
                      <>
                        We've sent a 6-digit verification code to <span className="font-extrabold text-[#1F1E1B]">{displayPhone}</span>
                      </>
                    )}
                  </p>
                </div>

                {/* Prominent Demo OTP Box */}
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-amber-950 uppercase tracking-wider">
                          Demo OTP:
                        </span>
                        <span className="font-mono text-base font-black text-[#2E7D5A] tracking-wider px-2 py-0.5 bg-white rounded-md border border-amber-200">
                          123456
                        </span>
                      </div>
                      <p className="text-[10px] text-amber-900/80 font-medium">
                        {language === 'ne' ? 'प्रदर्शनीका लागि यो कोड प्रयोग गर्नुहोस्' : 'Exhibition prototype code'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAutofillDemoOtp}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-extrabold transition cursor-pointer shrink-0 shadow-xs"
                  >
                    {language === 'ne' ? 'कोड भर्नुहोस्' : 'Autofill'}
                  </button>
                </div>

                {/* 6-Digit OTP Inputs */}
                <form onSubmit={handleVerifySubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-[#6B655B] mb-2 text-center">
                      {language === 'ne' ? '६ अंकको प्रमाणीकरण कोड राख्नुहोस्' : 'Enter 6-digit verification code'}
                    </label>

                    <div className="flex justify-between gap-1.5 sm:gap-2">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (otpInputRefs.current[idx] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          onPaste={handleOtpPaste}
                          className={`w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-black rounded-2xl border transition focus:outline-hidden ${
                            otpError
                              ? 'border-red-500 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-500/20'
                              : digit
                              ? 'border-[#2E7D5A] bg-[#2E7D5A]/5 text-[#2E7D5A] focus:ring-2 focus:ring-[#2E7D5A]/20'
                              : 'border-[#E8E2D8] bg-[#FAF7F2] text-[#1F1E1B] focus:border-[#2E7D5A] focus:bg-white focus:ring-2 focus:ring-[#2E7D5A]/20'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Error message */}
                    {otpError && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2.5 p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700 font-semibold"
                      >
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <span>{otpError}</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Verify button */}
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full py-3.5 rounded-2xl bg-[#2E7D5A] hover:bg-[#256649] active:scale-[0.99] text-white font-extrabold text-sm sm:text-base transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isVerifying ? (
                      <span className="flex items-center gap-2">
                        <RotateCcw className="w-4 h-4 animate-spin" />
                        {language === 'ne' ? 'प्रमाणीकरण गरिँदैछ...' : 'Verifying...'}
                      </span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>{language === 'ne' ? 'प्रमाणीकरण गर्नुहोस्' : 'Verify & Sign In'}</span>
                      </>
                    )}
                  </button>

                  {/* Resend & Change Phone Actions */}
                  <div className="flex items-center justify-between text-xs text-[#6B655B] pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('phone');
                        setOtpError('');
                      }}
                      className="hover:underline font-bold text-[#6B655B] cursor-pointer"
                    >
                      {language === 'ne' ? 'फोन नम्बर बदल्नुहोस्' : 'Change phone number'}
                    </button>

                    <button
                      type="button"
                      disabled={resendCooldown > 0}
                      onClick={handleResendOtp}
                      className={`font-extrabold transition cursor-pointer ${
                        resendCooldown > 0
                          ? 'text-[#9E978C] cursor-not-allowed'
                          : 'text-[#2E7D5A] hover:underline'
                      }`}
                    >
                      {resendCooldown > 0
                        ? `${language === 'ne' ? 'पुनः पठाउनुहोस्' : 'Resend code'} (${resendCooldown}s)`
                        : language === 'ne'
                        ? 'पुनः कोड पठाउनुहोस्'
                        : 'Resend code'}
                    </button>
                  </div>

                  {resendSent && (
                    <p className="text-center text-[11px] text-[#2E7D5A] font-bold">
                      {language === 'ne' ? 'नयाँ कोड पठाइयो (Demo: 123456)' : 'New code sent (Demo: 123456)'}
                    </p>
                  )}
                </form>

                {/* Target Demo Farmer Info */}
                <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2E7D5A] to-[#10B981] text-white font-black text-sm flex items-center justify-center shrink-0">
                    R
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-extrabold text-[#1F1E1B]">
                      {language === 'ne' ? 'खाता: रामबहादुर थापा' : 'Account: Ram Bahadur Thapa'}
                    </div>
                    <p className="text-[10px] text-[#6B655B]">
                      {language === 'ne'
                        ? 'भरतपुर-११, चितवन • १.२ रोपनी • गोलभेडा / काउली'
                        : 'Bharatpur-11, Chitwan • 1.2 Ropani • Tomato / Cauliflower'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#E8E2D8] bg-[#FAF7F2] px-4 py-3 text-center text-xs text-[#6B655B] mt-auto">
        <p>
          KrishiSetu Nepal • College Exhibition Prototype • Demo Account:{' '}
          <strong className="text-[#1F1E1B]">Ram Bahadur Thapa</strong>
        </p>
      </footer>
    </div>
  );
};
