import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const UserMenu: React.FC = () => {
  const { user, signOut, signInWithGoogle, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
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

  if (!isAuthenticated) {
    return (
      <button
        onClick={signInWithGoogle}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all text-sm font-medium shadow-sm hover:shadow-md"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Sign In
      </button>
    );
  }

  // Get user initials
  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
      >
        <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
          {getInitials(user?.email || '')}
        </div>
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
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg backdrop-blur-sm">
                {getInitials(user?.email || '')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{user?.email}</p>
                <p className="text-xs text-red-100">Free Account</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
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
  );
};

export default UserMenu;
