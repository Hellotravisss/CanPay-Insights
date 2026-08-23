import { NextResponse } from 'next/server';
import { db } from '../../../../lib/d1/db';
import { currentUser } from '../../../../lib/auth/core';

export const dynamic = 'force-dynamic';
const noStore = { headers: { 'cache-control': 'private, no-store' } };

export async function GET(request: Request) {
  const u = await currentUser(request); if (!u) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const rows = (await (await db()).prepare('select id, date, check_in, check_out, unpaid_break_minutes, notes, created_at, updated_at from timesheet_entries where user_id = ? order by date desc limit 500').bind(u.id).all()).results;
  return NextResponse.json(rows, noStore);
}

/** Upsert one entry (POST with id updates). */
export async function POST(request: Request) {
  const u = await currentUser(request); if (!u) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  type Entry = { id?: string; date?: string; check_in?: string; check_out?: string; unpaid_break_minutes?: number; notes?: string };
  let body: Entry | Entry[];
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  const list = Array.isArray(body) ? body : [body];
  if (list.length > 500) return NextResponse.json({ error: 'too many' }, { status: 400 });
  const d = await db();
  const ids: string[] = [];
  const stmts = list.map((b) => {
    if (!b.date || !/^\d{4}-\d{2}-\d{2}$/.test(b.date)) throw new Error('date required');
    const id = (b.id && String(b.id).slice(0, 64)) || crypto.randomUUID();
    ids.push(id);
    return d.prepare(`insert into timesheet_entries (id, user_id, date, check_in, check_out, unpaid_break_minutes, notes, updated_at) values (?,?,?,?,?,?,?,?)
      on conflict(id) do update set date=excluded.date, check_in=excluded.check_in, check_out=excluded.check_out, unpaid_break_minutes=excluded.unpaid_break_minutes, notes=excluded.notes, updated_at=excluded.updated_at where user_id = ?`)
      .bind(id, u.id, b.date, b.check_in ?? null, b.check_out ?? null, b.unpaid_break_minutes ?? null, b.notes ? String(b.notes).slice(0, 500) : null, new Date().toISOString(), u.id);
  });
  try { for (let i = 0; i < stmts.length; i += 100) await d.batch(stmts.slice(i, i + 100)); }
  catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 400 }); }
  return NextResponse.json(Array.isArray(body) ? { ids } : { id: ids[0] }, noStore);
}

export async function DELETE(request: Request) {
  const u = await currentUser(request); if (!u) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const id = new URL(request.url).searchParams.get('id') ?? '';
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await (await db()).prepare('delete from timesheet_entries where id = ? and user_id = ?').bind(id, u.id).run();
  return NextResponse.json({ ok: true }, noStore);
}
