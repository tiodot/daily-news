// lib/tts.ts
import fs from 'fs/promises';
import path from 'path';
import type { Language } from './types';

const AUDIO_DIR = path.join(process.cwd(), 'public', 'audio');

function isValidDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function isValidArticleId(articleId: string): boolean {
  return /^[a-z0-9]+$/i.test(articleId);
}

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
  if (!isValidDate(date) || !isValidArticleId(articleId)) {
    throw new Error('Invalid date or articleId');
  }
  return `/audio/${date}/${articleId}_${lang}.mp3`;
}

export async function audioExists(date: string, articleId: string, lang: Language): Promise<boolean> {
  if (!isValidDate(date) || !isValidArticleId(articleId)) {
    return false;
  }
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
  if (!isValidDate(date) || !isValidArticleId(articleId)) {
    throw new Error('Invalid date or articleId');
  }
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
