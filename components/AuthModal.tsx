'use client';
import React, { useState } from 'react';
import type { OAuthProvider } from '../hooks/useAuth';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (provider: OAuthProvider) => void;
  onSignInWithEmail: (email: string) => Promise<void>;
  message?: string;
}

const AuthModal: React.FC<Props> = ({ isOpen, onClose, onSignIn, onSignInWithEmail, message }) => {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  if (!isOpen) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setEmailLoading(true);
    setEmailError('');
    try {
      await onSignInWithEmail(email.trim());
      setEmailSent(true);
    } catch {
      setEmailError('Failed to send email. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
          Save Your Data
        </h2>

        <p className="text-slate-600 text-center mb-6 leading-relaxed">
          {message || 'Sign in to save your calculations and access them from any device. Your data syncs automatically.'}
        </p>

        {/* Benefits */}
        <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-3">
          {[
            { title: 'Auto-save your inputs', desc: 'Never re-enter the same numbers' },
            { title: 'Sync across devices', desc: 'Phone, tablet, or computer' },
            { title: 'Secure timesheet storage', desc: 'Never lose your work hours again' },
          ].map(({ title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-slate-800">{title}</p>
                <p className="text-xs text-slate-600">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {emailSent ? (
          /* Success state */
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-semibold text-slate-800 mb-1">Check your email!</p>
            <p className="text-sm text-slate-600">
              We sent a sign-in link to <span className="font-medium">{email}</span>.<br />
              Click the link to sign in — no password needed.
            </p>
            <button
              onClick={() => { setEmailSent(false); setEmail(''); }}
              className="mt-4 text-sm text-slate-500 hover:text-slate-700 underline"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <>
            {/* Google button */}
            <button
              onClick={() => onSignIn('google')}
              className="w-full bg-white hover:bg-gray-50 border border-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-3 hover:shadow-md active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400">or</span>
              </div>
            </div>

            {/* Email form */}
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full border border-slate-200 rounded-lg py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
              />
              {emailError && (
                <p className="text-xs text-red-500">{emailError}</p>
              )}
              <button
                type="submit"
                disabled={emailLoading || !email.trim()}
                className="w-full bg-red-500 hover:bg-red-600 disabled:bg-slate-300 text-white font-semibold py-3 px-4 rounded-lg transition-all hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed"
              >
                {emailLoading ? 'Sending...' : 'Continue with Email'}
              </button>
            </form>
          </>
        )}

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
        </div>

        {/* Continue without sign in */}
        <button
          onClick={onClose}
          className="w-full text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
        >
          Continue without signing in
        </button>

        {/* Privacy note */}
        <p className="text-xs text-slate-400 text-center mt-4">
          Free forever. No credit card required. We never post to your accounts.
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
