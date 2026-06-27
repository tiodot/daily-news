'use client';

import type { Article } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';

interface ArticleCardProps {
  article: Article;
  index: number;
  isPlaying: boolean;
  onPlay: (articleId: string) => void;
}

export default function ArticleCard({ article, index, isPlaying, onPlay }: ArticleCardProps) {
  const { language, t } = useLanguage();

  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 border border-gray-100 dark:border-gray-700">
      {article.coverImage && (
        <div className="mb-3 overflow-hidden rounded-lg">
          <img
            src={article.coverImage}
            alt={article.title[language]}
            className="w-full h-48 object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {article.title[language]}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3 line-clamp-3">
            {article.summary[language]}
          </p>
        </div>

        <button
          onClick={() => onPlay(article.id)}
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            isPlaying
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900'
          }`}
          aria-label={isPlaying ? t('btn.stop') : `Play ${article.title[language]}`}
        >
          {isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <rect x="6" y="4" width="4" height="12" rx="1" />
              <rect x="10" y="4" width="4" height="12" rx="1" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          )}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
          {article.source}
        </span>
        {article.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
          >
            #{tag}
          </span>
        ))}
      </div>
    </article>
  );
}
