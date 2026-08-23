import { NextResponse } from 'next/server';
import { db } from '../../../../lib/d1/db';
import { currentUser } from '../../../../lib/auth/core';

export const dynamic = 'force-dynamic';

/**
 * Attach a purchase to the signed-in account. The purchase's email must
 * match the account's — a forwarded link cannot claim someone else's report.
 */
export async function POST(request: Request) {
  const user = await currentUser(request);
  if (!user) return NextResponse.json({ claimed: false, error: 'no session' }, { status: 401 });
  let body: { session_id?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  const sid = body.session_id ?? '';
  if (!/^cs_(live|test)_[A-Za-z0-9]+$/.test(sid)) return NextResponse.json({ error: 'bad session' }, { status: 400 });
  const d = await db();
  await d.prepare('update purchases set user_id = ? where stripe_session_id = ? and lower(email) = lower(?) and (user_id is null or user_id = ?)')
    .bind(user.id, sid, user.email, user.id).run();
  const claimed = !!(await d.prepare('select 1 from purchases where stripe_session_id = ? and user_id = ?').bind(sid, user.id).first());
  return NextResponse.json({ claimed });
}
