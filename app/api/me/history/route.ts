import { NextResponse } from 'next/server';
import { db } from '../../../../lib/d1/db';
import { currentUser } from '../../../../lib/auth/core';

export const dynamic = 'force-dynamic';
const noStore = { headers: { 'cache-control': 'private, no-store' } };

/** Saved calculations for the signed-in user. Rows are JSON in, JSON out. */
export async function GET(request: Request) {
  const u = await currentUser(request); if (!u) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const q = new URL(request.url).searchParams;
  const limit = Math.min(200, Math.max(1, Number(q.get('limit') ?? 200)));
  const offset = Math.max(0, Number(q.get('offset') ?? 0));
  const rows = (await (await db()).prepare('select id, user_id, mode, name, province, inputs, results, created_at from calculation_history where user_id = ? order by created_at desc limit ? offset ?').bind(u.id, limit, offset).all<Record<string, string>>()).results;
  return NextResponse.json(rows.map((r) => ({ ...r, inputs: JSON.parse(r.inputs || 'null'), results: JSON.parse(r.results || 'null') })), noStore);
}

export async function POST(request: Request) {
  const u = await currentUser(request); if (!u) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  let b: { id?: string; mode?: string; name?: string; province?: string; inputs?: unknown; results?: unknown };
  try { b = await request.json(); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  const id = (b.id && String(b.id).slice(0, 64)) || crypto.randomUUID();
  const createdAt = (b as { created_at?: string }).created_at && /^\d{4}-\d{2}-\d{2}T/.test(String((b as { created_at?: string }).created_at)) ? String((b as { created_at?: string }).created_at) : new Date().toISOString();
  await (await db()).prepare('insert into calculation_history (id, user_id, mode, name, province, inputs, results, created_at) values (?,?,?,?,?,?,?,?) on conflict(id) do update set name=excluded.name, inputs=excluded.inputs, results=excluded.results where user_id = ?')
    .bind(id, u.id, String(b.mode ?? '').slice(0, 20), b.name ? String(b.name).slice(0, 120) : null, String(b.province ?? '').slice(0, 40), JSON.stringify(b.inputs ?? null), JSON.stringify(b.results ?? null), createdAt, u.id).run();
  return NextResponse.json({ id }, noStore);
}

export async function DELETE(request: Request) {
  const u = await currentUser(request); if (!u) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const q = new URL(request.url).searchParams;
  if (q.get('all') === '1') {
    await (await db()).prepare('delete from calculation_history where user_id = ?').bind(u.id).run();
    return NextResponse.json({ ok: true }, noStore);
  }
  const id = q.get('id') ?? '';
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await (await db()).prepare('delete from calculation_history where id = ? and user_id = ?').bind(id, u.id).run();
  return NextResponse.json({ ok: true }, noStore);
}
