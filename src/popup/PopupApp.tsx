import React, { useState } from 'react';
import { useStreaming } from '../shared/useStreaming';
import { StreamingOutput } from '../components/StreamingOutput';
import { CopyButton } from '../components/CopyButton';
import { SeverityBadge, extractSeverity } from '../components/SeverityBadge';

export function PopupApp() {
  const [alertText, setAlertText] = useState('');
  const { output, isStreaming, error, send, reset } = useStreaming();

  const handleAnalyze = () => {
    if (!alertText.trim()) return;
    send('ANALYZE_ALERT', alertText.trim());
  };

  const handleOpenSidePanel = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.sidePanel?.open({ tabId: tabs[0].id });
      }
    });
  };

  const severity = output ? extractSeverity(output) : null;

  return (
    <div className="w-[420px] min-h-[500px] flex flex-col bg-k8s-bg">
      {/* Header */}
      <div className="bg-k8s-surface border-b border-k8s-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-k8s-accent rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-k8s-text">K8s Alert Summarizer</h1>
              <p className="text-[10px] text-k8s-muted">AI-powered alert analysis</p>
            </div>
          </div>
          <button
            onClick={handleOpenSidePanel}
            className="btn-secondary text-[11px] px-2.5 py-1.5"
            title="Open full workspace"
          >
            Full View
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        <div>
          <label className="block text-xs font-medium text-k8s-muted mb-1.5">
            Paste alert (JSON or text)
          </label>
          <textarea
            className="textarea-field h-32"
            placeholder='{"alertname":"KubePodCrashLooping","namespace":"production","pod":"api-server-7f8b9c-x2k4p","severity":"critical",...}'
            value={alertText}
            onChange={(e) => setAlertText(e.target.value)}
            disabled={isStreaming}
          />
        </div>

        <div className="flex gap-2">
          <button
            className="btn-primary flex-1 text-sm"
            onClick={handleAnalyze}
            disabled={isStreaming || !alertText.trim()}
          >
            {isStreaming ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing...
              </span>
            ) : (
              'Analyze Alert'
            )}
          </button>
          {output && (
            <button className="btn-secondary text-sm" onClick={reset}>
              Clear
            </button>
          )}
        </div>

        {/* Severity Badge */}
        {severity && (
          <div className="flex items-center gap-2">
            <SeverityBadge severity={severity} size="lg" />
          </div>
        )}

        {/* Output */}
        <div className="flex-1 min-h-0">
          <StreamingOutput content={output} isStreaming={isStreaming} error={error} />
        </div>

        {/* Copy buttons */}
        {output && !isStreaming && (
          <div className="flex gap-2 pt-1">
            <CopyButton text={output} label="Copy Analysis" />
            <CopyButton
              text={formatSlackSummary(output)}
              label="Copy for Slack"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function formatSlackSummary(analysis: string): string {
  const lines = analysis.split('\n').filter((l) => l.trim());
  const severity = lines.find((l) => /P[0-4]/.test(l)) || '';
  const summary = lines.slice(0, 5).join('\n');
  return `*K8s Alert Analysis*\n${severity}\n${summary}`;
}
