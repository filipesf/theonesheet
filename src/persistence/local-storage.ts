import type { Character } from '../domain/types';

export type CharacterRecord = {
  id: string;
  name: string;
  character: Character;
};

type StoredData = {
  activeCharacterId: string | null;
  characters: CharacterRecord[];
};

export const STORAGE_KEY = 'the-one-sheet:v0:characters';

export function loadCharacters(): StoredData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { activeCharacterId: null, characters: [] };
  }

  try {
    const parsed = JSON.parse(raw) as StoredData;
    if (!Array.isArray(parsed.characters)) {
      throw new Error('Invalid characters payload');
    }
    return {
      activeCharacterId: typeof parsed.activeCharacterId === 'string' ? parsed.activeCharacterId : null,
      characters: parsed.characters,
    };
  } catch {
    return { activeCharacterId: null, characters: [] };
  }
}

export function saveCharacters(data: StoredData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
