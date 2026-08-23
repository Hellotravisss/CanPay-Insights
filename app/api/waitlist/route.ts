import { NextResponse } from 'next/server';
import { db } from '../../../lib/d1/db';

export const dynamic = 'force-dynamic';

/** Fake-door waitlist. PII (an email) in its own table, never joined to events. */
export async function POST(request: Request) {
  let body: { product?: string; email?: string; lang?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  const email = String(body.email ?? '').trim().slice(0, 200);
  const product = String(body.product ?? '').slice(0, 40);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !product) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  await (await db()).prepare('insert into product_waitlist (product, email, lang) values (?,?,?)').bind(product, email, String(body.lang ?? '').slice(0, 8) || null).run();
  return NextResponse.json({ ok: true });
}
