'use client';

import React, { useState } from 'react';
import { Eye, Download, Copy, Trash2, Search, LayoutGrid, List, Check, AlertCircle, Loader2, FileText } from 'lucide-react';
import { Edition } from '@/lib/types';
import { formatTeluguDate, formatEnglishDate, formatBytes } from '@/lib/dateUtils';
import { useLang } from '@/contexts/LanguageContext';

interface EditionsTableProps {
  editions: Edition[];
  onPreview: (edition: Edition) => void;
  onRefresh: () => void;
}

export function EditionsTable({ editions, onPreview, onRefresh }: EditionsTableProps) {
  const { t, lang } = useLang();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [copiedId, setCopiedId] = useState<string | number | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fmtDate = (d: string) => lang === 'te' ? formatTeluguDate(d) : formatEnglishDate(d);

  const filteredEditions = editions.filter((e) => {
    const q = searchQuery.toLowerCase();
    return e.title.toLowerCase().includes(q) || e.date.includes(q) || (e.region && e.region.toLowerCase().includes(q)) || e.fileName.toLowerCase().includes(q);
  });

  const handleCopyLink = (edition: Edition) => {
    const fullUrl = edition.pdfUrl.startsWith('http') ? edition.pdfUrl : `${window.location.origin}${edition.pdfUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(edition.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (edition: Edition) => {
    if (!confirm(`${t('deleteConfirm')}\n\n"${edition.title}"`)) return;
    setDeletingId(edition.id);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/editions/${edition.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      onRefresh();
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            {t('publishedEditions')}
            <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">{filteredEditions.length}</span>
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0f2b5c] focus:bg-white"
            />
          </div>
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${viewMode === 'table' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${viewMode === 'grid' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {deleteError && (
        <div className="my-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /><span>{deleteError}</span>
        </div>
      )}

      {/* Empty */}
      {filteredEditions.length === 0 && (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-sm font-bold text-slate-700">{t('noResults')}</h3>
          <p className="text-xs text-slate-400 mt-1">{searchQuery ? t('noResultsDesc') : t('noEditionsDesc')}</p>
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && filteredEditions.length > 0 && (
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3">{t('preview')}</th>
                <th className="py-3 px-3">{t('title')}</th>
                <th className="py-3 px-3">{t('pubDateCol')}</th>
                <th className="py-3 px-3">{t('sizeCol')}</th>
                <th className="py-3 px-3 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredEditions.map((edition) => (
                <tr key={edition.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="py-3 px-3 w-20">
                    <div onClick={() => onPreview(edition)}
                      className="w-14 h-18 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden cursor-pointer relative hover:border-[#0f2b5c] transition-all">
                      {edition.thumbnailUrl ? (
                        <img src={edition.thumbnailUrl} alt={edition.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-50 text-[#0f2b5c] p-2">
                          <FileText className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 max-w-xs">
                    <p onClick={() => onPreview(edition)} className="font-bold text-slate-900 group-hover:text-[#0f2b5c] cursor-pointer line-clamp-1">{edition.title}</p>
                    <span className="text-[11px] text-slate-500">{edition.fileName}</span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <p className="font-semibold text-slate-800 text-xs">{fmtDate(edition.date)}</p>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap text-xs text-slate-600">
                    <span className="font-semibold">{formatBytes(edition.fileSize)}</span>
                    {edition.pageCount && <span className="block text-[11px] text-slate-400">{edition.pageCount} {t('pages')}</span>}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => onPreview(edition)} className="p-2 text-slate-500 hover:text-[#0f2b5c] hover:bg-blue-50 rounded-lg transition-colors" title={t('preview')}>
                        <Eye className="w-4 h-4" />
                      </button>
                      <a href={edition.pdfUrl} target="_blank" rel="noopener noreferrer" download={edition.fileName}
                        className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors" title={t('download')}>
                        <Download className="w-4 h-4" />
                      </a>
                      <button onClick={() => handleCopyLink(edition)} className="p-2 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors" title={t('copyLink')}>
                        {copiedId === edition.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleDelete(edition)} disabled={deletingId === edition.id}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50" title={t('deleteEdition')}>
                        {deletingId === edition.id ? <Loader2 className="w-4 h-4 animate-spin text-rose-600" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === 'grid' && filteredEditions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {filteredEditions.map((edition) => (
            <div key={edition.id} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex flex-col group hover:shadow-md hover:border-[#0f2b5c] transition-all">
              <div onClick={() => onPreview(edition)} className="relative aspect-[3/4] bg-slate-200 cursor-pointer overflow-hidden">
                {edition.thumbnailUrl ? (
                  <img src={edition.thumbnailUrl} alt={edition.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 text-[#0f2b5c]">
                    <FileText className="w-10 h-10 mb-2" /><span className="text-xs font-bold uppercase">PDF</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="flex items-center gap-1 bg-[#c9182b] text-white text-xs font-bold px-3 py-1.5 rounded-lg"><Eye className="w-4 h-4" /> {t('view')}</span>
                </div>
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 onClick={() => onPreview(edition)} className="font-bold text-sm text-slate-900 group-hover:text-[#0f2b5c] line-clamp-1 cursor-pointer">{edition.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-1">{fmtDate(edition.date)} • {formatBytes(edition.fileSize)}</p>
                </div>
                <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200 text-xs">
                  <button onClick={() => handleCopyLink(edition)} className="text-slate-600 hover:text-[#0f2b5c]">
                    {copiedId === edition.id ? <span className="text-emerald-600 font-bold">{t('copied')}</span> : <span className="flex items-center gap-0.5"><Copy className="w-3 h-3" /> {t('copyLink')}</span>}
                  </button>
                  <div className="flex items-center gap-1">
                    <a href={edition.pdfUrl} target="_blank" rel="noopener noreferrer" download={edition.fileName}
                      className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"><Download className="w-3.5 h-3.5" /></a>
                    <button onClick={() => handleDelete(edition)} disabled={deletingId === edition.id}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg disabled:opacity-50">
                      {deletingId === edition.id ? <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
