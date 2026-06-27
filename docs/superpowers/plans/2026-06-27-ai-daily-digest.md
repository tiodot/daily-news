# AI 每日技术日报 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个每日自动聚合 AI 技术新闻的日报网站，支持中英文切换和语音播放。

**Architecture:** Next.js 全栈应用，Vercel Cron 每日定时触发 RSS 抓取 + AI 摘要翻译，数据存储为 JSON 文件，前端卡片式展示，小米 TTS 按需生成语音。

**Tech Stack:** Next.js 14+ (App Router)、TypeScript、Tailwind CSS、rss-parser、OpenAI API、小米 TTS API

## Global Constraints

- Node.js >= 18
- Next.js 14+ with App Router
- TypeScript strict mode
- Tailwind CSS for all styling
- Mobile-first responsive design
- All UI text in both Chinese and English
- JSON file storage in `data/` directory (no database)
- Audio cache in `public/audio/` directory
- Environment variables via `.env.local`

---

### Task 1: 项目初始化

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.js`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `app/globals.css`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `.env.local.example`
- Create: `.gitignore`
- Create: `docs/README.md`

- [ ] **Step 1: 初始化 Next.js 项目**

```bash
cd /Users/xiong/Workplace/daily-english-podcast
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --no-git
```

- [ ] **Step 2: 安装额外依赖**

```bash
npm install rss-parser date-fns
npm install -D @types/node
```

- [ ] **Step 3: 创建环境变量模板**

```bash
cat > .env.local.example << 'EOF'
# AI API (OpenAI or DeepSeek)
OPENAI_API_KEY=sk-xxx
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini

# 小米 TTS API
MI_TTS_API_URL=https://your-mi-tts-endpoint
MI_TTS_API_KEY=xxx

# Cron Secret (for Vercel Cron authentication)
CRON_SECRET=your-random-secret
EOF
```

- [ ] **Step 4: 验证项目启动**

```bash
npm run dev
# 打开 http://localhost:3000 确认页面正常加载
```

- [ ] **Step 5: 提交**

```bash
git init
git add .
git commit -m "feat: initialize Next.js project with TypeScript and Tailwind"
```

---

### Task 2: 类型定义和数据结构

**Files:**
- Create: `lib/types.ts`

**Interfaces:**
- Produces: `Article`, `DailyDigest`, `Language` types for all downstream tasks

- [ ] **Step 1: 创建类型定义文件**

```typescript
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
```

- [ ] **Step 2: 验证 TypeScript 编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: 提交**

```bash
git add lib/types.ts
git commit -m "feat: add type definitions for Article and DailyDigest"
```

---

### Task 3: 国际化系统

**Files:**
- Create: `lib/i18n.ts`

**Interfaces:**
- Produces: `t(key)` function, `LanguageProvider`, `useLanguage` hook

- [ ] **Step 1: 创建 i18n 字典和 Context**

```typescript
// lib/i18n.ts
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
```

- [ ] **Step 2: 验证 TypeScript 编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: 提交**

```bash
git add lib/i18n.ts
git commit -m "feat: add i18n system with language provider and translations"
```

---

### Task 4: RSS 抓取服务

**Files:**
- Create: `lib/rss.ts`

**Interfaces:**
- Consumes: `RSSSource`, `Article` from `lib/types.ts`
- Produces: `fetchRSS(sources: RSSSource[]): Promise<Article[]>` function

- [ ] **Step 1: 创建 RSS 抓取服务**

```typescript
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
```

- [ ] **Step 2: 验证 TypeScript 编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: 提交**

```bash
git add lib/rss.ts
git commit -m "feat: add RSS fetching service with multiple sources"
```

---

### Task 5: AI 摘要服务

**Files:**
- Create: `lib/ai.ts`

**Interfaces:**
- Consumes: `Article` from `lib/types.ts`
- Produces: `processArticles(articles: Article[]): Promise<Article[]>` function — takes raw articles, returns articles with bilingual titles, summaries, and tags

- [ ] **Step 1: 创建 AI 摘要服务**

```typescript
// lib/ai.ts
import type { Article } from './types';

