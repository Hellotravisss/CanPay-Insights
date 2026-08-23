import { db, secret } from '../../../../../lib/d1/db';
import { signInAs, sessionCookie, safeRedirect, verifyIdToken } from '../../../../../lib/auth/core';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const url = new URL(request.url);
  const form = await request.formData();
  const idToken = String(form.get('id_token') ?? '');
  const state = String(form.get('state') ?? '');
  const m = request.headers.get('cookie')?.match(/(?:^|;\s*)cp_apple=([^.;]+)\.([^;]*)/);
  if (!idToken || !m || m[1] !== state) return Response.redirect(`${url.origin}/?auth=failed`, 302);
  const servicesId = await secret('APPLE_SERVICES_ID');
  let claims: Record<string, unknown>;
  try {
    claims = await verifyIdToken(idToken, 'https://appleid.apple.com/auth/keys', ['https://appleid.apple.com'], [servicesId!]);
  } catch { return Response.redirect(`${url.origin}/?auth=failed`, 302); }
  const email = claims.email as string | undefined;
  if (!email) return Response.redirect(`${url.origin}/?auth=failed`, 302);
  // Apple sends the name only on first authorization, as a JSON `user` field.
  let name: string | null = null;
  try { const u = JSON.parse(String(form.get('user') ?? 'null')); name = u?.name ? [u.name.firstName, u.name.lastName].filter(Boolean).join(' ') : null; } catch { /* none */ }
  const { token } = await signInAs(await db(), email, 'apple', { name });
  const h = new Headers({ Location: safeRedirect(atob(m[2]), url.origin) });
  h.append('Set-Cookie', sessionCookie(token));
  h.append('Set-Cookie', 'cp_apple=; Path=/api/auth/apple; Max-Age=0; HttpOnly; Secure; SameSite=None');
  return new Response(null, { status: 302, headers: h });
}
