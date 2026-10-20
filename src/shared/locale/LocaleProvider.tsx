import React, { useMemo, useState } from 'react';
import { enUS, zhCN } from './strings';
import { LocaleContext, type Locale, type LocaleApi } from './LocaleContext';

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
