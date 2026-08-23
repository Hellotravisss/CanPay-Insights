import { secret } from '../../../../../lib/d1/db';
import { randomToken } from '../../../../../lib/auth/core';

export const dynamic = 'force-dynamic';

/**
 * Sign in with Apple on the web. Needs an Apple "Services ID" whose return
 * URL is /api/auth/apple/callback. We ask for `code id_token` with
 * form_post, so Apple POSTs a signed id_token straight back — no client
 * secret or key file is needed to verify who signed in.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const servicesId = await secret('APPLE_SERVICES_ID');
  if (!servicesId) return Response.redirect(`${url.origin}/?auth=apple-unavailable`, 302);
  const state = randomToken(16);
  const redirect = url.searchParams.get('redirect') ?? '/';
  const params = new URLSearchParams({
    client_id: servicesId,
    redirect_uri: `${url.origin}/api/auth/apple/callback`,
    response_type: 'code id_token',
    response_mode: 'form_post',
    scope: 'name email',
    state,
  });
  // form_post arrives cross-site, so the state cookie must be SameSite=None.
  const stateCookie = `cp_apple=${state}.${btoa(redirect).replace(/=+$/, '')}; Path=/api/auth/apple; Max-Age=600; HttpOnly; Secure; SameSite=None`;
  return new Response(null, { status: 302, headers: { Location: `https://appleid.apple.com/auth/authorize?${params}`, 'Set-Cookie': stateCookie } });
}
