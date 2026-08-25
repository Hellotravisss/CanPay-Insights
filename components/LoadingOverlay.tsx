'use client';
import { ThinkingOrb } from 'thinking-orbs';
import React from 'react';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isLoading, 
  message = 'Loading...' 
}) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/80 backdrop-blur-sm transition-opacity duration-300">
      <div className="flex flex-col items-center gap-4">
        {/* The waiting animation. thinking-orbs (MIT, Jakub Antalik) — canvas
            2D, pauses itself offscreen and in hidden tabs, and renders a single
            static frame under prefers-reduced-motion. The brand mark sits
            beside it rather than being animated: the logo is a fixed asset,
            never something we redraw or distort. */}
        <div className="flex items-center gap-4">
          <img
            src="/logo.png"
            alt=""
            aria-hidden="true"
            className="h-12 w-12 rounded-xl object-contain"
          />
          <ThinkingOrb state="solving" size={64} theme="light" aria-label={message} />
        </div>

        {/* Message */}
        <p className="text-slate-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
