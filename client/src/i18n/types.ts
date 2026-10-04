export type Locale = 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';

export interface I18nContextType {
  locale: Locale;
  dir: Direction;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}
