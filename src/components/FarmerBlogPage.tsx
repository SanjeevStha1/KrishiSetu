import React, { useState, useMemo, useEffect } from 'react';
import {
  Newspaper,
  Search,
  X,
  Filter,
  Calendar,
  Clock,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Share2,
  CheckCircle2,
  AlertCircle,
  Award,
  Sparkles,
  MapPin,
  Tag,
  Volume2,
  VolumeX,
  ArrowRight,
  TrendingUp,
  CloudSun,
  FileText,
  ShieldCheck,
  Building2,
  ChevronRight,
  Check,
  RefreshCw,
  Rss,
} from 'lucide-react';
import { AGRI_NEWS_ARTICLES, AgriNewsArticle } from '../data/agriNewsData';
import { DISTRICT_LIST } from '../data/agriData';
import { useLanguage } from '../context/LanguageContext';
import { NewsService, NewsFeedSource } from '../services/newsService';

interface FarmerBlogPageProps {
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  onNavigateTab?: (tab: string, extra?: any) => void;
}

type NewsCategory = 'all' | 'subsidies' | 'market' | 'research' | 'weather';

export const FarmerBlogPage: React.FC<FarmerBlogPageProps> = ({
  selectedDistrict,
  setSelectedDistrict,
  onNavigateTab,
}) => {
  const { language } = useLanguage();
  const isNe = language === 'ne';

  // Filters & State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('all');
  const [filterDistrict, setFilterDistrict] = useState<string>('all');
  const [activeArticle, setActiveArticle] = useState<AgriNewsArticle | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('krishisetu_saved_news');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [copyToast, setCopyToast] = useState<string | null>(null);

  // Live RSS & Scraper feeds state
  const [allArticles, setAllArticles] = useState<AgriNewsArticle[]>(() => AGRI_NEWS_ARTICLES);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [feedSources, setFeedSources] = useState<NewsFeedSource[]>([]);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('');

  // Initial load from backend scraper service
  useEffect(() => {
    let isMounted = true;
    NewsService.fetchNews().then((data) => {
      if (isMounted && data && data.articles && data.articles.length > 0) {
        setAllArticles(data.articles);
        if (data.sources) setFeedSources(data.sources);
        if (data.lastSyncedAt) setLastSyncedAt(data.lastSyncedAt);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Manual Trigger for Live Scraper & Feed Sync
  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const data = await NewsService.triggerSync();
      if (data && data.articles) {
        setAllArticles(data.articles);
        if (data.sources) setFeedSources(data.sources);
        if (data.lastSyncedAt) setLastSyncedAt(data.lastSyncedAt);
        setCopyToast(
          isNe
            ? 'कृषि मन्त्रालय, नार्क, कालीमाटी र मौसम फिडहरू सफलतापूर्वक सिंक भए!'
            : 'Agri news & bulletins successfully synced from MoALD, NARC, Kalimati & DHM!'
        );
        setTimeout(() => setCopyToast(null), 3000);
      }
    } catch (err) {
      console.warn('Sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Toggle Bookmark
  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('krishisetu_saved_news', JSON.stringify(next));
      } catch (err) {}
      return next;
    });
  };

  // Share Article
  const handleShare = (article: AgriNewsArticle, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${article.title} — KrishiSetu Agri News`);
      setCopyToast(isNe ? 'लिङ्क प्रतिलिपि गरियो!' : 'Article link copied to clipboard!');
      setTimeout(() => setCopyToast(null), 2500);
    }
  };

  // Filtered Articles
  const filteredArticles = useMemo(() => {
    return allArticles.filter((article) => {
      // Category filter
      if (selectedCategory !== 'all' && article.category !== selectedCategory) {
        return false;
      }
      // District filter
      if (filterDistrict !== 'all' && article.district && article.district.toLowerCase() !== filterDistrict.toLowerCase()) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitleEn = article.title.toLowerCase().includes(q);
        const matchTitleNe = article.titleNe.includes(q);
        const matchSummaryEn = article.summaryEn.toLowerCase().includes(q);
        const matchSummaryNe = article.summaryNe.includes(q);
        const matchSource = article.source.toLowerCase().includes(q) || article.sourceNe.includes(q);
        const matchCrops = article.impactedCrops.some((c) => c.toLowerCase().includes(q));
        return matchTitleEn || matchTitleNe || matchSummaryEn || matchSummaryNe || matchSource || matchCrops;
      }
      return true;
    });
  }, [allArticles, selectedCategory, filterDistrict, searchQuery]);

  // Featured Article
  const featuredArticle = useMemo(() => {
    return allArticles.find((a) => a.featured) || allArticles[0] || AGRI_NEWS_ARTICLES[0];
  }, [allArticles]);

  const todayFormattedDate = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString(isNe ? 'ne-NP' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [isNe]);

  return (
    <div className="space-y-6 pb-6">
      {/* Toast Notification */}
      {copyToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#1F1E1B] dark:bg-[#FAF7F2] text-white dark:text-[#1F1E1B] text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{copyToast}</span>
        </div>
      )}

      {/* 1. Header & Search Banner matching Home Page Look */}
      <div className="app-card p-4 sm:p-5 space-y-4 border border-[#E8E2D8] dark:border-[#383530] bg-white dark:bg-[#22201D] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="tag-pastel-blue">
                <Newspaper className="w-3.5 h-3.5 inline mr-1" />
                {isNe ? 'नेपाल कृषि समाचार तथा सूचना केन्द्र' : 'Nepal Agri News & Bulletins'}
              </span>
              <span className="text-[11px] font-editorial-mono text-[#746F68] dark:text-[#A6A096]">
                {todayFormattedDate}
              </span>
            </div>
            <h1 className="font-editorial-serif text-xl sm:text-2xl font-bold text-[#1F1E1B] dark:text-[#F5F3EF] tracking-tight">
              {isNe
                ? 'कृषि समाचार, नीति, अनुसन्धान तथा मौसम सूचना'
                : 'Nepal Agricultural News, Policy & Field Bulletins'}
            </h1>
            <p className="text-xs text-[#746F68] dark:text-[#A6A096]">
              {isNe
                ? 'कृषि मन्त्रालय (MoALD), नार्क (NARC), कालीमाटी बजार र मौसम विभागबाट संकलित आधिकारिक सूचनाहरू'
                : 'Verified field updates from MoALD, NARC research stations, Kalimati Mandi & DHM'}
            </p>
          </div>

          {/* Controls: Live RSS/Scraper Sync & Region Filter */}
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto shrink-0">
            {/* Automated Scraper & RSS Sync Status Pill */}
            <div className="flex items-center gap-2 bg-[#FAF7F2] dark:bg-[#262421] px-2.5 py-1.5 rounded-lg border border-[#E8E2D8] dark:border-[#383530] text-xs">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#1E5E41] dark:text-[#4ADE80]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{isNe ? 'RSS / स्क्र्यापर सक्रिय' : 'Scraper & RSS Active'}</span>
              </span>
              <button
                type="button"
                id="news-sync-feeds-btn"
                onClick={handleManualSync}
                disabled={isSyncing}
                title={isNe ? 'ताजा समाचार सिंक गर्नुहोस्' : 'Sync feeds from MoALD, NARC, Kalimati, DHM'}
                className="flex items-center gap-1 pl-2 border-l border-[#E8E2D8] dark:border-[#383530] text-[#746F68] dark:text-[#A6A096] hover:text-[#1F1E1B] dark:hover:text-[#F5F3EF] transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-emerald-600 dark:text-emerald-400' : ''}`} />
                <span className="text-[11px] font-medium">
                  {isSyncing ? (isNe ? 'सिंक हुँदै...' : 'Syncing...') : (isNe ? 'सिंक' : 'Sync')}
                </span>
              </button>
            </div>

            {/* Region / District Filter Dropdown */}
            <div className="flex items-center gap-2 bg-[#FAF7F2] dark:bg-[#262421] px-3 py-1.5 rounded-lg border border-[#E8E2D8] dark:border-[#383530] text-xs">
              <MapPin className="w-3.5 h-3.5 text-[#C8A27C] dark:text-[#D9B591]" />
              <span className="text-[#746F68] dark:text-[#A6A096]">{isNe ? 'क्षेत्र:' : 'Region:'}</span>
              <select
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                className="bg-transparent font-medium text-[#1F1E1B] dark:text-[#F5F3EF] focus:outline-none cursor-pointer pr-1"
              >
                <option value="all" className="dark:bg-[#1E1D1B] dark:text-[#F5F3EF]">
                  {isNe ? 'सम्पूर्ण नेपाल (All Nepal)' : 'All Nepal'}
                </option>
                {DISTRICT_LIST.map((dist) => (
                  <option key={dist.id} value={dist.id} className="dark:bg-[#1E1D1B] dark:text-[#F5F3EF]">
                    {dist.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Search Input Box */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#746F68] dark:text-[#A6A096] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isNe
                ? 'समाचार वा सूचना खोज्नुहोस् (उदा. मल अनुदान, डडुवा रोग, काउली दर, मौसम, बीउ)...'
                : 'Search agricultural news (e.g. fertilizer subsidy, late blight, cauliflower price, weather)...'
            }
            className="w-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] focus:border-[#2D6CDF] dark:focus:border-[#76A9FA] rounded-lg pl-10 pr-20 py-2.5 text-xs sm:text-sm text-[#1F1E1B] dark:text-[#F5F3EF] placeholder:text-[#746F68] focus:outline-none transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#746F68] hover:text-[#1F1E1B] dark:hover:text-[#F5F3EF] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: 'all', labelEn: 'All Updates', labelNe: 'सबै समाचार' },
            { id: 'subsidies', labelEn: 'Subsidies & Grants', labelNe: 'अनुदान र नीति' },
            { id: 'market', labelEn: 'Mandi Rates & Trade', labelNe: 'बजार तथा मूल्य' },
            { id: 'research', labelEn: 'Crop Technology & Seeds', labelNe: 'बाली प्रविधि र बीउ' },
            { id: 'weather', labelEn: 'Agro-Weather Alert', labelNe: 'मौसम र जलस्रोत' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id as NewsCategory)}
              className={`px-3 py-1.5 rounded-full font-semibold transition cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-[#18181B] text-white shadow-xs'
                  : 'bg-[#FAF7F2] dark:bg-[#262421] text-[#746F68] dark:text-[#A6A096] hover:text-[#1F1E1B] dark:hover:text-[#F5F3EF] border border-[#E8E2D8] dark:border-[#383530]'
              }`}
            >
              {isNe ? cat.labelNe : cat.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Hero Featured Article */}
      {featuredArticle && !searchQuery && selectedCategory === 'all' && (
        <div
          onClick={() => setActiveArticle(featuredArticle)}
          className="app-card border border-[#E8E2D8] dark:border-[#383530] bg-white dark:bg-[#22201D] overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Image Column */}
            <div className="lg:col-span-5 relative h-56 lg:h-auto overflow-hidden bg-slate-900">
              <img
                src={featuredArticle.imageUrl}
                alt={featuredArticle.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
              />
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#C05621] text-white px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3 h-3" />
                <span>{isNe ? 'विशेष समाचार' : 'Featured Story'}</span>
              </div>
              <div className="absolute bottom-3 left-3 right-3 bg-[#1F1E1B]/80 backdrop-blur-xs text-white px-3 py-1.5 rounded-lg text-xs flex items-center justify-between">
                <span className="font-semibold text-amber-300 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {isNe ? featuredArticle.sourceNe : featuredArticle.source}
                </span>
                <span className="text-[11px] opacity-80">{isNe ? featuredArticle.publishedAtNe : featuredArticle.publishedAt}</span>
              </div>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-7 p-5 sm:p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EAF3EE] text-[#1E5E41] dark:bg-[#1E3327] dark:text-[#4ADE80]">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{isNe ? featuredArticle.categoryLabelNe : featuredArticle.categoryLabelEn}</span>
                  </span>
                  <span className="text-xs text-[#746F68] dark:text-[#A6A096] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{featuredArticle.readTimeMin} {isNe ? 'मिनेट पढाइ' : 'min read'}</span>
                  </span>
                </div>

                <h2 className="font-editorial-serif text-lg sm:text-xl font-bold text-[#1F1E1B] dark:text-[#F5F3EF] leading-snug group-hover:text-[#2E7D5A] dark:group-hover:text-[#4ADE80] transition-colors">
                  {isNe ? featuredArticle.titleNe : featuredArticle.title}
                </h2>

                <p className="text-xs sm:text-sm text-[#746F68] dark:text-[#A6A096] line-clamp-3 leading-relaxed">
                  {isNe ? featuredArticle.summaryNe : featuredArticle.summaryEn}
                </p>
              </div>

              {/* Farmer Action Highlight Box */}
              <div className="bg-[#FAF7F2] dark:bg-[#262421] border-l-3 border-[#2E7D5A] dark:border-[#4ADE80] p-3 rounded-r-lg">
                <div className="text-[11px] font-bold text-[#1E5E41] dark:text-[#4ADE80] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>{isNe ? 'किसानले गर्नुपर्ने कार्य' : 'Actionable Recommendation'}</span>
                </div>
                <p className="text-xs text-[#1F1E1B] dark:text-[#F5F3EF] font-medium">
                  {isNe ? featuredArticle.farmerActionNe : featuredArticle.farmerActionEn}
                </p>
              </div>

              {/* Footer row */}
              <div className="flex items-center justify-between pt-2 border-t border-[#E8E2D8] dark:border-[#383530]">
                <div className="flex items-center gap-1.5">
                  {featuredArticle.impactedCrops.map((crop) => (
                    <span
                      key={crop}
                      className="px-2 py-0.5 rounded-md bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] text-[10px] font-bold text-[#746F68] dark:text-[#A6A096] capitalize"
                    >
                      {crop}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => toggleBookmark(featuredArticle.id, e)}
                    className="p-1.5 rounded-lg hover:bg-[#FAF7F2] dark:hover:bg-[#262421] text-[#746F68] hover:text-[#1F1E1B] dark:hover:text-[#F5F3EF] transition cursor-pointer"
                    title={bookmarkedIds.includes(featuredArticle.id) ? 'Bookmarked' : 'Bookmark'}
                  >
                    {bookmarkedIds.includes(featuredArticle.id) ? (
                      <BookmarkCheck className="w-4 h-4 text-[#2E7D5A] dark:text-[#4ADE80]" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleShare(featuredArticle, e)}
                    className="p-1.5 rounded-lg hover:bg-[#FAF7F2] dark:hover:bg-[#262421] text-[#746F68] hover:text-[#1F1E1B] dark:hover:text-[#F5F3EF] transition cursor-pointer"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#2E7D5A] dark:text-[#4ADE80] group-hover:translate-x-1 transition-transform ml-2">
                    <span>{isNe ? 'विस्तृत हेर्नुहोस्' : 'Read Article'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Grid Layout with Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: News Articles List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-editorial-serif text-base sm:text-lg font-bold text-[#1F1E1B] dark:text-[#F5F3EF]">
              {isNe ? 'ताजा कृषि बुलेटिनहरू' : 'Latest Agricultural Bulletins'}
            </h3>
            <span className="text-xs text-[#746F68] dark:text-[#A6A096]">
              {filteredArticles.length} {isNe ? 'वटा सूचना उपलब्ध' : 'bulletins found'}
            </span>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="app-card p-10 text-center space-y-3 border border-[#E8E2D8] dark:border-[#383530] bg-white dark:bg-[#22201D]">
              <AlertCircle className="w-8 h-8 text-[#C8A27C] mx-auto" />
              <h4 className="font-bold text-sm text-[#1F1E1B] dark:text-[#F5F3EF]">
                {isNe ? 'कुनै समाचार भेटिएन' : 'No news bulletins found'}
              </h4>
              <p className="text-xs text-[#746F68] dark:text-[#A6A096] max-w-md mx-auto">
                {isNe
                  ? 'तपाईँले खोज्नुभएको शब्द वा छनोट गर्नुभएको श्रेणीमा हाल कुनै समाचार उपलब्ध छैन। कृपया अन्य शब्द प्रयोग गर्नुहोस्।'
                  : 'Try adjusting your search criteria or resetting filters to view all updates.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setFilterDistrict('all');
                }}
                className="px-4 py-2 rounded-lg bg-[#18181B] text-white text-xs font-bold transition cursor-pointer"
              >
                {isNe ? 'सबै समाचार हेर्नुहोस्' : 'Reset All Filters'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredArticles.map((article) => {
                const isBookmarked = bookmarkedIds.includes(article.id);
                return (
                  <article
                    key={article.id}
                    onClick={() => setActiveArticle(article)}
                    className="app-card border border-[#E8E2D8] dark:border-[#383530] bg-white dark:bg-[#22201D] overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group"
                  >
                    <div>
                      {/* Image Header */}
                      <div className="relative h-44 overflow-hidden bg-slate-900">
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400 opacity-95"
                        />
                        <div className="absolute top-2.5 left-2.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1F1E1B]/85 backdrop-blur-xs text-white border border-white/20">
                            <Tag className="w-2.5 h-2.5 text-amber-300" />
                            <span>{isNe ? article.categoryLabelNe : article.categoryLabelEn}</span>
                          </span>
                        </div>
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => toggleBookmark(article.id, e)}
                            className="p-1.5 rounded-full bg-[#1F1E1B]/80 text-white hover:bg-[#1F1E1B] transition cursor-pointer"
                            title={isBookmarked ? 'Bookmarked' : 'Bookmark'}
                          >
                            {isBookmarked ? (
                              <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Bookmark className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-4 space-y-2.5">
                        <div className="flex items-center justify-between text-[11px] text-[#746F68] dark:text-[#A6A096]">
                          <span className="font-semibold text-[#2E7D5A] dark:text-[#4ADE80] truncate max-w-[170px]">
                            {isNe ? article.sourceNe : article.source}
                          </span>
                          <span className="shrink-0">{isNe ? article.publishedAtNe : article.publishedAt}</span>
                        </div>

                        <h4 className="font-editorial-serif text-sm font-bold text-[#1F1E1B] dark:text-[#F5F3EF] line-clamp-2 leading-snug group-hover:text-[#2E7D5A] dark:group-hover:text-[#4ADE80] transition-colors">
                          {isNe ? article.titleNe : article.title}
                        </h4>

                        <p className="text-xs text-[#746F68] dark:text-[#A6A096] line-clamp-3 leading-relaxed">
                          {isNe ? article.summaryNe : article.summaryEn}
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 border-t border-[#E8E2D8] dark:border-[#383530] bg-[#FAF7F2]/50 dark:bg-[#262421]/50 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        {article.impactedCrops.slice(0, 2).map((c) => (
                          <span
                            key={c}
                            className="px-1.5 py-0.5 rounded bg-white dark:bg-[#1C1A18] text-[10px] font-semibold text-[#746F68] dark:text-[#A6A096] border border-[#E8E2D8] dark:border-[#383530] capitalize"
                          >
                            {c}
                          </span>
                        ))}
                      </div>

                      <span className="font-bold text-[#2E7D5A] dark:text-[#4ADE80] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        <span>{isNe ? 'विस्तृत' : 'Read'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 4 Cols: Practical Agri Widgets & Official Feeds */}
        <div className="lg:col-span-4 space-y-5">
          {/* 1. Agro-Weather Advisory Card */}
          <div className="app-card p-4 sm:p-5 border border-[#E8E2D8] dark:border-[#383530] bg-white dark:bg-[#22201D] shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D8] dark:border-[#383530]">
              <div className="flex items-center gap-2">
                <CloudSun className="w-4 h-4 text-amber-500" />
                <span className="font-editorial-serif font-bold text-sm text-[#1F1E1B] dark:text-[#F5F3EF]">
                  {isNe ? 'कृषि मौसम सल्लाह' : 'Field Weather Advisory'}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                {isNe ? 'आगामी ३ दिन' : '3-Day Alert'}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] space-y-1">
                <div className="flex items-center justify-between font-bold text-[#1F1E1B] dark:text-[#F5F3EF]">
                  <span>{isNe ? 'बागमती तथा गण्डकी उपत्यका' : 'Bagmati & Gandaki Corridors'}</span>
                  <span className="text-blue-600 dark:text-blue-400">🌦️ {isNe ? 'हल्का वर्षा' : 'Light Rain'}</span>
                </div>
                <p className="text-[11px] text-[#746F68] dark:text-[#A6A096]">
                  {isNe
                    ? 'अपराह्नपछि मेघगर्जनसहित पानी पर्ने। तयार भएको काउली र आलु खेतबाट पानी तुरुन्त निकास गर्नुहोस्।'
                    : 'Afternoon rain showers. Keep furrow drainage open in cauliflower and potato beds.'}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] space-y-1">
                <div className="flex items-center justify-between font-bold text-[#1F1E1B] dark:text-[#F5F3EF]">
                  <span>{isNe ? 'चितवन तथा तराई भित्री मधेस' : 'Chitwan & Terai Inner Valley'}</span>
                  <span className="text-amber-600 dark:text-amber-400">☀️ {isNe ? 'घाम र उच्च ताप' : 'High Temp (32°C)'}</span>
                </div>
                <p className="text-[11px] text-[#746F68] dark:text-[#A6A096]">
                  {isNe
                    ? 'टनेल खेतीमा दिउँसो प्लास्टिक उठाउनुहोस्। बोट ओइलाउन नदिन बिहान ६ बजे थोपा सिँचाइ दिनुहोस्।'
                    : 'Open tunnel vents from 11 AM - 3 PM. Irrigate early at 6 AM to prevent thermal shock.'}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Audio Broadcast / Voice Read-Aloud Simulator for Busy Farmers */}
          <div className="app-card p-4 sm:p-5 border border-[#E8E2D8] dark:border-[#383530] bg-[#FAF7F2] dark:bg-[#262421] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#2E7D5A] text-white flex items-center justify-center">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-editorial-serif font-bold text-xs sm:text-sm text-[#1F1E1B] dark:text-[#F5F3EF]">
                    {isNe ? 'दैनिक कृषि रेडियो बुलेटिन' : 'Daily Field Radio Bulletin'}
                  </h4>
                  <span className="text-[10px] text-[#746F68] dark:text-[#A6A096]">
                    {isNe ? 'नेपाली अडियो ब्रोडकास्ट (२ मिनेट)' : 'Nepali Audio Summary (2 mins)'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  isPlayingAudio
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-[#2E7D5A] text-white hover:bg-[#25684A]'
                }`}
              >
                {isPlayingAudio ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>{isNe ? 'रोक्नुहोस्' : 'Stop'}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isNe ? 'सुन्नुहोस्' : 'Play Audio'}</span>
                  </>
                )}
              </button>
            </div>

            {isPlayingAudio && (
              <div className="p-3 rounded-lg bg-white dark:bg-[#1E1D1B] border border-[#E8E2D8] dark:border-[#383530] space-y-2 text-xs animate-fade-in">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#2E7D5A] dark:text-[#4ADE80]">
                  <span>{isNe ? '▶ प्रसारण हुँदैछ: आजका मुख्य कृषि समाचार...' : '▶ Playing: Nepal Agri Morning Headlines...'}</span>
                  <span>01:14 / 02:30</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#2E7D5A] dark:bg-[#4ADE80] h-full w-[48%] animate-pulse" />
                </div>
                <p className="text-[11px] text-[#746F68] dark:text-[#A6A096] italic">
                  {isNe
                    ? '“नमस्ते किसान दाजुभाइ तथा दिदीबहिनीहरू! आज कालीमाटी बजारमा गोलभेडाको दर स्थिर छ र संघीय मल अनुदानको कोटा जारी भएको छ...”'
                    : '“Greetings farmers! Today’s Kalimati vegetable rates remain firm, and the government has released updated fertilizer quotas...”'}
                </p>
              </div>
            )}
          </div>

          {/* 3. Verified Official Agri Channels Directory */}
          <div className="app-card p-4 sm:p-5 border border-[#E8E2D8] dark:border-[#383530] bg-white dark:bg-[#22201D] shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E8E2D8] dark:border-[#383530]">
              <ShieldCheck className="w-4 h-4 text-[#2E7D5A] dark:text-[#4ADE80]" />
              <span className="font-editorial-serif font-bold text-sm text-[#1F1E1B] dark:text-[#F5F3EF]">
                {isNe ? 'आधिकारिक सरकारी स्रोतहरू' : 'Official Government Portals'}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { nameEn: 'MoALD Official Portal', nameNe: 'कृषि तथा पशुपन्छी मन्त्रालय', url: 'https://moald.gov.np', desc: 'Policies & Grants' },
                { nameEn: 'NARC Crop Science', nameNe: 'नेपाल कृषि अनुसन्धान परिषद', url: 'https://narc.gov.np', desc: 'Seed & Pest Trials' },
                { nameEn: 'Kalimati Mandi Board', nameNe: 'कालीमाटी बजार विकास समिति', url: 'https://kalimatimarket.gov.np', desc: 'Wholesale Price Index' },
                { nameEn: 'DHM Agro Meteorology', nameNe: 'जल तथा मौसम विज्ञान विभाग', url: 'https://dhm.gov.np', desc: 'Rain & Frost Advisory' },
              ].map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-[#FAF7F2] dark:bg-[#262421] hover:bg-[#F0EAE0] dark:hover:bg-[#2F2C27] border border-[#E8E2D8] dark:border-[#383530] flex items-center justify-between transition group"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-[#1F1E1B] dark:text-[#F5F3EF] group-hover:text-[#2E7D5A] dark:group-hover:text-[#4ADE80]">
                      {isNe ? link.nameNe : link.nameEn}
                    </div>
                    <div className="text-[10px] text-[#746F68] dark:text-[#A6A096]">{link.desc}</div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[#746F68] dark:text-[#A6A096] group-hover:text-[#1F1E1B] dark:group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Article Detail Modal */}
      {activeArticle && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={() => setActiveArticle(null)}
        >
          <div
            className="app-card bg-white dark:bg-[#22201D] border border-[#E8E2D8] dark:border-[#383530] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-7 space-y-5 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#E8E2D8] dark:border-[#383530]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="tag-pastel-blue">
                    {isNe ? activeArticle.categoryLabelNe : activeArticle.categoryLabelEn}
                  </span>
                  <span className="text-xs text-[#746F68] dark:text-[#A6A096]">
                    {isNe ? activeArticle.publishedAtNe : activeArticle.publishedAt}
                  </span>
                </div>
                <div className="text-xs font-bold text-[#2E7D5A] dark:text-[#4ADE80] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{isNe ? activeArticle.sourceNe : activeArticle.source}</span>
                  {activeArticle.verifiedOfficial && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="p-2 rounded-lg bg-[#FAF7F2] dark:bg-[#262421] text-[#746F68] hover:text-[#1F1E1B] dark:hover:text-[#F5F3EF] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Image */}
            <div className="relative h-56 rounded-xl overflow-hidden bg-slate-900">
              <img
                src={activeArticle.imageUrl}
                alt={activeArticle.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Modal Title */}
            <h2 className="font-editorial-serif text-lg sm:text-xl font-bold text-[#1F1E1B] dark:text-[#F5F3EF] leading-snug">
              {isNe ? activeArticle.titleNe : activeArticle.title}
            </h2>

            {/* Farmer Action Card */}
            <div className="bg-[#EAF3EE] dark:bg-[#1E3327] border-l-4 border-[#2E7D5A] dark:border-[#4ADE80] p-4 rounded-r-xl space-y-1">
              <div className="text-xs font-bold text-[#1E5E41] dark:text-[#4ADE80] uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                <span>{isNe ? 'किसानले तुरुन्त चाल्नुपर्ने कदम' : 'Actionable Guidance For Your Farm'}</span>
              </div>
              <p className="text-xs sm:text-sm text-[#1F1E1B] dark:text-[#F5F3EF] font-medium leading-relaxed">
                {isNe ? activeArticle.farmerActionNe : activeArticle.farmerActionEn}
              </p>
            </div>

            {/* Key Takeaways */}
            <div className="space-y-2">
              <h4 className="font-editorial-serif font-bold text-sm text-[#1F1E1B] dark:text-[#F5F3EF]">
                {isNe ? 'मुख्य बुँदाहरू (Key Takeaways)' : 'Key Takeaways for Farmers'}
              </h4>
              <ul className="space-y-1.5 text-xs text-[#1F1E1B] dark:text-[#F5F3EF]">
                {(isNe ? activeArticle.keyTakeawaysNe : activeArticle.keyTakeawaysEn).map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-[#FAF7F2] dark:bg-[#262421] p-2.5 rounded-lg border border-[#E8E2D8] dark:border-[#383530]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D5A] dark:text-[#4ADE80] shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Full Story Paragraphs */}
            <div className="space-y-3 text-xs sm:text-sm text-[#1F1E1B] dark:text-[#F5F3EF] leading-relaxed">
              <h4 className="font-editorial-serif font-bold text-sm text-[#1F1E1B] dark:text-[#F5F3EF]">
                {isNe ? 'विस्तृत विवरण' : 'Detailed Report'}
              </h4>
              {(isNe ? activeArticle.contentNe : activeArticle.contentEn).map((paragraph, idx) => (
                <p key={idx} className="text-[#5A554E] dark:text-[#C5BFB5]">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Impacted Crops and Source Link */}
            <div className="pt-4 border-t border-[#E8E2D8] dark:border-[#383530] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-[#746F68] dark:text-[#A6A096]">{isNe ? 'सम्बन्धित बाली:' : 'Impacted Crops:'}</span>
                {activeArticle.impactedCrops.map((crop) => (
                  <span
                    key={crop}
                    className="px-2 py-0.5 rounded-md bg-[#FAF7F2] dark:bg-[#262421] font-bold text-[#1F1E1B] dark:text-[#F5F3EF] border border-[#E8E2D8] dark:border-[#383530] capitalize"
                  >
                    {crop}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleBookmark(activeArticle.id)}
                  className="px-3 py-1.5 rounded-lg border border-[#E8E2D8] dark:border-[#383530] font-bold flex items-center gap-1.5 text-[#1F1E1B] dark:text-[#F5F3EF] hover:bg-[#FAF7F2] dark:hover:bg-[#262421] cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{bookmarkedIds.includes(activeArticle.id) ? (isNe ? 'संग्रहीत' : 'Saved') : (isNe ? 'संग्रह गर्नुहोस्' : 'Save')}</span>
                </button>

                {activeArticle.sourceUrl && (
                  <a
                    href={activeArticle.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-[#2E7D5A] text-white font-bold flex items-center gap-1.5 hover:bg-[#25684A] cursor-pointer"
                  >
                    <span>{isNe ? 'आधिकारिक स्रोत' : 'Official Portal'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
