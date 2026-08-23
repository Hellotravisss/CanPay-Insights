import { NextResponse } from 'next/server';
import { db, secret, tokenOk } from '../../../../lib/d1/db';
import { loadEvents, monthlySnapshot, today } from '../../../../lib/d1/events';

export const dynamic = 'force-dynamic';

/** build_monthly_snapshot: freeze one month's aggregates (POST), or list them (GET). */
export async function POST(request: Request) {
  const auth = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!tokenOk(auth, await secret('GSC_INGEST_TOKEN'))) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const month = new URL(request.url).searchParams.get('month') ?? today().slice(0, 7);
  if (!/^\d{4}-\d{2}$/.test(month)) return NextResponse.json({ error: 'bad month' }, { status: 400 });
  const d = await db();
  const snap = monthlySnapshot(await loadEvents(d), month);
  await d.prepare('insert into monthly_snapshots (month, payload, taken_at) values (?,?,?) on conflict(month) do update set payload=excluded.payload, taken_at=excluded.taken_at')
    .bind(`${month}-01`, JSON.stringify(snap), new Date().toISOString()).run();
  return NextResponse.json(snap);
}

export async function GET() {
  const d = await db();
  const rows = (await d.prepare('select payload from monthly_snapshots order by month').all<{ payload: string }>()).results;
  return NextResponse.json(rows.map((r) => JSON.parse(r.payload)), { headers: { 'cache-control': 'public, max-age=3600' } });
}
