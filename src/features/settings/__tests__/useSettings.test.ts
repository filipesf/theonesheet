import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useSettings } from '../useSettings';

const KEY = 'tos:settings:v0';

describe('useSettings', () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it('starts with parchment when nothing is stored', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings.theme).toBe('parchment');
  });

  it('persists changes via localStorage', () => {
    const { result } = renderHook(() => useSettings());
    act(() => {
      result.current.setTheme('tor-dark');
    });
    const stored = JSON.parse(localStorage.getItem(KEY)!);
    expect(stored.theme).toBe('tor-dark');
    expect(document.documentElement.dataset.theme).toBe('tor-dark');
  });

  it('falls back to parchment when stored value is invalid', () => {
    localStorage.setItem(KEY, JSON.stringify({ theme: 'mystery' }));
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings.theme).toBe('parchment');
  });

  it('falls back to defaults when stored JSON is malformed', () => {
    localStorage.setItem(KEY, '{not json');
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings).toEqual({ theme: 'parchment', language: 'pt-BR' });
  });
});
