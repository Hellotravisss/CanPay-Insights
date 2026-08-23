import { NextResponse } from 'next/server';
import { sessionCookie } from '../../../../lib/auth/core';

export const dynamic = 'force-dynamic';

export async function POST() {
  return NextResponse.json({ ok: true }, { headers: { 'Set-Cookie': sessionCookie(null) } });
}
