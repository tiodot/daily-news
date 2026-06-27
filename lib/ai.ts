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
