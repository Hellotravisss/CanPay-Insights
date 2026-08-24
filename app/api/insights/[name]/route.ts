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
    /** Sales. Purchases made by the owner's own accounts are flagged
     *  `excluded` at webhook time and never counted — the revenue line has to
     *  mean strangers paying, or it means nothing. */
    case 'sales': {
      const one = (await d.prepare('select count(*) orders, coalesce(sum(amount_cents),0) revenue_cents, min(created_at) first_sale, max(created_at) last_sale from purchases where refunded = 0 and excluded = 0').first())!;
      const refunds = (await d.prepare('select count(*) n from purchases where refunded = 1 and excluded = 0').first<{ n: number }>())!.n;
      const by = async (sql: string) => (await d.prepare(sql).all()).results;
      return NextResponse.json({
        ...one, refunds,
        by_product: await by("select product k, count(*) n from purchases where refunded = 0 and excluded = 0 group by product order by n desc"),
        by_route: await by("select from_province || ' → ' || to_province k, count(*) n from purchases where refunded = 0 and excluded = 0 and from_province is not null group by k order by n desc limit 12"),
        by_bracket: await by("select income_bracket k, count(*) n from purchases where refunded = 0 and excluded = 0 and income_bracket is not null group by k order by n desc"),
        by_month: await by("select substr(created_at,1,7) k, count(*) n, sum(amount_cents) revenue_cents from purchases where refunded = 0 and excluded = 0 group by k order by k"),
        attached_to_account: (await d.prepare('select count(*) n from purchases where refunded = 0 and excluded = 0 and user_id is not null').first<{ n: number }>())!.n,
        shares: (await d.prepare('select count(*) n from share_rewards').first<{ n: number }>())!.n,
        shares_by_channel: await by('select channel k, count(*) n from share_rewards group by k order by n desc'),
      }, noStore);
    }
    /**
     * Intent signals. Three rungs, weakest to strongest:
     *   1. within-session comparison (>=2 provinces = move-curious,
     *      >=2 income brackets = salary-comparing) — anonymous, session-scoped;
     *      we deliberately have NO cross-day anonymous id, so cross-day
     *      frequency exists only for signed-in users (rung 2).
     *   2. registered users' own calculation_history — aggregate
     *      distributions only, never rows.
     *   3. purchases — paid intent, the ground truth the funnel ends in.
     */
    case 'intent': {
      const q = async (sql: string) => (await d.prepare(sql).all()).results;
      const one = async <T,>(sql: string) => (await d.prepare(sql).first<T>())!;
      const sess = await one<{ total: number; multi_prov: number; multi_bracket: number }>(
        `select count(*) total,
                sum(nprov >= 2) multi_prov,
                sum(nbr >= 2) multi_bracket
         from (select session_id, count(distinct province) nprov, count(distinct income_bracket) nbr
               from events where session_id is not null and (excluded is null or excluded = 0)
               group by session_id)`);
      const funnel = await q(
        `select e.k, e.taps, coalesce(p.n, 0) purchases from
           (select product_interest k, count(*) taps from events where product_interest is not null group by product_interest) e
           left join (select product k, count(*) n from purchases where refunded = 0 and excluded = 0 group by product) p
           on p.k = e.k order by e.taps desc`);
      // Signed-in checking cadence, last 30 days: how many distinct days did
      // each active user run a calculation? Aggregated into bands.
      const cadence = await q(
        `select case when days_active >= 8 then '8+ days' when days_active >= 4 then '4-7 days'
                     when days_active >= 2 then '2-3 days' else '1 day' end k, count(*) n
         from (select user_id, count(distinct substr(created_at,1,10)) days_active
               from calculation_history where created_at >= datetime('now','-30 days') group by user_id)
         group by k order by n desc`);
      const perUser = await one<{ users: number; calcs: number }>(
        `select count(distinct user_id) users, count(*) calcs from calculation_history where created_at >= datetime('now','-30 days')`);
      return NextResponse.json({ sessions: sess, funnel, cadence, active_users_30d: perUser.users, calcs_30d: perUser.calcs }, noStore);
    }
    /** Offer comp structures (bucketed, identity-severed) + the Q4 rotation fields. */
    case 'comp_structure': {
      const q = async (sql: string) => (await d.prepare(sql).all()).results;
      const offers = (await d.prepare('select count(*) n, avg(match_pct) avg_match, avg(vacation_days) avg_vacation, avg(has_bonus) bonus_share from offer_structures').first())!;
      return NextResponse.json({
        offers,
        offers_by_province: await q('select province k, count(*) n, round(avg(match_pct),1) avg_match, round(avg(vacation_days),1) avg_vacation from offer_structures group by k order by n desc'),
        tenure: await q("select tenure_band k, count(*) n from events where tenure_band is not null group by k order by n desc"),
        union_member: await q("select union_member k, count(*) n from events where union_member is not null group by k order by n desc"),
        employer_size: await q("select employer_size k, count(*) n from events where employer_size is not null group by k order by n desc"),
        vacation: await q("select vacation_band k, count(*) n from events where vacation_band is not null group by k order by n desc"),
      }, noStore);
    }
    default: return NextResponse.json({ error: 'unknown' }, { status: 404 });
  }
}
