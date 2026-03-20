import React from 'react';
import type { Severity } from '../shared/types';

const severityConfig: Record<Severity, { label: string; class: string; icon: string }> = {
  P0: { label: 'P0 — Critical', class: 'badge-p0', icon: '!!!' },
  P1: { label: 'P1 — High', class: 'badge-p1', icon: '!!' },
  P2: { label: 'P2 — Medium', class: 'badge-p2', icon: '!' },
  P3: { label: 'P3 — Low', class: 'badge-p3', icon: 'i' },
  P4: { label: 'P4 — Info', class: 'badge-p4', icon: '~' },
};

export function SeverityBadge({ severity, size = 'sm' }: { severity: Severity; size?: 'sm' | 'lg' }) {
  const cfg = severityConfig[severity];
  const sizeClass = size === 'lg' ? 'px-4 py-1.5 text-sm' : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`badge ${cfg.class} ${sizeClass}`}>
      <span className="mr-1 font-bold">{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

export function extractSeverity(text: string): Severity | null {
  const match = text.match(/\b(P[0-4])\b/);
  return match ? (match[1] as Severity) : null;
}
