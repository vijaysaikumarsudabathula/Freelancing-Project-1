import React, { useState, useEffect } from 'react';
import { onBackendDown, onBackendRecovered, attemptRecovery } from '../services/backendRecovery';

interface BackendStatusBannerProps {
  isDarkMode?: boolean;
}

const BackendStatusBanner: React.FC<BackendStatusBannerProps> = ({ isDarkMode = false }) => {
  const [isBackendDown, setIsBackendDown] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [failureCount, setFailureCount] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Listen to backend down
    onBackendDown((detail) => {
      setIsBackendDown(true);
      setFailureCount(detail.failureCount || 1);
      setIsDismissed(false); // Reset dismiss when error occurs
    });

    // Listen to backend recovered
    onBackendRecovered((detail) => {
      setIsBackendDown(false);
      setIsRecovering(false);
      setFailureCount(0);
      setIsDismissed(false);
    });
  }, []);

  const handleRetry = async () => {
    setIsRecovering(true);
    const recovered = await attemptRecovery(3);
    if (!recovered) {
      setIsRecovering(false);
    }
  };

  if (!isBackendDown || isDismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] bg-red-500 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 md:py-3 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="text-base sm:text-lg md:text-2xl flex-shrink-0">⚠️</div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-xs sm:text-sm md:text-base truncate">Backend Server Unavailable</p>
            <p className="text-[10px] sm:text-xs md:text-sm text-red-100 truncate">
              Some features may be limited. 
              {failureCount > 2 && ` (${failureCount} attempts)`}
            </p>
          </div>
        </div>

        <div className="flex gap-1 sm:gap-2 flex-shrink-0">
          <button
            onClick={handleRetry}
            disabled={isRecovering}
            className="px-2 sm:px-4 md:px-6 py-1 md:py-2 bg-white text-red-500 font-bold rounded-lg hover:bg-red-50 disabled:opacity-50 transition-all text-[9px] sm:text-xs md:text-sm whitespace-nowrap"
          >
            {isRecovering ? '⏳' : '🔄'}
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="px-2 sm:px-3 py-1 md:py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all text-[9px] sm:text-xs md:text-sm font-bold"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackendStatusBanner;
