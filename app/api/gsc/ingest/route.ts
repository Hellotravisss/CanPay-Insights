import { NextResponse } from 'next/server';
import { db, secret, tokenOk } from '../../../../lib/d1/db';
import { gscIngest } from '../../../../lib/d1/gsc';

export const dynamic = 'force-dynamic';

/** Daily Search Console archive, called by the GitHub Actions robot. */
export async function POST(request: Request) {
  const auth = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!tokenOk(auth, await secret('GSC_INGEST_TOKEN'))) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  let body: { date?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) return NextResponse.json({ error: 'bad date' }, { status: 400 });
  return NextResponse.json(await gscIngest(await db(), body as Parameters<typeof gscIngest>[1]));
}
