import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applyTheme,
  bootstrapTheme,
  detectPreferredTheme,
  readStoredTheme,
} from '../applyTheme';

const SETTINGS_KEY = 'tos:settings:v0';

describe('applyTheme module', () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.theme;
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reads a valid stored theme', () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ theme: 'tor-dark' }));
    expect(readStoredTheme()).toBe('tor-dark');
  });

  it('returns null when nothing is stored', () => {
    expect(readStoredTheme()).toBeNull();
  });

  it('returns null when stored value is invalid', () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ theme: 'whatever' }));
    expect(readStoredTheme()).toBeNull();
  });

  it('returns null when stored JSON is malformed', () => {
    localStorage.setItem(SETTINGS_KEY, '{not json');
    expect(readStoredTheme()).toBeNull();
  });

  it('detects preferred theme via matchMedia', () => {
    const spy = vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    expect(detectPreferredTheme()).toBe('tor-dark');
    spy.mockRestore();

    const spyLight = vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    expect(detectPreferredTheme()).toBe('parchment');
    spyLight.mockRestore();
  });

  it('writes the dataset attribute on applyTheme', () => {
    applyTheme('tor-dark');
    expect(document.documentElement.dataset.theme).toBe('tor-dark');
    applyTheme('parchment');
    expect(document.documentElement.dataset.theme).toBe('parchment');
  });

  it('bootstrapTheme prefers stored value over media query', () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ theme: 'parchment' }));
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    expect(bootstrapTheme()).toBe('parchment');
    expect(document.documentElement.dataset.theme).toBe('parchment');
  });

  it('bootstrapTheme falls back to media query when nothing stored', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    expect(bootstrapTheme()).toBe('tor-dark');
    expect(document.documentElement.dataset.theme).toBe('tor-dark');
  });
});
