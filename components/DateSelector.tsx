// components/DateSelector.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/i18n';

interface DateSelectorProps {
  currentDate?: string;
  onSelect: (date: string) => void;
}

export default function DateSelector({ currentDate, onSelect }: DateSelectorProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    fetch('/api/digest/dates')
      .then((res) => res.json())
      .then((data) => {
        if (data.dates) {
          setDates(data.dates);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (date: string) => {
    onSelect(date);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
      >
        {currentDate || t('label.selectDate')}
        <svg
          className={`inline-block w-3 h-3 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          {loading ? (
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              {t('label.loading')}
            </div>
          ) : dates.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              {t('label.noHistory')}
            </div>
          ) : (
            dates.map((date) => (
              <button
                key={date}
                onClick={() => handleSelect(date)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  date === currentDate
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {date}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
