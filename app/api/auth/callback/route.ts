import { db } from '../../../../lib/d1/db';
import { consumeMagicToken, signInAs, sessionCookie, safeRedirect } from '../../../../lib/auth/core';

export const dynamic = 'force-dynamic';

/** Magic-link landing: consume the token, sign in, set the cookie, redirect. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token') ?? '';
  const d = await db();
  const hit = token ? await consumeMagicToken(d, token) : null;
  if (!hit) return Response.redirect(`${url.origin}/?auth=expired`, 302);
  const { token: session } = await signInAs(d, hit.email, 'email');
  const target = safeRedirect(hit.redirect, url.origin);
  // The iOS app gets the session in the fragment of its own scheme.
  if (target.startsWith('canpay://')) return Response.redirect(`${target}#token=${session}`, 302);
  return new Response(null, { status: 302, headers: { Location: target, 'Set-Cookie': sessionCookie(session) } });
}
