import React, { useState, useEffect } from 'react';
import { AppBackground } from './components/AppBackground';
import { Header, AppTab } from './components/Header';
import { FarmerMarketPrices } from './components/FarmerMarketPrices';
import { FarmerSellSmart } from './components/FarmerSellSmart';
import { FarmerCalculator } from './components/FarmerCalculator';
import { MarketplaceConcept } from './components/MarketplaceConcept';
import { PitchModeGuide } from './components/PitchModeGuide';
import { TransparencyModal } from './components/TransparencyModal';
import { FarmerStoriesModal } from './components/FarmerStoriesModal';
import { PhoneAuthModal } from './components/PhoneAuthModal';
import { FarmerProfileModal } from './components/FarmerProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { InAppNotificationCenter } from './components/InAppNotificationCenter';
import { RlsDiagnosticModal } from './components/RlsDiagnosticModal';
import { FarmerDashboardSidebar } from './components/FarmerDashboardSidebar';
import { KrishiMitra } from './components/KrishiMitra';
import { IncomingInAppToast } from './components/IncomingInAppToast';
import {
  generateCommodityList,
  updateLiveRateOverrides,
  DEFAULT_USER_PROFILE,
} from './data/agriData';
import { Commodity, UserProfile, AuthUser } from './types/krishi';
import { AuthService } from './services/authService';
import { marketApi } from './api/marketApi';
import { LandingPage } from './components/LandingPage';
import { FarmerBlogPage } from './components/FarmerBlogPage';
import { Sprout, CheckCircle2, Users, ArrowRight, LogOut, Sparkles } from 'lucide-react';
import { useLanguage } from './context/LanguageContext';
import { useTheme } from './context/ThemeContext';

const DEFAULT_FARMER_USER: AuthUser = {
  id: '',
  uid: '',
  name: 'Farmer',
  phone: '',
  normalizedPhone: '',
  phoneVerified: false,
  status: 'active',
  preferredLanguage: 'ne',
  province: 'Bagmati',
  district: 'chitwan',
  municipality: 'Bharatpur-11',
  ward: '11',
  locality: 'Chitwan Farm Sector',
  landSize: 2,
  landUnit: 'ropani',
  landSizeRopani: 2,
  farmName: 'My Agro Farm',
  primaryCrops: ['tomato', 'potato'],
  profileCompletionPct: 50,
  isGuest: false,
  createdAt: new Date().toISOString(),
};

