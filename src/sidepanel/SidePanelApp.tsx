import React, { useState, useEffect, useCallback } from 'react';
import { AlertAnalyzer } from './tabs/AlertAnalyzer';
import { RunbookGenerator } from './tabs/RunbookGenerator';
import { AlertCorrelator } from './tabs/AlertCorrelator';
import { SeverityClassifier } from './tabs/SeverityClassifier';
import { PerfMonitor } from '../components/PerfMonitor';
import { ThemeToggle, useTheme } from '../ui/ThemeToggle';
import { CommandPalette } from '../ui/CommandPalette';
import { getFavoritesCount } from '../shared/favorites';
import { SettingsPanel } from '../ui/SettingsPanel';
import { ErrorBoundary } from '../ui/ErrorBoundary';

type Tab = 'analyzer' | 'runbook' | 'correlator' | 'severity' | 'settings';

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'analyzer', label: 'Analyzer', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { id: 'runbook', label: 'Runbooks', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { id: 'correlator', label: 'Correlator', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { id: 'severity', label: 'Severity', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  { id: 'settings', label: 'Settings', icon: 'M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.204-.107-.397.165-.71.505-.78.929l-.15.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894zM15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

export function SidePanelApp() {
  const [activeTab, setActiveTab] = useState<Tab>('analyzer');
  const [favCount, setFavCount] = useState(0);
  const [showPerfMonitor, setShowPerfMonitor] = useState(true);
  const { cycleTheme } = useTheme();

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

  const handleCommandNavigate = useCallback((target: string) => {
    if (['analyzer', 'runbook', 'correlator', 'severity', 'settings'].includes(target)) {
      setActiveTab(target as Tab);
    }
  }, []);

  const handleTogglePerfMonitor = useCallback(() => {
    setShowPerfMonitor((prev) => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-k8s-bg flex flex-col">
      {/* Command Palette */}
      <CommandPalette
        onNavigate={handleCommandNavigate}
        onToggleTheme={cycleTheme}
        onTogglePerfMonitor={handleTogglePerfMonitor}
      />

      {/* Header */}
      <header className="bg-k8s-surface border-b border-k8s-border px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-k8s-accent rounded-lg flex items-center justify-center shadow-lg shadow-k8s-accent/20">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="flex-1">
            <h1 className="text-base font-bold text-k8s-text">AlertLens AI</h1>
            <p className="text-[11px] text-k8s-muted">
              AI-powered Kubernetes alert workspace
              <span className="hidden sm:inline"> &middot; </span>
              <kbd className="hidden sm:inline-flex command-palette-kbd text-[9px] ml-1 cursor-pointer"
                   onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'K', shiftKey: true, ctrlKey: true, bubbles: true }))}>
                Ctrl+Shift+K
              </kbd>
            </p>
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
        <ErrorBoundary>
          {activeTab === 'analyzer' && <AlertAnalyzer />}
          {activeTab === 'runbook' && <RunbookGenerator />}
          {activeTab === 'correlator' && <AlertCorrelator />}
          {activeTab === 'severity' && <SeverityClassifier />}
          {activeTab === 'settings' && <SettingsPanel />}
        </ErrorBoundary>
      </main>

      {showPerfMonitor && <PerfMonitor />}
    </div>
  );
}
