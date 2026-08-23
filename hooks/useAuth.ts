'use client';
import { useEffect, useState, useCallback } from 'react';

/**
 * Sign-in on CanPay's own auth (Cloudflare, lib/auth). Replaces Supabase
 * Auth. The session is an httpOnly cookie set by /api/auth/*, so this hook
 * never sees a token — it only asks /api/auth/me who the cookie belongs to.
 *
 * The `user` shape mirrors what the UI already read from Supabase
 * (email, user_metadata.full_name / avatar_url) so no component changed.
 *
 * Passwords: there are none. "signInWithPassword" survives only for the
 * App Review accounts (@canpayinsights.ca), which Apple needs to log in
 * with; it is rejected for everyone else. "signUpWithPassword" just sends
 * a magic link — creating an account IS signing in.
 */
export type OAuthProvider = 'google' | 'apple';

export type AuthUser = {
  id: string;
  email: string;
  user_metadata: { full_name: string | null; avatar_url: string | null; name?: string | null; picture?: string | null };
  provider: string | null;
  created_at: string;
};

export interface AuthState {
  user: AuthUser | null;
  session: { user: AuthUser } | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export interface AuthActions {
  signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
  signInWithEmail: (email: string) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

type ApiUser = { id: string; email: string; name: string | null; avatar_url: string | null; provider: string | null; created_at: string };
const toUser = (u: ApiUser | null): AuthUser | null =>
  u ? { id: u.id, email: u.email, user_metadata: { full_name: u.name, avatar_url: u.avatar_url }, provider: u.provider, created_at: u.created_at } : null;

async function me(): Promise<AuthUser | null> {
  try {
    const r = await fetch('/api/auth/me', { cache: 'no-store', credentials: 'same-origin' });
    if (!r.ok) return null;
    return toUser(((await r.json()) as { user: ApiUser | null }).user);
  } catch {
    return null;
  }
}

export const useAuth = (): AuthState & AuthActions => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    me().then((u) => { if (alive) { setUser(u); setLoading(false); } });
    // Another tab signing in/out shows up on focus.
    const onFocus = () => me().then((u) => alive && setUser(u));
    window.addEventListener('focus', onFocus);
    return () => { alive = false; window.removeEventListener('focus', onFocus); };
  }, []);

  const signInWithOAuth = useCallback(async (provider: OAuthProvider) => {
    const redirect = window.location.pathname + window.location.search;
    const path = provider === 'apple' ? '/api/auth/apple/start' : '/api/auth/google';
    window.location.href = `${path}?redirect=${encodeURIComponent(redirect)}`;
  }, []);

  const signInWithEmail = useCallback(async (email: string) => {
    const redirect = window.location.pathname + window.location.search;
    const r = await fetch('/api/auth/magic', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, redirect }),
    });
    if (!r.ok) throw new Error(((await r.json().catch(() => ({}))) as { error?: string }).error || 'Could not send the sign-in link.');
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const r = await fetch('/api/auth/password', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!r.ok) throw new Error(((await r.json().catch(() => ({}))) as { error?: string }).error || 'Sign-in failed.');
    setUser(await me());
  }, []);

  // There is no password to set up: an account is created by the first
  // sign-in link. Same call, same result.
  const signUpWithPassword = useCallback(async (email: string) => signInWithEmail(email), [signInWithEmail]);

  const signOut = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    setUser(null);
  }, []);

  const refreshSession = useCallback(async () => { setUser(await me()); }, []);

  return {
    user,
    session: user ? { user } : null,
    loading,
    isAuthenticated: !!user,
    signInWithOAuth,
    signInWithEmail,
    signInWithPassword,
    signUpWithPassword,
    signOut,
    refreshSession,
  };
};

// 便捷 Hook - 只使用 Google 登录（向后兼容）
export const useGoogleAuth = () => {
  const auth = useAuth();
  return { ...auth, signInWithGoogle: () => auth.signInWithOAuth('google') };
};