export default function App() {
  const { language, t } = useLanguage();
  const { setTheme } = useTheme();
  const [commodities, setCommodities] = useState<Commodity[]>(() => generateCommodityList());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => AuthService.isAuthenticated());
  const [authUser, setAuthUser] = useState<AuthUser>(() => AuthService.getCurrentUser() || DEFAULT_FARMER_USER);
  const [selectedDistrict, setSelectedDistrict] = useState<string>(() => authUser.district || 'chitwan');
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [targetCropId, setTargetCropId] = useState<string>('tomato');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfile>(() => ({
    ...DEFAULT_USER_PROFILE,
    name: authUser.name,
    district: authUser.district,
    phone: authUser.phone,
    primaryCrops: authUser.primaryCrops,
  }));

  // Modals & Panels
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState<boolean>(false);
  const [isRlsDiagnosticOpen, setIsRlsDiagnosticOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isPitchGuideOpen, setIsPitchGuideOpen] = useState<boolean>(false);
  const [isTransparencyModalOpen, setIsTransparencyModalOpen] = useState<boolean>(false);
  const [isFarmerStoriesOpen, setIsFarmerStoriesOpen] = useState<boolean>(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [isFarmerDashboardOpen, setIsFarmerDashboardOpen] = useState<boolean>(false);

  // Sync auth state listener
  useEffect(() => {
    const unsub = AuthService.subscribe((updated) => {
      const isAuth = AuthService.isAuthenticated();
      setIsAuthenticated(isAuth);
      const active = updated || (isAuth ? (AuthService.getCurrentUser() || DEFAULT_FARMER_USER) : DEFAULT_FARMER_USER);
      setAuthUser(active);
      if (active.district) {
        setSelectedDistrict(active.district);
      }
      setUserProfile((prev) => ({
        ...prev,
        name: active.name,
        district: active.district,
        phone: active.phone,
        primaryCrops: active.primaryCrops,
      }));
    });
    return unsub;
  }, []);

  // Load live commodities from backend on mount
  useEffect(() => {
    let mounted = true;
    async function loadLiveCommodities() {
      try {
        const res = await marketApi.getCommodities();
        if (mounted && res && res.commodities && res.commodities.length > 0) {
          updateLiveRateOverrides(res.commodities.map((c: any) => ({
            id: c.id,
            currentPrice: c.currentPrice,
            yesterdayPrice: c.yesterdayPrice ?? c.previousClose,
            minPrice: c.minPrice,
            maxPrice: c.maxPrice,
            forecast7Day: c.forecast7Day,
            forecast14Day: c.forecast14Day,
            forecast30Day: c.forecast30Day,
            threeMonthForecast: c.threeMonthForecast,
            fiveMonthForecast: c.fiveMonthForecast,
            arrivalsTodayTons: c.arrivalsTodayTons,
            arrivalsYesterdayTons: c.arrivalsYesterdayTons,
            sentiment: c.sentiment,
          })));
          setCommodities(generateCommodityList());
        }
      } catch (err) {
        console.warn('[App] Could not fetch live commodities, using cached baseline:', err);
      }
    }
    loadLiveCommodities();
    return () => { mounted = false; };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Trigger live scraper on backend
      await marketApi.triggerScrape().catch(() => null);
      // Fetch updated commodities with new live rates & history
      const res = await marketApi.getCommodities();
      if (res && res.commodities && res.commodities.length > 0) {
        updateLiveRateOverrides(res.commodities.map((c: any) => ({
          id: c.id,
          currentPrice: c.currentPrice,
          yesterdayPrice: c.yesterdayPrice ?? c.previousClose,
          minPrice: c.minPrice,
          maxPrice: c.maxPrice,
          forecast7Day: c.forecast7Day,
          forecast14Day: c.forecast14Day,
          forecast30Day: c.forecast30Day,
          threeMonthForecast: c.threeMonthForecast,
          fiveMonthForecast: c.fiveMonthForecast,
          arrivalsTodayTons: c.arrivalsTodayTons,
          arrivalsYesterdayTons: c.arrivalsYesterdayTons,
          sentiment: c.sentiment,
        })));
      }
      setCommodities(generateCommodityList());
      setToastMessage('Live Kalimati rates & graphs updated successfully');
    } catch {
      setCommodities(generateCommodityList());
      setToastMessage('Prices and arrivals updated from Kalimati Mandi');
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleNavigate = (tab: AppTab, extra?: { commodityId?: string } | string) => {
    if (typeof extra === 'string') {
      setTargetCropId(extra);
    } else if (extra?.commodityId) {
      setTargetCropId(extra.commodityId);
    }
    const resolvedTab = (tab === 'decision' || tab === 'records' || tab === 'analytics') ? 'home' : tab;
    setActiveTab(resolvedTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJoinPool = (poolId: string, volumeKg: number, pickupLocation: string) => {
    // Auto-record sale in accounting ledger if user joins pool
    try {
      const saved = localStorage.getItem('krishisetu_farm_accounting');
      const entries = saved ? JSON.parse(saved) : [];
      const newEntry = {
        id: `acc-pool-${Date.now()}`,
        type: 'money_in',
        amount: Math.round(volumeKg * 42),
        category: 'sale',
        categoryLabel: 'Crop Sale (बाली बिक्री)',
        date: new Date().toISOString().split('T')[0],
        cropId: 'tomato',
        cropName: 'Tomato (Local)',
        quantityKg: volumeKg,
        note: `Shared freight pool booking: ${volumeKg} kg from ${pickupLocation}`,
        source: 'sell_pool',
      };
      localStorage.setItem('krishisetu_farm_accounting', JSON.stringify([newEntry, ...entries]));
    } catch (e) {}

    setToastMessage(`Success! Booked ${volumeKg} kg on shared transport pool (Logged in Farm Records)`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAuthSuccess = (user: AuthUser) => {
    AuthService.saveCurrentUser(user);
    setAuthUser(user);
    setIsAuthenticated(true);
    // User requirement: default to light mode upon login
    setTheme('light');
    if (user.district) {
      setSelectedDistrict(user.district);
    }
    setUserProfile((prev) => ({
      ...prev,
      id: user.id || prev.id,
      name: user.name || 'Ram Bahadur Thapa',
      district: user.district || 'chitwan',
      municipality: user.municipality || 'Bharatpur-11',
      ward: user.ward || '11',
      locality: user.locality || 'Bhojad Green Valley',
      phone: user.phone || '+977 9845012345',
      primaryCrops: user.primaryCrops && user.primaryCrops.length > 0 ? user.primaryCrops : ['tomato', 'cauliflower', 'potato'],
      landSize: user.landSize || prev.landSize,
      landSizeRopani: user.landSizeRopani || user.landSize || prev.landSizeRopani,
      landUnit: (user.landUnit as any) || prev.landUnit,
      farmName: user.farmName || `${user.name}'s Agro Farm`,
    }));
    setActiveTab('home');
    setToastMessage(`Welcome, ${user.name}! Connected to ${user.district.toUpperCase()} Mandi network.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLogout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    setAuthUser(DEFAULT_FARMER_USER);
    setIsFarmerDashboardOpen(false);
    setIsSettingsOpen(false);
    setToastMessage('Logged out successfully.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    if (updated.district) {
      setSelectedDistrict(updated.district);
    }
    setToastMessage('Farm profile preferences saved successfully!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // If not authenticated, present the Landing Page with Sign Up and Login options
  if (!isAuthenticated) {
    return (
      <LandingPage
        onLoginSuccess={handleAuthSuccess}
      />
    );
  }

  return (
    <AppBackground>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 md:bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#2B2621] text-[#FAF8F4] text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 border border-[#E8E2D9]">
          <CheckCircle2 className="w-4 h-4 text-[#4A6B4E] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedDistrict={selectedDistrict}
        setSelectedDistrict={(d) => {
          setSelectedDistrict(d);
          setUserProfile((prev) => ({ ...prev, district: d }));
        }}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        userProfile={userProfile}
        authUser={authUser}
        onOpenAuthModal={() => setIsProfileModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNotifications={() => setIsNotificationCenterOpen(true)}
        onOpenPitchGuide={() => setIsPitchGuideOpen(true)}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onToggleFarmerDashboard={() => setIsFarmerDashboardOpen((prev) => !prev)}
        isFarmerDashboardOpen={isFarmerDashboardOpen}
        onLogout={handleLogout}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 pt-3.5 pb-8 sm:pb-12 max-w-7xl mx-auto">
        
        {/* Screen 1: Home (Market Wholesale Prices, Trends & Analysis — The New Primary Home Screen) */}
        {(activeTab === 'home' || activeTab === 'market' || activeTab === 'prices') && (
          <FarmerMarketPrices
            commodities={commodities}
            selectedDistrict={selectedDistrict}
            setSelectedDistrict={setSelectedDistrict}
            initialSelectedCropId={targetCropId}
            onNavigateToSell={(cropId) => handleNavigate('pool', { commodityId: cropId })}
            userProfile={userProfile}
            onNavigateTab={(tab, extra) => handleNavigate(tab, extra)}
          />
        )}

        {/* Screen 2: Farmer Calculator (Hero: Crop, Quantity, District, Input Costs & Net Profit Margin) */}
        {activeTab === 'calculator' && (
          <FarmerCalculator
            selectedDistrict={selectedDistrict}
            setSelectedDistrict={setSelectedDistrict}
            onNavigateToSell={(cropId) => handleNavigate('pool', { commodityId: cropId })}
            userProfile={userProfile}
            initialCropId={targetCropId}
          />
        )}

        {/* Screen 3: Dedicated Transport Pool Feature (Shared freight truck with nearby farmers) */}
        {(activeTab === 'pool' || activeTab === 'sell') && (
          <FarmerSellSmart
            commodities={commodities}
            selectedDistrict={selectedDistrict}
            setSelectedDistrict={setSelectedDistrict}
            initialCropId={targetCropId}
            userProfile={userProfile}
            onJoinPool={handleJoinPool}
          />
        )}

        {/* Screen 4: Marketplace Concept (Direct Farmer-to-Buyer Listings, Filters, Modal Explainer) */}
        {activeTab === 'marketplace' && (
          <MarketplaceConcept
            selectedDistrict={selectedDistrict}
            setSelectedDistrict={setSelectedDistrict}
            authUser={authUser}
            userProfile={userProfile}
            onNavigateToSell={(cropId) => handleNavigate('pool', { commodityId: cropId })}
          />
        )}

        {/* Screen 5: Nepal Agri News & Blog Page (Authentic bulletins from MoALD, NARC, Kalimati, DHM) */}
        {activeTab === 'blog' && (
          <FarmerBlogPage
            selectedDistrict={selectedDistrict}
            setSelectedDistrict={setSelectedDistrict}
            onNavigateTab={(tab, extra) => handleNavigate(tab as AppTab, extra)}
          />
        )}
      </main>

      {/* Krishi Mitra AI Assistant (Floating Interactive Assistant) */}
      <KrishiMitra
        currentUser={authUser}
        selectedDistrict={selectedDistrict}
        isOpen={isAssistantOpen}
        onToggle={setIsAssistantOpen}
        onNavigateTab={(tab, cropId) => handleNavigate(tab, cropId ? { commodityId: cropId } : undefined)}
      />

      {/* Dedicated Consolidated Settings Screen / Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenPitchGuide={() => setIsPitchGuideOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenRlsDiagnostic={() => setIsRlsDiagnosticOpen(true)}
        onOpenTransparency={() => setIsTransparencyModalOpen(true)}
        onOpenFarmerStories={() => setIsFarmerStoriesOpen(true)}
        onRefreshPrices={handleRefresh}
        onNavigateTab={(tab) => handleNavigate(tab)}
        onLogout={handleLogout}
        userProfile={userProfile}
        authUser={authUser}
      />

      {/* Right-Side Farmer Dashboard Drawer / Sidebar (Triggered by clicking Ram Bahadur Thapa in Header) */}
      <FarmerDashboardSidebar
        isOpen={isFarmerDashboardOpen}
        onClose={() => setIsFarmerDashboardOpen(false)}
        userProfile={userProfile}
        authUser={authUser}
        commodities={commodities}
        selectedDistrict={selectedDistrict}
        onEditFarmData={() => {
          setIsFarmerDashboardOpen(false);
          setIsProfileModalOpen(true);
        }}
        onNavigateTab={(tab, extra) => {
          setIsFarmerDashboardOpen(false);
          handleNavigate(tab, extra);
        }}
        onLogout={handleLogout}
      />

      {/* Farmer Profile & Track Record Modal (Tapping Avatar opens this directly) */}
      <FarmerProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={userProfile}
        userProfile={userProfile}
        onUpdateProfile={handleUpdateProfile}
      />

      {/* Phone OTP & 1-Click Guest Demo Login Modal */}
      <PhoneAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* 5-Minute Live Pitch & Demo Script Guide for Presenter */}
      <PitchModeGuide
        isOpen={isPitchGuideOpen}
        onClose={() => setIsPitchGuideOpen(false)}
        currentTab={activeTab}
        onNavigateTab={(tab) => handleNavigate(tab)}
        onOpenTransparency={() => {
          setIsPitchGuideOpen(false);
          setIsTransparencyModalOpen(true);
        }}
      />

      {/* Technical Honesty & Methodology Transparency Modal */}
      <TransparencyModal
        isOpen={isTransparencyModalOpen}
        onClose={() => setIsTransparencyModalOpen(false)}
      />

      {/* Illustrative Farmer Stories & Economic Cases Modal */}
      <FarmerStoriesModal
        isOpen={isFarmerStoriesOpen}
        onClose={() => setIsFarmerStoriesOpen(false)}
      />

      {/* In-App Notifications & Market Bulletins Center */}
      <InAppNotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        onNavigateTab={(tab) => handleNavigate(tab)}
        onOpenRlsDiagnostic={() => setIsRlsDiagnosticOpen(true)}
      />

      {/* PostgreSQL Row Level Security (RLS) & Tenant Isolation Diagnostic Modal */}
      <RlsDiagnosticModal
        isOpen={isRlsDiagnosticOpen}
        onClose={() => setIsRlsDiagnosticOpen(false)}
      />

      {/* Real-time In-App Notification & SMS Alert Banner */}
      <IncomingInAppToast onOpenInbox={() => setIsNotificationCenterOpen(true)} />

      {/* Clean, Trustworthy Agricultural Footer */}
      <footer className="w-full bg-white dark:bg-[#1C1A18] border-t border-[#E8E2D8] dark:border-[#383530] py-4 px-4 sm:px-6 text-xs text-[#746F68] dark:text-[#A6A096] mt-auto pb-20 sm:pb-4 transition-colors duration-150">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <div className="w-6 h-6 rounded-lg bg-[#2E7D5A] dark:bg-[#3EA678] flex items-center justify-center text-white shrink-0">
              <Sprout className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span className="font-bold text-[#1F1E1B] dark:text-[#F5F3EF]">KrishiSetu Nepal</span>
            <span className="text-[#8C827A] dark:text-[#807B74] hidden sm:inline">•</span>
            <span>{t('footer.brand', 'Agricultural Decision Engine for Smallholders')}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-[#8C827A] dark:text-[#807B74]">
            <span>{language === 'ne' ? 'कालीमाटी फलफूल तथा तरकारी बजार विकास समिति' : 'Kalimati Mandi Benchmark'}</span>
          </div>
        </div>
      </footer>
    </AppBackground>
  );
}