interface AIConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

function getAIConfig(): AIConfig {
  return {
    apiKey: process.env.OPENAI_API_KEY || '',
    baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  };
}

async function callAI(prompt: string): Promise<string> {
  const config = getAIConfig();
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

function buildProcessPrompt(articles: Article[]): string {
  const articlesText = articles
    .map((a, i) => `[${i + 1}] Source: ${a.source}\nTitle: ${a.title.zh || a.title.en}\nContent: ${a.summary.zh || a.summary.en}\nURL: ${a.sourceUrl}`)
    .join('\n\n');

  return `You are an AI tech news editor. Process the following articles and return a JSON array.

For each article, provide:
1. Chinese title (zh) - concise, informative
2. English title (en) - concise, informative
3. Chinese summary (zh) - 2-3 sentences, easy to understand for developers
4. English summary (en) - 2-3 sentences, easy to understand for developers
5. Tags - 2-4 relevant tags in English (e.g., "LLM", "OpenAI", "Robotics")
6. Relevance score (1-10) - how relevant to AI/tech

Filter out: ads, sponsored content, non-tech articles. Keep only AI/tech related articles.
Return top 5-10 most relevant articles.

Articles:
${articlesText}

Return ONLY valid JSON array, no markdown, no explanation:
[
  {
    "originalUrl": "...",
    "title": { "zh": "...", "en": "..." },
    "summary": { "zh": "...", "en": "..." },
    "tags": ["...", "..."],
    "relevance": 8
  }
]`;
}

export async function processArticles(articles: Article[]): Promise<Article[]> {
  if (articles.length === 0) return [];

  const prompt = buildProcessPrompt(articles);
  const response = await callAI(prompt);

  try {
    // Extract JSON from response (handle potential markdown wrapping)
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('No JSON array found in AI response');
      return articles.slice(0, 5);
    }

    const processed = JSON.parse(jsonMatch[0]);

    return processed
      .filter((item: any) => item.relevance >= 5)
      .slice(0, 10)
      .map((item: any) => {
        const original = articles.find((a) => a.sourceUrl === item.originalUrl);
        return {
          id: original?.id || Math.random().toString(36).slice(2),
          title: item.title,
          summary: item.summary,
          source: original?.source || 'Unknown',
          sourceUrl: item.originalUrl,
          tags: item.tags || [],
          coverImage: original?.coverImage,
          publishedAt: original?.publishedAt,
        };
      });
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    // Fallback: return top 5 articles with basic processing
    return articles.slice(0, 5).map((a) => ({
      ...a,
      title: { zh: a.title.zh || a.title.en, en: a.title.en || a.title.zh },
      summary: { zh: a.summary.zh || a.summary.en, en: a.summary.en || a.summary.zh },
    }));
  }
}
```

- [ ] **Step 2: 验证 TypeScript 编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: 提交**

```bash
git add lib/ai.ts
git commit -m "feat: add AI summarization service with bilingual support"
```

---

### Task 6: 数据存储服务

**Files:**
- Create: `lib/storage.ts`

**Interfaces:**
- Consumes: `DailyDigest` from `lib/types.ts`
- Produces: `saveDigest(digest: DailyDigest): Promise<void>`, `loadDigest(date: string): Promise<DailyDigest | null>`, `getLatestDigest(): Promise<DailyDigest | null>`

- [ ] **Step 1: 创建数据存储服务**

```typescript
// lib/storage.ts
import fs from 'fs/promises';
import path from 'path';
import type { DailyDigest } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

function getFilePath(date: string): string {
  return path.join(DATA_DIR, `${date}.json`);
}

