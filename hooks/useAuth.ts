import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session, Provider } from '@supabase/supabase-js';

export type OAuthProvider = 'google' | 'facebook' | 'apple';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export interface AuthActions {
  signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const useAuth = (): AuthState & AuthActions => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // 获取当前会话（处理 OAuth 回调）
  useEffect(() => {
    const getSession = async () => {
      try {
        // 检查 URL 中是否有 OAuth 回调的 token
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
          console.log('Found access_token in URL, processing...');
          // 给 Supabase 一点时间处理 URL 中的 token
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        console.log('Session loaded:', session?.user?.email || 'none');
        setSession(session);
        setUser(session?.user ?? null);
      } catch (e) {
        console.error('Unexpected error in getSession:', e);
      } finally {
        setLoading(false);
      }
    };
    
    getSession();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event, 'User:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // OAuth 登录 - 支持 Google, Facebook, Apple, GitHub
  const signInWithOAuth = useCallback(async (provider: OAuthProvider) => {
    const redirectUrl = `${window.location.origin}/`;
    console.log('OAuth redirect URL:', redirectUrl);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: false,
      },
    });
    
    if (error) {
      console.error(`Error signing in with ${provider}:`, error);
      throw error;
    }
  }, []);

  // 登出
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
    setUser(null);
    setSession(null);
  }, []);

  // 刷新会话
  const refreshSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    setUser(session?.user ?? null);
  }, []);

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    signInWithOAuth,
    signOut,
    refreshSession,
  };
};

// 便捷 Hook - 只使用 Google 登录（向后兼容）
export const useGoogleAuth = () => {
  const auth = useAuth();
  
  return {
    ...auth,
    signInWithGoogle: () => auth.signInWithOAuth('google'),
  };
};
