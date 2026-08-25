import { NextResponse } from 'next/server';
import { db } from '../../../lib/d1/db';

export const dynamic = 'force-dynamic';

/**
 * "What did everyone else say?" — the reward for answering a question.
 *
 * The one question on the site with a real payoff (industry: your pay vs the
 * industry median) is answered 9.5% of the time; the ones that just say thank
 * you sit at 1-3%. So every question now hands something back.
 *
 * HONESTY GATE: a distribution built from nine people is not a statistic. If
 * fewer than MIN_N have answered, this returns n only, and the UI shows an
 * engine-computed fact instead of inventing a percentage. Cold start is a
 * reason to say less, never a reason to say something untrue.
 *
 * Returns counts per bucket and nothing else — no ids, no rows, no free text.
 */
const MIN_N = 30;

const COLUMNS: Record<string, string> = {
  expectation: 'expectation',
  work_arrangement: 'work_arrangement',
  age_band: 'age_band',
  tenure_band: 'tenure_band',
  union_member: 'union_member',
  employer_size: 'employer_size',
  vacation_band: 'vacation_band',
  intent: 'intent',
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') ?? '';
  const col = COLUMNS[q];
  if (!col) return NextResponse.json({ error: 'unknown question' }, { status: 400 });

  const d = await db();
  // One row per session, so a visitor who recalculates ten times counts once.
  const rows = (await d
    .prepare(
      `select v, count(*) n from (
         select session_id, max(${col}) v from events
         where ${col} is not null and session_id is not null and (excluded is null or excluded = 0)
         group by session_id
       ) group by v order by n desc`,
    )
    .all()).results as { v: string; n: number }[];

  const n = rows.reduce((a, r) => a + r.n, 0);
  if (n < MIN_N) {
    return NextResponse.json({ q, n, ready: false }, { headers: { 'cache-control': 'public, max-age=300' } });
  }
  return NextResponse.json(
    { q, n, ready: true, dist: rows.map((r) => ({ k: r.v, pct: Math.round((100 * r.n) / n) })) },
    { headers: { 'cache-control': 'public, max-age=300' } },
  );
}
