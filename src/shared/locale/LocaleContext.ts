import { createContext, useContext } from 'react';
import type { StringKey } from './strings';

export type Locale = 'zh-CN' | 'en-US';

export type LocaleApi = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: StringKey) => string;
};

export const LocaleContext = createContext<LocaleApi | null>(null);

export const useLocale = () => {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('LocaleContext is not available');
  return ctx;
};
