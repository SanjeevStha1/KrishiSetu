import React, { useState } from 'react';
import { PitchGuideStep } from '../types/krishi';
import { PITCH_SCRIPT_STEPS } from '../data/agriData';
import { AppTab } from './Header';
import {
  Mic,
  ChevronRight,
  ChevronLeft,
  Clock,
  Quote,
  Sparkles,
  ArrowRight,
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Layers,
} from 'lucide-react';

interface PitchModeGuideProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: AppTab;
  onNavigateTab: (tab: AppTab) => void;
  onOpenTransparency: () => void;
}

export const PitchModeGuide: React.FC<PitchModeGuideProps> = ({
  isOpen,
  onClose,
  currentTab,
  onNavigateTab,
  onOpenTransparency,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  if (!isOpen) return null;

  const currentStep: PitchGuideStep = PITCH_SCRIPT_STEPS[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < PITCH_SCRIPT_STEPS.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      onNavigateTab(PITCH_SCRIPT_STEPS[nextIndex].targetTab);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      onNavigateTab(PITCH_SCRIPT_STEPS[prevIndex].targetTab);
    }
  };

  const handleSelectStep = (idx: number) => {
    setCurrentStepIndex(idx);
    onNavigateTab(PITCH_SCRIPT_STEPS[idx].targetTab);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto text-[#2B2118] shadow-2xl border border-[#EBE4D5] flex flex-col">
        {/* Top Pitch Header */}
        <div className="bg-[#245A3E] text-white p-5 sm:p-6 rounded-t-3xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#E2D8C3] hover:text-white p-2 rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center justify-between gap-3 pr-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-white/15 text-[#82E0AA] flex items-center justify-center">
                <Mic className="w-4 h-4" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-[#82E0AA]">
                5-Minute Pitch & Demo Script (v3)
              </span>
            </div>

            {/* Stopwatch */}
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-xs font-bold">
              <Clock className="w-3.5 h-3.5 text-[#82E0AA]" />
              <span>{formatTime(elapsedSeconds)} / 5:00</span>
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="hover:text-[#82E0AA] p-0.5 cursor-pointer"
                title={isTimerRunning ? 'Pause timer' : 'Start timer'}
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => {
                  setElapsedSeconds(0);
                  setIsTimerRunning(false);
                }}
                className="hover:text-[#E2D8C3] p-0.5 cursor-pointer"
                title="Reset timer"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-3">
            Minute {currentStep.minute}: {currentStep.title}
          </h2>
          <p className="text-xs text-[#E2D8C3] mt-1">
            Target Timing: <strong>{currentStep.timing}</strong> • Visual View: <strong>{currentStep.visualFocus}</strong>
          </p>

          {/* Step Breadcrumb Selector */}
          <div className="flex items-center gap-1.5 mt-4 overflow-x-auto pb-1 no-scrollbar">
            {PITCH_SCRIPT_STEPS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectStep(idx)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                  currentStepIndex === idx
                    ? 'bg-[#F7F4EB] text-[#245A3E] font-black shadow-xs'
                    : 'bg-white/10 text-[#E2D8C3] hover:bg-white/20'
                }`}
              >
                <span>Min {s.minute}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pitch Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Key Quote Box */}
          <div className="bg-[#EBF5EE] border border-[#245A3E]/30 rounded-2xl p-4 text-xs sm:text-sm text-[#2B2118] relative">
            <Quote className="w-6 h-6 text-[#245A3E]/20 absolute top-2 right-3" />
            <span className="text-[10px] font-black uppercase text-[#245A3E] tracking-wider block mb-1">
              Say this out loud:
            </span>
            <p className="font-extrabold text-[#2B2118] italic leading-relaxed">
              {currentStep.keyQuote}
            </p>
          </div>

          {/* Hook */}
          <div className="bg-[#F7F4EB] rounded-2xl p-4 text-xs space-y-1 border border-[#E8DFD0]">
            <span className="text-[10px] font-bold text-[#6E6155] uppercase tracking-wider block">
              The Presentation Hook:
            </span>
            <p className="text-[#2B2118] font-semibold leading-relaxed">
              {currentStep.hook}
            </p>
          </div>

          {/* Talking Points */}
          <div className="space-y-2 text-xs">
            <span className="text-[10px] font-bold text-[#6E6155] uppercase tracking-wider block">
              Core Talking Points to Hit:
            </span>
            <div className="space-y-2">
              {currentStep.talkingPoints.map((pt, i) => (
                <div key={i} className="flex items-start gap-2.5 bg-white border border-[#EBE4D5] p-3 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-[#245A3E] shrink-0 mt-0.5" />
                  <span className="text-[#2B2118] font-medium leading-relaxed">{pt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Jump-to-screen action */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F7F4EB] p-3 rounded-2xl border border-[#E8DFD0] text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#245A3E]" />
              <span>Current Screen on Screen: <strong>{currentStep.targetTab.toUpperCase()}</strong></span>
            </div>
            <button
              onClick={() => {
                onNavigateTab(currentStep.targetTab);
                onClose();
              }}
              className="bg-[#245A3E] hover:bg-[#1C4731] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Switch View & Close Script</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="bg-[#F7F4EB] border-t border-[#EBE4D5] p-4 sm:p-5 flex items-center justify-between rounded-b-3xl gap-3">
          <button
            onClick={onOpenTransparency}
            className="text-xs font-bold text-[#6E6155] hover:text-[#2B2118] underline cursor-pointer"
          >
            What's Live vs. Simulated
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 border border-[#E2D8C3] bg-white transition cursor-pointer ${
                currentStepIndex === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#EFE9DC]'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            {currentStepIndex < PITCH_SCRIPT_STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                className="bg-[#245A3E] hover:bg-[#1C4731] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition shadow-xs cursor-pointer"
              >
                <span>Next Minute</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="bg-[#245A3E] hover:bg-[#1C4731] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Finish Pitch Walkthrough
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
