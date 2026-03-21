import React, { Component, type ReactNode, type ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('[KubeSignal] Uncaught error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[300px] flex items-center justify-center p-6">
          <div className="error-boundary-card max-w-sm w-full text-center space-y-4 p-6 rounded-2xl">
            {/* Icon */}
            <div className="mx-auto w-14 h-14 rounded-2xl bg-red-500/15 flex items-center justify-center">
              <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>

            {/* Message */}
            <div>
              <h3 className="text-base font-semibold text-k8s-text mb-1">Something went wrong</h3>
              <p className="text-xs text-k8s-muted leading-relaxed">
                KubeSignal encountered an unexpected error. This won't affect your saved data.
              </p>
            </div>

            {/* Error details (collapsed) */}
            {this.state.error && (
              <details className="text-left">
                <summary className="text-[11px] text-k8s-muted cursor-pointer hover:text-k8s-text transition-colors">
                  Error details
                </summary>
                <pre className="mt-2 p-2 rounded-lg bg-k8s-bg border border-k8s-border text-[10px] text-red-400 overflow-x-auto whitespace-pre-wrap break-all max-h-24 overflow-y-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}

            {/* Retry */}
            <button
              onClick={this.handleRetry}
              className="btn-primary text-sm px-6 py-2"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
