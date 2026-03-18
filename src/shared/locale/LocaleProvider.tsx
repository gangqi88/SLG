import React, { createContext, useContext, useMemo, useState } from 'react';
import { enUS, type StringKey, zhCN } from './strings';

export type Locale = 'zh-CN' | 'en-US';

type LocaleApi = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: StringKey) => string;
};

const LocaleContext = createContext<LocaleApi | null>(null);

const detectLocale = (): Locale => {
  if (typeof navigator === 'undefined') return 'zh-CN';
  const lang = (navigator.language || '').toLowerCase();
  if (lang.startsWith('zh')) return 'zh-CN';
  return 'en-US';
};

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>(() => detectLocale());

  const dict = useMemo(() => (locale === 'en-US' ? enUS : zhCN), [locale]);

  const api = useMemo<LocaleApi>(
    () => ({
      locale,
      setLocale,
      t: (key) => dict[key] ?? String(key),
    }),
    [dict, locale],
  );

  return <LocaleContext.Provider value={api}>{children}</LocaleContext.Provider>;
};

export const useLocale = () => {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('LocaleContext is not available');
  return ctx;
};
