'use client';
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
        {/* Animated Logo */}
        <div className="relative">
          {/* The REAL logo file. Never hand-draw the mark in SVG — that is how
              the wrong logo kept shipping. Single source of truth: public/logo.png. */}
          <img
            src="/logo.png"
            alt=""
            aria-hidden="true"
            className="h-16 w-16 rounded-2xl object-contain animate-pulse"
          />
          {/* Spinning ring */}
          <div className="absolute -inset-2 border-2 border-red-200 border-t-red-600 rounded-2xl animate-spin" />
        </div>
        
        {/* Message */}
        <p className="text-slate-600 font-medium animate-pulse">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
