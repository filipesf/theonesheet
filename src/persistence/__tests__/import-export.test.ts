import { describe, expect, it } from 'vitest';
import { createBelbaWorkedExample } from '../../domain/schema';
import { serialiseCharacter } from '../export';
import { importCharacterFromJson } from '../import';

describe('import/export', () => {
  it('round-trips a character with v0 envelope', () => {
    const belba = createBelbaWorkedExample();
    const json = serialiseCharacter(belba);

    const imported = importCharacterFromJson(json);
    expect(imported.ok).toBe(true);
    if (imported.ok) {
      expect(imported.character.name).toBe('Belba Bolger');
      expect(imported.character.max_endurance).toBe(24);
      expect(imported.character.load).toBe(7);
    }
  });

  it('rejects malformed json', () => {
    const result = importCharacterFromJson('{invalid-json');
    expect(result.ok).toBe(false);
  });

  it('rejects incompatible schema payload', () => {
    const result = importCharacterFromJson(
      JSON.stringify({ schemaVersion: 'v99', app: 'the-one-sheet', character: {} }),
    );
    expect(result.ok).toBe(false);
  });
});
