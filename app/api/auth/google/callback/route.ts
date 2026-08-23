import { db, secret } from '../../../../../lib/d1/db';
import { signInAs, sessionCookie, safeRedirect, verifyIdToken } from '../../../../../lib/auth/core';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const m = request.headers.get('cookie')?.match(/(?:^|;\s*)cp_oauth=([^.;]+)\.([^;]*)/);
  if (!code || !state || !m || m[1] !== state) return Response.redirect(`${url.origin}/?auth=failed`, 302);
  const redirect = atob(m[2]);

  const clientId = await secret('GOOGLE_CLIENT_ID'); const clientSecret = await secret('GOOGLE_CLIENT_SECRET');
  const tok = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: clientId!, client_secret: clientSecret!, redirect_uri: `${url.origin}/api/auth/google/callback`, grant_type: 'authorization_code' }),
  });
  if (!tok.ok) return Response.redirect(`${url.origin}/?auth=failed`, 302);
  const { id_token } = (await tok.json()) as { id_token: string };
  let claims: Record<string, unknown>;
  try {
    claims = await verifyIdToken(id_token, 'https://www.googleapis.com/oauth2/v3/certs', ['https://accounts.google.com', 'accounts.google.com'], [clientId!]);
  } catch { return Response.redirect(`${url.origin}/?auth=failed`, 302); }
  if (!claims.email || claims.email_verified === false) return Response.redirect(`${url.origin}/?auth=failed`, 302);

  const { token: session } = await signInAs(await db(), String(claims.email), 'google', { name: (claims.name as string) ?? null, avatar: (claims.picture as string) ?? null });
  const target = safeRedirect(redirect, url.origin);
  const clear = 'cp_oauth=; Path=/api/auth/google; Max-Age=0; HttpOnly; Secure; SameSite=Lax';
  if (target.startsWith('canpay://')) return new Response(null, { status: 302, headers: { Location: `${target}#token=${session}`, 'Set-Cookie': clear } });
  const h = new Headers({ Location: target }); h.append('Set-Cookie', sessionCookie(session)); h.append('Set-Cookie', clear);
  return new Response(null, { status: 302, headers: h });
}
