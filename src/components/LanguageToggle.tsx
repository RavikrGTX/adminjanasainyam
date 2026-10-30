'use client';

import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  className?: string;
  variant?: 'header' | 'light';
}

export function LanguageToggle({ className = '', variant = 'header' }: LanguageToggleProps) {
  const { lang, setLang } = useLang();

  const isHeader = variant === 'header';

  return (
    <div
      className={`inline-flex items-center p-1 rounded-full border transition-all select-none ${
        isHeader
          ? 'bg-slate-900/60 border-white/20 backdrop-blur-md shadow-inner'
          : 'bg-slate-100 border-slate-200 shadow-inner'
      } ${className}`}
      role="group"
      aria-label="Language selection toggle"
    >
      <div className="flex items-center pl-2 pr-1 text-slate-400">
        <Globe className="w-3.5 h-3.5" />
      </div>

      {/* Telugu Option Button */}
      <button
        type="button"
        onClick={() => setLang('te')}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
          lang === 'te'
            ? 'bg-white text-[#0f2b5c] shadow-md scale-100 ring-1 ring-black/5 font-serif-telugu'
            : isHeader
            ? 'text-blue-100 hover:text-white hover:bg-white/10'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
        }`}
      >
        <span>తెలుగు</span>
      </button>

      {/* English Option Button */}
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
          lang === 'en'
            ? 'bg-white text-[#0f2b5c] shadow-md scale-100 ring-1 ring-black/5'
            : isHeader
            ? 'text-blue-100 hover:text-white hover:bg-white/10'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
        }`}
      >
        <span>English</span>
      </button>
    </div>
  );
}

