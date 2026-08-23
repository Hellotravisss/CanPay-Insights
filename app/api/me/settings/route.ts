import { NextResponse } from 'next/server';
import { db } from '../../../../lib/d1/db';
import { currentUser } from '../../../../lib/auth/core';

export const dynamic = 'force-dynamic';
const noStore = { headers: { 'cache-control': 'private, no-store' } };

export async function GET(request: Request) {
  const u = await currentUser(request); if (!u) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const r = await (await db()).prepare('select simple_inputs, annual_inputs, timesheet_inputs, last_mode, updated_at from user_settings where user_id = ?').bind(u.id).first<Record<string, string | null>>();
  if (!r) return NextResponse.json(null, noStore);
  return NextResponse.json({
    simple_inputs: JSON.parse(r.simple_inputs || 'null'), annual_inputs: JSON.parse(r.annual_inputs || 'null'),
    timesheet_inputs: JSON.parse(r.timesheet_inputs || 'null'), last_mode: r.last_mode, updated_at: r.updated_at,
  }, noStore);
}

export async function PUT(request: Request) {
  const u = await currentUser(request); if (!u) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  let b: { simple_inputs?: unknown; annual_inputs?: unknown; timesheet_inputs?: unknown; last_mode?: string };
  try { b = await request.json(); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  const j = (v: unknown) => (v === undefined ? null : JSON.stringify(v));
  await (await db()).prepare(`insert into user_settings (user_id, simple_inputs, annual_inputs, timesheet_inputs, last_mode, updated_at)
    values (?,?,?,?,?,?) on conflict(user_id) do update set
      simple_inputs = coalesce(excluded.simple_inputs, user_settings.simple_inputs),
      annual_inputs = coalesce(excluded.annual_inputs, user_settings.annual_inputs),
      timesheet_inputs = coalesce(excluded.timesheet_inputs, user_settings.timesheet_inputs),
      last_mode = coalesce(excluded.last_mode, user_settings.last_mode),
      updated_at = excluded.updated_at`)
    .bind(u.id, j(b.simple_inputs), j(b.annual_inputs), j(b.timesheet_inputs), b.last_mode ?? null, new Date().toISOString()).run();
  return NextResponse.json({ ok: true }, noStore);
}
