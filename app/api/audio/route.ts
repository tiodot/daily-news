// app/api/audio/route.ts
import { generateSpeech } from '@/lib/tts';
import { loadDigest } from '@/lib/storage';
import type { Language } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const articleId = searchParams.get('articleId');
  const lang = (searchParams.get('lang') || 'zh') as Language;

  if (!date || !articleId) {
    return new Response(JSON.stringify({ error: 'Missing date or articleId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Load digest to get article text
    const digest = await loadDigest(date);
    if (!digest) {
      return new Response(JSON.stringify({ error: 'Digest not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const article = digest.articles.find((a) => a.id === articleId);
    if (!article) {
      return new Response(JSON.stringify({ error: 'Article not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate speech
    const text = `${article.title[lang]}. ${article.summary[lang]}`;
    const result = await generateSpeech(text, lang, date, articleId);

    // Return audio directly
    return new Response(new Uint8Array(result.audioBuffer), {
      status: 200,
      headers: {
        'Content-Type': result.contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('TTS Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate audio' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
