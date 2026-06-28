import { fetchAllRSS } from '../lib/rss';
import { processArticles } from '../lib/ai';
import { saveDigest } from '../lib/storage';
import { format } from 'date-fns';

async function main() {
  console.log('Fetching RSS feeds...');
  const rawArticles = await fetchAllRSS();
  console.log(`Fetched ${rawArticles.length} raw articles`);

  console.log('Processing with AI...');
  const processedArticles = await processArticles(rawArticles);
  console.log(`Processed ${processedArticles.length} articles`);

  const today = format(new Date(), 'yyyy-MM-dd');
  const digest = {
    date: today,
    articles: processedArticles,
  };

  await saveDigest(digest);
  console.log(`Saved digest for ${today}`);
}

main().catch((error) => {
  console.error('Failed to generate digest:', error);
  process.exit(1);
});
