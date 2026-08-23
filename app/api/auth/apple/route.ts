import { NextResponse } from 'next/server';
import { db, secret } from '../../../../lib/d1/db';
import { signInAs, verifyIdToken } from '../../../../lib/auth/core';

export const dynamic = 'force-dynamic';

/**
 * Native Sign in with Apple from the iOS app: the app sends Apple's identity
 * token; we verify it against Apple's keys (audience = our bundle id) and
 * issue our session. Apple only supplies the name on the very first sign-in,
 * so the app passes it along when it has it.
 */
export async function POST(request: Request) {
  let body: { identityToken?: string; name?: string | null };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  const bundle = (await secret('APPLE_BUNDLE_ID')) ?? 'com.canpay.insights';
  let claims: Record<string, unknown>;
  try {
    claims = await verifyIdToken(String(body.identityToken ?? ''), 'https://appleid.apple.com/auth/keys', ['https://appleid.apple.com'], [bundle]);
  } catch (e) { return NextResponse.json({ error: `invalid apple token: ${(e as Error).message}` }, { status: 401 }); }
  const email = claims.email as string | undefined;
  if (!email) return NextResponse.json({ error: 'no email in token' }, { status: 400 });
  const { user, token } = await signInAs(await db(), email, 'apple', { name: body.name ?? null });
  return NextResponse.json({ token, user });
}
