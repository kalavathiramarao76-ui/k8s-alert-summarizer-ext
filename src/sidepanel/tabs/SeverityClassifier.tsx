import React, { useState } from 'react';
import { useStreaming } from '../../shared/useStreaming';
import { StreamingOutput } from '../../components/StreamingOutput';
import { SeverityBadge } from '../../components/SeverityBadge';
import { CopyButton } from '../../components/CopyButton';
import type { Severity } from '../../shared/types';

export function SeverityClassifier() {
  const [alertText, setAlertText] = useState('');
  const [parsedSeverity, setParsedSeverity] = useState<{
    severity: Severity;
    confidence: number;
    reasoning: string;
    impact: string;
    urgency: string;
  } | null>(null);
  const { output, isStreaming, error, send, reset } = useStreaming();

  const handleClassify = () => {
    if (!alertText.trim()) return;
    setParsedSeverity(null);
    send('CLASSIFY_SEVERITY', alertText.trim());
  };

  // Try to parse JSON from output
  React.useEffect(() => {
    if (!output || isStreaming) return;
    try {
      const jsonMatch = output.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.severity) {
          setParsedSeverity(parsed);
        }
      }
    } catch {
      // not valid JSON yet
    }
  }, [output, isStreaming]);

  const handleClear = () => {
    reset();
    setParsedSeverity(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-k8s-text mb-1">Severity Classifier</h2>
        <p className="text-xs text-k8s-muted">
          AI-powered P0-P4 severity classification with confidence scoring
        </p>
      </div>

      {/* Severity legend */}
      <div className="card">
        <h3 className="text-xs font-semibold text-k8s-muted mb-2 uppercase tracking-wider">
          Severity Scale
        </h3>
        <div className="flex flex-wrap gap-2">
          {(['P0', 'P1', 'P2', 'P3', 'P4'] as Severity[]).map((s) => (
            <SeverityBadge key={s} severity={s} />
          ))}
        </div>
      </div>

      {/* Input */}
      <div>
        <label className="block text-xs font-medium text-k8s-muted mb-1.5">
          Alert to classify
        </label>
        <textarea
          className="textarea-field h-32"
          placeholder="Paste an alert to classify its severity..."
          value={alertText}
          onChange={(e) => setAlertText(e.target.value)}
          disabled={isStreaming}
        />
      </div>

      <div className="flex gap-2">
        <button
          className="btn-primary flex-1"
          onClick={handleClassify}
          disabled={isStreaming || !alertText.trim()}
        >
          {isStreaming ? 'Classifying...' : 'Classify Severity'}
        </button>
        {output && (
          <button className="btn-secondary" onClick={handleClear}>
            Clear
          </button>
        )}
      </div>

      {/* Parsed result card */}
      {parsedSeverity && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <SeverityBadge severity={parsedSeverity.severity} size="lg" />
            <div className="text-right">
              <div className="text-xs text-k8s-muted">Confidence</div>
              <div className="text-lg font-bold text-k8s-text">
                {Math.round(parsedSeverity.confidence * 100)}%
              </div>
            </div>
          </div>

          {/* Confidence bar */}
          <div className="w-full bg-k8s-bg rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                parsedSeverity.confidence >= 0.8
                  ? 'bg-green-500'
                  : parsedSeverity.confidence >= 0.5
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${parsedSeverity.confidence * 100}%` }}
            />
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-xs text-k8s-muted">Reasoning:</span>
              <p className="text-sm text-k8s-text">{parsedSeverity.reasoning}</p>
            </div>
            <div>
              <span className="text-xs text-k8s-muted">Impact:</span>
              <p className="text-sm text-k8s-text">{parsedSeverity.impact}</p>
            </div>
            <div>
              <span className="text-xs text-k8s-muted">Urgency:</span>
              <span className={`ml-2 badge ${
                parsedSeverity.urgency === 'immediate' ? 'badge-p0'
                : parsedSeverity.urgency === 'high' ? 'badge-p1'
                : parsedSeverity.urgency === 'medium' ? 'badge-p2'
                : 'badge-p3'
              }`}>
                {parsedSeverity.urgency}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Raw output */}
      {!parsedSeverity && (
        <StreamingOutput content={output} isStreaming={isStreaming} error={error} />
      )}

      {output && !isStreaming && (
        <CopyButton text={output} label="Copy Classification" />
      )}
    </div>
  );
}
