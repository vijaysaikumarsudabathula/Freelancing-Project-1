import React, { useState, useEffect } from 'react';
import { onBackendDown, onBackendRecovered, attemptRecovery } from '../services/backendRecovery';

interface BackendStatusBannerProps {
  isDarkMode?: boolean;
}

const BackendStatusBanner: React.FC<BackendStatusBannerProps> = ({ isDarkMode = false }) => {
  const [isBackendDown, setIsBackendDown] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [failureCount, setFailureCount] = useState(0);

  useEffect(() => {
    // Listen to backend down
    onBackendDown((detail) => {
      setIsBackendDown(true);
      setFailureCount(detail.failureCount || 1);
    });

    // Listen to backend recovered
    onBackendRecovered((detail) => {
      setIsBackendDown(false);
      setIsRecovering(false);
      setFailureCount(0);
    });
  }, []);

  const handleRetry = async () => {
    setIsRecovering(true);
    const recovered = await attemptRecovery(3);
    if (!recovered) {
      setIsRecovering(false);
    }
  };

  if (!isBackendDown) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] bg-red-500 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-xl md:text-2xl">⚠️</div>
          <div className="flex-1">
            <p className="font-bold text-sm md:text-base">Backend Server Unavailable</p>
            <p className="text-xs md:text-sm text-red-100">
              The server is temporarily down. Some features may be limited. 
              {failureCount > 2 && ` (${failureCount} attempts)`}
            </p>
          </div>
        </div>

        <button
          onClick={handleRetry}
          disabled={isRecovering}
          className="flex-shrink-0 px-4 md:px-6 py-2 bg-white text-red-500 font-bold rounded-lg hover:bg-red-50 disabled:opacity-50 transition-all text-xs md:text-sm whitespace-nowrap"
        >
          {isRecovering ? '⏳ Retrying...' : '🔄 Retry'}
        </button>
      </div>
    </div>
  );
};

export default BackendStatusBanner;
