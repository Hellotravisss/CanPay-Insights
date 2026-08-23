import { NextResponse } from 'next/server';
import { db, secret, tokenOk } from '../../../../lib/d1/db';
import { gscArchivedDays } from '../../../../lib/d1/gsc';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!tokenOk(auth, await secret('GSC_INGEST_TOKEN'))) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const since = new URL(request.url).searchParams.get('since') ?? '2000-01-01';
  return NextResponse.json(await gscArchivedDays(await db(), since));
}
