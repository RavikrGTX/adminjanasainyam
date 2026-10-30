'use client';

import React from 'react';
import { Edition } from '@/lib/types';
import { formatTeluguDate, formatEnglishDate, formatBytes } from '@/lib/dateUtils';
import { Newspaper, FileText, UploadCloud, ArrowUpRight } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';

interface StatsCardsProps {
  editions: Edition[];
  onOpenUpload: () => void;
  onPreviewLatest?: (edition: Edition) => void;
}

export function StatsCards({ editions, onOpenUpload, onPreviewLatest }: StatsCardsProps) {
  const { t, lang } = useLang();
  const latest = editions.length > 0 ? editions[0] : null;
  const fmtDate = (d: string) => (lang === 'te' ? formatTeluguDate(d) : formatEnglishDate(d));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* 1. Latest Edition */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-[#0f2b5c]">
            <Newspaper className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {t('published')}
          </span>
        </div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          {t('latestEdition')}
        </h3>
        {latest ? (
          <div>
            <p className="font-bold text-slate-900 text-base line-clamp-1">{latest.title}</p>
            <p className="text-xs text-slate-500 mt-1">
              {t('date')}: <span className="font-semibold text-slate-700">{fmtDate(latest.date)}</span>
            </p>
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500">
                {t('size')}: <strong className="text-slate-700">{formatBytes(latest.fileSize)}</strong>
              </span>
              {onPreviewLatest && (
                <button
                  onClick={() => onPreviewLatest(latest)}
                  className="ml-auto inline-flex items-center gap-1 text-[#0f2b5c] font-bold hover:underline text-xs cursor-pointer"
                >
                  {t('view')} <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic py-2">{t('noEditions')}</p>
        )}
      </div>

      {/* 2. Total Editions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center text-[#c9182b]">
            <FileText className="w-5 h-5" />
          </div>
        </div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          {t('totalEditions')}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold text-slate-900">{editions.length}</span>
          <span className="text-xs text-slate-500">{t('editionsPublished')}</span>
        </div>
        <p className="text-xs text-slate-400 mt-4 pt-3 border-t border-slate-100">
          {lang === 'te' ? 'అన్ని డిజిటల్ పిడిఎఫ్ ఎడిషన్స్' : 'All published digital newspaper editions'}
        </p>
      </div>

      {/* 3. Quick Upload */}
      <div className="bg-gradient-to-br from-[#0f2b5c] to-[#091a38] text-white rounded-2xl p-6 shadow-md flex flex-col justify-between">
        <div>
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center mb-4">
            <UploadCloud className="w-5 h-5 text-blue-300" />
          </div>
          <h3 className="text-base font-bold text-white">{t('quickUpload')}</h3>
          <p className="text-xs text-blue-200 mt-1">{t('publishToday')}</p>
        </div>
        <button
          onClick={onOpenUpload}
          className="mt-5 w-full bg-[#c9182b] hover:bg-[#a51322] text-white py-3 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          {t('uploadEdition')}
        </button>
      </div>
    </div>
  );
}
