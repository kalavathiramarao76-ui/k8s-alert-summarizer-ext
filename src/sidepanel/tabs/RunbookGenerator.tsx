import React, { useState } from 'react';
import { useStreaming } from '../../shared/useStreaming';
import { StreamingOutput } from '../../components/StreamingOutput';
import { CopyButton } from '../../components/CopyButton';
import { K8S_ALERT_TYPES, type K8sAlertType } from '../../shared/types';

const ALERT_TYPE_INFO: Record<K8sAlertType, { desc: string; icon: string }> = {
  KubePodCrashLooping: { desc: 'Pod restarting repeatedly', icon: 'rotate-cw' },
  KubePodNotReady: { desc: 'Pod not passing readiness', icon: 'alert-circle' },
  KubeDeploymentReplicasMismatch: { desc: 'Desired != actual replicas', icon: 'layers' },
  KubeStatefulSetReplicasMismatch: { desc: 'StatefulSet replica drift', icon: 'database' },
  KubeNodeNotReady: { desc: 'Node failing health checks', icon: 'server' },
  KubeNodeUnreachable: { desc: 'Node lost connectivity', icon: 'wifi-off' },
  KubePersistentVolumeFillingUp: { desc: 'PV running out of space', icon: 'hard-drive' },
  KubeHpaMaxedOut: { desc: 'HPA at maximum replicas', icon: 'trending-up' },
  KubeQuotaExceeded: { desc: 'Resource quota exceeded', icon: 'shield-off' },
  KubeMemoryOvercommit: { desc: 'Memory overcommitted', icon: 'cpu' },
  KubeCPUOvercommit: { desc: 'CPU overcommitted', icon: 'activity' },
  KubeJobFailed: { desc: 'Job execution failed', icon: 'x-circle' },
};

export function RunbookGenerator() {
  const [selectedType, setSelectedType] = useState<K8sAlertType | null>(null);
  const { output, isStreaming, error, send, reset } = useStreaming();

  const handleGenerate = (alertType: K8sAlertType) => {
    setSelectedType(alertType);
    send('GENERATE_RUNBOOK', alertType);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-k8s-text mb-1">Runbook Generator</h2>
        <p className="text-xs text-k8s-muted">
          Generate operational runbooks for common Kubernetes alerts
        </p>
      </div>

      {/* Alert type grid */}
      <div className="grid grid-cols-2 gap-2">
        {K8S_ALERT_TYPES.map((type) => {
          const info = ALERT_TYPE_INFO[type];
          const isActive = selectedType === type;
          return (
            <button
              key={type}
              onClick={() => handleGenerate(type)}
              disabled={isStreaming}
              className={`card text-left p-3 transition-all hover:border-k8s-accent cursor-pointer ${
                isActive ? 'border-k8s-accent bg-k8s-accent/10' : ''
              } disabled:opacity-50`}
            >
              <div className="text-xs font-semibold text-k8s-text truncate">{type}</div>
              <div className="text-[10px] text-k8s-muted mt-0.5">{info.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Output */}
      {(output || isStreaming) && (
        <div className="space-y-3">
          {selectedType && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-k8s-muted">Runbook for:</span>
              <span className="badge bg-k8s-accent/20 text-k8s-accent border border-k8s-accent/50 text-xs">
                {selectedType}
              </span>
            </div>
          )}
          <StreamingOutput content={output} isStreaming={isStreaming} error={error} />
          {output && !isStreaming && (
            <div className="flex gap-2">
              <CopyButton text={output} label="Copy Runbook" />
              <button className="btn-secondary text-xs" onClick={reset}>
                Clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
