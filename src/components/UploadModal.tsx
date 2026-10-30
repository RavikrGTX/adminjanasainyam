'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, FileCheck, AlertCircle, Loader2, Layers } from 'lucide-react';
import { formatBytes, formatShortTeluguDate, formatEnglishDate } from '@/lib/dateUtils';
import { getPdfMetadata } from '@/lib/pdfClient';
import { useLang } from '@/contexts/LanguageContext';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export function UploadModal({ isOpen, onClose, onUploadSuccess }: UploadModalProps) {
  const { t, lang } = useLang();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [analyzingPdf, setAnalyzingPdf] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayStr);
  const [region, setRegion] = useState(t('mainEdition'));
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelection = async (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.pdf') && selectedFile.type !== 'application/pdf') {
      setErrorMessage(t('onlyPdf'));
      return;
    }
    setErrorMessage(null);
    setFile(selectedFile);
    const fmtDate = lang === 'te' ? formatShortTeluguDate(date) : formatEnglishDate(date);
    if (!title) setTitle(`జనసైన్యం దినపత్రిక - ${fmtDate}`);

    setAnalyzingPdf(true);
    try {
      const meta = await getPdfMetadata(selectedFile);
      setPageCount(meta.pageCount);
      if (meta.thumbnailUrl) setThumbnailPreview(meta.thumbnailUrl);
    } catch (err) {
      console.warn('PDF analysis:', err);
    } finally {
      setAnalyzingPdf(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileSelection(e.dataTransfer.files[0]);
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    const fmtDate = lang === 'te' ? formatShortTeluguDate(newDate) : formatEnglishDate(newDate);
    setTitle(`జనసైన్యం దినపత్రిక - ${fmtDate}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setErrorMessage(t('fileRequired')); return; }
    setIsUploading(true);
    setErrorMessage(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('date', date);
      formData.append('region', region);
      if (pageCount) formData.append('pageCount', pageCount.toString());
      const res = await fetch('/api/editions/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setFile(null);
      setThumbnailPreview(null);
      setPageCount(null);
      setTitle('');
      onUploadSuccess();
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[#0f2b5c] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Upload className="w-5 h-5 text-blue-200" />
            <div>
              <h2 className="text-lg font-bold">{t('uploadTitle')}</h2>
              <p className="text-xs text-blue-200">{t('uploadDesc')}</p>
            </div>
          </div>
          <button onClick={onClose} disabled={isUploading} className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* File Drop Zone */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              {t('selectFile')} <span className="text-red-500">*</span>
            </label>
            {!file ? (
              <div
                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragActive ? 'border-[#c9182b] bg-red-50' : 'border-slate-300 hover:border-[#0f2b5c] hover:bg-slate-50'
                }`}
              >
                <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) handleFileSelection(e.target.files[0]); }}
                />
                <Upload className="w-10 h-10 mx-auto text-slate-400 mb-3" />
                <p className="text-sm font-semibold text-slate-700">{t('dragDrop')}</p>
                <p className="text-xs text-slate-400 mt-1">{t('orClick')} • {t('pdfOnly')}</p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                {thumbnailPreview ? (
                  <div className="w-20 h-28 rounded-lg overflow-hidden border border-slate-300 bg-white shadow-sm shrink-0">
                    <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-20 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-[#c9182b] shrink-0">
                    <FileCheck className="w-8 h-8" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{file.name}</h4>
                    <button type="button" onClick={() => { setFile(null); setThumbnailPreview(null); setPageCount(null); }}
                      className="text-xs text-rose-600 hover:underline ml-2">{t('change')}</button>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-600">
                    <span className="bg-white px-2 py-1 rounded border border-slate-200">{t('size')}: <strong>{formatBytes(file.size)}</strong></span>
                    <span className="bg-white px-2 py-1 rounded border border-slate-200 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      {analyzingPdf ? (
                        <span className="flex items-center gap-1 text-slate-400"><Loader2 className="w-3 h-3 animate-spin" /> {t('analyzing')}</span>
                      ) : (
                        <span>{t('pages')}: <strong>{pageCount || '—'}</strong></span>
                      )}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-600 mt-2 font-medium flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5" /> {t('fileLoaded')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                {t('editionTitle')} <span className="text-red-500">*</span>
              </label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="జనసైన్యం దినపత్రిక - 30 అక్టోబర్ 2026"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2b5c] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                {t('pubDate')} <span className="text-red-500">*</span>
              </label>
              <input type="date" required value={date} onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2b5c] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{t('region')}</label>
              <select value={region} onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2b5c] focus:border-transparent bg-white"
              >
                <option value={t('mainEdition')}>{t('mainEdition')}</option>
                <option value={t('hydEdition')}>{t('hydEdition')}</option>
                <option value={t('vijEdition')}>{t('vijEdition')}</option>
                <option value={t('vizagEdition')}>{t('vizagEdition')}</option>
                <option value={t('specialEdition')}>{t('specialEdition')}</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} disabled={isUploading}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
            >{t('cancel')}</button>
            <button type="submit" disabled={isUploading || !file}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#c9182b] hover:bg-[#a51322] text-white transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />{t('uploading')}</>
              ) : (
                <><Upload className="w-4 h-4" />{t('publish')}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
