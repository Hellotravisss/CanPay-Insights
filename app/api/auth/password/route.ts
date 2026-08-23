import { NextResponse } from 'next/server';
import { db, secret, tokenOk } from '../../../../lib/d1/db';
import { signInAs, sessionCookie } from '../../../../lib/auth/core';

export const dynamic = 'force-dynamic';

/**
 * The ONLY password sign-in, and it exists for exactly one reason: Apple's
 * App Review needs a demo login, and reviewers cannot click a magic link in
 * our inbox. Restricted to @canpayinsights.ca addresses checked against a
 * single secret. Everyone else gets a passwordless link.
 */
export async function POST(request: Request) {
  let b: { email?: string; password?: string };
  try { b = await request.json(); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  const email = String(b.email ?? '').trim().toLowerCase();
  if (!email.endsWith('@canpayinsights.ca')) {
    return NextResponse.json({ error: 'Passwords are not used here — sign in with the email link or Google.' }, { status: 400 });
  }
  if (!tokenOk(String(b.password ?? ''), await secret('REVIEWER_PASSWORD'))) {
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
  }
  const { token } = await signInAs(await db(), email, 'email');
  return NextResponse.json({ ok: true }, { headers: { 'Set-Cookie': sessionCookie(token) } });
}
