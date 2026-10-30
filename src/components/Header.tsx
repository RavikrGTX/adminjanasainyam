'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, RefreshCw, Shield, Calendar } from 'lucide-react';
import { SyncStatus, UserSession } from '@/lib/types';
import { formatTeluguDate, formatEnglishDate } from '@/lib/dateUtils';
import { useLang } from '@/contexts/LanguageContext';
import { LanguageToggle } from './LanguageToggle';

interface HeaderProps {
  user: UserSession | null;
  syncStatus: SyncStatus | null;
  onRefreshSync: () => void;
  isSyncing: boolean;
}

export function Header({ user, syncStatus, onRefreshSync, isSyncing }: HeaderProps) {
  const router = useRouter();
  const { t, lang } = useLang();
  const [loggingOut, setLoggingOut] = React.useState(false);
  const today = lang === 'te' ? formatTeluguDate(new Date().toISOString()) : formatEnglishDate(new Date().toISOString());

  const handleLogout = async () => {
    if (!confirm(t('logoutConfirm'))) return;
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0f2b5c] text-white shadow-lg border-b border-[#1b3d7d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Logo & Brand */}
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-28 sm:w-32 rounded-xl overflow-hidden border border-white/20 bg-white shadow-sm shrink-0 flex items-center justify-center p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo.jpg" alt="జనసైన్యం" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide font-serif-telugu">
                  {lang === 'te' ? 'జనసైన్యం' : 'Janasainyam'}
                </h1>
                <span className="bg-[#c9182b] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Admin
                </span>
              </div>
              <p className="text-xs text-blue-200 font-sans-telugu">
                {lang === 'te' ? 'తెలుగు దినపత్రిక • డిజిటల్ ఈ-పేపర్ పోర్టల్' : 'Telugu Daily Newspaper • Digital E-Paper Portal'}
              </p>
            </div>
          </div>

          {/* Center: Live Date & WordPress Status */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 text-xs text-blue-100 border border-white/10">
              <Calendar className="w-3.5 h-3.5 text-blue-300" />
              <span>{today}</span>
            </div>

            <button
              onClick={onRefreshSync}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs transition-colors cursor-pointer"
              title="వర్డ్ప్రెస్ సర్వర్ స్థితిని రీఫ్రెష్ చేయండి"
            >
              <span className="relative flex h-2 w-2">
                {syncStatus?.online ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                )}
              </span>
              <span className="font-semibold text-white">
                {syncStatus?.online ? t('wpOnline') : t('wpOffline')}
              </span>
              {syncStatus?.responseTimeMs && (
                <span className="text-blue-300 text-[10px]">({syncStatus.responseTimeMs}ms)</span>
              )}
              <RefreshCw className={`w-3 h-3 text-blue-300 ml-0.5 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Right: Crystal Clear Language Toggle + User + Logout */}
          <div className="flex items-center gap-3">
            {/* Crystal Clear Segmented Toggle */}
            <LanguageToggle variant="header" />

            {/* User Profile */}
            <div className="hidden sm:flex items-center gap-2 text-right pl-1">
              <div className="p-1.5 rounded-lg bg-white/10 text-blue-200">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">{user?.username || 'admin'}</p>
                <p className="text-[10px] text-blue-200">
                  {lang === 'te' ? 'ప్రధాన సంపాదకుడు' : 'Chief Editor'}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-1.5 bg-[#c9182b] hover:bg-[#a51322] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('logout')}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
