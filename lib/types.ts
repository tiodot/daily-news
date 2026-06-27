// lib/types.ts

export type Language = 'zh' | 'en';

export interface LocalizedText {
  zh: string;
  en: string;
}

export interface Article {
  id: string;
  title: LocalizedText;
  summary: LocalizedText;
  source: string;
  sourceUrl: string;
  tags: string[];
  coverImage?: string;
  publishedAt?: string;
}

export interface DailyDigest {
  date: string; // YYYY-MM-DD
  articles: Article[];
}

export interface RSSSource {
  name: string;
  url: string;
  language: 'zh' | 'en';
}
