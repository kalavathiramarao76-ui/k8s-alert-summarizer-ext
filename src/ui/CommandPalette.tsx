import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Command {
  id: string;
  label: string;
  icon: string;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  onNavigate: (tab: string) => void;
  onToggleTheme: () => void;
  onTogglePerfMonitor?: () => void;
}

const RECENT_KEY = 'k8s_recent_commands';
const MAX_RECENT = 5;

async function getRecentCommands(): Promise<string[]> {
  const result = await chrome.storage.local.get(RECENT_KEY);
  return (result[RECENT_KEY] as string[]) || [];
}

async function pushRecentCommand(id: string): Promise<void> {
  const recent = await getRecentCommands();
  const updated = [id, ...recent.filter((r) => r !== id)].slice(0, MAX_RECENT);
  await chrome.storage.local.set({ [RECENT_KEY]: updated });
}

function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) return true;
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

function fuzzyScore(query: string, text: string): number {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t === q) return 100;
  if (t.startsWith(q)) return 90;
  if (t.includes(q)) return 70;
  // Fuzzy character match score
  let score = 0;
  let qi = 0;
  let lastMatchIdx = -1;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      score += 10;
      if (lastMatchIdx >= 0 && ti - lastMatchIdx === 1) score += 5; // consecutive bonus
      lastMatchIdx = ti;
      qi++;
    }
  }
  return qi === q.length ? score : 0;
}

export function CommandPalette({ onNavigate, onToggleTheme, onTogglePerfMonitor }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands: Command[] = [
    {
      id: 'analyze-alert',
      label: 'Analyze Alert',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      action: () => { onNavigate('analyzer'); close(); },
    },
    {
      id: 'generate-runbook',
      label: 'Generate Runbook',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      action: () => { onNavigate('runbook'); close(); },
    },
    {
      id: 'correlate-alerts',
      label: 'Correlate Alerts',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      action: () => { onNavigate('correlator'); close(); },
    },
    {
      id: 'classify-severity',
      label: 'Classify Severity',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      action: () => { onNavigate('severity'); close(); },
    },
    {
      id: 'view-favorites',
      label: 'View Favorites',
      icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
      action: () => { onNavigate('favorites'); close(); },
    },
    {
      id: 'toggle-theme',
      label: 'Toggle Theme',
      icon: 'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z',
      shortcut: 'T',
      action: () => { onToggleTheme(); close(); },
    },
    {
      id: 'performance-monitor',
      label: 'Performance Monitor',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      action: () => { onTogglePerfMonitor?.(); close(); },
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      action: () => { onNavigate('settings'); close(); },
    },
  ];

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
  }, []);

  const filteredCommands = query.trim()
    ? commands
        .filter((cmd) => fuzzyMatch(query, cmd.label))
        .sort((a, b) => fuzzyScore(query, b.label) - fuzzyScore(query, a.label))
    : (() => {
        // Show recent commands first, then the rest
        const recent = recentIds
          .map((id) => commands.find((c) => c.id === id))
          .filter(Boolean) as Command[];
        const rest = commands.filter((c) => !recentIds.includes(c.id));
        return [...recent, ...rest];
      })();

  const executeCommand = useCallback((cmd: Command) => {
    pushRecentCommand(cmd.id);
    cmd.action();
  }, []);

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        setIsOpen((prev) => {
          if (!prev) {
            getRecentCommands().then(setRecentIds);
          }
          return !prev;
        });
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        close();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      getRecentCommands().then(setRecentIds);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation within palette
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        executeCommand(filteredCommands[selectedIndex]);
      }
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.children[selectedIndex] as HTMLElement;
      if (selected) {
        selected.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="command-palette-overlay" onClick={close}>
      <div
        className="command-palette"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="command-palette-input-wrapper">
          <svg className="w-5 h-5 text-k8s-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="command-palette-input"
            placeholder="Type a command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
          />
          <kbd className="command-palette-kbd">ESC</kbd>
        </div>

        {/* Command list */}
        <div ref={listRef} className="command-palette-list">
          {query.trim() === '' && recentIds.length > 0 && (
            <div className="command-palette-section-label">Recent</div>
          )}
          {filteredCommands.map((cmd, index) => {
            const isRecent = !query.trim() && recentIds.includes(cmd.id);
            const isFirstNonRecent = !query.trim() && !isRecent && index > 0 &&
              recentIds.includes(filteredCommands[index - 1]?.id);

            return (
              <React.Fragment key={cmd.id}>
                {isFirstNonRecent && (
                  <div className="command-palette-section-label">All Commands</div>
                )}
                <button
                  className={`command-palette-item ${
                    index === selectedIndex ? 'command-palette-item-active' : ''
                  }`}
                  onClick={() => executeCommand(cmd)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-k8s-accent/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-k8s-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={cmd.icon} />
                      </svg>
                    </div>
                    <span className="text-sm text-k8s-text truncate">{cmd.label}</span>
                    {isRecent && (
                      <span className="text-[10px] text-k8s-muted bg-k8s-bg px-1.5 py-0.5 rounded">recent</span>
                    )}
                  </div>
                  {cmd.shortcut && (
                    <kbd className="command-palette-kbd text-[10px]">{cmd.shortcut}</kbd>
                  )}
                  {index === selectedIndex && (
                    <svg className="w-4 h-4 text-k8s-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              </React.Fragment>
            );
          })}
          {filteredCommands.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-k8s-muted">
              No commands match "{query}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="command-palette-footer">
          <div className="flex items-center gap-3 text-[11px] text-k8s-muted">
            <span className="flex items-center gap-1">
              <kbd className="command-palette-kbd-sm">↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="command-palette-kbd-sm">↵</kbd> select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="command-palette-kbd-sm">esc</kbd> close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
