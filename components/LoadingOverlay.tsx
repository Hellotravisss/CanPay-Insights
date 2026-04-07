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
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center animate-pulse">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-white">
              <rect x="10" y="2" width="4" height="3" rx="0.5" />
              <path d="M4 6h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" />
              <rect x="9" y="10" width="6" height="4" rx="0.5" />
              <path d="M5 14h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z" />
              <rect x="7" y="18" width="3" height="4" rx="0.5" />
              <rect x="14" y="18" width="3" height="4" rx="0.5" />
            </svg>
          </div>
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
