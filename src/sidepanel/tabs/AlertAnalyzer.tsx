import React, { useState } from 'react';
import { useStreaming } from '../../shared/useStreaming';
import { StreamingOutput } from '../../components/StreamingOutput';
import { CopyButton } from '../../components/CopyButton';
import { SeverityBadge, extractSeverity } from '../../components/SeverityBadge';
import { FavoriteButton } from '../../ui/FavoriteButton';

const SAMPLE_ALERTS = [
  {
    label: 'CrashLooping Pod',
    value: JSON.stringify({
      alertname: 'KubePodCrashLooping',
      namespace: 'production',
      pod: 'api-server-7f8b9c-x2k4p',
      container: 'api-server',
      severity: 'critical',
      message: 'Pod has been restarting 5 times in the last 10 minutes',
      labels: { team: 'platform', service: 'api-gateway' },
    }, null, 2),
  },
  {
    label: 'Node Not Ready',
    value: JSON.stringify({
      alertname: 'KubeNodeNotReady',
      node: 'worker-node-03',
      severity: 'warning',
      condition: 'Ready=False',
      message: 'Node has been in NotReady state for more than 5 minutes',
      labels: { zone: 'us-east-1a', instance_type: 'm5.xlarge' },
    }, null, 2),
  },
  {
    label: 'OOM Killed',
    value: JSON.stringify({
      alertname: 'KubeContainerOOMKilled',
      namespace: 'production',
      pod: 'ml-inference-5c7d8f-abc12',
      container: 'inference-engine',
      severity: 'critical',
      reason: 'OOMKilled',
      last_terminated_reason: 'OOMKilled',
      memory_limit: '2Gi',
      labels: { team: 'ml-platform' },
    }, null, 2),
  },
];

export function AlertAnalyzer() {
  const [alertText, setAlertText] = useState('');
  const { output, isStreaming, error, send, reset } = useStreaming();

  const handleAnalyze = () => {
    if (!alertText.trim()) return;
    send('ANALYZE_ALERT', alertText.trim());
  };

  const severity = output ? extractSeverity(output) : null;

  const slackOutput = output
    ? `*K8s Alert Analysis*\n${output.split('\n').slice(0, 15).join('\n')}`
    : '';

  return (
    <div className="space-y-4">
      {/* Quick templates */}
      <div>
        <label className="block text-xs font-medium text-k8s-muted mb-2">
          Quick templates
        </label>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_ALERTS.map((sample) => (
            <button
              key={sample.label}
              onClick={() => setAlertText(sample.value)}
              className="btn-secondary text-[11px] px-2.5 py-1"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div>
        <label className="block text-xs font-medium text-k8s-muted mb-1.5">
          Alert data (JSON or text)
        </label>
        <textarea
          className="textarea-field h-40"
          placeholder="Paste your Kubernetes alert here..."
          value={alertText}
          onChange={(e) => setAlertText(e.target.value)}
          disabled={isStreaming}
        />
      </div>

      <div className="flex gap-2">
        <button
          className="btn-primary flex-1"
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
          <button className="btn-secondary" onClick={reset}>
            Clear
          </button>
        )}
      </div>

      {/* Severity */}
      {severity && (
        <div className="flex items-center gap-2">
          <SeverityBadge severity={severity} size="lg" />
        </div>
      )}

      {/* Streaming output */}
      <StreamingOutput content={output} isStreaming={isStreaming} error={error} />

      {/* Actions */}
      {output && !isStreaming && (
        <div className="flex flex-wrap gap-2">
          <FavoriteButton
            type="analysis"
            title={`Alert Analysis — ${new Date().toLocaleDateString()}`}
            content={output}
            input={alertText}
          />
          <CopyButton text={output} label="Copy Analysis" />
          <CopyButton text={slackOutput} label="Copy for Slack" />
          <CopyButton
            text={extractCommands(output)}
            label="Copy Commands"
          />
        </div>
      )}
    </div>
  );
}

function extractCommands(text: string): string {
  const matches = text.match(/```(?:bash|sh)?\n([\s\S]*?)```/g);
  if (!matches) return '';
  return matches.map((m) => m.replace(/```(?:bash|sh)?\n?/g, '').trim()).join('\n\n');
}
