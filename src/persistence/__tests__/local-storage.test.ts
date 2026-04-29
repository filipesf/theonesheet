import { describe, expect, it, beforeEach } from 'vitest';
import { loadCharacters, saveCharacters, STORAGE_KEY } from '../local-storage';

describe('local storage persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and loads character records', () => {
    saveCharacters({
      activeCharacterId: 'hero-1',
      characters: [{ id: 'hero-1', name: 'Belba', character: {} as never }],
    });

    const result = loadCharacters();
    expect(result.activeCharacterId).toBe('hero-1');
    expect(result.characters).toHaveLength(1);
    expect(result.characters[0]?.name).toBe('Belba');
  });

  it('falls back safely on invalid payload', () => {
    localStorage.setItem(STORAGE_KEY, '{broken');

    const result = loadCharacters();
    expect(result.activeCharacterId).toBeNull();
    expect(result.characters).toEqual([]);
  });

  it('falls back safely on incompatible shape', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ activeCharacterId: 'a', characters: null }));

    const result = loadCharacters();
    expect(result.activeCharacterId).toBeNull();
    expect(result.characters).toEqual([]);
  });
});
