import { NextResponse } from 'next/server';
import { db, secret, tokenOk } from '../../../../lib/d1/db';
import { exportDay } from '../../../../lib/d1/gsc';

export const dynamic = 'force-dynamic';

/** One Vancouver-local day of everything, for the git backup robot. */
export async function GET(request: Request) {
  const auth = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!tokenOk(auth, await secret('GSC_INGEST_TOKEN'))) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const date = new URL(request.url).searchParams.get('date') ?? '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: 'bad date' }, { status: 400 });
  return NextResponse.json(await exportDay(await db(), date));
}
