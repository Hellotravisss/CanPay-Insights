import { NextResponse } from 'next/server';
import { db } from '../../../../lib/d1/db';

export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://csvauvgygdjgljgllter.supabase.co';
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Attach a purchase to the signed-in account. The ledger lives in D1; the
 * login (for now) is still Supabase Auth, so the browser sends its Supabase
 * access token and we ask Supabase who it belongs to. The purchase's email
 * must match that identity — a forwarded link cannot claim someone else's
 * report. When auth moves to Cloudflare only this identity lookup changes.
 */
export async function POST(request: Request) {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return NextResponse.json({ claimed: false, error: 'no session' }, { status: 401 });
  let body: { session_id?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  const sid = body.session_id ?? '';
  if (!/^cs_(live|test)_[A-Za-z0-9]+$/.test(sid)) return NextResponse.json({ error: 'bad session' }, { status: 400 });

  const who = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_ANON, Authorization: auth } });
  if (!who.ok) return NextResponse.json({ claimed: false, error: 'invalid session' }, { status: 401 });
  const user = (await who.json()) as { id?: string; email?: string };
  if (!user.id || !user.email) return NextResponse.json({ claimed: false }, { status: 401 });

  const d = await db();
  const res = await d.prepare(
    'update purchases set user_id = ? where stripe_session_id = ? and lower(email) = lower(?) and (user_id is null or user_id = ?)',
  ).bind(user.id, sid, user.email, user.id).run() as { meta?: { changes?: number } };
  const claimed = (res.meta?.changes ?? 0) > 0 ||
    !!(await d.prepare('select 1 from purchases where stripe_session_id = ? and user_id = ?').bind(sid, user.id).first());
  return NextResponse.json({ claimed });
}
