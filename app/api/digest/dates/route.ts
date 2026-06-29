// app/api/digest/dates/route.ts
import { NextResponse } from 'next/server';
import { listAvailableDates } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dates = await listAvailableDates();
    return NextResponse.json({ dates }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  } catch (error) {
    console.error('Failed to list dates:', error);
    return NextResponse.json(
      { error: 'Failed to list dates' },
      { status: 500 }
    );
  }
}
