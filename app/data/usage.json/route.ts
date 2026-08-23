import { NextResponse } from 'next/server';
import { db } from '../../../lib/d1/db';
import { loadEvents, publicDataset } from '../../../lib/d1/events';

/**
 * The public, citable form of the usage dataset — what Canadians actually
 * check about their pay. Served from D1 on every request (an hour of edge
 * caching in front), with the methodology, suppression rules and
 * self-selection warning riding inside the file, because a dataset travels
 * away from the page that explains it.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = publicDataset(await loadEvents(await db()));
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        'Content-Disposition': 'inline; filename="canpay-usage.json"',
        'X-License': 'CC-BY-4.0',
      },
    });
  } catch (e) {
    return NextResponse.json({ error: 'dataset temporarily unavailable', detail: (e as Error).message }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
