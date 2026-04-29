import { useCallback, useEffect, useMemo, useState } from 'react';
import { normaliseCharacter } from '../../domain/normalise';
import { createEmptyCharacter } from '../../domain/schema';
import type { Character } from '../../domain/types';
import { serialiseCharacter } from '../../persistence/export';
import { importCharacterFromJson } from '../../persistence/import';
import { loadCharacters, saveCharacters, type CharacterRecord } from '../../persistence/local-storage';

type LibraryState = {
  activeCharacterId: string | null;
  characters: CharacterRecord[];
};

function nextName(baseName: string, existingNames: string[]): string {
  if (!existingNames.includes(baseName)) {
    return baseName;
  }
  let suffix = 2;
  while (existingNames.includes(`${baseName} ${suffix}`)) {
    suffix += 1;
  }
  return `${baseName} ${suffix}`;
}

export function useCharacterLibrary() {
  const [state, setState] = useState<LibraryState>(() => {
    const loaded = loadCharacters();
    return loaded;
  });

  useEffect(() => {
    saveCharacters(state);
  }, [state]);

  const activeCharacter = useMemo(() => {
    return state.characters.find((item) => item.id === state.activeCharacterId)?.character ?? null;
  }, [state.activeCharacterId, state.characters]);

  const createCharacter = useCallback(() => {
    setState((current) => {
      const existingNames = current.characters.map((item) => item.name);
      const character = normaliseCharacter(createEmptyCharacter());
      const name = nextName(character.name, existingNames);
      const record: CharacterRecord = { id: character.id, name, character: { ...character, name } };
      return {
        activeCharacterId: record.id,
        characters: [...current.characters, record],
      };
    });
  }, []);

  const duplicateCharacter = useCallback((id: string) => {
    setState((current) => {
      const source = current.characters.find((item) => item.id === id);
      if (!source) {
        return current;
      }
      const existingNames = current.characters.map((item) => item.name);
      const duplicate = normaliseCharacter({ ...source.character, id: crypto.randomUUID() });
      const name = nextName(`${source.name} Copy`, existingNames);
      const record: CharacterRecord = { id: duplicate.id, name, character: { ...duplicate, name } };
      return {
        activeCharacterId: record.id,
        characters: [...current.characters, record],
      };
    });
  }, []);

  const renameCharacter = useCallback((id: string, name: string) => {
    setState((current) => ({
      ...current,
      characters: current.characters.map((item) =>
        item.id === id ? { ...item, name, character: { ...item.character, name } } : item,
      ),
    }));
  }, []);

  const deleteCharacter = useCallback((id: string) => {
    setState((current) => {
      const remaining = current.characters.filter((item) => item.id !== id);
      const activeCharacterId =
        current.activeCharacterId === id ? (remaining[0]?.id ?? null) : current.activeCharacterId;
      return { activeCharacterId, characters: remaining };
    });
  }, []);

  const exportCharacter = useCallback((id: string): string | null => {
    const item = state.characters.find((record) => record.id === id);
    if (!item) {
      return null;
    }
    return serialiseCharacter(item.character);
  }, [state.characters]);

  const importCharacter = useCallback((content: string) => {
    const result = importCharacterFromJson(content);
    if (!result.ok) {
      return result;
    }

    setState((current) => {
      const existingNames = current.characters.map((item) => item.name);
      const imported = { ...result.character, id: crypto.randomUUID() };
      const name = nextName(imported.name || 'Imported Hero', existingNames);
      const record: CharacterRecord = {
        id: imported.id,
        name,
        character: { ...imported, name },
      };

      return {
        activeCharacterId: record.id,
        characters: [...current.characters, record],
      };
    });

    return { ok: true as const };
  }, []);

  const switchCharacter = useCallback((id: string) => {
    setState((current) => ({ ...current, activeCharacterId: id }));
  }, []);

  const updateCharacter = useCallback((character: Character) => {
    setState((current) => ({
      ...current,
      characters: current.characters.map((item) =>
        item.id === character.id
          ? { id: character.id, name: character.name, character: normaliseCharacter(character) }
          : item,
      ),
    }));
  }, []);

  return {
    activeCharacter,
    activeCharacterId: state.activeCharacterId,
    characters: state.characters,
    createCharacter,
    duplicateCharacter,
    renameCharacter,
    deleteCharacter,
    switchCharacter,
    updateCharacter,
    exportCharacter,
    importCharacter,
  };
}
