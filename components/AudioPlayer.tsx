// components/AudioPlayer.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Article, Language } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';

interface AudioPlayerProps {
  articles: Article[];
  currentArticleId: string | null;
  isPlaying: boolean;
  date?: string;
  onPlay: (articleId: string) => void;
  onStop: () => void;
}

export default function AudioPlayer({
  articles,
  currentArticleId,
  isPlaying,
  date,
  onPlay,
  onStop,
}: AudioPlayerProps) {
  const { language, t } = useLanguage();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentArticle = articles.find((a) => a.id === currentArticleId);
  const currentIndex = articles.findIndex((a) => a.id === currentArticleId);

  const getAudioApiUrl = useCallback((articleId: string, lang: Language) => {
    const audioDate = date || new Date().toISOString().split('T')[0];
    return `/api/audio?date=${audioDate}&articleId=${articleId}&lang=${lang}`;
  }, [date]);

  useEffect(() => {
    if (currentArticleId && isPlaying && audioRef.current) {
      setIsLoading(true);
      setError(null);
      const url = getAudioApiUrl(currentArticleId, language);
      audioRef.current.src = url;
      audioRef.current.play()
        .then(() => setIsLoading(false))
        .catch((err) => {
          setError('Failed to play audio');
          setIsLoading(false);
        });
    }
  }, [currentArticleId, isPlaying, language, getAudioApiUrl]);

  const handleEnded = useCallback(() => {
    // Play next article if available
    if (currentIndex < articles.length - 1) {
      onPlay(articles[currentIndex + 1].id);
    } else {
      onStop();
    }
  }, [currentIndex, articles, onPlay, onStop]);

  if (!isPlaying || !currentArticle) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg">
      <div className="max-w-3xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onStop}
            className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <rect x="5" y="4" width="10" height="12" rx="1" />
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {currentArticle.title[language]}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('label.playing')} · {currentIndex + 1} {t('label.article')} {articles.length}
            </p>
          </div>

          {isLoading && (
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          )}

          {error && (
            <span className="text-xs text-red-500">{error}</span>
          )}
        </div>
      </div>

      <audio
        ref={audioRef}
        onEnded={handleEnded}
        onError={() => setError('Audio playback error')}
      />
    </div>
  );
}
