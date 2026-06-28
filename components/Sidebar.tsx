// components/Sidebar.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/i18n';

interface SidebarProps {
  isOpen: boolean;
  dates: string[];
  currentDate?: string;
  onClose: () => void;
  onSelect: (date: string) => void;
}

export default function Sidebar({ isOpen, dates, currentDate, onClose, onSelect }: SidebarProps) {
  const { t } = useLanguage();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative w-64 h-full bg-white dark:bg-gray-900 shadow-xl flex flex-col animate-slide-in"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">{t('label.selectDate')}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {dates.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{t('label.noHistory')}</p>
          ) : (
            dates.map((date) => (
              <button
                key={date}
                onClick={() => onSelect(date)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  date === currentDate
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium border-r-2 border-blue-500'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                📅 {date}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
