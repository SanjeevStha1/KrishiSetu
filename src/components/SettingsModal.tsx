import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sliders,
  Sun,
  Moon,
  Laptop,
  Globe,
  Bell,
  BellOff,
  Sparkles,
  RotateCcw,
  RefreshCw,
  User,
  ShieldCheck,
  Edit2,
  Check,
  ChevronRight,
  Award,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { InAppMessageService } from '../services/inAppMessageService';
import { UserProfile, AuthUser } from '../types/krishi';
import { getLandUnitLabel } from '../utils/landMeasurement';
import { AppTab } from './Header';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPitchGuide?: () => void;
  onOpenProfileModal?: () => void;
  onOpenAuthModal?: () => void;
  onOpenRlsDiagnostic?: () => void;
  onOpenTransparency?: () => void;
  onOpenFarmerStories?: () => void;
  onRefreshPrices?: () => void;
  onNavigateTab?: (tab: AppTab) => void;
  onLogout?: () => void;
  userProfile?: UserProfile;
  authUser?: AuthUser | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenPitchGuide,
  onOpenProfileModal,
  onOpenAuthModal,
  onOpenRlsDiagnostic,
  onOpenTransparency,
  onOpenFarmerStories,
  onRefreshPrices,
  onLogout,
  userProfile,
  authUser,
}) => {
  const { theme, isDark, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [notifEnabled, setNotifEnabled] = useState<boolean>(true);
  const [resetToast, setResetToast] = useState<boolean>(false);
  const [refreshToast, setRefreshToast] = useState<boolean>(false);

  useEffect(() => {
    setNotifEnabled(InAppMessageService.areNotificationsEnabled());
  }, []);

  if (!isOpen) return null;

  const handleToggleNotif = () => {
    const nextState = !notifEnabled;
    setNotifEnabled(nextState);
    InAppMessageService.setNotificationsEnabled(nextState);
  };

  const handleResetData = () => {
    InAppMessageService.resetToDefault();
    setNotifEnabled(true);
    setResetToast(true);
    setTimeout(() => setResetToast(false), 3000);
  };

  const handleLiveRefresh = () => {
    if (onRefreshPrices) {
      onRefreshPrices();
    }
    setRefreshToast(true);
    setTimeout(() => setRefreshToast(false), 3000);
  };

  const currentLandUnit = userProfile?.landUnit || 'ropani';
  const unitLabel = getLandUnitLabel(currentLandUnit, language);
  const landDisplayVal = userProfile?.landSize ?? userProfile?.landSizeRopani ?? 1.2;

  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans text-[#0F172A] dark:text-[#F8FAFC] animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: 'spring', damping: 25, stiffness: 260 }}
        className="bg-white dark:bg-[#131E32] rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col relative transition-colors duration-200"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#0F172A] text-white border-b border-slate-800 sticky top-0 z-20 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#10B981] text-white flex items-center justify-center shadow-md">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight flex items-center gap-2">
                <span>{t('settings.title', 'Settings & Preferences')}</span>
              </h2>
              <p className="text-xs text-slate-400 line-clamp-1">
                {t('settings.subtitle', 'Manage display appearance, language, alerts, demo mode, and farmer profile.')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 flex-1">
          {/* Toast Alerts */}
          <AnimatePresence>
            {resetToast && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2"
              >
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {language === 'ne'
                    ? 'डेमो डेटा, सन्देशहरू र सुरुवाती स्थिति सफलतापूर्वक पुनर्स्थापना गरियो!'
                    : 'Demo data, messages, and initial states successfully restored!'}
                </span>
              </motion.div>
            )}
            {refreshToast && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2"
              >
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {language === 'ne'
                    ? 'कालिमाटी थोक बजार मूल्य र आगमन दर ताजा गरियो!'
                    : 'Kalimati Mandi price feeds and arrival rates refreshed!'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 1. APPEARANCE (Theme Switcher) */}
          <div className="bg-[#F8FAFC] dark:bg-slate-800/80 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#64748B] dark:text-slate-400 flex items-center gap-1.5">
                {isDark ? <Moon className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" /> : <Sun className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />}
                {t('settings.sectionAppearance', 'Appearance')}
              </h3>
              <span className="text-[11px] font-bold text-[#2563EB] dark:text-blue-400 capitalize">
                {theme} Mode
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer text-xs font-bold ${
                  theme === 'light'
                    ? 'bg-white text-[#2563EB] border-[#2563EB] shadow-xs ring-2 ring-blue-500/20'
                    : 'bg-transparent text-[#64748B] dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>{t('settings.themeLight', 'Light')}</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer text-xs font-bold ${
                  theme === 'dark'
                    ? 'bg-slate-900 text-blue-400 border-blue-500 shadow-xs ring-2 ring-blue-500/20'
                    : 'bg-transparent text-[#64748B] dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>{t('settings.themeDark', 'Dark')}</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer text-xs font-bold ${
                  theme === 'system'
                    ? 'bg-white dark:bg-slate-900 text-[#2563EB] dark:text-blue-400 border-[#2563EB] dark:border-blue-500 shadow-xs ring-2 ring-blue-500/20'
                    : 'bg-transparent text-[#64748B] dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Laptop className="w-4 h-4" />
                <span>{t('settings.themeSystem', 'System')}</span>
              </button>
            </div>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400">
              {t('settings.themeDesc', 'Modern theme optimized for outdoor daylight and high legibility.')}
            </p>
          </div>

          {/* 2. LANGUAGE SWITCHER */}
          <div className="bg-[#F8FAFC] dark:bg-slate-800/80 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#64748B] dark:text-slate-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
                {t('settings.sectionLanguage', 'Language / भाषा')}
              </h3>
              <span className="text-[11px] font-bold text-[#2563EB] dark:text-blue-400">
                {language === 'ne' ? 'नेपाली (Nepali)' : 'English'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 transition cursor-pointer text-xs font-bold ${
                  language === 'en'
                    ? 'bg-white dark:bg-slate-900 text-[#2563EB] dark:text-blue-400 border-[#2563EB] dark:border-blue-500 shadow-xs ring-2 ring-blue-500/20'
                    : 'bg-transparent text-[#64748B] dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span>English</span>
                {language === 'en' && <Check className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />}
              </button>

              <button
                type="button"
                onClick={() => setLanguage('ne')}
                className={`py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 transition cursor-pointer text-xs font-bold ${
                  language === 'ne'
                    ? 'bg-white dark:bg-slate-900 text-[#2563EB] dark:text-blue-400 border-[#2563EB] dark:border-blue-500 shadow-xs ring-2 ring-blue-500/20'
                    : 'bg-transparent text-[#64748B] dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span>नेपाली (Nepali)</span>
                {language === 'ne' && <Check className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />}
              </button>
            </div>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400">
              {t('settings.langDesc', 'Choose your preferred language for all crop names, forecasts, and tools.')}
            </p>
          </div>

          {/* 3. NOTIFICATION PREFERENCES */}
          <div className="bg-[#F8FAFC] dark:bg-slate-800/80 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#64748B] dark:text-slate-400 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
                  {t('settings.sectionNotifications', 'In-App Notifications & Alerts')}
                </h3>
                <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                  {t('settings.notifToggle', 'Receive daily Kalimati price updates & freight match alerts')}
                </p>
              </div>

              <button
                type="button"
                onClick={handleToggleNotif}
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  notifEnabled
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-[#64748B] dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {notifEnabled ? <Bell className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <BellOff className="w-3.5 h-3.5" />}
                <span>{notifEnabled ? t('settings.notifEnabled', 'Active') : t('settings.notifMuted', 'Muted')}</span>
              </button>
            </div>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400">
              {language === 'ne'
                ? 'सूचनाहरू शीर्ष बारको घन्टी (Bell) आइकनमा सिधै हेर्न सकिन्छ।'
                : 'View instant message broadcasts and mandi alerts anytime via the top-bar Bell icon.'}
            </p>
          </div>

          {/* 4. DEMO & PRESENTATION TOOLS */}
          <div className="bg-[#F8FAFC] dark:bg-slate-800/80 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#64748B] dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
              {t('settings.sectionDemo', 'Demo & Presentation Tools')}
            </h3>

            <div className="space-y-2">
              {/* 5-Min Pitch Mode */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPitchGuide?.();
                }}
                className="w-full p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#2563EB] text-left flex items-center justify-between group transition cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 text-[#2563EB] dark:text-blue-400 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-[#0F172A] dark:text-white group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition">
                      {t('settings.pitchMode', '5-Minute Live Pitch Guide')}
                    </h4>
                    <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                      {t('settings.pitchDesc', 'Interactive walkthrough script and talking points for judges & live demos.')}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#2563EB] transition shrink-0" />
              </button>

              {/* Live Mandi Refresh */}
              <button
                type="button"
                onClick={handleLiveRefresh}
                className="w-full p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-left flex items-center justify-between group transition cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-[#0F172A] dark:text-white group-hover:text-emerald-600 transition">
                      {t('settings.refreshMandi', 'Live Kalimati Mandi Refresh')}
                    </h4>
                    <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                      {t('settings.refreshDesc', 'Re-sync current mandi arrivals and commodity price boards.')}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-emerald-600 transition shrink-0" />
              </button>

              {/* Reset Demo Data */}
              <button
                type="button"
                onClick={handleResetData}
                className="w-full p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-500 text-left flex items-center justify-between group transition cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-[#0F172A] dark:text-white group-hover:text-amber-600 transition">
                      {t('settings.resetDemo', 'Reset Demo Data')}
                    </h4>
                    <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                      {t('settings.resetDesc', 'Restore initial market prices, sample records, and demo alerts.')}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-amber-600 transition shrink-0" />
              </button>

              {/* Farmer Stories & Example Cases */}
              {onOpenFarmerStories && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenFarmerStories();
                  }}
                  className="w-full p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#2563EB] text-left flex items-center justify-between group transition cursor-pointer shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 text-[#2563EB] dark:text-blue-400 flex items-center justify-center font-bold">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-extrabold text-[#0F172A] dark:text-white group-hover:text-[#2563EB] transition">
                          {t('settings.farmerStories', 'Farmer Stories & Example Savings')}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-[#2563EB] dark:text-blue-400 text-[9px] font-extrabold border border-blue-200 dark:border-blue-800">
                          CASES
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                        {t('settings.farmerStoriesDesc', 'Illustrative smallholder economic profiles & pooling outcomes')}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#2563EB] transition shrink-0" />
                </button>
              )}

              {/* Live vs Simulated Transparency Disclosure */}
              {onOpenTransparency && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTransparency();
                  }}
                  className="w-full p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-left flex items-center justify-between group transition cursor-pointer shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-[#0F172A] dark:text-white group-hover:text-emerald-600 transition">
                        {t('settings.transparency', 'Live vs. Simulated Disclosure')}
                      </h4>
                      <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                        {t('settings.transparencyDesc', 'Clear technical disclosure of real APIs vs client-side demo fallbacks')}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-emerald-600 transition shrink-0" />
                </button>
              )}
            </div>
          </div>

          {/* 5. ACCOUNT / FARMER PROFILE */}
          <div className="bg-[#F8FAFC] dark:bg-slate-800/80 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#64748B] dark:text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
              {t('settings.sectionAccount', 'Farmer Account & Profile')}
            </h3>

            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#10B981] text-white font-black text-lg flex items-center justify-center shrink-0 shadow-xs">
                  {userProfile?.name?.charAt(0) || authUser?.name?.charAt(0) || 'R'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-[#0F172A] dark:text-white">
                      {userProfile?.name || authUser?.name || 'Ram Bahadur Thapa'}
                    </span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-slate-400 capitalize">
                    {userProfile?.district || 'Chitwan'} • {landDisplayVal} {unitLabel}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenProfileModal?.();
                }}
                className="px-3.5 py-1.5 rounded-full bg-[#0F172A] dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white font-extrabold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Edit2 className="w-3 h-3 text-[#60A5FA]" />
                <span>{t('settings.editProfile', 'Edit Profile')}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (onLogout) {
                  onLogout();
                } else {
                  onOpenAuthModal?.();
                }
              }}
              className="w-full py-2.5 rounded-full border border-red-200 dark:border-red-900/60 bg-red-50/50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 text-xs font-bold text-red-600 dark:text-red-400 transition cursor-pointer text-center"
            >
              {t('settings.signOut', 'Sign Out / Logout (लगआउट)')}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F8FAFC] dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 rounded-b-3xl flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400">
          <span className="text-[11px] font-medium">
            KrishiSetu Nepal • Grassfeld Modern Design
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-[#0F172A] dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
          >
            {t('common.close', 'Close')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
