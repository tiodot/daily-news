// lib/tts.ts
import type { Language } from './types';

function isValidDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function isValidArticleId(articleId: string): boolean {
  return /^[a-z0-9]+$/i.test(articleId);
}

export interface TTSResult {
  audioBuffer: Buffer;
  contentType: string;
}

export async function generateSpeech(
  text: string,
  lang: Language,
  date: string,
  articleId: string
): Promise<TTSResult> {
  if (!isValidDate(date) || !isValidArticleId(articleId)) {
    throw new Error('Invalid date or articleId');
  }

  const baseUrl = process.env.OPENAI_BASE_URL || 'https://token-plan-cn.xiaomimimo.com/v1';
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.TTS_MODEL || 'mimo-v2.5-tts';

  if (!apiKey) {
    throw new Error('TTS API not configured');
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'user', content: 'Read the following text aloud in a clear, natural tone.' },
        { role: 'assistant', content: text },
      ],
      audio: {
        format: 'mp3',
        voice: 'Chloe',
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`TTS API error: ${response.status}`);
  }

  const data = await response.json();
  const audioBase64 = data.choices?.[0]?.message?.audio?.data;
  if (!audioBase64) {
    throw new Error('No audio data in TTS response');
  }

  return {
    audioBuffer: Buffer.from(audioBase64, 'base64'),
    contentType: 'audio/mpeg',
  };
}
