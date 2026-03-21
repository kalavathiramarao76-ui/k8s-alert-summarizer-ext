import React, { useState, useEffect, useCallback } from 'react';

interface ApiErrorFallbackProps {
  error: string;
  onRetry: () => void;
}

const RETRY_DELAY = 10;

export function ApiErrorFallback({ error, onRetry }: ApiErrorFallbackProps) {
  const [countdown, setCountdown] = useState(RETRY_DELAY);
  const [autoRetry, setAutoRetry] = useState(true);

  useEffect(() => {
    if (!autoRetry) return;

    setCountdown(RETRY_DELAY);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onRetry();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRetry, onRetry]);

  const handleCancelAutoRetry = useCallback(() => {
    setAutoRetry(false);
  }, []);

  const handleManualRetry = useCallback(() => {
    setAutoRetry(true);
    onRetry();
  }, [onRetry]);

  const progress = ((RETRY_DELAY - countdown) / RETRY_DELAY) * 100;

  return (
    <div className="api-error-fallback rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-orange-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-k8s-text">API Error</h4>
          <p className="text-xs text-k8s-muted mt-0.5 break-words">{error}</p>
        </div>
      </div>

      {/* Countdown progress */}
      {autoRetry && countdown > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-k8s-muted">
              Retrying in <span className="text-orange-400 font-bold tabular-nums">{countdown}s</span>
            </span>
            <button
              onClick={handleCancelAutoRetry}
              className="text-k8s-muted hover:text-k8s-text transition-colors"
            >
              Cancel
            </button>
          </div>
          <div className="h-1 rounded-full bg-k8s-border overflow-hidden">
            <div
              className="h-full rounded-full bg-orange-400 transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Manual retry */}
      {!autoRetry && (
        <button
          onClick={handleManualRetry}
          className="btn-secondary text-xs px-4 py-1.5 w-full"
        >
          Retry Now
        </button>
      )}
    </div>
  );
}
