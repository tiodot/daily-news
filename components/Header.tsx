// components/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { format } from 'date-fns';

interface HeaderProps {
  date?: string;
}

export default function Header({ date }: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = stored ? stored === 'dark' : prefersDark;
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const displayDate = date || format(new Date(), 'yyyy-MM-dd');

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('site.title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {displayDate}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDark}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          <button
            onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {language === 'zh' ? 'EN' : '中'}
          </button>
        </div>
      </div>
    </header>
  );
}
