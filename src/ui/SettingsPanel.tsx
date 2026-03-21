import React, { useState, useEffect, useCallback } from 'react';
import { useTheme, type ThemeMode } from './ThemeToggle';

const SETTINGS_KEY = 'k8s_settings';

export interface Settings {
  endpointUrl: string;
  model: string;
  themeMode: ThemeMode;
}

const DEFAULT_SETTINGS: Settings = {
  endpointUrl: 'https://sai.sharedllm.com/v1/chat/completions',
  model: 'gpt-oss:120b',
  themeMode: 'dark',
};

const AVAILABLE_MODELS = [
  'gpt-oss:120b',
  'gpt-oss:70b',
  'gpt-oss:8b',
  'llama-3.3:70b',
  'mistral:7b',
];

export async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.local.get(SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS, ...(result[SETTINGS_KEY] as Partial<Settings>) };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
}

export function SettingsPanel() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const { mode, cycleTheme } = useTheme();

  useEffect(() => {
    getSettings().then((s) => {
      setSettings({ ...s, themeMode: mode });
    });
  }, [mode]);

  const handleSave = useCallback(async () => {
    await saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [settings]);

  const handleClearData = useCallback(async () => {
    if (!clearConfirm) {
      setClearConfirm(true);
      setTimeout(() => setClearConfirm(false), 3000);
      return;
    }
    await chrome.storage.local.remove(['k8s_favorites', 'k8s_recent_commands']);
    setClearConfirm(false);
  }, [clearConfirm]);

  const updateField = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-5">
      {/* Endpoint URL */}
      <section className="card space-y-3">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-k8s-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.06a4.5 4.5 0 00-1.242-7.244l4.5-4.5a4.5 4.5 0 016.364 6.364l-1.757 1.757" />
          </svg>
          <h3 className="text-sm font-semibold text-k8s-text">API Endpoint</h3>
        </div>
        <input
          type="url"
          className="input-field text-xs font-mono"
          value={settings.endpointUrl}
          onChange={(e) => updateField('endpointUrl', e.target.value)}
          placeholder="https://api.example.com/v1/chat/completions"
        />
        <p className="text-[10px] text-k8s-muted">OpenAI-compatible chat completions endpoint</p>
      </section>

      {/* Model Selector */}
      <section className="card space-y-3">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-k8s-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
          <h3 className="text-sm font-semibold text-k8s-text">Model</h3>
        </div>
        <select
          className="input-field text-xs cursor-pointer"
          value={settings.model}
          onChange={(e) => updateField('model', e.target.value)}
        >
          {AVAILABLE_MODELS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <input
          type="text"
          className="input-field text-xs font-mono"
          value={settings.model}
          onChange={(e) => updateField('model', e.target.value)}
          placeholder="Custom model name"
        />
        <p className="text-[10px] text-k8s-muted">Select from list or enter a custom model identifier</p>
      </section>

      {/* Theme */}
      <section className="card space-y-3">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-k8s-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072" />
          </svg>
          <h3 className="text-sm font-semibold text-k8s-text">Theme</h3>
        </div>
        <div className="flex gap-2">
          {(['dark', 'light', 'system'] as ThemeMode[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                if (mode !== t) cycleTheme();
              }}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all duration-200 ${
                mode === t
                  ? 'bg-k8s-accent text-white'
                  : 'bg-k8s-bg border border-k8s-border text-k8s-muted hover:text-k8s-text hover:border-k8s-accent'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      {/* Actions */}
      <section className="card space-y-3">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-k8s-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.204-.107-.397.165-.71.505-.78.929l-.15.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="text-sm font-semibold text-k8s-text">Data Management</h3>
        </div>
        <button
          onClick={handleClearData}
          className={`w-full px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
            clearConfirm
              ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
              : 'bg-k8s-bg border border-k8s-border text-k8s-muted hover:text-k8s-text hover:border-red-500/50'
          }`}
        >
          {clearConfirm ? 'Click again to confirm' : 'Clear favorites & recent commands'}
        </button>
      </section>

      {/* Save */}
      <button
        onClick={handleSave}
        className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
          saved
            ? 'bg-green-500/20 text-green-400 border border-green-500/40'
            : 'btn-primary'
        }`}
      >
        {saved ? 'Settings Saved' : 'Save Settings'}
      </button>

      {/* About */}
      <section className="card space-y-2">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-k8s-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <h3 className="text-sm font-semibold text-k8s-text">About</h3>
        </div>
        <div className="space-y-1 text-xs text-k8s-muted">
          <p><span className="text-k8s-text font-medium">AlertLens AI</span> v1.0.0</p>
          <p>AI-powered Kubernetes alert analysis, runbook generation, and incident correlation.</p>
          <p className="text-[10px] pt-1 opacity-70">Built for SRE/DevOps teams. Uses OpenAI-compatible APIs for LLM inference.</p>
        </div>
      </section>
    </div>
  );
}
