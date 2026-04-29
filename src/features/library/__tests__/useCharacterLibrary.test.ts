import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useCharacterLibrary } from '../useCharacterLibrary';

describe('useCharacterLibrary', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('supports create, update, duplicate, switch and delete', () => {
    const { result } = renderHook(() => useCharacterLibrary());

    act(() => {
      result.current.createCharacter();
    });
    expect(result.current.characters).toHaveLength(1);
    const firstId = result.current.characters[0]!.id;

    act(() => {
      result.current.updateCharacter({ ...result.current.characters[0]!.character, name: 'Frodo' });
    });
    expect(result.current.characters[0]!.name).toBe('Frodo');

    act(() => {
      result.current.duplicateCharacter(firstId);
    });
    expect(result.current.characters).toHaveLength(2);

    const secondId = result.current.characters[1]!.id;
    act(() => {
      result.current.switchCharacter(firstId);
    });
    expect(result.current.activeCharacterId).toBe(firstId);

    act(() => {
      result.current.deleteCharacter(firstId);
    });
    expect(result.current.characters).toHaveLength(1);
    expect(result.current.characters[0]!.id).toBe(secondId);
  });
});
