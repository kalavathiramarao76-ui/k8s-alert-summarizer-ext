import React, { useState } from 'react';
import { useStreaming } from '../../shared/useStreaming';
import { StreamingOutput } from '../../components/StreamingOutput';
import { CopyButton } from '../../components/CopyButton';

export function AlertCorrelator() {
  const [alerts, setAlerts] = useState<string[]>(['', '']);
  const { output, isStreaming, error, send, reset } = useStreaming();

  const handleAddAlert = () => {
    setAlerts([...alerts, '']);
  };

  const handleRemoveAlert = (index: number) => {
    if (alerts.length <= 2) return;
    setAlerts(alerts.filter((_, i) => i !== index));
  };

  const handleUpdateAlert = (index: number, value: string) => {
    const updated = [...alerts];
    updated[index] = value;
    setAlerts(updated);
  };

  const handleCorrelate = () => {
    const validAlerts = alerts.filter((a) => a.trim());
    if (validAlerts.length < 2) return;
    send('CORRELATE_ALERTS', validAlerts);
  };

  const validCount = alerts.filter((a) => a.trim()).length;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-k8s-text mb-1">Multi-Alert Correlator</h2>
        <p className="text-xs text-k8s-muted">
          Paste multiple alerts to find correlations and common root causes
        </p>
      </div>

      {/* Alert inputs */}
      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div key={index} className="relative">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-k8s-muted">
                Alert {index + 1}
              </span>
              {alerts.length > 2 && (
                <button
                  onClick={() => handleRemoveAlert(index)}
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  Remove
                </button>
              )}
            </div>
            <textarea
              className="textarea-field h-24"
              placeholder={`Paste alert ${index + 1} here...`}
              value={alert}
              onChange={(e) => handleUpdateAlert(index, e.target.value)}
              disabled={isStreaming}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleAddAlert}
          className="btn-secondary text-xs"
          disabled={isStreaming || alerts.length >= 10}
        >
          + Add Alert
        </button>
        <button
          className="btn-primary flex-1 text-sm"
          onClick={handleCorrelate}
          disabled={isStreaming || validCount < 2}
        >
          {isStreaming ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Correlating {validCount} alerts...
            </span>
          ) : (
            `Correlate ${validCount} Alerts`
          )}
        </button>
      </div>

      {/* Output */}
      <StreamingOutput content={output} isStreaming={isStreaming} error={error} />

      {output && !isStreaming && (
        <div className="flex flex-wrap gap-2">
          <CopyButton text={output} label="Copy Analysis" />
          <CopyButton text={extractSlackSummary(output)} label="Copy Slack Summary" />
          <button className="btn-secondary text-xs" onClick={reset}>
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

function extractSlackSummary(text: string): string {
  const slackSection = text.match(/## Slack Summary\n([\s\S]*?)(?=\n##|$)/);
  if (slackSection) return slackSection[1].trim();

  // Fallback: first 10 meaningful lines
  return text
    .split('\n')
    .filter((l) => l.trim() && !l.startsWith('##'))
    .slice(0, 10)
    .join('\n');
}
