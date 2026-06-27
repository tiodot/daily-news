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
