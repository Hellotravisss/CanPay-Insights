import React, { useState, useRef, useEffect } from 'react';
import { useAuth, type OAuthProvider } from '../hooks/useAuth';
import AuthModal from './AuthModal';

const UserMenu: React.FC = () => {
  const { user, signOut, signInWithOAuth, isAuthenticated, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle sign in
  const handleSignIn = async (provider: OAuthProvider) => {
    try {
      await signInWithOAuth(provider);
      setShowAuthModal(false);
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 text-slate-400">
        <div className="w-5 h-5 border-2 border-slate-300 border-t-red-600 rounded-full animate-spin"></div>
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  // Not authenticated - Show sign in button
  if (!isAuthenticated) {
    return (
      <>
        <button
          onClick={() => setShowAuthModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all text-sm font-medium shadow-sm hover:shadow-md"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Sign In
        </button>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSignIn={handleSignIn}
        />
      </>
    );
  }

  // Get user display info
  const getUserDisplayInfo = () => {
    const email = user?.email || '';
    const name = user?.user_metadata?.full_name || user?.user_metadata?.name || '';
    const avatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || '';
    
    // 从邮箱获取用户名
    const username = email.split('@')[0];
    
    // 获取首字母
    const initials = name 
      ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
      : username.slice(0, 2).toUpperCase();
    
    return { email, name: name || username, avatar, initials };
  };

  const { email, name, avatar, initials } = getUserDisplayInfo();

  // Authenticated - Show user menu
  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* User Avatar Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
        >
          {avatar ? (
            <img 
              src={avatar} 
              alt={name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              {initials}
            </div>
          )}
          <svg className={`w-4 h-4 text-slate-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
            {/* User Info */}
            <div className="bg-gradient-to-br from-red-600 to-red-700 p-4 text-white">
              <div className="flex items-center gap-3">
                {avatar ? (
                  <img 
                    src={avatar} 
                    alt={name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                  />
                ) : (
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg backdrop-blur-sm">
                    {initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{name}</p>
                  <p className="text-xs text-red-100 truncate">{email}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              {/* Sync Status */}
              <div className="px-3 py-2 mb-2">
                <div className="flex items-center gap-2 text-xs text-green-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Synced to cloud</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsOpen(false);
                  // TODO: Navigate to history page
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium">Calculation History</p>
                  <p className="text-xs text-slate-500">View past calculations</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  // TODO: Navigate to timesheet page
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left mt-1"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm font-medium">My Timesheets</p>
                  <p className="text-xs text-slate-500">Saved timesheet entries</p>
                </div>
              </button>

              <div className="border-t border-slate-200 my-2"></div>

              <button
                onClick={() => {
                  signOut();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <p className="text-sm font-medium">Sign Out</p>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UserMenu;
