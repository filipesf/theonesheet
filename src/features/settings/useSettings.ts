import { useCallback, useEffect, useState } from 'react';
import { applyTheme, type ThemeName } from '../../app/theme/applyTheme';

const SETTINGS_KEY = 'tos:settings:v0';

export type Settings = {
  theme: ThemeName;
  language: 'pt-BR';
};

const DEFAULTS: Settings = { theme: 'parchment', language: 'pt-BR' };

function readSettings(): Settings {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      theme: parsed.theme === 'tor-dark' ? 'tor-dark' : 'parchment',
      language: 'pt-BR',
    };
  } catch {
    return DEFAULTS;
  }
}

function writeSettings(value: Settings): void {
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(value));
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => readSettings());

  useEffect(() => {
    writeSettings(settings);
    applyTheme(settings.theme);
  }, [settings]);

  const setTheme = useCallback((theme: ThemeName) => {
    setSettings((current) => ({ ...current, theme }));
  }, []);

  return { settings, setTheme };
}
