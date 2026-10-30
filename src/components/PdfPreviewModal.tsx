'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Download,
  Loader2,
  Share2,
  Check,
} from 'lucide-react';
import { Edition } from '@/lib/types';
import { formatTeluguDate, formatEnglishDate } from '@/lib/dateUtils';
import { getPdfJs } from '@/lib/pdfClient';
import { useLang } from '@/contexts/LanguageContext';

interface PdfPreviewModalProps {
  edition: Edition | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PdfPreviewModal({ edition, isOpen, onClose }: PdfPreviewModalProps) {
  const { t, lang } = useLang();
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfDocRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTaskRef = useRef<any>(null);

  const fmtDate = (d: string) =>
    lang === 'te' ? formatTeluguDate(d) : formatEnglishDate(d);

  // Load PDF Document
  useEffect(() => {
    if (!isOpen || !edition) return;

    let isCancelled = false;
    setIsLoading(true);
    setError(null);
    setCurrentPage(1);

    const loadPdf = async () => {
      try {
        const pdfjs = await getPdfJs();
        // Route through proxy to ensure CORS headers
        const proxyUrl = `/api/pdf-proxy?url=${encodeURIComponent(edition.pdfUrl)}`;

        const loadingTask = pdfjs.getDocument({
          url: proxyUrl,
          withCredentials: false,
        });

        const doc = await loadingTask.promise;
        if (isCancelled) return;

        pdfDocRef.current = doc;
        setNumPages(doc.numPages);
        setIsLoading(false);
      } catch (err: unknown) {
        if (isCancelled) return;
        console.error('Failed to load PDF in viewer:', err);
        setError(t('pdfError'));
        setIsLoading(false);
      }
    };

    loadPdf();

    return () => {
      isCancelled = true;
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy?.();
        pdfDocRef.current = null;
      }
    };
  }, [isOpen, edition, t]);

  // Render Page to Canvas
  const renderPage = useCallback(
    async (pageNum: number) => {
      if (!pdfDocRef.current || !canvasRef.current) return;

      try {
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const page = await pdfDocRef.current.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        // Handle high DPI displays
        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

        const renderContext = {
          canvasContext: context,
          transform: transform || undefined,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;
      } catch (err: unknown) {
        if ((err as { name?: string })?.name !== 'RenderingCancelledException') {
          console.warn('Canvas render error:', err);
        }
      }
    },
    [scale]
  );

  useEffect(() => {
    if (!isLoading && pdfDocRef.current && numPages > 0) {
      renderPage(currentPage);
    }
  }, [isLoading, currentPage, scale, numPages, renderPage]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setCurrentPage((prev) => Math.min(prev + 1, numPages || 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, numPages, onClose]);

  if (!isOpen || !edition) return null;

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleCopyLink = () => {
    const fullUrl = edition.pdfUrl.startsWith('http')
      ? edition.pdfUrl
      : `${window.location.origin}${edition.pdfUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-md animate-fade-in text-white"
    >
      {/* Top Reader Bar */}
      <div className="h-16 px-4 bg-[#0f2b5c] border-b border-[#1b3d7d] flex items-center justify-between shadow-lg shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="hidden sm:block">
            <span className="bg-[#c9182b] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white">
              {t('reader')}
            </span>
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold font-serif-telugu truncate text-white">
              {edition.title}
            </h3>
            <p className="text-[11px] text-blue-200 truncate">
              {fmtDate(edition.date)} • {edition.region || (lang === 'te' ? 'ప్రధాన సంచిక' : 'Main Edition')}
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/10">
            <button
              onClick={() => setScale((s) => Math.max(0.6, s - 0.2))}
              className="p-1.5 hover:bg-white/15 rounded text-blue-200 hover:text-white transition-colors cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-semibold px-2 text-white min-w-[45px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale((s) => Math.min(2.5, s + 0.2))}
              className="p-1.5 hover:bg-white/15 rounded text-blue-200 hover:text-white transition-colors cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="hidden sm:flex items-center gap-1 bg-white/10 hover:bg-white/15 text-white px-2.5 py-1.5 rounded-lg text-xs border border-white/10 transition-colors cursor-pointer"
            title="Copy PDF link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{copied ? t('copied') : t('share')}</span>
          </button>

          {/* Direct Download */}
          <a
            href={edition.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={edition.fileName || 'janasainyam-edition.pdf'}
            className="flex items-center gap-1 bg-[#c9182b] hover:bg-[#a51322] text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">{t('download')}</span>
          </a>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-rose-600 rounded-lg transition-colors ml-1 cursor-pointer"
            title={t('close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-4 sm:p-8 bg-slate-900/90 relative">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/60 z-10">
            <Loader2 className="w-8 h-8 text-[#c9182b] animate-spin" />
            <p className="text-sm font-medium text-slate-300 font-sans-telugu">
              {t('loading')}
            </p>
          </div>
        )}

        {error && (
          <div className="my-auto max-w-md p-6 bg-slate-800 rounded-2xl text-center border border-slate-700">
            <p className="text-rose-400 font-medium text-sm mb-4">{error}</p>
            <a
              href={edition.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#c9182b] text-white px-4 py-2 rounded-xl text-xs font-bold"
            >
              <Download className="w-4 h-4" /> {t('openInBrowser')}
            </a>
          </div>
        )}

        <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
          <canvas
            ref={canvasRef}
            className="shadow-2xl rounded-sm border border-slate-700 bg-white mx-auto"
          />
        </div>
      </div>

      {/* Bottom Floating Navigation Bar */}
      {numPages > 0 && (
        <div className="h-14 bg-slate-950/95 border-t border-slate-800 flex items-center justify-center gap-4 px-4 shrink-0">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold text-white transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t('prevPage')}</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
            <span>{t('page')}</span>
            <input
              type="number"
              min={1}
              max={numPages}
              value={currentPage}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (val >= 1 && val <= numPages) {
                  setCurrentPage(val);
                }
              }}
              className="w-12 bg-slate-800 border border-slate-700 text-white text-center py-1 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <span>/ {numPages}</span>
          </div>

          <button
            disabled={currentPage >= numPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, numPages))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold text-white transition-all cursor-pointer"
          >
            <span>{t('nextPage')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
