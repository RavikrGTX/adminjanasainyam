'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, AlertCircle, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';

export default function LoginPage() {
  const router = useRouter();
  const { t, lang } = useLang();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin@janasainyam2026');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('invalidCredentials'));
      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : t('invalidCredentials'));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#0f2b5c] to-slate-900 px-4 py-12 relative overflow-hidden">
      {/* Background Graphic Grid */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Crystal Clear Language Toggle - Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <LanguageToggle variant="header" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Brand Header */}
        <div className="text-center mb-8">
          <div className="w-48 h-20 mx-auto rounded-2xl overflow-hidden border-2 border-white/20 bg-white shadow-2xl mb-4 p-2 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.jpg" alt="Janasainyam" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-extrabold text-white font-serif-telugu tracking-wide">
            {lang === 'te' ? 'జనసైన్యం' : 'Janasainyam'}
          </h1>
          <p className="mt-1 text-xs font-semibold text-rose-400 uppercase tracking-widest">
            {lang === 'te' ? 'తెలుగు దినపత్రిక • డిజిటల్ ఈ-పేపర్' : 'Telugu Daily Newspaper • Digital E-Paper'}
          </p>
          <p className="mt-2 text-sm text-blue-200">
            {t('loginHeading')}
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 sm:px-10">
          <form className="space-y-5" onSubmit={handleLogin}>
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t('username')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2b5c] focus:border-transparent text-slate-900 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t('password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2b5c] focus:border-transparent text-slate-900 bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#c9182b] hover:bg-[#a51322] text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-red-900/20 hover:shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('signingIn')}</span>
                </>
              ) : (
                <>
                  <span>{t('signIn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick credentials hint */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="bg-blue-50/70 rounded-xl p-3 text-xs text-slate-600 border border-blue-100 flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0f2b5c] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">{t('defaultCredentials')}:</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    admin / admin@janasainyam2026
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUsername('admin');
                  setPassword('admin@janasainyam2026');
                }}
                className="text-[11px] font-bold text-[#0f2b5c] hover:underline shrink-0 cursor-pointer"
              >
                {t('autoFill')}
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-blue-300/80 mt-6 font-sans-telugu">
          {t('footer')}
        </p>
      </div>
    </div>
  );
}
