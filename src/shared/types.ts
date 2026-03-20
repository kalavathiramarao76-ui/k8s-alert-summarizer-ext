export type Severity = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';

export interface AlertData {
  id: string;
  raw: string;
  severity?: Severity;
  summary?: string;
  timestamp: number;
}

export interface AnalysisResult {
  summary: string;
  severity: Severity;
  rootCause: string;
  impact: string;
  remediation: string[];
  relatedAlerts?: string[];
}

export interface RunbookEntry {
  alertType: string;
  title: string;
  description: string;
  steps: string[];
  commands: string[];
}

export interface CorrelationResult {
  correlatedGroups: {
    title: string;
    alerts: string[];
    commonCause: string;
    severity: Severity;
  }[];
  timeline: string;
  recommendation: string;
}

export interface PerfMetrics {
  requestCount: number;
  avgResponseTime: number;
  lastResponseTime: number;
  throughput: number;
  startTime: number;
}

export interface MessagePayload {
  type: 'ANALYZE_ALERT' | 'GENERATE_RUNBOOK' | 'CORRELATE_ALERTS' | 'CLASSIFY_SEVERITY' | 'STREAM_CHUNK' | 'STREAM_DONE' | 'STREAM_ERROR' | 'GET_METRICS' | 'METRICS_RESULT';
  data?: unknown;
  requestId?: string;
}

export const K8S_ALERT_TYPES = [
  'KubePodCrashLooping',
  'KubePodNotReady',
  'KubeDeploymentReplicasMismatch',
  'KubeStatefulSetReplicasMismatch',
  'KubeNodeNotReady',
  'KubeNodeUnreachable',
  'KubePersistentVolumeFillingUp',
  'KubeHpaMaxedOut',
  'KubeQuotaExceeded',
  'KubeMemoryOvercommit',
  'KubeCPUOvercommit',
  'KubeJobFailed',
] as const;

export type K8sAlertType = (typeof K8S_ALERT_TYPES)[number];
