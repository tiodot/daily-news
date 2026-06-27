// app/api/cron/route.ts
import { NextResponse } from 'next/server';
import { fetchAllRSS } from '@/lib/rss';
import { processArticles } from '@/lib/ai';
import { saveDigest } from '@/lib/storage';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
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
