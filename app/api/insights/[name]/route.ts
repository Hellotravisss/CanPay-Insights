import { NextResponse } from 'next/server';
import { db } from '../../../../lib/d1/db';
import {
  loadEvents, calcStats, calcStatsExtra, calcIndustryIncome, calcFakeDoors, calcAccounts,
  calcJourneys, calcSeries, calcCandles, calcCrosstab, calcCitiesGeo, provenanceEvents,
} from '../../../../lib/d1/events';
import { gscStats, contentStats } from '../../../../lib/d1/gsc';

export const dynamic = 'force-dynamic';

/**
 * The private data room's read API — one route per former Supabase RPC,
 * same names, same JSON shapes. Gated by the room key: the same unguessable
 * token the page URL carries, sent as a header. The room is unlisted, not
 * secret in the cryptographic sense; this keeps casual scripts out and
 * leaks nothing a visitor to the page could not already see.
 */
export async function GET(request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const key = request.headers.get('x-room-key');
  if (key !== 'Mi9kcqgRDRCM') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const d = await db();
  const noStore = { headers: { 'cache-control': 'private, no-store' } };
  const ev = async () => loadEvents(d);

  switch (name) {
    case 'stats': {
      const all = await loadEvents(d, true);
      const excluded = all.filter((r) => r.excluded === 1).length;
      return NextResponse.json(calcStats(all.filter((r) => r.excluded !== 1), excluded), noStore);
    }
    case 'stats_extra': return NextResponse.json(calcStatsExtra(await ev()), noStore);
    case 'industry_income': return NextResponse.json(calcIndustryIncome(await ev()), noStore);
    case 'fake_doors': {
      const wl = (await d.prepare('select product k, count(*) n from product_waitlist group by product order by n desc').all<{ k: string; n: number }>()).results;
      return NextResponse.json(calcFakeDoors(await ev(), wl), noStore);
    }
    case 'accounts': return NextResponse.json(calcAccounts(await ev()), noStore);
    case 'journeys': return NextResponse.json(calcJourneys(await ev()), noStore);
    case 'series': return NextResponse.json(calcSeries(await ev()), noStore);
    case 'candles': return NextResponse.json(calcCandles(await ev()), noStore);
    case 'crosstab': return NextResponse.json(calcCrosstab(await ev()), noStore);
    case 'cities_geo': return NextResponse.json(calcCitiesGeo(await ev()), noStore);
    case 'provenance': {
      const all = await loadEvents(d, true);
      const g = (await d.prepare('select (select count(*) from gsc_daily) gsc_days, (select min(date) from gsc_daily) gsc_first, (select max(date) from gsc_daily) gsc_last, (select count(*) from gsc_queries) gsc_queries, (select count(*) from gsc_pages) gsc_pages').first())!;
      const snaps = (await d.prepare('select month, taken_at from monthly_snapshots order by month').all<{ month: string; taken_at: string }>()).results
        .map((s) => ({ month: s.month.slice(0, 7), taken: s.taken_at.slice(0, 10) }));
      return NextResponse.json({ ...provenanceEvents(all), ...g, snapshots: snaps }, noStore);
    }
    case 'gsc': return NextResponse.json(await gscStats(d), noStore);
    case 'content': return NextResponse.json(await contentStats(d, await ev()), noStore);
    case 'sales': {
      const one = (await d.prepare('select count(*) orders, coalesce(sum(amount_cents),0) revenue_cents, min(created_at) first_sale, max(created_at) last_sale from purchases where refunded = 0').first())!;
      const refunds = (await d.prepare('select count(*) n from purchases where refunded = 1').first<{ n: number }>())!.n;
      const by = async (sql: string) => (await d.prepare(sql).all()).results;
      return NextResponse.json({
        ...one, refunds,
        by_product: await by("select product k, count(*) n from purchases where refunded = 0 group by product order by n desc"),
        by_route: await by("select from_province || ' → ' || to_province k, count(*) n from purchases where refunded = 0 and from_province is not null group by k order by n desc limit 12"),
        by_bracket: await by("select income_bracket k, count(*) n from purchases where refunded = 0 and income_bracket is not null group by k order by n desc"),
      }, noStore);
    }
    default: return NextResponse.json({ error: 'unknown' }, { status: 404 });
  }
}
