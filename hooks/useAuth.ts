import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session, Provider } from '@supabase/supabase-js';

export type OAuthProvider = 'google';

// Parse hash params from URL
const parseHashParams = (hash: string): Record<string, string> => {
  const params: Record<string, string> = {};
  const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash;
  cleanHash.split('&').forEach(pair => {
    const [key, value] = pair.split('=');
    if (key && value) {
      params[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  });
  return params;
};

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export interface AuthActions {
  signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
  signInWithEmail: (email: string) => Promise<void>;
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
          console.log('Found OAuth callback in URL, extracting tokens...');
          
          const params = parseHashParams(hash);
          const accessToken = params['access_token'];
          const refreshToken = params['refresh_token'];
          const tokenType = params['token_type'];
          
          console.log('Access token present:', !!accessToken);
          console.log('Refresh token present:', !!refreshToken);
          
          if (accessToken) {
            // 使用 setSession 手动设置 session
            const { data: { session }, error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            
            if (setSessionError) {
              console.error('Error setting session:', setSessionError);
            } else if (session) {
              console.log('Session set successfully:', session.user?.email);
              setSession(session);
              setUser(session.user);
              
              // 清除 URL hash
              window.history.replaceState(null, '', window.location.pathname);
              setLoading(false);
              return;
            }
          }
        }
        
        // 正常获取 session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else {
          console.log('Session loaded:', session?.user?.email || 'none');
        }
        
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

  // 邮箱 Magic Link 登录
  const signInWithEmail = useCallback(async (email: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectUrl },
    });
    if (error) {
      console.error('Error signing in with email:', error);
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
    signInWithEmail,
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
