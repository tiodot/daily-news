'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import type { DailyDigest } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';
import Header from '@/components/Header';
import ArticleCard from '@/components/ArticleCard';
import AudioPlayer from '@/components/AudioPlayer';

export default function HomeContent() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');
  const { t } = useLanguage();

  const [digest, setDigest] = useState<DailyDigest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentArticleId, setCurrentArticleId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    async function fetchDigest() {
      setLoading(true);
      setError(null);

      try {
        const url = dateParam ? `/api/digest?date=${dateParam}` : '/api/digest';
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
          setError(data.error);
        } else {
          setDigest(data);
        }
      } catch (err) {
        setError('Failed to load digest');
      } finally {
        setLoading(false);
      }
    }

    fetchDigest();
  }, [dateParam]);

  const handlePlay = useCallback((articleId: string) => {
    setCurrentArticleId(articleId);
    setIsPlaying(true);
  }, []);

  const handleStop = useCallback(() => {
    setCurrentArticleId(null);
    setIsPlaying(false);
  }, []);

  const handlePlayAll = useCallback(() => {
    if (digest && digest.articles.length > 0) {
      handlePlay(digest.articles[0].id);
    }
  }, [digest, handlePlay]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header date={digest?.date} />

      <main className="max-w-3xl mx-auto px-4 py-6">
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-3 text-gray-500 dark:text-gray-400">{t('label.loading')}</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {digest && !loading && (
          <>
            {digest.articles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">{t('label.noArticles')}</p>
              </div>
            ) : (
              <>
                <div className="flex justify-end mb-4">
                  <button
                    onClick={handlePlayAll}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                    {t('btn.playAll')}
                  </button>
                </div>

                <div className="space-y-4">
                  {digest.articles.map((article, index) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      index={index}
                      isPlaying={isPlaying && currentArticleId === article.id}
                      onPlay={handlePlay}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>

      <footer className="max-w-3xl mx-auto px-4 py-8 border-t border-gray-200 dark:border-gray-800">
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>{t('footer.poweredBy')} · AI Daily Digest</p>
        </div>
      </footer>

      <AudioPlayer
        articles={digest?.articles || []}
        currentArticleId={currentArticleId}
        isPlaying={isPlaying}
        onPlay={handlePlay}
        onStop={handleStop}
      />
    </div>
  );
}
