export type ThemeName = 'parchment' | 'tor-dark';

const SETTINGS_KEY = 'tos:settings:v0';

export function readStoredTheme(): ThemeName | null {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { theme?: unknown };
    if (parsed.theme === 'tor-dark' || parsed.theme === 'parchment') {
      return parsed.theme;
    }
    return null;
  } catch {
    return null;
  }
}

export function detectPreferredTheme(): ThemeName {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'parchment';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'tor-dark'
    : 'parchment';
}

export function applyTheme(theme: ThemeName): void {
  document.documentElement.dataset.theme = theme;
}

export function bootstrapTheme(): ThemeName {
  const stored = readStoredTheme();
  const next = stored ?? detectPreferredTheme();
  applyTheme(next);
  return next;
}
