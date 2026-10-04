import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { Locale, Direction, I18nContextType } from './types';
import { ar } from './locales/ar';
import { en } from './locales/en';

const dictionaries: Record<Locale, any> = { ar, en };

const I18nContext = createContext<I18nContextType | null>(null);

export function detectUserLocale(): Locale {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = window.localStorage.getItem('app_locale');
    if (saved === 'ar' || saved === 'en') return saved;
  }

  if (typeof navigator !== 'undefined') {
    const lang = (navigator.language || (navigator.languages && navigator.languages[0]) || '').toLowerCase();
    if (lang.startsWith('ar')) return 'ar';
    if (lang.startsWith('en')) return 'en';
  }

  return 'ar';
}

interface I18nProviderProps {
  children: React.ReactNode;
  initialLocale?: Locale;
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (initialLocale) return initialLocale;
    return detectUserLocale();
  });

  const dir: Direction = locale === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('app_locale', locale);
      document.documentElement.lang = locale;
      document.documentElement.dir = dir;
      const title = t('nav.appTitle');
      const brand = t('nav.brandName');
      document.title = `${title} | ${brand}`;
    }
  }, [locale, dir]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
  };

  const toggleLocale = () => {
    setLocaleState((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const t = (key: string, params?: Record<string, string | number>): any => {
    const dict = dictionaries[locale] || dictionaries.ar;
    const parts = key.split('.');
    let cur: any = dict;
    for (const part of parts) {
      if (cur && typeof cur === 'object' && part in cur) {
        cur = cur[part];
      } else {
        // Fallback to Arabic dictionary if key not found in current locale
        let fallback: any = dictionaries.ar;
        for (const fPart of parts) {
          if (fallback && typeof fallback === 'object' && fPart in fallback) {
            fallback = fallback[fPart];
          } else {
            return key;
          }
        }
        cur = fallback;
        break;
      }
    }

    if (typeof cur === 'string' && params) {
      return cur.replace(/\{(\w+)\}/g, (_, k) => (k in params ? String(params[k]) : `{${k}}`));
    }

    return cur ?? key;
  };

  const value = useMemo(
    () => ({
      locale,
      dir,
      setLocale,
      toggleLocale,
      t,
    }),
    [locale, dir]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Graceful fallback for components rendered outside provider
    const detected = detectUserLocale();
    const dir: Direction = detected === 'ar' ? 'rtl' : 'ltr';
    const dict = dictionaries[detected];
    const t = (key: string, params?: Record<string, string | number>): any => {
      const parts = key.split('.');
      let cur: any = dict;
      for (const part of parts) {
        if (cur && typeof cur === 'object' && part in cur) cur = cur[part];
        else return key;
      }
      if (typeof cur === 'string' && params) {
        return cur.replace(/\{(\w+)\}/g, (_, k) => (k in params ? String(params[k]) : `{${k}}`));
      }
      return cur ?? key;
    };
    return {
      locale: detected,
      dir,
      setLocale: () => {},
      toggleLocale: () => {},
      t,
    };
  }
  return ctx;
}