export async function saveDigest(digest: DailyDigest): Promise<void> {
  await ensureDataDir();
  const filePath = getFilePath(digest.date);
  await fs.writeFile(filePath, JSON.stringify(digest, null, 2), 'utf-8');
}

export async function loadDigest(date: string): Promise<DailyDigest | null> {
  try {
    const filePath = getFilePath(date);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function getLatestDigest(): Promise<DailyDigest | null> {
  await ensureDataDir();
  try {
    const files = await fs.readdir(DATA_DIR);
    const jsonFiles = files
      .filter((f) => f.endsWith('.json'))
      .sort()
      .reverse();

    if (jsonFiles.length === 0) return null;

    const latestFile = jsonFiles[0];
    const data = await fs.readFile(path.join(DATA_DIR, latestFile), 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function listAvailableDates(): Promise<string[]> {
  await ensureDataDir();
  try {
    const files = await fs.readdir(DATA_DIR);
    return files
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace('.json', ''))
      .sort()
      .reverse();
  } catch {
    return [];
  }
}
```

- [ ] **Step 2: 验证 TypeScript 编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: 提交**

```bash
git add lib/storage.ts
git commit -m "feat: add JSON file storage service for daily digests"
```

---

### Task 7: Cron API 路由

**Files:**
- Create: `app/api/cron/route.ts`

**Interfaces:**
- Consumes: `fetchAllRSS` from `lib/rss.ts`, `processArticles` from `lib/ai.ts`, `saveDigest` from `lib/storage.ts`
- Produces: GET endpoint at `/api/cron`

- [ ] **Step 1: 创建 Cron API 路由**

```typescript
// app/api/cron/route.ts
import { NextResponse } from 'next/server';
import { fetchAllRSS } from '@/lib/rss';
import { processArticles } from '@/lib/ai';
import { saveDigest } from '@/lib/storage';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[Cron] Starting daily digest generation...');

    // Step 1: Fetch RSS
    console.log('[Cron] Fetching RSS feeds...');
    const rawArticles = await fetchAllRSS();
    console.log(`[Cron] Fetched ${rawArticles.length} raw articles`);

    // Step 2: AI processing
    console.log('[Cron] Processing with AI...');
    const processedArticles = await processArticles(rawArticles);
    console.log(`[Cron] Processed ${processedArticles.length} articles`);

    // Step 3: Save
    const today = format(new Date(), 'yyyy-MM-dd');
    const digest = {
      date: today,
      articles: processedArticles,
    };

    await saveDigest(digest);
    console.log(`[Cron] Saved digest for ${today}`);

    return NextResponse.json({
      success: true,
      date: today,
      articleCount: processedArticles.length,
    });
  } catch (error) {
    console.error('[Cron] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate digest' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: 验证 TypeScript 编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: 提交**

```bash
git add app/api/cron/route.ts
git commit -m "feat: add cron API route for daily digest generation"
```

---

### Task 8: 小米 TTS 服务

**Files:**
- Create: `lib/tts.ts`

**Interfaces:**
- Consumes: `Language` from `lib/types.ts`
- Produces: `generateSpeech(text: string, lang: Language): Promise<string>` — returns audio file path

- [ ] **Step 1: 创建 TTS 服务**

```typescript
// lib/tts.ts
import fs from 'fs/promises';
import path from 'path';
import type { Language } from './types';

const AUDIO_DIR = path.join(process.cwd(), 'public', 'audio');

async function ensureAudioDir(date: string) {
  const dir = path.join(AUDIO_DIR, date);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
  return dir;
}

function getAudioPath(date: string, articleId: string, lang: Language): string {
  return path.join(AUDIO_DIR, date, `${articleId}_${lang}.mp3`);
}

export function getAudioUrl(date: string, articleId: string, lang: Language): string {
  return `/audio/${date}/${articleId}_${lang}.mp3`;
}

export async function audioExists(date: string, articleId: string, lang: Language): Promise<boolean> {
  try {
    await fs.access(getAudioPath(date, articleId, lang));
    return true;
  } catch {
    return false;
  }
}

export async function generateSpeech(
  text: string,
  lang: Language,
  date: string,
  articleId: string
): Promise<string> {
  // Check cache first
  if (await audioExists(date, articleId, lang)) {
    return getAudioUrl(date, articleId, lang);
  }

  const apiUrl = process.env.MI_TTS_API_URL;
  const apiKey = process.env.MI_TTS_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error('TTS API not configured');
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      text,
      lang: lang === 'zh' ? 'zh-CN' : 'en-US',
      format: 'mp3',
    }),
  });

  if (!response.ok) {
    throw new Error(`TTS API error: ${response.status}`);
  }

  const audioBuffer = await response.arrayBuffer();
  const dir = await ensureAudioDir(date);
  const filePath = path.join(dir, `${articleId}_${lang}.mp3`);
  await fs.writeFile(filePath, Buffer.from(audioBuffer));

  return getAudioUrl(date, articleId, lang);
}
```

- [ ] **Step 2: 验证 TypeScript 编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: 提交**

```bash
git add lib/tts.ts
git commit -m "feat: add TTS service with Xiaomi API and caching"
```

---

### Task 9: Audio API 路由

**Files:**
- Create: `app/api/audio/route.ts`

**Interfaces:**
- Consumes: `generateSpeech`, `audioExists`, `getAudioUrl` from `lib/tts.ts`, `loadDigest` from `lib/storage.ts`
- Produces: GET endpoint at `/api/audio?date=...&articleId=...&lang=...`

- [ ] **Step 1: 创建 Audio API 路由**

```typescript
// app/api/audio/route.ts
import { NextResponse } from 'next/server';
import { generateSpeech, audioExists, getAudioUrl } from '@/lib/tts';
import { loadDigest } from '@/lib/storage';
import type { Language } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const articleId = searchParams.get('articleId');
  const lang = (searchParams.get('lang') || 'zh') as Language;

  if (!date || !articleId) {
    return NextResponse.json(
      { error: 'Missing date or articleId' },
      { status: 400 }
    );
  }

  try {
    // Check cache
    if (await audioExists(date, articleId, lang)) {
      return NextResponse.json({ url: getAudioUrl(date, articleId, lang) });
    }

    // Load digest to get article text
    const digest = await loadDigest(date);
    if (!digest) {
      return NextResponse.json({ error: 'Digest not found' }, { status: 404 });
    }

    const article = digest.articles.find((a) => a.id === articleId);
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Generate speech
    const text = `${article.title[lang]}. ${article.summary[lang]}`;
    const audioUrl = await generateSpeech(text, lang, date, articleId);

    return NextResponse.json({ url: audioUrl });
  } catch (error) {
    console.error('TTS Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate audio' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: 验证 TypeScript 编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: 提交**

```bash
git add app/api/audio/route.ts
git commit -m "feat: add audio API route for TTS generation"
```

---

### Task 10: 文章卡片组件

**Files:**
- Create: `components/ArticleCard.tsx`

**Interfaces:**
- Consumes: `Article`, `Language` from `lib/types.ts`, `useLanguage` from `lib/i18n.ts`
- Produces: `ArticleCard` component

- [ ] **Step 1: 创建文章卡片组件**

```typescript
// components/ArticleCard.tsx
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
```

- [ ] **Step 2: 验证 TypeScript 编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: 提交**

```bash
git add components/ArticleCard.tsx
git commit -m "feat: add ArticleCard component with bilingual support"
```

---

### Task 11: Header 组件

**Files:**
- Create: `components/Header.tsx`

**Interfaces:**
- Consumes: `useLanguage` from `lib/i18n.ts`
- Produces: `Header` component with language switch and dark mode toggle

- [ ] **Step 1: 创建 Header 组件**

```typescript
// components/Header.tsx
'use client';

import { useLanguage } from '@/lib/i18n';
import { format } from 'date-fns';

interface HeaderProps {
  date?: string;
}

export default function Header({ date }: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();

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
```

- [ ] **Step 2: 验证 TypeScript 编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: 提交**

```bash
git add components/Header.tsx
git commit -m "feat: add Header component with language switch"
```

---

### Task 12: 播放器组件

**Files:**
- Create: `components/AudioPlayer.tsx`

**Interfaces:**
- Consumes: `useLanguage` from `lib/i18n.ts`, `Article` from `lib/types.ts`
- Produces: `AudioPlayer` component

- [ ] **Step 1: 创建播放器组件**

```typescript
// components/AudioPlayer.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Article, Language } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';

interface AudioPlayerProps {
  articles: Article[];
  currentArticleId: string | null;
  isPlaying: boolean;
  onPlay: (articleId: string) => void;
  onStop: () => void;
}

export default function AudioPlayer({
  articles,
  currentArticleId,
  isPlaying,
  onPlay,
  onStop,
}: AudioPlayerProps) {
  const { language, t } = useLanguage();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentArticle = articles.find((a) => a.id === currentArticleId);
  const currentIndex = articles.findIndex((a) => a.id === currentArticleId);

  const fetchAudio = useCallback(async (articleId: string, lang: Language) => {
    setIsLoading(true);
    setError(null);

    try {
      const date = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/audio?date=${date}&articleId=${articleId}&lang=${lang}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setAudioUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audio');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentArticleId && isPlaying) {
      fetchAudio(currentArticleId, language);
    }
  }, [currentArticleId, isPlaying, language, fetchAudio]);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(console.error);
      setIsLoading(false);
    }
  }, [audioUrl]);

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
```

- [ ] **Step 2: 验证 TypeScript 编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: 提交**

```bash
git add components/AudioPlayer.tsx
git commit -m "feat: add AudioPlayer component with sequential playback"
```

---

### Task 13: 主页面

**Files:**
- Create: `app/page.tsx`

**Interfaces:**
- Consumes: `loadDigest`, `getLatestDigest` from `lib/storage.ts`, `Header`, `ArticleCard`, `AudioPlayer` components, `LanguageProvider` from `lib/i18n.ts`
- Produces: Main page at `/`

- [ ] **Step 1: 创建主页面**

```typescript
// app/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import type { DailyDigest } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';
import Header from '@/components/Header';
import ArticleCard from '@/components/ArticleCard';
import AudioPlayer from '@/components/AudioPlayer';

export default function HomePage() {
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
```

- [ ] **Step 2: 验证 TypeScript 编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: 提交**

```bash
git add app/page.tsx
git commit -m "feat: add main page with article list and audio player"
```

---

### Task 14: Digest API 路由

**Files:**
- Create: `app/api/digest/route.ts`

**Interfaces:**
- Consumes: `loadDigest`, `getLatestDigest` from `lib/storage.ts`
- Produces: GET endpoint at `/api/digest` and `/api/digest?date=...`

- [ ] **Step 1: 创建 Digest API 路由**

```typescript
// app/api/digest/route.ts
import { NextResponse } from 'next/server';
import { loadDigest, getLatestDigest } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  try {
    const digest = date ? await loadDigest(date) : await getLatestDigest();

    if (!digest) {
      return NextResponse.json(
        { error: 'No digest available' },
        { status: 404 }
      );
    }

    return NextResponse.json(digest);
  } catch (error) {
    console.error('Failed to load digest:', error);
    return NextResponse.json(
      { error: 'Failed to load digest' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: 验证 TypeScript 编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: 提交**

```bash
git add app/api/digest/route.ts
git commit -m "feat: add digest API route for fetching daily data"
```

---

### Task 15: 布局和全局样式

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `LanguageProvider` from `lib/i18n.ts`
- Produces: Root layout with language provider and global styles

- [ ] **Step 1: 更新布局文件**

```typescript
// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Daily - 每日 AI 技术日报',
  description: '每日精选 AI 技术资讯，支持中英文切换和语音播放',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: 更新全局样式**

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 249 250 251;
    --foreground: 17 24 39;
  }

  .dark {
    --background: 3 7 18;
    --foreground: 249 250 251;
  }
}

@layer base {
  body {
    @apply bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100;
  }
}

@layer utilities {
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
```

- [ ] **Step 3: 验证 TypeScript 编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: 提交**

```bash
git add app/layout.tsx app/globals.css
git commit -m "feat: add root layout with language provider and global styles"
```

---

### Task 16: Vercel 配置和部署准备

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: 创建 Vercel 配置**

```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "0 0 * * *"
    }
  ]
}
```

- [ ] **Step 2: 验证项目构建**

```bash
npm run build
```

- [ ] **Step 3: 创建示例数据**

```bash
mkdir -p data
cat > data/2026-06-27.json << 'EOF'
{
  "date": "2026-06-27",
  "articles": [
    {
      "id": "demo1",
      "title": {
        "zh": "OpenAI 发布最新 GPT-5 模型",
        "en": "OpenAI Releases Latest GPT-5 Model"
      },
      "summary": {
        "zh": "OpenAI 今日正式发布了 GPT-5 模型，在推理能力和多模态理解方面有显著提升。新模型支持更长的上下文窗口，并在代码生成和数学推理任务上表现优异。",
        "en": "OpenAI officially released the GPT-5 model today, with significant improvements in reasoning and multimodal understanding. The new model supports longer context windows and excels at code generation and math reasoning tasks."
      },
      "source": "TechCrunch",
      "sourceUrl": "https://example.com/gpt5",
      "tags": ["LLM", "OpenAI", "GPT-5"],
      "coverImage": null,
      "publishedAt": "2026-06-27T08:00:00Z"
    }
  ]
}
EOF
```

- [ ] **Step 4: 运行开发服务器验证**

```bash
npm run dev
# 打开 http://localhost:3000 确认页面正常显示示例数据
```

- [ ] **Step 5: 提交**

```bash
git add vercel.json data/
git commit -m "feat: add Vercel cron config and sample data"
```

---

### Task 17: 最终集成测试

- [ ] **Step 1: 运行完整构建**

```bash
npm run build
```

- [ ] **Step 2: 检查 TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: 启动开发服务器并测试**

```bash
npm run dev
```

手动验证：
1. 打开 http://localhost:3000 — 应显示示例日报
2. 点击语言切换按钮 — 应在中英文之间切换
3. 点击文章卡片上的播放按钮 — 应触发 TTS 请求
4. 点击「播放全部」— 应从第一篇开始连续播放
5. 检查移动端响应式布局 — 缩小浏览器窗口，卡片应自适应

- [ ] **Step 4: 最终提交**

```bash
git add .
git commit -m "feat: complete AI daily digest application"
```

---

## 环境变量配置

部署到 Vercel 前，需要在 Vercel Dashboard 中配置以下环境变量：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `OPENAI_API_KEY` | OpenAI/DeepSeek API Key | `sk-xxx` |
| `OPENAI_BASE_URL` | API Base URL | `https://api.openai.com/v1` |
| `OPENAI_MODEL` | 模型名称 | `gpt-4o-mini` |
| `MI_TTS_API_URL` | 小米 TTS API 地址 | `https://xxx` |
| `MI_TTS_API_KEY` | 小米 TTS API Key | `xxx` |
| `CRON_SECRET` | Cron 认证密钥 | `your-random-secret` |

## 部署步骤

1. 推送代码到 GitHub
2. 在 Vercel Dashboard 中导入项目
3. 配置环境变量
4. 部署
5. 在 Vercel Dashboard 的 Cron Jobs 中确认定时任务已启用
