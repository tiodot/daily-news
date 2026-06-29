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

    return NextResponse.json(digest, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  } catch (error) {
    console.error('Failed to load digest:', error);
    return NextResponse.json(
      { error: 'Failed to load digest' },
      { status: 500 }
    );
  }
}
