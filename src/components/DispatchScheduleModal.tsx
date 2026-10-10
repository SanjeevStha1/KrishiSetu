import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Calendar, Clock, ArrowRight, Truck, CheckCircle2 } from 'lucide-react';
import { AppTab } from './Header';
import { useLanguage } from '../context/LanguageContext';

export interface ScheduleDayItem {
  index: number;
  date: Date;
  dayNum: number;
  dayName: string;
  hasAlert: boolean;
  alertCount: number;
  eventTitle: string;
  eventDescription: string;
  eventActionTab: AppTab;
}

interface DispatchScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  days: ScheduleDayItem[];
  onNavigate: (tab: AppTab) => void;
}

export const DispatchScheduleModal: React.FC<DispatchScheduleModalProps> = ({
  isOpen,
  onClose,
  days,
  onNavigate,
}) => {
  const { t } = useLanguage();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  if (!isOpen) return null;

  const activeDay = days[selectedIndex] || days[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans text-[#1E2119] dark:text-[#F4F2EA] animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: 'spring', damping: 25, stiffness: 260 }}
        className="bg-[#FCFAF6] dark:bg-[#1E1D1A] rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-[#E4E0D8] dark:border-[#38362F] shadow-2xl flex flex-col relative transition-colors duration-200"
      >
        {/* Header */}
        <div className="p-5 bg-[#262421] dark:bg-[#151413] text-[#FCFAF6] dark:text-[#F2EFE9] border-b border-[#38362F] sticky top-0 z-20 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EE6C33] text-[#FCFAF6] flex items-center justify-center shadow-md">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                7-Day Harvest & Dispatch Schedule
              </h2>
              <p className="text-xs text-[#D1CCC4] dark:text-[#9B9790]">
                Coordinated pickup windows, wholesale clearings & freight departures
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-[#FCFAF6] flex items-center justify-center transition cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Day selection strip */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {days.map((day) => {
              const isSelected = selectedIndex === day.index;
              return (
                <button
                  key={day.index}
                  type="button"
                  onClick={() => setSelectedIndex(day.index)}
                  className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition cursor-pointer min-w-[54px] shrink-0 border ${
                    isSelected
                      ? 'bg-[#EE6C33] text-[#FCFAF6] border-[#EE6C33] shadow-sm font-bold'
                      : 'bg-[#F7F4EF] dark:bg-[#242320] text-[#1E2119] dark:text-[#F4F2EA] border-[#E4E0D8] dark:border-[#38362F]'
                  }`}
                >
                  <span className="text-sm font-mono font-black">{day.dayNum}</span>
                  <span className={`text-[10px] font-bold ${isSelected ? 'text-white/90' : 'text-[#6B6862] dark:text-[#9B9790]'}`}>
                    {day.dayName}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Day Detail Card */}
          {activeDay && (
            <div className="p-4 rounded-2xl bg-[#F7F4EF] dark:bg-[#242320] border border-[#E4E0D8] dark:border-[#38362F] space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#EE6C33]/15 text-[#EE6C33] flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#262421] dark:text-[#F2EFE9]">
                      {activeDay.eventTitle || `Schedule for ${activeDay.dayName}`}
                    </h3>
                    <span className="text-[11px] text-[#EE6C33] font-semibold">
                      {activeDay.dayName === 'TODAY' ? "Today's Active Window" : `Scheduled for Day ${activeDay.dayNum}`}
                    </span>
                  </div>
                </div>

                {activeDay.hasAlert && (
                  <span className="px-2 py-0.5 rounded-full bg-[#EE6C33] text-white text-[10px] font-black shrink-0">
                    {activeDay.alertCount} Alert{activeDay.alertCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <p className="text-xs text-[#6B6862] dark:text-[#9B9790] leading-relaxed">
                {activeDay.eventDescription}
              </p>

              <div className="pt-2 border-t border-[#E4E0D8] dark:border-[#38362F] flex items-center justify-between">
                <span className="text-[11px] text-[#6B6862] dark:text-[#9B9790]">
                  Connected Terminal: Kalimati Fruit & Vegetable Market
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate(activeDay.eventActionTab || 'sell');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#EE6C33] hover:bg-[#D85A22] text-[#FCFAF6] text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Open Operational View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F7F4EF] dark:bg-[#151413] border-t border-[#E4E0D8] dark:border-[#38362F] rounded-b-3xl flex items-center justify-between text-xs text-[#6B6862] dark:text-[#9B9790]">
          <span className="text-[11px]">Daily 04:00 AM Sync with Kalimati Arrivals</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#262421] dark:bg-[#FCFAF6] text-[#FCFAF6] dark:text-[#1A1917] font-bold text-xs transition cursor-pointer shadow-xs"
          >
            {t('common.close', 'Close')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
