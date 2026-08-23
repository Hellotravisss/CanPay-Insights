import { NextResponse } from 'next/server';
import { db, secret, tokenOk } from '../../../../lib/d1/db';
import { exportManifest } from '../../../../lib/d1/gsc';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!tokenOk(auth, await secret('GSC_INGEST_TOKEN'))) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  return NextResponse.json(await exportManifest(await db()));
}
