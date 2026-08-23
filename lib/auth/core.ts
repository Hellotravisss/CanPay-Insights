import { db, secret, type D1 } from '../d1/db';

/**
 * CanPay's own sign-in, on Cloudflare. Three ways in, one session format:
 *   - magic link by email (anyone; sent from info@canpayinsights.ca)
 *   - Google (web redirect flow; the iOS app uses the same flow in a browser)
 *   - Apple (native identity token from the iOS app)
 *
 * A session is a compact HS256 JWT: { sub, sv, exp }. `sv` is the user's
 * session_version — bump it and every token ever issued for that user dies.
 * The web gets it in an httpOnly cookie; the app keeps it as a bearer token.
 * No passwords exist anywhere in this system.
 */

export type User = { id: string; email: string; name: string | null; avatar_url: string | null; provider: string | null; created_at: string };

const COOKIE = 'cp_session';
const SESSION_DAYS = 30;
const te = new TextEncoder();

// ── base64url / crypto helpers ─────────────────────────────────────────────
const b64u = (buf: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64uDecode = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4)), (c) => c.charCodeAt(0));
export async function sha256Hex(s: string): Promise<string> {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', te.encode(s)))].map((b) => b.toString(16).padStart(2, '0')).join('');
}
export function randomToken(bytes = 32): string {
  const a = new Uint8Array(bytes); crypto.getRandomValues(a); return b64u(a);
}
async function hmacKey(): Promise<CryptoKey> {
  const s = await secret('AUTH_SECRET');
  if (!s) throw new Error('AUTH_SECRET missing');
  return crypto.subtle.importKey('raw', te.encode(s), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

// ── sessions ──────────────────────────────────────────────────────────────
export async function signSession(userId: string, sessionVersion: number): Promise<string> {
  const header = b64u(te.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const payload = b64u(te.encode(JSON.stringify({ sub: userId, sv: sessionVersion, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + SESSION_DAYS * 86400 })));
  const sig = b64u(await crypto.subtle.sign('HMAC', await hmacKey(), te.encode(`${header}.${payload}`)));
  return `${header}.${payload}.${sig}`;
}

async function verifySession(token: string): Promise<{ sub: string; sv: number } | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const ok = await crypto.subtle.verify('HMAC', await hmacKey(), b64uDecode(parts[2]), te.encode(`${parts[0]}.${parts[1]}`));
  if (!ok) return null;
  const p = JSON.parse(new TextDecoder().decode(b64uDecode(parts[1]))) as { sub: string; sv: number; exp: number };
  if (!p.sub || p.exp < Date.now() / 1000) return null;
  return { sub: p.sub, sv: p.sv };
}

export function sessionCookie(token: string | null): string {
  // Secure + HttpOnly + Lax: sent on top-level navigations (the magic-link
  // redirect) and same-site fetches, never readable by scripts.
  return token
    ? `${COOKIE}=${token}; Path=/; Max-Age=${SESSION_DAYS * 86400}; HttpOnly; Secure; SameSite=Lax`
    : `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}

function tokenFrom(request: Request): string | null {
  const auth = request.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7).trim();
  const m = request.headers.get('cookie')?.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  return m ? m[1] : null;
}

/** The signed-in user for this request, or null. */
export async function currentUser(request: Request): Promise<User | null> {
  const t = tokenFrom(request);
  if (!t) return null;
  const s = await verifySession(t);
  if (!s) return null;
  const d = await db();
  const u = await d.prepare('select id, email, name, avatar_url, provider, created_at, session_version from users where id = ?').bind(s.sub).first<User & { session_version: number }>();
  if (!u || u.session_version !== s.sv) return null;
  const { session_version, ...user } = u; void session_version;
  return user;
}

// ── users ─────────────────────────────────────────────────────────────────
/** Find or create by email (case-insensitive). Returns the user and a fresh session token. */
export async function signInAs(d: D1, email: string, provider: string, profile: { name?: string | null; avatar?: string | null } = {}): Promise<{ user: User; token: string }> {
  const mail = email.trim().toLowerCase();
  let u = await d.prepare('select id, email, name, avatar_url, provider, created_at, session_version from users where lower(email) = ?').bind(mail).first<User & { session_version: number }>();
  const now = new Date().toISOString();
  if (!u) {
    const id = crypto.randomUUID();
    await d.prepare('insert into users (id, email, name, avatar_url, provider, created_at, last_login) values (?,?,?,?,?,?,?)')
      .bind(id, mail, profile.name ?? null, profile.avatar ?? null, provider, now, now).run();
    u = { id, email: mail, name: profile.name ?? null, avatar_url: profile.avatar ?? null, provider, created_at: now, session_version: 1 };
  } else {
    await d.prepare('update users set last_login = ?, name = coalesce(name, ?), avatar_url = coalesce(avatar_url, ?) where id = ?')
      .bind(now, profile.name ?? null, profile.avatar ?? null, u.id).run();
  }
  const token = await signSession(u.id, u.session_version);
  const { session_version, ...user } = u; void session_version;
  return { user, token };
}

// ── magic links ───────────────────────────────────────────────────────────
export async function createMagicToken(d: D1, email: string, redirect: string | null): Promise<string> {
  const token = randomToken(32);
  await d.prepare('insert into auth_tokens (token_hash, email, redirect, expires_at) values (?,?,?,?)')
    .bind(await sha256Hex(token), email.trim().toLowerCase(), redirect, new Date(Date.now() + 15 * 60_000).toISOString()).run();
  return token;
}

/** Consume a magic token exactly once. */
export async function consumeMagicToken(d: D1, token: string): Promise<{ email: string; redirect: string | null } | null> {
  const h = await sha256Hex(token);
  const row = await d.prepare('select email, redirect, expires_at, used_at from auth_tokens where token_hash = ?').bind(h).first<{ email: string; redirect: string | null; expires_at: string; used_at: string | null }>();
  if (!row || row.used_at || row.expires_at < new Date().toISOString()) return null;
  await d.prepare('update auth_tokens set used_at = ? where token_hash = ? and used_at is null').bind(new Date().toISOString(), h).run();
  return { email: row.email, redirect: row.redirect };
}

/** Only same-origin paths or the app's own scheme may be redirect targets. */
export function safeRedirect(r: string | null | undefined, origin: string): string {
  if (!r) return `${origin}/`;
  if (r.startsWith('canpay://')) return r;
  if (r.startsWith('/') && !r.startsWith('//')) return `${origin}${r}`;
  try { const u = new URL(r); if (u.origin === origin) return u.toString(); } catch { /* fallthrough */ }
  return `${origin}/`;
}

// ── identity tokens from Google / Apple ───────────────────────────────────
type Jwk = JsonWebKey & { kid: string };
const jwksCache = new Map<string, { keys: Jwk[]; at: number }>();
async function jwks(url: string): Promise<Jwk[]> {
  const c = jwksCache.get(url);
  if (c && Date.now() - c.at < 3600_000) return c.keys;
  const keys = ((await (await fetch(url)).json()) as { keys: Jwk[] }).keys;
  jwksCache.set(url, { keys, at: Date.now() });
  return keys;
}

/** Verify an RS256 id_token against a JWKS and return its claims. */
export async function verifyIdToken(token: string, jwksUrl: string, issuers: string[], audiences: string[]): Promise<Record<string, unknown>> {
  const [h, p, s] = token.split('.');
  if (!h || !p || !s) throw new Error('malformed token');
  const header = JSON.parse(new TextDecoder().decode(b64uDecode(h))) as { kid: string; alg: string };
  if (header.alg !== 'RS256') throw new Error('unexpected alg');
  const jwk = (await jwks(jwksUrl)).find((k) => k.kid === header.kid);
  if (!jwk) throw new Error('unknown key');
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64uDecode(s), te.encode(`${h}.${p}`));
  if (!ok) throw new Error('bad signature');
  const claims = JSON.parse(new TextDecoder().decode(b64uDecode(p))) as Record<string, unknown>;
  if (!issuers.includes(String(claims.iss))) throw new Error('bad issuer');
  const aud = Array.isArray(claims.aud) ? (claims.aud as string[]) : [String(claims.aud)];
  if (!aud.some((a) => audiences.includes(a))) throw new Error('bad audience');
  if (Number(claims.exp) < Date.now() / 1000) throw new Error('expired');
  return claims;
}
