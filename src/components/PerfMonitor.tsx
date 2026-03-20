import React, { useState, useEffect } from 'react';
import type { PerfMetrics } from '../shared/types';

export function PerfMonitor() {
  const [metrics, setMetrics] = useState<PerfMetrics | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const poll = () => {
      chrome.runtime?.sendMessage({ type: 'GET_METRICS' }, (response) => {
        if (response?.data) setMetrics(response.data);
      });
    };
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!metrics) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary text-xs flex items-center gap-1.5 shadow-lg"
      >
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        Perf
      </button>

      {isOpen && (
        <div className="card absolute bottom-10 right-0 w-64 shadow-xl">
          <h4 className="text-xs font-semibold text-k8s-muted uppercase tracking-wider mb-3">
            Performance
          </h4>
          <div className="space-y-2.5">
            <MetricRow label="Requests" value={metrics.requestCount.toString()} />
            <MetricRow
              label="Avg Response"
              value={metrics.avgResponseTime > 0 ? `${(metrics.avgResponseTime / 1000).toFixed(1)}s` : '--'}
            />
            <MetricRow
              label="Last Response"
              value={metrics.lastResponseTime > 0 ? `${(metrics.lastResponseTime / 1000).toFixed(1)}s` : '--'}
            />
            <MetricRow
              label="Throughput"
              value={metrics.throughput > 0 ? `${metrics.throughput.toFixed(2)}/s` : '--'}
            />
            <MetricRow
              label="Uptime"
              value={formatUptime(Date.now() - metrics.startTime)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-k8s-muted">{label}</span>
      <span className="text-xs font-mono text-k8s-text">{value}</span>
    </div>
  );
}

function formatUptime(ms: number): string {
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m`;
  return `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m`;
}
