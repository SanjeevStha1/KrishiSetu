import React from 'react';

interface AppBackgroundProps {
  children?: React.ReactNode;
}

export const AppBackground: React.FC<AppBackgroundProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full bg-[#FAF7F2] dark:bg-[#181715] text-[#1F1E1B] dark:text-[#F5F3EF] flex flex-col font-editorial-sans selection:bg-[#E85D3F] selection:text-[#FFFFFF] dark:selection:bg-[#FF7B60] dark:selection:text-[#181715] transition-colors duration-150">
      {/* 1. Subtle warm ambient light spot (Earth & Sunset undertones) */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-subtle-warm-mesh opacity-70"
        aria-hidden="true"
      />

      {/* 2. Main Application Content Container */}
      <div className="relative z-10 flex-1 flex flex-col w-full">
        {children}
      </div>
    </div>
  );
};

