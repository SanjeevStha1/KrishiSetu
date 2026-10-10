import React, { useState, useEffect } from 'react';
import {
  Sprout,
  Calculator,
  TrendingUp,
  Store,
  RefreshCw,
  Bell,
  Settings,
  Truck,
  LogOut,
  Sun,
  Moon,
  Newspaper,
  Globe,
} from 'lucide-react';
import { AuthUser, UserProfile } from '../types/krishi';
import { InAppMessageService } from '../services/inAppMessageService';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export type AppTab = 
  | 'home' 
  | 'calculator' 
  | 'market' 
  | 'prices'
  | 'sell'
  | 'pool'
  | 'marketplace'
  | 'records'
  | 'decision'
  | 'analytics'
  | 'blog';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  selectedDistrict?: string;
  setSelectedDistrict?: (district: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  userProfile?: UserProfile;
  authUser: AuthUser;
  onOpenAuthModal?: () => void;
  onOpenSettings: () => void;
  onOpenPitchGuide?: () => void;
  onOpenNotifications?: () => void;
  onOpenAssistant?: () => void;
  onToggleFarmerDashboard?: () => void;
  isFarmerDashboardOpen?: boolean;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedDistrict: _selectedDistrict,
  setSelectedDistrict: _setSelectedDistrict,
  onRefresh,
  isRefreshing = false,
  authUser,
  onOpenSettings,
  onOpenNotifications,
  onToggleFarmerDashboard,
  isFarmerDashboardOpen = false,
  onLogout,
}) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const { language, toggleLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const unsub = InAppMessageService.subscribe((msgs) => {
      setUnreadCount(msgs.filter((m) => !m.read).length);
    });
    return unsub;
  }, []);

  return (
    <header className="bg-[#FFFFFF]/95 dark:bg-[#1C1A18]/95 backdrop-blur-md border-b border-[#E8E2D8] dark:border-[#383530] sticky top-0 z-40 transition-colors duration-150">
      {/* Top Utility Bar: Brand Identity + System Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 border-b border-[#E8E2D8]/80 dark:border-[#383530]/80">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 group cursor-pointer text-left focus:outline-none"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#2E7D5A] dark:bg-[#3EA678] flex items-center justify-center text-white transition-transform duration-150 group-hover:scale-105 shadow-xs shrink-0">
              <Sprout className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-editorial-serif font-black text-2xl sm:text-3xl text-[#1F1E1B] dark:text-[#F5F3EF] tracking-tight leading-none">
                KrishiSetu
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF3EE] dark:bg-[#1E3327] text-[#1E5E41] dark:text-[#4ADE80] border border-[#C5DEC8] dark:border-[#2E5E3B] tracking-wider uppercase hidden sm:inline-block">
                कृषिसेतु
              </span>
            </div>
          </button>
        </div>

        {/* Right: Mandi Sync + Notifications + Settings + Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Aesthetic Light / Dark Mode Switch */}
          <button
            type="button"
            id="header-sync-rates-btn"
            onClick={toggleTheme}
            title={
              isDark
                ? (language === 'ne' ? 'लाइट मोडमा बदल्नुहोस्' : 'Switch to Light Mode')
                : (language === 'ne' ? 'डार्क मोडमा बदल्नुहोस्' : 'Switch to Dark Mode')
            }
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF7F2] dark:bg-[#262421] hover:bg-[#F2ECE1] dark:hover:bg-[#302D28] text-[#1F1E1B] dark:text-[#F5F3EF] border border-[#E8E2D8] dark:border-[#383530] text-xs font-semibold transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs group"
          >
            <div className="relative w-5 h-5 rounded-full bg-amber-100/90 dark:bg-amber-950/60 border border-amber-300/50 dark:border-amber-700/40 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              {isDark ? (
                <Moon className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30 transition-transform duration-300 group-hover:-rotate-12" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-600 fill-amber-500/30 transition-transform duration-300 group-hover:rotate-45" />
              )}
            </div>
            <span className="text-[11px] font-bold text-[#5A554E] dark:text-[#C5BFB5] tracking-tight">
              {isDark ? (language === 'ne' ? 'लाइट' : 'Light') : (language === 'ne' ? 'डार्क' : 'Dark')}
            </span>
          </button>

          {/* Aesthetic Language Switcher (नेपाली / English) */}
          <button
            type="button"
            id="header-language-toggle-btn"
            onClick={toggleLanguage}
            title={language === 'ne' ? 'Switch to English' : 'नेपाली भाषामा हेर्नुहोस् (Switch to Nepali)'}
            aria-label={language === 'ne' ? 'Switch to English' : 'Switch to Nepali'}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF7F2] dark:bg-[#262421] hover:bg-[#F2ECE1] dark:hover:bg-[#302D28] text-[#1F1E1B] dark:text-[#F5F3EF] border border-[#E8E2D8] dark:border-[#383530] text-xs font-semibold transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs group"
          >
            <div className="relative w-5 h-5 rounded-full bg-[#EAF3EE] dark:bg-[#1E3327] border border-[#C5DEC8] dark:border-[#2E5E3B] flex items-center justify-center transition-transform duration-300 group-hover:scale-110 text-[#1E5E41] dark:text-[#4ADE80]">
              <Globe className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-[#5A554E] dark:text-[#C5BFB5] tracking-tight">
              {language === 'ne' ? 'EN' : 'नेपा'}
            </span>
          </button>

          {/* Notification Inbox Bell Button with Live Badge */}
          {onOpenNotifications && (
            <button
              type="button"
              id="header-notifications-btn"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg bg-[#FAF7F2] dark:bg-[#262421] hover:bg-[#F6F2EB] dark:hover:bg-[#2A2824] border border-[#E8E2D8] dark:border-[#383530] transition cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-[#746F68] dark:text-[#A6A096]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C05621] text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          )}

          {/* Farmer Profile Button: Clicking opens right-side farmer dashboard sidebar */}
          <button
            type="button"
            id="header-auth-btn"
            onClick={onToggleFarmerDashboard}
            aria-expanded={isFarmerDashboardOpen}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-white text-xs font-bold transition cursor-pointer shadow-xs ${
              isFarmerDashboardOpen
                ? 'bg-[#2E7D5A] ring-2 ring-[#2E7D5A]/40'
                : 'bg-[#18181B] hover:bg-[#27272A]'
            }`}
            title={language === 'ne' ? 'किसान प्रोफाइल तथा ड्यासबोर्ड' : 'Farmer Profile & Dashboard'}
          >
            <div className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center text-[10px] font-black shrink-0">
              {authUser.name ? authUser.name.charAt(0).toUpperCase() : 'R'}
            </div>
            <span className="font-bold text-xs whitespace-nowrap">
              {authUser.name || 'Farmer'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Desktop Navigation Bar */}
      <div className="hidden sm:block relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-1">
            {/* 1. Home / Dashboard */}
            <button
              type="button"
              id="nav-tab-home"
              onClick={() => setActiveTab('home')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'home' || activeTab === 'market' || activeTab === 'prices'
                  ? 'bg-[#18181B] text-white shadow-xs'
                  : 'text-[#746F68] dark:text-[#A6A096] hover:text-[#1F1E1B] dark:hover:text-[#F5F3EF] hover:bg-[#F6F2EB] dark:hover:bg-[#2A2824]'
              }`}
            >
              {t('nav.home', 'Home')}
            </button>

            {/* 2. Calculator */}
            <button
              type="button"
              id="nav-tab-calculator"
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'calculator'
                  ? 'bg-[#18181B] text-white shadow-xs'
                  : 'text-[#746F68] dark:text-[#A6A096] hover:text-[#1F1E1B] dark:hover:text-[#F5F3EF] hover:bg-[#F6F2EB] dark:hover:bg-[#2A2824]'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>{language === 'ne' ? 'क्याल्कुलेटर' : 'Calculator'}</span>
            </button>

            {/* 3. Transport Pool */}
            <button
              type="button"
              id="nav-tab-pool"
              onClick={() => setActiveTab('pool')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'pool' || activeTab === 'sell'
                  ? 'bg-[#18181B] text-white shadow-xs'
                  : 'text-[#746F68] dark:text-[#A6A096] hover:text-[#1F1E1B] dark:hover:text-[#F5F3EF] hover:bg-[#F6F2EB] dark:hover:bg-[#2A2824]'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>{t('nav.pool', 'Transport Pool')}</span>
            </button>

            {/* 4. Marketplace */}
            <button
              type="button"
              id="nav-tab-marketplace"
              onClick={() => setActiveTab('marketplace')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'marketplace'
                  ? 'bg-[#18181B] text-white shadow-xs'
                  : 'text-[#746F68] dark:text-[#A6A096] hover:text-[#1F1E1B] dark:hover:text-[#F5F3EF] hover:bg-[#F6F2EB] dark:hover:bg-[#2A2824]'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>{t('nav.marketplace', 'Marketplace')}</span>
            </button>

            {/* 5. News */}
            <button
              type="button"
              id="nav-tab-blog"
              onClick={() => setActiveTab('blog')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'blog'
                  ? 'bg-[#18181B] text-white shadow-xs'
                  : 'text-[#746F68] dark:text-[#A6A096] hover:text-[#1F1E1B] dark:hover:text-[#F5F3EF] hover:bg-[#F6F2EB] dark:hover:bg-[#2A2824]'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>{language === 'ne' ? 'समाचार' : 'News'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Dock Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF]/95 dark:bg-[#191919]/95 backdrop-blur-md border-t border-[#EAEAEA] dark:border-[#2E2E2E] px-2 py-1 flex items-center justify-around">
        {/* 1. Home */}
        <button
          type="button"
          id="mobile-tab-home"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center py-1 px-2 text-[10px] font-medium transition cursor-pointer min-w-[60px] ${
            activeTab === 'home' || activeTab === 'market' || activeTab === 'prices'
              ? 'text-[#111111] dark:text-[#F0F0EE]'
              : 'text-[#787774] dark:text-[#9B9A97]'
          }`}
        >
          <div className={`p-1 rounded-md transition ${activeTab === 'home' || activeTab === 'market' || activeTab === 'prices' ? 'bg-[#F0EFEA] dark:bg-[#2E2E2E] text-[#111111] dark:text-[#F0F0EE]' : 'text-[#787774]'}`}>
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="mt-0.5 truncate max-w-[64px]">{t('nav.home', 'Home')}</span>
        </button>

        {/* 2. Calculator */}
        <button
          type="button"
          id="mobile-tab-calculator"
          onClick={() => setActiveTab('calculator')}
          className={`flex flex-col items-center justify-center py-1 px-2 text-[10px] font-medium transition cursor-pointer min-w-[60px] ${
            activeTab === 'calculator'
              ? 'text-[#111111] dark:text-[#F0F0EE]'
              : 'text-[#787774] dark:text-[#9B9A97]'
          }`}
        >
          <div className={`p-1 rounded-md transition ${activeTab === 'calculator' ? 'bg-[#F0EFEA] dark:bg-[#2E2E2E] text-[#111111] dark:text-[#F0F0EE]' : 'text-[#787774]'}`}>
            <Calculator className="w-4 h-4" />
          </div>
          <span className="mt-0.5 truncate max-w-[64px]">{language === 'ne' ? 'हिसाब' : 'Calculator'}</span>
        </button>

        {/* 3. Pool */}
        <button
          type="button"
          id="mobile-tab-pool"
          onClick={() => setActiveTab('pool')}
          className={`flex flex-col items-center justify-center py-1 px-2 text-[10px] font-medium transition cursor-pointer min-w-[60px] ${
            activeTab === 'pool' || activeTab === 'sell'
              ? 'text-[#111111] dark:text-[#F0F0EE]'
              : 'text-[#787774] dark:text-[#9B9A97]'
          }`}
        >
          <div className={`p-1 rounded-md transition ${activeTab === 'pool' || activeTab === 'sell' ? 'bg-[#F0EFEA] dark:bg-[#2E2E2E] text-[#111111] dark:text-[#F0F0EE]' : 'text-[#787774]'}`}>
            <Truck className="w-4 h-4" />
          </div>
          <span className="mt-0.5 truncate max-w-[64px]">{t('nav.pool', 'Pool')}</span>
        </button>

        {/* 4. Marketplace */}
        <button
          type="button"
          id="mobile-tab-marketplace"
          onClick={() => setActiveTab('marketplace')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 text-[10px] font-medium transition cursor-pointer min-w-[50px] ${
            activeTab === 'marketplace'
              ? 'text-[#111111] dark:text-[#F0F0EE]'
              : 'text-[#787774] dark:text-[#9B9A97]'
          }`}
        >
          <div className={`p-1 rounded-md transition ${activeTab === 'marketplace' ? 'bg-[#F0EFEA] dark:bg-[#2E2E2E] text-[#111111] dark:text-[#F0F0EE]' : 'text-[#787774]'}`}>
            <Store className="w-4 h-4" />
          </div>
          <span className="mt-0.5 truncate max-w-[56px]">{t('nav.marketplace', 'Marketplace')}</span>
        </button>

        {/* 5. Agri News & Blog */}
        <button
          type="button"
          id="mobile-tab-blog"
          onClick={() => setActiveTab('blog')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 text-[10px] font-medium transition cursor-pointer min-w-[50px] ${
            activeTab === 'blog'
              ? 'text-[#111111] dark:text-[#F0F0EE]'
              : 'text-[#787774] dark:text-[#9B9A97]'
          }`}
        >
          <div className={`p-1 rounded-md transition ${activeTab === 'blog' ? 'bg-[#F0EFEA] dark:bg-[#2E2E2E] text-[#111111] dark:text-[#F0F0EE]' : 'text-[#787774]'}`}>
            <Newspaper className="w-4 h-4" />
          </div>
          <span className="mt-0.5 truncate max-w-[56px]">{language === 'ne' ? 'समाचार' : 'News'}</span>
        </button>
      </nav>
    </header>
  );
};
