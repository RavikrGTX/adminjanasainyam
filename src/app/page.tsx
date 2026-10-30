'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { StatsCards } from '@/components/StatsCards';
import { EditionsTable } from '@/components/EditionsTable';
import { UploadModal } from '@/components/UploadModal';
import { PdfPreviewModal } from '@/components/PdfPreviewModal';
import { Edition, SyncStatus, UserSession } from '@/lib/types';
import { Loader2, Plus, Sparkles } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';

export default function DashboardPage() {
  const { t, lang } = useLang();
  const [user, setUser] = useState<UserSession | null>(null);
  const [editions, setEditions] = useState<Edition[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewEdition, setPreviewEdition] = useState<Edition | null>(null);

  // Fetch current user
  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.warn('Error fetching user:', err);
    }
  };

  // Fetch WordPress sync ping
  const checkSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync');
      if (res.ok) {
        const data: SyncStatus = await res.json();
        setSyncStatus(data);
      }
    } catch (err) {
      console.warn('Sync ping failed:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Fetch editions
  const loadEditions = useCallback(async () => {
    try {
      const res = await fetch('/api/editions');
      if (res.ok) {
        const data = await res.json();
        setEditions(data.editions || []);
      }
    } catch (err) {
      console.error('Failed to load editions:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchUser(), checkSync(), loadEditions()]);
      setIsLoading(false);
    };
    init();
  }, [checkSync, loadEditions]);

  const handleUploadSuccess = async () => {
    await loadEditions();
    await checkSync();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header with live WordPress ping & Crystal Clear Language Toggle */}
      <Header
        user={user}
        syncStatus={syncStatus}
        onRefreshSync={checkSync}
        isSyncing={isSyncing}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner with Greeting & Quick CTA */}
        <div className="bg-gradient-to-r from-[#0f2b5c] via-[#163875] to-[#0f2b5c] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-blue-200 text-xs font-semibold border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{t('bannerBadge')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight pt-2 font-serif-telugu">
                {t('greeting')}, {user?.username || t('bannerEditorialTeam')}!
              </h2>
              <p className="text-sm text-blue-200 max-w-xl font-sans-telugu">
                {t('bannerDesc')}
              </p>
            </div>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center justify-center gap-2 bg-[#c9182b] hover:bg-[#a51322] text-white px-6 py-3.5 rounded-2xl text-sm font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>{t('uploadNewEdition')}</span>
            </button>
          </div>
        </div>

        {/* Loading Spinner for full page initial fetch */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 text-[#0f2b5c] animate-spin" />
            <p className="text-sm font-sans-telugu">{t('dataLoading')}</p>
          </div>
        ) : (
          <>
            {/* Overview Stats Cards */}
            <StatsCards
              editions={editions}
              onOpenUpload={() => setIsUploadOpen(true)}
              onPreviewLatest={(edition) => setPreviewEdition(edition)}
            />

            {/* Editions Management Table & Grid with Actions */}
            <EditionsTable
              editions={editions}
              onPreview={(edition) => setPreviewEdition(edition)}
              onRefresh={loadEditions}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 bg-white border-t border-slate-200 text-center text-xs text-slate-500 font-sans-telugu">
        <p>{t('footer')}</p>
      </footer>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* In-Modal PDF Reader Preview */}
      <PdfPreviewModal
        edition={previewEdition}
        isOpen={Boolean(previewEdition)}
        onClose={() => setPreviewEdition(null)}
      />
    </div>
  );
}
