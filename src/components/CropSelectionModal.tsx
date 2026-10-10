import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Check, RotateCcw, AlertCircle } from 'lucide-react';
import { Commodity } from '../types/krishi';
import { COMMODITY_SEEDS } from '../data/agriData';
import { CropIllustration } from './CropIllustration';
import { useLanguage } from '../context/LanguageContext';

interface CropSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableCropIds: string[];
  onSave: (selectedCropIds: string[]) => void;
  commodities: Commodity[];
}

export const CropSelectionModal: React.FC<CropSelectionModalProps> = ({
  isOpen,
  onClose,
  availableCropIds,
  onSave,
  commodities,
}) => {
  const { t, language } = useLanguage();
  const isNe = language === 'ne';

  // Draft selection state inside modal
  const [draftSelectedIds, setDraftSelectedIds] = useState<string[]>(availableCropIds);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'selected' | 'perishable' | 'staple' | 'spices'>('all');

  // Sync draft state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setDraftSelectedIds(availableCropIds);
      setSearchQuery('');
      setActiveCategory('all');
    }
  }, [isOpen, availableCropIds]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Combine live commodities with seed crops to guarantee comprehensive coverage
  const allAvailableCrops = useMemo(() => {
    const map = new Map<string, {
      id: string;
      name: string;
      nepaliName: string;
      category: 'perishable' | 'staple' | 'spices' | 'exotic';
      currentPrice: number;
    }>();

    // Add from commodities first (contains live market data)
    commodities.forEach((c) => {
      map.set(c.id, {
        id: c.id,
        name: c.name,
        nepaliName: c.nepaliName,
        category: c.category || 'perishable',
        currentPrice: Math.round(c.currentPrice || 40),
      });
    });

    // Backfill any missing from COMMODITY_SEEDS
    COMMODITY_SEEDS.forEach((seed) => {
      if (!map.has(seed.id)) {
        map.set(seed.id, {
          id: seed.id,
          name: seed.name,
          nepaliName: seed.nepaliName,
          category: seed.category,
          currentPrice: Math.round(seed.basePrice || 40),
        });
      }
    });

    return Array.from(map.values());
  }, [commodities]);

  // Filter crops based on search query and category
  const filteredCrops = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return allAvailableCrops.filter((crop) => {
      // Category filter
      if (activeCategory === 'selected') {
        if (!draftSelectedIds.includes(crop.id)) return false;
      } else if (activeCategory !== 'all') {
        if (crop.category !== activeCategory) return false;
      }

      // Search query filter
      if (!q) return true;

      const nameMatch = crop.name.toLowerCase().includes(q);
      const nepaliMatch = crop.nepaliName ? crop.nepaliName.toLowerCase().includes(q) : false;
      const idMatch = crop.id.toLowerCase().includes(q);

      return nameMatch || nepaliMatch || idMatch;
    });
  }, [allAvailableCrops, searchQuery, activeCategory, draftSelectedIds]);

  // Toggle single crop in draft selection
  const handleToggle = (cropId: string) => {
    setDraftSelectedIds((prev) => {
      if (prev.includes(cropId)) {
        // Prevent deselecting everything: keep at least 1 crop selected
        if (prev.length <= 1) {
          return prev;
        }
        return prev.filter((id) => id !== cropId);
      } else {
        return [...prev, cropId];
      }
    });
  };

  // Reset to standard defaults
  const handleResetDefaults = () => {
    setDraftSelectedIds(['tomato', 'potato', 'cauliflower', 'cabbage', 'onion', 'capsicum']);
  };

  // Save and close
  const handleSave = () => {
    if (draftSelectedIds.length > 0) {
      onSave(draftSelectedIds);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="crop-selection-modal-backdrop"
      className="fixed inset-0 z-50 bg-[#111111]/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="crop-selection-modal-container"
        className="bg-[#FFFFFF] dark:bg-[#1E1E1E] rounded-2xl max-w-2xl w-full border border-[#EAEAEA] dark:border-[#2E2E2E] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#EAEAEA] dark:border-[#2E2E2E] flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#111111] dark:text-[#F0F0EE] tracking-tight">
              {isNe ? 'तपाईंका बालीहरू छान्नुहोस्' : 'Select Your Crops'}
            </h2>
            <p className="text-xs sm:text-sm text-[#555555] dark:text-[#AAAAAA] mt-0.5">
              {isNe
                ? 'तपाईंले उत्पादन गर्ने बाली छान्नुहोस् — बजार भाउ र बिक्री सल्लाह यसै अनुसार आउनेछ।'
                : 'Select the crops you grow. Price forecasts, alerts, and freight pools will adapt to your selection.'}
            </p>
          </div>
          <button
            type="button"
            id="crop-modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-[#787774] dark:text-[#9B9A97] hover:text-[#111111] dark:hover:text-[#F0F0EE] hover:bg-[#F0F0EE] dark:hover:bg-[#2A2A2A] rounded-lg transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="p-4 sm:p-5 pb-3 border-b border-[#EAEAEA] dark:border-[#2E2E2E] space-y-3 bg-[#FBFBFA] dark:bg-[#232323]">
          {/* Search Input Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#787774] dark:text-[#9B9A97] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              id="crop-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isNe ? 'बालीको नाम खोज्नुहोस् (उदा: गोलभेडा, आलु, काउली, सिमी)...' : 'Search crops by name (e.g. Tomato, Potato, Ginger)...'}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-[#D5D5D0] dark:border-[#3E3E3E] bg-[#FFFFFF] dark:bg-[#1A1A1A] text-sm text-[#111111] dark:text-[#F0F0EE] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#111111] dark:focus:ring-[#F0F0EE] focus:border-transparent transition"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#787774] hover:text-[#111111] dark:hover:text-[#F0F0EE] p-1 rounded cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Pills and Selection Summary */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none pt-0.5">
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeCategory === 'all'
                    ? 'bg-[#111111] text-white dark:bg-[#F0F0EE] dark:text-[#111111]'
                    : 'bg-[#FFFFFF] dark:bg-[#1E1E1E] text-[#555555] dark:text-[#AAAAAA] border border-[#EAEAEA] dark:border-[#2E2E2E] hover:text-[#111111]'
                }`}
              >
                {isNe ? 'सबै' : 'All'} ({allAvailableCrops.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('selected')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  activeCategory === 'selected'
                    ? 'bg-[#111111] text-white dark:bg-[#F0F0EE] dark:text-[#111111]'
                    : 'bg-[#FFFFFF] dark:bg-[#1E1E1E] text-[#555555] dark:text-[#AAAAAA] border border-[#EAEAEA] dark:border-[#2E2E2E] hover:text-[#111111]'
                }`}
              >
                <Check className="w-3 h-3" />
                <span>{isNe ? 'छानिएका' : 'Selected'} ({draftSelectedIds.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('perishable')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeCategory === 'perishable'
                    ? 'bg-[#111111] text-white dark:bg-[#F0F0EE] dark:text-[#111111]'
                    : 'bg-[#FFFFFF] dark:bg-[#1E1E1E] text-[#555555] dark:text-[#AAAAAA] border border-[#EAEAEA] dark:border-[#2E2E2E] hover:text-[#111111]'
                }`}
              >
                {isNe ? 'तरकारी' : 'Vegetables'}
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('staple')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeCategory === 'staple'
                    ? 'bg-[#111111] text-white dark:bg-[#F0F0EE] dark:text-[#111111]'
                    : 'bg-[#FFFFFF] dark:bg-[#1E1E1E] text-[#555555] dark:text-[#AAAAAA] border border-[#EAEAEA] dark:border-[#2E2E2E] hover:text-[#111111]'
                }`}
              >
                {isNe ? 'खाद्यान्न / कन्दमूल' : 'Staples'}
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('spices')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeCategory === 'spices'
                    ? 'bg-[#111111] text-white dark:bg-[#F0F0EE] dark:text-[#111111]'
                    : 'bg-[#FFFFFF] dark:bg-[#1E1E1E] text-[#555555] dark:text-[#AAAAAA] border border-[#EAEAEA] dark:border-[#2E2E2E] hover:text-[#111111]'
                }`}
              >
                {isNe ? 'मसला' : 'Spices'}
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-xs font-semibold text-[#555555] dark:text-[#AAAAAA] hover:text-[#111111] dark:hover:text-[#F0F0EE] flex items-center gap-1 cursor-pointer shrink-0 ml-auto"
              title="Reset to recommended default crops"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isNe ? 'पूर्वनिर्धारित' : 'Reset'}</span>
            </button>
          </div>
        </div>

        {/* Crops Grid Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 min-h-[260px] max-h-[420px]">
          {filteredCrops.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#F0F0EE] dark:bg-[#2A2A2A] flex items-center justify-center text-[#787774] dark:text-[#9B9A97]">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm sm:text-base font-bold text-[#111111] dark:text-[#F0F0EE]">
                  {isNe ? `"${searchQuery}" सँग मिल्ने कुनै बाली भेटिएन` : `No crops found for "${searchQuery}"`}
                </p>
                <p className="text-xs sm:text-sm text-[#555555] dark:text-[#AAAAAA] max-w-sm mx-auto">
                  {isNe
                    ? 'अन्य नाम खोज्नुहोस् वा खोज शब्द हटाएर सबै बाली सूची हेर्नुहोस्।'
                    : 'Check your spelling, try another keyword, or clear the search to view all crops.'}
                </p>
              </div>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 rounded-lg bg-[#111111] text-white dark:bg-[#F0F0EE] dark:text-[#111111] text-xs sm:text-sm font-bold cursor-pointer"
                >
                  {isNe ? 'खोज खाली गर्नुहोस्' : 'Clear search'}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredCrops.map((crop) => {
                const isSelected = draftSelectedIds.includes(crop.id);
                return (
                  <button
                    key={crop.id}
                    type="button"
                    onClick={() => handleToggle(crop.id)}
                    aria-pressed={isSelected}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer min-h-[56px] select-none ${
                      isSelected
                        ? 'bg-[#111111]/5 dark:bg-[#F0F0EE]/10 border-[#111111] dark:border-[#F0F0EE] shadow-xs'
                        : 'bg-[#FFFFFF] dark:bg-[#1A1A1A] border-[#EAEAEA] dark:border-[#2E2E2E] hover:border-[#CCCCCC] dark:hover:border-[#444444]'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate pr-2">
                      <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg bg-[#F5F5F3] dark:bg-[#282828]">
                        <CropIllustration crop={crop.id} cropName={crop.name} size="sm" />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-[#111111] dark:text-[#F0F0EE] truncate">
                            {crop.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#555555] dark:text-[#AAAAAA]">
                          {crop.nepaliName && <span>{crop.nepaliName}</span>}
                          <span>·</span>
                          <span className="font-editorial-mono font-medium">Rs {crop.currentPrice}/kg</span>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#111111] border-[#111111] text-white dark:bg-[#F0F0EE] dark:border-[#F0F0EE] dark:text-[#111111]'
                          : 'border-[#CCCCCC] dark:border-[#4A4A4A] bg-transparent'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer: Action Buttons */}
        <div className="p-4 sm:p-5 border-t border-[#EAEAEA] dark:border-[#2E2E2E] bg-[#FBFBFA] dark:bg-[#232323] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#555555] dark:text-[#AAAAAA] w-full sm:w-auto">
            <span className="font-bold text-[#111111] dark:text-[#F0F0EE]">
              {draftSelectedIds.length} {isNe ? 'बाली छानिएका छन्' : 'crops selected'}
            </span>
            {draftSelectedIds.length === 1 && (
              <span className="text-amber-600 dark:text-amber-400 text-xs flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {isNe ? 'कम्तीमा १ बाली आवश्यक' : 'Min 1 required'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-[#D5D5D0] dark:border-[#3E3E3E] bg-[#FFFFFF] dark:bg-[#1E1E1E] text-sm font-bold text-[#444444] dark:text-[#CCCCCC] hover:text-[#111111] dark:hover:text-[#F0F0EE] transition cursor-pointer"
            >
              {isNe ? 'रद्द गर्नुहोस्' : 'Cancel'}
            </button>

            <button
              type="button"
              id="crop-modal-save-btn"
              onClick={handleSave}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#111111] text-white dark:bg-[#F0F0EE] dark:text-[#111111] hover:bg-[#2E2E2E] dark:hover:bg-[#E5E5E2] text-sm font-extrabold tracking-tight transition cursor-pointer shadow-sm"
            >
              {isNe ? `छनौट सुरक्षित गर्नुहोस् (${draftSelectedIds.length})` : `Save ${draftSelectedIds.length} Crops`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
