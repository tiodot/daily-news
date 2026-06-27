// lib/rss.ts
import Parser from 'rss-parser';
import type { RSSSource, Article } from './types';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'AI-Daily-Digest/1.0',
  },
});

export const RSS_SOURCES: RSSSource[] = [
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', language: 'en' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', language: 'en' },
  { name: 'ArsTechnica', url: 'https://feeds.arstechnica.com/arstechnica/index', language: 'en' },
  { name: 'Hacker News', url: 'https://hnrss.org/frontpage?count=20', language: 'en' },
  { name: 'OpenAI Blog', url: 'https://openai.com/blog/rss.xml', language: 'en' },
  { name: '36氪', url: 'https://36kr.com/feed', language: 'zh' },
  { name: '少数派', url: 'https://sspai.com/feed', language: 'zh' },
];

function generateId(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

async function fetchSingleSource(source: RSSSource): Promise<Article[]> {
  try {
    const feed = await parser.parseURL(source.url);
    return (feed.items || []).slice(0, 10).map((item) => ({
      id: generateId(item.link || item.guid || ''),
      title: {
        zh: source.language === 'zh' ? (item.title || '') : '',
        en: source.language === 'en' ? (item.title || '') : '',
      },
      summary: {
        zh: source.language === 'zh' ? (item.contentSnippet?.slice(0, 200) || '') : '',
        en: source.language === 'en' ? (item.contentSnippet?.slice(0, 200) || '') : '',
      },
      source: source.name,
      sourceUrl: item.link || '',
      tags: [],
      coverImage: item.enclosure?.url || undefined,
      publishedAt: item.pubDate || undefined,
    }));
  } catch (error) {
    console.error(`Failed to fetch RSS from ${source.name}:`, error);
    return [];
  }
}

export async function fetchAllRSS(sources: RSSSource[] = RSS_SOURCES): Promise<Article[]> {
  const results = await Promise.allSettled(
    sources.map((source) => fetchSingleSource(source))
  );

  const articles: Article[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      articles.push(...result.value);
    }
  }

  // Deduplicate by sourceUrl
  const seen = new Set<string>();
  return articles.filter((article) => {
    if (!article.sourceUrl || seen.has(article.sourceUrl)) return false;
    seen.add(article.sourceUrl);
    return true;
  });
}
