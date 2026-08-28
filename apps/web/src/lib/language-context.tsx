'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Language,
  translations,
  UnifiedTranslations,
  cropTranslations,
  statusTranslations,
} from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: UnifiedTranslations;
  translateCrop: (cropName: string) => string;
  translateStatus: (status: string) => string;
  formatCurrency: (amount: number) => string;
  formatUnit: (unit?: string) => string;
  formatDateLocalized: (date: string | Date | number) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: translations.en,
  translateCrop: (crop) => crop,
  translateStatus: (status) => status,
  formatCurrency: (amount) => `₹${amount.toLocaleString('en-IN')}`,
  formatUnit: (unit) => unit || 'Quintal',
  formatDateLocalized: (d) => new Date(d).toLocaleDateString(),
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // 1. Check saved localStorage
    const saved = localStorage.getItem('vanijya_unified_language') as Language;
    if (saved && (saved === 'en' || saved === 'hi' || saved === 'te')) {
      setLanguageState(saved);
      document.documentElement.lang = saved;
      return;
    }

    // 2. Check document cookie
    const match = document.cookie.match(/vanijya_lang=(en|hi|te)/);
    if (match && match[1]) {
      const cookieLang = match[1] as Language;
      setLanguageState(cookieLang);
      document.documentElement.lang = cookieLang;
      return;
    }

    // 3. Check browser language
    const navLang = navigator.language?.toLowerCase();
    if (navLang?.startsWith('hi')) {
      setLanguageState('hi');
      document.documentElement.lang = 'hi';
    } else if (navLang?.startsWith('te')) {
      setLanguageState('te');
      document.documentElement.lang = 'te';
    } else {
      document.documentElement.lang = 'en';
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('vanijya_unified_language', lang);
    document.cookie = `vanijya_lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  };

  const translateCrop = (cropName: string): string => {
    if (!cropName) return '';
    const lookup = cropTranslations[cropName];
    if (lookup && lookup[language]) {
      return lookup[language];
    }
    // Case insensitive match
    for (const key in cropTranslations) {
      if (key.toLowerCase() === cropName.toLowerCase()) {
        return cropTranslations[key][language] || cropName;
      }
    }
    return cropName;
  };

  const translateStatus = (status: string): string => {
    if (!status) return '';
    const upper = status.toUpperCase();
    const lookup = statusTranslations[upper];
    if (lookup && lookup[language]) {
      return lookup[language];
    }
    return status;
  };

  const formatCurrency = (amount: number): string => {
    const locale = language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN';
    return `₹${(amount || 0).toLocaleString(locale)}`;
  };

  const formatUnit = (unit?: string): string => {
    const upper = (unit || 'QUINTAL').toUpperCase();
    if (upper.includes('QUINTAL') || upper.includes('QTL')) {
      return language === 'hi' ? 'क्विंटल' : language === 'te' ? 'క్వింటాల్' : 'Quintals';
    }
    if (upper.includes('KG')) {
      return language === 'hi' ? 'किग्रा' : language === 'te' ? 'కిలో' : 'Kg';
    }
    if (upper.includes('TON')) {
      return language === 'hi' ? 'मीट्रिक टन' : language === 'te' ? 'మెట్రిక్ టన్ను' : 'Metric Ton';
    }
    return unit || 'Quintals';
  };

  const formatDateLocalized = (date: string | Date | number): string => {
    if (!date) return '';
    const d = new Date(date);
    const locale = language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN';
    return d.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const value = {
    language,
    setLanguage,
    t: translations[language] || translations.en,
    translateCrop,
    translateStatus,
    formatCurrency,
    formatUnit,
    formatDateLocalized,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
