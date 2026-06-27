// lib/i18n.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Language } from './types';

const translations: Record<string, Record<Language, string>> = {
  'site.title': { zh: 'AI 日报', en: 'AI Daily' },
  'site.subtitle': { zh: '每日精选 AI 技术资讯', en: 'Daily AI Tech News' },
  'btn.playAll': { zh: '播放全部', en: 'Play All' },
  'btn.stop': { zh: '停止', en: 'Stop' },
  'label.source': { zh: '来源', en: 'Source' },
  'label.tags': { zh: '标签', en: 'Tags' },
  'label.noArticles': { zh: '今日暂无文章', en: 'No articles today' },
  'label.loading': { zh: '加载中...', en: 'Loading...' },
  'label.playing': { zh: '正在播放', en: 'Now Playing' },
  'label.article': { zh: '篇', en: 'of' },
  'footer.poweredBy': { zh: '由 AI 驱动', en: 'Powered by AI' },
  'footer.sources': { zh: '数据源', en: 'Sources' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('zh');

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language;
    if (saved === 'zh' || saved === 'en') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
