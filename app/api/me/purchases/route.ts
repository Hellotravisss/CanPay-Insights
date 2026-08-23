import { NextResponse } from 'next/server';
import { db } from '../../../../lib/d1/db';
import { currentUser } from '../../../../lib/auth/core';

export const dynamic = 'force-dynamic';

/** "My reports": purchases claimed to this account. Never exposes other buyers. */
export async function GET(request: Request) {
  const u = await currentUser(request); if (!u) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const rows = (await (await db()).prepare('select created_at, product, from_province, to_province, income, income_bracket, stripe_session_id from purchases where user_id = ? and refunded = 0 order by created_at desc').bind(u.id).all()).results;
  return NextResponse.json(rows, { headers: { 'cache-control': 'private, no-store' } });
}
