import { describe, expect, it } from 'vitest';
import { HEROIC_CULTURES } from '../../domain/types';
import { BLESSING_BY_CULTURE, BLESSINGS, legacyNameToBlessingId } from '../blessings';

describe('BLESSINGS ref-data', () => {
  it('every blessing id is unique', () => {
    const ids = BLESSINGS.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('BLESSING_BY_CULTURE has a row for every HeroicCulture', () => {
    for (const culture of HEROIC_CULTURES) {
      expect(BLESSING_BY_CULTURE[culture]).toBeDefined();
    }
  });

  it('legacy English names round-trip to canonical kebab ids', () => {
    expect(legacyNameToBlessingId('Redoubtable')).toBe('redoubtable');
    expect(legacyNameToBlessingId('Hobbit-Sense')).toBe('hobbit-sense');
    expect(legacyNameToBlessingId('Kings of Men')).toBe('kings-of-men');
    expect(legacyNameToBlessingId('Unknown')).toBeNull();
  });

  it('only redoubtable carries the load-halve effect', () => {
    const halvers = BLESSINGS.filter((b) => b.effect === 'load-halve-armour-helm');
    expect(halvers).toHaveLength(1);
    expect(halvers[0]?.id).toBe('redoubtable');
  });
});
