import { NextResponse } from 'next/server';
import { db } from '../../../../lib/d1/db';
import { currentUser } from '../../../../lib/auth/core';

export const dynamic = 'force-dynamic';
const noStore = { headers: { 'cache-control': 'private, no-store' } };

/**
 * "Email me when a tax change moves my take-home pay" — express consent under
 * CASL, so it is off by default, only the account holder can turn it on, and
 * the moment it was turned on is kept (rate_alerts_at) as the consent record.
 * Turning it on also lifts an earlier unsubscribe: it is a newer, explicit yes.
 * No alert is sent yet; the first is planned for the 2027 CRA tables.
 */
export async function GET(request: Request) {
  const u = await currentUser(request); if (!u) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const r = await (await db()).prepare('select rate_alerts, email_opt_out from users where id = ?').bind(u.id).first<{ rate_alerts: number; email_opt_out: number }>();
  return NextResponse.json({ rate_alerts: !!r?.rate_alerts, email_opt_out: !!r?.email_opt_out }, noStore);
}

export async function PUT(request: Request) {
  const u = await currentUser(request); if (!u) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  let b: { on?: unknown };
  try { b = await request.json(); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  if (typeof b.on !== 'boolean') return NextResponse.json({ error: 'on must be true or false' }, { status: 400 });
  const d = await db();
  if (b.on) await d.prepare('update users set rate_alerts = 1, rate_alerts_at = ?, email_opt_out = 0 where id = ?').bind(new Date().toISOString(), u.id).run();
  else await d.prepare('update users set rate_alerts = 0 where id = ?').bind(u.id).run();
  return NextResponse.json({ ok: true, rate_alerts: b.on }, noStore);
}
