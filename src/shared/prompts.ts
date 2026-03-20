import { K8sAlertType } from './types';

export const SYSTEM_PROMPT = `You are an expert Kubernetes SRE and DevOps engineer. You analyze Kubernetes alerts with deep knowledge of:
- Kubernetes architecture (pods, nodes, deployments, statefulsets, daemonsets)
- Container runtimes, networking (CNI, services, ingress)
- Storage (PV/PVC, CSI drivers)
- Resource management (requests, limits, HPA, VPA, quotas)
- Observability (Prometheus, Grafana, alertmanager)
- Common failure patterns and their root causes

Provide concise, actionable analysis. Use technical terminology appropriate for SRE teams.`;

export function analyzeAlertPrompt(alert: string): string {
  return `Analyze this Kubernetes alert and provide a structured response:

**Alert:**
\`\`\`
${alert}
\`\`\`

Respond in this exact format:

## Severity
[P0|P1|P2|P3|P4] - [one-line justification]

## Summary
[2-3 sentence summary of what's happening]

## Root Cause
[Most likely root cause based on the alert data]

## Impact
[What services/users are affected and how]

## Remediation Steps
1. [Immediate action]
2. [Investigation step]
3. [Fix step]
4. [Verification step]

## kubectl Commands
\`\`\`bash
[relevant kubectl commands to investigate/fix]
\`\`\``;
}

export function generateRunbookPrompt(alertType: K8sAlertType): string {
  return `Generate a detailed operational runbook for the Kubernetes alert: **${alertType}**

Include:

## Overview
[What this alert means and when it fires]

## Severity Assessment
[Typical severity and business impact]

## Diagnostic Steps
1. [Step with kubectl command]
2. [Step with kubectl command]
...

## Resolution Steps
1. [Resolution with commands]
2. [Resolution with commands]
...

## Escalation Criteria
[When to escalate and to whom]

## Prevention
[How to prevent this alert from firing]

## Related Alerts
[Other alerts that commonly fire alongside this one]`;
}

export function correlateAlertsPrompt(alerts: string[]): string {
  return `Analyze these ${alerts.length} Kubernetes alerts and identify correlations:

${alerts.map((a, i) => `**Alert ${i + 1}:**\n\`\`\`\n${a}\n\`\`\``).join('\n\n')}

Respond in this format:

## Correlated Groups
[Group related alerts and explain why they're related]

## Timeline Analysis
[Likely sequence of events that caused these alerts]

## Root Cause
[Single root cause that explains the alert pattern]

## Severity
[Overall incident severity: P0-P4]

## Recommended Actions
1. [Action with priority]
2. [Action with priority]
...

## Slack Summary
[A concise summary suitable for posting in a Slack incident channel]`;
}

export function classifySeverityPrompt(alert: string): string {
  return `Classify the severity of this Kubernetes alert on the P0-P4 scale:

\`\`\`
${alert}
\`\`\`

Respond ONLY in this JSON format:
{
  "severity": "P0|P1|P2|P3|P4",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation",
  "impact": "user/business impact",
  "urgency": "immediate|high|medium|low"
}

Severity scale:
- P0: Complete service outage, data loss risk, all users affected
- P1: Major functionality broken, significant user impact
- P2: Degraded performance, partial functionality loss
- P3: Minor issue, workaround available, limited impact
- P4: Informational, no immediate impact, optimization opportunity`;
}

export function slackSummaryPrompt(analysis: string): string {
  return `Convert this alert analysis into a concise Slack-ready incident update. Use Slack markdown formatting (bold with *, code with \`, bullet points with -).

Analysis:
${analysis}

Format:
*:rotating_light: K8s Incident Summary*
*Severity:* [P-level]
*Impact:* [one line]
*Root Cause:* [one line]
*Status:* Investigating
*Actions:*
- [action 1]
- [action 2]
*ETA:* [estimate]`;
}
