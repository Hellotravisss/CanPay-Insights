import React, { useState, useRef, useEffect } from 'react';
import { useAuth, type OAuthProvider } from '../hooks/useAuth';
import { useCalculationHistory, CalculationRecord } from '../hooks/useCalculationHistory';
import AuthModal from './AuthModal';
import { CalculationMode } from '../types';

interface UserMenuProps {
  onSwitchToTimesheet?: () => void;
  onLoadCalculation?: (record: CalculationRecord) => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ onSwitchToTimesheet, onLoadCalculation }) => {
  const { user, signOut, signInWithOAuth, signInWithEmail, isAuthenticated, loading } = useAuth();
  const userId = user?.id || null;
  const { records, isLoading: isHistoryLoading, deleteRecord, clearHistory } = useCalculationHistory(userId);
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
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

  // Handle history item click
  const handleHistoryItemClick = (record: CalculationRecord) => {
    setShowHistoryModal(false);
    setIsOpen(false);
    if (onLoadCalculation) {
      onLoadCalculation(record);
    }
  };

  // Handle timesheet click
  const handleTimesheetClick = () => {
    setIsOpen(false);
    if (onSwitchToTimesheet) {
      onSwitchToTimesheet();
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
          onSignInWithEmail={signInWithEmail}
        />
      </>
    );
  }

  // Get user display info
  const getUserDisplayInfo = () => {
    const email = user?.email || '';
    const name = user?.user_metadata?.full_name || user?.user_metadata?.name || '';
    const avatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || '';
    
    const username = email.split('@')[0];
    
    const initials = name 
      ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
      : username.slice(0, 2).toUpperCase();
    
    return { email, name: name || username, avatar, initials };
  };

  const { email, name, avatar, initials } = getUserDisplayInfo();

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-CA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get mode icon
  const getModeIcon = (mode: CalculationMode) => {
    switch (mode) {
      case CalculationMode.SIMPLE:
        return '⚡';
      case CalculationMode.ANNUAL:
        return '💰';
      case CalculationMode.TIMESHEET:
        return '⏱️';
      default:
        return '📊';
    }
  };

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
                  setShowHistoryModal(true);
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
                onClick={handleTimesheetClick}
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

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Calculation History</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {records.length} saved calculation{records.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
              {isHistoryLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-slate-300 border-t-red-600 rounded-full animate-spin"></div>
                </div>
              ) : records.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-slate-600 font-medium">No calculations saved yet</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Your calculations will appear here when you save them
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {records.map((record) => (
                    <div
                      key={record.id}
                      className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors group"
                    >
                      <div className="flex items-start justify-between">
                        <button
                          onClick={() => handleHistoryItemClick(record)}
                          className="flex-1 text-left"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{getModeIcon(record.mode)}</span>
                            <span className="font-medium text-slate-800">{record.name}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span>{formatDate(record.createdAt)}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="text-green-600 font-medium">
                              Net: ${record.results.netPayPerPeriod?.toFixed(2) || record.results.netPayBiWeekly.toFixed(2)}
                            </span>
                          </div>
                        </button>
                        
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleHistoryItemClick(record)}
                            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(record.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Delete Confirmation */}
                      {showDeleteConfirm === record.id && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg flex items-center justify-between">
                          <p className="text-sm text-red-700">Delete this calculation?</p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className="px-3 py-1 text-sm text-slate-600 hover:text-slate-800"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                deleteRecord(record.id);
                                setShowDeleteConfirm(null);
                              }}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {records.length > 0 && (
              <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all history?')) {
                      clearHistory();
                    }
                  }}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Clear all history
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSignIn={handleSignIn}
        onSignInWithEmail={signInWithEmail}
      />
    </>
  );
};

export default UserMenu;
