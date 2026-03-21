import React, { useState, useEffect } from 'react';
import { AlertAnalyzer } from './tabs/AlertAnalyzer';
import { RunbookGenerator } from './tabs/RunbookGenerator';
import { AlertCorrelator } from './tabs/AlertCorrelator';
import { SeverityClassifier } from './tabs/SeverityClassifier';
import { PerfMonitor } from '../components/PerfMonitor';
import { ThemeToggle } from '../ui/ThemeToggle';
import { getFavoritesCount } from '../shared/favorites';

type Tab = 'analyzer' | 'runbook' | 'correlator' | 'severity';

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'analyzer', label: 'Analyzer', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { id: 'runbook', label: 'Runbooks', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { id: 'correlator', label: 'Correlator', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { id: 'severity', label: 'Severity', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
];

export function SidePanelApp() {
  const [activeTab, setActiveTab] = useState<Tab>('analyzer');
  const [favCount, setFavCount] = useState(0);

  const refreshFavCount = () => {
    getFavoritesCount().then(setFavCount);
  };

  useEffect(() => {
    refreshFavCount();
    // Listen for storage changes to update count
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes['k8s_favorites']) {
        const newVal = changes['k8s_favorites'].newValue;
        setFavCount(Array.isArray(newVal) ? newVal.length : 0);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  return (
    <div className="min-h-screen bg-k8s-bg flex flex-col">
      {/* Header */}
      <header className="bg-k8s-surface border-b border-k8s-border px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-k8s-accent rounded-lg flex items-center justify-center shadow-lg shadow-k8s-accent/20">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="flex-1">
            <h1 className="text-base font-bold text-k8s-text">K8s Alert Summarizer</h1>
            <p className="text-[11px] text-k8s-muted">AI-powered Kubernetes alert workspace</p>
          </div>
          <div className="flex items-center gap-2">
            {favCount > 0 && (
              <span className="favorites-count" title={`${favCount} saved favorite${favCount !== 1 ? 's' : ''}`}>
                {favCount}
              </span>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-k8s-surface border-b border-k8s-border px-2 flex-shrink-0">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-k8s-accent text-k8s-accent'
                  : 'border-transparent text-k8s-muted hover:text-k8s-text'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4">
        {activeTab === 'analyzer' && <AlertAnalyzer />}
        {activeTab === 'runbook' && <RunbookGenerator />}
        {activeTab === 'correlator' && <AlertCorrelator />}
        {activeTab === 'severity' && <SeverityClassifier />}
      </main>

      <PerfMonitor />
    </div>
  );
}
