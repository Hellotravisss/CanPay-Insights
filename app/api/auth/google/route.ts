import { secret } from '../../../../lib/d1/db';
import { randomToken } from '../../../../lib/auth/core';

export const dynamic = 'force-dynamic';

/** Start Google sign-in. `redirect` (same-origin path or canpay://) rides in the state cookie. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const clientId = await secret('GOOGLE_CLIENT_ID');
  if (!clientId) return new Response('Google sign-in not configured', { status: 503 });
  const state = randomToken(16);
  const redirect = url.searchParams.get('redirect') ?? '/';
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${url.origin}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  });
  const stateCookie = `cp_oauth=${state}.${btoa(redirect).replace(/=+$/, '')}; Path=/api/auth/google; Max-Age=600; HttpOnly; Secure; SameSite=Lax`;
  return new Response(null, { status: 302, headers: { Location: `https://accounts.google.com/o/oauth2/v2/auth?${params}`, 'Set-Cookie': stateCookie } });
}
