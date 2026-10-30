'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Lang, t, TranslationKey } from '@/lib/i18n';

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'te',
  setLang: () => {},
  toggleLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('te');

  // Remember language preference in localStorage if in browser
  useEffect(() => {
    try {
      const saved = localStorage.getItem('janasainyam_lang') as Lang | null;
      if (saved === 'te' || saved === 'en') {
        setLangState(saved);
      }
    } catch {}
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    try {
      localStorage.setItem('janasainyam_lang', newLang);
    } catch {}
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => {
      const next = prev === 'te' ? 'en' : 'te';
      try {
        localStorage.setItem('janasainyam_lang', next);
      } catch {}
      return next;
    });
  }, []);

  const translate = useCallback(
    (key: TranslationKey) => t(key, lang),
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t: translate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
