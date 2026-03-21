import React, { useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'dark' | 'light' | 'system';

const STORAGE_KEY = 'k8s_theme_mode';

function getSystemTheme(): 'dark' | 'light' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function applyTheme(mode: ThemeMode) {
  const resolved = mode === 'system' ? getSystemTheme() : mode;
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }
  root.setAttribute('data-theme', resolved);
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    chrome.storage.local.get(STORAGE_KEY).then((result) => {
      const saved = (result[STORAGE_KEY] as ThemeMode) || 'dark';
      setMode(saved);
      applyTheme(saved);
    });

    // Listen for system theme changes
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      chrome.storage.local.get(STORAGE_KEY).then((result) => {
        const current = (result[STORAGE_KEY] as ThemeMode) || 'dark';
        if (current === 'system') applyTheme('system');
      });
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const cycleTheme = useCallback(() => {
    setMode((prev) => {
      const order: ThemeMode[] = ['dark', 'light', 'system'];
      const next = order[(order.indexOf(prev) + 1) % order.length];
      chrome.storage.local.set({ [STORAGE_KEY]: next });
      applyTheme(next);
      return next;
    });
  }, []);

  return { mode, cycleTheme };
}

// Sun icon for light mode
function SunIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

// Moon icon for dark mode
function MoonIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

// Monitor icon for system mode
function SystemIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

const LABELS: Record<ThemeMode, string> = {
  dark: 'Dark',
  light: 'Light',
  system: 'System',
};

export function ThemeToggle() {
  const { mode, cycleTheme } = useTheme();

  const Icon = mode === 'dark' ? MoonIcon : mode === 'light' ? SunIcon : SystemIcon;

  return (
    <button
      onClick={cycleTheme}
      className="theme-toggle-btn flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all duration-200"
      title={`Theme: ${LABELS[mode]} (click to cycle)`}
      aria-label={`Current theme: ${LABELS[mode]}. Click to switch.`}
    >
      <Icon />
      <span className="hidden sm:inline text-[10px] font-medium opacity-70">
        {LABELS[mode]}
      </span>
    </button>
  );
}
